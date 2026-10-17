# SwiftUI — push through Firebase (Firebase Cloud Messaging)

**Wiring, platform configuration and anti-patterns only.** The API surface —
the messaging delegate, token retrieval and its update stream, topics, the
extension helper — is Context7's at use time, and is the half that ages. This
reference carries the setup order, the console credential, the swizzling
decision and the extension a per-type lookup gives only piecemeal.

Firebase Cloud Messaging (FCM) sits on top of APNs: the app still registers
with APNs and receives an APNs device token, and FCM maps that token to an
**FCM registration token**, the address the backend sends to through Firebase.
Everything [push notifications](push-notifications.md) says about the APNs
half — the capability, the delegate adaptor, asking permission in context —
holds unchanged; this reference is what FCM adds.

## Setup order

1. **Add the `FirebaseMessaging` product** beside the shared bootstrap (see
   [Firebase Analytics](firebase-analytics.md) for the package, the
   `GoogleService-Info.plist` and `FirebaseApp.configure()`).
2. **Upload the APNs authentication key to Firebase.** In the console's
   project settings, Cloud Messaging tab, upload the `.p8` key with its key id
   and the Apple team id, for development, production or both — at least one.
   The key is a **secret**: it lives in the console and the secrets provider,
   never in the repo.
3. **Add the capabilities** to the app target: Push Notifications, and
   Background Modes with Background fetch and Remote notifications, as
   Firebase's setup asks.
4. **Decide swizzling.** With swizzling on, FCM picks up the APNs token by
   itself. A SwiftUI app — or any app with `FirebaseAppDelegateProxyEnabled`
   set to `NO` — hands the APNs token to FCM by hand from the application
   delegate's registration callback, reached through the delegate adaptor.
   The flag is app-wide (see [Firebase Analytics](firebase-analytics.md));
   whichever way it is set, every product's callbacks follow it.
5. **Hold token generation until consent, if needed.** Setting
   `FirebaseMessagingAutoInitEnabled` to `NO` in the app's `Info.plist` — not
   in `GoogleService-Info.plist` — stops FCM generating a token at configure
   time; the app turns it on once the user agrees.
6. **Send the FCM token to the backend every time it changes.** Observe the
   token's updates for as long as the app runs and send each new value; the
   backend keeps the latest token per device and user. The FCM token, not the
   APNs token, is what the backend addresses.
7. **Ask permission to alert in context**, exactly as for direct APNs.

## The notification service extension

- **Images go through the extension.** The backend sends an image URL in the
  APNs options of the FCM message with `mutable-content` set to `1`; the
  Notification Service Extension downloads it and attaches it through
  Messaging's extension helper.
- **The extension links the Messaging product** for that helper, and depends
  on the shared modules, never on the app target.
- **The fallback rules hold.** The extension runs briefly; the original body is
  what the user sees if it runs out of time — see
  [push notifications](push-notifications.md).

## Per platform

- **iOS and iPadOS** — supported.
- **macOS** — not confirmed.
- **tvOS** — not confirmed.
- **watchOS** — not confirmed.
- **visionOS** — not confirmed.
- **CarPlay** — not confirmed.

## Anti-patterns

| Anti-pattern                                       | Why                                                      | Instead                                           |
| -------------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------- |
| No APNs key uploaded to Firebase                   | FCM has nothing to deliver through                       | Upload the `.p8` key for each environment used    |
| APNs key committed to the repo                     | A credential leak                                        | Console and secrets provider only                 |
| Swizzling off with no manual APNs token hand-off   | FCM never gets an APNs token; no token, no pushes        | Forward the token from the delegate adaptor       |
| Backend addressing the APNs token                  | FCM sends to the FCM token, not the APNs one             | Send the FCM token to the backend                 |
| FCM token sent once and cached forever             | Tokens change; pushes go nowhere                         | Send every update of the token                    |
| Auto-init key put in `GoogleService-Info.plist`    | FCM reads it from the app's `Info.plist`                 | The app's `Info.plist`                            |
| Image pushes without a service extension           | The image is never attached                              | Extension with Messaging's helper                 |
