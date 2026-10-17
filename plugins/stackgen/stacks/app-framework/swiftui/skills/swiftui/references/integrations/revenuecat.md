# SwiftUI — in-app purchases (RevenueCat)

**Wiring, configuration and anti-patterns only.** The API surface —
configuration builders, offerings and packages, purchase and restore calls,
customer info and entitlements, the paywall views — is Context7's at use time,
and is the half that ages. This reference carries the setup order, the
identity flow and the testing wiring a per-type lookup gives only piecemeal.

RevenueCat is a purchase backend wrapped around StoreKit: the app buys through
its SDK, purchases-ios, and RevenueCat's servers validate the transaction and
hold the customer's entitlements, which the app reads back. It is the choice
when the product wants one subscription state across Apple and Android, or
server-side entitlement without running its own App Store server code. A
product selling on Apple platforms alone, with its own backend, can wire
StoreKit 2 directly instead — see [StoreKit](storekit.md). The two are not
mixed by accident: either RevenueCat completes purchases, or the app's own
StoreKit 2 code does and RevenueCat only records them, chosen once at
configuration.

## Setup order

1. **Add purchases-ios through Swift Package Manager**, the recommended
   installation path, to the shared module that owns purchases — not to the
   app target alone.
2. **Create the products in App Store Connect and mirror them in RevenueCat**:
   the products, the entitlements they unlock, and the offerings that group
   them for display. Add the **in-app purchase key** from App Store Connect to
   the RevenueCat app; with the StoreKit 2 SDK, transactions are not recorded
   without it.
3. **Configure the SDK once, as early as possible at launch**, before any view
   can read entitlements or purchase — in the application delegate's
   did-finish-launching callback, attached through the platform's delegate
   adaptor; see [platform interop](../platform-interop.md). Configure with the
   project's **Apple public API key**. RevenueCat issues one public key per
   store platform, and an Android key on Apple loads the wrong product
   configuration; the key is public configuration, not a secret, but it lives
   in one per-environment configuration value, never as a literal in views.
4. **Choose who completes purchases.** By default RevenueCat does. If the app
   keeps its own StoreKit 2 purchase code, configure the SDK to say the app
   completes purchases and that it uses StoreKit 2; RevenueCat then observes
   and records them. On macOS, a purchase completed by the app's own StoreKit
   2 code is not seen until the app is foregrounded unless the app records it
   with the SDK straight after the purchase.
5. **Wire identity.** Configured without an app user id, the SDK creates an
   anonymous one. When the user signs in, log in with the backend's stable
   account id; RevenueCat aliases the anonymous id to it, so purchases made
   before sign-in follow the account. If the product only ever uses its own
   ids, do not log out on sign-out — logging out creates a new anonymous id;
   log in with the next account's id instead.
6. **Listen for customer info updates** in the purchases module, through the
   SDK's delegate (set after configuring) or its asynchronous stream, and
   publish "what this user is entitled to" from there. Views read that state,
   never a flag they saved.
7. **Offer restore** from a user action — a visible Restore button in the
   paywall or settings. Restore is called on the user's tap, never
   programmatically at launch.

## Structure

- **One purchases module** owns configuration, identity, the update listener
  and the entitlement state; features depend on it through the composition
  root like any client — see
  [standards & architecture](../standards-and-architecture.md).
- **Entitlement ids and offering ids are configuration**, one list in the
  module, matching the RevenueCat dashboard.
- **App Clips and watchOS apps** use the same public API key as the main app;
  they are not separate RevenueCat apps.

## Testing

- **A StoreKit configuration file** gives local, network-free purchases in the
  simulator and in tests. Its products must also exist in RevenueCat so the
  sandbox receipt validates.
- **Apple's sandbox** covers the end-to-end path on a device against App Store
  Connect products before release.
- **RevenueCat's Test Store key** belongs to debug builds; a release build
  configured with it fails at launch unless a dangerous setting allows it, and
  that setting is only for internal builds that are never uploaded to the App
  Store.

## Per platform

- **iOS and iPadOS, macOS, tvOS, watchOS:** supported by the SDK, with
  universal purchases shared across those versions of the app. iOS and tvOS
  configure in the UIKit launch callback; macOS and watchOS in their own
  did-finish-launching callback.
- **Mac Catalyst:** the installation steps are the same as macOS.
- **visionOS, CarPlay:** not confirmed.

## Anti-patterns

| Anti-pattern                                    | Why                                                       | Instead                                         |
| ----------------------------------------------- | --------------------------------------------------------- | ----------------------------------------------- |
| Entitlement kept as a saved boolean             | Misses renewals, refunds and cross-device purchases       | Derive from customer info updates               |
| Purchasing before sign-in, never logging in     | Purchases stay on an anonymous id the account cannot see  | Log in with the account id after sign-in        |
| Logging out on sign-out with custom ids only    | Creates a fresh anonymous id each time                    | Log in with the next account's id               |
| Configuring in a view, or more than once        | Purchases and updates race a missing configuration        | Configure once at launch, in the module         |
| The Android key in the Apple app                | Loads the wrong product configuration; products not found | The Apple public key for Apple platforms        |
| No in-app purchase key in RevenueCat            | StoreKit 2 transactions are not recorded                  | Add the key before the first sandbox purchase   |
| Restore called automatically at launch          | Restore is a user action                                  | A visible Restore button                        |
| Own StoreKit code and RevenueCat both finishing | Two owners for one transaction                            | Declare once who completes purchases            |
| Test Store key in an App Store build            | Release builds refuse it                                  | Test Store in debug and internal builds only    |
