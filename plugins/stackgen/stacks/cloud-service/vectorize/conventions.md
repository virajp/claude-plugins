# Cloudflare Vectorize — conventions

A **vector index bound to a Worker**. The product turns its own content
into embeddings, stores them here with an id and some metadata, and asks
at query time for the nearest ones to a query embedding. That is the
whole surface: similarity search over vectors the product owns, used for
retrieval, recommendation, deduplication or classification.

**It stores vectors, not documents.** The text, the image or the row the
embedding came from lives wherever the product already keeps it — the
relational store, an object bucket — and the vector's metadata carries
the identifier that gets back to it. An index whose metadata tries to be
the record is an index that will be rebuilt from scratch the first time
the record's shape changes, because a vector cannot be partially updated.

**Dimensions and the distance metric are fixed at index creation and
cannot be changed afterwards.** The index is optimized for one vector
configuration. Dimensions run from 1 to 1536 at 32-bit precision, and the
metric is `cosine`, `euclidean` or `dot-product` — both are decided by
the embedding model the product picked, not preferred independently of
it. Changing either means a new index, which is why "which model" is the
first question and not a detail
([index configuration](https://developers.cloudflare.com/vectorize/get-started/embeddings/),
[limits](https://developers.cloudflare.com/vectorize/platform/limits/)).

**Two ways to narrow a query, and they are not the same mechanism.** A
**namespace** is a string on the vector itself, segmenting an index into
partitions a query names — filtering on it is supported by default. A
**metadata index** is declared per property before the vectors are
written, up to ten per index, over `string`, `number` or `boolean`;
without one, a metadata property is stored but not filterable. **Vectors
written before a metadata index exists are not in it and must be written
again** — that ordering is the trap
([metadata filtering](https://developers.cloudflare.com/vectorize/reference/metadata-filtering/)).

**The binding is the project's to add, and this component ships no config
file.** The shape belongs in the repo's own `wrangler.jsonc`, beside
whatever the hosting pin already put there:

```jsonc
{
  "vectorize": [
    { "binding": "VECTORIZE", "index_name": "<index-name>" }
  ]
}
```

The Worker then reaches the index as `env.VECTORIZE`. One binding name
across environments, one index per environment behind it, so nothing in
the code reads which environment it is in
([Wrangler configuration](https://developers.cloudflare.com/workers/wrangler/configuration/)).

**Writes are asynchronous and identity is the vector id.** `insert`
**skips** an id that already exists; `upsert` replaces it. Both return a
mutation id rather than a completed write, and it takes a few seconds
before the vectors answer a query, so a test that writes and immediately
queries is a test that flakes. Deletes are by id. Because writing the
same id twice is defined, a re-run of an embedding job is idempotent by
construction — provided the id is derived from the source record rather
than generated
([client API](https://developers.cloudflare.com/vectorize/reference/client-api/)).

**The limits shape the design more than the price does.** An index holds
up to 20 million vectors, a vector id is at most 64 bytes, metadata at
most 10KiB per vector, and a query returns at most 50 results when it
asks for values or metadata and 100 when it asks for neither. Batch
upserts cap at 1,000 vectors from a Worker and 5,000 over the HTTP API.
**Two more limits are per plan and not per index** — indexes per account
(50,000 on Workers Paid, 100 on Free) and namespaces per index (50,000
on Workers Paid, 1,000 on Free) — so a design that partitions across
indexes or namespaces reads the plan column and not just the number,
and the Free ceilings are the ones a prototype meets first. A design
that needs more than one index's worth of vectors needs a partitioning
decision made deliberately, not discovered
([limits](https://developers.cloudflare.com/vectorize/platform/limits/)).

**Where the embeddings come from is a separate pick.** This component
stores and searches vectors; it does not produce them. Which inference
provider the product uses — Cloudflare's own or another — is that
component's question, and which Cloudflare AI services this stack offers
at all is the `cloudflare` skill's scope fence to answer.

**What this component is not.** It is not a managed retrieval pipeline
over documents — nothing here chunks, embeds, crawls or re-indexes on a
schedule. A product that wants that wants a different service, and the
provider's scope fence says whether this stack offers one yet. Building
it by hand on top of this index is a legitimate answer; assuming it is
included is not.

Full judgment: the `cloudflare-vectorize` skill and its references. The
provider-wide doctrine it cites is the `cloudflare` skill's.
