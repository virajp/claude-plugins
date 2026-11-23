# Kotlin — coding standards

Language-level conventions for every `.kt` file in a library. ktlint settles
layout and the mechanical style rules, detekt settles the code-smell rules;
this reference is the judgment neither can make.

## Naming

Follow the Kotlin coding conventions — they are the ecosystem's contract, and a
library that departs from them reads as foreign at every call site.

- `UpperCamelCase` for classes, interfaces and objects; `lowerCamelCase` for
  functions, properties and parameters; `SCREAMING_SNAKE_CASE` for `const val`
  and top-level immutable values that are true constants.
- Packages are lowercase, dot-separated, no underscores, and match the
  directory under `src/main/kotlin/`.
- Functions with side effects are verbs (`close`, `send`); pure transforms
  that return a new value read as one (`sorted`, `toList`).
- Booleans read as assertions: `isEmpty`, `hasNext`, `canRetry`.
- Acronyms of three letters or more are cased as words: `HttpClient`,
  `parseXml`, never `HTTPClient`.
- A factory function that looks like a constructor is named like the type it
  returns (`fun Config(block: ...)`) — the standard library's own idiom.

## Null safety

**The type system already tracks absence — let it.**

- A nullable type (`T?`) means absence is a normal answer. If it is not, the
  type is non-null and the value is checked at the boundary that produces it.
- No `!!` in library code. Each one is a `NullPointerException` shipped to a
  consumer; narrow with `?.`, `?:`, `let` or a smart cast instead, and where a
  value truly cannot be null, make the type say so.
- `lateinit` only for values a framework injects after construction; a
  library constructing its own objects has no reason for it.
- **Platform types** — values from Java APIs with no nullability annotation —
  are assigned to an explicitly typed `val` at the first use, so the
  nullability decision is written down once rather than inferred everywhere.
- Prefer empty collections to nullable ones: `List<T>`, empty when there is
  nothing, over `List<T>?`.

## Idioms

- `val` over `var`; read-only collection interfaces (`List`, `Map`) in
  signatures, mutable ones only inside the implementation.
- **Data classes for values**, sealed interfaces or classes for closed sets of
  alternatives, `enum class` for a fixed list with no per-case data, `object`
  for a true singleton with no state.
- `when` over a sealed type is exhaustive without an `else` — keep it that
  way, so adding a case is a compile error everywhere it matters.
- Expression bodies for one-expression functions; named arguments at a call
  site with several literals of one type.
- Extension functions for operations that read as belonging to a type you do
  not own; never to reach into private state or to dodge a design question.
- Scope functions (`let`, `apply`, `also`, `run`, `with`) where they shorten
  the code — not chained so deep the receiver is ambiguous.
- `require` for argument checks, `check` for state checks — both throw the
  right exception with a message, and read as a contract.

## Explicit API mode is the API

**Everything starts `internal`.** The library compiles with explicit API mode
(`kotlin { explicitApi() }` in the build script) so every public declaration
states its visibility and its return type — nothing becomes public by
omission.

- `public` is a promise: documented with KDoc, covered by a test written from
  outside the module, and changed only through a deprecation.
- Classes are `final` by default; `open` or `abstract` only where extension is
  part of the design — it is a larger promise than `public`.
- `private` by default inside a file or class; `internal` for what the module
  shares across files but a consumer must not see.
- `@PublishedApi internal` only for what a public `inline` function must
  reach; never as a way to export internals.

## Public API design

- **Interfaces at the seam, concrete types everywhere else.** An interface
  with one implementation and no test double is abstraction nobody asked for.
- A `sealed` hierarchy a consumer branches on is **frozen by contract** once
  shipped — adding a subtype breaks their exhaustive `when`. Where cases will
  grow, say so in the KDoc.
- Default parameter values over overload families. Where Java callers matter,
  add `@JvmOverloads` deliberately, not by reflex.
- Data classes in public API carry their `copy` and `componentN` functions as
  API: adding a constructor property is a binary-incompatible change. A value
  type expected to grow is a regular class with explicit `equals`/`hashCode`.
- Every public declaration carries KDoc: a one-line summary, then the
  parameters, the exceptions it throws and anything the caller must know.

## Versioning

**Semver, read from the public surface — source and binary.** A removed or
renamed public symbol, a changed signature, a new abstract member on a public
interface, a new subtype of a public sealed type, a new constructor property on
a public data class, a raised JVM target — each is a major. A new public symbol
is a minor. Before a major, deprecate with
`@Deprecated(message, ReplaceWith(...))` at `WARNING` for at least one minor,
then `ERROR`, so consumers get a quick-fix rather than a break.
