# Audit store · D1 — local stack

## Why this pack declares `n/a`

**Because the store it rides already runs on a laptop, and composing a second
one would be a stack nobody runs.** `wrangler dev` starts in local mode and
hands the Worker a local database behind the same binding name it has in
production; the `cloud-service/d1` component declares that mechanism and owns
the loop — creating the local database, applying migrations, seeding, and the
`--remote` trap that is the real hazard there.

This pack composes no engine. What it adds locally is a **second** local
database, because the audit store is a second binding, and the whole design
depends on it being separate:

- The audit database gets its own entry in the Worker configuration, its own
  `database_id` per environment, and its own migrations directory.
- Locally that means two local databases, migrated by two apply steps. A setup
  that migrates only the product database leaves the audit table missing, and
  the failure surfaces as a write error inside a mutation's batch — which,
  correctly, fails the mutation.

`n/a` here is an answer, not an omission: the harness mechanism is the datastore
pack's, cited and not restated.

## What the acceptance suite must assert

The audit contract's guarantees are behavioural, so they are provable locally
and cheap to prove. Four assertions, and they belong to the flow's acceptance
criteria rather than to a unit test of the seam:

1. **The event exists after the mutation.** Perform a privileged action through
   the product's own interface — not by calling the seam — and read the event
   back through the console's query path. Exercising the write path is the whole
   point: a test that calls the seam directly proves the seam works and proves
   nothing about whether the endpoint uses it.
2. **The mutation cannot happen without the event.** Make the append fail and
   assert the mutation did not land. There is no shared transaction across two
   databases, so what is being tested is the ordering
   [contract satisfaction](contract-satisfaction.md) prescribes: the append runs
   first and its failure aborts the handler before the mutation is attempted.
   Test the other direction too — make the mutation fail after a successful
   append, and assert the reconciliation finds an event with no terminal
   outcome.
3. **`UPDATE` and `DELETE` are refused.** Attempt both against the events table
   directly and expect the abort. This is the test that settles the trigger
   question the documentation does not, and it settles it for the version of D1
   the product actually runs.
4. **The compliance tier is filtered.** Read the history as a general operator
   and assert that an event flagged as referencing retained post-deletion data
   does not appear; read it as the compliance role and assert it does. This is
   the clause the platform does not enforce, so it is the clause a test has to.

## What does not reproduce locally

- **Replica lag.** A local database answers every read from the state the last
  write left, so the "operator writes and then does not see the event" failure
  cannot appear until a deployed environment. Whether the read path needs the
  session bookmark is a design decision, not something the local suite catches —
  [access shape](access-shape.md).
- **The size ceiling and the purge's cost.** Nothing local approaches either. A
  purge over a laptop's hundred rows says the SQL is right and says nothing
  about what the first real run costs — [cost shape](cost-shape.md).
- **Account-level access.** The `D1:Edit` boundary that makes the store's
  append-only guarantee an operational one has no local equivalent, because
  locally there is no account. Reviewing it is a deployed-environment concern —
  [no roles](no-roles.md).

## Local persistence is a hazard here specifically

Local D1 state persists across runs, which for an append-only store means events
from yesterday's run are still present today. A history assertion that counts
rows, or that expects the newest event first, passes or fails on leftovers.
Reset between runs rather than between assertions, and prefer assertions that
identify their event by id over assertions that count.
