# R8 — Review: the Swift packs' shipped task scripts

- **Wave:** 2
- **Depends on:** U1, U2
- **Owns:** —
- **Model:** opus
- **Kind:** review

## Scope

Covers U1 and U2 — the `language/swift` and `app-framework/swiftui` packs, whose
`config/.config/mise/tasks/**` scripts land in a target repo and execute there
(E15). Reviews the branch delta since the branch base: wave 1's single commit
(E14). The whole range is reviewed; a review finding on a file of a unit this
row does not cover is dropped and counted, a security finding is routed to that
unit all the same, per `/vwf:execute`'s review-unit rule.
