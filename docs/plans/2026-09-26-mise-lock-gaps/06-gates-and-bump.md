# U6 — Gates and bump

- **Wave:** 4
- **Depends on:** U5
- **Owns:** `plugins/stackgen/.claude-plugin/plugin.json`,
  `plugins/vwf/.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`,
  `plugins/stackgen/stacks/inventory.md` (owned so the generator has a home;
  expected unchanged)
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md's Consent block.

## Ruling

The Release rows, quoted:

> **Release stackgen publicly** — minor — `1.33.0` → `1.34.0`, bumped by editing
> `plugins/stackgen/.claude-plugin/plugin.json`; no release step, the tag waits.

> **Release vwf publicly** — patch — `19.46.0` → `19.46.1`, bumped by editing
> `plugins/vwf/.claude-plugin/plugin.json`; no release step, the tag waits.

> **Release site publicly** — none — not this time.

## Edits

1. **stackgen `plugin.json`** — `1.33.0` → `1.34.0`; any other starting value is
   `UNRESOLVED:`.
2. **vwf `plugin.json`** — `19.46.0` → `19.46.1`; any other starting value is
   `UNRESOLVED:`.
3. **`mise run p:plugins:marketplace`** and **`mise run p:plugins:inventory`**;
   report any diff under `DECIDED:`.
4. **The full wave gate**, below, with `MISE_ENV=dev` exported.

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

`ops: stackgen 1.34.0, vwf 19.46.1 — mise lock gaps` — written by the
orchestrator after the wave gate.
