# Kotlin — observability wiring

A library emits; it never decides where emissions go. The JVM ecosystem makes
this a clean split: **API artifacts** a library depends on, and **backends**
only the application puts on the classpath.

## Depend on the API, never the backend

- Logging goes through the SLF4J API (`org.slf4j:slf4j-api`), metrics through
  Micrometer's core API or the OpenTelemetry API, traces through the
  OpenTelemetry API. A library emitting through them works with whatever
  backend the application installed.
- A library never depends on a logging backend (Logback, Log4j 2 core,
  `slf4j-simple`) outside its test scope, and never configures one — no
  `logback.xml` in `src/main/resources/`. Two backends on a consumer's
  classpath is the consumer's problem the library created.
- A library never registers a global `MeterRegistry` or a global
  OpenTelemetry instance; it accepts one, or uses the API's no-op default when
  none is given.

## Accept the instrument, do not construct a global one

Take the `MeterRegistry` or `OpenTelemetry` instance in the configuration
value, defaulting to the no-op. A logger is looked up per class
(`LoggerFactory.getLogger(Client::class.java)`) — that is the SLF4J idiom, and
the application controls it through its backend's configuration.

## What to emit

- **Log at boundaries and on decisions**, not on every call. Debug and trace
  for detail an operator enables on purpose; info for state changes worth
  knowing; warn and error only for what someone should act on.
- **Parameters, not string building.** `logger.debug("loaded {} items", n)`,
  or a guarded lambda — so an expensive message is not built unless the level
  is enabled. Never pre-compute a message outside the log call.
- **Never emit a secret or personal data** — the same rule as exceptions, see
  [config & env](config-and-env.md).
- Metrics are counters and timers for the library's own operations, named
  under the library's prefix so they do not collide with the application's.
- A span per operation a caller would recognise. Across coroutines, the
  context travels with the coroutine context
  (`opentelemetry-extension-kotlin`'s `asContextElement()`), never by hand.

## MDC and coroutines

SLF4J's MDC is thread-local, and a coroutine can resume on another thread.
Where a library reads or sets MDC inside coroutines, it carries it with
`kotlinx-coroutines-slf4j`'s `MDCContext()`, or it does not use MDC at all.
