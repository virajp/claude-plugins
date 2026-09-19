---
type: vwf-change-plan
title: unclaim verb — release a stale RUNNING claim through plan-management
requires: []
backlog: [ B12 ]
---

# Plan — unclaim verb — release a stale RUNNING claim through plan-management (2026-09-19)

## Status

**RUNNING**

RUNNING since 2026-09-19T12:46Z in
/Users/virajpatel/Projects/github.com/virajp/claude-plugins/.worktrees/2026-09-19-unclaim-verb

## Consent

| Action                                            | Granted                                                                                                                                                      |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Merge to the integration branch and push on green | yes                                                                                                                                                          |
| After landing: `mise run p:plugins:local`         | run                                                                                                                                                          |
| Release vwf publicly                              | minor — `19.34.2` → `19.35.0`, a hand edit of `plugins/vwf/.claude-plugin/plugin.json` then `mise run p:plugins:marketplace`; no release step, the tag waits |
| Release site publicly                             | patch — `1.1.29` → `1.1.30`, `mise run p:site:version`; no release step, the tag waits                                                                       |
| Release installer publicly                        | none — untouched                                                                                                                                             |

**The mode recorded here is the consent.** A `run` step runs on a green landing
without a prompt; an `ask` step stops the run once before it, reports what it
would do, and waits. The mode is the interview's answer (item 17), and a release
step recorded `run` is authorised by the interview's release question (item 18)
— a release recorded `ask`, or with no step at all, is intent, not
authorisation. Where a step stages something this session already loaded, it is
picked up only by a **restarted** session.

## Goal

After this lands, a stale `RUNNING` claim is released by asking the session to
unclaim the folder: a consent-gated `plan-management` verb, `unclaim <folder>`,
proves the claiming run is gone, resets the plan's index row and its folder's
Status block to `APPROVED`, and reports one commit — so no plan row is ever
hand-edited again.

The framing: the 2026-09-18 plan `plan-management` made one skill the sole
writer of `docs/plans/index.md` and every folder's Status block, and deferred
exactly one write by name — backlog B12, the stale-`RUNNING` reset — because it
needed a liveness rule that plan did not design: how a session proves the
claiming run is gone. Until now that reset is the one hand edit the contract
still permits, described in five places. This plan designs the rule — the
worktree the Status block names is gone — and gives the reset its verb. Not a
reversal: "a `RUNNING` row is never stolen" stands; `unclaim` releases a claim
on the user's consent after the proof, it never takes one.

## Facts the survey established

**The skill.** `plugins/vwf/skills/plan-management/SKILL.md` — nine verbs under
`## Verbs` (`:93`): `add :97`, `claim :120`, `status :132`, `complete :149`,
`archive :160`, `next :275`, `resolve :288`, `priority :306`, `list :316`; the
frontmatter `argument-hint` (`:10`) enumerates them. "Where each verb runs"
(`:83-91`): the index is edited only in the main checkout on the integration
branch; the Status block wherever the folder is. `claim` (`:120-130`) edits the
row's `Status` cell alone, `APPROVED` → `RUNNING`, in the main checkout after
`git pull`, edits no Status block ("the worktree does not exist yet"), refuses a
row already `RUNNING` or absent, and reports
`docs: plan queue — <folder> running` for the caller's commit. The "Called by"
table (`:337`). "What this skill never does" (`:343-358`) carries **Take a
`RUNNING` row** (`:356-358`): "a stale claim is released only by a hand edit
back to `APPROVED`, committed on the integration branch". `:256` reads "an item
`In Progress` forever" — the parked restyle.

**The contract.** `references/plan-index.md` — the `Status` column is
`APPROVED`, `RUNNING` or `COMPLETE` (`:46`, `:50-57`); "Writers and their edits"
(`:59-68`); the `next` rules say a `RUNNING` row is never taken and a gone
session's claim "is reset to `APPROVED` by hand" (`:126-128`); the procedure's
step 5 repeats it (`:174-178`); the claim procedure — stash if dirty, checkout
the integration branch, `git pull --ff-only`, push-rejection handling — is
`:191-245`.

**The executor.** `plugins/vwf/skills/execute/SKILL.md` — a folder `APPROVED`
whose row reads `RUNNING` is refused: "resumed only by the session that holds
it, or claimed afresh after a hand reset of the row to `APPROVED`, committed on
the integration branch" (`:139-142`); a `RUNNING` requirement: "another session
is running <that folder>; wait for it to land" (`:133-134`); the claim
(`:183-201`) invokes `plan-management claim`, commits and pushes the row, cuts
the worktree, then writes the Status block `RUNNING since <ts> in <worktree>`
through `status` (`:197-199`); the `no` landing leaves both the block and the
row `RUNNING` (`:709-712`, `:753-758`); "never does" carries "Takes a `RUNNING`
row, however stale — a hand reset to `APPROVED` is the only release" (`:884`).
`references/blocking.md` — a block or pause never touches the row (`:52-53`);
the resume path checks the worktree the status line names and, when it is gone,
stops for the user to reset both by hand, noting "No `plan-management` verb does
this yet: the `unclaim <folder>` verb that would replace the hand edit is
backlog B12" (`:56-72`).

**The Status block.** `plugins/vwf/assets/templates/plan-folder.md:47-52` — one
bold state word plus one free-text detail line; the worktree path lives only in
that line, in the form `RUNNING since <ts> in <worktree path>`. There is no
branch field: the run's branch is named after the plan folder, and the worktree
sits at `.worktrees/<branch>` by default
(`skills/git-workflow/references/worktree-setup.md:30-52`).

**The docs that enumerate the verbs.**
`.claude/skills/vwf-plugin/references/skills-and-agents.md:39` — the
plan-management row, "Nine verbs:" spelled out, and "never takes a `RUNNING`
row" in its refuses column. `site/src/content/docs/plugins/vwf.md:2260-2307` —
the `### /vwf:plan-management` section, its verb table `:2274-2284`. `readme.md`
and `CLAUDE.md` name no verb count and no hand reset.

**Gates.** Pre-commit runs `format`, `lint`, `sec`, `npm-normalize-hook-test`,
`plugins-marketplace`, `plugins-inventory`, `plugins-check`,
`plugins-shellcheck` and the standard hooks. `p:site:check` is the site's gate,
a wave-gate line because `vwf.md` changes. `plugins/**/*.md` is not
dprint-formatted — match the fold width by hand; `.claude/**`, `site/**` and
`docs/**` markdown are.

**Commit convention.** `.config/git-conventional-commits.yaml` allows `ops`,
`docs`, `merge`, `feat`, `fix`, `refactor`; no scopes.

**Versions.** `plugins/vwf/.claude-plugin/plugin.json` reads `19.34.2`, bumped
by hand; `mise run p:plugins:marketplace` regenerates
`.claude-plugin/marketplace.json` from it. `site/package.json` reads `1.1.29`,
bumped by bare `mise run p:site:version` (patch is the default; it refuses a
dirty tree). Neither target reaches a `13` or `17` component.

**The plan index** is empty of rows — this plan requires nothing and its
priority is `10`.

**The backlog.** B12 is `P0`, `Backlog`, in project #2 under `virajp`; its body
names the verb, the consent gate, the commit shape and the worktree refusal.

## Assumed decisions — confirm or override at review

| # | Decision           | Ruling                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Rejected                                                                                                                                                                                     | Unit |
| - | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| 1 | Liveness           | The run is proven gone when the worktree the folder's Status block names is absent from `git worktree list`. The verb refuses while it exists, naming `git worktree remove <path>` as the user's act of proof — that command refuses a dirty tree itself, so unfinished work is never lost silently. No new state, no heartbeat.                                                                                                                                                                            | consent alone (a live run in another window gets its row pulled out from under it, and its landing `complete` finds `APPROVED`); worktree and branch both gone (deletes committed unit work) | U1   |
| 2 | The stale branch   | Reported, never touched. The report names the branch and the `git branch -D <branch>` line, and says a fresh `/vwf:execute` refuses to cut a worktree over it until it is gone; the user decides whether the committed units are worth keeping.                                                                                                                                                                                                                                                             | offering to delete it (a destructive git action in a bookkeeping skill)                                                                                                                      | U1   |
| 3 | Where and what     | Runs in the main checkout on the integration branch after `git pull --ff-only` — `claim`'s procedure. Edits the row's `Status` cell `RUNNING` → `APPROVED`, and the folder's Status block only when it does not already read `APPROVED` (at claim the block is edited in the worktree, so on the integration branch it usually still reads `APPROVED`). Refuses a row that is not `RUNNING`, in one line. Reports `docs: plan queue — <folder> unclaimed` for the caller's commit; the skill never commits. | committing itself (decision 4 of 2026-09-18: the caller commits)                                                                                                                             | U1   |
| 4 | Consent            | The verb shows what it found — the worktree absent, the branch present or not, the Status detail line — and asks once before editing anything.                                                                                                                                                                                                                                                                                                                                                              | resetting on the prose ask alone                                                                                                                                                             | U1   |
| 5 | Callers            | A session on the user's ask, like `archive` and `list`. `/vwf:execute`'s two refusals (row `RUNNING` under an `APPROVED` folder; a `RUNNING` requirement) name the verb instead of the hand reset, and the resume path in `blocking.md`, on finding the worktree gone, offers to invoke `unclaim` and does so on a yes. Execute never runs it unprompted.                                                                                                                                                   | execute unclaiming on its own                                                                                                                                                                | U2   |
| 6 | No review row      | Nothing runnable lands — two skills' prose and the docs — so no `Kind: review` row; the wave review is the only check.                                                                                                                                                                                                                                                                                                                                                                                      | a review row                                                                                                                                                                                 | —    |
| 7 | The parked restyle | `SKILL.md:256` "an item `In Progress` forever" becomes `In progress` — the file is touched, so the parked item rides.                                                                                                                                                                                                                                                                                                                                                                                       | parking it again                                                                                                                                                                             | U1   |

## New dependencies

none

## Units

| Id | Wave | Unit file                                      | Kind | Owns                                                                                                                                                                              | Depends on | Status  | Commit   |
| -- | ---- | ---------------------------------------------- | ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------- | -------- |
| U1 | 1    | [01-plan-management.md](01-plan-management.md) | edit | `plugins/vwf/skills/plan-management/SKILL.md`, `plugins/vwf/skills/plan-management/references/plan-index.md`                                                                      | —          | green   | a2ac7047 |
| U2 | 1    | [02-execute.md](02-execute.md)                 | edit | `plugins/vwf/skills/execute/SKILL.md`, `plugins/vwf/skills/execute/references/blocking.md`                                                                                        | —          | green   | 647fba34 |
| U3 | 2    | [03-docs.md](03-docs.md)                       | edit | `.claude/skills/vwf-plugin/references/skills-and-agents.md`, `site/src/content/docs/plugins/vwf.md`, `docs/memory/decisions/2026-09-19-unclaim-verb.md`, `readme.md`, `CLAUDE.md` | U1, U2     | pending |          |
| U4 | 3    | [04-gates-and-bump.md](04-gates-and-bump.md)   | edit | `plugins/vwf/.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `site/package.json`                                                                                  | U3         | pending |          |

Status is one of `pending`, `running`, `green`, `failed`, `unresolved`,
`skipped`.

## Shared-file rule

| File                                                                | Why it collides                      | Owner   |
| ------------------------------------------------------------------- | ------------------------------------ | ------- |
| `plugins/vwf/.claude-plugin/plugin.json`                            | the version                          | U4 only |
| `.claude-plugin/marketplace.json`                                   | generated from the manifest          | U4 only |
| `site/package.json`                                                 | the site version                     | U4 only |
| `readme.md`, `CLAUDE.md`, `.claude/**`, `site/**`, `docs/memory/**` | human-facing docs                    | U3 only |
| `plugins/vwf/skills/plan-management/**`                             | U2 and U3 cite it; only U1 writes it | U1 only |
| `plugins/vwf/skills/execute/**`                                     | U3 cites it; only U2 writes it       | U2 only |

## Waves

- **Wave 1 — U1 and U2 together.** Disjoint trees: U1 defines the verb in
  plan-management, U2 re-points execute's three passages at it by name. U2 cites
  the verb as this file specifies it, never the file U1 is writing.
- **Wave 2 — U3.** The repo docs, the site, the new decision doc; runs docs-sync
  over wave 1.
- **Wave 3 — U4.** The two bumps, the generator, the full gate.

## Wave gate

    mise run p:plugins:marketplace -- --check
    mise run p:plugins:inventory -- --check
    mise run p:plugins:check
    mise run code:precommit
    mise run p:site:check

plus the wave review, plus every report read for `UNRESOLVED:`. Every line here
must be green before wave 1.

## After landing

| Step                       | Mode | Notes                                                                                                                                                   |
| -------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mise run p:plugins:local` | run  | stages vwf at `19.35.0+N` into the dev marketplace and updates this machine's install; publishes nothing, cuts no tag; a **restarted** session loads it |

## Gates the orchestrator keeps

none beyond the wave gate — the verb is prose a session follows, and no plan row
is stale on this machine to exercise it against; the first real use is its
proof.

## Unit contract

Every unit prompt carries, in order: its ruling quoted from this file, its owned
paths plus "touch nothing outside this list", the facts section, the shared-file
rule, and the return block below. A unit never bumps a version, never runs a
generator, never edits a doc, never adds a dependency this file does not list,
never commits. A unit deletes with plain `rm`, never `git rm` — it stages
nothing.

A unit returns exactly this block and nothing else — no file contents, no diff:

    CHANGED: <path> — <one line>            (one per file)
    DECIDED: <what> — <why>                 (choices made inside scope, or none)
    DOCS FALSIFIED: <path> — <passage>      (reported, never edited; or none)
    GAP: <what the plan left unspecified and the assumption taken>   (or none)
    UNRESOLVED: <the ruling needed>         (or none)

A `GAP:` is a hole in the plan the unit could proceed past on a stated
assumption; it is recorded and the run continues. An `UNRESOLVED:` is a ruling
the unit could not proceed without; it blocks the unit and its dependents.

## Out of scope

- **A heartbeat or automatic staleness detection** — declined; the worktree's
  absence is the one proof, and no session writes a liveness timestamp.
- **Cross-session locking** — declined; the index row is the lock, as it was.
- **Execute unclaiming on its own** — declined (decision 5); it offers the verb
  on the resume path and the user says yes.
- **Deleting the stale branch** — declined (decision 2); reported, never
  touched.
- **Editing the 2026-09-18 plan-management decision doc** — history; the new doc
  names it as the plan that deferred this.
- **A release** — both bumps are recorded; the tags wait for a later `/release`.
- **The GitLab backlog backend** — still parked from the 2026-09-18 plan; not
  this tree.

## Parked

- **The diary checkpoint beside the run log.** The Stop hook fires mid-run, so a
  unit produces a diary entry on top of its run-log row. A later plan decides
  whether the hook stands down while a run is open. Parked since the deadlock
  plan (2026-09-15), carried through review-rows (2026-09-17) and
  plan-management (2026-09-18).

## Run log

| Wave | Unit      | Model | Round | Outcome     | Detail                                                                                                                                                                                                                                                                                                                    | Commit   |
| ---- | --------- | ----- | ----- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| 0    | preflight | —     | 1     | pass        | no vwf.yaml, edit units only, no review row; mise, graphify, graph ok; format check skipped (no covers:); conventions fetch skipped (no code unit); 5 gate lines green                                                                                                                                                    | —        |
| 1    | U1        | opus  | 1     | green       | unclaim verb section, hint, description, where-runs, 2 Called-by rows, never-does bullets, In progress; plan-index writers row, 3 commit messages, next rule + step 5 re-pointed. DECIDED: same-row push conflict on unclaim → restore checkout and stop (plan's 'applies unchanged' fit neither existing branch). No GAP | a2ac7047 |
| 1    | U2        | opus  | 1     | green       | both execute refusals name unclaim; never-does bullet re-pointed; blocking.md resume offers and invokes unclaim on yes, B12 sentence deleted. DECIDED: two 'is a hand reset' sentences (SKILL.md, blocking.md) reworded to 'was unclaimed' — the verification grep targets them. No GAP                                   | 647fba34 |
| 1    | R1        | opus  | 1     | findings(3) | all U1: SKILL.md:396 Called-by row 1 char wide; plan-index.md:65 Writers row unpadded; 3 consistency edits (SKILL.md:46, plan-index.md:13, :209) correct but unreported — reporting only. CONTRACT clean, RULINGS clean; U1/U2 verb spec agree                                                                            |          |
| 1    | U1        | opus  | 2     | green       | R1 loop-back: Called-by row repadded to 69; Writers row repadded 33/284 (caller cell shortened, resume-path caller moved into Edit cell); three round-1 consistency edits now reported                                                                                                                                    | a2ac7047 |
| 1    | R1        | opus  | 2     | pass        | 0 findings; CONTRACT clean; RULINGS clean                                                                                                                                                                                                                                                                                 |          |

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the fresh session's worktree — cut from the integration branch — can see it.

Run in a fresh session:

/vwf:execute docs/plans/2026-09-19-unclaim-verb

or let the queue pick it, by priority:

/vwf:execute next
