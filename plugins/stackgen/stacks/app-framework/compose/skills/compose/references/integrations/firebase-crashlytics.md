# Jetpack Compose — Firebase Crashlytics

**Wiring, configuration and anti-patterns only.** The logging, key and
non-fatal API is Context7's at use time.

Crashlytics reports crashes, non-fatals and ANRs with readable stack traces.
Readable is the part that takes wiring: an R8-minified build needs its mapping
file uploaded, and native code needs its symbols.

## Setup order

1. **The shared Firebase base first** — the Google services plugin,
   `google-services.json` and the BoM, as in
   [Firebase Analytics](firebase-analytics.md). Enabling Analytics in the
   Firebase project gives Crashlytics breadcrumb logs.
2. **Catalog entries** for the Crashlytics Gradle plugin and
   `firebase-crashlytics` through the BoM; `firebase-crashlytics-ndk` instead
   when the app ships native code.
3. **Declare the plugin at the root, apply it in the app module**, after the
   Google services plugin. It needs current Gradle, Android Gradle plugin and
   Google services plugin versions; Context7 states the minimums at use time.
4. **Mapping-file upload follows minification.** With R8 on, the plugin
   uploads the mapping file for that variant by default; the
   `mappingFileUploadEnabled` setting on the build type or flavour overrides
   it.
5. **Native symbols, only if native code ships:** `nativeSymbolUploadEnabled`
   on the release build type (off by default for build speed), and
   `unstrippedNativeLibsDir` when the build puts unstripped libraries
   somewhere custom. The upload task runs after the assemble task in CI.
6. **Turn collection off for debug builds** with the
   `firebase_crashlytics_collection_enabled` manifest entry, set per build
   type, so local crashes never reach the dashboard. A runtime override takes
   effect from the next launch.
7. **Force one test crash** from a release-like build to confirm the first
   report arrives.

## Structure

- **Crash reporting sits behind an app-owned reporter interface** in the data
  layer, so non-fatals are recorded the same way everywhere and tests use a
  fake.
- **Opt-in collection is possible.** With collection off, reports stay on the
  device until the app sends or deletes them, which lets a consent screen
  decide.
- **Variant settings live on the build type or flavour**, not in
  `defaultConfig`.

## Per platform

- **Phone and tablet:** supported.
- **Wear OS, Android TV, Android Auto:** not confirmed.

## Anti-patterns

| Anti-pattern                                    | Instead                                        |
| ----------------------------------------------- | ---------------------------------------------- |
| Minified release with mapping upload disabled   | leave upload on for every minified variant     |
| NDK crashes with no symbols                     | `nativeSymbolUploadEnabled` on release         |
| Debug crashes in the production dashboard       | collection off in the debug manifest           |
| Crashlytics settings in `defaultConfig`         | per build type or flavour                      |
| Direct SDK calls scattered through ViewModels   | one injected reporter                          |
