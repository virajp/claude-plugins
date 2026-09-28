# U4 — Gates and pack bumps

- **Wave:** 3
- **Depends on:** U3
- **Owns:** `.claude-plugin/marketplace.json`,
  `plugins/stackgen/stacks/inventory.md`, the `version:` line of
  `plugins/stackgen/stacks/toolchain-gate/dprint/pack.yaml` and
  `plugins/stackgen/stacks/toolchain-gate/pre-commit/pack.yaml`,
  `plugins/stackgen/stacks/bundles/repo-gates.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md's Consent block.

## Ruling

> **Release stackgen publicly** — none — no bump; rides stackgen `1.34.0`, which
> `2026-09-26-mise-conf-d-layout` bumps.

> - Decision 6: A pack whose content changes bumps its `pack.yaml` version, its
>   bundle pin and `inventory.md` in one commit: dprint `1.1.2` → `1.1.3`,
>   pre-commit `1.1.6` → `1.1.7`.

## Edits

1. **No plugin version edit.** Confirm
   `plugins/stackgen/.claude-plugin/plugin.json` is untouched on this branch.
2. **Pack bumps** — dprint `pack.yaml` `1.1.2` → `1.1.3`, pre-commit `pack.yaml`
   `1.1.6` → `1.1.7`, and both pins in `bundles/repo-gates.md`. Any other start
   value is `UNRESOLVED:`.
3. **`mise run p:plugins:marketplace`** and **`mise run p:plugins:inventory`** —
   `inventory.md` changes with the pack versions; report the diff under
   `DECIDED:`. Steps 2 and 3 land in one commit.
4. **The full wave gate.**

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

- No tag, no release task, no commit. Touch no doc or payload beyond the
  `version:` lines and the bundle pins. Delete nothing.

## Commit

`ops: dprint 1.1.3, pre-commit 1.1.7 — mise lock sidecar exclusions` — written
by the orchestrator after the wave gate.
