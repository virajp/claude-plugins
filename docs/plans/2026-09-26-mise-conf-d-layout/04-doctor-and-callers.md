# U4 — doctor reads the conf.d layout; callers pass MISE_ENV=dev

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/doctor/SKILL.md`,
  `plugins/vwf/skills/doctor/references/stack-checks.md`,
  `plugins/vwf/skills/git-workflow/references/worktree-setup.md`,
  `plugins/vwf/skills/readme/SKILL.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** `stack-checks.md` :95–110, :280–290, :420–460, :515–610,
  :645–655; `doctor/SKILL.md` :205–225; `worktree-setup.md` :90–120;
  `readme/SKILL.md` :65–115; index.md's Facts.

## Ruling

> - Decision 3: Every other section is its own file,
>   `.config/mise/conf.d/<section>.toml` for all environments and
>   `<section>.<env>.toml` for one.
> - Decision 4: One `.config/mise/mise.lock`.
> - Decision 5: A tool is pinned in one environment file only; a tool two
>   environments need goes in `tools.toml`.
> - Decision 6: every vwf caller uses `MISE_ENV=dev mise run setup:all`.
> - Decision 8: `REPO_NAME`, `MERGE_MODEL_DEVELOP`/`MAIN` and `MEMBERS` sit in
>   `conf.d/env.toml`, `PATH_ENTRIES` at its end; the `setup-<member>` alias
>   template in `conf.d/shell_alias.dev.toml`; `RUNTIME_BLOCK` stays in
>   `mise.toml` `[settings]`.
> - Decision 10: Doctor reads the new layout — the tool lookup, predicates (d),
>   (f), (g) — and reports: the old layout as shape drift (pointing at
>   `/vwf:setup reshape`); a tool pinned in two environment files; a tool pinned
>   in `mise.toml` / `mise.<env>.toml`, offering to move it into the matching
>   `conf.d/tools[.<env>].toml` with consent — the user: *"when a skill finds
>   that, it should move that particular tool in the relevant file in `conf.d`
>   with user's consent"*.
> - Decision 12: Any sentence you add is short.

## Edits

1. **`stack-checks.md`** — :101–102 the tool lookup reads
   `.config/mise/conf.d/tools*.toml` (and flags a tool in a top-level file);
   :284 the absence check names the new layout; :425 aliases in
   `conf.d/shell_alias.dev.toml`; :445–456 (d), :520, :568–606 (f), :649–651 (g)
   read `conf.d/env.toml` and `mise.toml` `[settings]` per decision 8. Add the
   three findings of decision 10: old layout (shape drift, one of the baseline
   predicates `/vwf:setup` already offers a reshape on), duplicate pin across
   environment files, tool outside `conf.d` (offer the move, with consent).
2. **`doctor/SKILL.md`** :213, :217–218 — follow.
3. **`worktree-setup.md`** — the fallback at :103–104 runs
   `MISE_ENV=dev mise run setup:all`; :109–116 says it installs from the lock
   and upgrades nothing.
4. **`readme/SKILL.md`** :73, :109 — the README's setup command is
   `MISE_ENV=dev mise run setup:all`.

## Verification

- `MISE_ENV=dev mise run p:plugins:check` green

## Guardrails

- `plugins/**/*.md` is not formatted — match the fold width by hand; no code
  span wraps a line.
- Touch nothing outside the four owned files.
- Delete with `rm`, never `git rm`; no `git checkout`/`restore`.

## Commit

`feat: vwf doctor reads the conf.d layout; callers pass MISE_ENV=dev` — written
by the orchestrator after the wave gate.
