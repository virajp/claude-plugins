# Vectorize — pick & trade

## What it is for

Similarity search over embeddings the product produces and owns:
retrieval for a generation step, "more like this" recommendation,
near-duplicate detection, clustering, classification by nearest label.
The index is bound to a Worker and reached as an ordinary binding, so
the search lives where the request already is.

Cloudflare's own storage comparison assigns vector search to this
product and nothing else on the platform: KV for configuration and
routing metadata, R2 for objects, D1 for lightweight relational data,
Hyperdrive in front of an existing Postgres or MySQL, and Vectorize for
vector search over AI embeddings
([storage options](https://developers.cloudflare.com/workers/platform/storage-options/)).

## When it is the answer

- **The product has embeddings and needs the nearest ones.** Not a
  keyword match, not a filter — a distance ranking over a space the
  product's own model defines.
- **The corpus is the product's, and it changes.** Vectors are written
  by the product's own job and re-written when the source record
  changes, keyed by an id that comes from that record.
- **The query path is already a Worker.** A binding costs no connection
  pool, no credential in the request path and no round trip out of the
  platform.

## When it is not the answer

- **Exact lookup by key.** If the query is "give me the record with this
  id", a datastore answers it faster, cheaper and consistently — this
  index answers "what is near this vector", and using it as a key-value
  store is paying vector prices for a hash lookup.
- **Filtering that is really a `WHERE` clause.** Metadata filtering
  narrows a similarity search; it is not a query engine. Ten indexable
  properties is the ceiling, and a design that wants an eleventh
  predicate wants the relational store to do the selection first.
- **A corpus that is one hundred rows.** Below the size where an index
  earns its operational weight, scanning in the store the records
  already live in is simpler and has one fewer thing to keep in step.
- **A vector column in a database the product already runs.** Where the
  relational store is a Postgres reached through Hyperdrive and that
  Postgres already carries a vector extension, keeping the embedding
  beside the row means one write, one transaction and no
  synchronization problem at all. That is a property of the database,
  not of this provider — the Hyperdrive component's question of what the
  existing database can already do. Prefer it when the corpus is small
  enough that the database's own index is adequate and the atomicity is
  worth more than the scale; prefer this index when the vectors outgrow
  what belongs in the transactional store, or when there is no such
  database in the design.

## The trade, stated plainly

**What it buys:** a purpose-built similarity index at the edge, reached
by binding, sized to twenty million vectors, with namespace and metadata
filtering and no infrastructure to run.

**What it costs:**

- **A second copy of the truth.** The vector is derived from a record
  that lives somewhere else, and nothing keeps the two in step
  automatically. Every write path to the source record is a write path
  to this index, and the one that gets forgotten is the deletion.
- **A creation-time decision that cannot be revised.** Dimensions and
  metric are fixed when the index is created
  ([index configuration](https://developers.cloudflare.com/vectorize/get-started/embeddings/)).
- **Asynchronous writes.** A mutation id comes back, not a completed
  write; the vectors answer queries a few seconds later
  ([client API](https://developers.cloudflare.com/vectorize/reference/client-api/)).
- **No local engine.** The dev loop runs against a live index — see
  [local dev](local-dev.md).

## The two choices made at creation, and what changing them costs

**Dimensions** and **metric** are both properties of the embedding model,
not preferences. The model emits vectors of one width, and it was
trained under one notion of distance; the index has to agree with both.
Dimensions run 1 to 1536 at 32-bit precision, and the metric is
`cosine`, `euclidean` or `dot-product`
([limits](https://developers.cloudflare.com/vectorize/platform/limits/)).

Neither can be changed on an existing index. Changing either — which in
practice means changing the embedding model — is **creating a second
index and re-embedding the whole corpus into it**, then cutting the read
path over. So the real question at pick time is not "which metric" but
**"how likely is the model to change, and what does a re-embed of this
corpus cost in time and in inference"**. A corpus of millions makes that
a project; a corpus of thousands makes it an afternoon. The migration
shape itself is [service doctrine](service-doctrine.md)'s.

## What choosing it does not decide

**Where the embeddings come from.** This component stores and searches
vectors; producing them is the product's inference provider's job, and
which Cloudflare AI services this stack offers at all is the
`cloudflare` skill's scope fence to answer — not this reference's.

**Whether the product needs a managed retrieval pipeline instead.**
Chunking documents, embedding them on a schedule and keeping the index
current is work this component does not do. If that pipeline is what the
product actually wants, the scope fence says whether this stack offers
one; building it by hand over this index is a legitimate answer, and
assuming it comes included is not.
