---
name: cloudflare-images
version: 0.1.0
category: development
description: >-
  Cloudflare Images as this product's media layer — when a transformation
  is the right answer and when a pre-rendered variant is, where the
  original bytes belong, the zone setting and the allowed-origin fence
  that decide who may transform what, the variant and signed-URL model on
  the storage half, what the three metering dimensions actually bill, the
  token permission to grant and the signing key to treat as a secret, and
  what the local mock does not reproduce. Covers both halves of the
  product — transformations on a zone, and Images storage.
license: MIT
allowed-tools: Read Grep Glob Edit Write Bash
---

# Cloudflare Images

On-demand image transformation and delivery at the edge, plus an
account-level store for images the product owns. This skill carries the
judgment; the current parameter list, the binding's method signatures and
wrangler's flags belong to Context7 at use time. The provider-wide half —
the account and role model, the billing principle, what exists locally —
is the `cloudflare` skill's, cited and never restated.

Read the reference that matches what you are doing — one, not all of them.

| Doing | Read |
| --- | --- |
| Choosing, or questioning, this layer | [Pick & trade](references/pick-and-trade.md) |
| Enabling transformations, designing variants and upload paths | [Service doctrine](references/service-doctrine.md) |
| Sizing, or explaining, the bill | [Cost shape](references/cost-shape.md) |
| Granting a token, or handling the signing key | [Identity shape](references/identity-shape.md) |
| Running or testing against images on a laptop | [Local dev](references/local-dev.md) |

**Three rules that do not wait for a reference.** **This is not storage** —
the durable home of an original is a bucket or Images storage, chosen
once per entity and never both, and a transformation is a read path in
front of whichever it is. **A transformation URL is an instruction a
stranger can write**, so the allowed-origin fence and the zone setting are
a security decision taken before the first image ships, not a setting
found later. And **the meter counts distinct transformations, not
requests** — the bill is a function of how many variants the product
invents, which makes an unbounded `width` taken from a query string the
one design that is always wrong.
