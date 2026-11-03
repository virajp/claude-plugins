# U4 — git-workflow reads merge_model from .config/bootstrap.toml; ignore-line attributions

- **Read first:** every owned file, top to bottom, before editing.
- **Lazy-load:** bootstrap's `docs/sync/tools/git.md` and the `[branch.*]`
  rows of `docs/sync/index.md`'s key table, in a fresh clone (read only,
  removed after).

## Ruling

> - D2: Yes. B103 is in this plan.
> - D3: git-workflow reads merge_model of [branch.<destination>] from the
>   .config/bootstrap.toml of each repository it lands in, the root and each
>   member. When the file or the key is missing, the value is direct,
>   bootstrap's own default. The MERGE_MODEL_DEVELOP, MERGE_MODEL_MAIN and
>   legacy MERGE_MODEL env reads are deleted.
> - D12: optional-tools runs first; read the owned files as that plan left
>   them.

> - D26: This repo's four release tasks (p/release, p/plugins/release,
>   p/i/release, p/site/release) migrate to .config/bootstrap.toml. Each
>   reads merge_model of [branch.main] with yq, as bootstrap's _scripts/merge
>   does: pr refuses the full sequence as today; any other value, a missing
>   key or a missing file means direct. The MERGE_MODEL and MERGE_MODEL_MAIN
>   reads are deleted.
> - D28: When .config/bootstrap.toml exists but yq cannot read it,
>   git-workflow and the release tasks stop, as bootstrap's _scripts/merge
>   does, with the message cannot read the merge config of
>   .config/bootstrap.toml. A missing file still means direct.
> - D21: Every live mention of MISE_ENV=dev mise run setup:all becomes
>   MISE_ENV=dev mise run setup, and a bare mise run setup:all becomes mise
>   run setup; setup is the task bootstrap ships (setup/_default). The
>   MISE_ENV=dev prefix stays where it is today, because bootstrap loads no
>   conf.d file without MISE_ENV. History rows keep their text.
> - D22: git-workflow reads it as bootstrap's _scripts/merge does: pr means
>   pr; any other value, or no value, means direct. doctor reports a value
>   other than direct or pr as a warning with the remedy to fix
>   .config/bootstrap.toml.

## Edits

1. **`plugins/vwf/skills/git-workflow/SKILL.md`**
   - 34–42: the landing model is `merge_model` of `[branch.develop]` and
     `[branch.main]` in the repository's `.config/bootstrap.toml`, `direct`
     (default) or `pr`; `code:merge:develop` and `code:merge:main` read the
     same key when they run.
   - 200–216 (Step 4, before it offers the landing options): replace the
     `mise env -s bash` snippet with a read of the key, through the pinned
     yq, run in each repository's root. yq exits 1 on a missing file, so
     the snippet tests the file first and prints `direct` without it:
     `if [ -f .config/bootstrap.toml ]; then mise x -- yq -p toml '.branch.main.merge_model // "direct"' .config/bootstrap.toml; else echo direct; fi`
     (and the same for `.branch.develop`). Per D28, when the file exists
     and yq exits non-zero, the step stops with "cannot read the merge
     config of .config/bootstrap.toml." and offers no landing option. Keep
     it a bash snippet; no python.
   - 51: the `no-commit-to-branch` hook is in `.config/pre-commit-config.yaml`,
     synced by bootstrap; reword only if the text says tool-config renders it.
   - Remove every `MERGE_MODEL_DEVELOP`, `MERGE_MODEL_MAIN` and
     `MERGE_MODEL` name.
2. **`plugins/vwf/skills/git-workflow/references/landing.md`** — 18–22,
   35–39, 51, 65–71: the same key, read per repository (base and each
   member, from its own `.config/bootstrap.toml`).
3. **`plugins/vwf/skills/git-workflow/references/worktree-setup.md`** — 37:
   the `.worktrees/` line is in the repo's `.gitignore`, synced by
   bootstrap's git tool. 115–128 ("Why the probe prefers it"): rewrite the
   comparison of `setup:worktree` with the fallback against bootstrap's
   `.config/mise/tasks/setup/_default` and `setup/worktree`, read in the
   clone. Today the text says "Both tasks refuse an unset `MISE_ENV`" and
   that the fallback runs the upgrade verb. Bootstrap's `setup` runs an
   upgrade only with `--upgrade`. State only what the two scripts do.
4. **`plugins/vwf/skills/handoff/SKILL.md`** (146),
   **`plugins/vwf/skills/mockups/SKILL.md`** (171),
   **`plugins/vwf/skills/blueprint/references/screen-review.md`** (28) — the
   ignore line comes from the repo's `.gitignore`, synced by bootstrap's git
   tool, not tool-config's universal `.gitignore`.

5. **This repo's release tasks (D26)** — `.config/mise/tasks/p/release`
   (47–50), `p/plugins/release` (144), `p/i/release` (161–164) and
   `p/site/release` (172). Replace each `MERGE_MODEL` / `MERGE_MODEL_MAIN`
   read with a read of `merge_model` of `[branch.main]` from
   `.config/bootstrap.toml`, through `yq -p toml`, as bootstrap's
   `_scripts/merge` reads it. A missing file prints `direct`. If the file
   exists and yq exits non-zero, the task prints "cannot read the merge
   config of .config/bootstrap.toml." and exits 1 before it writes (D28).
   `pr` refuses
   the full sequence with the message each task prints today; any other
   value means `direct`. Update the comments above each check to match.
   Keep each task's other behaviour as it is.

- **D21, every owned file** — replace each live `setup:all` with
  `setup`, keeping a `MISE_ENV=dev` prefix where the line has one (mockups 179, screen-review 32, worktree-setup 104-126, readme/SKILL.md 73 and 110); leave history rows as they are. Verify with
  `grep -rn "setup:all"` over the owned paths: only history rows remain.
- **D22** — after the read, the snippet maps `pr` to `pr` and every other
  value to `direct`, as bootstrap's `_scripts/merge` does.

## Verification

- `mise x -- mise run code:format` and `mise x -- mise run p:plugins:check`
  are green.
- `grep -rn -E 'MERGE_MODEL|tool-config|mise env' plugins/vwf/skills/git-workflow plugins/vwf/skills/handoff/SKILL.md plugins/vwf/skills/mockups/SKILL.md plugins/vwf/skills/blueprint/references/screen-review.md`
  returns nothing.
- In a scratch directory under the scratchpad, a `.config/bootstrap.toml`
  with `[branch.main]` `merge_model = "pr"` makes the snippet print `pr`;
  with no file it prints `direct`.

- `grep -n 'MERGE_MODEL' .config/mise/tasks/p/release .config/mise/tasks/p/plugins/release .config/mise/tasks/p/i/release .config/mise/tasks/p/site/release`
  returns nothing, and `bash -n` passes on each of the four files.
- Run none of the four release tasks. They bump, commit, merge and tag.

## Guardrails

- Touch nothing outside the owned paths.
- Delete with `rm`, never `git rm`. Match the fold width by hand.
- Do not run the snippet against this repo's `.config/` with a write; it is
  read-only.

## Commit

`fix: git-workflow reads the merge model from .config/bootstrap.toml`
