---
name: cloudflare-containers
version: 0.1.0
category: development
description: >-
  Cloudflare Containers as this product's deploy target — a Docker image
  running beside a Worker and reached through a Durable Object, when that
  is the right answer and when a Worker or another cloud's compute is,
  what the three coupled config blocks actually declare, what the image
  must satisfy to be deployable, how the release and its rollback are
  shaped, what a health probe can and cannot see through a sleeping
  instance, what runtime-second billing means, the least-privilege token
  a deploy needs, and why nothing here runs without Docker.
license: MIT
allowed-tools: Read Grep Glob Edit Write Bash
---

# Cloudflare Containers

A container image running beside a Worker: the Worker is the front door,
the image runs the process an isolate cannot host, and the container is
addressed through a Durable Object. This skill carries the judgment;
wrangler's current flags, the Container class's API and the platform's
current limits belong to Context7 at use time.

Read the reference that matches what you are doing — one, not all of them.

| Doing | Read |
| --- | --- |
| Deciding whether a project belongs here | [Pick & trade](references/pick-and-trade.md) |
| Shaping the config, the class or the instance lifecycle | [Service doctrine](references/service-doctrine.md) |
| Deciding what the image must contain, and how it is tagged | [Artifact](references/artifact.md) |
| Wiring the release, a preview, or a rollback | [Pipeline](references/pipeline.md) |
| Deciding how "is it up?" is answered | [Health](references/health.md) |
| Sizing, or explaining, the bill | [Cost shape](references/cost-shape.md) |
| Issuing the credential a deploy uses | [Identity shape](references/identity-shape.md) |
| Running or testing the container on a laptop | [Local dev](references/local-dev.md) |

**Three rules that do not wait for a reference.** This stack is pinned
**instead of** `workers-ssr`, never beside it: a Containers project is a
Workers project, both packs ship `wrangler.jsonc` at the repo root, and
pinning both leaves the composition order to decide which config a repo
actually gets. **Nothing here runs without Docker** — `wrangler deploy`
builds the image locally before pushing it, so the CI runner needs a
daemon as surely as it needs the token. And the container's class name
appears in **three** places in the config and must match the class the
Worker exports; changing one of them is the usual first failure.

The rules this skill leans on hardest are the provider's, not its own: the
account is the unit of blast radius and the roles are broader than they
look. That is the `cloudflare` skill's identity and IAM reference, cited
here and restated nowhere.

## What this stack does not cover

**The Dockerfile, and what runs inside it.** The image is the project's —
its language, its build, its process. This component states the contract
the image must satisfy and writes none of it.

**Durable Objects as a service.** The container is reached through one, so
the binding and the migration are here; what an object *is*, and when a
project should pin one for its own sake, is
`cloud-service/durable-objects`.

**Any other Cloudflare service.** Which ones stackgen offers, and which
are planned or declined, is the provider component's to state — see
`cloud-provider/cloudflare/conventions.md`.
