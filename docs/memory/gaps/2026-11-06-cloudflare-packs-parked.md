GAP 2026-09-06 ★3 | cloudflare packs parked, open | five Cloudflare pack points
were parked and no later plan closed them — each waits for a first real project
that needs it | none is a defect today

**Source plan** `2026-09-06-cloudflare-storage-and-data`,
`2026-09-06-cloudflare-compute-and-orchestration`, `2026-09-06-cloudflare-ai`,
`2026-09-06-cloudflare-media-messaging-secrets`.

The four plans shipped twenty Cloudflare services. They parked these points.
The pack tree does not state them, so a reader finds them nowhere else.

- **D1 migrations task.** A `p:<id>:db-migrate` task that runs
  `wrangler d1 migrations apply`. Backing packs ship no `config/` tier, and
  this is the one recurring dev-loop task where that rule chafes. Decide with
  the first real D1 project. The d1 pack still has no task payload.
- **Containers health task.** The pack documents what to probe. A container
  behind a Durable Object is reachable only through the Worker. The
  `harness.health` field stays `n/a`. Decide with the first Containers project.
- **Other container registries.** `wrangler deploy` pushes to Cloudflare's
  managed registry. A project that also runs the image on GKE or Cloud Run needs
  a registry answer. That answer belongs to the `deploy-target/container-image`
  pack, not to the Cloudflare pack.
- **Email templates and a mail preview task.** No local form of the sending
  side exists. Raised while writing the Email pack. Plan it only if a real
  project needs it.
- **AI Gateway without Cloudflare compute.** The gateway answers at a URL from
  any host. It ships only as a backing bundle beside a Cloudflare pin. A product
  hosted elsewhere that wants only the gateway has no clean pin. Raised by the
  AI Gateway pick-and-trade text. Decide when such a product exists.
- **Enumerated `artifact:` token list.** `pack-format.md` declares `<token>`.
  The tokens in use were `container-image`, `npm-package`, `static-assets`,
  `worker-script` and `n/a`. No rule lists them, so a typo passes. This pairs
  with the closed-category check in
  `2026-09-06-cloud-service-categories-for-twenty-cloudflare-services`.

Rejected and not to reopen as a new idea: composite Cloudflare bundles by
domain, and Images plus R2 as one media-origin bundle. Both lose the
per-service choice that the menu exists to give.
