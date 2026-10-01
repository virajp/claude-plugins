# U9 — Review: the tool-config script and the checker

- **Wave:** 5
- **Depends on:** U3, U8
- **Owns:** —
- **Model:** opus
- **Kind:** review

## Scope

Covers U1, U3, U4 and U8 — directly U3 and U8, transitively U1 (through U3) and
U4 (through U8): every unit that lands runnable code — the node script under
`plugins/stackgen/skills/tool-config/scripts/` and the checker source
`scripts/src/check.ts`. Reviews the branch delta since the branch base, the
first review row. The reason it exists is D19: the plan lands a node script and
checker source, which execute rather than are read.
