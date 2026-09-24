# R4 — Review: the swiftui task scripts

- **Wave:** 2
- **Depends on:** U1
- **Owns:** —
- **Model:** opus
- **Kind:** review

## Scope

Covers U1 — the `app-framework/swiftui` pack, whose
`config/.config/mise/tasks/**` scripts land in a target repo and execute there
(E15). Reviews the branch delta since the branch base: wave 1's single commit
(E14). A review finding on a file of a unit this row does not cover is dropped
and counted; a security finding is routed to that unit all the same, per
`/vwf:execute`'s review-unit rule.
