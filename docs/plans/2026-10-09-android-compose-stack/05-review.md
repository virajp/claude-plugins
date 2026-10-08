# R1 — Review: the Android packs and the supersets

- **Wave:** 2
- **Depends on:** U1, U2, U4
- **Owns:** —
- **Model:** opus
- **Kind:** review

## Scope

U1, U2 and U4 — the wave-1 commit, since the branch base. The reason for the row
is decision C10: the packs ship bash subtasks that run in target repos
(`setup/deps/install/android`, which accepts SDK licenses and downloads system
images; `code/lint/android`; the emulator E2E task; `test/golden`) and a mise
template that pins a downloaded toolchain.
