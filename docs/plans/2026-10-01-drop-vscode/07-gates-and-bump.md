# V7 — Gates and bump

- **Wave:** 4
- **Depends on:** V6
- **Owns:** `site/package.json`, `plugins/stackgen/.claude-plugin/plugin.json`,
  `plugins/vwf/.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`,
  the `version:` line of
  `plugins/stackgen/stacks/{framework/astro,package-manager/pnpm,toolchain-gate/analysis-options,toolchain-gate/eslint,toolchain-gate/ruff,toolchain-gate/swift-format,toolchain-gate/swiftlint,toolchain-gate/tsconfig}/pack.yaml`
  and every bundle pin naming those packs,
  `plugins/stackgen/stacks/inventory.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md's Consent block.

## Ruling

> E7 — A project is bumped once per level since its last release, across plans
> 0–4; packs too.

The Consent block, quoted:

> - stackgen `2.0.0 → 3.0.0` … vwf `20.0.1 → 20.1.0` … site `1.1.49 → 1.1.50`
>   (patch): `mise run p:site:version`, bare … so V7 runs it first.
> - the 8 packs that carried a fragment, one patch each …

## Edits

1. **First, on a clean tree:** `mise run p:site:version`.
2. Apply E7 against the last released tags
   (`git tag --list 'stackgen-v*' 'vwf-v*' 'site-v*'`, and each pack's
   `version:` at the last `stackgen-v*` tag): stackgen `plugin.json` → `3.0.0`;
   vwf → `20.1.0` — unless already above the released version at that level,
   then leave it.
3. Each of the 8 packs: patch-bump `version:` once since the last release (skip
   a 13 or 17 component); update every bundle pin naming it
   (`grep -rn '<type>/<slug>@' plugins/stackgen/stacks`).
4. `mise run p:plugins:inventory`, `mise run p:plugins:marketplace`.

## Verification

- The full wave gate, green — this report is the run's final gate.
- `git diff --stat` touches only owned paths.

## Guardrails

- No tag, no `p:plugins:release`, no `p:site:release`.
- Delete with `rm`, never `git rm`.

## Commit

`ops: stackgen 3.0.0, vwf 20.1.0, site 1.1.50 — editor configuration dropped`
