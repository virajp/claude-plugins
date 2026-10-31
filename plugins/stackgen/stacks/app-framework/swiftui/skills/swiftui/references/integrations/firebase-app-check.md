# SwiftUI — attestation (Firebase App Check)

**Wiring, configuration and anti-patterns only.** The API surface — the
provider factories, the providers, token retrieval, limited-use tokens — is
Context7's at use time, and is the half that ages. This reference carries the
provider choice per platform, the order against `FirebaseApp.configure()` and
the debug-token handling a per-type lookup gives only piecemeal.

App Check attaches a short-lived token to every request a Firebase product
makes, proving the request came from this app on a genuine device. The token
comes from an attestation **provider** — App Attest or DeviceCheck on a real
device, the debug provider on a simulator or a CI runner. Enforcement is
switched on per Firebase service in the console; until it is, unverified
requests still succeed.

## Setup order

1. **Add the `FirebaseAppCheck` product** beside the shared bootstrap (see
   [Firebase Analytics](firebase-analytics.md) for the package, the
   `GoogleService-Info.plist` and `FirebaseApp.configure()`).
2. **Choose the provider factory per build.** A release build installs a
   factory that returns App Attest — the SDK's default factory never chooses
   App Attest; it must be opted into — with DeviceCheck as the fallback where
   App Attest is unavailable. A debug build that runs on a simulator or in CI
   installs the debug provider factory. The choice is made in the composition
   root from the build configuration, never at a call site.
3. **Install the factory before `FirebaseApp.configure()`.** The factory is
   read when Firebase configures; installed afterwards, the default factory has
   already been taken.
4. **Register the app with each provider in the Firebase console** — App
   Attest and DeviceCheck both need the app registered under App Check before
   their tokens are accepted.
5. **App Attest's capability and entitlement** are not confirmed here; look up
   the capability, the entitlement key and its environment value at use time,
   and add them to the app target's entitlements file.
6. **Monitor, then enforce.** Ship the provider first, watch the share of
   verified requests per service in the console, and enforce a service only
   once almost all of its traffic is verified — released versions without
   App Check are blocked the moment it is enforced.

## The debug provider

- **Simulator.** Run a debug build with `-FIRDebugEnabled` in the Run scheme's
  launch arguments; the console prints the device's debug token. Register it in
  the Firebase console under App Check, Manage debug tokens. On a simulator,
  the SDK's default factory already falls back to the debug provider.
- **CI.** Create a debug token in the console, store it in the CI system's
  secret store, and hand it to the debug build's test run as an environment
  variable; the variable the Apple SDK reads is Context7's at use time. The
  token never enters the repo, a scheme file that is committed, or a release
  build.
- **A debug token is a credential.** It lets any client pass App Check. A token
  that leaked is deleted in the console at once and replaced.
- **Never in a release build.** The SDK's own header says the debug provider is
  not for applications used by real users.

## Per platform

- **iOS and iPadOS** — App Attest from iOS 14; DeviceCheck as the fallback.
- **macOS** — App Attest from macOS 11; Mac Catalyst from 14.
- **tvOS** — App Attest from tvOS 15.
- **watchOS** — App Attest and DeviceCheck from watchOS 9; on older watchOS
  the default factory has no provider and enforcement fails.
- **visionOS** — not confirmed.
- **CarPlay** — not confirmed.

## Anti-patterns

| Anti-pattern                                   | Why                                                   | Instead                                       |
| ---------------------------------------------- | ----------------------------------------------------- | --------------------------------------------- |
| Factory installed after `configure()`          | The default factory is already in place               | Install the factory first                     |
| Relying on the default factory for App Attest  | It never picks App Attest                             | A factory that returns App Attest explicitly  |
| Debug provider compiled into release builds    | Any client with the token passes attestation          | Debug factory in debug configurations only    |
| Debug token committed to the repo or a scheme  | A leaked credential that bypasses App Check           | CI secret store; delete and replace on leak   |
| Enforcing on the day the provider ships        | Every installed version without App Check is blocked  | Monitor verified traffic, then enforce        |
| Provider chosen at call sites                  | Inconsistent attestation across features              | One choice in the composition root            |
