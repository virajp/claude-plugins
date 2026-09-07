# Local dev — Cloudflare Secrets Store

The provider's map of what exists on a laptop is the `cloudflare` skill's
local-development-map reference, and this service's row on it is the shape
of everything below: **simulated only, and deliberately** — the local/
remote seam here is a security boundary rather than a fidelity tradeoff.
This file is what that means in practice.

## What runs locally

A `secrets_store_secrets` binding resolves in a local development session
against a **local** store, populated by the `secrets-store secret`
Wrangler commands run **without** `--remote`
([Workers integration](https://developers.cloudflare.com/secrets-store/integrations/workers/)).
`--remote` is what makes any of those commands touch the account; its
absence is what keeps them local
([wrangler secrets-store](https://developers.cloudflare.com/workers/wrangler/commands/secrets-store/)).

The Worker code is unchanged: the same `await env.API_KEY.get()` runs
against the local store. `--persist-to <dir>` moves where that local state
lives, and has to be passed on every invocation rather than once
([wrangler secrets-store](https://developers.cloudflare.com/workers/wrangler/commands/secrets-store/)).
Wherever it lands, it holds real values a developer typed and belongs in
`.gitignore`.

Secrets created locally do **not** count against the account's
hundred-secret entitlement
([Manage account secrets](https://developers.cloudflare.com/secrets-store/manage-secrets/)),
so a session can create as many as the work needs.

## Production secrets are unreachable, and no flag opens them

Cloudflare states it plainly: a secret created on the dashboard, through
the API, or with `--remote` **cannot be accessed from a local development
setup**
([Workers integration](https://developers.cloudflare.com/secrets-store/integrations/workers/)).

This is the row where the usual instinct is exactly wrong. Everywhere else
in this stack, `--remote` is the escape hatch from a lesser simulation to
the real resource. Here there is nothing to escape to: reaching a
production credential from a laptop is the thing the platform refuses, and
that refusal is worth keeping rather than routing around. A developer who
"needs the real value" needs a different value — a development credential
issued at the source, in their own local store.

## Where the local values come from

Not from the account store, and not from a teammate pasting them into
chat. They come from the repo's **developer-side secrets provider** —
`capability-provider/fnox`, or whichever provider the repo picked when it
was shaped — which is what holds a developer's and CI's secrets and
injects them as environment variables at the process boundary.

The shape is: the provider injects the development credential into the
shell, and the project's own seeding step feeds it into
`secrets-store secret create` without `--remote`, so the binding resolves
in the dev session. This component ships no such step and names no task
for it; where it lives is the project's decision, and the constraint is
only that the value's source is the developer-side provider and never the
account store.

**This does not make Secrets Store a development-time secrets manager.**
The local store exists so the binding resolves; the custody of a
developer's secrets stays where it was.

## The trap: `--remote` on a destructive command

The flag that means "local" by its absence also means "the real account"
by its presence, and the same subcommands create, update, duplicate and
**delete**
([wrangler secrets-store](https://developers.cloudflare.com/workers/wrangler/commands/secrets-store/)).
A `secret delete --remote` typed in the rhythm of a local loop deletes a
production secret, and it cannot be restored — the value is gone, not
archived, because no surface can read it back
([Manage account secrets](https://developers.cloudflare.com/secrets-store/manage-secrets/)).

Two habits close it. **Never paste a command containing `--remote` into a
development loop** — account-touching commands belong to a deliberate,
separate session. And **never take a store id or secret id from shell
history**; list them fresh, because the id in the scrollback is as likely
to be production's as this environment's.

## What local cannot tell you

The local store reproduces the read. It does not reproduce anything that
decides whether the design was right:

- **Roles and scopes.** Nothing is authorized locally, so every role
  error and every scope rejection is a deployed-environment error — and
  the scope one arrives at **deploy** time, not run time, which is a good
  failure and an unfamiliar one. See
  [identity shape](identity-shape.md).
- **The account entitlement.** Local secrets are uncounted, so a project
  can build comfortably against forty secrets per environment and discover
  the hundred-secret ceiling on its first real deploy. See
  [cost shape](cost-shape.md).
- **The 1024-byte limit**, which is the one a private key hits.
- **The deploy-time bind**, which is where a missing secret name, a wrong
  store id and an inadequate token permission all surface at once.
- **Rotation.** The create / re-point / delete sequence in
  [service doctrine](service-doctrine.md) is an account-side operation
  with a deploy in the middle of it; there is nothing local that rehearses
  it.

## Hygiene

- Keep the local persistence directory **ignored**, and reset it between
  runs rather than between assertions.
- Use **obviously fake** values locally. A local store holding a real
  vendor key is a production credential on a laptop, which is the exact
  arrangement this service's design avoids.
- Keep the `.get()` behind the one module
  [service doctrine](service-doctrine.md) asks for. That is also what
  makes the value substitutable in a test without a store of any kind.
