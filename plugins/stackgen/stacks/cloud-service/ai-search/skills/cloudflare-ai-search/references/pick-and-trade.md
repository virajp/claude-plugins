# AI Search — pick & trade

## What it is for

Retrieval over a body of documents the product owns but does not want to
process: a knowledge base, a manual, a policy corpus, a site's own
content, a customer's uploaded files. An instance ingests the corpus,
chunks it, embeds it, keeps a vector index over it and re-syncs it, and
answers a query with the matching chunks or with a generated answer
citing them
([what AI Search is](https://developers.cloudflare.com/ai-search/)).

The whole proposition is that **none of that pipeline is the product's
code**. Chunking, embedding, index maintenance, re-sync on change,
reranking and query rewriting are configuration on an instance rather
than jobs in a repo.

## When it is the answer

- **The corpus is documents, and retrieval is plumbing.** The product
  needs answers grounded in its own content, and how the chunking works
  is not something anyone will ever tune for advantage.
- **The corpus changes on its own schedule.** Files land in a bucket, a
  site gets edited, a user uploads a PDF. Sync jobs pick the change up
  without a pipeline to operate
  ([syncing](https://developers.cloudflare.com/ai-search/configuration/indexing/syncing/)).
- **Citations are part of the requirement.** The answer must say which
  document it came from, and the chunks arrive alongside the generated
  text rather than being reconstructed from it
  ([chunk citations](https://developers.cloudflare.com/ai-search/how-to/chunk-citations/)).
- **The query path is already a Worker.** A binding costs no credential
  on the request path and no round trip off the platform.

## When it is not the answer

- **Retrieval is the differentiator.** If ranking quality is what the
  product competes on, the parts that decide it — chunk boundaries, the
  embedding model, the scoring — are configuration here rather than code,
  and configuration cannot be experimented on the way code can.
- **The unit is not a document.** Rows, events, product records and
  anything whose natural retrieval is a filter or a join belong in the
  store they already live in. This service indexes files.
- **The product already produces embeddings.** If something upstream
  already embeds the content for another purpose, a second pipeline
  re-embedding the same corpus is a second bill and a second thing to
  keep current.
- **The corpus is a hundred documents that never change.** Below the
  size where a pipeline earns its keep, keeping the text where it is and
  passing it to the model is simpler and has nothing to sync.

## The trade against a hand-rolled pipeline

The alternative is explicit and this stack ships both halves of it: a
vector index the product writes into — `cloud-service/vectorize/` —
and an inference call the product makes to embed and to generate —
`cloud-service/workers-ai/`. Their doctrine is theirs; what follows
is only the choice between the two shapes.

**What the managed pipeline buys:** no ingestion job to write, operate or
back-fill; no index lifecycle to own; re-sync, reranking and query
rewriting as settings; citations for free; and a corpus that can be a
bucket or a crawl without any code in between.

**What it costs:**

- **Chunking is a setting, and changing it re-indexes everything.**
  Chunk size and overlap are applied at index time
  ([chunking](https://developers.cloudflare.com/ai-search/configuration/indexing/chunking/)),
  so a better chunking strategy discovered later is a full re-sync, not
  a deploy.
- **The embedding model is the instance's, not the product's.** It is
  chosen in the instance's configuration, and the product does not hold
  the vectors — so there is no second use for them, no clustering, no
  "more like this" over the same embeddings, and no path that reads the
  index other than this service's own query.
- **Ranking is tunable but not replaceable.** Thresholds, filters,
  boosts, fusion method, reranker and query rewriting are all knobs
  ([retrieval configuration](https://developers.cloudflare.com/ai-search/configuration/)) —
  and the space between "tune the knobs" and "write a different ranker"
  has no middle here.
- **Two moving parts under one name.** The pipeline and the generation
  step are both the service's, so a change to the answer's quality has
  more places to come from than a product that owns each half
  separately.

**The way to decide is to ask what happens when retrieval is wrong.** If
the answer is "adjust the settings and re-sync", this service is right.
If it is "change how we chunk and re-rank", the product wants to own the
pipeline, and the trade is worth taking before the corpus is large.

## And against an external RAG service

A hosted RAG product off the platform buys the same escape from pipeline
code, and adds portability — the corpus is not tied to this provider.
What it costs is a credential on the request path, a network hop off the
edge, and a second vendor in the answer path. Where the compute is
already Workers, the binding removes all three; where the compute is
somewhere else entirely, that advantage disappears and the comparison is
an ordinary vendor one, decided outside this stack.

## The source decision, taken at pick time

Three source kinds, and they are not variants of one thing
([data source](https://developers.cloudflare.com/ai-search/configuration/data-source/)):

- **Built-in storage** — the product uploads items itself, through the
  Items API, and gets an immediate handle on when each becomes
  searchable. Pick it when the corpus arrives through the product: user
  uploads, generated documents, content the product already holds.
- **An R2 bucket** — the instance syncs a bucket the product owns. Pick
  it when something already writes the corpus to object storage, and
  accept the service API token that lets the service read it
  ([service API token](https://developers.cloudflare.com/ai-search/configuration/indexing/service-api-token)).
- **A website crawl** — the instance crawls a domain the product
  controls. Pick it when the corpus *is* the published site and keeping
  a second copy of it would be the harder problem; its ceiling is the
  instance's object limit
  ([website source](https://developers.cloudflare.com/ai-search/configuration/data-source/website/)).

The one to think about is the crawl: it makes the published site the
source of truth for retrieval, which is convenient until a page is
unpublished and the index still answers from it. Where that matters,
upload deliberately instead of crawling.
