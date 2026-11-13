#!/usr/bin/env node
// The start of one /vwf:execute run, in one call.
//
//   node start.mjs <folder|next> [--worktree <repo-relative path>]
//                  [--continue-unknown-language]
//
// Run from any directory inside the base repo or a member; the base is
// resolved per assets/membership.md. In order: the format test; for next, the
// pick; Resolve and the fresh-run refusals (workflows/folder.md); the log
// start, fresh or resume; the checks phase (doctor's blocking checks); the
// claim phase when the run is fresh. A fresh run runs the checks before its
// log start (D41), so that a stop before the claim leaves no log run open; its
// checks phase markers follow the log start and carry the true boundaries as
// started and ended. It prints one JSON object on stdout and
// nothing else there; progress and warnings go to stderr:
//
//   {result: ready|refused|blocked|nothing, mode: fresh|resume|null, folder,
//    kind, priority, has_code_unit, has_covers, projects, findings,
//    open_questions, claim, message}
//
// findings holds the blocking rows and the unknown-language rows (D39: execute
// asks the user on those). On a fresh run whose only stopping rows are
// unknown-language ones, and no --continue-unknown-language, the result is
// blocked with no log start and no claim: execute asks continue or stop, and
// on continue runs start.mjs again with the flag, which claims (D41). open_questions is null on a fresh run; on a resume
// it is {gaps: [ids of open QUESTION gaps], events: [question events with no
// answer]}. claim is the plan.mjs claim result, or null.
//
// Exit 0 on ready, 1 on refused, blocked or nothing, 2 on a usage or internal
// error (nothing on stdout then). Every row and folder value comes from the
// origin/develop tip; the working copy is only a fresh log start's --folder,
// and must equal the tip. A log call never stops the run: log.mjs runs as a
// child process and a failed call is a warning here. A refusal before the log
// start writes nothing to the log.

import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { basename, dirname, isAbsolute, join, relative, resolve as resolvePath } from "node:path";
import { isDeepStrictEqual } from "node:util";
import { ChecksError, runChecks } from "../../doctor/scripts/lib/index.mjs";
import {
  claim,
  INTEGRATION,
  pick,
  QueueError,
  REMOTE,
  resolve,
  resolveBase,
} from "../../plan-management/scripts/lib/queue.mjs";
import { validateFolder } from "../../plan-management/scripts/lib/schema.mjs";
import { parseYaml, YamlError } from "../../plan-management/scripts/lib/yaml.mjs";

const USAGE = "usage: node start.mjs <folder|next> [--worktree <repo-relative path>] [--continue-unknown-language]";
const LOG = join(import.meta.dirname, "log.mjs");
const TIP = `${REMOTE}/${INTEGRATION}`;
const INDEX = "docs/plans/index.json";
const ROOT = process.env.VWF_LOG_ROOT || join(homedir(), "Library", "Caches", "vwf");
const SESSION = process.env.CLAUDE_CODE_SESSION_ID || "nosession";
const MIGRATE = "This repo uses the old plan format. Migrate it with "
  + "https://github.com/virajp/claude-plugins/blob/main/docs/plans/migrate.md";

class UsageError extends Error {}

/** A refusal: the run stops with result refused and this message. */
class Refusal extends Error {}

function warn(msg) {
  process.stderr.write(`start.mjs: ${msg}\n`);
}

function git(cwd, args) {
  const r = spawnSync("git", args, { cwd, encoding: "utf8" });
  return { ok: r.status === 0, out: (r.stdout ?? "").trim(), err: (r.stderr ?? "").trim() };
}

function readYaml(file) {
  return existsSync(file) ? parseYaml(readFileSync(file, "utf8")) : null;
}

function readJsonFile(file) {
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

// --- the tip -------------------------------------------------------------------

const fetched = new Set();

/** A file's text at origin/develop of `dir`, or null; refuses without that branch. */
function tipShow(dir, path) {
  if (!fetched.has(dir)) {
    const f = git(dir, ["fetch", REMOTE]);
    if (!f.ok) {
      warn(`git fetch ${REMOTE} failed in ${dir}: ${f.err}`);
    }
    fetched.add(dir);
  }
  if (!git(dir, ["rev-parse", "--verify", "--quiet", `refs/remotes/${TIP}`]).ok) {
    throw new Refusal(`${TIP} does not exist in ${dir}; the integration branch is ${INTEGRATION} on ${REMOTE}`);
  }
  const r = git(dir, ["show", `${TIP}:${path}`]);
  return r.ok ? r.out : null;
}

function tipJson(dir, path) {
  const text = tipShow(dir, path);
  if (text === null) {
    return null;
  }
  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Refusal(`${TIP}:${path} in ${dir} is not valid JSON (${e.message})`);
  }
}

// --- the log -------------------------------------------------------------------

/** One log.mjs call as a child process (D26); a failure is a warning. */
function log(cwd, args, input) {
  const r = spawnSync(process.execPath, [LOG, ...args], { cwd, encoding: "utf8", input });
  if (r.stderr) {
    process.stderr.write(r.stderr);
  }
  if (r.status !== 0) {
    warn(`log.mjs ${args[0]} exited ${r.status ?? r.signal}${r.error ? `: ${r.error.message}` : ""}`);
  }
}

function logPath(repoDir, id) {
  const common = git(repoDir, ["rev-parse", "--path-format=absolute", "--git-common-dir"]);
  const repo = common.ok ? basename(dirname(common.out)) : basename(repoDir);
  return join(ROOT, repo, `${id}.jsonl`);
}

/** Whether another session's marker under active/ names this log (D37 G7). */
function heldElsewhere(file) {
  const dir = join(ROOT, "active");
  let names;
  try {
    names = readdirSync(dir);
  } catch {
    return false;
  }
  return names.some((name) => {
    if (name === SESSION || name === "nosession") {
      return false;
    }
    try {
      return readFileSync(join(dir, name), "utf8").split("\n")[0].trim() === file;
    } catch {
      return false;
    }
  });
}

/** The question events of the log with no later answer of the same id. */
function unanswered(file) {
  let lines;
  try {
    lines = readFileSync(file, "utf8").split("\n");
  } catch {
    return [];
  }
  const open = new Map();
  for (const line of lines) {
    let e;
    try {
      e = JSON.parse(line);
    } catch {
      continue;
    }
    if (e.event === "question" && typeof e.id === "string") {
      open.set(e.id, { id: e.id, unit: e.unit, text: e.text, options: e.options, why: e.why });
    } else if (e.event === "answer" && typeof e.id === "string") {
      open.delete(e.id);
    }
  }
  return [...open.values()];
}

// --- the folder ----------------------------------------------------------------

const units = (doc) => (Array.isArray(doc?.units) ? doc.units : []);

/** The ids a review row covers: its depends_on, transitively. */
function covered(doc, review) {
  const byId = new Map(units(doc).map((u) => [u.id, u]));
  const out = new Set();
  const walk = (ids) => {
    for (const id of Array.isArray(ids) ? ids : []) {
      if (!out.has(id)) {
        out.add(id);
        walk(byId.get(id)?.depends_on);
      }
    }
  };
  walk(review.depends_on);
  return out;
}

/** The three fresh-run refusals of folder.md, as messages. */
function freshRefusals(doc) {
  const reviews = units(doc).filter((u) => u.kind === "review");
  const covers = new Map(reviews.map((r) => [r.id, covered(doc, r)]));
  const out = [];
  const uncovered = units(doc)
    .filter((u) => u.kind === "code" && !reviews.some((r) => covers.get(r.id).has(u.id)))
    .map((u) => u.id);
  if (uncovered.length > 0) {
    out.push(`an uncovered code unit: no review row covers ${uncovered.join(", ")}`);
  }
  for (const r of reviews) {
    const set = covers.get(r.id);
    if (set.size === 0) {
      out.push(`a review row that covers nothing: ${r.id}`);
      continue;
    }
    for (const u of units(doc).filter((x) => set.has(x.id))) {
      if (!(r.wave > u.wave)) {
        out.push(`a review row placed wrong: ${r.id} (wave ${r.wave}) covers ${u.id} (wave ${u.wave})`);
      }
    }
    for (const u of units(doc)) {
      if (u.kind === "review" || u.wave >= r.wave || set.has(u.id)) {
        continue;
      }
      const earlier = reviews.some((o) => o.wave < r.wave && covers.get(o.id).has(u.id));
      if (!earlier) {
        out.push(`a review row placed wrong: ${r.id} does not cover ${u.id}, an earlier unit no earlier review row covers`);
      }
    }
  }
  return out;
}

/** A non-green code unit with no review row ahead that covers it (the resume refusal). */
function resumeRefusals(doc) {
  const ahead = units(doc).filter((u) => u.kind === "review" && u.status !== "green");
  return units(doc)
    .filter((u) => u.kind === "code" && u.status !== "green")
    .filter((u) => !ahead.some((r) => covered(doc, r).has(u.id)))
    .map((u) => `a non-green code unit no review row ahead covers: ${u.id}`);
}

function validated(doc, dir) {
  const findings = validateFolder(doc, dir);
  if (findings.length > 0) {
    throw new Refusal(
      `plan.mjs validate: ${findings.map((f) => `${f.path || "(root)"}: ${f.message}`).join("; ")}`,
    );
  }
}

/** The D8 projects: the registry project each owns path falls under, by path segment. */
function projectsOf(base, config, row, doc) {
  const registry = readYaml(join(base, "docs", "blueprint", "registry.yaml"));
  const projects = (Array.isArray(registry?.projects) ? registry.projects : [])
    .filter((p) => p && typeof p.name === "string" && typeof p.path === "string");
  if (projects.length === 0) {
    return [];
  }
  const member = row.target_repo
    ? (Array.isArray(config?.members) ? config.members : []).find((m) => m?.name === row.target_repo)
    : null;
  const prefix = typeof member?.path === "string" ? member.path : "";
  const segs = (p) => p.split("/").filter((s) => s !== "" && s !== ".");
  const out = [];
  for (const u of units(doc)) {
    for (const own of Array.isArray(u.owns) ? u.owns : []) {
      const path = segs(prefix ? `${prefix}/${own}` : own);
      let best = null;
      for (const p of projects) {
        const ps = segs(p.path);
        if (ps.every((s, i) => path[i] === s) && (best === null || ps.length > best.len)) {
          best = { name: p.name, len: ps.length };
        }
      }
      if (best !== null && !out.includes(best.name)) {
        out.push(best.name);
      }
    }
  }
  return out;
}

/** The fetch command for an absent member, per membership.md. */
function fetchCommand(config, member) {
  return config?.linkage === "submodule"
    ? `git submodule update --init ${member.path}`
    : `git clone ${member.url ?? "<url>"} ${member.path}`;
}

/** The text of one unsatisfied requires entry, per folder.md. */
function entryText(rows, e) {
  if (e.kind === "cycle") {
    const m = e.reason.match(/covers doc (\S+) reads implementation: (\S+)/);
    return m
      ? `Prerequisite plan ${e.entry} has not been executed and merged (${m[1]} is implementation: ${m[2]}). Run /vwf:execute ${e.entry} first.`
      : e.reason;
  }
  if (e.kind === "change") {
    const status = rows.find((r) => r?.id === e.entry)?.status;
    if (status === "APPROVED") {
      return `run /vwf:execute ${e.entry} first`;
    }
    if (status === "RUNNING") {
      return `another session is running ${e.entry}; re-run this plan once it lands — or, when that run is gone, make the plan-management unclaim ${e.entry} request yourself`;
    }
    return e.reason;
  }
  return /unresolvable/.test(e.reason)
    ? `${e.entry} is neither in the plan index nor archived; fix the folder's requires list`
    : e.reason;
}

/**
 * Resolve one folder: {id, row, repoDir, doc, folderDir, mode, logFile,
 * openQuestions}, or a Refusal.
 */
function resolveFolder(base, config, arg) {
  const id = basename(arg.replace(/\/+$/, "").replace(/\/index\.(md|json)$/, ""));
  const index = tipJson(base, INDEX);
  const rows = Array.isArray(index?.plans) ? index.plans : [];
  const row = rows.find((r) => r?.id === id) ?? null;

  let repoDir = base;
  if (row?.target_repo) {
    const member = (Array.isArray(config?.members) ? config.members : []).find((m) => m?.name === row.target_repo);
    if (!member || typeof member.path !== "string") {
      throw new Refusal(`the target repo ${row.target_repo} of ${id} is not listed under members: in .config/vwf.yaml`);
    }
    repoDir = resolvePath(base, member.path);
    if (!existsSync(join(repoDir, ".git"))) {
      throw new Refusal(
        `the target repo ${row.target_repo} of ${id} is not on this machine; fetch it with \`${fetchCommand(config, member)}\`, then re-run /vwf:execute ${id}`,
      );
    }
  }
  const folder = row?.folder ?? relative(base, isAbsolute(arg) ? arg : resolvePath(base, arg));
  const notCommitted = `${id} is not on ${INTEGRATION}: run the planner again on it, or commit and push it by hand, then re-launch`;
  const tipDoc = tipJson(repoDir, `${folder}/index.json`);
  if (tipDoc === null) {
    throw new Refusal(notCommitted);
  }
  const state = tipDoc.status?.state;
  if (state === "DRAFT") {
    const planner = tipDoc.type === "vwf-plan" ? "/vwf:plan" : "/vwf:change-plan";
    throw new Refusal(`${id} is not approved; run the planner that wrote it to finish it — ${planner}`);
  }
  if (state === "COMPLETE" || state === "ARCHIVED") {
    throw new Refusal(`${id} is ${state}: nothing to do`);
  }
  if (row === null) {
    throw new Refusal(`${id} is not in the plan index; re-run the planner's hand-off, or add the row by hand`);
  }
  const resolved = resolve({ base, folder });
  if (!resolved.runnable) {
    throw new Refusal(
      `${id} is not runnable: ${resolved.entries.filter((e) => !e.satisfied).map((e) => entryText(rows, e)).join("; ")}`,
    );
  }

  if (row.status === "RUNNING") {
    const another = `another session is running ${id}; re-run once it lands, or make the plan-management unclaim ${id} request when that run is gone`;
    const wt = typeof tipDoc.run?.worktree === "string" ? resolvePath(repoDir, tipDoc.run.worktree) : null;
    if (wt === null || !existsSync(wt)) {
      throw new Refusal(another);
    }
    const folderDir = join(wt, folder);
    const doc = readJsonFile(join(folderDir, "index.json"));
    if (doc === null) {
      throw new Refusal(`${join(folderDir, "index.json")} cannot be read in the run's worktree`);
    }
    validated(doc, folderDir);
    const logFile = logPath(repoDir, id);
    if (heldElsewhere(logFile)) {
      throw new Refusal(another);
    }
    const refusals = resumeRefusals(doc);
    if (refusals.length > 0) {
      throw new Refusal(
        `${refusals.join("; ")}; edit the folder in the worktree with plan.mjs (write a NN-review.md and append its units entry), then re-launch`,
      );
    }
    const gaps = (Array.isArray(doc.gaps) ? doc.gaps : [])
      .filter((g) => g?.state === "open" && /^QUESTION Q\d+: /.test(g.text ?? ""))
      .map((g) => g.id);
    return {
      id,
      row,
      repoDir,
      doc,
      folderDir,
      logCwd: wt,
      mode: "resume",
      openQuestions: { gaps, events: unanswered(logFile) },
    };
  }
  if (row.status !== "APPROVED") {
    throw new Refusal(`${id}'s row reads ${row.status} at ${TIP}: nothing to run`);
  }

  // A fresh run (D34 G3): the working copy must equal the tip (D27).
  const folderDir = join(repoDir, folder);
  const local = readJsonFile(join(folderDir, "index.json"));
  if (local === null || !isDeepStrictEqual(local, tipDoc)) {
    throw new Refusal(
      `the working copy of ${folder} is ${local === null ? "absent" : `not the one at ${TIP}`}: check out ${INTEGRATION} and pull, then re-run`,
    );
  }
  validated(tipDoc, folderDir);
  const refusals = freshRefusals(tipDoc);
  if (refusals.length > 0) {
    throw new Refusal(`${refusals.join("; ")}; amend the folder and re-approve the plan`);
  }
  return { id, row, repoDir, doc: tipDoc, folderDir, logCwd: repoDir, mode: "fresh", openQuestions: null };
}

// --- the run -------------------------------------------------------------------

function parseArgs(argv) {
  const [target, ...rest] = argv;
  if (target === undefined || target.startsWith("--")) {
    throw new UsageError(USAGE);
  }
  let worktree;
  let continueUnknown = false;
  for (let i = 0; i < rest.length; i++) {
    if (rest[i] === "--worktree" && worktree === undefined && rest[i + 1] && !rest[i + 1].startsWith("--")) {
      worktree = rest[++i];
    } else if (rest[i] === "--continue-unknown-language" && !continueUnknown) {
      continueUnknown = true;
    } else {
      throw new UsageError(USAGE);
    }
  }
  return { target, worktree, continueUnknown };
}

function result(over) {
  return {
    result: "refused",
    mode: null,
    folder: null,
    kind: null,
    priority: null,
    has_code_unit: null,
    has_covers: null,
    projects: [],
    findings: [],
    open_questions: null,
    claim: null,
    message: "",
    ...over,
  };
}

/** The format test of SKILL.md, before anything else. */
function oldFormat(base, target) {
  if (existsSync(join(base, "docs", "plans", "index.md"))) {
    return true;
  }
  if (target === "next") {
    return false;
  }
  const dirs = isAbsolute(target) ? [target] : [resolvePath(process.cwd(), target), resolvePath(base, target)];
  return dirs.some((d) => existsSync(join(d, "index.md")) && !existsSync(join(d, "index.json")));
}

function start({ target, worktree, continueUnknown }) {
  const base = resolveBase(process.cwd());
  if (oldFormat(base, target)) {
    return result({ message: MIGRATE });
  }
  const config = readYaml(join(base, ".config", "vwf.yaml")) ?? {};
  const lost = new Set();

  for (;;) {
    let arg = target;
    let picked = null;
    if (target === "next") {
      let p;
      try {
        p = pick({ base });
      } catch (e) {
        if (e instanceof QueueError) {
          return result({ message: e.message });
        }
        throw e;
      }
      if (p.pick === undefined) {
        const waits = p.nothing.map((n) => `${n.folder} waits on ${n.waits.join("; ")}`);
        return result({
          result: "nothing",
          message: waits.length > 0
            ? `no runnable plan: ${waits.join(" | ")}`
            : "No approved plan found. Run /vwf:plan or /vwf:change-plan first.",
        });
      }
      picked = p.pick;
      if (lost.has(basename(picked.folder))) {
        return result({ folder: picked.folder, message: `${picked.folder} was picked again after a lost claim` });
      }
      arg = picked.folder;
    }

    let f;
    try {
      f = resolveFolder(base, config, arg);
    } catch (e) {
      if (e instanceof Refusal || e instanceof QueueError) {
        return result({
          folder: picked?.folder ?? arg,
          kind: picked?.kind ?? null,
          priority: picked?.priority ?? null,
          message: picked ? `picked ${picked.folder}: ${e.message}` : e.message,
        });
      }
      throw e;
    }

    const folder = f.row.folder;
    const base_ = {
      mode: f.mode,
      folder,
      kind: f.row.kind,
      priority: f.row.priority,
      has_code_unit: units(f.doc).some((u) => u.kind === "code"),
      has_covers: Array.isArray(f.doc.covers),
      open_questions: f.openQuestions,
    };
    const stop = (reason, outcome) => {
      log(f.logCwd, ["event", "stop", "--reason", reason, "--resume", `/vwf:execute ${folder}`]);
      log(f.logCwd, ["end", "--outcome", outcome]);
    };

    const projects = projectsOf(base, config, f.row, f.doc);
    const fresh = f.mode === "fresh";
    let checks;
    let failed = null;
    if (fresh) {
      // D41: the checks run before the log start; the markers follow it.
      const started = new Date().toISOString();
      try {
        checks = runChecks({ cwd: base, projects });
      } catch (e) {
        failed = e;
      }
      const ended = new Date().toISOString();
      if (failed === null) {
        const unknown = checks.findings.some((r) => r.rule === "unknown-language" && r.severity !== "info");
        const blocks = checks.findings.some((r) => r.severity === "blocking");
        if (unknown && !blocks && !continueUnknown) {
          const rows = checks.findings.filter((r) => r.rule === "unknown-language" && r.severity !== "info");
          return result({
            ...base_,
            result: "blocked",
            projects,
            findings: rows,
            message: `${folder}: unknown language ${rows.map((r) => r.subject).join(", ")}; ask continue or stop, and on continue re-run with --continue-unknown-language`,
          });
        }
      }
      log(f.logCwd, ["start", "--folder", f.folderDir, "--mode", f.mode]);
      log(f.logCwd, ["event", "phase.start", "--phase", "checks", "--started", started]);
      log(f.logCwd, ["event", "phase.end", "--phase", "checks", "--ended", ended]);
    } else {
      log(f.logCwd, ["start", "--folder", f.folderDir, "--mode", f.mode]);
      log(f.logCwd, ["event", "phase.start", "--phase", "checks"]);
      try {
        checks = runChecks({ cwd: base, projects });
      } catch (e) {
        failed = e;
      }
      log(f.logCwd, ["event", "phase.end", "--phase", "checks"]);
    }
    if (failed !== null) {
      stop(`the checks failed: ${failed.message}`, "blocked");
      throw failed;
    }
    const findings = checks.findings.filter((r) => r.severity === "blocking" || r.rule === "unknown-language" && r.severity !== "info");
    const blocking = findings.filter((r) => r.severity === "blocking");
    if (blocking.length > 0) {
      const why = `blocking findings: ${blocking.map((r) => `${r.rule} ${r.subject}`).join(", ")}`;
      stop(why, "blocked");
      return result({ ...base_, result: "blocked", projects, findings, message: `${folder}: ${why}` });
    }

    if (f.mode !== "fresh") {
      return result({ ...base_, result: "ready", projects, findings, message: `${folder}: resume ready` });
    }

    log(f.logCwd, ["event", "phase.start", "--phase", "claim"]);
    const c = claim({ base, folder, worktree });
    log(f.logCwd, ["event", "phase.end", "--phase", "claim"]);
    if (c.claimed) {
      const message = c.warning
        ? `${folder}: claimed at ${c.commit}; warning: ${c.warning}`
        : `${folder}: claimed at ${c.commit}`;
      return result({ ...base_, result: "ready", projects, findings, claim: c, message });
    }
    if (c.kind === "lost") {
      stop(`claim lost: ${c.reason}`, "claim-lost");
      if (target === "next") {
        warn(`the claim of ${folder} was lost (${c.reason}); picking again`);
        lost.add(f.id);
        continue;
      }
      return result({ ...base_, projects, findings, claim: c, message: `${folder}: the claim was lost: ${c.reason}` });
    }
    stop(`claim failed: ${c.reason}`, "claim-failed");
    const unclaim = c.kind === "member-failed" && !c.reason.includes("unclaim")
      ? `; make the plan-management unclaim ${f.id} request`
      : "";
    return result({ ...base_, projects, findings, claim: c, message: `${folder}: the claim failed: ${c.reason}${unclaim}` });
  }
}

let args;
try {
  args = parseArgs(process.argv.slice(2));
} catch (e) {
  warn(e.message);
  process.exit(2);
}
try {
  const out = start(args);
  process.stdout.write(`${JSON.stringify(out, null, 2)}\n`);
  process.exitCode = out.result === "ready" ? 0 : 1;
} catch (e) {
  if (e instanceof QueueError || e instanceof ChecksError || e instanceof YamlError) {
    warn(e.message);
  } else {
    warn(e.stack ?? String(e));
  }
  process.exitCode = 2;
}
