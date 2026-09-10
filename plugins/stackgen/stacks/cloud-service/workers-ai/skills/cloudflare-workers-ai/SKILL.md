---
name: cloudflare-workers-ai
version: 0.1.0
category: development
description: >-
  Cloudflare Workers AI as this product's inference provider — when a
  hosted catalog of open models is the answer and when a third-party
  model behind a gateway is, how a model is picked and pinned so a
  deprecation is one edit, what a neuron is and why the bill is per
  model, the token permission the REST path needs, and why there is no
  local Workers AI and what a dev call actually costs.
license: MIT
allowed-tools: Read Grep Glob Edit Write Bash
---

# Cloudflare Workers AI

Serverless inference on a catalog Cloudflare hosts, reached from a Worker
as an ordinary binding: name a model, pass an input, get a result on the
request path. This skill carries the judgment; the current catalog, each
model's input schema and the limit numbers of the day belong to Context7
at use time.

Read the reference that matches what you are doing — one, not all of
them.

| Doing | Read |
| --- | --- |
| Deciding whether the product's inference belongs here at all | [Pick & trade](references/pick-and-trade.md) |
| Calling a model, picking one, or designing the seam around it | [Service doctrine](references/service-doctrine.md) |
| Sizing, or explaining, the bill | [Cost shape](references/cost-shape.md) |
| Granting the token the REST path or a pipeline needs | [Identity shape](references/identity-shape.md) |
| Running or testing against it on a laptop | [Local dev](references/local-dev.md) |

**Three rules that do not wait for a reference.** **The model id is the
perishable part** — Cloudflare publishes sunset dates and expects
references gone before them, so the id lives in one place in the codebase
and not at every call site. **There is no local Workers AI**: the binding
opts into the live service, every dev call runs on the production models,
bills, and counts against the same rate limits. And **the binding carries
no id**, so there is no per-environment resource to point at — every
environment calls the same models, and keeping a test suite off the meter
is the product's job rather than the service's.

The rule this skill leans on hardest is not its own: an inference result
is a plausible answer, not a correct one. Everything the product does with
it — validating a structured output, bounding what a generated string may
reach, deciding what happens when the model is wrong — is application
design, and no binding makes it unnecessary.
