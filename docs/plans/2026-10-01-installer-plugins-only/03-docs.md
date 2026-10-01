# J3 — Docs

- **Wave:** 3
- **Depends on:** J2
- **Owns:** `installer/CLAUDE.md`, `CLAUDE.md`, `readme.md`, `.claude/docs/**`,
  `site/src/content/docs/**`,
  `docs/memory/decisions/2026-10-01-installer-plugins-only.md` (new)
- **Model:** opus
- **Kind:** edit

## Ruling

> J1, J2 — the installer installs and uninstalls plugins only.

## Edits

1. Run `vwf:docs-sync` over the branch delta; apply it. Known:
   `installer/CLAUDE.md`, `CLAUDE.md` (*What This Repo Is*, *The installer CLI*:
   "three jobs" → plugins and uninstall), `readme.md`,
   `site/src/content/docs/installer/{index,internals,targets,usage}.md`, the
   installer mention in `site/src/content/docs/plugins/vwf.md`.
2. Decision doc `2026-10-01-installer-plugins-only.md` with the user's words.

## Verification

- `mise run p:site:check`, `mise run code:precommit`; the full wave gate.

## Commit

`docs: the installer installs plugins only`
