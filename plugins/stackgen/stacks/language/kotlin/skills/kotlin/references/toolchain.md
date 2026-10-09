# Kotlin — toolchain

Three things build a Kotlin/JVM library, and each comes from exactly one place.

| Piece | Comes from | Pinned in |
| --- | --- | --- |
| The JDK | mise (`java`, Temurin, the LTS line) | `.config/mise/conf.d/kotlin/mise.toml` |
| Gradle | the committed wrapper | `gradle/wrapper/gradle-wrapper.properties` |
| The Kotlin compiler | the Kotlin Gradle plugin | the version catalog |

Nothing else installs them: no system Gradle, no `kotlinc` on `PATH`, no
`brew install openjdk`. A contributor runs `mise install` and `./gradlew`, and
gets exactly what CI gets.

## The JDK

- mise pins Temurin on the current LTS line, so the build runs on a supported,
  long-lived JDK. A move to the next LTS is a deliberate edit of that file,
  reviewed as its own diff.
- The JDK the build **runs on** is not the bytecode it **emits**. Set the
  target with `kotlin { jvmToolchain(N) }` in the build script (a convention
  plugin, in a multi-module build), where `N` is the oldest Java release the
  library supports. Raising it is a major release for consumers.
- Never read `JAVA_HOME` in a build script. mise sets it; Gradle's toolchain
  support finds the JDK from there.

## The Gradle wrapper

- `gradlew`, `gradlew.bat` and `gradle/wrapper/` are committed. Every task,
  hook and CI step calls `./gradlew`, never a bare `gradle`.
- The wrapper is upgraded with `./gradlew wrapper --gradle-version <v>` —
  run twice, so the second run regenerates the scripts with the new version —
  and the `distributionSha256Sum` it writes stays in the properties file;
  `setup:deps:install:kotlin --frozen` fails without it.
- `gradle-wrapper.jar` runs on every `./gradlew`, so CI validates it first —
  `gradle/actions/wrapper-validation`, or `gradle/actions/setup-gradle`,
  which validates it built in — before any Gradle step.

## The Kotlin compiler

- The Kotlin Gradle plugin (`kotlin("jvm")`) carries the compiler; its
  version in the version catalog is the Kotlin version. Bumping it moves the
  language version and the standard library together.
- Compiler warnings are errors: `allWarningsAsErrors = true` in the
  `compilerOptions` block, so a warning fails the build rather than
  accumulating.
- Explicit API mode is on (`explicitApi()`) — see
  [coding standards](standards.md).

## The language server

`kotlin-lsp` is JetBrains' Kotlin language server; this pack declares it as
the `kotlin-lsp` server, started as `mise x -- kotlin-lsp --stdio`. mise
installs it in the development environment alone, from
`.config/mise/conf.d/kotlin/mise.dev.toml`: it publishes no GitHub release
asset, so the `http:` backend reads the version from the release tag and
downloads the JetBrains archive, checksum-verified, for macOS and Linux
(arm64 and x64), renaming its launcher to `kotlin-lsp`. CI never loads that
file, so the pin stays `latest` and `mise install` moves it forward. On
Windows mise has no url for it, and it is installed by hand. `mise x --` runs
it inside the repo's environment, so it sees the pinned JDK. It imports the Gradle build itself; a build that does not configure from
the command line does not configure for the server either.
