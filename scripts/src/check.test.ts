import {
  chmodSync,
  mkdirSync,
  mkdtempSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  describe,
  expect,
  it,
} from "vitest";
// Plain zero-dependency `.mjs` modules with no declaration file beside them,
// so the exports used here are typed by hand below.
// @ts-expect-error TS7016 — no declaration file for a shipped .mjs module
import * as toolConfigCli from "../../plugins/stackgen/skills/tool-config/scripts/lib/cli.mjs";
// @ts-expect-error TS7016 — no declaration file for a shipped .mjs module
import * as toolConfigRender from "../../plugins/stackgen/skills/tool-config/scripts/lib/render.mjs";
import {
  check,
  prescribes,
  resolveRootRef,
  TEMPLATE_GLOBAL_NAMES,
} from "./check.ts";
import type { Finding } from "./check.ts";

const repoRoot = join(import.meta.dirname, "..", "..");

describe("check", () => {
  it("finds nothing wrong with the committed tree", () => {
    // The whole-corpus regression gate. Printed in full on failure, because a
    // bare count tells you nothing about which invariant broke.
    expect(check(repoRoot)).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// The failure directions, against a throwaway tree
// ---------------------------------------------------------------------------

/**
 * A fixture is a whole `plugins/` tree.
 *
 * The predecessor could only unit-test its pure helpers: `check` took a parsed
 * workspace and rendering it needed the renderer, so every rule that touched
 * disk was covered by the corpus assertion alone — which proves the rules pass
 * on a clean tree and says nothing about whether they would fire on a dirty one.
 * A checker that never fires is indistinguishable from one that was deleted, so
 * each rule below is pinned in the direction that matters.
 */
interface Fixture {
  readonly manifest?: Record<string, unknown>;
  /** Files under the plugin root, by relative path. */
  readonly files?: Record<string, string>;
  /** Relative paths to mark executable. */
  readonly executable?: readonly string[];
}

function tree(plugins: Record<string, Fixture>): string {
  const root = mkdtempSync(join(tmpdir(), "ai-plugins-check-"));

  for (const [dir, fixture] of Object.entries(plugins)) {
    const pluginRoot = join(root, "plugins", dir);
    write(
      join(pluginRoot, ".claude-plugin", "plugin.json"),
      JSON.stringify(
        fixture.manifest ?? {
          name: dir,
          version: "1.0.0",
          description: `the ${dir} plugin`,
        },
        null,
        2,
      ),
    );
    for (const [path, contents] of Object.entries(fixture.files ?? {})) {
      write(join(pluginRoot, path), contents);
    }
    for (const path of fixture.executable ?? []) {
      chmodSync(join(pluginRoot, path), 0o755);
    }
  }

  return root;
}

function write(absolute: string, contents: string): void {
  mkdirSync(join(absolute, ".."), { recursive: true });
  writeFileSync(absolute, contents);
}

/** A skill with valid frontmatter, so a fixture only states what it is testing. */
function skill(name: string, extra = "", body = "prose"): string {
  return `---\nname: ${name}\ndescription: does something\n${extra}---\n\n${body}\n`;
}

const messages = (findings: readonly Finding[]) => findings.map(f => f.message);

const { RESERVED_SLUGS } = toolConfigCli as {
  RESERVED_SLUGS: readonly string[];
};
const { SUBTASK_DIRS, valueNames } = toolConfigRender as {
  SUBTASK_DIRS: Readonly<Record<string, string>>;
  valueNames: (values: Record<string, unknown>) => Record<string, unknown>;
};

describe("the manifest", () => {
  it("flags a name that disagrees with the directory", () => {
    // The directory is what the marketplace `source` points at; the name is what
    // dependency lists use. A disagreement installs a plugin nothing refers to.
    const root = tree({
      alpha: { manifest: { name: "beta", version: "1.0.0", description: "x" } },
    });
    expect(messages(check(root))).toEqual([
      "plugin.json name \"beta\" != directory \"alpha\"",
    ]);
  });

  it("flags a missing, non-semver, or build-metadata version", () => {
    // `1.0.0+3` is the staged dev copy's shape (`p:plugins:local`); tracked, it
    // is that local counter leaking into what an install pins to.
    const root = tree({
      alpha: { manifest: { name: "alpha", version: "1.0", description: "x" } },
      beta: { manifest: { name: "beta", description: "x" } },
      gamma: {
        manifest: { name: "gamma", version: "1.0.0+3", description: "x" },
      },
    });
    expect(messages(check(root))).toEqual([
      expect.stringContaining("version \"1.0\" is not plain semver"),
      expect.stringContaining("version undefined is not plain semver"),
      expect.stringContaining("version \"1.0.0+3\" is not plain semver"),
    ]);
  });

  it("flags a version with a 13 or 17 component", () => {
    // Neither integer is ever issued on a version line this repo maintains, so
    // a manifest carrying one as a whole component is refused.
    const root = tree({
      alpha: {
        manifest: { name: "alpha", version: "1.13.0", description: "x" },
      },
      beta: { manifest: { name: "beta", version: "17.0.0", description: "x" } },
      gamma: {
        manifest: { name: "gamma", version: "2.1.17", description: "x" },
      },
    });
    expect(messages(check(root))).toEqual([
      expect.stringContaining("version \"1.13.0\" has a 13 or 17 component"),
      expect.stringContaining("version \"17.0.0\" has a 13 or 17 component"),
      expect.stringContaining("version \"2.1.17\" has a 13 or 17 component"),
    ]);
  });

  it("leaves a version that merely contains the digits alone", () => {
    // Only a whole component counts — the rule is about the integer issued, not
    // about the digits appearing in the string.
    const root = tree({
      alpha: {
        manifest: { name: "alpha", version: "1.130.0", description: "x" },
      },
      beta: {
        manifest: { name: "beta", version: "113.0.0", description: "x" },
      },
      gamma: {
        manifest: { name: "gamma", version: "19.21.0", description: "x" },
      },
    });
    expect(messages(check(root))).toEqual([]);
  });

  it("flags an empty description", () => {
    const root = tree({
      alpha: {
        manifest: { name: "alpha", version: "1.0.0", description: "  " },
      },
    });
    expect(messages(check(root))).toEqual([
      expect.stringContaining("declares no `description`"),
    ]);
  });
});

describe("dependencies", () => {
  it("accepts a dependency on a sibling plugin", () => {
    const root = tree({
      alpha: {
        manifest: {
          name: "alpha",
          version: "1.0.0",
          description: "x",
          dependencies: [{ marketplace: "virajp-plugins", name: "beta" }],
        },
      },
      beta: {},
    });
    expect(check(root)).toEqual([]);
  });

  it("flags a dependency on a plugin that is not here", () => {
    const root = tree({
      alpha: {
        manifest: {
          name: "alpha",
          version: "1.0.0",
          description: "x",
          dependencies: [{ marketplace: "virajp-plugins", name: "gone" }],
        },
      },
    });
    expect(messages(check(root))).toEqual([
      "dependency \"gone\" is not a plugin in this marketplace",
    ]);
  });

  it("flags a dependency pointing at another marketplace", () => {
    // Claude would look in a marketplace the user has very likely not
    // registered, and it is the install of the *parent* that then fails.
    const root = tree({
      alpha: {
        manifest: {
          name: "alpha",
          version: "1.0.0",
          description: "x",
          dependencies: [{ marketplace: "somewhere-else", name: "beta" }],
        },
      },
      beta: {},
    });
    expect(messages(check(root))).toEqual([
      expect.stringContaining("names marketplace \"somewhere-else\""),
    ]);
  });
});

describe("hook scripts", () => {
  const hooks = (command: string) =>
    JSON.stringify({
      hooks: { PreToolUse: [{ hooks: [{ command, type: "command" }] }] },
    });

  it("accepts an executable script and an inline command", () => {
    // vwf's guarded `rtk` hook is inline and names no bundled file, so a rule
    // that demanded a script would flag it on every run.
    const root = tree({
      alpha: {
        files: {
          "hooks/hooks.json": hooks("${CLAUDE_PLUGIN_ROOT}/hooks/run.sh"),
          "hooks/run.sh": "#!/usr/bin/env bash\n",
        },
        executable: ["hooks/run.sh"],
      },
      beta: {
        files: {
          "hooks/hooks.json": hooks("command -v rtk && rtk hook || true"),
        },
      },
    });
    expect(check(root)).toEqual([]);
  });

  it("flags a script that does not exist", () => {
    const root = tree({
      alpha: {
        files: {
          "hooks/hooks.json": hooks("${CLAUDE_PLUGIN_ROOT}/hooks/gone.sh"),
        },
      },
    });
    expect(messages(check(root))).toEqual([
      "PreToolUse hook names a missing script: hooks/gone.sh",
      // The root-reference pass sees the same path. Two rules, two findings:
      // suppressing one would mean a reference in prose to a missing hook script
      // reported nothing at all.
      expect.stringContaining("resolves to nothing"),
    ]);
  });

  it("flags a script that is not executable", () => {
    const root = tree({
      alpha: {
        files: {
          "hooks/hooks.json": hooks("${CLAUDE_PLUGIN_ROOT}/hooks/run.sh"),
          "hooks/run.sh": "#!/usr/bin/env bash\n",
        },
      },
    });
    expect(messages(check(root))).toEqual([
      "PreToolUse hook script is not executable: hooks/run.sh",
    ]);
  });
});

describe("the pack config tier", () => {
  const pack = "stacks/toolchain-manager/mise/config";
  const task = `${pack}/.config/mise/tasks/code/format`;

  it("accepts an executable task, and ignores the rest of the pack", () => {
    // The `config/` tier mirrors the repo root, so a pack ships plenty there
    // that is not a task and has no reason to be executable.
    const root = tree({
      alpha: {
        files: {
          [task]: "#!/usr/bin/env bash\n",
          [`${pack}/wrangler.jsonc`]: "{}\n",
          [`${pack}/_licenses/MIT.txt`]: "MIT\n",
          [`${pack}/.config/dprint.json`]: "{}\n",
          // The three root entries a tool discovers only from the repo root:
          // the dprint shim, the package-manager file, and the forge directory.
          [`${pack}/dprint.json`]: "{ \"extends\": \".config/dprint.json\" }\n",
          [`${pack}/.npmrc`]: "fund=false\n",
          [`${pack}/.github/ISSUE_TEMPLATE/bug.md`]: "---\nname: Bug\n---\n",
        },
        executable: [task],
      },
    });
    expect(messages(check(root))).toEqual([]);
  });

  it("flags a task file that is not executable", () => {
    // mise runs a file-based task directly: without the bit it reports an
    // unknown task, which reads as a pack that never shipped one.
    const root = tree({
      alpha: { files: { [task]: "#!/usr/bin/env bash\n" } },
    });
    expect(messages(check(root))).toEqual([
      `mise task file is not executable: ${task}`,
    ]);
  });

  it("accepts a hook script, and ignores the metadata beside it", () => {
    const root = tree({
      alpha: {
        files: {
          "stacks/package-manager/pnpm/hooks/guard.sh": "#!/usr/bin/env sh\n",
          "stacks/package-manager/pnpm/hooks/hooks.yaml": "hooks: {}\n",
        },
        executable: ["stacks/package-manager/pnpm/hooks/guard.sh"],
      },
    });
    expect(messages(check(root))).toEqual([]);
  });

  it("flags a hook script that is not executable", () => {
    // The materializer copies it to `.claude/hooks/` and settings.json names it
    // as a bare path, so the host execs the file. A hook that cannot run is the
    // quietest fault there is.
    const script = "stacks/package-manager/pnpm/hooks/guard.sh";
    const root = tree({
      alpha: { files: { [script]: "#!/usr/bin/env bash\n" } },
    });
    expect(messages(check(root))).toEqual([
      `hook script is not executable: ${script}`,
    ]);
  });

  it("flags a hook script with no shebang a host can exec", () => {
    // `shellcheck` reads the same line to pick its dialect, so an absent or
    // exotic one means the shell gate checks it as the wrong language.
    const script = "stacks/package-manager/pnpm/hooks/guard.sh";
    const root = tree({
      alpha: {
        files: { [script]: "#!/bin/zsh\necho hi\n" },
        executable: [script],
      },
    });
    expect(messages(check(root))).toEqual([
      expect.stringContaining(`hook script does not start with one of`),
    ]);
  });

  it("flags a task file with no shebang mise can execute", () => {
    // mise execs the file rather than sourcing it, so a missing or exotic
    // interpreter line is an exec-format error at the first `mise run`.
    const root = tree({
      alpha: {
        files: { [task]: "#!/bin/zsh\necho hi\n" },
        executable: [task],
      },
    });
    expect(messages(check(root))).toEqual([
      expect.stringContaining(`does not start with one of`),
    ]);
  });

  it("flags a file the config/ tier root does not allowlist", () => {
    // Everything a tool can be pointed at lives under `.config/`; a pack
    // dropping a config beside it widens the root of every repo it lands in.
    const root = tree({
      alpha: { files: { [`${pack}/.prettierrc`]: "{}\n" } },
    });
    expect(messages(check(root))).toEqual([
      expect.stringContaining("unallowlisted root entry"),
    ]);
  });

  it("flags a root config another deploy tool prefers", () => {
    // `wrangler.jsonc` is on the list because wrangler reads it only from the
    // root; the widening is that one name, not the class of deploy configs.
    const root = tree({
      alpha: { files: { [`${pack}/netlify.toml`]: "[build]\n" } },
    });
    expect(messages(check(root))).toEqual([
      expect.stringContaining("unallowlisted root entry"),
    ]);
  });

  it.each([
    ".gitignore",
    ".gitattributes",
    ".graphifyignore",
    ".editorconfig",
    "renovate.json",
    "CONTRIBUTING.md",
    "SECURITY.md",
    "LICENSE",
  ])("flags %s at the config/ tier root — tool-config's or init's", file => {
    // A pack asks tool-config for its lines in these files, or init writes them.
    const root = tree({ alpha: { files: { [`${pack}/${file}`]: "x\n" } } });
    expect(messages(check(root))).toEqual([
      expect.stringContaining("unallowlisted root entry"),
    ]);
  });

  it("flags a root file vwf owns — CLAUDE.md", () => {
    // `CLAUDE.md` may sit at a shaped root, but `/vwf:setup` writes it. The
    // doctrine's list names it in its second tier; the checker's landable tier
    // does not, so a pack shipping one is refused.
    const root = tree({
      alpha: { files: { [`${pack}/CLAUDE.md`]: "# Repo\n" } },
    });
    expect(messages(check(root))).toEqual([
      expect.stringContaining("unallowlisted root entry"),
    ]);
  });

  it("flags a root file vwf owns — mempalace.yaml", () => {
    // Same tier, same reasoning: the mine reads it at the root and nowhere
    // else, and `/vwf:setup` is what writes it.
    const root = tree({
      alpha: { files: { [`${pack}/mempalace.yaml`]: "wing: alpha\n" } },
    });
    expect(messages(check(root))).toEqual([
      expect.stringContaining("unallowlisted root entry"),
    ]);
  });

  it("flags a directory the config/ tier root does not allowlist", () => {
    // Same rule for a tree: `.config/` and the `_*` staging dirs, nothing else.
    const root = tree({
      alpha: { files: { [`${pack}/scripts/run`]: "#!/usr/bin/env bash\n" } },
    });
    expect(messages(check(root))).toEqual([
      expect.stringContaining("unallowlisted root entry"),
    ]);
  });

  it("flags a CI workflow inside the forge directory", () => {
    // `.github/` is allowlisted so a pack can ship issue templates; the fence is
    // that a pack contributes the task a workflow calls, never the workflow.
    const root = tree({
      alpha: {
        files: { [`${pack}/.github/workflows/ci.yml`]: "on: push\n" },
      },
    });
    expect(messages(check(root))).toEqual([
      expect.stringContaining("ships a CI workflow"),
    ]);
  });

  it("flags whole editor settings at the config/ tier root", () => {
    // A pack never lands editor settings — `.vscode/` is the user's own.
    const root = tree({
      alpha: { files: { [`${pack}/.vscode/settings.json`]: "{}\n" } },
    });
    expect(messages(check(root))).toEqual([
      expect.stringContaining("unallowlisted root entry"),
    ]);
  });

  it("flags a pre-commit.d file in a pack's config/ tier", () => {
    // The hooks are tool-config's universal set; a fragment is merged by
    // nothing.
    const fragment = `${pack}/.config/pre-commit.d/mise.yaml`;
    const root = tree({
      alpha: { files: { [fragment]: "repos:\n  - repo: local\n" } },
    });
    expect(messages(check(root))).toEqual([
      `pack config/ tier ships a pre-commit.d file — the hooks are `
      + "tool-config's universal set, and a pack adds a subtask the `…:all` "
      + `tasks call: ${fragment}`,
    ]);
  });

  // The materializer evaluates `conditional:` against the caller's answers and
  // skips what does not hold — an axis or value it does not recognise is a
  // condition that never holds, and a path matching nothing is a condition
  // guarding no file. Neither reports anything downstream.
  const conditional = (
    entries: string,
    files: Record<string, string> = {},
  ) => ({
    alpha: {
      files: {
        "stacks/toolchain-manager/mise/pack.yaml":
          `name: mise\nconditional:\n${entries}`,
        [`${pack}/.config/wrangler.d/staging.jsonc`]: "{}\n",
        [`${pack}/wrangler.jsonc`]: "{}\n",
        ...files,
      },
    },
  });

  it("accepts a conditional list naming known axes and landed paths", () => {
    const root = tree(conditional(
      "  - path: .config/wrangler.d/*.jsonc\n    when: { forge: github }\n"
        + "  - path: wrangler.jsonc\n    when: { secrets: fnox }\n",
    ));
    expect(messages(check(root))).toEqual([]);
  });

  it("enters dot-directories when resolving a conditional glob", () => {
    // Every landed path runs through `.config/`, and a `**` that stopped at a
    // dot segment would refuse a fragment set that is there. (A leading `**`
    // is quoted because bare it is a YAML alias.)
    const root = tree(conditional(
      "  - path: .config/wrangler.d/*.jsonc\n    when: { forge: github }\n"
        + "  - path: \"**/wrangler.d/*.jsonc\"\n    when: { forge: github }\n"
        + "  - path: \"**/*.jsonc\"\n    when: { forge: github }\n"
        + "  - path: .config/wrangler.d/**\n    when: { forge: github }\n",
    ));
    expect(messages(check(root))).toEqual([]);
  });

  it("flags a secrets condition on none, which names no provider", () => {
    const root = tree(conditional(
      "  - path: wrangler.jsonc\n    when: { secrets: none }\n",
    ));
    expect(messages(check(root))).toEqual([
      expect.stringContaining(
        "`when.secrets` is \"none\", which names no provider",
      ),
    ]);
  });

  it("flags a conditional entry on an axis outside the vocabulary", () => {
    const root = tree(conditional(
      "  - path: wrangler.jsonc\n    when: { ci: github }\n"
        + "  - path: wrangler.jsonc\n    when: { update_bot: renovate }\n",
    ));
    expect(messages(check(root))).toEqual([
      expect.stringContaining(
        "`conditional[0]` (wrangler.jsonc) `when` names axis `ci`, not one of "
          + "forge, secrets",
      ),
      expect.stringContaining("`when` names axis `update_bot`, not one of"),
    ]);
  });

  it("flags a conditional entry whose value the axis never takes", () => {
    const root = tree(conditional(
      "  - path: wrangler.jsonc\n    when: { forge: bitbucket }\n",
    ));
    expect(messages(check(root))).toEqual([
      expect.stringContaining(
        "`when.forge` is \"bitbucket\", not one of github, gitlab",
      ),
    ]);
  });

  it("flags a conditional entry whose path matches nothing", () => {
    const root = tree(conditional(
      "  - path: .github/ISSUE_TEMPLATE/*\n    when: { forge: github }\n",
    ));
    expect(messages(check(root))).toEqual([
      expect.stringContaining(
        "`conditional[0]` (.github/ISSUE_TEMPLATE/*) matches no file under "
          + "the pack's config/ tier",
      ),
    ]);
  });

  it("flags a conditional path that climbs out of the config tier", () => {
    // The glob is matched inside the pack's own tier; a `..` segment or an
    // absolute path reaches files the pack does not land.
    const root = tree(conditional(
      "  - path: ../../../wrangler.jsonc\n    when: { forge: github }\n"
        + "  - path: /etc/wrangler.jsonc\n    when: { forge: github }\n",
    ));
    expect(messages(check(root))).toEqual([
      expect.stringContaining(
        "(../../../wrangler.jsonc) climbs out of what the pack lands",
      ),
      expect.stringContaining("(/etc/wrangler.jsonc) climbs out of"),
    ]);
  });

  it("flags a conditional entry naming two axes at once", () => {
    // Two answers is two entries on the same path, never one map.
    const root = tree(conditional(
      "  - path: wrangler.jsonc\n    when: { forge: github, secrets: fnox }\n",
    ));
    expect(messages(check(root))).toEqual([
      expect.stringContaining("`when` names 2 axes — exactly one of"),
    ]);
  });

  // Doctor runs a probe and reads a lockfile glob as the pack states them — a
  // malformed fact fails in neither.
  const facts = (yaml: string, files: Record<string, string> = {}) => ({
    alpha: {
      files: {
        "stacks/app-framework/swiftui/pack.yaml": `name: SwiftUI\n${yaml}`,
        ...files,
      },
    },
  });
  const binaries = (list: string) =>
    facts(
      `languages:\n  - token: swift\n    facts:\n      binaries: ${list}\n`,
    );
  const confD = "stacks/app-framework/swiftui/config/.config/mise/conf.d";

  it("accepts a binaries list of bare names and probe maps", () => {
    const root = tree(binaries(
      "[ swift, { name: xcodebuild, probe: \"xcodebuild -version\" }, "
        + "{ name: xcrun } ]",
    ));
    expect(messages(check(root))).toEqual([]);
  });

  it("flags a binaries entry that is neither a name nor a probe map", () => {
    const root = tree(binaries(
      "[ \"\", 3, { probe: \"x -v\" }, { name: x, probe: \"\" }, "
        + "{ name: y, version: 1 } ]",
    ));
    expect(messages(check(root))).toEqual([
      expect.stringContaining("`languages[0].facts.binaries`[0] is an empty"),
      expect.stringContaining("[1] is neither a name nor a { name, probe }"),
      expect.stringContaining("[2] declares no `name`"),
      expect.stringContaining("[3] `probe` is not a non-empty string"),
      expect.stringContaining("[4] carries `version` — only `name` and"),
    ]);
  });

  it("accepts a lockfile list of relative paths and globs", () => {
    const root = tree(facts(
      "lockfile:\n  - Package.resolved\n"
        + "  - \"*.xcodeproj/project.xcworkspace/xcshareddata/swiftpm/"
        + "Package.resolved\"\n",
    ));
    expect(messages(check(root))).toEqual([]);
  });

  it("flags an empty lockfile list, and entries that climb out", () => {
    const empty = tree(facts("lockfile: []\n"));
    expect(messages(check(empty))).toEqual([
      expect.stringContaining("`lockfile` is not a non-empty list"),
    ]);
    const root = tree(facts(
      "lockfile:\n  - ../Package.resolved\n  - /Package.resolved\n  - 7\n",
    ));
    expect(messages(check(root))).toEqual([
      expect.stringContaining("`lockfile[0]` (../Package.resolved) climbs out"),
      expect.stringContaining("`lockfile[1]` (/Package.resolved) climbs out"),
      expect.stringContaining("`lockfile[2]` is not a path or glob"),
    ]);
  });

  it("refuses a retired tool-config or machine_env key", () => {
    // Nothing reads either list any more: a pack ships templates and subtasks,
    // and a machine value is a template name filled from `packs.<slug>`.
    const root = tree(facts(
      "tool-config:\n  - git add ignore .venv\n"
        + "machine_env:\n  - { name: X, detect: \"echo 1\", question: X? }\n",
    ));
    expect(messages(check(root))).toEqual([
      "stacks/app-framework/swiftui/pack.yaml: `tool-config:` is retired — a "
      + "pack ships the lines it needs as files in its templates/ tier, which "
      + "tool-config renders, or as a subtask under .config/mise/tasks/",
      "stacks/app-framework/swiftui/pack.yaml: `machine_env:` is retired — a "
      + "machine value is a `values:` entry — name, detect and question — read "
      + "as `@@NAME@@` in the pack's templates/",
    ]);
  });

  it("flags a mise conf.d fragment in a pack's config/ tier", () => {
    // A pack's mise files live in its templates/ tier, which tool-config
    // renders; a copied fragment is a second writer of the same path.
    const root = tree(facts("", {
      [`${confD}/swiftui.toml`]: "[env]\nX = \"1\"\n",
    }));
    expect(messages(check(root))).toEqual([
      `pack config/ tier ships a mise conf.d fragment — a pack's mise files `
      + `live in its templates/ tier, which tool-config renders: `
      + `${confD}/swiftui.toml`,
    ]);
  });

  // A tool is entered into the config, then installed with `mise install`;
  // only a mention that forbids `mise use` — "never"/"bare" before it, or
  // "is never"/"— never" after it — passes, whatever else the line says.
  it("flags every mise use invocation and accepts a mention forbidding it", () => {
    const runs = [
      "Run `mise use node` first.",
      "mise use --global node@22",
      "mise use -E dev node",
      "mise use --pin node",
      "mise use -p .config/mise.toml node",
      "run mise use node, never skip",
    ];
    const forbids = [
      "gets it there first. Never a bare `mise use`. This is *missing*",
      "never added from the workflow with a bare `mise use`: a pin",
      "`mise use` — never; the pin is written into the config.",
      "`mise use` is never run. The prose is static.",
      "and never with a bare `mise use` — never; the config is edited",
      "# Pins are exact versions; never run a bare \"mise use\".",
    ];
    const root = tree({
      alpha: {
        files: {
          "skills/a/SKILL.md": skill(
            "a",
            "",
            [...runs, ...forbids].join("\n"),
          ),
          "skills/a/assets/x/.config/setup.txt": "mise use -g pipx:x\n",
        },
      },
    });
    expect(check(root)).toEqual([
      ...runs.map((_, index) => ({
        scope: `alpha:skills/a/SKILL.md:${index + 6}`,
        message: expect.stringContaining("runs a bare `mise use`"),
      })),
      {
        scope: "alpha:skills/a/assets/x/.config/setup.txt:1",
        message: expect.stringContaining("runs a bare `mise use`"),
      },
    ]);
  });

  // stackgen:tool-config's assets/ and templates/ land whole as a repo root,
  // so they are held to the same bar as a pack's config/ tier.
  const assets = "skills/tool-config/assets";
  const templates = "skills/tool-config/templates";

  it("accepts the git and graphify files at the assets/ root", () => {
    // tool-config writes these at the root, where only a pack is refused them.
    const root = tree({
      stackgen: {
        files: {
          [`${assets}/.gitignore`]: ".DS_Store\n",
          [`${assets}/.gitattributes`]: "* text=auto\n",
          [`${assets}/.graphifyignore`]: "dist/\n",
        },
      },
    });
    expect(messages(check(root))).toEqual([]);
  });

  it("flags a retired renovate config at the assets/ root", () => {
    const root = tree({
      stackgen: { files: { [`${assets}/renovate.json`]: "{}\n" } },
    });
    expect(messages(check(root))).toEqual([
      `tool-config assets/ tree holds an unallowlisted root entry — `
      + `everything else belongs under .config/: ${assets}/renovate.json`,
    ]);
  });

  it("walks an init asset tree as a landed tree", () => {
    // init's hygiene assets land in a repo with no plugin installed.
    const hygiene = "skills/init/assets/hygiene";
    const clean = tree({
      vwf: {
        files: {
          [`${hygiene}/CONTRIBUTING.md`]: "# Contributing\n",
          [`${hygiene}/licenses/MIT.txt`]: "MIT\n",
        },
      },
    });
    expect(messages(check(clean))).toEqual([]);
    const root = tree({
      vwf: {
        files: {
          [`${hygiene}/SECURITY.md`]: "See ${CLAUDE_PLUGIN_ROOT}/x.md\n",
          [`${hygiene}/.github/workflows/ci.yml`]: "on: push\n",
        },
      },
    });
    expect(messages(check(root))).toEqual(
      expect.arrayContaining([
        expect.stringContaining("expands to nothing"),
        expect.stringContaining("ships a CI workflow"),
      ]),
    );
  });

  it("flags an init asset file outside the hygiene allowlist", () => {
    // init writes the hygiene files alone; every tool config is tool-config's.
    const hygiene = "skills/init/assets/hygiene";
    const clean = tree({
      vwf: {
        files: {
          [`${hygiene}/CONTRIBUTING.md`]: "# Contributing\n",
          [`${hygiene}/SECURITY.md`]: "# Security\n",
          [`${hygiene}/licenses/MIT.txt`]: "MIT\n",
          [`${hygiene}/.github/ISSUE_TEMPLATE/bug.md`]: "---\nname: Bug\n---\n",
        },
      },
    });
    expect(messages(check(clean))).toEqual([]);
    const root = tree({
      vwf: {
        files: {
          [`${hygiene}/.editorconfig`]: "root = true\n",
          [`${hygiene}/.github/CODEOWNERS`]: "* @me\n",
        },
      },
    });
    expect(messages(check(root)).sort()).toEqual([
      `init asset tree lands a file outside its allowlist — only `
      + `CONTRIBUTING.md, SECURITY.md, licenses/, .github/ISSUE_TEMPLATE/: `
      + `${hygiene}/.editorconfig`,
      `init asset tree lands a file outside its allowlist — only `
      + `CONTRIBUTING.md, SECURITY.md, licenses/, .github/ISSUE_TEMPLATE/: `
      + `${hygiene}/.github/CODEOWNERS`,
    ]
      .sort());
  });

  it("accepts a pack templates/ tier and a pack with no tool-config list", () => {
    // tool-config renders `templates/` to the same paths `config/` copies to;
    // a pack's mise files live there, so a conf.d fragment is not a finding.
    const dir = "stacks/linter/eslint";
    const task = `${dir}/templates/.config/mise/tasks/code/lint/eslint`;
    const root = tree({
      stackgen: {
        files: {
          [`${dir}/pack.yaml`]: "slug: eslint\nversion: 0.1.0\n",
          [task]: "#!/usr/bin/env bash\neslint @@REPO_NAME@@\n",
          [`${dir}/templates/.config/mise/conf.d/eslint/mise.toml`]:
            "[tools]\n",
        },
        executable: [task],
      },
    });
    expect(messages(check(root))).toEqual([]);
  });

  it("holds a pack templates/ tier to the landed-tree rules", () => {
    const dir = "stacks/linter/eslint/templates";
    const task = `${dir}/.config/mise/tasks/code/lint/eslint`;
    const root = tree({
      stackgen: {
        files: {
          [task]: "#!/usr/bin/env bash\n",
          [`${dir}/.prettierrc`]: "{}\n",
          [`${dir}/.config/x.toml`]: "# ${CLAUDE_PLUGIN_ROOT}/x.md\n",
        },
      },
    });
    expect(messages(check(root))).toEqual(
      expect.arrayContaining([
        `mise task file is not executable: ${task}`,
        expect.stringContaining("unallowlisted root entry"),
        expect.stringContaining("expands to nothing"),
      ]),
    );
  });

  it.each([
    "config/.config/mise/tasks/code/check/uv",
    "config/.config/mise/tasks/code/format/ruff",
    "templates/.config/mise/tasks/setup/deps/install/pnpm",
    "templates/.config/mise/tasks/setup/ai/claude-code",
  ])("flags a subtask not named for its pack: %s", subtask => {
    // A subtask's leaf is its pack's slug, so two packs never write one file.
    const dir = "stacks/linter/eslint";
    const task = `${dir}/${subtask}`;
    const root = tree({
      stackgen: {
        files: { [task]: "#!/usr/bin/env bash\n" },
        executable: [task],
      },
    });
    expect(messages(check(root))).toEqual([
      `pack subtask is not named for its pack — a subtask's leaf is the pack `
      + `slug \`eslint\`: ${task}`,
    ]);
  });

  it.each(["all", "ai", "_base"])("refuses the reserved pack slug %s", slug => {
    // tool-config owns the `…:all` tasks and the conf.d/_base/ and ai/ folders.
    const root = tree({
      stackgen: { files: { [`stacks/linter/${slug}/pack.yaml`]: "name: x\n" } },
    });
    expect(messages(check(root))).toEqual([
      `pack slug \`${slug}\` is reserved — tool-config owns the \`…:all\` `
      + `tasks and the conf.d/_base/ and conf.d/ai/ folders: `
      + `stacks/linter/${slug}`,
    ]);
  });

  it("refuses a pack subtask taking a universal subtask's leaf", () => {
    // The set is read off tool-config's own trees: a pack named `workflows`
    // keeps its slug, but may not ship `code/lint/workflows` beside it.
    const universal = "skills/tool-config/assets/.config/mise/tasks/code/lint/"
      + "workflows";
    const clean = tree({
      stackgen: {
        files: {
          [universal]: "#!/usr/bin/env bash\n",
          "stacks/cloud-service/workflows/pack.yaml": "name: Workflows\n",
        },
        executable: [universal],
      },
    });
    expect(messages(check(clean))).toEqual([]);
    const task = "stacks/cloud-service/workflows/templates/.config/mise/tasks/"
      + "code/check/workflows";
    const root = tree({
      stackgen: {
        files: {
          [universal]: "#!/usr/bin/env bash\n",
          [task]: "#!/usr/bin/env bash\n",
        },
        executable: [universal, task],
      },
    });
    expect(messages(check(root))).toEqual([
      "pack subtask takes the leaf `workflows` of a universal subtask "
      + `tool-config ships — removing the pack would delete it: ${task}`,
    ]);
  });

  it("refuses a pack file over a path tool-config ships, bar a slot", () => {
    // The owned set is read off tool-config's trees: a whole file is
    // tool-config's, a folder there is never a pack's file, and a
    // `#PLACEHOLDER` slot is the one path a pack fills.
    const tc = "skills/tool-config/assets/.config";
    const house = `${tc}/mise/tasks/code/lint/house`;
    const slot = `${tc}/mise/tasks/setup/secrets`;
    const pack = "stacks/capability-provider/fnox/config/.config";
    const overlay = `${pack}/mise/tasks/setup/secrets`;
    const files = {
      [house]: "#!/usr/bin/env bash\n",
      [slot]: "#!/usr/bin/env bash\n#PLACEHOLDER\n",
      [`${tc}/dprint.json`]: "{ \"excludes\": [] }\n",
      [overlay]: "#!/usr/bin/env bash\nfnox\n",
    };
    const executable = [house, slot, overlay];
    expect(messages(check(tree({ stackgen: { files, executable } }))))
      .toEqual([]);
    const lint = `${pack}/mise/tasks/code/lint`;
    const dprint = `${pack}/dprint.json`;
    const root = tree({
      stackgen: {
        files: {
          ...files,
          [lint]: "#!/usr/bin/env bash\n",
          [dprint]: "{}\n",
        },
        executable: [...executable, lint],
      },
    });
    expect(messages(check(root))).toEqual([
      `pack file overwrites .config/dprint.json, which tool-config ships `
      + `whole — only a #PLACEHOLDER slot is a pack's to fill: ${dprint}`,
      `pack file sits where tool-config ships a folder or a file above it — a `
      + `pack adds files beside tool-config's, never over its tree: ${lint}`,
    ]);
  });

  it("reads the template names and reserved slugs off the script", () => {
    // The checker's name set is the script's: every name `valueNames`
    // derives, each `…:all` list `SUBTASK_DIRS` names, and `TASKS`.
    const names = new Set([
      ...Object.keys(
        valueNames({
          REPO_NAME: "r",
          FORGE: "github",
          SECRETS: "fnox",
          REPO_URL: "https://example.com/r",
        }),
      ),
      ...Object.keys(SUBTASK_DIRS),
      "TASKS",
    ]);
    expect([...TEMPLATE_GLOBAL_NAMES].sort()).toEqual([...names].sort());
    const root = tree({
      stackgen: {
        files: Object.fromEntries(
          RESERVED_SLUGS.map(slug => [
            `stacks/linter/${slug}/pack.yaml`,
            "name: x\n",
          ]),
        ),
      },
    });
    expect(messages(check(root))).toHaveLength(RESERVED_SLUGS.length);
  });

  it("refuses a pack conf.d folder not named for its pack", () => {
    const confD = "stacks/package-manager/pnpm/templates/.config/mise/conf.d";
    const clean = tree({
      stackgen: { files: { [`${confD}/pnpm/mise.dev.toml`]: "[tools]\n" } },
    });
    expect(messages(check(clean))).toEqual([]);
    const root = tree({
      stackgen: {
        files: {
          [`${confD}/_base/mise.toml`]: "[tools]\n",
          [`${confD}/ai/mise.dev.toml`]: "[tools]\n",
          [`${confD}/pnpm.toml`]: "[tools]\n",
        },
      },
    });
    expect(messages(check(root)).sort()).toEqual(
      ["_base", "ai", "pnpm.toml"].map(name =>
        `pack templates/ tier writes conf.d/${name} — a pack's mise files sit `
        + `in conf.d/pnpm/ alone: ${confD}/${name}`
      ),
    );
  });

  it("accepts a subtask named for its pack, and a whole-file overlay", () => {
    const dir = "stacks/linter/eslint/config/.config/mise/tasks";
    const tasks = [
      `${dir}/code/lint/eslint`,
      `${dir}/setup/deps/audit/eslint`,
      `${dir}/code/format`,
    ];
    const root = tree({
      stackgen: {
        files: Object.fromEntries(
          tasks.map(task => [task, "#!/usr/bin/env bash\n"]),
        ),
        executable: tasks,
      },
    });
    expect(messages(check(root))).toEqual([]);
  });

  it("walks a tool-config asset tree as a landed tree", () => {
    const task = `${assets}/.config/mise/tasks/code/graph`;
    const clean = tree({
      stackgen: {
        files: {
          [task]: "#!/usr/bin/env bash\n",
          [`${assets}/.config/mise/conf.d/_base/mise.toml`]: "[tools]\n",
        },
        executable: [task],
      },
    });
    expect(messages(check(clean))).toEqual([]);
    const root = tree({
      stackgen: {
        files: {
          [task]: "#!/bin/zsh\n# see ${CLAUDE_PLUGIN_ROOT}/assets/x.md\n",
          [`${assets}/.prettierrc`]: "{}\n",
        },
      },
    });
    expect(messages(check(root))).toEqual([
      `mise task file is not executable: ${task}`,
      expect.stringContaining("does not start with one of"),
      expect.stringContaining("unallowlisted root entry"),
      expect.stringContaining("expands to nothing"),
    ]);
  });

  it("accepts the repo-local mise skill, held to the landed rules", () => {
    const landed = `${templates}/.claude/skills/mise/SKILL.md`;
    const clean = tree({ stackgen: { files: { [landed]: skill("mise") } } });
    expect(messages(check(clean))).toEqual([]);
    const root = tree({
      stackgen: {
        files: {
          [landed]: "---\nname: mise\ndescription: a: b\n---\n\n"
            + "See ${CLAUDE_PLUGIN_ROOT}/x.md\n",
        },
      },
    });
    expect(messages(check(root))).toEqual([
      expect.stringContaining(`${landed}: frontmatter is not valid YAML`),
      expect.stringContaining("expands to nothing"),
    ]);
  });

  it("walks a flat tool-config assets/ and templates/ tree as the repo root", () => {
    // assets/ and templates/ are one landed tree each, allowed the git and
    // graphify root files plus `.claude/` and `.vscode/`.
    const flat = "skills/tool-config/assets";
    const templates = "skills/tool-config/templates";
    const task = `${flat}/.config/mise/tasks/code/graph`;
    const guarded = `${templates}/.config/mise/tasks/setup/external/pull`;
    const clean = tree({
      stackgen: {
        files: {
          [task]: "#!/usr/bin/env bash\n",
          [guarded]: "@@#if EXTERNAL@@\n#!/usr/bin/env bash\n@@/if@@\n",
          [`${flat}/.gitignore`]: "node_modules/\n",
          [`${flat}/.graphifyignore`]: "dist/\n",
          [`${flat}/dprint.json`]: "{ \"extends\": \".config/dprint.json\" }\n",
          [`${flat}/.vscode/settings.json`]: "{}\n",
          [`${templates}/.claude/skills/mise/SKILL.md`]: skill("mise"),
        },
        executable: [task, guarded],
      },
    });
    expect(messages(check(clean))).toEqual([]);
    const root = tree({
      stackgen: {
        files: {
          [`${flat}/.config/x.toml`]: "[x]\n",
          [`${templates}/.prettierrc`]: "{}\n",
          [`${templates}/.config/y.toml`]: "# ${CLAUDE_PLUGIN_ROOT}/x.md\n",
        },
      },
    });
    expect(messages(check(root))).toEqual(
      expect.arrayContaining([
        expect.stringContaining("unallowlisted root entry"),
        expect.stringContaining("expands to nothing"),
      ]),
    );
  });

  it("flags any other file under .claude/ in a tool-config tree", () => {
    // Only the mise skill lands under `.claude/`.
    const root = tree({
      stackgen: {
        files: {
          [`${templates}/.claude/skills/other/SKILL.md`]: skill("other"),
        },
      },
    });
    expect(messages(check(root))).toEqual([
      "tool-config templates/ tree lands an unallowlisted file under .claude/ "
      + "— only .claude/skills/mise/SKILL.md: "
      + `${templates}/.claude/skills/other/SKILL.md`,
    ]);
  });

  it("holds tool-config's templates to the stored and derived names", () => {
    // No pack keys are in scope there, so any other name renders as missing.
    const file = `${templates}/.config/claude-status.json`;
    const clean = tree({
      stackgen: {
        files: {
          [file]: "{ \"projectName\": \"@@PROJECT_NAME@@\" }\n"
            + "@@#each MEMBER_ENTRIES@@@@.slug@@ @@.@@@@/each@@\n"
            + "@@#if NODE@@x@@#else@@y@@/if@@\n",
        },
      },
    });
    expect(messages(check(clean))).toEqual([]);
    const root = tree({
      stackgen: {
        files: { [file]: "@@#if NODE@@\n@@XCODE_VERSION@@\n@@/if@@\n" },
      },
    });
    expect(messages(check(root))).toEqual([
      `${file}:2: \`@@XCODE_VERSION@@\` names XCODE_VERSION, which is not a `
      + "template name — tool-config's templates read the stored and derived "
      + "names alone",
    ]);
  });

  it("reads a pack template's own names, and refuses a malformed tag", () => {
    // A pack's own name is upper snake case; anything the engine cannot read
    // lands verbatim in the rendered file.
    const file = "stacks/app-framework/swiftui/templates/.config/mise/conf.d/"
      + "swiftui/mise.toml";
    const clean = tree({
      stackgen: {
        files: {
          "stacks/app-framework/swiftui/pack.yaml": "values:\n"
            + "  - { name: XCODE_VERSION, detect: \"xcodebuild -version\", "
            + "question: Which Xcode? }\n",
          [file]: "[env]\nXCODE_VERSION = \"@@XCODE_VERSION@@\"\n"
            + "REPO = \"@@REPO_NAME@@\"\n",
        },
      },
    });
    expect(messages(check(clean))).toEqual([]);
    const root = tree({
      stackgen: {
        files: {
          [file]: "[env]\nXCODE_VERSION = \"@@xcode_version@@\"\n"
            + "@@#unless NODE@@\n",
        },
      },
    });
    expect(messages(check(root))).toEqual([
      `${file}:2: \`@@xcode_version@@\` is not a template tag — a name is `
      + "upper snake case, read as @@NAME@@, @@#if NAME@@ or @@#each NAME@@",
      `${file}:3: \`@@#unless NODE@@\` is not a template tag — a name is `
      + "upper snake case, read as @@NAME@@, @@#if NAME@@ or @@#each NAME@@",
    ]);
  });

  describe("a pack's values list", () => {
    const yaml = "stacks/app-framework/swiftui/pack.yaml";
    const file = "stacks/app-framework/swiftui/templates/.config/mise/conf.d/"
      + "swiftui/mise.toml";
    const pack = (values: string, template: string) =>
      tree({
        stackgen: {
          files: { [yaml]: `slug: swiftui\n${values}`, [file]: template },
        },
      });

    it("accepts each declared name read in the templates", () => {
      const root = pack(
        "values:\n"
          + "  - name: XCODE_VERSION\n"
          + "    detect: xcodebuild -version | head -1\n"
          + "    question: Which Xcode version?\n"
          + "  - name: SIMULATOR_OS\n"
          + "    detect: xcrun simctl list runtimes\n"
          + "    question: Which simulator OS?\n",
        "[env]\nX = \"@@XCODE_VERSION@@\"\n"
          + "@@#if SIMULATOR_OS@@\nY = \"@@SIMULATOR_OS@@\"\n@@/if@@\n",
      );
      expect(messages(check(root))).toEqual([]);
    });

    it("flags each malformed entry by its line", () => {
      const root = pack(
        "values:\n"
          + "  - XCODE_VERSION\n"
          + "  - { name: xcode, detect: x, question: y }\n"
          + "  - { name: REPO_NAME, detect: x, question: y }\n"
          + "  - { name: A, detect: \"\", question: y, default: z }\n"
          + "  - { detect: x }\n",
        "@@A@@\n",
      );
      expect(messages(check(root))).toEqual([
        `${yaml}:3: \`values[0]\` is not a { name, detect, question } map`,
        `${yaml}:4: \`values[1]\` \`name\` (xcode) is not upper snake case`,
        `${yaml}:5: \`values[2]\` \`name\` (REPO_NAME) is a global template `
        + "name — tool-config fills it, not the pack",
        `${yaml}:6: \`values[3]\` carries \`default\` — only \`name\`, `
        + "`detect` and `question`",
        `${yaml}:6: \`values[3]\` \`detect\` is not a non-empty string`,
        `${yaml}:7: \`values[4]\` \`name\` is not a non-empty string`,
        `${yaml}:7: \`values[4]\` \`question\` is not a non-empty string`,
      ]);
    });

    it("flags a values key that is not a list", () => {
      const root = pack("values: XCODE_VERSION\n", "[env]\n");
      expect(messages(check(root))).toEqual([
        `${yaml}:2: \`values:\` is not a list of { name, detect, question } `
        + "maps",
      ]);
    });

    it("flags a declared name no template reads", () => {
      const root = pack(
        "values:\n  - { name: SIMULATOR_OS, detect: x, question: y }\n",
        "[env]\n",
      );
      expect(messages(check(root))).toEqual([
        `${yaml}:3: \`values:\` declares SIMULATOR_OS, which no file in the `
        + "pack's templates/ reads as @@SIMULATOR_OS@@",
      ]);
    });

    it("flags a template name the pack does not declare", () => {
      const root = pack("", "[env]\nX = \"@@XCODE_VERSION@@\"\n");
      expect(messages(check(root))).toEqual([
        `${file}:2: \`@@XCODE_VERSION@@\` names XCODE_VERSION, which is `
        + "neither a global template name nor declared in the pack's "
        + "`values:`",
      ]);
    });
  });
});

describe("skill scripts", () => {
  const scripts = "skills/tool-config/scripts";

  it("accepts a shebanged executable entry and its lib modules", () => {
    const root = tree({
      stackgen: {
        files: {
          [`${scripts}/run.mjs`]: "#!/usr/bin/env node\n"
            + "import { join } from \"node:path\";\n"
            + "import {\n  x,\n} from \"./lib/x.mjs\";\n"
            + "const m = await import(\"../y.mjs\");\n",
          [`${scripts}/lib/x.mjs`]: "export const x = 1;\n",
        },
        executable: [`${scripts}/run.mjs`],
      },
    });
    expect(messages(check(root))).toEqual([]);
  });

  it("flags an entry missing its shebang or its exec bit", () => {
    const root = tree({
      stackgen: { files: { [`${scripts}/run.mjs`]: "// no shebang\n" } },
    });
    expect(messages(check(root))).toEqual([
      "skill script entry does not start with #!/usr/bin/env node",
      "skill script entry is not executable",
    ]);
  });

  it("flags a bare import and a require in any script", () => {
    const root = tree({
      stackgen: {
        files: {
          [`${scripts}/lib/x.mjs`]: "import yaml from \"yaml\";\n"
            + "export * from \"lodash/fp\";\n"
            + "const fs = require(\"fs\");\n",
        },
      },
    });
    expect(messages(check(root))).toEqual([
      expect.stringContaining("imports \"yaml\""),
      expect.stringContaining("imports \"lodash/fp\""),
      expect.stringContaining("calls `require(`"),
    ]);
  });
});

describe("frontmatter", () => {
  it("flags frontmatter a strict YAML parser rejects", () => {
    // Claude's parser is lenient and accepts this; a strict host drops the whole
    // skill with no error and no warning, which is the failure this exists for.
    const root = tree({
      alpha: {
        files: {
          "skills/one/SKILL.md":
            "---\nname: one\ndescription: a: b\n---\n\nx\n",
        },
      },
    });
    expect(messages(check(root))).toEqual([
      expect.stringContaining("frontmatter is not valid YAML"),
    ]);
  });

  it("flags a skill with no frontmatter at all", () => {
    const root = tree({
      alpha: { files: { "skills/one/SKILL.md": "# One\n" } },
    });
    expect(messages(check(root))).toEqual([
      expect.stringContaining("no YAML frontmatter"),
    ]);
  });

  it("flags a pack skill's frontmatter, and a pack agent's", () => {
    // The larger half, and the one that had never been parsed: a pack's skills
    // land in a user's repo, where the host reading them is not this one.
    const root = tree({
      stackgen: {
        files: {
          "stacks/language/x/skills/x/SKILL.md":
            "---\nname: x\ndescription: a: b\n---\n\nprose\n",
          "stacks/language/x/agents/x-writer.md":
            "---\nname: x-writer\ndescription: a: b\n---\n\nprose\n",
        },
      },
    });
    expect(messages(check(root))).toEqual([
      expect.stringContaining(
        "stacks/language/x/agents/x-writer.md: frontmatter is not valid YAML",
      ),
      expect.stringContaining(
        "stacks/language/x/skills/x/SKILL.md: frontmatter is not valid YAML",
      ),
    ]);
  });

  it("accepts a valid pack skill, and ignores a pack rule", () => {
    // `rules/*.md` is left out on purpose: frontmatter is optional there, so
    // absence is not a fault and this would be a finding on every one of them.
    const root = tree({
      stackgen: {
        files: {
          "stacks/language/x/skills/x/SKILL.md": skill("x"),
          "stacks/language/x/rules/house-style.md": "# House style\n",
        },
      },
    });
    expect(messages(check(root))).toEqual([]);
  });
});

describe("agent cross-references", () => {
  it("resolves a role-shaped token to a declared agent", () => {
    const root = tree({
      alpha: {
        files: {
          "agents/thing-writer.md": skill("thing-writer"),
          "skills/one/SKILL.md": skill("one", "", "delegate to `thing-writer`"),
        },
      },
    });
    expect(check(root)).toEqual([]);
  });

  it("flags a role-shaped token naming no agent", () => {
    // The rename direction: `-writer` is a known role because another agent
    // holds it, so a token wearing that suffix has to resolve.
    const root = tree({
      alpha: {
        files: {
          "agents/thing-writer.md": skill("thing-writer"),
          "skills/one/SKILL.md": skill(
            "one",
            "",
            "delegate to `thing-writer` then `other-writer`",
          ),
        },
      },
    });
    expect(messages(check(root))).toEqual([
      "reference `other-writer` names no agent under agents/",
    ]);
  });

  it("flags an agent nothing references", () => {
    // The direction the forward rule cannot cover: a rename that takes the last
    // holder of a suffix with it leaves the new name referenced by nothing.
    const root = tree({
      alpha: { files: { "agents/thing-writer.md": skill("thing-writer") } },
    });
    expect(messages(check(root))).toEqual([
      "agent \"thing-writer\" is referenced by no skill or asset",
    ]);
  });

  it("does not count a mention in its own frontmatter as a reference", () => {
    // An agent's `description:` is a folded scalar carrying the same backticked
    // vocabulary the body does. Counting it would make every agent look
    // referenced by its own file, and the orphan direction would never fire.
    const root = tree({
      alpha: {
        files: {
          "agents/thing-writer.md":
            "---\nname: thing-writer\ndescription: the `thing-writer` agent\n---\n\nx\n",
        },
      },
    });
    expect(messages(check(root))).toEqual([
      "agent \"thing-writer\" is referenced by no skill or asset",
    ]);
  });
});

describe("root-relative references", () => {
  it("resolves a file, a directory, and a sibling plugin", () => {
    const root = tree({
      alpha: {
        files: {
          "assets/doc.md": "x",
          "assets/topologies/repo.md": "x",
          "skills/one/SKILL.md": skill(
            "one",
            "",
            "read `${CLAUDE_PLUGIN_ROOT}/assets/doc.md`, then "
              + "`${CLAUDE_PLUGIN_ROOT}/assets/topologies/`, then "
              + "`${CLAUDE_PLUGIN_ROOT}/../beta/assets/other.md`",
          ),
        },
      },
      beta: { files: { "assets/other.md": "x" } },
    });
    expect(check(root)).toEqual([]);
  });

  it("flags a reference that resolves inside the wrong plugin", () => {
    // The false negative the predecessor shipped: with four render trees to
    // satisfy it matched a reference against the TAIL of every emitted path, so
    // `${CLAUDE_PLUGIN_ROOT}/assets/doc.md` in alpha passed on the strength of
    // beta's copy. One tree means one unambiguous resolution.
    const root = tree({
      alpha: {
        files: {
          "skills/one/SKILL.md": skill(
            "one",
            "",
            "read `${CLAUDE_PLUGIN_ROOT}/assets/doc.md`",
          ),
        },
      },
      beta: { files: { "assets/doc.md": "x" } },
    });
    expect(messages(check(root))).toEqual([
      expect.stringContaining("reference to assets/doc.md resolves to nothing"),
    ]);
  });

  it("flags a reference that climbs out of plugins/", () => {
    const root = tree({
      alpha: {
        files: {
          "skills/one/SKILL.md": skill(
            "one",
            "",
            "read `${CLAUDE_PLUGIN_ROOT}/../../readme.md`",
          ),
        },
      },
    });
    expect(messages(check(root))).toEqual([
      expect.stringContaining("climbs out of plugins/"),
    ]);
  });

  it("says nothing about a landed file, which the citation rule owns", () => {
    // Both rules would fire on this line, and two findings for one mistake send
    // the author to two different fixes — one of which (make the path resolve)
    // is the wrong one, since a landed file may not carry the token at all.
    const root = tree({
      stackgen: {
        files: {
          "stacks/language/x/conventions.md":
            "read `${CLAUDE_PLUGIN_ROOT}/assets/nope.md`\n",
        },
      },
    });
    const found = check(root);
    expect(found).toHaveLength(1);
    expect(found[0]?.scope).toBe(
      "stackgen:stacks/language/x/conventions.md:1",
    );
    expect(found[0]?.message).toContain("expands to nothing");
  });
});

describe("landed citations", () => {
  // A pack is copied into a target repo verbatim, and that repo has no plugin
  // installed. Every citation below resolves inside the plugin — which is why
  // the resolving rule is silent about all of them — and none of them resolves
  // once landed, which is the failure with no reader but this one.
  const packs = (files: Record<string, string>, executable?: string[]) => ({
    stackgen: {
      files: {
        "stacks/cloud-provider/cloudflare/pack.yaml": "name: cf\n",
        ...files,
      },
      executable,
    },
  });

  it("flags the token in a skill, a conventions, a bundle and a config file", () => {
    // Form (a) holds for every landed file, not just prose: a shell task under
    // `config/` can spell the token as readily as a skill can, and the dot
    // segments on its way there are why this walks rather than filters.
    const task = "stacks/language/x/config/.config/mise/tasks/x";
    const root = tree(packs(
      {
        "stacks/language/x/skills/x/SKILL.md": skill(
          "x",
          "",
          "read `${CLAUDE_PLUGIN_ROOT}/assets/doc.md`",
        ),
        "stacks/language/x/conventions.md":
          "read `${CLAUDE_PLUGIN_ROOT}/assets/doc.md`\n",
        "stacks/bundles/thing.md": "read `${CLAUDE_PLUGIN_ROOT}`\n",
        [task]:
          "#!/usr/bin/env bash\n# see ${CLAUDE_PLUGIN_ROOT}/assets/x.md\n",
      },
      [task],
    ));
    expect(messages(check(root))).toEqual([
      expect.stringContaining("expands to nothing"),
      expect.stringContaining("expands to nothing"),
      expect.stringContaining("expands to nothing"),
      expect.stringContaining("expands to nothing"),
    ]);
  });

  it("does not flag the token at the plugin root", () => {
    // The plugin's own skills are not landed, and the token is how they are
    // supposed to point at their assets.
    const root = tree({
      stackgen: {
        files: {
          "assets/doc.md": "x",
          "skills/one/SKILL.md": skill(
            "one",
            "",
            "read `${CLAUDE_PLUGIN_ROOT}/assets/doc.md`",
          ),
        },
      },
    });
    expect(messages(check(root))).toEqual([]);
  });

  it("flags a bare assets/ path, once, and leaves a lookalike alone", () => {
    // The lookbehind is what keeps the token form from being counted twice and
    // keeps a word merely ending in `assets` out.
    const root = tree(packs({
      "stacks/language/x/conventions.md":
        "see `assets/contracts/secrets.md`, `${CLAUDE_PLUGIN_ROOT}/assets/x.md`"
        + " and `my-assets/x.md`\n",
    }));
    expect(messages(check(root))).toEqual([
      expect.stringContaining("expands to nothing"),
      expect.stringContaining("cites `assets/contracts/secrets.md`"),
    ]);
  });

  it("flags a climb out of the pack's skills tier, not one within it", () => {
    // A pack's skills land as siblings in `.claude/skills/`, so a link inside
    // one skill's `references/` and a link across to another skill of the same
    // pack both still resolve; the pack's own conventions land elsewhere
    // entirely, so the climb to it does not.
    const root = tree(packs({
      "stacks/language/x/skills/one/SKILL.md": skill(
        "one",
        "",
        "see [d](../two/references/z.md)",
      ),
      "stacks/language/x/skills/one/references/y.md":
        "see [a](../references/z.md), [b](../../two/references/z.md) and"
        + " [c](../../../conventions.md)\n",
      "stacks/language/x/skills/two/SKILL.md": skill("two"),
      "stacks/language/x/skills/two/references/z.md": "z\n",
      "stacks/language/x/skills/one/references/z.md": "z\n",
    }));
    expect(messages(check(root))).toEqual([
      expect.stringContaining("cites `../../../conventions.md`"),
    ]);
  });

  it("flags any climb at all out of a conventions file", () => {
    // It lands as one file under `.claude/stackgen/templates/`, with nothing
    // above it and no tree to move within.
    const root = tree(packs({
      "stacks/language/x/conventions.md": "see [a](../x.md)\n",
    }));
    expect(messages(check(root))).toEqual([
      expect.stringContaining("cites `../x.md`"),
    ]);
  });

  it("flags a path into another pack, and never a bare component ref", () => {
    // `<type>/<slug>` is the lockfile's and a bundle's identifier vocabulary.
    // Only a trailing segment makes it a path — and a path is what breaks,
    // because the sibling lands under its own template name or not at all.
    const root = tree(packs({
      "stacks/bundles/thing.md":
        "pins `cloud-provider/cloudflare` and `cloud-provider/cloudflare@1.0.0`,"
        + " see `cloud-provider/cloudflare/conventions.md`\n",
    }));
    expect(messages(check(root))).toEqual([
      expect.stringContaining(
        "cites a path inside the `cloud-provider/cloudflare` pack",
      ),
    ]);
  });

  it("does not flag a type this plugin ships no packs under", () => {
    // The type list is read from the tree at check time, so the form covers a
    // new type directory without an edit — and covers nothing that is not one.
    const root = tree(packs({
      "stacks/bundles/thing.md": "see `datastore/postgres/conventions.md`\n",
    }));
    expect(messages(check(root))).toEqual([]);
  });

  it("ignores a fence, and still reports the true line after it", () => {
    // A fence is a worked example — the `extends` samples in the tsconfig pack
    // show a path the TARGET repo will hold. Blanking it has to keep the line
    // count, because the line is the whole value of the finding.
    const root = tree(packs({
      "stacks/language/x/conventions.md": [
        "intro",
        "",
        "```json",
        "{ \"extends\": \"assets/contracts/secrets.md\" }",
        "```",
        "",
        "see `assets/contracts/secrets.md`",
        "",
      ]
        .join("\n"),
    }));
    const found = check(root);
    expect(messages(found)).toEqual([
      expect.stringContaining("cites `assets/contracts/secrets.md`"),
    ]);
    expect(found[0]?.scope).toBe(
      "stackgen:stacks/language/x/conventions.md:7",
    );
  });
});

describe("the design-adapter contract", () => {
  // Wave D moved the three adapter skills out of a plugin and into a stackgen
  // `design-tool` pack, where they are materialized into the repo's own
  // `.claude/` under fixed names vwf invokes. The rule is unchanged; where it
  // looks is not.
  const pack = (files: Record<string, string>) => ({
    stackgen: {
      manifest: { name: "stackgen", version: "1.0.0", description: "x" },
      files: { "stacks/design-tool/acme/pack.yaml": "name: Acme\n", ...files },
    },
  });

  const three = (extra: string) =>
    Object.fromEntries(
      ["screens", "design-system", "conversations"].map(kind => [
        `stacks/design-tool/acme/skills/design-import-${kind}/SKILL.md`,
        skill(`design-import-${kind}`, extra),
      ]),
    );

  it("accepts all three skills at disable-model-invocation: false", () => {
    const root = tree(pack(three("disable-model-invocation: false\n")));
    expect(check(root)).toEqual([]);
  });

  it("flags a missing import skill", () => {
    const files = Object.fromEntries(
      Object
        .entries(three("disable-model-invocation: false\n"))
        .filter(([path]) => !path.includes("design-import-conversations")),
    );
    expect(messages(check(tree(pack(files))))).toEqual([
      "design-tool pack is missing its \"design-import-conversations\" skill — "
      + "vwf delegates to that exact name, and a missing one is silently "
      + "unavailable rather than a smaller feature",
    ]);
  });

  it("flags a skill the model cannot invoke", () => {
    // `true` removes the skill from the model's context entirely, so vwf's
    // delegation returns an empty payload rather than an error — which reads
    // exactly like a design nobody authored.
    const root = tree(pack(three("disable-model-invocation: true\n")));
    expect(messages(check(root))).toHaveLength(3);
    expect(messages(check(root))[0]).toContain(
      "is not `disable-model-invocation: false`",
    );
  });

  it("flags a skill that is model-invocable but hidden from the user", () => {
    // `user-invocable: false` is the old `invocation: model`. The model can
    // invoke it, so a rule that only banned `true` would pass — but these three
    // are documented as user-runnable too, and only the explicit `false` means
    // both.
    const root = tree(pack(three("user-invocable: false\n")));
    expect(messages(check(root))).toHaveLength(3);
  });

  it("does not apply to a plugin shipping no design-tool pack", () => {
    const root = tree({ stackgen: {} });
    expect(check(root)).toEqual([]);
  });
});

describe("the stack-adapter contract", () => {
  // Wave E retired `typescript`, `flutter`, `gcp` and `cloudflare`, which left
  // `stackgen` the only plugin carrying the keyword. A rule selected by a
  // keyword over a one-element set is one manifest edit away from being off, so
  // it is pinned in both directions here.
  const adapter = (files: Record<string, string>) => ({
    stackgen: {
      manifest: {
        name: "stackgen",
        version: "1.0.0",
        description: "x",
        keywords: ["vwf-stack-adapter"],
      },
      files,
    },
  });

  const both = (extra: string) =>
    Object.fromEntries(
      ["stack-menu", "stack-template"].map(kind => [
        `skills/stackgen-${kind}/SKILL.md`,
        skill(`stackgen-${kind}`, extra),
      ]),
    );

  /** The state the contract wants: reachable by vwf, absent from the menu. */
  const called = "disable-model-invocation: false\nuser-invocable: false\n";

  it("accepts both skills carrying both invocation keys", () => {
    expect(check(tree(adapter(both(called))))).toEqual([]);
  });

  it("flags a missing adapter skill", () => {
    const files = Object.fromEntries(
      Object
        .entries(both(called))
        .filter(([path]) => !path.includes("stack-template")),
    );
    expect(messages(check(tree(adapter(files))))).toEqual([
      "stack adapter is missing its \"stackgen-stack-template\" skill",
    ]);
  });

  it("flags a skill the model cannot invoke", () => {
    // vwf reaches these by constructed name, so `true` yields an empty menu
    // rather than an error — indistinguishable from a plugin offering nothing.
    const found = messages(check(tree(adapter(
      both("disable-model-invocation: true\nuser-invocable: false\n"),
    ))));
    expect(found).toHaveLength(2);
    expect(found[0]).toContain("is not `disable-model-invocation: false`");
  });

  it("flags a skill that says nothing about model invocation", () => {
    // Absence is not a claim: `user-invocable: false` alone leaves the state
    // vwf depends on unstated, so banning `true` would wrongly pass this.
    const found = messages(
      check(tree(adapter(both("user-invocable: false\n")))),
    );
    expect(found).toHaveLength(2);
    expect(found[0]).toContain("is not `disable-model-invocation: false`");
  });

  it("flags a skill still offered in the / menu", () => {
    // An adapter answers in a payload shape only vwf reads, so a user typing
    // it gets nothing usable — it is vwf's to call, not a user's to type.
    const found = messages(check(tree(adapter(
      both("disable-model-invocation: false\n"),
    ))));
    expect(found).toHaveLength(2);
    expect(found[0]).toContain("is not `user-invocable: false`");
  });

  it("flags an adapter skill on a plugin that dropped the keyword", () => {
    // The direction that closes the hazard: the keyword is what selects a
    // plugin into the rule, so dropping it would otherwise disable the check
    // and leave the half-retired adapter unmentioned.
    const root = tree({
      stackgen: {
        manifest: { name: "stackgen", version: "1.0.0", description: "x" },
        files: both(called),
      },
    });
    expect(messages(check(root))).toEqual([
      "ships \"stackgen-stack-menu\" and \"stackgen-stack-template\" but does "
      + "not declare the `vwf-stack-adapter` keyword — the keyword is what "
      + "selects a plugin into this contract, so dropping it disables the very "
      + "check that would have caught the adapter being half-retired",
    ]);
  });

  it("does not apply to a plugin that retired its adapter outright", () => {
    // Keyword and both skills gone together is a deliberate retirement — which
    // is exactly what `gcp` and `cloudflare` did — and stays clean.
    expect(check(tree({ stackgen: {} }))).toEqual([]);
  });
});

describe("bundle defaults", () => {
  // A bundle's `default: true` is what the architecture menu preselects among
  // the entries it offers on a round, a list already filtered by the project's
  // platforms. Two flagged on one axis conflict when either declares no
  // platforms or their lists intersect — silent nondeterminism, whichever
  // sorts first wins — and a string `"true"` never preselects at all, so both
  // directions are pinned.
  const bundle = (axis: string, extra = "", platforms: string[] = []) =>
    `---\nname: X\naxis: ${axis}\nkind: k\n${extra}${
      platforms.length > 0
        ? `platforms:\n${platforms.map(p => `- ${p}\n`).join("")}`
        : ""
    }components:\n- k/x@1.0.0\n---\n\nprose\n`;

  const bundles = (files: Record<string, string>) => ({
    stackgen: {
      files: Object.fromEntries(
        Object
          .entries(files)
          .map(([slug, text]) => [`stacks/bundles/${slug}.md`, text]),
      ),
    },
  });

  it("accepts a tree where no bundle carries the flag", () => {
    const root = tree(bundles({ a: bundle("design"), b: bundle("design") }));
    expect(check(root)).toEqual([]);
  });

  it("passes two flagged bundles on distinct axes", () => {
    const root = tree(bundles({
      a: bundle("design", "default: true\n"),
      b: bundle("design"),
      c: bundle("cicd", "default: true\n"),
    }));
    expect(check(root)).toEqual([]);
  });

  it("flags two flagged bundles on one axis when neither declares platforms", () => {
    const root = tree(bundles({
      a: bundle("design", "default: true\n"),
      b: bundle("design", "default: true\n"),
      c: bundle("cicd", "default: true\n"),
    }));
    const found = messages(check(root));
    expect(found).toHaveLength(1);
    expect(found[0]).toContain("on the `design` axis");
    expect(found[0]).toContain("\"stacks/bundles/a.md\"");
    expect(found[0]).toContain("\"stacks/bundles/b.md\"");
    expect(found[0]).toContain("declares no `platforms:` list");
  });

  it("passes two flagged bundles on one axis with disjoint platforms", () => {
    const root = tree(bundles({
      a: bundle("project", "default: true\n", ["site"]),
      b: bundle("project", "default: true\n", ["backend"]),
    }));
    expect(check(root)).toEqual([]);
  });

  it("flags two flagged bundles on one axis when platforms intersect, or one declares none", () => {
    const shared = messages(check(tree(bundles({
      a: bundle("project", "default: true\n", ["site", "webapp"]),
      b: bundle("project", "default: true\n", ["webapp"]),
    }))));
    expect(shared).toHaveLength(1);
    expect(shared[0]).toContain("on the `project` axis");
    expect(shared[0]).toContain("\"stacks/bundles/a.md\"");
    expect(shared[0]).toContain("\"stacks/bundles/b.md\"");
    expect(shared[0]).toContain("share the platform `webapp`");
    expect(shared[0]).not.toContain("`site`");

    const bare = messages(check(tree(bundles({
      a: bundle("project", "default: true\n", ["site"]),
      b: bundle("project", "default: true\n"),
    }))));
    expect(bare).toHaveLength(1);
    expect(bare[0]).toContain(
      "\"stacks/bundles/b.md\" declares no `platforms:` list",
    );
  });

  it("flags a default that is not a boolean", () => {
    const root = tree(bundles({ a: bundle("design", "default: \"true\"\n") }));
    expect(messages(check(root))).toEqual([
      "bundle `default` is \"true\", not a boolean — the menu preselects on "
      + "`default: true` alone, so any other spelling never preselects and "
      + "reports nothing",
    ]);
  });
});

describe("the exclusion sets", () => {
  // Four tools, four syntaxes, one convention: the generated trees every gate
  // skips. Each list is authored by hand in its tool's own spelling, so the
  // drift is an entry added to some of them — which no tool reports, since each
  // reads only its own list. The three formatter lists must agree; the scanner's
  // allowlist is held to a subset of them, since upstream's default config
  // already skips part of the set and authored source must stay scanned.
  const gate = "skills/tool-config/assets";
  const dprint = `${gate}/.config/dprint.json`;
  const taplo = `${gate}/.config/taplo.toml`;
  const gitleaks = `${gate}/.config/gitleaks.toml`;
  const preCommit = `${gate}/.config/pre-commit-config.yaml`;

  const lists = (overrides: Partial<Record<string, string>> = {}) => ({
    stackgen: {
      files: {
        "skills/tool-config/SKILL.md": skill("tool-config"),
        [dprint]: overrides.dprint ?? JSON.stringify({
          excludes: ["**/node_modules/", "**/dist/", "**/*.lock", "**/.env.*"],
        }),
        [taplo]: overrides.taplo ?? "exclude = [\n"
            + "  \"**/node_modules/**\",\n  \"**/dist/**\",\n  \"**/*.lock\",\n"
            + "  \"**/.env.*\",\n]\ninclude = [ \"**/*.toml\" ]\n",
        [gitleaks]: overrides.gitleaks ?? "[allowlist]\npaths = [\n"
            + "  '''node_modules/*''',\n  '''dist/*''',\n  '''.*\\.lock''',\n"
            + "  '''\\.env\\..*''',\n]\n",
        [preCommit]: overrides.preCommit
          ?? "exclude: ^(node_modules/|dist/|.*\\.lock|\\.env\\..*)\n"
            + "repos:\n  - repo: local\n",
      },
    },
  });

  it("passes four lists that agree after normalisation", () => {
    expect(messages(check(tree(lists())))).toEqual([]);
  });

  it("flags an entry present in some formatter lists and absent from another", () => {
    const root = tree(lists({
      dprint: JSON.stringify({
        excludes: ["**/node_modules/", "**/*.lock", "**/.env.*"],
      }),
    }));
    expect(messages(check(root))).toEqual([
      `exclusion \`dist\` is in ${taplo}, ${preCommit} and not in ${dprint} — `
      + "the formatters' exclusion lists state one set",
    ]);
  });

  it("passes a gitleaks allowlist narrower than the formatters' set", () => {
    // Upstream's default config already skips part of the set, and `.claude/`
    // is authored source the scanner must read — the allowlist is a subset.
    const root = tree(lists({
      gitleaks: "[allowlist]\npaths = [\n  '''node_modules/*''',\n"
        + "  '''.*\\.lock''',\n  '''\\.env\\..*''',\n]\n",
    }));
    expect(messages(check(root))).toEqual([]);
  });

  it("flags a gitleaks allowlist entry no formatter excludes", () => {
    // An allowlist entry with no generated tree behind it is a scanner quietly
    // not scanning.
    const root = tree(lists({
      gitleaks: "[allowlist]\npaths = [\n  '''node_modules/*''',\n"
        + "  '''dist/*''',\n  '''.*\\.lock''',\n  '''\\.env\\..*''',\n"
        + "  '''src/secrets/*''',\n]\n",
    }));
    expect(messages(check(root))).toEqual([
      `${gitleaks}: allowlists \`src/secrets\`, which no formatter list `
      + "excludes — the scanner's allowlist is a subset of the formatters' set",
    ]);
  });

  it("reads a verbose pre-commit pattern the same as a one-line one", () => {
    const root = tree(lists({
      preCommit: "exclude: |\n  (?x)^(\n    node_modules/ | # a comment\n"
        + "    dist/ |\n    .*\\.lock |\n    \\.env\\..*\n  )\n"
        + "repos:\n  - repo: local\n",
    }));
    expect(messages(check(root))).toEqual([]);
  });

  it("holds a pre-commit config with no global exclude to the others", () => {
    const root = tree(lists({ preCommit: "repos:\n  - repo: local\n" }));
    expect(messages(check(root))).toHaveLength(4);
    expect(messages(check(root))[0]).toContain(
      `exclusion \`*.lock\` is in ${dprint}, ${taplo} and not in ${preCommit}`,
    );
  });

  it("reads the anywhere anchor as a glob's leading double star", () => {
    // gitleaks and pre-commit anchor a directory as `(^|/)dir/` so it matches
    // at the root and under any parent — the regex spelling of `**/dir/` — and
    // a segment wildcard as `[^/]*`, the regex spelling of `*`.
    const root = tree(lists({
      dprint: JSON.stringify({
        excludes: ["**/.turbo/", "**/dist/", "**/*.lock"],
      }),
      taplo: "exclude = [ \"**/.turbo/**\", \"**/dist/**\", \"**/*.lock\" ]\n",
      gitleaks:
        "[allowlist]\npaths = [ '''(^|/)\\.turbo/''', '''(?:^|/)dist/''' ]\n",
      preCommit: "exclude: (^|/)(\\.turbo|dist)/|(^|/)[^/]*\\.lock$\n"
        + "repos:\n  - repo: local\n",
    }));
    expect(messages(check(root))).toEqual([]);
  });

  it("keeps a bar inside a bracket class out of the alternation", () => {
    const root = tree(lists({
      preCommit: "exclude: ^(node_modules/|dist/|[^/]*[|.]lock|\\.env\\..*)\n"
        + "repos:\n  - repo: local\n",
    }));
    expect(messages(check(root))).toEqual([
      expect.stringContaining("exclusion `*.lock` is in "),
      expect.stringContaining(`exclusion \`*[|.]lock\` is in ${preCommit}`),
    ]);
  });

  it("refuses a pre-commit pattern with two alternation groups", () => {
    // `^(?:build|dist)/.*\.(json|yaml)$` has no one reading as entries.
    const root = tree(lists({
      preCommit: "exclude: ^(?:build|dist)/.*\\.(json|yaml)$\n"
        + "repos:\n  - repo: local\n",
    }));
    expect(messages(check(root))).toEqual([
      expect.stringContaining(
        `${preCommit}: exclusion list could not be read — more than one `
          + "alternation group — spell one entry per line",
      ),
    ]);
  });

  it("flags an exclusion list that cannot be read", () => {
    // Nothing else parses dprint.json, taplo.toml or gitleaks.toml.
    const root = tree(lists({ dprint: "{ \"excludes\": [\n" }));
    expect(messages(check(root))).toEqual([
      expect.stringContaining(`${dprint}: exclusion list could not be read`),
    ]);
  });

  it("keeps a bracket inside a quoted TOML entry", () => {
    const root = tree(lists({
      gitleaks: "[allowlist]\npaths = [\n  '''node_modules/*''',\n"
        + "  '''dist/*''',\n  '''.*\\.lock''',\n  '''\\.env\\.[a-z]*''',\n]\n",
    }));
    expect(messages(check(root))).toEqual([
      expect.stringContaining("allowlists `.env.[a-z]*`"),
    ]);
  });

  it("flags a list the tool-config skill no longer carries", () => {
    // A moved file used to end the comparison silently; now it is named.
    const files = lists().stackgen.files as Record<string, string>;
    const { [taplo]: _dropped, ...rest } = files;
    const root = tree({ stackgen: { files: rest } });
    expect(messages(check(root))).toEqual([
      `${taplo}: exclusion list is missing — the tool-config skill ships all `
      + "four lists",
    ]);
  });

  it("reads dprint's JSONC markers and its `../X` + `**/X` pairs as one entry", () => {
    // The tool-config markers are `//` comments; a plugin URL's `//` is not.
    const dprintJsonc = "{\n"
      + "  \"plugins\": [\"https://plugins.dprint.dev/json-0.20.0.wasm\"],\n"
      + "  \"includes\": [\"../**\"],\n"
      + "  \"excludes\": [\n"
      + "    // >>> tool-config\n"
      + "    \"**/node_modules/\", \"../**/node_modules/\",\n"
      + "    \"**/dist/\", \"../**/dist/\",\n"
      + "    \"**/*.lock\", \"../**/*.lock\",\n"
      + "    /* the repo's own */ \"**/.env.*\", \"../**/.env.*\"\n"
      + "    // <<< tool-config\n"
      + "  ]\n}\n";
    expect(messages(check(tree(lists({ dprint: dprintJsonc }))))).toEqual([]);
    const missing = dprintJsonc.replace(
      "\"**/dist/\", \"../**/dist/\",\n",
      "",
    );
    expect(messages(check(tree(lists({ dprint: missing }))))).toEqual([
      `exclusion \`dist\` is in ${taplo}, ${preCommit} and not in ${dprint} — `
      + "the formatters' exclusion lists state one set",
    ]);
  });

  it("reads dprint's trailing commas, and keeps a comma inside a string", () => {
    // dprint writes a trailing comma in a JSONC file it is told to; a `,]`
    // inside a string is an entry, not one.
    const dprintJsonc = "{\n"
      + "  \"includes\": [\"../**\",],\n"
      + "  \"excludes\": [\n"
      + "    \"**/node_modules/\",\n    \"**/dist/\",\n    \"**/*.lock\",\n"
      + "    \"**/.env.*\", // trailing\n"
      + "  ],\n}\n";
    expect(messages(check(tree(lists({ dprint: dprintJsonc }))))).toEqual([]);
    const inString = dprintJsonc.replace("\"**/dist/\",", "\"**/dist,]/\",");
    expect(messages(check(tree(lists({ dprint: inString }))))).toEqual(
      expect.arrayContaining([
        expect.stringContaining("exclusion `dist,]` is in "),
      ]),
    );
  });

  it("flags a dprint config that lost its excludes list", () => {
    const root = tree(lists({ dprint: "{}\n" }));
    expect(messages(check(root))).toEqual([
      `${dprint}: declares no exclusion list to compare`,
    ]);
  });
});

describe("the technology-free vwf guard", () => {
  const vwf = (files: Record<string, string>) => ({ vwf: { files } });

  it("flags vwf prose naming a tool", () => {
    const root = tree(
      vwf({ "assets/harness.md": "Run the suite with vitest.\n" }),
    );
    expect(messages(check(root))).toEqual([
      expect.stringContaining("names \"vitest\""),
    ]);
  });

  it("flags vwf shipping a stack template", () => {
    const root = tree(vwf({ "stacks/project/thing.md": "# Thing\n" }));
    expect(messages(check(root))).toEqual([
      expect.stringContaining(
        "ships a stack template at stacks/project/thing.md",
      ),
    ]);
  });

  it("flags vwf reaching a design tool's MCP server directly", () => {
    // The old plugin-scoped prefix, which a machine upgrading from an earlier
    // version can still be carrying in its prose.
    const root = tree(
      vwf({
        "assets/feedback.md":
          "Call mcp__plugin_design-tools_claude-design_get_page.\n",
      }),
    );
    expect(messages(check(root))).toEqual([
      expect.stringContaining("reaches the \"claude-design\" MCP server"),
    ]);
  });

  it("flags the project-scoped MCP spelling too", () => {
    // Servers land in the project's own `.mcp.json` now, which scopes them
    // `mcp__<server>__` — matching only the retired plugin prefix would have
    // quietly stopped catching anything.
    const root = tree(
      vwf({ "assets/feedback.md": "Call mcp__claude-design__get_page.\n" }),
    );
    expect(messages(check(root))).toEqual([
      expect.stringContaining("reaches the \"claude-design\" MCP server"),
    ]);
  });

  it("exempts the two reviewed paths and the worked example bundle", () => {
    // The example bundle is a worked blueprint of somebody's product, and a
    // blueprint names its product's technology by design.
    const root = tree(vwf({
      "assets/stack-adapter.md": "e.g. vitest, playwright.\n",
      "skills/readme/SKILL.md": skill("readme", "", "Detect pnpm or bun."),
      "assets/examples/blueprint/flows/index.md": "Built on postgres.\n",
    }));
    expect(check(root)).toEqual([]);
  });

  it("ignores a tool named inside a fenced block", () => {
    const root = tree(
      vwf({ "assets/config.md": "```yaml\nrunner: vitest\n```\n" }),
    );
    expect(check(root)).toEqual([]);
  });

  it("does not police any other plugin", () => {
    // The guard is vwf's alone: naming the tool it owns is the whole job of a
    // stack plugin.
    const root = tree({
      typescript: { files: { "assets/x.md": "Use pnpm.\n" } },
    });
    expect(check(root)).toEqual([]);
  });

  // The manifest half. The guard globbed `.md` only, which is exactly how
  // `"command": "pnpm"` sat in vwf's context7 entry unseen — a manifest is not
  // prose, so nothing read it.
  const manifest = (context7: Record<string, unknown>) => ({
    vwf: {
      manifest: {
        name: "vwf",
        version: "1.0.0",
        description: "the vwf plugin",
        mcpServers: { context7 },
      },
    },
  });

  it("flags a hardcoded runner in an MCP server invocation", () => {
    const root = tree(manifest({
      command: "pnpm",
      args: ["dlx", "@upstash/context7-mcp"],
    }));
    expect(messages(check(root))).toEqual([
      expect.stringContaining("hardcodes \"pnpm\""),
    ]);
  });

  it("accepts a runner behind a ${VAR:-default} expansion", () => {
    // The recommendation survives — pnpm is still what runs by default. What
    // changed is that a bun user can displace it, instead of getting a dead
    // server with no stated prerequisite.
    const root = tree(manifest({
      command: "sh",
      args: ["-c", "${CONTEXT7_RUNNER:-pnpm dlx} @upstash/context7-mcp"],
    }));
    expect(check(root)).toEqual([]);
  });

  it("still flags a token outside the expansion", () => {
    // Overridable in name only: the expansion is there, but the runner it
    // selects is not the part that was hardcoded.
    const root = tree(manifest({
      command: "sh",
      args: ["-c", "bun x ${CONTEXT7_ARGS:-@upstash/context7-mcp}"],
    }));
    expect(messages(check(root))).toEqual([
      expect.stringContaining("hardcodes \"bun\""),
    ]);
  });

  it("ignores an http server, which has no runner to hardcode", () => {
    const root = tree({
      vwf: {
        manifest: {
          name: "vwf",
          version: "1.0.0",
          description: "the vwf plugin",
          mcpServers: {
            mempalace: { type: "http", url: "http://127.0.0.1:8765/mcp" },
          },
        },
      },
    });
    expect(check(root)).toEqual([]);
  });
});

describe("prescription vs enumeration", () => {
  // The distinction the tool-name guard turns on: naming ONE tool tells the
  // reader what to use; listing the alternatives describes the domain of a
  // config key vwf owns. Both directions are pinned, because a guard that
  // exempts too much is indistinguishable from one that was deleted.

  it("flags a tool named on its own", () => {
    expect(prescribes("Load the claude-design MCP tool.", "claude-design"))
      .toBe(true);
    expect(prescribes("run it on cloud-run", "cloud-run")).toBe(true);
  });

  it("exempts a tool listed beside its alternatives", () => {
    expect(
      prescribes(
        "a token — `claude-design`, `lovable`, `stitch`",
        "claude-design",
      ),
    )
      .toBe(false);
  });

  it("exempts an enumeration that wraps mid-list", () => {
    // Every real enumeration in the corpus wraps, so a line-based rule would
    // flag the first line of each one. This is why the window is by character.
    expect(
      prescribes(
        "Which tool answers (`claude-design`,\n`lovable`, `stitch`, …) is the\nproduct's choice",
        "claude-design",
      ),
    )
      .toBe(false);
  });

  it("counts a peer that is not itself a banned token", () => {
    // `lovable` and `stitch` are ordinary English words and cannot be banned,
    // but their presence is still what proves a passage is a vocabulary.
    expect(prescribes("`claude-design` or `lovable`", "claude-design"))
      .toBe(false);
  });

  it("still flags a second, prescriptive mention elsewhere in the same file", () => {
    // The exemption is per occurrence, not per document — otherwise one
    // enumeration would licence every other mention in the file.
    const body = "the tokens `claude-design`, `lovable`, `stitch`.\n"
      + "x".repeat(400)
      + "\nDefault it to claude-design.";
    expect(prescribes(body, "claude-design")).toBe(true);
  });

  it("does not treat a distant token as a peer", () => {
    // The separators matter: the guard is anchored, so a token butted straight
    // against a letter is not a match at all.
    const body = `claude-design ${"x ".repeat(200)} lovable`;
    expect(prescribes(body, "claude-design")).toBe(true);
  });

  it("does not match a token inside a longer word", () => {
    // The unanchored form this list started as matched `hono` inside "honor"
    // and "honored" across a dozen files.
    expect(prescribes("we honor the contract, as honored elsewhere", "hono"))
      .toBe(false);
  });

  it("flags a banned token used as the head of a compound", () => {
    // The trailing anchor used to exclude `-`, so a banned token heading a
    // hyphenated compound never matched. Both of these shipped in vwf.
    expect(
      prescribes("alerting/dashboards: grafana-side by default", "grafana"),
    )
      .toBe(true);
    expect(prescribes("a `cli` platform pins deploy/npm-package", "npm"))
      .toBe(true);
    expect(prescribes("bring it up with docker-compose", "docker")).toBe(true);
    expect(prescribes("a postgres-backed store", "postgres")).toBe(true);
    expect(prescribes("terraform-managed infrastructure", "terraform"))
      .toBe(true);
  });

  it("still refuses a token sitting at the tail of a compound", () => {
    // The leading anchor keeps `-` on purpose: matching a tail would make
    // `pnpm-workspace` a hit for `npm`, and split `axe-core` down the hyphen.
    expect(prescribes("see pnpm-workspace.yaml", "npm")).toBe(false);
  });

  it("matches a hyphenated token whose own hyphen is internal", () => {
    expect(prescribes("the axe-core scan", "axe-core")).toBe(true);
    expect(prescribes("an axe-core-driven scan", "axe-core")).toBe(true);
  });

  it("counts a peer named as the head of a compound", () => {
    // The anchor is shared with the enumeration scan, so widening it widens
    // what counts as evidence too.
    expect(prescribes("`claude-design`, lovable-style tools", "claude-design"))
      .toBe(false);
  });
});

describe("retired vocabulary", () => {
  // The recurrence class of every drift sweep: a token is renamed at its
  // source of truth and a dozen other files keep stating the old one as live.
  // Nothing fails, because prose is not a reference — so the rule is pinned
  // per term in the failing direction, and per exemption in the passing one.
  const doc = (text: string) =>
    tree({ alpha: { files: { "assets/x.md": text } } });
  const retired = (text: string) =>
    messages(check(doc(text))).filter(m => m.includes("retired vocabulary"));

  it.each([
    ["`web` platform", "platforms: `mobile` / `desktop` / `web`\n"],
    ["`web` platform", "the `web` token\n"],
    ["-ux-gate", "delegated to the stack plugin's `-ux-gate` skill\n"],
    ["stacks/project/", "templates sit under `stacks/project/`\n"],
    ["assets/stacks/", "see `assets/stacks/deploy/npm-package.md`\n"],
    ["four axes", "a stack is composed from four axes\n"],
    ["four axes", "composed from four independent axes\n"],
    ["four axes", "the four stack axes\n"],
    ["four axes", "which of the four menus this joins\n"],
    ["four axes", "each of the four stack rounds\n"],
    ["private_plane", "private_plane: <mechanism>\n"],
    ["`devtools` plugin", "shipped by the `devtools` plugin\n"],
  ])("flags %s stated as live", (name, text) => {
    expect(retired(text)).toEqual([
      expect.stringContaining(`states retired vocabulary ${name} as live`),
    ]);
  });

  it("reports the path and the line", () => {
    const found = check(doc("fine\n\nfine\nthe four axes\n"));
    expect(found.map(f => f.scope)).toEqual(["alpha:assets/x.md:4"]);
  });

  it("scans yaml as well as markdown", () => {
    const root = tree({
      alpha: { files: { "stacks/thing/pack.yaml": "private_plane: vpc\n" } },
    });
    expect(messages(check(root))).toEqual([
      expect.stringContaining("private_plane"),
    ]);
  });

  it("passes a clean document", () => {
    expect(check(doc(
      "platforms: `mobile` / `site` / `webapp`; the repo's own `ux-gate`;\n"
        + "six axes; uninstall `devtools` by hand.\n",
    )))
      .toEqual([]);
  });

  it.each([
    "retired",
    "migration",
    "→",
    "pre-22",
    "format 22",
  ])("exempts a line carrying %s", marker => {
    expect(check(doc(`the \`web\` token, ${marker}\n`))).toEqual([]);
  });

  it("exempts the conjugations the migration notes use", () => {
    // `format 14 retires`, `a repo migrating from 9`, `since dissolved`, `the
    // templates moved under`: every one of these is history, and the stems are
    // what keep the rule from demanding the exact word "retired".
    expect(check(doc(
      "a value format 14 retires: `assets/stacks/x.md`\n\n"
        + "a repo migrating from 9 reads `stacks/project/`\n\n"
        + "the Docker doctrine of the `devtools` plugin, since dissolved\n\n"
        + "the templates moved under `assets/stacks/project/`\n",
    )))
      .toEqual([]);
  });

  it("exempts the flagged line alone, not its paragraph", () => {
    // By ruling. A migration note wrapped over many lines with its marker on
    // the first still has to mark the line carrying the token — the price of
    // a "retired at format 22" sentence never shielding a live claim under it.
    const found = check(doc(
      "- **`9 → 10` migration**: the templates live at\n"
        + "  `assets/stacks/<type>/<slug>.md`, which\n"
        + "  is also where `stacks/project/` came from\n\n"
        + "a stack is composed from four axes\n"
        + "(the fourth was retired at format 22)\n",
    ));
    expect(found.map(f => f.scope)).toEqual([
      "alpha:assets/x.md:2",
      "alpha:assets/x.md:3",
      "alpha:assets/x.md:5",
    ]);
  });

  it("exempts the format lineage and any changelog, whole", () => {
    const root = tree({
      alpha: {
        files: {
          "skills/setup/references/format-lineage.md": "the `web` token\n",
          "CHANGELOG.md": "the four axes\n",
          "vendor/thing/changelog.md": "private_plane\n",
        },
      },
    });
    expect(check(root)).toEqual([]);
  });

  it("does not take a project named `web` for the platform token", () => {
    // `web` is a perfectly good registry project name, and the worked example
    // uses it. The platform sense is marked by a sibling token or "token".
    expect(check(doc(
      "the registry project name (`api`, `web`, `console`);\n"
        + "`web` here declares `webapp`\n",
    )))
      .toEqual([]);
  });

  it("does not take `<plugin>-ux-gate` for the retired gate", () => {
    // The literal placeholder names no skill and only appears where the
    // retired construction is being explained.
    expect(check(doc("vwf never builds `<plugin>-ux-gate` from a pin\n")))
      .toEqual([]);
  });

  it("names `devtools` only as a plugin, and never for the uninstall", () => {
    expect(check(doc(
      "run `claude plugin uninstall devtools` — the `devtools` plugin is gone\n\n"
        + "the `devtools` skills folded into stackgen\n",
    )))
      .toEqual([]);
  });
});

describe("resolveRootRef", () => {
  it("resolves against the plugin that wrote the reference", () => {
    expect(resolveRootRef("/p/vwf", "assets/doc.md")).toBe(
      "/p/vwf/assets/doc.md",
    );
  });

  it("drops a trailing slash, so a directory reference resolves", () => {
    expect(resolveRootRef("/p/vwf", "assets/topologies/")).toBe(
      "/p/vwf/assets/topologies",
    );
  });

  it("follows a sibling hop out of the plugin root", () => {
    // Claude installs every plugin as a sibling, so a relative hop between them
    // survives whatever absolute path the client chose.
    expect(resolveRootRef("/p/design-tools", "../vwf/assets/doc.md")).toBe(
      "/p/vwf/assets/doc.md",
    );
  });
});
