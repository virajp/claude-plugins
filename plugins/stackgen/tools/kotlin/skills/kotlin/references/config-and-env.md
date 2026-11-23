# Kotlin — config & env

**A library reads no environment.** Configuration belongs to the application
that embeds the library; the library states what it needs and the caller
supplies it. This is the whole rule, and most of what follows is how to keep it.

## Configuration is a value

- Accept configuration as an immutable class passed to a constructor or
  factory, with defaults for everything that has a sensible one. A builder
  lambda (`Client { timeout = 5.seconds }`) is the idiomatic Kotlin shape for
  a configuration with many optional settings.
- Validate it once, at construction, with `require` and a message naming the
  setting — never fail later, deep in a call, on a value the caller set at
  start-up.
- Never read `System.getenv`, `System.getProperty`, a properties file at a
  fixed path or a classpath resource the consumer must supply. Each makes the
  library's behaviour depend on a machine it cannot see, and makes it
  untestable without mutating global state.
- Durations are `kotlin.time.Duration`, never a `Long` of unstated units.

## Names, not values

Where the application does read environment variables to build that
configuration, the names are catalogued in the product's environment document,
and the values never appear in the repo. A library's docs may list the
settings it accepts; they never ship a secret, a real endpoint or a credential
as a default.

## Secrets

A credential reaches the library as a value — a token, a key — or as a
provider function the library calls when it needs one. The library never logs
it, never includes it in an exception message or a `toString()`, and never
persists it. A class holding one overrides `toString()` to redact it; a data
class holding one is a defect, since its generated `toString()` prints every
property.

## Build-time configuration

- `gradle.properties` holds build settings — the configuration cache, JVM
  arguments for the daemon — never a secret. Publishing credentials come from
  the environment of the job that publishes, read by the build, not committed.
- `local.properties` is per-machine and never committed.

## Tests

Because configuration is a value, a test constructs exactly the configuration
it needs. A test that sets a system property or an environment variable to
steer the code under test is a sign the rule above was broken.
