# Pipelines — identity shape

The least-privilege grants this service needs. The account-side model —
the roles, how automation gets a token at all, and why the unscoped
account-wide key is never the answer — is the `cloudflare` skill's
identity and IAM reference, which this cites and does not restate.

## Three grants, and only one of them belongs to the running product

| Grant | Permission | Held by |
| --- | --- | --- |
| Write events into a stream | Pipelines **Send** | The producer — a Worker binding, or an HTTP client |
| Read the resources' definitions | Pipelines **Read** | Automation that inspects or verifies |
| Create or change streams, pipelines and sinks | Pipelines **Edit** | The operator, or a provisioning run |

Cloudflare names these as the Workers Pipelines permission group, and a
worked setup asks for Read, Send and Edit together because it is
provisioning and then producing in the same session
([an end-to-end setup](https://developers.cloudflare.com/r2-sql/tutorials/end-to-end-pipeline/)).
A running product is not in that session. **It sends, and nothing more** —
a product that can also create a sink can also point one somewhere else.

## The binding needs no token at all

A Worker sending through the `pipelines` binding is authorized by the
binding: the platform knows which stream the Worker was deployed with,
and there is no credential in the Worker's environment to leak, rotate or
forget. That is the strongest reason to prefer the binding over the HTTP
door wherever the producer is a Worker, and it is a security argument
rather than an ergonomic one.

## The HTTP door is where a credential appears

A stream created with authentication enabled requires a **bearer token
carrying the send permission** on each POST
([writing to streams](https://developers.cloudflare.com/pipelines/streams/writing-to-streams/)).
Three rules attach to it.

**One token per producer, named for it.** A shared ingest token is one
nobody dares rotate, because nobody can enumerate what stops. A token
named for the system that holds it makes the blast radius legible before
anyone pulls it.

**Send only.** An ingest token that also carries Edit is a token that can
delete the stream it writes to. This is the one place the permission
split above earns its keep, and it is routinely collapsed because the
provisioning token is already sitting in the operator's shell.

**It is a secret and gets the ordinary treatment** — injected at the
process boundary, catalogued by name and never by value in
`docs/blueprint/environment.md`, and rotated. There is no keyless story
for HTTP ingest, and claiming one would be worse than naming the secret
and handling it properly.

## A stream with authentication off has no identity at all

Disabling authentication makes the ingest URL the entire credential, and
a URL is not one — it appears in browser network tabs, in logs, in error
reports. Combined with a CORS origin it is the only way a browser can
post directly, which is a real arrangement with a real cost: **anyone can
write anything into that stream**, and the schema is the only filter.

Two consequences to design for rather than discover. The data is
**attacker-influenced** from that moment, so nothing downstream may treat
a field as trusted — a dashboard that renders a string from an open
stream is rendering user input. And the volume is **unbounded by anything
the product controls**, which is a cost question as much as a security
one.

Where the events are anonymous and junk rows are survivable, this is a
defensible trade taken deliberately. Where they are not, the browser
posts to the product's own Worker — which authenticates the user it
already knows — and the Worker sends through the binding.

## Provisioning is not the product's job

Streams, sinks and pipelines are created by an operator or a provisioning
run holding Edit, once per environment. Handing that permission to the
deployed product so it can create a missing resource at startup is the
mistake this section exists to prevent: it makes every deploy able to
reshape where the data goes, and it hides a resource's existence from
whoever reviews what the account contains.

Wrangler's experimental provisioning flags can create draft resources
during a command; treat them as a convenience for a first local setup,
never as the path a pipeline environment is built by.

## What this component does not decide

**Who may read the data once it has landed.** The bucket, the catalog and
the tokens that query them are the `cloudflare-r2` component's grants,
and they are a different list from this one — a token that can write into
a stream should not be a token that can read the warehouse.
