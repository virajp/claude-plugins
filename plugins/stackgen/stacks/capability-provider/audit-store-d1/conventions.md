# Audit store · Cloudflare D1 — conventions

The audit store is **its own D1 database**, written through one seam and read
by one Worker. It is not a table in the product's database, and the difference
is the whole pack: on D1 the access boundary is which Worker declares which
binding, so a table living beside the product's data is reachable by every code
path that already reaches that data, and no grant exists to say otherwise.

**A dedicated database for audit, never a table in the product database.**
This is the one rule that cannot be recovered later. D1 has no per-table,
per-row or read-only grant inside a binding — a Worker holding the binding can
do anything to that database — so *which database* is the only isolation the
platform offers. Put the events in the product's database and the isolation is
a code review promise; put them in their own and it is the platform's.

**The console Worker is the only holder of the read binding.** The console — the
project that carries operator RBAC — is where audit is read, and its binding is
what makes the read surface a surface at all. A service that wants to see an
event calls the console, per the datastore contract's access rule. It does not
add a second binding.

**One writer seam, and every privileged mutation passes through it.** Making a
privileged mutation impossible without an event is vwf's `audit-log` product
foundation's rule, not the audit contract's; here it lands as a single
function that records the event **before** the mutation runs — two databases
means no shared transaction, so the ordering is the guarantee. Audit is not a
per-endpoint courtesy call: an endpoint that can mutate without going through
the seam is a hole, and the review question is always "what else can reach
this table".

**Recording first over-reports, and the over-report is monitored.** A crash
between the event and its mutation leaves an event with no terminal outcome,
which is findable and is reconciled by a second event, never by an edit. That
residual is the price of the isolation above; a scheduled reconciliation that
counts it is what keeps it an admitted weakness rather than an unexamined one.

**Append-only is enforced at the schema and guaranteed at the seam.** Triggers
that abort `UPDATE` and `DELETE` on the events table are the schema-level
statement of intent, and they hold against every writer including a console
query. But a trigger can be dropped by anything holding `D1:Edit`, so the
guarantee that actually holds is the seam: one function that only inserts, in a
database no other Worker binds. Write both; rely on the second.

**Retention purge is the one delete path, and it is itself recorded.** Removal
happens on expiry, against a retained category with a legal basis, executed as
a purge by the compliance role — and the purge writes its own event once the
run has completed, naming the window it applied and the count it removed. A
deletion nothing recorded is indistinguishable from a store that was never
append-only.

**Events reference ids and never copy personal data.** Actor id, target entity
and id, a stable action verb, the trace id. The moment an event body carries a
name or an email, the audit database inherits every deletion obligation the
product has, in a store whose entire design is that nothing is deleted from it.

**Time is the store's, not the caller's.** The timestamp is written by the
statement, never taken from a client clock — the datastore contract requires it
and an audit record is where a wrong clock is least recoverable.

**Rows read is the meter, so the read surface is indexed before it is built.**
D1 bills rows scanned, not rows returned, and an audit table only grows. The
filters the operator history actually uses — actor, target, time window — are
indexed with the first migration, not after the first bill.

Full judgment: the `audit-store-d1` skill's references. The contract it cites is
stackgen's audit contract; the store-wide half — the binding model, the size
ceiling, migrations, Time Travel and the cost meter — is the `cloud-service/d1`
component's, in this composition's template.
