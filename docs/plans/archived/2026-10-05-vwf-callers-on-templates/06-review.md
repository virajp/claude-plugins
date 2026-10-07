# R — Review: the checker's values rule

- **Wave:** 3
- **Depends on:** U1
- **Owns:** —
- **Model:** opus
- **Kind:** review

## Scope

Covers U1: `scripts/src/check.ts` and its tests. Reviews the branch delta since
the branch base, the first review row — the wave-2 prose units fall in the
range; a review finding on their files is dropped and counted, a security
finding is routed to the unit that last touched the file. The reason is F12:
runnable code lands.
