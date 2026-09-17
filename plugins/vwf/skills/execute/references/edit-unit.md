# `edit` units and the wave review (the Waves section)

Read this when a wave holds an `edit` unit, and again when a wave's units have
all returned and before its gate. An `edit` unit runs no stage: it is dispatched
with every other `edit` unit of its wave and judged by the wave review. The
review runs after **every** wave, of either kind — the mechanical gate proves
the tree still validates; the review proves the units did what their files
said, and nothing else. Both are needed — a unit that edits the wrong file,
drops a passage, or resolves a ruling differently from its quote passes every
checker a repo has.

## The dispatch

1. **Dispatch** every `edit` unit in the wave in **one message with multiple
   `Agent` calls**, `subagent_type: "general-purpose"` unless the unit file
   names another, `name: "U<n>"`, on the model the unit file's `Model:` line
   names (`opus` by default; `inherit` means the session's). The prompt is the
   unit contract from index.md: *"Read `<folder>/index.md` — Facts, New
   dependencies, Shared-file rule, Unit contract — then read
   `<folder>/NN-<unit>.md` in full. Execute its Edits in order inside
   `<worktree>`, run its Verification, and return the block the contract asks
   for and nothing else. Touch nothing outside your Owns list. Do not bump a
   version, run a generator, edit a doc, add a dependency the plan does not
   list, or commit. Delete with plain `rm`, never `git rm` — stage nothing."*
   Pass paths, never conversation context. **No unit gets
   `isolation: "worktree"`** — units in a wave own disjoint paths, and merging
   several trees back by hand is the collision the shared-file rule exists to
   avoid.
2. **Wait** for every report. As each returns, mark the unit in the Units table
   and append a run-log row — unit, model, round 1, outcome, the `DECIDED:` and
   `GAP:` lines condensed into *Detail*. A unit whose agent **errored** rather
   than returned is re-dispatched once with the same prompt; a second error
   marks it `failed` with `agent died` as detail. Write the row **when the
   report arrives**, not at the end of the wave — a row written late is a unit a
   resumed run repeats.

## The reviewer

One `general-purpose` subagent per wave, `name: "R<wave>"`, read-only —
instructed to edit nothing. Its prompt carries the wave's unit files, the diff
of the wave (`git diff <last green commit>..HEAD` inside the worktree — the
reviewer runs it, the orchestrator does not read it), and index.md's Assumed
decisions and Shared-file rule. The prompt also says that findings on a `code`
unit's code quality or security belong to the `review` row that covers the
code units — the review and security stages run there, never here — and are
not raised: the wave review is scoped to the contract — rulings honoured, Owns
respected, cross-unit drift, docs falsified. It returns exactly:

    FINDINGS: <n>
    <path>:<line> [<unit>] <rule> — <one line>     (one per finding)
    CONTRACT: clean | <unit> touched <path> outside Owns
    RULINGS: clean | <unit> departed from decision #<n>: <how>

The rules it reviews against, in order:

1. **Scope** — every changed path is in exactly one unit's Owns list.
2. **Rulings** — each unit's edit matches its quoted ruling, not a paraphrase of
   it.
3. **Completeness** — every numbered edit in the unit file landed; nothing the
   unit file did not name was added.
4. **Tree traps** — a tree the formatter does not cover keeping its fold width
   by hand, strict-YAML frontmatter intact, a byte-copied payload still
   byte-identical, no package-manager command written after a pipe, no
   `cat >` heredoc residue.
5. **Docs** — a passage the diff falsifies that the unit did not report as
   `DOCS FALSIFIED:`.

It reviews prose and structure with the same weight as code: a document that
quietly lost a rule is the defect, exactly as a dropped branch would be.

## The loop

- A `CONTRACT:` or `RULINGS:` line that is not clean is fixed first and always:
  loop it back to the named unit with the line appended. These are never left
  as residue.
- Other findings loop to the owning unit with the finding lines appended, then
  the reviewer runs again. **At most two rounds.** A round counts once even when
  several units were re-dispatched.
- **What a loop-back runs is the unit's Kind.** An `edit` unit is re-dispatched
  with the same prompt plus the finding lines, and re-committed on the staging
  discipline. A `code` unit re-enters its own pipeline in
  [code-unit.md](code-unit.md) from step 2 — the coder dispatched
  with the finding lines appended as the tag, then the commit — so the wave
  review never edits code itself. The re-entry is a further `code` row for
  that unit, not a round of this loop; the fix is reviewed by the `review` row
  that covers it — the next one when one is still ahead, else the last one
  re-run over the fix delta per *Late loop-backs re-run the last row* in
  [review-unit.md](review-unit.md).
- A **rule-5 finding in a file no unit owns** does not loop. It becomes a
  `DOCS FALSIFIED:` line handed to the docs unit, whose Owns the orchestrator
  widens to that passage; the widening is written into the Units table's Owns
  cell and into the run log as a `GAP:`, and the final report lists it. The
  plan's Goal is what authorises the widening — a passage the plan's own stated
  outcome falsifies is in scope even when no unit file named it. Only rule 5: a
  finding under rules 1–4 in a nobody-owned path is still `CONTRACT:` or
  `RULINGS:` residue, handled by the bullets above.
- **Convergence guard.** Before a second round, compare its findings with the
  first, matching on `path:line` and rule. The loop is not converging when the
  count did not strictly decrease or a resolved finding resurfaced. Stop there.
  The cap and the guard are vwf's review-loop doctrine, stated once in
  `${CLAUDE_PLUGIN_ROOT}/assets/execute-stages.md` — the *Pipeline knobs* bullet
  for the round cap, the *Convergence guard* bullet for the comparison; this
  loop fixes the cap at two rounds because it reviews the contract — scope,
  rulings, completeness, docs — not the code, whose quality and security the
  covering `review` row loops on under the configured cap.
- Findings still open when the loop ends are recorded as `contested` in the run
  log with the rounds tried, and the wave proceeds to its gate. They are listed
  in the final report; they do not block, because the plan and its rulings are
  the contract and a reviewer's residual is an opinion about it.

Every round is a run-log row: `R<wave>`, the model, the round, `findings(n)` or
`pass`, and the finding lines condensed into Detail.
