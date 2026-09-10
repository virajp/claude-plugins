# Cloudflare Realtime — conventions

A **selective forwarding unit** on Cloudflare's network. Clients connect
over WebRTC and push or pull audio, video and DataChannel tracks; the SFU
forwards them and never stores them
([introduction](https://developers.cloudflare.com/realtime/sfu/introduction/)).
Beside it sits a **TURN service** for the clients whose network will not
allow a direct path
([TURN FAQ](https://developers.cloudflare.com/realtime/turn/faq/)).

**Two nouns carry the model.** A **Session** is one client's
PeerConnection. A **Track** is one media or data stream inside it,
aligned with the browser's `MediaStreamTrack`; pushing a track returns an
id, and any session **in the same app** can pull it — tracks are global
to the app, not to a room
([sessions and tracks](https://developers.cloudflare.com/realtime/sfu/sessions-tracks/)).
That is the fact the environment rule below is built on.

**Calls is the older name for this product.** The docs live under
`/realtime/` now, and the account API still spells the old one — apps are
created at `POST /accounts/{account_id}/calls/apps`, and the token
permissions are still `Calls Read` and `Calls Write`
([create an app](https://developers.cloudflare.com/api/go/resources/calls/subresources/sfu/methods/create)).
Stated once here so no reference restates it.

**There is no Wrangler binding, and that is the shape of everything
else.** The SFU is reached over an HTTPS API keyed by an **app id** in
the path and an **app secret** as a bearer token
([SFU HTTPS API](https://developers.cloudflare.com/realtime/sfu/https-api/)),
both minted when the app is created
([get started](https://developers.cloudflare.com/realtime/sfu/get-started/)).
So there is no `wrangler.jsonc` entry to add for this service, nothing to
run locally against a simulation, and no `remote` flag that means
anything — a laptop and a deployed Worker call the same live service.
Where the app secret lives is the provider's rule, not a new one: a
secret injected at the process boundary and catalogued by name in
`docs/blueprint/environment.md`, per the `cloudflare` skill's identity
and IAM reference. Its **runtime** home in a hosted environment is the
`cloud-service/secrets-store` component; on a laptop and in CI it is
whatever `capability-provider/` the repo already pinned.

**The app secret is server-side and stays there.** A browser never holds
it. The Worker calls the API; the client negotiates WebRTC with the SFU
using what the Worker hands back, and the TURN half is handled by
**short-lived credentials generated per user** from a separate TURN key
([generate TURN credentials](https://developers.cloudflare.com/realtime/turn/generate-credentials/)).

**Signalling is the project's, and it usually lives in a Durable
Object.** Nothing in Realtime tells one participant that another has
joined, left, or published a track — who is in a room and what they may
subscribe to is application state the product owns. At this provider that
state belongs in `cloud-service/durable-objects` (bundle
`cloudflare-durable-objects`), whose doctrine is that component's and is
not restated here. A Realtime pin with no such pin beside it is a design
with a hole in it.

**RealtimeKit is the layer above, not this component.** It is an SDK pair
— a UI Kit of prebuilt meeting components over a Core SDK — built on top
of the SFU, with its own apps under `/realtime/kit/`
([SDK selection](https://developers.cloudflare.com/realtime/realtimekit/sdk-selection/)).
This pack's subject is the SFU and TURN plane a product drives itself. A
product that wants a meeting UI rather than a media plane is choosing a
different thing, and choosing it means the signalling and room model
above stop being the product's problem.

## What this component does not cover

**Data synchronization** — a client subscribing to state that changes —
is `cloud-service/durable-objects`, and it is why this pack leaves
`capability` unset rather than claiming vwf's `realtime-sync` token.
**Stored or archived media** is object storage,
`cloud-service/r2`; the SFU forwards and holds
nothing, so anything that must exist after the call ends was written
somewhere by the product. Which Cloudflare services are offered or
declined is the provider component's to state — see the
`cloud-provider/cloudflare` component's conventions, in this
composition's template, and do not fill a gap from general Cloudflare
knowledge.

Full judgment: the `cloudflare-realtime` skill and its references. The
provider-wide half — the billing principle, the account and role model,
what exists locally — is the `cloudflare` skill's, cited throughout and
restated nowhere.
