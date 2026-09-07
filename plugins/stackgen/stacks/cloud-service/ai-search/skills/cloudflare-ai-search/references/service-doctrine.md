# AI Search — service doctrine

The service's own usage rules: how an instance is created and bound, what
goes into it and under what key, how it is queried, how it stays fresh,
and what to keep replaceable so retrieval can move later.

**This component realizes no vwf capability token, so there is no
clause-by-clause contract to satisfy.** `retrieval` is one of the
categories `assets/taxonomy.md` records as a known vwf-side gap, and
`assets/contracts/` carries no retrieval doctrine. What this component
satisfies is stated directly below, and nothing here writes a contract to
fill the hole — a contract is a reviewed asset, not something a service
component mints for itself.

## An instance per environment, named for the environment

An instance is one corpus under one configuration. Create it
deliberately:

```sh
wrangler ai-search create <instance-name>
```

([Wrangler commands](https://developers.cloudflare.com/ai-search/wrangler-commands/)).

**The binding name stays the same in every environment; the instance
behind it differs.** Nothing in the code reads which environment it is
in. Staging's instance points at staging's source — a staging bucket, or
a staging upload path — because an instance that reads production's
corpus is a staging suite reading production data with a green tick on
it.

Instances live inside a **namespace**, and `default` is the one every
command falls back to when `--namespace` is not given
([Wrangler commands](https://developers.cloudflare.com/ai-search/wrangler-commands/)).
Where the namespace becomes load-bearing is the binding, below.

## The binding, which the project adds — and there are two of them

This component ships no config file. The block goes in the repo's own
`wrangler.jsonc`, beside whatever the hosting pin already put there. Two
keys exist and they bind different things.

**`ai_search` — one named instance:**

```jsonc
{
  "ai_search": [
    { "binding": "AI_SEARCH", "instance_name": "<instance-name>" }
  ]
}
```

**`ai_search_namespaces` — every instance in a namespace:**

```jsonc
{
  "ai_search_namespaces": [
    { "binding": "AI_SEARCH", "namespace": "default" }
  ]
}
```

Both are documented in the binding migration guide, which also states
what separates them: the instance binding connects to a single instance
and is the direct replacement for the legacy `env.AI.autorag(...)` call,
while the namespace binding reaches every instance in the namespace and
is what enables **the Items API, creating and deleting instances at
runtime, and searching across instances**
([Workers binding migration](https://developers.cloudflare.com/ai-search/api/migration/workers-binding/),
[instance binding](https://developers.cloudflare.com/ai-search/api/instances/workers-binding/)).

**Pick the narrower one by default.** A Worker that only answers queries
against a fixed corpus takes `ai_search`, and then the binding itself is
the boundary: that Worker cannot reach another instance, cannot upload,
and cannot delete. Reach for `ai_search_namespaces` when the Worker
genuinely uploads items, provisions instances, or searches more than one
— and when it does, note that the grant widened to the whole namespace,
which is the identity-shape reference's concern.

The call shape follows the binding. Through a namespace binding an
instance is fetched first and then used:

```ts
const instance = env.AI_SEARCH.get("<instance-name>");
const results = await instance.search({
  messages: [{ role: "user", content: query }],
});
```

([search binding](https://developers.cloudflare.com/ai-search/api/search/workers-binding/)).

## Item keys are the design decision, and the extension is part of them

For a built-in-storage instance the product chooses every key. Two rules
carry most of the weight:

- **Derive the key from the source, never generate it.** A key derived
  from the record — its identifier, or a stable slug of the URL it came
  from — makes a re-run of the ingestion idempotent: the same document
  uploads to the same key and replaces itself. A generated key makes the
  second run a duplicate the index will happily return twice.
- **End the key with the extension the content actually is.** Rich
  formats are converted to Markdown before chunking, and the extension
  is what selects that path — an HTML document stored under an `.html`
  key is indexed as prose, and the same bytes under an extensionless key
  are not
  ([indexing](https://developers.cloudflare.com/ai-search/configuration/indexing/)).

Where the source is an R2 bucket, the same reasoning applies to the
object keys already in it, and the bucket's own layout doctrine is
`cloud-service/r2/`'s, not this component's.

**Uploading is asynchronous, and the API gives you a way to wait:**

```ts
const item = await env.AI_SEARCH.get("<instance-name>")
  .items.uploadAndPoll("<key>.html", content, { timeoutMs: 60_000 });
```

([built-in storage](https://developers.cloudflare.com/changelog/product/ai-search)).
`uploadAndPoll` returns once the item is searchable. Use it wherever the
next step depends on the document being findable — a test, or a request
that indexes and then answers. Where nothing waits on it, upload and move
on rather than blocking a request on indexing latency.

**Where the corpus is a page that needs rendering first**, the product
fetches the rendered HTML itself and uploads it under an `.html` key.
The renderer is a separate component — `cloud-service/browser-rendering/`
— and how it is driven is its doctrine, not this one's
([fetch and index web pages](https://developers.cloudflare.com/ai-search/how-to/fetch-and-index-web-pages/)).

## The indexing settings are taken before the first sync

An instance carries its chunking, its embedding model, its index method
and its sync interval
([instance configuration](https://developers.cloudflare.com/api/terraform/resources/ai_search)).
Chunking is two numbers — **chunk size** in tokens and **chunk overlap**
as a percentage from 0 to 30, both applied while indexing
([chunking](https://developers.cloudflare.com/ai-search/configuration/indexing/chunking/)).

**All of these are re-index decisions, not runtime ones.** Changing chunk
size, overlap or the embedding model means every existing chunk is wrong,
and the corpus has to be processed again. Two consequences worth taking
up front:

- **Record the settings beside the instance name**, in the project's own
  environment documentation, so the answer to "why does staging rank
  differently" is readable rather than a dashboard comparison.
- **The corpus must be re-ingestible.** A built-in-storage instance
  whose documents exist nowhere else is an instance whose settings can
  never change. Keep the source of truth outside the index — a bucket,
  a repository, a database — and treat the instance as derived.

Retrieval settings are the opposite and can be changed per request:
match thresholds, metadata filters, boosts, result count, fusion method,
reranking and query rewriting all sit in the request's options
([retrieval configuration](https://developers.cloudflare.com/ai-search/configuration/)).
Tune there first; re-index only when tuning cannot reach it.

## Querying, and where a citation comes from

`search` returns chunks with a score and the item key each came from —
which is the citation, already exact. The chat shape returns a generated
answer, and streams the retrieved chunks as their own event **before**
the answer tokens, so a UI can render sources without parsing them out of
the prose
([chunk citations](https://developers.cloudflare.com/ai-search/how-to/chunk-citations/)).

Two rules follow:

- **Cite from the chunk event, never from the answer text.** A model
  asked to name its sources will name plausible ones; the event is the
  retrieval's own record of what it actually read.
- **The item key is an identifier, not a URL.** Resolving it to
  something a user may see — a link, a title, a permission check — is
  the product's job, and it is where the product's own authorization
  gets a say in what the answer may reveal.

## Freshness, and how to know the index is current

Sync jobs run on the instance's interval and can be triggered by hand:

```sh
wrangler ai-search jobs create <instance-name>
wrangler ai-search jobs list <instance-name>
```

([syncing](https://developers.cloudflare.com/ai-search/configuration/indexing/syncing/),
[Wrangler commands](https://developers.cloudflare.com/ai-search/wrangler-commands/)).

**A stale index is the failure mode that does not announce itself.** The
queries still answer, confidently, from content that has changed or been
withdrawn. So freshness is checked rather than assumed: the job's
terminal state says the pipeline ran, and a query whose expected top
source is known says the index answers — the harness block asks for both
together, and neither alone is a health check.

**Deletion is the path that gets forgotten**, exactly as it is for a
vector index. A document removed at the source has to be removed from the
instance, or retrieval keeps grounding answers in a document nobody can
open. For a synced source the job handles removals; for built-in storage
the product's own delete path must reach the Items API too, and that is
the path a first implementation almost always omits.

## The seam to keep, so retrieval can move

Everything above is one vendor's pipeline, and the reason to keep a seam
is not vendor anxiety — it is that the trade in
[pick & trade](pick-and-trade.md) can be re-decided as the product
learns. Keep two things behind one interface:

- **A retrieve step** that takes a query and returns ranked passages
  with a source identifier and a score. Nothing above that layer should
  know about instances, namespaces or bindings.
- **An ingest step** that takes a document and a derived key. Nothing
  above it should know whether the corpus is uploaded, synced or
  crawled.

With those two in place, moving to a hand-rolled pipeline on
`cloud-service/vectorize/` and `cloud-service/workers-ai/` is replacing
an implementation. Without them it is a rewrite of every call site, and
the decision quietly becomes permanent.
