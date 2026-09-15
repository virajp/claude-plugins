# U4 — Renovate at the root

- **Wave:** 1
- **Depends on:** —
- **Owns:** `.config/renovate.json` → `renovate.json`
- **Model:** opus
- **Read first:** `.config/renovate.json`.
- **Lazy-load:**
  `docs/plans/archived/2026-09-10-hygiene-pack-renovate-and-allowlist/index.md`
  decision 1 (the required plan; landed).

## Ruling

From index.md's assumed decisions, verbatim:

> **5.** `.config/renovate.json` → `renovate.json` (root), byte-identical, per
> the required plan's decision 1.

## Edits

1. `mv .config/renovate.json renovate.json`. Content byte-identical.
2. Nothing else. `.config/dprint.json`'s excludes do not name it; the root file
   is formatted by the same json plugin as before.

## Verification

- `test -f renovate.json && ! test -e .config/renovate.json`.
- `git diff --no-index /dev/null renovate.json | wc -l` equals the line count of
  the old file plus the diff header (i.e. unchanged content); simpler:
  `git show HEAD:.config/renovate.json | diff - renovate.json` → empty.
- `pnpm exec dprint check renovate.json` green.

## Guardrails

- Touch nothing else.
- Move with `mv`, never `git mv`; stage nothing.
- Never run `git checkout`, `git restore`, `git stash`.

## Commit

`ops: renovate.json moves to the root, where Renovate reads it` — written by the
orchestrator after the wave gate, not by the unit.
