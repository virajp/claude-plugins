# U2 — framework/android: app and module types

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/stacks/framework/android/**`
- **Model:** opus
- **Kind:** edit
- **Read first:** the whole `framework/android/` pack (plan B).

## Ruling

> - Decision F1: `kotlin-compose` gets `watch` (Wear OS), `tv` (Android TV /
>   Google TV) and `auto` (Android Auto / Automotive OS). `spatial` (Android XR)
>   is out of scope.
> - Decision F4: `framework/android` gets references for Baseline Profiles with
>   Macrobenchmark, dynamic feature modules, instant apps (only if Context7
>   confirms that Google Play Instant is still supported, else a note that it is
>   retired), and the manifest features of each form factor. Version `0.1.0` →
>   `0.2.0`.

## Edits

1. **`skills/android/references/baseline-profiles.md`** — the Baseline Profile
   and Macrobenchmark modules.
2. **`skills/android/references/dynamic-features.md`** — Play Feature Delivery
   modules.
3. **`skills/android/references/instant-apps.md`** — read Google Play Instant's
   status through Context7 first. Supported: document it. Retired: write a short
   note that says so, with the date, and no how-to.
4. **`skills/android/references/form-factors.md`** — the manifest features and
   `uses-feature` entries for Wear OS (`android.hardware.type.watch`), Android
   TV (`android.software.leanback`, `android.hardware.touchscreen` not
   required), Android Auto (car-app metadata, `androidx.car.app` category) and
   Automotive OS, and a Gradle Managed Device per form factor.
5. **`skills/android/SKILL.md`** — the router lists the new references.
6. **`pack.yaml`** — `version: 0.2.0`.

## Verification

- `mise run p:plugins:check` passes (rules 4, 13).
- The full wave gate after the orchestrator regenerates the inventory (F8).

## Guardrails

- Do not touch any file outside Owns; never edit a bundle or `inventory.md`.
- Read each library's current docs through Context7.
- Delete with `rm`, never `git rm`. No `git checkout`/`git restore` and no
  formatter `--fix` outside Owns.

## Commit

Rides the wave-1 commit (F8): `feat: android form factors — wear os, tv, auto`.
