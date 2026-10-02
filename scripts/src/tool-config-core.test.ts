/**
 * The tool-config script's engine, run for real: argument refusals, blocks,
 * rows and answers, the lock record and `check`.
 *
 * The suite registers a test-only tool, `demo`, through
 * TOOL_CONFIG_TOOLS_MODULE, so it exercises the engine without any shipped
 * tool module. It lives here because `vitest.config.mts` collects only
 * `{installer,scripts}/src/**\/*.test.ts` — beside the script it would never run.
 */
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  appendFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
} from "vitest";

const pluginRoot = join(import.meta.dirname, "..", "..", "plugins", "stackgen");
const script = join(
  pluginRoot,
  "skills",
  "tool-config",
  "scripts",
  "tool-config.mjs",
);
const version = (JSON.parse(
  readFileSync(join(pluginRoot, ".claude-plugin", "plugin.json"), "utf8"),
) as { version: string; })
  .version;

/** The test-only tool: a base block, a pack block, a list entry, a typed value, a mise-needing verb. */
const DEMO = `
export const tools = {
  demo: {
    verbs: {
      add: { flags: { line: { required: true } }, requester: "required" },
      entry: { flags: { line: { required: true } }, requester: "required" },
      "set-env": {
        flags: { key: { type: "envKey", required: true }, value: { type: "value", required: true, template: "own" } },
        requester: "optional",
      },
      resolve: { flags: {}, needsMise: true },
      drop: { flags: { path: { required: true } } },
      takeover: { flags: { path: { required: true } } },
    },
    all() {
      return {
        ops: [
          { op: "block", path: "demo.toml", requester: "demo", body: ["alpha = 1", "beta = 2"], frame: ["# demo config", ""], drift: true },
          { op: "whole", path: "tasks/run", content: "#!/usr/bin/env bash\\necho run\\n", mode: "755", drift: true },
        ],
      };
    },
    plan(ctx, call) {
      if (call.verb === "add") {
        return { ops: [{ op: "block", path: "demo.toml", requester: call.for, body: [call.flags.line], frame: ["# demo config", ""] }] };
      }
      if (call.verb === "entry") {
        return {
          ops: [{
            op: "entry", path: "list.toml", requester: call.for, line: '  "' + call.flags.line + '",',
            region: { kind: "array", key: "exclude" }, frame: ["exclude = [", "]"], sort: true, list: { separator: "," },
          }],
        };
      }
      if (call.verb === "set-env") {
        return {
          ops: [{
            op: "block", path: "env.toml", requester: call.for ?? "user", region: { kind: "table", name: "env" },
            body: [call.flags.key + " = " + ctx.tomlString(call.flags.value)],
          }],
        };
      }
      if (call.verb === "drop") return { ops: [{ op: "delete", path: call.flags.path }] };
      if (call.verb === "takeover") {
        return { ops: [{ op: "delete", path: call.flags.path, supersedes: ctx.source(call.flags.path) }] };
      }
      return { ops: [] };
    },
    expected(ctx, { path }) {
      if (path === "demo.toml") return { blocks: { demo: ["alpha = 1", "beta = 2"] } };
      if (path === "tasks/run") return { whole: "#!/usr/bin/env bash\\necho run\\n" };
      return null;
    },
  },
};
`;

let repo: string;
let toolsModule: string;

beforeEach(() => {
  const root = mkdtempSync(join(tmpdir(), "tool-config-core-"));
  repo = join(root, "repo");
  mkdirSync(repo);
  spawnSync("git", ["init", "-q"], { cwd: repo });
  toolsModule = join(root, "demo-tools.mjs");
  writeFileSync(toolsModule, DEMO);
});
afterEach(() => {
  rmSync(join(repo, ".."), { recursive: true, force: true });
});

interface Row {
  id: string;
  kind: string;
  answers: string[];
  [key: string]: unknown;
}
interface Out {
  error?: string;
  rows?: Row[];
  written?: string[];
  deleted?: string[];
  preview?: boolean;
  [key: string]: unknown;
}

function run(
  args: string[],
  env: Record<string, string> = {},
): { status: number | null; out: Out; } {
  const res = spawnSync(process.execPath, [
    script,
    ...args,
    "--repo-root",
    repo,
  ], {
    encoding: "utf8",
    env: {
      PATH: process.env["PATH"] ?? "",
      HOME: repo,
      TOOL_CONFIG_TOOLS_MODULE: toolsModule,
      ...env,
    },
  });
  let out: Out;
  try {
    out = JSON.parse(res.stdout) as Out;
  }
  catch {
    throw new Error(
      `not JSON (exit ${res.status}): ${res.stdout}\n${res.stderr}`,
    );
  }
  return { status: res.status, out };
}

/** Preview, answer every row with `pick` (default: its first answer), and run. */
function apply(
  args: string[],
  pick: (row: Row) => string = row => row.answers[0] ?? "ok",
) {
  const preview = run(["preview", ...args]);
  expect(preview.status).toBe(0);
  const rows = preview.out.rows ?? [];
  if (rows.length === 0) {
    return run(args);
  }
  return run([
    ...args,
    "--answers",
    rows.map(r => `${r.id}:${pick(r)}`).join(","),
  ]);
}

const read = (path: string) => readFileSync(join(repo, path), "utf8");
const lock = () => read(".claude/stackgen/lock.yaml");

describe("argument refusals", () => {
  it("refuses an unknown flag, naming the valid ones", () => {
    const { status, out } = run([
      "demo",
      "add",
      "--line",
      "x",
      "--bogus",
      "y",
      "--for",
      "a",
    ]);
    expect(status).toBe(2);
    expect(out.error).toContain("--bogus");
    expect(out.error).toContain("--line");
  });

  it("refuses an unknown verb, naming the verbs", () => {
    const { status, out } = run(["demo", "frobnicate"]);
    expect(status).toBe(2);
    expect(out.error).toMatch(
      /valid: add, entry, set-env, resolve, drop, takeover, remove, all/,
    );
  });

  it("refuses a bad env key", () => {
    const { status, out } = run([
      "demo",
      "set-env",
      "--key",
      "1BAD",
      "--value",
      "x",
    ]);
    expect(status).toBe(2);
    expect(out.error).toContain("not an env key");
  });

  it("refuses a template in a typed value, and takes one in a pack's own line", () => {
    const typed = run([
      "demo",
      "set-env",
      "--key",
      "K",
      "--value",
      "{{ config_root }}",
    ]);
    expect(typed.status).toBe(2);
    expect(typed.out.error).toContain("template");
    const own = run([
      "preview",
      "demo",
      "set-env",
      "--key",
      "K",
      "--value",
      "{{ config_root }}",
      "--for",
      "pack",
    ]);
    expect(own.status).toBe(0);
  });

  it("refuses a quoted value that is not a TOML basic string", () => {
    const { status } = run([
      "demo",
      "set-env",
      "--key",
      "K",
      "--value",
      "\"a\"b\"",
    ]);
    expect(status).toBe(2);
  });

  it("escapes a bare value and writes a quoted one verbatim", () => {
    apply([
      "demo",
      "set-env",
      "--key",
      "A",
      "--value",
      "a\"b\\c",
      "--for",
      "p",
    ]);
    apply([
      "demo",
      "set-env",
      "--key",
      "A",
      "--value",
      "\"x\\ty\"",
      "--for",
      "q",
    ]);
    expect(read("env.toml")).toContain("A = \"a\\\"b\\\\c\"");
    expect(read("env.toml")).toContain("A = \"x\\ty\"");
  });

  it("refuses --answers on a preview, and --for naming a tool", () => {
    expect(
      run([
        "preview",
        "demo",
        "add",
        "--line",
        "x",
        "--for",
        "a",
        "--answers",
        "r1:ok",
      ])
        .status,
    )
      .toBe(2);
    expect(run(["demo", "add", "--line", "x", "--for", "mise"]).out.error)
      .toContain("reserved");
  });

  it("refuses an all key it does not know", () => {
    const { status, out } = run(["all", "--colour", "blue"]);
    expect(status).toBe(2);
    expect(out.error).toContain("--merge-model-develop");
  });
});

describe("blocks", () => {
  it("inserts the base first and each requester after, one blank line apart", () => {
    apply(["all"]);
    apply(["demo", "add", "--line", "a = 1", "--for", "pack-a"]);
    apply(["demo", "add", "--line", "b = 2", "--for", "pack-b"]);
    expect(read("demo.toml")).toBe(
      [
        "# demo config",
        "",
        "# >>> demo",
        "alpha = 1",
        "beta = 2",
        "# <<< demo",
        "",
        "# >>> pack-a",
        "a = 1",
        "# <<< pack-a",
        "",
        "# >>> pack-b",
        "b = 2",
        "# <<< pack-b",
        "",
      ]
        .join("\n"),
    );
  });

  it("is idempotent: the same call again shows no row and writes nothing", () => {
    apply(["demo", "add", "--line", "a = 1", "--for", "pack-a"]);
    const again = run([
      "preview",
      "demo",
      "add",
      "--line",
      "a = 1",
      "--for",
      "pack-a",
    ]);
    expect(again.out.rows).toEqual([]);
    const write = run(["demo", "add", "--line", "a = 1", "--for", "pack-a"]);
    expect(write.status).toBe(0);
    expect(write.out.written).toEqual([]);
  });

  it("removes a requester's block and leaves the user's lines byte for byte", () => {
    apply(["all"]);
    apply(["demo", "add", "--line", "a = 1", "--for", "pack-a"]);
    appendFileSync(join(repo, "demo.toml"), "\n# mine\nuser = 1\n");
    const before = read("demo.toml");
    apply(["demo", "remove", "--for", "pack-a"]);
    expect(read("demo.toml")).toBe(
      before.replace("\n# >>> pack-a\na = 1\n# <<< pack-a\n", ""),
    );
    expect(lock()).not.toContain("pack-a");
  });

  it("deletes a file its last block leaves empty, and drops its record", () => {
    apply(["demo", "add", "--line", "a = 1", "--for", "pack-a"]);
    const res = apply(["demo", "remove", "--for", "pack-a"]);
    expect(res.out.deleted).toEqual(["demo.toml"]);
    expect(lock()).not.toContain("demo.toml");
  });

  it("writes a shared entry once and moves it to the next sharer on remove", () => {
    apply(["demo", "entry", "--line", "node_modules", "--for", "a"]);
    const shared = apply(["demo", "entry", "--line", "dist", "--for", "a"]);
    expect(shared.status).toBe(0);
    const second = run([
      "preview",
      "demo",
      "entry",
      "--line",
      "node_modules",
      "--for",
      "b",
    ]);
    expect(second.out.rows?.map(r => r.kind)).toEqual(["share"]);
    apply(["demo", "entry", "--line", "node_modules", "--for", "b"]);
    expect(read("list.toml").match(/node_modules/g)).toHaveLength(1);
    expect(lock()).toContain("\"\\\"node_modules\\\"\": [a, b]");
    apply(["demo", "remove", "--for", "a"]);
    expect(read("list.toml")).toBe(
      ["exclude = [", "  # >>> b", "  \"node_modules\",", "  # <<< b", "]", ""]
        .join("\n"),
    );
    expect(lock()).not.toContain("shares");
  });

  it("keeps a list's entries sorted and punctuated", () => {
    apply(["demo", "entry", "--line", "zeta", "--for", "a"]);
    apply(["demo", "entry", "--line", "alpha", "--for", "a"]);
    expect(read("list.toml")).toContain(
      "  # >>> a\n  \"alpha\",\n  \"zeta\",\n  # <<< a",
    );
  });
});

describe("rows and answers", () => {
  it("numbers rows in order, each with its answers", () => {
    const { out } = run(["preview", "all"]);
    expect(out.rows?.map(r => [r.id, r.kind, r["path"]])).toEqual([
      ["r1", "create", "demo.toml"],
      ["r2", "create", "tasks/run"],
    ]);
    expect(out.rows?.[0]?.answers).toEqual(["ok"]);
  });

  it("refuses a call with rows and no --answers, showing the rows", () => {
    const { status, out } = run(["all"]);
    expect(status).toBe(2);
    expect(out.rows).toHaveLength(2);
  });

  it("refuses a missing id, an unknown id and a wrong answer — writing nothing", () => {
    run(["preview", "all"]);
    expect(run(["all", "--answers", "r1:ok"]).out.error).toContain(
      "r2 is not answered",
    );
    expect(run(["all", "--answers", "r1:ok,r2:ok,r3:ok"]).out.error).toContain(
      "no row r3",
    );
    expect(run(["all", "--answers", "r1:ok,r2:overwrite"]).out.error).toContain(
      "takes ok",
    );
    expect(() => statSync(join(repo, "demo.toml"))).toThrow();
  });

  it("refuses a row whose content changed since the preview", () => {
    apply(["all"]);
    run(["preview", "demo", "add", "--line", "a = 1", "--for", "pack-a"]);
    appendFileSync(join(repo, "demo.toml"), "user = 1\n");
    const { status, out } = run([
      "demo",
      "add",
      "--line",
      "a = 1",
      "--for",
      "pack-a",
      "--answers",
      "r1:ok",
    ]);
    expect(status).toBe(2);
    expect(out.error).toContain("changed since the preview");
    expect(read("demo.toml")).not.toContain("pack-a");
  });

  it("raises a drift row for a hand-edited base block, and a merge answer yields needs-edit", () => {
    apply(["all"]);
    writeFileSync(
      join(repo, "demo.toml"),
      read("demo.toml").replace("beta = 2", "beta = 3"),
    );
    const preview = run(["preview", "all"]);
    const drift = preview.out.rows?.find(r => r.kind === "drift");
    expect(drift).toMatchObject({
      requester: "demo",
      answers: ["take-theirs", "keep-mine", "merge"],
    });
    const merged = run(["all", "--answers", `${drift?.id}:merge`]);
    expect(merged.status).toBe(0);
    expect(merged.out.rows?.[0]).toMatchObject({
      kind: "needs-edit",
      file: "demo.toml",
      answers: ["done", "skip"],
    });
    expect(read("demo.toml")).toContain("beta = 3");
    apply(["all"], r => (r.kind === "drift" ? "take-theirs" : "ok"));
    expect(read("demo.toml")).toContain("beta = 2");
  });

  it("raises a conflict row for an unrecorded file already in place", () => {
    mkdirSync(join(repo, "tasks"));
    writeFileSync(join(repo, "tasks", "run"), "mine\n");
    const { out } = run(["preview", "all"]);
    expect(out.rows?.find(r => r["path"] === "tasks/run")).toMatchObject({
      kind: "conflict",
      answers: ["keep-existing", "overwrite"],
    });
    apply(["all"], r => (r.kind === "conflict" ? "keep-existing" : "ok"));
    expect(read("tasks/run")).toBe("mine\n");
  });
});

describe("the lock record", () => {
  it("records sha256, mode and blocks, and keeps foreign entries and sections", () => {
    const foreign = [
      "# stackgen's record",
      "entries:",
      "  - path: .claude/skills/go/SKILL.md",
      "    slug: generated/go",
      "    component: language/go",
      "    source: generated",
      "    hash: abc",
      "skipped: []",
      "settings_keys: []",
      "",
    ]
      .join("\n");
    mkdirSync(join(repo, ".claude", "stackgen"), { recursive: true });
    writeFileSync(join(repo, ".claude", "stackgen", "lock.yaml"), foreign);
    apply(["all"]);
    apply(["demo", "add", "--line", "a = 1", "--for", "pack-a"]);
    const text = lock();
    const hash = createHash("sha256").update(read("demo.toml")).digest("hex");
    expect(text.startsWith(foreign.split("skipped:")[0] ?? "")).toBe(true);
    expect(text).toContain("skipped: []\nsettings_keys: []\n");
    expect(text).toContain(
      [
        "  - path: demo.toml",
        `    source: tool-config/demo@${version}`,
        `    hash: ${hash}`,
        "    blocks: [demo, pack-a]",
      ]
        .join("\n"),
    );
    expect(text).toContain("    mode: \"755\"");
    expect((statSync(join(repo, "tasks", "run")).mode & 0o777).toString(8))
      .toBe("755");
  });
});

describe("check", () => {
  it("is clean after a write and reports one row after a hand edit inside a block", () => {
    apply(["all"]);
    apply(["demo", "add", "--line", "a = 1", "--for", "pack-a"]);
    expect(run(["check"]).out.rows).toEqual([]);
    writeFileSync(
      join(repo, "demo.toml"),
      read("demo.toml").replace("alpha = 1", "alpha = 9"),
    );
    const { status, out } = run(["check", "demo"]);
    expect(status).toBe(0);
    expect(out.rows).toHaveLength(1);
    expect(out.rows?.[0]).toMatchObject({
      id: "r1",
      kind: "drift",
      path: "demo.toml",
      requester: "demo",
    });
    expect(read("demo.toml")).toContain("alpha = 9");
  });

  it("reports unreadable markers as needs-edit", () => {
    apply(["all"]);
    writeFileSync(
      join(repo, "demo.toml"),
      read("demo.toml").replace("# <<< demo", ""),
    );
    expect(run(["check"]).out.rows?.[0]).toMatchObject({
      kind: "needs-edit",
      file: "demo.toml",
    });
  });
});

describe("another source's paths", () => {
  const packLock = [
    "entries:",
    "  - path: demo.toml",
    "    component: language/demo",
    "    source: pack/language/demo@1.0.0",
    "    hash: abc",
    "  - path: frag.toml",
    "    component: language/frag",
    "    source: pack/language/frag@1.0.0",
    "    hash: def",
    "",
  ]
    .join("\n");
  beforeEach(() => {
    mkdirSync(join(repo, ".claude", "stackgen"), { recursive: true });
    writeFileSync(join(repo, ".claude", "stackgen", "lock.yaml"), packLock);
    writeFileSync(join(repo, "demo.toml"), "pack = 1\n");
    writeFileSync(join(repo, "frag.toml"), "frag = 1\n");
  });

  it("never writes or deletes a path another source's entry names", () => {
    const add = run([
      "preview",
      "demo",
      "add",
      "--line",
      "a = 1",
      "--for",
      "pack-a",
    ]);
    expect(add.out.rows).toEqual([]);
    expect(add.out["notes"]).toEqual([
      "demo.toml is pack/language/demo@1.0.0's — left alone",
    ]);
    expect(run(["preview", "demo", "drop", "--path", "frag.toml"]).out.rows)
      .toEqual([]);
    expect(read("demo.toml")).toBe("pack = 1\n");
    expect(lock()).toBe(packLock);
  });

  it("lets an op naming the exact source take the path over, and drops that entry", () => {
    const res = apply(["demo", "takeover", "--path", "frag.toml"]);
    expect(res.out.deleted).toEqual(["frag.toml"]);
    expect(lock()).not.toContain("frag.toml");
    expect(lock()).toContain("    source: pack/language/demo@1.0.0\n");
  });
});

describe("missing mise", () => {
  it("stops with the install remedy when mise is not on PATH", () => {
    const empty = mkdtempSync(join(tmpdir(), "tool-config-nopath-"));
    const { status, out } = run(["demo", "resolve"], { PATH: empty });
    rmSync(empty, { recursive: true, force: true });
    expect(status).toBe(2);
    expect(out.error).toBe(
      "mise is not on PATH — install mise (https://mise.jdx.dev), then re-run.",
    );
  });
});
