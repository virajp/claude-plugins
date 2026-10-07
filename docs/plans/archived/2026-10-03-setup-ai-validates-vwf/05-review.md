# U5 — Review: the setup:ai task and the mise module

- **Wave:** 2
- **Depends on:** U1
- **Owns:** —
- **Model:** opus
- **Kind:** review

## Scope

Covers U1 — the shipped `setup/ai` shell task, `cli.mjs`, `schema.mjs`,
`mise.mjs` and their tests, the runnable code this plan lands (decision 10).
Reviews the branch delta since the branch base. Particular attention: the task
never runs `claude plugin install --scope project`; `pnpx` runs only when vwf is
at neither scope; a pack block's `source` and `plugin` values reach the shell
quoted; a brownfield `setup/ai` is never written.
