# Workers KV — identity shape

The least-privilege grant this service needs. The account-side model —
the two identity systems that are not the same one, account-owned tokens
over the Global API Key, the roles broader than they look, the privilege
review — is the `cloudflare` skill's identity and IAM reference, which
this cites and does not restate. Nothing about the credential's name, its
storage or the account id is repeated here.

## The runtime has no credential

**The binding is the whole runtime identity.** A Worker reads
`env.MY_KV`, and the platform resolves that to the namespace named in the
configuration; there is no key, no token and no connection string in
product code, and nothing to inject at the process boundary for reads and
writes at request time.

That is worth stating because it is easy to reach for the REST API out of
habit. **In a Worker, using the REST API to touch KV is a mistake**: it
adds a credential the binding removed, an egress hop, and a failure mode
the binding does not have. The REST path exists for what runs outside a
Worker — a seeding script, a migration, a CI step — and that is the only
thing it is for here.

## The permission a deploy or a script needs

Two permissions exist and they are ordinary least privilege — the
API reference states them per endpoint: **`Workers KV Storage Write`**
for writing, deleting and creating namespaces, and
**`Workers KV Storage Read`** for reading and listing
([API reference](https://developers.cloudflare.com/api/resources/kv/subresources/namespaces/subresources/values/methods/update)).

Which one to ask for:

| Doing | Needs |
| --- | --- |
| Deploying a Worker that merely **binds** a namespace | Neither — the binding is a Worker-configuration concern |
| Creating a namespace, or seeding one from CI | `Workers KV Storage Write` |
| A script that reads or lists for reporting or a check | `Workers KV Storage Read` |

The first row is the one people get wrong: attaching a binding does not
read or write the data, so the deploy credential does not need KV data
permissions on account of the binding alone. Add the write permission
when the pipeline actually writes — a seed step, a config publish — and
not before.

**Read is a separate token from write.** A reporting script and a seeding
step are two automations, so they are two credentials, and revoking one
does not stop the other. A single shared token that does everything is
the one nobody dares revoke.

## The scope is the account, so the namespace is the boundary

Grants here are account-scoped, as the provider reference states — a
token with `Workers KV Storage Write` reaches **every namespace in the
account**, not the one it was created for. There is no per-namespace
grant to reach for, so where the blast radius genuinely must be smaller
than the account, the answer is a separate account rather than a
cleverer token.

The practical consequence for this service: **environment separation by
namespace is a correctness boundary, not a security one**. Separate
namespaces prevent a wrong key from landing in production data; they do
not prevent a compromised token from doing it deliberately.

## What is not a secret here, and one thing that is

**A namespace id is not a secret.** It identifies a namespace inside an
account and is meaningless without a credential for that account, which
is why it sits in the committed Wrangler configuration rather than in the
environment. Treating it as a secret adds ceremony and buys nothing.

**A token used by CI is a secret** and gets the ordinary treatment — the
provider's identity reference owns that rule, including where it is
catalogued by name and never by value.

## What the data itself may hold

Values in a namespace are readable by every Worker bound to it and by any
credential with account-wide read. **Personal data in a cache is personal
data**, and per-object expiry is the only retention mechanism this
service offers — nothing sweeps a namespace on the product's behalf. If
the product's retention rule cannot be expressed as a TTL set at write
time, this is the wrong place for that data.
