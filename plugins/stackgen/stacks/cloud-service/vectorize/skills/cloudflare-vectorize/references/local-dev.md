# Vectorize — local dev

**There is no local Vectorize, and the substitution is a live index
rather than a simulation.** The provider's local development map owns the
general shape — which bindings simulate locally, which connect remotely,
and which do only one of the two — and its row for this service says
remote only. This is what that means for the dev loop.

## What runs locally, and what does not

`wrangler dev` runs the Worker on the laptop, and by default its
bindings resolve to locally simulated resources. Vectorize is not among
the bindings with a local simulation, so its binding is **opted into the
live index** instead — per binding, in the configuration file:

```jsonc
{
  "vectorize": [
    { "binding": "VECTORIZE", "index_name": "<dev-index>", "remote": true }
  ]
}
```

The Worker is local; the index is not
([local development](https://developers.cloudflare.com/workers/local-development/),
[bindings per environment](https://developers.cloudflare.com/workers/local-development/bindings-per-env/)).
`wrangler dev --remote` pushes the whole Worker to the network instead,
which is a different trade and not needed just to reach an index.

## The dev index is a real index, and that is the whole trap

Three things follow from the substitution being live rather than
simulated:

- **It is shared state.** Two people running the dev loop write to the
  same vectors. An id derived from a source record makes concurrent
  writes converge instead of collide, which is the same rule the service
  doctrine gives for correctness — here it is what makes a shared dev
  index survivable at all.
- **It is never production's.** Pointing a laptop at the production
  index is a write path from a developer's machine into the product's
  search results. A dev index is created once, named for what it is, and
  bound only in development.
- **It costs.** A live index bills for the vectors in it and for what
  each query searches, from a laptop exactly as from the edge — see
  [cost shape](cost-shape.md). A dev index seeded with a hundred vectors
  costs nothing worth noticing; one seeded with a copy of the whole
  corpus is a production-sized bill for a development convenience.

## Seeding it

The loop is CLI-shaped, not code-shaped. The commands it actually uses:

```sh
wrangler vectorize create <dev-index> --dimensions=<n> --metric=cosine
wrangler vectorize create-metadata-index <dev-index> \
  --property-name=<property> --type=string
wrangler vectorize insert <dev-index> --file=<vectors.ndjson>
wrangler vectorize query <dev-index> --vector-id=<id> --top-k=5
wrangler vectorize list
wrangler vectorize info <dev-index>
wrangler vectorize delete <dev-index>
```

`insert` takes newline-delimited JSON, one vector object per line
([Wrangler commands](https://developers.cloudflare.com/vectorize/reference/wrangler-commands/),
[insert vectors](https://developers.cloudflare.com/vectorize/best-practices/insert-vectors/)).
Two ordering rules apply here as much as in production: **declare every
metadata index before the first insert**, because vectors written
earlier are not in it, and **do not query immediately after writing**,
because the write is asynchronous and takes a few seconds to become
visible
([metadata filtering](https://developers.cloudflare.com/vectorize/reference/metadata-filtering/),
[client API](https://developers.cloudflare.com/vectorize/reference/client-api/)).
The second one is what makes a freshly seeded index look broken for the
first few seconds.

Keep the seed file in the repo and the seeding a repeatable command.
Hand-inserted vectors nobody can reproduce make a dev index a thing to
be nursed rather than recreated, and recreating it is the cheap answer to
almost every problem with it.

## The `local_stack` answer is `n/a`, honestly

There is no engine to compose behind a readiness gate, because there is
nothing to run locally. Nothing about the local task changes because
this component is pinned — the task starts whatever the rest of the
stack needs and this index is simply reachable over the network.

## What local therefore cannot tell you

- **Whether the vectors are the right ones.** A dev index seeded with a
  handful of hand-made vectors exercises the plumbing, not the
  retrieval. Whether the embeddings actually rank the right things first
  is a question about the model and the corpus, answered against real
  data in a deployed environment.
- **Whether the index scales the way the design assumes.** Recall,
  latency and the cost of a query all move with the number of stored
  vectors, and a hundred-vector dev index shows none of that.
- **Whether a missing metadata index would have mattered.** The failure
  is a filter that quietly returns nothing, and against a small seeded
  set "nothing" and "nothing matched" look identical.

**So the retrieval quality is verified against a real corpus or not at
all.** That is not a gap to close with more local machinery; it is what
local can mean for a similarity index, and it is why the pre-production
index in the harness block is seeded deliberately rather than left to
whatever the last run put in it.
