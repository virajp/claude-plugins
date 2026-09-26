# U8 — Gates and bump

- **Wave:** 4
- **Depends on:** U7
- **Owns:** `plugins/stackgen/.claude-plugin/plugin.json`,
  `plugins/vwf/.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`,
  `plugins/stackgen/stacks/inventory.md` (owned so the generator has a home)
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md's Consent block.

## Ruling

> **Release stackgen publicly** — minor — `1.33.0` → `1.34.0`, bumped by editing
> `plugins/stackgen/.claude-plugin/plugin.json`; no release step, ships after
> B2.

> **Release vwf publicly** — minor — `19.46.0` → `19.47.0`, bumped by editing
> `plugins/vwf/.claude-plugin/plugin.json`; no release step, ships after B2.

> **Release site publicly** — none — not this time.

## Edits

1. **stackgen `plugin.json`** `1.33.0` → `1.34.0`; any other start value is
   `UNRESOLVED:`.
2. **vwf `plugin.json`** `19.46.0` → `19.47.0`; any other start value is
   `UNRESOLVED:`.
3. **`mise run p:plugins:marketplace`** and **`mise run p:plugins:inventory`**;
   report any diff under `DECIDED:`.
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

- No tag, no release task, no commit.
- Touch no doc, skill or task file. Delete nothing.

## Commit

`ops: stackgen 1.34.0, vwf 19.47.0 — mise conf.d layout` — written by the
orchestrator after the wave gate.
