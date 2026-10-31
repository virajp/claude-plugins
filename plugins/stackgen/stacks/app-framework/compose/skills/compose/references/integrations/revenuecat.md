# Jetpack Compose — RevenueCat

**Wiring, configuration and anti-patterns only.** The configuration, identity,
offerings, purchase, restore and customer-info API is Context7's at use time.

RevenueCat wraps Google Play Billing: the app buys through the RevenueCat SDK,
RevenueCat validates the purchase server-side and tracks the subscription's
status, and the app reads what the user is entitled to from it. The app does
not call Play Billing itself; the products still live in the Play Console.

## Setup order

1. **Create the products in the Play Console** — subscriptions and one-time
   products. The Console may refuse product creation until an uploaded build
   declares the `com.android.vending.BILLING` permission in its manifest.
2. **Connect Play to RevenueCat with a service account**: in a Google Cloud
   project, enable the Google Play Android Developer API and the Google Play
   Developer Reporting API, create a service account with the roles
   RevenueCat's setup names, upload its JSON key to the RevenueCat project's
   Google Play settings, and grant the account access in the Play Console. The
   key is a **secret** held by whoever administers RevenueCat, never committed.
3. **Build the offerings in the RevenueCat dashboard**, attaching the Play
   products to entitlements. The entitlement identifiers are the app's one
   list, kept in the billing module, never literals in screens.
4. **Catalog entry** for `com.revenuecat.purchases:purchases`; add
   `purchases-ui` only when the app shows RevenueCat's prebuilt paywall. The
   SDK's minimum is API 21, which Google's billing client requires.
5. **Configure once, in `Application.onCreate`**, with the project's public
   Google API key. The key is public and per store; a build that also ships to
   the Amazon Appstore picks its configuration by product flavour. Debug log
   level in debug builds only.
6. **Wire identity at the auth seam.** Configure without a user id, so the SDK
   generates and caches an anonymous one; after sign-in, log in with the
   backend's stable user id, which aliases the anonymous purchases to it; on
   sign-out, log out, which starts a new anonymous id. Switching accounts is a
   log-in with the new id, no log-out first.
7. **Derive entitlements from customer info** — on launch and from the
   customer-info update listener — and offer **restore purchases** in settings
   or on the paywall.

## Structure

- **One billing repository in the data layer** owns the SDK: it exposes the
  user's entitlements as a `Flow`, runs purchases and restores, and is bound
  through Hilt like any other client. ViewModels ask it; screens never touch
  the SDK.
- **The purchase flow needs an activity.** The route composable hands the
  activity to the repository call; the ViewModel never holds it.
- **Identity follows auth.** The auth repository's sign-in and sign-out drive
  the billing repository's log-in and log-out, in one place — see
  `firebase-auth.md` when Firebase owns the user.

## Testing

- **Unit tests use a fake billing repository**; no test talks to RevenueCat.
- **Sandbox purchases need a licensed tester**: add the device's Google
  account under the Play Console's license testing, publish a signed build to
  a closed track, and open the track's opt-in URL on that account, or products
  do not load.
- **The test build's application id must match the Play listing's**; a
  `.debug` suffix finds no products.
- **One Google account on the test device**, and a screen-lock PIN — without
  one, subscriptions can fail while one-time products work. A real device is
  recommended; an emulator needs Google Play services.

## Per platform

- **Phone and tablet:** supported.
- **Wear OS, Android TV, Android Auto:** not confirmed.

## Anti-patterns

| Anti-pattern                                     | Instead                                       |
| ------------------------------------------------ | --------------------------------------------- |
| Entitlement kept as a saved boolean              | derive from customer info and its updates     |
| Purchases left on the anonymous id after sign-in | log in with the backend user id               |
| Configuring the SDK in a screen or ViewModel     | once, in `Application.onCreate`               |
| The service-account key committed or shipped     | held by the RevenueCat admin as a secret      |
| Calling Play Billing beside RevenueCat           | RevenueCat alone owns the purchase flow       |
| No restore purchases in the UI                   | restore in settings or on the paywall         |
| Testing with a suffixed application id           | the Play listing's id on a licensed tester    |
