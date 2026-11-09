# U7 — Gates

- **Read first:** `index.json` `gates`.

## Ruling

> D16: U7 regenerates both [inventory and marketplace] and commits only if they
> drifted.

## Edits

1. Run `mise x -- mise run p:plugins:inventory` and
   `mise x -- mise run p:plugins:marketplace`. Keep any change they write.
2. Run every line of `gates.wave` and `gates.plan` in order, and report each
   line with its exit code.

## Verification

- Every `gates.plan` line exits 0.

## Guardrails

- Bump no plugin version; the release levels are recorded at landing.
- Edit no file by hand. A red gate line is reported, never fixed here.

## Commit

`ops: regenerate the inventory and the marketplace manifest` — only when step 1
changed a file.
