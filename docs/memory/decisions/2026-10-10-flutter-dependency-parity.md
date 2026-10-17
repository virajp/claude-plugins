# Decision — the SwiftUI and Compose packs answer every 95octane Flutter dependency

**Date** 2026-10-10 · **Plan**
[`2026-10-10-swiftui-third-party-integrations/`](../../plans/2026-10-10-swiftui-third-party-integrations/index.md)
· **Completes** B61 and B99 · **Source** `95octane/frontend/pubspec.yaml`

## What was decided before

The Swift chain
([`2026-09-23-swift-native-stack.md`](./2026-09-23-swift-native-stack.md),
ruling E4) shipped SwiftUI with Apple's own integrations only and parked the
third-party set; the Compose pack shipped with its Jetpack integrations only. A
native product therefore had less coverage than a Flutter product.

## The map

Every dependency in the 95octane frontend's one pubspec has an answer on each
pack. Class: (i) an integration reference, (ii) a native answer in a topic file,
(iii) not applicable. Paths are relative to each pack's
`skills/<pack>/references/`.

| Dependency                    | Capability              | SwiftUI answer                                                      | Android answer                                                            | Class |
| ----------------------------- | ----------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------- | ----- |
| intl                          | i18n, formatting        | `ui-composition.md`, Localization                                   | `ui-composition.md`, Localization                                         | ii    |
| flutter_cache_manager         | file and HTTP cache     | `data-and-networking.md`                                            | `data-and-networking.md`                                                  | ii    |
| http, cupertino_http          | networking              | `data-and-networking.md`, URLSession                                | `data-and-networking.md`                                                  | ii    |
| cronet_http                   | networking              | not applicable                                                      | `data-and-networking.md`, client choice                                   | ii    |
| shared_preferences            | key-value storage       | `state-management.md`, Small settings: `@AppStorage`                | `integrations/datastore.md`                                               | ii    |
| flutter_secure_storage        | secure storage          | `data-and-networking.md`, Keychain                                  | `integrations/datastore.md`, Keystore                                     | ii    |
| package_info_plus             | app version info        | Bundle info, native                                                 | `build-and-variants.md`, BuildConfig                                      | ii    |
| device_info_plus              | device info             | `UIDevice`, native                                                  | `android.os.Build`, native                                                | ii    |
| flutter_native_splash         | splash screen           | `platform-interop.md`, System surfaces (launch screen)              | `platform-interop.md`, Splash screen                                      | ii    |
| upgrader                      | app update prompt       | `data-and-networking.md`, App version gate                          | `integrations/in-app-updates.md`                                          | i     |
| share_plus                    | share sheet             | `platform-interop.md`, System surfaces (`ShareLink`)                | `platform-interop.md`, the share sheet                                    | ii    |
| webview_flutter               | web view                | `integrations/webview.md`                                           | `integrations/webview.md`                                                 | i     |
| flutter_animate               | animation               | `ui-composition.md`                                                 | `ui-composition.md`                                                       | ii    |
| permission_handler            | runtime permissions     | `platform-interop.md`, System surfaces (usage strings)              | `platform-interop.md`                                                     | ii    |
| get (GetX)                    | state, routing, DI      | the state and navigation topics                                     | the state topic, Hilt, Navigation Compose                                 | ii    |
| crypto                        | hashing                 | CryptoKit, native                                                   | `MessageDigest`, native                                                   | ii    |
| path_provider                 | file paths              | `FileManager`, native                                               | `filesDir`, native                                                        | ii    |
| material_symbols_icons        | icons                   | SF Symbols, native                                                  | Material icons                                                            | ii    |
| image_picker                  | photo picking           | `platform-interop.md`, System surfaces (`PhotosPicker`)             | `platform-interop.md`, `integrations/camerax.md`                          | ii    |
| image_cropper                 | image crop              | `integrations/image-handling.md`, Cropping (TOCropViewController)   | `integrations/image-handling.md`, Cropping (CanHub Android-Image-Cropper) | i     |
| firebase_core                 | Firebase bootstrap      | `integrations/firebase-analytics.md`, shared by every Firebase file | `integrations/firebase-analytics.md`, shared by every Firebase file       | i     |
| firebase_auth                 | auth                    | `integrations/firebase-auth.md`                                     | `integrations/firebase-auth.md`                                           | i     |
| google_sign_in                | Google sign-in          | `integrations/firebase-auth.md`, Google Sign-In                     | `integrations/credential-manager.md`                                      | i     |
| sign_in_with_apple            | Apple sign-in           | `integrations/sign-in-with-apple.md`                                | `integrations/firebase-auth.md`, Apple provider                           | i     |
| firebase_crashlytics          | crash reporting         | `integrations/firebase-crashlytics.md`                              | `integrations/firebase-crashlytics.md`                                    | i     |
| firebase_analytics            | analytics               | `integrations/firebase-analytics.md`                                | `integrations/firebase-analytics.md`                                      | i     |
| firebase_messaging            | push                    | `integrations/firebase-messaging.md`                                | `integrations/firebase-messaging.md`                                      | i     |
| firebase_app_check            | attestation             | `integrations/firebase-app-check.md`                                | `integrations/firebase-app-check.md` (Play Integrity)                     | i     |
| firebase_storage              | cloud storage           | `integrations/firebase-storage.md`                                  | `integrations/firebase-storage.md`                                        | i     |
| geolocator                    | location                | `integrations/maps-and-location.md`, Core Location                  | `integrations/maps-and-location.md`, fused location provider              | i     |
| google_maps_flutter           | maps                    | `integrations/maps-and-location.md`, MapKit                         | `integrations/maps-and-location.md`, Maps Compose                         | i     |
| wakelock_plus                 | keep screen on          | `platform-interop.md`, System surfaces (idle timer)                 | `platform-interop.md`, Keep the screen on                                 | ii    |
| purchases_flutter (commented) | in-app purchase         | `integrations/revenuecat.md`                                        | `integrations/revenuecat.md`                                              | i     |
| flutter_webrtc (commented)    | real-time media         | `integrations/webrtc.md` (community WebRTC framework, LiveKit)      | `integrations/webrtc.md` (io.github.webrtc-sdk:android, LiveKit)          | i     |
| flutter_lints                 | lint                    | the swift-format and SwiftLint packs                                | the ktlint and detekt packs                                               | ii    |
| mockito                       | test mocks              | `testing.md`                                                        | `testing.md`                                                              | ii    |
| equatable, collection         | Dart language helpers   | not applicable: `Equatable`, the standard library                   | not applicable: `data class`, the standard library                        | iii   |
| smooth_page_indicator         | pager dots              | not applicable: a `TabView` page style                              | not applicable: `HorizontalPager`                                         | iii   |
| country_state_city            | static geo data         | not applicable: a data package, no platform capability              | not applicable: the same                                                  | iii   |
| build_runner, flutter_gen     | Dart code generation    | not applicable: Xcode generates asset symbols                       | not applicable: the R class                                               | iii   |
| flutter_launcher_icons        | icon generation         | not applicable: the asset catalog                                   | not applicable: mipmap resources                                          | iii   |
| intl_translation              | ARB code generation     | not applicable: String Catalogs (`ui-composition.md`)               | not applicable: string resources (`ui-composition.md`)                    | iii   |
| import_sorter                 | Dart formatting         | not applicable: swift-format                                        | not applicable: ktlint                                                    | iii   |
| dependency_validator          | Dart dependency hygiene | not applicable: SwiftPM resolution                                  | not applicable: Gradle locking                                            | iii   |
| network_image_mock            | Dart test shim          | not applicable                                                      | not applicable                                                            | iii   |
| flutter, flutter_test, …      | the Flutter SDK         | not applicable                                                      | not applicable                                                            | iii   |

SwiftUI now carries sixteen integration files (five Apple, eleven new) and
Compose twenty (seven Jetpack, thirteen new).

## The rulings

The SwiftUI rulings T1 to T3 and T12 are recorded in the Swift chain's addendum.
The rest:

- **T11 Compose set.** Thirteen files: the six Firebase files (App Check on Play
  Integrity, Auth with the Apple provider, Messaging with notification
  channels), `revenuecat.md` (with Google Play Billing), `image-handling.md`,
  `webrtc.md`, `maps-and-location.md` (Maps Compose and the fused location
  provider), `webview.md`, `credential-manager.md` (Google sign-in) and
  `in-app-updates.md` (Play In-App Updates). Rejected: the eleven only; only
  what 95octane uses.
- **T13 Native gaps.** Short additions to existing topic files, no new
  integration file: localization in each pack's `ui-composition.md`; share
  sheet, launch screen and keep-screen-on in each `platform-interop.md`;
  PhotosPicker and usage strings in SwiftUI's `platform-interop.md`;
  `@AppStorage` in SwiftUI's `state-management.md`. Rejected: localization only;
  record only.
- **T14 Images, Android.** Coil 3 with one shared `ImageLoader`; the cropper is
  CanHub Android-Image-Cropper, the candidate Context7 carried (it has no uCrop
  entry). Rejected: Glide.
- **T15 WebRTC, Android.** Two sections like SwiftUI's: the prebuilt libwebrtc
  artifact `io.github.webrtc-sdk:android` first, then the LiveKit Android SDK.
  Rejected: one section only.
- **T16 Parity record.** This doc. Rejected: a shipped `from-flutter.md` in each
  pack; both.

## What stands on it

A native product built on either pack has the coverage a Flutter product has
today. Parked: the Google Maps SDK for iOS as a third-party option beside
MapKit.
