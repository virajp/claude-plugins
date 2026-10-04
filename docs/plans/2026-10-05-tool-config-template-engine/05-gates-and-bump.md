# U4 — Gates and bump

- **Wave:** 4
- **Depends on:** U3
- **Owns:** none — this unit changes no file (D10)
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md's Consent block.

## Ruling

> D10 — stackgen 3.0.0 is already a major above `stackgen-v2.0.0`; the modules
> change nothing a user sees; the chain releases after plan 4. No after-landing
> step.

## Edits

1. Confirm `plugins/stackgen/.claude-plugin/plugin.json` reads `3.0.0` and the
   highest `stackgen-v*` tag is `stackgen-v2.0.0`; if either differs, report it
   as `GAP:` and bump nothing.
2. Run the full wave gate.

## Verification

- The full wave gate, green — this report is the run's final gate.
- `DECIDED:` line names stackgen as left at 3.0.0, and why.

## Guardrails

- No tag, no `p:plugins:release`, no version edit.
- Delete with `rm`, never `git rm`.

## Commit

none — nothing changes; if the gate needed a fix, `fix: <what the gate caught>`.
