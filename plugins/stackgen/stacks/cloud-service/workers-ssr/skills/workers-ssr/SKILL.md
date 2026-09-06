---
name: workers-ssr
version: 0.1.0
category: development
description: >-
  Cloudflare Workers with a script as this product's server-rendering host
  — when code at the edge is the deployment and when a container is, what
  `main`, the assets binding and the fall-through rule actually do, what
  the framework adapter must emit, how the release and its rollback are
  shaped, why an on-demand probe is the one that earns its keep, what
  request-and-CPU billing means, the least-privilege token a deploy needs,
  and which runtime local development actually runs.
license: MIT
allowed-tools: Read Grep Glob Edit Write Bash
---

# Cloudflare Workers SSR

A Worker with a script in front of its own static assets: `main` names an
entry, the platform serves the uploaded file set, and everything else
falls through to the script. This skill carries the judgment; wrangler's
current flags, the runtime's APIs and the framework adapter's options
belong to Context7 at use time.

Read the reference that matches what you are doing — one, not all of them.

| Doing | Read |
| --- | --- |
| Deciding whether a project belongs here | [Pick & trade](references/pick-and-trade.md) |
| Shaping the config, or the routing the edge applies | [Service doctrine](references/service-doctrine.md) |
| Deciding what the build must emit, and how it is cached | [Artifact](references/artifact.md) |
| Wiring the release, a preview, or a rollback | [Pipeline](references/pipeline.md) |
| Deciding how "is it up?" is answered | [Health](references/health.md) |
| Sizing, or explaining, the bill | [Cost shape](references/cost-shape.md) |
| Issuing the credential a deploy uses | [Identity shape](references/identity-shape.md) |
| Running or testing the site on a laptop | [Local dev](references/local-dev.md) |

**Three rules that do not wait for a reference.** Removing `main` is not a
configuration change — it is a different stack, and the assets-only shape
is `workers-static-assets` by ruling. `run_worker_first` ships **off**,
because turning it on puts a billed script invocation in front of every
hashed asset and is a decision to make deliberately rather than inherit.
And the deploy carries **no credentials in any file**: the token and the
account id arrive from the environment, and the task refuses to start
without them.

The rules this skill leans on hardest are the provider's, not its own: the
account is the unit of blast radius and the roles are broader than they
look. That is the `cloudflare` skill's identity and IAM reference, cited
here and restated nowhere.

## What this stack does not cover

**The script itself.** `main` names an entry the project's framework
adapter defines — for Astro, `@astrojs/cloudflare`'s unified entrypoint —
and choosing, installing and configuring that adapter belongs to the
project bundle, not here.

**Pages, R2, D1, KV, Durable Objects, Queues, Images and Stream.** If the
product needs one, that is a gap to name — not a gap to fill from general
Cloudflare knowledge, because doctrine nobody wrote is doctrine nobody
reviewed.
