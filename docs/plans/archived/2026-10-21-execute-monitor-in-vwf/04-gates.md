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

> - Decision 6: The behaviour stays exactly as tested; the only changes are the
>   renames of rulings 3 and 4, the import paths the new layout needs, and the
>   manifest and hooks-file wiring.

## Edits

1. Run every wave-gate line in `index.md`.
2. Run `claude plugin test plugins/vwf` and
   `claude plugin validate --strict plugins/vwf`.
3. Report a red line as `UNRESOLVED:` with the failing output's first lines; fix
   nothing outside this unit's Owns, which is empty.

## Verification

- Every wave-gate line in `index.md` — green.
- `claude plugin test plugins/vwf` — green, 5 tests.
- `claude plugin validate --strict plugins/vwf` — passes.

## Guardrails

- The plugin manifests' `version` keys are not touched — the release task bumps
  them.
- Do not run `mise run p:plugins:local`; the orchestrator runs it after landing.

## Commit

none — this unit changes no file.
