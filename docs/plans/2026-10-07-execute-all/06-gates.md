# U6 — Gates

- **Wave:** 3
- **Depends on:** U5
- **Owns:** `plugins/vwf/.claude-plugin/plugin.json`,
  `.claude-plugin/marketplace.json` (both expected unchanged)
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md's Consent block.

## Ruling

> No bump: plan 1 took vwf to `21.0.0`, already a major above the last tag
> `vwf-v20.0.1`. Release none.

## Edits

1. Confirm `plugins/vwf/.claude-plugin/plugin.json` reads `21.0.0`; change
   nothing.
2. Run the full wave gate.

## Verification

- The full wave gate, green — this report is the run's final gate.

## Guardrails

- No tag, no `p:plugins:release`, no `p:plugins:local`, no `p:site:version`.

## Commit

none — when nothing changed, the unit commits nothing; otherwise
`ops: regenerate the marketplace manifest`
