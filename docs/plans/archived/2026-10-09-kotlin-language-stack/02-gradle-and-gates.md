# U2 — package-manager/gradle, toolchain-gate/ktlint, toolchain-gate/detekt

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/stacks/package-manager/gradle/**`,
  `plugins/stackgen/stacks/toolchain-gate/ktlint/**`,
  `plugins/stackgen/stacks/toolchain-gate/detekt/**` (all new)
- **Model:** opus
- **Kind:** edit
- **Read first:** `plugins/stackgen/assets/pack-format.md`,
  `plugins/stackgen/assets/kinds.md:50-135`, and the packs
  `package-manager/swiftpm/`, `toolchain-gate/swift-format/`,
  `toolchain-gate/swiftlint/` (the pattern) — read only.
- **Lazy-load:** `.claude/skills/plugin-authoring/references/checks.md` (rules
  11, 13, 15, 17)

## Ruling

> - Decision K3: mise pins the JDK (Temurin LTS) in `conf.d/kotlin/`. Gradle
>   comes from the committed wrapper (`gradlew`,
>   `gradle/wrapper/gradle-wrapper.properties`). The Kotlin compiler comes from
>   the Kotlin Gradle plugin.
> - Decision K4: Two gate packs: `toolchain-gate/ktlint` (format and lint, from
>   the mise registry) and `toolchain-gate/detekt` (lint, through a `github:`
>   backend). Android Lint is in plan B.
> - Decision K5: The `gradle` pack teaches the version catalog
>   `gradle/libs.versions.toml` and dependency locking. `gradle.lockfile` is
>   tracked, and only `./gradlew dependencies --write-locks` writes it.
> - Decision K9: `package-manager/gradle` holds the doctrine and the `lockfile:`
>   fact, with no subtasks.
> - Decision K10: Each pack starts at `0.1.0`.

## Edits

1. **`package-manager/gradle/`** — `pack.yaml` (`name: gradle`,
   `version: 0.1.0`, the type, category and kind the swiftpm pack uses,
   `lockfile:` globs for `gradle.lockfile` and `**/gradle.lockfile` and
   `settings-gradle.lockfile`), `conventions.md`, and `skills/gradle/` (router
   `SKILL.md`, strict YAML, plus references): the wrapper (committed, upgraded
   with `./gradlew wrapper --gradle-version`), the Kotlin DSL, the version
   catalog, dependency locking (K5), the `gradle-versions-plugin` declared in
   the catalog, the build cache and configuration cache, and that a lockfile is
   never edited by hand. No subtasks.
2. **`toolchain-gate/ktlint/`** — `pack.yaml` (`version: 0.1.0`), a
   `templates/.config/mise/conf.d/ktlint/mise.toml` pinning `ktlint` from the
   mise registry, `config/.config/mise/tasks/code/format/ktlint`
   (`ktlint --format`) and `config/.config/mise/tasks/code/lint/ktlint`
   (`ktlint`), the editorconfig-based settings ktlint reads placed where the
   swift-format pack places its config (follow pack-format's root allowlist; if
   `.editorconfig` is not allowed, record a `GAP:` and use ktlint's CLI flags),
   `conventions.md`, and a doctrine skill.
3. **`toolchain-gate/detekt/`** — `pack.yaml` (`version: 0.1.0`), a
   `templates/.config/mise/conf.d/detekt/mise.toml` pinning detekt's CLI through
   a `github:` backend (confirm the release asset name),
   `config/.config/detekt.yml` (a baseline config, `buildUponDefaultConfig`),
   `config/.config/mise/tasks/code/lint/detekt`
   (`detekt --config .config/detekt.yml`), `conventions.md`, and a doctrine
   skill.

## Verification

- `mise run p:plugins:check` passes for the three new trees (rules 4, 11, 13,
  15, 17).
- The full wave gate after the orchestrator regenerates the inventory.

## Guardrails

- Do not touch any file outside Owns; never edit `inventory.md`, a bundle, the
  tool-config assets (U5 owns them) or another pack.
- Task files are mode 755 with a bash shebang; each subtask leaf equals its pack
  slug (`ktlint`, `detekt`).
- Read each tool's current docs through Context7 before writing its config or
  commands.
- Write files with the Write tool, never `cat > file <<EOF`.
- Delete with `rm`, never `git rm`. No `git checkout`/`git restore` and no
  formatter `--fix` outside Owns.

## Commit

Rides the wave-1 commit (K13):
`feat: kotlin language stack — packs, bundle, init row, supersets`.
