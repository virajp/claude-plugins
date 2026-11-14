# U4 — The scripts read members through bootstrap config

- **Read first:** `plugins/vwf/skills/execute/scripts/start.mjs` (about lines
  290-370 and 520-530, the member lookup), `plugins/vwf/skills/doctor/scripts/`
  (`checks.mjs`, `lib/base.mjs`, `lib/membership.mjs`, `lib/stack.mjs`,
  `lib/index.mjs`), `plugins/vwf/skills/plan-management/scripts/lib/queue.mjs`
  and `yaml.mjs`, and their four test files.
- **Lazy-load:** `plugins/vwf/assets/vwf-config.md` as U1 leaves it (S2).

## Ruling

This file states each ruling in its final form. The ids point at the
`decisions` list of `index.json`.

- **D7:** the scripts read the members with
  `bootstrap config get repo.members --json` (a table keyed by name, each
  with `folder`, `type` and `url`) through `spawnSync`, run in the base repo,
  and parse the envelope's `data.value`. A project's repo comes from
  `projects.<p>.repo` in `vwf.yaml`.
- **D16, D22:** the scripts run bare `bootstrap` from `PATH`, as R3a's
  contract asset does (R3a U1, D3).
- **D10:** each member takes its path from its own `type`: `submodule` takes
  the submodule path; `sibling` takes the siblings path; a `folder` member is
  part of the base repo's tree, with no separate worktree, clone or landing
  (D17; `start.mjs`, about line 327). The fixtures under
  `scripts/src/fixtures/doctor-checks/` and `scripts/src/fixtures/plan-queue/`
  lose the moved keys (D9).
- **D4:** a script that runs in a member finds the base with
  `bootstrap config get repo.home --json`; exit 2 there is a refusal (D18). A
  folder member's base is the git top level (D17).
- **D25:** a repo is a member when `bootstrap config get repo.home --json`
  gives a value; with `null` it acts as a base. Doctor reports, as drift, each
  listed submodule or sibling member whose own `repo.home` is `null`, with the
  fix: from the base repo, run `setup:configs` with the member's flag
  (`--<member>`) (D19).
- **D32:** doctor reports, as drift, a `vwf-membership.yaml` in a member
  whose `repo.home` resolves. On consent, doctor deletes it and commits the
  deletion through `git-workflow`.
- **D33:** in a base or single repo, a `config get` exit 2 (no
  `.config/bootstrap/`) is a refusal with bootstrap's `errors` text (R3a D8).
- **D23:** a failed `bootstrap` call is a refusal with its envelope's `errors`
  text; an absent binary is a refusal with the contract asset's install hint;
  each in the script's existing refusal form.
- The tests put a stub `bootstrap` on `PATH` that answers `config get` from a
  JSON file in the temp repo. No test runs a real bootstrap.
- Each script stays dependency-free (checker rule 16).

## Edits

1. The owned scripts: D4 and D7.
2. The four test files: the stub of the ruling; the `vwf.yaml` fixtures lose
   the moved keys; one case each for a submodule, a sibling and a folder
   member.

## Verification

- `mise x -- pnpm vitest run` passes.
- `mise x -- mise run code:format` passes.

## Guardrails

- Touch nothing outside the owned files.
- Delete with `rm`, never `git rm`.

## Commit

`feat: the vwf scripts read members through bootstrap config`
