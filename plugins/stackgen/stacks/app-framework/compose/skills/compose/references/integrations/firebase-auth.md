# Jetpack Compose — Firebase Authentication

**Wiring, configuration and anti-patterns only.** The sign-in, credential and
user API is Context7's at use time.

Firebase Authentication owns the signed-in user and the ID token the backend
verifies. Google sign-in on Android goes through Credential Manager, covered in
`credential-manager.md`; this file covers the Firebase side, the emulator and
the Apple provider.

## Setup order

1. **The shared Firebase base first** — the Google services plugin,
   `google-services.json` and the BoM, as in
   [Firebase Analytics](firebase-analytics.md).
2. **Catalog entry** for `firebase-auth` through the BoM.
3. **Register the SHA-1 fingerprint of every key that signs a build** in the
   Firebase project settings, debug and release alike. The Gradle
   `signingReport` task prints them, and the Firebase CLI can add them. A
   build signed by an unregistered key fails provider sign-in on that build
   only, which is why it is found late.
4. **Enable each provider in the console** under Authentication's sign-in
   methods before the app offers it.
5. **Wire the Auth emulator for debug builds**: the emulator connection is
   made before the Auth instance performs any operation, and an Android
   emulator reaches the host machine at `10.0.2.2`, not `127.0.0.1`. Host and
   port come from the debug build's config, never hard-coded in release code.

## Apple provider

Sign in with Apple on Android is a web flow run by the Firebase SDK, not a
native sheet:

1. **Create the Services ID, key and key ID** on the Apple developer site, with
   the Firebase project's auth handler as the return URL.
2. **Enable Apple in the console** and fill in the Services ID, Team ID,
   private key and key ID under the Android settings; the app's SHA-1
   fingerprint must already be registered.
3. **Start the flow from an activity** through the generic OAuth provider for
   `apple.com`; the SDK takes over the UI with a web view and returns the
   result. A pending result from a flow interrupted by process death is checked
   before starting a new one.
4. **Linking an Apple account to other data needs the user's explicit
   consent**, by Apple's rule.

## Structure

- **One auth repository in the data layer** exposes the signed-in user as a
  `Flow`; screens observe it, never the SDK.
- **The activity-bound flows** (Apple, Credential Manager) are launched from
  the UI edge and their result handed to the repository.

## Testing

- **Unit tests use a fake auth repository**; no test talks to production Auth.
- **Integration tests run against the Auth emulator**, which also lets a test
  create users without a real provider.

## Per platform

- **Phone and tablet:** supported.
- **Wear OS, Android TV, Android Auto:** not confirmed.

## Anti-patterns

| Anti-pattern                                  | Instead                                         |
| --------------------------------------------- | ----------------------------------------------- |
| Only the debug fingerprint registered         | the SHA-1 of every signing key                  |
| Emulator host `127.0.0.1` on an AVD           | `10.0.2.2`                                      |
| Emulator wired after the first Auth call      | connect before any operation                    |
| Composables reading the SDK's current user    | a repository `Flow`                             |
| Apple sign-in expected as a native sheet      | the SDK's web flow from an activity             |
