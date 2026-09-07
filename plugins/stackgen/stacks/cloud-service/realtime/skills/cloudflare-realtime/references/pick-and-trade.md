# Cloudflare Realtime — pick & trade

## What it is for

A **selective forwarding unit** — a pub/sub server for media. Clients
connect over WebRTC and push tracks to it or pull tracks from it; every
Cloudflare server behaves as one entity, so a client is served from
wherever it is
([introduction](https://developers.cloudflare.com/realtime/sfu/introduction/)).
Beside it, a **TURN service** relays for the clients whose network
refuses a direct path, and a free unlimited STUN service for the ones
that only need to discover their address
([TURN FAQ](https://developers.cloudflare.com/realtime/turn/faq/)).

The shape it fits is **many participants exchanging live audio, video or
low-latency control data**, where the product owns who may publish, who
may subscribe, and how participants find each other.

## When it is the answer

- **More than a handful of participants in one room.** Every additional
  participant in a mesh costs every other participant an upload stream;
  an SFU makes each client upload once regardless of how many are
  listening.
- **The product wants to own the room model.** Realtime forwards tracks
  and takes no view on rooms, roles or permissions — that is a reason to
  pick it, not a gap, when the product's access rules are its own.
- **Latency is the requirement and durability is not.** Media that
  matters while it is happening and not afterwards.
- **The data is small, frequent and must not queue.** DataChannels carry
  chat, game state, sensor readings and control events over the same
  WebRTC transport
  ([DataChannels](https://developers.cloudflare.com/realtime/sfu/datachannels/)).

## When it is the wrong answer

- **Two participants on good networks.** Peer-to-peer WebRTC with STUN
  costs nothing to relay and adds no hop. Reach for the SFU when the
  participant count, the recording requirement or the network's refusal
  to allow a direct path makes the mesh untenable — not before. STUN is
  free and unlimited, so the cheap case stays cheap.
- **State a client subscribes to.** A cursor position, a document, a
  presence list, a live counter — that is data synchronization over
  WebSockets, which at this provider is Durable Objects
  (`cloud-service/durable-objects`). This is the distinction that keeps
  `capability` unset here rather than claiming vwf's `realtime-sync`
  token.
- **One-to-many broadcast to a large passive audience.** A player pulling
  a segmented stream is a different product with a different bill; an SFU
  keeps a PeerConnection per viewer.
- **Anything that must exist after the call.** Tracks are garbage
  collected 30 seconds after their media stops
  ([limits](https://developers.cloudflare.com/realtime/sfu/limits/)).
  Nothing here is storage.
- **A product that wants a meeting, not a media plane.** If the ask is
  "a video call UI", the prebuilt path is RealtimeKit's UI Kit over its
  Core SDK
  ([SDK selection](https://developers.cloudflare.com/realtime/realtimekit/sdk-selection/)),
  and picking it means the session, track and signalling design below
  stops being the product's.

## The trade against the neighbours

**Against a managed video platform with its own room model.** Those sell
rooms, participants, roles and often recording as concepts; Realtime
sells sessions and tracks. The trade is control against surface area —
the product writes its own join, leave, mute and permission semantics,
and in return there is no vendor room model to bend when the product's
does not match. Pick the platform when the room model is the product's
requirement rather than its obstacle.

**Against peer-to-peer WebRTC.** The honest question is not "do we want
an SFU" but "how many upstreams does a client have". One remote peer is
one upstream and needs no forwarding unit; five is five, and the fifth
participant's laptop is where that design fails first. TURN is still
needed in the peer-to-peer case for restrictive networks, and Realtime
sells TURN on its own — so a project may pin this for TURN alone and
never touch the SFU.

**Against Durable Objects WebSockets.** Media versus data, and the line
is sharper than it looks. A DataChannel here is WebRTC transport between
peers, unordered and unreliable if the product asks for that, with the
SFU forwarding frames. A Durable Object WebSocket is a connection to a
single authoritative object that holds state and can answer "what is true
now". Chat that must survive a reload is the object's; chat that is
ephemeral commentary over a live call can ride the DataChannel. When both
are wanted, both are pinned — they are not alternatives.

## What choosing it does not decide

**Signalling.** Realtime never tells a participant that another joined,
left, or published a track. That is application state, and the product
still has to build it and pin somewhere to keep it — see
[service doctrine](service-doctrine.md).

**Where the server driving it runs.** This is a backing pin beside a
hosting entry, not instead of one. And it does not decide the product's
storage answer: if a call must be reviewable afterwards, something else
is holding the recording.
