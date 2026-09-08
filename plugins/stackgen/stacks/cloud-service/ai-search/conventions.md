# Cloudflare AI Search — conventions

A **managed retrieval pipeline**. The product points an instance at
content, and the service chunks it, embeds it, keeps a vector index over
it, re-syncs it on a schedule, and answers a query with the matching
chunks — or with a generated answer and the chunks it drew on. The
product writes no ingestion job, owns no index, and picks no chunking
code.

**It was called AutoRAG**, and much of what is written about it still is;
the product, the binding and the `wrangler ai-search` commands are the
current spelling of the same service
([Workers binding migration](https://developers.cloudflare.com/ai-search/api/migration/workers-binding/)).

## An instance is the unit, and it has three kinds of source

An **instance** is one corpus with one configuration. Its source is one
of three, and the choice is the first real decision:

- **Built-in storage** — the instance carries its own storage and vector
  index, and the product uploads items into it through the Items API.
  Nothing external is provisioned and no credential is registered
  ([built-in storage and namespace bindings](https://developers.cloudflare.com/changelog/product/ai-search)).
- **An R2 bucket** — the instance syncs from a bucket the product owns.
  The bucket itself is the `cloudflare-r2` component's, and its doctrine
  is `cloud-service/r2/`; what is this component's is that AI Search
  needs a **registered service API token** to read it, which is the
  identity-shape reference's
  ([service API token](https://developers.cloudflare.com/ai-search/configuration/indexing/service-api-token)).
- **A website crawl** — the instance crawls a domain the product
  controls, up to the instance's object limit
  ([website source](https://developers.cloudflare.com/ai-search/configuration/data-source/website/)).
  The crawl is the service's own and its browser cost is included; a
  product that needs to render a page itself and index the result drives
  Browser Rendering directly and uploads the HTML —
  `cloud-service/browser-rendering/` is that component, and the pattern
  is the service doctrine's.

**A file's extension decides how it is read.** Rich formats — PDF, HTML,
XML, Office and Open Document files, CSV, images — go through Workers AI
Markdown conversion before they are chunked, so an item stored with an
`.html` key is indexed as prose rather than as markup
([rich format file types](https://developers.cloudflare.com/ai-search/configuration/indexing/)).

## Two binding shapes, and they are not interchangeable

The Worker reaches an instance through one of two bindings, and the
wrangler key differs with it:

```jsonc
{
  "ai_search": [
    { "binding": "AI_SEARCH", "instance_name": "<instance>" }
  ]
}
```

```jsonc
{
  "ai_search_namespaces": [
    { "binding": "AI_SEARCH", "namespace": "default" }
  ]
}
```

`ai_search` binds **one named instance**; `ai_search_namespaces` binds a
**namespace** — every instance in it — and is what unlocks the Items API,
creating and deleting instances at runtime, and searching across
instances
([Workers binding migration](https://developers.cloudflare.com/ai-search/api/migration/workers-binding/)).
The namespace form replaces the legacy `env.AI.autorag(...)` call that
hung off the Workers AI binding. Pick the narrower one — the instance
binding — where the Worker only queries a fixed corpus, and the namespace
one where it uploads items or manages instances. Which to choose, and
what each grants, is the service doctrine's.

**Either binding is a block the project adds to its own wrangler config**,
beside whatever its hosting pin already put there — this component ships
no config file and writes nothing into the repo.

## Indexing is configuration, not code

Chunking is two numbers: **chunk size** in tokens and **chunk overlap** as
a percentage between 0 and 30, both applied at index time
([chunking](https://developers.cloudflare.com/ai-search/configuration/indexing/chunking/)).
Beside them sit the embedding model, whether the index is keyword, vector
or hybrid, and the sync interval that decides how stale the corpus is
allowed to get
([instance configuration](https://developers.cloudflare.com/api/terraform/resources/ai_search)).
**Re-chunking means re-indexing the corpus**, so these are decided before
the first sync rather than tuned against a live index.

## Two query shapes, and citations come from the same place

`search` returns the matching chunks with their scores and their source
item keys. The chat shape returns a generated answer, streaming the
chunks it retrieved as a distinct event before the answer tokens — which
is what makes a citation exact rather than reconstructed from the prose
([chunk citations](https://developers.cloudflare.com/ai-search/how-to/chunk-citations/)).
Retrieval is tunable per request: match thresholds, metadata filters,
result count, reranking and query rewriting all sit in the request's
options, so a query can be narrowed without reconfiguring the instance
([retrieval configuration](https://developers.cloudflare.com/ai-search/configuration/)).

## What this component does not cover

**A retrieval pipeline the product controls end to end.** Where chunking,
ranking and the embedding lifecycle are the product's differentiator, the
answer is a vector index the product writes into and an inference call it
makes itself — `cloud-service/vectorize/` and
`cloud-service/workers-ai/` are those components, and the trade between
them and this one is the pick-and-trade reference's.

**Which Cloudflare services this stack offers at all** is the `cloudflare`
skill's scope fence — see the `cloud-provider/cloudflare` component's
conventions, in this composition's template — not something to infer from
what this service can be pointed at.

Cost and identity are **cited, never restated**: the account-wide billing
principle and the credential rule are the `cloudflare` skill's cost
doctrine and identity-and-iam references, and what is this service's own —
what the beta includes, what is billed beside it, the token permission and
the service token — is the `cloudflare-ai-search` skill's cost-shape and
identity-shape.

Full judgment: the `cloudflare-ai-search` skill's five references.
