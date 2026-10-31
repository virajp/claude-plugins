# Kotlin — error handling

Kotlin has no checked exceptions, so nothing in a signature forces a caller to
notice a failure. The discipline is choosing **which** failures a caller is
told about, in what shape, and writing that choice down.

## Three kinds of failure, three mechanisms

- **Absence that is normal** — a lookup that finds nothing — is a nullable
  return. It is not an error, and throwing for it forces a `try` on every
  caller.
- **Failure the caller must handle** — bad input, an unreachable resource, a
  rejected operation — is either a thrown exception from the library's own
  hierarchy, or a sealed result type the caller must `when` over. Pick one per
  API and keep it.
- **Programmer error** — a broken invariant, an argument outside its
  contract — is `require` (`IllegalArgumentException`), `check`
  (`IllegalStateException`) or `error(...)`. These are for the caller's bug,
  not for input a user can send.

## Exceptions are part of the public API

**A public exception type is a contract**, versioned like any other public
symbol.

- One base exception per library, with subclasses a caller can catch
  separately. A subclass nobody distinguishes belongs merged into another.
- Properties carry the identifiers needed to investigate — the key, the path,
  the upstream status. The message is for a person; the properties are for the
  code that catches it.
- Document what each public function throws with `@throws` in its KDoc. Where
  Java callers matter, add `@Throws` so the JVM signature declares it.

## Sealed results where failure is an expected outcome

Where a failure is an ordinary, frequent outcome the caller always branches on
— a parse that may not match, a validation — return a sealed type:

```kotlin
public sealed interface ParseResult {
    public data class Parsed(val value: Document) : ParseResult
    public data class Invalid(val line: Int, val reason: String) : ParseResult
}
```

The caller's `when` is exhaustive, so a new case is a compile error at every
call site — which also makes adding one a major release.

`kotlin.Result` is for storage and transport — collecting a batch's outcomes,
crossing a callback — not a return type for ordinary public API; it erases the
error type to `Throwable`.

## One mapping home

A library throws its own exceptions and lets the application decide what the
outside world sees. It does not catch an underlying exception only to log it
and throw something vaguer. Where it wraps a dependency's exception, it passes
it as the `cause`, so the chain survives.

## Never swallow

- An empty `catch` is always a defect.
- `runCatching` catches every `Throwable` — including `CancellationException`
  and `Error`s. Do not use it around suspending code or as a general
  try/catch; catch the specific exception types the code can actually throw.
- Catch `Exception`, never `Throwable`, at a boundary that must not fail; an
  `OutOfMemoryError` is not the library's to handle.

## Cancellation is not a failure to report

Inside coroutines, `CancellationException` means the caller stopped waiting.
Rethrow it; never wrap it, log it as an error or convert it into a domain
failure. See [the async model](async-model.md).
