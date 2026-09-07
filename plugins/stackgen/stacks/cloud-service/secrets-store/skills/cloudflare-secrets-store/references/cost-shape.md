# Cost shape — Cloudflare Secrets Store

The provider-wide billing principle, the day-one guardrails and the cost
review are the `cloudflare` skill's cost-doctrine reference — cited here
and restated nowhere. This file states only what is **this service's**
own, and the honest answer is that the constraint here is not a bill.

## There is no published usage dimension, and that is the fact

Secrets Store is in **open beta**
([Secrets Store](https://developers.cloudflare.com/secrets-store/)), and
Cloudflare publishes no pricing page for it and no per-read, per-secret or
per-store charge to size against. So there is nothing to model, and
inventing a model would be worse than saying so — a number written here
would be wrong twice over: wrong now, and stale the moment the beta ends.

**What to do instead**: check Cloudflare's own current pricing before the
product's first cost review after the beta ends, and treat the account
entitlement below as the constraint until then. Never write a dollar
figure into this repo — the provider's cost doctrine has the reasoning.

## The entitlement is the real constraint

During the open beta an account gets **one store and 100 secrets**, and
only production secrets count — ones created locally, without `--remote`,
do not
([Manage account secrets](https://developers.cloudflare.com/secrets-store/manage-secrets/)).

That hundred is the number to plan against, and the trap is how quickly it
is consumed:

- **It is per account, not per environment.** With one store carrying
  development, staging and production, a product with thirty secrets has
  used ninety of the hundred. Three environments is the multiplier most
  people forget to apply.
- **It is per account, not per repository.** Two products in the same
  Cloudflare account share the entitlement, and the one that fills it
  breaks the other. If that is the shape, the argument for separate
  accounts is a capacity argument as well as a blast-radius one — which is
  the same conclusion the provider's identity reference reaches from the
  security direction.
- **Rotation temporarily needs two.** The create-new / re-point /
  delete-old order in [service doctrine](service-doctrine.md) holds both
  values at once, so a rotation of several secrets at the ceiling stalls
  halfway.

**Check usage rather than assuming it.** `secrets-store secret list`
enumerates what exists, and the account's quota endpoint reports
entitlement against usage
([wrangler secrets-store](https://developers.cloudflare.com/workers/wrangler/commands/secrets-store/),
[Secrets Store API](https://developers.cloudflare.com/api/resources/secrets_store/)).

## The size limit that bites quietly

A secret is a string of **at most 1024 bytes**
([Manage account secrets](https://developers.cloudflare.com/secrets-store/manage-secrets/)).
Most credentials are far under it; the case that is not is a **private
key** — a PEM-encoded RSA key clears 1024 bytes comfortably, and a service
account JSON blob clears it easily. Discover that at design time rather
than at the first deploy, and where a value does not fit, the answer is a
different custody mechanism rather than splitting it across two secrets.

## The cost this service actually adds to the bill

Not its own line — the consuming Worker's. Reading a secret is an
asynchronous call inside a request, so it spends the Worker's CPU time,
and Worker invocations and CPU time are billed
(`cloud-provider/cloudflare/skills/cloudflare/references/cost-doctrine.md`).

The design consequence is the same one [service doctrine](service-doctrine.md)
reaches from the correctness direction: **resolve once per request, never
per call site.** A `.get()` inside a retry loop multiplies a fixed cost by
the retry count, and a per-call-site read multiplies it by the size of the
services layer. One resolution passed down as a parameter is the cheaper
shape and the more reviewable one, which is a rare alignment worth taking.

## The review

Fold these into whatever cadence the product reviews cost and privilege
together — they read the same listing:

1. **How many of the hundred are used**, and how many of those belong to
   an environment that no longer exists.
2. **Which secrets nobody can name a consumer for.** A secret with no
   binding is entitlement held for nothing, and a credential still live at
   its source.
3. **Whether any resolution happens per call rather than per request.**
4. **Whether Cloudflare has published pricing** since the last review, at
   which point this file's first section stops being the answer.
