# Cloudflare Workers AI — conventions

**Serverless inference reached from a Worker through a binding.** The
product names a model from a catalog Cloudflare hosts, passes an input,
and gets a result back on the request path — text generation, embeddings,
image generation, transcription, speech, reranking, classification. There
are no instances to size, no GPUs to reserve and no key on the request
path: the binding is the whole access story
([Workers AI](https://developers.cloudflare.com/workers-ai/)).

**It is a provider of inference, not a place to put your own model.** The
catalog is Cloudflare's and it moves — models arrive, models are deprecated
on published dates, and the product's job is to keep the id it depends on
in one place and to watch that list. A product whose model is not in the
catalog is not served by this component, and saying so is cheaper than
approximating.

**The binding is the project's to add, and this component ships no config
file.** The block goes in the repo's own `wrangler.jsonc`, beside whatever
the hosting pin already put there:

```jsonc
{
  "ai": {
    "binding": "AI"
  }
}
```

The Worker then reaches it as `env.AI`, and calls it as
`env.AI.run(model, input)`. There is nothing else to configure — no id, no
region, no capacity — which is also why there is nothing to vary per
environment
([bindings](https://developers.cloudflare.com/workers-ai/configuration/bindings/),
[Wrangler configuration](https://developers.cloudflare.com/workers/wrangler/configuration/)).

**There is a REST path too, and it is for callers that are not Workers.**
`POST /accounts/{account_id}/ai/run/{model}` with a bearer token runs the
same catalog from anywhere — a build step, a batch job, a service on
another cloud
([REST API](https://developers.cloudflare.com/workers-ai/get-started/rest-api/)).
It is the same inference at the cost of a credential in a request path
that had none. Prefer the binding wherever the caller is already a Worker,
and treat the REST path as what it is: the answer for a caller that is
not.

**Picking a model is four questions, and none of them is "which is
best".** What task is it — the catalog is organized by task, and a
reranker, an embedding model and a generation model are not
interchangeable. What context length does the input actually need. What
does it cost per call at the volume the product expects. And what licence
does the model carry, since the catalog is largely open models with their
own terms attached
([model catalog](https://developers.cloudflare.com/workers-ai/models/)).
Answer those and the shortlist is usually one or two entries long.

**Model ids are the perishable part, so pin the id in one place.**
Cloudflare publishes planned deprecations with sunset dates and expects
references to be removed before them
([changelog](https://developers.cloudflare.com/workers-ai/changelog/)).
A codebase with the id inline at every call site has as many edits to
make as it has call sites; one with a single constant, or one accessor
per task, has one. As an illustration of the shape an id takes, the
catalog lists the example embedding model `@cf/baai/bge-small-en-v1.5`
([model catalog](https://developers.cloudflare.com/workers-ai/models/))
— quoted to show the form, not recommended, because the entry that is
current today is not the doctrine and the deprecation list is.

**Where the embeddings go is a separate pin.** This component produces
vectors; storing and searching them is `cloud-service/vectorize/`, and
the two are commonly pinned together — the embedding model decides the
index's dimension count and its distance metric, both of which are fixed
when the index is created. That makes "which model" a decision taken once
and across two components rather than inside this one.

**What this component does not cover.** It does not cache, retry, rate
limit or fall back — the gateway in front of it does that, and it is a
sibling component with its own doctrine. It does not chunk documents,
crawl a site or keep an index current — that is managed retrieval, also a
sibling component. And it does not decide anything account-wide: the
meter, the token model and what exists on a laptop are the `cloudflare`
component's, cited here and never restated. Which Cloudflare services this
stack offers at all is that component's scope fence to state — see the
`cloud-provider/cloudflare` component's conventions, in this
composition's template.

Full judgment: the `cloudflare-workers-ai` skill and its references. The
provider-wide doctrine it cites is the `cloudflare` skill's.
