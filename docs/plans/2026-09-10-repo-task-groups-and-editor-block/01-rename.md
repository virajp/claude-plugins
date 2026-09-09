# U1 — rename: the three task groups under `p:`, and every functional caller

- **Wave:** 1
- **Depends on:** —
- **Owns:** `.config/mise/tasks/{i,plugins,site}/**` →
  `.config/mise/tasks/p/{i,plugins,site}/**`; `.config/mise/tasks/code/format`;
  `.config/pre-commit-config.yaml`;
  `.github/workflows/{plugins,release,deps-update,site}.yml`;
  `.config/mise.toml`; `.config/mise.dev.toml`; `.gitignore`
- **Model:** opus
- **Read first:** every owned file, top to bottom, before editing; the facts
  section's caller list is the map.
- **Lazy-load:**
  `plugins/stackgen/stacks/toolchain-manager/mise/skills/mise/references/task-library.md`
  §`p:<id>:*` (`:447-510`) — the contract's own words, for the `_default`
  question below.

## Ruling

From index.md's assumed decisions, verbatim:

> **1.** `i:*` → `p:i:*`, `plugins:*` → `p:plugins:*`, `site:*` → `p:site:*`.
> The three directories move under `.config/mise/tasks/p/`; every functional
> caller and every descriptive mention outside history follows. The user:
> *"Rename to p:i, p:plugins, p:site"*.

> **6.** `.config/mise.dev.toml`'s `be-setup`/`fe-setup` aliases (`../backend`,
> `../frontend` — neither exists here) are dropped as residue from another repo.

> **8.** `docs/memory/**` and `docs/plans/archived/**` are untouched.

## Edits

1. **Move the three directories:**
   `mv .config/mise/tasks/i .config/mise/tasks/p/i`, the same for `plugins` and
   `site` (create `.config/mise/tasks/p/` first). Every file keeps its name,
   mode and content except the lines below.
2. **Intra-task calls** (functional): `p/i/publish:23-24` → `p:i:test`,
   `p:i:build`; `p/i/release:60` → `p:i:test`; `p/plugins/local:123` →
   `p:plugins:marketplace`; `p/plugins/release:53` →
   `p:plugins:marketplace --check`; `p/site/check:10` → `p:site:build`;
   `p/site/release:62` → `p:site:check`. And the descriptive lines in the same
   files: `p/i/publish:14`, `p/i/release:10,39,55`, `p/plugins/release:24`,
   `p/plugins/shellcheck:63`, `p/site/release:10,40,57`.
3. **`.config/mise/tasks/code/format:23`** — the comment naming a dead
   `plugins:build`: drop the reference (or rewrite to `p:plugins:check` if the
   sentence is about the checker; read it).
4. **`.config/pre-commit-config.yaml`** `entry:` lines `:22,37,48,55,71` —
   `mise run plugins:<x>` → `mise run p:plugins:<x>`. The hooks' `files:` scopes
   are untouched.
5. **Workflows.** `plugins.yml:53,56,59,67,101` and the strings at `:75,91`;
   `release.yml:101,104` (`p:i:test`, `p:i:build`) and the comment at `:23` —
   **nothing in its `on:` block**; `deps-update.yml:85,101` (`p:i:version`,
   `p:i:release --ci`) and `:72-73,99,102`; `site.yml:68` (`p:site:check`) and
   `:12,18`.
6. **`.config/mise.toml:29`** — the comment already says `p:<id>:*`; confirm and
   leave, or align a word if it names the old groups.
7. **`.config/mise.dev.toml`** — `:24` comment; in `[shell_alias]` (`:38`)
   remove the `be-setup` and `fe-setup` lines (decision 6). Nothing else in the
   block.
8. **`.gitignore:42,67`** — the two comments.
9. **No `_default` slot.** Each group already has real tasks; the pack's
   `_default` is for a project with no commands yet. Do not add one.

## Verification

- `mise tasks --hidden | awk 'NR>1 {print $1}' | grep -E '^(i|plugins|site):'` →
  nothing; `… | grep -cE '^p:(i|plugins|site):'` → `18`.
- `grep -rn 'mise run \(i\|plugins\|site\):' .config .github` → nothing.
- `grep -rn 'be-setup\|fe-setup' .config` → nothing.
- `mise run p:plugins:check`, `mise run p:plugins:marketplace --check`,
  `mise run p:plugins:inventory --check`,
  `mise run p:plugins:npm-normalize-test`, `mise run p:site:check`,
  `mise run p:i:test`, `mise run p:i:build` — all exit 0.
- `pre-commit run --all-files` green (actionlint over the four workflows; the
  shebang/executable checks over the moved files).
- `git diff --stat -- .github/workflows/release.yml` shows changes only on lines
  ≥ 90 (the steps), none in the `on:` block.

## Guardrails

- Do not touch `.config/mise/tasks/code/{git-config,count,all}` (U2),
  `.vscode/**` or `.config/vscode.d/**` or `setup/vscode` (U3),
  `.config/renovate.json` (U4), `scripts/**` or `installer/**` (U5), any doc or
  `plugins/**` (U6), the versions (U7).
- Do not touch `docs/memory/**` or `docs/plans/archived/**`.
- Move with `mv`, never `git mv`; delete with `rm`, never `git rm`; stage
  nothing. The exec bits survive `mv`; confirm with
  `find .config/mise/tasks/p -type f ! -perm -u+x` → nothing.
- Never run `git checkout`, `git restore`, `git stash`, or a formatter with
  `--fix` on a path outside your Owns.
- Write with Write/Edit, never `cat` heredocs.

## Commit

`refactor: the installer, plugins and site task groups move under p:` — written
by the orchestrator after the wave gate, not by the unit.
