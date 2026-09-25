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

Quoted from index.md: E1, E3, E7, E8, E10 and E11, as the table states them.

## Edits

1. **Run `vwf:docs-sync`** over the run's branch delta
   (`plugins/vwf/skills/docs-sync/SKILL.md`) and apply its findings inside Owns.
2. **Apply every `DOCS FALSIFIED:` line** U1–U3 returned. A line naming a file
   outside Owns is returned as a `GAP:` for the orchestrator, not edited.
3. **The survey's list:** `site/src/content/docs/plugins/stackgen.md` — the
   language-bundle kind gains Swift beside TypeScript, the new bundle and packs
   are described where the page describes them, any count is re-counted from the
   tree; `site/src/content/docs/how-to/operate/choosing-your-stack.md` — a Swift
   package option; `readme.md:449-450` — confirm the SourceKit-LSP wording names
   the packs that declare it; `.claude/skills/stackgen-plugin/` where it lists
   language packs; `plugins/stackgen/stacks/readme.md` — the narrative gains the
   Swift package stack.

No decision doc here — plan 2d's docs unit writes the chain's one decision doc.

## Verification

- `mise run p:site:check` green;
  `grep -rn 'swift-package' site/src/content/docs` hits.

## Guardrails

- Touch nothing outside Owns — never a file under `plugins/` other than
  `plugins/stackgen/stacks/readme.md`.
- dprint-formatted files: keep every code span on one line, never end a table
  cell in a bare asterisk, never put a backtick inside a code span.
- Never run `git checkout`, `git restore`, `git stash`, or a formatter's
  `--fix`, over any path outside Owns.
- Delete with `rm`, never `git rm`.

## Commit

`docs: Swift package stack — reconcile the manual`
