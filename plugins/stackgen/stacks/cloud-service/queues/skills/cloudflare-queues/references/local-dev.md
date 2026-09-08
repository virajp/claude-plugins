# Queues — local dev

**A queue really runs on the laptop.** `wrangler dev` simulates it, and
Cloudflare states the simulation runs the same version of Queues that
runs globally: the producer binding sends, the consumer's `queue()`
handler is invoked with batches, and nothing has to be provisioned
first
([local development](https://developers.cloudflare.com/queues/configuration/local-development/)).
That makes this one of the good rows on the provider's local
development map — the `cloudflare` skill's local-development-map
reference, which lands beside this one — and most of this reference is
about the two edges of that row rather than about a substitution.

## The three modes, and which two Queues has

Cloudflare's per-binding table sorts every binding by whether it has a
local simulation, a per-binding remote connection to the live resource,
or both. **Queues has both**
([bindings per environment](https://developers.cloudflare.com/workers/local-development/bindings-per-env/)).

The third mode is the whole-Worker one — `wrangler dev --remote`, which
uploads the Worker and runs it on Cloudflare with every binding live —
and **Queues is not in it**. The same page's remote-development table
says so, and the Queues documentation repeats it under known issues: a
Worker binding a queue cannot be run with `--remote`. That is a
statement about the whole-Worker mode and about nothing else; the
per-binding remote connection is unaffected.

**What the per-binding remote connection actually gives you is narrower
than it sounds, and it is worth being precise.** A remote producer
binding sends into the *real* queue — where the *deployed* consumer
picks the message up, because that is the consumer the queue has. It is
therefore a way to feed a deployed environment from a laptop, not a way
to debug a local consumer against real traffic. Reach for it when the
question is about the producer; leave it off when the question is about
the handler.

## Two Workers, one session

Where the producer and the consumer are separate Workers — the shape
most products end up with — Wrangler runs both from one command, given
a configuration file for each:

```sh
pnpm exec wrangler dev -c wrangler.jsonc -c consumer/wrangler.jsonc \
  --persist-to .wrangler/state
```

The producer's messages invoke the local consumer automatically. Two
caveats attach and both are Cloudflare's own: running several Workers
from one command is marked **experimental**, and **consumer concurrency
is not supported locally**.

That second one is the load-bearing gap. Everything the
[service doctrine](service-doctrine.md) says about `max_concurrency` —
that concurrent invocations may process messages for the same entity, so
mutual exclusion is the consumer's own problem — is invisible on a
laptop, where the consumer is effectively serial. A handler that is not
safe under concurrency passes locally every time.

## The commands the loop actually uses

The queue is an account resource even when the development session
simulates it, so the same names exist in both places and the CLI is how
the real ones are made
([the command reference](https://developers.cloudflare.com/workers/wrangler/commands/queues/)):

```sh
pnpm exec wrangler queues create my-queue-dev
pnpm exec wrangler queues list
pnpm exec wrangler queues consumer add my-queue-dev my-consumer-worker
```

`consumer add` takes the same batching, retry and dead-letter options
the configuration file carries — `--batch-size`, `--batch-timeout`,
`--message-retries`, `--dead-letter-queue`, `--max-concurrency`,
`--retry-delay-secs` — which is how a queue acquires settings that are
not in the repo. Prefer the configuration file, so the settings are
reviewable; use the flags when reproducing an incident, and put the
change back into the file afterwards.

The pull shape has its own pair, `wrangler queues consumer http add` and
`wrangler queues consumer worker remove`, and switching between them is
covered in the [service doctrine](service-doctrine.md).

## What local cannot tell you

Five things, and the first two are the ones that ship bugs:

- **Whether the consumer is safe under concurrency.** Not simulated, as
  above. The first time two invocations touch the same row is in
  production.
- **Whether timing assumptions hold.** Local delivery is immediate and
  the queue is empty, so a batch is small and arrives at once. In
  production `max_batch_timeout` is real, the batch is full, delivery
  is unordered, and a handler that quietly depended on seeing messages
  in the order it sent them passes locally and fails once there is a
  backlog.
- **Whether the retry curve and the dead-letter path work.** They are
  configuration the deployed queue applies; a local run exercising the
  happy path never reaches either. Test them by making the handler fail
  deliberately, against a development queue, rather than by reading the
  configuration and believing it.
- **What a backlog does.** The interesting failures — the oldest
  message aging, the consumer scaling up, the 25 GB ceiling — need
  volume that a local session does not have.
- **Whether the deployed producer and consumer agree.** They are
  released separately, so version skew is a deployment property. A
  single local session runs one version of each, by construction.

## The suite, and where the seam belongs

The unit suite should not need a queue at all: the contract's access
rule puts the send behind the project's shared services layer, and a
test substitutes there and asserts the message was recorded. That keeps
the fast suite fast and, more importantly, keeps the assertion on *what
was sent* rather than on *what happened later*.

The end-to-end suite needs the real thing, and needs it **per
environment** — its own queue, its own dead-letter queue, bound by name
under that environment's block. It asserts on the consumer's own side
effect, with a bounded wait, and never on ordering or latency. That is
the same rule the pack's `harness` block states, for the same reason:
delivery is at-least-once and unordered, so a suite that asserts either
is asserting something the service never promised, and will fail
eventually for a reason nobody can reproduce.
