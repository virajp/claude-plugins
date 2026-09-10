---
name: cloudflare-email
version: 0.1.0
category: development
description: >-
  Cloudflare Email Service as this product's email provider — when a
  binding on the product's own domain beats a third-party transactional
  API and when it does not, how the send and receive halves differ in
  configuration and in testing, the DNS the zone must carry, a bill
  measured in outbound messages with inbound free, and the local session
  that sends real mail the moment one flag is set. Use when designing an
  email flow, writing the send path or the `email()` handler, or wiring
  the binding.
license: MIT
allowed-tools: Read Grep Glob Edit Write Bash
---

# Cloudflare Email Service

Transactional email sent from a Worker through a binding, and inbound
mail routed back into one. This skill carries the judgment; the current
`send()` field list, the error-code table and `wrangler`'s current flags
belong to Context7 at use time.

Read the reference that matches what you are doing — one, not all of
them.

| Doing | Read |
| --- | --- |
| Choosing, or questioning, this provider | [Pick & trade](references/pick-and-trade.md) |
| Designing the send path or the `email()` handler | [Service doctrine](references/service-doctrine.md) |
| Sizing the volume, or explaining a bill | [Cost shape](references/cost-shape.md) |
| Wiring the binding, or granting automation | [Identity shape](references/identity-shape.md) |
| Running or testing against it on a laptop | [Local dev](references/local-dev.md) |

**Three rules that do not wait for a reference.** The service is
**transactional only** by Cloudflare's own statement, so a marketing
surface is a second provider and not a later feature of this one. **A
send is accepted, not delivered** — the call returns a message id and the
API's result splits recipients into delivered, queued and permanently
bounced, so treating a non-throwing send as a delivered message is the
error this component makes easiest. And **the local session can reach
real people**: `remote: true` on the binding is a one-word change that
turns a simulated send into a real one, which is why test addresses are
the default in every non-deployed environment rather than a courtesy.

The rule this skill leans on hardest is the provider's, not its own: the
account is the unit of blast radius, and the token this service needs off
the request path is scoped to email alone. That is the `cloudflare`
skill's identity and IAM reference, cited in
[identity shape](references/identity-shape.md) and restated nowhere.
