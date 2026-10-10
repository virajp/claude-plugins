# U4 — setup detects Android form factors

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/setup/references/topology-detection.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** the owned file, the whole platform-detection table (about
  `:130-160`).

## Ruling

> - Decision F7: vwf `topology-detection.md`: the `watch` row also detects
>   `android.hardware.type.watch`. The `tv` row detects
>   `android.software.leanback`, and the `auto` row detects the car-app
>   metadata.

## Edits

1. **The `watch` row (`:150`)** — add: an `AndroidManifest.xml` with
   `<uses-feature android:name="android.hardware.type.watch">`.
2. **The `tv` row** — make sure it names `android.software.leanback` (it may
   already); keep the tvOS check.
3. **The `auto` row** — add: an `AndroidManifest.xml` with the Car App Library
   metadata (`androidx.car.app.minCarApiLevel` or an
   `androidx.car.app.CarAppService` service), or
   `android.hardware.type.automotive`.
4. Keep the rows' existing Xcode checks unchanged.

## Verification

- `mise run p:plugins:check` and `mise run code:precommit` pass.
- `grep -n "android.hardware.type.watch" plugins/vwf/skills/setup/references/topology-detection.md`
  returns the row.

## Guardrails

- Do not touch any file outside Owns. vwf names no technology beyond the
  detection signals this table already uses.
- `plugins/**/*.md` is not formatted by dprint: match the table padding by hand.
- Delete with `rm`, never `git rm`. No `git checkout`/`git restore` and no
  formatter `--fix` outside Owns.

## Commit

Rides the wave-1 commit (F8): `feat: android form factors — wear os, tv, auto`.
