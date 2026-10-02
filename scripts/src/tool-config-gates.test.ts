/**
 * The tool-config script's gate modules — dprint, pre-commit, gitleaks,
 * grype and the cross-tool `all add-exclude` — run for real against temp git
 * repos: the greenfield landing, each verb, shares, the forge links, the
 * conflict and rename rows, the migration from the retired gate packs, drift.
 *
 * A fake `mise` on PATH records every call and stands in for setup:all,
 * `dprint fmt` (a stand-in formatter that re-quotes, re-aligns and rewraps,
 * when FAKE_FMT names it) and `pre-commit validate-config`; no real mise or
 * tool runs here. HOME and every MISE_* dir sit in the sandbox.
 *
 * The golden trees are JSON files, path → content, so the repo's formatters
 * never touch the YAML and TOML they hold. Regenerate them after an asset
 * change with TOOL_CONFIG_GOLDEN=write.
 */
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import {
  dirname,
  join,
} from "node:path";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
} from "vitest";
// @ts-expect-error TS7016 — no declaration file for a shipped .mjs module
import * as lists from "../../plugins/stackgen/skills/tool-config/scripts/lib/tools/index.mjs";

const pluginRoot = join(import.meta.dirname, "..", "..", "plugins", "stackgen");
const script = join(
  pluginRoot,
  "skills",
  "tool-config",
  "scripts",
  "tool-config.mjs",
);
const assets = join(pluginRoot, "skills", "tool-config", "assets");
const fixtures = join(import.meta.dirname, "fixtures", "tool-config", "gates");
const version = (JSON.parse(
  readFileSync(join(pluginRoot, ".claude-plugin", "plugin.json"), "utf8"),
) as { version: string; })
  .version;

const FAKE_MISE = `#!/bin/sh
# records each call; trust, which, run and latest pass; \`x -- dprint fmt …\` runs $FAKE_FMT over the
# files when set; \`x -- pre-commit validate-config\` fails when $FAKE_MISE_INVALID is set
echo "$*" >> "$FAKE_MISE_LOG"
case "$1" in
  trust | run) exit 0 ;;
  which) echo "/fake/bin/$2"; exit 0 ;;
  latest) echo 1.0.0; exit 0 ;;
  x)
    if [ "$3" = dprint ]; then
      shift 7
      [ -n "$FAKE_FMT" ] && node "$FAKE_FMT" "$@"
      exit 0
    fi
    [ "$3" = pre-commit ] && [ -z "$FAKE_MISE_INVALID" ] && exit 0
    echo "invalid config" >&2
    exit 1 ;;
esac
exit 1
`;

/** A stand-in for the shipped formatter: what dprint, taplo and pretty_yaml change and never mean. */
const FAKE_FMT = String.raw`
import { readFileSync, writeFileSync } from "node:fs";
for (const f of process.argv.slice(2)) {
  let t = readFileSync(f, "utf8");
  if (/\.ya?ml$/.test(f)) {
    t = t.replace(/^(\s*[\w-]+: )'([^'"\\]*)'$/gm, '$1"$2"');
    t = t.replace(/^(\s+)(description: )(.{50,}?) (.+)$/gm, "$1$2$3\n$1  $4");
  }
  if (/\.toml$/.test(f)) {
    t = t.replace(/^([\w.-]+) = /gm, "$1    = ");
  }
  writeFileSync(f, t);
}
`;

const GATES = [
  ".config/dprint.json",
  ".config/taplo.toml",
  "dprint.json",
  ".config/pre-commit-config.yaml",
  ".config/git-conventional-commits.yaml",
  ".config/linter.yaml",
  ".config/gitleaks.toml",
  ".config/grype.yaml",
];
const HOOKS = ".config/pre-commit-config.yaml";
const CONVENTION = ".config/git-conventional-commits.yaml";
const LOCK = ".claude/stackgen/lock.yaml";

let root: string;
let repo: string;
let log: string;
let fmt: string;

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "tool-config-gates-"));
  repo = join(root, "repo");
  mkdirSync(repo);
  mkdirSync(join(root, "bin"));
  writeFileSync(join(root, "bin", "mise"), FAKE_MISE, { mode: 0o755 });
  log = join(root, "mise.log");
  fmt = join(root, "fmt.mjs");
  writeFileSync(fmt, FAKE_FMT);
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
  const home = join(root, "home");
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
      HOME: home,
      MISE_DATA_DIR: join(home, "mise-data"),
      MISE_CONFIG_DIR: join(home, "mise-config"),
      MISE_CACHE_DIR: join(home, "mise-cache"),
      MISE_STATE_DIR: join(home, "mise-state"),
      FAKE_MISE_LOG: log,
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
    : run(
      [...args, "--answers", rows.map(r => `${r.id}:${pick(r)}`).join(",")],
      env,
    );
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
const asset = (tool: string, p: string) =>
  readFileSync(join(assets, tool, p), "utf8");
const sha = (t: string) => createHash("sha256").update(t).digest("hex");
const calls =
  () => (existsSync(log) ? readFileSync(log, "utf8").split("\n") : []);
const origin = (url: string) =>
  spawnSync("git", ["remote", "add", "origin", url], { cwd: repo });

function gates(): Record<string, string> {
  return Object.fromEntries(
    GATES.filter(p => existsSync(path(p))).map(p => [p, read(p)]),
  );
}

function golden(name: string, landed: Record<string, string>) {
  const file = join(fixtures, `${name}.json`);
  if (process.env["TOOL_CONFIG_GOLDEN"] === "write") {
    mkdirSync(fixtures, { recursive: true });
    writeFileSync(file, JSON.stringify(landed, null, 2) + "\n");
  }
  expect(landed).toEqual(JSON.parse(readFileSync(file, "utf8")));
}

/** A pack.yaml in the sandbox holding these tool-config lines. */
function pack(name: string, lines: string[]) {
  const file = join(root, `${name}.yaml`);
  writeFileSync(
    file,
    `name: ${name}\ntool-config:\n${lines.map(l => `  - ${l}`).join("\n")}\n`,
  );
  return ["apply-entries", "--pack", name, "--file", file];
}

/** The exclude regex's alternatives, in order, as the hook runner reads them. */
function alternatives(text: string): string[] {
  const at = text.split("\n").findIndex(l => l.startsWith("exclude: |-"));
  const out: string[] = [];
  for (const l of text.split("\n").slice(at + 2)) {
    if (!l.startsWith("  ")) {
      break;
    }
    if (l.trim().startsWith("#")) {
      continue;
    }
    out.push(l.trim());
  }
  return out;
}

const excludeRegex = (text: string) => new RegExp(alternatives(text).join(""));

const PACK = [
  "{ tool: all, verb: add-exclude, paths: [node_modules, .turbo], generated: true }",
  "{ tool: all, verb: add-exclude, paths: [\"*-lock.json\", \"*.xcassets/\"] }",
  "{ tool: pre-commit, verb: add-linter-ignore, paths: [.venv] }",
  "{ tool: dprint, verb: add-plugin, name: typescript }",
  "{ tool: grype, verb: add-ignore, id: CVE-2026-0001, package: \"left-pad@1.0.0\", reason: never reached from a request path, expires: \"2027-01-01\" }",
  [
    "tool: pre-commit",
    "    verb: add-hook",
    "    repo: local",
    "    id: uv-lock-check",
    "    stage: pre-commit",
    "    name: uv lockfile is current",
    "    description: Fails when pyproject.toml moved and uv.lock did not, catching drift at the commit that caused it.",
    "    entry: mise x -- uv lock --check",
    "    files: (^|.*/)pyproject\\.toml$",
    "    language: system",
    "    pass-filenames: false",
  ]
    .join("\n"),
];

describe("greenfield all", () => {
  it("lands the golden gate files, each recorded under its tool, then formats and validates them through mise x --", () => {
    origin("git@github.com:acme/widget.git");
    apply(["all", "--scopes", "api,web"]);
    golden("greenfield", gates());
    const lock = read(LOCK);
    for (
      const [tool, p] of [
        ["dprint", ".config/dprint.json"],
        ["dprint", "dprint.json"],
        ["pre-commit", HOOKS],
        ["gitleaks", ".config/gitleaks.toml"],
        ["grype", ".config/grype.yaml"],
      ] as const
    ) {
      expect(lock).toMatch(
        new RegExp(
          `path: "?${
            p.replaceAll(".", "\\.")
          }"?\\n\\s+source: tool-config/${tool}@${version}`,
        ),
      );
    }
    const fmtCall = calls().find(l => l.startsWith("x -- dprint fmt"));
    expect(fmtCall).toContain("--config .config/dprint.json --allow-no-files");
    for (const p of GATES) {
      expect(fmtCall, p).toContain(p);
    }
    expect(calls()).toContain(`x -- pre-commit validate-config ${HOOKS}`);
    expect(calls().indexOf("run setup:all")).toBeLessThan(
      calls().findIndex(l => l.startsWith("x -- dprint fmt")),
    );
  });

  it("is idempotent: a second all shows no row and check finds no drift", () => {
    apply(["all"]);
    expect(rowsOf(["all"])).toEqual([]);
    expect(run(["check"]).out.rows).toEqual([]);
  });

  it("stays idempotent through the formatter: what it rewrites is never a change", () => {
    const env = { FAKE_FMT: fmt };
    origin("https://github.com/acme/widget.git");
    apply(["all", "--scopes", "api"], undefined, env);
    apply(pack("demo", PACK), undefined, env);
    expect(read(HOOKS)).toContain("files: \"(^|/)-\"");
    expect(read(".config/taplo.toml")).toMatch(/^include {4}= /m);
    expect(rowsOf(["all"], env)).toEqual([]);
    expect(rowsOf(pack("demo", PACK), env)).toEqual([]);
    expect(run(["check"]).out.rows).toEqual([]);
  });

  it("writes no file and records nothing when validate-config fails", () => {
    const rows = rowsOf(["all"]);
    const { out, status } = run(
      ["all", "--answers", rows.map(r => `${r.id}:ok`).join(",")],
      { FAKE_MISE_INVALID: "1" },
    );
    expect(status).toBe(2);
    expect(existsSync(path(LOCK))).toBe(false);
    expect(out.error).toContain("validate-config");
    for (const p of GATES) {
      expect(existsSync(path(p)), p).toBe(false);
    }
  });
});

describe("the forge links", () => {
  const links = () =>
    read(CONVENTION).split("\n").filter(l =>
      /^\s+#?\s*(commitUrl|commitRangeUrl|issueRegexPattern|issueUrl):/.test(l)
    );

  it.each([
    [
      "git@github.com:acme/widget.git",
      "https://github.com/acme/widget/commit/%commit%",
      "https://github.com/acme/widget/compare/%from%...%to%?diff=split",
    ],
    [
      "ssh://git@ghe.github.com:22/acme/widget.git",
      "https://ghe.github.com/acme/widget/commit/%commit%",
      "https://ghe.github.com/acme/widget/compare/%from%...%to%?diff=split",
    ],
    [
      "https://bot:token@gitlab.com/acme/sub/widget.git",
      "https://gitlab.com/acme/sub/widget/-/commit/%commit%",
      "https://gitlab.com/acme/sub/widget/-/compare/%from%...%to%",
    ],
  ])("fills them from %s", (url, commit, range) => {
    origin(url);
    apply(["all"]);
    expect(links()).toEqual([
      `  commitUrl: ${commit}`,
      `  commitRangeUrl: ${range}`,
      "  issueRegexPattern: \"#[0-9]+\"",
      `  issueUrl: ${commit.replace(/commit\/%commit%$/, "issues/%issue%")}`,
    ]);
    expect(read(CONVENTION)).not.toContain("token");
  });

  it.each([
    ["another host", "git@bitbucket.org:acme/widget.git"],
    ["no remote", null],
  ])("keeps them commented for %s, and says so", (_, url) => {
    if (url) {
      origin(url);
    }
    const { out } = apply(["all"]);
    expect(links().every(l => l.trimStart().startsWith("#"))).toBe(true);
    expect(out.notes?.join("\n")).toContain("changelog links stay as they are");
  });

  it("fills them on the next all once a remote is added, as a write row", () => {
    apply(["all"]);
    origin("git@github.com:acme/widget.git");
    expect(rowsOf(["all"]).map(r => [r.kind, r["path"]])).toEqual([[
      "write",
      CONVENTION,
    ]]);
  });
});

describe("commitScopes", () => {
  const scopes = () => {
    const lines = read(CONVENTION).split("\n");
    const at = lines.findIndex(l => /^\s+commitScopes:/.test(l));
    const out = [lines[at]];
    for (const l of lines.slice(at + 1)) {
      if (!/^\s{4}- /.test(l)) {
        break;
      }
      out.push(l);
    }
    return out;
  };

  it("fills from --scopes, retires an omitted scope, appends a new one, un-retires a returning one", () => {
    apply(["all", "--scopes", "api,web"]);
    expect(scopes()).toEqual(["  commitScopes:", "    - api", "    - web"]);
    expect(rowsOf(["all", "--scopes", "web,cli"]).map(r => r.kind)).toEqual([
      "write",
    ]);
    apply(["all", "--scopes", "web,cli"]);
    expect(scopes()).toEqual([
      "  commitScopes:",
      "    - api # retired",
      "    - web",
      "    - cli",
    ]);
    apply(["pre-commit", "set-scopes", "--scopes", "api,web,cli"]);
    expect(scopes()).toEqual([
      "  commitScopes:",
      "    - api",
      "    - web",
      "    - cli",
    ]);
    expect(rowsOf(["all"])).toEqual([]);
  });

  it("refuses a scope that is not a project id, and set-scopes with a --for", () => {
    expect(run(["preview", "all", "--scopes", "Not An Id"]).status).toBe(2);
    apply(["all"]);
    expect(
      run([
        "preview",
        "pre-commit",
        "set-scopes",
        "--scopes",
        "api",
        "--for",
        "p",
      ])
        .out
        .error,
    )
      .toContain("takes no --for");
  });
});

describe("all add-exclude", () => {
  it("writes each path in every list's spelling, the allowlist only with --generated, and the packs' golden tree", () => {
    origin("git@github.com:acme/widget.git");
    apply(["all", "--scopes", "api"]);
    apply(pack("demo", PACK));
    golden("packs", gates());
    const dprint = JSON.parse(read(".config/dprint.json")) as {
      excludes: string[];
    };
    expect(dprint.excludes).toEqual(expect.arrayContaining([
      "**/.turbo/",
      "**/node_modules/",
      "**/*.xcassets/",
      "**/*-lock.json",
    ]));
    expect(read(".config/taplo.toml")).toContain("\"**/*.xcassets/**\",");
    expect(read(".config/taplo.toml")).toContain("\"**/*-lock.json\",");
    const gitleaks = read(".config/gitleaks.toml");
    expect(gitleaks).toContain("'''(^|/)node_modules/''',");
    expect(gitleaks).not.toContain("xcassets");
    expect(gitleaks).not.toContain("lock");
  });

  it("excludes everything inside a directory glob, and a file glob's files only", () => {
    apply(["all"]);
    apply([
      "all",
      "add-exclude",
      "--paths",
      "*.xcassets/,*-lock.json,.venv",
      "--for",
      "demo",
    ]);
    const re = excludeRegex(read(HOOKS));
    expect(re.test("App/Assets.xcassets/AppIcon.appiconset/Contents.json"))
      .toBe(true);
    expect(re.test("Assets.xcassets/Contents.json")).toBe(true);
    expect(re.test("pkg/package-lock.json")).toBe(true);
    expect(re.test("pkg/package-lock.json.bak")).toBe(false);
    expect(re.test("svc/.venv/lib/x.py")).toBe(true);
    expect(re.test("src/main.ts")).toBe(false);
  });

  it("re-derives the | on every write: every alternative but the first opens with one", () => {
    apply(["all"]);
    const check = () => {
      const alts = alternatives(read(HOOKS));
      expect(alts[0]?.startsWith("|"), alts.join("\n")).toBe(false);
      expect(alts.slice(1).every(a => a.startsWith("|")), alts.join("\n")).toBe(
        true,
      );
    };
    apply(["all", "add-exclude", "--paths", "node_modules", "--for", "a"]);
    check();
    apply(["all", "add-exclude", "--paths", "dist-cache", "--for", "b"]);
    check();
    apply(["all", "remove", "--for", "a"]);
    check();
    expect(read(HOOKS)).not.toContain("node_modules");
  });

  it("drops the leading | when a removal leaves a new first alternative", () => {
    const spec = {
      key: "exclude",
      open: /^exclude:\s*\|-?\s*$/,
      kind: "regex",
      indent: "  ",
      punct: "bar",
      order: "dirs-first",
    };
    const text =
      "exclude: |-\n  (?x)\n  # >>> a\n  (^|/)x/\n  # <<< a\n  # >>> b\n  |(^|/)y/\n  # <<< b\n";
    const { listRemove } = lists as unknown as {
      listRemove: (
        t: string,
        s: typeof spec,
        o: { requester: string; shares: Record<string, string[]>; },
      ) => string;
    };
    expect(listRemove(text, spec, { requester: "a", shares: {} })).toBe(
      "exclude: |-\n  (?x)\n  # >>> b\n  (^|/)y/\n  # <<< b\n",
    );
  });

  it("writes a shared exclude once, and moves it to the next sharer when its holder goes", () => {
    apply(["all"]);
    apply([
      "all",
      "add-exclude",
      "--paths",
      "node_modules",
      "--generated",
      "--for",
      "a",
    ]);
    const before = read(".config/taplo.toml");
    const { preview } = apply([
      "all",
      "add-exclude",
      "--paths",
      "node_modules",
      "--generated",
      "--for",
      "b",
    ]);
    expect(preview.rows?.map(r => [r.kind, r["path"]])).toEqual([
      ["share", ".config/dprint.json"],
      ["share", ".config/taplo.toml"],
      ["share", HOOKS],
      ["share", ".config/gitleaks.toml"],
    ]);
    expect(read(".config/taplo.toml")).toBe(before);
    expect(read(LOCK)).toContain("\"**/node_modules/**\": [a, b]");
    expect(read(LOCK)).toContain("\"excludes[**/node_modules/]\": [a, b]");
    apply(["all", "remove", "--for", "a"]);
    for (const p of [".config/taplo.toml", HOOKS, ".config/gitleaks.toml"]) {
      expect(read(p), p).toMatch(/# >>> b\n[^\n]*node_modules/);
      expect(read(p), p).not.toContain("# >>> a");
    }
    expect(read(".config/dprint.json")).toContain("**/node_modules/");
    apply(["all", "remove", "--for", "b"]);
    for (
      const p of [
        ".config/dprint.json",
        ".config/taplo.toml",
        HOOKS,
        ".config/gitleaks.toml",
      ]
    ) {
      expect(read(p), p).toBe(
        asset(
          p === HOOKS
            ? "pre-commit"
            : p.includes("gitleaks")
            ? "gitleaks"
            : "dprint",
          p,
        ),
      );
    }
  });

  it("notes an exclude the base already holds, and refuses one tool's own exclude verb", () => {
    apply(["all"]);
    const { out } = apply([
      "all",
      "add-exclude",
      "--paths",
      "build",
      "--for",
      "a",
    ]);
    expect(out.notes?.join("\n")).toContain("satisfied");
    expect(read(".config/taplo.toml")).not.toContain("# >>> a");
    for (const tool of ["dprint", "pre-commit", "gitleaks"]) {
      expect(
        run(["preview", tool, "add-exclude", "--paths", "x", "--for", "a"])
          .out
          .error,
        tool,
      )
        .toContain("all add-exclude");
    }
  });

  it("refuses before all has landed the lists", () => {
    expect(
      run(["preview", "all", "add-exclude", "--paths", "x", "--for", "a"])
        .out
        .error,
    )
      .toContain("land dprint's base first");
  });
});

describe("dprint add-plugin", () => {
  const cfg = () =>
    JSON.parse(read(".config/dprint.json")) as Record<string, unknown> & {
      plugins: string[];
    };

  it("inserts the URL ahead of exec and the config key in order, recorded in the lock's keys", () => {
    apply(["all"]);
    apply([
      "dprint",
      "add-plugin",
      "--name",
      "typescript",
      "--for",
      "typescript",
    ]);
    const c = cfg();
    expect(c.plugins.at(-2)).toBe(
      "https://plugins.dprint.dev/typescript-0.96.1.wasm",
    );
    expect(c.plugins.at(-1)).toMatch(/exec-/);
    expect(Object.keys(c)).toEqual([...Object.keys(c)].sort());
    expect(c["typescript"]).toMatchObject({
      quoteStyle: "alwaysDouble",
      lineWidth: 80,
    });
    expect(read(LOCK)).toContain(
      "typescript: [\"plugins[typescript]\", typescript]",
    );
    expect(
      rowsOf([
        "dprint",
        "add-plugin",
        "--name",
        "typescript",
        "--for",
        "typescript",
      ]),
    )
      .toEqual([]);
  });

  it("satisfies a base plugin, and refuses a name the table does not hold", () => {
    apply(["all"]);
    expect(
      run([
        "preview",
        "dprint",
        "add-plugin",
        "--name",
        "markdown",
        "--for",
        "p",
      ])
        .out
        .notes
        ?.join(""),
    )
      .toContain("the base's");
    expect(
      run([
        "preview",
        "dprint",
        "add-plugin",
        "--name",
        "prettier",
        "--for",
        "p",
      ])
        .out
        .error,
    )
      .toContain("plugin table");
  });

  it("writes a plugin two packs ask for once, and passes its keys on when the holder goes", () => {
    apply(["all"]);
    apply(["dprint", "add-plugin", "--name", "malva", "--for", "astro"]);
    const { preview } = apply([
      "dprint",
      "add-plugin",
      "--name",
      "malva",
      "--for",
      "html",
    ]);
    expect(preview.rows?.map(r => r.kind)).toEqual(["share"]);
    expect(cfg().plugins.filter(u => u.includes("malva"))).toHaveLength(1);
    apply(["dprint", "remove", "--for", "astro"]);
    expect(cfg()["malva"]).toBeDefined();
    expect(read(LOCK)).toContain("html: [\"plugins[malva]\", malva]");
    apply(["dprint", "remove", "--for", "html"]);
    expect(read(".config/dprint.json")).toBe(
      asset("dprint", ".config/dprint.json"),
    );
    expect(read(LOCK)).not.toContain("keys:");
  });
});

describe("pre-commit add-hook", () => {
  const hook = [
    "pre-commit",
    "add-hook",
    "--repo",
    "local",
    "--id",
    "uv-lock-check",
    "--stage",
    "pre-commit",
    "--name",
    "uv lockfile is current",
    "--entry",
    "mise x -- uv lock --check",
    "--language",
    "system",
    "--files",
    "(^|.*/)pyproject\\.toml$",
    "--pass-filenames",
    "false",
  ];

  it("writes the hook in the requester's block after the last repos: entry, one blank line before it", () => {
    apply(["all"]);
    apply([...hook, "--for", "uv"]);
    expect(read(HOOKS)).toContain([
      "        stages: [manual]",
      "",
      "  # >>> uv",
      "  - repo: local",
      "    hooks:",
      "      - id: uv-lock-check",
      "        name: uv lockfile is current",
      "        entry: mise x -- uv lock --check",
      "        language: system",
      "        files: (^|.*/)pyproject\\.toml$",
      "        pass_filenames: false",
      "  # <<< uv",
      "",
    ]
      .join("\n"));
    expect(rowsOf([...hook, "--for", "uv"])).toEqual([]);
    apply(["pre-commit", "remove", "--for", "uv"]);
    expect(read(HOOKS)).toBe(asset("pre-commit", HOOKS));
  });

  it("writes a post stage with always_run: true, and refuses it false", () => {
    apply(["all"]);
    const post = [
      "pre-commit",
      "add-hook",
      "--repo",
      "local",
      "--id",
      "after",
      "--stage",
      "post-merge",
      "--name",
      "After",
      "--entry",
      "mise x -- mise run code:after",
      "--language",
      "system",
      "--for",
      "p",
    ];
    apply(post);
    expect(read(HOOKS)).toMatch(
      /- id: after\n(.*\n)*\s+always_run: true\n\s+stages: \[post-merge\]/,
    );
    expect(run(["preview", ...post, "--always-run", "false"]).out.error)
      .toContain("always-run true");
  });

  it("raises a conflict row for an id another place defines: keep-existing writes nothing, overwrite takes it over", () => {
    apply(["all"]);
    const format = [
      "pre-commit",
      "add-hook",
      "--repo",
      "local",
      "--id",
      "format",
      "--stage",
      "pre-commit",
      "--name",
      "Mine",
      "--entry",
      "mise x -- mise run mine",
      "--language",
      "system",
      "--for",
      "p",
    ];
    const rows = rowsOf(format);
    expect(rows.map(r => [r.kind, r["hook"], r["held"]])).toEqual([[
      "conflict",
      "format",
      ["pre-commit"],
    ]]);
    apply(format, () => "keep-existing");
    expect(read(HOOKS)).toBe(asset("pre-commit", HOOKS));
    apply(format, () => "overwrite");
    expect(read(HOOKS).match(/- id: format$/gm)).toHaveLength(1);
    expect(read(HOOKS)).toMatch(
      /# >>> p\n {2}- repo: local\n {4}hooks:\n {6}- id: format\n {8}name: Mine/,
    );
  });

  it("refuses a local hook whose entry skips mise, and a URL hook with no rev", () => {
    apply(["all"]);
    expect(
      run([
        "preview",
        "pre-commit",
        "add-hook",
        "--repo",
        "local",
        "--id",
        "x",
        "--stage",
        "pre-commit",
        "--name",
        "X",
        "--entry",
        "uv lock",
        "--language",
        "system",
        "--for",
        "p",
      ])
        .out
        .error,
    )
      .toContain("mise x -- ");
    expect(
      run([
        "preview",
        "pre-commit",
        "add-hook",
        "--repo",
        "https://github.com/a/b",
        "--id",
        "x",
        "--stage",
        "pre-commit",
        "--for",
        "p",
      ])
        .out
        .error,
    )
      .toContain("--rev");
  });
});

describe("pre-commit add-linter-ignore", () => {
  it("writes each path into the requester's block in ignores:, and warns a person about a path git tracks", () => {
    apply(["all"]);
    apply([
      "pre-commit",
      "add-linter-ignore",
      "--paths",
      "Derived,DerivedData",
      "--for",
      "swiftui",
    ]);
    expect(read(".config/linter.yaml")).toContain(
      "  # <<< pre-commit\n  # >>> swiftui\n  - \"**/Derived/\"\n  - \"**/DerivedData/\"\n  # <<< swiftui\n",
    );
    write("src/gen/x.ts", "export {};\n");
    spawnSync("git", ["add", "src/gen/x.ts"], { cwd: repo });
    const rows = rowsOf(["pre-commit", "add-linter-ignore", "--paths", "gen"]);
    expect(rows.map(r => [r.kind, r["paths"]])).toEqual([["write", undefined], [
      "warning",
      ["gen"],
    ]]);
  });
});

describe("grype", () => {
  const ignore = [
    "grype",
    "add-ignore",
    "--id",
    "CVE-2026-0001",
    "--package",
    "left-pad@1.0.0",
    "--reason",
    "never reached",
    "--expires",
    "2027-01-01",
  ];

  it("refuses an ignore missing any of the four", () => {
    apply(["all"]);
    for (const flag of ["--package", "--reason", "--expires"]) {
      const at = ignore.indexOf(flag);
      const args = [...ignore.slice(0, at), ...ignore.slice(at + 2)];
      expect(run(["preview", ...args]).out.error, flag).toContain(
        `needs ${flag}`,
      );
    }
  });

  it("writes the four-line comment above the entry, [] becoming a list and back", () => {
    apply(["all"]);
    apply(ignore);
    expect(read(".config/grype.yaml")).toContain([
      "ignore:",
      "  # id: CVE-2026-0001",
      "  # package: left-pad@1.0.0",
      "  # reason: never reached",
      "  # expires: 2027-01-01",
      "  - vulnerability: CVE-2026-0001",
      "",
    ]
      .join("\n"));
    expect(run(["preview", ...ignore]).out.notes?.join("")).toContain(
      "already ignored",
    );
    expect(
      run(["preview", "grype", "remove-ignore", "--id", "CVE-1999-0001"])
        .out
        .error,
    )
      .toContain("ignores no");
    apply(["grype", "remove-ignore", "--id", "CVE-2026-0001"]);
    expect(read(".config/grype.yaml")).toBe(
      asset("grype", ".config/grype.yaml"),
    );
  });

  it("puts a pack's ignore in its block, and remove takes the block", () => {
    apply(["all"]);
    apply([...ignore, "--for", "p"]);
    expect(read(".config/grype.yaml")).toMatch(
      /ignore:\n {2}# >>> p\n(.*\n){5} {2}# <<< p\n/,
    );
    apply(["grype", "remove", "--for", "p"]);
    expect(read(".config/grype.yaml")).toBe(
      asset("grype", ".config/grype.yaml"),
    );
  });
});

describe("the migration from the retired gate packs", () => {
  const old = JSON.parse(
    readFileSync(join(fixtures, "old.json"), "utf8"),
  ) as Record<string, string>;

  function oldRepo() {
    for (const [p, text] of Object.entries(old)) {
      write(p, text);
    }
    const tool = (p: string) =>
      p.includes("dprint") || p.includes("taplo")
        ? "dprint"
        : p.includes("gitleaks")
        ? "gitleaks"
        : p.includes("grype")
        ? "grype"
        : "pre-commit";
    const entries = Object.entries(old).map(([p, text]) => {
      const source = p.startsWith(".config/pre-commit.d/")
        ? "pack/package-manager/uv@1.0.0"
        : `pack/toolchain-gate/${tool(p)}@1.1.0`;
      // the grype skill was edited since it was landed
      const hash = p.includes("skills/grype") ? "0".repeat(64) : sha(text);
      return `  - path: "${p}"\n    source: ${source}\n    hash: ${hash}\n`;
    });
    write(LOCK, `entries:\n${entries.join("")}`);
  }

  it("brings every file onto the layout as rows — writes, target removals, renames — and lands the golden tree", () => {
    oldRepo();
    const rows = rowsOf(["all"]);
    const gate = rows.filter(r =>
      GATES.includes(String(r["path"]))
      || String(r["path"]).startsWith(".claude/skills/")
      || String(r["path"]).startsWith(".config/pre-commit.d/")
    );
    expect(gate.filter(r => r.kind !== "create").map(r => [r.kind, r["path"]]))
      .toEqual([
        ["write", ".config/dprint.json"],
        ["write", ".config/taplo.toml"],
        ["delete", ".claude/skills/dprint/SKILL.md"],
        ["write", HOOKS],
        // the convention already reads as the layout: only its record moves
        ["write", ".config/linter.yaml"],
        ["delete", ".config/pre-commit.d/uv.yaml"],
        ["write", ".config/gitleaks.toml"],
        ["write", ".config/grype.yaml"],
        ["migrate", ".config/dprint.json"],
        ["migrate", ".config/taplo.toml"],
        ["migrate", HOOKS],
        ["rename", CONVENTION],
        ["rename", CONVENTION],
        ["migrate", ".config/gitleaks.toml"],
      ]);
    const chore = rows.find(r => r["type"] === "chore");
    expect(chore?.["proposed"]).toBe("ops");
    expect(chore?.answers[0]).toBe("rename-ops");
    const hotfix = rows.find(r => r["type"] === "hotfix");
    expect(hotfix?.["proposed"]).toBeNull();
    const { out } = apply(
      ["all"],
      r => (r["type"] === "hotfix" ? "keep-existing" : r.answers[0] ?? "ok"),
    );
    expect(out.notes?.join("\n")).toContain(
      ".claude/skills/grype/SKILL.md kept",
    );
    golden("migrated", gates());
    const lock = read(LOCK);
    for (const p of GATES) {
      expect(lock, p).toMatch(
        new RegExp(
          `path: "?${p.replaceAll(".", "\\.")}"?\\n\\s+source: tool-config/`,
        ),
      );
    }
    expect(existsSync(path(".config/pre-commit.d/uv.yaml"))).toBe(false);
    expect(existsSync(path(".claude/skills/grype/SKILL.md"))).toBe(true);
    // the fragment's markers became the uv block, the person's own repo kept, target gone everywhere
    expect(read(HOOKS)).toContain("  # >>> uv\n  - repo: local\n");
    expect(read(HOOKS)).toContain(
      "  - repo: https://github.com/acme/team-hooks\n",
    );
    expect(read(HOOKS)).not.toContain("Fragments from");
    expect(read(HOOKS)).not.toContain("pre-commit.d");
    for (const p of GATES) {
      expect(read(p), p).not.toMatch(/target\//);
    }
    // a kept type still asks; nothing else does
    expect(rowsOf(["all"]).map(r => [r.kind, r["type"]])).toEqual([[
      "rename",
      "hotfix",
    ]]);
    expect(run(["check"]).out.rows).toEqual([]);
  });

  it("keeps a base plugin at the version the file pins, and the pack's keys as the person's", () => {
    oldRepo();
    apply(["all"]);
    const c = JSON.parse(read(".config/dprint.json")) as {
      plugins: string[];
      dockerfile?: unknown;
    };
    expect(c.plugins).toContain(
      "https://plugins.dprint.dev/markdown-0.21.0.wasm",
    );
    expect(c.plugins.at(-2)).toBe(
      "https://plugins.dprint.dev/dockerfile-0.4.0.wasm",
    );
    expect(c.dockerfile).toEqual({ lineWidth: 80 });
  });

  it.each([
    [
      "a non-verbose exclude",
      (t: string) => t.replace(/exclude: \|-\n {2}\(\?x\)\n/, "exclude: |-\n"),
    ],
    [
      "a single-line exclude",
      (t: string) =>
        t.replace(/exclude: \|-\n( {2}.*\n)+/, "exclude: ^(build|dist)/\n"),
    ],
    [
      "a multi-group alternative",
      (t: string) => t.replace("(^|/)build/|", "(^|/)(build|out)/|"),
    ],
    [
      "an unrecognised marker",
      (t: string) =>
        t.replace(
          "# >>> pre-commit.d/uv.yaml",
          "# >>> pre-commit.d/Uv Hooks.yaml",
        ),
    ],
  ])("hands %s back as a needs-edit row and deletes no fragment", (_, edit) => {
    oldRepo();
    write(HOOKS, edit(read(HOOKS)));
    const rows = rowsOf(["all"]);
    const unread = rows.filter(r =>
      String(r["reason"]).startsWith("cannot read")
    );
    expect(unread.map(r => r["file"])).toEqual([HOOKS]);
    expect(rows.some(r => r["path"] === ".config/pre-commit.d/uv.yaml")).toBe(
      false,
    );
  });
});

describe("an overwrite replayed after a later write", () => {
  it("is refused, never clobbering what a later call in the batch wrote", () => {
    apply(["all"]);
    const batch = pack("p", [
      "{ tool: pre-commit, verb: add-hook, repo: local, id: format, stage: pre-commit, name: Mine, entry: mise x -- mise run mine, language: system }",
      "{ tool: all, verb: add-exclude, paths: [node_modules] }",
    ]);
    const rows = rowsOf(batch);
    expect(rows.find(r => r.kind === "conflict")?.["hook"]).toBe("format");
    const before = read(HOOKS);
    const { status, out } = run([
      ...batch,
      "--answers",
      rows
        .map(r =>
          `${r.id}:${r.kind === "conflict" ? "overwrite" : r.answers[0]}`
        )
        .join(","),
    ]);
    expect(status).toBe(2);
    expect(out.error).toContain("changed since");
    expect(read(HOOKS)).toBe(before);
  });
});

describe("G9 review round 1", () => {
  const { yamlQuote, yamlScalar } = lists as unknown as {
    yamlQuote: (v: string) => string;
    yamlScalar: (v: string) => string;
  };
  const LS = String.fromCharCode(0x2028);
  const NEL = String.fromCharCode(0x85);

  it("never writes a line-breaking character raw into a YAML value", () => {
    for (const v of [`a${LS}b`, `a${NEL}b`, "a\u007fb", "a\nb"]) {
      const out = yamlScalar(v);
      expect(out, JSON.stringify(v)).toMatch(/^"[\x20-\x7e]*"$/);
      expect(
        JSON.parse(
          out.replace(/\\u(2028|0085|007f)/g, m => JSON.parse(`"${m}"`)),
        ),
      )
        .toBe(v);
    }
    expect(yamlQuote(`x${LS}`)).toBe("\"x\\u2028\"");
    expect(yamlScalar("mise x -- uv lock --check")).toBe(
      "mise x -- uv lock --check",
    );
    expect(yamlScalar("café")).toBe("\"café\"");
  });

  it("keeps a grype reason or package from ending its comment line", () => {
    apply(["all"]);
    const ignore = [
      "grype",
      "add-ignore",
      "--id",
      "CVE-2026-0002",
      "--reason",
      "fine",
      "--expires",
      "2027-01-01",
    ];
    expect(
      run([
        "preview",
        ...ignore,
        "--package",
        "a@1",
        "--reason",
        `x${LS}- vulnerability: GHSA-x`,
      ])
        .status,
    )
      .toBe(2);
    apply([...ignore, "--package", `left${NEL}pad@1.0.0`]);
    const text = read(".config/grype.yaml");
    expect(text).toContain("  # package: \"left\\u0085pad@1.0.0\"\n");
    expect(text).not.toContain(NEL);
    expect(text.match(/- vulnerability:/g)).toHaveLength(1);
  });

  it("renames a type by its whole token, never a longer word that starts with it", () => {
    apply(["all", "--scopes", "ci-runner,docs-site"]);
    write(
      CONVENTION,
      read(CONVENTION).replace(
        "    - wip # work",
        "    - ci\n    - doc\n    - wip # work",
      ),
    );
    apply(
      ["all"],
      r => (r["type"] === "ci"
        ? "rename-ops"
        : r["type"] === "doc"
        ? "rename-docs"
        : r.answers[0] ?? "ok"),
    );
    const text = read(CONVENTION);
    expect(text).not.toMatch(/^\s+- (ci|doc)$/m);
    expect(text).toMatch(/^\s+- ci-runner$/m);
    expect(text).toMatch(/^\s+- docs-site$/m);
    expect(text).toMatch(/^\s+- docs # prose/m);
  });

  it("carries the person's gitleaks rules and allowlist keys, on every all and through the migration", () => {
    apply(["all"]);
    const rule =
      "\n[[rules]]\ndescription = \"acme key\"\nid = \"acme-key\"\nregex = '''acme_[A-Za-z0-9]{20,}'''\n";
    const p = ".config/gitleaks.toml";
    write(
      p,
      read(p).replace(
        "  # <<< gitleaks\n]\n",
        "  # <<< gitleaks\n]\nregexes = [ '''^fixture-''' ]\n",
      )
        + rule,
    );
    expect(rowsOf(["all"])).toEqual([]);
    expect(run(["check"]).out.rows).toEqual([]);
    rmSync(path(LOCK));
    write(
      LOCK,
      `entries:\n  - path: "${p}"\n    source: pack/toolchain-gate/gitleaks@1.1.0\n    hash: ${
        sha(read(p))
      }\n`,
    );
    const before = read(p);
    apply(["all"]);
    expect(read(p)).toContain("[[rules]]\ndescription = \"acme key\"");
    expect(read(p)).toContain("regexes = [ '''^fixture-''' ]");
    expect(read(p).length).toBeGreaterThanOrEqual(before.length - 1);
  });

  it("names the old file's lines a migration does not carry, in a needs-edit row", () => {
    const old = JSON.parse(
      readFileSync(join(fixtures, "old.json"), "utf8"),
    ) as Record<string, string>;
    for (const [p, text] of Object.entries(old)) {
      write(p, text);
    }
    write(
      LOCK,
      `entries:\n${
        Object
          .entries(old)
          .map(([p, t]) =>
            `  - path: "${p}"\n    source: pack/toolchain-gate/pre-commit@1.1.0\n    hash: ${
              sha(t)
            }\n`
          )
          .join("")
      }`,
    );
    const rows = rowsOf(["all"]).filter(r =>
      r.kind === "needs-edit" && r["file"] === HOOKS
    );
    expect(rows.map(r => r["target"])).toEqual([["name: Format"]]);
  });

  it("writes a rev bump, and moves a hook between repos without leaving the old one", () => {
    apply(["all"]);
    const hook = (
      repo: string,
      rev: string,
    ) => [
      "pre-commit",
      "add-hook",
      "--repo",
      repo,
      "--id",
      "x-check",
      "--stage",
      "pre-commit",
      "--rev",
      rev,
      "--for",
      "p",
    ];
    apply(hook("https://github.com/a/hooks", "v1.0.0"));
    expect(rowsOf(hook("https://github.com/a/hooks", "v1.0.0"))).toEqual([]);
    apply(hook("https://github.com/a/hooks", "v1.1.0"));
    expect(read(HOOKS)).toContain("    rev: v1.1.0\n");
    apply(hook("https://github.com/b/hooks", "v2.0.0"));
    expect(read(HOOKS).match(/- id: x-check$/gm)).toHaveLength(1);
    expect(read(HOOKS)).not.toContain("github.com/a/hooks");
    expect(read(HOOKS)).toContain(
      "  - repo: https://github.com/b/hooks\n    rev: v2.0.0\n",
    );
  });

  it("deletes only the fragments the hook config merged", () => {
    write(".config/pre-commit.d/stray.yaml", "repos: []\n");
    apply(["all"]);
    expect(existsSync(path(".config/pre-commit.d/stray.yaml"))).toBe(true);
  });

  it("removes an ignore's own keys with it, and writes a linter file glob without a trailing /", () => {
    apply(["all"]);
    const g = ".config/grype.yaml";
    write(
      g,
      read(g).replace(
        "ignore: []",
        "ignore:\n  # why\n  - vulnerability: CVE-2026-0003\n    fix-state: not-fixed",
      ),
    );
    apply(["grype", "remove-ignore", "--id", "CVE-2026-0003"]);
    expect(read(g)).toBe(asset("grype", g));
    apply([
      "pre-commit",
      "add-linter-ignore",
      "--paths",
      "*.gen.ts,Derived/",
      "--for",
      "p",
    ]);
    expect(read(".config/linter.yaml")).toContain(
      "  - \"**/*.gen.ts\"\n  - \"**/Derived/\"\n",
    );
  });
});

describe("drift and the files tool-config never recorded", () => {
  it("raises drift for a hand-edited base, and check reports it", () => {
    apply(["all"]);
    write(
      ".config/grype.yaml",
      read(".config/grype.yaml").replace("medium", "high"),
    );
    expect(rowsOf(["all"]).map(r => [r.kind, r["path"]])).toEqual([[
      "drift",
      ".config/grype.yaml",
    ]]);
    expect(run(["check"]).out.rows?.map(r => [r.kind, r["path"]])).toEqual([[
      "drift",
      ".config/grype.yaml",
    ]]);
    apply(["all"], () => "take-theirs");
    expect(read(".config/grype.yaml")).toBe(
      asset("grype", ".config/grype.yaml"),
    );
  });

  it("raises drift for a re-nested YAML key, whose words are unchanged", () => {
    apply(["all"]);
    write(
      CONVENTION,
      read(CONVENTION).replace(
        "  releaseTagGlobPattern: \"*\"",
        "releaseTagGlobPattern: \"*\"",
      ),
    );
    expect(rowsOf(["all"]).map(r => [r.kind, r["path"]])).toEqual([[
      "drift",
      CONVENTION,
    ]]);
    expect(run(["check"]).out.rows?.map(r => [r.kind, r["path"]])).toEqual([[
      "drift",
      CONVENTION,
    ]]);
  });

  it("raises no row for a YAML quote-style rewrite", () => {
    apply(["all"]);
    write(HOOKS, read(HOOKS).replace("files: '(^|/)-'", "files: \"(^|/)-\""));
    expect(rowsOf(["all"])).toEqual([]);
    expect(run(["check"]).out.rows).toEqual([]);
  });

  it("replaces a file nobody edited since it was landed as a write, never drift", () => {
    apply(["all"]);
    const p = ".config/gitleaks.toml";
    write(
      p,
      read(p).replace(
        "useDefault = true\n",
        "useDefault = true\n# an older asset's line\n",
      ),
    );
    write(
      LOCK,
      read(LOCK).replace(
        new RegExp(
          `(path: "${
            p.replaceAll(".", "\\.")
          }"\\n\\s+source: [^\\n]+\\n\\s+hash: )[0-9a-f]+`,
        ),
        `$1${sha(read(p))}`,
      ),
    );
    expect(rowsOf(["all"]).map(r => [r.kind, r["path"]])).toEqual([[
      "write",
      p,
    ]]);
  });

  it("raises a conflict row for a gate file stackgen never recorded, and keeps the person's lines on overwrite", () => {
    write(
      ".config/linter.yaml",
      "---\nversion: 1\n\nignores:\n  - \"**/vendor/\"\n",
    );
    const rows = rowsOf(["all"]).filter(r =>
      r["path"] === ".config/linter.yaml"
    );
    expect(rows.map(r => r.kind)).toEqual(["conflict"]);
    apply(
      ["all"],
      r => (r.kind === "conflict" ? "overwrite" : r.answers[0] ?? "ok"),
    );
    expect(read(".config/linter.yaml")).toContain(
      "  # <<< pre-commit\n  - \"**/vendor/\"\n",
    );
  });

  it("hands a dprint.json that is not strict JSON back as a needs-edit row", () => {
    write(".config/dprint.json", "{\n  // a comment\n}\n");
    const rows = rowsOf(["all"]).filter(r =>
      r["file"] === ".config/dprint.json"
    );
    expect(rows.map(r => r.kind)).toEqual(["needs-edit"]);
  });
});
