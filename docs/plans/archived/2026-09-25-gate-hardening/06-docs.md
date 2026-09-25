# U6 — Docs: reconcile what the gate changes falsified

- **Wave:** 3
- **Depends on:** U4, U5
- **Owns:** `site/src/content/docs/**`, `.claude/skills/stackgen-plugin/**`,
  `.claude/skills/plugin-authoring/**`, `.claude/docs/**`, `readme.md`,
  `CLAUDE.md`, `plugins/stackgen/stacks/readme.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md's Facts and Assumed decisions.

## Ruling

> The docs unit runs `vwf:docs-sync` over the run's branch delta and applies its
> findings plus every `DOCS FALSIFIED:` line the earlier units returned. No
> reversal was confirmed, so no decision doc is written.

## Edits

1. Invoke `vwf:docs-sync` in its standalone mode over `git diff develop...HEAD`.
   Apply every finding inside this unit's Owns.
2. Apply every `DOCS FALSIFIED:` line the orchestrator passes from U1–U4.
3. Grep the Owns trees for passages the rulings falsify: `pnpm dlx` for the
   house linter (B1); `.config/linter.yaml` described as the eslint pack's, or
   as shipped empty (B2); the pre-commit lint hook's behaviour (B4). Fix each
   hit.
4. A finding outside these Owns is reported as `GAP:` with the path, never
   edited.

## Verification

- `mise run p:site:check` passes when `site/` was touched.
- `mise run code:format -- --fix <each edited dprint-formatted file>` leaves no
  further change.

## Guardrails

- Never edit `plugins/**` other than `plugins/stackgen/stacks/readme.md`.
- dprint formats `site/**`, `readme.md`, `CLAUDE.md`: widening one table cell
  re-pads every row. Never end a table cell in a bare `*`. Keep code spans on
  one line.
- Write with Write/Edit, never heredocs. Delete with `rm`, never `git rm`.

## Commit

`docs: gate hardening — reconcile the manual`
