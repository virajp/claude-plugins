# R1 — Review: the mockup review server

- **Wave:** 2
- **Depends on:** U1
- **Owns:** —
- **Model:** opus
- **Kind:** review

## Scope

Covers U1 — `plugins/vwf/skills/mockups/scripts/serve.mjs` and
`scripts/src/mockups-serve.test.ts`, the one unit that lands runnable code
(Decision D10). Reviews the branch delta since the branch base. Security focus:
the loopback binding, the realpath containment under `--root`, the
`docs/scratchpad/` and cwd checks, and the YAML written from request bodies.
