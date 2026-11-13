// The queue verbs of plan.mjs: pick, resolve and claim, over the plan index
// at the tip of the work branch (references/plan-index.md, *Resolution*,
// *Reading the queue* and *Writing a row — the claim*).
//
// The caller names the work branch: `branches.base` for the base repo,
// `branches.member` for every member repo. The tip of a repo is
// origin/<branch> when the repo has an origin remote, else the local branch
// <branch>; a repo without that ref is refused, and a member read with no
// member branch is refused. Every read of a row, a folder's index.json, an
// archived folder or a covers doc is `git show` / `git ls-tree` of the tip,
// never the working copy. Every git call is an argument array, never a shell
// string. The claim is never a direct commit on the work branch: it lands
// through git-workflow's land (scripts/lib/land.mjs) — a worktree and local
// branch, a commit, a merge, a push, the worktree and branch removed; a merge
// the hooks refuse becomes a pull request. In a repo with no origin there is
// no fetch, no pull and no push.
//
// pick    → { pick: { folder, kind, priority } } | { nothing: [{ folder, waits }] }
// resolve → { runnable, entries: [{ entry, kind, satisfied, reason }] }
// claim   → { claimed: true, commit[, warning] }
//         | { claimed: false, kind: pr, url, branch, repo, reason[, warning] }
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
import { abandon, close, LandError, open, worktreeDir } from "../../../git-workflow/scripts/lib/land.mjs";
import { parseFrontmatter, parseYaml } from "./yaml.mjs";

/** A refusal that is not a queue answer; plan.mjs exits 2 on it. */
export class QueueError extends Error {
  constructor(message) {
    super(message);
    this.name = "QueueError";
  }
}

export const REMOTE = "origin";
const INDEX = "docs/plans/index.json";
const PLAN = join(import.meta.dirname, "..", "plan.mjs");

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

/** Whether `dir` has an origin remote. */
export function hasRemote(dir) {
  return git(dir, ["remote", "get-url", REMOTE]).ok;
}

/**
 * The tip of `branch` in `dir`: { remote, ref, full }. ref is origin/<branch>
 * with an origin remote, else <branch>; full is its refs/ name.
 */
export function tipRef(dir, branch) {
  const remote = hasRemote(dir);
  return remote
    ? { remote, ref: `${REMOTE}/${branch}`, full: `refs/remotes/${REMOTE}/${branch}` }
    : { remote, ref: branch, full: `refs/heads/${branch}` };
}

/** The tip reader of one repo: one fetch when it has a remote, then git show / ls-tree. */
class Tip {
  constructor(dir, branch, flag) {
    this.dir = dir;
    this.branch = branch;
    this.flag = flag;
    this.fetched = false;
    this.ref = branch ? tipRef(dir, branch).ref : null;
  }

  /** Fetch once; throws QueueError with no branch, or when the tip does not exist. */
  ready() {
    if (!this.branch) {
      throw new QueueError(`${this.dir} is a member repo; pass ${this.flag} <name>`);
    }
    const t = tipRef(this.dir, this.branch);
    if (t.remote && !this.fetched) {
      must(this.dir, ["fetch", REMOTE]);
      this.fetched = true;
    }
    if (!git(this.dir, ["rev-parse", "--verify", "--quiet", t.full]).ok) {
      throw new QueueError(`${t.ref} does not exist in ${this.dir}; the work branch is ${this.branch}`);
    }
  }

  show(path) {
    this.ready();
    const r = git(this.dir, ["show", `${this.ref}:${path}`]);
    return r.ok ? r.out : null;
  }

  exists(path) {
    this.ready();
    return git(this.dir, ["ls-tree", "--name-only", this.ref, "--", path]).out !== "";
  }
}

/** The repos a queue read can reach: the base and its members. */
class Product {
  constructor(base, branches) {
    this.base = base;
    this.branches = branches ?? {};
    this.tips = new Map();
    const config = readYaml(join(base, ".config", "vwf.yaml"));
    this.members = Array.isArray(config?.members) ? config.members : [];
  }

  tip(dir) {
    if (!this.tips.has(dir)) {
      this.tips.set(
        dir,
        dir === this.base
          ? new Tip(dir, this.branches.base, "--branch")
          : new Tip(dir, this.branches.member, "--member-branch"),
      );
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

  /** The base tip's ref, for messages. */
  get ref() {
    return this.tip(this.base).ref;
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
      throw new QueueError(`${this.ref}:${INDEX} is not valid JSON (${e.message})`);
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
      return { satisfied: false, reason: `${entry}: covers doc ${doc} is not at ${product.ref}` };
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
        reason: `${entry}: ${row.folder}/index.json is not at ${product.tip(repo.dir).ref} of ${repo.dir}`,
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
export function resolve({ base, folder, branches }) {
  const product = new Product(base, branches);
  const index = product.index();
  const id = basename(folder);
  const row = index?.plans?.find?.((r) => r && r.id === id);
  if (!row) {
    throw new QueueError(`no row for ${id} in ${product.ref}:${INDEX}`);
  }
  const entries = entriesOf(product, index.plans, row);
  return { runnable: entries.every((e) => e.satisfied), entries };
}

/** The D17 pick result: the first runnable APPROVED row, or what each waits on. */
export function pick({ base, branches }) {
  const product = new Product(base, branches);
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

/**
 * One claim commit on `into` of `dir`, through git-workflow's land: a worktree
 * and local branch cut from the tip, `edit(worktree)` there, then close —
 * commit, merge, push, clean up. `edit` returns null, { lost: reason } or
 * { failed: reason }. A conflict on `contested` is a lost claim.
 */
function landClaim(dir, into, id, contested, edit) {
  const fail = (reason) => ({ claimed: false, kind: "failed", reason });
  let opened;
  try {
    opened = open({ repo: dir, into, name: `vwf-claim-${planName(id)}` });
  } catch (e) {
    if (e instanceof LandError) {
      return fail(e.message);
    }
    throw e;
  }
  const drop = () => {
    try {
      abandon({ worktree: opened.worktree });
      return null;
    } catch (e) {
      return e.message;
    }
  };
  const edited = edit(opened.worktree);
  if (edited !== null) {
    const left = drop();
    const out = edited.lost ? { claimed: false, kind: "lost", reason: edited.lost } : fail(edited.failed);
    return left === null ? out : { ...out, warning: left };
  }
  const r = close({ worktree: opened.worktree, into, message: `docs: plan queue — ${id} running` });
  const keep = (out) => (r.warning ? { ...out, warning: r.warning } : out);
  if (r.landed) {
    return keep({ claimed: true, commit: r.commit });
  }
  if (r.kind === "pr") {
    return keep({
      claimed: false,
      kind: "pr",
      url: r.url,
      branch: r.branch,
      repo: dir,
      reason: r.reason ?? `the merge into ${into} was refused; the claim waits on its pull request`,
    });
  }
  const left = drop();
  const out = r.kind === "conflict" && r.files.includes(contested)
    ? { claimed: false, kind: "lost", reason: `another session changed the same row of ${contested} first` }
    : fail(r.reason);
  const warning = [r.warning, left].filter(Boolean).join("; ");
  return warning ? { ...out, warning } : out;
}

/**
 * The D17 claim: the row RUNNING and the folder's run, landed on the base's
 * work branch through git-workflow's land — never a direct commit; a member
 * folder's run is a second landing on that member's work branch (D19). A
 * merge the hooks refuse returns kind pr: the claim waits on that pull
 * request. `worktree` overrides the default <dir>/<plan name> (D20).
 */
export function claim({ base, folder, worktree, branches }) {
  const id = basename(folder);
  const product = new Product(base, branches);
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
    return { claimed: false, kind: "failed", reason: `no row for ${id} in ${product.ref}:${INDEX}` };
  }
  if (row.status === "RUNNING") {
    return { claimed: false, kind: "lost", reason: `${id} is already RUNNING at ${product.ref}` };
  }
  if (row.status !== "APPROVED") {
    return { claimed: false, kind: "failed", reason: `${id} is ${row.status} at ${product.ref}, not APPROVED` };
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
      return { failed: `${folderIndex} is not at the tip of ${dir}` };
    }
    const err = planSet(dir, folderIndex, "run", run, true);
    return err === null ? null : { failed: err };
  };

  const baseResult = landClaim(base, product.branches.base, id, INDEX, (wt) => {
    const current = readJson(readFileSync(join(wt, INDEX), "utf8"));
    const now = current?.plans?.find?.((r) => r && r.id === id);
    if (!now || now.status !== "APPROVED") {
      return { lost: `${id} is ${now ? now.status : "gone"} at the tip` };
    }
    const err = planSet(wt, INDEX, `plans.${id}.status`, "RUNNING", false);
    if (err !== null) {
      return { failed: err };
    }
    return member ? null : setRun(wt);
  });
  if (!baseResult.claimed || !member) {
    return baseResult;
  }
  const memberResult = landClaim(folderDir, product.branches.member, id, folderIndex, setRun);
  const warning = [baseResult.warning, memberResult.warning].filter(Boolean).join("; ");
  if (memberResult.kind === "pr") {
    const out = { ...memberResult, reason: `the row is RUNNING at ${baseResult.commit}; ${memberResult.reason}` };
    return warning ? { ...out, warning } : out;
  }
  if (!memberResult.claimed) {
    const out = {
      claimed: false,
      kind: "member-failed",
      reason: `the row is RUNNING at ${baseResult.commit}, but the member run commit failed: ${memberResult.reason}; make the plan-management unclaim ${id} request`,
    };
    return warning ? { ...out, warning } : out;
  }
  return warning
    ? { claimed: true, commit: baseResult.commit, warning }
    : { claimed: true, commit: baseResult.commit };
}
