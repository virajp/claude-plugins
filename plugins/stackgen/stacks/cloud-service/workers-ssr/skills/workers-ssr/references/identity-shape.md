# Workers SSR — identity shape

The least-privilege grant this service needs. The account-side model —
account-owned scoped tokens over the Global API Key, one identity per
workload, why the roles are broader than they look, and the privilege
review that catches what accumulates — is the `cloudflare` skill's identity
and IAM reference, which this cites and does not restate.

**The deploy credential is the same one the assets-only sibling needs, and
the difference is what sits behind it.** Something of yours now runs on a
request, so there is a runtime side to this that a static deployment does
not have — but the runtime side is not a Cloudflare identity, which is the
point worth getting right.

## The deploy credential

**An account-owned API token, scoped to editing Workers scripts on the one
account.** Not a user-owned token, which dies with the user's membership
and turns an ordinary departure into a pipeline outage. Not the Global API
Key, which carries the whole account and cannot be narrowed.

Two permissions are usually involved and it is worth knowing which is
which, because a token that deploys but cannot route fails in a way that
looks like a DNS problem:

| Needed for | Scope |
| --- | --- |
| Uploading and publishing the Worker script and its assets | Account, Workers Scripts — edit |
| Binding it to a custom domain (`routes` with `custom_domain`) | The zone that hostname lives in |

The second is only needed where the route is managed by wrangler rather
than created once by hand. **Prefer creating the custom domain once,
manually, and leaving the pipeline's token without zone permissions** — the
route changes approximately never, and a token that can edit DNS for a
production zone is a much larger credential than one that can replace a
deployment.

Confirm the exact current permission names against Context7 rather than
this file; Cloudflare renames them, and a token created from a stale name
fails with an authorization error that says nothing about which permission
was missing.

## The two environment variables

`CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`. The account id is not a
secret — it identifies, it does not authorize — but it is injected the same
way for the same reason every other environment value is: so the deploy
task reads its configuration from one place.

Both are **account-wide values shared across every repo that deploys to the
account**, so the secrets convention names them `GLB_CLOUDFLARE_API_TOKEN`
and `GLB_CLOUDFLARE_ACCOUNT_ID`
(`${CLAUDE_PLUGIN_ROOT}/assets/contracts/secrets.md`) rather than with a
per-repo prefix. Catalogued by name and never by value in
`docs/blueprint/environment.md`.

**There is no keyless story available here, and claiming one would be worse
than naming the secret and handling it properly.** The token is a secret
held by the pipeline. Give it an expiry, and prefer re-issuing to
extending: a credential with no expiry is one whose owner nobody has had to
name since it was created.

## `wrangler login` is not the pipeline's path

It is an interactive OAuth grant stored on one laptop, and it is genuinely
convenient for a developer running a one-off deploy. CI has no browser and
no laptop; a pipeline depending on someone's grant is one that breaks when
they leave, and the failure arrives as an authorization error nobody
associates with a departure.

## The runtime side, which is where this differs

**The script has no Cloudflare identity, and it must not be given one.**
Whatever it needs to reach — a datastore, an API, a third-party service —
it reaches with that system's own credential, supplied to the Worker as a
secret at deploy time and never written into `wrangler.jsonc`. A deploy
token in the script's environment is a credential that can redeploy the
thing running it, which is the one grant a rendering process should never
hold.

Two rules follow, and both are easy to get wrong in the direction that
looks convenient:

- **A secret the script holds is readable by every route the script
  serves.** There is no per-route isolation; one bad handler exposes the
  whole environment. The narrowest credential the rendering path can do its
  job with is the one to issue, and it is narrower than the one the build
  or the backend holds.
- **A value the browser will see is not a secret and must not be handled as
  one.** Anything inlined into a rendered page is public the moment it is
  rendered, which is a distinction a server-rendering deployment blurs in a
  way a static one cannot.

## What has no identity at all

- **The served assets.** Every file in the uploaded directory is public to
  anyone who requests it, and it is served **before** the script is
  consulted — so an authorization check written into the script does not
  protect it. "Unlisted" is not a permission model, and anything that must
  not be public must not be in the build output.
- **A prerendered page.** Same rule, same reason. If a page must be seen
  only by some people, it must render on demand *and* the check must be in
  the rendering path.

Where the whole site must be reachable only by named people, the answer is
the account's identity-aware proxy in front of it —
`cloud-service/zero-trust-access`, a second pin on the same axis — and that
component owns the policy, the groups and the service tokens.

## Separation between environments

A production deployment and a preview deployment are two Workers on one
account, so one token that can edit Workers scripts can publish to both.
Where that is not acceptable, the answer is **a separate account**, not a
cleverer token — account scope is the floor, which is the provider
doctrine's point and applies here unchanged.

The sharper version of the same question is the runtime one: two Workers on
one account can be given the same downstream credentials by accident, and a
preview front end pointed at production data is the usual way it happens —
see [pipeline](pipeline.md).
