# U4 — vwf assets and other skills use bootstrap names

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/assets/vwf-config.md`,
  `plugins/vwf/assets/stack-adapter.md`, `plugins/vwf/assets/graphify.md`,
  `plugins/vwf/assets/memory.md`,
  `plugins/vwf/skills/git-workflow/references/worktree-setup.md`,
  `plugins/vwf/skills/handoff/SKILL.md`,
  `plugins/vwf/skills/mempalace/SKILL.md`,
  `plugins/vwf/skills/mockups/SKILL.md`, `plugins/vwf/skills/readme/SKILL.md`,
  `plugins/vwf/skills/blueprint/references/screen-review.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** every passage in the owned files that names `tool-config`,
  `stackgen.yaml`, `setup:all`, `code:all`, `setup:ai` or the task library.

## Ruling

> - Decision 3: Shaped means `.config/bootstrap.toml` exists.
> - Decision 4: Bootstrap's `setup:ai` installs vwf when it is absent; the vwf
>   docs name bootstrap's `setup:ai`.
> - Decision 6: vwf uses bootstrap's names: `setup` (was `setup:all`), `code`
>   (was `code:all`), `code:format`, `code:lint`, `setup:worktree` with `setup`
>   as the fallback.
> - Decision 7: forge and secrets come from the tools `.config/bootstrap.toml`
>   selects (`github`/`gitlab`; `fnox`/`doppler`).

## Edits

1. **`assets/vwf-config.md`** (:39, :125, :711, :718),
   **`assets/stack-adapter.md`** (:383, :418) — decisions 3 and 7.
2. **`skills/git-workflow/references/worktree-setup.md`** — :37: `.worktrees/`
   is ignored by bootstrap's `.gitignore`; :97-129: try `setup:worktree`, fall
   back to `setup`.
3. **`assets/graphify.md`**, **`assets/memory.md`**,
   **`skills/handoff/SKILL.md`**, **`skills/mempalace/SKILL.md`**,
   **`skills/mockups/SKILL.md`**, **`skills/readme/SKILL.md`**,
   **`skills/blueprint/references/screen-review.md`** — decision 6 names;
   `setup:ai` is bootstrap's (decision 4); no tool-config.

## Verification

- `mise run p:plugins:check` — green.
- `grep -nE 'tool-config|stackgen\.yaml|setup:all|code:all|setup:ai:all' <owned paths>`
  — no hit.

## Guardrails

- Touch only the owned files.
- `plugins/**/*.md` is not formatted; match the surrounding fold width by hand.

## Commit

`refactor: vwf names bootstrap's tasks`
