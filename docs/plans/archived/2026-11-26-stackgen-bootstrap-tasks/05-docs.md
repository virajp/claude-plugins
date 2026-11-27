# U5 — Docs

- **Read first:** every owned file that exists, and this plan's `index.md`
  facts.
- **Lazy-load:** `docs/memory/decisions/2026-10-01-repo-local-mise-skill-returns.md`
  (the decision reversed), `.dev-marketplace/plugins/vwf/assets/memory.md`
  (the decision record shape).

## Ruling

> D14 — Confirmed by the user: bootstrap owns and generates the repo-local
> mise skill now; stackgen lands none. U5 writes
> docs/memory/decisions/2026-11-26-mise-skill-is-bootstraps.md recording it.

> D4 — The planner session writes the prompt file in bootstrap's
> docs/prompts/ before the run; no unit owns it. The units cite the skill as
> `.claude/skills/mise/` and assume nothing more about it.

## Edits

1. Run `/vwf:docs-sync` over the branch delta, and apply its findings plus
   every `DOCS FALSIFIED:` line U1–U3 returned, inside the owned paths.
2. Known passages:
   - **`.claude/skills/stackgen-plugin/SKILL.md`** — :135-:153 (pack tasks
     source `_scripts/helpers` at :148 → Python uv scripts that import
     `helpers.py`), :260-:272 (the `p/_project/` tier: Python uv only),
     :336-:339 (rule 17: a tool is added with `bootstrap add tool`).
   - **`CLAUDE.md`** — the `p:plugins:check` paragraph: rule 11 now asks for
     a Python uv script under `p/_project/`; rule 17's text if it names the
     fix.
   - **`readme.md`** — :331-:351 where it describes pack tasks or tool pins.
   - **`site/src/content/docs/plugins/stackgen.md`** — :126 (`p/_project/icons`
     → `icons.py`) and any passage on pack tasks or generated skills.
   - **`.claude/docs/repo-shape.md`** — the checker rule descriptions, where
     rule 11 or 17 is described.
3. **`docs/memory/decisions/2026-11-26-mise-skill-is-bootstraps.md`** — the
   reversal of `2026-10-01-repo-local-mise-skill-returns.md` (D14), with D3,
   D3b and D6, and the rejected alternatives from `index.json`.

## Verification

- `mise x -- mise run code:format --all` and `mise x -- mise run code:lint --all` green.
- `grep -rn '_scripts/helpers[^.]' readme.md CLAUDE.md .claude/skills/stackgen-plugin site/src/content/docs`
  prints nothing.

## Guardrails

- Touch nothing outside the owned paths; report any other falsified passage
  as `DOCS FALSIFIED:`.
- `CLAUDE.md`, `readme.md` are dprint-formatted: widening a table cell
  re-pads every row, so run the unit gate after the edit.

## Commit

`docs: pack tasks in Python, and the mise skill is bootstrap's`
