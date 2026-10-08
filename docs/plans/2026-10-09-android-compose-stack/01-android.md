# U1 — framework/android

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/stacks/framework/android/**` (new)
- **Model:** opus
- **Kind:** edit
- **Read first:** `plugins/stackgen/assets/pack-format.md`,
  `plugins/stackgen/assets/taxonomy.md:17-104`, the whole
  `plugins/stackgen/stacks/app-framework/swiftui/` pack (the pattern for
  `values:`, the mise template and `_scripts/`) and
  `plugins/stackgen/stacks/language/kotlin/` (plan A) — read only.
- **Lazy-load:** `.claude/skills/plugin-authoring/references/checks.md` (rules
  11, 13, 17)

## Ruling

> - Decision C2: mise pins Android cmdline-tools in `conf.d/android/`.
>   `setup:deps:install:android` runs `sdkmanager` for the platform, build-tools
>   and emulator image from `values:` (`COMPILE_SDK`, `MIN_SDK`, `TARGET_SDK`,
>   `EMULATOR_IMAGE`) into `ANDROID_HOME`, which the mise env sets. If mise has
>   no backend for cmdline-tools, the unit returns `UNRESOLVED`.
> - Decision C4: E2E tests are Compose UI tests on a headless emulator, run
>   through Gradle Managed Devices (`./gradlew connectedCheck`).
> - Decision C5: Two packs. `framework/android` holds AGP, the SDK, Android Lint
>   (`code:lint:android`), the emulator and Gradle Managed Devices.
>   `app-framework/compose` (`native-ui`) holds the Compose doctrine, the
>   `ux-gate` and the goldens.
> - Decision C6: The new packs start at `0.1.0`.

## Edits

1. **`pack.yaml`** — `name: android`, `version: 0.1.0`, `type: framework`, the
   category the taxonomy gives an Android build framework (if none fits, return
   `GAP:` with the closest and use it), no `platforms:` (the bundles own them),
   `values:` `COMPILE_SDK`, `MIN_SDK`, `TARGET_SDK`, `EMULATOR_IMAGE`, and the
   `harness` entry for E2E if pack-format defines one for the emulator run.
2. **`templates/.config/mise/conf.d/android/mise.toml`** — pin Android
   cmdline-tools through a mise backend (read the registry and Context7; confirm
   it installs `sdkmanager` and `avdmanager`); set `ANDROID_HOME` (and
   `ANDROID_SDK_ROOT` only if AGP still reads it) to a path under the user's
   home in `[env]`. No backend →
   `UNRESOLVED: no mise backend for Android cmdline-tools`.
3. **`config/.config/mise/tasks/`** — executable bash subtasks, leaf `android`:
   `setup/deps/install/android` (`sdkmanager --install` the platform
   `platforms;android-@@COMPILE_SDK@@`, build-tools, `emulator` and the
   `EMULATOR_IMAGE` system image, accepting licenses non-interactively),
   `code/lint/android` (`./gradlew lint`), and an E2E task in the form
   pack-format uses for harness tasks (`./gradlew <device>DebugAndroidTest`
   through Gradle Managed Devices, headless). Values reach the scripts through
   the rendered mise env, never through `@@` in a `config/` file (only
   `templates/` render).
4. **`conventions.md`** and **`skills/android/`** — a router `SKILL.md` (strict
   YAML) and references: AGP and the Kotlin DSL `android {}` block, the SDK
   levels (`COMPILE_SDK`, `MIN_SDK`, `TARGET_SDK`), `AndroidManifest.xml`, build
   types and flavors, Android Lint and its baseline, R8, the emulator and Gradle
   Managed Devices, the Android library module (AAR) and its publishing, and
   Compose UI tests on the emulator (C4). Reference other packs by name only
   (rule 13).

## Verification

- `mise run p:plugins:check` passes for the new tree (rules 4, 11, 13, 17).
- The full wave gate after the orchestrator regenerates the inventory (C9).

## Guardrails

- Do not touch any file outside Owns; never edit plan A's packs, `inventory.md`
  or a bundle.
- Task files are mode 755 with a bash shebang; the subtask leaf is `android`.
- Read each tool's current docs through Context7 before writing its config or
  commands.
- Write files with the Write tool, never `cat > file <<EOF`.
- Delete with `rm`, never `git rm`. No `git checkout`/`git restore` and no
  formatter `--fix` outside Owns.

## Commit

Rides the wave-1 commit (C9):
`feat: android compose stack — packs, bundles, supersets`.
