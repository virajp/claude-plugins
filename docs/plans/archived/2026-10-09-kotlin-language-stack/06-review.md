# R1 — Review: the Kotlin packs and the supersets

- **Wave:** 2
- **Depends on:** U1, U2, U5
- **Owns:** —
- **Model:** opus
- **Kind:** review

## Scope

U1, U2 and U5 — the wave-1 commit, since the branch base. The reason for the row
is decision K14: the packs ship bash subtasks that run in target repos
(`setup/deps/*/kotlin`, `code/format/ktlint`, `code/lint/ktlint`,
`code/lint/detekt`) and mise templates that pin downloaded binaries.
