# U6 — The prose readers of members

- **Read first:** each owned file's passage that names a key of D7 or
  `vwf-membership`, and `plugins/vwf/assets/bootstrap-contract.md` (R3a).
- **Lazy-load:** `plugins/vwf/assets/vwf-config.md` and `membership.md` as U1
  leaves them (S2).

## Ruling

This file states each ruling in its final form. The ids point at the
`decisions` list of `index.json`.

- **D7:** the key mappings, as `01-assets.md` states them; every read goes
  through `bootstrap config get ... --json`.
- **D10:** each member takes its path from its own `type`: `submodule` takes
  the submodule path; `sibling` takes the siblings path; a `folder` member
  has no separate worktree, clone or landing (D17) (`execute/references/setup.md` about
  101-108, `reconcile.md` about 21 and 26, `preflight.md` about 86).
- **D15:** `stackgen-sync/SKILL.md` (about line 87): the back-link is
  bootstrap's `[home]`; change nothing else in that file.
- **D4, D17:** the back-link is `repo.home`; a folder member's base is the
  git top level.
- **D25:** a repo is a member when its `repo.home` has a value; with `null`
  it acts as a base. The doctor prose names the drift of a listed submodule
  or sibling member whose own `repo.home` is `null`, and its fix (D19).
- **D32:** the doctor prose names the drift of a `vwf-membership.yaml` left
  in a member whose `repo.home` resolves; on consent, doctor deletes it and
  commits the deletion through `git-workflow`.

## Edits

1. **`execute/references/**`**, **`execute/workflows/folder.md`**: the
   member lookups (`code-unit.md`, `land.md`, `preflight.md`, `reconcile.md`,
   `rules.md`, `setup.md`).
2. **`doctor/SKILL.md`**, **`doctor/references/stack-checks.md`**: the
   membership checks read `repo.members` and `repo.home`.
3. **`plan-management/SKILL.md`**, **`references/plan-index.md`**: the
   `target_repo` resolution.
4. **`init/**`**, **`git-workflow/SKILL.md`**: each passage that names a
   moved key.

## Verification

- `mise x -- mise run code:format` passes.
- K1 of `gates.keeps` finds no hit in the owned files.

## Guardrails

- Touch nothing outside the owned paths.
- `plugins/**/*.md` is not formatted by dprint: keep the fold width by hand.
- Delete with `rm`, never `git rm`.

## Commit

`feat: the skills resolve members through bootstrap config`
