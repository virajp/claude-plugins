# Version catalog

`gradle/libs.versions.toml` is the one place a version is written. Gradle
reads it automatically and exposes it to every build script as `libs`.

```toml
[versions]
kotlin = "2.2.20"
coroutines = "1.10.2"
versions-plugin = "0.53.0"

[libraries]
kotlinx-coroutines-core = { module = "org.jetbrains.kotlinx:kotlinx-coroutines-core", version.ref = "coroutines" }
kotlinx-coroutines-test = { module = "org.jetbrains.kotlinx:kotlinx-coroutines-test", version.ref = "coroutines" }

[plugins]
kotlin-jvm = { id = "org.jetbrains.kotlin.jvm", version.ref = "kotlin" }
versions = { id = "com.github.ben-manes.versions", version.ref = "versions-plugin" }
```

The versions above illustrate the shape; read each library's current release
before writing one.

```kotlin
// build.gradle.kts
plugins {
    alias(libs.plugins.kotlin.jvm)
}

dependencies {
    implementation(libs.kotlinx.coroutines.core)
    testImplementation(libs.kotlinx.coroutines.test)
}
```

## Rules

- **No version in a build script.** `implementation("group:name:1.2.3")` is a
  finding; the coordinate goes in `[libraries]` and the script reads the alias.
- **A shared version is a `[versions]` entry** referenced with `version.ref`,
  so libraries released together move together.
- **Plugins live in `[plugins]`** and are applied with `alias(...)`; the Kotlin
  Gradle plugin's version there **is** the Kotlin compiler's version.
- **Aliases are kebab-case**, grouped by prefix (`kotlinx-coroutines-*`);
  Gradle turns each `-` into a `.` accessor.
- **Exact versions.** A catalog entry names one release, never a range or
  `+`; the lockfile then records the transitive graph that release brings.

## Adding a dependency

- **Ask first.** Never add a library or a plugin without the user's explicit
  consent — name its coordinates, its project page and what it is for, then
  wait for a yes.
- Add the catalog entry, reference it from the module that needs it — the
  narrowest configuration that works (`implementation` over `api`,
  `testImplementation` for test-only code) — then re-lock and commit the
  catalog, the build script and the lockfiles together (see
  [Dependency locking](locking.md)).

## Reporting updates

The ben-manes `gradle-versions-plugin` (`com.github.ben-manes.versions`),
its version in the catalog's `[plugins]` table, is applied in the root
`build.gradle.kts`:

```kotlin
// build.gradle.kts (root)
plugins {
    alias(libs.plugins.versions)
}
```

It reports every dependency with a newer release; the language pack's
`setup:deps:outdated:kotlin` runs it. Without the plugin applied, Gradle
reports `dependencyUpdates` as an unknown task.

```bash
./gradlew dependencyUpdates
```

It reports; it changes nothing. Moving a version is a catalog edit followed by
a re-lock, one dependency (or one release train) per change. Reject
pre-release candidates in the report with its `rejectVersionIf` filter rather
than reading past them.
