# Jetpack Compose — WebRTC

**Wiring, configuration and anti-patterns only.** The peer-connection, track,
renderer and room API is Context7's at use time.

Two ways to put real-time audio and video in an Android app, each with its own
setup order. **Plain WebRTC** is the library alone: the product brings its own
signalling and its own servers, and owns every peer connection. **LiveKit** is
a client for a LiveKit server (an SFU, self-hosted or LiveKit Cloud): the
server routes media, and the SDK owns the connections. Pick one per app; the
product's architecture, not this file, decides which.

## Plain WebRTC — a prebuilt libwebrtc

**`io.github.webrtc-sdk:android`** — chosen on Context7 evidence: a prebuilt
libwebrtc AAR whose version follows the upstream libwebrtc release it was
built from, in three variants: the standard one; a **prefixed** one that moves
`org.webrtc` to `livekit.org.webrtc` so it cannot clash with another bundled
copy; and a **prefixed-stripped** one that drops the software video codecs to
shrink the app.

### Setup order

1. **Catalog entry** for the one variant the app needs. Two WebRTC copies in
   one app conflict; when a dependency already bundles one, take the prefixed
   variant.
2. **Manifest permissions**: `INTERNET`, `CAMERA`, `RECORD_AUDIO`,
   `MODIFY_AUDIO_SETTINGS`, and `BLUETOOTH_CONNECT` for a Bluetooth headset.
   `CAMERA`, `RECORD_AUDIO` and `BLUETOOTH_CONNECT` are also requested at run
   time, from the action that starts a call, per
   [platform interop](../platform-interop.md); a denied state is drawn.
3. **Initialise the peer-connection factory once per process**, before any
   factory is created — in a call module bound through [Hilt](hilt.md) as a
   singleton, never from a composable.
4. **Signalling is the product's.** WebRTC defines no signalling: exchanging
   offers, answers and ICE candidates runs over the product's own transport
   (a WebSocket to its backend). The ICE server list — STUN and TURN, with
   their credentials — comes from that backend at call time, never from
   constants in the app.
5. **Audio routing**: a call sets the communication device through
   `AudioManager` (speaker, earpiece, wired or Bluetooth headset) and records
   from the voice-communication source; the call module restores the previous
   routing when the call ends.
6. **An ongoing call runs in a foreground service** with a notification, so it
   survives the user leaving the app. Start it while the app is in the
   foreground — apps targeting Android 12 or later cannot start one from the
   background — and declare the service's foreground-service type in the
   manifest; a foreground service started without a type throws.

## LiveKit — the LiveKit Android SDK

### Setup order

1. **Catalog entries** for `io.livekit:livekit-android`; add
   `livekit-android-camerax` for CameraX capture controls and
   `livekit-android-track-processors` only for effects such as a virtual
   background. Add the JitPack repository to `settings.gradle.kts`'s
   dependency resolution, as the SDK's README requires.
2. **`CAMERA` and `RECORD_AUDIO` are requested at run time** before the
   camera or microphone is enabled, from the action that joins the call.
3. **The server URL and participant token come from the product's backend**,
   which mints the token with a LiveKit server SDK. The app never holds the
   server's credentials. LiveKit's development token server is for prototypes
   only and never ships.
4. **One room per call, created with the application context** in a call
   module bound through Hilt; connect with the URL and token, then enable the
   microphone and camera. Room events arrive as a `Flow`, collected in the
   call module and mapped to call state.
5. **Audio routing is the SDK's**: its audio handler prefers a Bluetooth
   headset, then a wired one, then the speaker, then the earpiece. The app
   overrides that order only for a product reason.
6. **Compose rendering**: the SDK ships a Compose package, and LiveKit
   Components for Android adds ready composables over it.
7. **An ongoing call runs in a foreground service**, as in the plain WebRTC
   setup above.

## Structure

- **One call module in the data layer** owns the factory or the room, the
  tracks and the audio routing, and exposes the call as state; ViewModels
  drive it, screens render it.
- **Every track, peer connection and room is released at hang-up**, in one
  place, so the camera and microphone indicators go off.
- **Video renderers are bound to the composable's lifecycle**, attached when
  shown and detached when disposed.

## Testing

- **Unit tests use a fake call module**; signalling is tested against a fake
  transport.
- **Media paths are tested on two devices or emulators** against a real
  signalling server or a LiveKit server; there is no camera or microphone
  under Robolectric.

## Per platform

- **Phone and tablet:** supported, for both.
- **Wear OS, Android TV, Android Auto:** not confirmed.

## Anti-patterns

| Anti-pattern                                       | Instead                                       |
| -------------------------------------------------- | --------------------------------------------- |
| Two WebRTC copies in one app                       | one variant; the prefixed one beside another  |
| ICE servers or TURN credentials hard-coded         | fetched from the backend per call             |
| LiveKit server credentials, or the dev token server, in the app | tokens minted by the backend |
| Permissions requested at app launch                | request from the action that starts the call  |
| A call that dies when the user leaves the app      | a typed foreground service                    |
| Tracks and connections left open after hang-up     | release everything in the call module         |
| The factory or room created in a composable        | a Hilt-bound call module                      |
