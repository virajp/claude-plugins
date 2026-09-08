# Cloudflare Secrets Store — conventions

**Two tools hold this product's secrets, and they hold different ones.**
The repo's `capability-provider` pick — `capability-provider/fnox`, or
whichever provider the repo chose when it was shaped — holds and injects
the secrets a **developer's machine and CI** need, on the way in.
**Secrets Store holds the values a deployed Worker or Container reads in
staging and production.** A repo pins both, on different axes, for
different environments; neither replaces the other, and a sentence that
treats one as the other is the mistake this component exists to prevent.

The seam is where the secret is *consumed*. Something running on a laptop
or in a pipeline consumes it as an environment variable the injector set;
something running on Cloudflare consumes it through a binding the platform
resolved. Same value, sometimes the same name, two entirely different read
paths — and only the second one is this component's.

## What the store is

An account-level store of encrypted secrets, reusable across the account
rather than pinned to one Worker
([Secrets Store](https://developers.cloudflare.com/secrets-store/)). It is
**not** Workers' per-Worker Variables and Secrets, which are defined and
managed on one Worker at a time
([Workers integration](https://developers.cloudflare.com/secrets-store/integrations/workers/)).

Four facts shape every decision below, and all four are properties of the
platform rather than of a design:

- **A secret is a string of at most 1024 bytes**, and once it is saved it
  can no longer be decrypted or read back — not through the API, not on
  the dashboard. Only the service the secret is scoped to ever sees the
  value
  ([Manage account secrets](https://developers.cloudflare.com/secrets-store/manage-secrets/)).
- **One store per account, and 100 secrets**, during the open beta. Only
  production secrets count against the hundred; ones created locally,
  without `--remote`, do not
  ([Manage account secrets](https://developers.cloudflare.com/secrets-store/manage-secrets/)).
- **Every secret carries a scope list** naming the services allowed to
  consume it — `workers` and `ai-gateway` today. A bind is rejected if the
  consuming service is not on that list, however privileged the caller
  ([Access control](https://developers.cloudflare.com/secrets-store/access-control/)).
- **Compatibility is Workers and AI Gateway**, and nothing else yet
  ([Secrets Store](https://developers.cloudflare.com/secrets-store/)).

## The binding block, which the project adds to its own config

This component ships **no config** and writes no file into the repo. What
it gives a project is the shape to add to the `wrangler.jsonc` its own
hosting component already owns — `cloud-service/workers-ssr/` for a
Worker, `cloud-service/containers/` for a container beside one:

```jsonc
{
  "secrets_store_secrets": [
    { "binding": "API_KEY", "store_id": "<store>", "secret_name": "<name>" }
  ]
}
```

`binding` is the name the code sees on `env`; `store_id` is the store the
secret lives in; `secret_name` is the secret it resolves to, and it is the
field that differs per environment
([Workers integration](https://developers.cloudflare.com/secrets-store/integrations/workers/)).
A container reads the same binding through the Worker in front of it —
the block is identical
([Env vars and secrets](https://developers.cloudflare.com/containers/examples/env-vars-and-secrets/)).

Neither `store_id` nor `secret_name` is a value. They are identifiers, and
committing them commits nothing sensitive — which is the reason this
component lands no ciphertext and the secrets contract's encrypt-into-git
allowance has nothing to apply to here.

**The read is asynchronous and happens on the binding**, not on
`process.env`:

```js
const apiKey = await env.API_KEY.get();
```

([Workers integration](https://developers.cloudflare.com/secrets-store/integrations/workers/)).

## Against per-Worker secrets, and when each is right

Workers' own Variables and Secrets attach an encrypted value to **one**
Worker, read as a plain property of `env`
([Secrets](https://developers.cloudflare.com/workers/configuration/secrets/)).
That is the simpler thing, and it stays right where a value belongs to
exactly one Worker and nothing else will ever want it.

Reach for the store when the value is **shared** — the same upstream API
key used by a Worker and the container behind it, the same credential in
two services — or when who may hold and rotate it is a different question
from who may deploy the Worker. Sharing is the argument: a value copied
into three per-Worker secret lists is rotated three times, and the third
one is the one that gets forgotten.

## Creating and rotating

Secrets are created from the dashboard, the API, or Wrangler
([Workers integration](https://developers.cloudflare.com/secrets-store/integrations/workers/)):

```sh
pnpm exec wrangler secrets-store secret create <STORE_ID> --name MY_SECRET --scopes workers --remote
```

`--remote` is what makes the command touch the account; without it the
command works against the local development store
([wrangler secrets-store](https://developers.cloudflare.com/workers/wrangler/commands/secrets-store/)).
Take the interactive value prompt and never `--value`, which the docs
themselves mark as test-only because it leaves the plaintext in shell
history. Secret names cannot contain spaces
([Workers integration](https://developers.cloudflare.com/secrets-store/integrations/workers/)).

**Rotation is three ordered steps, and the order is the whole point.**
Create the new secret under a new name, re-point the binding and deploy,
then delete the old secret once nothing resolves to it. Editing a value in
place is the tempting shortcut and it removes the ability to roll back:
the old value cannot be read again, so a deploy that turns out to need it
has nothing to return to.

## The secrets contract

The neutral contract this product's secrets owe is stackgen's secrets
contract. This component satisfies part of it and
does not satisfy the rest — which is the correct outcome for a runtime
store, because the clauses about a developer's machine and a pipeline are
the `capability-provider` pack's to answer. The walk is clause by clause
in the `cloudflare-secrets-store` skill's
[service doctrine](skills/cloudflare-secrets-store/references/service-doctrine.md),
including the one place the platform's model genuinely differs from the
contract's cardinal rule, stated as a difference rather than explained
away.

## What this component does not cover

- **A developer's secrets, and CI's.** Those are the repo's
  `capability-provider` pick — `capability-provider/fnox` in a repo that
  took the default. Nothing here holds them or injects them.
- **TLS keys and certificates.** Those belong to the zone, not to an
  account secrets store.
- **Which secrets the product has.** That is `docs/blueprint/environment.md`
  — names and issuers, never values.

Cost and identity are **cited, never restated**: the account-wide billing
principle and the credential rule are the `cloudflare` skill's cost
doctrine and identity-and-iam references, and what is this service's own —
the account entitlement, the roles and the scope list — is the
`cloudflare-secrets-store` skill's cost-shape and identity-shape. Which
Cloudflare services this stack offers at all is the `cloudflare` skill's
fence to state.

Full judgment: the `cloudflare-secrets-store` skill's five references.
