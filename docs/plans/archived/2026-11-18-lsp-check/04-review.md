# U4 — Review: U1 to U3

## Scope

U1 to U3, the branch delta since the branch base. The plan lands runnable code
(D9): the doctor checks, `start.mjs` and the validator. The units are `edit`
units, so this review runs the security half only: `/security-review` and the
security reviewer. Focus: the `code:lsp:check` call runs with no shell and no
value from the repo reaches a shell; the parse of the task output cannot make a
row from a line that is not a not-found line; a failed or absent task is a row,
never an empty result (D2); the scripts stay dependency-free.
