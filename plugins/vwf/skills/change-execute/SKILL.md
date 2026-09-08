---
name: change-execute
description: Run an approved /vwf:change-plan folder autonomously in a fresh
  session — preflight, one worktree, subagent units in waves, a wave review
  with a capped finding loop, the plan's own gate between waves, a commit per
  green wave, a run log the final report renders, docs reconciled and versions
  bumped by the fixed final units, then land per the plan's recorded consent,
  run the after-landing steps, and stop once before any ask step. Blocks only
  what a missing ruling blocks and resumes from its last green unit. Invoke as
  /vwf:change-execute <plan-folder> in a session that has done nothing else.
argument-hint: "<plan-folder or its index.md>"
model: opus
effort: high
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

## References

| Reference                                     | When to read                                                     |
| --------------------------------------------- | ---------------------------------------------------------------- |
| [The wave review](references/wave-review.md)  | §4 step 3 — the reviewer prompt, the finding loop, the guard     |
| [Blocking and resume](references/blocking.md) | §5 — what a failure skips, what it blocks, how a re-run picks up |

## Procedure

### 1. Resolve and refuse early

Resolve `$ARGUMENTS` to `<folder>/index.md`. Read the frontmatter and the
**Status**, **Consent**, **Units** and **Run log** blocks. Then:

- Status `DRAFT` → stop: "not approved; run /vwf:change-plan to finish it".
- Status `COMPLETE` → stop: nothing to do.
- Any `requires:` folder whose status is not `COMPLETE` → stop, name it: "run
  /vwf:change-execute <that folder> first". No override.
- Status `BLOCKED` or `RUNNING` → a **resume**, per
  [blocking and resume](references/blocking.md): the worktree named in the
  status line exists, and the run starts at the first unit that is not `green`.
  The ruling a block asked for must now be in the plan — if the status line
  still reads the same `UNRESOLVED:`, stop and say which ruling is missing.
- Status `APPROVED` → a fresh run.

Set the status to `RUNNING` with the timestamp. The plan folder is edited in the
worktree only and committed with each wave, so a session that dies still leaves
a legible plan on the branch — never in the main checkout, which would dirty the
integration branch.

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
   add a dependency the plan does not list, or commit."* Pass paths, never
   conversation context.
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
5. **Commit** the green units via `vwf:git-workflow` step 3, one commit per unit
   in wave order using each unit file's commit line. Write the short hash into
   the Units table and the run-log row. Commits are free; they are what makes a
   later failure roll back to the last green unit instead of discarding the run.

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
- every `GAP:` the units returned, with the assumption each proceeded on
- the review findings that survived the cap, marked `contested`
- the wave gate and orchestrator gate results
- the versions bumped and the worktree path
- each after-landing `run` step and its outcome, once §7a has run

If any unit is `skipped`, `failed` or `unresolved`, this report is the block
notice and the run stops here with the status set to `BLOCKED`.

### 7. Land

With every unit `green` and every orchestrator gate passed, move the folder to
`docs/plans/archived/`, set Status to `COMPLETE` with the date and the commit
list, and commit as one final `docs:` commit. Then read the Consent block:

- **Merge to the integration branch and push on green: yes** →
  `vwf:git-workflow` step 4, *merge, push & clean up*. A merge conflict is a
  hard halt: abort, keep the worktree, set `BLOCKED`, report the files.
- **no** → stop with the worktree path and the branch name, and say the branch
  is ready to land. Ask nothing further.

### 7a. After landing — the `run` steps

Read index.md's **After landing** table and execute every step whose *Mode* is
`run`, in order, from the repo root the landing left behind: the main checkout
when the branch merged, the worktree when it did not — and when the landing was
**not** consented, only those steps whose *Notes* say they may run from the
worktree. An empty table, or `none`, skips this step and is said in one clause.

The orchestrator runs them, never a unit — a `run` step may mutate the machine
rather than the tree under review, and a unit never reaches outside the
worktree. None of them is gated on a prompt: the plan recorded each as
publishing nothing and cutting no tag, which is what `run` means.

Each step is reported with its outcome, never asked about:

- **Ran.** Say what it did in the step's own terms. A step whose *Notes* say a
  **restarted** session is needed for its effect is reported with that sentence
  — this session already loaded what the step replaced.
- **Exited non-zero.** Report the failure verbatim, continue with the remaining
  steps, and never work around it. A step that refuses is usually a fact about
  the machine rather than a failure of the run, and the plan named that step,
  not a substitute for it.

### 8. The `ask` steps — always stop once

If index.md's **After landing** table carries any step whose *Mode* is `ask`,
and the landing merged and pushed, ask **one** question naming every `ask` step
in order: run them now? A yes authorises exactly those steps, in that order, and
nothing else; each outcome is reported as §7a reports a `run` step. It is asked
in the moment even though the plan recorded the intent — consent written at
approval is intent, and an `ask` step is precisely what the plan marked as
reaching past this machine.

**Offer waiting as the equal option, not the fallback.** §7a has already run
everything that reaches only this machine, and where a step staged something,
it is exercised only in a restarted session — so "not yet, I want to run it
first" is the answer the two-stage shape exists to make easy. Say what §7a
already did, and that the table names the remaining steps whenever the user
comes back to them.

If the landing was not consented, there is nothing to run past this machine yet;
say so in the final line and stop.

## Resource caps

A session cannot measure its own context; the signal arrives as an injected cap
directive from an external hook. On that directive, or on any sign the context
is being compacted mid-wave: finish writing the run-log rows for every report
already in hand, commit the units that are green, set Status to
`RUNNING — paused at wave <n> for context`, and stop with the launch line. A
re-run resumes per [blocking and resume](references/blocking.md); units in
flight are re-run from their prompt, since the worktree is the tie-break.

## What does not stop the run

The plan is approved and every ruling is in the folder. The run does **not**
pause to re-ask a ruling, confirm a file scope, report progress between waves,
ask whether to continue after a green gate, ask before a commit, or ask what to
do about a `GAP:` — a gap is recorded and the stated assumption stands until the
final report. It pauses for an inherited red preflight, a merge conflict, a
resource cap, and the `ask` steps' one question. Everything else is recorded in
the run log and answered at the end — including every after-landing `run` step,
which is run and reported, never asked about.

## What this skill never does

- Reads a unit's owned files itself, or does a unit's work inline because it
  looks small
- Dispatches a wave whose predecessor is not green or explicitly skipped
- Runs a generator or bumps a version outside the gates-and-bump unit — an
  after-landing `run` step is the one exception, and it is the orchestrator's
  because it may write outside the worktree
- Runs an `ask` step without the in-the-moment yes, or merges past the
  integration branch
- Treats a `run` step as an `ask` step's consent, or lets it stand in for what
  nobody has authorised
- Runs a gate the plan's *Wave gate* section does not name, or skips one it does
- Picks up an item from *Out of scope* or *Parked*, however adjacent
- Reports the run from recollection when the run log exists
