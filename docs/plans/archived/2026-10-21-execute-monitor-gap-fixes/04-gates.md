# U4 — Gates

- **Wave:** 4
- **Depends on:** U3
- **Owns:** none — no generator output changes: the marketplace projects no
  field this plan edits, and no stackgen pack changes
- **Model:** opus
- **Kind:** edit
- **Read first:** `index.md` of this folder — the Wave gate and the Gates the
  orchestrator keeps.

## Ruling

> - Decision 8: One new test case for each of rulings 1 to 7, in the existing
>   test files or a new `agents.test.tsx` under `hooks/monitor/`.

## Edits

1. Run every wave-gate line in `index.md`.
2. Run `claude plugin test plugins/vwf` and
   `claude plugin validate --strict plugins/vwf`.
3. Report a red line as `UNRESOLVED:` with the failing output's first lines; fix
   nothing, since this unit owns no file.

## Verification

- Every wave-gate line in `index.md` — green.
- `claude plugin test plugins/vwf` — green, more tests than the 6 before U1.
- `claude plugin validate --strict plugins/vwf` — passes.

## Guardrails

- The plugin manifests' `version` keys are not touched — the release task bumps
  them.
- Do not run `mise run p:plugins:local`; the orchestrator runs it after landing.

## Commit

none — this unit changes no file.
