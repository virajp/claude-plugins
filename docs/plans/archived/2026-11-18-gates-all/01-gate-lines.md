# U1 — The default gate lines take --all

- **Read first:** every owned file, top to bottom, before editing.
- **Lazy-load:** `/Users/virajpatel/Projects/github.com/virajp/bootstrap/docs/memory/gaps/2026-11-15-vwf-gates-all-parked.md`
  only if a ruling below is not clear.

## Ruling

Quoted from the `decisions` list of `index.json`:

- **D1:** The default unit gate is `mise x -- mise run code:format --all`, and
  the default wave gate is `mise x -- mise run code:lint --all`. After
  bootstrap 4.0.0, `code:format` and `code:lint` examine only the uncommitted
  files when they get no files and no `--all`. The wave gate runs before wave 1
  and after the units commit, on a clean worktree, so without `--all` it
  examines nothing.
- **D2:** The plan gate stays `mise x -- mise run code:precommit`. It always
  runs pre-commit with `--all-files` and takes no flag.
- **D3:** `/vwf:execute` runs the gate lines that the folder records and
  nothing it infers, so a change to the default lines is enough. Only the
  example line of `execute/references/action-log.md` changes, to the new wave
  gate line.
- **D4:** The plans that are already queued keep their gate lines. No unit
  edits a folder under `docs/plans/`.
- **D5, D23:** This plan requires nothing. This repo runs bootstrap 4.1.1
  (commit df7ea322), so `--all` works here.
- **D6:** Keep `mise run code:format` and `mise run code:lint` as the daily
  commands. Correct their comments to say that they examine the uncommitted
  files (staged, changed and new). Add one line each that shows the same
  command with `--all`, with a comment that says it examines every file of the
  repository.
- **D8:** No review unit: the plan changes prose only.
- **D10:** Always propose `--all` when `mise tasks ls --hidden` lists
  `code:format` and `code:lint`. This case is accepted: after R3a, vwf
  supports only a repo on the bootstrap 4.0.0 contract, and `/vwf:doctor`
  reports an old-form repo as blocking (R3a D26). Add no `#USAGE` test to
  either planner.
- **D19 (replaces the glob of D13):** U1 owns
  `plugins/vwf/skills/init/assets/hygiene/**` and applies the D6 and D14
  edits to each file there that holds the daily-checks block of
  `mise run code:format` and `mise run code:lint`, found by content. R3b
  adds a one-branch variant of CONTRIBUTING.md under a name it does not fix.
  If only CONTRIBUTING.md holds the block, edit that one file and report so in
  a DECIDED line.
- **D21:** Each file that holds the daily-checks block keeps exactly two bare
  daily lines (`mise run code:format` and `mise run code:lint`).
  `init/references/readme-and-license.md` only names the gate tasks: do not
  edit it.
- **D14:** In each file of D19, rewrite the sentence above the
  daily-checks block ("there is nothing to remember beyond running them
  before you push"): while you work, the bare commands examine the
  uncommitted files; before you push, run the `--all` forms, which examine
  every file of the repository. This widens D6 by this one sentence.
- **D17:** The queued plan R4b (`2026-11-15-config-format-28`) also edits
  `gates-consent.md`, in a different passage. Edit only the passages named
  here; R4b runs after this plan.
- **D11:** CONTRIBUTING.md shows the two `--all` lines. A repo that gets the
  asset adopted bootstrap 4.0.0 through `/vwf:init`, so it has the new tasks.
- **D22:** Move the comment column of the whole daily-checks `sh` block, so
  that all comments align. On the lines you do not otherwise change
  (`code:sec`, `code:precommit`), only whitespace changes.

## Edits

1. **`plugins/vwf/skills/change-plan/references/gates-consent.md`** — in the
   table of "(a) The three gates", the `gates.unit` default becomes
   `mise x -- mise run code:format --all` and the `gates.wave` default becomes
   `mise x -- mise run code:lint --all`. The `gates.plan` row stays. Re-pad the
   table by hand, because no formatter runs on `plugins/**/*.md`. Under the
   table, add one bullet after the plan-gate bullet: the unit and wave lines
   take `--all` because, with no files and no `--all`, `code:format` and
   `code:lint` examine only the uncommitted files, and the wave gate runs on a
   clean worktree before wave 1 and after each wave, where that set is empty.
2. **`plugins/vwf/skills/plan/references/plan-doc.md`** — in "The three
   gates" paragraph (about lines 30-40), propose
   `mise x -- mise run code:format --all` for the unit gate and
   `mise x -- mise run code:lint --all` for the wave gate. Add the same reason
   as edit 1, in one sentence. Keep the fold width of the paragraph.
3. **`plugins/vwf/assets/templates/plan-folder.md`** — in both `index.json`
   samples (the change plan, about lines 88-89, and the cycle plan, about lines
   198-199), the `unit` line becomes `"mise x -- mise run code:format --all"`
   and the `wave` line becomes `"mise x -- mise run code:lint --all"`. The
   `plan` lines stay.
4. **`plugins/vwf/skills/execute/references/action-log.md`** — the example
   line (about line 100) becomes
   `log.mjs run --tier wave -- mise x -- mise run code:lint --all > /tmp/g.log 2>&1`.
5. **`plugins/vwf/skills/init/assets/hygiene/**`** — find each file that
   holds the daily-checks block, by content (D19): CONTRIBUTING.md, and the
   one-branch variant of R3b when it has the block. In the `sh` block of
   daily checks (about lines 70-75 of CONTRIBUTING.md), change the comments of
   `mise run code:format` and `mise run code:lint` to say that they examine
   the uncommitted files (staged, changed and new). Add
   `mise run code:format --all` and `mise run code:lint --all`, each with a
   comment that says it examines every file of the repository. Keep the
   comment column aligned (D22). Rewrite the sentence above the block per D14.
   Change nothing else in the file.

## Verification

- `mise x -- mise run code:format --all` and `mise x -- mise run code:lint --all`
  pass.
- `command grep -rnE 'mise run code:(format|lint)' plugins/vwf` shows `--all`
  on each default gate line, and exactly two bare daily lines in each file
  of D19 (D6, D21).
- `command grep -rn 'code:precommit --all' plugins/vwf` has no hit (D2).

## Guardrails

- Touch nothing outside the owned paths. Do not edit `plugins/stackgen/` (D7)
  or any folder under `docs/plans/` (D4).
- In each file of D19, change only the `sh` block of daily checks and the
  sentence above it (D14). Other plans (R3b) own its branch and landing
  passages. Edit no other file of `hygiene/`.
- Delete with `rm`, never `git rm`. Do not run a formatter with `--fix`, and
  do not run `git checkout` or `git restore`.

## Commit

`fix: the default vwf gate lines examine every file with --all`
