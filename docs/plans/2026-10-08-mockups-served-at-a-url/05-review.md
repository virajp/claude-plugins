# R1 — Review: the mockup scripts

- **Wave:** 2
- **Depends on:** U1
- **Owns:** —
- **Model:** opus
- **Kind:** review

## Scope

Covers U1 — `plugins/vwf/skills/mockups/scripts/**` (`serve.mjs`, `routes.mjs`,
`links.mjs`, `lib/routes.mjs`) and the three `scripts/src/mockups-*.test.ts`
suites, the one unit that lands runnable code (Decision D22). Reviews the branch
delta since the branch base. Security focus: the loopback binding, the realpath
containment under `--root` for static, `[param]` and `?state=` paths, the
`docs/scratchpad/` check, the reserved `/__mockups/` prefix (no `routes.json` or
`comments.yaml` served), the YAML written from request bodies, and the markdown
table parse in `routes.mjs`. Correctness focus: `serve.mjs` and `links.mjs`
agree on every path, through `lib/routes.mjs` (D20).
