---
name: Cloudflare Analytics Engine
axis: backing
kind: cloud-provider
components:
- cloud-provider/cloudflare@0.1.0
- cloud-service/analytics-engine@0.1.0
---

# Backing — Cloudflare Analytics Engine

A **time-series store the product writes to from its own code**. A Worker
calls one non-blocking method on a binding with a few strings and numbers;
the rows land in a dataset created on first write and are read back with
SQL over HTTP. Pick it when the product needs to count and measure **what
it did** — feature usage, per-tenant activity, latency and outcome per
route — sliced by a dimension with many distinct values, and when nobody
wants to run a metrics stack to get it.

**The composition is the provider plus one service**, which is what a
Cloud-Bundle is. The provider component carries what spans services — the
account and role model, the billing doctrine, what exists locally — and is
written once. The service component carries this one service and **cites**
that doctrine rather than restating it, which is why the account-side
rules appear in exactly one place however many Cloudflare bundles a
project pins.

**What pinning it gives a project** is the binding block for its own
Wrangler config, the doctrine for the three decisions that are hard to
undo — which dimension becomes the index, what each blob and double
position means, and how a query weights sampled rows — and the honest
account of what none of it can prove on a laptop. It ships no
configuration: the Wrangler config belongs to the project's hosting pin,
and this component adds a block to it rather than owning a file.

**It pins beside other backing bundles rather than instead of one.**
`backing_template` is, in the words of vwf's `vwf-config.md`, "A LIST:
one slug per capability the project needs", so a project that
records product metrics here and keeps its relational data elsewhere
records both slugs. Nothing about this bundle asks to be the only one.

**The category realizes no vwf capability token.** `analytics` is one the
taxonomy records as a known vwf-side gap, so the service component leaves
`capability` unset and nothing here mints one.

**The line worth carrying forward** is that this is not the product's
telemetry. Traces and logs answer to `assets/contracts/observability.md`
and its requirement that changing backend not be a rewrite; this is a
Cloudflare-specific binding writing product metrics, and the two coexist
rather than substitute. A product usually wants both, and that is two
pins, not one.

Full judgment: the components' own skills and their references.
