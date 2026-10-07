# fnox — local stack

**There is nothing to compose, and that is the answer rather than a gap.**

The `capability-provider` kind expects one of two shapes here: a real engine
run behind a readiness gate, or — for a hosted-only provider — a seam plus a
fake, with the gap named. fnox is neither. It is a binary that resolves
secrets and execs a command, so it starts no service, listens on no port and
has no state to wait for. Its `pack.yaml` declares `harness: n/a` for exactly
that reason, and a repo pinning fnox composes no extra container.

What fnox contributes to the harness is not a service but a **wrapper**: it
sits outside every harness task on a developer's machine, on the same
boundary the secrets contract mandates for the application.

```sh
fnox exec -- mise run stack:up
fnox exec -- mise run e2e:local
```

The wrapping is one level deep and belongs at the outermost invocation. The
tasks it wraps — including `stack:up` and whatever readiness gate it holds —
are stackgen's local-stack contract's business, and nothing about them changes
because fnox is present.

## Development only

Every value the local stack needs is declared in `fnox.toml` by name, and its
value sits in the developer's keychain or behind a cloud reference. They are
throwaways — a database password nobody outside the machine can reach.

A fresh clone runs as soon as the keychain is populated: the shipped
`if_missing = "warn"` lets a task start with a missing entry reported rather
than refused, so the first hour is `mise install`, `mise run setup:secrets`,
then a `fnox set` per declared name.

## Tests need no manager

A test reads the environment. The harness sets the variables it needs — a
fixture, a compose file, a `.env` the runner loads — and never shells out to
fnox. This is the property the contract's outranking rule buys, and it is the
one to defend: the moment a test invokes the manager, the suite depends on a
developer's keychain and stops running anywhere else.

## CI

CI does not run fnox. The job runs **the same task** the developer runs, with
the forge's own secret variables (GitHub or GitLab) already in its
environment — one definition, two callers, and the CI workflow does not
restate what the task does, per vwf's delivery-pipeline contract.
