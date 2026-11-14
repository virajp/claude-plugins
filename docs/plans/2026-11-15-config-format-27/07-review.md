# U7 — Review: the scripts and the progress pane

## Scope

U4 and U5, the branch delta of `plugins/vwf/skills/doctor/scripts/`,
`plugins/vwf/skills/execute/scripts/start.mjs`,
`plugins/vwf/skills/plan-management/scripts/lib/`, `plugins/vwf/hooks/monitor/`
and the four test files since the branch base. Focus: each member type resolves
(D4, D17: a folder member is part of the base repo); a failed `bootstrap`
call is a refusal, never a silent empty list; the pane writes nothing and reads
only `[members.*]` and `[home]` (D5); the scripts stay dependency-free.
