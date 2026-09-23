# R2 — Review: the language/swift task scripts

- **Wave:** 2
- **Depends on:** U1
- **Owns:** —
- **Model:** opus
- **Kind:** review

## Scope

Covers U1 — the `language/swift` `code/format` and `code/lint` task scripts,
which land in a target repo and execute there, run by developers and by the
pre-commit hook with attacker-controllable file names in a cloned repo (F5).
Reviews the branch delta since the branch base: U1's commit. Hold the fix to F2
and F3, and check that nothing the previous plan's R4 settled regressed — the
`./` prefix, NUL-safe lists, `core.quotePath=off`, the Swift-scope exclusions,
`--fix` then `lint --strict`. A review finding on a file of a unit this row does
not cover is dropped and counted; a security finding is routed to that unit all
the same, per `/vwf:execute`'s review-unit rule.
