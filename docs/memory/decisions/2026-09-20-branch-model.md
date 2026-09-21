# Decision — the landing model is set per branch, and init's git pass reads where each repo stands

**Date** 2026-09-21 · **Branch** `2026-09-20-branch-model` · **Plan**
[`docs/plans/2026-09-20-branch-model/`](../../plans/2026-09-20-branch-model/index.md)
· **Backlog** B53; B28, piece D2, plan 4 of 5 · **Problem**
[`2026-09-20-init-shape-audit.md`](../problems/2026-09-20-init-shape-audit.md)
(candidate 11; B3, B13, G6, the init half of L14)

## What was decided before

`2026-09-12-task-library-configures-each-gate-once.md` gave the mise pack one
landing model: `MERGE_MODEL`, "a marked `[env]` position, `direct|pr`, read as
`direct` when unset, filled at landing" — one value per repo, read by both
`code:merge:develop` and `code:merge:main`, by git-workflow's Step 4, by the
forge pass's require-PR rule (`2026-09-20-init-forge-pass.md`) and by doctor's
predicate (f). Init's git pass asked it once per product and committed the
`ops:` shaping commit in whatever branch each repo stood on: a repo created by
§1 started on `develop`, an existing repo "left branches alone here", and the
develop/main creation table closed with "leave checked out: as it was" — so a
repo arriving on `main` took its shaping commit on `main`, which its own commit
hook then refuses. Nothing read the current branch or a member's HEAD; the
membership asset cloned a member with a plain `submodule update --init`, which
leaves it detached by construction, and a detached member's commit belonged to
no branch. A mainline named `master` or `trunk` had no row anywhere: init's
table had none, doctor's (c) and (g) flagged it, the merge tasks refused it as a
missing destination, and `code:worktrees` fell back to `main`.

## What changed

**Two positions replace `MERGE_MODEL`** in the mise pack's `mise.toml` (mise
`1.4.1` → `1.5.0`): **`MERGE_MODEL_DEVELOP`**, which `code:merge:develop` reads
and which ships `direct`, and **`MERGE_MODEL_MAIN`**, which `code:merge:main`
reads and which ships `pr` — `main` is the release branch, and a request is the
record of what reached it. Values are `direct` or `pr`; the base now carries six
marked positions. The unit was told to ship the pair empty; it shipped the
values instead, since an empty `MERGE_MODEL_MAIN` would silently make `main`
direct where decision 1 preselects `pr`.

**Every reader takes the destination's value.** `_scripts/merge` resolves
`MERGE_MODE` from the destination branch — `develop` → `MERGE_MODEL_DEVELOP`,
`main` → `MERGE_MODEL_MAIN`; both unset reads `direct`, as before any setting
existed. git-workflow's Step 4 reads one `mise env` and resolves both, unset →
`direct` for either destination — the same fallback the tasks take (the plan's
two unit files disagreed, 03 saying both unset → direct and 04 saying `main` →
`pr`; the wave review ruled that 03 governs the script and 04 aligned). The
forge pass writes the require-PR rule **per branch, from that branch's own value
as the file carries it**; the pack's defaults give `main` the rule and `develop`
not. Doctor (f) checks both positions, each on its own; (g) expects the
require-PR rule on a branch whose own value is `pr` and notes its absence, never
as drift. The hygiene `CONTRIBUTING.md` (`1.1.3` → `1.1.4`) names the pair and
the usual shape — features direct on `develop`, a request for `main`.

**The legacy key.** A file still carrying the single `MERGE_MODEL` is read as
**both** values by every reader — the merge script with one warning naming it
legacy, Step 4 as the shared fallback, the forge pass and doctor (g) standing it
in for both — until the next reshape. Doctor (f) reports it as one drift row,
*legacy `MERGE_MODEL` — reshape writes the pair*. Init's §11(a) preselects a
replaced file from its current pair, else the legacy value for both rows, else
the pack's defaults; a **kept** file is not asked, but a keep never covers a
marked position's value, so §7's fill rewrites the legacy line in place into the
two positions carrying the one value, reported as *legacy `MERGE_MODEL`
`<value>` — written to both positions*, and re-hashed.

**Init asks one row per repo per branch**, in one round for the product — a
table of Repo, Branch, Preselected, Position — asked by the first repo to reach
the pass; only a repo whose environment-block file the run lands or replaces
gets rows.

**Branch names are fixed** — `develop` and `main`, the B53 answer. A repo whose
mainline is `master`, `trunk` or any other name gets `main` created from that
mainline and `develop` from `main`; the old branch is left in place, untouched
and unreported to the forge, and named on the report's `Branches created` line
as *`<name>` left — retire by hand*. The mainline is read from
**`origin/HEAD`**, and only where there is no remote is it the branch the repo
is on — a `main` is never created from a feature branch the user was standing on
when a remote can say what the mainline is. Where `main` or `develop` exists,
the row for what exists applies whatever branch the repo stood on. Before the
table, a local branch missing while its remote-tracking branch exists is created
from that — `develop` from `origin/develop`, `main` from `origin/main` — so a
fresh clone never diverges from what the remote has.

**The ops commit lands on `develop` in every mode.** On a repo with commits the
branch work runs at the head of §11(b), before staging: create what is missing,
check out `develop`, then stage and commit; a fresh repository is on `develop`
from §1 and takes `main` from the first commit afterwards. The creation table
gains a *Checked out* column reading `develop` on every row and loses "as it
was". Existing-repo's gate-first commit keeps the same order. A push the remote
rejects is a deferral for that repo and branch, never a force.

**A detached member is refused.** Before the pass, one read per repo with
commits — `git symbolic-ref -q HEAD`; a repo that answers nothing is a **refused
plan row** naming the branch to check out (`develop` where it has one, else its
mainline), its shaping deferred with that checkout as the unlock, and the base's
gitlink for it not moved. The read runs at survey time for a present member and
at apply time for a cloned one, as the first line of the survey the clone row
defers; a detached base halts. The membership asset's clone step, under
submodule linkage, now follows the clone with a checkout of the remote branch
whose history contains the recorded gitlink commit — `origin/develop`, then
`origin/main`, then what `origin/HEAD` names — at that branch's **remote tip**
(`git checkout -B <branch> origin/<branch>`), so the gitlink moving forward is
the run's expected outcome, not drift; where no remote branch contains the
commit the member has diverged, gets a branch at the recorded commit, and is
reported and deferred. Init's own clone row is that full sequence, never the
bare clone alone.

**`code:worktrees`** keeps reading `origin/HEAD` with the literal `main` as the
fallback, now with a comment saying why. The merge method is unchanged —
`--no-ff` locally, the forge's default for a request.

Versions: vwf `19.40.0` → `19.41.0`, stackgen `1.23.1` → `1.24.0`, site `1.1.36`
→ `1.1.37`.

## The alternatives rejected

- **`MERGE_MODEL` plus a `_MAIN` override** — two spellings for one idea; the
  pair is symmetric and each task reads exactly one name.
- **Configurable branch names** — declined at the B53 interview; the merge
  tasks, the commit gate's branch guard and the forge pass all spell the names.
- **Committing wherever the repo stands** — a shaping commit on `main` is what
  the repo's own hook refuses, and one on a feature branch is lost to the model.
- **Committing on a detached HEAD and warning** — the commit belongs to no
  branch and is lost the moment somebody checks one out; worse than not
  committing.
- **Merge method or PR requirements per branch (squash, rebase, reviewers,
  checks)** — raised at the B53 scoping question and declined; a later backlog
  item if wanted.
- **`code:worktrees` falling back to `develop`** — a repo with no `origin/HEAD`
  is measured against its release branch rather than guessed at.
- **Per-unit pack bumps** — the pins and the inventory land in one commit.

## Still out of scope

- This repo's own `.config/mise.toml` and `.config/mise/tasks/**` still carry
  `MERGE_MODEL` and the old merge scripts — the next `/vwf:setup reshape`.
- Rendering the packs' branch literals as values (the rest of L14) — plan 5, if
  at all; with names fixed there may be nothing to render.
- Recorded at the review cap, none fixed here: `new-repo.md` §11(b) stages only
  the pointers of members that committed; an unborn HEAD on an existing repo
  commits on `master`; no `git fetch` before reading `origin/*`; the survey runs
  on the branch the repo stood on while the commit lands on `develop`;
  `_scripts/merge`'s `gh pr create` / `glab mr create` exit non-zero when the
  request already exists; doctor (g) is silent about a require-PR rule left on a
  branch switched to `direct`; doctor reads no script body. And a premise note:
  every recursive clone leaves members detached, so a fresh product checkout's
  first reshape meets one refusal per member.
- B28 closes when plan 5 lands; B53 closes here.
