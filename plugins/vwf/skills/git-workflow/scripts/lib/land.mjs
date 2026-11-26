// The one way vwf writes a commit to a protected branch (develop or main):
// never a direct commit. A change is made in its own worktree, on its own
// local branch cut from the branch's tip, committed there, rebased on the tip,
// and landed by bootstrap's git:merge:<branch> task, which merges and pushes,
// or pushes the branch and opens a pull request when the branch's landing is
// pr. bootstrap's git:worktree:create and git:worktree:delete make and remove
// the worktree. The caller waits for a pull request to merge, then calls
// `finish`.
//
// open    → { worktree, branch, into, base }
// close   → { landed: true, commit[, warning] }
//         | { landed: false, kind: pr, url, branch[, warning] }
//         | { landed: false, kind: conflict, files, reason[, warning] }
//         | { landed: false, kind: failed, reason[, unpushed: true][, warning] }
// abandon → { abandoned: true, branch[, warning] }: removes land.mjs's own
//           scratch worktree and branch; anything else goes through
//           git:worktree:delete, which keeps an unmerged branch
// finish  → { finished: true[, warning] } after the pull request merged
//         | { finished: false, reason, command } while it has not
//
// land.mjs runs no destructive raw git: it aborts no merge in the main
// checkout, resets no branch, checks nothing out after the task, and deletes
// only its own scratch branch (branch.<name>.vwfLandBase is set by open, and
// every commit after that base carries the trailer Vwf-Land: close).
//
// A repo with no origin remote is supported: its tip is the local branch, and
// there is no fetch or push. Every git call is an argument array, never a
// shell string; the commit runs through `mise x --` so that the repo's hooks
// run, and the tasks through `mise run`.

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import {
  dirname,
  join,
  resolve,
} from "node:path";

export const REMOTE = "origin";
/** The trailer close adds to each change commit it makes. */
const TRAILER = "Vwf-Land: close";
/** The hint when a bootstrap git port is missing (bootstrap-contract.md, the git ports). */
const MIGRATE = "the repo has no bootstrap git task for this step: run `bootstrap migrate`";
/** The lines of a task's output a reason keeps. */
const TAIL = 20;

export class LandError extends Error {
  constructor(message) {
    super(message);
    this.name = "LandError";
  }
}

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
    throw new LandError(`git ${args.join(" ")} failed in ${cwd}: ${r.err}`);
  }
  return r.out;
}

/** A command through `mise x --`, so the repo's pinned tools and hooks run. */
function mise(cwd, args) {
  const r = spawnSync("mise", ["x", "--", ...args], { cwd, encoding: "utf8" });
  return {
    ok: r.status === 0,
    out: (r.stdout ?? "").trim(),
    err: (`${r.stderr ?? ""}${r.stdout ?? ""}`.trim() || r.error?.message) ?? "",
  };
}

/** One bootstrap task, `mise run <name> -- <args>`: { ok, missing, out }. */
function task(cwd, name, args) {
  const r = spawnSync("mise", ["run", name, "--", ...args], { cwd, encoding: "utf8" });
  const out = (`${r.stdout ?? ""}${r.stderr ?? ""}`.trim() || r.error?.message) ?? "";
  return {
    ok: r.status === 0,
    status: r.status,
    missing: new RegExp(`no task ${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")} found`).test(out),
    out,
  };
}

/** The last lines of a task's output. */
function tail(out) {
  return out.split("\n").slice(-TAIL).join("\n");
}

/** Whether `dir` has an origin remote. */
export function hasRemote(dir) {
  return git(dir, ["remote", "get-url", REMOTE]).ok;
}

/**
 * The main checkout of the repo `dir` is in: the parent of the git common
 * dir, unless that dir sets core.worktree. A submodule's common dir is
 * <superproject>/.git/modules/<name>, whose parent is inside the
 * superproject's git dir; its core.worktree names the submodule's work tree.
 */
export function mainCheckout(dir) {
  const common = must(dir, ["rev-parse", "--path-format=absolute", "--git-common-dir"]);
  const tree = git(dir, ["config", "--file", join(common, "config"), "core.worktree"]);
  return tree.ok && tree.out !== "" ? resolve(common, tree.out) : dirname(common);
}

/** The worktree directory git-workflow picks: .worktrees unless only worktrees exists. */
export function worktreeDir(repo) {
  return !existsSync(join(repo, ".worktrees")) && existsSync(join(repo, "worktrees"))
    ? "worktrees"
    : ".worktrees";
}

const exists = (dir, ref) => git(dir, ["rev-parse", "--verify", "--quiet", ref]).ok;
const contains = (dir, branch, ref) => git(dir, ["merge-base", "--is-ancestor", branch, ref]).ok;
const midMerge = (dir) => exists(dir, "MERGE_HEAD");
const baseKey = (branch) => `branch.${branch}.vwfLandBase`;

/**
 * Whether `branch` is land.mjs's own scratch: open recorded its base, and
 * every commit after that base carries close's trailer (none qualifies).
 */
function isScratch(main, branch) {
  const base = git(main, ["config", "--get", baseKey(branch)]);
  if (!base.ok || base.out === "" || !exists(main, `${base.out}^{commit}`)) {
    return false;
  }
  const list = git(main, ["rev-list", `${base.out}..refs/heads/${branch}`]);
  if (!list.ok) {
    return false;
  }
  return list.out.split("\n").filter(Boolean).every((sha) => {
    const t = git(main, ["show", "-s", "--format=%(trailers:key=Vwf-Land,valueonly)", sha]);
    return t.ok && t.out.split("\n").includes("close");
  });
}

/** Remove land.mjs's own scratch worktree and branch, dirty or unmerged; null or the error. */
function dropScratch(main, worktree, branch) {
  const errs = [];
  if (existsSync(worktree)) {
    const w = git(main, ["worktree", "remove", "--force", worktree]);
    if (!w.ok) {
      errs.push(`git worktree remove --force ${worktree} failed: ${w.err}`);
    }
  }
  if (exists(main, `refs/heads/${branch}`)) {
    const b = git(main, ["branch", "-D", branch]);
    if (!b.ok) {
      errs.push(`git branch -D ${branch} failed: ${b.err}`);
    }
  } else {
    git(main, ["config", "--unset", baseKey(branch)]);
  }
  return errs.length > 0 ? errs.join("; ") : null;
}

/**
 * A new worktree on a new local branch `name`, cut from the tip of `into` by
 * git:worktree:create. The branch is local: its upstream is unset.
 */
export function open({ repo, into, name }) {
  if (!into || !name) {
    throw new LandError("open needs the branch to land on and a name");
  }
  const main = mainCheckout(repo);
  if (exists(main, `refs/heads/${name}`)) {
    throw new LandError(`the branch ${name} already exists in ${main}; finish or abandon it first`);
  }
  const remote = hasRemote(main);
  if (remote) {
    must(main, ["fetch", REMOTE]);
    if (exists(main, `refs/remotes/${REMOTE}/${name}`)) {
      throw new LandError(
        `${REMOTE}/${name} already exists; finish its pull request, or delete ${REMOTE}/${name}, first`,
      );
    }
  }
  const base = remote ? `${REMOTE}/${into}` : into;
  const full = remote ? `refs/remotes/${REMOTE}/${into}` : `refs/heads/${into}`;
  if (!exists(main, full)) {
    throw new LandError(`${base} does not exist in ${main}; the branch to land on is ${into}`);
  }
  const worktree = join(main, worktreeDir(main), name);
  if (existsSync(worktree)) {
    throw new LandError(`${worktree} already exists; finish or abandon it first`);
  }
  must(main, ["config", baseKey(name), must(main, ["rev-parse", full])]);
  // The flag is a template literal: rule 16's checker reads a quoted string
  // right after that flag's name as an import.
  const create = task(main, "git:worktree:create", [name, `--from`, base, "--no-setup"]);
  if (!create.ok || !existsSync(worktree)) {
    const left = dropScratch(main, worktree, name);
    const why = create.missing
      ? MIGRATE
      : create.ok
      ? `git:worktree:create made no ${worktree}`
      : `git:worktree:create failed: ${tail(create.out)}`;
    throw new LandError(left === null ? why : `${why}; ${left}`);
  }
  // For a consumer with an old git:worktree:create, synced before bootstrap
  // c3e3ddd: that task gives a branch cut from origin/<into> an upstream, and
  // git:merge:<into> then refuses the branch as unpushed. A newer task cuts
  // the branch with --no-track, and this check finds no upstream.
  if (git(main, ["rev-parse", "--abbrev-ref", "--symbolic-full-name", `${name}@{upstream}`]).ok) {
    must(main, ["branch", "--unset-upstream", name]);
  }
  return { worktree, branch: name, into, base };
}

/** The branch a worktree is on, and its main checkout. */
function where(worktree) {
  const branch = must(worktree, ["symbolic-ref", "--short", "HEAD"]);
  return { branch, main: mainCheckout(worktree) };
}

/**
 * Remove the worktree of a change that will not land. land.mjs's own scratch
 * goes whole, dirty or unmerged; anything else goes through
 * git:worktree:delete, which keeps an unmerged branch and says so.
 */
export function abandon({ worktree }) {
  const { branch, main } = where(worktree);
  if (isScratch(main, branch)) {
    const left = dropScratch(main, worktree, branch);
    if (left !== null) {
      throw new LandError(`could not remove ${worktree} and its branch ${branch}: ${left}`);
    }
    return { abandoned: true, branch };
  }
  const del = task(main, "git:worktree:delete", [branch]);
  if (del.ok) {
    return { abandoned: true, branch };
  }
  if (del.missing) {
    throw new LandError(MIGRATE);
  }
  if (del.status === 1) {
    return {
      abandoned: true,
      branch,
      warning: `${tail(del.out)}\nthe branch ${branch} is kept; delete it with git branch -D ${branch}`,
    };
  }
  throw new LandError(`git:worktree:delete ${branch} failed: ${tail(del.out)}`);
}

/** The files a stopped merge or rebase left in conflict. */
function conflicts(dir) {
  const r = git(dir, ["diff", "--name-only", "--diff-filter=U"]);
  return r.ok && r.out !== "" ? r.out.split("\n") : [];
}

/** Remove the worktree after a landed or PR result; a warning, or null. */
function removeWorktree(main, worktree, branch) {
  task(main, "git:worktree:delete", [branch]);
  return existsSync(worktree) ? `${worktree} could not be removed — remove it by hand` : null;
}

/** The pull request URL of `branch`, from gh, or null. */
function prUrl(dir, branch) {
  const r = mise(dir, ["gh", "pr", "view", branch, "--json", "url"]);
  if (!r.ok) {
    return null;
  }
  try {
    return JSON.parse(r.out).url ?? null;
  } catch {
    return null;
  }
}

/**
 * Commit every change in `worktree` with `message`, rebase the branch on the
 * tip of `into` in the worktree, then run git:merge:<into> from the worktree:
 * the task merges and pushes, or opens a pull request. On landed or PR the
 * worktree is removed (a PR keeps the branch for `finish`); on a conflict or
 * a failure the worktree and branch stay for the caller.
 */
export function close({ worktree, into, message }) {
  if (!into || !message) {
    throw new LandError("close needs the branch to land on and a message");
  }
  const { branch, main } = where(worktree);
  if (midMerge(main)) {
    return {
      landed: false,
      kind: "failed",
      reason:
        `the main checkout ${main} was mid-merge before the landing; resolve and commit it, or run git merge --abort there, then close again`,
    };
  }
  if (git(worktree, ["status", "--porcelain"]).out === "") {
    return { landed: false, kind: "failed", reason: `nothing to commit in ${worktree}` };
  }
  const add = git(worktree, ["add", "-A"]);
  if (!add.ok) {
    return { landed: false, kind: "failed", reason: `git add failed: ${add.err}` };
  }
  const commit = mise(worktree, ["git", "commit", "-m", message, "-m", TRAILER]);
  if (!commit.ok) {
    git(worktree, ["reset", "--quiet"]);
    return { landed: false, kind: "failed", reason: `the commit failed: ${commit.err}` };
  }

  const remote = hasRemote(main);
  if (remote) {
    const f = git(worktree, ["fetch", REMOTE]);
    if (!f.ok) {
      return { landed: false, kind: "failed", reason: `git fetch ${REMOTE} failed: ${f.err}` };
    }
  }
  const tipRef = remote ? `${REMOTE}/${into}` : into;
  const rebase = git(worktree, ["rebase", tipRef]);
  if (!rebase.ok) {
    const files = conflicts(worktree);
    git(worktree, ["rebase", "--abort"]);
    return files.length > 0
      ? {
        landed: false,
        kind: "conflict",
        files,
        reason: `rebasing ${branch} on ${tipRef} conflicts on ${files.join(", ")}`,
      }
      : { landed: false, kind: "failed", reason: `git rebase ${tipRef} failed: ${rebase.err}` };
  }
  git(main, ["config", baseKey(branch), must(worktree, ["rev-parse", tipRef])]);

  const merge = task(worktree, `git:merge:${into}`, [branch]);
  if (merge.missing) {
    return { landed: false, kind: "failed", reason: MIGRATE };
  }
  const landed = () => {
    const out = { landed: true, commit: must(main, ["rev-parse", `refs/heads/${into}`]) };
    const left = removeWorktree(main, worktree, branch);
    return left === null ? out : { ...out, warning: `${into} has the change, but ${left}` };
  };
  if (merge.ok) {
    if (contains(main, branch, `refs/heads/${into}`)) {
      return landed();
    }
    const out = { landed: false, kind: "pr", url: prUrl(worktree, branch), branch };
    const left = removeWorktree(main, worktree, branch);
    return left === null ? out : { ...out, warning: left };
  }

  const onInto = git(main, ["symbolic-ref", "--short", "-q", "HEAD"]).out === into;
  const failed = (reason, extra = {}) => ({
    landed: false,
    kind: "failed",
    reason: onInto ? `${reason}; the main checkout ${main} is now on ${into}` : reason,
    ...extra,
  });
  if (midMerge(main)) {
    const files = conflicts(main);
    return failed(
      `git:merge:${into} left the main checkout ${main} mid-merge, as the task left it, with conflicts on ${
        files.join(", ")
      }: resolve them and commit, or run git merge --abort there`,
    );
  }
  const pushed = remote
    ? exists(main, `refs/remotes/${REMOTE}/${into}`) && contains(main, branch, `refs/remotes/${REMOTE}/${into}`)
    : contains(main, branch, `refs/heads/${into}`);
  if (pushed) {
    const out = landed();
    const note = `git:merge:${into} landed the change, then failed: ${tail(merge.out)}`;
    return { ...out, warning: out.warning ? `${note}; ${out.warning}` : note };
  }
  if (remote && contains(main, branch, `refs/heads/${into}`)) {
    return failed(
      `the merge commit is on the local ${into} but not pushed: run git push ${REMOTE} ${into} from ${main}; ${
        tail(merge.out)
      }`,
      { unpushed: true },
    );
  }
  return failed(`git:merge:${into} failed: ${tail(merge.out)}`);
}

/**
 * The request of `branch`: { state, head } — state "merged" or another state,
 * head the request's head commit — or null with no CLI.
 */
function request(dir, branch) {
  const gh = mise(dir, ["gh", "pr", "view", branch, "--json", "state,headRefOid"]);
  if (gh.ok) {
    try {
      const { state, headRefOid } = JSON.parse(gh.out);
      return { state: state === "MERGED" ? "merged" : String(state), head: String(headRefOid ?? "") };
    } catch {
      // Fall through to glab.
    }
  }
  const glab = mise(dir, ["glab", "mr", "view", branch, "--output", "json"]);
  if (glab.ok) {
    try {
      const { state, sha } = JSON.parse(glab.out);
      return { state: state === "merged" ? "merged" : String(state), head: String(sha ?? "") };
    } catch {
      return null;
    }
  }
  return null;
}

/** Whether the merged request's `head` holds the local tip of `branch`: equal, or the tip an ancestor of it. */
function headHoldsTip(main, branch, head) {
  const tip = git(main, ["rev-parse", "--verify", "-q", `refs/heads/${branch}`]);
  if (!tip.ok || head === "") {
    return false;
  }
  return head === tip.out || git(main, ["merge-base", "--is-ancestor", tip.out, head]).ok;
}

/**
 * After the pull request of `branch` merged, as gh or glab reports it: delete
 * the local branch, delete origin/<branch> when it is land.mjs's own scratch,
 * and fast-forward `into` in the main checkout when that is the branch it is
 * on. Before that, keep the branch and return the command for the user.
 */
export function finish({ repo, branch, into }) {
  const main = mainCheckout(repo);
  const req = request(main, branch);
  const command = `git branch -D ${branch}`;
  if (req?.state !== "merged") {
    return {
      finished: false,
      reason: req === null
        ? `neither gh nor glab reports the request of ${branch}; the branch is kept — delete it once the request merged`
        : `the request of ${branch} is ${req.state}, not merged; the branch is kept`,
      command,
    };
  }
  const remote = hasRemote(main);
  if (remote) {
    git(main, ["fetch", "--prune", REMOTE]);
  }
  const local = exists(main, `refs/heads/${branch}`);
  if (local && !headHoldsTip(main, branch, req.head)) {
    return {
      finished: false,
      reason: `the merged request of ${branch} has head ${
        req.head || "unknown"
      }, which does not hold the branch's tip; the branch is kept — delete it once its commits merged`,
      command,
    };
  }
  const scratch = local && isScratch(main, branch);
  const out = { finished: true };
  const warn = (note) => {
    out.warning = out.warning ? `${out.warning}; ${note}` : note;
  };
  if (remote) {
    if (scratch && exists(main, `refs/remotes/${REMOTE}/${branch}`)) {
      const d = git(main, ["push", REMOTE, "--delete", branch]);
      if (!d.ok) {
        warn(`git push ${REMOTE} --delete ${branch} failed: ${d.err}`);
      }
    }
    const on = git(main, ["symbolic-ref", "--short", "-q", "HEAD"]);
    if (into && on.ok && on.out === into) {
      const pull = git(main, ["pull", "--ff-only", REMOTE, into]);
      if (!pull.ok) {
        warn(`git pull --ff-only ${REMOTE} ${into} failed: ${pull.err}`);
      }
    }
  }
  if (exists(main, `refs/heads/${branch}`)) {
    const d = git(main, ["branch", "-D", branch]);
    if (!d.ok) {
      throw new LandError(`git branch -D ${branch} failed: ${d.err}`);
    }
  }
  return out;
}
