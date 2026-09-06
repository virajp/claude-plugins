# Analytics Engine — local dev

**The binding is local-simulation only: there is no per-binding remote
mode.** The provider's local development map owns the general shape — the
`cloudflare` skill — and its row for this service says the same, sourced
from Cloudflare's [per-binding table][bpe]. That is a statement about the
binding, not about the laptop; the distinction is the next section.

## What runs locally

The Worker runs, the binding exists, and `writeDataPoint` succeeds. The
data point lands in the local simulation and **never reaches the
account's dataset** — and, since the binding has no remote mode, no
`"remote": true` on the binding will change that. Local execution against
this dataset is local, always.

Nothing changes in the code between local and deployed. The same call
runs; only its destination differs, and the calling code cannot tell.

## `wrangler dev --remote`, and why it is not the general answer

The two modes answer different questions, and conflating them is the
mistake worth naming. A **remote binding** keeps execution local and
points one binding at the real resource — Analytics Engine has no such
mode. **Remote development** is the other axis: `wrangler dev --remote`
uploads and executes the Worker on Cloudflare's own infrastructure, with
every binding connected to remote resources ([bindings per env][bpe]).
Analytics Engine is supported there, so a run started from a laptop *can*
write to the account's dataset — by moving the Worker, not the binding.

It moves every other binding too, and the whole edit-run loop onto the
network; Cloudflare's own guidance prefers local execution with
per-binding remote connections for that reason ([bindings per env][bpe]).
Reach for it to answer a question about this dataset specifically — does
the write land, does the query return it — never as the shape of the
project's development loop. And point it at the development dataset
first: a remote run writes real data points to whatever the binding
names, and they are billed and retained like any other.

## The `local_stack` answer is `n/a`, honestly

There is no engine to compose behind a readiness gate. Nothing needs to
be started, seeded or waited for, and the local task is unchanged by this
component being pinned — which is what makes the pin cheap.

## Testing the write without a dataset to read

Since a local write is unobservable, **assert at the seam that calls the
binding, not against a store**. The product's code should have one place
where a domain event becomes a data point — the function that decides the
index, orders the blobs and computes the doubles. Test that function's
output directly, and let the binding be a fake in the test.

That is worth doing for its own sake, because the positional schema in
[service doctrine](service-doctrine.md) is exactly the kind of contract
that drifts silently. A test naming what belongs in `blob2` is the only
thing standing between a reordered argument list and a year of quietly
wrong queries.

## Querying a real dataset needs a deployed environment

The SQL API reads the account's datasets, so the first place a query can
be exercised against real rows is a **deployed development or staging
environment writing to its own dataset** — or a `--remote` run against
that same dataset, which is the shorter loop for exactly this question.
Name the dataset for the environment and point its binding at it; there
is no other isolation.

Two smaller notes for that environment:

- **Writes are not immediate to a reader.** A query issued straight after
  a write may return nothing; widen the window before concluding the
  write failed.
- **`SHOW TABLES` is the fastest check.** A dataset is created on first
  write, so a missing name in that list means the write never happened
  and a surprising extra name means it went somewhere misspelled
  ([SQL API](https://developers.cloudflare.com/analytics/analytics-engine/sql-api/)).

## The fidelity trap: a small dataset never samples

Sampling applies only to index values receiving **high event rates**;
low-traffic values stay unsampled
([sampling](https://developers.cloudflare.com/analytics/analytics-engine/sampling/)).
A development dataset has no high-rate index values, so every
`_sample_interval` is 1 and nothing is sampled.

The consequence is the trap, and it runs the opposite way from the usual
"local is less accurate" instinct: **an unweighted query is exactly right
in development and wrong in production.** A plain `count()` matches the
weighted `SUM(_sample_interval)` perfectly on a quiet dataset, passes
review, ships, and starts under-reporting the moment real volume makes
Cloudflare sample the busiest tenants — by a factor that varies per row
and cannot be corrected afterwards.

So the weighting is not something a development environment will ever
demand. It is a rule enforced by reading the query, and it is the reason
[service doctrine](service-doctrine.md) states it as a rule rather than
as advice.

## What local therefore cannot tell you

- **Whether the dataset name is right**, since the local simulation
  accepts any name and the misspelling only shows up as an empty
  dashboard — or a surprise row in `SHOW TABLES` — against a real
  dataset. A `--remote` run answers this one.
- **Whether the query is correct at volume**, per the trap above.
- **What sampling will do to a given index choice**, which is a function
  of real traffic and cannot be produced on a laptop or by a remote run
  of one Worker.

The first is a question a `--remote` run settles in a minute; the other
two are deployed-environment findings, which is why a development
environment with its own dataset is worth having before the first
dashboard is written.

[bpe]: https://developers.cloudflare.com/workers/local-development/bindings-per-env/
