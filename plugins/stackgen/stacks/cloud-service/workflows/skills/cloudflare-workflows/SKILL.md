---
name: cloudflare-workflows
version: 0.1.0
category: development
description: >-
  Cloudflare Workflows as this product's durable execution engine — when a
  multi-step process with retries, sleeps and waits belongs here rather
  than in a queue or a Durable Object, how it satisfies the
  async-orchestration contract, the step discipline that makes resumption
  work, a bill measured in steps and CPU rather than in elapsed time, and
  the instances `wrangler dev` runs on a laptop. Use when designing an
  asynchronous process, writing a Workflow class, or wiring the binding.
license: MIT
allowed-tools: Read Grep Glob Edit Write Bash
---

# Cloudflare Workflows

Durable multi-step execution, bound to a Worker and defined as a class in
its script. This skill carries the judgment; the `WorkflowEntrypoint`
signatures, `wrangler`'s current flags and the limits table belong to
Context7 at use time.

Read the reference that matches what you are doing — one, not all of
them.

| Doing | Read |
| --- | --- |
| Choosing, or questioning, this engine | [Pick & trade](references/pick-and-trade.md) |
| Designing steps, retries, waits and instance lifecycle | [Service doctrine](references/service-doctrine.md) |
| Sizing the work, or explaining a bill | [Cost shape](references/cost-shape.md) |
| Wiring the binding, or deciding who may advance an instance | [Identity shape](references/identity-shape.md) |
| Running or testing against it on a laptop | [Local dev](references/local-dev.md) |

**Three rules that do not wait for a reference.** A step's name is its
**identity in persisted state**, so names are deterministic and stable —
interpolating a clock into one turns a cached step back into a repeated
one. **Nothing survives outside a step**, because the engine hibernates
across sleeps; whatever a later step needs is something an earlier step
returned. And **every step is idempotent**, because a step may commit its
effect and still be retried — the documented shape is to check whether the
work is already done before doing it, not to hope.

The rule this skill leans on hardest is the provider's, not its own: the
account is the unit of blast radius, and the API token a deploy needs here
is the Workers scripts permission rather than a Workflows-specific one.
That is the `cloudflare` skill's identity and IAM reference, cited in
[identity shape](references/identity-shape.md) and restated nowhere.
