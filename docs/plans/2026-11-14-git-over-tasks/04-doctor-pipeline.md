# U4 — doctor's forge rule and the pipeline seed use the core branches

- **Read first:** `plugins/vwf/skills/doctor/references/stack-checks.md`
  (g) Forge state (about lines 666-745), `doctor/SKILL.md` (the Covers cell,
  about line 221, and the forge text, about lines 300-302),
  `blueprint/SKILL.md` (about lines 372-375),
  `plugins/vwf/assets/delivery-pipeline.md` (`#pipeline`).
- **Lazy-load:** `docs/memory/gaps/2026-11-14-one-or-two-core-branches-parked.md`.

## Ruling

This file states each ruling in its final form. The ids point at the
`decisions` list of `index.json`. The plan was amended on 2026-11-18
(D36 to D42).

- **D3, doctor:** the core branches are the `data.value` of
  `bootstrap config get repo.core_branches --json` (D42). In (g), the forge
  default branch is drift only when it names a branch that is not a core
  branch, or a branch that does not exist. The protection check covers each
  core branch, not `develop` and `main` by name.
- **D3, pipeline:** when `/vwf:blueprint` seeds `conventions.md#pipeline`, it
  shows each repo's core branches with a preselected stage/prod pair (stage
  `develop` and prod `main` with two branches; stage and prod `main` with one),
  and the user confirms.
- **D4, D42:** any `merge_model` or `[tools.git.branch.*]` name left in the
  owned files (stack-checks.md about lines 709-710) becomes the landing key
  `repo.branches.<b>.landing` (`pr`, `direct-merge` or `direct-commit`).
- **D13:** nothing: R3a already removed (c) Branches.

## Edits

1. **`doctor/references/stack-checks.md`** (g) (about lines 666-745; `develop`
   and `main` by name at about lines 669-670 and 690-710) and
   **`doctor/SKILL.md`** (about lines 221 and 300-302): D3, D4.
2. **`blueprint/SKILL.md`** and **`assets/delivery-pipeline.md`** (about lines
   24-33): the D3 seed.
3. **`plugins/vwf/skills/setup/SKILL.md`** (about line 95, "protection on
   develop and main") and **`plugins/vwf/assets/templates/conventions.md`**
   (about line 115, "staging from develop"): D3 (D14).
4. **`doctor/references/stack-checks.md`** (g): a repo whose
   `repo.core_branches` is one branch and that still has a `develop` branch,
   local or on `origin`, is drift: bootstrap's merge then refuses every
   landing into `main` from another branch (merge library about lines
   216-221). The fix: delete `develop`, or set `merge_from` on `main` (D49).

## Verification

- `mise x -- mise run code:format --all` passes.
- K1 of `gates.keeps` finds no hit in the owned files.

## Guardrails

- Touch nothing outside the six owned files.
- `plugins/**/*.md` is not formatted by dprint: keep the fold width by hand.
- Delete with `rm`, never `git rm`.

## Commit

`feat: doctor and the pipeline seed read the core branches`
