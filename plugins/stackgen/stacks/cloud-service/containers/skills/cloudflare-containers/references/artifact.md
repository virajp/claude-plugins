# Artifact — Containers

**The artifact is a container image, built from a Dockerfile in the repo
and pushed to Cloudflare's own registry by `wrangler deploy`.** Setting
`image` to a local Dockerfile path is what makes that automatic: wrangler
builds it with the local Docker daemon and pushes it to a
Cloudflare-managed registry backed by R2, authenticating the push itself
([Image management](https://developers.cloudflare.com/containers/platform-details/image-management/)).
`wrangler containers build -t <tag>` and `wrangler containers push <tag>`
are the same two steps run by hand
([Containers](https://developers.cloudflare.com/containers/)).

**The Dockerfile is the project's and this pack writes none of it.** What
follows is the contract it has to satisfy.

## What makes an image deployable

- **A process that listens on a port**, and the same port the Container
  class's `defaultPort` names. There is no service discovery here: the
  Worker forwards to a number.
- **The ports declared with `EXPOSE`.** Cloudflare documents this as a
  local-development requirement for Sandbox, which is built on Containers
  — production reaches every container port regardless, and `wrangler dev`
  refuses the connection without the declaration
  ([Sandbox preview URLs](https://developers.cloudflare.com/sandbox/concepts/preview-urls/)).
  Containers' own local-development guide does not state it, so the
  declaration is here as image hygiene that also covers the case — see
  [local dev](local-dev.md).
- **A health endpoint of its own**, separate from the work and cheap to
  answer, so the Worker has something to forward a readiness probe to —
  see [health](health.md).
- **No baked secrets.** Not in a layer, not in an `ENV`, and not through
  `image_vars`, which are **build** variables and are therefore part of
  the image's history rather than of its runtime
  ([Wrangler configuration](https://developers.cloudflare.com/workers/wrangler/configuration/)).
  The Worker supplies what the process needs at run time — see
  [identity shape](identity-shape.md).
- **A process that starts cold and starts quickly.** Every wake is a
  start, so anything the entrypoint does before it can serve — unpacking,
  warming a cache, loading a model — is latency paid on the request that
  woke the instance, not once at deploy.
- **A process that exits cleanly and keeps nothing.** Instances sleep and
  are replaced. Anything written to the container's own filesystem is
  scratch by definition; durable state belongs in a datastore or in the
  Durable Object the container hangs off.

## Size is a reliability decision, not only a speed one

Total image storage is capped **per account**, and deleting an image to
reclaim space deletes a version you could have rolled back to
([Limits](https://developers.cloudflare.com/containers/platform-details/limits/)).
So a large image does three things at once: it makes every build and push
slower, it consumes an account-wide budget shared with every other project
on the account, and it shortens the rollback history everyone else has
too.

**Multi-stage builds are the ordinary answer and are a judgment rather
than a rule.** Compile in one stage, copy the artifact into a minimal
runtime in the next; the build toolchain, the package caches and the
source tree stay out of what is pushed. Where the runtime genuinely needs
the toolchain — a language that compiles at start, a tool that shells out
— a single stage is honest and the size is the price of the design.

## One deploy is distinguishable from the next by its tag

The image tag is the release identifier, which is what makes a rollback a
**previous image** rather than a rebuild of an earlier commit. A rebuild
produces an artifact nobody tested, and the inputs that make two builds
differ — a floating base image, a package index that moved, a dependency
resolved fresh — are exactly the ones nobody controls.

Three rules follow:

- **Tag by commit, never only by environment.** A tag that means
  "whatever staging is running" cannot be rolled back to, because it names
  the moving target rather than a version. Environment names can point at
  commit tags; they must not be the only tags that exist.
- **Never share a tag between environments.** The registry is
  account-wide, so two Workers pointed at one tag are two environments
  that stop being independently rollbackable, and the one promoted last
  quietly becomes the one both run.
- **Retention is a decision someone has to make.** Because storage is
  capped, deleting old images is a normal operation — and the direction it
  is usually got wrong in is deleting the one you needed. Decide how many
  versions back a rollback must reach before the first cleanup, not
  during one.

## Configuration is not in the artifact

Anything environment-specific baked into the image is baked into every
environment that runs it — and into the tag left in the registry as a
rollback target. Where a value must differ between staging and production,
the honest answer is a value the Worker passes the container at runtime,
not a second image and not a post-build rewrite. Building twice from one
commit to produce two "identical" images is the same trap in a costlier
form: the tested artifact and the released one have stopped being the same
bytes.

## Where this sits relative to the neutral component

The provider-neutral `deploy-target/container-image` component states the
image contract for a host that belongs to no cloud, and **this artifact is
much closer to portable than the Workers-script one is.** The image is an
ordinary OCI image: the same Dockerfile builds something Cloud Run or a
cluster would run. What does not move is the **arrangement** — the Worker
in front, the Durable Object addressing, the absence of direct ingress —
so porting means rewriting the front door rather than rebuilding the
process. That is a materially smaller lock-in than a Worker script's, and
it is worth naming when the target is chosen rather than when it changes.

Whether an image should *also* live in another registry, for a second
target, is not this component's question — `wrangler deploy` pushes to
Cloudflare's registry, and a cross-provider image story belongs to the
neutral component.
