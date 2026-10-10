# U7 — Gates: the bundle `os:` keys and the four pack bumps

- **Wave:** 3
- **Depends on:** U6
- **Owns:** `plugins/stackgen/stacks/bundles/swift-swiftui.md`,
  `plugins/stackgen/stacks/bundles/kotlin-compose.md`,
  `plugins/stackgen/stacks/bundles/dart-flutter.md`,
  `plugins/stackgen/stacks/bundles/claude-code.md`,
  `plugins/stackgen/stacks/bundles/claude-design.md`,
  `plugins/stackgen/stacks/app-framework/swiftui/pack.yaml`,
  `plugins/stackgen/stacks/app-framework/compose/pack.yaml`,
  `plugins/stackgen/stacks/design-tool/claude-code/pack.yaml`,
  `plugins/stackgen/stacks/design-tool/claude-design/pack.yaml`,
  `plugins/stackgen/stacks/inventory.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md's Wave gate and Gates the orchestrator keeps; U3's
  edit to `plugins/stackgen/assets/pack-format.md` (the `os:` shape); the owned
  files.

## Ruling

> - Decision D3: A bundle's frontmatter declares an optional `os:` map,
>   `<platform>: [ <os> ]`, beside `platforms:`. The stackgen stack-template
>   payload passes it through. vwf keeps the one table that maps (platform, OS)
>   to a frame, so vwf names no technology.
> - Decision D13: U7 owns the three app-framework bundles whole: the `os:` key
>   and the pins. Each bundle has one owner.
> - Decision D15: `swift-swiftui`: `mobile [ios]`, `tablet [ios]`,
>   `desktop [macos]`, `auto [carplay]`, `watch [watchos]`, `tv [tvos]`,
>   `spatial [visionos]`. `kotlin-compose`: `mobile [android]`,
>   `tablet [android]`, `watch [wearos]`, `tv [androidtv]`,
>   `auto [androidauto]`. `dart-flutter`: `mobile [ios, android]`,
>   `tablet [ios, android]`, `desktop [macos, windows, linux]`,
>   `auto [carplay, androidauto]`.
> - Decision D16: U7 bumps `app-framework/swiftui` 0.7.0 → 0.8.0,
>   `app-framework/compose` 0.4.0 → 0.5.0, `design-tool/claude-code` 0.5.0 →
>   0.6.0, `design-tool/claude-design` 0.3.0 → 0.4.0, re-pins the four bundles
>   and regenerates `inventory.md`, in one commit.

## Edits

1. **The three app-framework bundles** — add the `os:` map of D15 to each
   frontmatter, directly below `platforms:`, in the block style the file already
   uses. Each key must be in that bundle's `platforms:` list.
2. **The four `pack.yaml` files** — the `version:` line, per D16.
3. **The pins** — `swift-swiftui.md` `app-framework/swiftui@0.8.0`,
   `kotlin-compose.md` `app-framework/compose@0.5.0`, `claude-code.md`
   `design-tool/claude-code@0.6.0`, `claude-design.md`
   `design-tool/claude-design@0.4.0`.
4. Run `MISE_ENV=dev mise run p:plugins:inventory` to regenerate `inventory.md`.
5. Run the full wave gate, every line with `MISE_ENV=dev` exported.

If a `pack.yaml` does not read the "from" version in D16, stop and report
`UNRESOLVED:` with the value found — the required plan has not landed as
planned.

## Verification

- Every wave gate line is green, notably
  `mise run p:plugins:inventory -- --check` and `mise run p:plugins:check`.
- The orchestrator's bundle `os:` check in index.md holds.

## Guardrails

- Touch nothing outside the ten files. Never edit `plugin.json` or the
  marketplace manifest.
- A failing gate is reported as `UNRESOLVED:` naming the unit whose file caused
  it; do not fix another unit's file.
- No `git checkout` or `git restore`, and no formatter `--fix`, outside Owns.

## Commit

`feat: declare each bundle's OS targets and bump four packs for OS device frames`
