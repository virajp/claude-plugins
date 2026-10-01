# W6 — Gates (no bump)

- **Wave:** 3
- **Depends on:** W5
- **Owns:** —
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md's Consent block and Wave gate.

## Ruling

> G9 — None: the patch intent rides the unreleased stackgen `3.0.0`, vwf
> `20.1.0`, site `1.1.50`.

## Edits

1. Confirm G9 holds: `git tag --list 'stackgen-v*' 'vwf-v*' 'site-v*'` shows the
   latest released tags still `stackgen-v2.0.0`, `vwf-v20.0.1`, `site-v1.1.49`,
   and the manifests read `3.0.0`, `20.1.0`, `1.1.50`. If a release has been cut
   since, return `UNRESOLVED:` naming it — a bump would then be needed, and this
   plan does not authorise one.
2. Run every Wave gate line with `MISE_ENV=dev` exported. Edit nothing.

## Verification

- The full wave gate, green — this report is the run's final gate.
- `git status --short` is clean after the run.

## Guardrails

- No version edit, no generator run, no tag, no `p:plugins:release`, no
  `p:site:release`.

## Commit

None — this unit changes no file. When a gate line reformats a file, report it
as a `GAP:` line instead of keeping the change.
