# U6 — Gates

- **Wave:** 3
- **Depends on:** U5
- **Owns:** —
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md's Release levels and Wave gate sections.

## Ruling

> - Decision H8: No review row: prose only.

The gates unit bumps no version and runs no generator: this plan changes no
generator input. `/vwf:execute` writes the plan's Release levels to
`.config/releases.yaml` at landing.

## Edits

1. Edit no file. Pass the full wave gate.

## Verification

- Every wave-gate line in index.md, with `MISE_ENV=dev`.

## Guardrails

- A red gate line is reported as `UNRESOLVED:` with the last lines of its
  output; never fix it here.

## Commit

none — this unit edits no file.
