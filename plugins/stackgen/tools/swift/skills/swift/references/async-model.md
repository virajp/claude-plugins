# Swift — the async model

Swift's concurrency model is structured tasks, actors and `Sendable`, and in the
Swift 6 language mode the compiler enforces it: a data race is a compile error.
The judgment is in shaping code so the checker has something true to verify,
not in quieting it.

## Strict concurrency is on, and stays on

The package builds in the Swift 6 language mode. A diagnostic from the checker
is a real race or a real missing guarantee — fix the design, do not reach for
an escape hatch.

- `@unchecked Sendable` is a claim the compiler cannot verify. It is allowed
  only on a type whose synchronisation is internal and reviewed (a lock-guarded
  box), with a comment saying what makes it safe.
- `nonisolated(unsafe)` is the same claim for one variable; the same bar
  applies.
- `@preconcurrency import` is a migration tool for a dependency that has not
  adopted `Sendable` yet — temporary, and tracked.

## Choosing isolation

- **Values cross boundaries; references are guarded.** Public value types are
  `Sendable` by construction. A class holding mutable state is an actor, or is
  isolated to one actor, or is immutable.
- **An actor owns state, not work.** Use one when several callers must share
  mutable state; not as a namespace for async functions. Actor reentrancy
  means state can change across every `await` inside it — re-check invariants
  after each suspension point.
- **Main-actor isolation is a UI decision.** A package with no UI does not mark
  its API `@MainActor`; it lets the caller choose where to run.
- A library does not create global actors unless isolation to that domain is
  the product.

## Structured over unstructured

- `async let` and task groups for concurrent child work: the parent waits,
  errors propagate, cancellation flows down. This is the default.
- `Task { }` is unstructured — it outlives its scope unless someone holds and
  cancels it. In library code it needs an owner that stores the handle.
  `Task.detached` additionally drops the caller's isolation and priority; it
  is almost never what a library wants.
- Do not start work in an initialiser that the caller cannot await or cancel.

## Cancellation is cooperative

Cancellation is a flag, not an interruption. Long-running work checks it —
`try Task.checkCancellation()` at loop boundaries, or `Task.isCancelled` where
a partial result is meaningful — and stops promptly. A cancelled operation
throws `CancellationError` or returns its partial result; it never keeps
going silently.

## Never block

- Never wait on async work from synchronous code with a semaphore or a
  dispatch group; under the cooperative pool that deadlocks or starves it.
- Blocking I/O or CPU-heavy work that cannot be made async runs off the
  cooperative pool, behind an `async` API that hides where it runs.
- Bridge callback-based API with `withCheckedThrowingContinuation`, resuming
  **exactly once** on every path.

## Public async API

- An `async` function is the default shape for a single result;
  `AsyncSequence` for a stream. Expose `AsyncStream` construction internally,
  not as the public type, so the implementation can change.
- Closures stored or called across isolation are `@Sendable` (or `sending`),
  and the signature says so.
