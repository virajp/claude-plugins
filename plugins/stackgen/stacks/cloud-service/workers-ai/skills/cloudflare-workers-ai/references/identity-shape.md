# Workers AI — identity shape

The least-privilege grants this service needs. The account-side model —
the two identity systems, account-owned tokens over the Global API Key,
why the roles are broader than they look, and the privilege review — is
the `cloudflare` skill's identity and IAM reference, which this cites and
does not restate.

## Two paths reach the models, and only one of them holds a credential

| Path | Authenticated by | Used for |
| --- | --- | --- |
| The Worker at runtime | The binding | Every inference call on the request path |
| Automation, another cloud, the CLI | An account-owned API token plus the account id | The REST endpoint, listing the catalog, managing fine-tunes |

**At runtime there is no credential at all.** The binding *is* the grant:
a Worker configured with it can call every model in the catalog, and a
Worker without it can call none. Nothing is injected, nothing rotates, and
nothing can leak from the request path — which is the main security
argument for reaching inference by binding rather than over HTTPS from
somewhere else
([bindings](https://developers.cloudflare.com/workers-ai/configuration/bindings/)).

**The REST path needs both halves.** It is
`POST /accounts/{account_id}/ai/run/{model}` with a bearer token, so the
account id is as necessary as the credential — and it is an identifier
rather than a secret, which is why it belongs in configuration and the
token belongs wherever the product keeps secrets
([REST API](https://developers.cloudflare.com/workers-ai/get-started/rest-api/)).

## The token permission

The service exposes a read level and a write level. **Cloudflare's own
pages spell the write level two ways** — the REST getting-started page
asks for `Workers AI Read` and `Workers AI Edit`
([REST API](https://developers.cloudflare.com/workers-ai/get-started/rest-api/)),
and the fine-tunes page names `Workers AI Read` and `Workers AI Write`
([fine-tunes](https://developers.cloudflare.com/workers-ai/features/fine-tunes/)).
They are the same pair of levels under two spellings; pick whichever the
token editor actually offers and do not spend time reconciling the prose.

Give the write level only to the thing that actually writes. Running
inference and reading the catalog is the read level's business; creating
and managing fine-tunes is the write level's. A build step that calls a
model, a job on another cloud that embeds a corpus, a monitoring probe
that lists models — none of them needs write.

These grants are **account-scoped**, which is the provider reference's
fact and its consequence: a token reaches every model this service offers
in the account, and the way to make a blast radius smaller than an account
is a separate account, not a cleverer token. The credential names, how a
token reaches a process, and the preference for account-owned tokens over
the Global API Key are all that reference's.

## The binding is not authorization inside the service

**A binding is all-or-nothing over the catalog.** There is no per-model,
per-task or per-tenant permission: a Worker that can call the smallest
embedding model can call the largest generation model, at the largest
model's price.

Two things follow, and they are the ones that get missed:

- **Any code path in that Worker can spend the account's inference
  budget.** The model id is a string the code chooses, so a code path
  that takes it from a request parameter has handed a caller the choice
  of what to spend. Model ids are chosen by the product, in the module
  that owns them — the seam in
  [service doctrine](service-doctrine.md) is a cost control as well as a
  maintenance one.
- **Per-tenant limiting is the application's job.** Nothing in the
  binding knows which of the product's users a call is for, so a
  per-user or per-plan ceiling on inference is something the product
  enforces before it calls, or does not have. The service's own rate
  limits protect the platform, not the product's bill
  ([limits](https://developers.cloudflare.com/workers-ai/platform/limits/)).

## What the model sees is a privacy question, not an IAM one

A prompt carries whatever the user typed and whatever the product
retrieved on their behalf. No grant here governs that: the binding
authorizes the call, and the contents are the product's to decide on —
what may be sent, whether it is logged, and for how long. That decision
belongs in the product's own data handling, and it is stated as such
rather than borrowed from a permission model that has no opinion about it.

## What this component does not need

**No secret on the request path**, so there is nothing to catalogue in
`docs/blueprint/environment.md` for the runtime. The only credential in
the picture belongs to the REST path and the CLI, and it is the ordinary
account-owned token the provider's reference already governs — alongside
the account id, which is configuration rather than a secret and is still
worth keeping out of a public repository.
