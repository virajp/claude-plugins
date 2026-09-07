---
name: Cloudflare Browser Rendering
axis: backing
kind: cloud-provider
components:
- cloud-provider/cloudflare@0.1.0
- cloud-service/browser-rendering@0.1.0
---

# Backing — Cloudflare Browser Rendering

**Headless Chrome as a service.** The product asks for a real browser to
load a page — its own or someone else's — and takes back what only a
rendered page can give: the DOM after JavaScript has run, a screenshot,
a PDF, the text behind a selector, the links on a page. Pick it when the
product generates images or documents from HTML, snapshots
JavaScript-heavy pages for crawlers, or reads sites that do not serve
their content until a script has run — and when running and patching
browsers is work the product should not be doing.

**The composition is the provider plus one service**, which is what a
Cloud-Bundle is. The provider component carries what spans services —
the account and role model, how the meter runs, what does and does not
exist on a laptop, and the fence saying which Cloudflare services this
stack offers at all. The service component carries this one service and
**cites** those rather than restating them.

**This is a backing-axis entry and it produces no artifact**, so it
carries no `artifact:` key. It hosts nothing and deploys nothing: the
project still ships however its own hosting pin says, and this decides
where its rendering happens once it has.

**It pins beside other backing entries rather than instead of one.**
`backing_template` is, in vwf's own words, "A LIST: one slug per
capability the project needs — datastore, identity, queue, object
storage, telemetry sink" — that is vwf's own config-format asset
describing `backing_template`, not a rule restated here. A product that
renders PDFs and stores them pins this and an object store, and that is
the ordinary case rather than a workaround.

## What this bundle decides that neither component decides alone

**The resource is the account, not an instance.** Unlike every other
backing pin on this provider, there is nothing to create and nothing per
environment: the binding names no bucket, index or database, and
production and pre-production draw on the same browser hours and the
same concurrent-browser ceiling. Pinning this therefore records a
**shared-capacity dependency** rather than an owned resource, and the
question it forces at architecture time is what happens to every other
project in the account when this one's fan-out runs.

**The bill is time a browser was open, and the code decides it.** No
render has a price; the seconds until `close()` do. That makes the
lifecycle a cost decision as much as a correctness one, and it is why
the component's doctrine puts `browser.close()` in a `finally` rather
than treating it as tidiness. A one-shot render belongs in a Quick
Action, which cannot leak a session and carries no concurrency term at
all.

**Rendered output is an object, and this bundle does not hold it.**
Screenshots and PDFs come back as bytes; bytes returned to a caller are
bytes re-rendered next time, at full price. A product that generates
them more than once pins an object store beside this — the
`cloudflare-r2` bundle is the one on this provider — and this
composition makes that pairing visible at pick time instead of at the
first bill.

**Fan-out is bounded outside the render.** The service answers `429`
with a `Retry-After` when the account's ceiling is reached, and
Cloudflare's own guidance is a queue or a workflow in front of a batch
rather than a loop that launches browsers. Those are the
`cloudflare-queues` and `cloudflare-workflows` bundles; a product whose
rendering is bulk rather than incidental should expect to pin one of
them too.

**Rendering someone else's site is a product decision this bundle makes
explicit.** `robots.txt` is advisory and the service does not enforce
it, while every request carries non-removable headers and a
cryptographic signature proving it came from Cloudflare — so the product
cannot render anonymously, and what it renders, how fast, and under
whose terms belong in the blueprint rather than in a client library's
options.

**The local answer is the live service, not a simulation.** There is no
local browser, so the binding is opted in with `remote: true` and a dev
session renders for real and bills for real — from a laptop exactly as
from the edge. That makes the dev loop a spender of the same shared
allowance, which is the second half of the account-is-the-resource fact
above.

**The category realizes no vwf capability token.** `browser` is one of
the categories the taxonomy records as a known vwf-side gap, so the
service component leaves `capability` unset and nothing here mints one.

Full judgment: the components' own skills and their references.
