---
name: cloudflare
version: 0.1.0
category: development
description: >-
  Cloudflare as this product's private plane and as its static host — the
  account and role model behind least-privilege grants, seat-shaped billing
  and what frees a seat, what does and does not exist locally, and the
  networking rule that decides whether the private plane is real or
  decorative. Provider-wide judgment every Cloudflare service component
  cites rather than restates, and the fence that says which services are
  offered, which are planned and which are declined.
license: MIT
allowed-tools: Read Grep Glob Edit Write Bash
---

# Cloudflare

The provider-wide half of this stack: what holds across every Cloudflare
service, written once. This skill carries the judgment; the dashboard,
the API and `cloudflared`'s current flags belong to Context7 at use time.

Read the reference that matches what you are doing — one, not all of them.

| Doing | Read |
| --- | --- |
| Sizing, or explaining, a bill | [Cost doctrine](references/cost-doctrine.md) |
| Granting access to the account, or to automation | [Identity & IAM](references/identity-and-iam.md) |
| Running or testing the product on a laptop | [Local development map](references/local-development-map.md) |
| Making a project unreachable except through the proxy | [Networking & private plane](references/networking-and-private-plane.md) |

**Two rules that do not wait for a reference.** Cloudflare, at the scope
this stack offers, **hosts** two shapes — a built directory of files, on
Workers Static Assets, and that directory with a script in front of it, on
Workers SSR — and for anything with a running process the edge cannot hold
it **fronts** what runs elsewhere, where "elsewhere" is that project's
hosting pin's business and never this one's. And an origin that answers a
direct request is a private plane in name only; that failure is invisible
from the outside and is the subject of the networking reference.

## What this stack covers, and what it does not

**Offered.** Zero Trust Access, Workers Static Assets, Workers SSR, and
the storage and data services — Workers KV, R2 (with R2 Data Catalog and
R2 SQL), D1, Hyperdrive, Vectorize, Pipelines, Analytics Engine. Each is
its own service component with its own doctrine.

**Planned, not offered yet**, each under its own effort: Durable Objects,
Workflows, Containers and Queues; Workers AI, AI Gateway, AI Search,
Browser Rendering and the Agents SDK; Images, Realtime, Email Service and
Secrets Store.

**Declined.** Pages (superseded by Workers Static Assets in Cloudflare's
own guidance), Workers Sites (deprecated in Wrangler v4), Stream and
Turnstile (offered and declined), and account-level products such as WAF,
DNS, Tunnels, Zaraz and Logpush, which configure an account rather than
compose a repo's stack.

If the product needs something on the second or third list, that is a gap
to name — not a gap to fill from general Cloudflare knowledge, because
doctrine nobody wrote is doctrine nobody reviewed.
