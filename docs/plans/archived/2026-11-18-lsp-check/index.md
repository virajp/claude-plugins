# Plan — Doctor and execute run bootstrap's LSP check, and consent.lsp is retired (2026-11-18)

## Goal

After this plan lands, `/vwf:doctor` and the start of `/vwf:execute` run
bootstrap's `code:lsp:check`. A plan with a code unit stops when the target
repo does not have the task, or when the check fails, and the user fixes it
before the run continues. `consent.lsp` is retired, and `/vwf:plan` no longer
asks the LSP question. The request is item 3 of the bootstrap prompt
`docs/prompts/2026-11-18-claude-plugins-bootstrap-4.md` (bootstrap gap
`2026-11-14-plugins-use-bootstrap-lsp-parked.md`, the doctor and execute
part), backlog item B150, and this repo's parked gap
`docs/memory/gaps/2026-11-13-execute-lsp-check-parked.md`.

**Reversal (D12):** the parked gap and B150 said that `installed` stops the
run, and `proceed without` writes a gap and continues. The user reversed it on
2026-11-18: a missing server, a missing task or a failed check always stops a
plan with a code unit, and no consent applies.

## Facts the survey established

- `code:lsp:check` (bootstrap's mise tool) reads `bootstrap lsp --json`. For
  each server it prints `<server>: <path>`, or
  `<server>: <command> not found - <fix>`. It exits 0 when each server
  resolves or the repo has no server, 1 when a server is missing, and 2 with
  no engine or no `.config/bootstrap/`. The fixes are
  `run MISE_ENV=dev mise install` and "install the Xcode Command Line Tools
  (xcode-select --install) or Xcode" for `sourcekit-lsp`.
- This repo runs bootstrap 4.1.1; `mise run code:lsp:check` passes here
  (`typescript-lsp`).
- `plugins/vwf/skills/doctor/scripts/checks.mjs` runs the blocking checks of
  doctor; its header says "no LSP (parked)". Rows are
  `{rule, severity, project, subject, message, remedy}`; the severities used
  are `blocking`, `degraded` and `info`. Exit 1 only on a blocking row.
- `start.mjs` imports `runChecks` from the doctor library, and keeps only the
  blocking and unknown-language rows in `findings` (about line 633).
  `has_code_unit` is in its result.
- `execute/references/preflight.md:68-71` and `setup.md:116-118` park the LSP
  step.
- `consent.lsp` is required on a cycle plan by
  `plan-management/scripts/lib/schema.mjs:83`, with the values `installed` and
  `proceed without`. `/vwf:plan` (SKILL.md about 182-191) and item 9a of
  `assets/plan-interview.md` ask for it.
- `scripts/src/doctor-checks.test.ts` stubs `mise` on a temporary `PATH`.
- R5b (`2026-11-15-vwf-over-bundles`) U4 owns `plugins/vwf/skills/doctor/` and
  its tests, and changes the doctor LSP rows to the `lspServers` of
  `vwf-tools`.
- Resolved gap records end their header with `resolved <date> by <plan>` and
  have a `-resolved.md` name.

## Unit contract

Every unit prompt carries, in order: its ruling quoted from this plan, its
owned paths plus "touch nothing outside this list", the facts section, the
plan's shared files, and the return block below. A unit never bumps a version,
never runs a generator, never edits a doc, never adds a dependency the plan
does not list, never commits. A unit deletes with plain `rm`, never `git rm` —
it stages nothing. A unit never writes a lock file with Write, Edit, `sed` or a
script.

A unit returns exactly this block and nothing else — no file contents, no diff:

    CHANGED: <path> — <one line>            (one per file)
    DECIDED: <what> — <why>                 (choices made inside scope, or none)
    DOCS FALSIFIED: <path> — <passage>      (reported, never edited; or none)
    QUESTION Q<n>: <the question, readable alone>
    OPTIONS Q<n>: <option 1, the recommendation> — <consequence> | <option 2> — <consequence> [| <option 3> | <option 4>]
    WHY Q<n>: <path:line or plan section> — <why the plan does not decide it>

The three QUESTION lines repeat per question, `n` counting from 1 in the
block, with two to four options; a block with no question carries the one
line `QUESTION: none`. A unit completes every edit that does not depend on an
answer, then returns all its open questions in one block. Its edits stay
uncommitted in the worktree.

## Out of scope

- The stackgen part of bootstrap gap `plugins-use-bootstrap-lsp`
  (`lspServers` from `bootstrap lsp --json`): R5a owns it.
- The doctor rows that compare the `lspServers` of `vwf-tools` with
  `bootstrap lsp --json`: R5b owns them.
- The `consent.lsp` keys of folders that already exist: they stay, and no
  script reads them (D5).

## Parked

None.

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the run's worktree — cut from the integration branch — can see it.

Run in a fresh context — a fresh session, or a runner that `all` dispatches —
whichever kind the plan is:

/vwf:execute docs/plans/2026-11-18-lsp-check

or let the queue pick it, by priority:

/vwf:execute next

or run every runnable plan, highest priority first:

/vwf:execute all
