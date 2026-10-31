# SwiftUI — real-time audio and video (WebRTC, LiveKit)

**Wiring, configuration and anti-patterns only.** The API surface — peer
connections, media tracks and capturers, session descriptions, rooms and
participants, the audio manager, the video views — is Context7's at use time,
and is the half that ages. This reference carries the setup order, the
capabilities and the audio-session rules a per-type lookup gives only
piecemeal.

Two ways in, and the product picks one. **Plain WebRTC** is the WebRTC
framework itself: peer-to-peer media, with **no signalling** — exchanging
session descriptions and ICE candidates is the product's own transport and
server, and a group call is a mesh the product builds. **LiveKit** is a client
for a LiveKit server, an SFU: the server routes media between participants,
and the SDK wires signalling and the audio session for you. Pick
plain WebRTC for one-to-one calls over a signalling path the product already
owns; pick LiveKit for group calls or when no signalling server exists.

## Plain WebRTC

### Setup order

1. **Add the WebRTC framework through Swift Package Manager**, as the
   community distribution of the official, unmodified WebRTC framework: a
   binary xcframework, one release per Chromium milestone. Pin the milestone
   and move it on purpose; SwiftPM validates the binary's checksum.
2. **Declare the usage strings** — camera and microphone usage descriptions
   in the app's information property list, worded for the call. The system
   shows them when it asks; ask at the moment the user starts or answers a
   call, not at launch.
3. **Configure the audio session for a call** — the play-and-record category
   with the voice-chat mode — when the call starts, and deactivate it when the
   call ends. Under CallKit, the session is activated by the system: start
   call audio in the provider's did-activate callback and stop it in
   did-deactivate, never before.
4. **Add Background Modes → Audio** if the call must continue with the screen
   locked or the app in the background; without it, call audio stops when the
   app leaves the foreground.
5. **Wire CallKit for incoming calls** on iOS and iPadOS: the system call UI,
   the lock-screen answer, and the audio session handover. Incoming calls
   while the app is not running arrive as **VoIP pushes through PushKit**, and
   every VoIP push is reported to CallKit as a new incoming call straight
   away; the backend sends them with the VoIP push type to the app's bundle
   id with the VoIP suffix as topic. See
   [push notifications](push-notifications.md) for the APNs credential.
6. **Build the signalling path** — the product's WebSocket or API that
   carries offers, answers and ICE candidates — and serve the STUN and TURN
   server list from the product's backend as configuration, so it can change
   without an app release. No TURN credential is compiled into the app.

### Structure

- **One call module** owns the peer connections, the media capture, the
  audio session and the CallKit provider; views observe its state. A SwiftUI
  view never holds a peer connection.
- **A video view that is a UIKit or AppKit view** is hosted through a
  representable — see [platform interop](../platform-interop.md).
- **Release media on hang-up**: stop every track and close every peer
  connection so the camera and microphone indicators turn off.

## LiveKit

### Setup order

1. **Add the LiveKit Swift SDK through Swift Package Manager**; it is one
   library product, `LiveKit`, and brings its own prefixed WebRTC build, so it
   is never added beside the plain WebRTC framework.
2. **Get the server URL and a participant token from the product's backend.**
   The URL is the LiveKit server's WebSocket address; the token is a JWT the
   backend mints per participant and room with the LiveKit API secret, which
   is a backend **secret** and never enters the app repo.
3. **Declare the camera and microphone usage strings**, as for plain WebRTC.
4. **Let the SDK configure the audio session** — on iOS, tvOS and visionOS it
   does so automatically as the audio engine starts and stops.
5. **With CallKit, take the audio session back**: as early as possible,
   before connecting to a room, turn off the SDK's automatic audio session
   configuration and mark the audio engine unavailable; in the provider's
   did-activate callback set the call category and mode and make the engine
   available, and in did-deactivate make it unavailable again. The VoIP push
   rules of plain WebRTC apply unchanged.
6. **Decide the background camera behaviour.** By default the SDK suspends
   local camera tracks when the app enters the background and resumes them on
   return; turn that room option off only when the product must keep sending
   video, with the background mode that allows it.

### What the SDK wires for you

Signalling, region selection and failover on LiveKit Cloud, track
publication and subscription, and — outside CallKit — the audio session. Audio
from subscribed tracks plays without further wiring. What it does not do is
issue tokens, decide who may join a room, or own the call UI.

## Per platform

- **iOS and iPadOS:** plain WebRTC (iOS device and simulator slices) and
  LiveKit (iOS 13 and later); CallKit and PushKit VoIP pushes as above.
- **macOS:** plain WebRTC (macOS and Mac Catalyst slices) and LiveKit (macOS
  and Mac Catalyst); LiveKit leaves the audio session alone on macOS.
- **tvOS:** LiveKit (tvOS 17 and later); plain WebRTC not confirmed.
- **visionOS:** LiveKit, installed through Swift Package Manager; plain WebRTC
  not confirmed.
- **watchOS:** not confirmed for either; the VoIP push type is not available
  on watchOS.
- **CarPlay:** not confirmed.

## Anti-patterns

| Anti-pattern                                     | Why                                                   | Instead                                         |
| ------------------------------------------------ | ----------------------------------------------------- | ----------------------------------------------- |
| Expecting WebRTC to provide signalling           | It has none; calls never connect                      | The product's own signalling path, or LiveKit   |
| Plain WebRTC framework beside LiveKit            | Two WebRTC builds in one binary                       | LiveKit's bundled build only                    |
| LiveKit token minted in the app                  | The API secret ships in the binary                    | Backend issues a per-participant token          |
| TURN servers or credentials compiled in          | Cannot rotate; a credential leak                      | Served by the backend as configuration          |
| Starting call audio before CallKit activates it  | The system has not granted the session; audio fails   | Start in did-activate, stop in did-deactivate   |
| LiveKit's automatic audio session under CallKit  | Two owners of one audio session                       | Turn it off before connecting                   |
| VoIP push not reported to CallKit                | The system expects every VoIP push to become a call   | Report the call as the push arrives             |
| No background audio mode                         | The call goes silent when the screen locks            | Background Modes → Audio                        |
| Tracks left running after hang-up                | Camera and microphone stay on; battery drains         | Stop tracks and close connections on hang-up    |
| Permission prompts at first launch               | Denied before the user sees why                       | Ask when the user starts or answers a call      |
