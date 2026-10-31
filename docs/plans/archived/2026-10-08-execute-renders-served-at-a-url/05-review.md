# R1 — Review: the render scripts

- **Wave:** 2
- **Depends on:** U1
- **Owns:** —
- **Model:** opus
- **Kind:** review

## Scope

Covers U1 — `plugins/vwf/skills/mockups/scripts/**` (`renders.mjs`, the
`--renders` and `--peer` changes to `serve.mjs`, `lib/**`) and the
`scripts/src/mockups-*.test.ts` suites, the one unit that lands runnable code
(Decision E14). Reviews the branch delta since the branch base. Security focus:
`renders.mjs` copies only files that resolve inside `--worktree` and writes only
under `<main>/docs/scratchpad/`; the stdin parse; the render server's realpath
guards under both `--root` and `--mockups`; the reserved `/__renders/` prefix;
the peer link built from an argument, never from a request. Correctness focus:
`renders.mjs` and the server agree on every route through `lib/routes.mjs`.
