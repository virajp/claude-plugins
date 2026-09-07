# Workers AI — service doctrine

The service's own usage rules: how the binding is added, what a call
looks like, how a model is chosen and pinned, and what the product has to
build around a result that is plausible rather than correct.

**This component realizes no vwf capability token, and that is recorded
rather than worked around.** `inference` is one of the categories
`assets/taxonomy.md` lists as having no token today, so `pack.yaml`
leaves `capability` unset and there is no category contract in
`assets/contracts/` to satisfy clause by clause. What this component
asserts, it asserts below. Nothing here mints a token or writes a
contract to fill the hole — both are reviewed decisions taken elsewhere,
and a service component that mints one for itself has invented a
standard rather than met one.

## The binding, which the project adds

This component ships no config file. The block goes in the repo's own
`wrangler.jsonc`, beside whatever the hosting pin already put there:

```jsonc
{
  "ai": {
    "binding": "AI"
  }
}
```

The Worker reaches it as `env.AI`
([bindings](https://developers.cloudflare.com/workers-ai/configuration/bindings/)).

**The binding carries no id, and that fact shapes more than it looks
like.** There is no index name, no instance, no region and no capacity —
so there is nothing to vary per environment, nothing to provision ahead
of a deploy, and no way to point staging at a smaller or cheaper copy.
Every environment, including a laptop, calls the same models on the same
meter. Wherever a design assumed a non-production tier, that assumption
has to move into the product: a flag, a stub, or a deliberately small set
of cases that are allowed to call for real.

## The call

```ts
const result = await env.AI.run("<model-id>", { messages });
```

Input shape is the **model's**, not the service's: chat-shaped models take
`messages`, older completion-shaped ones take `prompt`, embedding models
take `text` (a string or an array of them), and image, speech and
reranking models each take their own. There is no common envelope to
learn, which means the model catalog page for the specific model is the
schema — Context7 at use time, not this reference
([model catalog](https://developers.cloudflare.com/workers-ai/models/)).

**Stream anything a human waits for.** `stream: true` returns a stream the
Worker hands straight back as `text/event-stream`, and Cloudflare
recommends it for larger and reasoning models specifically to avoid
buffering a whole response before anything is shown
([using AI models](https://developers.cloudflare.com/agents/runtime/operations/using-ai-models/)).
The trade is that a streamed response cannot be validated before the first
token reaches the user, which is the argument for *not* streaming a
structured output.

**Structured output is a schema, not a prompt instruction.** Models that
support it take a `response_format` of type `json_schema` with the schema
inline and `strict: true`, and the API is compatible with the OpenAI
SDK's structured-outputs shape
([JSON mode](https://developers.cloudflare.com/workers-ai/features/json-mode/)).
Use it wherever the result feeds code. Asking for JSON in a prompt and
parsing what comes back is the same design with the guarantee removed —
and the failure mode is a parse error in production on the one input
nobody tried.

**Tool calling exists and is the model asking, not the model doing.** A
call declares the tools available; the response may name one and its
arguments, and executing it — including deciding whether it *should* be
executed — is entirely the product's
([function calling](https://developers.cloudflare.com/workers-ai/features/function-calling/)).
Treat those arguments as untrusted input, because they are: they are a
model's rendering of a user's request.

**Batch is a queue, not a loop.** Models that support it take an array of
requests with `queueRequest: true`, return a `request_id` immediately,
and are polled with that id until the status stops reading `queued` or
`running`
([batch API](https://developers.cloudflare.com/workers-ai/features/batch-api/workers-binding/)).
That is the right shape for embedding a corpus or classifying a backlog,
and the wrong one for anything a request is waiting on. It also keeps a
bulk job off the same rate limits a serial loop would spend.

**The gateway is an option on the same call, not a different API.**
`env.AI.run` takes a third argument carrying a `gateway` object, and with
it the call is routed through a gateway that can cache it, log it and
fall back
([worker binding methods](https://developers.cloudflare.com/ai-gateway/usage/worker-binding-methods/)).
Whether the product wants one, and how it is configured, is that
component's doctrine and not this one's — what matters here is that
adopting it later is one argument at one call site, provided the call
sites are behind a seam.

## The seam, which is the one piece of design this component asks for

**Do not call `env.AI.run` from the code that has the feature in it.** Put
one module between them — a function per task the product actually does
(`embed`, `classify`, `summarize`), each of which knows its model id, its
input shape and what a valid result looks like.

Four things become one edit instead of many:

- **A model deprecation.** The catalog moves and Cloudflare publishes
  sunset dates ahead of them
  ([changelog](https://developers.cloudflare.com/workers-ai/changelog/)).
  With the id in one place, the migration is changing a constant and
  re-running the evaluation; with it inline at twenty call sites, it is
  a search-and-replace nobody is sure finished.
- **Routing a call through a gateway**, which is the third argument
  above.
- **Moving one task to a different provider entirely.** The mixed design
  — an open model here for volume, something stronger elsewhere for the
  step that decides the product — is normal, and it is only cheap if the
  call sites never knew which one they were using.
- **Testing.** A suite that stubs this module runs for free and
  deterministically; a suite that stubs nothing calls real inference on
  every run, bills for it, and still cannot assert an exact output. See
  [local dev](local-dev.md).

**Version the id, do not just name it.** Whatever holds the constant
should make it obvious which model version the product's outputs were
last evaluated against, because a silent swap changes the product's
behaviour without changing its code.

## Rate limits are per task type, and they count development

Limits are applied per task type with some models carrying their own, and
beta models may sit lower while they are optimized. They apply to **all**
inference, explicitly including runs made in local mode through Wrangler
([limits](https://developers.cloudflare.com/workers-ai/platform/limits/)).

Two consequences worth designing for rather than discovering:

- **A request path that calls inference inherits its failure mode.** A
  throttled call is a failed request unless the product decided
  otherwise — a retry with backoff, a queued job, a degraded answer, a
  cached previous result. Deciding which, per feature, is cheaper before
  the first throttle than during it.
- **A batch job and the request path share the account's limits.** A
  backfill running flat out is capable of throttling the product's live
  traffic. The batch API's queue is the mechanism that keeps the two
  apart.

## The result is plausible, and the product owns what follows

**Validate before you use.** A structured output with a strict schema is
validated by the service; anything else is validated by the product or
not at all. Free text that reaches a database, a shell, a URL or another
model is untrusted input, and the fact that it came from the product's
own inference call does not make it the product's own words.

**Prompts are user content, and logging them is a decision.** A prompt
carries whatever the user typed and whatever the product retrieved on
their behalf — which routinely means personal data. So: do not log
prompts or completions by default; where they must be logged for
evaluation or debugging, log them deliberately, with a retention answer
and a redaction pass, and record the decision in the product's own data
handling rather than in a logging config nobody reads. The provider's
identity doctrine governs the credential; what the prompt contains is the
product's to govern
([identity shape](identity-shape.md)).

**Decide what happens when the model is wrong**, because it will be. The
question is not accuracy in the abstract but blast radius: a wrong
embedding ranks something poorly, a wrong classification routes a ticket
badly, a wrong tool call does something. Those need different amounts of
guarding, and the design that treats them the same is over-engineered in
one place and under-engineered in another.

## What this component stays silent on

**Caching, retries across providers, per-consumer rate limiting and a
searchable log of every call.** All of that is the gateway's, a sibling
component with its own bundle.

**Chunking, crawling and keeping a document index current.** That is
managed retrieval, another sibling. Nothing here re-indexes on a
schedule.

**Where vectors live.** `cloud-service/vectorize/` stores and searches
them, and the embedding model chosen here fixes that index's dimension
count and metric at creation.
