# U5 — gates and bump: the gate alone, no version moves

- **Wave:** 3
- **Depends on:** U4
- **Owns:** — (no file; this unit edits nothing)
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md's Consent block.
- **Lazy-load:** none.

## Ruling

Decision 7 — Bump: "No version moves — no file under `plugins/` or `site/`
changes; U5 runs the wave gate and nothing else."

The Consent block, verbatim: every `Release … publicly` row reads `none`.

## Edits

none. `git diff --stat <branch base>..HEAD -- plugins site` must be empty; if it
is not, return `UNRESOLVED:` naming the file — a plugin or site change this plan
did not authorise.

## Verification

- The full wave gate:

      mise run p:plugins:marketplace -- --check
      mise run p:plugins:inventory -- --check
      mise run p:plugins:check
      mise run code:precommit

- `git diff --stat` against the branch base touches only
  `docs/memory/problems/2026-09-20-init-shape-audit*.md` and the plan folder's
  own run log.

## Guardrails

- Edit nothing. A version file, a generated file or the marketplace manifest
  changed by this unit is a defect.
- Delete with `rm`, never `git rm` — moot here; nothing is deleted.

## Commit

none — this unit lands no change; the orchestrator writes no commit for it and
records the gate result in the Run log.
