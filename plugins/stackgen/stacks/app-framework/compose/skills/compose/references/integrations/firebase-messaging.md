# Jetpack Compose — Firebase Cloud Messaging

**Wiring, configuration and anti-patterns only.** The messaging service, token
and message API is Context7's at use time.

FCM delivers push messages to the device. On Android the wiring is a service in
the manifest, the notification permission, and notification channels created
by the app before messages arrive.

## Setup order

1. **The shared Firebase base first** — the Google services plugin,
   `google-services.json` and the BoM, as in
   [Firebase Analytics](firebase-analytics.md).
2. **Catalog entry** for `firebase-messaging` through the BoM.
3. **Declare the messaging service** in the manifest: a class extending
   Firebase's messaging service, not exported, with the
   `com.google.firebase.MESSAGING_EVENT` intent filter. It is needed for
   foreground notifications and data payloads.
4. **Declare `POST_NOTIFICATIONS`** and request it at runtime on Android 13
   and later, from the moment the user asks for something that notifies, with
   a rationale screen when the system says one is due. Until it is granted no
   notification is shown.
5. **Create notification channels at startup**, in the `Application`, before
   any message can arrive. Name the default channel in the manifest's
   `default_notification_channel_id` meta-data; FCM uses it for any message
   that names no channel or names one the app has not created. Set the default
   notification icon and colour meta-data at the same time.
6. **Token flow:** the service's new-token callback fires on first generation
   and on every rotation — restore to a new device, reinstall, cleared data —
   and sends the token to the app server. Tokens are never cached as permanent.
7. **Delay token creation when consent is required** with the
   `firebase_messaging_auto_init_enabled` manifest entry set to false, enabled
   at runtime once the user opts in.

## Data versus notification messages

- **Notification messages** are shown by the SDK in the system tray while the
  app is in the background; the data payload is delivered only when the user
  taps it. In the foreground the app's receive callback gets both.
- **Data messages** always go to the app's receive callback, which runs on a
  worker thread and must finish within about 20 seconds — longer work is handed
  to [WorkManager](workmanager.md).
- Choose per message: notification for user-visible alerts the app need not
  process, data for anything the app must act on.

## Per platform

- **Phone and tablet:** supported. FCM requires Google Play services on the
  device, or an emulator image with Google APIs.
- **Wear OS, Android TV, Android Auto:** not confirmed.

## Anti-patterns

| Anti-pattern                                   | Instead                                          |
| ---------------------------------------------- | ------------------------------------------------ |
| Channels created when the first message lands  | create them at startup                           |
| Notification permission asked at launch        | ask from the action that needs it                |
| Token fetched once and stored forever          | resend on every new-token callback               |
| Long work in the receive callback              | hand it to WorkManager                           |
| An emulator image without Google APIs          | a Google APIs or Play image                      |
