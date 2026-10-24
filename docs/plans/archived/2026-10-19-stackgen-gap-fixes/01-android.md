# U1 — Android: flavors, the AVD id, and test:e2e --connected

- **Wave:** 1
- **Depends on:** —
- **Owns:**
  `plugins/stackgen/stacks/framework/android/skills/android/references/emulator-and-managed-devices.md`,
  `plugins/stackgen/stacks/framework/android/skills/android/references/build-configuration.md`,
  `plugins/stackgen/stacks/framework/android/config/.config/mise/tasks/test/e2e`
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md's Goal, Facts and Assumed decisions; then every owned
  file, top to bottom, before editing.
- **Lazy-load:**
  `plugins/stackgen/stacks/framework/android/config/.config/mise/tasks/setup/deps/install/android`
  (the `sdk_level` rewrite, read only),
  `plugins/stackgen/stacks/app-framework/compose/skills/compose/references/build-and-variants.md`
  (the Compose side of D4, read only — U2 owns it).

## Ruling

> - Decision D4: An environment is a build config field, set per build type or
>   from the CI environment, never a product flavor. The Android reference drops
>   the staging and production flavors and says why.
> - Decision D6: The emulator reference names the same `<level>.0` id the
>   install task installs, and says why.
> - Decision D7: `--connected` runs `./gradlew connected<Variant>AndroidTest`,
>   so `--variant` applies. `--device` names a managed device, so `--device`
>   with `--connected` is an error with a clear message.

This plan runs after `2026-10-18-packs-hand-off-to-bootstrap`, so the line
numbers in Facts can be stale: find each passage by its text. If the hand-off
already made an edit below, record it as `DECIDED:` and move on.

## Edits

1. **`build-configuration.md`** — the passage that permits staging and
   production product flavors: replace it with D4. Say that the environment is a
   build config field (for example `buildConfigField` set per build type, or
   read from the CI environment), and why: one build, no variant explosion, and
   the same rule as the Compose pack's build-and-variants reference. Keep every
   other passage.
2. **`emulator-and-managed-devices.md`** — the `avdmanager create avd` example
   that passes the raw `${EMULATOR_IMAGE};arm64-v8a`: use the id the install
   task installs, with the API level written `<level>.0` (for example
   `system-images;android-36.0;google_apis;arm64-v8a`), and one sentence on why
   (the install task rewrites a bare level to `<level>.0`, and the two ids must
   be the same). If the hand-off removed the `EMULATOR_IMAGE` value from the
   pack, keep the example as an id, not as a variable, and record `DECIDED:`.
3. **`config/.config/mise/tasks/test/e2e`** — payload, shipped byte for byte:
   - Parse `--device` and `--variant` before the `--connected` branch.
   - With `--connected`: if `--device` was given, print an error with the task's
     print helpers ("--device names a managed device; --connected runs on the
     device or emulator already attached") and exit 1. Else run
     `./gradlew connected<Variant>AndroidTest`, the variant capitalised the same
     way the managed-device branch already builds
     `<device><Variant>AndroidTest`.
   - Keep the `#USAGE` lines true: the help text of `--connected` names the
     variant it runs and that `--device` does not apply.
   - Write for bash 3.2 and bash 5 (no `${var^}`; capitalise the way the file
     already does, or with `tr`).

## Verification

- `bash -n plugins/stackgen/stacks/framework/android/config/.config/mise/tasks/test/e2e`
  passes.
- `grep -n "flavor" build-configuration.md` shows no passage that recommends a
  staging or production flavor.
- The wave gate lines `mise run p:plugins:check` and `mise run code:precommit`
  are green.

## Guardrails

- Touch nothing outside the three owned files. `framework/android/pack.yaml` is
  not yours: never touch a `version:` line, a `values:` entry or a `detect:`.
- `config/` is payload, excluded from this repo's formatter: never run a
  formatter on `test/e2e`.
- `plugins/**/*.md` is not formatted by a tool: fold by hand at the width of the
  lines around the edit.
- No `git checkout`, `git restore` or formatter `--fix` outside Owns. Delete
  with `rm`, never `git rm`.

## Commit

`fix: use one environment field, one AVD id and a variant for connected Android tests`
