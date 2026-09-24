# U9 — Docs

- **Wave:** 3
- **Depends on:** U1, U2, U3, U4, U5, U6, U7, R8
- **Owns:** `site/src/content/docs/**`, `.claude/skills/stackgen-plugin/**`,
  `.claude/skills/vwf-plugin/**`, `.claude/docs/**`, `readme.md`, `CLAUDE.md`,
  `plugins/stackgen/stacks/readme.md`,
  `docs/memory/decisions/2026-09-23-swift-native-stack.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md's Facts and Assumed decisions sections, then every
  file you edit, top to bottom.

## Ruling

Quoted from index.md: E1–E13 and E17 — the table's rows, which this unit
restates in the manual and the decision doc.

## Edits

1. **Run `vwf:docs-sync`** over the run's branch delta
   (`plugins/vwf/skills/docs-sync/SKILL.md`), and apply its findings inside
   Owns.
2. **Apply every `DOCS FALSIFIED:` line** U1–U7 returned, as handed over by the
   orchestrator. A line naming a file outside Owns (for instance
   `plugins/vwf/assets/vwf-config.md`) is returned as a `GAP:` for the
   orchestrator, not edited.
3. **The survey's list:**
   - `site/src/content/docs/plugins/stackgen.md` — the `app-framework` kind's
     archetype text gains SwiftUI beside Flutter; any count of packs or
     framework packs is re-counted from the tree; the two new bundles and the
     `binaries` fact are described where the page describes bundles and facts.
   - `site/src/content/docs/plugins/vwf.md` — doctor's per-language checks gain
     the blocking Binaries check; init's detection table gains `Project.swift` /
     `Tuist.swift`.
   - `site/src/content/docs/how-to/operate/choosing-your-stack.md` — the native
     Swift option beside Flutter.
   - `readme.md:449-450` — the SourceKit-LSP claim is now true; confirm the
     wording names the packs that declare it.
   - `.claude/skills/stackgen-plugin/` — the pack and bundle model gains the
     `native-ui` example and the `binaries` fact where the skill lists facts.
   - `plugins/stackgen/stacks/readme.md` — the narrative gains the native Swift
     stack.
   - `CLAUDE.md` — only if a passage is falsified (the plugin table's stackgen
     cell is generic); the rule-15 paragraph's list of excluded trees if it
     enumerates them.
4. **The decision doc**
   `docs/memory/decisions/2026-09-23-swift-native-stack.md`, in the shape
   `plugins/vwf/assets/memory.md` gives: E1–E13 with their rejected
   alternatives, and that it finishes B56 with plan 1.

## Verification

- `mise run p:site:check` green.
- `grep -rn 'swift-swiftui' site/src/content/docs` hits.

## Guardrails

- Touch nothing outside Owns — never a file under `plugins/` other than
  `plugins/stackgen/stacks/readme.md`.
- `site/**`, `.claude/**`, `docs/**`, `readme.md` and `CLAUDE.md` are
  dprint-formatted: keep every code span on one line, never end a table cell in
  a bare asterisk, never put a backtick inside a code span.
- Never run `git checkout`, `git restore`, `git stash`, or a formatter's
  `--fix`, over any path outside Owns.
- Delete with `rm`, never `git rm`.

## Commit

`docs: native Swift stack — reconcile the manual`
