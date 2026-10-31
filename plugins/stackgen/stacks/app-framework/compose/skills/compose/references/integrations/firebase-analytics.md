# Jetpack Compose — Firebase Analytics

**Wiring, configuration and anti-patterns only.** The event, parameter and
consent API is Context7's at use time.

Firebase Analytics records product events from the app. Every Firebase file in
this directory shares the first three setup steps below — the Google services
plugin, the config file and the BoM — and adds its own after them.

## Setup order

1. **Catalog entries** for the Google services Gradle plugin, the Firebase
   Android BoM and `firebase-analytics`. The BoM is the one place a Firebase
   version is written: every Firebase library is declared through it without a
   version, so the set stays mutually compatible.
2. **Apply the Google services plugin** in the app module. It processes
   `google-services.json` into string resources that Firebase's own init
   provider reads before application code runs; no `Application` code
   initialises the default app.
3. **Place `google-services.json` in the app module**, one per build variant
   in a directory named for that variant when development and release use
   separate Firebase projects. The file holds identifiers, not secrets; it is
   committed.
4. **Decide the consent default before the first launch.** When collection
   must wait for the user's answer, the manifest turns analytics collection
   off with the `firebase_analytics_collection_enabled` meta-data entry, and
   the app re-enables it at runtime once consent is given. The runtime setting
   persists across launches.
5. **Set consent per type** — analytics storage, ad storage, ad user data, ad
   personalization — from the consent screen's answer, through the Analytics
   consent call; the state persists across sessions.
6. **Verify events in DebugView** during development, before trusting any
   report.

## Structure

- **One analytics seam in the data layer.** Screens and ViewModels call an
  app-owned tracker interface; only its implementation touches Firebase, so
  previews, goldens and unit tests run with a fake.
- **Event names are constants in one place**, never string literals scattered
  through ViewModels.
- **Consent is state, not a flag in a screen.** The consent answer lives in
  DataStore and is applied to Analytics at startup and on every change.

## Per platform

- **Phone and tablet:** supported. Analytics sends events on any device, but
  some automatic insights need Google Play services on the device.
- **Wear OS, Android TV, Android Auto:** not confirmed.

## Anti-patterns

| Anti-pattern                                 | Instead                                    |
| -------------------------------------------- | ------------------------------------------ |
| A version on each Firebase dependency        | the BoM, versionless entries               |
| Collection on by default before consent      | manifest off, enabled on the user's answer |
| Firebase calls from composables              | an injected tracker seam                   |
| Event names as inline strings                | one constants file                         |
| `google-services.json` kept out of the repo  | commit it; it holds no secret              |
