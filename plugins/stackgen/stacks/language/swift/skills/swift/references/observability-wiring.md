# Swift — observability wiring

A library emits; it never decides where emissions go. The Swift ecosystem makes
this a clean split: **API packages** that a library depends on, and **backend**
packages that only the application bootstraps.

## Depend on the API, never the backend

- Logging goes through swift-log's `Logger`, metrics through swift-metrics,
  and traces through swift-distributed-tracing. These are the ecosystem's
  shared APIs: a library emitting through them works with whatever backend
  the application installed.
- A library never calls a bootstrap function (`LoggingSystem.bootstrap` and
  its siblings) and never depends on a backend package. Bootstrapping is
  process-wide and one-time; a library doing it overrides the application's
  choice.
- On Apple platforms an app may use `os.Logger`; a portable package does not
  depend on it, because the package cannot know its host is an Apple app.

## Accept a logger, do not construct a global one

Take a `Logger` in the configuration value or the initialiser, with a sensible
label as the default. That lets the application attach metadata — a request
id, a tenant — that flows through every line the package emits. A package-wide
static logger cannot carry the caller's context.

## What to emit

- **Log at boundaries and on decisions**, not on every call. Debug and trace
  levels for detail an operator enables on purpose; info for state changes
  worth knowing; warning and error only for what someone should act on.
- **Metadata, not interpolation.** Put identifiers in the logger's metadata
  rather than in the message string, so they are queryable and the message
  stays constant.
- **Never emit a secret or personal data** — the same rule as errors, see
  [config & env](config-and-env.md).
- Metrics are counters and timers for the package's own operations, named
  under the package's label so they do not collide with the application's.
- A span per operation a caller would recognise, carrying the caller's
  context through `async` calls — the tracing API does that through task-local
  values, so do not thread it by hand.

## Cost

Emission must be close to free when disabled. Log messages are autoclosures in
swift-log, so an expensive message is not built unless the level is enabled —
keep it that way by never pre-computing a message outside the log call.
