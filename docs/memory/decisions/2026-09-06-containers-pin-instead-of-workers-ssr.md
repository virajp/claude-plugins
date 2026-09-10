# Decision — Cloudflare Containers is pinned instead of Workers SSR, never beside it

**Date** 2026-09-06 · **Branch**
`2026-09-06-cloudflare-compute-and-orchestration` · **Plan**
[`docs/plans/2026-09-06-cloudflare-compute-and-orchestration/`](../../plans/2026-09-06-cloudflare-compute-and-orchestration/index.md)
· **Constrains** the `deploy` axis for one provider, first stated in
[`2026-09-06-workers-ssr-redeems-the-script-reservation.md`](./2026-09-06-workers-ssr-redeems-the-script-reservation.md)

## What was decided before

Cloudflare shipped one deploy target on 2026-09-05
([`2026-09-05-workers-static-assets-redeems-the-cloudflare-reservation.md`](./2026-09-05-workers-static-assets-redeems-the-cloudflare-reservation.md))
and a second the day after: `cloud-service/workers-static-assets` for a
directory of files, `cloud-service/workers-ssr` for that directory with a script
in front of it. Both are deploy targets, both carry the three-topic
deploy-target extension, and both ship the same pair of payload files — a root
`wrangler.jsonc` and a `.config/mise/tasks/p/_project/deploy` overlay. Nothing
had to say what happens when two of them are pinned at once, because the two
that existed were alternatives a reader would never mistake for complements.

## What changed

**A third Cloudflare deploy target landed, and it collides with the second.**
`cloud-service/containers` — category `compute`, `axis: deploy`,
`artifact: container-image` — runs a Docker image beside a Worker, addressed
through a Durable Object. Its `wrangler.jsonc` is a **complete** Worker config:
`main`, the `containers` block, the Durable Object binding whose `class_name`
matches the container's, and the migration that declares the class. That is the
same file at the same path `workers-ssr` ships.

**The ruling: a Containers project *is* a Workers project, so
`cloudflare-containers` is pinned instead of `cloudflare-workers-ssr`, never
beside it.** The bundle prose says so in its own section, and the reason is
stated there rather than left to the composition order: pinning both means two
components writing one file, the later one in the order wins, and which of them
that is depends on the pin order rather than on anything the project decided.

**Nothing is lost by replacing rather than layering.** The Worker that fronts a
container carries a `main` the project writes, so it can render pages and serve
assets too; it is simply not a framework adapter's entrypoint. The same
reasoning reaches `cloudflare-workers-static`, which ships the same file at the
same path.

**`cloudflare-zero-trust` still composes beside either.** It is the standing
counter-example and it is not affected: it writes no root config, runs no code
and adds a private plane in front of whichever host is pinned — so it composes
with a hosting pin rather than replacing one, exactly as it did with two.

## Rejected

- **A Containers pack that layers onto a Workers SSR pin.** It would need a
  wrangler fragment merge — two packs contributing keys into one
  `wrangler.jsonc` that a third thing assembles. No such mechanism exists, and
  the payload tier is copy-in-place by design: a `config/` tree lands
  byte-for-byte, mode preserved, and the composition order resolves a collision
  by overwrite rather than by merge.
- **A shared wrangler fragment convention** to make that merge possible. Same
  objection, one layer up: it would make the root config an assembled artifact
  nobody owns, when the rule that put `wrangler.jsonc` on the root allowlist in
  the first place is that **a deploy target owns the root config its own tool
  reads**.
- **A `deploy-target/container-image` component in the bundle.** The bundle is
  provider plus one service, mirroring
  `plugins/stackgen/stacks/bundles/gcp-cloud-run.md`, which has none either. The
  neutral component states the image contract for a host belonging to no cloud;
  what this bundle deploys is not a portable arrangement, even though the image
  is a portable artifact.

## Consequences

- **The next provider pack with two Worker-shaped deploy targets states the same
  exclusivity in its bundle prose.** This is the first rule about two deploy
  bundles from one provider being mutually exclusive, and prose is where it
  lives: the deploy axis is a list, so the collision is representable and
  nothing refuses it.
- **Nothing detects the collision.** Two pinned bundles shipping the same root
  file is a checker rule that does not exist. It is parked, and it belongs with
  the **"checker rule validating `pack.yaml`'s `category` against
  `taxonomy.md`'s list for its `type`"** entry parked by
  [`2026-09-06-cloud-service-categories-for-twenty-cloudflare-services.md`](./2026-09-06-cloud-service-categories-for-twenty-cloudflare-services.md)
  — one gate-only plan touching `scripts/src/check.ts`, `checks.md` and
  `check.test.ts` can carry both.
- **The pack tree is the live statement of the rule.**
  `plugins/stackgen/stacks/bundles/cloudflare-containers.md` and
  `plugins/stackgen/stacks/cloud-service/containers/conventions.md` each carry
  it in their own words; this doc is the record of why. When they disagree, the
  pack is right and this doc is history.
