# U8 — The topic references, reworked for a committed Xcode project

- **Wave:** 3
- **Depends on:** —
- **Owns:**
  `plugins/stackgen/stacks/app-framework/swiftui/skills/swiftui/references/*.md`
  (the eleven topic files, top level only)
- **Model:** opus
- **Kind:** edit
- **Read first:** the eleven files as they stand, index.md's *Amendment
  2026-09-24* section, and U7's unit file (the tasks it will ship — you write
  against its rulings, not its output, which lands concurrently).

## Ruling

Quoted from index.md: **E2′**, **E6′**, **E11′**, **E20**, **E21**, **E19**
("swift-dependencies … topic 3 recommends it as the pack's DI, topic 10 covers
`testValue` / `previewValue` and `withDependencies` overrides"), and **E18**
(Context7 for swift-snapshot-testing, swift-dependencies and Apple APIs).

## Edits

1. Remove Tuist from every file. Where a file explains the project model
   (chiefly `project-layout.md`, `build-and-signing.md`, `testing.md`,
   `pick-and-trade.md`), state E2′/E11′: the `.xcodeproj` is created in Xcode
   and committed; source files need no project edit (synchronized folders);
   targets, packages and build settings are changed in Xcode, or by an agent
   editing `project.pbxproj` with care; `Package.resolved` is committed inside
   the project.
2. `build-and-signing.md` — E6′'s `XCODE_VERSION` check in place of
   `compatibleXcodeVersions`; configurations and schemes as Xcode defines them.
3. `testing.md` — E20's `SIMULATOR_*` pin and one-run overrides; the
   `SnapshotTests` target created in Xcode; E21; the artifact placement as it
   now reads.
4. `pick-and-trade.md` — the trade is SwiftUI in a committed Xcode project; say
   plainly why no generator (no CLI creates a project; the cost is hand-editing
   targets and packages).
5. Prose only — no code listings (`kinds.md:1137-1140`).

## Verification

- `mise run p:plugins:check` green.
- `grep -rni tuist` over the eleven files is empty.

## Guardrails

- Touch nothing outside Owns.
- Match the surrounding fold width by hand (`plugins/**/*.md` is not formatted).
- Never run `git checkout`, `git restore`, `git stash`, or a formatter's
  `--fix`, over any path outside Owns.
- Delete with `rm`, never `git rm`.

## Commit

Wave 3 lands as one commit (E27):
`refactor: swiftui stack — a committed Xcode project in place of Tuist`
