# V6 — Docs

- **Wave:** 3
- **Depends on:** V2, V3, V5
- **Owns:** `readme.md`, `CLAUDE.md`, `.claude/docs/**`,
  `.claude/skills/plugin-authoring/**`, `.claude/skills/stackgen-plugin/**`,
  `.claude/skills/vwf-plugin/**`, `site/src/content/docs/**`,
  `docs/memory/decisions/2026-10-01-editor-config-dropped.md` (new)
- **Model:** opus
- **Kind:** edit
- **Read first:** `plugins/vwf/skills/docs-sync/SKILL.md`;
  `plugins/vwf/assets/memory.md`.

## Ruling

> E1–E6, quoted from index.md's Assumed decisions — the editor axis retired, the
> 12 fragments, the editor merge and `setup:vscode` deleted, shaped repos
> migrated by `config_format` 22 with `.vscode/` untouched, the two
> doctrine-only packs, the `.vscode/` gate lines kept, this repo's
> `.config/vscode.d/` deleted.

User, verbatim: *"drop vscode settings from the plugin, let user create and
manage their vscode settings (for now, may make dedicated skill for it but
later)"*.

## Edits

1. **Run `vwf:docs-sync`** over the branch delta; apply its findings plus every
   `DOCS FALSIFIED:` line V1–V4 returned.
2. **The survey's list**: `readme.md:296,309`;
   `.claude/docs/repo-shape.md:175-181`;
   `.claude/skills/plugin-authoring/references/checks.md:142-148`;
   `.claude/skills/stackgen-plugin/SKILL.md:105,117-119,183-189,241-272,332`
   (including the "twelve fragments" counts);
   `.claude/skills/vwf-plugin/SKILL.md:116,135-146,168-178` and
   `references/{assets.md:24,docs-tree.md:137,skills-and-agents.md:27}`;
   `site/src/content/docs/plugins/stackgen.md:278-279,506-515,584-623,710,823-827,1154,1216-1224,1516`;
   `site/src/content/docs/plugins/vwf.md:949-987,1106,1189-1197,1213-1242,1398,1445,1729-1730,1847`;
   `site/src/content/docs/how-to/brownfield/migrate-old-vwf-repo.md:72-80`;
   `site/src/content/docs/how-to/greenfield/single-repo.md:94-100`.
3. **Decision doc** `docs/memory/decisions/2026-10-01-editor-config-dropped.md`
   per `memory.md`: the ruling (E1–E6), the user's words, and that it supersedes
   `2026-09-06-editor-fragments-inside-the-fence.md` and
   `2026-09-20-init-editor-dedupe.md`. Do not edit those two.

## Verification

- `mise run p:site:check` green.
- `mise run code:precommit` green (dprint-formatted docs re-pad tables).
- `grep -rn -i -E 'vscode\.d|setup:vscode|editor fragment|answers\.editor' readme.md CLAUDE.md .claude site/src/content/docs`
  prints nothing.
- The full wave gate.

## Guardrails

- Touch nothing under `plugins/`; a falsified passage there is a `GAP:` line.
- Never end a table cell in a bare `*`; keep code spans on one line.
- Delete with `rm`, never `git rm`.

## Commit

`docs: the plugins ship no editor configuration`
