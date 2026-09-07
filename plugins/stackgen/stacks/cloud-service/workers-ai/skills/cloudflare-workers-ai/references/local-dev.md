# Workers AI — local dev

**There is no local Workers AI, and the substitution is the live service
rather than a simulation.** The provider's local development map owns the
general shape — which bindings simulate locally, which connect remotely,
and which do only one of the two — and its row for this service says
remote only. This is what that means for the dev loop.

## What runs locally, and what does not

`wrangler dev` runs the Worker on the laptop, and by default its bindings
resolve to locally simulated resources. There is no local simulation of
inference, so this binding is **opted into the live service** instead —
per binding, in the configuration file:

```jsonc
{
  "ai": {
    "binding": "AI",
    "remote": true
  }
}
```

The Worker is local; the models are production's
([local development](https://developers.cloudflare.com/workers/local-development/),
[bindings per environment](https://developers.cloudflare.com/workers/local-development/bindings-per-env/)).
`wrangler dev --remote` pushes the whole Worker to the network instead,
which is a different trade and not needed just to reach the models.

## Every dev call is a production call

Cloudflare states it plainly: developing locally still reaches the account
to run the models, and standard usage charges apply
([Workers AI](https://developers.cloudflare.com/workers-ai/)). Three
things follow, and the first two surprise people:

- **It bills.** A dev loop that calls a large generation model on every
  save is a real line on the bill, from a laptop exactly as from the
  edge — see [cost shape](cost-shape.md). Nothing about the loop looks
  like production traffic, which is why it is the charge people fail to
  predict.
- **It counts against the rate limits**, which are applied per task type
  and explicitly include inference performed in local mode
  ([limits](https://developers.cloudflare.com/workers-ai/platform/limits/)).
  A developer iterating hard can throttle a limit the product's live
  traffic shares.
- **The results are the production models' results.** That is genuine
  fidelity for the inference itself: a prompt that behaves locally
  behaves the same deployed, because it ran on the same model.

Since the binding carries no id, there is nothing to point at a smaller or
cheaper copy for development. The only lever is what the code calls, which
is the lever the seam in [service doctrine](service-doctrine.md) gives.

## The test suite does not call the service, except deliberately

This is the practical consequence, and it is worth deciding once rather
than per test:

- **Unit and integration tests stub the seam.** The module that owns the
  model ids and the input shapes is the substitution point — stub it and
  the suite is free, fast and deterministic. A test that calls real
  inference is billed on every run and still cannot assert an exact
  output, because the output is not fixed.
- **A small, named set of tests calls for real.** Enough to prove the
  binding resolves, the input shape is right and the model still exists —
  which is exactly what a deprecation breaks and a stub never notices. Run
  them deliberately rather than on every commit, and treat a failure as a
  catalog change rather than a flake.
- **What a stub cannot tell you is whether the answers are good.**
  Quality is judged against real inputs with a real model, which is an
  evaluation and not a unit test. Keep the two apart; conflating them
  produces a suite that is both expensive and uninformative.

## The commands the loop actually uses

```sh
wrangler ai models
```

Lists the catalog available to the account, which is the cheapest way to
answer both "does this id still exist" and "does my token work"
([Wrangler commands](https://developers.cloudflare.com/workers/wrangler/commands/)).
There is no create, seed or teardown command here, because there is no
resource to create — which is the one way this service is simpler
locally than any stateful one.

## The `local_stack` answer is `n/a`, honestly

There is no engine to compose behind a readiness gate, because there is
nothing to run locally. Nothing about the local task changes because this
component is pinned — the task starts whatever the rest of the stack needs
and the models are simply reachable over the network.

## What local therefore cannot tell you

- **What it will cost at volume.** A developer's call pattern is nothing
  like the product's, and the meter is per call and per token.
- **How it behaves when throttled.** The limits are shared and hit under
  concurrency the laptop never produces, so the retry, queue or degraded
  path the product needs is unexercised locally by construction.
- **Whether the answers are right for real inputs.** The model is the
  real one, but the inputs are a developer's; retrieval quality, prompt
  robustness and the long tail of user phrasing are all judged against
  real data in a deployed environment.

**So cost and failure behaviour are verified in a deployed environment or
not at all.** That is not a gap to close with more local machinery; it is
what local can mean for a service with no local form, and it is why the
harness block's `local_stack` says `n/a` rather than naming a task that
would only pretend.
