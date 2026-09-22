# R5 — Review: the merge scripts and the git-pass rules

- **Wave:** 2
- **Depends on:** U1, U2, U3, U4
- **Owns:** —
- **Model:** opus
- **Kind:** review

## Scope

Covers U1 and U2 (the git pass rules in init), U3 (the mise pack —
`_scripts/merge`, `code/merge/develop`, `code/merge/main`, `code/worktrees`, the
two marked positions) and U4 (git-workflow, doctor, CONTRIBUTING). Reviews the
whole branch delta since the branch base — the first row. The reason, from
index.md's decision 7: shipped shell that lands every branch of every shaped
repo.

What the reviewers should weigh hardest: `_scripts/merge` resolves the mode from
the destination and never from the source; the legacy fallback reads
`MERGE_MODEL` only when the per-branch variable is unset; the refusals at
`:153-181` are untouched; nothing new touches the forge; every script runs under
bash 3.2 and BSD tools; init never commits on a detached HEAD or on `main`.
