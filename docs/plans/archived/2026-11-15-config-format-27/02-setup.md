# U2 — setup migrates format 26 to 27

- **Read first:** `plugins/vwf/skills/setup/references/format-lineage.md` and
  `migrate-pipeline.md` whole (how one format step is written), then each owned
  file's passage that names a key of D7, and
  `plugins/vwf/assets/bootstrap-contract.md` (R3a).
- **Lazy-load:** `plugins/vwf/assets/vwf-config.md` as U1 leaves it (S2).

## Ruling

This file states each ruling in its final form. The ids point at the
`decisions` list of `index.json`.

- **D7:** the key mappings, as `01-assets.md` states them.
- **D3:** the 26 → 27 step, per repo of the product:
  1. For each moved key, read `bootstrap config get <repo key> --json`.
  2. If its `source` is `default` (no value), run
     `bootstrap config set <repo key> <value> --json` with the `vwf.yaml`
     value (a list or a table as JSON).
  3. If the values are the same, only remove the key from `vwf.yaml`.
  4. If they differ, ask the user which to keep, one key at a time, and set
     the kept value.
  5. Remove the moved keys from `vwf.yaml`, add `projects.<p>.repo` from
     `members[].projects`, and set `config_format: 27`.
  6. The step's commit carries `vwf.yaml` and what bootstrap wrote.
- **D11:** compare each member field by field. If `linkage` is `submodule`,
  `.gitmodules` lists the path and `repo.toml` says `sibling` (a result of
  R1a's `init`), set `submodule` with no question. Every other difference asks.
- **D12:** set one field at a time:
  `bootstrap config set repo.members.<name>.<field> <value> --json`. A missing
  `url` comes from `.gitmodules` or `git -C <folder> remote get-url origin`;
  else ask the user.
- **D24:** a member that `repo.members` does not list yet is set as one whole
  table: `bootstrap config set repo.members.<name> '<JSON table>' --json`.
  D12 applies to a member that is listed.
- **D26:** a submodule or sibling member with no `.config/bootstrap/` keeps
  its `vwf-membership.yaml`, and the report names the fix: run
  `bootstrap init` in the member, then, from the base repo, `setup:configs`
  with the member's flag (`--<member>`).
- **D13:** a listed project with no `projects.<p>` entry gets one with only
  `repo`, and the report names it. A project that two members list stops that
  repo's step with a question: which member owns it.
- **D4:** after the base step, in each present member, delete
  `.config/vwf-membership.yaml` once `bootstrap config get repo.home --json`
  resolves to the base. A member whose back-link does not resolve keeps the
  file, and the report names it with the fix (D19): from the base repo, run
  `setup:configs` with the member's flag (`--<member>`). A folder member has
  no `vwf-membership.yaml` to delete (D17).
- **D20, D31:** each member commits the deletion of its
  `vwf-membership.yaml` through `git-workflow` first; then the base makes its
  step commit, with the new submodule pointers. The base step's sets (steps 1-5
  of D3) come before the member deletions; its commit comes after them.
- **D21:** after the sets, the step runs `bootstrap sync --json` in that repo
  and commits its output in the same step commit.
- A failed `bootstrap` call stops the step with bootstrap's `errors` (R3a
  D16); nothing of that repo's step is committed.

## Edits

1. **`references/format-lineage.md`**: the 26 → 27 row.
2. **`references/migrate-pipeline.md`**: the D3 and D4 step.
3. **`SKILL.md`** and the other owned references
   (`materialize.md`, `migration-and-consent.md`, `onboard-pipeline.md`,
   `topology-detection.md`, `workspace-structure.md`): each passage that
   writes or reads a moved key uses its `repo.toml` key through
   `bootstrap config`; the onboard path writes them through `config set`.

## Verification

- `mise x -- mise run code:format` passes.

## Guardrails

- Touch nothing outside `plugins/vwf/skills/setup/`.
- `plugins/**/*.md` is not formatted by dprint: keep the fold width by hand.
- Do not change the steps of earlier formats.
- Delete with `rm`, never `git rm`.

## Commit

`feat: setup migrates vwf.yaml to config_format 27`
