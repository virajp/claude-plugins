/**
 * The tool-config script's engine, run for real: argument refusals, blocks,
 * rows and answers, the lock record, `check`, and the mise steps a write
 * runs — trust, setup:all, the formatter, validate-config.
 *
 * The suite registers a test-only tool, `demo`, and a test-only cross-tool
 * `all` module through TOOL_CONFIG_TOOLS_MODULE, so it exercises the engine
 * without any shipped tool module. A fake `mise` on PATH records every call
 * and answers from FAKE_MISE_* switches; no real mise runs here. It lives
 * here because `vitest.config.mts` collects only
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
  symlinkSync,
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
// @ts-expect-error TS7016 — no declaration file for a shipped .mjs module
import * as entrySchema from "../../plugins/stackgen/skills/tool-config/scripts/lib/schema.mjs";

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
      put: { flags: { path: { required: true } }, requester: "required" },
      big: { flags: {} },
      mark: { flags: { path: { required: true }, key: {} }, requester: "required" },
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
      if (call.verb === "put") {
        return { ops: [{ op: "block", path: call.flags.path, requester: call.for, body: ["x = 1"] }] };
      }
      if (call.verb === "big") {
        return { ops: [], rows: [{ kind: "needs-edit", file: "big", reason: "x".repeat(3000000), target: "-" }] };
      }
      if (call.verb === "mark") {
        const keys = call.flags.key ? { [call.flags.key]: [call.for] } : {};
        return { ops: [{ op: "record", path: call.flags.path, fields: { keys } }] };
      }
      if (call.verb === "drop") return { ops: [{ op: "delete", path: call.flags.path }] };
      if (call.verb === "takeover") {
        return { ops: [{ op: "delete", path: call.flags.path, supersedes: ctx.source(call.flags.path) }] };
      }
      return { ops: [] };
    },
    expected(ctx, { path }) {
      if (path === "demo.toml") return { blocks: { demo: ["alpha = 1", "beta = 2"] } };
      // counts on the context: each memo-*.toml expects the next number, so
      // check is clean only when every record shares one context
      if (path.startsWith("memo-")) {
        ctx.seen = (ctx.seen ?? 0) + 1;
        return { blocks: { demo: ["seen = " + ctx.seen] } };
      }
      if (path === "tasks/run") return { whole: "#!/usr/bin/env bash\\necho run\\n" };
      return null;
    },
  },
  all: {
    verbs: {
      "add-exclude": {
        flags: { paths: { type: "pathList", required: true }, generated: { type: "bool", default: "false" } },
        requester: "optional",
      },
    },
    plan(ctx, call) {
      return {
        ops: [{
          op: "block", path: "excludes.toml", requester: call.for ?? "user",
          body: ["paths = " + call.flags.paths, "generated = " + call.flags.generated],
        }],
      };
    },
  },
};
`;

/** Records each call as `MISE_ENV=<v> <argv>` in $FAKE_MISE_LOG; FAKE_MISE_* switches pick failures. */
const FAKE_MISE = `#!/bin/sh
echo "MISE_ENV=\${MISE_ENV:-} $*" >> "$FAKE_MISE_LOG"
case "$1" in
  trust)
    [ -n "$FAKE_MISE_UNTRUSTED" ] && echo "$(pwd -P): untrusted"
    exit 0 ;;
  which)
    [ "$2" = "$FAKE_MISE_MISSING" ] && { echo "mise ERROR $2 is not a mise bin" >&2; exit 1; }
    echo "/fake/bin/$2"
    exit 0 ;;
  run)
    [ -f demo.toml ] && echo "setup:all saw demo.toml" >> "$FAKE_MISE_LOG"
    [ -n "$FAKE_MISE_SETUP_FAIL" ] && { echo "setup:all broke" >&2; exit 1; }
    exit 0 ;;
  x)
    [ "$2" = "--" ] || exit 1
    if [ "$3" = dprint ]; then
      shift 6
      if [ -n "$FAKE_MISE_FMT" ]; then for f; do echo "# formatted" >> "$f"; done; fi
      exit 0
    fi
    [ "$3" = pre-commit ] && [ -z "$FAKE_MISE_INVALID" ] && exit 0
    echo "invalid config" >&2
    exit 1 ;;
esac
exit 1
`;

let repo: string;
let toolsModule: string;
let fakeBin: string;
let miseLog: string;
let fakeEnv: Record<string, string>;

beforeEach(() => {
  const root = mkdtempSync(join(tmpdir(), "tool-config-core-"));
  repo = join(root, "repo");
  mkdirSync(repo);
  spawnSync("git", ["init", "-q"], { cwd: repo });
  toolsModule = join(root, "demo-tools.mjs");
  writeFileSync(toolsModule, DEMO);
  fakeBin = join(root, "bin");
  mkdirSync(fakeBin);
  writeFileSync(join(fakeBin, "mise"), FAKE_MISE, { mode: 0o755 });
  miseLog = join(root, "mise.log");
  fakeEnv = {};
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
    maxBuffer: 64 * 1024 * 1024,
    timeout: 20_000,
    env: {
      PATH: `${fakeBin}:${process.env["PATH"] ?? ""}`,
      HOME: repo,
      TOOL_CONFIG_TOOLS_MODULE: toolsModule,
      FAKE_MISE_LOG: miseLog,
      ...fakeEnv,
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
      /valid: add, entry, set-env, resolve, drop, takeover, put, big, mark, remove, all/,
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

const writeLock = (text: string) => {
  mkdirSync(join(repo, ".claude", "stackgen"), { recursive: true });
  writeFileSync(join(repo, ".claude", "stackgen", "lock.yaml"), text);
};

describe("the lock reader", () => {
  it("round-trips what its writer emits: a quoted key with : and \\\", a ` #` in a value, a block list", () => {
    const entry = (blocksLines: string[]) =>
      [
        "entries:",
        "  - path: demo.toml",
        `    source: tool-config/demo@${version}`,
        "    hash: abc",
        ...blocksLines,
        "    shares:",
        "      \"\\\"npm:foo\\\" = \\\"1.2.3\\\"\": [a, b]",
        "    templates:",
        "      pnpm: { Node: \"sha # not a comment\", written: h }",
        "",
      ]
        .join("\n");
    writeLock(entry(["    blocks:", "    - demo", "    - pack-a"]));
    writeFileSync(
      join(repo, "demo.toml"),
      "# >>> demo\nalpha = 1\n# <<< demo\n\n# >>> pack-a\na = 1\n# <<< pack-a\n",
    );
    expect(run(["check", "demo"]).status).toBe(0);
    apply(["demo", "add", "--line", "a = 2", "--for", "pack-a"]);
    const once = lock();
    expect(once).toContain("    blocks: [demo, pack-a]\n");
    expect(once).toContain(
      "      \"\\\"npm:foo\\\" = \\\"1.2.3\\\"\": [a, b]\n",
    );
    expect(once).toContain(
      "      pnpm: { Node: \"sha # not a comment\", written: h }\n",
    );
    apply(["demo", "add", "--line", "a = 3", "--for", "pack-a"]);
    expect(lock().replace(/hash: \w+/, "")).toBe(once.replace(/hash: \w+/, ""));
  });

  it("fails on an unclosed quote instead of hanging", () => {
    writeLock(
      [
        "entries:",
        "  - path: demo.toml",
        "    source: tool-config/demo@1.0.0",
        "    hash: abc",
        "    blocks: [\"demo",
        "",
      ]
        .join("\n"),
    );
    const { status, out } = run(["check"]);
    expect(status).toBe(1);
    expect(out.error).toContain("unclosed quote");
  });

  it("refuses a tool-config path that climbs out of the repo or is absolute", () => {
    for (const path of ["../escape.toml", "/etc/hosts"]) {
      writeLock(
        [
          "entries:",
          `  - path: ${path}`,
          "    source: tool-config/demo@1.0.0",
          "    hash: abc",
          "",
        ]
          .join("\n"),
      );
      const { status, out } = run(["demo", "remove", "--for", "pack-a"]);
      expect(status).toBe(2);
      expect(out.error).toContain("not a repo-relative path");
    }
  });
});

describe("gitignore:<Name> requesters", () => {
  it("reads one unquoted in a flow list and as a mapping key, and writes it back readable", () => {
    writeLock(
      [
        "entries:",
        "  - path: demo.toml",
        `    source: tool-config/demo@${version}`,
        "    hash: abc",
        "    blocks: [demo, gitignore:Go]",
        "    templates:",
        "      gitignore:Go: { Go: abc123, written: def456 }",
        "",
      ]
        .join("\n"),
    );
    writeFileSync(
      join(repo, "demo.toml"),
      "# >>> demo\nalpha = 1\n# <<< demo\n\n# >>> gitignore:Go\n*.test\n# <<< gitignore:Go\n",
    );
    expect(run(["check", "demo"]).status).toBe(0);
    apply(["demo", "add", "--line", "a = 1", "--for", "pack-a"]);
    const once = lock();
    expect(once).toContain("    blocks: [demo, \"gitignore:Go\", pack-a]\n");
    expect(once).toContain(
      "      \"gitignore:Go\": { Go: abc123, written: def456 }\n",
    );
    apply(["demo", "add", "--line", "a = 2", "--for", "pack-a"]);
    expect(lock().replace(/hash: \w+/, "")).toBe(once.replace(/hash: \w+/, ""));
  });
});

describe("check contexts", () => {
  it("gives every record of one tool the same module context", () => {
    const records = ["memo-a.toml", "memo-b.toml"].flatMap(path => [
      `  - path: ${path}`,
      `    source: tool-config/demo@${version}`,
      "    hash: abc",
      "    blocks: [demo]",
    ]);
    writeLock(["entries:", ...records, ""].join("\n"));
    writeFileSync(
      join(repo, "memo-a.toml"),
      "# >>> demo\nseen = 1\n# <<< demo\n",
    );
    writeFileSync(
      join(repo, "memo-b.toml"),
      "# >>> demo\nseen = 2\n# <<< demo\n",
    );
    expect(run(["check", "demo"]).out.rows).toEqual([]);
  });
});

describe("symlinks", () => {
  it("refuses to read, write or delete through a symlinked folder", () => {
    const outside = join(repo, "..", "outside");
    mkdirSync(outside);
    writeFileSync(join(outside, "secret"), "keep me\n");
    symlinkSync(outside, join(repo, "linked"));
    const put = run([
      "preview",
      "demo",
      "put",
      "--path",
      "linked/x.toml",
      "--for",
      "a",
    ]);
    expect(put.status).toBe(2);
    expect(put.out.error).toContain("linked is a symlink");
    expect(run(["demo", "drop", "--path", "linked/secret"]).status).toBe(2);
    expect(
      run(["demo", "put", "--path", "../outside/x.toml", "--for", "a"])
        .out
        .error,
    )
      .toContain(
        "not a repo-relative path",
      );
    expect(readFileSync(join(outside, "secret"), "utf8")).toBe("keep me\n");
    expect(() => statSync(join(outside, "x.toml"))).toThrow();
  });
});

describe("validateEntry agrees with the script", () => {
  const { validateEntry } = entrySchema as {
    validateEntry: (entry: Record<string, unknown>) => string[];
  };
  const shipped = (args: string[]) =>
    run(["preview", "mise", ...args, "--for", "p"], {
      TOOL_CONFIG_TOOLS_MODULE: "",
    });
  const cases: [Record<string, unknown>, string[]][] = [
    [{ verb: "add-alias", name: "x", command: "{{ y }}" }, [
      "add-alias",
      "--name",
      "x",
      "--command",
      "{{ y }}",
    ]],
    [{ verb: "add-tool", name: "x", version: "{{ y }}", env: "all" }, [
      "add-tool",
      "--name",
      "x",
      "--version",
      "{{ y }}",
      "--env",
      "all",
    ]],
    [{ verb: "add-env", key: "K", value: "\"unbalanced", env: "all" }, [
      "add-env",
      "--key",
      "K",
      "--value",
      "\"unbalanced",
      "--env",
      "all",
    ]],
    [{ verb: "add-alias", name: "x", command: "" }, [
      "add-alias",
      "--name",
      "x",
      "--command",
      "",
    ]],
  ];
  it.each(cases)("refuses %j as the script does", (entry, args) => {
    expect(validateEntry({ tool: "mise", ...entry })).not.toEqual([]);
    const res = shipped(args);
    expect(res.status).toBe(2);
    expect(res.out.error).toMatch(/template|TOML basic string|needs --/);
  });

  it("takes a template in a pack's own add-env value, as the script does", () => {
    const entry = {
      tool: "mise",
      verb: "add-env",
      key: "K",
      value: "{{ config_root }}",
      env: "all",
    };
    expect(validateEntry(entry)).toEqual([]);
    const res = shipped([
      "add-env",
      "--key",
      "K",
      "--value",
      "{{ config_root }}",
      "--env",
      "all",
    ]);
    expect(res.out.error ?? "").not.toContain("template");
  });
});

describe("output", () => {
  it("delivers a multi-megabyte JSON body whole through a pipe", () => {
    const { status, out } = run(["preview", "demo", "big"]);
    expect(status).toBe(0);
    expect((out.rows?.[0]?.["reason"] as string).length).toBe(3_000_000);
  });

  it("delivers a large refusal body whole, exit 2", () => {
    const { status, out } = run(["demo", "big"]);
    expect(status).toBe(2);
    expect((out.rows?.[0]?.["reason"] as string).length).toBe(3_000_000);
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

describe("the mise steps a write runs", () => {
  const calls = () =>
    readFileSync(miseLog, "utf8").trimEnd().split("\n").filter(l =>
      l.startsWith("MISE_ENV=")
    );
  const withFormatter = () => {
    mkdirSync(join(repo, ".config"), { recursive: true });
    writeFileSync(join(repo, ".config", "dprint.json"), "{}\n");
  };
  const sha = (text: string) => createHash("sha256").update(text).digest("hex");

  it("all runs setup:all after writing and before formatting, every tool as mise x --", () => {
    withFormatter();
    const res = apply(["all"]);
    expect(res.status, JSON.stringify(res.out)).toBe(0);
    const log = calls();
    const setup = log.indexOf("MISE_ENV=dev run setup:all");
    const fmt = log.indexOf(
      "MISE_ENV= x -- dprint fmt --config .config/dprint.json --allow-no-files demo.toml tasks/run",
    );
    expect(setup).toBeGreaterThanOrEqual(0);
    expect(fmt).toBeGreaterThan(setup);
    expect(readFileSync(miseLog, "utf8")).toContain("setup:all saw demo.toml");
    for (const line of log.filter(l => / x /.test(l))) {
      expect(line).toMatch(/^MISE_ENV=\S* x -- /);
    }
    expect(
      log.filter(l => / trust/.test(l)).every(l => / trust --show$/.test(l)),
    )
      .toBe(true);
  });

  it("records the formatted file's hash, not the rendered one", () => {
    withFormatter();
    fakeEnv = { FAKE_MISE_FMT: "1" };
    expect(apply(["demo", "add", "--line", "a = 1", "--for", "p"]).status)
      .toBe(0);
    const text = read("demo.toml");
    expect(text).toMatch(/# formatted\n$/);
    expect(lock()).toContain(`hash: ${sha(text)}`);
  });

  it("skips the formatter in a repo with no .config/dprint.json", () => {
    apply(["demo", "add", "--line", "a = 1", "--for", "p"]);
    expect(calls().some(l => / dprint /.test(l))).toBe(false);
  });

  it("refuses an untrusted repo before writing, naming the remedy", () => {
    fakeEnv = { FAKE_MISE_UNTRUSTED: "1" };
    const { status, out } = run([
      "demo",
      "add",
      "--line",
      "a = 1",
      "--for",
      "p",
    ]);
    expect(status).toBe(2);
    expect(out.error).toContain("not trusted");
    expect(out.error).toContain("trusted_config_paths");
    expect(() => statSync(join(repo, "demo.toml"))).toThrow();
  });

  it("refuses with the setup:all remedy when a step's tool is not installed, writing nothing", () => {
    withFormatter();
    fakeEnv = { FAKE_MISE_MISSING: "dprint" };
    const { status, out } = apply([
      "demo",
      "add",
      "--line",
      "a = 1",
      "--for",
      "p",
    ]);
    expect(status).toBe(2);
    expect(out.error).toContain("MISE_ENV=dev mise run setup:all");
    expect(() => statSync(join(repo, "demo.toml"))).toThrow();
  });

  it("validates a written hook config, and a failure restores every file byte for byte", () => {
    const hooks = ".config/pre-commit-config.yaml";
    mkdirSync(join(repo, ".config"));
    writeFileSync(join(repo, hooks), "repos: []\n");
    apply(["demo", "put", "--path", hooks, "--for", "a"]);
    expect(calls()).toContain(
      `MISE_ENV= x -- pre-commit validate-config ${hooks}`,
    );
    const before = read(hooks);
    const record = lock();
    fakeEnv = { FAKE_MISE_INVALID: "1" };
    const { status, out } = apply([
      "demo",
      "put",
      "--path",
      hooks,
      "--for",
      "b",
    ]);
    expect(status).toBe(2);
    expect(out.error).toContain("invalid config");
    expect(read(hooks)).toBe(before);
    expect(lock()).toBe(record);
  });

  it("keeps the files and records nothing when setup:all fails", () => {
    fakeEnv = { FAKE_MISE_SETUP_FAIL: "1" };
    const { status, out } = apply(["all"]);
    expect(status).toBe(2);
    expect(out.error).toContain("setup:all broke");
    expect(out.written).toEqual(["demo.toml", "tasks/run"]);
    expect(read("demo.toml")).toContain("alpha = 1");
    expect(() => statSync(join(repo, ".claude/stackgen/lock.yaml"))).toThrow();
  });

  it("never runs setup:all on a preview or a single verb", () => {
    run(["preview", "all"]);
    apply(["demo", "add", "--line", "a = 1", "--for", "p"]);
    expect(calls().some(l => / run setup:all/.test(l))).toBe(false);
  });
});

describe("the record op", () => {
  const mark = (args: string[]) => [
    "demo",
    "mark",
    "--path",
    "demo.toml",
    ...args,
  ];

  it("sets a record field as a row of its own, and a second run shows none", () => {
    apply(["demo", "add", "--line", "a = 1", "--for", "p"]);
    const text = read("demo.toml");
    const preview = run([
      "preview",
      ...mark(["--key", "excludes[x]", "--for", "p"]),
    ]);
    expect(preview.out.rows?.map(r => [r.kind, r["path"], r["keys"]])).toEqual([
      ["record", "demo.toml", { "excludes[x]": ["p"] }],
    ]);
    expect(apply(mark(["--key", "excludes[x]", "--for", "p"])).status).toBe(0);
    expect(read("demo.toml")).toBe(text);
    expect(lock()).toContain("keys:");
    expect(lock()).toContain("excludes[x]");
    expect(
      run(["preview", ...mark(["--key", "excludes[x]", "--for", "p"])])
        .out
        .rows,
    )
      .toEqual([]);
  });

  it("drops a field given empty, as a row", () => {
    apply(["demo", "add", "--line", "a = 1", "--for", "p"]);
    apply(mark(["--key", "k", "--for", "p"]));
    const preview = run(["preview", ...mark(["--for", "p"])]);
    expect(preview.out.rows?.map(r => r.kind)).toEqual(["record"]);
    apply(mark(["--for", "p"]));
    expect(lock()).not.toContain("keys:");
  });
});

describe("the cross-tool verbs and the G1 path rule", () => {
  const { classifyPath, validateEntry } = entrySchema as {
    classifyPath: (p: string) => { kind: string; glob: boolean; name: string; };
    validateEntry: (entry: Record<string, unknown>) => string[];
  };

  it.each([
    ["node_modules", "directory", false, "node_modules"],
    [".venv", "directory", false, ".venv"],
    ["Derived/", "directory", false, "Derived"],
    ["*.lock", "file", true, "*.lock"],
    ["*-lock.json", "file", true, "*-lock.json"],
    ["?.tmp", "file", true, "?.tmp"],
    ["*.xcassets/", "directory", true, "*.xcassets"],
  ])("classifies %s as a %s", (path, kind, glob, name) => {
    expect(classifyPath(path)).toEqual({ path, name, kind, glob });
  });

  it("runs all add-exclude through the module registered as all, a bare bool reading true", () => {
    const res = apply([
      "all",
      "add-exclude",
      "--paths",
      "node_modules,*.xcassets/",
      "--for",
      "p",
      "--generated",
    ]);
    expect(res.status, JSON.stringify(res.out)).toBe(0);
    expect(read("excludes.toml")).toContain(
      "paths = node_modules,*.xcassets/\ngenerated = true",
    );
  });

  it("refuses a path that climbs, and a bool that is not one", () => {
    expect(
      run(["all", "add-exclude", "--paths", "../x"]).out.error,
    )
      .toContain("not a relative name");
    expect(
      run(["all", "add-exclude", "--paths", "x", "--generated", "yes"])
        .out
        .error,
    )
      .toContain("not true or false");
  });

  it("applies a pack's structured list and bool entry as the flags", () => {
    const pack = join(repo, "..", "pack.yaml");
    writeFileSync(
      pack,
      [
        "tool-config:",
        "  - { tool: all, verb: add-exclude, paths: [node_modules, \"*.xcassets/\"], generated: true }",
        "",
      ]
        .join("\n"),
    );
    const res = apply(["apply-entries", "--pack", "p", "--file", pack]);
    expect(res.status, JSON.stringify(res.out)).toBe(0);
    expect(read("excludes.toml")).toContain(
      "# >>> p\npaths = node_modules,*.xcassets/\ngenerated = true",
    );
  });

  it.each<[Record<string, unknown>, string]>([
    [{ tool: "dprint", verb: "add-plugin", name: "Bad Name" }, "plugin name"],
    [{ tool: "all", verb: "add-exclude", paths: "node_modules" }, "list"],
    [
      { tool: "all", verb: "add-exclude", paths: ["x"], generated: "yes" },
      "true or false",
    ],
    [{
      tool: "pre-commit",
      verb: "add-hook",
      repo: "local",
      id: "x",
      stage: "pre-commit",
      name: "x",
      entry: "uv lock",
      language: "system",
    }, "mise x -- "],
    [{
      tool: "pre-commit",
      verb: "add-hook",
      repo: "https://example.com/h",
      id: "x",
      stage: "pre-commit",
    }, "--rev"],
    [{
      tool: "pre-commit",
      verb: "add-hook",
      repo: "local",
      id: "x",
      stage: "post-merge",
      name: "x",
      entry: "mise x -- t",
      language: "system",
      "always-run": false,
    }, "always-run"],
    [
      { tool: "pre-commit", verb: "add-linter-ignore", paths: ["/abs"] },
      "relative",
    ],
    [{
      tool: "grype",
      verb: "add-ignore",
      id: "CVE-1",
      package: "a@1",
      reason: "r",
    }, "missing expires"],
    [{
      tool: "grype",
      verb: "add-ignore",
      id: "CVE-1",
      package: "a",
      reason: "r",
      expires: "2026-01-01",
    }, "name>@<version"],
  ])("validateEntry refuses %j", (entry, fault) => {
    expect(validateEntry(entry).join("; ")).toContain(fault);
  });

  it.each<Record<string, unknown>>([
    { tool: "dprint", verb: "add-plugin", name: "malva" },
    { tool: "dprint", verb: "add-plugin", name: "markup_fmt" },
    {
      tool: "all",
      verb: "add-exclude",
      paths: ["*.xcassets/", "Derived"],
      generated: false,
    },
    {
      tool: "pre-commit",
      verb: "add-hook",
      repo: "local",
      id: "uv-lock-check",
      stage: "pre-commit",
      name: "uv lockfile is current",
      entry: "mise x -- uv lock --check",
      language: "system",
      files: "(^|.*/)pyproject\\.toml$",
      "pass-filenames": false,
    },
    { tool: "pre-commit", verb: "add-linter-ignore", paths: [".build"] },
    {
      tool: "grype",
      verb: "add-ignore",
      id: "GHSA-abcd-1234",
      package: "@scope/pkg@1.2.3",
      reason: "unreachable here",
      expires: "2027-01-31",
    },
  ])("validateEntry takes %j", entry => {
    expect(validateEntry(entry)).toEqual([]);
  });
});
