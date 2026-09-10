# Durable Object wiring

**An agent class that is not declared in the Worker's Wrangler configuration
does not exist at runtime.** There is no compile-time signal: the class type
checks, the import resolves, and the binding is `undefined` on `env` the first
time anything reaches for it. This reference is the declaration and its
lifecycle; the object's own doctrine — one responsibility per class, the
storage bill, alarms, what deleting a class costs — is the
`cloud-service/durable-objects` component's, and is not repeated here.

## The file is the deploy pin's

This component ships no configuration. `wrangler.jsonc` belongs to the Workers
pack the project pins on its deploy axis — `cloudflare-workers-ssr`, or
`cloudflare-containers` where the compute is an image beside the Worker. What
follows is the block a project **adds** to that file, and a change to it is a
change to the deploy pin's artifact.

## Three things the declaration must carry

```jsonc
{
  "main": "src/server.ts",
  "compatibility_flags": ["nodejs_compat"],
  "durable_objects": {
    "bindings": [{ "name": "CounterAgent", "class_name": "CounterAgent" }]
  },
  "migrations": [{ "tag": "v1", "new_sqlite_classes": ["CounterAgent"] }]
}
```

([quick start](https://developers.cloudflare.com/agents/getting-started/quick-start/))

- **`nodejs_compat`** is required by the `agents` package
  ([add to an existing project](https://developers.cloudflare.com/agents/getting-started/add-to-existing-project/)).
  Without it the Worker fails to start, which at least fails loudly.
- **`class_name`** must match the exported class exactly; **`name`** becomes
  the property on `env`. Keeping the two identical is the convention worth
  holding — a binding named differently from its class reads as two things.
- **SQLite storage is not the default and the SDK needs it.** State and
  `this.sql` both live in it, so a class declared without it is an agent that
  cannot persist anything.

## Two declaration forms, and which one a project is on

Wrangler now also expresses the class lifecycle through an `exports` block
([configuration](https://developers.cloudflare.com/agents/runtime/operations/configuration/)):

```jsonc
{ "exports": { "MyAgent": { "type": "durable-object", "storage": "sqlite" } } }
```

Cloudflare's own material shows both this and the `migrations` array above, in
current pages, so **detection decides**: read what the project's
`wrangler.jsonc` already uses and stay on it. Do not mix the two forms for one
class, and do not migrate an existing project from one to the other as a
side effect of adding an agent — that is its own change, verified against the
configuration reference at the version of Wrangler the project pins.

## Adding, renaming and removing a class

- **Adding** is one more binding entry plus one more storage declaration —
  a new `migrations` tag with the class in `new_sqlite_classes`, or a new
  `exports` entry.
- **Renaming** is not a rename of the class in code alone. The old name must
  stay declared as a tombstone pointing at the new one
  (`"state": "renamed"`, `"renamed_to": …`), or the objects behind the old
  name are orphaned
  ([configuration](https://developers.cloudflare.com/agents/runtime/operations/configuration/)).
- **Removing** destroys the storage of every instance of that class, and there
  is no undo. Verify against the Durable Objects component's doctrine before
  writing the change, not after deploying it.

## Environments are deployments, not namespaces

The class travels inside the Worker script, so a staging Worker deploys its own
class and has its own agents. There is nothing to separate per environment and
**no id prefix to reach for** — a prefix is a convention the runtime does not
enforce, so one wrong name in a script mutates a production agent's storage.
This is the Durable Objects component's rule and it applies unchanged here.

The one prefix that is safe is `routeAgentRequest`'s own `prefix` option, which
is applied by the router on the way in rather than by each caller
([routing](https://developers.cloudflare.com/agents/runtime/communication/routing/)).

## Bindings the agent itself uses

An agent that calls a model, a gateway or a store reads those from `env` like
any Worker — the `ai` binding, an R2 bucket, a queue. Those bindings are the
backing-axis pins' business and are declared in the same file, by whichever
component documents them. Nothing about them is special because the caller is
an agent.

API details for every key named here are Context7's at use time; this
reference states what must be present and why, never the full schema.
