# Cloudflare Realtime — local dev

**There is no local form of this service, and that is a property of what
it is rather than a gap Cloudflare has not filled yet.** The provider's
local development map owns the general shape — the `cloudflare` skill —
including its per-binding table of what simulates and what does not. This
row is the one this component owns, and it is the row that says the table
does not apply.

## Why there is nothing to run

The per-binding table is about bindings, and **Realtime has none**. The
SFU is reached over an HTTPS API with an app id and a bearer app secret
([SFU HTTPS API](https://developers.cloudflare.com/realtime/sfu/https-api/)),
so there is no `wrangler.jsonc` entry to resolve, no local simulation
behind it, and no `--remote` flag that means anything for it. A laptop
calls the same live service a deployed Worker does.

Nor could a simulation be meaningful. The service is a WebRTC selective
forwarding unit spread across Cloudflare's network, presenting itself to
clients as one entity
([introduction](https://developers.cloudflare.com/realtime/sfu/introduction/));
the whole reason to use it is the topology, and a single-process fake of
the topology proves nothing about it.

The `local_stack` harness answer is therefore **`n/a`** with the
mechanism "None", the same honest answer the `zero-trust-access`
component gives for the same class of reason.

## The substitution: a development app

The workable arrangement is **a separate app for development**, created
the same way the staging and production ones are, with its own app id and
its own app secret
([get started](https://developers.cloudflare.com/realtime/sfu/get-started/)).
A laptop session then does real work against the real service, isolated
from every other environment — because the app is the isolation unit, and
every session inside an app can pull every track inside it
([sessions and tracks](https://developers.cloudflare.com/realtime/sfu/sessions-tracks/)).

Two consequences of that arrangement are worth stating plainly:

- **Development traffic is billed and metered.** The meter is data egress
  and the free tier is shared across the whole account
  ([pricing](https://developers.cloudflare.com/realtime/sfu/pricing/)),
  so a laptop testing video spends the same allowance production does.
  See [cost shape](cost-shape.md).
- **A development app needs its own credential handling.** It is a
  different secret, not a different mode of the same one, and it is
  catalogued and injected like any other — see
  [identity shape](identity-shape.md).

## The seam that makes tests possible

Because there is nothing to fake at the service, **the thing to fake is
the product's own signalling seam** — the layer that knows who is in a
room and which track ids they may pull. That layer is the product's
already ([service doctrine](service-doctrine.md)), so the substitution
sits at a boundary the project owns rather than at a vendor one.

What a test on that side can cover: room membership, join and leave
ordering, the authorization decision on every subscribe, what happens
when a participant's track disappears, and the reconnection path. Those
are the parts most likely to be wrong, and none of them needs media to
flow.

What it cannot cover, and what therefore has to be exercised against a
real app in a deployed environment or not at all:

- **Media actually arriving.** A signalling suite that goes green is
  compatible with every participant seeing a black rectangle.
- **Renegotiation.** The `requiresImmediateRenegotiation` path is driven
  by the service, and a client that ignores it goes quiet rather than
  erroring
  ([SFU HTTPS API](https://developers.cloudflare.com/realtime/sfu/https-api/)).
- **The timing rules.** The five-second wait for a connected
  PeerConnection before a track operation, and the thirty-second garbage
  collection of a track with no media, are the service's
  ([limits](https://developers.cloudflare.com/realtime/sfu/limits/)).
  Neither has any expression in a fake unless the fake was written to
  have it, in which case the fake is asserting its own behaviour.
- **TURN.** Whether a relay is needed depends on the network the client
  is on, and a laptop on a permissive network never exercises the path
  that the restrictive one takes.

## Browser-driven tests

WebRTC needs a browser with real media devices, so an end-to-end run
means a headless browser launched with fake capture devices rather than a
request-level client. Which browser, which flags and how the runner is
wired are the project's own testing stack's business — this component
only states that the browser is unavoidable and that two of them are
needed to prove a forward, since a single client publishing and pulling
its own track exercises the SFU's echo path and not its fan-out.
