# AI Search — local dev

**There is no local AI Search, and the substitution is a deployed
instance rather than a simulation.** The provider's local development map
owns the general shape — which bindings simulate locally, which connect
remotely, and which do only one of the two — and its row for this service
says remote only. This is what that means for the dev loop.

## What runs locally, and what does not

`wrangler dev` runs the Worker on the laptop, and by default its bindings
resolve to locally simulated resources. AI Search has no local form at
all: Cloudflare's own wording is that local development is supported **by
proxying requests to a deployed instance**, and the way to opt in is
`remote` on the binding
([search binding](https://developers.cloudflare.com/ai-search/api/search/workers-binding/)).

Both binding forms take it. The instance binding:

```jsonc
{
  "ai_search": [
    { "binding": "AI_SEARCH", "instance_name": "<dev-instance>", "remote": true }
  ]
}
```

([instance binding](https://developers.cloudflare.com/ai-search/api/instances/workers-binding/)).

And the namespace binding:

```jsonc
{
  "ai_search_namespaces": [
    { "binding": "AI_SEARCH", "namespace": "default", "remote": true }
  ]
}
```

([AI Search as an agent tool](https://developers.cloudflare.com/agents/tools/ai-search/)).

The Worker is local; the index, the embedding and the generation are not.
`wrangler dev --remote` pushes the whole Worker to the network instead,
which is a different trade and not needed just to reach an instance.

## The dev instance is a real instance, and that is the whole trap

Three things follow from the substitution being live rather than
simulated:

- **It is never production's.** A binding pointed at the production
  instance is a laptop with a write path into the product's corpus —
  and with a namespace binding, into its lifecycle. A dev instance is
  created once, named for what it is, and bound only in development.
- **It is shared state.** Two people running the dev loop upload into
  the same corpus. An item key derived from the source document makes
  concurrent uploads converge instead of accumulate, which is the same
  rule the service doctrine gives for correctness — here it is what
  makes a shared dev instance survivable at all.
- **It bills the pieces underneath.** The service's own line is free
  within the beta's limits, but every sync embeds and every generated
  answer is a model call, from a laptop exactly as from the edge — see
  [cost shape](cost-shape.md). A dev instance holding a handful of
  documents costs nothing worth noticing; one seeded with a copy of the
  whole corpus is a production-sized inference bill for a development
  convenience.

## Seeding it, and driving it from the command line

The loop is CLI-shaped as much as code-shaped. The commands it actually
uses:

```sh
wrangler ai-search create <dev-instance>
wrangler ai-search jobs create <dev-instance>
wrangler ai-search jobs list <dev-instance>
wrangler ai-search search <dev-instance> --query "<question>"
wrangler ai-search stats <dev-instance>
```

Each takes `--namespace`, defaulting to `default`, and `--json` for
machine-readable output; `search` also takes the per-request retrieval
overrides — result count, score threshold, reranking and repeatable
`--filter key=value` pairs — which makes it the fastest way to answer
"is the corpus wrong or is the query wrong" without touching the Worker
([Wrangler commands](https://developers.cloudflare.com/ai-search/wrangler-commands/)).

Keep the seed corpus in the repo and the seeding a repeatable command.
Hand-uploaded documents nobody can reproduce make a dev instance a thing
to be nursed rather than recreated, and recreating it is the cheap answer
to almost every problem with it.

**Do not query immediately after uploading.** Indexing is asynchronous;
`uploadAndPoll` is what waits for an item to become searchable, and a
seeding script that uploads and asserts in the same breath is a script
that passes on a fast day
([built-in storage](https://developers.cloudflare.com/changelog/product/ai-search)).

## The `local_stack` answer is `n/a`, honestly

There is no engine to compose behind a readiness gate, because there is
nothing to run locally. Nothing about the local task changes because this
component is pinned — the task starts whatever the rest of the stack
needs, and this instance is simply reachable over the network.

## What local therefore cannot tell you

- **Whether retrieval finds the right passages.** A dev instance holding
  five documents exercises the plumbing, not the ranking. Whether the
  chunking, the thresholds and the reranker actually surface the right
  chunk is a question about the corpus, answered against a real one in a
  deployed environment.
- **Whether the answer is grounded.** With a tiny corpus, everything is
  near everything; the generated answer looks confident and says little
  about how it will behave when the corpus is large and contains
  near-duplicates.
- **Whether the sync keeps up.** Sync intervals, crawl limits and
  re-index duration are all properties of a real corpus changing at a
  real rate, and none of them appears in a dev loop.

**So retrieval quality is verified against a real corpus or not at all.**
That is not a gap to close with more local machinery; it is what local
can mean for a managed pipeline, and it is why the pre-production
instance in the harness block is seeded deliberately and its sync job's
state is read rather than assumed.
