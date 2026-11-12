# U7 — Gates

- **Read first:** `.claude-plugin/marketplace.json`.

## Ruling

> D14: "the last two units are the fixed docs unit and the fixed gates unit."

No unit bumps a version; the plan's `release_levels` are what `/vwf:execute`
records at landing.

## Edits

1. Run `mise x -- mise run p:plugins:marketplace` and
   `mise x -- mise run p:plugins:inventory`. Keep what they write; expect no
   change, because no manifest and no pack changes.
2. Pass the full wave gate.

## Verification

- `mise x -- mise run p:plugins:marketplace -- --check`
- `mise x -- mise run p:plugins:inventory -- --check`
- `mise x -- mise run code:lint`
- `mise x -- mise run p:plugins:check`

## Guardrails

- Edit no file by hand; only the generators write.
- Run no after-landing step.

## Commit

`ops: regenerate the marketplace and the inventory`
