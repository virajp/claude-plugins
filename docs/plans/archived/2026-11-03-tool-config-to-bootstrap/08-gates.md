# U8 — Gates

- **Read first:** `index.json` `gates`.

## Ruling

> - D10: The plan edits no exclude. Root dprint.jsonc,
>   .config/pre-commit-config.yaml and .config/linter.yaml are managed by
>   bootstrap.

## Edits

1. Run `mise x -- mise run p:plugins:marketplace` and
   `mise x -- mise run p:plugins:inventory`. Keep what they write in the
   owned files (expected: no change, since no manifest and no pack moved).
2. Run the full wave gate: `code:lint`, `p:plugins:check`,
   `p:plugins:inventory -- --check`, `p:plugins:marketplace -- --check`.

## Verification

- Every wave-gate line is green.
- `git status --short` shows no change outside the owned files.

## Guardrails

- Bump no version; edit no exclude (D10); touch no doc.

## Commit

`ops: regenerate the marketplace and the pack inventory`
