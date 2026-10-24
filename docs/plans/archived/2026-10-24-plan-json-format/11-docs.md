# U11 — Docs

- **Wave:** 4
- **Depends on:** R10
- **Owns:** `readme.md`, `CLAUDE.md`, `.claude/docs/plugins.md`,
  `.claude/docs/ci-and-releases.md`, `.claude/skills/vwf-plugin/**`,
  `site/src/content/docs/**`,
  `docs/memory/decisions/2026-10-24-plan-json-format.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** `${CLAUDE_PLUGIN_ROOT}/skills/docs-sync/SKILL.md`, and
  index.md's Goal and facts.

## Ruling

Decision 2: "`plugins/vwf/hooks/monitor/` and `plugins/vwf/types/index.d.ts`
are not changed. The docs say that the progress pane cannot read the new
format until plan C: it still opens on each `/vwf:execute`
(`register.tsx:669-673`) and shows that no plan is running, because it reads
`docs/plans/index.md` (`register.tsx:393-400`)."

Decision 4: "JSON: `index.json` and `docs/plans/index.json`, each with
`"format": 1`. A reversal of rulings 1 and 2."

Decision 5: "`plan.mjs`, `node:` builtins only, with the verbs `get`, `set`,
`append` and `validate`, as in the facts. No `yq` and no `jq`. `/vwf:doctor`
gets no new check. A reversal of rulings 3, 4 and 12."

Decision 9 (in short): only the new format is supported; on the old format,
`/vwf:execute` and every `plan-management` verb stop before any change and
point to `docs/plans/migrate.md`; after the migration they work. Decision 10:
there is no `execute-old` and no `plan-management-old` skill.

The repo rule: "Docs ship with the change. Any change to plugin behavior must
reconcile `readme.md`, this file, and the manual under
`site/src/content/docs/` in the same commit."

## Edits

1. Run `vwf:docs-sync` over the run's branch delta and apply its findings
   inside the Owns list.
2. Apply every `DOCS FALSIFIED:` line that U1 to U9 returned.
3. Reconcile the passages the survey found:
   - `readme.md:246-247`; `CLAUDE.md:51` and the "Where the detail lives"
     paragraph (the plan index and its "one table"), `:62-65`, `:272`;
     `.claude/docs/plugins.md:12`; `.claude/docs/ci-and-releases.md:116`.
   - `.claude/skills/vwf-plugin/SKILL.md` (`:65-68`, `:85-89`, `:356`, and
     `plan.mjs`), `references/docs-tree.md:40-65`, `:103`,
     `references/assets.md:12-16`, `:36`,
     `references/skills-and-agents.md:35-51`.
   - `site/src/content/docs/plugins/vwf.md` — the `/vwf:plan`,
     `/vwf:execute`, `/vwf:plan-management` and `/vwf:change-plan` sections
     and the tree (`:438`, `:497`, `:509`, `:545`, `:857`, `:2464-2609`,
     `:2609-3174`, `:3174-3215`, `:3405-3491`, `:3502-3639`, `:3746`,
     `:3901`, `:3909`, `:4011`): `index.json`, `docs/plans/index.json`,
     `plan.mjs`, no Run log, the stop on the old format, the migration guide,
     and that the progress pane waits for plan C (decision 2).
   - `site/src/content/docs/how-to/operate/ad-hoc-change.md`,
     `how-to/operate/sessions-and-handoff.md:144`,
     `how-to/greenfield/single-repo.md`, `how-to/greenfield/multi-repo.md`,
     `how-to/index.md:68`, `plugins/mempalace.md:351`.
4. Write `docs/memory/decisions/2026-10-24-plan-json-format.md` per
   `${CLAUDE_PLUGIN_ROOT}/assets/memory.md`: the reversals table of
   index.md's Goal, the user's reason quoted, and decisions 1 to 28 in short.

## Verification

- `grep -rn "docs/plans/index.md\|Run log" readme.md CLAUDE.md .claude/docs .claude/skills/vwf-plugin site/src/content/docs`
  finds only passages about the old format or the migration on purpose.
- `mise x -- mise run p:site:check` is green (links and anchors).
- `mise x -- mise run code:format` is green.

## Guardrails

- Touch nothing outside the Owns list. Do not edit `plugins/**`.
- `CLAUDE.md`, `readme.md` and `site/**` are formatted by dprint: run
  `mise x -- mise run code:format` and accept its padding. Never end a table
  cell in a bare asterisk.
- Write in the style of each file.

## Commit

`docs: the plan folder and the plan index are JSON`
