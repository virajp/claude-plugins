# U3 — The swift-package bundle

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/stacks/bundles/swift-package.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** `plugins/stackgen/stacks/bundles/typescript-effect.md`,
  `plugins/stackgen/assets/pack-format.md:267-278,359-365`.

## Ruling

Quoted from index.md:

- **E1** — "`swift-package` is a language-bundle on `platforms: [packages]`; the
  app bundle `swift-swiftui` is plan 2c's."
- **E7** — "`language/swift` in bundle `swift-package`."
- From the shared-file rule: the four new packs are all `0.1.0`.

## Edits

1. **`swift-package.md`** — frontmatter: `name: Swift · package`, `axis` as
   typescript-effect, `kind: language-bundle`, `platforms: [packages]`,
   `components:` `language/swift@0.1.0`, `package-manager/swiftpm@0.1.0`,
   `toolchain-gate/swift-format@0.1.0`, `toolchain-gate/swiftlint@0.1.0`; no
   `default: true`. Body in typescript-effect's shape: a Swift package library,
   multi-platform availability, what it does not carry (no app target, no
   goldens), and where the doctrine lives (the swift pack's skill — named, never
   linked by plugin path).

## Verification

- `mise run p:plugins:check` green (rule 14).
- Every pin matches a `version: 0.1.0` its owning unit writes.

## Guardrails

- Touch nothing outside Owns.
- Never run the inventory generator — the orchestrator does (E14).
- Never run `git checkout`, `git restore`, `git stash`, or a formatter's
  `--fix`, over any path outside Owns.
- Delete with `rm`, never `git rm`.

## Commit

Wave 1 lands as one commit (E14):
`feat: Swift package stack — language/swift, swiftpm, swift-format and swiftlint packs, swift-package bundle`
