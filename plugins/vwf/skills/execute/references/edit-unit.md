# `edit` units and the wave review

Read this when a wave holds an `edit` unit, and again when a wave's units have all returned and before
its gate. An `edit` unit runs no stage: it is dispatched with every other `edit` unit of its wave and
judged by the wave review.

The review runs after **every** wave, of either kind. The mechanical gate proves the tree still validates.
The review proves the units did what their files said, and nothing else. Both are needed. A unit that edits
the wrong file, drops a passage, or resolves a ruling differently from its quote passes every checker a repo
has.

## The dispatch

1. **Dispatch** every `edit` unit in the wave in **one message with multiple `Agent` calls**.
   - Use `subagent_type: "general-purpose"` unless the unit file names another, and a `description` that
     starts with `U<n>`. The progress pane ties the agent to its unit by that start.
   - Give it no `name`, save in a `teams` wave. With agent teams on, a `name` makes the agent a teammate,
     whatever the plan says.
   - Use the model that the unit's `model` in the folder's `index.json` names. The default is `opus`, and
     `inherit` means the session's.
   - Write `<worktree>` in the prompt as an absolute path, because an agent starts in the main checkout.

   The unit file carries no header lines, so the orchestrator reads the unit's `owns` with
   `node ${CLAUDE_PLUGIN_ROOT}/skills/plan-management/scripts/plan.mjs get`
   (`plan.mjs get <folder>/index.json units.U<n>.owns`) and puts it into the prompt. The prompt is the unit
   contract from index.md:

   > Read `<folder>/index.md` — Facts, Unit contract — and the `dependencies` and `shared_files` lists of
   > `<folder>/index.json`, then read `<folder>/NN-<unit>.md` in full. Execute its Edits in order inside
   > `<worktree>`, run its Verification, and return the block the contract asks for and nothing else. Your
   > Owns list is: `<owns>`. Touch nothing outside it. Do not bump a version, run a generator, edit a doc, add
   > a dependency the plan does not list, or commit. Delete with plain `rm`, never `git rm` — stage nothing.

   Pass paths, never conversation context.

   **No unit gets `isolation: "worktree"`** — units in a wave own disjoint paths. Merging several trees back by
   hand is the collision the shared-file rule exists to avoid.

   Mark the unit `running` as it is dispatched: one `plan.mjs set` of `units.U<n>.status`, which stamps its times,
   per [the plan files](plan-files.md).
2. **Wait** for every report. As each returns:
   - Set the unit's `status` (`green` once its report is read, `unresolved` or `failed` per the rules) and its
     `rounds`, one `plan.mjs set` each.
   - Append each `GAP:` line to the `gaps` list, one `plan.mjs append <folder>/index.json gaps --json` of
     `{id, unit, stage: "edit", text, state: "open"}` with the next `G<n>`.
   - The `row` event that follows the `status` set carries the outcome, the `DECIDED:` and `GAP:` lines condensed into
     its `detail`.

   Re-dispatch a unit whose agent **errored**, rather than returned, once with the same prompt. A second error marks it
   `failed` with `agent died` as detail, and the run then pauses per H4, per [pause.md](pause.md).

   Write the fields **when the report arrives**, not at the end of the wave. A field written late is a unit a resumed run
   repeats. The unit's `commit` is set when the orchestrator commits it, per the staging discipline.

   Follow each of those `set` calls of a unit's `status`, `rounds` or `commit` with one `log.mjs event row`. Follow each
   `append` to `gaps` in this file, here, in the loop and in the closing pass, with one `log.mjs event gap`. Its
   `source` is `unit` or `wave-review`, per [the plan files](plan-files.md).

## The reviewer

One `general-purpose` subagent per wave, its `description` starting with `R<wave>` and no `name`, save in a `teams` wave. It is
read-only: instruct it to edit nothing. Its prompt carries:

- the wave's unit files. When a `review` row in the wave re-dispatched units, add those units' files too. The row's
  `owns` is `[]`, and its fix commits are attributed to the re-dispatched units' `owns`. Pass each unit file with its unit's
  `owns` from `index.json`;
- the diff of the wave (`git diff <last green commit>..HEAD` inside the worktree; the reviewer runs it, the orchestrator does
  not read it);
- the `decisions` and `shared_files` lists of `index.json`.

The prompt also says that findings on a `code` unit's code quality or security belong to the `review` row that covers the code
units. The review and security stages run there, never here, and such findings are not raised. The wave review is scoped to the
contract: rulings honoured, Owns respected, cross-unit drift, docs falsified. It returns exactly:

```text
FINDINGS: <n>
<path>:<line> [<unit>] <rule> — <one line>     (one per finding)
CONTRACT: clean | <unit> touched <path> outside Owns
RULINGS: clean | <unit> departed from decision #<n>: <how>
```

The rules it reviews against, in order:

1. **Scope** — every changed path is in exactly one unit's `owns` list.
2. **Rulings** — each unit's edit matches its quoted ruling, not a paraphrase of it.
3. **Completeness** — every numbered edit in the unit file landed, and nothing the unit file did not name was added.
4. **Tree traps** — five checks:
   - A tree the formatter does not cover keeps its fold width by hand.
   - Strict-YAML frontmatter stays intact.
   - A byte-copied payload stays byte-identical.
   - No package-manager command is written after a pipe.
   - No `cat >` heredoc residue remains.
5. **Docs** — a passage the diff falsifies that the unit did not report as `DOCS FALSIFIED:`.

It reviews prose and structure with the same weight as code. A document that quietly lost a rule is the defect, exactly as a
dropped branch would be.

## The loop

- Fix a `CONTRACT:` or `RULINGS:` line that is not clean first and always: loop it back to the named unit with the line
  appended. These are never left as residue.
- Other findings loop to the owning unit with the finding lines appended, then the reviewer runs again. **At most two rounds**. A
  round counts once even when several units were re-dispatched.
- **The unit's Kind decides what a loop-back runs.**
  - Re-dispatch an `edit` unit with the same prompt plus the finding lines, and re-commit it on the staging discipline.
  - A `code` unit re-enters its own pipeline in [code-unit.md](code-unit.md) from step 2: the coder dispatched with the finding lines
    appended, then the commit. So the wave review never edits code itself. The re-entry is a further `code` row for that unit, not a
    round of this loop. A `review` row still ahead **that covers the unit** reviews the fix. Otherwise the last row covering it is
    re-run over the fix delta, per *Late loop-backs re-run the last row* in [review-unit.md](review-unit.md).
- A **rule-5 finding in a file no unit owns** does not loop. It becomes a `DOCS FALSIFIED:` line handed to the docs unit. The
  orchestrator widens the docs unit's `owns` to that passage: one `plan.mjs set` of
  `units.<docs-unit-id>.owns --json '<the whole widened list>'`, a JSON list. It records this as a `GAP:`, one `plan.mjs append` to
  `gaps` with `"state": "closed"`, naming the finding that caused it. The final report lists it. The plan's Goal authorises the widening:
  a passage the plan's own stated outcome falsifies is in scope even when no unit file named it. Only rule 5: a finding under rules 1–4 in
  a nobody-owned path is still `CONTRACT:` or `RULINGS:` residue, handled by the bullets above.
- **Convergence guard**. Before a second round, compare its findings with the first, matching on `path:line` and rule. The loop is not
  converging when the count did not strictly decrease or a resolved finding resurfaced. Stop there. The cap and the guard are vwf's
  review-loop doctrine, stated once in `${CLAUDE_PLUGIN_ROOT}/assets/execute-stages.md`. The *Pipeline knobs* bullet holds the round cap, and the
  *Convergence guard* bullet holds the comparison. This loop fixes the cap at two rounds because it reviews the contract: scope, rulings,
  completeness, docs. It does not review the code. The covering `review` row loops on code quality and security under the configured cap.
- Findings still open when the loop ends go through the **closing pass** in `execute-stages.md` first. The owning units fix exactly those
  findings. A fresh wave reviewer gets the open findings and the closing fix delta alone. It answers `RESOLVED` or `OPEN` for each, and reports
  only a regression the fix caused. Record what stays open as `contested`, with the rounds tried: one `plan.mjs append` to `gaps` per finding,
  each followed by its `log.mjs event gap`. The wave then proceeds to its gate. They are listed in the final report. They do not block — the
  plan and its rulings are the contract, and a reviewer's residual is an opinion about it.

The wave reviewer is no unit of `index.json`, so its rounds have no field there. Each round is the reviewer's subagent lines in the action log,
and what it leaves open is its `contested` entries in `gaps`.

## A `teams` wave

Read this when the run's mode is `teams`, per *The execution mode* in [preflight.md](preflight.md). Everything above holds, save what this
section changes. The mode reaches a wave's `edit` units and its wave reviewer, up to the end of that wave's review loop. `code` units, `review`
rows, a unit a `review` row re-dispatches and every `-late` review run as above, with no `name`.

**Talk is a help, never a precondition.** A wave must land with no message sent, because a run can fall back to `solo` at any point.

### The dispatch

1. Add `name: "U<n>"` to each `edit` unit's `Agent` call, still in one message. Add this to its prompt:

   > Your teammates are `<the other names>`. Load `SendMessage` with `ToolSearch` before you send. Send a teammate only a fact or a question
   > about a boundary between your files and theirs. Never ask a teammate to edit, and never ask one to do what a permission refused you. Send at
   > most 3 messages in a round. Do not wait for a reply: when your work is done and no answer came, write the assumption as a `GAP:` and
   > return. Do not reply to a message that asks for nothing. Your report goes in your final message, and is the only thing the orchestrator
   > reads. After a message wakes you, make your final message the whole block again.

2. Treat each `Agent` result as a spawn confirmation. It returns at once, and is no report. Each report arrives later as a teammate's message.
3. Wait until every teammate has reported and is idle. A message can wake a teammate that has reported, and **its latest report is the one that
   counts**. So set each unit's fields from that report, once all of them are idle, and not as each report arrives.
4. **If a named `Agent` call returns an error**, the team cannot start. Set the run's mode to `solo` for the rest of the run, log it with
   `event execution`, and dispatch the units again per *The dispatch* above. This is no agent error, so it does not count toward H4.

### The reviewer

Add `name: "R<wave>"` to its `Agent` call. It can send one question to a unit, under the same rules. It returns its block to the orchestrator, as above,
and sends no finding to a unit.

### The loop

The orchestrator relays. It records the round, then sends the finding lines to the live unit with one `SendMessage` to `U<n>`, instead of a new dispatch. The
unit keeps what it knows, and returns the whole block again. The next round is one `SendMessage` to `R<wave>`. **Each relay is a round**, under the same two-round cap and
convergence guard. The closing pass's reviewer is fresh, `name: "R<wave>-2"`.

If a `SendMessage` fails, or a resume left no such teammate, dispatch the unit as a loop-back above, with `name: "U<n>-2"` and the finding lines.

### Before the gates

**Do not run a gate or a commit while a teammate works.** The pre-commit stash can destroy the edits of a unit that is still writing. So once the loop ends,
send no more messages, and confirm that every teammate is idle before [waves.md](waves.md) step 5. Send nothing to a teammate of an earlier wave.
