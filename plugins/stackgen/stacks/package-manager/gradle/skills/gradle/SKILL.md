---
name: gradle
version: 0.1.0
category: development
description: Gradle as the build tool and package manager of a Kotlin/JVM
  build — the committed wrapper, the Kotlin DSL, the version catalog,
  dependency locking and the committed gradle.lockfile, update reports, and the
  build and configuration caches. Auto-applies when editing a Gradle build
  script, the version catalog, a lockfile or the wrapper properties.
license: MIT
user-invocable: false
allowed-tools: Read Grep Glob Edit Write Bash
paths:
  - "**/settings.gradle.kts"
  - "**/build.gradle.kts"
  - "**/gradle/libs.versions.toml"
  - "**/gradle.lockfile"
  - "**/settings-gradle.lockfile"
  - "**/gradle.properties"
  - "**/gradle/wrapper/gradle-wrapper.properties"
---

# Gradle

The build, its dependencies and their pins. Read the reference matching your
task.

| Doing | Read |
| --- | --- |
| Running Gradle, moving its version, the Kotlin DSL, build logic | [Wrapper & build scripts](references/wrapper.md) |
| Adding, declaring or moving a library or plugin version | [Version catalog](references/version-catalog.md) |
| The lockfile, `--write-locks`, update reports, supply chain | [Dependency locking](references/locking.md) |
| `gradle.properties`, the build cache, the configuration cache | [Build performance](references/performance.md) |

**The rules that do not wait for a reference:** Gradle runs only as
`./gradlew`; a version is written only in `gradle/libs.versions.toml`;
`gradle.lockfile` is committed and written only by an every-project
`--write-locks` run (`mise run setup:deps:upgrade:kotlin`), never by hand; and never add a
dependency or a plugin without the user's explicit consent.
