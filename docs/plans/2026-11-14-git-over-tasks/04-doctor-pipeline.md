# U4 — doctor's forge rule and the pipeline seed use the core branches

- **Read first:** `plugins/vwf/skills/doctor/references/stack-checks.md`
  (g) Forge state (about lines 682-760), `doctor/SKILL.md` (the Covers cell,
  about line 217), `blueprint/SKILL.md` (about lines 370-375),
  `plugins/vwf/assets/delivery-pipeline.md` (`#pipeline`).
- **Lazy-load:** `docs/memory/gaps/2026-11-14-one-or-two-core-branches-parked.md`.

## Ruling

This file states each ruling in its final form. The ids point at the
`decisions` list of `index.json`.

- **D3, doctor:** the core branches come from
  `bootstrap config get repo.core_branches --json`. In (g), the forge default
  branch is drift only when it names a branch that is not a core branch, or a
  branch that does not exist. The protection check covers each core branch,
  not `develop` and `main` by name.
- **D3, pipeline:** when `/vwf:blueprint` seeds `conventions.md#pipeline`, it
  shows each repo's core branches with a preselected stage/prod pair (stage
  `develop` and prod `main` with two branches; stage and prod `main` with one),
  and the user confirms.
- **D4:** any `merge_model` name left in the owned files becomes the landing
  key.

## Edits

1. **`doctor/references/stack-checks.md`** (g) and **`doctor/SKILL.md`**: D3,
   D4.
2. **`blueprint/SKILL.md`** and **`assets/delivery-pipeline.md`**: the D3 seed.
3. **`doctor/references/stack-checks.md`** (c) Branches (about line 546):
   remove any text that R3a D14 left (D13).
4. **`plugins/vwf/skills/setup/SKILL.md`** (about line 95, "protection on
   develop and main") and **`plugins/vwf/assets/templates/conventions.md`**
   (about line 115, "staging from develop"): D3 (D14).

## Verification

- `mise x -- mise run code:format` passes.
- K1 of `gates.keeps` finds no hit in the owned files.

## Guardrails

- Touch nothing outside the six owned files.
- `plugins/**/*.md` is not formatted by dprint: keep the fold width by hand.
- Delete with `rm`, never `git rm`.

## Commit

`feat: doctor and the pipeline seed read the core branches`
