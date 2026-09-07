# Pick & trade — Cloudflare Secrets Store

When this store is the answer for a value, and when it is not. The
question it answers is narrow and worth stating first: **where does a
value live so that something running on Cloudflare can read it in staging
and production.** Every other secrets question in the repo is a different
question with a different answer.

## The one comparison that is not a comparison

The repo's `capability-provider` secrets pick —
`capability-provider/fnox` in a repo that took the default — is not an
alternative to this store, and picking one does not settle the other. It
holds and injects what a **developer's machine and CI** need; this store
holds what a **deployed Worker or Container** reads. A repo that runs on
Cloudflare pins both.

The failure this separation prevents is specific and expensive: reaching
the developer-side provider into production. That means a long-lived
decryption identity or platform credential present wherever the product
runs, a bootstrap credential to read the credentials, and a laptop that
can decrypt production by construction. The store's model gives the
running code no credential at all — the platform resolves the binding —
so there is nothing on the deployed side to steal, rotate or leak.

Reaching the other way is just as wrong and much easier to do by accident:
a developer wanting the real value on their laptop. Cloudflare refuses it
outright — a production secret cannot be read from local development
([Workers integration](https://developers.cloudflare.com/secrets-store/integrations/workers/))
— and that refusal is worth defending rather than routing around. See
[local dev](local-dev.md).

## Against a per-Worker secret

Workers' own Variables and Secrets attach an encrypted value to one
Worker, read as a plain property of `env`
([Secrets](https://developers.cloudflare.com/workers/configuration/secrets/)).
Secrets Store is explicitly the other thing: account-level, reusable
across the account
([Workers integration](https://developers.cloudflare.com/secrets-store/integrations/workers/)).

**Pick the store when the value is shared, or when custody is a separate
question from deployment.**

- **Shared** — the upstream API key a Worker and the container behind it
  both use, the credential two services present to the same vendor. A
  value copied into three per-Worker lists is rotated three times, and the
  third is the one that gets missed.
- **Custody** — the people who may hold and rotate a payment credential
  are not necessarily the people who may deploy a Worker. Secrets Store
  splits those into different roles; a per-Worker secret cannot
  ([Access control](https://developers.cloudflare.com/secrets-store/access-control/)).
- **Audit** — a secret carries a comment, a scope list, a created and a
  modified timestamp, and they are readable without the value
  ([wrangler secrets-store](https://developers.cloudflare.com/workers/wrangler/commands/secrets-store/)).

**A per-Worker secret stays right** where the value belongs to exactly one
Worker and always will, where the read path being synchronous matters, or
where the account entitlement is the binding constraint and this value is
not worth one of the hundred. That is not a lesser choice; it is the
smaller tool doing a smaller job.

## Against a variable in the wrangler config

Never, for a secret. `vars` in the wrangler config is plaintext in a
tracked file, and a value put there is published to everyone who can read
the repo and everyone who can read the deployed Worker's settings. The
line between the two is not "is it sensitive" but "would its disclosure
require action" — an API base URL is a var, a log level is a var, anything
whose leak means rotating something is not.

## What to check before pinning

- **Is the consuming service supported?** Compatibility today is Workers
  and AI Gateway, and nothing else
  ([Secrets Store](https://developers.cloudflare.com/secrets-store/)). A
  value needed by something that is neither has no home here.
- **Does the account have room?** The open beta allows one store per
  account and 100 production secrets
  ([Manage account secrets](https://developers.cloudflare.com/secrets-store/manage-secrets/)).
  With one store for every environment, that hundred is shared across all
  of them — see [cost shape](cost-shape.md).
- **Does the value fit?** A secret is a string of at most 1024 bytes
  ([Manage account secrets](https://developers.cloudflare.com/secrets-store/manage-secrets/)).
  A long PEM private key is the case that hits this, and it hits it
  quietly.
- **Does the product serve the China Network?** Secrets Store is
  unavailable there
  ([Secrets Store](https://developers.cloudflare.com/secrets-store/)).

## The trade, stated plainly

What is bought: no credential in the deployed code, one custody surface
for a shared value, rotation in one place, roles that separate holding a
secret from deploying with it, and a value that cannot be read back by
anyone once written.

What is paid: an asynchronous read on a platform-shaped object rather than
an environment variable — which is the one place the neutral secrets
contract's cardinal rule is answered differently, walked in
[service doctrine](service-doctrine.md) — a single account-level store to
carry every environment while the beta limit stands, and a deploy-time
permission broader than the pipeline needs, in
[identity shape](identity-shape.md).

## When it stops being the answer

- The product moves off Cloudflare. The binding has no equivalent
  elsewhere, which is the argument for keeping the read behind one module
  rather than scattering `.get()` through the services layer.
- A value is needed by something outside Workers and AI Gateway.
- The account outgrows one store and the beta limit has not lifted, at
  which point per-environment isolation by name stops being a discipline
  and starts being a risk worth re-deciding.
