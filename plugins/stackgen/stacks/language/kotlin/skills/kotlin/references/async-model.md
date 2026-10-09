# Kotlin — the async model

Asynchrony in Kotlin is **kotlinx.coroutines**: `suspend` functions for one
result, `Flow` for a stream, structured concurrency to bound both. A library
that exposes async work exposes it in these terms, not as callbacks or
futures.

## Suspend for one value, Flow for many

- A function that waits for one result is `suspend fun load(): Data`.
- A stream of values is a cold `Flow<T>`, returned from a regular
  (non-suspending) function — collecting it is what starts the work.
- State that changes over time and has a current value is a `StateFlow`;
  events broadcast to whoever is listening are a `SharedFlow`. Expose them as
  the read-only types; keep the `MutableStateFlow`/`MutableSharedFlow`
  private.
- Do not return `Deferred` or a `Job` from public API for a single result —
  that hands the caller a lifecycle to manage. Suspend instead.

## Structured concurrency

**Every coroutine has a parent scope, and the scope outlives it.**

- A suspend function that runs work in parallel uses `coroutineScope { }` and
  `async`/`launch` inside it, so it returns only when every child has
  finished, and a child's failure cancels its siblings.
- Never use `GlobalScope`. A library that must run background work owns a
  `CoroutineScope` tied to an object with a `close()` — and cancels it there.
- `supervisorScope` only where children's failures are genuinely independent.

## Main-safety and dispatchers

- **A suspend function is main-safe**: it never blocks its caller's thread.
  Blocking I/O or CPU-heavy work inside it is wrapped in
  `withContext(dispatcher)`.
- Inject the dispatcher (a constructor parameter defaulting to
  `Dispatchers.IO` or `Dispatchers.Default`) rather than hard-coding it, so a
  test can substitute a test dispatcher.
- `runBlocking` never appears in library code — it is for `main` functions
  and the occasional test bridge.

## Cancellation

- Cancellation is cooperative. A long loop checks `ensureActive()` or calls a
  suspending function regularly.
- `CancellationException` is rethrown, never caught by a broad `catch` and
  never reported as a failure — see [error handling](error-handling.md).
- Resources are released in `finally` or with `use { }`; cleanup that must
  itself suspend runs in `withContext(NonCancellable)`.

## Flows

- Operators (`map`, `filter`, `flatMapLatest`) over hand-written collection
  loops; `flowOn` to move upstream work off the caller's dispatcher, never a
  `withContext` inside `flow { }`.
- A `flow { }` builder emits from its own coroutine only; concurrent emission
  needs `channelFlow`.
- Exceptions in a flow are handled with `catch` upstream of where they matter;
  `catch` does not see what happens downstream of it.

## Java interop

Where Java consumers matter, a coroutine API gets a deliberate blocking or
`CompletableFuture` adapter in a separate module or a `-jvm` facade — not
`@JvmBlocking` annotations scattered through the core API.
