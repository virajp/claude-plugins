# U6 — The swift-swiftui and swift-package bundles

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/stacks/bundles/swift-swiftui.md`,
  `plugins/stackgen/stacks/bundles/swift-package.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** `plugins/stackgen/stacks/bundles/dart-flutter.md` (the
  app-framework bundle model) and
  `plugins/stackgen/stacks/bundles/typescript-effect.md` (the
  language-bundle-on-`packages` model),
  `plugins/stackgen/assets/pack-format.md:267-278,359-365`.

## Ruling

Quoted from index.md:

- **E1** — "Two bundles: `swift-swiftui` (app-framework,
  `platforms: [mobile, tablet, desktop, auto, watch, tv, spatial]`) and
  `swift-package` (language-bundle, `platforms: [packages]`)."
- **E7** — "`app-framework/swiftui` in bundle `swift-swiftui`; `language/swift`
  in bundle `swift-package`."
- From the shared-file rule: the new packs are all `0.1.0`.

## Edits

1. **`swift-swiftui.md`** — frontmatter: `name: Swift · SwiftUI`,
   `axis: project`, `kind: app-framework`,
   `platforms: [mobile, tablet, desktop, auto, watch, tv, spatial]`,
   `components:` `app-framework/swiftui@0.1.0`, `package-manager/swiftpm@0.1.0`,
   `toolchain-gate/swift-format@0.1.0`, `toolchain-gate/swiftlint@0.1.0`. No
   `default: true` (a native stack is a deliberate pick, and dart-flutter sets
   none). Body in dart-flutter's shape: one template for every Apple platform,
   the platform-to-OS mapping, when to pick it over Flutter, what the
   composition gives, and where the deep doctrine lives (the swiftui pack's
   skill — named, never linked by plugin path).
2. **`swift-package.md`** — `name: Swift · package`, `axis` and
   `kind: language-bundle` as typescript-effect, `platforms: [packages]`,
   `components:` `language/swift@0.1.0`, `package-manager/swiftpm@0.1.0`,
   `toolchain-gate/swift-format@0.1.0`, `toolchain-gate/swiftlint@0.1.0`. No
   `default: true`. Body: a Swift package library, multi-platform availability,
   what it does not carry (no app target, no goldens).

## Verification

- `mise run p:plugins:check` green (rule 14: no `default: true`).
- Every pin matches a `version: 0.1.0` the owning unit writes.

## Guardrails

- Touch nothing outside Owns; never edit `dart-flutter.md`.
- Never run the inventory generator — the orchestrator does, for the wave-1
  commit (E14).
- Never run `git checkout`, `git restore`, `git stash`, or a formatter's
  `--fix`, over any path outside Owns.
- Delete with `rm`, never `git rm`.

## Commit

Wave 1 lands as one commit (E14):
`feat: native Swift stack — language, swiftui, swiftpm and gate packs, two bundles`
