# Decision — the `cloud-service` categories for twenty Cloudflare services

**Date** 2026-09-06 · **Branch** `2026-09-06-cloudflare-storage-and-data` ·
**Plan**
[`docs/plans/2026-09-06-cloudflare-storage-and-data/`](../../plans/2026-09-06-cloudflare-storage-and-data/index.md)
· **Extends** the closed `cloud-service` and `framework` category lists in
`plugins/stackgen/assets/taxonomy.md`

## What was decided before

The category vocabulary is **closed per type**, and the taxonomy says so in its
own words: extending it is an explicit, reviewed edit, never something a
materialization run invents. Before this landing the `cloud-service` list held
ten tokens, minted a service at a time as packs arrived — `document` for
Firestore, `access` for Zero Trust Access, `static-hosting` for Workers Static
Assets, each in the plan that shipped the pack needing it.

That per-landing rhythm works while services arrive one at a time. Twenty do
not.

## What changed

**Fourteen `cloud-service` tokens and one `framework` token were minted in a
single reviewed edit**, in the first of four chained plans, covering every one
of the twenty Cloudflare services the user chose — including the thirteen whose
packs land in plans B, C and D. Plans B–D mint nothing and never touch
`assets/taxonomy.md`.

The mapping decided, all twenty. Only the first seven ship packs today; the rest
are the category each service will carry when its plan lands, which is why the
token exists now.

| Service           | Type / category                      | `capability`           | Lands in |
| ----------------- | ------------------------------------ | ---------------------- | -------- |
| Workers KV        | `cloud-service` / `key-value`        | `cache-layer`          | A        |
| R2                | `cloud-service` / `object-storage`   | `object-file-storage`  | A        |
| D1                | `cloud-service` / `sql`              | `relational-datastore` | A        |
| Hyperdrive        | `cloud-service` / `database-proxy`   | unset                  | A        |
| Vectorize         | `cloud-service` / `vector`           | `search-index`         | A        |
| Pipelines         | `cloud-service` / `ingestion`        | unset                  | A        |
| Analytics Engine  | `cloud-service` / `analytics`        | unset                  | A        |
| Durable Objects   | `cloud-service` / `stateful-compute` | unset                  | B        |
| Workflows         | `cloud-service` / `orchestration`    | `durable-workflows`    | B        |
| Containers        | `cloud-service` / `compute`          | unset                  | B        |
| Queues            | `cloud-service` / `queue`            | `message-queue`        | B        |
| Workers AI        | `cloud-service` / `inference`        | unset                  | C        |
| AI Gateway        | `cloud-service` / `ai-gateway`       | unset                  | C        |
| AI Search         | `cloud-service` / `retrieval`        | unset                  | C        |
| Browser Rendering | `cloud-service` / `browser`          | unset                  | C        |
| Agents SDK        | `framework` / `agent-sdk`            | unset                  | C        |
| Images            | `cloud-service` / `media`            | unset                  | D        |
| Realtime          | `cloud-service` / `realtime`         | unset                  | D        |
| Email Service     | `cloud-service` / `messaging`        | `email`                | D        |
| Secrets Store     | `cloud-service` / `secrets-manager`  | unset                  | D        |

Seven carry a `capability`; thirteen leave it unset. That is not a shortfall in
the taxonomy — **capability tokens are vwf's to mint**, and stackgen's rule is
that a category whose capability vwf has not defined leaves the field unset with
a comment rather than stretching a neighbouring token over it. For plans B–D the
`capability` column is what the taxonomy's capability seam implies; each plan
confirms it when its pack lands.

**`messaging` is on the table but was not minted.** Email Service takes the
category that already exists and already carries `firebase-messaging`, because
the channel is the `capability` and not the category. Three of the fifteen that
*were* minted are less new than they look:

- **`secrets-manager` now sits under both `cloud-service` and
  `capability-provider`.** The first names the runtime binding a hosted service
  reads; the second the developer-machine and CI secrets provider that `doppler`
  and `fnox` fill. They share a noun and neither replaces the other.
- **`key-value` and `vector` are new to `cloud-service` and old to
  `datastore`.** A name on two type lists is the taxonomy working: the shared
  category is what makes Workers KV and a self-hosted key-value store
  substitutable answers to one capability.

**`stateful-compute` exists because Durable Objects is not object storage.** The
user's first read put it under `object-storage`, on the name. Two consequences
made that wrong and the user accepted both: pick-and-trade would line a Durable
Object up against R2 as if they were substitutable answers to one capability,
and the pack would be asked to satisfy `assets/contracts/object-storage.md`,
whose clauses a per-key coordination primitive cannot meet. A durable object is
compute that keeps state.

## Why mint them all at once

The alternative was to mint each token in the plan that ships its pack, which is
how the previous three arrived. Four reasons it does not scale here:

1. **`assets/taxonomy.md` would be a shared file across four plans**, each
   editing the same two lines. The plan split exists to keep the review surface
   small; a file every plan touches undoes that.
2. **The mapping is a single act of judgement.** Deciding `inference` against
   `ai-gateway` against `retrieval` requires holding all three services up
   together; split across plans, each would be decided alone and the seams would
   show.
3. **A category is a classification, not a promise.** The taxonomy classifies
   what a component *is*; a token with no pack behind it costs nothing and
   claims nothing. That is already true of categories vwf has no capability for.
4. **Reviewing fifteen tokens together is what makes the closed list closed.**
   One reviewed edit is the mechanism the taxonomy's own rule asks for.

## Rejected

- **Coarser groups — one `ai` token, one `media`, one `analytics`.** They would
  put Workers AI, AI Gateway and AI Search in one bucket, which is exactly the
  substitutability claim a category makes and exactly what is false about those
  three: a gateway in front of a model is not a model.
- **An `email` category token.** `messaging` already covers the channel
  services, and the channel is the `capability`, not the category. Minting one
  would have split a category on a distinction the capability layer already
  draws.
- **`object-storage` for Durable Objects.** Above.
- **`actor` for Durable Objects.** Accurate as a programming model and wrong as
  a category: the taxonomy classifies what a component is to a stack, not the
  concurrency pattern its SDK exposes. `stateful-compute` says the thing a
  reader needs — it is compute, and it keeps state.

## Consequences

- **Plans B, C and D add no token.** Each pack picks a category from the list
  this edit closed; a pack that finds it needs a new one has hit something the
  brief missed and reports it rather than minting.
- **Most of the minted categories carry no vwf capability** — the taxonomy names
  which — and that gap joins the still-open `static-hosting` token from
  [`2026-09-05-workers-static-assets-redeems-the-cloudflare-reservation.md`](./2026-09-05-workers-static-assets-redeems-the-cloudflare-reservation.md)
  as a vwf-side gap. Minting them is vwf's move and is parked in the plan.
- **Nothing validates a `category` against the taxonomy.** `plugins:inventory`
  requires the field's presence, not its membership, so a typo lands silently —
  and this edit adds fourteen tokens and seven packs that would have benefited.
  The plan parks it as **"a checker rule validating `pack.yaml`'s `category`
  against `taxonomy.md`'s list for its `type`"**, for a gate-only plan touching
  `scripts/src/check.ts`, `checks.md` and `check.test.ts`.
- **`assets/taxonomy.md` is the live list**; this doc is the record of the one
  edit that grew it and the reasoning behind each token. When the two disagree,
  the taxonomy is right and this doc is history.
