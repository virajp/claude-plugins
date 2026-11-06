# U4 — Gates

## Ruling

> D8: No. Every owned file is prose, so the plan lands no runnable code and the
> wave review is the check.

## Edits

1. Run `mise x -- mise run p:plugins:marketplace -- --check`. No plugin manifest
   changes in this plan, so expect no change to `.claude-plugin/marketplace.json`.
2. Run the full wave gate over the tree.

## Verification

- `mise x -- mise run code:lint`
- `mise x -- mise run p:plugins:check`

## Guardrails

- Bump no version. The plan's `release_levels` are what `/vwf:execute` records at
  landing.
- If nothing changed, return `CHANGED: none`.

## Commit

`ops: pass the gates of the execute rule fixes`
