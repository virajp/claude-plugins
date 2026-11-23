# U4 — The scripts

- **Read first:** `plugins/vwf/skills/doctor/scripts/lib/stack.mjs` (the
  project `path` at about lines 160-185, the language and harness checks),
  `plugins/vwf/skills/execute/scripts/start.mjs` (the registry read at about
  line 297), `queue.mjs`, `yaml.mjs`, and their four test files, as R4a left
  them.
- **Lazy-load:** `plugins/vwf/assets/vwf-config.md` and `harness.md` as U1
  leaves them (S2).

## Ruling

This file states each ruling in its final form. The ids point at the
`decisions` list of `index.json`.

- **D11:** a project's folder is
  `bootstrap config get repo.projects.<name>.folder --json`, run in
  `projects.<p>.repo`, else in the base repo, through `spawnSync`, as R4a's
  scripts call bootstrap.
- **D9:** doctor reads a project's languages from `bootstrap describe --json`
  (`data.tools`, category and `projects`).
- **D10:** doctor reads a capability from `describe` `data.ports` or from
  `mise tasks ls --json`.
- **D5, D8:** the key names of format 28; the fixtures lose the removed keys
  and the registry `path`.
- **D18:** remove the unknown-language rule (`lib/stack.mjs`, about lines
  268-290) and `start.mjs` `--continue-unknown-language`; add the drift row of
  a project that no tool of category `languages` links.
- **D19:** the capability read is
  `mise tasks ls --json --no-global --hidden`, matched against the fixed
  names of `harness.md`.
- **D21:** the iac rule (`lib/stack.mjs`, about lines 162-185): an iac
  project whose folder in its own repo is not `.` is the finding, with the
  same waiver.
- **D22:** the tests stub `mise` on `PATH` too; no test runs the real mise.
- **D24:** the capability reads run in the repo that holds the project that
  needs the capability.
- **D25:** a failed `mise` call is a refusal, as a failed `bootstrap` call
  is; `needsMise` (`lib/stack.mjs`, about lines 35-51) keys on the pins alone.
- **D26:** a registry project with no `repo.projects.<name>` is a drift row
  with the fix `bootstrap config set repo.projects.<name> '{"folder":"<path>"}' --json`;
  `start.mjs` skips that project.
- **D27:** no drift row of D18 for a project whose platforms are all `iac`,
  `cicd` or `misc`.
- **D28:** the D18 row and the D26 row are `degraded`; a `degraded` row never
  stops `start.mjs`.
- **D29:** before you write code, run the real `bootstrap describe --json`
  (4.0.0, from the hand step) in a scratch repo. Record in the `DECIDED` line
  the exact JSON paths of a tool's category, its `projects` and a port's
  presence. The stub copies that real shape.
- **D31:** the D26 row also covers a new project whose folder a later plan
  unit creates; the row's fix stays the same.
- A failed `bootstrap` call is a refusal with its envelope's `errors` text, in
  the script's existing refusal form (R4a D23).
- The tests use R4a's stub `bootstrap` on `PATH`, extended to answer
  `describe` from the same JSON file. No test runs a real bootstrap.
- Each script stays dependency-free (checker rule 16).

## Edits

1. The owned scripts: D9, D10, D11.
2. The four test files and the fixtures: the format 28 shape.

## Verification

- `mise x -- pnpm vitest run` passes.
- `mise x -- mise run code:format` passes.

## Guardrails

- Touch nothing outside the owned files.
- Delete with `rm`, never `git rm`.

## Commit

`feat: the vwf scripts read projects and capabilities through bootstrap`
