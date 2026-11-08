GAP 2026-11-03 ★4 | bootstrap dry-run trust | open — doctor, setup and init
execute bootstrap's unpinned main branch, and mise trust is not tied to file
content — the user must run the pin request in the bootstrap repo | the plan
could not edit bootstrap

**Source plan** `2026-11-03-tool-config-to-bootstrap` (decision D46, gaps G9 to
G12, G15, G16).

Fact, probed on mise 2026.10.25: mise auto-trusts a repo on first run, and the
trust gate does not tie to file content. So a hostile branch in a trusted repo
runs its `setup:configs` task from a routine check. A dry-run of bootstrap
executes repo-task code and fetched code, and it runs bootstrap's `main` with no
pin.

Ruling D46 (user, 2026-11-05):

- The networked dry-run runs only in explicit runs: doctor full mode and
  `/vwf:setup`, which includes setup's second shape check, init's adoption
  check, init's green check inside the consent and init's survey of a shaped
  repo.
- Each place discloses it. Setup applies its trust check and init prints a line
  before the run.
- Rejected: keep the dry-run in the baseline and in recall; require
  content-tied trust (mise gives none).
- `/vwf:plan` and `/vwf:execute` also run doctor, so an unattended pipeline can
  run unpinned bootstrap. Doctor discloses this and behavior stays.

Open: the fix is a reviewed-commit pin in bootstrap. The request is written at
`docs/prompts/2026-11-05-reviewed-commit-pin.md` in the bootstrap repo, and the
user has to run it there. At 2026-11-06 the bootstrap readme names no pin.
