# U8 — docs: conditionals, nine questions, fifteen rules, and the decisions doc

- **Wave:** 3
- **Depends on:** R7
- **Owns:** `readme.md`, `CLAUDE.md`, `.claude/docs/**`,
  `.claude/skills/vwf-plugin/**`, `.claude/skills/stackgen-plugin/**`,
  `site/src/content/docs/**`,
  `docs/memory/decisions/2026-09-20-pack-intent-rendering.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** the wave-1 units' `CHANGED:` and `DOCS FALSIFIED:` lines, then
  every passage under Edits, then
  `${CLAUDE_PLUGIN_ROOT}/skills/docs-sync/SKILL.md`.
- **Lazy-load:** `${CLAUDE_PLUGIN_ROOT}/assets/memory.md`; the wave-1 files,
  only to quote landed wording.

## Ruling

Every decision in index.md's table, 1–9, is the source of truth; quote the
landed wording. Not a reversal: the decisions doc records the `conditional:` key
and its four axes, the two new questions, the editor split and what stayed, rule
15, and the graphify non-finding — and that B28 closes with this landing.

## Edits

1. Run `vwf:docs-sync` over the branch delta and apply its findings.
2. **`docs/memory/decisions/2026-09-20-pack-intent-rendering.md`** — new, per
   the memory shape; mirror to the palace `decisions` room when up.
3. **`CLAUDE.md`** — the Tasks section: `p:plugins:check` "fourteen rules" →
   fifteen, with a one-line rule 15 sentence in the file's style; the init
   paragraph: "asks seven questions" → nine, naming the two; `:170-176`, `:255`,
   `:264-268`, `:289`, `:353` where the hygiene set, the editor baseline or the
   rule count is described.
4. **`.claude/docs/repo-shape.md`** — the rule list;
   **`.claude/skills/plugin-authoring/SKILL.md`** — "the fourteen checker rules"
   → fifteen (the references file is U2's, already done).
5. **`.claude/skills/stackgen-plugin/SKILL.md`** (`:81`, `:136-146`, `:168-172`,
   `:195`, `:232`) — the landed set with conditions, the editor baseline, the
   fragments per pack; **`.claude/skills/vwf-plugin/**`** — the question count
   and the answers init passes.
6. **`site/src/content/docs/plugins/stackgen.md`** (`:416-422`, `:490-519`,
   `:555-600`) — the baseline section: conditional entries, the editor-wide
   fragment, the new astro and pnpm fragments, rule 15 under the checker;
   `:583-587` already true. **`site/src/content/docs/plugins/vwf.md`** —
   `### /vwf:init`'s question list (nine), the plan's "skipped" rows.
7. **`readme.md`** — only where a hit of
   `grep -n "fourteen\|seven questions" readme.md` reads false.
8. Every `DOCS FALSIFIED:` line the wave-1 units returned, applied.

## Verification

- `mise run p:site:check` green.
- `mise run code:precommit` green.
- `grep -rn "fourteen" readme.md CLAUDE.md .claude site/src/content/docs` — zero
  hits about the checker rules.
- `grep -rn "seven questions\|Seven questions" readme.md CLAUDE.md .claude site/src/content/docs`
  — zero hits.

## Guardrails

- No edit under `plugins/**` or `scripts/**`; quote landed wording.
- Never edit a version file, a `pack.yaml` or a generated file — U9.
- Do not end a table cell in a bare asterisk; keep every code span on one line.
- The site's link rule (`site/CLAUDE.md`).
- Delete with `rm`, never `git rm`.

## Commit

`docs: pack intent rendering — conditional files, nine questions, fifteen rules`
— written by the orchestrator after the wave gate. Type from
`.config/git-conventional-commits.yaml`; no scopes.
