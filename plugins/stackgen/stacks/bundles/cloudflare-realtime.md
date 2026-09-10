---
name: Cloudflare Realtime
axis: backing
kind: cloud-provider
components:
- cloud-provider/cloudflare@0.1.0
- cloud-service/realtime@0.1.0
---

# Backing — Cloudflare Realtime

A **WebRTC selective forwarding unit and TURN service** — the media plane
behind a call, a live room or a low-latency control channel. Clients push
audio, video and data tracks to it and pull each other's; it forwards
them across Cloudflare's network and stores nothing. Pick it when more
than a couple of participants share live media, when the product wants to
own the room and permission model rather than inherit a vendor's, and
when what matters is the media while it is happening rather than
afterwards.

**The composition is the provider plus one service**, which is what a
Cloud-Bundle is. The provider component carries what spans services — the
account and role model behind every grant, the billing principle, what
does and does not exist on a laptop, and the scope fence saying which
Cloudflare services this stack offers at all. The service component
carries this one service and **cites** that doctrine rather than
restating it, so the account-level facts are written once.

**What pinning it gives a project** is the doctrine, not a file. This
component ships no configuration, and unlike every other Cloudflare
backing entry there is nothing for it to describe adding: Realtime has
**no Wrangler binding**. It is an HTTPS API keyed by an app id with a
bearer app secret, which is the fact the rest follows from — the
credential the server holds and the client never sees, the short-lived
TURN credentials issued per user, and a local story that is "there isn't
one". What comes with the pin is the judgment — the session and track
lifecycle against the stated limits, the renegotiation path a client that
ignores it fails silently on, the thirty-second collection of a track
whose media stopped, an egress-only bill in which a subscriber costs and
a publisher nearly does not, and the reason a fake belongs at the
project's own signalling seam rather than at the service.

**It pins beside other backing entries rather than instead of them.**
`backing_template` is, in vwf's own words, "A LIST: one slug per
capability the project needs — datastore, identity, queue, object
storage, telemetry sink". So a product with a media plane still pins its
datastore and its identity answer beside this one; nothing here decides
which of them the product needs.

**And one of those neighbours is not optional in practice.** Realtime
forwards tracks and takes no view on rooms — who has joined, which track
ids belong to whom, and who may pull which are all application state the
product holds. A Realtime pin therefore **expects a
`cloudflare-durable-objects` pin beside it** to hold that signalling and
room state; that bundle's component owns the doctrine and this one does
not restate it. A pin standing alone is a design with the room model
still unplaced, which is worth catching at the point the axis is written
rather than at the point the second participant joins.

**What this bundle decides that neither component decides alone** is that
the **app is the environment boundary**, and that this is a correctness
rule rather than tidiness. Every session inside an app can pull every
track inside that app, so one shared app with a naming convention means a
staging session holding a production track id pulls live production
media, and nothing in the API refuses it. One app per environment, each
with its own id and secret — the same shape the KV bundle reaches for
with namespaces, arrived at from a sharper direction, because here the
data in question is somebody's camera.

**The category realizes no vwf capability token**, and the near miss is
worth naming: `realtime` is one of the categories the taxonomy records as
a known vwf-side gap, and the token that looks close — `realtime-sync` —
is *data* synchronization, which at this provider is Durable Objects. So
`capability` stays unset here and nothing in this bundle mints a media
token; that is vwf's move.

Full judgment: the components' own skills and their references.
