# U5 — Docs

- **Wave:** 4
- **Depends on:** U4
- **Owns:** `site/src/content/docs/**`, `readme.md`, `CLAUDE.md`,
  `.claude/skills/**` (except `plugin-authoring/references/checks.md`),
  `.claude/docs/**`, `docs/memory/decisions/2026-10-18-retire-tool-config.md`
  (new), and any other human-facing passage `vwf:docs-sync` finds outside the
  Owns of U1 to U3
- **Model:** opus
- **Kind:** edit
- **Read first:** `index.md` of this folder — the Goal, the reversals, the
  decisions table and the facts' docs list.

## Ruling

The three reversals in the Goal and decisions 1 to 6, confirmed by the user on
2026-10-18 and 2026-10-19.

## Edits

1. Run `vwf:docs-sync` over the run's branch delta and apply its findings, plus
   every `DOCS FALSIFIED:` line U1 to U3 returned.
2. **`docs/memory/decisions/2026-10-18-retire-tool-config.md`** — new, per
   `plugins/vwf/assets/memory.md`: decisions 1 to 6, the three reversals by file
   name, the bootstrap items B06–B10.
3. **`site/src/content/docs/plugins/stackgen.md`** — replace "The repo baseline
   — mise, the gates and the hygiene files" (:797-1498) with a short section:
   the baseline is bootstrap's; the plugins hand off through bootstrap's
   `docs/sync/vwf.md`; `stackgen:mise` is the plugin skill.
4. Checker rule numbers per decision 6 in
   `.claude/skills/stackgen-plugin/SKILL.md`,
   `.claude/skills/plugin-authoring/SKILL.md`,
   `.claude/skills/plugin-authoring/references/structure.md`,
   `.claude/skills/vwf-plugin/SKILL.md`, `.claude/docs/repo-shape.md`,
   `CLAUDE.md` ("seventeen rules" → fifteen, and each rule cited by number).
   Remove passages that describe tool-config as current in `CLAUDE.md`,
   `readme.md`, `.claude/docs/{repo-shape,ci-and-releases}.md`.

## Verification

- `mise run p:plugins:check` — green.
- `grep -rn 'tool-config' site/src/content/docs readme.md CLAUDE.md .claude` —
  no hit that describes current behaviour.

## Guardrails

- `CLAUDE.md`, `readme.md` and `site/**` are dprint-formatted; never end a table
  cell in a bare asterisk; keep each code span on one line.
- Do not edit `docs/plans/**` or this repo's `.config/`.

## Commit

`docs: tool-config retires; bootstrap owns the repo baseline`
