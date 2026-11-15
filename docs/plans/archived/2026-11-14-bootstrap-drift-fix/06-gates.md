# U6 — Gates

- **Read first:** `index.json` of this folder, `gates` and `release_levels`.

## Ruling

The plan names no generator: no plugin manifest, stack file or marketplace
input changes, so `p:plugins:marketplace` and `p:plugins:inventory` have
nothing to regenerate. No unit bumps a version.

## Edits

1. Run `mise x -- mise run p:plugins:marketplace -- --check` and
   `mise x -- mise run p:plugins:inventory -- --check`. Both must pass with no
   change. If one fails, report it as a question; do not regenerate.
2. Run `mise x -- mise run p:plugins:check`. It must pass.
3. Run the full wave gate, `mise x -- mise run code:lint`.

## Verification

- The three commands above pass.

## Guardrails

- Edit no file. A failure is a question, never a fix in this unit.

## Commit

No commit when no file changes.
