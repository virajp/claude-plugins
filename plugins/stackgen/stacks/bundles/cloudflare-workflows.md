---
name: Cloudflare Workflows
axis: backing
kind: cloud-provider
components:
- cloud-provider/cloudflare@0.1.0
- cloud-service/workflows@0.1.0
---

# Backing — Cloudflare Workflows

A **durable execution engine bound to a Worker**. A process is written as
a class whose steps are the durable unit: each completed step's result is
persisted, so a failure resumes after it rather than replaying it, and a
step may retry on its own schedule, sleep for days or wait for an external
event without holding compute. Pick it when the product has work that must
**finish once it has started** — an onboarding, an order, a reconciliation
— and where finishing may take minutes, days, or a human's attention.

**The composition is the provider plus one service**, which is what a
Cloud-Bundle is. The provider component carries what spans services — the
account and role model behind every grant, the billing principle, what
does and does not exist on a laptop, and the scope fence saying which
Cloudflare services this stack offers at all. The service component
carries this one service and **cites** that doctrine rather than restating
it, so the account-level facts are written once.

**What pinning it gives a project** is the doctrine, not a file. This
component ships no configuration: the project's own Workers pack owns
`wrangler.jsonc`, and this says what the `workflows` entry in it must
contain and which optional keys belong on it rather than in code. What
comes with the pin is the judgment — that a step's name is its key in
persisted state and therefore an interface, that nothing survives outside
a step because the engine hibernates across sleeps, that a step is as
large as the work you would be willing to repeat, that an instance id
derived from the domain is what makes starting a process twice safe, and
that the bill counts steps and CPU while elapsed time is free.

**The class lives in the project's Worker, so this pin expects a Workers
deploy pin beside it.** There is no Workflow to provision separately: the
binding names a class exported from the script the deploy publishes, which
means this bundle answers a capability the project's own hosting entry
carries into production. A backing axis naming this with no Cloudflare
Workers deploy entry anywhere in the stack has named an engine with
nothing to run it.

**It pins beside other backing bundles rather than instead of them.**
`backing_template` is, in vwf's own words, "A LIST: one slug per
capability the project needs — datastore, identity, queue, object storage,
telemetry sink" (vwf's `vwf-config.md`). So a project whose orchestration
is here and whose relational data is in `cloudflare-d1` records both
slugs, and a product that needs both a process engine and independent
message delivery pins this and `cloudflare-queues`.

## What this bundle decides that neither component decides alone

**The environment is the deployed script.** Unlike the storage services on
this axis, there is no resource id whose value distinguishes staging from
production — a staging Worker has its own Workflow and its own instances
because it is a different deployment. That removes a class of mistake and
introduces another: where a Workflow is bound across scripts, the owning
script is what an environment split has to follow, or two environments
bind the same running Workflow.

**The poison path is an operational commitment, not a resource.** Work
that will never succeed becomes an errored instance, retained for as long
as the instance's retention says. Nothing drains that; a project pinning
this is agreeing that somebody reviews errored instances on a stated
cadence, and the flow's design says whether a failure also runs
compensating steps.

**The capability is `durable-workflows`**, so this composition answers the
orchestration capability's process half and no other. The same neutral
contract's queue and pub-sub clauses belong to `cloudflare-queues`, and a
product that needs one thing later — retried until it succeeds — pins
that instead, because a workflow engine is the heaviest of the four
shapes the contract enumerates.

Full judgment: the components' own skills and their references.
