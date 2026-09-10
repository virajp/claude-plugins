# Cloudflare Hyperdrive — identity shape

Two credentials, and confusing them is the whole subject. The
account-side one is what changes Hyperdrive configurations; the
origin-side one is what reaches the database. The provider's identity
and IAM reference — the `cloudflare` skill's — owns the account model,
the token rules and the privilege review; it is cited here and restated
nowhere.

## The account-side grant

Hyperdrive has two account permission groups: **Hyperdrive Read** for
read access and **Hyperdrive Edit** for write access ([Account API
token permissions][perm]). Automation that creates or repoints a
configuration needs Edit; anything that only lists them needs Read, and
that is most of what asks.

Everything else about that token is the provider's rule, not this
service's: account-owned rather than user-owned, scoped to what it
touches, and never the Global API Key. Ask the `cloudflare` skill's
identity and IAM reference for why.

## The origin credential, and where it does not go

**The database password is handed to Cloudflare once, at configuration
time, and never to the Worker.** `wrangler hyperdrive create` takes the
connection string, validates it against the database, and stores the
credential in the configuration ([Get started][gs]). The Worker holds a
binding and reads a connection string out of it at runtime — so there
is no database secret in the Worker's environment, none in the wrangler
file, and none to leak from a deployed script.

That is the property to protect. A connection string pasted into
`wrangler.jsonc`, a `.env`, or a CI variable so that "the Worker can
reach the database directly" has undone the arrangement and reintroduced
exactly the secret this shape removed. Where the credential *does* need
to live somewhere — a migration runner, a local `localConnectionString`
— it is an ordinary secret under the provider's secrets doctrine, and
it is a **different** credential from the one Hyperdrive holds.

**Rotation is a new configuration, not an edit.** Create a
configuration with the new credential, repoint the binding, deploy,
delete the old one ([Rotate credentials][rot]). Anything holding a
retired credential fails at its own next request rather than at
everyone else's.

## Least privilege on the origin role

Hyperdrive does not narrow what the credential can do — it pools a
connection made **as** that role. So the role in the connection string
is the product's actual database privilege boundary, and it should be
the application role: the tables the product uses, the operations it
performs, and nothing owner-level. A superuser in a Hyperdrive
configuration is a superuser reachable from every Worker request that
reaches the binding.

Where the read path and the write path are genuinely separable, two
configurations with two roles express that in a way a single connection
string cannot — and it composes with the cache split the service
doctrine already asks for, since the cache-disabled configuration is
usually the one doing authorization reads.

## Reaching a private origin is an identity decision too

An origin behind a Cloudflare Tunnel authenticates with an Access
client id and secret rather than being publicly addressable, and an
origin behind a Workers VPC service is named by service id ([Hyperdrive
configs API][api]). Both are the provider's networking and private
plane reference applied to a database. Preferring either over a public
host is the same judgment made at the network layer that this page
makes at the credential layer.

## What the review looks at

Folded into the provider's privilege review rather than run separately:

1. **Every Hyperdrive configuration, and which environment it serves.**
   One with no environment behind it holds live credentials for
   nothing.
2. **The origin role in each**, checked against what that environment's
   product actually does.
3. **Anything outside Cloudflare holding the same connection string** —
   a migration runner, a developer's local override. Each is its own
   credential to rotate, and each was probably forgotten.

[perm]: https://developers.cloudflare.com/fundamentals/api/reference/permissions/
[gs]: https://developers.cloudflare.com/hyperdrive/get-started/
[rot]: https://developers.cloudflare.com/hyperdrive/configuration/rotate-credentials/
[api]: https://developers.cloudflare.com/api/resources/hyperdrive/subresources/configs/methods/edit/
