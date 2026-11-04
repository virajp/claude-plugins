# U5 — Delete stackgen:tool-config, its tests and its checker rules

- **Read first:** `scripts/src/check.ts` and `scripts/src/check.test.ts`, top
  to bottom, before editing.
- **Lazy-load:** `plugins/stackgen/skills/tool-config/scripts/lib/render.mjs`
  (only to see what `SUBTASK_DIRS` holds before you delete it),
  `.claude/skills/plugin-authoring/references/checks.md` (read only: the
  rule texts).

## Ruling

> - D1: One plan finishes B102. The vwf callers move to bootstrap and
>   tool-config is deleted in the same landing, so no released state has vwf
>   calling a deleted skill.
> - D9: Rule 15 (one formatter exclusion set) is retired, with its tests.
>   Rules 16 and 17 keep their numbers; the docs say sixteen rules, rule 15
>   retired. The render.mjs import and SUBTASK_DIRS, the TOOL_CONFIG_*
>   constants, toolConfigTrees() and every walk over the tool-config trees,
>   and templateNameFaults are removed. Rule 11's allowlist under .config/
>   (test/, p/_project/) becomes a constant local to check.ts.
> - D12: optional-tools runs first; read check.ts and check.test.ts as that
>   plan left them.
> - D34: bootstrap's github tool owns the issue forms; init no longer
>   ships .github/ISSUE_TEMPLATE, so the checker's init allowlist drops it.
> - D24: init deletes existing-repo pass 1 (root files against the
>   allowlist), among others. Every citation of an existing-repo pass names
>   it by its title, never by number.

## Edits

1. **`plugins/stackgen/skills/tool-config/`** — delete the whole folder with
   `rm -rf`.
2. **`scripts/src/tool-config-render.test.ts`**,
   **`scripts/src/tool-config-template.test.ts`**,
   **`scripts/src/tool-config-values.test.ts`**,
   **`scripts/src/fixtures/tool-config/`** — delete with `rm` / `rm -rf`.
3. **`scripts/src/check.ts`**
   - Remove the import of `render.mjs` (today 41) and the `SUBTASK_DIRS`
     read (340). Where a rule still needs the subtask-folder list, define a
     local constant with the values it held; where rule 11 needs the
     `.config/` allowlist, define it locally (`test/`, `p/_project/`).
   - Remove `TOOL_CONFIG_ASSETS`, `TOOL_CONFIG_TEMPLATES`,
     `TOOL_CONFIG_SKILL`, `TOOL_CONFIG_ROOT_FILES`, `TOOL_CONFIG_ROOT_DIRS`,
     `TOOL_CONFIG_LANDED_SKILLS`, `toolConfigTrees()`, and each call site:
     `checkPackConfigTier` (keep the pack `config/` tier checks and the
     refusal of a pack `templates/` tier and of the retired keys),
     `frontmatteredDocs`, the landed-file walk, `isLandedPath`,
     `landingRootOf` (a pack's `config/` tier stays a landing root).
   - Remove `templateNameFaults` and its call, and every constant that only
     it uses (`TEMPLATE_GLOBAL_NAMES`, `TEMPLATE_TAG`,
     `TEMPLATE_TAG_GRAMMAR`, today about 446–471). Do not keep a local
     `SUBTASK_DIRS` for them.
   - Keep the retired-key entry `["tool-config", …]` (796): a pack that
     still carries the key must still be refused.
   - Retire rule 15: remove `EXCLUSION_LISTS`, `checkExclusionSets` and its
     call. Where the rule list or a message names rule numbers, leave 16
     and 17 as they are; a comment at the old place says rule 15 is
     retired.
   - Remove every doc comment that describes the deleted tree.
4. **`scripts/src/check.test.ts`** — delete the cases and fixtures for the
   removed code (the tool-config assets-root block, the tree walks, the
   "exclusion sets" describe); keep and adapt the cases that test pack
   `config/` tiers, rule 11's allowlist, the retired `tool-config:` key and
   rule 16, using a fixture path that is not `skills/tool-config/` where
   the old path only served as an example.
5. **`plugins/stackgen/assets/output-tree.md`** — 164 says the last tier
   is on the list because init's pass 1 reports root files the list does
   not name. D24 deletes that pass. Grep `plugins/` for other readers of
   the list. If one remains, name it by its title. If none remains, delete
   the sentence and the reason that follows it, and keep the list. Per
   D34, also fix 158–159: `.github/ISSUE_TEMPLATE/` is no longer a file
   `/vwf:init` writes; bootstrap's github tool writes it. Change nothing
   else in this file.
7. **D34, `scripts/src/check.ts`** (337) — drop `.github/ISSUE_TEMPLATE/`
   from `INIT_ROOT_ALLOWLIST` and fix its doc comment (now two root files
   and one directory). In `scripts/src/check.test.ts` (690–720), the clean
   case no longer has an issue form, the issue-form path becomes an
   outside-the-allowlist case, and the expected messages drop
   `.github/ISSUE_TEMPLATE/` from the list.
8. **D34, `plugins/stackgen/assets/taxonomy.md`** (51–52) — the issue
   forms are no longer `/vwf:init`'s own assets; bootstrap's github tool
   writes them. Reword that clause; change nothing else in this file.
6. **`plugins/stackgen/assets/ids.md`** (64–98) — the repo name is now
   `repo_name` in `.config/bootstrap.toml`, which bootstrap writes, and the
   commit scopes are bootstrap's `commit_scopes` (D31). Rewrite the token
   table's "Lands in" cells and "Who applies it" so the orchestrator (init)
   writes no `REPO_NAME` and no commit-scope list; the project id still
   lands in `p/<id>/` through the materializer. Delete the paragraph on the
   aggregator's member flags and `setup-<slug>` aliases (D14 deletes §10;
   bootstrap's `setup` takes no member flag). Keep the slug rule itself.

## Verification

- `mise x -- mise run code:format` is green.
- `mise x -- mise run p:plugins:check` is green.
- `mise x -- pnpm vitest run` is green.
- `mise x -- pnpm exec tsc --noEmit -p scripts` is green.
- `grep -rn -iE 'tool-config|TOOL_CONFIG|EXCLUSION_LISTS' scripts/src`
  returns only the retired-key entry and its test.
- `test ! -e plugins/stackgen/skills/tool-config` succeeds.

## Guardrails

- Touch nothing outside the owned paths: no exclude file (`dprint.jsonc`,
  `.config/**`), no doc other than `plugins/stackgen/assets/output-tree.md` and
  `plugins/stackgen/assets/ids.md` and `plugins/stackgen/assets/taxonomy.md`,
  no `vitest.config.mts`.
- The deletion and the `check.ts` change land in one commit: never leave
  the tree deleted with the import still in place.
- Delete with `rm`, never `git rm`.
- `scripts/src/**/*.ts` is formatted by dprint: run `code:format` before
  you return, and touch no file outside the owned paths with `--fix`.

## Commit

`refactor: delete stackgen:tool-config, its tests and checker rule 15`
