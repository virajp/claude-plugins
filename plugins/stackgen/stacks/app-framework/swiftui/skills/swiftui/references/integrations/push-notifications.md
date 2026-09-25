# SwiftUI — push notifications (APNs)

**Wiring, platform configuration and anti-patterns only.** The API surface —
authorization options, the notification center's delegate, categories and
actions, payload keys beyond the few named here — is Context7's at use time,
and is the half that ages. This reference carries the setup order, the
entitlements and the extension that a per-type lookup gives only piecemeal.

Push is two halves that ship separately: the app registers with the Apple Push
Notification service (APNs) and hands its **device token** to the product's
backend, and the backend sends to APNs with that token. This reference is the
app's half; the backend's sender is the backend stack's concern, and only its
credential is named here.

## Setup order

1. **Add the Push Notifications capability** to the app target. It writes the
   APNs environment entitlement; development builds register with the sandbox
   APNs environment and distribution builds with production, so the backend
   records which environment each token came from and sends there. Add
   **Background Modes → Remote notifications** as well only if the app acts on
   silent pushes.
2. **Receive the delegate callbacks.** Registration results arrive on the
   application delegate, which a SwiftUI app does not have by default: attach
   one to the app through the platform's delegate adaptor — UIKit's on iOS,
   iPadOS and tvOS, AppKit's on macOS, WatchKit's on watchOS. See
   [platform interop](../platform-interop.md).
3. **Register on every launch** and send the token to the backend each time it
   arrives. The token is the address of this app on this device; it can change,
   and the backend keeps the latest one per device and user.
4. **Ask for permission to alert in context** — at the moment the user turns on
   something that notifies, not at first launch. Registration for a token and
   permission to show alerts are separate steps; a token does not imply the
   user will see anything.
5. **Give the backend its credential.** APNs token-based authentication uses a
   signing key from the developer account plus its key id, the team id and the
   app's bundle id as the topic. The key is a **secret** held by the backend's
   secrets provider — it never enters the app repo.
6. **Add a Notification Service Extension** target only when a notification's
   content must change on the device — decrypting an end-to-end encrypted
   body, attaching an image, filling in a communication notification's sender.
   The backend marks such a push with `mutable-content` set to `1` and an
   alert; without both, the extension is not called.

## The service extension

- **It runs briefly and then is stopped.** It has a limited time to deliver
  modified content; when time runs out it gets one last chance to hand back its
  best attempt, and if it hands back nothing the original content is shown.
  Make the original body a sensible fallback (for an encrypted push, a generic
  "New message" rather than ciphertext).
- **It is a separate process.** Anything it needs from the app — a decryption
  key, the signed-in account — comes through an App Group container or a
  shared keychain access group, configured on both targets, and signed with
  the same team; see [build & signing](../build-and-signing.md).
- **It depends on the shared modules**, never on the app target.

## Pushes that update other surfaces

A push can prompt the app to reload a widget's timeline
([widgets & complications](widgets-and-complications.md)); the app does the
reload after it has written the new data, not the push payload directly.

## Anti-patterns

| Anti-pattern                               | Why                                                         | Instead                                         |
| ------------------------------------------ | ----------------------------------------------------------- | ----------------------------------------------- |
| Permission prompt at first launch          | Denied before the user sees the value; hard to recover      | Ask when the user enables a notifying feature   |
| Token sent once and cached forever         | Tokens change; pushes go nowhere                            | Register every launch; send each token received |
| One APNs environment for every build       | Development-build tokens go to the wrong endpoint           | Backend records the environment with the token  |
| APNs signing key committed to the app repo | A credential leak                                           | Backend secrets provider only                   |
| Sensitive text in the visible alert body   | Shown on the lock screen and in logs                        | Encrypt; decrypt in the service extension       |
| Service extension with no fallback content | User sees ciphertext or nothing useful                      | A generic body the extension replaces           |
| Silent pushes used as a scheduler          | Sent at low priority; the app does not decide when they run | Background tasks for scheduled work             |
