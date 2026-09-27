# U9 — Review: the checker, the inventory, the installer and the strip

- **Wave:** 3
- **Depends on:** U1, U4, U7, U8
- **Owns:** —
- **Model:** opus
- **Kind:** review

## Scope

Covers U1 (the `setup/precommit` shell task and the tool assets), U4
(`installer/src/graphify.ts` and its test), U7 (`check.ts`, `inventory.ts`,
their tests, the pack deletion) and U8 (this repo's `setup/precommit`), and U6
transitively through U7 — the branch delta since the branch base, the first and
only review row. U2, U3 and U5 are skill prose in the range, not covered. Reason
(decision 23): runnable code lands — `check.ts`, `inventory.ts`, the installer,
the `setup/precommit` shell task.
