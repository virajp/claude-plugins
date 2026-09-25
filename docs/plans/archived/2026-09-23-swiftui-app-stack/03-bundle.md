# U3 — The swift-swiftui bundle

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/stacks/bundles/swift-swiftui.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** `plugins/stackgen/stacks/bundles/dart-flutter.md`,
  `plugins/stackgen/stacks/bundles/swift-package.md` (landed by 2b),
  `plugins/stackgen/assets/pack-format.md:267-278,359-365`.

## Ruling

Quoted from index.md:

- **E1** — "`swift-swiftui` is an app-framework bundle with
  `platforms: [mobile, tablet, desktop, auto, watch, tv, spatial]`."
- **E7** — "`app-framework/swiftui` in bundle `swift-swiftui`."
- From the shared-file rule: `app-framework/swiftui` at 0.1.0.

## Edits

1. **`swift-swiftui.md`** — frontmatter: `name: Swift · SwiftUI`,
   `axis: project`, `kind: app-framework`,
   `platforms: [mobile, tablet, desktop, auto, watch, tv, spatial]`,
   `components:` `app-framework/swiftui@0.1.0`, `package-manager/swiftpm@0.1.0`,
   `toolchain-gate/swift-format@0.1.0`, `toolchain-gate/swiftlint@0.1.0` (read
   the landed pack versions and use them if 2b's differ); no `default: true`.
   Body in dart-flutter's shape: one template for every Apple platform, the
   token-to-OS mapping, when to pick it over Flutter, what the composition
   gives, where the doctrine lives (the swiftui pack's skill — named, never
   linked by plugin path).

## Verification

- `mise run p:plugins:check` green (rule 14).
- Every pin matches a landed or U1-written version.

## Guardrails

- Touch nothing outside Owns; never edit `dart-flutter.md` or
  `swift-package.md`.
- Never run the inventory generator — the orchestrator does (E14).
- Never run `git checkout`, `git restore`, `git stash`, or a formatter's
  `--fix`, over any path outside Owns.
- Delete with `rm`, never `git rm`.

## Commit

Wave 1 lands as one commit (E14):
`feat: SwiftUI app stack — the swiftui pack and the swift-swiftui bundle`
