# Jetpack Compose — Firebase App Check (Play Integrity)

**Wiring, configuration and anti-patterns only.** The provider-factory and
token API is Context7's at use time.

App Check attests that a request to a Firebase backend comes from the genuine
app on a genuine device. On Android the production provider is Play Integrity;
the emulator and CI use the debug provider instead.

## Setup order

1. **The shared Firebase base first** — the Google services plugin,
   `google-services.json` and the BoM, as in
   [Firebase Analytics](firebase-analytics.md).
2. **Catalog entries** for `firebase-appcheck-playintegrity` in the release
   build and `firebase-appcheck-debug` in the debug build only, both through
   the BoM.
3. **Register the app's SHA-256 signing fingerprint** in the Firebase project
   settings, then register the app with the Play Integrity provider in the App
   Check console. Play Integrity cannot be configured without a SHA-256
   fingerprint.
4. **Install the provider factory immediately after Firebase initialises** and
   before any other Firebase SDK is used — in the `Application`, so no request
   leaves without a token. The debug build installs the debug factory; the
   release build installs Play Integrity. The choice is made by build type,
   never by a runtime flag.
5. **Register the debug token.** On an emulator, run the debug build, copy the
   token it logs, and register it under Manage debug tokens in the console.
6. **CI uses a console-created debug token** kept in the CI secret store. For
   instrumented tests it reaches the build as an environment variable passed to
   the instrumentation runner arguments, and the tests read it through the
   debug test helper.
7. **Enforce last.** Watch the App Check request metrics per product
   (verified, outdated client, unknown origin, invalid) and enforce only when
   the outdated share is small; an unreleased app can enforce at once.
   Enforcement takes up to 15 minutes to apply.

## Structure

- **Provider choice lives in the build-type source sets**, one small installer
  per set, so the release artifact never contains the debug provider.
- **Debug tokens are secrets.** A registered token reaches the backend without
  a valid device: never committed, never in a release build, deleted at once
  if leaked.
- **Enforcement breaks old versions.** Every release without the App Check SDK
  is rejected after enforcement; plan the rollout against the version spread.

## Per platform

- **Phone and tablet:** supported. The Play Integrity provider requires Google
  Play services; on a device without them it has no function. The provider
  covers apps distributed on Google Play, outside it, or both.
- **Wear OS, Android TV, Android Auto:** not confirmed.

## Anti-patterns

| Anti-pattern                                   | Instead                                          |
| ---------------------------------------------- | ------------------------------------------------ |
| The debug provider in the release build        | debug artifact in the debug source set only      |
| A debug token committed to the repo            | the CI secret store                              |
| Factory installed after the first request      | install right after Firebase initialises         |
| Enforcing before reading the metrics           | enforce once outdated clients are a small share  |
| Play Integrity registered without SHA-256      | add the signing fingerprint first                |
