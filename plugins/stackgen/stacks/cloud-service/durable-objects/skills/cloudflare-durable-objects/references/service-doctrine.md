# Durable Objects — service doctrine

The service's own usage rules: how a class, its ids and its storage are
designed, what the binding and the migration must contain, and how a class
is changed after it has objects in it.

**There is no clause-by-clause contract satisfaction here, and that is
correct rather than missing.** This component's category is
`stateful-compute`, which realizes **no vwf capability token** — the
taxonomy records it among the known vwf-side gaps
(`${CLAUDE_PLUGIN_ROOT}/assets/taxonomy.md`), so `capability` is unset in
`pack.yaml` and nothing here mints one. `assets/contracts/orchestration.md`
is the async-orchestration contract and it is **not** this component's: a
Durable Object is a place that holds state, not a durable multi-step run.
The `workflows` component cites that contract; this one states its rules
directly below and invents no file to cite.

## Class design

**One responsibility per class, and the class is the schema of the id
space.** A class defines what an object *is*, and every id under it is one
of those. `Room`, `TenantQuota`, `Order` — never a `State` class whose
behaviour depends on a discriminator inside the id, because that is two
classes sharing a migration and neither can be deleted independently.

- **The class is exported from the Worker script named by `main`.** It is
  not a separate deployable, has no independent version, and ships and rolls
  back with the Worker
  ([get started](https://developers.cloudflare.com/durable-objects/get-started/)).
- **Load state once, in the constructor, behind
  `blockConcurrencyWhile`.** It guarantees no request is delivered until
  initialization completes, so the instance's in-memory copy is authoritative
  from the first request onward and later reads need not touch storage
  ([in-memory state](https://developers.cloudflare.com/durable-objects/reference/in-memory-state/)).
  Without it, the first concurrent requests race an unfinished constructor.
- **In-memory state is a cache of storage, never the truth.** An object can
  be evicted at any time. Anything that must survive eviction is written
  through to storage before the request that changed it returns.

## Id design, and the name as a contract

Two ways to name an object, and the choice is permanent for the data behind
it ([data location](https://developers.cloudflare.com/durable-objects/reference/data-location/)):

| Form | Reaches | Use for |
| --- | --- | --- |
| `idFromName(name)`, or `getByName(name)` | The same object from anywhere, for the same string | Anything the product can already identify |
| `newUniqueId()` | A fresh object, reachable only via an id the caller stores | An object with no natural name |

**The string handed to `idFromName` is a contract with the stored data.**
The derivation is deterministic, so changing how the name is built —
adding a prefix, normalizing case, switching from a slug to a uuid —
addresses a *different* object, and the storage behind the old name is
stranded rather than migrated. Decide the name's exact form when the class
is designed, write it down, and treat a change to it as a data migration
the product performs explicitly.

**`locationHint` is a hint, and only at first instantiation.**
`get(id, { locationHint: "enam" })` influences where a **new** object is
created and does not move an existing one
([data location](https://developers.cloudflare.com/durable-objects/reference/data-location/)).
An object created by a request from one region stays there; a product with a
regional data requirement sets the hint on the creation path, not on every
`get`.

## The single-threaded guarantee, and what it buys

Requests for one id are delivered to one instance and are not run
concurrently with each other. So a read-modify-write on that object's own
state is atomic **without** a lock, a transaction spanning a network, or a
compare-and-swap retry loop — that is the whole reason to reach for this
service, and a design that adds its own locking on top has misread it.

The guarantee is per id and nothing more. Two ids are two instances that may
be in two locations, and anything spanning them is an ordinary distributed
problem the object model does not solve.

## Storage

The `DurableObjectState` the constructor receives carries `id` and
`storage`
([DurableObjectState](https://developers.cloudflare.com/durable-objects/api/state/)),
and a SQLite-backed class reaches SQL **synchronously** through
`ctx.storage.sql.exec(...)` beside the key-value methods, which the SQL API
reference states is available only to a class on the SQLite backend
([SQL API](https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/)).

- **Pick key-value or SQL per class, not per call.** Counters, flags and a
  handful of fields are key-value. A set of related rows the object queries
  — messages in a room, line items on an order — is SQL, and the schema is
  created inside the object on first use rather than by an external
  migration tool, because the database belongs to the object.
- **The storage is transactional and strongly consistent** for the object
  that owns it. There is no read-your-write delay to design around, which
  is the property KV cannot offer.
- **Storage is capped per object, and the cap has moved.** Read the current
  number off the
  [limits](https://developers.cloudflare.com/durable-objects/platform/limits/)
  page at design time; the useful design input is that a per-object cap
  exists and an unbounded append inside one object will meet it. Trim, roll
  over to a new id, or move the history somewhere sized for it.
- **Classes per account are limited too** — a bounded number rather than
  the unbounded object count — so a class per tenant is the wrong axis;
  the tenant is an **id**, not a class.

## Alarms

`storage.setAlarm(time)` schedules one wake-up per object, and the class's
`alarm(alarmInfo)` handler runs it; `getAlarm()` reads whether one is
pending, and the handler's argument carries a `retryCount` for retried
invocations
([alarms](https://developers.cloudflare.com/durable-objects/api/alarms/)).

- **One alarm per object at a time.** Setting a new one replaces the
  pending one, so a class that needs a schedule re-arms inside the handler
  rather than queuing several.
- **Check before setting** — `getAlarm()` returning non-null means the wake
  is already booked, and blindly setting on every request pushes it
  forever.
- **The handler is a request**, so it is billed as one and is subject to the
  same single-threaded delivery.

## WebSocket hibernation

Accepting a socket with `ctx.acceptWebSocket(server)` rather than holding it
in application code lets the object be **evicted from memory while the
connection stays open**, and the next message wakes it into the
`webSocketMessage` handler; `ctx.getWebSockets()` enumerates the live ones
and `setWebSocketAutoResponse(new WebSocketRequestResponsePair(...))`
answers a matching request **without waking the object at all**
([WebSockets](https://developers.cloudflare.com/durable-objects/best-practices/websockets/),
[DurableObjectState](https://developers.cloudflare.com/durable-objects/api/state/)).

That is the cost shape as much as the API: an idle room full of connected
clients bills nothing for sitting there **if** the sockets were accepted
through the hibernation API and the heartbeat is auto-answered — and bills
for every idle second if they were not. See
[cost shape](cost-shape.md).

## The binding and the migration block, and whose file they go in

This component ships **no `wrangler.jsonc`**. The project's Workers pack
owns that file; what follows is what this service requires be present in it
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
names the exported class. **Both entries are required.** A binding with no
migration names a class the platform will not instantiate, and the failure
arrives at deploy or first use rather than at edit time.

`new_sqlite_classes` selects the SQLite storage backend for the class
([migrations](https://developers.cloudflare.com/durable-objects/reference/durable-objects-migrations/)),
and it is chosen once — at the migration that creates the class.

## Changing a class after it has objects

Migrations are tagged and applied in order, and each `tag` is unique
([Wrangler configuration](https://developers.cloudflare.com/workers/wrangler/configuration/)):

```jsonc
{
  "migrations": [
    { "tag": "v1", "new_sqlite_classes": ["MyDurableObject"] },
    {
      "tag": "v2",
      "renamed_classes": [{ "from": "MyDurableObject", "to": "Updated" }],
      "deleted_classes": ["DeprecatedClass"]
    }
  ]
}
```

- **Renaming the class is a migration, not an edit.** Renaming the symbol
  in the source without a `renamed_classes` directive presents the platform
  with a class it has never seen and orphans the objects under the old
  name. Cloudflare also exposes the rename declaratively, as a `renamed`
  export aliased with `renamed_to`
  ([migrations](https://developers.cloudflare.com/durable-objects/reference/durable-objects-migrations/));
  either form is a deliberate declaration, which is the point.
- **Deleting a class deletes its objects' storage, and it is
  irreversible.** `deleted_classes` is the only way to retire a class and
  there is no undo — so a deletion is its own deploy, after the code that
  used it is gone and after whatever needed keeping has been copied out.
- **Never reuse a tag.** Tags are the applied-migration ledger; a reused
  one is a migration the platform believes it has already run.

## Per-environment objects

**A staging Worker has its own objects, because it deploys its own class.**
The environment boundary is the Worker deployment, not a namespace id the
project chooses, so there is nothing extra to configure — the same binding
name in a staging environment resolves to that environment's own instances.

**Never one environment's objects reached with an id prefix.** A prefix is a
convention the runtime does not enforce: one wrong name in a test run
mutates a production object's storage, and the mistake is silent because
both calls succeed.

## What this component stays silent on

**Where the Worker runs, and what its Wrangler config otherwise says** —
that belongs to the project's hosting pin. **Durable multi-step runs** are
the `workflows` component's. **Which other Cloudflare services exist** is
the provider component's scope fence, not this one's.
