# Audit store · PostgreSQL — local stack

## Why this pack declares `n/a`

**Because the store it rides already runs on a laptop, and this pack composes
no engine.** The `datastore/postgres` component composes Postgres on
production's major version behind a `wait-on` readiness gate, runs migrations
against it as a task, and owns that loop entirely — the pinned major version,
the seed step, the rule that the local schema is produced the same way the
deployed one is. Audit adds a schema, three roles and their grants inside that
same server. A second local stack here would be a duplicate nobody runs.

`n/a` is an answer, not an omission: the harness mechanism is the datastore
pack's, cited and not restated.

## What the local run must add, or the pack is untested

This is the one thing that distinguishes audit's local setup from the datastore
pack's, and skipping it is the default failure.

**The three roles exist locally, and the local application connects as the
writer.** A laptop that runs everything on the migration role — or on the
container's default superuser, which is what the compose file hands you — has a
schema with the right grants written on it and not one of them exercised. Every
assertion below then passes for the wrong reason, and the first environment
where the grants are real is production.

So the migration sequence creates the roles and their grants like any other
schema object, the local connection strings name the writer and the reader
separately, and the seed step does not quietly use the owner because it was
convenient.

## What the acceptance suite must assert

The audit contract's guarantees are behavioural, and on this store most of them
are the engine's — which makes them cheap to prove and unambiguous when they
fail. Six assertions, belonging to the flow's acceptance criteria rather than
to a unit test of the seam:

1. **The event exists after the mutation.** Perform a privileged action through
   the product's own interface — not by calling the seam — and read the event
   back through the console's query path. A test that calls the seam directly
   proves the seam works and proves nothing about whether the endpoint uses it.
2. **The event and the act are one transaction.** Make the mutation fail after
   the append and assert that **no** event remains. This is the guarantee this
   store has and its D1 neighbour does not, so it is the one worth a test of its
   own; the reverse direction — make the append fail, assert the mutation did
   not land — follows from the same transaction.
3. **A refusal survives its rollback.** Trigger a denied privileged attempt and
   assert the event is there after the transaction aborted. This is the
   out-of-band path, and it is the one place the atomicity above works against
   the store — [contract satisfaction](contract-satisfaction.md).
4. **`UPDATE`, `DELETE` and `TRUNCATE` are refused to the writer.** Attempt all
   three, connected as the writer, and expect a privilege error on each. Then
   attempt an `UPDATE` connected as the owner and expect the trigger's
   exception: the two mechanisms fail differently and a test that only proves
   one has proved the weaker half.
5. **The compliance tier is filtered by the policy.** Read the history
   connected as the general reader role and assert an event flagged as
   referencing retained post-deletion data does not appear; read it as the
   compliance role and assert it does. Connect as each role rather than
   simulating them in the application — the policy is the thing under test.
6. **The purge removes only expired rows, and records itself.** Run it against
   a fixture spanning the retention boundary; assert what remains, and assert
   the purge's own event.

## What does not reproduce locally

- **The cost of the purge and the size of the table.** A purge over a laptop's
  hundred rows says the SQL is right and says nothing about what the first real
  run costs, or about vacuum pressure on an instance under load —
  [cost shape](cost-shape.md).
- **Partition pruning at scale.** With one partition, every plan prunes
  perfectly. The unbounded-query trap only appears once several years' worth
  exist, so it is checked with `EXPLAIN` against production-shaped data rather
  than caught by the local suite — [access shape](access-shape.md).
- **Connection-string discipline across environments.** Locally there is one
  configuration and it is the one under test; the failure this store is most
  exposed to is a *deployed* service pointed at the wrong role, and reviewing
  that is a deployed-environment concern — [three roles](three-roles.md).
- **The superuser boundary.** The local container hands out superuser freely,
  which is fine and is also why the local suite can say nothing about who holds
  it in production.

## Local persistence is a hazard here specifically

The datastore pack's local database persists across runs, which for an
append-only store means yesterday's events are still present today. A history
assertion that counts rows, or that expects the newest event first, passes or
fails on leftovers. Reset between runs rather than between assertions, and
prefer assertions that identify their event by id over assertions that count.
