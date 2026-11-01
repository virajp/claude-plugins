# U8 — Review: the removal in both plugins and the checker

## Scope

Covers U1 to U7 — the branch delta since the branch base, the first review of
the run. The reason for a review on a change plan is D7: shipped shell scripts
change (tool-config's mise tasks `setup/precommit` and `setup/all`; the deleted
hook scripts and their `hooks.json` entries) and the checker source
`scripts/src/check.ts` with its tests.
