# U6 — Review: the scripts

## Scope

U4, the branch delta of `plugins/vwf/skills/doctor/scripts/`,
`plugins/vwf/skills/execute/scripts/start.mjs`,
`plugins/vwf/skills/plan-management/scripts/lib/` and the four test files
since the branch base. Focus: a project's folder resolves in its own repo
(D11); a failed `bootstrap` call is a refusal, never a silent empty list; a
capability with no task is reported, never assumed (D10); the scripts stay
dependency-free.
