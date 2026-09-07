---
name: cloudflare-browser-rendering
version: 0.1.0
category: development
description: >-
  Cloudflare Browser Rendering as this product's headless browser — when
  a render is the answer and when a fetch already was, the three ways in
  and the session lifecycle that decides the bill, time-shaped billing
  against an account-wide ceiling, the one token permission all three
  paths share, and why there is no local browser and what that costs the
  dev loop.
license: MIT
allowed-tools: Read Grep Glob Edit Write Bash
---

# Cloudflare Browser Rendering

Headless Chrome on Cloudflare's network, reached from a Worker through a
binding, from anywhere through a REST endpoint, or over the DevTools
protocol. This skill carries the judgment; the automation libraries'
current signatures, each endpoint's option list and the limit numbers of
the day belong to Context7 at use time.

Cloudflare's docs now call the product **Browser Run**; the Wrangler key,
the REST path and the token permission still say browser rendering, which
is why this component does too.

Read the reference that matches what you are doing — one, not all of
them.

| Doing | Read |
| --- | --- |
| Deciding whether the product needs a browser at all | [Pick & trade](references/pick-and-trade.md) |
| Choosing a path, managing a session, or handling the output | [Service doctrine](references/service-doctrine.md) |
| Sizing, or explaining, the bill | [Cost shape](references/cost-shape.md) |
| Granting the token the REST and CDP paths need | [Identity shape](references/identity-shape.md) |
| Running or testing against it on a laptop | [Local dev](references/local-dev.md) |

**Three rules that do not wait for a reference.** **A browser is billed
until it is closed** — `browser.close()` belongs in a `finally`, and the
60-second idle timeout is the only thing between a forgotten session and
ten minutes of charged time. **The ceiling is the account's, not the
project's** — concurrent browsers and browser hours are account-wide, so
a fan-out in one environment starves every other one and returns `429`
with a `Retry-After` that something has to honour. And **there is no
local browser**: the binding is opted into the live service, so a dev
session renders for real and bills for real.

The rule this skill leans on hardest is the one that decides whether the
component belongs at all: **a browser is for content JavaScript produced,
or for output that is inherently visual.** Everything else a `fetch`
already answered, for free and without a concurrency slot.
