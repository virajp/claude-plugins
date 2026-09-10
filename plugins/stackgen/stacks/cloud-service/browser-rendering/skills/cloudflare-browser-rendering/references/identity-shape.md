# Browser Rendering — identity shape

The least-privilege grants this service needs. The account-side model —
account-owned tokens over the Global API Key, why the roles are broader
than they look, and the privilege review — is the `cloudflare` skill's
identity and IAM reference, which this cites and does not restate.

## Three paths reach the service, and one of them holds no credential

| Path | Authenticated by | Used for |
| --- | --- | --- |
| The Worker's `browser` binding | The binding | Sessions and `quickAction()` on the request path |
| The Quick Actions REST endpoints | An account-owned API token | One-shot renders from anything that is not a Worker |
| The CDP `/devtools` endpoints | The same token | Driving a browser from CI, a laptop or another cloud |

**On the binding there is no credential at all.** A Worker configured
with it reaches the service; a Worker without it cannot. Nothing is
injected, nothing rotates, and nothing can leak from the request path —
which is the security argument for rendering from a Worker rather than
calling the REST API from somewhere else that then has to hold a token
([Quick Actions](https://developers.cloudflare.com/browser-run/quick-actions/)).

## The token permission, and there is only one

Both credentialed paths need a custom API token carrying
**`Browser Rendering - Edit`**
([Quick Actions](https://developers.cloudflare.com/browser-run/quick-actions/),
[CDP session management](https://developers.cloudflare.com/browser-run/cdp/session-management/)).
There is no read-only variant to hand to something that only renders:
the same grant that takes a screenshot creates and closes sessions.

Two things follow:

- **A rendering token is not a smaller grant than a rendering Worker.**
  Where the caller *can* be a Worker, making it one removes a
  long-lived credential from the design rather than scoping it down.
- **The blast radius is the account, and it is a spend radius as much as
  a data one.** The grant is account-scoped, so a leaked token opens
  browsers against the account's own allowance and concurrency ceiling
  until it is revoked. The way to make that radius smaller than an
  account is a separate account, not a cleverer token — the provider's
  reference owns that fact.

Where the token reaches a process from, and what it is named there, is
the provider's and the hosting component's business. A token used by
anything outside Cloudflare is a secret catalogued by name in
`docs/blueprint/environment.md` like any other.

## The browser is the identity to the sites it visits, and it cannot hide

Every request the service makes carries headers that cannot be removed
or overridden — `cf-brapi-request-id` on Quick Actions,
`cf-brapi-devtools` on the session paths, `cf-biso-devtools`, and Web
Bot Auth `Signature` / `Signature-Input` headers a destination can
cryptographically verify against Cloudflare's published key directory
([automatic request headers](https://developers.cloudflare.com/browser-run/reference/automatic-request-headers/)).
Bot detection IDs are published too, so a site can allow or block this
traffic by WAF rule.

The consequence is worth stating as an identity fact rather than an
etiquette one: **the product cannot render anonymously.** A design whose
correctness depends on the destination not knowing the request was
automated has no supported form here. The same mechanism read the other
way is useful — a product rendering **its own** site can allowlist this
traffic by signature or bot detection ID instead of loosening its WAF
for everyone
([robots.txt and sitemaps](https://developers.cloudflare.com/browser-run/reference/robots-txt/)).

## The browser carries whatever credentials the render gives it

A session renders as whoever it is authenticated as. Quick Actions take
`cookies`, `authenticate` and `setExtraHTTPHeaders`; a session can log
in like any browser. Three rules follow:

- **A credential handed to a render is a credential in a page's
  JavaScript context.** Anything the page loads runs beside it. Render
  authenticated pages with an account scoped to exactly what the render
  needs, never an administrator's.
- **A reused session carries the previous job's cookies.** That is the
  isolation trap from [service doctrine](service-doctrine.md), and read
  as an identity question it is sharper: without an incognito context, a
  render for one tenant can inherit another's logged-in state.
- **The output is whatever the browser saw.** A screenshot of an
  authenticated page is personal data in an image, and it lands wherever
  the product puts it. The retention and access rules for that object
  are the object store's and the blueprint's, not this component's.

## What this component does not need

**No secret on the Worker request path**, so a product that renders only
from Workers catalogues nothing for the runtime. The only credential in
the picture belongs to a REST or CDP caller, and it is the ordinary
account-owned token the provider's reference already governs.
