# U2 — The app-framework/swiftui pack core

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/stacks/app-framework/swiftui/pack.yaml`,
  `plugins/stackgen/stacks/app-framework/swiftui/conventions.md`,
  `plugins/stackgen/stacks/app-framework/swiftui/config/**`,
  `plugins/stackgen/stacks/app-framework/swiftui/skills/swiftui/SKILL.md`,
  `plugins/stackgen/stacks/app-framework/swiftui/skills/ux-gate/**`
- **Model:** opus
- **Kind:** edit
- **Read first:** `plugins/stackgen/assets/kinds.md:754-835` and `:1137-1140`,
  `plugins/stackgen/assets/pack-format.md:151-258`, the whole
  `plugins/stackgen/stacks/app-framework/flutter/` pack except its reference
  bodies (pack.yaml, conventions.md, every task, `skills/flutter/SKILL.md`,
  `skills/ux-gate/SKILL.md`), and
  `plugins/stackgen/assets/artifact-doctrine.md`.
- **Lazy-load:** `plugins/stackgen/assets/output-tree.md:244-250,289-294`.

## Ruling

Quoted from index.md:

- **E2** — "Tuist: the app's project is declared in `Project.swift` /
  `Tuist.swift` and generated; tasks run `tuist install` / `tuist generate`."
- **E3** — "swift-format (`swift format`, from the toolchain) formats; SwiftLint
  (through mise) lints."
- **E4** — "The 12-topic bar, one reference per platform (iOS/iPadOS, macOS,
  CarPlay, watchOS, tvOS, visionOS), and Apple's core integrations — widgets and
  complications, App Intents, push notifications, StoreKit, Sign in with Apple.
  Third-party integrations parked."
- **E5** — "swift-snapshot-testing (Point-Free), through SwiftPM, under a
  `test:golden` task and the `goldens` harness."
- **E6** — "Tuist's `compatibleXcodeVersions` pins the version. A new optional
  language fact `binaries: [<name>…]` … lets doctor report a missing binary on
  `PATH` as **blocking** once the project is pinned; the swiftui tasks also fail
  fast."
- **E7** — "`app-framework/swiftui` in bundle `swift-swiftui`."
- **E9** — "Where `language/swift` and `app-framework/swiftui` ship the same
  task path, the two files are byte-identical unless the swiftui one must differ
  for Tuist; each differing pair is named in the unit's report."
- **E10** — "`sourcekit-lsp` declared in both new packs byte-identical to
  `app-framework/flutter/pack.yaml:55-60`; `mise_tool: n/a` for Xcode-provided
  tools."
- **E11** — "Tool configs land under `.config/` … No pack lands `Package.swift`,
  `Project.swift` or `Tuist.swift`; `tuist init` / `swift package init` create
  them."
- **E18** — Context7 for Tuist, SwiftLint, swift-format, swift-snapshot-testing
  and Apple APIs.

## Edits

1. **`pack.yaml`** — `name: SwiftUI`, `type: app-framework`,
   `category: native-ui`, `kind: app-framework`, `version: 0.1.0`, the axis the
   kind takes; `languages:` one member, `token: swift`, `role: primary`, facts
   `lsp: sourcekit-lsp`, `mise_tool: n/a`, `manifest: Project.swift`,
   `binaries: [xcodebuild, swift]` (E6). `lsp_servers:` the `sourcekit-lsp`
   entry copied byte for byte from `app-framework/flutter/pack.yaml:55-60`
   (E10). `harness:` `goldens → test:golden`, in flutter's shape. No
   `platforms:` (bundle-level only). Check the SDK-is-root test at
   `kinds.md:764-780` holds for Xcode + Tuist and say so in `conventions.md`.
2. **`conventions.md`** — Swift is the primary language with no platform edge
   (Objective-C interop is topic 8); Tuist owns the project, Xcode owns the
   build; `compatibleXcodeVersions` in `Tuist.swift` pins Xcode; configs under
   `.config/`; what every task does.
3. **`config/.config/mise/tasks/`** — the same task paths as `language/swift`
   (`code/format`, `code/lint`,
   `setup/deps/{install,audit,cleanup,outdated,upgrade}`) plus `test/golden`.
   Byte-identical to U1's where no Tuist step is needed (E9); where one is, the
   swiftui version differs and the report names the pair. Specifically:
   `setup/deps/install` fails fast when `xcodebuild` or `tuist` is missing, then
   `tuist install` and `tuist generate --no-open`; `setup/deps/cleanup` adds
   `tuist clean` and removes `Derived/`; `test/golden` runs the snapshot test
   target through `xcodebuild test` (or `tuist test`) with a `--record` flag to
   re-record — resolve the current swift-snapshot-testing and Tuist invocation
   through Context7. Since U1 and U2 write concurrently, write your copy from
   this ruling and Flutter's shape; the orchestrator's `cmp` gate reconciles.
4. **`skills/swiftui/SKILL.md`** — the router, `user-invocable: false`, `paths:`
   `**/*.swift`, `**/Project.swift`, `**/Tuist.swift`, `**/Info.plist`,
   `**/*.entitlements`; strict-YAML frontmatter. A topic table linking
   **exactly** the fixed filenames in index.md's shared-file rule — the eleven
   topic files, the six `platforms/` files and the five `integrations/` files —
   with one line each on when to read it. Do not write those files (U3 and U4
   do).
5. **`skills/ux-gate/`** — the fixed-name `ux-gate` skill for this pack's
   `goldens` harness, in flutter's `ux-gate` shape: render at the resolved
   viewport (`design.viewports.<project>.<platform>` in `.config/vwf.yaml`, else
   the platform default), run the snapshot suite and the accessibility audit
   Xcode offers, return what the vwf ux reviewer needs.

## Verification

- `mise run p:plugins:check` green (rules 4, 11, 13).
- `mise run p:plugins:shellcheck` green over the new tasks.
- Every reference the router links is one of the fixed filenames.

## Guardrails

- Touch nothing outside Owns — the reference files are U3's and U4's, the bundle
  U6's.
- Never land `Project.swift`, `Tuist.swift`, `Package.swift` or a root config
  (E11).
- Never format `config/` payload with this repo's dprint.
- Cite no plugin path in anything the pack lands (rule 13).
- Never run `git checkout`, `git restore`, `git stash`, or a formatter's
  `--fix`, over any path outside Owns.
- Delete with `rm`, never `git rm`.

## Commit

Wave 1 lands as one commit (E14):
`feat: native Swift stack — language, swiftui, swiftpm and gate packs, two bundles`
