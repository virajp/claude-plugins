# U8 — Gates

- **Wave:** 4
- **Depends on:** U7
- **Owns:** `.claude-plugin/marketplace.json`,
  `plugins/stackgen/stacks/inventory.md` (owned so the generators have a home)
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md's Consent block.

## Ruling

> **Release vwf publicly** — none — no bump; rides `20.0.0` from
> `2026-09-26-universal-packs-into-init`; tagged via `/release` (ask).

> **Release stackgen publicly** — none — no bump; rides `2.0.0` from the same
> plan; tagged via `/release` (ask).

## Edits

1. **No version edit.** Confirm vwf reads `20.0.0` and stackgen `2.0.0`; any
   other value is `UNRESOLVED:`.
2. **`mise run p:plugins:marketplace`** and **`mise run p:plugins:inventory`**;
   report any diff under `DECIDED:`.
3. **The full wave gate**, with `MISE_ENV=dev` exported.

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

`ops: mise conf.d packs — final gate` — only if a generator changed an owned
file; otherwise no commit.
