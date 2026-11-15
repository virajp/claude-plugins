# U1 — The format 28 schema and the assets

- **Read first:** `plugins/vwf/assets/vwf-config.md` (the format 27 schema as
  R4a left it: `repo.stack`, `projects.<p>.stack`, `harness`),
  `plugins/vwf/assets/harness.md` whole, `stack-vocabulary.md` whole,
  `templates/registry.yaml` (`path`), and `bootstrap-contract.md` (R3a).
- **Lazy-load:** bootstrap's R2d rulings,
  `/Users/virajpatel/Projects/github.com/virajp/bootstrap/docs/plans/2026-11-15-projects/index.json`
  (or its archived path).

## Ruling

This file states each ruling in its final form. The ids point at the
`decisions` list of `index.json`.

- **D8:** `config_format 28`. `projects.<p>.stack` keeps `template`,
  `frameworks`, `dependencies`, `services`, `deploy`, `os` and `note`.
  `repo.stack` keeps only `template`. The workspace `harness` block goes;
  `projects.<p>.harness.health` stays.
- **D5:** `backing_template` → `services`, `deploy_template` → `deploy`; the
  values stay slugs.
- **D6, D9:** a language is a bootstrap tool of category `languages`, and a
  package manager one of category `package-managers`, whose `projects` list
  names the project, read with `bootstrap describe --json` in the repo that
  holds the project. `stack-vocabulary.md` says so; the known/unknown check
  against a template's `language_facts` moves to R5.
- **D2, D10:** `harness.md` keeps the capability contract and maps each
  capability to its task: a port (`test:e2e`, `test:golden`) is read from
  `describe` `data.ports[].present`; any other capability is a task name in
  `mise tasks ls --json`. No capability is recorded in `vwf.yaml`.
- **D4, D11:** `templates/registry.yaml` and the example lose `path`
  (`vwf_registry: 3`, `blueprint_format 26`). A project's folder is
  `bootstrap config get repo.projects.<name>.folder --json`, run in
  `projects.<p>.repo`, else in the base repo.

- **D16:** `assets/blueprint-format` reads `26`.
- **D17:** `agents/architecture-writer.md` writes no `path` and writes
  `vwf_registry: 3`.
- **D18:** the unknown-language rule goes; a project with no linked language
  tool is drift; the per-language walk uses the tool name.
- **D19:** `harness.md` maps each capability to one fixed task name: `dev` →
  `dev`; `e2e_local` → port `test:e2e`; `local_stack` → `stack:up`;
  `e2e_staging` → `test:e2e:staging`; `goldens` → port `test:golden`;
  `test:load` → `test:load`; `screenshots` → `screenshots`. `health` stays
  per project. The read is `mise tasks ls --json --no-global --hidden`. A
  non-canonical name is not supported. The reads run in the repo that holds
  the project whose platform needs the capability (D24).
- **D32:** keep the pack payload keys `package_manager:` and `harness:` in
  the template payload block of `stack-adapter.md`; they are pack data, and R5
  removes them. K1 excuses them.
- **D27:** a project whose platforms are all `iac`, `cicd` or `misc` needs no
  linked language tool.

## Edits

1. **`vwf-config.md`**: the format 28 schema and its reading rules.
2. **`harness.md`**, **`stack-vocabulary.md`**, **`stack-adapter.md`**,
   **`execute-stages.md`**, **`capability-vocabulary.md`**,
   **`topologies/monorepo.md`**: each passage that names a key of D8 or the
   registry `path`.
3. **The registry template and example**: D11.
4. **The three agents**: each passage that reads the workspace `harness` or a
   project `path`.

## Verification

- `mise x -- mise run code:format` passes.
- K1 of `gates.keeps` finds no hit in the owned files, except a passage that
  names an earlier format as history (D23), and the pack payload shape in
  `stack-adapter.md` (D32).

## Guardrails

- Touch nothing outside the owned paths.
- `plugins/**/*.md` is not formatted by dprint: keep the fold width by hand.
- Do not change `stack.template` or `repo.stack.template`: R5 owns them.
- Delete with `rm`, never `git rm`.

## Commit

`feat: config_format 28 slims the stack and reads projects from bootstrap`
