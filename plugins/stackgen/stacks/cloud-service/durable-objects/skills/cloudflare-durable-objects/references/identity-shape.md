# Durable Objects — identity shape

The least-privilege grant this service needs. The account-side model — the
account-owned scoped token over the Global API Key, the account id that
travels with it, one identity per workload, why the roles are broader than
they look, and the privilege review — is the `cloudflare` skill's identity
and IAM reference, which this cites and does not restate. Nothing about the
credential's name, its storage or the account id is repeated here.

## The runtime has no credential

**The binding is the whole runtime identity.** A Worker reads
`env.MY_DURABLE_OBJECT`, derives an id and calls the object; the platform
resolves the binding to the class deployed in that same Worker. There is no
key, no token and no connection string in product code, and nothing to
inject at the process boundary to reach an object at request time.

**No id belongs in code either**, and that is a stronger statement than it
is for the other backing services. Elsewhere a resource id is a configured
constant; here the id is **derived at call time** from a name the product
already has — `getByName(tenantId)`, `getByName(roomCode)`. A hard-coded
`idFromString` hex literal in product code is the signal that something was
copied out of a dashboard, and it will not survive an environment change.

## The permission a deploy needs

**There is no separate Durable Objects data permission to ask for**, and
that is the useful fact — the same inherited shape the `workflows`
component reaches from its own direction. The class is part of the Worker
script and the migration is part of that script's configuration, so
**deploying the Worker is the whole operation**: what the account API
requires to upload a Worker and its assets is **`Workers Scripts Write`**
([upload assets](https://developers.cloudflare.com/api/python/resources/workers/subresources/scripts/subresources/assets/subresources/upload/methods/create)),
the same permission the project's hosting pin already asks for on the same
account.

| Doing | Needs |
| --- | --- |
| Deploying a Worker that declares the class and its migration | `Workers Scripts Write` — already the hosting pin's |
| Creating the object, the namespace or the storage ahead of time | Nothing — there is none to create |

The second row is the shape difference worth naming. A namespace-backed
service is provisioned first and bound second, so its pipeline needs a
credential that can create the resource. **Durable Objects are provisioned
by the migration**, which travels inside the deploy, so nothing is created
out of band and no extra grant appears for it.

Confirm the exact current permission name against Context7 rather than this
file; Cloudflare renames them, and a token created from a stale name fails
with an authorization error that names no permission.

## What the migration makes the deploy credential able to do

**A deploy can delete data.** `deleted_classes` destroys the objects'
storage irreversibly (see [service doctrine](service-doctrine.md)), and it
travels in the same configuration change as any other deploy, under the same
token. So the blast radius of the deploy credential includes the product's
per-key state, not merely its code — which is an argument for the migration
that deletes a class being **its own reviewed deploy**, and for the
production pipeline's token being the one that nobody also uses from a
laptop.

## The scope is the account

Grants here are account-scoped, as the provider reference states — a token
that can edit Workers scripts on the account reaches **every** Worker on it,
and therefore every class and every object behind them. There is no
per-class or per-object grant to reach for. Where the blast radius genuinely
must be smaller, the answer is a separate account rather than a cleverer
token.

## What the data itself may hold

An object's storage is readable by the class that owns it and by anything
that can deploy a replacement for that class. **Personal data in an object
is personal data**, and this service offers **no expiry mechanism at all** —
no TTL on a write, nothing that sweeps. Retention is code the class runs: an
alarm that trims, a delete on a lifecycle event, a rollover to a fresh id.
If the product's retention rule has no owner inside the class, this is the
wrong place for that data.
