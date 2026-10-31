# U2 — Compose: the app-framework case, goldens, qualifiers, manifest

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/stacks/app-framework/compose/pack.yaml`,
  `plugins/stackgen/stacks/app-framework/compose/conventions.md`,
  `plugins/stackgen/stacks/app-framework/compose/skills/ux-gate/SKILL.md`,
  `plugins/stackgen/stacks/app-framework/compose/skills/compose/references/testing.md`,
  `plugins/stackgen/stacks/app-framework/compose/skills/compose/references/build-and-variants.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md's Goal, Facts and Assumed decisions; then every owned
  file, top to bottom, before editing.
- **Lazy-load:** `plugins/stackgen/assets/kinds.md` (the four-part test, read
  only — U3 owns it); the Robolectric documentation of device qualifiers
  (Context7 first: resolve the Robolectric library id, then query
  "RobolectricDeviceQualifiers qualifiers string").

## Ruling

> - Decision D1: Keep `type: app-framework` for Compose. `kinds.md` adds, after
>   the four-part test, the Compose case: the UI toolkit is the root when the
>   build SDK (AGP) is a `framework` member of the bundle.
>   `compose/conventions.md:10-11` says the same and drops "does not hold".
> - Decision D3: The Compose goldens are recorded in CI on Linux. A local run on
>   macOS only verifies, and a diff there is not a failure of the code. Doctrine
>   only: no task change.
> - Decision D4: An environment is a build config field, set per build type or
>   from the CI environment, never a product flavor.
> - Decision D8: `mobile` and `tablet` use explicit qualifier strings at the D6
>   sizes — 412×915 and 800×1280 portrait — taken from the Robolectric
>   documentation (for example `w412dp-h915dp-…-port-…`). `watch` and `tv` keep
>   `WearOSLargeRound` and `Television1080p`, which match D6. The D6 table
>   stays.
> - Decision D9: The `manifest:` fact of the Kotlin and Compose packs is
>   `gradle/libs.versions.toml`. `settings.gradle.kts` stays the project marker.

This plan runs after `2026-10-18-packs-hand-off-to-bootstrap`, so the line
numbers in Facts can be stale: find each passage by its text. If the hand-off
already made an edit below, record it as `DECIDED:` and move on.

## Edits

1. **`conventions.md`** — three passages:
   - the sentence that says the four-part `app-framework` test "does not hold
     for Compose": say instead that Compose is the Compose case of that test —
     the UI toolkit is the root because the build SDK (AGP) is a `framework`
     member of the bundle (D1);
   - the sentence that a golden render "is the same on every machine and in CI":
     replace it with D3 — `GraphicsMode.NATIVE` renders differ between macOS and
     Linux, so goldens are recorded in CI on Linux, a macOS run only verifies,
     and a macOS diff is not a failure of the code;
   - the qualifier list (`Pixel7`, `MediumTablet`, …): D8.
2. **`skills/ux-gate/SKILL.md`** — the platform-to-qualifier table: `mobile` and
   `tablet` take the explicit qualifier strings of D8, portrait for both;
   `watch` and `tv` stay. Do not change the default sizes paragraph — U4 owns
   the sizes in wave 2.
3. **`skills/compose/references/testing.md`** — every `@Config(qualifiers = …)`
   example and the qualifier list: D8. Add the D3 rule where the file says how
   goldens are recorded.
4. **`skills/compose/references/build-and-variants.md`** — the passage that an
   environment is a build config field, not a flavor: keep it, and make it state
   D4 in the same words U1 uses in the Android reference, so the two agree.
   Change nothing if it already says D4.
5. **`pack.yaml`** — the `manifest:` fact: `gradle/libs.versions.toml` (D9).
   Never touch the `version:` line.

For D8, take the full qualifier strings (size, screen size, long, round,
orientation, density, keys, nav) from the Robolectric documentation, at the
density the named qualifiers use. If no source gives a full string, write the
shortest string Robolectric accepts (`w412dp-h915dp-port` and
`w800dp-h1280dp-port`) and record `DECIDED:` with what you found.

## Verification

- `grep -rn "MediumTablet\|RobolectricDeviceQualifiers.Pixel7" plugins/stackgen/stacks/app-framework/compose/`
  shows no hit in the owned files.
- `grep -n "does not hold" plugins/stackgen/stacks/app-framework/compose/conventions.md`
  shows no hit.
- The wave gate lines `mise run p:plugins:check` and `mise run code:precommit`
  are green.

## Guardrails

- Touch nothing outside the five owned files. `platforms/wear-os.md` and
  `platforms/android-tv.md` keep their qualifiers.
- Never touch a `version:` line.
- `plugins/**/*.md` is not formatted by a tool: fold by hand at the width of the
  lines around the edit.
- No `git checkout`, `git restore` or formatter `--fix` outside Owns. Delete
  with `rm`, never `git rm`.

## Commit

`fix: record Compose goldens on Linux and render at the device frame sizes`
