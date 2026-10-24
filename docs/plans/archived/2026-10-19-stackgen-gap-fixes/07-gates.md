# U6 — Gates: the pack bumps, the pins and the inventory

- **Wave:** 4
- **Depends on:** U5
- **Owns:** the `version:` line of
  `plugins/stackgen/stacks/framework/android/pack.yaml`,
  `plugins/stackgen/stacks/app-framework/compose/pack.yaml`,
  `plugins/stackgen/stacks/language/kotlin/pack.yaml`,
  `plugins/stackgen/stacks/app-framework/flutter/pack.yaml`,
  `plugins/stackgen/stacks/design-tool/claude-code/pack.yaml` and
  `plugins/stackgen/stacks/app-framework/swiftui/pack.yaml`;
  `plugins/stackgen/stacks/bundles/kotlin-compose.md`,
  `plugins/stackgen/stacks/bundles/kotlin-library.md`,
  `plugins/stackgen/stacks/bundles/android-library.md`,
  `plugins/stackgen/stacks/bundles/dart-flutter.md`,
  `plugins/stackgen/stacks/bundles/claude-code.md`,
  `plugins/stackgen/stacks/bundles/swift-swiftui.md`;
  `plugins/stackgen/stacks/inventory.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md's Wave gate and Assumed decisions; `git diff --stat`
  of the branch against its base, to see which packs changed.

## Ruling

> - Decision D15: U6 bumps each pack whose files the branch changed by one
>   patch, from the version its `pack.yaml` reads at run time (the hand-off
>   bumps the major component first; a component of 13 or 17 is skipped):
>   `framework/android`, `app-framework/compose`, `language/kotlin`,
>   `app-framework/flutter`, `design-tool/claude-code`, and
>   `app-framework/swiftui` only if U4 changed its ux-gate skill. It re-pins the
>   bundles and regenerates `inventory.md`, in one commit.

## Edits

1. For each pack in D15, decide from the branch diff whether a file under that
   pack's folder changed. Skip a pack with no change, and record `DECIDED:`.
2. For each changed pack: read its `version:` line, raise the patch component by
   one (step past a 13 or a 17), and write it.
3. Re-pin every bundle line that names a bumped pack (`<type>/<slug>@<version>`)
   in the six owned bundle files. A bundle that pins no bumped pack is left as
   it is.
4. Run `MISE_ENV=dev mise run p:plugins:inventory` to regenerate `inventory.md`.
5. Run the full wave gate, every line with `MISE_ENV=dev` exported.

## Verification

- Every wave gate line is green, notably
  `mise run p:plugins:inventory -- --check` and `mise run p:plugins:check`.

## Guardrails

- Touch nothing outside the owned lines and files. Never edit `plugin.json`, the
  marketplace manifest, or any line of a `pack.yaml` other than `version:`.
- A failing gate is reported as `UNRESOLVED:` naming the unit whose file caused
  it; do not fix another unit's file.
- No `git checkout`, `git restore` or formatter `--fix` outside Owns.

## Commit

`fix: bump the packs the stackgen gap fixes changed`
