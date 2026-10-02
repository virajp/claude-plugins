/**
 * The tool-config script's mise module, run for real against temp git repos:
 * the greenfield landing, the verbs, the conflict rows, `upgrade`, the
 * migration and the repo-local skill's task table.
 *
 * A fake `mise` on PATH answers `mise latest <tool>` from a versions file, so
 * the suite is offline and deterministic; no real mise runs here.
 *
 * The greenfield golden tree is one JSON file, path → {content, mode}, so the
 * repo's formatters never touch the TOML and Markdown it holds. Regenerate it
 * after an asset change with TOOL_CONFIG_GOLDEN=write.
 */
import { spawnSync } from "node:child_process";
import {
  appendFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import {
  dirname,
  join,
  relative,
} from "node:path";
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
const golden = join(
  import.meta.dirname,
  "fixtures",
  "tool-config",
  "mise",
  "greenfield.json",
);

const FAKE_MISE = `#!/bin/sh
# answers \`mise latest <tool>\` from $FAKE_MISE_VERSIONS (tool=version lines); 1.0.0 when unlisted, exit 1 on FAIL
[ "$1" = latest ] || exit 1
v=$(awk -F= -v t="$2" '$1 == t { print $2; exit }' "$FAKE_MISE_VERSIONS" 2>/dev/null)
[ "$v" = FAIL ] && { echo "no such tool: $2" >&2; exit 1; }
echo "\${v:-1.0.0}"
`;

const CONF = ".config/mise/conf.d";
const SKILL = ".claude/skills/mise/SKILL.md";
const GREENFIELD = [
  "all",
  "--repo",
  "scratch",
  "--members",
  "api,web",
  "--runtimes",
  "node",
  "--plugin-sources",
  "acme/claude-plugins|acme-plugins",
  "--plugins",
  "widget@acme-plugins",
];

let root: string;
let repo: string;
let versions: string;

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "tool-config-mise-"));
  repo = join(root, "repo");
  mkdirSync(repo);
  mkdirSync(join(root, "bin"));
  writeFileSync(join(root, "bin", "mise"), FAKE_MISE, { mode: 0o755 });
  versions = join(root, "versions");
  writeFileSync(versions, "");
  spawnSync("git", ["init", "-q"], { cwd: repo });
});
afterEach(() => {
  rmSync(root, { recursive: true, force: true });
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
  notes?: string[];
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
      PATH: [join(root, "bin"), dirname(process.execPath), "/usr/bin", "/bin"]
        .join(":"),
      HOME: root,
      FAKE_MISE_VERSIONS: versions,
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
  env: Record<string, string> = {},
) {
  const preview = run(["preview", ...args], env);
  expect(preview.status, JSON.stringify(preview.out)).toBe(0);
  const rows = preview.out.rows ?? [];
  const res = rows.length === 0
    ? run(args, env)
    : run([
      ...args,
      "--answers",
      rows.map(r => `${r.id}:${pick(r)}`).join(","),
    ], env);
  expect(res.status, JSON.stringify(res.out)).toBe(0);
  return { preview: preview.out, out: res.out };
}

const rowsOf = (args: string[], env: Record<string, string> = {}) =>
  run(["preview", ...args], env).out.rows ?? [];
const path = (p: string) => join(repo, p);
const read = (p: string) => readFileSync(path(p), "utf8");
const write = (p: string, text: string) => {
  mkdirSync(dirname(path(p)), { recursive: true });
  writeFileSync(path(p), text);
};
const setVersions = (text: string) => writeFileSync(versions, text);

function tree(dir: string): Record<string, { content: string; mode: string; }> {
  const out: Record<string, { content: string; mode: string; }> = {};
  const walk = (abs: string) => {
    for (const d of readdirSync(abs, { withFileTypes: true })) {
      const p = join(abs, d.name);
      if (d.name === ".git") {
        continue;
      }
      if (d.isDirectory()) {
        walk(p);
        continue;
      }
      out[relative(dir, p)] = {
        content: readFileSync(p, "utf8"),
        mode: (statSync(p).mode & 0o777).toString(8),
      };
    }
  };
  walk(dir);
  return Object.fromEntries(
    Object.entries(out).sort(([a], [b]) => (a < b ? -1 : 1)),
  );
}

describe("greenfield all", () => {
  it("lands the golden tree byte for byte, every task 755, every file recorded", () => {
    apply(GREENFIELD);
    const landed = tree(repo);
    const lock = landed[".claude/stackgen/lock.yaml"];
    delete landed[".claude/stackgen/lock.yaml"];
    if (process.env["TOOL_CONFIG_GOLDEN"] === "write") {
      mkdirSync(dirname(golden), { recursive: true });
      writeFileSync(golden, JSON.stringify(landed, null, 2) + "\n");
    }
    expect(landed).toEqual(JSON.parse(readFileSync(golden, "utf8")));
    for (const [p, f] of Object.entries(landed)) {
      if (p.startsWith(".config/mise/tasks/")) {
        expect(f.mode, p).toBe("755");
      }
      expect(lock?.content, p).toContain(`path: "${p}"`);
    }
    expect(lock?.content).toContain(`source: tool-config/mise@${version}`);
  });

  it("writes every latest pin as an exact version", () => {
    setVersions("jq=1.8.1\npipx:graphifyy=0.4.2\n");
    apply(["all"]);
    const tools = read(`${CONF}/tools.dev.toml`) + read(`${CONF}/tools.toml`);
    expect(tools).not.toContain("\"latest\"");
    expect(tools).toMatch(/jq\s+= \{ version = "1\.8\.1" \}/);
    expect(tools).toContain(
      "\"pipx:graphifyy\" = { uvx = true, version = \"0.4.2\" }",
    );
  });

  it("refuses the call, naming the tool, when a pin cannot be resolved", () => {
    setVersions("shfmt=FAIL\n");
    const { status, out } = run(["preview", "all"]);
    expect(status).toBe(2);
    expect(out.error).toContain("mise latest shfmt");
    expect(existsSync(path(CONF))).toBe(false);
  });

  it("is idempotent: a second all shows no row and check finds no drift", () => {
    apply(GREENFIELD);
    expect(rowsOf(["all", "--repo", "scratch"])).toEqual([]);
    expect(rowsOf(GREENFIELD)).toEqual([]);
    expect(run(["check"]).out.rows).toEqual([]);
  });

  it("keeps a written pin when the resolver moves on, until upgrade", () => {
    apply(["all"]);
    setVersions("jq=2.0.0\n");
    expect(rowsOf(["all"])).toEqual([]);
  });

  it("shows a changed argument as a write row, not drift", () => {
    apply(GREENFIELD);
    const rows = rowsOf(["all", "--merge-model-develop", "pr"]);
    expect(rows.map(r => [r.kind, r["path"]])).toEqual([
      ["write", `${CONF}/env.toml`],
    ]);
  });

  it("raises drift for a hand-edited base block, and check reports it", () => {
    apply(["all"]);
    write(
      `${CONF}/env.dev.toml`,
      read(`${CONF}/env.dev.toml`).replace("$HOME/.cache", "/tmp"),
    );
    expect(rowsOf(["all"]).map(r => r.kind)).toEqual(["drift"]);
    expect(run(["check"]).out.rows?.[0]).toMatchObject({
      kind: "drift",
      path: `${CONF}/env.dev.toml`,
      requester: "mise",
    });
  });
});

describe("verbs", () => {
  beforeEach(() => {
    apply(["all"]);
  });

  it("add-tool writes the requester's exact pin, and keeps it on a second latest", () => {
    setVersions("doppler=3.71.0\n");
    apply([
      "mise",
      "add-tool",
      "--name",
      "doppler",
      "--version",
      "latest",
      "--env",
      "all",
      "--for",
      "doppler",
    ]);
    expect(read(`${CONF}/tools.toml`)).toContain(
      "# >>> doppler\ndoppler = { version = \"3.71.0\" }\n# <<< doppler",
    );
    setVersions("doppler=3.80.0\n");
    expect(
      rowsOf([
        "mise",
        "add-tool",
        "--name",
        "doppler",
        "--version",
        "latest",
        "--env",
        "all",
        "--for",
        "doppler",
      ]),
    )
      .toEqual([]);
    const moved = rowsOf([
      "mise",
      "add-tool",
      "--name",
      "doppler",
      "--version",
      "3.75.0",
      "--env",
      "all",
      "--for",
      "doppler",
    ]);
    expect(moved.map(r => r.kind)).toEqual(["write"]);
  });

  it("add-tool resolves a prefix to the exact version, and keeps a pin that still answers it", () => {
    setVersions("swiftlint@0.59=0.59.1\nswiftlint@0.60=0.60.2\n");
    const add = (spec: string) => [
      "mise",
      "add-tool",
      "--name",
      "swiftlint",
      "--version",
      spec,
      "--env",
      "dev",
      "--for",
      "swiftlint",
    ];
    apply(add("0.59"));
    expect(read(`${CONF}/tools.dev.toml`)).toContain(
      "# >>> swiftlint\nswiftlint = { version = \"0.59.1\" }\n# <<< swiftlint",
    );
    expect(rowsOf(add("0.59"))).toEqual([]);
    apply(add("0.60"));
    expect(read(`${CONF}/tools.dev.toml`)).toContain(
      "swiftlint = { version = \"0.60.2\" }",
    );
  });

  it("add-tool shows a tool pinned elsewhere as one conflict row, settled by the answer", () => {
    const args = [
      "mise",
      "add-tool",
      "--name",
      "jq",
      "--version",
      "1.7.1",
      "--env",
      "ci",
      "--for",
      "pack",
    ];
    const rows = rowsOf(args);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      kind: "conflict",
      tool: "jq",
      answers: ["keep-existing", "overwrite"],
      existing: [{ path: `${CONF}/tools.dev.toml`, holder: "mise" }],
    });
    apply(args, () => "keep-existing");
    expect(existsSync(path(`${CONF}/tools.ci.toml`))).toBe(false);
    apply(args, () => "overwrite");
    expect(read(`${CONF}/tools.ci.toml`)).toContain(
      "# >>> pack\njq = { version = \"1.7.1\" }\n# <<< pack",
    );
    expect(read(`${CONF}/tools.dev.toml`)).not.toMatch(/^jq/m);
    expect(run(["check"]).out.rows).toEqual([]);
    expect(rowsOf(["all"])).toEqual([]);
  });

  it("add-env writes a pack's line, and never moves a machine value it later holds", () => {
    const add = [
      "mise",
      "add-env",
      "--key",
      "XCODE_VERSION",
      "--value",
      "",
      "--env",
      "all",
      "--for",
      "swiftui",
    ];
    apply(add);
    expect(read(`${CONF}/env.toml`)).toContain(
      "# >>> swiftui\nXCODE_VERSION = \"\"\n# <<< swiftui",
    );
    apply([
      "mise",
      "set-env",
      "--key",
      "XCODE_VERSION",
      "--value",
      "26.1",
      "--for",
      "swiftui",
    ]);
    expect(read(`${CONF}/env.toml`)).toContain("XCODE_VERSION = \"26.1\"");
    expect(rowsOf(add)).toEqual([]);
  });

  it("add-env takes a template only in a pack's own line", () => {
    const value = "{{ config_root | split(pat='/') | last }}";
    expect(
      run(["mise", "add-env", "--key", "P", "--value", value, "--env", "all"])
        .status,
    )
      .toBe(2);
    apply([
      "mise",
      "add-env",
      "--key",
      "P",
      "--value",
      value,
      "--env",
      "all",
      "--for",
      "doppler",
    ]);
    expect(read(`${CONF}/env.toml`)).toContain(`P = "${value}"`);
  });

  it("set-env is refused where the requester's block sets no such key", () => {
    const { status, out } = run([
      "mise",
      "set-env",
      "--key",
      "NOPE",
      "--value",
      "x",
      "--for",
      "swiftui",
    ]);
    expect(status).toBe(2);
    expect(out.error).toContain("sets no NOPE");
  });

  it("set-env finding the key outside the block offers move-in or keep-both", () => {
    apply([
      "mise",
      "add-env",
      "--key",
      "XCODE_VERSION",
      "--value",
      "",
      "--env",
      "all",
      "--for",
      "swiftui",
    ]);
    write(
      `${CONF}/env.dev.toml`,
      read(`${CONF}/env.dev.toml`) + "XCODE_VERSION = \"15.0\"\n",
    );
    const args = [
      "mise",
      "set-env",
      "--key",
      "XCODE_VERSION",
      "--value",
      "26.1",
      "--for",
      "swiftui",
    ];
    const conflict = rowsOf(args).find(r => r.kind === "conflict");
    expect(conflict).toMatchObject({
      path: `${CONF}/env.dev.toml`,
      answers: ["move-in", "keep-both"],
    });
    expect(conflict?.["reason"]).toContain(`${CONF}/env.dev.toml wins`);
    apply(args, r => r.answers[0] ?? "ok");
    expect(read(`${CONF}/env.dev.toml`)).not.toContain("XCODE_VERSION");
    expect(read(`${CONF}/env.toml`)).toContain("XCODE_VERSION = \"26.1\"");
  });

  it("set-env with no --for rewrites the user's own line, and is refused without one", () => {
    expect(
      run(["mise", "set-env", "--key", "MINE", "--value", "b"]).status,
    )
      .toBe(2);
    write(
      `${CONF}/env.dev.toml`,
      read(`${CONF}/env.dev.toml`) + "MINE = \"a\"\n",
    );
    apply(["mise", "set-env", "--key", "MINE", "--value", "b"]);
    expect(read(`${CONF}/env.dev.toml`)).toContain("MINE = \"b\"");
  });

  it("add-alias shows a clash with an existing alias as a conflict row", () => {
    const args = [
      "mise",
      "add-alias",
      "--name",
      "setup",
      "--command",
      "mise run other",
      "--for",
      "pack",
    ];
    const rows = rowsOf(args);
    expect(rows).toEqual([
      expect.objectContaining({
        kind: "conflict",
        alias: "setup",
        existing: [expect.objectContaining({ holder: "mise" })],
      }),
    ]);
    apply(args, () => "overwrite");
    const text = read(`${CONF}/shell_alias.dev.toml`);
    expect(text.match(/^setup\s*=/gm)).toHaveLength(1);
    expect(text).toContain(
      "# >>> pack\nsetup = \"mise run other\"\n# <<< pack",
    );
  });

  it("add-alias refuses an environment other than dev", () => {
    expect(
      run([
        "mise",
        "add-alias",
        "--name",
        "x",
        "--command",
        "y",
        "--env",
        "ci",
        "--for",
        "pack",
      ])
        .out
        .error,
    )
      .toContain("must be one of dev");
  });

  it("remove takes every block a requester holds", () => {
    apply([
      "mise",
      "add-tool",
      "--name",
      "doppler",
      "--version",
      "3.0.0",
      "--env",
      "all",
      "--for",
      "doppler",
    ]);
    apply([
      "mise",
      "add-env",
      "--key",
      "DOPPLER_CONFIG",
      "--value",
      "local",
      "--env",
      "all",
      "--for",
      "doppler",
    ]);
    apply(["mise", "remove", "--for", "doppler"]);
    expect(read(`${CONF}/tools.toml`)).not.toContain("doppler");
    expect(read(`${CONF}/env.toml`)).not.toContain("doppler");
    expect(read(".claude/stackgen/lock.yaml")).not.toContain("doppler");
  });

  it("applies a pack's structured entries, leaving its string entries to prose", () => {
    const pack = join(root, "pack.yaml");
    writeFileSync(
      pack,
      [
        "tool-config:",
        "  - {tool: mise, verb: add-tool, name: swiftlint, version: \"0.59.1\", env: dev}",
        "  - {tool: mise, verb: add-env, key: DEMO_KEY, value: \"x\", env: all}",
        "  - {tool: mise, verb: add-alias, name: demo, command: \"mise run demo\"}",
        "  - git add ignore .demo/",
        "",
      ]
        .join("\n"),
    );
    const { out } = apply(["apply-entries", "--pack", "demo", "--file", pack]);
    expect(out["prose"]).toEqual([
      { entry: "git add ignore .demo/", handled: "prose" },
    ]);
    expect(read(`${CONF}/tools.dev.toml`)).toContain(
      "# >>> demo\nswiftlint = { version = \"0.59.1\" }\n# <<< demo",
    );
    expect(read(`${CONF}/env.toml`)).toContain("DEMO_KEY = \"x\"");
    expect(read(`${CONF}/shell_alias.dev.toml`)).toContain(
      "demo = \"mise run demo\"",
    );
    expect(rowsOf(["apply-entries", "--pack", "demo", "--file", pack])).toEqual(
      [],
    );
  });
});

describe("upgrade", () => {
  beforeEach(() => {
    apply(["all"]);
  });

  it("is refused outside dev", () => {
    const { status, out } = run(["mise", "upgrade"]);
    expect(status).toBe(2);
    expect(out.error).toContain("dev only");
  });

  it("shows one row per changed pin, old to new and whose block, and writes on ok", () => {
    const dev = { MISE_ENV: "dev" };
    setVersions("npm:@askviraj/linter=1.1.6\njq=1.9.0\nuv=0.9.0\n");
    const rows = rowsOf(["mise", "upgrade"], dev);
    expect(
      rows.map(r => [r["path"], r["requester"], r["tool"], r["from"], r["to"]]),
    )
      .toEqual([
        [`${CONF}/tools.dev.toml`, "mise", "jq", "1.0.0", "1.9.0"],
        [`${CONF}/tools.dev.toml`, "mise", "uv", "1.0.0", "0.9.0"],
      ]);
    expect(rows[0]?.answers).toEqual(["ok", "keep"]);
    apply(["mise", "upgrade"], undefined, dev);
    const text = read(`${CONF}/tools.dev.toml`);
    expect(text).toMatch(/jq\s+= \{ version = "1\.9\.0" \}/);
    expect(text).toMatch(/uv\s+= \{ version = "0\.9\.0" \}/);
    expect(text).not.toContain("\"1.0.0\" }\n# <<<");
    expect(run(["check"]).out.rows).toEqual([]);
    expect(rowsOf(["mise", "upgrade"], dev)).toEqual([]);
    expect(rowsOf(["all"])).toEqual([]);
  });

  it("composes a mix of answers within one block", () => {
    const dev = { MISE_ENV: "dev" };
    setVersions("npm:@askviraj/linter=1.1.6\njq=1.9.0\nuv=0.9.0\n");
    apply(["mise", "upgrade"], r => (r["tool"] === "jq" ? "keep" : "ok"), dev);
    const text = read(`${CONF}/tools.dev.toml`);
    expect(text).toMatch(/jq\s+= \{ version = "1\.0\.0" \}/);
    expect(text).toMatch(/uv\s+= \{ version = "0\.9\.0" \}/);
    expect(text.match(/^uv\s*=/gm)).toHaveLength(1);
  });

  it("moves a pack's pin and a user's line too", () => {
    const dev = { MISE_ENV: "dev" };
    setVersions("npm:@askviraj/linter=1.1.6\n");
    apply([
      "mise",
      "add-tool",
      "--name",
      "doppler",
      "--version",
      "3.0.0",
      "--env",
      "all",
      "--for",
      "doppler",
    ]);
    write(`${CONF}/tools.ci.toml`, "[tools]\nmine = \"1.0.0\"\n");
    setVersions("npm:@askviraj/linter=1.1.6\ndoppler=3.1.0\nmine=2.0.0\n");
    expect(
      rowsOf(["mise", "upgrade"], dev)
        .map(r => `${String(r["requester"])}:${String(r["tool"])}`)
        .sort(),
    )
      .toEqual(["doppler:doppler", "user:mine"]);
    apply(["mise", "upgrade"], undefined, dev);
    expect(read(`${CONF}/tools.toml`)).toContain(
      "# >>> doppler\ndoppler = { version = \"3.1.0\" }\n# <<< doppler",
    );
    expect(read(`${CONF}/tools.ci.toml`)).toBe("[tools]\nmine = \"2.0.0\"\n");
  });

  it("keep leaves the pins as they stand", () => {
    const dev = { MISE_ENV: "dev" };
    setVersions("jq=1.9.0\nnpm:@askviraj/linter=1.1.6\n");
    apply(["mise", "upgrade"], () => "keep", dev);
    expect(read(`${CONF}/tools.dev.toml`)).toMatch(
      /jq\s+= \{ version = "1\.0\.0" \}/,
    );
  });
});

describe("migration", () => {
  it("turns a legacy MERGE_MODEL into the pair", () => {
    write(`${CONF}/env.toml`, "[env]\nMERGE_MODEL = \"pr\"\n");
    const { preview } = apply(["all"]);
    expect(preview.rows?.find(r => r.kind === "move")).toMatchObject({
      path: `${CONF}/env.toml`,
      line: "MERGE_MODEL = \"pr\"",
      answers: ["ok"],
    });
    const env = read(`${CONF}/env.toml`);
    expect(env).not.toMatch(/^MERGE_MODEL\s*=/m);
    expect(env).toMatch(/MERGE_MODEL_DEVELOP = "pr"/);
    expect(env).toMatch(/MERGE_MODEL_MAIN\s+= "pr"/);
  });

  it("folds an old pack fragment into its requester's blocks", () => {
    write(
      `${CONF}/doppler.toml`,
      "[tools]\ndoppler = \"3.0.0\"\n\n[env]\nDOPPLER_CONFIG = \"local\"\n",
    );
    const { preview } = apply(["all"]);
    expect(preview.rows?.find(r => r.kind === "fold")).toMatchObject({
      path: `${CONF}/doppler.toml`,
      requester: "doppler",
      into: [`${CONF}/tools.toml`, `${CONF}/env.toml`],
    });
    expect(existsSync(path(`${CONF}/doppler.toml`))).toBe(false);
    expect(read(`${CONF}/tools.toml`)).toContain(
      "# >>> doppler\ndoppler = \"3.0.0\"\n# <<< doppler",
    );
    expect(read(`${CONF}/env.toml`)).toContain(
      "# >>> doppler\nDOPPLER_CONFIG = \"local\"\n# <<< doppler",
    );
  });

  it("raises needs-edit for a fragment it cannot read, and for a root mise.toml", () => {
    write(`${CONF}/legacy.toml`, "[hooks]\nenter = \"echo hi\"\n");
    write("mise.toml", "[tools]\nnode = \"22\"\n");
    const rows = rowsOf(["all"]).filter(r => r.kind === "needs-edit");
    expect(rows.map(r => r["file"])).toEqual([
      `${CONF}/legacy.toml`,
      "mise.toml",
    ]);
    expect(rows[1]?.["target"]).toContain(".config/mise/conf.d/");
    expect(rows[0]?.answers).toEqual(["done", "skip"]);
  });

  it("deletes an old lock, and leaves every *.local.* file alone", () => {
    write(".config/mise.lock", "[tools]\n");
    write(".config/mise/mise.lock", "[tools]\n");
    write(`${CONF}/tools.local.toml`, "[tools]\njq = \"1.6\"\n");
    const { preview } = apply(["all"]);
    expect(
      preview.rows?.filter(r => r.kind === "delete").map(r => r["path"]),
    )
      .toEqual([".config/mise.lock", ".config/mise/mise.lock"]);
    expect(preview.rows?.some(r => r.kind === "conflict")).toBe(false);
    expect(read(`${CONF}/tools.local.toml`)).toBe("[tools]\njq = \"1.6\"\n");
  });

  it("deletes a tracked .config/mise/locks/ tree as one row", () => {
    write(
      ".config/mise/locks/npm-askviraj-linter/1.1.6~ab/package.json",
      "{}\n",
    );
    write(
      ".config/mise/locks/npm-askviraj-linter/1.1.6~ab/aube-lock.yaml",
      "x: 1\n",
    );
    const { preview } = apply(["all"]);
    expect(preview.rows?.filter(r => r["path"] === ".config/mise/locks/"))
      .toEqual([
        expect.objectContaining({ kind: "delete", files: 2, answers: ["ok"] }),
      ]);
    expect(
      existsSync(
        path(".config/mise/locks/npm-askviraj-linter/1.1.6~ab/package.json"),
      ),
    )
      .toBe(false);
    expect(rowsOf(["all"])).toEqual([]);
  });

  it("folds a fragment its pack recorded, and a second all shows no row", () => {
    write(`${CONF}/doppler.toml`, "[tools]\ndoppler = \"3.0.0\"\n");
    write(
      ".claude/stackgen/lock.yaml",
      `entries:\n  - path: ${CONF}/doppler.toml\n    source: doppler@1.0.0\n    hash: abc\n`,
    );
    apply(["all"]);
    expect(existsSync(path(`${CONF}/doppler.toml`))).toBe(false);
    expect(read(".claude/stackgen/lock.yaml")).not.toContain("doppler@1.0.0");
    expect(rowsOf(["all"])).toEqual([]);
  });

  it("takes over an old lock a retired pack recorded", () => {
    write(".config/mise.lock", "[tools]\n");
    write(
      ".claude/stackgen/lock.yaml",
      "entries:\n  - path: .config/mise.lock\n    source: toolchain@1.0.0\n    hash: abc\n",
    );
    apply(["all"]);
    expect(existsSync(path(".config/mise.lock"))).toBe(false);
    expect(read(".claude/stackgen/lock.yaml")).not.toContain("toolchain@1.0.0");
  });

  it("never writes back a task file a pack's overlay owns", () => {
    const task = ".config/mise/tasks/code/lint";
    write(
      task,
      "#!/usr/bin/env bash\n#MISE description=\"Lint with the pack\"\n",
    );
    write(
      ".claude/stackgen/lock.yaml",
      `entries:\n  - path: ${task}\n    source: pnpm@1.0.0\n    hash: abc\n`,
    );
    const { out } = apply(["all"]);
    expect(read(task)).toContain("Lint with the pack");
    expect(out.notes?.join(" ")).toContain(`${task} is pnpm@1.0.0's`);
    expect(read(SKILL)).toContain("| `code:lint` | Lint with the pack |");
  });

  it("hoists a tool pinned in two environment files into tools.toml, as one row", () => {
    write(`${CONF}/tools.ci.toml`, "[tools]\nfoo = { version = \"1.2.0\" }\n");
    write(
      `${CONF}/tools.test.toml`,
      "[tools]\nfoo = { version = \"1.3.0\" }\n",
    );
    const { preview } = apply(["all"]);
    expect(preview.rows?.filter(r => r.kind === "hoist")).toEqual([
      expect.objectContaining({
        tool: "foo",
        to: "foo = { version = \"1.3.0\" }",
      }),
    ]);
    expect(read(`${CONF}/tools.toml`)).toMatch(
      /^foo = \{ version = "1\.3\.0" \}$/m,
    );
    expect(existsSync(path(`${CONF}/tools.ci.toml`))).toBe(false);
    expect(existsSync(path(`${CONF}/tools.test.toml`))).toBe(false);
  });

  it("raises a conflict row for a base pin the repo already holds", () => {
    write(`${CONF}/tools.toml`, "[tools]\njq = \"1.6\"\n");
    const conflict = rowsOf(["all"]).find(r => r.kind === "conflict");
    expect(conflict).toMatchObject({
      tool: "jq",
      requested: "jq         = { version = \"1.0.0\" }",
      existing: [{
        path: `${CONF}/tools.toml`,
        holder: "user",
        line: "jq = \"1.6\"",
      }],
    });
    apply(["all"], r => (r.kind === "conflict" ? "keep-existing" : "ok"));
    expect(read(`${CONF}/tools.dev.toml`)).not.toMatch(/^jq/m);
    expect(rowsOf(["all"])).toEqual([]);
    expect(run(["check"]).out.rows).toEqual([]);
  });

  it("deletes the retired setup/vscode task where it is unchanged and unused", () => {
    apply(["all"]);
    const task = ".config/mise/tasks/setup/vscode";
    const body = "#!/usr/bin/env bash\necho vscode\n";
    write(task, body);
    const hash =
      spawnSync("shasum", ["-a", "256"], { input: body, encoding: "utf8" })
        .stdout
        .split(" ")[0];
    appendFileSync(
      path(".claude/stackgen/lock.yaml"),
      `  - path: "${task}"\n    source: tool-config/mise@0.0.1\n    hash: ${hash}\n    mode: "755"\n`,
    );
    const { preview } = apply(["all"]);
    expect(preview.rows?.map(r => [r.kind, r["path"]])).toEqual([[
      "delete",
      task,
    ]]);
    expect(existsSync(path(task))).toBe(false);
    expect(read(".claude/stackgen/lock.yaml")).not.toContain("setup/vscode");
  });

  it("keeps and reports a setup/vscode task that was changed", () => {
    apply(["all"]);
    write(".config/mise/tasks/setup/vscode", "#!/usr/bin/env bash\n");
    const { out } = run(["preview", "all"]);
    expect(out.rows?.some(r => r.kind === "delete")).toBe(false);
    expect(out.notes?.join(" ")).toContain("setup/vscode kept");
  });
});

describe("the repo-local mise skill", () => {
  it("lists every visible task, sorted, and no _scripts or hidden one", () => {
    apply(["all"]);
    const skill = read(SKILL);
    const table = skill.slice(skill.indexOf("<!-- >>> tasks -->"));
    expect(table).toContain("| `setup:all` | Set up or upgrade everything");
    expect(table).not.toContain("setup:ai");
    expect(table).not.toContain("_scripts");
    expect(table).not.toContain("`init`");
    const names = [...table.matchAll(/^\| `([^`]+)`/gm)].map(m => m[1]);
    expect(names).toEqual([...names].sort());
    expect(skill).not.toMatch(/\$\{CLAUDE_PLUGIN_ROOT\}/);
  });

  it("regenerates the table after a task file is added, on all and on a pack verb", () => {
    apply(["all"]);
    write(
      ".config/mise/tasks/code/demo",
      "#!/usr/bin/env bash\n#MISE description=\"Run the demo\"\n",
    );
    apply([
      "mise",
      "add-env",
      "--key",
      "K",
      "--value",
      "v",
      "--env",
      "all",
      "--for",
      "pack",
    ]);
    expect(read(SKILL)).toContain("| `code:demo` | Run the demo |");
    write(
      ".config/mise/tasks/code/demo2",
      "#!/usr/bin/env bash\n#MISE description=\"Two\"\n",
    );
    const rows = rowsOf(["all"]);
    expect(rows.map(r => [r.kind, r["path"]])).toEqual([["write", SKILL]]);
  });

  it("never counts a padded table as a change", () => {
    apply(["all"]);
    write(
      SKILL,
      read(SKILL).replace("| `code:all` |", "| `code:all`        |"),
    );
    expect(rowsOf(["all"])).toEqual([]);
    expect(run(["check"]).out.rows).toEqual([]);
  });
});
