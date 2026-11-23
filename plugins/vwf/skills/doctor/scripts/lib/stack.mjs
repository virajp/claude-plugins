// The stack checks execute stops on (references/stack-checks.md): mise, a
// custom pin, template platform coverage, an iac project that is not its own
// repo with the D7 decline, pinned not materialized, and binaries with their
// probes. Severities follow stack-checks.md; D9 settles the rest. Two rows are
// degraded and never stop execute (D28): a registry project bootstrap has no
// repo.projects.<name> for (D26), and a project no bootstrap tool of category
// languages links (D18, D27). A project's folder and its language tools are
// read through bootstrap in the repo that holds it (D9, D11); the language
// walk uses the tool name. A capability a project's platforms imply and its
// repo lacks is a degraded harness row too (D37, lib/harness.mjs).

import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  existsSync,
  readFileSync,
} from "node:fs";
import { join } from "node:path";
import {
  BootstrapError,
  describe,
  linkedTools,
  projectFolder,
  projectRepo,
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

const PROBE_TIMEOUT_MS = 30_000;
const STACK_AXES = ["template", "services", "deploy"];
/** The platforms that need no language tool (D27). */
const TOOLLESS = ["iac", "cicd", "misc"];
const PROJECT_AXES = ["design", "cicd", "stylesheet"];

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

function sha256(file) {
  return createHash("sha256").update(readFileSync(file)).digest("hex");
}

function bareHash(value) {
  return typeof value === "string" ? value.replace(/^sha256:/, "").toLowerCase() : null;
}

/**
 * D9 (b): the adapter whose lockfile in `dir` names the slug, with the
 * template file and whether it still hashes to what that lockfile records;
 * null when no adapter in stacks: materialized it.
 */
function materialized(dir, adapters, slug) {
  for (const adapter of adapters) {
    const entries = readYaml(join(dir, ".claude", adapter, "lock.yaml"))?.entries;
    if (!Array.isArray(entries)) {
      continue;
    }
    const path = `.claude/${adapter}/templates/${slug}.md`;
    const hit = entries.filter(isObject).filter((e) => e.slug === slug || e.path === path);
    if (hit.length === 0) {
      continue;
    }
    const file = join(dir, path);
    const recorded = bareHash(entries.find((e) => isObject(e) && e.path === path)?.hash);
    const hashOk = recorded !== null && existsSync(file) && sha256(file) === recorded;
    return { adapter, file, hashOk };
  }
  return null;
}

/** The language tool's facts of a template's frontmatter, or null. */
function factsOf(frontmatter, token) {
  const facts = frontmatter?.language_facts;
  return isObject(facts) && isObject(facts[token]) ? facts[token] : null;
}

function binaryEntries(facts) {
  const list = Array.isArray(facts?.binaries) ? facts.binaries : [];
  return list.flatMap((entry) => {
    if (typeof entry === "string" && entry !== "") {
      return [{ name: entry, probe: null }];
    }
    if (isObject(entry) && typeof entry.name === "string") {
      const probe = typeof entry.probe === "string" && entry.probe !== "" ? entry.probe : null;
      return [{ name: entry.name, probe }];
    }
    return [];
  });
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
 * The per-project rows for the registry projects named in `scope`, and the
 * binaries those projects need, reported once each.
 */
export function projectRows({ base, config, members, registry, scope }) {
  const rows = [];
  const adapters = Array.isArray(config.stacks) ? config.stacks.filter((s) => typeof s === "string") : [];
  const projects = (Array.isArray(registry?.projects) ? registry.projects : [])
    .filter((p) => isObject(p) && scope.includes(p.name));
  /** name → {probe, severity, cwd, hashOk, projects} */
  const binaries = new Map();
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
    const severity = pinned ? "blocking" : "degraded";

    const target = projectRepo(base, config, members, name);
    if (!target.present) {
      continue; // an absent member is a blind spot, not a finding
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

    let frontmatter = null;
    let found = null;
    if (pinned && adapters.length === 0) {
      continue; // D38: no stacks: adapter, so no pin is walked — doctor's to catch
    }
    if (pinned && typeof template === "string") {
      const slug = slugOf(template);
      found = materialized(target.dir, adapters, slug);
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
        continue; // the language walk is skipped
      }
      frontmatter = readFrontmatter(found.file);
      if (frontmatter !== null && Array.isArray(frontmatter.platforms)) {
        const missing = (Array.isArray(project.platforms) ? project.platforms : [])
          .filter((p) => !frontmatter.platforms.includes(p));
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
    }

    for (const tool of tools) {
      const facts = factsOf(frontmatter, tool);
      if (facts === null) {
        continue; // D6: the known/unknown check against language_facts is R5's
      }
      for (const { name: binary, probe } of binaryEntries(facts)) {
        const seen = binaries.get(binary);
        if (seen === undefined) {
          binaries.set(binary, {
            probe,
            severity,
            cwd: target.dir,
            hashOk: found?.hashOk ?? false,
            projects: [name],
          });
        } else {
          seen.projects.push(name);
          if (severity === "blocking") {
            seen.severity = "blocking";
          }
        }
      }
    }
  }

  for (const [name, b] of binaries) {
    const result = checkBinary(name, b);
    if (result !== null) {
      rows.push(
        row(
          "binary",
          b.severity,
          null,
          name,
          `${result} (needed by ${b.projects.join(", ")})`,
          `install ${name} and put it on PATH`,
        ),
      );
    }
  }
  return rows;
}

/** null when the binary is usable, else the message of its finding. */
function checkBinary(name, { probe, cwd, hashOk }) {
  if (probe === null) {
    return onPath(name) === null ? `${name} is not on PATH` : null;
  }
  if (!hashOk) {
    return `${name}: probe not run — the template entry no longer matches the hash its lockfile records`;
  }
  const r = spawnSync("mise", ["x", "--", "sh", "-c", probe], {
    cwd,
    timeout: PROBE_TIMEOUT_MS,
    stdio: "ignore",
  });
  if (r.error?.code === "ETIMEDOUT") {
    return `${name}: probe ${JSON.stringify(probe)} timed out`;
  }
  if (r.error !== undefined) {
    return `${name}: probe ${JSON.stringify(probe)} could not run: ${r.error.message}`;
  }
  if (r.status !== 0) {
    return `${name}: probe ${JSON.stringify(probe)} exited ${r.status ?? r.signal}`;
  }
  return null;
}
