// The queue verbs of plan.mjs: pick, resolve and claim, over the plan index
// at the tip of origin/develop (references/plan-index.md, *Resolution*,
// *Reading the queue* and *Writing a row — the claim*).
//
// Every read of a row, a folder's index.json, an archived folder or a covers
// doc is `git show` / `git ls-tree` of origin/develop, never the working copy.
// The integration branch is develop on remote origin; a repo without
// origin/develop is refused. Every git call is an argument array, never a
// shell string; the claim commit runs `mise x -- git commit`.
//
// pick    → { pick: { folder, kind, priority } } | { nothing: [{ folder, waits }] }
// resolve → { runnable, entries: [{ entry, kind, satisfied, reason }] }
// claim   → { claimed: true, commit[, warning] }
//         | { claimed: false, kind: lost|member-failed|failed, reason[, warning] }

import { spawnSync } from "node:child_process";
import {
  existsSync,
  readFileSync,
} from "node:fs";
import {
  basename,
  dirname,
  join,
  resolve as resolvePath,
} from "node:path";
import { parseFrontmatter, parseYaml } from "./yaml.mjs";

/** A refusal that is not a queue answer; plan.mjs exits 2 on it. */
export class QueueError extends Error {
  constructor(message) {
    super(message);
    this.name = "QueueError";
  }
}

export const REMOTE = "origin";
export const INTEGRATION = "develop";
const TIP = `${REMOTE}/${INTEGRATION}`;
const INDEX = "docs/plans/index.json";
const PLAN = join(import.meta.dirname, "..", "plan.mjs");
/** The clean-rebase retries of a rejected push before the claim refuses. */
const PUSH_RETRIES = 3;

function git(cwd, args) {
  const r = spawnSync("git", args, { cwd, encoding: "utf8" });
  return {
    ok: r.status === 0,
    out: (r.stdout ?? "").trim(),
    err: ((r.stderr ?? "") || (r.error?.message ?? "")).trim(),
  };
}

function must(cwd, args) {
  const r = git(cwd, args);
  if (!r.ok) {
    throw new QueueError(`git ${args.join(" ")} failed in ${cwd}: ${r.err}`);
  }
  return r.out;
}

function readYaml(file) {
  return existsSync(file) ? parseYaml(readFileSync(file, "utf8")) : null;
}

/**
 * The main checkout of the base repo from `cwd`, per assets/membership.md: a
 * linked worktree is read as its main checkout first, since every queue edit
 * is made there and never in a worktree.
 */
export function resolveBase(cwd) {
  let dir = cwd;
  const seen = new Set();
  for (;;) {
    const top = git(dir, ["rev-parse", "--show-toplevel"]);
    if (!top.ok) {
      throw new QueueError(`${dir} is not inside a git repo`);
    }
    dir = top.out;
    if (seen.has(dir)) {
      throw new QueueError(`the base repo resolution loops at ${dir}`);
    }
    seen.add(dir);
    const super_ = git(dir, ["rev-parse", "--show-superproject-working-tree"]).out;
    const gitDir = must(dir, ["rev-parse", "--path-format=absolute", "--git-dir"]);
    const common = must(dir, ["rev-parse", "--path-format=absolute", "--git-common-dir"]);
    if (gitDir !== common && super_ === "") {
      dir = dirname(common);
      continue;
    }
    if (existsSync(join(dir, ".config", "vwf.yaml"))) {
      return dir;
    }
    const membership = join(dir, ".config", "vwf-membership.yaml");
    if (existsSync(membership)) {
      const host = readYaml(membership)?.host;
      if (typeof host !== "string" || host === "") {
        throw new QueueError(`${membership} names no host`);
      }
      dir = resolvePath(dir, host);
      continue;
    }
    if (super_ !== "") {
      dir = super_;
      continue;
    }
    throw new QueueError(
      `${dir} is not a vwf repo: no .config/vwf.yaml and no .config/vwf-membership.yaml`,
    );
  }
}

/** The tip reader of one repo: one fetch, then git show / ls-tree. */
class Tip {
  constructor(dir) {
    this.dir = dir;
    this.fetched = false;
  }

  /** Fetch once; throws QueueError when origin/develop does not exist. */
  ready() {
    if (!this.fetched) {
      must(this.dir, ["fetch", REMOTE]);
      this.fetched = true;
    }
    if (!git(this.dir, ["rev-parse", "--verify", "--quiet", `refs/remotes/${TIP}`]).ok) {
      throw new QueueError(
        `${TIP} does not exist in ${this.dir}; the integration branch is ${INTEGRATION} on ${REMOTE}`,
      );
    }
  }

  show(path) {
    this.ready();
    const r = git(this.dir, ["show", `${TIP}:${path}`]);
    return r.ok ? r.out : null;
  }

  exists(path) {
    this.ready();
    return git(this.dir, ["ls-tree", "--name-only", TIP, "--", path]).out !== "";
  }
}

/** The repos a queue read can reach: the base and its members. */
class Product {
  constructor(base) {
    this.base = base;
    this.tips = new Map();
    const config = readYaml(join(base, ".config", "vwf.yaml"));
    this.members = Array.isArray(config?.members) ? config.members : [];
  }

  tip(dir) {
    if (!this.tips.has(dir)) {
      this.tips.set(dir, new Tip(dir));
    }
    return this.tips.get(dir);
  }

  /** { dir } of a cloned member, or { reason } when it is unknown or not cloned. */
  member(name) {
    const m = this.members.find((x) => x && x.name === name);
    if (!m || typeof m.path !== "string") {
      return { reason: `member ${name} is not listed under members: in .config/vwf.yaml` };
    }
    const dir = resolvePath(this.base, m.path);
    if (!existsSync(join(dir, ".git"))) {
      return { reason: `member ${name} is not cloned; clone it to resolve this requirement` };
    }
    return { dir };
  }

  /** The repo dir a row's folder lives in, or { reason }. */
  repoOf(row) {
    return row.target_repo ? this.member(row.target_repo) : { dir: this.base };
  }

  clonedMembers() {
    return this.members
      .filter((m) => m && typeof m.name === "string")
      .map((m) => this.member(m.name).dir)
      .filter((d) => d !== undefined);
  }

  /** The plan index at the tip, or null when the tip has none. */
  index() {
    const text = this.tip(this.base).show(INDEX);
    if (text === null) {
      return null;
    }
    try {
      return JSON.parse(text);
    } catch (e) {
      throw new QueueError(`${TIP}:${INDEX} is not valid JSON (${e.message})`);
    }
  }
}

function kindOfType(type) {
  return type === "vwf-plan" ? "cycle" : type === "vwf-change-plan" ? "change" : null;
}

function readJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/** Whether every covers doc reads implementation: complete in the base tip. */
function coversSatisfied(product, folderDoc, entry) {
  const covers = Array.isArray(folderDoc?.covers) ? folderDoc.covers : [];
  for (const doc of covers) {
    const text = product.tip(product.base).show(doc);
    if (text === null) {
      return { satisfied: false, reason: `${entry}: covers doc ${doc} is not at ${TIP}` };
    }
    let fm;
    try {
      fm = parseFrontmatter(text);
    } catch (e) {
      return { satisfied: false, reason: `${entry}: covers doc ${doc}: ${e.message}` };
    }
    const impl = fm?.implementation ?? "none";
    if (impl !== "complete") {
      return {
        satisfied: false,
        reason: `${entry}: covers doc ${doc} reads implementation: ${impl}`,
      };
    }
  }
  return { satisfied: true, reason: `${entry}: every covers doc reads implementation: complete` };
}

/** One requires entry, resolved by basename against the rows and the tips. */
function resolveEntry(product, rows, raw) {
  const entry = basename(raw);
  const row = rows.find((r) => r && r.id === entry);
  if (row) {
    if (row.kind === "change") {
      return {
        entry,
        kind: "change",
        satisfied: row.status === "COMPLETE",
        reason: `${entry}: row is ${row.status}`,
      };
    }
    const repo = product.repoOf(row);
    if (repo.dir === undefined) {
      return { entry, kind: "cycle", satisfied: false, reason: `${entry}: ${repo.reason}` };
    }
    const doc = readJson(product.tip(repo.dir).show(`${row.folder}/index.json`) ?? "");
    if (doc === null) {
      return {
        entry,
        kind: "cycle",
        satisfied: false,
        reason: `${entry}: ${row.folder}/index.json is not at ${TIP} of ${repo.dir}`,
      };
    }
    return { entry, kind: "cycle", ...coversSatisfied(product, doc, entry) };
  }
  for (const dir of [product.base, ...product.clonedMembers()]) {
    const tip = product.tip(dir);
    for (const path of [`docs/plans/archived/${entry}`, `docs/plans/${entry}`]) {
      if (!tip.exists(path)) {
        continue;
      }
      const archived = path.includes("/archived/");
      const text = tip.show(`${path}/index.json`);
      if (text === null) {
        if (archived) {
          return {
            entry,
            kind: null,
            satisfied: true,
            reason: `${entry}: archived with no index.json`,
          };
        }
        continue;
      }
      const doc = readJson(text);
      const kind = kindOfType(doc?.type);
      if (kind === "cycle") {
        return { entry, kind, ...coversSatisfied(product, doc, entry) };
      }
      if (kind === "change") {
        return archived
          ? { entry, kind, satisfied: true, reason: `${entry}: archived, its row swept` }
          : { entry, kind, satisfied: false, reason: `${entry}: ${path} has no row in the plan index` };
      }
      return {
        entry,
        kind: null,
        satisfied: false,
        reason: `${entry}: ${path}/index.json has no known type`,
      };
    }
  }
  return {
    entry,
    kind: null,
    satisfied: false,
    reason: `${entry}: unresolvable — no row and no folder in the base or any cloned member; fix the entry by hand`,
  };
}

function entriesOf(product, rows, row) {
  const requires = Array.isArray(row.requires) ? row.requires : [];
  return requires.map((r) => resolveEntry(product, rows, r));
}

/** The D17 resolve result for one named folder. */
export function resolve({ base, folder }) {
  const product = new Product(base);
  const index = product.index();
  const id = basename(folder);
  const row = index?.plans?.find?.((r) => r && r.id === id);
  if (!row) {
    throw new QueueError(`no row for ${id} in ${TIP}:${INDEX}`);
  }
  const entries = entriesOf(product, index.plans, row);
  return { runnable: entries.every((e) => e.satisfied), entries };
}

/** The D17 pick result: the first runnable APPROVED row, or what each waits on. */
export function pick({ base }) {
  const product = new Product(base);
  const index = product.index();
  const rows = Array.isArray(index?.plans) ? index.plans : [];
  const runnable = [];
  const nothing = [];
  for (const row of rows) {
    if (!row || row.status !== "APPROVED") {
      continue;
    }
    const entries = entriesOf(product, rows, row);
    if (entries.every((e) => e.satisfied)) {
      runnable.push(row);
    } else {
      nothing.push({
        folder: row.folder,
        waits: entries.filter((e) => !e.satisfied).map((e) => e.reason),
      });
    }
  }
  if (runnable.length === 0) {
    return { nothing };
  }
  const date = (r) => r.id.slice(0, 10);
  runnable.sort((a, b) =>
    a.priority - b.priority
    || (date(a) < date(b) ? -1 : date(a) > date(b) ? 1 : 0)
    || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)
  );
  const p = runnable[0];
  return { pick: { folder: p.folder, kind: p.kind, priority: p.priority } };
}

/** The plan's name: the <name> of <date>-<name>, the <slice> of <date>-<HHMM>-<slice>. */
export function planName(id) {
  const m = id.match(/^\d{4}-\d{2}-\d{2}-(?:\d{4}-)?(.+)$/);
  return m ? m[1] : id;
}

/** The worktree directory git-workflow picks: .worktrees unless only worktrees exists. */
function worktreeDir(repo) {
  return !existsSync(join(repo, ".worktrees")) && existsSync(join(repo, "worktrees"))
    ? "worktrees"
    : ".worktrees";
}

/** The repo's name as log.mjs derives it, from the git common dir. */
function repoName(repo) {
  return basename(dirname(must(repo, ["rev-parse", "--path-format=absolute", "--git-common-dir"])));
}

/** One plan.mjs set through the script itself, so it stamps and validates. */
function planSet(cwd, file, path, value, json) {
  const r = spawnSync(
    process.execPath,
    [PLAN, "set", file, path, value, ...(json ? ["--json"] : [])],
    { cwd, encoding: "utf8" },
  );
  return r.status === 0 ? null : (r.stderr || r.error?.message || "plan.mjs set failed").trim();
}

const rejected = (err) => /\[rejected\]|non-fast-forward|fetch first|failed to push/.test(err);

/**
 * Steps 1 to 8 of *Writing a row — the claim* in one checkout: stash, develop,
 * pull, `edit`, add, commit, push with the rejected-push loop, restore.
 * `edit` returns null, { lost: reason } or { failed: reason }.
 */
function land(dir, id, files, edit) {
  const message = `docs: plan queue — ${id} running`;
  const branch = git(dir, ["symbolic-ref", "--short", "-q", "HEAD"]);
  const origin = branch.ok ? branch.out : must(dir, ["rev-parse", "HEAD"]);
  const tag = `vwf plan queue ${id}`;
  let stashed = null;
  let result;

  const drop = (committed) => {
    if (committed) {
      git(dir, ["reset", "--soft", "HEAD~1"]);
    }
    git(dir, ["checkout", "HEAD", "--", ...files]);
  };

  (() => {
    if (git(dir, ["status", "--porcelain"]).out !== "") {
      const s = git(dir, ["stash", "push", "-u", "-m", tag]);
      if (!s.ok) {
        result = { claimed: false, kind: "failed", reason: `git stash push failed: ${s.err}` };
        return;
      }
      // The stash stack is shared by every worktree and session: hold this
      // entry by its SHA, never by stash@{0}.
      stashed = stashEntries(dir).find((e) => e.tagged(tag))?.sha ?? null;
      if (stashed === null) {
        result = { claimed: false, kind: "failed", reason: `the stash "${tag}" is not on the stash list` };
        return;
      }
    }
    if (origin !== INTEGRATION) {
      const c = git(dir, ["checkout", INTEGRATION]);
      if (!c.ok) {
        result = { claimed: false, kind: "failed", reason: `git checkout ${INTEGRATION} failed: ${c.err}` };
        return;
      }
    }
    const pull = git(dir, ["pull", "--ff-only", REMOTE, INTEGRATION]);
    if (!pull.ok) {
      result = { claimed: false, kind: "failed", reason: `git pull --ff-only failed: ${pull.err}` };
      return;
    }
    const edited = edit();
    if (edited !== null) {
      drop(false);
      result = edited.lost
        ? { claimed: false, kind: "lost", reason: edited.lost }
        : { claimed: false, kind: "failed", reason: edited.failed };
      return;
    }
    const add = git(dir, ["add", "--", ...files]);
    if (!add.ok) {
      drop(false);
      result = { claimed: false, kind: "failed", reason: `git add failed: ${add.err}` };
      return;
    }
    const commit = spawnSync("mise", ["x", "--", "git", "commit", "-m", message], {
      cwd: dir,
      encoding: "utf8",
    });
    if (commit.status !== 0) {
      drop(false);
      const err = `${commit.stderr ?? ""}${commit.stdout ?? ""}`.trim() || commit.error?.message;
      result = { claimed: false, kind: "failed", reason: `the claim commit failed: ${err}` };
      return;
    }
    for (let retries = 0;; retries++) {
      const push = git(dir, ["push", REMOTE, INTEGRATION]);
      if (push.ok) {
        result = { claimed: true, commit: must(dir, ["rev-parse", "HEAD"]) };
        return;
      }
      if (!rejected(push.err)) {
        drop(true);
        result = { claimed: false, kind: "failed", reason: `git push failed: ${push.err}` };
        return;
      }
      if (retries >= PUSH_RETRIES) {
        drop(true);
        result = {
          claimed: false,
          kind: "failed",
          reason: `git push was rejected after ${PUSH_RETRIES} clean-rebase retries: ${push.err}`,
        };
        return;
      }
      const rebase = git(dir, ["pull", "--rebase", REMOTE, INTEGRATION]);
      if (rebase.ok) {
        continue;
      }
      const conflicted = git(dir, ["diff", "--name-only", "--diff-filter=U"]).out.split("\n");
      git(dir, ["rebase", "--abort"]);
      drop(true);
      if (conflicted.includes(files[0])) {
        git(dir, ["pull", "--ff-only", REMOTE, INTEGRATION]);
        result = {
          claimed: false,
          kind: "lost",
          reason: `another session changed the same row of ${files[0]} first`,
        };
      } else {
        result = { claimed: false, kind: "failed", reason: `git pull --rebase failed: ${rebase.err}` };
      }
      return;
    }
  })();

  // Step 8: every path ends here.
  const now = git(dir, ["symbolic-ref", "--short", "-q", "HEAD"]);
  if ((now.ok ? now.out : "") !== origin) {
    const back = git(dir, ["checkout", origin]);
    if (!back.ok) {
      result.warning = `could not check out ${origin} again: ${back.err}`;
    }
  }
  if (stashed !== null) {
    const apply = git(dir, ["stash", "apply", stashed]);
    if (apply.ok) {
      const n = stashEntries(dir).findIndex((e) => e.sha === stashed);
      if (n !== -1) {
        git(dir, ["stash", "drop", `stash@{${n}}`]);
      }
    } else {
      git(dir, ["reset", "--merge"]);
      const note = `git stash apply ${stashed} failed in ${dir}; the stash "${tag}" (${stashed}) is kept — apply it by hand`;
      result.warning = result.warning ? `${result.warning}; ${note}` : note;
    }
  }
  return result;
}

/** The shared stash stack, newest first: each entry's SHA and reflog subject. */
function stashEntries(dir) {
  const list = git(dir, ["stash", "list", "--format=%H %gs"]);
  if (!list.ok || list.out === "") {
    return [];
  }
  return list.out.split("\n").map((line) => {
    const space = line.indexOf(" ");
    const sha = line.slice(0, space);
    const subject = line.slice(space + 1);
    return { sha, tagged: (tag) => subject.endsWith(`: ${tag}`) };
  });
}

/**
 * The D17 claim: the row RUNNING and the folder's run, committed and pushed
 * on develop in the base's main checkout; a member folder's run is a second
 * direct commit on that member's develop (D19). `worktree` overrides the
 * default <dir>/<plan name> (D20).
 */
export function claim({ base, folder, worktree }) {
  const id = basename(folder);
  const product = new Product(base);
  let row;
  try {
    row = product.index()?.plans?.find?.((r) => r && r.id === id);
  } catch (e) {
    if (e instanceof QueueError) {
      return { claimed: false, kind: "failed", reason: e.message };
    }
    throw e;
  }
  if (!row) {
    return { claimed: false, kind: "failed", reason: `no row for ${id} in ${TIP}:${INDEX}` };
  }
  if (row.status === "RUNNING") {
    return { claimed: false, kind: "lost", reason: `${id} is already RUNNING at ${TIP}` };
  }
  if (row.status !== "APPROVED") {
    return { claimed: false, kind: "failed", reason: `${id} is ${row.status} at ${TIP}, not APPROVED` };
  }
  const repo = product.repoOf(row);
  if (repo.dir === undefined) {
    return { claimed: false, kind: "failed", reason: repo.reason };
  }
  const folderDir = repo.dir;
  const member = folderDir !== base;
  if (member) {
    try {
      product.tip(folderDir).ready();
    } catch (e) {
      return { claimed: false, kind: "failed", reason: e.message };
    }
  }
  const run = JSON.stringify({
    worktree: worktree ?? `${worktreeDir(folderDir)}/${planName(id)}`,
    log: `~/Library/Caches/vwf/${repoName(folderDir)}/${id}.jsonl`,
  });
  const folderIndex = `${row.folder}/index.json`;

  const setRun = (dir) => {
    if (!existsSync(join(dir, folderIndex))) {
      return { failed: `${folderIndex} is not in ${dir} after the pull` };
    }
    const err = planSet(dir, folderIndex, "run", run, true);
    return err === null ? null : { failed: err };
  };

  const baseResult = land(base, id, member ? [INDEX] : [INDEX, folderIndex], () => {
    const current = readJson(readFileSync(join(base, INDEX), "utf8"));
    const now = current?.plans?.find?.((r) => r && r.id === id);
    if (!now || now.status !== "APPROVED") {
      return { lost: `${id} is ${now ? now.status : "gone"} after the pull` };
    }
    const err = planSet(base, INDEX, `plans.${id}.status`, "RUNNING", false);
    if (err !== null) {
      return { failed: err };
    }
    return member ? null : setRun(base);
  });
  if (!baseResult.claimed || !member) {
    return baseResult;
  }
  const memberResult = land(folderDir, id, [folderIndex], () => setRun(folderDir));
  if (!memberResult.claimed) {
    const out = {
      claimed: false,
      kind: "member-failed",
      reason: `the row is RUNNING at ${baseResult.commit}, but the member run commit failed: ${memberResult.reason}; make the plan-management unclaim ${id} request`,
    };
    const warning = [baseResult.warning, memberResult.warning].filter(Boolean).join("; ");
    return warning ? { ...out, warning } : out;
  }
  const warning = [baseResult.warning, memberResult.warning].filter(Boolean).join("; ");
  return warning
    ? { claimed: true, commit: baseResult.commit, warning }
    : { claimed: true, commit: baseResult.commit };
}
