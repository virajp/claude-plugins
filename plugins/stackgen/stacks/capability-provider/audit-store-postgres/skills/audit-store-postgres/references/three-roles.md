# Audit store · PostgreSQL — three roles, the constraint that bites

The one property that reshapes how the product is built around this store.
**Every guarantee this pack makes is a grant, and a grant binds an identity —
so the guarantee is only as real as the discipline about which identity each
process connects as.** Nothing in the schema can tell you whether the service
writing events connected as the writer or as the role that ran the migration.
The database will happily enforce rules against a role nobody uses.

That is the trade this store makes. A store with no role system pushes every
access rule into code, where it is visible and reviewable and weak. This one
pushes them into the engine, where they are strong — and moves the whole risk
onto **connection-string discipline**, which is configuration, which is the
layer least likely to be reviewed.

## The three, and what each may do

| Role | Held by | May |
| --- | --- | --- |
| writer | every service that performs a privileged or destructive mutation | `USAGE` on the schema, `INSERT` on the events table — or only `EXECUTE` on the recording function |
| reader | the console project, and nothing else | `SELECT`, under the row-level policies |
| purger | the retention job | the one removal path, and nothing else |

Owning the schema is a fourth thing and it is **not** one of the three: the
objects belong to a migration identity this pack separates out. The datastore
contract asks only that migrations be applied by an explicit step; giving that
step an identity of its own is this pack's addition, and here it is the
enforcement rather than hygiene, because the owner is the identity the
policies do not restrain by default.

## Consequence 1 — one connection identity per role, and it is per service

A role is reached by a connection. So each of the three is a distinct
connection string, or a distinct mapped principal where the host authenticates
by identity, catalogued the way the secrets contract requires every credential
to be catalogued — names in the environment doc, never values.

The failures to design against are all the same failure:

- **A service reusing the migration connection** because it was already in the
  environment. It now holds DDL rights over the table it is supposed to be
  unable to update.
- **The console reusing the application's connection.** It cannot read audit
  at all, which surfaces as a broken history page — the benign version — or it
  is "fixed" by granting `SELECT` to the writer, which is the malign one and
  looks like a one-line unblock.
- **One pooled connection shared by everything**, with the role decided in
  application code. See consequence 2.
- **A managed host's default superuser** used because it was what the setup
  guide printed.

The review question is not "are the grants right" — they will be. It is
**"which role does each process actually connect as, in each environment"**,
and the answer has to come from the deployed configuration rather than from the
migration that created the grants.

## Consequence 2 — pooling and `SET ROLE` interact, and it is a decision

The `datastore/postgres` component already makes connection pooling a design
decision rather than a tuning knob, and audit adds a specific question to it: a
third role means either a third pool or a shared pool that switches role per
transaction.

- **Three pools** is the shape that needs no cleverness. The arithmetic the
  datastore component sets out — instances times pool against the server's
  limit — now has a third term, and the audit pools are small because the audit
  workload is small.
- **A shared pool with `SET LOCAL ROLE`** is the alternative, and the word
  `LOCAL` is the whole of it: the role change lasts for the transaction and is
  undone at its end. A plain `SET ROLE` on a pooled connection leaks the role
  into whatever borrows that connection next, which under a transaction-mode
  pooler is a different request. If this shape is chosen, it is chosen once, in
  the blueprint, with the pooler's mode stated beside it.

Do not mix them. Two mechanisms for "which role am I" is two chances for the
answer to be wrong, and the wrong answer is silent.

## Consequence 3 — the policy needs to know who is reading

The contract's second read tier — the compliance role alone sees events
referencing retained post-deletion data — is a row-level policy naming a role.
That only works if the reading session *is* that role, which means the console's
two reader tiers are two database roles rather than one role plus an
application-level check.

The alternative some products reach for is a single reader role plus a session
setting the policy reads. It works, and it is weaker in a specific way: the
setting is written by the same application the policy is protecting against
mistakes in, so a code path that forgets to set it gets whatever the default is.
If that route is taken, the default must be the restrictive tier, and the
setting must be set with transaction scope for the same reason `SET LOCAL ROLE`
is.

## Consequence 4 — the owner and the superuser are inside the trust boundary

The owner can drop the append-only trigger, change the grants, and — unless the
table forces row-level security — read past every policy. A superuser can do
all of that and more, and bypasses row security by design; so does any role
carrying the `BYPASSRLS` attribute.

No configuration removes this, and it is not a Postgres peculiarity — the D1
realization of this category says the same thing about its account. So state the
control that actually applies: **the owner is the migration identity, held by
the deploy step and by no running process; the superuser is the host's and is
governed by the host's own identity model; and `BYPASSRLS` is reviewed as
deliberately as superuser is.** A product whose threat model includes a hostile
or compromised database administrator has outgrown grant-enforced append-only
entirely and wants tamper-evidence — hash chaining, or write-once storage with
object lock — which [pick & trade](pick-and-trade.md) names as the point where
this pack stops being the answer.

## The review, in six questions

1. Which role does each service connect as, in each deployed environment, read
   from the deployed configuration rather than from the migration?
2. Does any running process connect as the schema's owner or as a superuser?
3. Does the writer role hold `SELECT` on the events table? It should not — a
   seam that reads back what it wrote is the usual reason it was granted.
4. Is `TRUNCATE` revoked, and is there a statement-level trigger for it?
5. Is row-level security enabled, forced against the owner if that was decided,
   and does a policy exist for every role that holds `SELECT`?
6. Who holds `BYPASSRLS`?
