# U4 — Gates

- **Wave:** 3
- **Depends on:** U3
- **Owns:** `.claude-plugin/marketplace.json`,
  `plugins/stackgen/stacks/inventory.md` (owned so the generators have a home;
  expected unchanged)
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md's Consent block.

## Ruling

> **Release stackgen publicly** — none — no bump; rides stackgen `1.34.0`, which
> `2026-09-26-mise-conf-d-layout` bumps.

## Edits

1. **No version edit.** Confirm `plugins/stackgen/.claude-plugin/plugin.json` is
   untouched on this branch.
2. **`mise run p:plugins:marketplace`** and **`mise run p:plugins:inventory`**;
   report any diff under `DECIDED:`.
3. **The full wave gate.**

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

- No tag, no release task, no commit. Touch no doc or payload. Delete nothing.

## Commit

`ops: mise lock sidecar exclusions — final gate` — only if a generator changed
an owned file; otherwise no commit.
