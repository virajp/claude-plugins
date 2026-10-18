# U5 — Docs

- **Wave:** 2
- **Depends on:** U1, U2, U3, U4
- **Owns:** `site/src/content/docs/**`, `readme.md`, `CLAUDE.md`,
  `installer/CLAUDE.md`, `.claude/skills/**`, `.claude/docs/**`,
  `docs/memory/decisions/2026-10-18-vwf-hands-off-to-bootstrap.md` (new), and
  any other human-facing passage `vwf:docs-sync` finds outside the Owns of U1 to
  U4
- **Model:** opus
- **Kind:** edit
- **Read first:** `index.md` of this folder — the Goal, the reversals, the
  decisions table and the facts' docs list.

## Ruling

The six reversals in the Goal and decisions 1 to 9, confirmed by the user on
2026-10-18.

## Edits

1. Run `vwf:docs-sync` over the run's branch delta and apply its findings, plus
   every `DOCS FALSIFIED:` line U1 to U4 returned.
2. **`docs/memory/decisions/2026-10-18-vwf-hands-off-to-bootstrap.md`** — new,
   per `plugins/vwf/assets/memory.md`: decisions 1 to 9, the adopt instruction,
   the six reversals by file name.
3. Known passages, from the facts: the site's `plugins/vwf.md` (:940-1831), the
   four how-to pages, `installer/targets.md` (:75), `CLAUDE.md` (the vwf row;
   "On a repo that has been shaped" — `setup:ai` becomes bootstrap's),
   `readme.md` (:125-131, :305-328), `installer/CLAUDE.md` (:26-27),
   `.claude/skills/vwf-plugin/`. Leave passages that describe
   `stackgen:tool-config` itself — plan 3's — but say no vwf skill calls it.

## Verification

- `mise run p:plugins:check` — green.
- `grep -rnE 'setup:all|code:all|setup:ai:all' site/src/content/docs readme.md CLAUDE.md`
  — no hit that describes current behaviour.

## Guardrails

- `CLAUDE.md`, `installer/CLAUDE.md`, `readme.md` and `site/**` are
  dprint-formatted; never end a table cell in a bare asterisk; keep each code
  span on one line.
- Do not edit `docs/plans/**` or this repo's `.config/`.

## Commit

`docs: vwf shapes repos through bootstrap`
