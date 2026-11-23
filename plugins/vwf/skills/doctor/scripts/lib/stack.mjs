// The stack checks execute stops on (references/stack-checks.md): mise, a
// custom pin, template platform coverage, an iac project that is not its own
// repo with the D7 decline, and pinned not materialized. Severities follow
// stack-checks.md; D9 settles the rest. Every other row is degraded and never
// stops execute (D28): a registry project bootstrap has no
// repo.projects.<name> for (D26), a project no bootstrap tool of category
// languages links (D18, D27), a bundle tool not selected or not linked to its
// project, a materialized entry with no tools: key, an LSP server of
// `bootstrap lsp --json` missing from vwf-tools, a design tool with no
// reference in vwf-tools, an addon absent from the claude tool's
// plugins.project, and a lockfile row of a retired pack kind (R5b D8). A
// project's folder and its tools are read through bootstrap in the repo that
// holds it (D9, D11). A capability a project's platforms imply and its repo
// lacks is a degraded harness row too (D37, lib/harness.mjs).

import {
  existsSync,
  readFileSync,
} from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import {
  BootstrapError,
  configGet,
  describe,
  linkedTools,
  lspServers,
  projectFolder,
  projectRepo,
  selectedTool,
} from "./bootstrap.mjs";
import {
  harnessRows,
  miseTasks,
} from "./harness.mjs";
import {
  ChecksError,
  isObject,
  isPinned,
  onPath,
  readFrontmatter,
  readYaml,
  row,
  slugOf,
} from "./util.mjs";

const STACK_AXES = ["template", "services", "deploy"];
/** The platforms that need no language tool (D27). */
const TOOLLESS = ["iac", "cicd", "misc"];
const PROJECT_AXES = ["design", "cicd", "stylesheet"];
/** The bootstrap tool categories whose tools link a project (D29). */
const LINKED = ["languages", "package-managers"];
/** The design-import role skills a design tool has a reference for (D8). */
const DESIGN_ROLES = ["design-import-screens", "design-import-design-system", "design-import-conversations"];
/** The pack kinds R5a retired; a lockfile row of one awaits conversion (D6). */
const RETIRED_KINDS = ["language", "package-manager", "toolchain-gate", "design-tool", "addon"];

function stackOf(config, name) {
  const project = config.projects?.[name];
  return isObject(project) ? project : {};
}

/** D9 (a): any axis pinned anywhere; the pins alone decide (D25). */
function needsMise(config) {
  const projects = isObject(config.projects) ? Object.values(config.projects) : [];
  for (const project of projects.filter(isObject)) {
    const stack = isObject(project.stack) ? project.stack : {};
    if (STACK_AXES.some((axis) => isPinned(stack[axis]))) {
      return true;
    }
    if (PROJECT_AXES.some((axis) => isPinned(project[axis]))) {
      return true;
    }
  }
  return isPinned(config.repo?.stack?.template);
}

export function miseRows({ base, config }) {
  const severity = needsMise(config) ? "blocking" : "degraded";
  const rows = [];
  if (onPath("mise") === null) {
    rows.push(
      row("mise", severity, null, "mise", "mise is not on PATH", "curl https://mise.run | sh"),
    );
  }
  if (!existsSync(join(base, ".config", "mise.toml")) && !existsSync(join(base, ".config", "mise", "conf.d"))) {
    rows.push(
      row(
        "mise",
        severity,
        null,
        ".config/mise",
        "the repo has neither .config/mise.toml nor .config/mise/conf.d/",
        "/vwf:setup reshape",
      ),
    );
  }
  return rows;
}

function isCustom(pin) {
  return typeof pin === "string" && slugOf(pin) === "custom";
}

/** The repo-level custom pin: repo.stack.template. */
export function repoPinRows({ config }) {
  return isCustom(config.repo?.stack?.template)
    ? [
      row(
        "custom-pin",
        "blocking",
        null,
        "repo.stack.template",
        "repo.stack.template is custom, retired in config_format 14",
        "/vwf:setup",
      ),
    ]
    : [];
}

/** The entries: list of an adapter's lockfile in `dir`, or null. */
function lockEntries(dir, adapter) {
  const entries = readYaml(join(dir, ".claude", adapter, "lock.yaml"))?.entries;
  return Array.isArray(entries) ? entries.filter(isObject) : null;
}

/**
 * D9 (b): the adapter whose lockfile in `dir` names the slug, with the
 * template file; null when no adapter in stacks: materialized it.
 */
function materialized(dir, adapters, slug) {
  for (const adapter of adapters) {
    const entries = lockEntries(dir, adapter);
    if (entries === null) {
      continue;
    }
    const path = `.claude/${adapter}/templates/${slug}.md`;
    if (entries.some((e) => e.slug === slug || e.path === path)) {
      return { adapter, file: join(dir, path) };
    }
  }
  return null;
}

/**
 * D6, D8: one degraded row per repo whose adapter lockfile still holds rows
 * of a retired pack kind — source pack/<kind>/<slug>@<version> — naming the
 * refs; /vwf:setup converts them through stackgen-sync.
 */
export function oldPackRows(dir, adapters) {
  const rows = [];
  for (const adapter of adapters) {
    const refs = new Set(
      (lockEntries(dir, adapter) ?? [])
        .map((e) => (typeof e.source === "string" ? e.source : ""))
        .filter((source) => RETIRED_KINDS.some((kind) => source.startsWith(`pack/${kind}/`))),
    );
    if (refs.size > 0) {
      rows.push(
        row(
          "old-pack-row",
          "degraded",
          null,
          `.claude/${adapter}/lock.yaml`,
          `${dir}: .claude/${adapter}/lock.yaml holds rows of a retired pack kind: ${[...refs].join(", ")}`,
          "/vwf:setup",
        ),
      );
    }
  }
  return rows;
}

/** The vwf-tools local plugin on this machine (stackgen's output tree). */
function vwfTools() {
  return join(homedir(), ".claude", "plugins", "local", "vwf-tools");
}

/** The lspServers keys of the vwf-tools manifest; none when it is absent. */
function vwfToolsServers() {
  const file = join(vwfTools(), ".claude-plugin", "plugin.json");
  if (!existsSync(file)) {
    return [];
  }
  let manifest;
  try {
    manifest = JSON.parse(readFileSync(file, "utf8"));
  } catch (error) {
    throw new ChecksError(`${file}: ${error.message}`);
  }
  return isObject(manifest?.lspServers) ? Object.keys(manifest.lspServers) : [];
}

/**
 * D8, D35: each server of `bootstrap lsp --json` run in `dir` that the
 * vwf-tools manifest does not hold is one degraded row.
 */
function lspRows(dir, held) {
  return bootstrapRead(() => lspServers(dir))
    .filter((server) => !held().includes(server))
    .map((server) =>
      row(
        "lsp",
        "degraded",
        null,
        server,
        `LSP server ${server}, which bootstrap lsp lists in ${dir}, is not in the vwf-tools plugin`,
        "/vwf:setup",
      )
    );
}

/**
 * D8, D23, D25, D29, D33: each tools: name of the project's materialized
 * entry is selected in its repo, and one of category languages or
 * package-managers links the project. An entry with no tools: key is one row.
 */
function toolLinkRows(name, template, frontmatter, data, dir) {
  if (!Array.isArray(frontmatter?.tools)) {
    return [
      row(
        "bundle-tools",
        "degraded",
        name,
        template,
        `the materialized entry of ${template} in ${dir} has no tools: list`,
        "/vwf:setup",
      ),
    ];
  }
  const rows = [];
  for (const tool of frontmatter.tools.filter((t) => typeof t === "string" && t !== "")) {
    const entry = selectedTool(data, tool);
    const needsLink = entry !== null && LINKED.includes(entry.category);
    const linked = needsLink && Array.isArray(entry.values?.projects) && entry.values.projects.includes(name);
    if (entry !== null && (!needsLink || linked)) {
      continue;
    }
    rows.push(
      row(
        "tool-link",
        "degraded",
        name,
        tool,
        entry === null
          ? `${template} names tool ${tool}, which bootstrap in ${dir} has not selected`
          : `${template} names tool ${tool}, which bootstrap in ${dir} does not link to project ${name}`,
        `bootstrap add tool ${tool}, then bootstrap detect --add`,
      ),
    );
  }
  return rows;
}

/**
 * D8: a project's design tool has its reference for each design-import role
 * in the vwf-tools plugin; one row naming the roles that lack it.
 */
function designRows(name, entry) {
  const tool = entry.design;
  if (!isPinned(tool) || typeof tool !== "string") {
    return [];
  }
  const missing = DESIGN_ROLES.filter(
    (role) => !existsSync(join(vwfTools(), "skills", role, "references", `${tool}.md`)),
  );
  return missing.length === 0
    ? []
    : [
      row(
        "design-tool",
        "degraded",
        name,
        tool,
        `the vwf-tools plugin has no ${tool} reference for ${missing.join(", ")}`,
        "/vwf:setup",
      ),
    ];
}

/**
 * D8, D24, D26, D31: each addons: name has a key starting with <name>@ in
 * the base's tools.claude.plugins.project; the claude tool not selected is
 * the same row, never a refusal.
 */
export function addonRows({ base, config }) {
  const addons = (Array.isArray(config.addons) ? config.addons : [])
    .filter((a) => typeof a === "string" && a !== "");
  if (addons.length === 0) {
    return [];
  }
  const selected = selectedTool(bootstrapRead(() => describe(base)), "claude") !== null;
  const plugins = selected ? bootstrapRead(() => configGet(base, "tools.claude.plugins.project")) : null;
  const keys = isObject(plugins) ? Object.keys(plugins) : [];
  return addons
    .filter((name) => !keys.some((key) => key.startsWith(`${name}@`)))
    .map((name) =>
      row(
        "addon",
        "degraded",
        null,
        name,
        selected
          ? `addon ${name} has no ${name}@<marketplace> key in tools.claude.plugins.project`
          : `addon ${name} is not declared: the claude tool is not selected in ${base}`,
        "/vwf:setup",
      )
    );
}

/** A bootstrap read, its failure a ChecksError (a refusal). */
function bootstrapRead(read) {
  try {
    return read();
  } catch (error) {
    if (error instanceof BootstrapError) {
      throw new ChecksError(error.message);
    }
    throw error;
  }
}

/**
 * The iac rule (D21): a project declaring iac whose folder in its own repo is
 * not "." is not its own repo.
 */
function iacRow(config, project, folder, dir) {
  if (!Array.isArray(project.platforms) || !project.platforms.includes("iac")) {
    return null;
  }
  if (folder === null || folder === "." || folder === "./") {
    return null;
  }
  const decline = config.enforcement?.rules?.[`topology/iac-own-repo/${project.name}`];
  const waived = isObject(decline) && decline.waived === true;
  return row(
    "iac-own-repo",
    waived ? "degraded" : "blocking",
    project.name,
    folder,
    waived
      ? `iac project ${project.name} sits in ${folder} of ${dir}; its extraction is declined on the record`
      : `iac project ${project.name} sits in ${folder} of ${dir}, not its own repo`,
    "/vwf:setup",
  );
}

/**
 * The per-project rows for the registry projects named in `scope`, then once
 * per repo that holds one: its retired pack rows (the base's are repo-level,
 * lib/index.mjs) and, where a pin of it materialized, its LSP servers.
 */
export function projectRows({ base, config, members, registry, scope }) {
  const rows = [];
  const adapters = Array.isArray(config.stacks) ? config.stacks.filter((s) => typeof s === "string") : [];
  const projects = (Array.isArray(registry?.projects) ? registry.projects : [])
    .filter((p) => isObject(p) && scope.includes(p.name));
  /** repo dir → whether a pin materialized there, in first-seen order */
  const repos = new Map();
  /** the vwf-tools manifest's servers, read once and only when needed */
  let held = null;
  const heldOf = () => (held ??= vwfToolsServers());
  /** repo dir → its describe data, read once */
  const described = new Map();
  const describeOf = (dir) => {
    if (!described.has(dir)) {
      described.set(dir, bootstrapRead(() => describe(dir)));
    }
    return described.get(dir);
  };
  /** repo dir → its mise task names, read once and only when needed (D37) */
  const tasks = new Map();
  const tasksOf = (dir) => {
    if (!tasks.has(dir)) {
      tasks.set(dir, miseTasks(dir));
    }
    return tasks.get(dir);
  };

  for (const project of projects) {
    const name = project.name;
    const entry = stackOf(config, name);
    const stack = isObject(entry.stack) ? entry.stack : {};
    const template = stack.template;
    const pinned = isPinned(template);

    const target = projectRepo(base, config, members, name);
    if (!target.present) {
      continue; // an absent member is a blind spot, not a finding
    }
    if (!repos.has(target.dir)) {
      repos.set(target.dir, false);
    }
    const folder = bootstrapRead(() => projectFolder(target.dir, name));
    if (folder === null) {
      rows.push(
        row(
          "project-folder",
          "degraded", // D28: never stops execute
          name,
          name,
          `bootstrap in ${target.dir} has no repo.projects.${name}, so project ${name} has no folder`,
          `bootstrap config set repo.projects.${name} '{"folder":"<path>"}' --json`,
        ),
      );
    }
    const iac = iacRow(config, project, folder, target.dir);
    if (iac !== null) {
      rows.push(iac);
    }
    const platforms = Array.isArray(project.platforms) ? project.platforms : [];
    const tools = linkedTools(describeOf(target.dir), "languages", name);
    if (tools.length === 0 && !platforms.every((p) => TOOLLESS.includes(p))) {
      rows.push(
        row(
          "language-tool",
          "degraded", // D28: never stops execute
          name,
          name,
          `no bootstrap tool of category languages in ${target.dir} links project ${name}`,
          "bootstrap detect --add, or bootstrap add tool <tool>",
        ),
      );
    }
    rows.push(...harnessRows(name, platforms, target.dir, describeOf(target.dir), () => tasksOf(target.dir)));
    rows.push(...designRows(name, entry));
    if (isCustom(template)) {
      rows.push(
        row(
          "custom-pin",
          "blocking",
          name,
          template,
          `project ${name} pins template custom, retired in config_format 14`,
          "/vwf:setup",
        ),
      );
      continue;
    }

    if (!pinned || typeof template !== "string" || adapters.length === 0) {
      continue; // D38: no stacks: adapter, so no pin is walked — doctor's to catch
    }
    const slug = slugOf(template);
    const found = materialized(target.dir, adapters, slug);
    if (found === null) {
      rows.push(
        row(
          "not-materialized",
          "blocking",
          name,
          template,
          `project ${name} pins ${template} and ${target.dir} has no materialized entry for ${slug}`,
          "/vwf:setup",
        ),
      );
      continue; // the bundle's tools are unread
    }
    repos.set(target.dir, true);
    const frontmatter = readFrontmatter(found.file);
    if (frontmatter !== null && Array.isArray(frontmatter.platforms)) {
      const missing = platforms.filter((p) => !frontmatter.platforms.includes(p));
      if (missing.length > 0) {
        rows.push(
          row(
            "platform-coverage",
            "blocking",
            name,
            template,
            `${template} does not cover ${missing.join(", ")}, which project ${name} declares`,
            "/vwf:architecture",
          ),
        );
      }
    }
    if (folder !== null) { // D25: no repo.projects.<name>, no link to check
      rows.push(...toolLinkRows(name, template, frontmatter, describeOf(target.dir), target.dir));
    }
  }

  for (const [dir, landed] of repos) {
    if (dir !== base) {
      rows.push(...oldPackRows(dir, adapters));
    }
    if (landed) {
      rows.push(...lspRows(dir, heldOf));
    }
  }
  return rows;
}
