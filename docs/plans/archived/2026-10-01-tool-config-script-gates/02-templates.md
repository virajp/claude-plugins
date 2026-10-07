# G2 — Gate templates: post-merge, the node pin

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/skills/tool-config/assets/dprint/**`,
  `plugins/stackgen/skills/tool-config/assets/pre-commit/**`,
  `plugins/stackgen/skills/tool-config/assets/gitleaks/**`,
  `plugins/stackgen/skills/tool-config/assets/grype/**`,
  `plugins/stackgen/skills/tool-config/assets/mise/.config/mise/conf.d/tools.dev.toml`,
  `plugins/stackgen/skills/tool-config/assets/mise/.config/mise/tasks/setup/precommit`,
  `scripts/src/fixtures/tool-config/mise/**` (plan 1's golden trees, for the
  node pin and the post-merge task change only)
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file whole.

## Ruling

> G6 — `post-merge` joins `default_install_hook_types`; `graphify-refresh` runs
> at `post-commit` and `post-merge`; a `post-commit` or `post-merge` hook is
> always written with `always_run: true`.

> G8 — node is pinned in the base `conf.d/tools.dev.toml` (exact, resolved).

> G10 — Rule 15 stays over the assets; one blank line between `repos:` entries,
> a requester block included.

## Edits

1. `pre-commit/.config/pre-commit-config.yaml` — add `post-merge` to
   `default_install_hook_types`; `graphify-refresh` gets
   `stages: [post-commit, post-merge]` and keeps `always_run: true`; every other
   post-stage hook carries `always_run: true`.
2. `pre-commit/.config/git-conventional-commits.yaml` — keep the scopes and
   forge-link `MARKED POSITION` anchors exactly as they are (the script finds
   them).
3. Each owned asset keeps the `# >>> <tool>` blocks it has; add an anchor only
   where a position has none the script can find unambiguously, in the same
   `MARKED POSITION` style.
4. `mise/.config/mise/conf.d/tools.dev.toml` — pin
   `node = { version = "latest" }` in the `mise` block (the script resolves it
   to an exact version when it writes, plan 1's D2), with a one-line comment:
   the tool-config script runs on it.
5. `mise/.config/mise/tasks/setup/precommit` — the install covers every type in
   `default_install_hook_types` (post-merge included); where it installs per
   type, add `post-merge`.
6. `scripts/src/fixtures/tool-config/mise/**` — mirror edits 4 and 5 into plan
   1's golden trees (the pinned node version is whatever the suite's fake
   `mise latest` returns), so plan 1's mise suite stays green.

## Verification

- `mise run p:plugins:check` green — rule 15's four lists still agree.
- `mise run p:plugins:shellcheck` green.
- `grep -n post-merge plugins/stackgen/skills/tool-config/assets/pre-commit/.config/pre-commit-config.yaml`
  shows the install type and the `graphify-refresh` stage.
- The full wave gate.

## Guardrails

- In the mise tree, touch only the two owned files — the rest is plan 1's.
- Task files keep mode `755` and their bash shebang.
- Delete with `rm`, never `git rm`.

## Commit

`refactor: gate templates install post-merge and pin node for the tool-config script`
