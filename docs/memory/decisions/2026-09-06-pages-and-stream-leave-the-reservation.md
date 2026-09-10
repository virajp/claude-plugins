# Decision — Pages and Stream leave the reservation, and the reservation ends

**Date** 2026-09-06 · **Branch** `2026-09-06-cloudflare-storage-and-data` ·
**Plan**
[`docs/plans/2026-09-06-cloudflare-storage-and-data/`](../../plans/2026-09-06-cloudflare-storage-and-data/index.md)
· **Retires** the Cloudflare scope reservation as it stood after
[`2026-09-05-workers-static-assets-redeems-the-cloudflare-reservation.md`](./2026-09-05-workers-static-assets-redeems-the-cloudflare-reservation.md)
and
[`2026-09-06-workers-ssr-redeems-the-script-reservation.md`](./2026-09-06-workers-ssr-redeems-the-script-reservation.md)

## What was decided before

The reservation was written when `zero-trust-access` was the only Cloudflare
service that shipped, and it named what was held back so a short menu would not
read as a broken one. It narrowed twice, a service at a time, and both times the
prose kept the same closing list:

> **Everything else stays reserved, by name.** Pages, R2, D1, KV, Durable
> Objects, Queues, Images and Stream.

Reserved meant *planned under its own effort* — a promise that the service was
coming, not a judgement that it should. Two names on that list were never going
to be redeemed, and the list had no way to say so.

## What changed

**The reservation is dissolved, not narrowed a third time.** The user asked for
the whole Cloudflare developer platform, was briefed service by service, and
chose twenty. That answer does not fit a single list: some services ship now,
some ship under plans B, C and D, and some are refused. So the provider
component's conventions and its router skill now carry **three** lists —
offered, planned and declined — and they are the only place any of it is
written. No doc anywhere lists reserved Cloudflare services any more.

**Pages and Stream move to the declined list, permanently.** They are retired,
not deferred; neither is waiting on an effort that has not been scheduled.

- **Pages** is superseded by Workers Static Assets, on Cloudflare's own steer.
  Its documentation landing page opens by asking the reader not to use it —
  *"Workers supports most Pages use cases and offers a broader feature set. It
  is Cloudflare's primary platform for building applications. Start new projects
  with Workers"*
  ([`developers.cloudflare.com/pages/`](https://developers.cloudflare.com/pages/),
  verified 2026-09-06; the comparison is
  [`workers/static-assets/migration-guides/migrate-from-pages/`](https://developers.cloudflare.com/workers/static-assets/migration-guides/migrate-from-pages/)).
  A pack for it would be a curated recommendation to take the path its own
  vendor steers people off, and the service it would compete with —
  `cloud-service/workers-static-assets` — has shipped since 2026-09-05.
- **Stream** was offered to the user in the service-by-service brief and
  declined. Nothing about it is unsuitable; it was simply not chosen.

**Turnstile joins them** on the same footing — offered and declined — and is
recorded under the plan's Parked entries as a pack somebody could still ask for.

## Why

A reservation list is a debt instrument: every name on it is a promise a later
run has to honour or explain. Keeping Pages on it would have kept promising a
pack that should never be written, and keeping Stream on it would have
misrepresented a decline as a schedule. Splitting the one list into three costs
a paragraph and repays it by making the menu's silence legible in the only place
that can go stale — the provider component itself.

Retiring the list rather than editing it a third time was also the cheaper
shape. Redeeming a service used to mean touching the same sentence in seven
files; the three lists live in the provider pack, and a service pack points at
them instead of restating them.

## Rejected

- **Retire Pages, keep Stream reserved.** The user's ruling was "Retire both".
  Stream is not scheduled, and a list that holds unscheduled services is the
  debt described above.
- **Keep both reserved and narrow the list a third time.** The list cannot
  express *declined*, so anything on it reads as coming.
- **Delete the reservation prose outright, saying nothing about scope.** That is
  the failure the original reservation was written to avoid: a menu that comes
  back short without explaining itself is indistinguishable from a broken
  adapter.

## Consequences

- **A Stream or Pages pack now needs a fresh decision**, not the discharge of an
  existing promise. The declined list states the ground for each, so re-opening
  one means answering that ground rather than picking up where a plan left off.
- **The provider conventions are the single source for Cloudflare scope.** The
  reservation sentences in `workers-ssr`, `workers-static-assets` and the three
  older `cloudflare-*` bundles were each replaced by a pointer to it, so there
  is one file to edit when the scope moves again.
- **The two earlier decisions docs stand as written.** They are the record of
  what was true when they were written; their "eight services" count is stale
  and stays stale — this doc is the correction, and neither was edited.
