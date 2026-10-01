# V2 — Packs, pack doctrine and the materializer drop the editor axis

- **Wave:** 1
- **Depends on:** —
- **Owns:** for each of `plugins/stackgen/stacks/framework/astro`,
  `package-manager/pnpm`, `toolchain-gate/analysis-options`,
  `toolchain-gate/eslint`, `toolchain-gate/ruff`, `toolchain-gate/swift-format`,
  `toolchain-gate/swiftlint`, `toolchain-gate/tsconfig`: its
  `config/.config/vscode.d/`, the `conditional:` block of its `pack.yaml` (never
  the `version:` line), and its `conventions.md`; plus
  `plugins/stackgen/stacks/toolchain-gate/swift-format/skills/swift-format/SKILL.md`,
  `plugins/stackgen/assets/pack-format.md`,
  `plugins/stackgen/assets/output-tree.md`,
  `plugins/stackgen/skills/stackgen-stack-template/**`,
  `plugins/stackgen/skills/stackgen-sync/**`
- **Model:** opus
- **Kind:** edit
- **Read first:** each owned `pack.yaml` and `conventions.md`; `pack-format.md`
  §"Editor fragments" (`:90-137`) and the axis table (`:294-326`).

## Ruling

> E1 — Retired everywhere: … the pack `conditional:` `when: editor`, … the
> materializer's condition.

> E2 — All 12 shipped fragments …

> E4 — `analysis-options` and `tsconfig` become doctrine-only packs: their
> `config/` tree and `conditional:` go; conventions and skill stay; bundles
> unchanged.

## Edits

1. For each of the 8 packs: `rm -r` `config/.config/vscode.d/`; remove the empty
   `config/.config/` and `config/` directories it leaves (analysis-options and
   tsconfig end with no `config/` at all); delete the `conditional:` block in
   `pack.yaml` — the comment above it through the `when:` lines — and nothing
   else.
2. Each pack's `conventions.md` (astro `:163-165`, pnpm `:43-50`,
   analysis-options `:15-23`, eslint `:41-50`, ruff `:43-50`, swift-format
   `:36-41`, swiftlint `:39-42`, tsconfig `:19-39`) — remove the fragment
   paragraph. For analysis-options and tsconfig, the "What this pack writes"
   section says the pack writes no file: its conventions and skill guide the
   agent when it writes `analysis_options.yaml` / the `tsconfig*.json` files,
   which belong to the project. Carry any rule the fragment encoded that still
   matters without an editor (e.g. Dart is formatted by the SDK formatter, not
   dprint) into the conventions text.
3. `swift-format/skills/swift-format/SKILL.md:83-85` — remove the editor
   passage.
4. `pack-format.md` — delete the "Editor fragments" section and every mention of
   `vscode.d`, the `editor` axis and `editor: vscode`
   (`:33,57-60,83-85,90-137,294,303,309-316,326,490`). `conditional:` stays
   documented only if another axis still uses it — check
   (`grep -rn -A3 '^conditional:' plugins/stackgen/stacks`); if none does, say
   the key is reserved with no axis in use.
5. `output-tree.md` (`:303-310,380-382,409`) — drop the "whole editor files"
   rule and the vscode lockfile example entry.
6. `stackgen-stack-template/SKILL.md` (`:156-159,186,192`) and
   `references/materializer.md` (`:21-23,117-123,141,172,199`) — no `editor`
   answer, no fragment landing, no `.vscode` fold.
7. `stackgen-sync/SKILL.md` (`:38,70,76,209-210`) — no fragment folding.

## Verification

- `find plugins/stackgen/stacks -path '*vscode.d*'` prints nothing.
- `grep -rn -E 'editor: vscode|vscode\.d' plugins/stackgen/stacks plugins/stackgen/assets plugins/stackgen/skills/stackgen-stack-template plugins/stackgen/skills/stackgen-sync`
  prints nothing.
- `mise run p:plugins:check` green together with V4's checker after the wave.
- `mise run p:plugins:inventory -- --check` green — no `version:` changes here.
- The full wave gate.

## Guardrails

- Never touch a pack's `version:` line or a bundle pin (V7).
- Leave flutter's `build-flavors-signing.md` (`.vscode/launch.json` guidance)
  and `plugins/stackgen/assets/ids.md` alone.
- `plugins/**/*.md` is not dprint-formatted: match fold width by hand.
- Delete with `rm`, never `git rm`.

## Commit

`refactor: packs ship no vscode fragment; the editor axis is retired`
