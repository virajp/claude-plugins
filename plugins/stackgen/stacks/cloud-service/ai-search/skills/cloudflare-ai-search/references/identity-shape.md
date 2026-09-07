# AI Search — identity shape

The least-privilege grants this service needs. The account-side model —
the two identity systems, account-owned tokens over the Global API Key,
why the roles are broader than they look, and the privilege review — is
the `cloudflare` skill's identity and IAM reference, which this cites and
does not restate.

## Three paths reach an instance, and two of them hold a credential

| Path | Authenticated by | Used for |
| --- | --- | --- |
| The Worker at runtime | The binding | Search, generate, and — with the namespace binding — upload and manage |
| Automation and the CLI | An account-owned API token | Create instances, configure them, trigger and inspect sync jobs |
| The service reading your bucket | A registered service API token | Syncing an R2 source, and nothing else |

**At runtime there is no credential at all.** The binding *is* the grant:
a Worker configured with it reaches that instance, and a Worker without
it cannot. Nothing is injected, nothing rotates, and nothing can leak
from the request path.

## The binding you choose is the grant you make

This is the decision most easily made by accident, because both bindings
are one block in the same file. `ai_search` binds **one instance**;
`ai_search_namespaces` binds **every instance in the namespace**, and
brings with it the Items API and the ability to create and delete
instances at runtime
([Workers binding migration](https://developers.cloudflare.com/ai-search/api/migration/workers-binding/)).

So a Worker that only answers queries and is given the namespace binding
can also overwrite the corpus and delete the instance — not because
anything granted it that, but because the binding form did. **Take the
instance binding wherever the Worker only reads**, and treat reaching for
the namespace form as a decision with a reason recorded next to it.

There is no narrower grant inside either form: a binding is all-or-nothing
over what it names. There is no read-only instance binding, no per-item
permission, and no per-source scope.

## The token permission, and its three levels

The API exposes an **AI Search** permission under the AI & Machine
Learning category, at **Read**, **Run** and **Edit**
([API token permissions](https://developers.cloudflare.com/ai-search/api/migration/rest-api/)).
Read inspects instances and jobs; Run executes queries; Edit creates,
configures and deletes. Cloudflare's own get-started path asks for Edit
and Run together for full API use
([create an API token](https://developers.cloudflare.com/ai-search/get-started/api/)).

Give Edit only to the thing that provisions. A dashboard that reports on
index freshness needs Read; a service that queries over the REST API
rather than a binding needs Run; only the pipeline that creates and
reconfigures instances needs Edit. The distinction matters because these
grants are account-scoped — the provider's reference owns that fact and
its consequence, which is that an Edit token reaches every instance in
the account and the way to make a blast radius smaller than an account is
a separate account, not a cleverer token.

## The service API token, which is a different thing with a similar name

**Only an R2 source needs one.** To sync from a bucket, AI Search must be
able to read it, and that permission is granted by creating an
account-owned API token and then **registering it with AI Search**, which
returns a token id the instance references. A website source or direct
uploads through the Items API need no such token at all
([service API token](https://developers.cloudflare.com/ai-search/configuration/indexing/service-api-token)).

Two things follow:

- **It is a stored credential, and the provider's secrets doctrine
  governs it.** It lives in the account rather than in the repo, it is
  not injected into any process, and it is not something to catalogue in
  the project's environment file. It is something to record as existing,
  and to rotate deliberately — the `cloudflare` skill's identity and IAM
  reference owns how account credentials are managed.
- **It is the one grant that makes a source-side mistake reach further
  than the index.** Scope the token to what the sync actually needs, and
  prefer a bucket that holds the corpus and nothing else — which the
  R2 component's own rule of one bucket per purpose already gives you.

## The binding is not authorization inside the corpus

**Every document in an instance is reachable by every query the Worker
serves.** There is no per-document, per-tenant or per-user permission in
the index; a metadata filter separates tenants only because the code
always passes it, and a query path that forgets it returns another
tenant's documents with no error.

Two consequences, and they are the ones that get missed:

- **Where separation must not depend on a caller remembering, the
  boundary is a separate instance** — and then the binding is the
  enforcement, which is the argument for the instance binding again. A
  Worker holding a namespace binding across per-tenant instances has
  moved the boundary back into code.
- **A chunk is returned verbatim.** Anything indexed can be surfaced to
  any user the Worker answers, including the parts of a document nobody
  meant to publish. Indexing a corpus is a publication decision about
  every document in it, and the filter to apply is at ingest, not at
  query.

## What a generated answer is, as a privacy question

An answer is assembled from the chunks retrieved, so it can restate
content the caller has no right to see even when the product would never
have served the document itself. Returning item keys and letting the
product's own authorization decide which sources the caller may open
keeps the existing access rules in force for the *citations*; it does not
keep them in force for the *answer*. Where the corpus is not uniformly
readable by every caller, the separation belongs at the instance
boundary, not in the prompt.

## What this component does not need

**No secret on the request path**, so there is nothing to catalogue in
`docs/blueprint/environment.md` for the runtime. The credentials in the
picture belong to automation and to the sync, and both are the ordinary
account-owned tokens the provider's reference already governs.
