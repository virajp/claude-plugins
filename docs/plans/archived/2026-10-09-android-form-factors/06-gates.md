# U6 — Gates

- **Wave:** 3
- **Depends on:** U5
- **Owns:** `plugins/stackgen/stacks/inventory.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md's Release levels and Wave gate sections.

## Ruling

> - Decision F8: Wave 1 lands as one commit with the regenerated inventory: the
>   orchestrator runs `mise run p:plugins:inventory` after wave 1 returns and
>   before its wave gate, and commits the inventory with the wave.

The gates unit bumps no plugin version: `/vwf:execute` writes the plan's Release
levels to `.config/releases.yaml` at landing.

## Edits

1. Run `mise run p:plugins:inventory`; keep the file if it changed.
2. Bump no plugin version: no `plugin.json`, no `package.json`, no
   `.config/releases.yaml` write, no tag.
3. Pass the full wave gate.

## Verification

- Every wave-gate line in index.md, with `MISE_ENV=dev`.

## Guardrails

- Do not touch any file outside Owns.
- A red gate line is reported as `UNRESOLVED:` with the last lines of its
  output; never fix it here.

## Commit

`ops: android form factors — gates` (only when `inventory.md` changed; else no
commit)
