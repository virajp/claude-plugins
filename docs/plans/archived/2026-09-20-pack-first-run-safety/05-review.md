# R5 — Review: the four task scripts and the three packs

- **Wave:** 2
- **Depends on:** U1, U2, U3, U4
- **Owns:** —
- **Model:** opus
- **Kind:** review

## Scope

Covers U1 (the four mise task scripts — shipped shell that runs under hooks and
`setup:all`), U2 (the pre-commit pack's landed config and prose), U3 (the
gitleaks and grype packs) and U4 (the mise skill's prose). Reviews the whole
branch delta since the branch base — this is the first row. The reason for the
row, from index.md's decision 7: shipped shell changes in four task scripts land
here, and a task that runs on every clone under a commit hook is runnable code
by the change-plan rule.

What the reviewers should weigh hardest: `code/git-config`'s `--fix` writes
nothing partial and never deletes an identity key; `setup/precommit` still
installs hooks on a clean repo without `--force`; no flag defaults on; every
script runs under bash 3.2 and BSD tools; no new host mutation was introduced
while removing the old ones.
