---
name: cloudflare-realtime
version: 0.1.0
category: development
description: >-
  Cloudflare Realtime as this product's media plane — when a selective
  forwarding unit is the answer and when peer-to-peer or a data channel
  over Durable Objects is, the session and track lifecycle against the
  stated limits, egress-shaped cost, the app secret and the short-lived
  TURN credentials a client is handed, and why there is no local form to
  run.
license: MIT
allowed-tools: Read Grep Glob Edit Write Bash
---

# Cloudflare Realtime

A WebRTC selective forwarding unit and TURN service, driven from the
product's own server over an HTTPS API. This skill carries the judgment;
the current API surface, the SDP exchange and the dashboard belong to
Context7 at use time.

Read the reference that matches what you are doing — one, not all of them.

| Doing | Read |
| --- | --- |
| Deciding whether an SFU is the right answer at all | [Pick & trade](references/pick-and-trade.md) |
| Designing the session, track and signalling lifecycle | [Service doctrine](references/service-doctrine.md) |
| Sizing, or explaining, the bill | [Cost shape](references/cost-shape.md) |
| Issuing the app secret, or a client's TURN credential | [Identity shape](references/identity-shape.md) |
| Running or testing the project on a laptop | [Local dev](references/local-dev.md) |

**Three rules that do not wait for a reference.** There is **no Wrangler
binding** — this is an HTTPS API taking an app id and a bearer app
secret, so nothing about it appears in the project's Wrangler
configuration. **Every session in an app can pull every track in that
app**, which makes one app per environment a correctness boundary rather
than tidiness. And **signalling is the product's**, not the service's —
who is in a room and what they may subscribe to is state the project
holds, at this provider in a Durable Object.

The rule this skill leans on hardest is that the SFU **forwards and
stores nothing**. A track is garbage collected 30 seconds after its media
stops; anything that must survive the call was written somewhere else by
the product, deliberately, before it ended.
