---
name: Cloudflare Email Service
axis: backing
kind: cloud-provider
components:
- cloud-provider/cloudflare@0.1.0
- cloud-service/email-service@0.1.0
---

# Backing — Cloudflare Email Service

**The product's own email provider, on a domain it already owns.** A
Worker sends transactional mail through a binding — no API key on the
send path, no third-party service that can be down separately from the
product — and mail arriving at an address on the same zone is routed back
into a Worker, so email is an input as well as an output.

**The composition is the provider plus one service**, which is what a
Cloud-Bundle is. The provider component carries what spans services — the
account and role model behind least-privilege grants, the billing
principle, what does and does not exist on a laptop, and the fence saying
which Cloudflare services this stack offers at all. The service component
carries this one service and **cites** that provider doctrine rather than
restating it, which is what keeps a second Cloudflare service from
repeating the same account-level prose a third time.

**What pinning it gives a project** is the `email` capability, and the
judgment rather than a file. This bundle ships no configuration: the
`send_email` block belongs in the `wrangler.jsonc` the project's own
hosting pin already owns, and the service component states the shape to
add. What arrives instead is what a reader cannot look up — that the send
and the receive halves are configured, billed and tested separately; that
a send returning without an error is accepted rather than delivered; that
the binding's destination allowlist is the only thing standing between a
staging bug and a customer's inbox; and that one flag in a config file
turns a simulated local send into a real one.

**It pins beside other backing bundles rather than instead of them.**
`backing_template` is, in vwf's own words, "A LIST: one slug per
capability the project needs — datastore, identity, queue, object
storage, telemetry sink" (vwf's `vwf-config.md`). So a project taking its
email here and its relational data from `cloudflare-d1` records both
slugs, and nothing about this entry claims the axis.

## What this bundle decides that neither component decides alone

**The zone's DNS is the one thing the pin cannot lay down.** Everything
else here is code and configuration in the repository; the sending
records under `cf-bounce.`, the routing MX on the root, DKIM on both
selectors and DMARC on `_dmarc` are **account state on a domain**. A
product whose domain is not on Cloudflare has a prerequisite before this
bundle means anything, and a product whose domain is here still has a
step the materializer cannot perform for it. That is why the component's
doctrine tells you to read record values from the zone rather than write
them from doctrine.

**An environment is a sending domain.** Each environment sends from its
own zone or its own onboarded subdomain, because reputation is held per
domain and is not recoverable by rolling back a deploy: a staging
misconfiguration on a shared sending domain spends production's standing
with every receiving mail server. That decision is taken when the
environments are created, not when the first bounce is noticed.

**Inbound routing is account state pointing at a deployed Worker**, and
nothing in the repository declares it. A Worker exporting an `email()`
handler with no routing rule aimed at it is a handler that is never
called, and it fails silently — which makes the rule something the
environment's review has to cover, alongside its DNS.

**The capability is `email`, and only `email`.** `messaging` covers three
channels; push notifications and SMS have no Cloudflare answer in this
stack, so a product needing either pins a different provider for it.
Marketing mail is not covered either — Cloudflare states the service is
transactional-only today — so a campaign surface is a second provider
rather than a later configuration of this one.

Full judgment: the components' own skills and their references.
