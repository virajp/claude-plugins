# Cloudflare Workflows — conventions

A durable execution engine bound to a Worker. A Workflow is a class
extending `WorkflowEntrypoint` from `cloudflare:workers`, and its `run`
method is handed a `step` object whose calls are the durable unit: a
completed step's return value is persisted, so a later failure resumes
after it rather than replaying it
([Workers API](https://developers.cloudflare.com/workflows/build/workers-api/)).
Pick it when the product has a **process that must finish once it has
started** — an onboarding, an order, a nightly reconciliation — and where
finishing may take minutes, days or a human's attention.

**It is not a queue, and it is not a cron.** A queue carries independent
messages to consumers that do not know about each other; a Workflow
carries one process's state across its own steps, which is the difference
the async-orchestration contract draws in its own words. Queues is its own
component (`cloud-service/queues`), and a product with a job table's worth
of work should pin that instead. Nor is Workflows a scheduler in the sense
of replacing one: a **schedule starts an instance**, it is not itself the
instance — `schedules` is a list of cron expressions on the Workflow's own
binding entry, and Cloudflare's own guidance is to reach for a separate
Cron Trigger and a `scheduled` handler only when custom logic decides
whether an instance should be created at all
([scheduling](https://developers.cloudflare.com/learning-paths/workflows-course/series/workflows-3/)).

**The binding is the whole access path, and this pack ships no
`wrangler.jsonc`.** A project pinning Workflows adds the block below to the
one its hosting pack already owns at the repo root — `workers-ssr`'s or
`containers`'. Those are the two that ship a `main`, and a Worker script
is what a Workflow class lives in; `workers-static-assets` has none, so a
project on it has nothing to carry this binding.

```jsonc
{
  "workflows": [
    {
      "name": "<workflow name>",
      "binding": "MY_WORKFLOW",
      "class_name": "MyWorkflow"
    }
  ]
}
```

`binding` is the name the Worker reads off `env`; `class_name` **must
match a class exported from the module `main` points at**, because the
Workflow is code in that script rather than a resource provisioned beside
it ([Workers API](https://developers.cloudflare.com/workflows/build/workers-api/)).
Where the class lives in a *different* Worker in the account, `script_name`
on the same entry names it, and the binding reaches across
([Workers API](https://developers.cloudflare.com/workflows/build/workers-api/)).
Two optional keys belong on the entry rather than in code: `schedules`, and
`limits.steps` for a Workflow that needs more than the default step ceiling
([Workers API](https://developers.cloudflare.com/workflows/build/workers-api/)).

**Step design is the whole discipline, and three rules carry it.** Steps
are **named deterministically** — a name interpolating a timestamp defeats
the caching that makes a step durable, and Cloudflare's own rules page
opens on exactly that mistake
([rules of Workflows](https://developers.cloudflare.com/workflows/build/rules-of-workflows/)).
Steps are **idempotent**, because a step that committed a non-idempotent
effect and then failed to report it will run again; the documented shape is
to ask the destination whether the work is already done before doing it.
And **nothing survives outside a step**: the engine may hibernate across a
sleep, so a local variable accumulated across steps is empty afterwards and
the only state that carries is what a step returned — under 1 MiB, with
anything larger written to a store and referenced by key
([rules of Workflows](https://developers.cloudflare.com/workflows/build/rules-of-workflows/)).

**Retry, sleep and wait are configuration, not code you write.** `step.do`
takes a `retries` object (`limit`, `delay`, `backoff`) and a `timeout`;
`step.sleep` suspends for a duration without holding compute; and
`step.waitForEvent` blocks on an event `type` with a timeout that defaults
to 24 hours, resumed by `instance.sendEvent({ type, payload })` from a
Worker or by the REST events endpoint
([Workers API](https://developers.cloudflare.com/workflows/build/workers-api/),
[sleeping and retrying](https://developers.cloudflare.com/workflows/build/sleeping-and-retrying/)).
**Who is allowed to send that event is the product's decision, not the
platform's** — a webhook handler that resolves an instance id from an
untrusted request and calls `sendEvent` has published a way to advance a
process, so the identity reference states the rule.

**An instance id is the dedupe key, and it should come from the domain.**
`create({ id, params })` takes an id the caller chooses, and a Worker
reaches a running instance again with `get(id)`
([Workers API](https://developers.cloudflare.com/workflows/build/workers-api/)).
An id derived from the thing being processed — the order, the upload, the
invoice — is what makes "start the workflow for this order" safe to call
twice; a random id makes a retried HTTP request a second process.

**Contract satisfaction.** This component realizes the
`durable-workflows` capability, so what it owes is the async-orchestration
contract (`assets/contracts/orchestration.md`), and the service-doctrine
reference walks those clauses one by one. The same contract's
`message-queue` and `pub-sub` clauses are **not** this component's — they
belong to `cloud-service/queues`, which cites the same file for its own
half. A product that pins this one and expects a queue out of it has
picked the heaviest of the four shapes the contract enumerates for a
problem the lightest one solves.

**What this component is not.** A coordinator that lives indefinitely and
serializes concurrent writers is Durable Objects
(`cloud-service/durable-objects`) — a run that ends versus an object that
persists. Which Cloudflare services this stack offers, plans and declines
is the provider component's to state — see
`cloud-provider/cloudflare/conventions.md`.

Full judgment: the `cloudflare-workflows` skill's references. The
provider-wide half — cost doctrine, account roles and API tokens, the local
development map — is the `cloudflare` skill's, cited there and restated
nowhere.
