# Cloudflare Durable Objects — conventions

**Stateful serverless**: a class that lives in the Worker script, of which
the platform instantiates **one object per id**, each with its own storage
and its own single-threaded execution. Cloudflare's own storage guidance
places it at "global coordination and stateful serverless" with "strongly
consistent, transactional storage"
([storage options](https://developers.cloudflare.com/workers/platform/storage-options)).
It is where the state that must be **correct per key** lives — a counter, a
lock, a room, a session, a per-tenant ledger.

**It is not a database shared across requests.** Relational data queried by
fields other than the key belongs in D1, which this stack offers as its own
component — see `cloud-service/d1/`. **It is not a cache.** A global,
eventually consistent read path is Workers KV's — see `cloud-service/kv/`.
The question that separates the three is whether two concurrent requests may
disagree: if they may not, and the disagreement is about one key, this is
the answer.

**One object per id, and the id is the concurrency unit.** Requests for the
same id are delivered to the same instance and run **single-threaded**, so
read-modify-write on that object's state needs no lock the product writes.
Requests for different ids run in different instances, possibly in different
locations, and share nothing. Every scaling and correctness property here
follows from that one sentence.

**The storage is the object's own and it is transactional.** The
`DurableObjectState` a class is constructed with carries `id` and `storage`
([DurableObjectState](https://developers.cloudflare.com/durable-objects/api/state/)),
and a SQLite-backed object reaches SQL synchronously through
`ctx.storage.sql.exec(...)` alongside the key-value methods
([SQL API](https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/)).
Storage per object is capped and the cap has moved as the product matured —
verify the current number against the limits page rather than against any
file, including this one.

## The binding a project adds

This pack ships **no `wrangler.jsonc`** and writes no configuration. The
project's Workers pack owns that file; this component names what goes in it.
Two entries are required and neither works without the other — a binding,
and a **migration** declaring the class to the platform
([get started](https://developers.cloudflare.com/durable-objects/get-started/),
[migrations](https://developers.cloudflare.com/durable-objects/reference/durable-objects-migrations/)):

```jsonc
{
  "durable_objects": {
    "bindings": [
      { "name": "MY_DURABLE_OBJECT", "class_name": "MyDurableObject" }
    ]
  },
  "migrations": [
    { "tag": "v1", "new_sqlite_classes": ["MyDurableObject"] }
  ]
}
```

`name` is what the Worker reads as `env.MY_DURABLE_OBJECT`; `class_name`
names a class that **must be exported from the Worker script named by
`main`**. There is no id to record and no resource to create first — that is
the shape difference from every other backing service in this stack, and the
reason a Durable Objects pin expects a Workers deploy pin beside it. A
binding whose `class_name` names nothing exported is a deploy failure, and a
class deployed with no migration is a class the platform will not
instantiate.

**`new_sqlite_classes` rather than `new_classes` is the choice being made in
that block**, and it selects the SQLite storage backend for the class
([migrations](https://developers.cloudflare.com/durable-objects/reference/durable-objects-migrations/)).
It is set once, at the migration that creates the class.

## Id design

Two ways to name an object, and they are different contracts
([data location](https://developers.cloudflare.com/durable-objects/reference/data-location/)):

- **`idFromName(name)`** — or the shorthand `getByName(name)` — derives the
  id from a string, so the same name always reaches the same object from
  anywhere. **The name is a contract.** It is the product's identifier for
  the thing the object *is*: a room code, a tenant id, an order number.
  Changing the derivation strands the object's storage under an id nothing
  will ask for again.
- **`newUniqueId()`** — a fresh object nothing can reach by name; the caller
  must persist the id somewhere else to find it again.

Prefer the named form for anything the product can already identify, and
reach for the unique form only when the object genuinely has no name.
`get(id, { locationHint })` is a best-effort hint at where a **new** object
is first instantiated, not a placement guarantee and not a relocation.

## What this component does not cover

**Which Cloudflare services are offered, planned or declined** is the
provider component's to state — see
`cloud-provider/cloudflare/conventions.md`, and do not fill a gap from
general Cloudflare knowledge. **A durable multi-step run** — retries,
`sleep`, waiting for an event — is the `workflows` component's; a Durable
Object is a long-lived coordinator, not a workflow engine. **The account and
role model behind the deploy credential**, and **the account-level billing
shape**, are the `cloudflare` skill's identity-and-iam and cost-doctrine
references, cited and never restated here.

Full judgment: the `cloudflare-durable-objects` skill and its references.
