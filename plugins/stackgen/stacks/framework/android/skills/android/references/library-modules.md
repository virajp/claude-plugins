# Android — library modules (AAR)

An AAR is an Android library: compiled code plus resources, a manifest, and
the consumer keep rules — what a plain JAR cannot carry. A module is an AAR
only when it needs one of those; pure Kotlin logic is a JVM module, which builds
faster and is testable without Android.

## The module

- `com.android.library`, a `namespace` of its own, `compileSdk` and `minSdk`
  (no `targetSdk` — the consuming app decides behaviour).
- The **kotlin** skill's library rules hold: explicit API mode, everything
  `internal` until a consumer needs it, semver on the public surface.
- Resources are prefixed (`resourcePrefix = "mylib_"`) so they cannot collide
  with the app's; Android Lint enforces the prefix.
- `aarMetadata { minCompileSdk = … }` states the compile level a consumer must
  have, when the library uses resources of a newer platform.
- `consumerProguardFiles("consumer-rules.pro")` ships the keep rules the
  library's reflection needs; the library itself is not minified.

## Publishing

AGP publishes a variant as a Maven component; the library opts one in:

```kotlin
android {
    publishing {
        singleVariant("release") {
            withSourcesJar()
            withJavadocJar()
        }
    }
}
```

The `maven-publish` plugin then declares a publication from the `release`
component, with the group, artifact ID and version the library owns and the
POM metadata (name, description, licence, SCM). Where it publishes — a
registry, an internal repository — is the repo's release model's, with
credentials from the environment, never from a committed properties file.

Before publishing, a library is built and its instrumented tests run as any
module's; an AAR consumed by an app in the same repo is depended on as a
project (`implementation(project(":mylib"))`), never through a published
version.

## Versioning

The version is the release pipeline's, semver, and moves with the public API:
a removed or changed public declaration is a major release, after a
`@Deprecated` cycle.
