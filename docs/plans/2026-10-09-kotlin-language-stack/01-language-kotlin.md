# U1 — language/kotlin

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/stacks/language/kotlin/**` (new)
- **Model:** opus
- **Kind:** edit
- **Read first:** `plugins/stackgen/assets/pack-format.md`,
  `plugins/stackgen/assets/kinds.md:50-135`, and the whole
  `plugins/stackgen/stacks/language/swift/` pack (the pattern) — read only.
- **Lazy-load:** `plugins/stackgen/stacks/app-framework/flutter/pack.yaml` (the
  Kotlin edge facts), `.claude/skills/plugin-authoring/references/checks.md`
  (rules 11, 13, 17)

## Ruling

> - Decision K2: The bundle covers only Kotlin/JVM libraries (JAR). The Android
>   library module (AAR) is in plan B. Kotlin Multiplatform is out of scope.
> - Decision K3: mise pins the JDK (Temurin LTS) in `conf.d/kotlin/`. Gradle
>   comes from the committed wrapper (`gradlew`,
>   `gradle/wrapper/gradle-wrapper.properties`). The Kotlin compiler comes from
>   the Kotlin Gradle plugin.
> - Decision K5: The `gradle` pack teaches the version catalog
>   `gradle/libs.versions.toml` and dependency locking. `gradle.lockfile` is
>   tracked, and only `./gradlew dependencies --write-locks` writes it.
> - Decision K6: The test doctrine is `kotlin.test` on JUnit 5, with
>   `kotlinx-coroutines-test` and Kover.
> - Decision K7: `setup:deps:outdated:kotlin` uses the ben-manes
>   `gradle-versions-plugin` (`./gradlew dependencyUpdates`).
>   `setup:deps:audit:kotlin` runs grype over `gradle.lockfile`.
> - Decision K8 (ruled at run time, 2026-10-09): kotlin-lsp has no GitHub
>   release asset, so the `conf.d/kotlin/` template pins `kotlin-lsp` through
>   the mise `http:` backend from the JetBrains CDN, in the shape of the user's
>   working source
>   `~/Projects/github.com/95octane/95octane/.config/mise.dev.toml:42-49`,
>   verbatim below. `lsp_servers` runs `mise x -- kotlin-lsp`. The source covers
>   macOS only; a platform it does not cover is a `GAP:` naming the assumption
>   taken, never an unverified url.

```toml
[tools."http:kotlin-lsp"]
version          = "latest"
version_list_url = "https://api.github.com/repos/Kotlin/kotlin-lsp/releases/latest"
version_regex    = 'kotlin-lsp/v(\d+\.\d+\.\d+)'

[tools."http:kotlin-lsp".platforms]
macos-arm64 = { checksum_url = "https://download-cdn.jetbrains.com/language-server/kotlin-server/{{version}}/kotlin-server-{{version}}-aarch64.sit.sha256", format = "zip", rename_exe = "kotlin-lsp", url = "https://download-cdn.jetbrains.com/language-server/kotlin-server/{{version}}/kotlin-server-{{version}}-aarch64.sit" }
macos-x64   = { checksum_url = "https://download-cdn.jetbrains.com/language-server/kotlin-server/{{version}}/kotlin-server-{{version}}.sit.sha256", format = "zip", rename_exe = "kotlin-lsp", url = "https://download-cdn.jetbrains.com/language-server/kotlin-server/{{version}}/kotlin-server-{{version}}.sit" }
```

> - Decision K9: The SwiftPM pattern applies. `language/kotlin` holds the facts
>   (`mise_tool: java`, `manifest: settings.gradle.kts`, `lsp: kotlin-lsp`, no
>   `binaries`), the `setup/deps/*/kotlin` subtasks and the doctrine.
>   `package-manager/gradle` holds the doctrine and the `lockfile:` fact, with
>   no subtasks.
> - Decision K10: Each pack starts at `0.1.0`.

## Edits

1. **`pack.yaml`** — `name: kotlin`, `version: 0.1.0`, `type: language`, the
   category and `kind` the Swift pack uses for its language pack,
   `platforms: [packages]`, `languages:` one entry (`token: kotlin`,
   `role: primary`,
   `facts: {lsp: kotlin-lsp, mise_tool: java, manifest: settings.gradle.kts}`),
   `package_manager: gradle`, `lsp_servers:` one `kotlin-lsp` entry run as
   `mise x -- kotlin-lsp`, `values:` for the JDK and kotlin-lsp pins if the
   template needs them.
2. **`templates/.config/mise/conf.d/kotlin/mise.toml`** — pin `java` (Temurin
   LTS; read the current LTS via Context7 or the mise registry) and `kotlin-lsp`
   through the mise `http:` backend, adapting the K8 block above to a pack
   template (`@@NAME@@` values only if the pack needs them). The block covers
   macOS only; for any other platform, add a url only if you can verify it, else
   record a `GAP:` with the assumption taken. Exact pins only where CI loads
   them, as the Swift and SwiftLint templates do.
3. **`config/.config/mise/tasks/setup/deps/{install,outdated,upgrade,audit,cleanup}/kotlin`**
   — executable bash subtasks in the shape of the Swift pack's
   `setup/deps/*/swift`, each calling `./gradlew` (never a bare `gradle`):
   install → `./gradlew dependencies --write-locks` only when no lock exists,
   else a resolve; outdated → `./gradlew dependencyUpdates` (K7); upgrade → the
   catalog edit doctrine plus `./gradlew dependencies --write-locks`; audit →
   grype over `gradle.lockfile` (K7); cleanup → `./gradlew clean`. No bare
   `mise use` (rule 17).
4. **`conventions.md`** and **`skills/kotlin/`** — a router `SKILL.md`
   (strict-YAML frontmatter) and references covering the language-bundle topics
   that belong to the language pack, in the Swift pack's split: language idioms
   and null safety, coroutines and flows, project layout (Gradle modules,
   `src/main/kotlin`, `src/test/kotlin`), testing (K6), the JDK toolchain (K3),
   the LSP. Reference the gradle, ktlint and detekt packs by name only, never by
   path (rule 13).

## Verification

- `mise run p:plugins:check` passes for the new tree (rules 4, 11, 13, 17).
- The full wave gate after the orchestrator regenerates the inventory (K13).

## Guardrails

- Do not touch any file outside Owns; never edit `inventory.md`, a bundle, or
  another pack.
- Task files are mode 755 with a bash shebang; the subtask leaf is `kotlin`.
- Read each tool's current docs through Context7 before writing its config or
  commands.
- Write files with the Write tool, never `cat > file <<EOF`.
- Delete with `rm`, never `git rm`. No `git checkout`/`git restore` and no
  formatter `--fix` outside Owns.

## Commit

`feat: kotlin language pack` — wave 1 lands as one commit (K13); the
orchestrator writes one message for the wave:
`feat: kotlin language stack — packs, bundle, init row, supersets`.
