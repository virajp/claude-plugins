# Identity shape — Cloudflare Secrets Store

The account and role model, the workload identity shape, why the Global
API Key is never the answer and the privilege review are the `cloudflare`
skill's identity-and-iam reference — cited here and restated nowhere.
This file states only the grants **this** service needs, and one gap the
platform does not currently let a project close.

## Two checks, and both have to pass

Access to a secret is decided by two independent gates:
**authorization** — the caller's role, or their API token's permission,
one or the other depending on how the request authenticated — and
**scope** — the secret's own list of services allowed to consume it
([Access control](https://developers.cloudflare.com/secrets-store/access-control/)).

That second gate is the one that surprises people, because it is a
property of the **secret** rather than of the caller. A fully privileged
administrator cannot bind a secret whose scope list omits `workers`, and
the failure reads as a permissions problem while being nothing of the
kind. Set the scope at creation time.

## The four roles, and which one each person needs

| Role | Can |
| --- | --- |
| Super Administrator | everything below, plus the rest of the account |
| Secrets Store Admin | create, edit, duplicate, delete, view metadata |
| Secrets Store Deployer | view metadata, and bind a secret to a Worker |
| Secrets Store Reporter | view metadata only |

([Access control](https://developers.cloudflare.com/secrets-store/access-control/))

**The Admin/Deployer split is the one that carries the design**, and it is
worth spending deliberately: it separates **who holds a secret** from
**who deploys with it**. The person who pastes in a payment credential
needs Admin and never needs to deploy; the person who ships the Worker
needs Deployer and never needs to create a secret. Handing one human both
because it was one fewer request collapses the only separation this
service offers.

**Reporter is the grant for most of the people who ask.** Someone
answering "does that secret exist and when was it last rotated" needs
metadata and nothing else.

**Nobody, at any role, can read a value.** Once saved, a secret can no
longer be decrypted or accessed through the API or the dashboard
([Manage account secrets](https://developers.cloudflare.com/secrets-store/manage-secrets/)).
That is not a role to withhold; it is a capability that does not exist,
which is the strongest form of least privilege available.

## The pipeline's token, and the gap it cannot close

Deploying a Worker that carries a Secrets Store binding requires an API
token with **Account Secrets Store Edit**. A token with only **Read**
fails at deploy time with an explicit authorization error naming the
binding
([Access control](https://developers.cloudflare.com/secrets-store/access-control/)).
The reason is that attaching a secret to a resource is treated as a write
against the secret.

So a deploy token can also **create, edit, duplicate and delete** secrets,
which is more than deploying needs. **State this rather than design around
it** — there is no narrower permission to request today. What is available
in mitigation:

- **A token per pipeline**, account-owned and scoped to exactly the
  permissions that pipeline uses, never a shared one and never a
  user-owned one — the provider's identity reference has the reasoning.
- **The deploy token still reads no values.** Edit permits managing
  secrets, not decrypting them, so the worst case is destructive rather
  than disclosive. That is a real distinction and worth stating, and it is
  not an argument for relaxing anything else.
- **Watch for deletions**, since that is the capability the excess grant
  actually confers. A secret disappearing between deploys is the signal.

The token itself is a secret and is held where every other pipeline
credential is held — the repo's `capability-provider` secrets pick,
injected as an environment variable and catalogued by name, never value,
in `docs/blueprint/environment.md`, exactly as the provider's identity
reference requires.

## The binding is the runtime identity, and there is nothing to issue

A deployed Worker or Container presents no credential to reach a secret.
The platform resolves the binding for that Worker; there is no key in the
project, none in the image, and none to rotate
([Workers integration](https://developers.cloudflare.com/secrets-store/integrations/workers/)).

So the runtime half of this service has no identity question at all, and
every grant on this page exists because a **human or a pipeline** touches
the store — never because the running code does.

**Two identifiers in the wrangler config are not credentials.** A
`store_id` and a `secret_name` name a secret; they do not open it. They
are committed, they appear in review diffs, and neither is a finding.

## Reviewing this store

1. Does any **human** hold Admin who only ever needed Deployer, or
   Deployer who only ever needed Reporter?
2. Does any one person hold **both** Admin and Deployer, and was that a
   decision or an accumulation?
3. Is any pipeline using a **user-owned** token, which dies with that
   user's membership?
4. Does any secret's **scope list** include a service that does not
   consume it?
5. Were the secrets a departed member **created or last modified**
   rotated? Nobody could read them back, but they saw them once.
