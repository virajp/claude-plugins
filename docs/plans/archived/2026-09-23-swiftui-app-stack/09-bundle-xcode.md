# U9 — The swift-swiftui bundle, reworked

- **Wave:** 3
- **Depends on:** —
- **Owns:** `plugins/stackgen/stacks/bundles/swift-swiftui.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** the bundle as it stands and index.md's *Amendment 2026-09-24*
  section.

## Ruling

Quoted from index.md: **E2′**, **E6′**, **E11′**, **E23**
("`package-manager/swiftpm` stays in the bundle; the bundle body says app
dependencies live in the Xcode project"), and **E1** (platforms unchanged, no
`default: true`).

## Edits

1. Frontmatter unchanged — the four pins at `@0.1.0`, the seven platforms.
2. Body: remove Tuist; the stack is a committed Xcode project created in Xcode,
   Xcode pinned by `XCODE_VERSION`, packages added through Xcode and locked in
   the project's `Package.resolved`; say the swiftpm component governs any local
   package the app splits out, not the app's own dependencies (E23).

## Verification

- `mise run p:plugins:check` green (rule 14 included).
- `grep -ni tuist` over the file is empty.

## Guardrails

- Touch nothing outside Owns.
- Match the surrounding fold width by hand.
- Never run `git checkout`, `git restore`, `git stash`, or a formatter's
  `--fix`, over any path outside Owns.

## Commit

Wave 3 lands as one commit (E27):
`refactor: swiftui stack — a committed Xcode project in place of Tuist`
