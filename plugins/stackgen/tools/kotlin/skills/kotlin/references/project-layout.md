# Kotlin — project layout

A Kotlin/JVM library is a **Gradle build**: a root `settings.gradle.kts` naming
its modules, a `build.gradle.kts` per module, and the conventional source sets
inside each. The layout is Gradle's default; a build that fights it needs a
reason written in the build script.

## The tree

```text
settings.gradle.kts          the root: plugin management, repositories, the module list
build.gradle.kts             the root project — often empty of sources
gradle/libs.versions.toml    the version catalog
gradle/wrapper/              the committed wrapper jar and properties
gradlew, gradlew.bat         the committed wrapper scripts
gradle.lockfile              the dependency lock, committed
<module>/build.gradle.kts    one per module
<module>/src/main/kotlin/    production sources, package directories beneath
<module>/src/main/resources/ resources shipped in the JAR
<module>/src/test/kotlin/    tests for that module
<module>/src/test/resources/ test fixtures
```

A single-module library may keep its sources at the root (`src/main/kotlin/`
beside `settings.gradle.kts`); split into modules when a second one is real.

## Modules

**One module per concern, and a module is a compilation and visibility unit.**
`internal` is module-scoped, so a module boundary is also an encapsulation
boundary.

- Split when a piece has its own consumers or its own reason to change — an
  optional integration a consumer should not pay for, an API module separate
  from its implementation. Never to mirror a folder tree.
- A module depends on another through `implementation` unless its public API
  exposes the other's types — then `api`, and that exposure is a contract.
- Shared build logic lives in a convention plugin (an included build such as
  `build-logic/`), never copy-pasted between module build scripts.

## Packages and files

- The package matches the directory under `src/main/kotlin/`; the root
  package is the library's reverse-domain name.
- Group by feature, not by kind — a `models/`, `utils/`, `extensions/` split
  scatters one change across three folders.
- A file holding one class is named for the class. A file of top-level
  functions or extensions is named for what they share (`Strings.kt`), never
  `Utils.kt`.

## What stays out

- `build/`, `.gradle/` and `.kotlin/` are output and caches — ignored, never
  committed.
- `local.properties` is per-machine and never committed.
- IDE project files (`.idea/`, `*.iml`) are the user's, not the repo's.
