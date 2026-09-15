# U1 — change-plan: derived priority, the index row at hand-off, `ask` only

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/change-plan/SKILL.md`,
  `plugins/vwf/skills/change-plan/references/plan-template.md`,
  `plugins/vwf/skills/change-plan/references/interview.md`
- **Model:** opus
- **Read first:** every owned file, top to bottom, before editing; `index.md`'s
  Goal, Facts and Assumed decisions.
- **Lazy-load:** `plugins/vwf/skills/backlog/SKILL.md` (the caller table shape
  and the "never edits the file itself" phrasing this unit mirrors);
  `plugins/vwf/skills/change-execute/SKILL.md:38-64` (read only — U2 owns it —
  to keep the hand-off wording and the refusals consistent).

## Ruling

Decision 1: "Two tables in `docs/plans/index.md`: the cycle-plan table exactly
as `/vwf:plan` and `/vwf:archive` write it today, plus a **Change plans** table
with columns `Folder`, `Plan`, `Priority`, `Status`, `Requires`, `Backlog`. Each
writer edits only its own table. The contract is one asset,
`plugins/vwf/assets/plan-index.md`, cited by every skill that reads or writes
the file."

Decision 4: "Only as direct commits on the integration branch from the main
checkout, never in a worktree: change-plan's approval commit adds the row;
change-execute commits `RUNNING` at claim and `COMPLETE` after the merge lands."

Decision 9: "Derived by change-plan, never asked:
`10 + max(Priority of every unarchived plan in its requires:)`, or `10` when it
requires none of them. Shown in the §5 gate presentation as a fact; written into
the row at hand-off."

Decision 13: "`ask` only. change-plan's §4(b) offers no `run`; the template's
After landing table reads `ask`; change-execute stops once before every step. A
`run` in an older folder is read as `ask`."

Decision 14: "The index is the **base** repo's, as `docs/backlog.md` is; a run
in a member repo addresses the base's file."

The user's words on priority: "Priority must be determined by `change-plan` and
must be in block of 10. When there are no active plan, start with 10 and go on
adding depending on the dependencies."

## Edits

1. **`SKILL.md`** —
   - §1 recall: add the base repo's `docs/plans/index.md` to what is read — its
     change-plan table is where the active plans, their statuses and their
     priorities live; cite `${CLAUDE_PLUGIN_ROOT}/assets/plan-index.md` for the
     shape. Reading is this skill's business; the only edit it makes is the one
     row §8 adds.
   - §4(b): retire `run`. The step list has one mode, `ask` — the run stops once
     and asks before every after-landing step, a local staging step included.
     Keep the sentence that a step staging something the session already loaded
     is picked up only by a **restarted** session. Delete the "`run` — executed
     unprompted …" bullet and every later mention of a `run` step in this file
     (§4(c) "and as the `ask` step in (b)" stays true).
   - §5 gate presentation, item 5: the wave gate, the after-landing steps, the
     gates the orchestrator keeps — and the **derived priority**, stated as a
     fact with the arithmetic that produced it (which unarchived required plan's
     priority it stands on, or "requires nothing active → 10").
   - §6 rules: add that `requires:` entries are matched by folder basename, so a
     required plan is named by its `docs/plans/<date>-<name>` path as planned
     and never re-pointed when it moves to `archived/`.
   - §7 self-review: add "the derived priority equals `10 + max` over the
     `Priority` column of every unarchived `requires:` row, or `10`".
   - §8 hand-off: a new step between "Set the status" and "Mark the backlog
     items planned" — **Add the index row.** Append one row to the change-plan
     table of the base repo's `docs/plans/index.md` per
     `${CLAUDE_PLUGIN_ROOT}/assets/plan-index.md`: `Folder` the plan folder path
     relative to the repo root, `Plan` the title, `Priority` the derived
     integer, `Status` `APPROVED`, `Requires` the basenames of its `requires:`
     entries or `—`, `Backlog` its `backlog:` ids or `—`. When the file has no
     change-plan table yet, write the file's whole shape from the asset first.
     Then renumber the later steps, and in the commit step stage the plan
     folder, `docs/backlog.md` when changed, **and `docs/plans/index.md`** — the
     approval commit is decision 4's "adds the row". The commit message is
     unchanged.
   - The closing launch block: keep the folder form and add the queue form
     beneath it, so the user sees both:

     ```text
     Run in a fresh session:

     /vwf:change-execute docs/plans/<date>-<name>

     or let the queue pick it, by priority:

     /vwf:change-execute next
     ```

   - "What this skill never does": add "Edits any row of `docs/plans/index.md`
     but the one it appends — statuses are `/vwf:change-execute`'s and
     `/vwf:archive`'s".
   - The frontmatter `description` (strict YAML — keep the scalar valid): fold
     in "add its row to the plan index with a derived priority" where the
     hand-off is described.
2. **`references/plan-template.md`** —
   - Consent block: the `After landing:` row's Granted column reads `ask`; the
     paragraph below it loses the `run` sentence and says every after-landing
     step is `ask`.
   - **After landing** table: `Mode` column reads `ask`; the note below reads
     "or `none`. The run stops once and asks before every step."
   - **Launch** section: the two-form block from edit 1.
   - The closing "The two fixed final units" prose: the last paragraph's reason
     ("because a `run` step mutates the machine …") becomes "because an
     after-landing step mutates the machine rather than the tree under review,
     and a unit never reaches outside the worktree".
   - No new frontmatter field: priority lives in the index row, not the folder.
3. **`references/interview.md`** — item 16: each step is confirmed as `ask` or
   dropped; delete the `run` sentence. Item 9 or a new item under **C**: the
   derived priority is stated to the user as a fact, not asked; the user may
   name a required plan they forgot, which changes the arithmetic, and nothing
   else.

## Verification

- `mise run p:plugins:check` green.
- `command grep -n 'run / ask\|`run`step\|run — executed' plugins/vwf/skills/change-plan -r`
  returns nothing.
- `command grep -c 'plan-index.md' plugins/vwf/skills/change-plan/SKILL.md` ≥ 2
  (recall and hand-off).
- `command grep -n 'change-execute next' plugins/vwf/skills/change-plan/SKILL.md plugins/vwf/skills/change-plan/references/plan-template.md`
  hits both files.
- The SKILL.md frontmatter still parses as strict YAML:
  `mise run p:plugins:check` is what proves it.

## Guardrails

- Touch nothing outside the three owned files. `assets/plan-index.md` is U3's —
  cite it by path, describe its columns exactly as decision 1 names them, and
  never create it. `change-execute/**` is U2's.
- `plugins/**/*.md` is **not** dprint-formatted: match the surrounding fold
  width by hand.
- Strict-YAML frontmatter: a `description` with an unquoted colon-space or a
  stray backtick drops the skill silently. Keep the scalar shape it has.
- Never end a table cell in a bare asterisk; no escaped backticks inside code
  spans.
- Delete with `rm`, never `git rm`.

## Commit

`feat: change-plan — derived priority, plan-index row at hand-off, ask-only after landing`
— written by the orchestrator after the wave gate, not by the unit.
