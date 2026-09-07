# Cloudflare Realtime — cost shape

The account-level billing principle — how the meter runs, the day-one
guardrails, the environment attribution rule and the cost review — is the
`cloudflare` skill's cost doctrine, which this cites and does not
restate. This is what the meter means for this one service.

## The dimension is data egress, and there is only one

SFU and TURN bill together on **data egress from Cloudflare's edge to the
client, per GB**, as a single line item on the invoice, with a **shared
free tier of 1,000 GB across both**
([SFU pricing](https://developers.cloudflare.com/realtime/sfu/pricing/),
[TURN FAQ](https://developers.cloudflare.com/realtime/turn/faq/)).

There is no per-session charge, no per-track charge and no per-API-call
charge. That is the whole shape, and it inverts the usual instinct: the
expensive thing is not how many rooms exist or how busy the API is, it is
**how many bytes leave the edge toward how many subscribers**.

Three things follow directly and are worth stating because none of them
is obvious from a per-operation mental model:

- **A publisher is nearly free; a subscriber is the bill.** One track
  pushed once, pulled by twenty participants, is twenty egresses. Cost
  scales with the *fan-out*, not the participant count as such.
- **Idle costs nothing.** A session with no media flowing moves no bytes.
  Sessions left open by a client that vanished are a correctness problem
  — see [service doctrine](service-doctrine.md) — not a cost one.
- **The API is not metered.** The 50-calls-per-second-per-session ceiling
  is a limit, not a price. Chattiness costs latency and headroom.

## TURN, and the one piece of double-charging that does not happen

**TURN overhead counts** — the bill is egress to the TURN client
including the protocol's own framing. But traffic between Cloudflare
TURN and the Cloudflare SFU is **not charged twice**: a session using
both is billed for the egress once
([TURN FAQ](https://developers.cloudflare.com/realtime/turn/faq/)). So
the common worry — that relaying through TURN into your own SFU doubles
the bill — is not real here, and choosing TURN for a restrictive network
is a reliability decision rather than a cost one.

**STUN is free and unlimited.** A design that only needs address
discovery pays nothing, which is why the peer-to-peer case stays cheap —
see [pick & trade](pick-and-trade.md).

Never write dollar figures. They change; the shape does not.

## The traps

**Video resolution is the cost lever, and it is set on the client.** The
meter counts bytes, so the encoding a publisher chooses multiplies
straight through the fan-out. A product that never decided its resolution
and bitrate ladder has not decided its bill either, and the decision
lives in client code rather than anywhere a cloud console shows it.

**A large room is quadratic if every participant pulls every track.**
Twenty participants each publishing and each subscribing to the other
nineteen is 380 egress streams. Products that stay affordable at that
size subscribe selectively — active speaker, a paged grid — and that
selection is signalling logic the product writes, not a service setting.

**The free tier is shared and account-wide.** 1,000 GB covers SFU and
TURN together across the account, so a non-production environment testing
video eats the production allowance. This is the strongest cost argument
for the per-environment app split the service doctrine already requires
for correctness — separate apps make the consumption attributable.

**Recording is somebody else's bill.** Nothing here stores media, so a
product that keeps calls is paying an object store as well — `r2` — and
that cost does not appear on this line item at all.

## The sizing question

Not "how many users" but **"how many concurrent subscribed streams, at
what bitrate, for how many minutes"**. Multiply and it is the bill. A
model that cannot state those three numbers cannot be sized, and the
first of the three is a product decision about how a room is displayed
rather than an infrastructure one.

## Environment attribution

One app per environment is what makes usage attributable, since the meter
is account-level and a single shared app collapses every environment into
one number. TURN adds a second handle: credentials can be generated with
a `customIdentifier` for usage tracking
([replacing an existing TURN server](https://developers.cloudflare.com/realtime/turn/replacing-existing/)),
so a product that wants per-tenant or per-room attribution on the relay
half has a place to put it — decided when the credential-issuing endpoint
is written, not retrofitted.
