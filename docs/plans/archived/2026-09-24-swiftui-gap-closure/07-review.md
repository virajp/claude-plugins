# R7 — Review: the checker and the swiftui task scripts

- **Wave:** 2
- **Depends on:** U2, U4
- **Owns:** —
- **Model:** opus
- **Kind:** review

## Scope

Covers U2 (`scripts/src/check.ts`, `check.test.ts` — repo tooling source) and U4
(the `app-framework/swiftui` pack's `config/.config/mise/tasks/**`, which land
in a target repo and run there) — the runnable code this plan lands (F11).
Reviews the branch delta since the branch base. A review finding on a file of a
unit this row does not cover is dropped and counted; a security finding is
routed to that unit all the same, per `/vwf:execute`'s review-unit rule.
