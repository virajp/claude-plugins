# Identity shape — Cloudflare Workflows

The account-side model — which credential automation is handed, why the
unscoped one never appears in a design, and the privilege review that
reconciles them — is the `cloudflare` skill's identity and IAM reference.
This file cites it and states only what is this service's own: the
permission a token needs to touch Workflows, the fact that at runtime there
is no token at all, and the one seam where an outside party can advance a
process.

## At runtime the binding *is* the identity

A Worker reaches its Workflow through the binding declared in the
configuration. There is no endpoint, no connection string and no token in
the path — the platform resolves the binding for the script it was declared
on, and nothing else can present it.

That removes the credential this service would otherwise need, and it moves
the authorization question one level up: **a Worker holding a binding can
create, inspect, pause, terminate and restart every instance of that
Workflow.** There is no per-instance or read-only grant inside a binding,
so the boundary is which Workers declare which Workflows. Two consequences,
both design decisions rather than configuration:

- **A Workflow is scoped to the service that owns the process.** A Worker
  that needs another service's process started calls that service, per the
  orchestration contract's access rule — it does not add a second binding
  and reach across with `script_name`.
- **"Only an operator may terminate" means the code enforces it**, because
  the platform will not. Where an operator surface can end a run, that
  authorization is a reviewed part of the service.

## Off the request path: there is no Workflows permission

This is the sharpest fact in this file, and it is easy to get wrong by
analogy with the storage services, which each have their own scoped
permission. **Workflows does not.** The account API's Workflows endpoints
accept the Workers script permissions instead — listing Workflows,
versions and instances requires at least one of `Workers Tail Read`,
`Workers Scripts Write` or `Workers Scripts Read`, and a mutation such as
deleting a Workflow requires `Workers Scripts Write`
([list Workflows](https://developers.cloudflare.com/api/go/resources/workflows/methods/list),
[delete a Workflow](https://developers.cloudflare.com/api/go/resources/workflows/methods/delete),
[list instances](https://developers.cloudflare.com/api/go/resources/workflows/subresources/instances/methods/list)).

| Doing | Needs |
| --- | --- |
| Listing Workflows, versions or instances; reading an instance | `Workers Scripts Read` (or `Workers Tail Read`) |
| Deploying, deleting a Workflow, or any write through the API | `Workers Scripts Write` |

**So the least-privilege story here is inherited, and it is coarser than a
reader expects.** A token that can drive Workflows over the API can also
deploy Worker code, because it is the same permission. Three things follow:

- **The deploy identity holds `Workers Scripts Write`, and it already does**
  — deploying the Worker is what carries the Workflow. No second
  credential is created for Workflows, and creating one would only mint
  another thing able to deploy code.
- **Everything observational holds the read permission.** A dashboard, a
  doctor pass, a report on stuck instances: `Workers Scripts Read` is
  enough for the endpoints above, and handing such a check the deploy's
  token because it already exists is how an account acquires a second
  thing able to publish.
- **There is no token that can only manage instances.** A runbook that
  wants an operator to terminate a stuck run without being able to deploy
  needs that action exposed **through the product's own operator
  surface**, behind the binding, rather than through an API token. Saying
  so is more honest than implying a scope that does not exist.

The credential rules those tokens live under — the account-owned token
over the Global API Key, one identity per workload — are the provider
reference's, named there once. The same page's preference for API tokens
over the legacy email-plus-key scheme is what the Workflows endpoints
document too
([list instances](https://developers.cloudflare.com/api/go/resources/workflows/subresources/instances/methods/list)).

## Who may advance an instance

`step.waitForEvent` blocks until an event of a matching `type` arrives, and
the event is delivered by `instance.sendEvent({ type, payload })` from a
Worker, or through the account API's events endpoint
([Workers API](https://developers.cloudflare.com/workflows/build/workers-api/),
[send events](https://developers.cloudflare.com/workflows/build/trigger-workflows/)).
**Neither path authenticates the sender on the product's behalf.** The API
path is authenticated as the account; the binding path is authenticated as
"a Worker that holds this binding" — which is to say, as the product
itself. So the authorization is entirely the product's to write, and there
are exactly two shapes worth having:

- **A webhook that resolves the instance from a verified payload.** The
  documented pattern reads an instance id off the request and sends the
  event — which means an unverified request can advance any process whose
  id is guessable, or known. The handler verifies the sender's signature
  **first**, and derives the instance id from the verified payload rather
  than from a query parameter, so a caller cannot nominate which run it
  resolves.
- **An approval taken through the product's own authenticated surface.**
  The operator's session is the authorization; the Worker maps the
  authenticated principal to the instance it is allowed to advance and
  sends the event itself.

An instance id is not a secret and must not be treated as one — it is the
domain-derived dedupe key [service doctrine](service-doctrine.md) asks for,
so it appears in logs and in URLs. A design whose safety rests on the id
being unguessable has made the id a credential and lost the dedupe
property in the same move.

## The ids are not secrets

The Workflow `name`, the `binding` name and the `class_name` identify code;
they authorize nothing, so they live in the checked-in configuration
alongside the binding and are not catalogued as secrets. The account id and
the API token that *are* credentials are the provider reference's subject.

## Reviewing this Workflow

1. Which Workers declare a binding to it, and does each of them need to
   **create and terminate**, or only to read status?
2. Does any automation hold `Workers Scripts Write` that only observes —
   and does whoever granted it know that permission also deploys code?
3. Is every `sendEvent` caller authenticated before the instance id is
   resolved, and is the id derived from the verified payload?
4. Can an operator end a stuck run without a token that can deploy? If
   not, that is a surface to build, not a permission to widen.
