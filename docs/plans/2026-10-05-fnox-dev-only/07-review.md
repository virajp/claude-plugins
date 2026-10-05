# U7 — Review: the setup:secrets task

- **Wave:** 2
- **Depends on:** U2
- **Owns:** —
- **Model:** opus
- **Kind:** review

## Scope

Covers U2 — the rewritten
`plugins/stackgen/stacks/capability-provider/fnox/config/.config/mise/tasks/setup/secrets`,
the runnable shell this plan lands (D12). Reviews the branch delta since the
branch base. Particular attention: no code path prints a secret value (no
`fnox get` to a terminal, no `set -x`, no value in an error message); presence
is tested by exit status with all output discarded; prompting never happens in
CI or without a terminal unless stdin is piped; the task exits 0 on the skip
paths; and the `FNOX_PROFILE` template in `pack.yaml` cannot select
`development` when `CI` is set.
