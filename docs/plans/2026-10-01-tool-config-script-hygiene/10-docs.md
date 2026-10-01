# H10 — Docs

- **Wave:** 6
- **Depends on:** H5, H6, H7, H9
- **Owns:** `readme.md`, `CLAUDE.md`, `.claude/docs/**`,
  `.claude/skills/stackgen-plugin/**`, `.claude/skills/vwf-plugin/**`,
  `.claude/skills/plugin-authoring/**`, `site/src/content/docs/**`,
  `installer/src/graphify.ts` (the comment at `:59` only),
  `docs/memory/decisions/2026-10-01-*.md` (new files only)
- **Model:** opus
- **Kind:** edit
- **Read first:** `plugins/vwf/skills/docs-sync/SKILL.md`;
  `plugins/vwf/assets/memory.md`.

## Ruling

> H1–H9, quoted from index.md's Assumed decisions.

## Edits

1. **Run `vwf:docs-sync`** over the branch delta; apply its findings plus every
   `DOCS FALSIFIED:` line H1–H8 returned.
2. **The survey's list**: `readme.md:299-300,306`; `.claude/docs/plugins.md:13`
   and `CLAUDE.md`'s *Tasks* (the new `p:plugins:gitignore-templates`);
   `.claude/skills/stackgen-plugin/SKILL.md` (verbs, `update_bot`, root files,
   the string grammar gone);
   `.claude/skills/plugin-authoring/references/checks.md` (structured entries
   only, template names); `site/src/content/docs/plugins/stackgen.md` (git,
   graphify, renovate, the vendored templates, Flutter);
   `installer/src/graphify.ts:59` — the comment names `post-commit` and
   `post-merge`.
3. **Decision docs** (new files, per `memory.md`):
   `2026-10-01-gitignore-templates-vendored.md` (H1, H2 — supersedes
   `2026-09-27-tool-config-hygiene.md`'s fetch-and-pin);
   `2026-10-01-ignore-files-have-one-writer.md` (H3, H4, H6);
   `2026-10-01-tool-config-entries-structured-only.md` (H8).

## Verification

- `mise run p:site:check` green.
- `mise run code:precommit` green.
- `pnpm exec tsc --noEmit -p installer` green.
- The full wave gate.

## Guardrails

- Touch nothing under `plugins/`; a falsified passage there is a `GAP:` line.
- Never edit an existing decision doc — add new ones.
- Keep code spans on one line; never end a table cell in a bare `*`.
- Delete with `rm`, never `git rm`.

## Commit

`docs: every tool-config tool runs on the script — vendored templates, structured entries`
