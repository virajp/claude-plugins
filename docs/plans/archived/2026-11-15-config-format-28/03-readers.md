# U3 — The prose readers

- **Read first:** each owned file's passage that names a key of D8, the
  workspace `harness`, or a project `path`, and
  `plugins/vwf/assets/bootstrap-contract.md` (R3a).
- **Lazy-load:** `plugins/vwf/assets/vwf-config.md` and `harness.md` as U1
  leaves them (S2).

## Ruling

This file states each ruling in its final form. The ids point at the
`decisions` list of `index.json`.

- **D5, D8:** the key names of format 28.
- **D9:** a project's languages and package manager come from
  `bootstrap describe --json` (D6: the tool name is the language).
- **D10:** a capability is present when its task exists, per `harness.md`.
- **D11:** a project's folder comes from
  `bootstrap config get repo.projects.<name>.folder --json`.
- `/vwf:architecture` writes a new project's folder with
  `bootstrap config set repo.projects.<name> '{"folder":"<path>"}' --json`
  in the repo that holds it, and writes no `path` to `registry.yaml`.
- **D31:** architecture writes that entry only when the folder exists.
  Otherwise the plan unit that creates the folder also runs the `config set`,
  and `plan/references/delta-checks.md` says so. Until then the D26 row
  reports the missing entry.
- **D28:** the D18 row and the D26 row are `degraded`; a `degraded` row never
  stops `/vwf:execute`.
- **D18:** the unknown-language rule and `--continue-unknown-language` go
  (`execute/workflows/folder.md` about line 130, `all.md` about line 205); a
  project with no linked language tool is doctor drift.
- **D19, D24:** each capability has one fixed task name, per `harness.md`,
  read in the repo that holds the project that needs it.
- **D26:** a registry project with no `repo.projects.<name>` is doctor drift,
  with the fix `bootstrap config set repo.projects.<name> ...`.
- **D27:** a project whose platforms are all `iac`, `cicd` or `misc` needs no
  linked language tool.
- A failed `bootstrap` call stops the skill with bootstrap's `errors` (R3a
  D16).

## Edits

1. Each owned file: the passages above.

## Verification

- `mise x -- mise run code:format` passes.
- K1 of `gates.keeps` finds no hit in the owned files.

## Guardrails

- Touch nothing outside the owned paths.
- `plugins/**/*.md` is not formatted by dprint: keep the fold width by hand.
- Delete with `rm`, never `git rm`.

## Commit

`feat: the skills read the stack, capabilities and folders of format 28`
