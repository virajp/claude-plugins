#!/usr/bin/env node
/**
 * Static validation of the authored `plugins/` tree.
 *
 * The successor to the renderer's 1000-line checker, and much smaller — not
 * because less is checked, but because a whole half of what it checked stopped
 * existing. There is one tree now, authored in Claude Code's native format, so
 * the per-target passes (no surviving template tags, per-target frontmatter,
 * per-target reference resolution, the coverage report) have nothing to run
 * against, and the neutral-schema assertions they existed to protect —
 * `it.cmd()` targets, `prefixSkillNames` bare-name delegation, cross-plugin
 * skill-name uniqueness, invocation projection — describe mechanisms that are
 * gone. Deleting them was the point of the cutover, not a regression.
 *
 * What survives is what no format and no type can state: cross-file agreement,
 * things that must exist on disk, and the two contracts vwf enforces by
 * *constructing* a skill name — where the failure mode is silence rather than an
 * error, which is what makes a static check the only place they are catchable.
 *
 * Usage: node scripts/src/check.ts
 */
import {
  existsSync,
  globSync,
  readdirSync,
  statSync,
} from "node:fs";
import {
  basename,
  isAbsolute,
  join,
  relative,
  resolve,
} from "node:path";
import { parse as parseYaml } from "yaml";
import {
  agentName,
  bodyOf,
  frontmatterBlock,
  readPlugins,
  readText,
  skillName,
} from "./plugins.ts";
import type {
  Dependency,
  Manifest,
  Plugin,
  PluginFile,
} from "./plugins.ts";

export interface Finding {
  /**
   * What was being checked — a plugin name, `<plugin>:<path>`, or
   * `<plugin>:<path>:<line>` for a rule that fires on one line.
   */
  readonly scope: string;
  readonly message: string;
}

/** The one marketplace every dependency in this repo resolves within. */
const MARKETPLACE = "virajp-plugins";

/** A bare kebab-case code span — how prose names the agents it dispatches. */
const TOKEN_RE = /`([a-z0-9]+(?:-[a-z0-9]+)+)`/g;
/** A relative markdown link to a doc, minus any anchor. */
const LINK_RE = /\]\((\.{1,2}\/[^)\s#]+\.(?:md|ya?ml))(?:#[^)\s]*)?\)/g;
/** A plugin-root-relative reference, and the path behind it. */
const ROOT_REF_RE = /\$\{CLAUDE_PLUGIN_ROOT\}\/([A-Za-z0-9_./-]+)/g;
/**
 * Loose semver, minus build metadata. Claude accepts a `+N` version, and the
 * dev marketplace uses exactly that for its staged copies (`p:plugins:local`) —
 * but a tracked manifest carrying one is that local counter leaking into what
 * an end-user install pins to.
 */
const SEMVER_RE = /^\d+\.\d+\.\d+(?:-.+)?$/;

export function check(repoRoot: string): Finding[] {
  const pluginsRoot = join(repoRoot, "plugins");
  const plugins = readPlugins(pluginsRoot);
  const dirs = new Set(plugins.map(p => p.dir));

  const findings: Finding[] = [];
  for (const plugin of plugins) {
    findings.push(...checkManifest(plugin));
    findings.push(...checkDependencies(plugin, dirs));
    findings.push(...checkHookScripts(plugin));
    findings.push(...checkPackConfigTier(plugin));
    findings.push(...checkFrontmatterYaml(plugin));
    findings.push(...checkAgentReferences(plugin));
    findings.push(...checkExampleLinks(plugin));
    findings.push(...checkRootRefs(plugin, pluginsRoot));
    findings.push(...checkRetiredVocabulary(plugin));
    findings.push(...checkLandedCitations(plugin));
  }

  findings.push(...checkDesignAdapters(plugins));
  findings.push(...checkStackAdapters(plugins));
  findings.push(...checkBundleDefaults(plugins));
  findings.push(...checkExclusionSets(plugins));
  findings.push(...checkVwfIsTechnologyFree(plugins));
  return findings;
}

// ---------------------------------------------------------------------------
// The manifest
// ---------------------------------------------------------------------------

/**
 * The manifest fields the marketplace projection depends on.
 *
 * Deliberately not a schema. `plugin.json` is Claude Code's own format with a
 * published `$schema`, so the editor and the client validate its shape already;
 * reintroducing a zod package to restate that would put the drift back that the
 * cutover removed. What is asserted here is narrower and repo-specific: the four
 * values `scripts/src/marketplace.ts` reads, the name↔directory agreement no
 * schema can see, and the two things the version itself must be — plain semver,
 * and free of a 13 or 17 component.
 */
function checkManifest(plugin: Plugin): Finding[] {
  const findings: Finding[] = [];
  const m = plugin.manifest;
  const at = (message: string) => findings.push({ scope: plugin.dir, message });

  if (typeof m.name !== "string" || m.name === "") {
    at("plugin.json declares no `name`");
  }
  // The directory is what the marketplace `source` points at and what Claude
  // keys the installed bundle by; the name is what dependency lists and prose
  // use. A disagreement installs a plugin nothing can refer to.
  else if (m.name !== plugin.dir) {
    at(`plugin.json name "${m.name}" != directory "${plugin.dir}"`);
  }

  if (typeof m.version !== "string" || !SEMVER_RE.test(m.version)) {
    at(
      `plugin.json version ${
        JSON.stringify(m.version)
      } is not plain semver — it `
        + `is what an end-user install pins to, and a +N build number belongs `
        + `only to the staged dev copy`,
    );
  }
  // 13 and 17 are never issued, on any version line this repo maintains. Only a
  // whole component counts — `1.130.0` and `113.0.0` are fine. The prerelease
  // suffix `SEMVER_RE` allows comes off first, so `1.0.17-rc.1` is caught too.
  // Reached only when the assertion above passed, so the split is safe.
  else if (
    m.version.replace(/-.*$/, "").split(".").some(n => n === "13" || n === "17")
  ) {
    at(
      `plugin.json version ${JSON.stringify(m.version)} has a 13 or 17 `
        + `component — those integers are never issued`,
    );
  }

  if (typeof m.description !== "string" || m.description.trim() === "") {
    at(
      "plugin.json declares no `description` — the marketplace entry needs one",
    );
  }

  return findings;
}

/**
 * Every dependency resolves inside this marketplace.
 *
 * Both halves matter and both fail silently. A name that resolves to nothing
 * makes `claude plugin install` fail for the dependent, not for whoever typo'd
 * it; a wrong `marketplace` sends Claude looking in a marketplace the user has
 * very likely never registered, and the install of the *parent* is what breaks.
 */
function checkDependencies(
  plugin: Plugin,
  dirs: ReadonlySet<string>,
): Finding[] {
  const declared = plugin.manifest.dependencies;
  if (!Array.isArray(declared)) {
    return [];
  }

  const findings: Finding[] = [];
  for (const dep of declared as readonly Partial<Dependency>[]) {
    const name = JSON.stringify(dep.name);
    const marketplace = JSON.stringify(dep.marketplace);

    if (dep.marketplace !== MARKETPLACE) {
      findings.push({
        scope: plugin.dir,
        message: `dependency ${name} names marketplace ${marketplace} — every `
          + `dependency in this repo is authored here and resolves from `
          + `"${MARKETPLACE}"`,
      });
      continue;
    }
    if (typeof dep.name !== "string" || !dirs.has(dep.name)) {
      findings.push({
        scope: plugin.dir,
        message: `dependency ${name} is not a plugin in this marketplace`,
      });
    }
  }
  return findings;
}

// ---------------------------------------------------------------------------
// On disk
// ---------------------------------------------------------------------------

/** Hook scripts must exist and be executable, or the hook dies at run time. */
function checkHookScripts(plugin: Plugin): Finding[] {
  const hooks = plugin.files.find(f => f.path === "hooks/hooks.json");
  if (hooks === undefined) {
    return [];
  }

  const findings: Finding[] = [];
  const byPath = new Map(plugin.files.map(f => [f.path, f]));

  let doc: { hooks?: Record<string, unknown>; };
  try {
    doc = JSON.parse(readText(hooks.absolute));
  }
  catch (error) {
    return [{
      scope: plugin.dir,
      message: `hooks/hooks.json is not valid JSON — ${firstLine(error)}`,
    }];
  }

  for (const [event, command] of hookCommands(doc.hooks ?? {})) {
    // Matched rather than assumed: a hook may be an inline shell command with no
    // script at all (vwf's guarded `rtk` hook is one), and only the ones naming
    // a bundled file have anything to exist.
    for (const path of captures(command, ROOT_REF_RE)) {
      const file = byPath.get(path);
      if (file === undefined) {
        findings.push({
          scope: plugin.dir,
          message: `${event} hook names a missing script: ${path}`,
        });
      }
      else if (!file.executable) {
        findings.push({
          scope: plugin.dir,
          message: `${event} hook script is not executable: ${path}`,
        });
      }
    }
  }
  return findings;
}

/** Every `command` in a `hooks.json`, paired with the event declaring it. */
function* hookCommands(
  byEvent: Record<string, unknown>,
): Generator<[string, string]> {
  for (const [event, groups] of Object.entries(byEvent)) {
    for (const group of asArray(groups)) {
      const entries = (group as { hooks?: unknown; }).hooks;
      for (const hook of asArray(entries)) {
        const command = (hook as { command?: unknown; }).command;
        if (typeof command === "string") {
          yield [event, command];
        }
      }
    }
  }
}

/** Where a landed tree puts the file-based mise task library. */
const PACK_MISE_TASKS = join(".config", "mise", "tasks");
/** Where retired pre-commit hook fragments sat; a pack asks the skill now. */
const PACK_HOOK_FRAGMENTS = join(".config", "pre-commit.d");
/** Where a landed tree puts its editor-settings fragment. */
const PACK_EDITOR_FRAGMENTS = join(".config", "vscode.d");
/** Where `stackgen:tool-config` keeps one landed tree per tool. */
const TOOL_CONFIG_ASSETS = "skills/tool-config/assets";
/** The skill file that marks a plugin as the owner of those trees. */
const TOOL_CONFIG_SKILL = "skills/tool-config/SKILL.md";
/** Where a pack keeps the hook scripts that land in `.claude/hooks/`. */
const PACK_HOOKS = "hooks";
/**
 * What a pack's `hooks/` tier holds that is not a script: `hooks.yaml`, the
 * settings.json fragment that wires them, and any prose beside it.
 */
const PACK_HOOK_METADATA = /\.(?:ya?ml|json|md)$/;

/**
 * The interpreters a shipped task may name. Closed on purpose: a task library
 * whose files disagree on language is one nobody can lint, and the shell gate
 * (`p:plugins:shellcheck`) picks its argument list by the same rule.
 */
const PACK_TASK_SHEBANGS = new Set([
  "#!/usr/bin/env bash",
  "#!/usr/bin/env node",
  "#!/usr/bin/env python3",
]);

/**
 * The interpreters a shipped hook script may name.
 *
 * A narrower set than a task's, and deliberately so: a hook is wired into
 * settings.json as a bare path, so the host execs it and only a shell it can
 * find on `PATH` will do. `sh` is on the list because a hook that means to be
 * portable says so here — `shellcheck` reads the same line to pick its dialect,
 * so a POSIX hook declaring `bash` would be checked as bash and its bashisms
 * would ship.
 */
const PACK_HOOK_SHEBANGS = new Set([
  "#!/usr/bin/env bash",
  "#!/usr/bin/env sh",
]);

/**
 * The files a pack may ship at the top of its `config/` tier.
 *
 * The tier mirrors the target repo's root, and the repo doctrine puts every
 * tool's configuration under `.config/`. What is left at the root is the short
 * list of files a tool or a host *cannot* be told to look elsewhere for, plus
 * the two humans read first. Anything else arriving here is a pack quietly
 * widening the root of every repo it materializes into.
 *
 * This is the **landable** tier of the doctrine's root allowlist
 * (`stackgen/assets/output-tree.md`). That list has a second tier — the root
 * files *vwf* writes, `CLAUDE.md` and `mempalace.yaml` — which is deliberately
 * absent here: they may sit at a shaped root, and no pack may land them.
 */
const PACK_CONFIG_ROOT_FILES = new Set([
  ".editorconfig",
  ".gitattributes",
  ".gitignore",
  // graphify reads its ignore file from the root only, as git does.
  ".graphifyignore",
  // npm and pnpm read `.npmrc` from the root of the project they install in.
  ".npmrc",
  "CONTRIBUTING.md",
  "LICENSE",
  "SECURITY.md",
  // dprint's config discovery is root-only and `--config` is the CLI's only
  // override, so tool-config's dprint tree ships a root shim extending it.
  "dprint.json",
  "eslint.config.mjs",
  "fnox.toml",
  "readme.md",
  // Renovate discovers its config at the repo root, in `.github/` or in
  // `.gitlab/` — never under `.config/`, where one would be silently inert.
  "renovate.json",
  // wrangler discovers its config only at the repo root, so a `static-hosting`
  // pack shipping a deploy target has nowhere else to put it.
  "wrangler.jsonc",
]);

/**
 * The directories a pack may ship at the top of its `config/` tier.
 *
 * `.config/` is where the doctrine puts everything a tool can be pointed at,
 * and a `_`-prefixed directory is materializer staging. `.github/` is the third
 * because a forge reads it only from there — but a *workflow* file inside it is
 * refused by {@link PACK_CONFIG_FORGE_FENCE}: a pack states which task CI runs
 * and never writes the workflow.
 */
const PACK_CONFIG_ROOT_DIRS = new Set([
  ".config",
  ".github",
]);

/**
 * The one path inside an allowlisted root directory a pack may not ship.
 *
 * `.github/workflows/` is the forge's CI surface, and the charter fence is that
 * a pack contributes the task vocabulary a workflow calls, never the workflow
 * itself — a payload that writes one takes over a file the repo's own release
 * model owns.
 */
const PACK_CONFIG_FORGE_FENCE = join(".github", "workflows");

/**
 * What a stackgen pack ships to run in a target repo must be materializable
 * as-is.
 *
 * Seven assertions, all of them about a file whose failure mode in the target
 * repo is silence rather than an error:
 *
 * - a task file lands **executable** — `.config/mise/tasks/**` is a *file-based*
 *   task library, so one arriving 644 fails as an unknown task rather than as a
 *   permission error, which reads as a pack that never shipped it;
 * - and starts with a **known shebang** — mise executes the file directly, so a
 *   missing or exotic one is an exec-format error at the first `mise run`;
 * - a **hook script** lands executable and shebanged too, on the same reasoning
 *   from the other end: the materializer copies `hooks/*.sh` to
 *   `.claude/hooks/` and wires it into settings.json as a bare path, so the
 *   host execs the file — and a hook fault is the quietest fault there is,
 *   because nothing downstream of it ever reports that it did not run;
 * - the `config/` tier's **root stays allowlisted**, because everything else
 *   belongs under `.config/` and nothing else looks at what a pack puts beside
 *   it — and inside the one forge directory the list admits, a **workflow file
 *   is refused**: a pack states which task CI runs and never writes the
 *   workflow;
 * - an **editor fragment** parses as JSONC and carries only `settings`,
 *   `nesting` and `extensions`, because init merges the fragments into a file
 *   no pack owns and a key outside the three is dropped without a word;
 * - every **`conditional:` entry** in the pack's `pack.yaml` names a path or
 *   glob that matches a file under its `config/` tier, and a `when:` of
 *   exactly one known axis with a value that axis takes — an axis no caller
 *   answers is never evaluated, so the file lands everywhere, silently;
 * - the pack's **`binaries`, `lockfile` and `machine_env` facts** take the
 *   shapes `/vwf:doctor` and `/vwf:setup` read, and every `machine_env` name
 *   is set by a `mise add env` call in its `tool-config:` list, each call one
 *   of the verbs a pack may ask for (`packFactFaults`).
 *
 * A pack's `config/` tier holding a mise `conf.d` fragment or a `pre-commit.d`
 * file is a finding too, and each `stackgen:tool-config` asset tree is walked
 * as a landed tree.
 *
 * The walk is its own rather than `plugin.files`: most of these paths run
 * through `.config/`, and the reader's glob does not descend into a dot
 * segment, so the whole tier is invisible there.
 */
function checkPackConfigTier(plugin: Plugin): Finding[] {
  const findings: Finding[] = [];
  const at = (message: string) => findings.push({ scope: plugin.dir, message });
  const path = (absolute: string) => relative(plugin.root, absolute);

  const landedTree = (tree: string) => {
    for (const absolute of filesUnder(join(tree, PACK_MISE_TASKS))) {
      if ((statSync(absolute).mode & 0o111) === 0) {
        at(`mise task file is not executable: ${path(absolute)}`);
      }
      const shebang = readText(absolute).split("\n", 1)[0] ?? "";
      if (!PACK_TASK_SHEBANGS.has(shebang)) {
        at(
          `mise task file does not start with one of `
            + `${[...PACK_TASK_SHEBANGS].join(", ")}: ${path(absolute)}`,
        );
      }
    }

    if (existsSync(tree)) {
      for (const entry of readdirSync(tree, { withFileTypes: true })) {
        const allowed = entry.isDirectory()
          ? PACK_CONFIG_ROOT_DIRS.has(entry.name) || entry.name.startsWith("_")
          : PACK_CONFIG_ROOT_FILES.has(entry.name);
        if (!allowed) {
          at(
            `pack config/ tier holds an unallowlisted root entry — everything `
              + `else belongs under .config/: ${path(join(tree, entry.name))}`,
          );
        }
      }

      for (const absolute of filesUnder(join(tree, PACK_CONFIG_FORGE_FENCE))) {
        at(
          `pack config/ tier ships a CI workflow — a pack states which task CI `
            + `runs and never writes the workflow: ${path(absolute)}`,
        );
      }
    }

    for (const absolute of filesUnder(join(tree, PACK_EDITOR_FRAGMENTS))) {
      if (!absolute.endsWith(".jsonc")) {
        continue;
      }
      for (const message of editorFragmentFaults(readText(absolute))) {
        at(`${path(absolute)}: ${message}`);
      }
    }
  };

  for (const tree of toolConfigTrees(plugin)) {
    landedTree(join(plugin.root, tree));
  }

  const packs = globSync("stacks/*/*", { cwd: plugin.root });
  const slugs = new Set(packs.map(pack => basename(pack)));
  for (const pack of packs) {
    for (const absolute of filesUnder(join(plugin.root, pack, PACK_HOOKS))) {
      if (PACK_HOOK_METADATA.test(absolute)) {
        continue;
      }
      if ((statSync(absolute).mode & 0o111) === 0) {
        at(`hook script is not executable: ${path(absolute)}`);
      }
      const shebang = readText(absolute).split("\n", 1)[0] ?? "";
      if (!PACK_HOOK_SHEBANGS.has(shebang)) {
        at(
          `hook script does not start with one of `
            + `${[...PACK_HOOK_SHEBANGS].join(", ")}: ${path(absolute)}`,
        );
      }
    }

    const config = join(plugin.root, pack, "config");
    landedTree(config);

    for (const absolute of filesUnder(join(config, PACK_CONF_D))) {
      at(
        `pack config/ tier ships a mise conf.d fragment — a pack asks for its `
          + `mise lines through \`tool-config:\` in pack.yaml: ${
            path(absolute)
          }`,
      );
    }

    for (const absolute of filesUnder(join(config, PACK_HOOK_FRAGMENTS))) {
      at(
        `pack config/ tier ships a pre-commit.d file — a pack asks for its `
          + `hooks through \`tool-config:\` in pack.yaml: ${path(absolute)}`,
      );
    }

    const packYaml = join(plugin.root, pack, "pack.yaml");
    if (existsSync(packYaml)) {
      let document: unknown;
      try {
        document = parseYaml(readText(packYaml));
      }
      catch (error) {
        at(
          `${path(packYaml)}: pack.yaml is not valid YAML — ${
            firstLine(error)
          }`,
        );
        continue;
      }
      for (
        const message of [
          ...conditionalFaults(document, config),
          ...packFactFaults(document, slugs),
        ]
      ) {
        at(`${path(packYaml)}: ${message}`);
      }
    }
  }
  return findings;
}

/** Where a pack's `conf.d` fragments sit inside its `config/` tier. */
const PACK_CONF_D = join(".config", "mise", "conf.d");

/** A POSIX environment variable name. */
const ENV_VAR_NAME = /^[A-Za-z_][A-Za-z0-9_]*$/;

/**
 * What a pack's three doctor- and setup-read facts are held to.
 *
 * - every `languages[].facts.binaries` entry is a bare name `/vwf:doctor` looks
 *   up on PATH, or a map of exactly `name` and an optional `probe` it runs;
 * - `lockfile` is a non-empty list of paths or globs relative to the repo root,
 *   any match passing doctor's package-manager check;
 * - every `machine_env` entry names an env var, the command that `detect`s its
 *   value and the `question` setup asks — and the var is set by a `mise add
 *   env` call in the pack's `tool-config:` list, since that is what setup fills;
 * - every `tool-config:` entry parses as one of the verbs a pack may ask for,
 *   and an exclude goes through `all add exclude` alone (`toolConfigCall`).
 *
 * Each is read by a caller that trusts its shape: a probe that is not a string
 * is never run, a lockfile glob that climbs out of the repo matches something
 * the repo does not own, and a `machine_env` name no fragment carries is a
 * question whose answer lands nowhere — all silently.
 */
function packFactFaults(
  document: unknown,
  slugs: ReadonlySet<string>,
): string[] {
  if (!isPlainObject(document)) {
    return [];
  }
  const faults: string[] = [];

  const languages = Array.isArray(document.languages) ? document.languages : [];
  languages.forEach((language: unknown, l) => {
    const facts = isPlainObject(language) ? language.facts : undefined;
    if (!isPlainObject(facts) || facts.binaries === undefined) {
      return;
    }
    const label = `\`languages[${l}].facts.binaries\``;
    if (!Array.isArray(facts.binaries)) {
      faults.push(`${label} is not a list`);
      return;
    }
    facts.binaries.forEach((entry: unknown, b) => {
      const at = `${label}[${b}]`;
      if (typeof entry === "string") {
        if (entry === "") {
          faults.push(`${at} is an empty name`);
        }
        return;
      }
      if (!isPlainObject(entry)) {
        faults.push(`${at} is neither a name nor a { name, probe } map`);
        return;
      }
      const extra = Object.keys(entry).filter(k =>
        k !== "name" && k !== "probe"
      );
      if (extra.length > 0) {
        faults.push(
          `${at} carries ${extra.map(k => `\`${k}\``).join(", ")} — only `
            + `\`name\` and \`probe\``,
        );
      }
      if (typeof entry.name !== "string" || entry.name === "") {
        faults.push(`${at} declares no \`name\``);
      }
      if (
        entry.probe !== undefined
        && (typeof entry.probe !== "string" || entry.probe === "")
      ) {
        faults.push(`${at} \`probe\` is not a non-empty string`);
      }
    });
  });

  if (document.lockfile !== undefined) {
    const lockfile = document.lockfile;
    if (!Array.isArray(lockfile) || lockfile.length === 0) {
      faults.push("`lockfile` is not a non-empty list");
    }
    else {
      lockfile.forEach((entry: unknown, index) => {
        const label = `\`lockfile[${index}]\``;
        if (typeof entry !== "string" || entry === "") {
          faults.push(`${label} is not a path or glob`);
        }
        else if (isAbsolute(entry) || entry.split("/").includes("..")) {
          faults.push(
            `${label} (${entry}) climbs out of the repo — a lockfile path is `
              + `relative to the repo root and stays inside it`,
          );
        }
      });
    }
  }

  const calls = document["tool-config"];
  const declared = new Set<string>();
  if (calls !== undefined && !isStringList(calls)) {
    faults.push("`tool-config` is not a list of instructions");
  }
  else if (calls !== undefined) {
    (calls as string[]).forEach((call, index) => {
      const { fault, key } = toolConfigCall(call, slugs);
      if (fault !== undefined) {
        faults.push(`\`tool-config[${index}]\` (${call}) ${fault}`);
      }
      else if (key !== undefined) {
        declared.add(key);
      }
    });
  }

  if (document.machine_env !== undefined) {
    if (!Array.isArray(document.machine_env)) {
      faults.push("`machine_env` is not a list");
      return faults;
    }
    document.machine_env.forEach((entry: unknown, index) => {
      const label = `\`machine_env[${index}]\``;
      if (!isPlainObject(entry)) {
        faults.push(`${label} is not a { name, detect, question } map`);
        return;
      }
      const name = entry.name;
      const at = typeof name === "string" ? `${label} (${name})` : label;
      if (typeof name !== "string" || !ENV_VAR_NAME.test(name)) {
        faults.push(`${at} \`name\` is not an env-var name`);
      }
      else if (!declared.has(name)) {
        faults.push(
          `${at} is set by no \`mise add env\` call in the pack's `
            + `\`tool-config:\` list — setup would ask and fill nothing`,
        );
      }
      for (const key of ["detect", "question"]) {
        if (typeof entry[key] !== "string" || entry[key] === "") {
          faults.push(`${at} \`${key}\` is not a non-empty string`);
        }
      }
    });
  }
  return faults;
}

/** A `to …` scope: every environment, or one of the three suffixes. */
const TOOL_CONFIG_SCOPE = String
  .raw`to (?:all environments|(?:dev|ci|test)(?: environment)?)`;
/** A value, quoted as a TOML basic string or bare — a bare one carries no quote. */
const TOOL_CONFIG_VALUE = String.raw`("(?:[^"\\]|\\.)*"|[^"\s]+)`;
/** The three verbs a pack may ask for; the materializer appends `for <pack>`. */
const TOOL_CONFIG_VERBS = {
  tool: new RegExp(
    String.raw`^mise add tool ([A-Za-z0-9@:/._-]+) ([A-Za-z0-9._+-]+) `
      + `${TOOL_CONFIG_SCOPE}$`,
  ),
  env: new RegExp(
    String.raw`^mise add env (\S+?)=${TOOL_CONFIG_VALUE} ${TOOL_CONFIG_SCOPE}$`,
  ),
  alias: new RegExp(
    String.raw`^mise add alias (\S+?)=${TOOL_CONFIG_VALUE}`
      + String.raw`(?: to dev(?: environment)?)?$`,
  ),
};
/** The dprint plugins the skill's plugin table defines. */
const DPRINT_PLUGINS =
  "markdown|pretty_yaml|json|exec|typescript|malva|markup_fmt|dockerfile";
/** The keys `pre-commit add hook` writes, each `key=value`, quoted or bare. */
const HOOK_PAIR = String.raw`(name|description|entry|language|files|exclude|`
  + String.raw`types|args|pass_filenames|always_run|require_serial|rev)=`
  + String.raw`("(?:[^"\\]|\\.)*"|[^\s"]+)`;
/** `pre-commit add hook`, its repo captured; `hookFault` reads the pairs. */
const TOOL_CONFIG_HOOK = new RegExp(
  String.raw`^pre-commit add hook (local|https://\S+) [A-Za-z0-9_-]+ `
    + `(?:pre-commit|commit-msg|post-commit|manual)(?: ${HOOK_PAIR})*$`,
);
/** The gate verbs a pack may ask for; `tail` marks a free-text end. */
const TOOL_CONFIG_GATE_VERBS: readonly { pattern: RegExp; tail: boolean; }[] = [
  {
    pattern: new RegExp(`^dprint add plugin (?:${DPRINT_PLUGINS})$`),
    tail: false,
  },
  {
    pattern: new RegExp(
      String.raw`^all add exclude (?!generated$)(?:generated )?`
        + String.raw`(?:(?!for(?: |$))[^\s"]+(?: |$))+$`,
    ),
    tail: false,
  },
  {
    pattern: /^pre-commit add linter-ignore(?: (?!for(?: |$))[^\s"]+)+$/,
    tail: false,
  },
  { pattern: TOOL_CONFIG_HOOK, tail: true },
  { pattern: /^grype add ignore [A-Za-z0-9-]+(?: .+)?$/, tail: true },
];
/** A requester suffix: the materializer appends it, a pack never writes it. */
const TOOL_CONFIG_FOR = / for \S+$/;
/** An exclude asked of one tool, which would leave rule 15's lists disagreeing. */
const TOOL_CONFIG_LONE_EXCLUDE =
  /^(dprint|pre-commit|gitleaks) add (?:exclude|excludes|allowlist)\b/;
/** A Tera delimiter: mise renders it, so only a pack's own env value may carry one. */
const TERA_DELIMITER = /\{\{|\{%|\{#/;
/** An alias name: a TOML bare key, so `-` is allowed after the first character. */
const ALIAS_NAME = /^[A-Za-z_][A-Za-z0-9_-]*$/;

/**
 * One `tool-config:` entry against the verb grammar: the env key it sets, or
 * why it is refused. `slugs` names every pack, so a tail verb's `for <pack>`
 * reads as a suffix rather than text.
 */
function toolConfigCall(
  call: string,
  slugs: ReadonlySet<string>,
): { fault?: string; key?: string; } {
  const words = call.trim().replace(/\s+/g, " ");
  if (TOOL_CONFIG_VERBS.tool.test(words)) {
    return {};
  }
  const lone = TOOL_CONFIG_LONE_EXCLUDE.exec(words);
  if (lone !== null) {
    return {
      fault: `adds an exclude through \`${lone[1]}\` alone — ask `
        + "`all add exclude [generated] <paths>`, which writes every list",
    };
  }
  const verb = TOOL_CONFIG_GATE_VERBS.find(v => v.pattern.test(words));
  const bare = words.replace(TOOL_CONFIG_FOR, "");
  const suffix = words.slice(bare.length + " for ".length);
  if (
    bare !== words
    && (verb === undefined || !verb.tail || slugs.has(suffix))
    && TOOL_CONFIG_GATE_VERBS.some(v => v.pattern.test(bare))
  ) {
    return {
      fault: "ends in a `for <requester>` suffix — the materializer appends "
        + "it, so a pack's line never carries one",
    };
  }
  if (verb !== undefined) {
    const fault = verb.pattern === TOOL_CONFIG_HOOK
      ? hookFault(words)
      : undefined;
    return fault === undefined ? {} : { fault };
  }
  const env = TOOL_CONFIG_VERBS.env.exec(words);
  const alias = env === null ? TOOL_CONFIG_VERBS.alias.exec(words) : null;
  const match = env ?? alias;
  if (match === null) {
    return {
      fault: "matches none of `mise add tool <name> <version> to <scope>`, "
        + "`mise add env <KEY>=<value> to <scope>`, "
        + "`mise add alias <name>=<command> [to dev]`, "
        + "`dprint add plugin <name>`, "
        + "`all add exclude [generated] <paths>`, "
        + "`pre-commit add linter-ignore <paths>`, "
        + "`pre-commit add hook <repo> <id> <stage> [key=value …]` or "
        + "`grype add ignore <id> [reason]`",
    };
  }
  const name = match[1] ?? "";
  const pattern = env !== null ? ENV_VAR_NAME : ALIAS_NAME;
  if (!pattern.test(name)) {
    return {
      fault: `names \`${name}\`, which is not a \`${
        pattern.source.slice(1, -1)
      }\` name`,
    };
  }
  if (alias !== null && TERA_DELIMITER.test(words)) {
    return { fault: "carries a template delimiter outside an `add env` value" };
  }
  return env !== null ? { key: name } : {};
}

/**
 * What the skill refuses of a hook the grammar admits: a `local` hook needs a
 * name, an entry run through `mise x -- ` and `language=system`, and no `rev`;
 * a URL repo needs a `rev`.
 */
function hookFault(words: string): string | undefined {
  const local = TOOL_CONFIG_HOOK.exec(words)?.[1] === "local";
  const pairs = new Map<string, string>();
  for (const [, key, value] of words.matchAll(new RegExp(HOOK_PAIR, "g"))) {
    pairs.set(
      key ?? "",
      (value ?? "").replace(/^"([\s\S]*)"$/, "$1"),
    );
  }
  if (!local) {
    return pairs.has("rev")
      ? undefined
      : "is a URL repo hook with no `rev=` — the skill pins a tag";
  }
  if (pairs.has("rev")) {
    return "is a `local` hook carrying `rev=`, which only a URL repo takes";
  }
  const missing: string[] = [];
  if (!pairs.has("name")) {
    missing.push("`name=`");
  }
  if (!(pairs.get("entry") ?? "").startsWith("mise x -- ")) {
    missing.push("an `entry=` beginning `mise x -- `");
  }
  if (pairs.get("language") !== "system") {
    missing.push("`language=system`");
  }
  return missing.length === 0
    ? undefined
    : `is a \`local\` hook lacking ${missing.join(", ")}`;
}

/** Every `stackgen:tool-config` asset tree, plugin-relative. */
function toolConfigTrees(plugin: Plugin): string[] {
  return globSync(`${TOOL_CONFIG_ASSETS}/*`, { cwd: plugin.root })
    .filter(tree => statSync(join(plugin.root, tree)).isDirectory());
}

/**
 * The four axes a `conditional:` entry may name, and the values each admits.
 * `null` is "any slug": the secrets axis is answered by whichever
 * capability-provider pack the product picked, and the vocabulary there is
 * the stacks tree rather than a list here.
 */
const PACK_CONDITION_AXES: ReadonlyMap<string, ReadonlySet<string> | null> =
  new Map([
    ["forge", new Set(["github", "gitlab"])],
    ["editor", new Set(["vscode"])],
    ["secrets", null],
    ["update_bot", new Set(["renovate", "dependabot", "none"])],
  ]);

/**
 * What a pack's `conditional:` list is held to.
 *
 * The materializer evaluates the key against the caller's answers, and an
 * axis the caller did not answer reads as true — the omitted key lands the
 * file. So an axis outside the vocabulary is one no caller ever answers: its
 * condition can never skip anything, and the file lands everywhere, silently.
 * A value the axis never takes is the mirror case — a condition no answer ever
 * satisfies, so the file lands nowhere. A path or glob that matches nothing
 * under the pack's own `config/` tier is a condition guarding a file that does
 * not exist, which is a rename that forgot the key; and the path is matched
 * inside that tier only — an absolute path or a `..` segment reaches out of
 * what the pack lands, which is rule 13's fault stated on a glob.
 */
function conditionalFaults(document: unknown, config: string): string[] {
  const conditional = (document as { conditional?: unknown; } | null)
    ?.conditional;
  if (conditional === undefined) {
    return [];
  }
  if (!Array.isArray(conditional)) {
    return ["`conditional` is not a list"];
  }

  const axes = [...PACK_CONDITION_AXES.keys()].join(", ");
  const faults: string[] = [];
  conditional.forEach((entry: unknown, index) => {
    const label = `\`conditional[${index}]\``;
    if (!isPlainObject(entry) || typeof entry.path !== "string") {
      faults.push(`${label} declares no \`path\``);
      return;
    }
    const at = `${label} (${entry.path})`;
    if (isAbsolute(entry.path) || entry.path.split("/").includes("..")) {
      faults.push(
        `${at} climbs out of what the pack lands — a conditional path is `
          + `relative to the config/ tier and stays inside it`,
      );
      return;
    }
    // Walked and matched by hand rather than `globSync`: neither it nor
    // `path.matchesGlob` lets `**` enter a dot-directory, and every landed
    // path here runs through `.config/`.
    const matcher = landedGlob(entry.path);
    const matches = [...filesUnder(config)]
      .filter(absolute => matcher.test(relative(config, absolute)))
      .length;
    if (matches === 0) {
      faults.push(`${at} matches no file under the pack's config/ tier`);
    }
    if (!isPlainObject(entry.when)) {
      faults.push(`${at} declares no \`when\` map`);
      return;
    }
    const keys = Object.keys(entry.when);
    if (keys.length !== 1) {
      faults.push(
        `${at} \`when\` names ${keys.length} axes — exactly one of ${axes}`,
      );
      return;
    }
    const [axis] = keys as [string];
    const value = entry.when[axis];
    const allowed = PACK_CONDITION_AXES.get(axis);
    if (allowed === undefined) {
      faults.push(`${at} \`when\` names axis \`${axis}\`, not one of ${axes}`);
    }
    else if (typeof value !== "string" || value === "") {
      faults.push(`${at} \`when.${axis}\` is not a string`);
    }
    else if (allowed !== null && !allowed.has(value)) {
      faults.push(
        `${at} \`when.${axis}\` is ${JSON.stringify(value)}, not one of ${
          [...allowed].join(", ")
        }`,
      );
    }
    // `none` is the secrets question's no-provider answer, which init reads as
    // "no match" — a file conditioned on it could never land.
    else if (allowed === null && value === "none") {
      faults.push(`${at} \`when.${axis}\` is "none", which names no provider`);
    }
  });
  return faults;
}

/**
 * The only three keys an editor fragment may carry.
 *
 * The fragment is not an editor settings file: it is the slice of one a single
 * pack owns, and init composes the real file from every pack's slice. A fourth
 * key is a pack reaching past its slice into a file it does not own, and the
 * merge would drop it silently.
 */
const EDITOR_FRAGMENT_KEYS = ["settings", "nesting", "extensions"];

/** Strings and arrays-of-strings are the only leaf shapes a fragment may use. */
function isStringList(value: unknown): boolean {
  return Array.isArray(value) && value.every(item => typeof item === "string");
}

/** A JSON object — not an array, not `null`. */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * JSONC minus the C: comments and trailing commas removed so `JSON.parse` can
 * read what an editor would. String-aware, because a `//` inside a URL value is
 * not a comment.
 */
function stripJsonc(source: string): string {
  let out = "";
  let index = 0;
  while (index < source.length) {
    const char = source[index]!;
    if (char === "\"") {
      const start = index++;
      while (index < source.length) {
        if (source[index] === "\\") {
          index += 2;
          continue;
        }
        index++;
        if (source[index - 1] === "\"") {
          break;
        }
      }
      out += source.slice(start, index);
      continue;
    }
    if (char === "/" && source[index + 1] === "/") {
      while (index < source.length && source[index] !== "\n") {
        index++;
      }
      continue;
    }
    if (char === "/" && source[index + 1] === "*") {
      const end = source.indexOf("*/", index + 2);
      index = end === -1 ? source.length : end + 2;
      continue;
    }
    out += char;
    index++;
  }
  return out.replace(/,(\s*[}\]])/g, "$1");
}

/** What a pack's `config/.config/vscode.d/<pack>.jsonc` is held to. */
function editorFragmentFaults(source: string): string[] {
  let fragment: unknown;
  try {
    fragment = JSON.parse(stripJsonc(source));
  }
  catch (error) {
    return [`editor fragment is not valid JSONC — ${firstLine(error)}`];
  }
  if (!isPlainObject(fragment)) {
    return ["editor fragment is not a JSON object"];
  }

  const faults: string[] = [];
  for (const key of Object.keys(fragment)) {
    if (!EDITOR_FRAGMENT_KEYS.includes(key)) {
      faults.push(
        `editor fragment declares \`${key}\`, which is not one of `
          + `${EDITOR_FRAGMENT_KEYS.join(", ")}`,
      );
    }
  }
  const { settings, nesting, extensions } = fragment;
  if (settings !== undefined && !isPlainObject(settings)) {
    faults.push("editor fragment's `settings` is not an object");
  }
  if (nesting !== undefined) {
    if (!isPlainObject(nesting)) {
      faults.push("editor fragment's `nesting` is not an object");
    }
    else {
      for (const [parent, children] of Object.entries(nesting)) {
        if (!isStringList(children)) {
          faults.push(
            `editor fragment's \`nesting.${parent}\` is not a list of strings`,
          );
        }
      }
    }
  }
  if (extensions !== undefined && !isStringList(extensions)) {
    faults.push("editor fragment's `extensions` is not a list of strings");
  }
  return faults;
}

/**
 * A landed path or glob as a matcher over `config/`-relative paths. `**`
 * matches any run of segments, dot-directories included; `*` and `?` stay
 * inside one segment. Nothing else is a metacharacter.
 */
function landedGlob(pattern: string): RegExp {
  const segments = pattern.split("/");
  const source = segments
    .map((segment, index) => {
      if (segment === "**") {
        // A trailing `**` names every file below, at any depth.
        return index === segments.length - 1
          ? "(?:[^/]+/)*[^/]+"
          : "(?:[^/]+/)*";
      }
      return segment
        .replace(/[.+^${}()|[\]\\]/g, "\\$&")
        .replace(/\*/g, "[^/]*")
        .replace(/\?/g, "[^/]") + "/";
    })
    .join("")
    .replace(/\/$/, "");
  return new RegExp(`^${source}$`);
}

/** Every regular file under a directory, recursively; none when it is absent. */
function* filesUnder(dir: string): Generator<string> {
  if (!existsSync(dir)) {
    return;
  }
  const entries = readdirSync(dir, { recursive: true, withFileTypes: true });
  for (const entry of entries) {
    if (entry.isFile()) {
      yield join(entry.parentPath, entry.name);
    }
  }
}

/**
 * Frontmatter must parse under a *strict* YAML parser.
 *
 * A lenient host accepting it proves nothing: a colon-space inside a folded
 * plain scalar shipped for months because Claude tolerated it, while a strict
 * host dropped the whole skill with no error at all. Nothing normalises the
 * block on its way to disk any more — it *is* the authored bytes — so this is
 * the only reader that ever holds it to the spec.
 *
 * A pack's skills and agents are held to it too, and they are the larger half:
 * they outnumber the plugin's own, they are the documents that actually land in
 * a user's repo — where the host reading them is not this one — and until this
 * widened not one of them had ever been parsed. A pack's `rules/*.md` is left
 * out: frontmatter there is optional, so absence is not a fault.
 */
function checkFrontmatterYaml(plugin: Plugin): Finding[] {
  const findings: Finding[] = [];

  for (const path of frontmatteredDocs(plugin)) {
    const raw = frontmatterBlock(readText(join(plugin.root, path)));
    if (raw === null) {
      findings.push({
        scope: plugin.dir,
        message: `${path}: no YAML frontmatter — the host drops the whole `
          + `document, silently`,
      });
      continue;
    }
    try {
      parseYaml(raw);
    }
    catch (error) {
      findings.push({
        scope: plugin.dir,
        message: `${path}: frontmatter is not valid YAML — ${firstLine(error)}`,
      });
    }
  }
  return findings;
}

/** A pack's skills and agents, which the reader's plugin-root globs miss. */
const PACK_SKILL_RE = /^stacks\/[^/]+\/[^/]+\/skills\/[^/]+\/SKILL\.md$/;
const PACK_AGENT_RE = /^stacks\/[^/]+\/[^/]+\/agents\/[^/]+\.md$/;

/** Every document in a plugin whose frontmatter a host parses. */
function frontmatteredDocs(plugin: Plugin): string[] {
  const packs = plugin
    .files
    .map(f => f.path)
    .filter(path => PACK_SKILL_RE.test(path) || PACK_AGENT_RE.test(path));
  return [...plugin.skills, ...plugin.agents, ...packs];
}

/** Relative links inside the worked example bundle must resolve. */
function checkExampleLinks(plugin: Plugin): Finding[] {
  const findings: Finding[] = [];

  for (const file of plugin.files) {
    if (!file.path.includes("assets/examples/") || !file.path.endsWith(".md")) {
      continue;
    }
    for (const rel of captures(readText(file.absolute), LINK_RE)) {
      if (!existsSync(join(file.absolute, "..", rel))) {
        findings.push({
          scope: plugin.dir,
          message: `${file.path}: unresolved link ${rel}`,
        });
      }
    }
  }
  return findings;
}

/**
 * Every `${CLAUDE_PLUGIN_ROOT}` reference names something that exists.
 *
 * Resolved for real, against the plugin that wrote it — which is what the
 * predecessor could not do. With four render trees to satisfy, the old check
 * matched a reference against the *tail* of every emitted path across every
 * plugin, so `${CLAUDE_PLUGIN_ROOT}/assets/x.md` in plugin A passed on the
 * strength of `plugins/B/assets/x.md`. One tree means one unambiguous
 * resolution, and a real path is the only thing Claude expands this to.
 *
 * Directories resolve: half the corpus points at a tree and tells the reader to
 * pick the entry matching their case. `../<plugin>/` also resolves — Claude
 * installs every plugin as a sibling, so a relative hop between them is stable —
 * but it may not climb past `plugins/`, since nothing above it is installed.
 *
 * A landed pack file is skipped: it may not carry the token at all, resolvable
 * or not, and {@link checkLandedCitations} owns that — so a bad reference there
 * is one finding rather than two.
 */
function checkRootRefs(plugin: Plugin, pluginsRoot: string): Finding[] {
  const findings: Finding[] = [];

  for (const file of plugin.files) {
    if (isLandedPath(file.path)) {
      continue;
    }
    for (const ref of captures(readText(file.absolute), ROOT_REF_RE)) {
      const target = resolveRootRef(plugin.root, ref);
      if (outside(pluginsRoot, target)) {
        findings.push({
          scope: `${plugin.dir}:${file.path}`,
          message: `reference to ${ref} climbs out of plugins/ — only sibling `
            + `plugins are installed alongside this one`,
        });
      }
      else if (!existsSync(target)) {
        findings.push({
          scope: `${plugin.dir}:${file.path}`,
          message: `reference to ${ref} resolves to nothing (${
            relative(pluginsRoot, target)
          })`,
        });
      }
    }
  }
  return findings;
}

/** `${CLAUDE_PLUGIN_ROOT}/<ref>` as an absolute path. Exported for the tests. */
export function resolveRootRef(pluginRoot: string, ref: string): string {
  return resolve(pluginRoot, ref.replace(/\/+$/, ""));
}

function outside(root: string, path: string): boolean {
  const rel = relative(root, path);
  return rel === "" || rel.startsWith("..") || isAbsolute(rel);
}

// ---------------------------------------------------------------------------
// Landed pack files
// ---------------------------------------------------------------------------

/**
 * The tiers of a pack that are copied into a target repo, verbatim.
 *
 * A pack is materialized, never referenced in place: `skills/`, `agents/`,
 * `rules/`, `hooks/` and `config/` are copied byte-for-byte, a pack's
 * `conventions.md` — like a bundle's body — lands as the body of
 * `.claude/stackgen/templates/<slug>.md`, and the materializer's only mutation
 * is the `p/_project/` -> `p/<id>/` rename. Nothing else is rewritten.
 */
const LANDED_TIERS = ["skills", "agents", "rules", "hooks", "config"];

/** The literal token, matched for its own sake rather than for its path. */
const LANDED_TOKEN_RE = /\$\{CLAUDE_PLUGIN_ROOT\}/g;
/**
 * A bare reference into the plugin's `assets/` tree.
 *
 * The lookbehind is load-bearing twice over, and the `-` in it is not
 * decoration: it keeps `${CLAUDE_PLUGIN_ROOT}/assets/x.md` from being counted a
 * second time here, and it keeps a word merely ending in `assets` —
 * `pnpm-assets/x.md` — out, which without the hyphen it does not.
 */
const LANDED_ASSET_RE = /(?<![\w./-])(assets\/[A-Za-z0-9_./-]+\.(?:md|ya?ml))/g;
/** A relative path that climbs. Where it lands is decided by resolving it. */
const LANDED_CLIMB_RE = /(?<!\w)((?:\.\.\/)+[A-Za-z0-9_./-]+)/g;

/** A landed file, by its plugin-relative path and where it is on disk. */
interface LandedFile {
  readonly path: string;
  readonly absolute: string;
}

/**
 * A landed pack file may not cite anything by a path only the plugin has.
 *
 * A pack's whole point is that its output works for every collaborator on a
 * repo where **no plugin is installed** (`assets/output-tree.md`), and the
 * materializer copies these tiers without rewriting a word. Inside the plugin
 * every one of these citations resolves, so rule 6 is silent about all of them;
 * after landing not one of them does, and nothing reports it — the reader is
 * simply sent to a path that is not there. That is the failure this rule exists
 * for, and it is why rule 6 now skips the same files: one bad reference is one
 * finding, from the rule that knows what the file is for.
 *
 * Four forms, matched separately because they fail differently and are fixed
 * differently:
 *
 * - **the token** `${CLAUDE_PLUGIN_ROOT}`, anywhere and even without a path,
 *   because outside a plugin the host expands it to nothing at all. Checked in
 *   every landed file, not just prose: a shell task or a config fragment can
 *   spell it as readily as a skill;
 * - **a bare `assets/…`** path, which reads as repo-relative in the target and
 *   resolves to nothing there;
 * - **a `../` chain** that leaves the directory the file lands in. A pack's
 *   skills land as sibling directories in `.claude/skills/`, so a link within
 *   a skill's own `references/`, and a link across to another skill of the
 *   same pack, both still resolve — but only a `skills/` file has a tree to
 *   move within. Every other landed `.md` — an agent, a rule, a
 *   `conventions.md`, a bundle body — lands as one file with nothing above
 *   it, so any climb at all is a break;
 * - **a path into another pack**, `<type>/<slug>/<segment…>`, since a sibling
 *   pack is only materialized when the composition also picked it, and even
 *   then it lands under its own template name rather than at that path. A bare
 *   `<type>/<slug>` (or `<type>/<slug>@<version>`) is the lockfile's and a
 *   bundle's identifier vocabulary and is never refused — only a trailing
 *   segment makes it a path.
 *
 * Forms (b)–(d) hold for `.md` files only, and after fenced blocks are blanked:
 * a shell script under `config/` legitimately points at files that land beside
 * it, and a fence is a worked example — the `extends` samples in the `tsconfig`
 * pack's skill show a real relative path a *target* repo will hold. The
 * blanking preserves line count, because the finding's whole value is the line
 * it names: the links from the `flutter-ios` skill's `references/standards.md`
 * across to the `flutter` skill beside it are legitimate and stay unflagged, so
 * an author sent to the wrong line learns nothing.
 *
 * What replaces a citation is in the message, and it is never another path:
 * name the asset by role ("stackgen's secrets contract"), or state the rule it
 * carries inline.
 */
function checkLandedCitations(plugin: Plugin): Finding[] {
  const findings: Finding[] = [];
  const packPath = packPathPattern(stackTypes(plugin));

  for (const file of landedFiles(plugin)) {
    const markdown = file.path.endsWith(".md");
    const text = readText(file.absolute);
    const lines = (markdown ? blankFences(text) : text).split("\n");
    const landingRoot = landingRootOf(file.path);

    for (const [index, line] of lines.entries()) {
      const at = (message: string) =>
        findings.push({
          scope: `${plugin.dir}:${file.path}:${index + 1}`,
          message,
        });

      for (const _ of line.matchAll(LANDED_TOKEN_RE)) {
        at(
          "spells `${CLAUDE_PLUGIN_ROOT}` in a file that is copied into a "
            + "target repo, where the token expands to nothing — name what it "
            + "pointed at by role, or state the rule it carries inline",
        );
      }
      if (!markdown) {
        continue;
      }

      for (const [, ref] of line.matchAll(LANDED_ASSET_RE)) {
        at(
          `cites \`${ref}\`, a path that exists only inside this plugin — this `
            + `file lands in a repo with no plugin installed, so name the asset `
            + `by role or state its rule inline`,
        );
      }

      for (const [, ref] of line.matchAll(LANDED_CLIMB_RE)) {
        if (ref !== undefined && climbEscapes(plugin, file, landingRoot, ref)) {
          at(
            `cites \`${ref}\`, which climbs out of what this file lands as — `
              + `nothing sits above it in the target repo, so state what it `
              + `needs inline`,
          );
        }
      }

      if (packPath === null) {
        continue;
      }
      for (const [, component] of line.matchAll(packPath)) {
        at(
          `cites a path inside the \`${component}\` pack — a pack is copied, `
            + `never referenced in place, so say "the \`${component}\` `
            + `component's conventions, in this composition's template"`,
        );
      }
    }
  }
  return findings;
}

/** Is this plugin-relative path one of the files a pack lands? */
function isLandedPath(path: string): boolean {
  if (path.startsWith(`${TOOL_CONFIG_ASSETS}/`)) {
    return true;
  }
  const parts = path.split("/");
  const [stacks, type, slug, tier] = parts;
  if (stacks !== "stacks" || type === undefined || slug === undefined) {
    return false;
  }
  if (type === "bundles") {
    return parts.length === 3 && slug.endsWith(".md");
  }
  if (parts.length === 4) {
    return tier === "conventions.md";
  }
  return parts.length > 4 && tier !== undefined && LANDED_TIERS.includes(tier);
}

/**
 * Every landed file of every pack, walked rather than filtered.
 *
 * `plugin.files` is one glob and a glob does not descend into a dot segment, so
 * most of the `config/` tier is invisible there — the same reason
 * {@link checkPackConfigTier} walks its own way.
 */
function* landedFiles(plugin: Plugin): Generator<LandedFile> {
  for (const tree of toolConfigTrees(plugin)) {
    for (const found of filesUnder(join(plugin.root, tree))) {
      yield { path: relative(plugin.root, found), absolute: found };
    }
  }
  for (const pack of globSync("stacks/*/*", { cwd: plugin.root })) {
    const absolute = join(plugin.root, pack);
    if (pack.startsWith("stacks/bundles/")) {
      if (isLandedPath(pack)) {
        yield { path: pack, absolute };
      }
      continue;
    }
    for (const tier of LANDED_TIERS) {
      for (const found of filesUnder(join(absolute, tier))) {
        yield { path: relative(plugin.root, found), absolute: found };
      }
    }
    const conventions = join(absolute, "conventions.md");
    if (existsSync(conventions)) {
      yield { path: `${pack}/conventions.md`, absolute: conventions };
    }
  }
}

/**
 * The pack types, read from the tree at check time.
 *
 * A new type directory therefore extends the cross-pack form without an edit
 * here — which is what keeps this rule from being one `mkdir` behind the
 * taxonomy it polices.
 */
function stackTypes(plugin: Plugin): string[] {
  return globSync("stacks/*", { cwd: plugin.root })
    .filter(path =>
      path !== "stacks/bundles"
      && statSync(join(plugin.root, path)).isDirectory()
    )
    .map(path => path.slice("stacks/".length));
}

/** `<type>/<slug>/<segment…>`, or null when the plugin ships no packs. */
function packPathPattern(types: readonly string[]): RegExp | null {
  if (types.length === 0) {
    return null;
  }
  const alternation = types
    .map(type => type.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");
  return new RegExp(
    `(?<![\\w./-])((?:${alternation})/[a-z0-9-]+)/[A-Za-z0-9_]`,
    "g",
  );
}

/**
 * Fenced code blocks, blanked to their own line count.
 *
 * Unlike {@link stripFences} this keeps the lines: a finding whose whole value
 * is the line it names cannot afford to renumber the file under it.
 */
function blankFences(body: string): string {
  return body.replace(
    /^```[\s\S]*?^```/gm,
    block => "\n".repeat((block.match(/\n/g) ?? []).length),
  );
}

/**
 * The tree a `../` may move within, mirrored from where the file lands.
 *
 * A pack's `skills/` becomes `.claude/skills/`, so every skill of one pack
 * keeps its neighbours: the whole tier is the boundary, not one skill's own
 * directory. Everything else lands flattened — an agent and a rule become one
 * file each under `.claude/`, a `conventions.md` and a bundle body one file
 * each under `.claude/stackgen/templates/` — so there is no tree to move
 * within and this is null.
 */
function landingRootOf(path: string): string | null {
  const parts = path.split("/");
  // A tool-config asset tree lands whole as the repo root.
  if (path.startsWith(`${TOOL_CONFIG_ASSETS}/`)) {
    return parts.slice(0, 4).join("/");
  }
  return parts[3] === "skills" && parts.length > 5
    ? parts.slice(0, 4).join("/")
    : null;
}

/** Does this `../` chain leave the tree the file lands in? */
function climbEscapes(
  plugin: Plugin,
  file: LandedFile,
  landingRoot: string | null,
  ref: string,
): boolean {
  if (landingRoot === null) {
    // An agent, a rule, a conventions.md or a bundle body lands as one file.
    // There is no `..`.
    return true;
  }
  const target = resolve(join(file.absolute, ".."), ref);
  const rel = relative(join(plugin.root, landingRoot), target);
  return rel.startsWith("..") || isAbsolute(rel);
}

// ---------------------------------------------------------------------------
// Cross-references
// ---------------------------------------------------------------------------

/**
 * Agent cross-references, both directions.
 *
 * Agent names are role-suffixed (`-coder`, `-reviewer`, `-writer`), and the
 * suffix set is derived from the plugin's own `agents/` dir — so any role-shaped
 * token in its prose must name a real agent. The orphan direction covers what
 * the forward one cannot: a rename that takes the last holder of a suffix with
 * it leaves the new name referenced by nothing.
 */
function checkAgentReferences(plugin: Plugin): Finding[] {
  if (plugin.agents.length === 0) {
    return [];
  }

  const declared = new Set(plugin.agents.map(agentName));
  const roles = new Set([...declared].map(roleOf));
  const tokens = new Set(
    proseOf(plugin).flatMap(t => [...captures(t, TOKEN_RE)]),
  );

  const findings: Finding[] = [];
  for (const token of [...tokens].sort()) {
    if (roles.has(roleOf(token)) && !declared.has(token)) {
      findings.push({
        scope: plugin.dir,
        message: `reference \`${token}\` names no agent under agents/`,
      });
    }
  }
  for (const orphan of [...declared].sort()) {
    if (!tokens.has(orphan)) {
      findings.push({
        scope: plugin.dir,
        message: `agent "${orphan}" is referenced by no skill or asset`,
      });
    }
  }
  return findings;
}

/**
 * The design-adapter contract, on the materialized side.
 *
 * vwf calls three fixed skill names, which in turn delegate to three more fixed
 * names in the repo's own `.claude/` — the ones a `design-tool` pack lands. Every
 * way of getting that second hop wrong fails silently. A missing skill imports
 * nothing and reports no error; a skill carrying `disable-model-invocation: true`
 * is removed from the model's context altogether, so it cannot be invoked
 * programmatically and the import returns an empty payload that reads exactly
 * like a design nobody authored. Static checking is the only place either is
 * catchable.
 *
 * This used to key on a plugin keyworded `vwf-design-adapter`. Wave D deleted the
 * last such plugin, which would have left this rule permanently inert — a check
 * that can never fire is indistinguishable from one that always passes, and that
 * is the class of defect this file exists to prevent. So it now walks the packs
 * instead, where the three skills actually live.
 *
 * Asserting the literal absence of `true` would also pass for
 * `user-invocable: false`, which is model-invocable but hides the skill from the
 * user. So the check is for the explicit `false`, the one spelling meaning both.
 */
function checkDesignAdapters(plugins: readonly Plugin[]): Finding[] {
  const findings: Finding[] = [];

  const KINDS = [
    "design-import-screens",
    "design-import-design-system",
    "design-import-conversations",
  ] as const;

  for (const plugin of plugins) {
    // Every design-tool pack, discovered from the file list rather than the
    // filesystem — one entry per `stacks/design-tool/<tool>/pack.yaml`.
    const tools = plugin
      .files
      .map(file => /^stacks\/design-tool\/([^/]+)\/pack\.yaml$/.exec(file.path))
      .filter(match => match !== null)
      .map(match => match[1]!);

    for (const tool of tools) {
      for (const kind of KINDS) {
        const wanted = `stacks/design-tool/${tool}/skills/${kind}/SKILL.md`;
        const file = plugin.files.find(entry => entry.path === wanted);
        if (file === undefined) {
          findings.push({
            scope: `${plugin.dir}:stacks/design-tool/${tool}`,
            message:
              `design-tool pack is missing its "${kind}" skill — vwf delegates `
              + `to that exact name, and a missing one is silently unavailable `
              + `rather than a smaller feature`,
          });
          continue;
        }
        const front = frontmatterBlock(readText(file.absolute)) ?? "";
        if (!/^disable-model-invocation:\s*false\s*$/m.test(front)) {
          findings.push({
            scope: `${plugin.dir}:stacks/design-tool/${tool}`,
            message: `${kind} is not \`disable-model-invocation: false\` — vwf `
              + `delegates to it by name, and a skill the model cannot invoke `
              + `returns an empty payload rather than an error, which is `
              + `indistinguishable from a design nobody authored`,
          });
        }
      }
    }
  }
  return findings;
}

/**
 * The vwf stack-adapter contract.
 *
 * The same failure as the design adapter, on the other constructed name. vwf
 * reaches a stack plugin at `<plugin>-stack-menu` and `<plugin>-stack-template`
 * and never at anything it read from config, so a skill the model cannot invoke
 * does not error — `architecture` gets an empty menu, which is
 * indistinguishable from a plugin that genuinely offers nothing. The stack
 * menu is closed, so an empty one silently removes every option that plugin
 * was the only source of.
 *
 * Both keys are asserted, and they say different things. The explicit
 * `disable-model-invocation: false` rather than the mere absence of `true`,
 * because absence is not a claim — a file that never mentions the key would
 * pass a ban on `true` while saying nothing about the state vwf depends on.
 * And `user-invocable: false`, because an adapter skill is vwf's to call, not
 * a user's to type: it answers in a payload shape only vwf reads, so offering
 * it in the `/` menu spends a slot on a skill no user has a use for.
 *
 * It is checked in **both directions**, for the same reason the agent
 * cross-reference rule is. The keyword is what selects a plugin into this rule,
 * so a diff that drops the keyword also turns the rule off — silently, and
 * while leaving the half-built adapter in place. Since the Wave E retirement
 * exactly one plugin carries the keyword, which makes that one edit enough to
 * disable the rule outright. So the inverse also holds: a plugin shipping
 * either adapter skill must claim the keyword. Only deleting the keyword *and*
 * both skills clears the rule, and that is a deliberate, visible retirement of
 * the adapter rather than an accident.
 */
const STACK_ADAPTER_KINDS = ["stack-menu", "stack-template"] as const;

function checkStackAdapters(plugins: readonly Plugin[]): Finding[] {
  const findings: Finding[] = [];

  for (const plugin of plugins) {
    const skills = new Map(
      plugin.skills.map(path => [skillName(path), path] as const),
    );
    const keywords = plugin.manifest.keywords;
    if (!Array.isArray(keywords) || !keywords.includes("vwf-stack-adapter")) {
      const shipped = STACK_ADAPTER_KINDS
        .filter(kind => skills.has(`${plugin.dir}-${kind}`));
      if (shipped.length > 0) {
        findings.push({
          scope: plugin.dir,
          message: `ships ${
            shipped
              .map(kind => `"${plugin.dir}-${kind}"`)
              .join(" and ")
          } `
            + `but does not declare the \`vwf-stack-adapter\` keyword — the `
            + `keyword is what selects a plugin into this contract, so dropping `
            + `it disables the very check that would have caught the adapter `
            + `being half-retired`,
        });
      }
      continue;
    }

    for (const kind of STACK_ADAPTER_KINDS) {
      const expected = `${plugin.dir}-${kind}`;
      const path = skills.get(expected);
      if (path === undefined) {
        findings.push({
          scope: plugin.dir,
          message: `stack adapter is missing its "${expected}" skill`,
        });
        continue;
      }
      const front = frontmatterBlock(readText(join(plugin.root, path))) ?? "";
      if (!/^disable-model-invocation:\s*false\s*$/m.test(front)) {
        findings.push({
          scope: plugin.dir,
          message:
            `${expected} is not \`disable-model-invocation: false\` — vwf `
            + `reaches it by constructed name, and a skill the model cannot `
            + `invoke returns an empty menu rather than an error, which is `
            + `indistinguishable from a plugin that offers nothing`,
        });
      }
      if (!/^user-invocable:\s*false\s*$/m.test(front)) {
        findings.push({
          scope: plugin.dir,
          message:
            `${expected} is not \`user-invocable: false\` — an adapter skill `
            + `is vwf's to call, not a user's to type, and leaving it in the `
            + `\`/\` menu offers a skill that answers only a program`,
        });
      }
    }
  }
  return findings;
}

/**
 * At most one default bundle per (axis, platform).
 *
 * A bundle's frontmatter may carry `default: true`, which the stack menu passes
 * through and vwf's architecture menu preselects among the entries it offers
 * on a round — a list it has already filtered by the project's platforms. Two
 * flagged bundles on one axis conflict when either declares no `platforms:`
 * list (it is offered on every round of the axis) or their platform lists
 * intersect (both are offered on the shared platform's round). A conflict fails
 * nowhere: the menu preselects whichever it met first, which is the bundle
 * directory's sort order — a silent nondeterminism that a rename flips. An axis
 * whose flagged bundles all declare disjoint platforms carries one default per
 * platform. A non-boolean value (`default: "true"`, `default: yes`) is the
 * other silent case — the menu passes the key through as data and the
 * preselect rule asks for boolean `true`, so a string never preselects and
 * nobody is told.
 *
 * The frontmatter is parsed with the same reader the inventory generator uses,
 * so a bundle this rule reads is a bundle the inventory reads.
 */
function checkBundleDefaults(plugins: readonly Plugin[]): Finding[] {
  const findings: Finding[] = [];

  for (const plugin of plugins) {
    const flagged = new Map<
      string,
      { path: string; platforms: string[] | null; }[]
    >();

    for (const file of plugin.files) {
      if (!/^stacks\/bundles\/[^/]+\.md$/.test(file.path)) {
        continue;
      }
      const block = frontmatterBlock(readText(file.absolute));
      if (block === null) {
        continue;
      }
      let doc: unknown;
      try {
        doc = parseYaml(block);
      }
      catch {
        continue; // rule 4's finding, not this one's
      }
      if (typeof doc !== "object" || doc === null) {
        continue;
      }
      const { axis, default: value, platforms } = doc as Record<
        string,
        unknown
      >;
      if (value === undefined) {
        continue;
      }
      if (value !== true && value !== false) {
        findings.push({
          scope: `${plugin.dir}:${file.path}`,
          message: `bundle \`default\` is ${
            JSON.stringify(value)
          }, not a boolean — the menu preselects on \`default: true\` alone, `
            + `so any other spelling never preselects and reports nothing`,
        });
        continue;
      }
      if (value !== true) {
        continue;
      }
      const key = typeof axis === "string" ? axis : "";
      // An absent or empty list is "offered on every round of the axis".
      const declared = Array.isArray(platforms)
        ? platforms.filter((p): p is string => typeof p === "string")
        : [];
      flagged.set(key, [
        ...(flagged.get(key) ?? []),
        { path: file.path, platforms: declared.length > 0 ? declared : null },
      ]);
    }

    for (const [axis, entries] of flagged) {
      entries.forEach((a, i) => {
        for (const b of entries.slice(i + 1)) {
          const pair = `"${a.path}" and "${b.path}"`;
          if (a.platforms === null || b.platforms === null) {
            const bare = a.platforms === null ? a : b;
            findings.push({
              scope: plugin.dir,
              message: `${pair} both carry \`default: true\` on the `
                + `\`${axis}\` axis, and "${bare.path}" declares no `
                + `\`platforms:\` list, so it is offered on every round of `
                + `the axis — the menu preselects one entry per round, and two `
                + `flagged is whichever sorts first rather than a choice`,
            });
            continue;
          }
          const theirs = b.platforms;
          const shared = a.platforms.filter(p => theirs.includes(p));
          if (shared.length === 0) {
            continue;
          }
          findings.push({
            scope: plugin.dir,
            message: `${pair} both carry \`default: true\` on the `
              + `\`${axis}\` axis and share the platform${
                shared.length > 1 ? "s" : ""
              } ${shared.map(p => `\`${p}\``).join(", ")} — the menu `
              + `preselects one entry per round, and two flagged is whichever `
              + `sorts first rather than a choice`,
          });
        }
      });
    }
  }
  return findings;
}

/**
 * The four exclusion lists tool-config's gate assets ship, each in its tool's
 * own syntax, and the reader that lifts the entries out of each.
 *
 * dprint and taplo take globs; gitleaks and pre-commit take regexes — the
 * pre-commit one a single pattern, so its alternatives are the entries. The two
 * TOML readers are deliberately narrow: `scripts/` carries no TOML parser, and
 * a bracketed list of string literals is all either file holds.
 *
 * Three of the lists are the **formatters'** and must agree; the gitleaks
 * allowlist is the **scanner's** and is held to a subset of them instead — see
 * {@link checkExclusionSets}.
 */
const EXCLUSION_LISTS: readonly {
  readonly path: string;
  readonly syntax: "glob" | "regex";
  readonly role: "formatter" | "scanner";
  readonly entries: (source: string) => string[] | null;
}[] = [
  {
    path: `${TOOL_CONFIG_ASSETS}/dprint/.config/dprint.json`,
    syntax: "glob",
    role: "formatter",
    entries: source => {
      const excludes = (JSON.parse(source) as { excludes?: unknown; }).excludes;
      return isStringList(excludes) ? excludes as string[] : null;
    },
  },
  {
    path: `${TOOL_CONFIG_ASSETS}/dprint/.config/taplo.toml`,
    syntax: "glob",
    role: "formatter",
    entries: source => tomlStringList(source, "exclude"),
  },
  {
    path: `${TOOL_CONFIG_ASSETS}/gitleaks/.config/gitleaks.toml`,
    syntax: "regex",
    role: "scanner",
    entries: source => tomlStringList(source, "paths"),
  },
  {
    path: `${TOOL_CONFIG_ASSETS}/pre-commit/.config/pre-commit-config.yaml`,
    syntax: "regex",
    role: "formatter",
    entries: source => {
      const exclude = (parseYaml(source) as { exclude?: unknown; } | null)
        ?.exclude;
      // No global exclude is a legitimate config that excludes nothing.
      if (exclude === undefined) {
        return [];
      }
      return typeof exclude === "string" ? regexAlternatives(exclude) : null;
    },
  },
];

/**
 * The string literals inside a TOML array assigned to `key`, or `null` when
 * no such assignment exists. Reads `'''…'''`, `'…'` and `"…"` alike, since
 * gitleaks spells its regexes as literal strings and taplo its globs as basic
 * ones.
 */
function tomlStringList(source: string, key: string): string[] | null {
  // The array body is every literal up to the first `]` outside a literal, so
  // a `]` inside a quoted entry (a regex character class) does not end it.
  const match = new RegExp(
    `^${key}\\s*=\\s*\\[((?:'''.*?'''|'[^']*'|"[^"]*"|[^\\]])*)\\]`,
    "ms",
  )
    .exec(source);
  if (match === null) {
    return null;
  }
  return [...(match[1] ?? "").matchAll(/'''(.*?)'''|'([^']*)'|"([^"]*)"/gs)]
    .map(m => m[1] ?? m[2] ?? m[3])
    .filter((s): s is string => s !== undefined);
}

/**
 * The alternatives of pre-commit's global `exclude` regex, as entries.
 *
 * `^(a/|b/)` and `^a/|^b/` both read as two entries; a `(?x)` verbose pattern
 * has its whitespace and comments removed first, and the `(^|/)` anchor —
 * "at the root or under any directory", a glob's two stars — reads as `^` before
 * the grouping is looked at, so it never counts as a group of its own. A
 * prefix or suffix outside a top-level group applies to every alternative
 * inside it. An alternative carrying two top-level groups has no one reading
 * as entries, so it is refused — the reader throws, and rule 15 reports the
 * file as unreadable with this reason.
 */
function regexAlternatives(pattern: string): string[] {
  let source = pattern;
  if (source.startsWith("(?x)")) {
    source = source.slice(4).replace(/#[^\n]*/g, "").replace(/\s+/g, "");
  }
  source = source.replace(REGEX_ANYWHERE_ANCHOR, "^");
  const parts = splitTopLevel(source);
  if (parts.length > 1) {
    return parts.flatMap(regexAlternatives);
  }
  if (topLevelGroups(source) > 1) {
    throw new Error(
      "more than one alternation group — spell one entry per line",
    );
  }
  const group = /^([^()]*)\((?:\?:)?(.*)\)([^()]*)$/s.exec(source);
  if (group === null) {
    return [source];
  }
  const [, prefix = "", inner = "", suffix = ""] = group;
  return splitTopLevel(inner).map(alt => `${prefix}${alt}${suffix}`);
}

/** A regex's `(^|/)` or `(?:^|/)` — the anchor a glob spells with two stars. */
const REGEX_ANYWHERE_ANCHOR = /\((?:\?:)?\^\|\/\)/g;

/**
 * Walk a regex's characters with the nesting depth and whether the cursor is
 * inside a bracket class — where `(`, `)` and `|` are literals.
 */
function* regexChars(
  source: string,
): Generator<{ char: string; depth: number; inClass: boolean; }> {
  let depth = 0;
  let inClass = false;
  for (let index = 0; index < source.length; index++) {
    let char = source[index]!;
    if (char === "\\") {
      char += source[index + 1] ?? "";
      index++;
      yield { char, depth, inClass };
      continue;
    }
    if (inClass) {
      inClass = char !== "]";
      yield { char, depth, inClass: true };
      continue;
    }
    if (char === "[") {
      inClass = true;
    }
    else if (char === "(") {
      depth++;
    }
    else if (char === ")") {
      depth--;
    }
    yield { char, depth, inClass };
  }
}

/** Split a regex on `|` at nesting depth zero, outside any bracket class. */
function splitTopLevel(source: string): string[] {
  const parts: string[] = [];
  let current = "";
  for (const { char, depth, inClass } of regexChars(source)) {
    if (char === "|" && depth === 0 && !inClass) {
      parts.push(current);
      current = "";
      continue;
    }
    current += char;
  }
  parts.push(current);
  return parts;
}

/** How many `(` open at depth zero, outside any bracket class. */
function topLevelGroups(source: string): number {
  let count = 0;
  for (const { char, depth, inClass } of regexChars(source)) {
    if (char === "(" && depth === 1 && !inClass) {
      count++;
    }
  }
  return count;
}

/**
 * One entry in the shape every syntax reduces to.
 *
 * A regex loses its anchors — `^`, `$`, and the `(^|/)` that spells "anywhere"
 * — its `\.` escapes and its `[^/]*` or `.*` (a glob's `*`); every
 * entry then loses a leading slash or `**` segment and a trailing slash, with
 * or without the one or two stars after it — the spellings of "this directory,
 * wherever it sits" that the four tools take. What survives is the name the
 * sets are compared on.
 */
function normalizeExclusion(entry: string, syntax: "glob" | "regex"): string {
  let value = entry.trim();
  if (syntax === "regex") {
    value = value
      .replace(REGEX_ANYWHERE_ANCHOR, "^")
      .replace(/^\^/, "")
      .replace(/\$$/, "")
      .replace(/\[\^\/\]\*|\.\*/g, "*")
      .replace(/\\([./])/g, "$1");
  }
  value = value.replace(/^\/+/, "");
  while (value.startsWith("**/")) {
    value = value.slice(3);
  }
  return value.replace(/(?:\/\*{1,2}|\/)$/, "");
}

/**
 * Rule 15: the formatters' exclusion lists state one set, and the scanner's
 * allowlist is a subset of it.
 *
 * A generated tree — `node_modules/`, `dist/`, `graphify-out/` — is excluded
 * from formatting, from TOML formatting and from every pre-commit hook, and
 * each tool reads its own list in its own syntax. The convention is stated
 * once and copied three times, so the drift is the usual kind: a tree added to
 * one list and not the others, which no tool reports — the formatter simply
 * formats it. Compared as sets after normalisation; an entry in some of the
 * three and not the rest is the finding, naming the files on each side.
 *
 * The gitleaks allowlist is held the other way round. The pack extends
 * upstream's default config, whose built-in allowlist already skips `.git`,
 * `node_modules` and the named lockfiles, and `.claude/` is authored source a
 * scanner must scan — so the formatters' set is wider than the scanner's by
 * design, and a formatter-excluded tree the scanner still reads is no finding.
 * A tree the scanner skips that no formatter excludes is: an allowlist entry
 * with no generated tree behind it is a scanner quietly not scanning.
 *
 * The plugin carrying the tool-config skill must carry all four lists: a list
 * missing there is a finding, since a moved file would otherwise end the check
 * silently. In any other plugin the rule has nothing to compare.
 */
function checkExclusionSets(plugins: readonly Plugin[]): Finding[] {
  const findings: Finding[] = [];

  for (const plugin of plugins) {
    const owner = existsSync(join(plugin.root, TOOL_CONFIG_SKILL));
    const present = new Map<string, Set<string>>();
    let scanner: { path: string; set: Set<string>; } | null = null;
    for (const list of EXCLUSION_LISTS) {
      const absolute = join(plugin.root, list.path);
      if (!existsSync(absolute)) {
        if (owner) {
          findings.push({
            scope: plugin.dir,
            message:
              `${list.path}: exclusion list is missing — the tool-config `
              + `skill ships all four lists`,
          });
        }
        continue;
      }
      let entries: string[] | null;
      try {
        entries = list.entries(readText(absolute));
      }
      catch (error) {
        findings.push({
          scope: plugin.dir,
          message: `${list.path}: exclusion list could not be read — ${
            firstLine(error)
          }`,
        });
        continue;
      }
      if (entries === null) {
        findings.push({
          scope: plugin.dir,
          message: `${list.path}: declares no exclusion list to compare`,
        });
        continue;
      }
      const set = new Set(entries.map(e => normalizeExclusion(e, list.syntax)));
      if (list.role === "scanner") {
        scanner = { path: list.path, set };
      }
      else {
        present.set(list.path, set);
      }
    }

    const union = new Set([...present.values()].flatMap(s => [...s]));
    if (present.size >= 2) {
      for (const entry of [...union].sort()) {
        const has = [...present].filter(([, set]) => set.has(entry)).map(
          ([path]) => path,
        );
        const lacks = [...present.keys()].filter(path => !has.includes(path));
        if (lacks.length === 0) {
          continue;
        }
        findings.push({
          scope: plugin.dir,
          message: `exclusion \`${entry}\` is in ${has.join(", ")} and not in ${
            lacks.join(", ")
          } — the formatters' exclusion lists state one set`,
        });
      }
    }

    if (scanner !== null && present.size > 0) {
      for (const entry of [...scanner.set].sort()) {
        if (union.has(entry)) {
          continue;
        }
        findings.push({
          scope: plugin.dir,
          message: `${scanner.path}: allowlists \`${entry}\`, which no `
            + `formatter list excludes — the scanner's allowlist is a subset `
            + `of the formatters' set`,
        });
      }
    }
  }
  return findings;
}

// ---------------------------------------------------------------------------
// The technology-free vwf guard
// ---------------------------------------------------------------------------

/**
 * Tokens that name a concrete technology. vwf may not use any of them.
 *
 * Anchored on both sides on purpose. The unanchored form this list started as
 * matched `hono` inside "honor" and "honored" across a dozen files, which is the
 * kind of false positive that gets a guard deleted rather than fixed.
 */
const TOOL_TOKENS = [
  "firebase",
  "firestore",
  "cloud run",
  "cloud-run",
  "playwright",
  "axe-core",
  "pnpm",
  "npm",
  "bun",
  "turbo",
  "turborepo",
  "docker",
  "wait-on",
  "temporal",
  "terraform",
  "pulumi",
  "refine",
  "astro",
  "hono",
  "vitest",
  "doppler",
  "postgres",
  "grafana",
  "opentelemetry",
  // The design tools. Only ONE of the three tokens is listable, and the reason
  // is the same false-positive trap the anchoring above exists for:
  //
  //   `stitch` is an ordinary English word, and vwf's screens doctrine leans on
  //   it — "stitch its happy path", "the stitch contract", "an out-of-order
  //   stitch". Three vwf documents use it that way and name no design tool at
  //   all. Anchoring does not help, because this is the same word, not a
  //   substring of a different one.
  //
  //   `lovable` is likewise an ordinary adjective. It happens to be unused in
  //   vwf today, so listing it would pass right now and break on the first
  //   sentence that calls an interface lovable — a guard that fails later, for a
  //   reason unrelated to what it guards.
  //
  // `claude-design` is distinctive, and it is also the token that actually
  // caused the bug this entry exists for: vwf reached that one tool's MCP server
  // by hardcoded prefix, leaving the other two advertised and silently
  // non-functional. The prefix itself is guarded separately below, which is the
  // part that generalises to all three.
  "claude-design",
];

/**
 * The two places vwf is allowed to name a tool, both reviewed and both
 * recognition rather than prescription — vwf naming a tool to read a repo it did
 * not choose, never to tell anyone what to use.
 *
 * Deliberately a path allowlist, not a weakened pattern. Adding a third entry
 * should require arguing for it, which is the point.
 */
const TOOL_NAME_EXCEPTIONS = new Set([
  // States the rule, which cannot be stated without an example of what it bans.
  "assets/stack-adapter.md",
  // Documents a repo it did not choose, so it has to recognise what is there.
  "skills/readme/SKILL.md",
  // Maps product names to the prose nouns that replace them. The names are the
  // LOOKUP KEY: an author who wrote "npm" finds the row by searching for it, so
  // removing them would break the one job the table has. Pure recognition —
  // every occurrence sits in an "instead of" column whose row prescribes the
  // opposite.
  "assets/capability-vocabulary.md",
  // The three design-adapter references USED TO BE allowlisted here. They are
  // gone: Wave D moved them to stackgen's `design-tool` packs, which materialize
  // the resolved tool's adapter into the repo's own `.claude/` under three fixed
  // skill names vwf invokes. vwf now names no design tool anywhere, so the
  // exceptions that entry needed are retired rather than maintained.
  //
  // That is the intended direction whenever an allowlist entry stops feeling
  // arguable: move the naming out of vwf, never widen the pattern.
]);

/** How far either side of a match still counts as the same enumeration. */
const ENUMERATION_WINDOW = 100;

/**
 * Tokens that prove an enumeration without being banned themselves.
 *
 * `lovable` and `stitch` are the other two values of the `design` config key, so
 * their presence beside `claude-design` is exactly what makes a passage a
 * vocabulary rather than a recommendation — but neither can go in TOOL_TOKENS,
 * because both are ordinary English words (see the note there). Keeping the
 * evidence set wider than the prohibition set is what lets a token be recognised
 * as enumerated by a peer that is not itself policed.
 */
const ENUMERATION_PEERS = ["lovable", "stitch"];

/**
 * Drop fenced code blocks. A fence is a worked example of a config file, and a
 * config example has to show real accepted values — `design: lovable`
 * prescribes nothing, it demonstrates the key's shape.
 */
function stripFences(body: string): string {
  return body.replace(/^```[\s\S]*?^```/gm, "");
}

/**
 * The two sides are deliberately asymmetric.
 *
 * Leading keeps `-`, so a token is not matched as the *tail* of a longer
 * compound: `axe-core` must not be found inside some other hyphenated name, and
 * `npm` must not be found inside `pnpm-workspace`.
 *
 * Trailing drops it, because a banned token used as the *head* of a compound is
 * still the banned token doing the prescribing. `Grafana-side by default` and
 * `deploy/npm-package` both escaped the symmetric form — as would
 * `docker-compose`, `postgres-backed` and `terraform-managed`.
 */
const anchored = (token: string) =>
  new RegExp(`(^|[^a-z0-9-])${token}([^a-z0-9]|$)`, "g");

/**
 * Does this document *prescribe* the token, rather than enumerate it?
 *
 * The distinction that matters: naming ONE tool tells the reader what to use;
 * listing the alternatives describes the domain of a config key vwf owns. The
 * design-adapter contract has to say the value is one of `claude-design`,
 * `lovable` or `stitch` — that is the vocabulary, not a recommendation.
 *
 * So an occurrence is exempt when at least one OTHER token sits within
 * `ENUMERATION_WINDOW` characters of it. The window is character-based rather
 * than line-based on purpose: the real enumerations wrap mid-list, and a
 * line-based rule would flag the first line of every one of them.
 */
export function prescribes(body: string, token: string): boolean {
  const others = [...TOOL_TOKENS, ...ENUMERATION_PEERS].filter(t =>
    t !== token
  );
  for (const match of body.matchAll(anchored(token))) {
    const at = match.index ?? 0;
    const window = body.slice(
      Math.max(0, at - ENUMERATION_WINDOW),
      at + token.length + ENUMERATION_WINDOW,
    );
    const enumerated = others.some(other => anchored(other).test(window));
    if (!enumerated) {
      return true;
    }
  }
  return false;
}

/**
 * A `${VAR}` or `${VAR:-default}` expansion, which Claude Code performs in an
 * MCP server's `command`, `args`, `env`, `url` and `headers`.
 */
const EXPANSION_RE = /\$\{[^}]*\}/g;

/**
 * Every stdio invocation vwf's manifest declares, as one string per server.
 *
 * `type: http` servers have no `command` and contribute nothing. vwf's
 * mempalace entry is a stdio command, `sh -c "mise x -- mempalace-mcp"`, which
 * the runner guard reads like any other — `mise` is not a `TOOL_TOKENS` entry.
 */
function invocations(manifest: Manifest): string[] {
  const servers = manifest.mcpServers;
  if (typeof servers !== "object" || servers === null) {
    return [];
  }
  return Object.values(servers as Record<string, unknown>).flatMap(server => {
    if (typeof server !== "object" || server === null) {
      return [];
    }
    const { command, args } = server as { command?: unknown; args?: unknown; };
    if (typeof command !== "string") {
      return [];
    }
    const argv = asArray(args).filter(a => typeof a === "string");
    return [[command, ...argv].join(" ")];
  });
}

/**
 * The manifest half of the technology-free guard: a runner vwf picked *for* the
 * user.
 *
 * The prose rule cannot be reused verbatim here, and the difference is the whole
 * point. A manifest has to name something executable — `sh` is a tool name too —
 * so the bar is not "names no tool" but **"the name is overridable"**. vwf's
 * context7 entry declared `"command": "pnpm"`, which a bun user cannot satisfy
 * and which fails as a dead MCP server rather than as a missing prerequisite;
 * the same entry written as `${CONTEXT7_RUNNER:-pnpm dlx}` keeps pnpm as the
 * recommendation while letting `bunx`, `npx -y` or an absolute path answer.
 *
 * So expansions are elided before the token scan. A token surviving that is one
 * no environment variable can displace, which is the actual defect.
 */
function checkManifestRunners(vwf: Plugin): Finding[] {
  const findings: Finding[] = [];
  for (const invocation of invocations(vwf.manifest)) {
    const fixed = invocation.toLowerCase().replaceAll(EXPANSION_RE, " ");
    const hits = TOOL_TOKENS.filter(token => anchored(token).test(fixed));
    if (hits.length > 0) {
      findings.push({
        scope: "vwf:.claude-plugin/plugin.json",
        message: `hardcodes ${hits.map(h => `"${h}"`).join(", ")} in the `
          + `"${invocation}" MCP server invocation — the dependency is vwf's, `
          + `the runner is the user's. Put it behind a \${VAR:-default} `
          + `expansion so the recommendation stays and another runner still `
          + `works; a fixed one fails as a dead server, not as a missing `
          + `prerequisite.`,
      });
    }
  }
  return findings;
}

/**
 * The regression guard: vwf ships no stack template and names no tool.
 *
 * `assets/stack-adapter.md` has stated this since it was written and nothing
 * enforced it, which is how 17 templates accumulated inside vwf. Without this
 * check the whole re-architecture is one refactor away from unwinding.
 *
 * The `languages` half of the old guard is gone with the key it read: the
 * neutral manifest's `languages:` had no consumer but this check and the two
 * plugins declaring it folded their rows into `keywords`, where they are
 * metadata rather than a vocabulary anything resolves against.
 */
function checkVwfIsTechnologyFree(plugins: readonly Plugin[]): Finding[] {
  const findings: Finding[] = [];
  const vwf = plugins.find(p => p.dir === "vwf");
  if (vwf === undefined) {
    return findings;
  }

  findings.push(...checkManifestRunners(vwf));

  for (const file of vwf.files) {
    if (file.path.startsWith("stacks/")) {
      findings.push({
        scope: "vwf",
        message: `ships a stack template at ${file.path} — vwf states the `
          + `requirement and a plugin states the mechanism, so every template `
          + `belongs to a stack plugin (assets/stack-adapter.md)`,
      });
    }
  }

  for (const file of vwf.files) {
    if (!file.path.endsWith(".md") || TOOL_NAME_EXCEPTIONS.has(file.path)) {
      continue;
    }
    // The conformance bundle is a worked EXAMPLE of a product's blueprint, not
    // vwf's own prose. A blueprint names its product's technology by design.
    if (file.path.startsWith("assets/examples/")) {
      continue;
    }
    const body = stripFences(readText(file.absolute).toLowerCase());

    // vwf talks to NO design tool: it calls three fixed adapter skill names and
    // the adapter resolves which tool answers. Reaching a design tool's own MCP
    // server skips that entirely, and does it for exactly one tool — which is
    // how `feedback canvas` came to work for `claude-design` and silently do
    // nothing for the other two tokens the menu advertises.
    //
    // Generalized at Wave D. It used to match `mcp__plugin_design-tools_`, the
    // prefix a plugin-declared server got. That plugin is gone and servers now
    // land in the project's own `.mcp.json`, which scopes them `mcp__<server>__`
    // — so matching the old prefix alone would have quietly stopped catching
    // anything. Both spellings are matched: a repo upgrading from an earlier
    // version can still carry the old one in its prose.
    const designMcp = TOOL_TOKENS
      .filter(token =>
        body.includes(`mcp__plugin_design-tools_${token}`)
        || new RegExp(`mcp__${token}__`).test(body)
      );
    if (designMcp.length > 0) {
      findings.push({
        scope: `vwf:${file.path}`,
        message: `reaches the ${designMcp.map(t => `"${t}"`).join(", ")} MCP `
          + `server directly — vwf talks to no design tool, it calls the three `
          + `fixed adapter skill names and lets the adapter resolve which tool `
          + `answers (assets/design-adapter.md). Reaching one tool's server `
          + `makes every other configured tool silently return nothing.`,
      });
    }

    // A token already reported above is not reported again by the generic rule.
    // Both would fire on the same line — an MCP tool name reads as prescription
    // — and the generic message's advice ("add the path to TOOL_NAME_EXCEPTIONS")
    // is exactly wrong here: an allowlist entry would bless the seam violation
    // rather than fix it. The specific finding is the one that helps.
    const hits = TOOL_TOKENS.filter(token =>
      !designMcp.includes(token) && prescribes(body, token)
    );
    if (hits.length > 0) {
      findings.push({
        scope: `vwf:${file.path}`,
        message: `names ${hits.map(h => `"${h}"`).join(", ")} — vwf states the `
          + `requirement, the plugin states the mechanism, so a tool name here `
          + `is a bug in that contract (assets/stack-adapter.md). If this is `
          + `genuinely recognition rather than prescription, add the path to `
          + `TOOL_NAME_EXCEPTIONS with a reason.`,
      });
    }
  }

  return findings;
}

// ---------------------------------------------------------------------------
// Retired vocabulary
// ---------------------------------------------------------------------------

/**
 * A word the corpus stopped meaning, and the one condition under which a line
 * carrying it is still a live claim rather than history.
 */
interface RetiredTerm {
  /** How a finding names the term. */
  readonly name: string;
  readonly pattern: RegExp;
  /**
   * A further test on the whole line, for a term whose bare presence proves
   * nothing. Omitted, the pattern alone decides.
   */
  readonly when?: (line: string) => boolean;
}

/**
 * The vocabulary the 2026-09-04 drift sweep found stated as live long after it
 * was retired — each entry is a class of finding that recurred across files,
 * not a one-off. Case-sensitive on purpose: the retired spellings are exact,
 * and `Web` in a sentence is the ordinary word.
 *
 * The list is meant to stay short. A hit on a genuinely historical line is
 * fixed by the narrowest exemption in `RETIRED_LINE_EXEMPT` or
 * `RETIRED_FILE_EXEMPT`, never by deleting the pattern — a pattern that goes
 * is a class of drift that comes back.
 */
const RETIRED_TERMS: readonly RetiredTerm[] = [
  // The screen platform token, retired at format 22 for `site` / `webapp`.
  // Backticked only, since bare `web` is a word — and even backticked it is a
  // perfectly good registry PROJECT name (`api`, `web`, `console`), which the
  // worked example uses. What marks the platform sense is company: a sibling
  // platform token on the same line, or the word "token".
  {
    name: "`web` platform",
    pattern: /`web`/,
    when: line => /`(?:mobile|tablet|desktop|auto)`|token/.test(line),
  },
  // The UX gate is the repo's own unprefixed `ux-gate` skill. The literal
  // `<plugin>-ux-gate` spelling names no skill and only ever appears where the
  // retired construction is being explained, so it is not a hit.
  { name: "-ux-gate", pattern: /(?<!<plugin>)-ux-gate/ },
  // The template paths of the layer vwf no longer ships or describes.
  { name: "stacks/project/", pattern: /stacks\/project\// },
  { name: "assets/stacks/", pattern: /assets\/stacks\// },
  // Six axes, per assets/stack-adapter.md.
  {
    name: "four axes",
    pattern: /four (?:stack |independent )?axes|four menus|four stack rounds/,
  },
  // Dropped from both plugins' template shape.
  { name: "private_plane", pattern: /private_plane/ },
  // The plugin that dissolved into stackgen, named as one that still exists.
  // The uninstall instruction is the one live sentence that must keep naming
  // it; "dissolved" is covered by the line exemption below.
  {
    name: "`devtools` plugin",
    pattern: /`devtools`/,
    when: line => line.includes("plugin") && !line.includes("uninstall"),
  },
];

/**
 * A line that carries one of these is talking about the past, which is the
 * only way retired vocabulary is allowed to appear. Stems rather than words
 * (`retire` covers "retires" and "retirement", `migrat` covers "migrating")
 * because the migration notes conjugate freely; `dissolved` and `moved` are
 * how this corpus says a plugin or a template stopped being where it was; and
 * `format 2N` covers the lineage notes naming the format a token retired at.
 *
 * Tested against the flagged line alone, by ruling. A migration note wrapped
 * over a dozen lines with its marker on the first therefore has to repeat a
 * marker on whichever line carries the token — a small tax, paid so that a
 * "retired at format 22" sentence never shields a live claim beneath it.
 */
const RETIRED_LINE_EXEMPT =
  /retire|migrat|dissolved|moved|→|pre-22|[Ff]ormat 2\d/;

/**
 * Files whose whole job is history: the format lineage, and any changelog.
 * The lineage path is vwf's, and a second plugin growing one would be a second
 * entry here rather than a wider match.
 */
const RETIRED_FILE_EXEMPT = [
  /^skills\/setup\/references\/format-lineage\.md$/,
  /(?:^|\/)changelog\.md$/i,
];

/**
 * Retired vocabulary stated as live.
 *
 * The recurrence class of every drift sweep this repo has run: a token is
 * renamed at the source of truth, the lineage records the rename, and a dozen
 * other files keep using the old word as if nothing happened. Nothing fails —
 * the old word is prose, not a reference — so the only reader that can catch it
 * is a static one holding the retired spellings. The line-level exemption is
 * what keeps this a gate on *claims* rather than on words: a line that says
 * the token was retired is the one place it must still be spelled.
 */
function checkRetiredVocabulary(plugin: Plugin): Finding[] {
  const findings: Finding[] = [];

  for (const file of plugin.files) {
    if (!/\.(?:md|ya?ml)$/.test(file.path)) {
      continue;
    }
    if (RETIRED_FILE_EXEMPT.some(re => re.test(file.path))) {
      continue;
    }
    const lines = readText(file.absolute).split("\n");
    for (const [index, line] of lines.entries()) {
      if (RETIRED_LINE_EXEMPT.test(line)) {
        continue;
      }
      for (const term of RETIRED_TERMS) {
        if (term.pattern.test(line) && (term.when?.(line) ?? true)) {
          findings.push({
            scope: `${plugin.dir}:${file.path}:${index + 1}`,
            message: `states retired vocabulary ${term.name} as live — say `
              + `what replaced it, or mark this line as history (retired, `
              + `migration, dissolved, moved, →, pre-22, format 2N)`,
          });
        }
      }
    }
  }
  return findings;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Every piece of authored prose in a plugin.
 *
 * Frontmatter is stripped from skills and agents and kept for everything else:
 * a `description:` is a folded scalar full of the same backticked vocabulary the
 * body uses, and letting it into the token set makes an agent look referenced by
 * its own file.
 */
function proseOf(plugin: Plugin): string[] {
  const isDoc = (f: PluginFile) =>
    f.path.endsWith("/SKILL.md") || f.path.startsWith("agents/");

  const docs = plugin.files.filter(f => f.path.endsWith(".md"));
  return docs.map(f =>
    isDoc(f) ? bodyOf(readText(f.absolute)) : readText(f.absolute)
  );
}

/** First capture group of every match, skipping any that did not participate. */
function* captures(text: string, pattern: RegExp): Generator<string> {
  for (const match of text.matchAll(pattern)) {
    const value = match[1];
    if (value !== undefined) {
      yield value;
    }
  }
}

/** The role suffix an agent name ends with — `execute-coder` -> `coder`. */
function roleOf(name: string): string {
  return name.slice(name.lastIndexOf("-") + 1);
}

/** First line of an error message, for a one-line finding. */
function firstLine(error: unknown): string {
  return String((error as Error).message).split("\n")[0] ?? "";
}

function asArray(value: unknown): readonly unknown[] {
  return Array.isArray(value) ? value : [];
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

if (import.meta.main) {
  const repoRoot = join(import.meta.dirname, "..", "..");
  const plugins = readPlugins(join(repoRoot, "plugins"));
  const findings = check(repoRoot);

  for (const { scope, message } of findings) {
    console.error(`  FAIL ${scope}: ${message}`);
  }

  const skills = plugins.reduce((n, p) => n + p.skills.length, 0);
  const agents = plugins.reduce((n, p) => n + p.agents.length, 0);
  console.log(
    `\nchecked ${plugins.length} plugins, ${skills} skills, ${agents} agents`,
  );

  if (findings.length > 0) {
    console.error(`\n${findings.length} finding(s)`);
    process.exit(1);
  }
  console.log("\nAll checks passed.");
}
