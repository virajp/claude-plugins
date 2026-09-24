# R12 — Review: the reworked swiftui task scripts

- **Wave:** 4
- **Depends on:** U7
- **Owns:** —
- **Model:** opus
- **Kind:** review

## Scope

Covers U7 — the `app-framework/swiftui` pack's reworked
`config/.config/mise/tasks/**` scripts, which land in a target repo and run
there (E15). Reviews the branch delta since R4's main loop ended (`ba994ef0`):
the two commits no review saw (`3ae5af85`, U2's; `ddfebfce`, U1's) and wave 3's
commit. A review finding on a file of a unit this row does not cover is dropped
and counted; a security finding is routed to that unit all the same, per
`/vwf:execute`'s review-unit rule. U1 is superseded by U7 (same paths): a
finding on a file U1's commit last touched routes to U7.
