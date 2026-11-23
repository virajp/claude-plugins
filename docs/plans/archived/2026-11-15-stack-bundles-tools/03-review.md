# U3 — Review: waves 1 and 2

## Scope

U1 and U2, the branch delta since the branch base. Focus: no rule of an old
skill is lost in the design-tool move (D6); the materializer adds a design
tool's files to `vwf-tools` once and only for a named tool; `stackgen-sync`
never deletes a repo file (D11); a failed `bootstrap` call is a stop, never an
empty list; `bootstrap-tools.ts` passes no input to a shell; `serve.mjs` is
unchanged; the scripts stay dependency-free.
