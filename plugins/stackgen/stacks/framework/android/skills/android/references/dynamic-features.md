# Android — dynamic feature modules

Play Feature Delivery splits an app bundle into a base module and feature
modules, each delivered to the device on a condition rather than at install.
It is a distribution decision, not an architecture one: modularize by feature
with ordinary library modules first (see [Library modules](library-modules.md)),
and make a module dynamic only when its size or its audience justifies a
download the user waits for.

## When one earns its place

- A large feature most users never open — an editor, an onboarding video, a
  regional payment flow.
- A feature for some devices only — a camera mode needing hardware the rest do
  not have — delivered by condition.

Not for code that every user runs, and not to shave a few hundred kilobytes:
each dynamic module costs a request, a failure path and a UI for the wait.

## The modules

```kotlin
// :feature:editor — build.gradle.kts
plugins {
    id("com.android.dynamic-feature")
}
```

```kotlin
// :app — build.gradle.kts
android {
    dynamicFeatures += setOf(":feature:editor")
}
```

- The feature module depends **on the app**, the reverse of a library module;
  the app names its dynamic features and never depends on them.
- Shared code the feature needs lives in a library module both depend on, not
  in the app module.
- Its `AndroidManifest.xml` declares the delivery in a `<dist:module>` element:
  `<dist:install-time>` (the default, optionally with conditions — device
  feature, country, minimum API level) or `<dist:on-demand/>`.

## On-demand delivery

An on-demand module is requested at run time through the Play Feature Delivery
library's `SplitInstallManager`: request, observe the session state, show the
progress, and handle every failure state — no network, insufficient storage,
the user declining a large download. Navigation into a module that is not
installed goes through Navigation's dynamic-features support, which shows the
install progress for you.

## Testing

- Unit and instrumented tests of the feature run in the feature module like any
  other.
- The real download path cannot be exercised by `./gradlew installDebug`: test
  it with `bundletool` local testing (`build-apks --local-testing`) or an
  internal test track, and use `FakeSplitInstallManager` for the UI states.
- Instant delivery (`dist:instant`) depended on Google Play Instant, which is
  retired — see [Instant apps](instant-apps.md). Never declare it.
