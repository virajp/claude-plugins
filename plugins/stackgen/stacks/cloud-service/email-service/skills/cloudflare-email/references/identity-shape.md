# Identity shape — Cloudflare Email Service

The account-side model — which credential automation is handed, why the
unscoped one never appears in a design, and the privilege review that
reconciles them — is the `cloudflare` skill's identity and IAM reference.
This file cites it and states only what is this service's own: what the
binding authorizes, what the token needs, and the one credential everyone
expects to find here and will not.

## At runtime the binding *is* the identity

A Worker sends through the binding declared in its configuration. There
is no API key, no SMTP password and no secret in the request path — the
platform resolves the binding for the Worker it was declared on, and
nothing else can present it
([Workers API](https://developers.cloudflare.com/email-service/api/send-emails/workers-api/)).

That removes the credential a third-party email provider would need, and
it moves the authorization question one level up: **a Worker holding an
unrestricted binding may send to any verified destination address in the
account, from any onboarded domain.** The restriction keys are the only
grant mechanism there is
([send bindings](https://developers.cloudflare.com/email-service/configuration/send-bindings/)):

| On the binding entry | The Worker may send |
| --- | --- |
| nothing | to any verified destination in the account |
| `destination_address` | only to that one address |
| `allowed_destination_addresses` | only to addresses on that list |
| `allowed_sender_addresses` | only from addresses on that list |

Two consequences, and both are design decisions rather than hardening
afterthoughts:

- **Declare one binding per purpose, not one per Worker.** An operational
  alert path gets a binding pinned to the ops address; a customer-facing
  path gets one restricted to the sender identity it is allowed to
  impersonate. Two narrow bindings in the same Worker is a supported
  shape and a much better one than a single wide binding used carefully.
- **The non-production binding is restricted by policy, not by
  discipline.** An allowlist is the difference between a staging bug
  that fails at the binding and one that reaches a customer.

## Off the request path: a token, and a caveat about naming it

Anything outside a Worker — the REST send endpoint, a script managing
routing rules or destination addresses, a check reading DNS state — uses
an account-owned API token, whose custody rules are the provider
reference's. What is this service's own is which permission that token
carries, and here the honest answer is narrower than a table: Cloudflare
documents the requirement as "a Cloudflare API token that has permission
to send emails"
([REST API](https://developers.cloudflare.com/email-service/api/send-emails/rest-api/))
without publishing a scope string on that page.

So **read the permission out of the token editor when the token is
created, and record the name in `docs/blueprint/environment.md` beside
the token's purpose.** Copying a permission name out of doctrine is how a
token ends up broader than intended — a name that was right once and was
renamed is indistinguishable from a name that was guessed. What does not
depend on the name: the token is scoped to email work alone, never to an
account-wide grant that happens to include it, and never the Global API
Key, which is unscoped and carries the account.

**The deploy identity does not need this token.** Sending is a runtime
concern reached through the binding, and routing rules are account state
changed deliberately rather than on every release. A pipeline holding a
send-capable token is a pipeline that can email customers.

## The DKIM key is not yours to hold, and that is the point

The credential a reader expects to find here does not exist. **Cloudflare
generates and manages the DKIM keys**: the private key signs the mail
inside the platform, and only the public key is published in DNS, on
separate selectors for the sending and routing halves
([email authentication](https://developers.cloudflare.com/email-service/concepts/email-authentication/)).

So there is no signing material to store, rotate or leak — which is a
genuine reduction in what the product holds, and worth stating plainly
because the equivalent setup at a third-party provider often is a secret
someone pasted into a dashboard. The SPF, DKIM and DMARC records
themselves are published DNS: **public by construction**, readable with
`dig` by anyone
([postmaster](https://developers.cloudflare.com/email-service/reference/postmaster/)),
and therefore never catalogued as secrets. Treating a DNS record as
confidential pushes an ordinary, verifiable configuration value out of
review for no gain.

**What is account state rather than repository state**: the zone's
records, the routing rules, the verified destination addresses and the
onboarded sending domains. None of them is secret; all of them are
reviewed where the account is reviewed, because a change to any of them
changes where the product's mail goes without touching a line of code.

## Where a secret does go, if the product acquires one

If the design ends up with a credential this service needs — the REST
token for a non-Worker caller, most likely — it is a secret under the
provider's secrets doctrine, and it has two homes for two environments,
which is deliberate:

- **On a developer machine and in CI**,
  `capability-provider/fnox` on the capability axis holds it and injects
  it at the process boundary as an environment variable.
- **In staging and production**, `cloud-service/secrets-store` is the
  account-level store a deployed Worker reads through its own binding.
  That component's doctrine states which clause of stackgen's secrets
  contract the binding model satisfies; it is not restated here.

Neither replaces the other, and a repo pins both.

## Reviewing this service

1. Which Workers declare a `send_email` binding, and is each one
   restricted to the addresses that Worker's purpose actually needs?
2. Does every non-production binding carry a destination allowlist?
3. Which routing rules point at a Worker, and does a deployed Worker
   exist for each — and conversely, is there a handler nothing routes to?
4. Which API tokens can send, and can each holder's purpose be stated?
5. Are the sending domains per environment, or is one domain shared —
   and if shared, whose reputation does a staging mistake spend?
