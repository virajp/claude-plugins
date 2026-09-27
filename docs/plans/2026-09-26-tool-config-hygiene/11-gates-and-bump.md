# U11 — Gates and the installer bump

- **Wave:** 5
- **Depends on:** U10
- **Owns:** `package.json` (the installer version, through `p:i:version`)
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md's Consent block.

## Ruling

> **Release installer publicly** — patch — `1.0.1` → `1.0.2` via
> `mise run p:i:version`; tagged `installer-v1.0.2` at the asked `/release`.

> **Release stackgen publicly** — none here — rides the unreleased `2.0.0` (T1).
> **Release vwf publicly** — none here — rides the unreleased `20.0.0` (T1).
> **Release site publicly** — none here — rides the unreleased `1.1.47`.

> - Decision 24: stackgen stays `2.0.0`, vwf `20.0.0`, site `1.1.47`, all
>   unreleased; the installer goes `1.0.1` → `1.0.2` through
>   `mise run p:i:version`.

## Edits

1. **Plugin and site versions** — confirm stackgen reads `2.0.0`, vwf `20.0.0`,
   `site/package.json` `1.1.47`; any other value is `UNRESOLVED:`. Change none.
2. **`MISE_ENV=dev mise run p:i:version`** (patch, the default) — it refuses a
   dirty tree, so it runs on the clean tree after U10's commit; it must print
   `1.0.2`. Report its output under `DECIDED:`.
3. **The full wave gate**, with `MISE_ENV=dev` exported.

## Verification

- `mise run p:plugins:marketplace -- --check` green
- `mise run p:plugins:inventory -- --check` green
- `mise run p:plugins:check` green
- `mise run p:plugins:shellcheck` green
- `pnpm vitest run` green
- `mise run code:precommit` green
- `mise run p:site:check` green
- `git status --porcelain` shows nothing outside `package.json` (and whatever
  `p:i:version` itself writes, reported), nothing staged.

## Guardrails

- No tag, no release task. Touch nothing beyond the version line.
- If `p:i:version` commits by itself, report it under `DECIDED:` and do not
  commit again.

## Commit

`ops: installer 1.0.2` — written by the orchestrator after the wave gate.
