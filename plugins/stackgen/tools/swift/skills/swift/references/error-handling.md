# Swift — error handling

Swift makes failure visible in the signature — a `throws` function cannot be
called without `try` — so the discipline is less about noticing failure than
about choosing *which* failures a caller is told about, and in what shape.

## Three kinds of failure, three mechanisms

- **Absence that is normal** — a lookup that finds nothing — is an optional.
  It is not an error, and throwing for it forces `try?` noise on every caller.
- **Failure the caller must handle** — bad input, an unreachable resource, a
  rejected operation — is a thrown error.
- **Programmer error** — a broken invariant, an impossible state — is a
  `precondition` or `fatalError`. It is never used for input the caller
  controls: a library that traps on a bad argument crashes someone else's app
  for a mistake that could have been a thrown error.

`assert` is debug-only and vanishes in release builds; it documents an
assumption, it does not enforce one.

## Error types are part of the public API

**A public error type is a contract**, versioned like any other public symbol.

- One error enum per domain, with cases a caller can branch on. A case nobody
  distinguishes belongs merged into another.
- Associated values carry the identifiers needed to investigate — the key, the
  path, the upstream status — never a pre-built sentence. Conform to
  `LocalizedError` or `CustomStringConvertible` only where a human message is
  genuinely the library's to write.
- Adding a case to a public error enum a consumer switches over is a breaking
  change — the same rule as any frozen enum.

## Typed throws

Swift 6's `throws(SomeError)` states the exact error type in the signature.
Use it where the error set is **closed and stable** — an internal module, or a
public function whose failure modes are genuinely fixed. For public API that
may learn a new failure mode, untyped `throws` keeps that change non-breaking;
typed throws turns it into a major.

## `Result` is for storage, not control flow

`Result` is the right shape when a failure must be **stored or passed** — a
completion callback in legacy API, a collected batch outcome. For ordinary
control flow, `throws` plus `try` is the idiom; returning `Result` from a
synchronous or `async` function only moves the `try` to every caller.

## One mapping home

A library throws its own domain errors and lets the application decide what the
outside world sees. It does not catch an underlying error only to log it and
rethrow something vaguer. Where it wraps a dependency's error, the wrapper keeps
the original as an associated value, so the cause survives.

## Never swallow

`try?` discards the error. It is correct only where the error genuinely carries
no information the caller needs — and that decision is stated in a comment. An
empty `catch` is always a defect. `try!` is for tests and for literals whose
validity is provable at the call site, nothing else.

## Cancellation is not a failure to report

Inside `async` code, `CancellationError` means the caller stopped waiting.
Propagate it; never convert it into a domain error or a logged failure. See
[the async model](async-model.md).
