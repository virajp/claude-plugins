# U7 — Gates, pack bumps and plugin versions

- **Wave:** 4
- **Depends on:** U6
- **Owns:** the `version:` line of the six packs' `pack.yaml` (pnpm, eslint,
  flutter, swift, swiftui, markdown), every
  `plugins/stackgen/stacks/bundles/*.md` pin naming them,
  `plugins/stackgen/stacks/inventory.md`,
  `plugins/stackgen/.claude-plugin/plugin.json`,
  `plugins/vwf/.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md's Consent block.

## Ruling

> - Decision 8: pnpm, eslint, flutter, swift, swiftui and markdown each bump one
>   minor from their `pack.yaml` version at run time (skipping a 13 or 17
>   component), with every bundle pin and `inventory.md`, in one commit.
> - Decision 9: For each plugin: if its current version is already tagged when
>   the run starts, bump the minor; otherwise ride it. No release step.

## Edits

1. **Pack bumps** — each of the six `pack.yaml` `version:` lines up one minor
   (x.y.z → x.(y+1).0, skipping 13 and 17); every bundle pin naming them
   (`grep -l '<type>/<slug>@' plugins/stackgen/stacks/bundles/*.md`).
2. **Plugin versions** — for stackgen and vwf: `git tag -l '<name>-v<version>'`;
   tagged → minor bump in `plugin.json` (skipping 13 and 17); untagged → no
   edit. Report each branch under `DECIDED:`.
3. **`mise run p:plugins:marketplace`** and **`mise run p:plugins:inventory`** —
   report diffs under `DECIDED:`. Steps 1–3 land in one commit.
4. **The full wave gate**, with `MISE_ENV=dev` exported.

## Verification

- `mise run p:plugins:marketplace -- --check` green
- `mise run p:plugins:inventory -- --check` green
- `mise run p:plugins:check` green
- `mise run p:plugins:shellcheck` green
- `pnpm vitest run` green
- `mise run code:precommit` green
- `mise run p:site:check` green
- `git status --porcelain` shows nothing outside the owned paths, nothing
  staged.

## Guardrails

- No tag, no release task, no commit. Touch nothing beyond the owned lines and
  files. Delete nothing.

## Commit

`ops: linter pin in the packs — pack bumps and versions` — written by the
orchestrator after the wave gate.
