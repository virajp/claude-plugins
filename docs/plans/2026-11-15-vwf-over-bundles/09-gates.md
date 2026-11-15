# U9 — Gates

- **Read first:** `index.json` of this folder, `gates` and `release_levels`.

## Ruling

No plugin manifest or marketplace input changes. U6 regenerated the inventory
(D21). This unit regenerates nothing.

## Edits

1. Run `mise x -- mise run p:plugins:marketplace -- --check` and
   `mise x -- mise run p:plugins:inventory -- --check`. Both must pass with no
   change. If one fails, report it as a question; do not regenerate.
2. Run the plan gate of `gates.plan`, and K1 of `gates.keeps`.

## Verification

- The commands above pass.

## Guardrails

- Edit no file. A failure is a question, never a fix in this unit.

## Commit

No commit when no file changes.
