# U8 — The other readers: backlog, recall, doctor, setup and the assets

- **Wave:** 2
- **Depends on:** U1
- **Owns:** `plugins/vwf/skills/backlog/SKILL.md`,
  `plugins/vwf/skills/backlog/references/github.md`,
  `plugins/vwf/skills/recall/SKILL.md`, `plugins/vwf/skills/doctor/SKILL.md`,
  `plugins/vwf/skills/setup/references/onboard-pipeline.md`,
  `plugins/vwf/assets/membership.md`, `plugins/vwf/assets/memory.md`,
  `plugins/vwf/assets/topologies/multi-repo.md`,
  `plugins/vwf/skills/blueprint-authoring/references/frontmatter-and-links.md`,
  `plugins/vwf/skills/blueprint-authoring/SKILL.md`,
  `plugins/vwf/skills/blueprint/references/rename-and-delete.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file, top to bottom, and index.md's facts
  sections on the two schemas and the command line.

## Ruling

Decision 27: "Only `/vwf:execute` and the `plan-management` verbs run the format test. In a repo with the old format, `/vwf:backlog add` reads an absent `docs/plans/index.json` as no rows and can issue an id that a live plan holds; `/vwf:recall` and the planners' recall find no plan. The user accepted this until the repo is migrated." So no owned file gets a format test.

Decision 20: "U1 runs alone in wave 1 (with U9, which names no plugin path).
U3 to U8 run in wave 2 and depend on U1, because rule 6 of
`p:plugins:check` fails a `${CLAUDE_PLUGIN_ROOT}` path to `plan.mjs` before
U1 commits it."

Decision 5: "`plan.mjs`, `node:` builtins only, with the verbs `get`, `set`,
`append` and `validate`, as in the facts. No `yq` and no `jq`. `/vwf:doctor`
gets no new check."

Decision 7: "A dot path; a segment after a list chooses the entry by its `id`.
The value is a string, `--json` reads it as JSON."

Decision 18: "`/vwf:backlog` takes the next id from the item titles and the
`backlog` and `backlog_pieces` lists of the rows in `docs/plans/index.json`.
It reads the plan title for a `Landed:` line from the folder's `index.json`
`title`."

Approved ruling: "**`/vwf:backlog`** stops reading plan folders for its id
allocation."

Decision 21: "U8 also owns `plugins/vwf/skills/blueprint-authoring/SKILL.md`:
`:61-65` names `index.json`, and the `paths` glob at `:16` adds
`docs/plans/**/index.json`. U8 also owns
`plugins/vwf/skills/blueprint/references/rename-and-delete.md`, whose `:8`
names the `covers:` frontmatter."

## Edits

1. **`backlog/SKILL.md`** — `add`'s id rule: one past the highest `Bnn` over
   every item's title and the `backlog` and `backlog_pieces` of every row in
   `docs/plans/index.json` (decision 18); no plan folder is read. `partial` and
   `done` read the title with `plan.mjs get <folder>/index.json title --raw`.
   The callers pass the ids from the `backlog` and `backlog_pieces` keys of
   the folder's `index.json`. The "never does" line on ids follows.
2. **`backlog/references/github.md`** — replace the grep/sed pipeline over plan
   frontmatter (`:267-291`) with `plan.mjs get docs/plans/index.json plans`
   (an absent file reads as no rows) plus the item titles; the `Landed:`
   title read (`:350-352`) uses `plan.mjs get … title --raw`.
3. **`recall/SKILL.md`** — the resume reads the row `RUNNING` in
   `docs/plans/index.json` and the unit fields of the folder's `index.json`,
   not a Run log.
4. **`doctor/SKILL.md`** — the LSP answer is `consent.lsp.<language>` of the
   folder's `index.json`, not a Consent row. No `yq` check.
5. **`setup/references/onboard-pipeline.md`** — where it scaffolds
   `docs/plans/`, name `docs/plans/index.json` if it names the plan index at
   all; otherwise leave it.
6. **`assets/membership.md`**, **`assets/topologies/multi-repo.md`** — the
   plan index is `docs/plans/index.json`.
7. **`assets/memory.md`** — the `runs` room mirrors the run facts that
   `/vwf:execute` keeps in `index.json` (the unit fields), not a Run log.
8. **`blueprint-authoring/references/frontmatter-and-links.md`** — a plan
   folder's data is its `index.json`, not frontmatter on `index.md`.
9. **`blueprint-authoring/SKILL.md`** — `:61-65`: a plan folder is an
   `index.json` of `type` `vwf-plan` (or `vwf-change-plan`), not an
   `index.md` with frontmatter. `:16`: add `docs/plans/**/index.json` to the
   `paths` glob, beside `docs/plans/**/*.md`, so the skill still applies when
   a planner writes the file (decision 21). Keep the frontmatter strict YAML.
10. **`blueprint/references/rename-and-delete.md`** — `:8`: the active plans'
    `covers` list is in each folder's `index.json`, not `covers:`
    frontmatter (decision 21).

## Verification

- `grep -n "docs/plans/index.md\|Run log\|Status block\|Units table" <each owned file>`
  finds nothing.
- `grep -n "yq" plugins/vwf/skills/doctor/SKILL.md` finds nothing new.
- `mise x -- mise run code:format` is green.

## Guardrails

- Touch nothing outside the owned files.
- Change only what the format change falsifies.
- `plugins/**/*.md` is not formatted: keep lines at 80 columns by hand. Keep
  each code span on one line.

## Commit

`feat: backlog, recall and doctor read the JSON plan files`
