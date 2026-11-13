// The one way vwf writes a commit to a protected branch (develop or main):
// never a direct commit. A change is made in its own worktree, on its own
// local branch cut from the branch's tip, committed there, merged into the
// branch in the main checkout, pushed, and the worktree and branch removed.
// When pre-commit refuses the merge, the branch is pushed and a pull request
// opened instead; the caller waits for it to merge, then calls `finish`.
//
// open    → { worktree, branch, into, base }
// close   → { landed: true, commit[, warning] }
//         | { landed: false, kind: pr, url, branch[, warning] }
//         | { landed: false, kind: conflict, files, reason[, warning] }
//         | { landed: false, kind: failed, reason[, warning] }
// abandon → removes the worktree and deletes its branch
// finish  → after the pull request merged: deletes the local branch, and
//           fast-forwards the branch in the main checkout when it is there
//
// A repo with no origin remote is supported: its tip is the local branch, and
// there is no fetch, pull, push or pull request; a refused merge there fails.
// Every git call is an argument array, never a shell string; the commit and
// the merge run through `mise x --` so that the repo's hooks run.

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";

export const REMOTE = "origin";
/** The clean retries of a rejected push before close refuses. */
const PUSH_RETRIES = 3;

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

/** Whether `dir` has an origin remote. */
export function hasRemote(dir) {
  return git(dir, ["remote", "get-url", REMOTE]).ok;
}

/** The main checkout of the repo `dir` is in: the parent of the git common dir. */
export function mainCheckout(dir) {
  return dirname(must(dir, ["rev-parse", "--path-format=absolute", "--git-common-dir"]));
}

/** The worktree directory git-workflow picks: .worktrees unless only worktrees exists. */
export function worktreeDir(repo) {
  return !existsSync(join(repo, ".worktrees")) && existsSync(join(repo, "worktrees"))
    ? "worktrees"
    : ".worktrees";
}

/** The tip of `branch` in `dir`, fetched first when the repo has a remote. */
function tip(dir, branch) {
  const remote = hasRemote(dir);
  if (remote) {
    must(dir, ["fetch", REMOTE]);
  }
  const ref = remote ? `${REMOTE}/${branch}` : branch;
  const full = remote ? `refs/remotes/${REMOTE}/${branch}` : `refs/heads/${branch}`;
  if (!git(dir, ["rev-parse", "--verify", "--quiet", full]).ok) {
    throw new LandError(`${ref} does not exist in ${dir}; the branch to land on is ${branch}`);
  }
  return ref;
}

/**
 * A new worktree on a new local branch `name`, cut from the tip of `into`.
 * The branch is never pushed unless a pull request needs it.
 */
export function open({ repo, into, name }) {
  if (!into || !name) {
    throw new LandError("open needs the branch to land on and a name");
  }
  const main = mainCheckout(repo);
  if (git(main, ["rev-parse", "--verify", "--quiet", `refs/heads/${name}`]).ok) {
    throw new LandError(`the branch ${name} already exists in ${main}; finish or abandon it first`);
  }
  const base = tip(main, into);
  const worktree = join(main, worktreeDir(main), name);
  if (existsSync(worktree)) {
    throw new LandError(`${worktree} already exists; finish or abandon it first`);
  }
  must(main, ["worktree", "add", "--quiet", "--no-track", "-b", name, worktree, base]);
  return { worktree, branch: name, into, base };
}

/** The branch a worktree is on, and its main checkout. */
function where(worktree) {
  const branch = must(worktree, ["symbolic-ref", "--short", "HEAD"]);
  return { branch, main: mainCheckout(worktree) };
}

/**
 * Remove a worktree and delete its branch; true when both went. Without
 * `force`, the branch goes only when `into` contains it: `git branch -d`
 * compares with HEAD, which in the main checkout may be another branch.
 */
function remove(main, worktree, branch, force, into) {
  const w = git(main, ["worktree", "remove", ...(force ? ["--force"] : []), worktree]);
  const merged = force || git(main, ["merge-base", "--is-ancestor", branch, into]).ok;
  const b = merged ? git(main, ["branch", "-D", branch]) : { ok: false };
  return w.ok && b.ok;
}

/** Remove the worktree of a change that will not land, and delete its branch. */
export function abandon({ worktree }) {
  const { branch, main } = where(worktree);
  if (!remove(main, worktree, branch, true)) {
    throw new LandError(`could not remove ${worktree} and its branch ${branch}`);
  }
  return { abandoned: true, branch };
}

const rejected = (err) => /\[rejected\]|non-fast-forward|fetch first|failed to push/.test(err);

/** The shared stash stack, newest first: each entry's SHA. */
function stashShas(dir) {
  const list = git(dir, ["stash", "list", "--format=%H"]);
  return list.ok && list.out !== "" ? list.out.split("\n") : [];
}

/**
 * Run `body` in the main checkout on `into`: set aside its changes in a stash
 * held by SHA, check out `into`, run, then go back to the branch it was on and
 * apply the stash. Returns body's result, with a warning when a step back fails.
 */
function onBranch(main, into, tag, body) {
  const branch = git(main, ["symbolic-ref", "--short", "-q", "HEAD"]);
  const origin = branch.ok ? branch.out : must(main, ["rev-parse", "HEAD"]);
  let stashed = null;
  let result;

  (() => {
    if (git(main, ["status", "--porcelain"]).out !== "") {
      const before = git(main, ["rev-parse", "-q", "--verify", "refs/stash"]);
      const s = git(main, ["stash", "push", "-u", "-m", tag]);
      if (!s.ok) {
        result = { landed: false, kind: "failed", reason: `git stash push failed: ${s.err}` };
        return;
      }
      // The stash stack is shared by every worktree and session: hold this
      // entry by the SHA refs/stash names right after the push, never by
      // stash@{0} or by its tag.
      const after = git(main, ["rev-parse", "refs/stash"]);
      const sha = after.ok ? after.out : null;
      if (sha === null || (before.ok && before.out === sha)) {
        result = {
          landed: false,
          kind: "failed",
          reason: `git stash push "${tag}" created no new stash entry; any changes it took are in the stash under "${tag}" — check git stash list`,
        };
        return;
      }
      const subject = git(main, ["log", "-1", "--format=%s", sha]);
      if (!subject.ok || !subject.out.endsWith(`: ${tag}`)) {
        result = {
          landed: false,
          kind: "failed",
          reason: `another stash (${sha}) landed on top of "${tag}" before it could be read; your changes are in the stash under "${tag}" — apply it by hand`,
        };
        return;
      }
      stashed = sha;
    }
    if (origin !== into) {
      const c = git(main, ["checkout", into]);
      if (!c.ok) {
        result = { landed: false, kind: "failed", reason: `git checkout ${into} failed: ${c.err}` };
        return;
      }
    }
    result = body();
  })();

  const warn = (note) => {
    result.warning = result.warning ? `${result.warning}; ${note}` : note;
  };
  const now = git(main, ["symbolic-ref", "--short", "-q", "HEAD"]);
  if ((now.ok ? now.out : "") !== origin) {
    const back = git(main, ["checkout", origin]);
    if (!back.ok) {
      warn(`could not check out ${origin} again: ${back.err}`);
    }
  }
  if (stashed !== null) {
    const apply = git(main, ["stash", "apply", stashed]);
    if (apply.ok) {
      const n = stashShas(main).indexOf(stashed);
      if (n !== -1) {
        // Another session may push or pop between the lookup and the drop:
        // read stash@{n} again and drop it only while it is still this entry.
        const at = git(main, ["rev-parse", `stash@{${n}}`]);
        if (at.ok && at.out === stashed) {
          git(main, ["stash", "drop", `stash@{${n}}`]);
        } else {
          warn(`the stash moved before it could be dropped; the applied stash "${tag}" (${stashed}) is kept — drop it by hand`);
        }
      }
    } else {
      git(main, ["reset", "--merge"]);
      warn(`git stash apply ${stashed} failed in ${main}; the stash "${tag}" (${stashed}) is kept — apply it by hand`);
    }
  }
  return result;
}

/** The files a stopped merge left in conflict. */
function conflicts(dir) {
  const r = git(dir, ["diff", "--name-only", "--diff-filter=U"]);
  return r.ok && r.out !== "" ? r.out.split("\n") : [];
}

/** Undo a merge that did not complete; leaves the checkout at its HEAD. */
function undoMerge(dir) {
  if (git(dir, ["rev-parse", "-q", "--verify", "MERGE_HEAD"]).ok) {
    git(dir, ["merge", "--abort"]);
  }
}

/** One merge of `branch` into the checked-out branch: { ok } | { conflict } | { refused }. */
function mergeOnce(main, branch, message) {
  const m = mise(main, ["git", "merge", "--no-ff", "-m", message, branch]);
  if (m.ok) {
    return { ok: true };
  }
  const files = conflicts(main);
  undoMerge(main);
  return files.length > 0 ? { conflict: files, err: m.err } : { refused: m.err };
}

/** Push the branch and open a pull request into `into`. */
function pullRequest(worktree, branch, into, message, why) {
  const push = git(worktree, ["push", "-u", REMOTE, branch]);
  if (!push.ok) {
    return { landed: false, kind: "failed", reason: `the merge was refused (${why}), and git push -u ${REMOTE} ${branch} failed: ${push.err}` };
  }
  const body = `The merge into ${into} was refused by the repo's hooks:\n\n${why}`;
  const gh = mise(worktree, ["gh", "pr", "create", "--base", into, "--head", branch, "--title", message, "--body", body]);
  if (gh.ok) {
    return { landed: false, kind: "pr", url: gh.out.split("\n").pop(), branch };
  }
  const glab = mise(worktree, ["glab", "mr", "create", "--target-branch", into, "--source-branch", branch, "--title", message, "--description", body, "--yes"]);
  if (glab.ok) {
    return { landed: false, kind: "pr", url: glab.out.split("\n").pop(), branch };
  }
  return {
    landed: false,
    kind: "pr",
    url: null,
    branch,
    reason: `the branch ${branch} is pushed, but no pull request could be opened (gh: ${gh.err}); open it into ${into} on the forge`,
  };
}

/**
 * Commit every change in `worktree` with `message`, then land it on `into`
 * in the main checkout: merge --no-ff, push, retry a rejected push from a
 * fresh pull, then remove the worktree and branch. A conflict or a failure
 * leaves the worktree and the branch for the caller (abandon removes them).
 * A merge the hooks refuse becomes a pull request; the worktree is removed
 * and the branch kept until `finish`.
 */
export function close({ worktree, into, message }) {
  if (!into || !message) {
    throw new LandError("close needs the branch to land on and a message");
  }
  const { branch, main } = where(worktree);
  if (git(worktree, ["status", "--porcelain"]).out === "") {
    return { landed: false, kind: "failed", reason: `nothing to commit in ${worktree}` };
  }
  const add = git(worktree, ["add", "-A"]);
  if (!add.ok) {
    return { landed: false, kind: "failed", reason: `git add failed: ${add.err}` };
  }
  const commit = mise(worktree, ["git", "commit", "-m", message]);
  if (!commit.ok) {
    git(worktree, ["reset", "--quiet"]);
    return { landed: false, kind: "failed", reason: `the commit failed: ${commit.err}` };
  }

  const remote = hasRemote(main);
  const result = onBranch(main, into, `vwf land ${branch}`, () => {
    for (let retries = 0;; retries++) {
      if (remote) {
        const pull = git(main, ["pull", "--ff-only", REMOTE, into]);
        if (!pull.ok) {
          return { landed: false, kind: "failed", reason: `git pull --ff-only ${REMOTE} ${into} failed: ${pull.err}` };
        }
      }
      const merged = mergeOnce(main, branch, message);
      if (merged.conflict) {
        return {
          landed: false,
          kind: "conflict",
          files: merged.conflict,
          reason: `merging ${branch} into ${into} conflicts on ${merged.conflict.join(", ")}`,
        };
      }
      if (merged.refused !== undefined) {
        return remote
          ? { refused: merged.refused }
          : { landed: false, kind: "failed", reason: `the merge into ${into} was refused, and the repo has no remote for a pull request: ${merged.refused}` };
      }
      if (!remote) {
        return { landed: true, commit: must(main, ["rev-parse", "HEAD"]) };
      }
      const push = git(main, ["push", REMOTE, into]);
      if (push.ok) {
        return { landed: true, commit: must(main, ["rev-parse", "HEAD"]) };
      }
      // Undo the local merge commit, keeping any unrelated working-tree state.
      git(main, ["reset", "--keep", "HEAD~1"]);
      if (!rejected(push.err)) {
        return { landed: false, kind: "failed", reason: `git push ${REMOTE} ${into} failed: ${push.err}` };
      }
      if (retries >= PUSH_RETRIES) {
        return {
          landed: false,
          kind: "failed",
          reason: `git push was rejected after ${PUSH_RETRIES} retries: ${push.err}`,
        };
      }
    }
  });

  if (result.refused !== undefined) {
    const pr = pullRequest(worktree, branch, into, message, result.refused);
    git(main, ["worktree", "remove", "--force", worktree]);
    return result.warning ? { ...pr, warning: result.warning } : pr;
  }
  if (result.landed && !remove(main, worktree, branch, false, into)) {
    const note = `${into} has the change, but ${worktree} or its branch ${branch} could not be removed — remove them by hand`;
    result.warning = result.warning ? `${result.warning}; ${note}` : note;
  }
  return result;
}

/**
 * After the pull request of `branch` merged: delete the local branch, delete
 * the remote branch when it still exists, and fast-forward `into` in the main
 * checkout when that is the branch it is on.
 */
export function finish({ repo, branch, into }) {
  const main = mainCheckout(repo);
  const out = { finished: true };
  if (hasRemote(main)) {
    git(main, ["fetch", "--prune", REMOTE]);
    git(main, ["push", REMOTE, "--delete", branch]);
    const on = git(main, ["symbolic-ref", "--short", "-q", "HEAD"]);
    if (into && on.ok && on.out === into) {
      const pull = git(main, ["pull", "--ff-only", REMOTE, into]);
      if (!pull.ok) {
        out.warning = `git pull --ff-only ${REMOTE} ${into} failed: ${pull.err}`;
      }
    }
  }
  if (git(main, ["rev-parse", "--verify", "--quiet", `refs/heads/${branch}`]).ok) {
    const d = git(main, ["branch", "-D", branch]);
    if (!d.ok) {
      throw new LandError(`git branch -D ${branch} failed: ${d.err}`);
    }
  }
  return out;
}
