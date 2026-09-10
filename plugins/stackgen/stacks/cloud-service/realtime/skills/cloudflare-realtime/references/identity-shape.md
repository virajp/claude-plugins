# Cloudflare Realtime — identity shape

The least-privilege grant this service needs. The account-side model —
the two identity systems that are not the same one, account-owned tokens
over the Global API Key, the roles broader than they look, and the rule
that a secret is injected at the process boundary and catalogued by name
— is the `cloudflare` skill's identity and IAM reference, which this
cites and does not restate.

## There is no binding, so there is a credential

This is the difference that matters against every other service in this
stack. A Worker bound to KV or R2 carries no key; a Worker driving
Realtime **holds a bearer token**, because the SFU is an HTTPS API rather
than a binding
([SFU HTTPS API](https://developers.cloudflare.com/realtime/sfu/https-api/)).
There is no keyless story available here, and claiming one would be
worse than naming the secret and handling it properly.

Three distinct credentials appear, and conflating them is the common
mistake:

| Credential | Held by | For |
| --- | --- | --- |
| Account API token | The operator or the pipeline that creates apps | Creating, listing and deleting apps |
| App secret | The server that drives sessions | Every SFU API call for that app |
| TURN credential | The client, briefly | Relaying media through TURN |

## The app id and the app secret

Both are minted when the app is created, and the secret is returned in
that response
([create an app](https://developers.cloudflare.com/api/go/resources/calls/subresources/sfu/methods/create),
[get started](https://developers.cloudflare.com/realtime/sfu/get-started/)).

**The app id is not a secret; the app secret is.** The id names an app
inside an account and is useless without the token, so it sits in
ordinary configuration. The secret authorizes every session and track
operation in that app, which — since every session in an app can reach
every track in it — means a leaked secret is read access to all live
media in that environment.

**It is server-side only, and there is no client-safe version of it.** A
browser gets what the product's own signalling endpoint chooses to hand
back — a session description, a track id — and never the secret itself.
A design that puts the secret in a front-end bundle so the client can
call the SFU directly has removed the product's authorization layer
entirely, because the API has none of its own.

**Where it lives** is the provider's secret rule, unchanged: injected as
an environment variable at the process boundary and catalogued by name,
never by value, in `docs/blueprint/environment.md`. In a hosted staging
or production environment the runtime home is
`cloud-service/secrets-store`, whose doctrine that component owns; on a
laptop and in CI it is whatever `capability-provider/` the repo already
pinned. This component states which secret exists, not how the
environment resolves it.

## The account token permission

Creating and listing apps is an account API operation and takes an
account-owned token with **`Calls Write`** — reading alone takes
**`Calls Read`**
([list apps](https://developers.cloudflare.com/api/go/resources/calls/subresources/sfu/methods/list)).
The permission still carries the product's older name; it is the right
one.

Which to ask for:

| Doing | Needs |
| --- | --- |
| Running sessions against an app that already exists | Neither — the app secret is the whole runtime credential |
| Creating an app for a new environment | `Calls Write` |
| An inventory or audit script listing the account's apps | `Calls Read` |

The first row is the one people get wrong: the runtime never touches the
account API, so a deploy credential does not need `Calls` permissions on
account of using Realtime. Grants here are account-scoped, as the
provider reference states — a token with `Calls Write` reaches every app
in the account, which is a second reason non-production apps belong in a
separate account when the blast radius must be smaller.

## TURN credentials are the client-facing identity

The relay half has its own key — a **TURN key id and a TURN key API
token**, distinct from the SFU app — and the server exchanges them for
**short-lived, per-user credentials** with an explicit `ttl` in seconds,
returned in the shape a browser's `iceServers` expects
([generate TURN credentials](https://developers.cloudflare.com/realtime/turn/generate-credentials/)).

**This is the one place a credential is deliberately handed to a
client**, and the design rules follow from that:

- **Issue per user, per session, never once per deployment.** A
  credential generated at build time and shipped to every client is a
  static relay key with no revocation story.
- **The `ttl` is the whole expiry mechanism.** Pick it against the
  longest plausible call rather than the longest plausible day; a
  credential outliving the session it was issued for is relay capacity
  someone else can spend.
- **A `customIdentifier` tags the credential for usage tracking**
  ([replacing an existing TURN server](https://developers.cloudflare.com/realtime/turn/replacing-existing/)).
  It is an attribution handle, not an authorization one — see
  [cost shape](cost-shape.md).
- **The TURN key API token never reaches the client.** Only the generated
  credential does.

## What the media itself is

Nothing here is stored, so there is no data at rest to classify — but
what flows through is whatever the participants' cameras and microphones
see, which is frequently the most sensitive thing the product handles.
The access control on it is entirely the product's signalling seam
([service doctrine](service-doctrine.md)): the service will forward any
track to any session in the app that asks for it by id.
