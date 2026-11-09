# U4 — Gates

- **Read first:** `index.json` `gates`.

## Ruling

> D4: … U2 runs mise x -- mise run p:plugins:inventory as its last step.

> D9: … runs mise x -- mise run p:plugins:marketplace as its last step.

## Edits

1. Run `mise x -- mise run p:plugins:inventory` and
   `mise x -- mise run p:plugins:marketplace`. Keep any change they write.
2. Run every line of `gates.wave` and `gates.plan` in order, and report each
   line with its exit code.

## Verification

- Every `gates.plan` line exits 0.

## Guardrails

- Bump no plugin version. Edit no file by hand; a red gate line is reported.

## Commit

`ops: regenerate the inventory and the marketplace manifest` — only when step 1
changed a file.
