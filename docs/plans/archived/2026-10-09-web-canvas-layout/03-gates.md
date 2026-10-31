# U3 — Gates: the full wave gate

- **Wave:** 3
- **Depends on:** U2
- **Owns:** `.claude-plugin/marketplace.json` (generated; regenerated only)
- **Model:** opus
- **Kind:** edit
- **Read first:** none — this unit runs commands.
- **Lazy-load:** none.

## Ruling

From index.md, the Gates unit contract:

- Only this unit regenerates a generated file. No plugin version is bumped; the
  Release levels table is what `/vwf:execute` records at landing, and the
  release is a later hand step.

## Edits

1. **Regenerate the marketplace manifest** — run
   `mise run p:plugins:marketplace`. No version changed, so no diff is expected.
   Do not hand-edit `.claude-plugin/marketplace.json`.
2. **Run the full gate** — the wave gate lines below.

## Verification

- `mise run p:plugins:check` — green.
- `mise run p:plugins:marketplace -- --check` — green.
- `mise run p:site:check` — green.

## Guardrails

- Do not change any file outside the Owns list.
- Do not bump a plugin version in any `plugin.json`.
- Do not hand-edit a generated file.
- Delete with `rm`, never `git rm`.

## Commit

`ops: run the wave gate for the web canvas layout`
