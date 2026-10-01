# I8 — Docs

- **Wave:** 5
- **Depends on:** I5, I6, I7
- **Model:** opus
- **Kind:** edit
- **Owns:** `readme.md`, `CLAUDE.md`, `.claude/docs/**`,
  `.claude/skills/{stackgen-plugin,vwf-plugin,plugin-authoring}/**`,
  `site/src/content/docs/**`, `docs/memory/decisions/2026-10-01-*.md` (new only)

## Ruling

> I1–I6 as in index.md.

## Edits

1. Run `vwf:docs-sync` over the branch delta; apply it plus every
   `DOCS FALSIFIED:`. Known: `site/src/content/docs/plugins/vwf.md:1197-1430`,
   `how-to/brownfield/onboard-existing-codebase.md:89-129`,
   `.claude/skills/vwf-plugin/SKILL.md:84-237`.
2. Decision doc `2026-10-01-init-passes-and-hygiene-on-tool-config.md`.

## Verification

- `mise run p:site:check`, `mise run code:precommit`; the full wave gate.

## Commit

`docs: init's task passes and hygiene run on the tool-config script`
