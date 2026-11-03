# U7 — Docs

- **Read first:** the run's branch delta (`git diff` from the branch base),
  every `DOCS FALSIFIED:` line U1 to U5 returned, and the U7 list in
  index.md's facts.
- **Lazy-load:** `plugins/vwf/assets/memory.md` (the decision-record
  format), `.dev-marketplace/plugins/vwf/skills/docs-sync/SKILL.md` or the
  installed `vwf:docs-sync`.

## Ruling

> - D9: Rule 15 (one formatter exclusion set) is retired, with its tests.
>   Rules 16 and 17 keep their numbers; the docs say sixteen rules, rule 15
>   retired.
> - D12: optional-tools runs first; the docs are as that plan left them.
> - D13: Confirmed by the user: 2026-09-26-tool-config,
>   2026-09-26-tool-config-gates, 2026-09-27-tool-config-hygiene,
>   2026-10-05-shaped-means-stackgen-yaml, 2026-10-05-doctor-drift-by-preview,
>   2026-10-05-stackgen-yaml-replaces-vwf-answers,
>   2026-10-01-trust-is-the-users-setup-all-is-tool-configs,
>   2026-10-01-tool-config-renders-with-a-node-script,
>   2026-10-05-tool-config-templates, checker rule 15, and git-workflow's
>   MERGE_MODEL_* env reads (the record 2026-09-20-branch-model). The docs unit writes one new decision record and
>   marks each reversed record superseded.
> - D27: setup:* and code:* are supported and owned by bootstrap (the
>   user's ruling). setup:ai:all and setup:ai:base become setup:ai,
>   code:format:all becomes code:format, code:lint:all becomes code:lint,
>   and code:check:all is dropped. History rows keep their text.
> - D21: Every live mention of MISE_ENV=dev mise run setup:all becomes
>   MISE_ENV=dev mise run setup, and a bare mise run setup:all becomes mise
>   run setup; setup is the task bootstrap ships (setup/_default). The
>   MISE_ENV=dev prefix stays where it is today, because bootstrap loads no
>   conf.d file without MISE_ENV. History rows keep their text.

## Edits

1. Run `vwf:docs-sync` over the run's branch delta; apply its findings and
   every `DOCS FALSIFIED:` line.
2. Make each U7 hit in index.md's facts true, re-grepped:
   `grep -rn -iE 'tool-config|stackgen\.yaml|MERGE_MODEL|setup:ai:(all|base)|code:[a-z]+:all' readme.md CLAUDE.md CONTRIBUTING.md .claude/docs .claude/skills site/src/content/docs plugins/stackgen/stacks/readme.md`.
   Per D27, `setup:ai:all` and `setup:ai:base` become `setup:ai`,
   `code:format:all` becomes `code:format`, `code:lint:all` becomes
   `code:lint`, and `code:check:all` is dropped. Name bootstrap as the owner
   of the `setup:*` and `code:*` tasks; do not restate what they do.
   Known hits outside the facts list: `site/src/content/docs/how-to/brownfield/migrate-old-vwf-repo.md`
   (72, 75), `.claude/skills/vwf-plugin/references/docs-tree.md` (141),
   and root `CONTRIBUTING.md` (30, the landing model).
   In particular:
   - `CLAUDE.md`: the stackgen row of the Plugins table (bootstrap owns the
     configs; no `stackgen:tool-config`); "seventeen rules" → sixteen rules,
     rule 15 retired, and the rule list in Tasks; the "shape tool-config
     lands" passages; the per-branch landing model reads
     `[branch.*].merge_model` in `.config/bootstrap.toml`. The release
     tasks refuse the full sequence unless `[branch.main].merge_model` in
     `.config/bootstrap.toml` is `direct` (a missing file or key is
     `direct`), per D26.
   - `.claude/skills/plugin-authoring/references/checks.md`: rule 15 marked
     retired; rules 11 and 16 lose the tool-config trees.
     `.claude/skills/plugin-authoring/SKILL.md`: drop the tool-config script
     layout, marker pair and asset rules; drop the stale
     `tool-config-pack.test.ts` reference.
   - `.claude/skills/stackgen-plugin/SKILL.md`, `.claude/skills/vwf-plugin/**`,
     `.claude/docs/**`: the skill, its script and its edges are gone; init
     runs bootstrap's readme prompt; setup and doctor as U2 and U3 left them.
   - `site/src/content/docs/plugins/stackgen.md`: delete the
     `/stackgen:tool-config` section, its synopsis, its skill-table row and
     the conf.d ownership table rows; fix every in-page link to them.
     `site/src/content/docs/plugins/vwf.md` and the how-to pages: init,
     setup, doctor and git-workflow as U1 to U4 left them.
   - `readme.md` and `plugins/stackgen/stacks/readme.md`: same.
3. Write `docs/memory/decisions/2026-11-03-tool-config-to-bootstrap.md` per
   `plugins/vwf/assets/memory.md`: what was decided (D3 to D9), the
   reversals of D13, and the rejected alternatives.
4. Add one superseded line at the top of each reversed record named in D13
   that exists in `docs/memory/decisions/`, pointing to the new record.
   Change nothing else in those records.
5. Apply D21 to each live `setup:all` in the owned docs: `readme.md`,
   root `CONTRIBUTING.md`, `.claude/skills/vwf-plugin/SKILL.md`,
   `.claude/skills/vwf-plugin/references/skills-and-agents.md`,
   `.claude/skills/stackgen-plugin/SKILL.md`,
   `site/src/content/docs/plugins/vwf.md`,
   `site/src/content/docs/plugins/stackgen.md` and
   `site/src/content/docs/how-to/greenfield/multi-repo.md`. Re-grep with
   `grep -rn 'setup:all'` over the owned docs: only history rows remain.

## Verification

- `mise x -- mise run code:format`, `mise x -- mise run code:lint` and
  `mise x -- mise run p:site:check` are green.
- The re-grep of step 2 returns only lines that state tool-config was
  removed or retired, or that name `.config/stackgen.yaml` as the old
  layout.
- `grep -rn -iE 'seventeen' CLAUDE.md .claude site/src/content/docs readme.md`
  returns nothing about the checker rules.

## Guardrails

- Touch only the owned paths; no plugin file, no `.config/**`, no
  `dprint.jsonc`.
- `CLAUDE.md` and `readme.md` are dprint-formatted: widening a table cell
  re-pads every row; never end a table cell in a bare asterisk.
- Site links: follow `site/CLAUDE.md`'s link rule.

## Commit

`docs: reconcile the docs with tool-config's removal and the bootstrap hand-off`
