# AI Search — cost shape

The provider's cost doctrine is the `cloudflare` skill's, and it says
what the account-wide shape is and what it deliberately does not cover —
including that every service besides the proxy bills by consumption
rather than by seat. This is what consumption means for this one service,
and the answer today has an unusual shape.

## The service is free in the open beta; the pieces under it are not

Cloudflare states it plainly: **during the open beta AI Search is
provided free of charge within its usage limits, and Workers AI and AI
Gateway are billed separately**, with at least 30 days of notice before
any billing change
([limits and pricing](https://developers.cloudflare.com/ai-search/platform/limits-pricing/)).
Read that page before sizing anything; never copy a rate or a limit into
a document, because both change and a stale figure reads as authoritative
in a way a stale principle does not.

**Storage, vector indexing and crawling are included in the service.**
That is a change from how the product used to bill: since it moved to
managed infrastructure those three are part of AI Search rather than
line items, and the R2 buckets older instances were given for internal
storage are no longer used and can be deleted
([historical billing](https://developers.cloudflare.com/ai-search/platform/limits-pricing/)).
A cost estimate that adds an internal bucket and a Vectorize index to
this service is estimating the previous product.

## So the bill is the inference, and the corpus you own

Three lines, and only one of them belongs to this component:

- **Workers AI**, for embedding at index time and for generation at query
  time. Every sync embeds what changed, and every generated answer is a
  model call. This is the term that moves with usage, and its shape is
  `cloud-service/workers-ai/`'s cost-shape reference, not this one's.
- **AI Gateway**, where the instance is pointed at one — its own billing,
  and `cloud-service/ai-gateway/`'s to explain.
- **Your source bucket**, where the source is R2. That bucket is the
  product's, it exists whether or not this service reads it, and its
  operation classes and storage tiers are `cloud-service/r2/`'s
  cost-shape reference's. A crawl or built-in storage adds no such line
  at all.

## What that shape means for the design

**Re-indexing is the expensive operation, not querying.** A full re-sync
embeds the whole corpus again. So the settings that force one — chunk
size, overlap, the embedding model — carry a cost as well as a quality
argument, and the habit of tuning them against a live instance is the
one to avoid. Tune the retrieval options first: thresholds, filters,
result count and reranking are per-request and change no vector
([retrieval configuration](https://developers.cloudflare.com/ai-search/configuration/)).

**The generation half is optional and is usually the larger term.**
`search` returns chunks and calls no text-generation model; the chat
shape does. Where the product only needs passages — to render, to feed
into its own prompt, to filter — asking for an answer it discards is
paying for tokens nobody reads.

**The similarity cache is a cost lever, not just a latency one.**
Caching is instance configuration with its own threshold, and a corpus
answering a narrow set of repeated questions gets a materially different
bill with it on
([configuration](https://developers.cloudflare.com/ai-search/configuration/)).
The threshold is the trade: looser matching serves more from cache and
occasionally answers a slightly different question than the one asked.

## The trap

**Beta-free is a date, not a property.** The most expensive version of
this decision is a product that sized its retrieval on a free service and
finds out what it costs after the corpus is large and the design has
hardened around a managed pipeline. Two cheap hedges, both taken at
design time rather than later: keep the corpus re-ingestible from a
source of truth outside the index, and keep the retrieve/ingest seam the
[service doctrine](service-doctrine.md) describes. Neither costs anything
today, and together they are what turns a pricing change into a
comparison rather than a rewrite.

The second half of the trap is the crawl. A crawl indexes up to the
instance's object limit and its browser cost is included
([website source](https://developers.cloudflare.com/ai-search/configuration/data-source/website/)),
which makes it feel free to point at a large site — and the sync interval
means it re-runs on its own. The cost that follows is not the crawl but
the embedding of everything it found, on every sync where content moved.

## The sizing question

Not "how many queries" but **"how large is the corpus, how often does it
change, and does every query need a generated answer"**. Those three
numbers are the whole estimate, because the first two set the embedding
volume and the third sets the generation volume — and the service's own
line, today, is zero within its limits.
