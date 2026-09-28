# U5 — packs: no lock-file negation

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/stacks/app-framework/flutter/**`,
  `plugins/stackgen/stacks/package-manager/pub/**`,
  `plugins/stackgen/stacks/bundles/dart-flutter.md`,
  `plugins/stackgen/stacks/inventory.md`
- **Model:** opus
- **Kind:** edit
- **Added:** at resume, 2026-09-28, on the user's ruling after wave review R1
  round 2 found the two packs asking for a lock-file negation.

## Ruling

> - Decision 4 (ruled at resume 2026-09-28): no lock file is ignored except
>   `mise.local.lock`; a line ignoring a lock file is a removal row; no negation
>   lines.
> - The user, at resume: drop the `!pubspec.lock` negation from the flutter and
>   pub packs in this plan, with the pack bumps.

## Edits

1. Remove `git add ignore !pubspec.lock` from `app-framework/flutter/pack.yaml`
   (:71) and `package-manager/pub/pack.yaml` (:13), and any prose in the two
   packs that explains it.
2. Bump each pack's `version:` a minor step (flutter `0.6.0` → `0.7.0`, pub
   `0.2.0` → `0.3.0`), update their pins in `bundles/dart-flutter.md`, and
   regenerate `inventory.md` with `mise run p:plugins:inventory` — the one
   generator this unit may run; all three land in one commit.

## Verification

- `MISE_ENV=dev mise run p:plugins:inventory -- --check` green
- `MISE_ENV=dev mise run p:plugins:check` green

## Commit

`fix: flutter and pub packs stop negating the pubspec lock` — written by the
orchestrator after the wave gate.
