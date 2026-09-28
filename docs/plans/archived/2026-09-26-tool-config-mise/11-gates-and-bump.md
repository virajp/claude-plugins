# U11 — Gates, pack bumps and plugin versions

- **Wave:** 5
- **Depends on:** U10
- **Owns:** `plugins/stackgen/.claude-plugin/plugin.json`,
  `plugins/vwf/.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`,
  `plugins/stackgen/stacks/inventory.md`, the `version:` line of the five packs'
  `pack.yaml` (pnpm, swiftlint, fnox, doppler, swiftui), every
  `plugins/stackgen/stacks/bundles/*.md` pin naming them
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md's Consent block.

## Ruling

> **Release stackgen publicly** — major — `1.34.0` → `2.0.0`, by editing
> `plugins/stackgen/.claude-plugin/plugin.json`; no release step, the chain
> ships after T3.

> **Release vwf publicly** — major — `19.47.0` → `20.0.0`, by editing
> `plugins/vwf/.claude-plugin/plugin.json`; no release step, the chain ships
> after T3.

> - Decision 14: pnpm, swiftlint, fnox, doppler, swiftui each bump one minor
>   from their `pack.yaml` version at run time (skipping a 13 or 17 component),
>   with every bundle pin and `inventory.md`, in one commit.

## Edits

1. **Plugin versions** — stackgen `1.34.0` → `2.0.0`, vwf `19.47.0` → `20.0.0`;
   any other start value is `UNRESOLVED:`.
2. **Pack bumps** — each of the five `version:` lines up one minor; every pin
   naming them
   (`grep -l '<type>/<slug>@' plugins/stackgen/stacks/bundles/*.md`).
3. **`mise run p:plugins:marketplace`** and **`mise run p:plugins:inventory`** —
   report the diffs under `DECIDED:`. Steps 1–3 land in one commit.
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

- No tag, no release task, no commit. Touch nothing beyond the owned lines and
  files. Delete nothing.

## Commit

`ops: stackgen 2.0.0, vwf 20.0.0 — tool-config mise` — written by the
orchestrator after the wave gate.
