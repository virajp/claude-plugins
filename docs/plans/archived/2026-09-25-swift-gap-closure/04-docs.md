# U4 — Docs: reconcile what waves 1 falsified

- **Wave:** 2
- **Depends on:** U1, U2, U3
- **Owns:** `site/src/content/docs/**`, `.claude/skills/stackgen-plugin/**`,
  `.claude/skills/vwf-plugin/**`, `.claude/docs/**`, `readme.md`, `CLAUDE.md`,
  `plugins/stackgen/stacks/readme.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md's Facts and Assumed decisions.

## Ruling

> The docs unit runs `vwf:docs-sync` over the run's branch delta and applies its
> findings plus every `DOCS FALSIFIED:` line the earlier units returned. No
> reversal was confirmed, so no decision doc is written.

## Edits

1. Invoke `vwf:docs-sync` in its standalone mode over `git diff develop...HEAD`.
   Apply every finding that falls inside this unit's Owns.
2. Apply every `DOCS FALSIFIED:` line the orchestrator passes from U1–U3.
3. Grep the Owns trees for passages the rulings falsify: `a11y:` or `viewport:`
   as ux-gate output of the swiftui pack (A4); a claim that `.swiftpm/` is
   ignored (A1); a claim that the swiftui desktop gates cover Mac Catalyst (A3).
   Fix each hit.
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

`docs: swift gap closure — reconcile the manual`
