# R7 — Review: the checker, the conditionals, the fragments

- **Wave:** 2
- **Depends on:** U1, U2, U3, U4, U5, U6
- **Owns:** —
- **Model:** opus
- **Kind:** review

## Scope

Covers U1 (the pack-format and lockfile schema), U2 (`scripts/src/check.ts` and
its test — the runnable code this row exists for, per index.md's decision 8), U3
and U4 (the packs' `conditional:` blocks and the moved editor keys), U5 (init's
two questions and the answers it passes) and U6 (doctor, the bundle). Reviews
the whole branch delta since the branch base — the first row.

What the reviewers should weigh hardest: rule 15's normalisation cannot make two
different patterns read as equal, and reports both sides; rule 11 rejects an
unknown axis rather than ignoring it; every key removed from the hygiene
fragment landed in exactly one destination fragment with its value verbatim
(compare U3's `DECIDED:` list against U4's files); no `conditional:` entry names
a path that does not exist; the two new fragments follow the fragment shape
exactly; nothing in `scripts/` widened beyond the two rules.
