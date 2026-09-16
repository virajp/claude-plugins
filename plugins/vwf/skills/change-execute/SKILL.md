---
name: change-execute
description: Run an approved /vwf:change-plan folder autonomously in a fresh
  session — claim its row in the base repo's docs/plans/index.md, preflight,
  one worktree, subagent units in waves, a wave review with a capped finding
  loop, the plan's own gate between waves, a commit per green unit, a run log
  the final report renders, docs reconciled and versions bumped by the fixed
  final units, then land per the plan's recorded consent, mark the row
  complete, and stop once before every after-landing step. "next" reads that
  index alone and picks the runnable change plan of highest priority, safely
  beside another session's run. Blocks only what a missing ruling blocks and
  resumes from its last green unit. Invoke as /vwf:change-execute <plan-folder>
  or /vwf:change-execute next in a session that has done nothing else.
argument-hint: "<plan-folder, its index.md, or next>"
model: opus

disable-model-invocation: true
---

# change-execute

The plan is the contract and `index.md` is the only input. Everything the run
needs — rulings, file scopes, waves, gates, consent — is already written there
by `/vwf:change-plan`; this skill reads it and does not re-ask it. The
orchestrator **decides, reviews and verifies, and never reads unit work
inline**: every edit is a subagent's, so this session's context stays the size
of the reports.

Run it in a session that has done nothing else. It cannot check that, so the
plan's launch line says it and this skill trusts it.

There are two ways in. A **named folder** runs that plan. **`next`** reads the
plan index — the one table in the base repo's `docs/plans/index.md`, the queue
`/vwf:change-plan` adds a row to at every hand-off — filtered to the rows whose
`Kind` is `change`, and picks the runnable change plan of highest priority,
then runs it exactly as if it had been named. Both take the same procedure from
§2 on; §1 is where they differ. The index is what makes `next` safe while
another session is already running a plan: a run claims its row with a pushed
commit before it cuts a worktree, and a claim that loses the push re-reads and
re-picks, per *The procedure* in `${CLAUDE_PLUGIN_ROOT}/assets/plan-index.md`
— the contract both executors share, read in full before §1.

## References

| Reference                                     | When to read                                                     |
| --------------------------------------------- | ---------------------------------------------------------------- |
| [The wave review](references/wave-review.md)  | §4 step 3 — the reviewer prompt, the finding loop, the guard     |
| [Blocking and resume](references/blocking.md) | §5 — what a failure skips, what it blocks, how a re-run picks up |

## Procedure

### 1. Resolve and refuse early

**`next`.** When `$ARGUMENTS` is `next`, run *Reading the queue* under *The
procedure* in `${CLAUDE_PLUGIN_ROOT}/assets/plan-index.md`, with the executor's
kind set to `change`: the candidates are the `APPROVED` rows whose `Kind` cell
reads `change`; a `cycle` row is never picked here — `/vwf:execute next` picks
those. On a pick, print the folder taken and its `Priority`, and every other
`APPROVED` change row with why it was not taken — a lower priority, or the
requirement it waits on. Ask no confirmation: the session is meant to run
unattended. Then continue below as if that folder had been named. Nothing
runnable → stop with the message that procedure prints: each `APPROVED` change
row and what it waits on, or that the table is absent or holds no change row.

Resolve `$ARGUMENTS` to `<folder>/index.md`. Read the frontmatter — including
its `backlog:` list, the ids §7 hands to `/vwf:backlog`, empty or absent when
the plan covers no backlog item — and the **Status**, **Consent**, **Units** and
**Run log** blocks. Then read the folder's **row** in the plan index — the base
repo's `docs/plans/index.md`, at the integration branch's tip, the way
*Reading the queue* in `${CLAUDE_PLUGIN_ROOT}/assets/plan-index.md` reads it.
Then:

- Frontmatter `type: vwf-plan` → stop: "a cycle plan; run
  `/vwf:execute <folder>`". This skill runs `type: vwf-change-plan` folders
  only.
- Status `DRAFT` → stop: "not approved; run /vwf:change-plan to finish it".
- Status `COMPLETE` → stop: nothing to do.
- Any `requires:` entry that is not **satisfied**, per *Resolution* in
  `${CLAUDE_PLUGIN_ROOT}/assets/plan-index.md`, matched by basename → stop,
  name it. A `change` entry is satisfied by a `COMPLETE` row, or by a folder
  under `docs/plans/archived/` with no row: say "run /vwf:change-execute <that
  folder> first" when its row is `APPROVED`, "another session is running <that
  folder>; wait for it to land" when it is `RUNNING`. A `cycle` entry is
  satisfied when every doc in that plan's `covers:` reads
  `implementation: complete` in the base repo's blueprint — its row is not the
  test: say "run /vwf:execute <that folder> first; <doc> is not
  `implementation: complete`". An entry that resolves to nothing — no row, no
  folder → "<entry> is neither in the plan index nor archived; fix the
  `requires:` line by hand". No override.
- Status `APPROVED` with no row at all → stop: "not in the plan index; re-run
  `/vwf:change-plan`'s hand-off, or add the row by hand".
- Status `APPROVED` with a `RUNNING` row → a claim another session holds. Stop
  and name it: the row is resumed only by the session that holds it, or claimed
  afresh after a hand reset of the row to `APPROVED`, committed on the
  integration branch.
- Status `BLOCKED` or `RUNNING` → a **resume**, per
  [blocking and resume](references/blocking.md): the worktree named in the
  status line exists, and the run starts at the first unit that is not `green`.
  The ruling a block asked for must now be in the plan — if the status line
  still reads the same `UNRESOLVED:`, stop and say which ruling is missing. The
  row is expected to read `RUNNING` already, and is left alone; a row reading
  `APPROVED` is a hand reset, and the run claims it again below.
- Status `APPROVED` with an `APPROVED` row → a fresh run.

The folder arrives **already committed** on the integration branch —
`/vwf:change-plan` commits and pushes it at hand-off — so the worktree §2 cuts
sees it from its first commit. A folder that is not on that branch is refused,
not swept into a wave commit: stop and say to run `/vwf:change-plan` again on
it, or to commit and push it by hand, then re-launch.

**Claim the row.** Before the worktree is cut, and before the folder's own
Status is touched, run *Writing a row — the claim, and the completion* in
`${CLAUDE_PLUGIN_ROOT}/assets/plan-index.md` with the row set to `RUNNING` —
the commit `docs: plan queue — <folder> running`, pushed on the integration
branch. The row's `Status` cell is the only cell that changes; `Kind` and
`Target repo` are never edited. This is the **one** edit the run makes in the
main checkout, and it is made there on purpose: the pushed row is what another
session's `next` reads, so a claim that lived only on the run branch would
claim nothing; and the run branch must never carry `docs/plans/index.md`, or
two plans landing in parallel would conflict on it. A rejected push is handled
inside that procedure — a clean rebase pushes again; a conflict on the same row
means the plan was claimed first, and the run re-picks (`next`) or stops (a
named folder). A resume whose row already reads `RUNNING` skips this step.

Set the folder's status to `RUNNING` with the timestamp. From there the plan
folder is edited in the worktree only and committed with each wave, so a
session that dies still leaves a legible plan on the branch — never in the main
checkout, which would dirty the integration branch — the one exception being
the index row above, which is committed and pushed in the main checkout and
never edited in the worktree. The row does not change on a pause or a block:
the index carries `APPROVED`, `RUNNING` or `COMPLETE` only, and the folder's
status line keeps the run detail.

### 2. One worktree for the whole run

Invoke the `vwf:git-workflow` skill with the declared preference *"isolate
without asking, branch from the repo's integration branch, name it after the
plan folder; commit only — never merge or push"*. That skill resolves which
branch the integration branch is; this one never assumes a name. Every unit
works inside that worktree; **no unit gets `isolation: "worktree"`** — units in
a wave own disjoint paths, and merging five trees back by hand is the collision
the shared-file rule exists to avoid. Record the worktree path in the status
line.

### 3. Preflight

Run the plan's whole gate once, **before wave 1**, from the worktree root: every
line of `index.md`'s **Wave gate** section, in order. Run what is written and
nothing inferred — a gate the plan does not name is not this run's to invent,
however obvious it looks in the tree. When the section reads `none`, say so in
the run log and continue: the wave review is then the only gate.

A red line here is the integration branch's, not the plan's. Stop and report it
as such — never start a run that would be blamed for a failure it inherited.
Record the green preflight as the first run-log row (`wave 0`, `preflight`).

### 4. Waves

The Units table carries a `Kind` column — `code` or `edit`, per
`${CLAUDE_PLUGIN_ROOT}/assets/templates/plan-folder.md`; this executor reads it
and ignores it in this release — every unit, whatever its Kind, runs the wave
review below.

For each wave in index.md order, skipping units already `green` on a resume:

1. **Dispatch** every unit in the wave in **one message with multiple `Agent`
   calls**, `subagent_type: "general-purpose"` unless the unit file names
   another, `name: "U<n>"`, on the model the unit file's `Model:` line names
   (`opus` by default; `inherit` means the session's). The prompt is the unit
   contract from index.md: *"Read `<folder>/index.md` — Facts, New dependencies,
   Shared-file rule, Unit contract — then read `<folder>/NN-<unit>.md` in full.
   Execute its Edits in order inside `<worktree>`, run its Verification, and
   return the block the contract asks for and nothing else. Touch nothing
   outside your Owns list. Do not bump a version, run a generator, edit a doc,
   add a dependency the plan does not list, or commit. Delete with plain `rm`,
   never `git rm` — stage nothing."* Pass paths, never conversation context.
2. **Wait** for every report. As each returns, mark the unit in the Units table
   and append a run-log row — unit, model, round 1, outcome, the `DECIDED:` and
   `GAP:` lines condensed into *Detail*. A unit whose agent **errored** rather
   than returned is re-dispatched once with the same prompt; a second error
   marks it `failed` with `agent died` as detail. Write the row **when the
   report arrives**, not at the end of the wave — a row written late is a unit a
   resumed run repeats.
3. **Wave review**, per [the wave review](references/wave-review.md): one
   reviewer subagent over the wave's diff against the unit files, findings
   looped back to the owning unit, at most two rounds, under the convergence
   guard. Every round is a run-log row.
4. **Wave gate**, run by the orchestrator: every line of index.md's *Wave gate*
   section, plus every report read for `UNRESOLVED:`. A unit that returned
   `UNRESOLVED:` or `failed`, and every unit that depends on it, is **skipped**
   per [blocking and resume](references/blocking.md); the rest of the run
   continues. A red gate line no skipped unit explains is attributed to the unit
   whose Owns covers the failing path and handled as that unit's failure; one
   that cannot be attributed marks every unit in the wave `failed` with the gate
   line as detail.
5. **Commit** the green units, one commit per unit in wave order. Stage exactly
   that unit's Owns — `git add -- <every owned path>`, which stages a deletion
   as readily as an edit — then read `git diff --cached --stat`: for any path
   outside that unit's Owns, `git reset -q HEAD -- <path>` before committing. A
   path another unit staged is that unit's, and rides its own commit. Then
   commit with the unit file's commit line via `vwf:git-workflow` step 3. Write
   the short hash into the Units table and the run-log row. Commits are free;
   they are what makes a later failure roll back to the last green unit instead
   of discarding the run.

The two fixed final units run as their own waves, and **only when no unit is
skipped**: the docs unit invokes `vwf:docs-sync` over the run's branch delta —
its standalone mode, `${CLAUDE_PLUGIN_ROOT}/skills/docs-sync/SKILL.md` — and
applies its findings plus every `DOCS FALSIFIED:` line the units returned; the
gates-and-bump unit bumps each released project's version per the consent block
**with the command that block names**, runs the generators the plan names, and
passes the wave gate. The orchestrator also runs every item under *Gates the
orchestrator keeps* before calling the run green — those are the checks a diff
cannot prove.

### 5. On failure

The run **skips what a failure blocks and keeps going** with what it does not,
then stops once at the end with every ruling needed — never mid-wave, and never
with "how should I proceed". The exact semantics — isolated versus all-blocking,
the mechanical re-dispatch, what the status line records, and how a re-run
resumes — are [blocking and resume](references/blocking.md).

### 6. The final report

Before landing, **render the report from the Run log**, not from memory — by now
the run may have spanned dozens of dispatches or a compaction, and the log is
the account that survived. Present:

- every unit with its outcome, rounds, model, commit, and any `skipped` or
  `failed` reason
- every `GAP:` the units returned, with the assumption each proceeded on —
  including every Owns the orchestrator widened at run time, with the finding
  that caused it
- the review findings that survived the cap, marked `contested`
- the wave gate and orchestrator gate results
- the versions bumped and the worktree path
- each after-landing step and its outcome, once §8 has run

If any unit is `skipped`, `failed` or `unresolved`, this report is the block
notice and the run stops here with the status set to `BLOCKED`.

### 7. Land

With every unit `green` and every orchestrator gate passed, move the folder to
`docs/plans/archived/` and set Status to `COMPLETE` with the date and the commit
list. Then, when index.md's `backlog:` names ids, invoke
`/vwf:backlog done <ids>` — that skill is the only writer of `docs/backlog.md`,
and its edit rides the same commit. Commit all of it as one final `docs:`
commit. Then read the Consent block:

- **Merge to the integration branch and push on green: yes** →
  `vwf:git-workflow` step 4, *merge, push & clean up*. A merge conflict is a
  hard halt: abort, keep the worktree, set `BLOCKED`, report the files. When
  step 4 returns from the merge and push, run *Writing a row — the claim, and
  the completion* in `${CLAUDE_PLUGIN_ROOT}/assets/plan-index.md` with the row
  set to `COMPLETE`, its `Folder` cell pointing at
  `docs/plans/archived/<basename>` — `Kind` and `Target repo` untouched — and
  *The sweep* from the same asset: every `COMPLETE` row no `APPROVED` or
  `RUNNING` row's `Requires` still names is removed, whatever its kind. That is
  the commit `docs: plan queue — <folder> complete`, on the integration branch,
  in the main checkout; a rejected push re-applies the same row until it lands,
  and never re-picks.
- **no** → stop with the worktree path and the branch name, and say the branch
  is ready to land. Say too that the index row stays `RUNNING` until the hand
  merge is followed by a hand edit of the row to `COMPLETE`, or by
  `/vwf:archive <folder>`, which applies the same rule. Ask nothing further.

### 8. After landing — every step is an `ask`, and the run stops once before each

Read index.md's **After landing** table. Every step in it is an `ask`: before
each, in order, the run stops once, reports what the step would do in the
step's own terms, and waits; a yes authorises exactly that step and nothing
else. A step whose *Mode* reads `run` in an older folder is read as `ask` — the
mode that let a plan pre-authorise a step at approval time is retired, and
nothing recorded there authorises anything now. An empty table, or `none`,
skips this section and is said in one clause.

The steps run from the repo root the landing left behind: the main checkout
when the branch merged, the worktree when it did not — and when the landing was
**not** consented, only those steps whose *Notes* say they may run from the
worktree are offered. The orchestrator runs them, never a unit — a step may
mutate the machine rather than the tree under review, and a unit never reaches
outside the worktree. It is asked in the moment even though the plan recorded
the intent: consent written at approval is intent, and this is precisely where
a run reaches past the tree under review.

**Offer waiting as the equal option, not the fallback.** Where a step stages
something, it is exercised only in a restarted session — so "not yet, I want to
look first" is the answer the two-stage shape exists to make easy. Say that the
table names the remaining steps whenever the user comes back to them.

Each step taken is reported with its outcome:

- **Ran.** Say what it did in the step's own terms. A step whose *Notes* say a
  **restarted** session is needed for its effect is reported with that sentence
  — this session already loaded what the step replaced.
- **Exited non-zero.** Report the failure verbatim, offer the remaining steps,
  and never work around it. A step that refuses is usually a fact about the
  machine rather than a failure of the run, and the plan named that step, not a
  substitute for it.

If the landing was not consented and no step may run from the worktree, there
is nothing to offer yet; say so in the final line and stop.

## Resource caps

A session cannot measure its own context; the signal arrives as an injected cap
directive from an external hook. On that directive, or on any sign the context
is being compacted mid-wave: finish writing the run-log rows for every report
already in hand, commit the units that are green, set Status to
`RUNNING — paused at wave <n> for context`, and stop with the launch line. The
index row stays `RUNNING` — a pause is the folder's detail, not the queue's. A
re-run resumes per [blocking and resume](references/blocking.md); units in
flight are re-run from their prompt, since the worktree is the tie-break.

## What does not stop the run

The plan is approved and every ruling is in the folder. The run does **not**
pause to re-ask a ruling, confirm a file scope, report progress between waves,
ask whether to continue after a green gate, ask before a commit, ask before the
claim or the landing row, or ask what to do about a `GAP:` — a gap is recorded
and the stated assumption stands until the final report. It pauses for an
inherited red preflight, a merge conflict, a resource cap, and once before each
after-landing step. Everything else is recorded in the run log and answered at
the end.

## What this skill never does

- Reads a unit's owned files itself, or does a unit's work inline because it
  looks small
- Dispatches a wave whose predecessor is not green or explicitly skipped
- Runs a generator or bumps a version outside the gates-and-bump unit — a
  consented after-landing step is the one exception, and it is the
  orchestrator's because it may write outside the worktree
- Runs an after-landing step without asking — without the in-the-moment yes for
  that step — or merges past the integration branch
- Treats a `run` mode in an older folder, or the consent recorded at approval,
  as a step's authorisation
- Edits `docs/plans/index.md` from inside the worktree, or edits any row but its
  own plan's and the `COMPLETE` sweep the landing applies
- Takes a `RUNNING` row, however stale — a hand reset to `APPROVED` is the only
  release
- Edits `docs/backlog.md` itself, or lets a unit do it — `/vwf:backlog` owns
  that file, and §7 calls it
- Runs a gate the plan's *Wave gate* section does not name, or skips one it does
- Picks up an item from *Out of scope* or *Parked*, however adjacent
- Reports the run from recollection when the run log exists
