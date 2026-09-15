# U4 — docs

- **Wave:** 2
- **Depends on:** U1, U2, U3
- **Owns:** `.claude/skills/vwf-plugin/**`, `site/src/content/docs/**`,
  `readme.md`, `CLAUDE.md`, `docs/plans/index.md`,
  `docs/memory/decisions/2026-09-15-plan-index-queue.md`
- **Model:** opus
- **Read first:** `index.md`'s Goal, Facts and Assumed decisions; every
  `DOCS FALSIFIED:` line the orchestrator passes from U1–U3; the landed
  `plugins/vwf/assets/plan-index.md`, `skills/change-plan/SKILL.md` §4(b) and
  §8, `skills/change-execute/SKILL.md` §1 and §7 and `references/queue.md`, and
  `skills/archive/SKILL.md` (read only — describe them, never edit them); then
  each owned file the survey pointed at.
- **Lazy-load:** `${CLAUDE_PLUGIN_ROOT}/skills/docs-sync/SKILL.md`;
  `${CLAUDE_PLUGIN_ROOT}/assets/memory.md`;
  `docs/memory/decisions/2026-09-13-vwf-process.md` (the record the new one
  reverses in part).

## Ruling

The reversal, from `index.md`'s Goal: "The decision record
`docs/memory/decisions/2026-09-13-vwf-process.md` and the shipped `/vwf:archive`
skill rule that `docs/plans/index.md` lists `/vwf:plan`'s flat cycle plans only,
and that change-plan folders are **never** listed there. This plan reverses
that: change plans get their own table in the same file. The cycle-plan table is
untouched."

Decision 13: "`ask` only. change-plan's §4(b) offers no `run`; the template's
After landing table reads `ask`; change-execute stops once before every step. A
`run` in an older folder is read as `ask`."

Decisions 1–14 as the facts the docs describe — quoted in `index.md`; describe,
never restate differently.

## Edits

1. Run `vwf:docs-sync` over the run's branch delta; apply its findings within
   the owned paths.
2. The passages the survey found:
   - `.claude/skills/vwf-plugin/references/docs-tree.md:39-51` — the two forms
     under `docs/plans/`: folders are now listed in the change-plan table of
     `docs/plans/index.md`; `/vwf:archive` fixes the row for either shape; the
     backlog sits beside the index.
   - `.claude/skills/vwf-plugin/references/skills-and-agents.md:38,45-46` — the
     archive row loses "the index never touched — change plans are not listed
     there"; the change-plan row gains the index row and the derived priority;
     the change-execute row gains `next`, the claim, the landing row, and "asks
     before every after-landing step".
   - `.claude/skills/vwf-plugin/SKILL.md:60-61,192-197` — the pair's summary:
     `next`, the queue, ask-only.
   - `site/src/content/docs/plugins/vwf.md` — `#vwfchange-plan` (`:2262-2282`):
     the hand-off is five steps (status, index row with derived priority,
     backlog, commit and push, launch line), and the two launch forms;
     `#vwfchange-execute` (`:2284-2304,2336-2350`): the `next` argument and what
     it prints, the claim as a pushed commit before the worktree, the
     parallel-session story (a rejected push re-pulls and re-picks; a `RUNNING`
     row is never taken; a stale claim is reset by hand), the landing row and
     the sweep, ask-only after-landing; `#vwfarchive` (`:1998-2024`): folders
     are listed, the row rule, basename matching; the command table `:811`;
     `:353-355,468,502-504,2160-2188,2648,2672-2673,2736` — recheck each, edit
     only what is falsified.
   - `site/src/content/docs/how-to/operate/ad-hoc-change.md:13-17,136-166,195-197,211-231`
     — the hand-off, a new "or `next`" launch, the landing, the after-landing
     asks, the stale-claim reset.
   - `site/src/content/docs/how-to/index.md:67-68`, `readme.md:231-234` — the
     pair's summary sentence.
   - `CLAUDE.md:49-53` — the pair's paragraph: `/vwf:change-execute <folder>` or
     `next`; `:357` and the "Where the detail lives" row — "carries
     `mise run p:plugins:local` as a `run` step" becomes an `ask` step; the "A
     release is two stages" paragraph in CI & Releases says change-execute runs
     `p:plugins:local` "as the plan's after-landing `run` step" — now asks
     before it.
   - `docs/plans/index.md` — rewrite to the asset's shape: the intro from
     `plan-index.md`, the cycle-plan table (empty — this repo has none), and the
     change-plan table carrying the one row already there — this plan's, added
     by hand at approval in the old column order, `APPROVED`, priority `10`.
     Keep the row's status as you find it: the orchestrator running this plan
     predates the claim and landing logic, so nothing flips it; the user resets
     it after landing by hand or with the staged `/vwf:archive`. Delete the
     "written by hand today … a later change" paragraph and the "Nothing is in
     flight" sentence.
3. Every `DOCS FALSIFIED:` line U1–U3 returned.
4. **`docs/memory/decisions/2026-09-15-plan-index-queue.md`** — new, per
   `assets/memory.md`'s decision shape: what was decided before (2026-09-13: the
   index is the cycle-plan index; change plans never listed; after-landing
   `run`/`ask`), what changed (the change-plan table, the claim as a pushed
   commit, `next`, derived priority in blocks of ten, ask-only after landing),
   the reversal named as one, decisions 3, 5, 6, 7, 8, 9, 10, 11 and 13 with
   their rejected alternatives, and the parked items copied from `index.md`.

## Verification

- `mise run p:site:check` green.
- `mise run p:plugins:check` green.
- `mise run code:precommit` green.
- `command grep -rn 'never listed\|not listed there\|run step' .claude/skills/vwf-plugin site/src/content/docs readme.md CLAUDE.md`
  — every remaining hit is read and is not about change plans or after-landing
  steps.
- `command grep -n 'change-execute next' site/src/content/docs/plugins/vwf.md site/src/content/docs/how-to/operate/ad-hoc-change.md CLAUDE.md`
  — each hits.
- `command grep -n '| Folder | Plan | Priority | Status | Requires | Backlog |' docs/plans/index.md`
  hits.
- `command test -f docs/memory/decisions/2026-09-15-plan-index-queue.md`.

## Guardrails

- Touch nothing outside the owned paths; never edit `plugins/**` — a wrong
  passage there is a `GAP:` naming file and line.
- `CLAUDE.md`, `readme.md`, `.claude/**`, `site/**` and `docs/**` markdown
  **are** dprint-formatted: run `mise run code:format --fix` over the files you
  edited only. Widening a table cell in `CLAUDE.md` or `readme.md` re-pads the
  whole table — that is expected.
- `site/src/content/docs/**` links are checked by `p:site:check`: a new anchor
  you cite must exist.
- Never end a table cell in a bare asterisk; no escaped backticks inside code
  spans; no code span that begins with a markdown heading marker.
- Delete with `rm`, never `git rm`.

## Commit

`docs: plan index queue — manual, repo docs, this repo's index, decision record`
— written by the orchestrator after the wave gate, not by the unit.
