# U9 — Gates and bump

- **Wave:** 4
- **Depends on:** U8
- **Owns:** `plugins/stackgen/stacks/toolchain-manager/mise/pack.yaml`,
  `plugins/stackgen/stacks/toolchain-gate/pre-commit/pack.yaml`,
  `plugins/stackgen/stacks/toolchain-gate/eslint/pack.yaml`,
  `plugins/stackgen/stacks/toolchain-gate/ruff/pack.yaml`,
  `plugins/stackgen/stacks/package-manager/pnpm/pack.yaml`,
  `plugins/stackgen/stacks/package-manager/uv/pack.yaml`,
  `plugins/stackgen/stacks/app-framework/flutter/pack.yaml`,
  `plugins/stackgen/stacks/bundles/*.md`,
  `plugins/stackgen/stacks/inventory.md`,
  `plugins/stackgen/.claude-plugin/plugin.json`,
  `plugins/vwf/.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`,
  `site/package.json`. Touch nothing outside this list.
- **Model:** opus
- **Read first:** every owned `pack.yaml` (the `version:` line) and every bundle
  file that pins one of the seven packs
  (`grep -ln 'toolchain-manager/mise@\|toolchain-gate/pre-commit@\|toolchain-gate/eslint@\|toolchain-gate/ruff@\|package-manager/pnpm@\|package-manager/uv@\|app-framework/flutter@' plugins/stackgen/stacks/bundles/*.md`).
- **Lazy-load:** `.config/mise/tasks/p/plugins/inventory` for what the generator
  refuses (a pin naming a version the pack no longer carries).

## Ruling

Quoted from index.md:

> **13. Pack versions.** Every changed pack bumps **minor**: mise `1.0.1` →
> `1.1.0`, pre-commit gate, eslint, ruff, pnpm, flutter, uv each `X.Y.Z` →
> `X.(Y+1).0`. `pack.yaml`, the bundle pins that name each and `inventory.md`
> land in one commit.

> **Consent.** Release stackgen: minor —
> `plugins/stackgen/.claude-plugin/plugin.json` `1.6.2` → `1.7.0`. Release vwf:
> minor — `plugins/vwf/.claude-plugin/plugin.json` `19.15.1` → `19.16.0`.
> Release site: patch — `mise run p:site:version patch`. Release installer:
> none.

## Edits

1. Bump the seven `pack.yaml` `version:` fields minor. Read each current value
   first; do not assume.
2. Rewrite every bundle pin naming one of the seven packs to the new version.
3. `mise run p:plugins:inventory` — regenerates `inventory.md`.
4. `plugins/stackgen/.claude-plugin/plugin.json` `version` → `1.7.0`;
   `plugins/vwf/.claude-plugin/plugin.json` `version` → `19.16.0`.
5. `mise run p:plugins:marketplace` — regenerates both manifests (the dev one is
   gitignored).
6. `mise run p:site:version patch` — bumps `site/package.json`.
7. Run the full wave gate from index.md and report each line's result.

## Verification

- Every wave-gate line green:

  ```text
  mise run p:plugins:marketplace --check
  mise run p:plugins:inventory --check
  mise run p:plugins:check
  mise run p:plugins:shellcheck
  mise run p:plugins:npm-normalize-test
  pnpm vitest run
  pnpm exec tsc --noEmit -p installer
  pnpm exec tsc --noEmit -p scripts
  mise run p:site:check
  ```

- `grep -rn '@1\.0\.1' plugins/stackgen/stacks/bundles/` finds no mise pin left
  behind; the same for each of the other six old versions.
- `git diff --stat` touches only the owned paths.

## Guardrails

- Bumps only; no other edit anywhere.
- Never run `p:plugins:release`, `p:i:release` or `p:site:release` — those are
  the orchestrator's `ask` steps after landing.
- Never run `p:plugins:local` — it is an after-landing `run` step.
- Delete nothing.

## Commit

`ops: stackgen 1.7.0, vwf 19.16.0, site patch — the seven packs bump minor` —
written by the orchestrator after the wave gate. Type `ops`; no scope.
