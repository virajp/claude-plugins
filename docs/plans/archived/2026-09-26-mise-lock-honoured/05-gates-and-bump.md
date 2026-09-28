# U5 — Gates and bump

- **Wave:** 4
- **Depends on:** U4
- **Owns:** `plugins/stackgen/.claude-plugin/plugin.json`,
  `.claude-plugin/marketplace.json`, `plugins/stackgen/stacks/inventory.md`
  (owned so the generator has a home; expected unchanged)
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md's Consent block.

## Ruling

The Release rows, quoted:

> **Release stackgen publicly** — minor — `1.32.0` → `1.33.0`, bumped by editing
> `plugins/stackgen/.claude-plugin/plugin.json`; tagged via `/release` (ask).

> **Release site publicly** — none — not this time.

> **Release vwf publicly** — none — untouched.

## Edits

1. **`plugins/stackgen/.claude-plugin/plugin.json`** — `version` `1.32.0` →
   `1.33.0`. If it reads anything but `1.32.0`, stop with `UNRESOLVED:`.
2. **`mise run p:plugins:marketplace`** and **`mise run p:plugins:inventory`** —
   run both; report any diff under `DECIDED:`.
3. **The full wave gate**, below.

## Verification

- `mise run p:plugins:marketplace -- --check` green
- `mise run p:plugins:inventory -- --check` green
- `mise run p:plugins:check` green
- `mise run p:plugins:shellcheck` green
- `pnpm vitest run` green
- `mise run code:precommit` green
- `mise run p:site:check` green
- `git status --porcelain` shows nothing outside the owned paths, and nothing
  staged.

## Guardrails

- No tag, no release task, no commit.
- Touch no doc, skill or task file.
- Delete nothing.

## Commit

`ops: stackgen 1.33.0 — mise lock honoured` — written by the orchestrator after
the wave gate.
