# Cloudflare Realtime — service doctrine

The service's own usage rules. It realizes no vwf capability token, so
there is no `assets/contracts/` doctrine to satisfy clause by clause —
`realtime` is one of the categories the taxonomy records as a known
vwf-side gap, and this states its rules directly instead.

## The app is the boundary, and it is the first decision

An app is created once per environment against the account API, and the
response carries the two things that matter — a **uid** (the app id) and
a **secret** (the bearer token)
([create an app](https://developers.cloudflare.com/api/go/resources/calls/subresources/sfu/methods/create)).
The secret is returned at creation and is the credential every subsequent
call presents.

**Every session inside an app can pull every track inside that app.** A
track pushed anywhere in the app is retrievable by id from any session in
it
([sessions and tracks](https://developers.cloudflare.com/realtime/sfu/sessions-tracks/)).
So the app is not an organizational unit — it is the isolation unit, and
one app shared between staging and production means a staging session
holding a production track id pulls production media. Separate apps per
environment; the ids and secrets differ and nothing else does.

**Rooms are not a thing the service has.** A room is a set of track ids
the product decides a participant may pull. Nothing enforces it but the
product's own signalling, which is why the signalling seam below is a
correctness surface rather than plumbing.

## The session lifecycle

Everything hangs off `/apps/{appId}/sessions`, and the connection API
covers exactly four moves — initiate a session, add or remove tracks,
renegotiate, and read a session's state
([SFU HTTPS API](https://developers.cloudflare.com/realtime/sfu/https-api/)).
Two of the four are worth naming here because their contracts are the
ones a design gets wrong:

| Step | Call |
| --- | --- |
| Open a PeerConnection | `POST /apps/{appId}/sessions/new` |
| Re-negotiate when told to | `PUT …/sessions/{sessionId}/renegotiate` |

Look the track endpoints up at use time rather than from memory; their
paths and request bodies are the API reference's, not this pack's.

**Renegotiation is not optional and not a retry.** When a response comes
back carrying `requiresImmediateRenegotiation`, the client must complete
an SDP exchange through the renegotiate endpoint before the session is
usable again
([renegotiate](https://developers.cloudflare.com/realtime/sfu/https-api/)).
A client that ignores the flag does not error — it goes quiet, which is
the failure mode worth writing a test for.

**Closing a track takes the track's `mid` plus a session description**,
and the request carries a `force` flag
([API definition](https://developers.cloudflare.com/realtime/static/realtime-api-2024-05-21.yaml));
closing is an explicit operation, not a side effect of the client going
away.

**Operations need a connected PeerConnection.** Pushing or pulling waits
up to **5 seconds** for the connection state to reach connected before
timing out
([limits](https://developers.cloudflare.com/realtime/sfu/limits/)). A
product that fires the track call in parallel with the connection setup
sees that timeout under load and reads it as a service fault.

## The limits that shape the design

From [limits, timeouts and quotas](https://developers.cloudflare.com/realtime/sfu/limits/):

- **50 API calls per second per session**, with no application-level rate
  limit. The ceiling is per session, so a design that batches per
  participant scales and one that calls per track does not.
- **Up to 64 tracks per API call**; more than that is a second call. A
  large room's join is therefore paged, and the paging is the product's
  to write.
- **No hard track ceiling per session** — the constraint is the
  connection's bandwidth, which means the limit that bites is the
  client's network and has to be discovered by measurement rather than
  read off a table.
- **Tracks are garbage collected after 30 seconds without media
  packets.** A muted participant who genuinely sends nothing loses the
  track; the product either keeps a silence stream flowing or treats the
  collection as expected and re-publishes.
- **A `waitForAck` DataChannel is torn down** if the subscriber does not
  acknowledge within 30 seconds of creation.

## DataChannels have their own sequence

They are not a mode of a track. The transport is established per session
with `POST …/datachannels/establish` after the SDP exchange; the
publisher creates a named channel with `location: "local"`, each
subscriber creates the same name with `location: "remote"` and the
publisher's session id, and every client then calls the browser's
`createDataChannel()` with `negotiated: true` and the id the API returned
([DataChannels](https://developers.cloudflare.com/realtime/sfu/datachannels/)).
The `negotiated: true` is the part that gets skipped and the part that
makes the channel never open.

## The signalling seam the project owns

The product needs, at minimum, a place that knows: who is in the room,
which track ids belong to whom, and who is allowed to pull which. None of
that is Realtime's. At this provider it belongs in a Durable Object —
`cloud-service/durable-objects`, bundle `cloudflare-durable-objects` —
whose doctrine is that component's and is not restated here. Two rules
about the seam are this component's:

**The Worker holds the app secret; the client holds nothing.** A client
asks the signalling seam to do something and the seam calls the API. A
design that hands a browser the app secret so it can call the SFU
directly has given every participant the ability to pull every track in
the environment.

**Authorization happens at the seam, on every subscribe.** Track ids are
opaque but they are not secret — they travel to whoever is told them. The
check that a participant may pull a track is the product's, and it runs
when the pull is requested rather than when the room was joined.

## Errors and reconnection

Two failure classes need different handling and are easy to conflate. An
**API error** — a rejected call, an expired credential, a timed-out
connection state — is the product's to retry or surface. A **media
interruption** — the network moved, the connection dropped — resolves
through WebRTC's own machinery and a renegotiation, not through
re-creating the session. Tearing down and rebuilding a session on every
blip is a recovery strategy that turns a two-second glitch into a
ten-second one and multiplies the egress bill by the reconnect rate.

Sessions and tracks are cheap to create and are not cleaned up by a
client disappearing — the 30-second collection is the only sweeper. A
product that wants a participant list to be accurate maintains it at the
seam and does not infer it from the service.
