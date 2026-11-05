# U7 — Docs

- **Read first:** `plugins/vwf/skills/docs-sync/SKILL.md`.

## Ruling

> D9: No. The change lands no runnable code, so the wave review is the check.

## Edits

1. Run `vwf:docs-sync` over the run's branch delta. Apply its findings, and each
   `DOCS FALSIFIED:` line that the earlier units returned.
2. Examine each owned file for a passage that says `change-plan` is one file with
   no references. These files mention the skill:
   - `readme.md`
   - `CLAUDE.md`
   - `.claude/skills/vwf-plugin/SKILL.md`
   - `.claude/skills/vwf-plugin/references/skills-and-agents.md`
   - `site/src/content/docs/plugins/vwf.md`

Behavior does not change, so expect few edits or none. If nothing is falsified,
change no file, and return `CHANGED: none`.

## Verification

- `mise x -- mise run code:format`
- `mise x -- mise run code:lint`

## Guardrails

- Change only a passage that the rewrite falsifies. Describe no new behavior.
- `readme.md`, `CLAUDE.md` and `site/` are dprint-formatted. Run
  `mise x -- mise run code:format -- --fix <file>` on each file that you changed.
- If you edit `site/src/content/docs/plugins/vwf.md`, return a `GAP:`, so the user
  can raise the `site` release level by hand.
- Do not edit the old decision docs that cite "§8". They are history.

## Commit

`docs: reconcile the docs with the change-plan rewrite`
