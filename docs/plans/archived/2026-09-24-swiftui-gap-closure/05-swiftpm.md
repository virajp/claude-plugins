# U5 — The swiftpm pack: lockfile paths, and no advice for Xcode's lockfile

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/stacks/package-manager/swiftpm/**`,
  `plugins/stackgen/stacks/bundles/swift-package.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md's Facts and Assumed decisions; the whole swiftpm
  pack; `bundles/swift-package.md`; `bundles/swift-swiftui.md:68-73` (read-only
  — U4 owns it).

## Ruling

Quoted from index.md:

- **F2** — "swiftpm declares `Package.resolved` and
  `*.xcodeproj/project.xcworkspace/xcshareddata/swiftpm/Package.resolved`" in a
  new `lockfile:` fact beside `package_manager`.
- **F7** — "The swiftpm skill says that when the lockfile sits inside an
  `.xcodeproj`, the app's dependencies are Xcode's: resolve, update and inspect
  them through `mise run setup:deps:*`, never `swift package resolve`/`update`;
  the skill still governs a local package's `Package.swift`."
- **F9** — "`package-manager/swiftpm` 0.1.0 → 0.1.1 … `bundles/swift-package.md`
  pins swiftpm@0.1.1."

## Edits

1. **`pack.yaml`** — `version: 0.1.1`; the `lockfile:` fact (F2), placed where
   U1's `pack-format.md` puts it (beside `package_manager` in the pack's facts).
2. **`skills/swiftpm/SKILL.md`** — near the top (after the `paths:` scope,
   `:13-14`), a short passage per F7; the `swift package resolve`/`update`
   passages (`:73`, `:79`, `:84-86`) and the root-manifest assumption
   (`:117-119`) say they apply to a `Package.swift` the repo owns.
3. **`conventions.md`** (`:7-11`, `:23-25`) — the same scope in one sentence.
4. **`bundles/swift-package.md`** — pin swiftpm@0.1.1.

## Verification

- `mise run p:plugins:check` green.
- The `lockfile:` globs match a path of the shape
  `SmokeApp.xcodeproj/project.xcworkspace/xcshareddata/swiftpm/Package.resolved`.

## Guardrails

- Touch nothing outside Owns — `bundles/swift-swiftui.md` is U4's (it pins
  swiftpm@0.1.1 too, per F9).
- `plugins/**/*.md` is not formatted: match the surrounding fold width by hand.
- Never run `git checkout`, `git restore`, `git stash` or a formatter's `--fix`
  outside Owns.

## Commit

Wave 1 lands as one commit (F12):
`feat: pack facts — binary probes, lockfile paths, machine env`
