# U1 — The schema and the membership assets

- **Read first:** `plugins/vwf/assets/vwf-config.md` (the format 26 schema,
  about lines 51-162, and the reading rules), `plugins/vwf/assets/membership.md`
  whole, `plugins/vwf/assets/bootstrap-contract.md` (R3a), and the passages of
  the other owned files that name a key of D7.
- **Lazy-load:** R1a's `repo.toml` schema, decision D15 of
  `/Users/virajpatel/Projects/github.com/virajp/bootstrap/docs/plans/2026-11-14-config-folder/index.json`
  (or its archived path).

## Ruling

This file states each ruling in its final form. The ids point at the
`decisions` list of `index.json`.

- **D7, the key mappings:**
  - `product.name` → `repo.product_name`.
  - `topology`, `topology_reason` → `repo.topology`, `repo.topology_reason`.
  - Each `members[]` entry becomes `repo.members.<name>`, keyed by its
    `name` (D29): `path` → `folder`, `url` → `url`, `linkage` → `type`
    (`submodule` → `submodule`, `siblings` → `sibling`).
  - `members[].projects` → `projects.<p>.repo` = the member name, in
    `vwf.yaml`; a project of the base repo has no `repo` key.
  - `environments.<env>.<project>` → `repo.deploy.<env>.<project>`.
  - `production_env` → `repo.release_env`.
  - Every reader uses `bootstrap config get`, except the progress pane (D5).
- **D4, D17:** a submodule or sibling member finds the base with
  `bootstrap config get repo.home --json`. A folder member is a folder of the
  base repo's tree: its base is the git top level.
- **D14:** in `bootstrap-contract.md`, add the one exception to "the plugins
  never read `.config/bootstrap/`": the progress pane reads `[members.*]` and
  `[home]` of `repo.toml` (D5).
- **D10, D17:** each member takes its path from its own `type`: `submodule`
  takes the submodule path; `sibling` takes the siblings path; a `folder`
  member has no separate worktree, clone or landing: its work is the base
  repo's work.
- **D1:** `stack.template` and `repo.stack.template` stay in format 27.

## Edits

1. **`vwf-config.md`**: the schema becomes `config_format 27`; remove the
   moved keys from the YAML block and add `projects.<p>.repo`; one sentence per
   moved key names its `repo.toml` key; the reading rules say that the moved
   keys are read through `bootstrap config`.
2. **`membership.md`**: the members list, the back-link and the detection of
   present members, per D4 and D7.
3. **The other owned files**: each passage that names a moved key names its
   format 27 place.

## Verification

- `mise x -- mise run code:format` passes.
- K1 of `gates.keeps` finds no hit in the owned files, except a passage that
  names format 26 as history.

## Guardrails

- Touch nothing outside the owned paths.
- `plugins/**/*.md` is not formatted by dprint: keep the fold width by hand.
- Do not change `stack.template`, `repo.stack`, `harness`, `backing_template`,
  `deploy_template`, `languages` or `package_manager`: R4b and R5 own them.
- Delete with `rm`, never `git rm`.

## Commit

`feat: config_format 27 moves the repo facts to bootstrap's repo.toml`
