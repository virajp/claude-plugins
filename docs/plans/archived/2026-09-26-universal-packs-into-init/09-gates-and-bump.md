# U9 — Gates and bump

- **Wave:** 5
- **Depends on:** U8
- **Owns:** `plugins/vwf/.claude-plugin/plugin.json`,
  `plugins/stackgen/.claude-plugin/plugin.json`,
  `.claude-plugin/marketplace.json`, `plugins/stackgen/stacks/inventory.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md's Consent block.

## Ruling

> **Release vwf publicly** — major — `19.47.0` → `20.0.0`, bumped by editing
> `plugins/vwf/.claude-plugin/plugin.json`; no release step, the chain ships
> after B2.

> **Release stackgen publicly** — major — `1.34.0` → `2.0.0`, bumped by editing
> `plugins/stackgen/.claude-plugin/plugin.json`; no release step, ships after
> B2.

## Edits

1. **vwf `plugin.json`** `19.47.0` → `20.0.0`; any other start value is
   `UNRESOLVED:` (B1 sets `19.47.0`).
2. **stackgen `plugin.json`** `1.34.0` → `2.0.0`; any other start value is
   `UNRESOLVED:`.
3. **`mise run p:plugins:marketplace`** and **`mise run p:plugins:inventory`** —
   `inventory.md` is expected to change (the universal tier leaves); report the
   diff under `DECIDED:`.
4. **The full wave gate**, with `MISE_ENV=dev` exported.

## Verification

- `mise run p:plugins:marketplace -- --check` green
- `mise run p:plugins:inventory -- --check` green
- `mise run p:plugins:check` green
- `mise run p:plugins:shellcheck` green
- `pnpm vitest run` green
- `mise run code:precommit` green
- `mise run p:site:check` green
- `git status --porcelain` shows nothing outside the owned paths, nothing
  staged.

## Guardrails

- No tag, no release task, no commit. Touch no doc, skill or pack. Delete
  nothing.

## Commit

`ops: vwf 20.0.0, stackgen 2.0.0 — universal packs into init` — written by the
orchestrator after the wave gate.
