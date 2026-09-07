# Service doctrine — Cloudflare Secrets Store

How a project names, binds, reads and rotates the secrets a deployed
Worker or Container consumes, and how that measures against the neutral
secrets contract. The contract is `assets/contracts/secrets.md`; it states
what **any** secrets manager owes a vwf product, and this file states how
this one answers — **citing rather than restating**, and naming the
clauses it does not answer instead of omitting them.

One framing to hold throughout: the contract was written for a manager
that sits in front of a process on a machine someone controls. This is a
platform binding inside a runtime nobody controls. Most clauses survive
that translation unchanged; one does not, and pretending otherwise would
be worse than saying so.

## Contract satisfaction

### The rule that outranks every other

The contract's cardinal rule: **"A secret reaches a process as an
environment variable, injected at the process boundary — never read by the
application from a file"**, and the injector **"wraps the task, not the
application"**.

**Satisfied in substance, and answered differently in form.** The
substance the rule exists to protect is intact, in three parts:

- **It is not a file.** Nothing is read off disk, and nothing sensitive is
  in the repo — the wrangler config carries a `store_id` and a
  `secret_name`, which are identifiers rather than values.
- **It is not an SDK compiled into the application.** There is no client
  library, no endpoint and no authentication call in product code. The
  platform resolves the binding for that Worker; the code presents
  nothing.
- **The bootstrap problem the rule names does not arise.** There is no
  credential that reads the credentials, because the deployed code holds
  no credential at all.

**The one place the model differs, stated as a difference.** The value is
read with an asynchronous call on the binding —

```js
const apiKey = await env.API_KEY.get();
```

([Workers integration](https://developers.cloudflare.com/secrets-store/integrations/workers/))

— rather than from a shell variable the injector set before the process
started. Two real consequences follow, and neither should be smoothed
over:

1. **The read happens inside the application, not before it.** There is no
   wrapper process, so the contract's `<injector> -- <task>` shape has no
   analogue here; the platform is the injector and the boundary is the
   binding resolution, not a command line.
2. **`env.X.get()` is a Cloudflare-shaped read**, so the replaceability
   the rule buys is not free the way it is with an environment variable.
   Keep it behind **one module** that resolves the values the service
   needs and hands them on as ordinary configuration. That module is the
   whole port when the product moves; a `.get()` scattered through the
   services layer is a rewrite.

The discipline that follows: **resolve once per request at the entry
point, never per call site.** A `.get()` inside a retry loop or a helper
called from twenty places turns one platform call into twenty, and the
value ends up copied into more scopes than anyone can reason about. One
resolution, passed down as a parameter, is both the cheaper and the more
reviewable shape.

**Never log the resolved value**, and that includes error paths. A
credential in a thrown error's message reaches the deployment logs, which
are more widely readable than the store the value came from.

### Clause 1 — a distinct set per environment, no silent fallback

**Half satisfied by the platform, half by a naming discipline the project
keeps — and the split is worth being precise about.**

**No silent fallback exists, structurally.** A binding names exactly one
`store_id` and one `secret_name`
([Workers integration](https://developers.cloudflare.com/secrets-store/integrations/workers/)).
There is no default secret, no inheritance and no parent scope to fall
through to, so the failure mode the contract fears — a production job
quietly running on a development value — has no mechanism here. A binding
that names a secret which does not exist, or one whose scope list does not
include `workers`, fails at **deploy** time with an authorization error
rather than at run time with a wrong value
([Access control](https://developers.cloudflare.com/secrets-store/access-control/)).

**A distinct set per environment is the project's to arrange.** The open
beta allows **one store per account**
([Manage account secrets](https://developers.cloudflare.com/secrets-store/manage-secrets/)),
so the store cannot carry the environment — the **name** must. Keep the
contract's naming convention and let the environment ride in it, so that
every secret in the one store is attributable on sight and a staging
binding cannot resolve production's value by omission. Secret names cannot
contain spaces
([Workers integration](https://developers.cloudflare.com/secrets-store/integrations/workers/)),
which the contract's upper-case-digits-underscores rule already satisfies.

Each Workers environment's own `secrets_store_secrets` block then names
its own `secret_name` behind the **same** binding name, so the code is
identical across environments and only the configuration differs. That is
the same shape every other binding in this stack takes.

**When the one-store limit lifts, revisit this.** A store per environment
is the stronger isolation — it moves the boundary from a naming convention
to a resource — and the naming rule above is what stands in for it until
then. Recording that as a known temporary shape is the point of writing it
down.

### Clause 2 — CI authenticates non-interactively

**Satisfied, with one named gap.** A pipeline deploying a Worker that
carries a Secrets Store binding authenticates with an account API token
and needs no human. It also never reads a value: no permission grants
that, so the pipeline handles the binding and not the secret.

The gap is the permission level. Binding a secret to a resource counts as
a **write** against the secret, so the deploy token needs **Account
Secrets Store Edit** — a token with only **Read** fails at deploy time
with an explicit authorization error
([Access control](https://developers.cloudflare.com/secrets-store/access-control/)).
Edit also permits creating, editing, duplicating and deleting secrets. So
the clause's "read-only where the pipeline only reads" cannot be met
today, and the honest statement is that the deploy token is more
privileged than the deploy needs. The compensations, such as they are, are
in [identity shape](identity-shape.md).

### Clause 3 — onboard and offboard a person at a stated cost

**Satisfied, and better than a re-keying scheme — with one thing that
still has to be rotated.**

Onboarding is granting a role; offboarding is removing it, and the removal
is a genuine revocation rather than a re-encrypt
([Access control](https://developers.cloudflare.com/secrets-store/access-control/)).
There is no key to withdraw, no history to re-key, and no earlier commit
that still decrypts. The contract asks a manager whose mechanism is
re-keying to say plainly that re-keying does not un-compromise what was
already read; here the mechanism is revocation, so that caveat does not
apply.

**What does apply**: a value is typed in by whoever created it. Nobody can
read it back afterwards — not through the API, not on the dashboard
([Manage account secrets](https://developers.cloudflare.com/secrets-store/manage-secrets/))
— so the exposure is bounded to what a person saw at creation time, and
bounded is not zero. **Rotate what a departing member created or last
edited.** The `Modified` column on the secret listing is what makes that
list findable
([wrangler secrets-store](https://developers.cloudflare.com/workers/wrangler/commands/secrets-store/)).

### Clause 4 — enumerate names without printing values

**Satisfied as a platform property**, which is the strongest form of this
clause available. `secrets-store secret list` and `secret get` return
metadata — name, id, store id, comment, scopes, status, created and
modified — and no value
([wrangler secrets-store](https://developers.cloudflare.com/workers/wrangler/commands/secrets-store/)).
There is no flag that adds one, because a saved secret cannot be decrypted
by any surface
([Manage account secrets](https://developers.cloudflare.com/secrets-store/manage-secrets/)).

Building `docs/blueprint/environment.md`'s names-only catalogue is
therefore not a discipline anyone has to remember here; it is the only
thing the tooling can produce.

### Clause 5 — keep values out of the terminal and the log

**Satisfied at rest, with one hazard at write time.**
`secrets-store secret create` and `secret update` accept a `--value` flag
that Cloudflare's own documentation marks as test-only, because it leaves
the plaintext in terminal history
([wrangler secrets-store](https://developers.cloudflare.com/workers/wrangler/commands/secrets-store/)).
Omit it and take the interactive prompt, which redacts. In a pipeline,
prefer the API over a command line that a job log will echo.

The second half is the application's: the resolved value is an ordinary
string in memory once `.get()` returns, and nothing about the platform
stops it being logged. That is the discipline named under the cardinal
rule above.

### The encrypt-into-git allowance

**Not applicable, and that is the useful statement.** Nothing this
component involves is committed except a `store_id` and a `secret_name`,
neither of which is a value, so the contract's four conditions — the
scanner allowlist, the identity exclusion, the plaintext gate, the mining
exclusion — have nothing to attach to. A repo that also runs a
provider which commits ciphertext meets those conditions on that
provider's account, not on this one's.

## Naming, in one place

The contract's convention is the convention: `<REPO>_<KEY>` for a value
one repository owns, `GLB_<KEY>` for one genuinely shared across
repositories, upper case with digits and underscores. What this service
adds is the **environment**, because one store holds every environment
while the beta limit stands, and a name that does not say which
environment it belongs to is a binding waiting to be pointed at the wrong
one.

The **binding** name is the code's and does not carry the environment —
it is the same in every environment by design, which is what keeps one
source file deployable everywhere.

## Rotation, in order

1. **Create** the replacement as a new secret with a new name, scoped to
   `workers`.
2. **Re-point** the binding in the wrangler config and deploy. Verify the
   deployed version is serving before continuing.
3. **Delete** the old secret once nothing resolves to it.

**Editing a value in place is the shortcut that removes the rollback.**
The previous value cannot be read back, so a deploy that turns out to need
it has nothing to return to; the three-step form keeps both values live
for exactly as long as the change takes. Deleting a secret a deployed
Worker still binds is the mirror mistake — do it last, and only after the
deploy that stopped naming it.

## Scopes are a second check, not a formality

Every secret carries a scope list, and a bind is rejected if the consuming
service is not on it — however privileged the caller
([Access control](https://developers.cloudflare.com/secrets-store/access-control/)).
Two consequences worth designing for: set `workers` at creation time or
the first deploy fails on something that reads as a permissions problem
and is not; and do not widen a scope list to include a service that does
not need the value, because the scope is the only per-secret limit on
which product can consume it.

## Reviewing this store

1. Does any secret name fail to say which **environment** it belongs to?
2. Does any binding still name a secret that should have been deleted in
   rotation step 3?
3. Is any value resolved with `.get()` **outside** the one module that
   should own the read?
4. Does any error path or log line carry a resolved value?
5. Which secrets were created or last modified by someone who has since
   left, and were they rotated?
6. Is any secret scoped to a service that does not consume it?
