# Decision — a bare `mise use` is forbidden; config first, then `mise install`

**Date** 2026-10-01 · **Branch** `2026-10-01-tool-config-script-mise` · **Plan**
[`docs/plans/2026-10-01-tool-config-script-mise/`](../../plans/2026-10-01-tool-config-script-mise/index.md)
· **Supersedes** the `mise use` remedies `/vwf:doctor` and the claude-code pack
printed, and B75 item 5

## What was decided before

Nothing ruled on it. `/vwf:doctor`'s missing-tool and missing-graphify remedies,
and the claude-code design pack's node install, all printed a `mise use` line.

## What changed

- **D13 — the ban.** A tool is entered into the config first — its
  `conf.d/tools*.toml` file, through `/stackgen:tool-config mise add-tool` or by
  hand — then installed with `mise install`. A bare `mise use` writes a pin
  nobody reviewed into the top-level config this layout keeps settings-only,
  outside every block. Stated in the repo-local mise skill, the tools asset
  headers and `references/mise.md`; doctor's remedies now name the pin and
  `mise install`.
- **Checker rule 17.** Every `mise use` under a plugin root, dot directories
  included, fails with a line number, whatever follows it — `-g`, `--global` and
  the rest — unless the line forbids it: `never` or `bare` right before it,
  `is never` or `— never` right after.

## The alternatives rejected

- **Doctrine only, no checker rule** — a remedy line is copied by whoever reads
  it; only a gate keeps one from coming back.
- **Exempt `-g`** — a global pin outside any reviewed file is the same defect
  one level up.
