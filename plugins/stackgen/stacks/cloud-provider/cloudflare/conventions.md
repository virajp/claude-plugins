# Cloudflare — conventions

The provider half of the Cloud-Bundle: what holds across every Cloudflare
service the product uses, carried once so no service component restates it.

**The coverage here is bounded, and saying where the boundary falls is
part of the component.** A menu that comes back short without explaining
itself is indistinguishable from a broken one, so the three lists below
are stated rather than implied. Do not fill a gap from general Cloudflare
knowledge: a service this component has not written doctrine for is a
service it does not offer.

**Offered.** Two hosting shapes — **Workers Static Assets** and **Workers
SSR**, a Worker with a script in front of its own assets — plus **Zero
Trust Access** for the private plane, and the storage and data services:
**Workers KV**, **R2** (including R2 Data Catalog and R2 SQL), **D1**,
**Hyperdrive**, **Vectorize**, **Pipelines** and **Analytics Engine**.
Each is its own service component and its own bundle; they are pinned
side by side, not chosen between.

**Planned, each under its own effort, and not offered yet.** Compute and
orchestration — Durable Objects, Workflows, Containers, Queues. AI —
Workers AI, AI Gateway, AI Search, Browser Rendering, the Agents SDK.
Media, messaging and secrets — Images, Realtime, Email Service, Secrets
Store. A product that needs one of these has a gap to name.

**Declined, and they are not coming.** Pages is superseded by Workers
Static Assets in Cloudflare's own guidance; Workers Sites is deprecated
in Wrangler v4; Stream and Turnstile were offered and declined.
Account-level products — WAF, DNS, Tunnels, Zaraz, Logpush, Workers for
Platforms and their kind — are configuration of an account rather than
components of a repo's stack, so they have no place in this model at
all.

**Cloudflare hosts what it can serve from the edge and fronts everything
else.** At the scope offered here it hosts two shapes — a built directory
of files, on Workers Static Assets, and that directory with a script in
front of it, on Workers SSR — and for anything with a running process of a
kind the edge cannot hold, it fronts what runs on another cloud. That
second half inverts the usual reading of a Cloud-Bundle and is the single
fact most likely to be got wrong: a service or fullstack project pins its
hosting elsewhere and pairs the private plane with it, which is vwf's job,
and any cloud's own deploy bundle composes with it.

**The account is the unit of blast radius, and the roles are broader than
they look.** Grants are account-scoped, so a role handed out to edit one
application reaches every application in the account. `Cloudflare Access`
— which edits Access applications, policies and Tunnels — is the narrow
grant for the private plane; `Cloudflare Zero Trust` is administrator
over every Zero Trust product and is not the same request. Which
permission each other service needs is that service component's
identity-shape reference to state, not this one's. Automation uses an
account-owned API token scoped to what it touches, never the Global API
Key, which is unscoped and carries the account.

**Billing follows the population, not the traffic.** A seat is consumed per
user allowed through, and it is freed by removing the user from the seat
rather than by their access expiring on its own. That shape is what makes
this cheap for an operator plane and the wrong answer for anything
customer-facing — the same conclusion the scoping rule reaches from the
other direction, and the reason offboarding is a billing event as well as a
security one.

**The private plane does not exist locally and must not be simulated.**
Cloudflare ships no emulator for the identity-aware proxy, and a local
stand-in would prove only that the stand-in works. Local runs reach the
project directly and inject the identity assertion as a fake through the
same seam the project already verifies in production.

Full judgment: the `cloudflare` skill and its references. The services
this provider carries are the `cloud-service` components named in the
offered list above, each under its own slug — `zero-trust-access`,
`workers-static-assets`, `workers-ssr`, `kv`, `r2`, `d1`, `hyperdrive`,
`vectorize`, `pipelines`, `analytics-engine`.
