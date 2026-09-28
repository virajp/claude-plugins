# U8 — Gates and pack bumps

- **Wave:** 4
- **Depends on:** U7
- **Owns:** `.claude-plugin/marketplace.json`,
  `plugins/stackgen/stacks/inventory.md`, the `version:` line of the five packs'
  `pack.yaml` (pnpm, swiftlint, fnox, doppler, swiftui), every bundle in
  `plugins/stackgen/stacks/bundles/` that pins one of them (their pin lines
  only)
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md's Consent block.

## Ruling

> **Release vwf publicly** — none — no bump; rides `20.0.0` from
> `2026-09-26-universal-packs-into-init`; tagged via `/release` (ask).

> **Release stackgen publicly** — none — no bump; rides `2.0.0` from the same
> plan; tagged via `/release` (ask).

> - Decision 12: A pack whose content changes bumps its `pack.yaml` version,
>   every bundle pin and `inventory.md` in one commit: pnpm `0.3.1` → `0.4.0`,
>   swiftlint `0.1.1` → `0.2.0`, fnox `1.0.0` → `1.1.0`, doppler `1.0.0` →
>   `1.1.0`, swiftui `0.2.0` → `0.3.0`.

## Edits

1. **No plugin version edit.** Confirm vwf reads `20.0.0` and stackgen `2.0.0`;
   any other value is `UNRESOLVED:`.
2. **Pack bumps** — the five `pack.yaml` versions per decision 12 (any other
   start value is `UNRESOLVED:`), and every bundle pin naming them:
   `grep -l 'package-manager/pnpm@\|toolchain-gate/swiftlint@\|capability-provider/fnox@\|capability-provider/doppler@\|app-framework/swiftui@' plugins/stackgen/stacks/bundles/*.md`
   (pnpm alone is pinned by 15 bundles).
3. **`mise run p:plugins:marketplace`** and **`mise run p:plugins:inventory`** —
   `inventory.md` changes with the pack versions; report the diff under
   `DECIDED:`. Steps 2 and 3 land in one commit.
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

- No tag, no release task, no commit. Touch no doc, skill or pack content beyond
  the `version:` lines and bundle pins. Delete nothing.

## Commit

`ops: pnpm 0.4.0, swiftlint 0.2.0, fnox 1.1.0, doppler 1.1.0, swiftui 0.3.0 — mise conf.d packs`
— written by the orchestrator after the wave gate.
