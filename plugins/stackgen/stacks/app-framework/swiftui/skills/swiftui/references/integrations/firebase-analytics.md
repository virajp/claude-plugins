# SwiftUI — analytics (Firebase Analytics)

**Wiring, configuration and anti-patterns only.** The API surface — event and
parameter names, user properties, the consent types, the screen-view helpers —
is Context7's at use time, and is the half that ages. This reference carries
the setup order, the property-list entries and the consent and tracking
interplay a per-type lookup gives only piecemeal.

Firebase Analytics is the measurement half of the Firebase SDK for Apple
platforms; every other `firebase-*.md` reference here shares its bootstrap — one
SwiftPM package, one `GoogleService-Info.plist`, one `FirebaseApp.configure()`.
Write that bootstrap once, in the composition root, and every Firebase product
the app adds hangs off it.

## Setup order

1. **Add firebase-ios-sdk through SwiftPM** and link only the products the app
   uses. Analytics ships as three products that differ in their advertising
   posture: `FirebaseAnalytics` collects the advertising identifier when App
   Tracking Transparency allows it and includes on-device conversion
   measurement; `FirebaseAnalyticsIdentitySupport` collects the identifier
   without the conversion measurement; `FirebaseAnalyticsCore` never collects
   it — the one for a kids app or any app whose privacy posture rules
   advertising data out. Link exactly one.
2. **Add `-ObjC` to Other Linker Flags** on the app target — a SwiftPM
   requirement Analytics carries.
3. **Put `GoogleService-Info.plist` in the app target**, one per Firebase
   project, and select it per build configuration where development and
   production are separate projects; see
   [build & signing](../build-and-signing.md). It is configuration, not a
   secret, but it decides which project receives the data.
4. **Call `FirebaseApp.configure()` once at app start**, in the SwiftUI `App`'s
   initializer or the application delegate attached through the delegate
   adaptor — see [platform interop](../platform-interop.md) — before any
   Firebase product is touched.
5. **Decide collection before the first launch.** The
   `FIREBASE_ANALYTICS_COLLECTION_ENABLED` key in the app's `Info.plist` sets
   whether collection starts on; the app's `Info.plist` wins over the same key
   in `GoogleService-Info.plist`. Start it off where consent must come first,
   and turn it on from the consent flow.
6. **Wire consent.** The consent state — analytics storage, ad storage, ad user
   data, ad personalization — is set from the app's own consent screen and
   updated whenever the user changes it.
7. **Order App Tracking Transparency after the value is shown.** The
   advertising identifier is only collected once the user authorizes tracking,
   so the system prompt is asked in context, never at first launch — and only
   by an app that linked a product which collects the identifier.
8. **Log screens explicitly.** The SDK's guidance for SwiftUI is manual
   screen-view logging where each screen appears; do it from one helper, with
   names from one list, rather than per view.

## Swizzling

Firebase swizzles the application delegate to connect Analytics, Auth and
Messaging to system callbacks. Setting `FirebaseAppDelegateProxyEnabled` to
`NO` in `Info.plist` turns that off for every product at once; each product
then needs its callbacks forwarded by hand, as its own reference describes.
Decide once for the app, not per product.

## Debugging

- **Debug logging** is a scheme launch argument, `-FIRDebugEnabled`, on the
  shared Run scheme's development configuration only. The Analytics-specific
  debug-mode flag that feeds DebugView is Context7's at use time.
- **DebugView** is for the developer's device; never ship a build with debug
  mode forced on.

## Per platform

- **iOS and iPadOS** — supported.
- **macOS** — supported (Mac Catalyst as well).
- **tvOS** — supported.
- **watchOS** — not available.
- **visionOS** — not confirmed; Firebase calls its visionOS support community
  support only.
- **CarPlay** — not confirmed.

## Anti-patterns

| Anti-pattern                                       | Why                                                     | Instead                                        |
| -------------------------------------------------- | ------------------------------------------------------- | ---------------------------------------------- |
| Linking more than one Analytics product            | Surface and advertising posture the app did not choose  | Exactly one product, picked for the posture    |
| Collection on before the user consents             | Data sent without a lawful basis                        | Start off in `Info.plist`; enable on consent   |
| Tracking prompt at first launch                    | Denied before the value is seen                         | Ask in context, after the value is shown       |
| Relying on automatic screen reporting in SwiftUI   | SwiftUI screens go unreported or misnamed               | Log screen views explicitly from one helper    |
| Event names as literals across views               | Drift and typos split one event into many               | One list of names in the analytics module      |
| One `GoogleService-Info.plist` for every build     | Development traffic pollutes production data            | One per Firebase project, per configuration    |
| Swizzling turned off for one product only          | The flag is app-wide; the others silently stop working  | Decide once; forward every product's callbacks |
| `-FIRDebugEnabled` left in a shipped scheme        | Verbose logs in production builds                       | Development configuration of the Run scheme    |
