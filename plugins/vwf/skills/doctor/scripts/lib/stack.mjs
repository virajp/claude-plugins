// The stack checks execute stops on (references/stack-checks.md): mise, a
// custom pin, template platform coverage, iac inside another repo with the
// D7 decline, pinned not materialized, unknown language, and binaries with
// their probes. Severities follow stack-checks.md; D9 settles the rest. An
// unknown language is the one exception (D39): known means the materialized
// template lists the token, no installed plugin is read, so its row is
// degraded even while pinned and never blocks; execute asks the user on it.

import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import {
  git,
  isObject,
  isPinned,
  isWorkTree,
  onPath,
  readFrontmatter,
  readYaml,
  real,
  row,
  slugOf,
} from "./util.mjs";

const PROBE_TIMEOUT_MS = 30_000;
const STACK_AXES = ["template", "backing_template", "deploy_template"];
const PROJECT_AXES = ["design", "cicd", "stylesheet"];

function stackOf(config, name) {
  const project = config.projects?.[name];
  return isObject(project) ? project : {};
}

/** D9 (a): any axis pinned anywhere, or any harness capability claimed. */
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
  if (isPinned(config.repo?.stack?.template)) {
    return true;
  }
  const harness = isObject(config.harness) ? Object.values(config.harness) : [];
  return harness.some((cap) => cap === true || (isObject(cap) && cap.present === true));
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

/** The repo a project lives in: the member listing it, else the base. */
function targetRepo(base, config, name) {
  const members = Array.isArray(config.members) ? config.members.filter(isObject) : [];
  const member = members.find(
    (m) => Array.isArray(m.projects) && m.projects.includes(name) && typeof m.path === "string",
  );
  if (member === undefined) {
    return { dir: base, present: true };
  }
  const dir = resolve(base, member.path);
  return { dir, present: isWorkTree(dir) };
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

/** The language token's facts of a template's frontmatter, or null. */
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

/** The iac rule: a project declaring iac whose path sits inside another repo. */
function iacRow(base, config, project) {
  if (!Array.isArray(project.platforms) || !project.platforms.includes("iac")) {
    return null;
  }
  if (typeof project.path !== "string") {
    return null;
  }
  const dir = resolve(base, project.path);
  const top = existsSync(dir) ? git(dir, ["rev-parse", "--show-toplevel"]) : { ok: false };
  if (!top.ok || real(top.out) === real(dir)) {
    return null;
  }
  const decline = config.enforcement?.rules?.[`topology/iac-own-repo/${project.name}`];
  const waived = isObject(decline) && decline.waived === true;
  return row(
    "iac-own-repo",
    waived ? "degraded" : "blocking",
    project.name,
    project.path,
    waived
      ? `iac project ${project.name} sits inside ${top.out}; its extraction is declined on the record`
      : `iac project ${project.name} sits inside ${top.out}, not its own repo`,
    "/vwf:setup",
  );
}

/**
 * The per-project rows for the registry projects named in `scope`, and the
 * binaries those projects need, reported once each.
 */
export function projectRows({ base, config, registry, scope }) {
  const rows = [];
  const adapters = Array.isArray(config.stacks) ? config.stacks.filter((s) => typeof s === "string") : [];
  const projects = (Array.isArray(registry?.projects) ? registry.projects : [])
    .filter((p) => isObject(p) && scope.includes(p.name));
  /** name → {probe, severity, cwd, hashOk, projects} */
  const binaries = new Map();

  for (const project of projects) {
    const name = project.name;
    const entry = stackOf(config, name);
    const stack = isObject(entry.stack) ? entry.stack : {};
    const template = stack.template;
    const pinned = isPinned(template);
    const severity = pinned ? "blocking" : "degraded";

    const iac = iacRow(base, config, project);
    if (iac !== null) {
      rows.push(iac);
    }
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
    const target = targetRepo(base, config, name);
    if (pinned && adapters.length === 0) {
      continue; // D38: no stacks: adapter, so no pin is walked — doctor's to catch
    }
    if (pinned && typeof template === "string") {
      if (!target.present) {
        continue; // an absent member is a blind spot, not a finding
      }
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
        continue; // the token walk is skipped
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

    const optional = Array.isArray(frontmatter?.optional_languages) ? frontmatter.optional_languages : [];
    for (const token of Array.isArray(stack.languages) ? stack.languages : []) {
      const facts = factsOf(frontmatter, token);
      if (facts === null) {
        rows.push(
          optional.includes(token)
            ? row(
              "unknown-language",
              "info",
              name,
              token,
              `${token} is an optional language of ${template}: known, its facts unverified`,
              "none",
            )
            : row(
              "unknown-language",
              "degraded", // D39: execute asks whether to continue; never blocking here
              name,
              token,
              `no materialized template of project ${name} lists the language ${token}`,
              "install the stack plugin that declares the language, or write one",
            ),
        );
        continue;
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
