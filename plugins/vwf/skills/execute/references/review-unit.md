# One `review` row

Read this when a wave holds a `review` row. A review row is the only place the two review engines and the
two reviewers run. No `code` unit triggers a review by itself. The orchestrator infers no row: it runs what
the `units` list of the folder's `index.json` holds, a row being a unit whose `kind` is `review`. The fresh-run refusals
have already refused a plan whose `code` units no row covers.

A row runs **first in its wave**, before any `edit` or `code` unit of that wave is dispatched. So the engines see a
committed tree and nothing in flight. Every unit it covers is in an earlier wave, which the fresh-run refusals guaranteed. It
never runs concurrently with a `code` unit's pipeline. The stage table, the dispatch contracts and the shared stage
rules are `${CLAUDE_PLUGIN_ROOT}/assets/execute-stages.md`; this file is the loop that runs them over the row.

**A row that covers `edit` units alone is security only**. When no unit the row covers is `code`, the row runs one
engine, `/security-review`, and one reviewer, `execute-security-reviewer`. The wave review has already judged those
units against their files. Running `/code-review` and the code reviewer over the same lines is the second review
of one change. Every step below then reads its `/code-review` and `execute-code-reviewer` parts as absent. The row's
`review.round` events count no `review` findings, and no `REVIEW:` block is expected. Its loop is the security loop
alone: cap-exempt, under the convergence guard. A row that covers one `code` unit or more runs both halves.

The row's unit file, `NN-review.md`, carries only its H1 and a **Scope** section naming what it reviews. Its `owns` is
`[]`: the row edits nothing, commits nothing and stages nothing. The fix commits a round produces belong to the units
fixed.

The **row id** is its `id`, `U<n>` like every other unit: `U7`, say. The **loop id** is the row id for the row's main
loop, and `<row-id>-late<n>` for each late re-run (below). The n counts from 1 in the order the row's late loops ran:
`U7-late1`, `U7-late2`, each with its rounds restarting at 1. Everything keyed per round keys on the loop id, never the row
id alone. That covers the engine output files and the `review.round` events. So the two loops never overwrite each other's
record.

Every write below is one call in the worktree to the plan script,

    node ${CLAUDE_PLUGIN_ROOT}/skills/plan-management/scripts/plan.mjs set <folder>/index.json units.<row-id>.<field> <value>

`plan.mjs set` for short, with `--json` for a number, and every read one `plan.mjs get` of the same path. Follow each `set`
below of the row's `status`, `rounds` or `range`, or of a re-dispatched unit's `commit`, with one `log.mjs event row`; a
`range` row carries `{"from": "<sha>", "to": "<sha>"}`. Follow each `append` to `gaps`, and each `contested` line, with one
`log.mjs event gap` with its `source` `review-row`, per [the plan files](plan-files.md).

Skip the row when its `status` in `index.json` already reads `green`. That means its last round was clean, or it ended at the cap or the
guard with its residuals recorded `contested`. Otherwise, run these steps.

## 1. scope

Set the row's `status` `running` (its times are `plan.mjs`'s, per [the plan files](plan-files.md)). Then compute the range the row
reviews, to `HEAD`:

- From the branch delta since the previous `review` row **in `units` order** that reached `green`. The start is its `range.to`, the
  `to` the last round of its **main loop** recorded. A late re-run never advances a row's recorded `to`, so nothing landed between that loop and a
  re-run is skipped.
- Else from the branch base, the integration branch's tip the worktree was cut from.

Rows never run out of order: a failed, unresolved or skipped row skips every later row too, per [blocking.md](blocking.md).

The row's **file list** is every file `git diff --name-only <from>..<to>` yields, each mapped to **the unit whose commit last touched it
inside the range**. Build the commit → unit map **once, over the whole branch** (`<base>..HEAD`), and use it everywhere. The range bounds
which files the row scopes, never the map. It reads `git log` and `index.json` alone, **never the action log**, so every run of the plan maps
the same commits the same way. Each commit `git log <base>..HEAD` lists is, in this order:

- **excluded**, not mapped, in two cases. One is the orchestrator's own `docs:` commits that touch the plan folder and nothing else: the
  approval, the claim, each `docs: plan state` wave commit. The other is the Reconcile commit, whose hash `stages.reconcile.detail` holds;
- else **placed** on the unit whose `commit` in `index.json` is its hash;
- else placed on the **one** unit whose `owns` in `index.json` covers every file the commit touched outside the plan folder. The staging
  discipline keeps every commit the orchestrator makes on a unit's behalf to that unit's Owns, a widened Owns once its `set` has run. Such a
  commit is its own, a code fix, an `edit` unit's fix, or an orchestrator-applied edit. The shared-file rule gives each file one owner. So a fix commit that a later
  `commit` value no longer names is still placed. A late re-run's map is as full as the main loop's.

**Refuse at map time**, with its hash and files named, a commit that no unit's `owns` covers whole, or that two units' `owns` split. A commit
no one unit answers for cannot be reviewed. The reviewers receive the map.

**The one rule for a finding on a file whose unit the row does not cover**. The planners write every row to cover every earlier unit no earlier
row covers, so this fires only on a folder written before that rule. Never drop or defer any finding, security, `[breaking-api]` and review alike.
It routes to that unit all the same. The round's `row` event carries the coverage widened to it in its `detail`, "n findings
routed to uncovered units". A review finding routed so counts under the row's round cap like any other.

Each round of the main loop sets the row's `range.from`, `range.to` and `rounds`. Every round records **its own `from..to`**. Round 1 reviews the
row's range as above, and each later round reviews only the fix commits of the round before it, per step 4. Each logs the round's `review.round` event
with its range and its file count. The next row's `from` reads this row's `range.to`, the main loop's last `to`.

The file list and its map are what the reviewers receive as their scope, never a unit. A file in the list that the row's Scope section does not name is
still in scope. The list is the contract, and the section its description.

The fresh-run refusals guarantee the range and the coverage agree. The row sits in a later wave than every unit it covers, directly or transitively through
`depends_on`, so each is committed before the row runs. It covers every unit of any kind in an earlier wave that no earlier row covers. So no covered commit
is reviewed by a row that does not cover its unit.

## 2. engines

In **one message**, invoke `/code-review` at high effort and `/security-review` through the `Skill` tool. Invoke `/security-review` alone on a security-only row.

- The `/code-review` engine takes the round's range as its target, `<from>..<to>`.
- The `/security-review` engine takes no target and reads the whole branch delta, so its output is filtered to the round's file list below.

Each may run as a background task; note the task each reports. Wait on each with `TaskOutput`, blocking, up to 30 minutes from invocation. Stop an engine
that errors or times out with `TaskStop`, and count it unavailable, keeping the reason for the prompt.

Save each engine's output verbatim to `<folder>/engine/<loop-id>-<round>.log` in the plan folder, committed with the folder, the on-disk record the dedupe
below reads. The `.log` extension is deliberate: it keeps the formatter and the linter off the file at commit. The whitespace hooks may still normalise its
line endings and trailing whitespace, which the dedupe never sees, since it matches on the `(path, line, text)` tuple.

Then **filter** it:

- Keep a finding on a file in the row's file list.
- Keep a finding on a file **outside the range** too. An in-range change can break a caller the range does not touch.
- Drop an out-of-range finding when **the same finding (path, line, text) appeared in saved engine output**. That output is of a previous row, this row's earlier
  loop or this loop's earlier rounds. Read those files to test this. The finding is that loop's. Say so in one clause of the round's `row` event `detail`, "n engine findings
  already reported by <row> dropped".

A kept out-of-range finding maps through the one branch-wide map, in this order:

1. to the unit whose commit last touched that file on the branch, covered or not;
2. when no branch commit touched it, to the unit whose in-range change the engine or reviewer names as the cause;
3. when none is named, to the unit that last touched the in-range file the finding cites;
4. when still nothing, it is recorded `contested` with `(unmapped)` in Detail. It is never silently dropped.

The token `(unmapped)` is the exact sentinel with which the reviewers label a file the branch-wide map cannot place.

The one rule of step 1 then applies to a mapped finding in step 4 like any other. Hand the reviewers the filtered output. The one rule is not applied here: the
reviewers report every finding in full, and the orchestrator applies it in step 4.

## 3. reviewers

In **one message**, dispatch `execute-code-reviewer` and `execute-security-reviewer` so both run at once, per the two dispatch contracts in `execute-stages.md`. A
security-only row dispatches `execute-security-reviewer` alone, per the rule at the top of this file. Pass:

- the loop id, the round number and the plan folder path;
- the range and the file list as the scope;
- the unit files of every unit the row **covers**, each with its unit's `owns` from `index.json` (a unit file carries no header lines). The row covers every unit its
  `depends_on` names directly or transitively through the units they name, the same set the fresh-run refusals counted. These are the rulings the code is reviewed against;
- the file list's unit map, which lets a reviewer label each finding with the unit whose commit last touched its file;
- when a unit the row covers is `code`: the resolved stack with its `conventions:` prose, and the registry. Setup step 3 fetched the prose only then. The registry,
  `docs/blueprint/registry.yaml`, gives the security reviewer its capabilities and threat notes. A row covering `edit` units alone passes none of these, and the
  reviewers review against the unit files and rulings alone.

Each dispatch prompt ends with a section headed `## Engine`, holding either that engine's output verbatim or the single line `ENGINE: unavailable — <reason>`.

They are independent read-only passes over the same range. Neither reads the other's output, so serializing them only costs wall-clock. Each reviewer returns exactly
one block, `REVIEW:` or `SECURITY:`. A return without it is an error under the "Subagent death" pause rule. Re-dispatch once. On twice in a row on one row, record
it blocked, its `status` `failed`, and pause.

The reviewers run no engine. So the orchestrator never waits for a notification on a reviewer's behalf, and never sends a reviewer a message to finish its block. The only
thing it waits for from a reviewer is its return.

## 4. the loop

Merge the two returns into one findings set. Every finding names a file and is labelled `(<unit>)`. That is the unit whose commit last touched that file in the range, read off the
unit map the reviewers were handed. The orchestrator checks the label against the same map. It then applies the one rule of step 1 to every finding whose unit the row does not
cover. The finding routes to that unit, whatever its stage. The round's `row` event records the widening, "n findings routed to uncovered units".

For each unit remaining, re-dispatch it **by its `kind`**, one dispatch per unit, the units serially in wave order, each re-committed per the staging discipline:

- A `code` unit's coder in fix-first mode, per the `code` contract in `execute-stages.md`. Pass the merged finding lines labelled with its id, in full as the reviewers returned
  them, and its own unit id. The coder fixes only those.
- An `edit` unit, per [edit-unit.md](edit-unit.md)'s loop-back: the same prompt plus the finding lines labelled with its id, and no stack. A change plan may place a row over
  `edit` units.

Then run the next round, **engines first**: steps 1 to 3 over the **fix delta alone**. The round's `from` is the previous round's `to`, and its `to` the new `HEAD`, set in the row's
`range` as step 1 states. Its file list and the reviewers' unit files are the files the fix commits touched and the units fixed. A later round proves the fixes and what they broke;
round 1 already reviewed the rest. Merging the two reviewers' findings into one fix pass keeps the two stages from rewriting each other's lines.

Gating is per-stage and unchanged:

- Every security finding and every `[breaking-api]` finding **must** be fixed (cap-exempt).
- Other review findings loop under `pipeline.review_round_cap`. Residuals after the cap go to the **closing pass** in `execute-stages.md`. What it leaves open is
  `contested`, and each is asked when the loop ends, the reviewer's recommendation first, per [questions.md](questions.md).
- A security or `[breaking-api]` finding that trips the convergence guard is the H7 question, per [questions.md](questions.md).

A round counts once, even though it ran two reviewers and may have re-dispatched several units.

Before each new round, apply the **convergence guard** in `execute-stages.md`. The closing pass, the `contested` exit and the cap-exempt pause apply to the row exactly as they applied
to a unit. The closing pass's check dispatches both reviewers with the open findings and the closing fix delta alone, and runs no engine. The guard ignores a kept out-of-range finding
a previous row or this row's earlier loop marked `contested`. It is that loop's residual, not this loop's oscillation.

## 5. questions

Each `QUESTION` line of a reviewer, and each old `SPEC/PLAN GAPS:` line, is a question, per [questions.md](questions.md). Its owner is the unit it names, or
the row id when it names none. A reviewer is not resumed: the answer goes into the loop-back it feeds.

## 6. record

Set the row's `status`:

- `green` when the last round is clean. Also `green` when the loop ended at the cap or the convergence guard, its closing pass settled what stayed open, and each
  `contested` finding was answered, per [questions.md](questions.md). Then the row is done, the next row's range starts after it, and a resume skips it.
- `failed` or `unresolved` per the rules.

Its `commit` stays `""`: the row has no commit of its own, and the folder's edits ride the commit that closes the wave.

Write the **action log events as each node returns**, not batched here:

- one `review.round` event per round, its `review` count absent on a security-only row;
- one `row` event for the row each time its fields are set, its `detail` the model and the outcome;
- one `row` event per coder re-dispatched with its fix commit, which also sets that unit's `commit`.

Set the row's `range` and `rounds` before the next dispatch. So the round count is **per loop**. The main loop's highest round is what `rounds` holds. Each late re-run's own highest is
reported beside it as `re-run n: m rounds`, from its `review.round` events. Never use the event count, since one round writes several. The convergence guard compares rounds within one loop
only. A skip carries its `why`.

## Late loop-backs re-run the last row

A fix that lands **after the last `review` row covering its unit** is code no engine or reviewer has seen. It loops back to an earlier-wave unit that row covers, of either `kind`. It comes from the wave review of the row's own wave, or the acceptance or UX pass after all units.
It can also come from a fix-first loop-back at the final report. Before the run proceeds past it, re-run that row **in
full over the fix delta**: the loop-back's own fix commits and nothing later.

A re-run the wave review triggered waits until the wave's green `edit` units are committed ([waves.md](waves.md) step 6). It runs at step 7, with the gate lines run again after it. So the
engines see a committed tree, the same guarantee as the row's first run.

**The range**. The re-run's range is its own. Round 1's `from` is the parent of the loop-back's first fix commit, and its `to` the loop-back's newest fix commit. A round after the first
reviews the fix delta of the round before it, as step 4 states. The file list and unit map come from each round's range as in step 1. Then engines first, both reviewers — the security half
alone on a security-only row — steps 2-6.

**A new loop**. The re-run is a new loop over its own range, not a further round of the finished one:

- Its loop id is `<row-id>-late<n>`, n the same counter as its `re-run n`. The engine files and its `review.round` events key on it. So round 1 of one late loop never overwrites round 1 of the
  main loop or of an earlier late loop.
- Its rounds restart at 1.
- Its `row` events say `re-run n` in their `detail`.
- The convergence guard's baseline is the re-run's own round 1, and `pipeline.review_round_cap` applies to it afresh.
- It logs one `review.round` event per round like any loop, each with its own `from..to`.

**The fields**. It reads the row's `range` and the covered units' `commit` from `index.json`, and sets neither the row's `range` nor its `rounds`. The next row's `from` is the row's `range.to`, the
`to` of its main loop. A fix commit a re-run makes still sets its unit's `commit`.

**On a resume**. No field holds a late loop's range, and `git log` cannot tell a late loop that finished from one still pending. So rebuild the range from `git log` and the map alone. Its `from` is the parent
of the oldest commit after the row's `range.to` that the map places on a unit the row covers. Its `to` is the newest such commit. A late re-run already done **repeats**, never skips, per [blocking.md](blocking.md)'s resume.

**The contract review**. After the re-run, one contract review runs over the re-run's fix commits with the fixed units' files, per [edit-unit.md](edit-unit.md)'s reviewer section. Start its `description` with `R<wave>-late`
when the trigger was the wave review, and with `R-late` when it was the acceptance or UX pass or a fix-first loop-back and no wave is current. It is **one round, outside any cap**. Its findings loop back to the
fixed units **once**. The same row re-run reviews that fix, then the same contract review does. Record a second loop-back from it `contested`, and proceed — never a third re-run. Then run
the wave gate lines once more.

`code-unit.md`, `edit-unit.md`, `waves.md` and `acceptance-and-ux.md` cite this rule rather than restate it.

What the row never does: edit a file, stage a path, or commit. A review row that has to change something re-dispatches the unit whose commit last touched the file. It never widens its own range past `HEAD`,
and never reviews a unit that is not in the range. A unit the next row covers waits for the next row.
