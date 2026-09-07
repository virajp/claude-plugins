# Queues — identity shape

The least-privilege grants this service needs. The account-side model —
the roles, how automation gets a token at all, where the account
identifier comes from, and why the unscoped account-wide key is never
the answer — is the `cloudflare` skill's identity and IAM reference,
which this cites and does not restate.

## The running product holds no credential at all

**A Worker producing through a `queues.producers` binding, and a Worker
consuming through a `queues.consumers` subscription, are both authorized
by the deployment.** The platform knows which queue the Worker was
deployed against; there is nothing in the Worker's environment to leak,
rotate or forget.

That is the strongest argument for the push shape over the pull one, and
it is a security argument rather than an ergonomic one. It is also the
reason this reference is short on the product's side and long on the two
places a token does appear.

## Where a token does appear

| Grant | Permission | Held by |
| --- | --- | --- |
| Deploy a Worker carrying queue bindings | Workers Scripts write, alongside the Queues permissions the deploy touches | CI, or the operator running the deploy |
| Create queues, add or remove consumers | Queues **write** | The operator, or a provisioning run |
| Inspect a queue's definition, backlog or consumers | Queues **read** | Automation that verifies, or a dashboard job |
| Pull and acknowledge messages over HTTP | Queues **read and write** together | A pull consumer outside Workers |
| Publish a message over the REST API | Queues **write** | Anything producing from outside Workers |

Cloudflare names the pull consumer's pair explicitly — `queues#read` and
`queues#write`, and it says why the write half is not optional: **a
consumer must be able to write to a queue to acknowledge messages**
([pull consumers](https://developers.cloudflare.com/queues/configuration/pull-consumers/)).
The REST publish path asks for the same write permission under its
dashboard name
([publishing over HTTP](https://developers.cloudflare.com/queues/examples/publish-to-a-queue-via-http/)),
and the API reference lists the accepted set for queue endpoints as the
Queues read/write pair beside the Workers Scripts one.

**Read the consequence off that rather than around it: the permission is
a read/write pair, not a per-verb split.** A pull consumer's token can
therefore also publish into the queue and change its configuration.
There is no narrower grant to ask for, so the mitigations are the
ordinary ones — one token per consumer, named for it, rotated, and a
queue whose consumer is external treated as a queue whose consumer can
also produce.

## The rules that attach to the pull consumer's token

**One token per consumer, named for the system that holds it.** A shared
queue token is one nobody dares rotate, because nobody can enumerate
what stops. A named one makes the blast radius legible before anyone
pulls it.

**It is a secret and gets the ordinary treatment** — injected at the
process boundary, catalogued by name and never by value in
`docs/blueprint/environment.md`, and rotated on a schedule somebody
owns. There is no keyless story for HTTP pull, and claiming one would be
worse than naming the secret and handling it properly.

**The lease is not a credential and must not be treated as one.** A
pulled batch comes back with a lease per message and a visibility
timeout; that is a concurrency mechanism, not authorization. A consumer
that holds a lease past its timeout has not lost permission — it has
lost exclusivity, and the message is delivered again.

## Provisioning is not the product's job

Queues, consumers and dead-letter queues are created by an operator or a
provisioning run holding the write permission, once per environment
([the command reference](https://developers.cloudflare.com/workers/wrangler/commands/queues/)).
Handing that permission to the deployed product so it can create a
missing queue at startup is the mistake this section exists to prevent:
it makes every deploy able to reshape where the work goes, and it hides
a resource's existence from whoever reviews what the account contains.

Wrangler's experimental provisioning flags will create a draft resource
during a command. Treat them as a convenience for a first local setup,
never as the path a real environment is built by.

## The deploy identity

`wrangler deploy` publishes the Worker that carries both blocks, so the
CI identity needs the Workers Scripts grant and the Queues grant
together — the second because a deploy reconciles the consumer
subscription described in the configuration file. **The two environment
variables that identity is presented through, and the rule that CI never
holds the account-wide key, are the provider's** and are stated once in
the `cloudflare` skill's identity and IAM reference.

## What this component does not decide

**Who may do the work the messages describe.** The consumer runs with
whatever bindings its Worker was deployed with, so a queue is a path by
which one part of the product asks another to act — and the grants on
the far side of it, the datastore write or the outbound call, belong to
those components. A queue that anything can produce into is an
authorization surface for every effect its consumer performs, which is
the reason the pull-consumer token above is worth naming and rotating
rather than filing away.
