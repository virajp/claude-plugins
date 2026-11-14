# U3 — The writers and readers of product, topology and environments

- **Read first:** each owned file's passage that names a key of D7, and
  `plugins/vwf/assets/bootstrap-contract.md` (R3a).
- **Lazy-load:** `plugins/vwf/assets/vwf-config.md` as U1 leaves it (S2).

## Ruling

This file states each ruling in its final form. The ids point at the
`decisions` list of `index.json`.

- **D7:** the key mappings, as `01-assets.md` states them. A skill that writes
  a moved key (for example `/vwf:architecture`, which records topology and
  members) writes it with `bootstrap config set ... --json`; a skill that reads
  one (for example `/vwf:verify`, which reads the environment URLs and the
  release environment) reads it with `bootstrap config get ... --json`.
- **D30:** `/vwf:architecture` writes each member's `type`: `submodule` or
  `sibling` from the user's link answer; `folder` for a member folder inside
  the base repo's tree that is not a submodule. It writes `projects.<p>.repo`
  for each project that it places in a member.
- A failed `bootstrap` call stops the skill with bootstrap's `errors` (R3a
  D16).

## Edits

1. **`architecture/**`**: the topology, members and product writes.
2. **`verify/SKILL.md`**: `repo.deploy.<env>.<project>` and
   `repo.release_env`.
3. **`plan/SKILL.md`**, **`blueprint-authoring/references/flow-contract.md`**,
   **`product-foundations/references/disaster-recovery.md`**,
   **`readme/references/steps.md`**,
   **`documentation-standards/references/diagrams.md`**: each passage that
   names a moved key.

## Verification

- `mise x -- mise run code:format` passes.
- K1 of `gates.keeps` finds no hit in the owned files.

## Guardrails

- Touch nothing outside the owned paths (under `plugins/vwf/skills/`).
- `plugins/**/*.md` is not formatted by dprint: keep the fold width by hand.
- Delete with `rm`, never `git rm`.

## Commit

`feat: the skills read and write the repo facts through bootstrap config`
