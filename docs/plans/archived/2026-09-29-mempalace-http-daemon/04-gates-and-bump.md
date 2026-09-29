# U4 — Gates and bump

- **Wave:** 3
- **Depends on:** U3
- **Owns:** `plugins/vwf/.claude-plugin/plugin.json`,
  `.claude-plugin/marketplace.json`
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md's Consent block.

## Ruling

> **Release vwf publicly** — patch — `20.0.0` → `20.0.1`, by editing
> `plugins/vwf/.claude-plugin/plugin.json`.
>
> **Release stackgen publicly** — none — untouched.
>
> **Release site publicly** — yes — `site-v1.1.47`; `site/package.json` already
> reads `1.1.47`, so no version bump.

## Edits

1. **`plugins/vwf/.claude-plugin/plugin.json`** — `version` `20.0.0` → `20.0.1`.
   Any start value other than `20.0.0` is `UNRESOLVED:`.
2. **`mise run p:plugins:marketplace`** — the vwf ref renames itself to
   `vwf-v20.0.1`; report the diff under `DECIDED:`.
3. **Confirm, do not edit:** `site/package.json` reads `1.1.47` and
   `git tag -l site-v1.1.47` is empty — otherwise `UNRESOLVED:`.
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

`ops: vwf patch — mempalace HTTP daemon` — written by the orchestrator after the
wave gate.
