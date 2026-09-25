# SwiftUI — in-app purchases (StoreKit 2)

**Wiring, platform configuration and anti-patterns only.** The API surface —
products, purchase results, transactions, entitlements, the merchandising
views — is Context7's at use time, and is the half that ages. This reference
carries the setup order, the testing wiring and the rules a per-type lookup
gives only piecemeal.

StoreKit 2 is the Swift-concurrency StoreKit; the original StoreKit's payment
queue is the older path and is not added to new code. Purchases are signed by
the App Store, verified by StoreKit on the device, and — where the product has
a backend — also reported to that backend by the App Store directly.

## Setup order

1. **Define the products in App Store Connect** — identifiers, types,
   subscription groups — and mirror them in a **StoreKit configuration file**
   committed with the project. The identifiers are configuration, one list in
   the shared core, never string literals scattered through views.
2. **Select the configuration file in the shared Run scheme's options** so
   local runs and the simulator purchase against it with no account and no
   network. Setting the option back to none makes the app read App Store
   Connect instead — the sandbox path, for a device build against real
   products.
3. **Start the transaction listener at launch**, before any view can purchase:
   one long-lived task, owned by the store module, that consumes the stream of
   transaction updates for as long as the app runs. Renewals, refunds, Ask to
   Buy approvals and purchases made on another device arrive there, not at the
   purchase call.
4. **Derive entitlements from current transactions** — verified, not revoked,
   not expired, not superseded by an upgrade — on launch and after every
   update. The store module publishes "what this user is entitled to" and views
   read that, never a flag they saved themselves.
5. **Finish every transaction after delivering what it bought.** An unfinished
   transaction is delivered again; finishing before delivery loses the
   purchase if the app dies in between.
6. **Offer restore** — a visible way to re-sync purchases, whether the
   merchandising view's own restore button or one in settings.
7. **Wire the backend, if there is one.** Configure the App Store Server
   Notifications (version 2) URL in App Store Connect — an HTTPS endpoint on
   TLS 1.2 or later — so the backend learns of renewals, refunds and
   revocations without the app being open. To tie a purchase to the backend's
   account, the app passes that account's UUID token with the purchase and the
   App Store returns it on the transaction. The App Store Server API key is a
   backend **secret**, held by its secrets provider.

## Structure

- **One store module** owns the listener, the product list, the entitlement
  state and the purchase flow; features ask it, and depend on it through the
  composition root like any client — see
  [standards & architecture](../standards-and-architecture.md).
- **Unverified transactions grant nothing.** Verification failing is not an
  error to show the user; it is a transaction to ignore.
- **Every Apple platform the app ships** runs the same store module — one
  listener, one derivation — so a purchase that the App Store shares across
  them is honoured the same way on each.

## Testing

- **The StoreKit configuration file drives unit and UI tests** through a test
  session over the same file: buy, renew, expire, refund, approve Ask to Buy,
  all without the network. There is one test environment per run; tests that
  reconfigure it run serially, never in parallel.
- **Sandbox testers** in App Store Connect cover the end-to-end path on a
  device before release; they are not a substitute for the local tests.

## Anti-patterns

| Anti-pattern                                  | Why                                                     | Instead                                           |
| --------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------- |
| No listener, only the purchase call's result  | Renewals, refunds and cross-device purchases are missed | One launch-time listener over transaction updates |
| Entitlement kept as a saved boolean           | Survives refunds and expiry; spoofable                  | Derive from current verified transactions         |
| Finishing before content is delivered         | A crash loses the purchase                              | Deliver, then finish                              |
| Never finishing                               | Redelivered on every launch                             | Finish once delivered                             |
| Product ids as literals in views              | Drift from App Store Connect                            | One list in the store module                      |
| Purchase tests against the network only       | Slow, flaky, needs accounts                             | The committed StoreKit configuration file         |
| Parallel tests reconfiguring the test session | One shared environment; tests overwrite each other      | Run them serially                                 |
| Original StoreKit payment queue in new code   | Older path; two purchase models to maintain             | StoreKit 2 throughout                             |
