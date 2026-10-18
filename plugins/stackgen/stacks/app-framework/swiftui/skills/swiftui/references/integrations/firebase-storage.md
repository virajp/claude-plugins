# SwiftUI — file storage (Cloud Storage for Firebase)

**Wiring, configuration and anti-patterns only.** The API surface — storage
references, upload and download tasks, their progress, metadata, download
URLs — is Context7's at use time, and is the half that ages. This reference
carries the bucket configuration, the emulator, App Check enforcement and the
background-transfer rules a per-type lookup gives only piecemeal.

Cloud Storage for Firebase stores user files in a Google Cloud Storage bucket
and lets the app upload and download them directly, with Security Rules
deciding who may touch which path. The client SDK retries an interrupted
transfer from where it stopped, which is what makes it suited to phones on
poor networks.

## Setup order

1. **Add the `FirebaseStorage` product** beside the shared bootstrap (see
   [Firebase Analytics](firebase-analytics.md) for the package, the
   `GoogleService-Info.plist` and `FirebaseApp.configure()`).
2. **Use the project's default bucket** unless the product needs more than one;
   it comes with the Firebase app's configuration. A second bucket is named in
   one place, the storage module, never at a call site.
3. **Write Security Rules before the first upload** and keep them in the repo
   beside the Firebase project's other config, deployed with it. Rules key
   paths on the signed-in user (see [Firebase Auth](firebase-auth.md)); an
   unauthenticated write path is a decision written down, not a default.
4. **Put storage behind one module.** Paths, content types and size limits are
   decided there; features ask it to store or fetch a file and never build a
   path themselves.
5. **Enforce App Check on Storage** once verified traffic dominates — see
   [Firebase App Check](firebase-app-check.md) for the provider, the order
   against `configure()`, and the monitor-then-enforce sequence.

## The emulator

- **Point the storage instance at the Local Emulator Suite's Storage emulator**
  in debug configurations, at start-up, before the first request; the client
  SDK behaves against it as it does against production.
- **Never in a release build** — the switch is a build-configuration decision in
  the composition root.

## Background uploads

A large upload — a video, a batch of photos — should survive the user leaving
the app. Apple's mechanism for that is a URLSession built from a **background
configuration**: the transfer runs in a system process, not the app's, and the
system relaunches the app to report when it finishes.

- **Only uploads from a file survive.** Under a background configuration, an
  upload from in-memory data or a stream fails once the app exits; write the
  payload to a file in the app's container first.
- **The session needs a delegate**, and a stable identifier the app recreates
  the session with on relaunch.
- **Relaunch handling** goes through the application delegate (reached through
  the delegate adaptor — see [platform interop](../platform-interop.md)): the
  system hands over a completion handler, which the app keeps and calls once
  the session reports that every event has been delivered.
- **Discretionary transfers** leave the timing to the system, and suit uploads
  that are not urgent.
- **The Firebase Storage SDK's own tasks** are not confirmed to run under a
  background configuration; while the app is suspended, treat an SDK upload as
  paused and rely on its resume-from-where-it-stopped behaviour, and use a
  background session only for transfers the app makes itself.

## Per platform

- **iOS and iPadOS** — supported.
- **macOS** — not confirmed.
- **tvOS** — not confirmed.
- **watchOS** — not confirmed.
- **visionOS** — not confirmed.
- **CarPlay** — not confirmed.

## Anti-patterns

| Anti-pattern                                     | Why                                                     | Instead                                         |
| ------------------------------------------------ | ------------------------------------------------------- | ----------------------------------------------- |
| Open Security Rules                              | Anyone can read or overwrite every file                 | Rules keyed on the signed-in user, in the repo  |
| Paths built in views                             | Rules and paths drift apart                             | One storage module owns paths                   |
| Emulator switch reachable in a release build     | Users upload to a local emulator that is not there      | Build-configuration decision, composition root  |
| Enforcing App Check before verified traffic      | Older installed versions lose storage access            | Monitor, then enforce                           |
| Background upload from in-memory data            | It fails once the app exits                             | Write to a file, upload from the file           |
| Background session with no relaunch handling     | Completion is never reported; the system waits          | Keep and call the relaunch completion handler   |
| Bucket name typed at call sites                  | A second source of configuration                        | Default bucket, or one name in the module       |
