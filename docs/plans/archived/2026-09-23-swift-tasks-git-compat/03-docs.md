# U3 — Docs

- **Wave:** 3
- **Depends on:** U1, R2
- **Owns:** `site/src/content/docs/**`, `.claude/skills/stackgen-plugin/**`,
  `.claude/docs/**`, `readme.md`, `CLAUDE.md`,
  `plugins/stackgen/stacks/readme.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md's Facts and Assumed decisions, then every file you
  edit.

## Ruling

Quoted from index.md: F1, F2 and F3, as the table states them.

## Edits

1. **Run `vwf:docs-sync`** over the run's branch delta
   (`plugins/vwf/skills/docs-sync/SKILL.md`) and apply its findings inside Owns.
2. **Apply every `DOCS FALSIFIED:` line** U1 returned. A line naming a file
   outside Owns is returned as a `GAP:` for the orchestrator, not edited.
3. **The survey's expectation:** no doc outside the pack describes the
   deduplicate behaviour or a minimum git version, and
   `site/src/content/docs/plugins/stackgen.md`'s Swift paragraph says the task
   file list is git-sourced, NUL-safe and `./`-prefixed — confirm it still
   holds, and say in one clause, only if the paragraph already describes the
   list's mechanics, that a failed `git ls-files` fails the task. Add nothing
   the page does not already cover. **Report in `DECIDED:` whether any site page
   changed** — it decides the site bump in U4.

## Verification

- `mise run p:site:check` green.

## Guardrails

- Touch nothing outside Owns — never a file under `plugins/` other than
  `plugins/stackgen/stacks/readme.md`.
- dprint-formatted files: keep every code span on one line, never end a table
  cell in a bare asterisk, never put a backtick inside a code span.
- Never run `git checkout`, `git restore`, `git stash`, or a formatter's
  `--fix`, over any path outside Owns.
- Delete with `rm`, never `git rm`.

## Commit

`docs: Swift tasks git compatibility — reconcile the manual`
