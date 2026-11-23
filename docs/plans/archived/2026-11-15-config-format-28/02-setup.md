# U2 — setup migrates format 27 to 28

- **Read first:** `plugins/vwf/skills/setup/references/format-lineage.md` and
  `migrate-pipeline.md` whole, with the 26 → 27 step that R4a wrote, and
  `plugins/vwf/assets/bootstrap-contract.md` (R3a).
- **Lazy-load:** `plugins/vwf/assets/vwf-config.md` as U1 leaves it (S2).

## Ruling

This file states each ruling in its final form. The ids point at the
`decisions` list of `index.json`.

- **D12, D7, D4:** the 27 → 28 step, per repo of the product:
  1. For each registry project held in this repo, run
     `bootstrap config set repo.projects.<name> '{"folder":"<path>"}' --json`
     with its registry `path`.
  2. Run `bootstrap detect --json`. Show its `projects` and `links`. On the
     user's yes, run `bootstrap detect --add --yes --json`.
  3. Report each project that no tool of category `languages` links, with the
     fix: `bootstrap add tool <tool>`, then `bootstrap detect --add`.
  4. Rename `backing_template` → `services` and `deploy_template` → `deploy`
     (D5).
  5. Remove `languages`, `package_manager`, `repo.stack.package_manager`,
     `repo.stack.tools` and the workspace `harness`.
  6. Remove `path` from `registry.yaml`; set `config_format: 28`,
     `blueprint_format: 26` and `vwf_registry: 3`.
  7. Run `bootstrap sync --json`, and commit as R4a's step does (members
     first, through `git-workflow`).
- **D20:** step 1 converts each base-relative `path` to a folder in the
  holding repo: strip that member's folder prefix; a path equal to it becomes
  `.`. A path outside every repo stops that repo's step with a question. A
  name that is not kebab case stops the step with a report. An existing entry
  at another folder asks which to keep (R4a D3). An entry at the same folder
  under another name takes vwf's name: set the new name, move its tool links
  (`bootstrap config set tools.<t>.projects '<JSON list>' --json`), then
  unset the old name.
- **D27:** step 3 skips a project whose platforms are all `iac`, `cicd` or
  `misc`.
- **D19:** step 5 reports each non-canonical task name that the old
  `harness` block recorded, so the user renames that task.
- A failed `bootstrap` call stops that repo's step with bootstrap's `errors`
  (R3a D16); nothing of that repo's step is committed.
- **D30:** the base repo's step 6 and its stamps run only after every member
  step succeeds. If a member step fails, the base step stops too.
- **D33:** if a project's `path` folder does not exist yet, step 1 skips its
  `config set`. The migration report shows the fix line
  `bootstrap config set repo.projects.<name> '{"folder":"<path>"}' --json`.
  The D26 `degraded` row of doctor reports it until the folder exists.
- **D34:** if a member repo is not on this machine, the migration stops. Its
  report names the member to clone. The base repo stays at format 27 until
  that member is present.
- **D8:** the onboard path writes format 28 directly, and the project folders
  through `config set`.

## Edits

1. **`references/format-lineage.md`**: the 27 → 28 row, and the
   `blueprint_format` 25 → 26 row.
2. **`references/migrate-pipeline.md`**: the step above.
3. **`SKILL.md`** and the other owned references: each passage that writes or
   reads a key of D8 or the registry `path`.

## Verification

- `mise x -- mise run code:format` passes.

## Guardrails

- Touch nothing outside `plugins/vwf/skills/setup/`.
- `plugins/**/*.md` is not formatted by dprint: keep the fold width by hand.
- Do not change the steps of earlier formats.
- Delete with `rm`, never `git rm`.

## Commit

`feat: setup migrates vwf.yaml to config_format 28`
