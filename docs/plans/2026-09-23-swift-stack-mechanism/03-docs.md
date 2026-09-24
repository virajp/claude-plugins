# U3 — Docs

- **Wave:** 2
- **Depends on:** U1, U2
- **Owns:** `site/src/content/docs/**`, `.claude/skills/stackgen-plugin/**`,
  `.claude/skills/vwf-plugin/**`, `.claude/docs/**`, `readme.md`, `CLAUDE.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md's Facts and Assumed decisions, then every file you
  edit.

## Ruling

Quoted from index.md: E6, E12 and E13, as the table states them.

## Edits

1. **Run `vwf:docs-sync`** over the run's branch delta
   (`plugins/vwf/skills/docs-sync/SKILL.md`) and apply its findings inside Owns.
2. **Apply every `DOCS FALSIFIED:` line** U1 and U2 returned.
3. **The survey's list:** `site/src/content/docs/plugins/vwf.md` — doctor's
   per-language checks gain the blocking Binaries check, init's detection gains
   `Project.swift` / `Tuist.swift`; `site/src/content/docs/plugins/stackgen.md`
   — the language facts gain `binaries`; `.claude/skills/stackgen-plugin/` — the
   facts list gains `binaries`; `CLAUDE.md` — the rule-15 paragraph only if it
   enumerates the excluded trees.

No decision doc here — plan 2d's docs unit writes the chain's one decision doc.

## Verification

- `mise run p:site:check` green.

## Guardrails

- Touch nothing outside Owns — never a file under `plugins/`.
- dprint-formatted files: keep every code span on one line, never end a table
  cell in a bare asterisk, never put a backtick inside a code span.
- Never run `git checkout`, `git restore`, `git stash`, or a formatter's
  `--fix`, over any path outside Owns.
- Delete with `rm`, never `git rm`.

## Commit

`docs: binaries fact, doctor and init detection — reconcile the manual`
