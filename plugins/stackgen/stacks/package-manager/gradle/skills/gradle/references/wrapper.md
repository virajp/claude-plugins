# Wrapper & build scripts

## The wrapper

Gradle runs only through the wrapper the repo commits:

```text
gradlew                                  # tracked, executable
gradlew.bat                              # tracked
gradle/wrapper/gradle-wrapper.jar        # tracked
gradle/wrapper/gradle-wrapper.properties # tracked — the Gradle version pin
```

- **Every command is `./gradlew …`.** A `gradle` on `PATH` runs whatever
  version that machine carries; the wrapper runs the one the repo pins. The
  JDK it runs on is the one mise pins for the repo.
- **Moving Gradle is its own change.** Run the wrapper task twice — the second
  run lets the new wrapper regenerate its own scripts and jar — and commit the
  four files together:

```bash
./gradlew wrapper --gradle-version <x> --gradle-distribution-sha256-sum <sha>
./gradlew wrapper
```

- **`distributionSha256Sum` is set** in `gradle-wrapper.properties`, so a
  tampered or truncated distribution fails the download rather than running.
  Take the checksum from Gradle's published release checksums, never from the
  downloaded file itself.
- **`gradle-wrapper.jar` is a binary in the tree, and `./gradlew` runs it.**
  A change to it arrives only from the wrapper task; a diff to it in any other
  change is a finding in review.
- **CI validates the wrapper jar before any `./gradlew`.** No local task can
  prove the jar genuine, so the workflow runs `gradle/actions/wrapper-validation`
  — or `gradle/actions/setup-gradle`, which validates it built in — before its
  first Gradle step. `distributionSha256Sum` covers the distribution the jar
  downloads; validation covers the jar itself. The language pack's
  `setup:deps:install:kotlin --frozen` fails when `distributionSha256Sum` is
  unset, and warns without `--frozen`.

## The Kotlin DSL

`settings.gradle.kts` at the root names the build and its modules;
each module has a `build.gradle.kts`. No Groovy script is added beside them.

```kotlin
// settings.gradle.kts
rootProject.name = "orders"

pluginManagement {
    repositories {
        gradlePluginPortal()
        mavenCentral()
    }
}

dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        mavenCentral()
    }
}

include(":core", ":cli")
```

- **Repositories are declared once, in settings**, with
  `FAIL_ON_PROJECT_REPOS`, so no module quietly adds a repository of its own.
- **Plugins are applied with `alias(libs.plugins.<name>)`** in a `plugins {}`
  block — never the legacy `apply plugin:` form, never a `buildscript {}`
  classpath.
- **Shared build logic is a convention plugin** in an included build
  (`build-logic/`, wired with `includeBuild("build-logic")` in
  `pluginManagement`). `allprojects {}` and `subprojects {}` couple every
  module to every other and break project isolation — never use them.
- **A build script declares; it does not compute.** No environment reads that
  change the dependency graph, no network calls, no work at configuration
  time — work belongs in a task's action, where the configuration cache can
  skip everything before it.

## Running

```bash
./gradlew build         # compile, test, check — the whole module graph
./gradlew :core:test    # one module's tests
./gradlew tasks         # what a module offers
```

The repo's own task library wraps these (`mise run …`); prefer it, so a
developer and CI run the same command.
