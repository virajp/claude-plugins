# Pipeline — Containers

Build → image → `wrangler deploy` → the Worker and the container
published together. The application build is the project's; the image
build is wrangler's; the deploy is one act.

## The release runs behind a mise task

The task is **`p:<project-id>:deploy`**, shipped by this pack as an
overlay in the project's own task group, so **the same command runs
locally and in CI**. That is what keeps the deploy target swappable: the
workflow calls the task, and the task is the only thing that knows a
Cloudflare account is on the other end. A workflow that shells out to
`wrangler` directly has welded the pipeline to the target.

**The workflow file is the repo's, not this pack's.** A pack states which
task CI must run and never writes the workflow — the charter fence in
`${CLAUDE_PLUGIN_ROOT}/assets/output-tree.md` — because a generated
pipeline nobody maintains is worse than none.

## What the runner needs

Two things, and the second is what makes this pack's pipeline different
from the Workers-script sibling's:

- **The two credentials**, from the secrets provider. Names and scoping
  are [identity shape](identity-shape.md)'s.
- **Docker, running.** `wrangler deploy` builds the image locally before
  pushing it
  ([Image management](https://developers.cloudflare.com/containers/platform-details/image-management/)),
  so a runner without a daemon cannot deploy this stack at all. Pick a
  runner image that ships Docker, or enable the service for the job; a
  container-based runner needs the daemon reachable from inside it.

## What the deploy task does, and deliberately does not

- **It checks the credentials first**, before wrangler is invoked, because
  wrangler's own failure for a missing token reads like a network or
  permissions problem.
- **It then checks Docker** — on `PATH`, and the daemon answering — for
  the same reason from the other side: a daemon that is not running
  surfaces several steps into a build and reads like a broken Dockerfile.
  Credentials are checked first because a missing token is the commoner
  and cheaper fault to report.
- **It does not build the application.** It runs `p:<project-id>:build`
  where that task exists and otherwise says what it is assuming; what the
  image contains is the project's business.
- **It does not build the image either.** That is `wrangler deploy`'s, and
  reproducing it in the task would be a second build to keep in step with
  the config.
- **It pins no wrangler and no Docker.** Wrangler is a development
  dependency in the project's language manifest, and a manifest is outside
  the config tier's fence; Docker is a machine prerequisite rather than a
  repo dependency, which is why the task names it and pins nothing.
- **`--dry-run` validates without publishing**, and is exempt from **both**
  checks — it neither authenticates nor builds. That exemption is the point
  of the flag: it lets a contributor with neither account access nor a
  running daemon validate a config change.

## What the deploy must guarantee

vwf's delivery-pipeline contract states these as guarantees rather than as
a spelling, and this component satisfies them without redefining them:

- **Deliberate** — an explicit act naming one project and one environment,
  never a consequence of a branch push.
- **Branch-validated** — the commit being released is reachable from the
  branch that environment releases from.
- **Tested before release** — the project's tests have passed on that
  commit.
- **Staging is not a release** — promoting to a preview does not imply
  production.
- **One image per commit**, not one per environment. See
  [artifact](artifact.md).

## What triggers it is not this component's decision

The trigger — a tag, a dispatch, an approval — belongs to the CI system
pinned on the project's `cicd` axis, behind
`${CLAUDE_PLUGIN_ROOT}/assets/contracts/release-trigger.md`.

## Pre-production

A preview is a **separate Worker with its own container class and its own
image tag**, and the suite is given that Worker's URL by name, catalogued
in `docs/blueprint/environment.md` like any other environment value.

Two rules and one parked decision:

- **Never share an image tag between environments.** The registry is
  account-wide, so one tag behind two Workers is two environments that
  cannot be rolled back independently — see [artifact](artifact.md).
- **A preview reaches whatever its Worker reaches.** A second Worker with
  production's environment values is a second front end pointed at
  production data, and here it is a second *container* pointed at it too.
  Which datastore, which API and which credential a preview gets is a
  decision to make and record, not one to inherit.
- **`p:<id>:preview` is parked and this pack does not ship it.** Worker
  versions do give an upload its own preview URL without moving production
  traffic, and `wrangler versions upload --preview-alias <name>` gives that
  URL a stable name
  ([preview URLs](https://developers.cloudflare.com/workers/versions-and-deployments/preview-urls/));
  whether that composes cleanly with a container class is the question the
  first real Containers project should answer, rather than one this pack
  should guess at.

## Rollback

**Two things can be rolled back and they are not the same thing.**

- **The Worker.** `wrangler rollback [<VERSION_ID>]` reverts to a previous
  version, defaulting to the one uploaded immediately before the latest
  ([Wrangler commands](https://developers.cloudflare.com/workers/wrangler/commands/workers/)).
  `wrangler versions deploy` is the deliberate form, selecting a version
  and the traffic share it takes
  ([deployment management](https://developers.cloudflare.com/workers/versions-and-deployments/deployment-management/)).
- **The image.** Rolling the Worker back does not rebuild an image, so the
  version being restored has to still reference an image that still
  exists.

That second clause is the trap and it has a housekeeping cause: image
storage is capped per account, and deleting images to reclaim space
deletes rollback targets
([Limits](https://developers.cloudflare.com/containers/platform-details/limits/)).
A cleanup run during an incident is the worst possible time to discover
how many versions back the account can actually reach.

Two more things a rollback does not undo:

- **State the previous release cannot read.** A schema migration, a queue
  format, a file layout in a datastore — the container has state on the
  other side of it, and the rollback plan has to say what happens to it.
- **In-flight instances.** Instances already awake are running the image
  they started with. A rollback changes what the next wake gets; it does
  not reach into a container that is currently serving.
