# U5 — Docs

- **Wave:** 3
- **Depends on:** U1, U2, U3, R4
- **Owns:** `site/src/content/docs/**`, `.claude/skills/stackgen-plugin/**`,
  `.claude/docs/**`, `readme.md`, `CLAUDE.md`,
  `plugins/stackgen/stacks/readme.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md's Facts and Assumed decisions, then every file you
  edit.

## Ruling

Quoted from index.md: E1, E2, E5, E6, E7 and E9, as the table states them.

## Edits

1. **Run `vwf:docs-sync`** over the run's branch delta
   (`plugins/vwf/skills/docs-sync/SKILL.md`) and apply its findings inside Owns.
2. **Apply every `DOCS FALSIFIED:` line** U1–U3 returned. A line naming a file
   outside Owns is returned as a `GAP:`, not edited.
3. **The survey's list:** `site/src/content/docs/plugins/stackgen.md` — the
   `app-framework` kind's archetype text gains SwiftUI beside Flutter (the
   `native-ui` category's first pack), the bundle described, any count
   re-counted from the tree;
   `site/src/content/docs/how-to/operate/choosing-your-stack.md` — the native
   Swift app option beside Flutter; `.claude/skills/stackgen-plugin/` — the
   `native-ui` example; `plugins/stackgen/stacks/readme.md` — the narrative
   gains the SwiftUI app stack.

No decision doc here — plan 2d's docs unit writes the chain's one decision doc.

## Verification

- `mise run p:site:check` green;
  `grep -rn 'swift-swiftui' site/src/content/docs` hits.

## Guardrails

- Touch nothing outside Owns — never a file under `plugins/` other than
  `plugins/stackgen/stacks/readme.md`.
- dprint-formatted files: keep every code span on one line, never end a table
  cell in a bare asterisk, never put a backtick inside a code span.
- Never run `git checkout`, `git restore`, `git stash`, or a formatter's
  `--fix`, over any path outside Owns.
- Delete with `rm`, never `git rm`.

## Commit

`docs: SwiftUI app stack — reconcile the manual`
