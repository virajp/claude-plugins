# Vectorize — service doctrine

The service's own usage rules: how an index is created and bound, what
goes into it, how it is queried, and what happens the day the embedding
model changes.

**This component realizes vwf's `search-index` capability, and there is
no clause-by-clause contract to satisfy — which is a gap in the contract
set, not a gap here.** `assets/contracts/` carries a doctrine for
datastores and one for object storage; it carries none for a search
index. So what this component satisfies is stated directly below, and
nothing here writes a contract to fill the hole — a contract is a
reviewed asset, not something a service component mints for itself.

## The index is created once, and two of its properties are permanent

An index is created with a name, a dimension count and a distance
metric:

```sh
wrangler vectorize create <index-name> --dimensions=<n> --metric=cosine
```

`--metric` is `cosine`, `euclidean` or `dot-product`, `--dimensions` runs
from 1 to 1536 at 32-bit precision, and **both are fixed for the life of
the index** — the store is optimized for one vector configuration and
offers no way to change it afterwards
([index configuration](https://developers.cloudflare.com/vectorize/get-started/embeddings/),
[Wrangler commands](https://developers.cloudflare.com/vectorize/reference/wrangler-commands/)).
Both follow the embedding model. Picking them independently of it
produces an index that answers, plausibly, wrongly.

**One index per environment, named for the environment.** The binding
name stays the same in every environment so no code branches on which
one it is in; the `index_name` behind it differs. Wrangler's
`--x-provision` / `--x-auto-create` flags will create draft bindings'
resources for you and are useful while exploring; they are experimental,
so an index that production depends on is created deliberately and
recorded, not conjured by a deploy.

## The binding, which the project adds

This component ships no config file. The block goes in the repo's own
`wrangler.jsonc`, beside whatever the hosting pin already put there:

```jsonc
{
  "vectorize": [
    { "binding": "VECTORIZE", "index_name": "<index-name>" }
  ]
}
```

The Worker reaches it as `env.VECTORIZE`
([Wrangler configuration](https://developers.cloudflare.com/workers/wrangler/configuration/)).

## What goes in a vector, and what does not

A vector is an id, the values, an optional namespace and optional
metadata. The **id is the design decision**: derive it from the source
record — the record's own identifier, or a stable hash of the chunk it
came from — never generate it. That single choice is what makes a re-run
of the embedding job idempotent, because writing the same id twice is
defined behaviour rather than a duplicate.

Metadata is at most 10KiB per vector and the id at most 64 bytes
([limits](https://developers.cloudflare.com/vectorize/platform/limits/)).
Keep metadata to what the query needs to **filter** on and what the
caller needs to **get back to the record** — an identifier, a tenant, a
kind, a timestamp. Metadata that is trying to be the record is a second
copy of the truth with no transaction around it, and because a vector
cannot be partially updated, changing one field means rewriting the
whole vector anyway.

## Namespaces and metadata indexes are two mechanisms, chosen differently

- A **namespace** is a string on the vector, set at write time, and a
  query names one to search inside it. Filtering on it is supported by
  default with nothing to declare
  ([insert vectors](https://developers.cloudflare.com/vectorize/best-practices/insert-vectors/)).
  Use it for the partition the product will *always* query within — a
  tenant, a content type, a language. It is a hard boundary, and a query
  cannot span two of them.
- A **metadata index** is declared per property, before the vectors are
  written, over `string`, `number` or `boolean`, up to ten per index.
  Without one, a property is stored but not filterable, and **vectors
  written before the index existed are not in it until they are written
  again**
  ([metadata filtering](https://developers.cloudflare.com/vectorize/reference/metadata-filtering/)).
  String indexes cover only the first 64 bytes of the value, and number
  indexes are float64.

```sh
wrangler vectorize create-metadata-index <index-name> \
  --property-name=<property> --type=string
```

The ordering rule is the trap worth designing against: **declare every
metadata index before the first bulk load**. Discovering a needed
filter after a million vectors are in means re-writing a million
vectors, and the failure is silent — the filter simply returns nothing
rather than erroring.

## Writes are asynchronous, and `insert` is not `upsert`

`insert` **skips** an id that already exists; `upsert` replaces it. Both
return a **mutation id** rather than a completed write, and it takes a
few seconds for the vectors to become queryable
([client API](https://developers.cloudflare.com/vectorize/reference/client-api/)).

Three consequences:

- **Default to `upsert` for anything derived from a mutable record.**
  `insert` is for a load into an empty index, where its skip is a
  guard rather than a silent no-op.
- **Never write-then-query in the same request or the same test.** A
  test that seeds and immediately asserts is a test that passes on a
  fast day. Seed in a prior step, or poll for visibility deliberately.
- **Batch, and know the cap.** Up to 1,000 vectors per upsert from a
  Worker and 5,000 over the HTTP API; a bulk load from the CLI takes an
  NDJSON file, `wrangler vectorize insert <index-name> --file=<path>`
  ([limits](https://developers.cloudflare.com/vectorize/platform/limits/),
  [insert vectors](https://developers.cloudflare.com/vectorize/best-practices/insert-vectors/)).

**Deletion is the path that gets forgotten.** Deleting the source record
has to delete its vectors by id, or the index keeps returning results
that resolve to nothing. A query path that tolerates a missing record is
worth having anyway; a delete path that never ran is not something the
index will tell you about.

## Querying, and the cost of asking for more back

A query is a vector plus options — `topK`, an optional `namespace`, an
optional metadata `filter`, and two flags that decide what comes back:

```ts
const matches = await env.VECTORIZE.query(queryVector, {
  topK: 10,
  filter: { kind: "article" },
  returnValues: false,
  returnMetadata: "all",
});
```

**`topK` has two ceilings, and which one applies depends on what you ask
for**: up to 50 results when the query returns values or metadata, up to
100 when it returns neither
([limits](https://developers.cloudflare.com/vectorize/platform/limits/)).
That is the trade in one number. `returnValues: true` returns the stored
vectors themselves, which the caller almost never needs — it already has
the query vector, and the values are the largest thing in the response.
Prefer returning ids and the metadata that resolves them, then fetching
the records from wherever they actually live.

## Versioning an index when the embedding model changes

Because dimensions and metric are fixed, a new model is a new index.
There is no in-place migration to reach for, so the shape is a **build,
dual-write, cut over, retire**:

1. **Create the new index** at the new model's dimensions and metric,
   under a name that carries the model version.
2. **Backfill it** from the source records — not from the old index,
   whose vectors are in the wrong space and cannot be converted.
3. **Dual-write** while the backfill runs: every write path writes both,
   so the new index does not fall behind the moment it is created. This
   is the step people skip, and skipping it means the backfill is stale
   before it finishes.
4. **Cut the read path over** behind one configuration change — a new
   `index_name` under the same binding name — after verifying the new
   index answers the queries the old one did.
5. **Retire the old index**, deliberately, once nothing reads it.

The reason to write this down at pick time rather than discover it later
is step 2: **the corpus, not the index, is the source of truth for a
re-embed.** A product that cannot regenerate every embedding from its own
records has an index it can never migrate, and that constraint is worth
knowing before the corpus is large.

## What this component stays silent on

**Producing the embeddings.** The inference provider is a separate pick
and its doctrine is not this component's; the `cloudflare` skill's scope
fence says which of this provider's AI services the stack offers at all.

**A managed retrieval pipeline over documents** — chunking, scheduled
re-indexing, a query interface over the result. Nothing here does that,
and building it by hand on top of this index is the honest description
of what it would take.
