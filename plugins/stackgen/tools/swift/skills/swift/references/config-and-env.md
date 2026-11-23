# Swift — config & env

**A library reads no environment.** Configuration belongs to the application
that embeds the package; the package states what it needs and the caller
supplies it. This is the whole rule, and most of what follows is how to keep it.

## Configuration is a value

- Accept configuration as a `Sendable` struct passed to an initialiser, with
  defaults for everything that has a sensible one. One configuration type per
  entry point, not a scatter of parameters.
- Validate it once, at construction, and throw a descriptive error for an
  invalid combination — never fail later, deep in a call, on a value the
  caller set at start-up.
- Never read `ProcessInfo.processInfo.environment`, a plist, `UserDefaults`
  or a file at a fixed path from library code. Each makes the package's
  behaviour depend on a machine it cannot see, and makes it untestable
  without mutating global state.

## Names, not values

Where the application does read environment variables to build that
configuration, the names are catalogued in the product's environment
document, and the values never appear in the repo. A package's own docs may
list the settings it accepts; they never ship a secret, a real endpoint or a
credential as a default.

## Secrets

A credential reaches the package as a value — a token, a key — or as a
provider closure the package calls when it needs one. The package never logs
it, never includes it in an error's description, and never persists it.

## Build-time configuration

- Compile-time switches are `#if` conditions on the platform or on a
  capability (`canImport`), not on a custom flag a consumer must remember to
  set.
- A package trait or a custom `-D` define that changes the public API is a
  configuration a consumer has to know about — document it, or avoid it.
- Debug-only behaviour is `#if DEBUG`, and it never changes what the public
  API returns.

## Tests

Because configuration is a value, a test constructs exactly the configuration
it needs. A test that sets an environment variable to steer the code under
test is a sign the rule above was broken.
