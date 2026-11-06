# U1 — Make the rules of execute agree

- **Read first:** every owned file, top to bottom, before editing.
- **Lazy-load:** `workflows/folder.md`, `references/code-unit.md` and
  `references/land.md`, to confirm a fact. Do not edit them.

## Ruling

> D1: An earlier unit of any kind. references/review-unit.md changes to agree
> with the refusal in workflows/folder.md and interview item 10a.

> D2: Both the per-unit recall and the plan-level recall read
> docs/memory/decisions/, docs/memory/problems/ and docs/memory/gaps/.

> D3: Any read-only git command. Of the commands that write, only the ones that
> references/rules.md names: the index row commits, the staging discipline, git
> merge and its --abort in references/setup.md, and git worktree remove in
> workflows/all.md. The git submodule and git clone lines in workflows/folder.md
> are text that the run reports to a person, so they are not exceptions.

> D4: Yes. references/rules.md names gates.unit, gates.wave, gates.plan and
> gates.keeps.

> D5: Refuse a deletion outside the unit's Owns, except a file that the run
> created. The approved Owns list is the consent to delete.

> D6: execute declares a caller preference in the skill's arguments, as text that
> starts with prefer: and that the skill never reads as a name. To doctor: prefer:
> report only, which offers no fix and asks nothing. To handoff: prefer: the one
> thread is this plan's run. Both skills get a short section that honors the
> prefix, as git-workflow honors a declared preference. An argument with only the
> prefix counts as empty, so doctor checks every project and handoff writes next.
> Names, when a caller has them, come before the prefix.

> D7: H6 goes: an all-blocking gap ends at the final report, as
> references/blocking.md says. H4 stays a pause, as references/pause.md says, so
> references/blocking.md stops treating a dead agent as an isolated block. Do not
> renumber the other H ids.

> D9: No. These edits change rules on purpose, and a ledger proves that a rewrite
> keeps every rule. The wave review judges each edit against its unit file.

> D10: A failed, unresolved or skipped review row skips each later review row and
> each later unit of any kind that a later row covers.

> D11: Wait for the other reports, run the gates, and commit each green unit. Leave
> the dead unit's edits uncommitted, and name them in the gaps entry and the pause
> report. The folder then reads RUNNING — paused at unit <n>: agent died.

## Edits

All paths are under `plugins/vwf/skills/execute/`.

1. **`references/review-unit.md`** — D1: at line 83, change "every `code` unit in
   an earlier wave" to "every unit of any kind in an earlier wave".
2. **`references/review-unit.md`** — D10: at line 52, make "a skipped row" read "a
   failed, unresolved or skipped row". Leave lines 137-138 as they are, because H4 stays.
3. **`references/setup.md`** — D2: at line 21, list `docs/memory/decisions/`,
   `docs/memory/problems/` and `docs/memory/gaps/`.
4. **`references/rules.md`** — D2: at line 156, read the same three folders.
5. **`SKILL.md`** — D2: at line 140, add `docs/memory/problems/` to the state table
   row. It is read, and the run writes only decisions there.
6. **`references/rules.md`** — D3: at line 113, replace "Never run raw git, with
   two exceptions" and its list. Read-only git commands are allowed. A git command
   that writes goes through `/vwf:git-workflow`, except the items that D3 names, each
   with a link to the file that runs it. Keep the two existing exception texts
   unchanged.
7. **`references/rules.md`** — D4: at line 236, name `gates.keeps` beside the three
   tiers. `gates.keeps` entries run as `references/reconcile.md` says.
8. **`SKILL.md`** — D5: at lines 189-190, change "deleting files the run did not
   create" to "deleting a file outside the unit's Owns, except a file that the run
   created".
9. **`references/claim.md`** — D6: at line 31, run
   `/vwf:doctor <projects> prefer: report only`, and keep the scope sentence.
   `<projects>` is the plan's projects, else the base repo's own project name. A repo
   with no such name passes the prefix alone.
10. **`references/pause.md`** — D6: at line 55, replace "with no argument" with
    `/vwf:handoff prefer: the one thread is this plan's run`, which writes the
    reserved `next` handoff. At line 15, change "a bare `/vwf:handoff`" to "`/vwf:handoff`".
11. **`workflows/all.md`** — D6: at line 150, name `/vwf:doctor` with the two skills
    that the line lists. At line 151, use the same handoff call as Edit 10.
12. **`SKILL.md`** — D7: remove the H6 row. Keep each other row and its id.
13. **`references/blocking.md`** — D7: at line 3, remove "or dies", and name H4 for
    a dead agent. At line 18, remove "when its agent errors
    twice" from the list of what blocks a unit, and say that an agent that errors
    twice is H4, a pause, per [pause.md](pause.md). At the `BLOCKED` detail line,
    remove "or agent died".
13a. **`references/pause.md`** — D11: at the H4 paragraph, lines 23-25, replace
    "Commit what is safe" with the ruling's steps, and state the folder's status with
    `plan-management status`. At line 8, except the dead unit's edits that H4 leaves
    uncommitted.
14. **`references/edit-unit.md`** — D7: at lines 45-46, after "marks it `failed` with
    `agent died` as detail", add that the run then pauses per H4.
15. **`references/blocking.md`** — D10: at lines 25-30, make the cascade read "a
    failed, unresolved or skipped `review` row", and change "every later `code` unit"
    to "every later unit of any kind". Make "A `code` unit never lands without its row"
    read "A unit never lands without its row", and the detail `review row <row> <status>`.
    Keep the reason.
16. **`references/waves.md`** — D10: at lines 53-54, make the same two changes. At lines 52-54,
    name H4 as the exception to "The rest of the run continues": a unit marked `failed`
    with `agent died` pauses the run.
17. **`SKILL.md`** — D7: if a sentence near the table still names an all-blocking
    gap as a pause, make it agree.

## Verification

- `mise x -- mise run code:format`
- `mise x -- mise run code:lint`
- `node .claude/skills/skill-kit/scripts/lint.mjs plugins/vwf/skills/execute` shows
  0 errors and no `ST101`.
- `grep -rnE '\bH6\b|two exceptions' plugins/vwf/skills/execute` prints nothing.
- `grep -n '\bH4\b' plugins/vwf/skills/execute/SKILL.md plugins/vwf/skills/execute/references/pause.md`
  prints a line for each file.
- `grep -n 'problems' plugins/vwf/skills/execute/SKILL.md plugins/vwf/skills/execute/references/setup.md plugins/vwf/skills/execute/references/rules.md`
  prints a line for each file.
- `grep -n 'gates.keeps' plugins/vwf/skills/execute/references/rules.md` prints a
  line.
- `grep -rn 'prefer:' plugins/vwf/skills/execute/references/claim.md plugins/vwf/skills/execute/references/pause.md plugins/vwf/skills/execute/workflows/all.md`
  prints a line for each file.

## Guardrails

- Do not touch `doctor` or `handoff`. U2 owns them.
- Do not touch a doc. U3 owns them.
- Do not renumber H1, H2, H3, H4, H5, H7 or H8.
- Do not rewrite a passage that the rulings do not reach.
- `plugins/**/*.md` is not formatted. Match the fold width of the file by hand.
- Keep each new sentence within 25 words, because the lint warns on a longer one.

## Commit

`fix: make the rules of execute agree`
