# AI Gateway — identity shape

The least-privilege grants this service needs. The account-side model —
account-owned API tokens over the Global API Key, one identity per workload,
the roles broader than they look, the privilege review, and the honest limit
on keyless auth — is the `cloudflare` skill's identity and IAM reference,
which this cites and does not restate.

## Three credentials, and they are not interchangeable

Confusing them is easy here, because all three are "the key":

| Credential | Lives | Held by |
| --- | --- | --- |
| The API token that manages gateways | The Cloudflare account | Automation, or an operator |
| The gateway authorization token | The calling process's environment | The Worker or service that sends model calls |
| The upstream provider's own key | The gateway, as a stored provider key | Nothing the product deploys |

The management token is the one that creates, configures and deletes
gateways. The gateway token is the one every request presents. The provider
key is the one the gateway uses on the product's behalf and the product
never sends.

## The management grant, and only it

The API token that manages this service needs **`AI Gateway Read`** for
anything that only inspects — listing gateways, reading logs and analytics —
and **`AI Gateway Write`** for anything that changes a gateway's
configuration
([create a gateway](https://developers.cloudflare.com/api/resources/ai_gateway/methods/create)).

That is the whole per-service statement. Everything else about issuing it —
account-owned rather than user-owned, scoped to the account and resources it
touches, never the Global API Key, one identity per workload — is the
provider's doctrine and applies unchanged.

The distinction worth guarding is that **nothing which merely calls a model
needs either permission.** A Worker sending inference through the gateway
presents the gateway token, not an account API token. Handing a deployment
`AI Gateway Write` so that it can "use the gateway" grants it the ability to
turn authentication off.

## The gateway token: authentication is the setting that makes the URL private

A gateway endpoint is an HTTPS URL derived from two identifiers. Left
unauthenticated, **anyone who learns the account id and the gateway id can
send requests through it** — and if provider keys are stored in that
gateway, spend them. The `authentication` setting closes that: with it on, a
request must carry `cf-aig-authorization: Bearer {token}` or be rejected
([create a gateway](https://developers.cloudflare.com/api/resources/ai_gateway/methods/create),
[chat completion](https://developers.cloudflare.com/ai-gateway/usage/chat-completion/)).

It is **off by default**, so the decision gets made by omission unless
somebody makes it. For any gateway holding stored keys, treat it as
mandatory rather than as hardening.

The token itself gets the ordinary treatment the provider's doctrine
requires of every credential at this provider: **injected as an environment
variable at the process boundary, catalogued by name and never by value in
`docs/blueprint/environment.md`, and rotated.** There is no keyless story
available here, and one per environment rather than one shared across them —
the gateways are already separate, and a shared token undoes the separation
the moment it leaks.

## The provider key: moved server-side, not eliminated

With the upstream provider's key stored in the gateway, a request carries
only `cf-aig-authorization` and no provider credential at all
([BYOK](https://developers.cloudflare.com/ai-gateway/usage/chat-completion/),
[stored keys](https://developers.cloudflare.com/ai-gateway/usage/providers/vertex/)).
That is the real security win of the gateway: a compromised Worker leaks a
gateway token that can be revoked in one place, rather than a provider key
that is valid everywhere on the internet and billed to a different vendor.

It does not make the provider key stop being a secret. Placing it is a
deliberate act — the dashboard's Provider Keys section, `wrangler` under its
`ai_gateway` scope, or the API
([changelog](https://developers.cloudflare.com/ai-gateway/changelog/)) — and
it stays a credential the organisation owns and rotates. So it is
**catalogued by name in `docs/blueprint/environment.md` like every other
secret**, even though no process the product deploys holds its value: what
is recorded is that the deployment depends on a credential, where it lives,
and who rotates it. A secret nobody has written down is a secret nobody
rotates.

Rotation has a nice property worth using: because the key is in one place
rather than in every service that calls the provider, rotating it is one
change and no deploy.

## What this component stays silent on

**Where the product's other secrets live**, and how they are provisioned.
That is the provider's secrets doctrine, in the `cloudflare` skill's
identity and IAM reference, which this cites. The only per-service facts
here are the two token permissions and the fact that the gateway's
authentication setting is what turns a public URL into a private one.
