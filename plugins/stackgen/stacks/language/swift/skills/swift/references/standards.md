# Swift — coding standards

Language-level conventions for every `.swift` file in a package. The formatter
settles layout and the linter settles the mechanical rules; this reference is
the judgment neither can make.

## Naming

Follow the Swift API Design Guidelines — they are the ecosystem's contract, and
a package that departs from them reads as foreign at every call site.

- `UpperCamelCase` for types and protocols; `lowerCamelCase` for everything
  else, including enum cases.
- Name for clarity at the **call site**, not the declaration: argument labels
  make a call read as a phrase, and a label that repeats the type adds noise.
- Protocols describing what something *is* are nouns (`Collection`); protocols
  describing a capability end in `-able`, `-ible` or `-ing` (`Sendable`).
- Mutating/non-mutating pairs are named as a pair (`sort()` / `sorted()`).
- Booleans read as assertions: `isEmpty`, `hasPrefix`, `canRetry`.
- Acronyms are uniformly cased: `url`, `httpStatus`, `URLSession`.

## Module layout

**One target per concern, and a target is a module.** Split when a piece has
its own consumers or its own reason to change — never to mirror a folder tree.

- `Sources/<Target>/` and `Tests/<Target>Tests/`, the layout SwiftPM expects;
  a target that fights the default layout needs a reason in the manifest.
- Inside a target, group files by feature, not by kind — a `Models/`,
  `Helpers/`, `Extensions/` split scatters one change across three folders.
- One primary type per file, named for the type. An extension adding a
  conformance may live beside the type or in `Type+Protocol.swift`.
- An internal-only target that several public targets share is the place for
  shared implementation; it is never a product.

## Access control is the API

**Everything starts `internal`.** A declaration becomes `public` when a
consumer needs it, not because it might.

- `public` is a promise: it is documented, it is covered by a test written
  against the public import, and changing it is a versioned event.
- `open` only where subclassing or overriding is part of the design — it is a
  larger promise than `public`, and one that constrains every later change.
- `private` by default inside a type; `fileprivate` only when two types in one
  file genuinely share an implementation detail.
- `package` access (Swift 5.9+) for what sibling targets in the same package
  share but consumers must not see — never `public` plus a "do not use"
  comment.
- `@_spi` and underscored public names are not an access level; do not use
  them to smuggle internals out.

## Public API design

- **Value types by default.** A `struct` or `enum` unless identity or shared
  mutable state is the point; a class needs a reason.
- **Protocols at the seam, concrete types everywhere else.** A protocol with a
  single conformer and no test double is abstraction nobody asked for.
- **Prefer `some` over `any`** in parameters and results; existentials cost
  performance and type information, and are for heterogeneous storage.
- Enums a consumer switches over are **frozen by contract** once shipped —
  adding a case is a breaking change for them. Where cases will grow, say so,
  or model the value as a struct with static members instead.
- Default arguments over overload families; one entry point with defaults is
  one thing to document and version.
- Every public declaration carries a DocC comment: a one-line summary, then
  parameters, the thrown error and anything the caller must know. An
  undocumented public symbol is unfinished.

## Platform availability

- The manifest's `platforms:` is the floor for the whole package; raise it
  deliberately, as a breaking change.
- Newer API behind that floor is gated with `@available` on the declaration
  and `if #available` at the use — never a runtime string check.
- Code that only makes sense on one platform sits behind `#if os(...)` or
  `#if canImport(...)` at the smallest scope that compiles, and the package
  says in its docs which platforms it supports.

## Versioning

**Semver, read from the public surface.** A removed or renamed public symbol,
a changed signature, a new requirement on a public protocol, a new case on a
switched-over enum, a raised platform floor — each is a major. A new public
symbol is a minor. Before a major, deprecate with
`@available(*, deprecated, renamed:)` for at least one minor so consumers get
a fix-it rather than a break.

## Type discipline

- No force unwraps and no `try!` outside tests and provably-safe literals; an
  `!` in library code is a crash shipped to someone else's app.
- No implicitly unwrapped optionals in new API.
- Make invalid states unrepresentable: an enum with associated values over a
  struct of optionals that must be set in combination.
