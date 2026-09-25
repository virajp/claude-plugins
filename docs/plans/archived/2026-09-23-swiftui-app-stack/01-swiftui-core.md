# U1 — The app-framework/swiftui pack core

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
  `plugins/stackgen/assets/pack-format.md:151-258`, the landed
  `plugins/stackgen/stacks/language/swift/` pack whole (its tasks are what you
  copy), the Flutter pack's `pack.yaml`, `conventions.md`,
  `skills/flutter/SKILL.md` and `skills/ux-gate/SKILL.md`, and
  `plugins/stackgen/assets/artifact-doctrine.md`.
- **Lazy-load:** `plugins/stackgen/assets/output-tree.md:244-250,289-294`.

## Ruling

Quoted from index.md:

- **E2** — "Tuist: the app's project is declared in `Project.swift` /
  `Tuist.swift` and generated; tasks run `tuist install` / `tuist generate`."
- **E5** — "swift-snapshot-testing (Point-Free), through SwiftPM, under a
  `test:golden` task and the `goldens` harness."
- **E6** — "Tuist's `compatibleXcodeVersions` pins the version; the pack
  declares `binaries: [xcodebuild, swift]`; the tasks fail fast."
- **E7** — "`app-framework/swiftui` in bundle `swift-swiftui`."
- **E9** — "The swiftui pack's tasks are **copied** from the landed
  `language/swift` tasks, byte-identical wherever no Tuist step is needed; each
  file that differs is named in U1's report with the reason."
- **E10** — "`sourcekit-lsp` declared byte-identical to
  `app-framework/flutter/pack.yaml:55-60`."
- **E11** — "No pack lands `Project.swift`, `Tuist.swift` or `Package.swift`;
  `tuist init` creates them."
- **S4** — "U1's router links topics 1–11 only; plan 2d adds the platform and
  integration rows with their files, so no row ever links a missing file."
- **E18** — Context7 for Tuist, swift-snapshot-testing and Apple APIs.

## Edits

1. **`pack.yaml`** — `name: SwiftUI`, `type: app-framework`,
   `category: native-ui`, `kind: app-framework`, `version: 0.1.0`, the axis the
   kind takes; `languages:` one member, `token: swift`, `role: primary`, facts
   `lsp: sourcekit-lsp`, `mise_tool: n/a`, `manifest: Project.swift`,
   `binaries: [xcodebuild, swift]`. `lsp_servers:` the `sourcekit-lsp` entry
   copied byte for byte from `app-framework/flutter/pack.yaml:55-60`. `harness:`
   `goldens → test:golden`, in flutter's shape. No `platforms:` (bundle-level
   only). Confirm the SDK-is-root test at `kinds.md:764-780` holds for Xcode +
   Tuist and say so in `conventions.md`.
2. **`conventions.md`** — Swift is the primary language with no platform edge
   (Objective-C interop is topic 8); Tuist owns the project, Xcode owns the
   build; `compatibleXcodeVersions` in `Tuist.swift` pins Xcode; configs under
   `.config/`; what every task does.
3. **`config/.config/mise/tasks/`** — start by **copying** every task file from
   `plugins/stackgen/stacks/language/swift/config/.config/mise/tasks/` (keep
   mode 755). Change a copy only where Tuist needs it, and name each changed
   file with its reason in your report: `setup/deps/install` fails fast when
   `xcodebuild` or `tuist` is missing, then `tuist install` and
   `tuist generate --no-open`; `setup/deps/cleanup` adds `tuist clean` and
   removes `Derived/`. Add `test/golden`: run the snapshot test target through
   `tuist test` or `xcodebuild test` with a `--record` flag to re-record,
   resolving the current invocation through Context7.
4. **`skills/swiftui/SKILL.md`** — the router, `user-invocable: false`, `paths:`
   `**/*.swift`, `**/Project.swift`, `**/Tuist.swift`, `**/Info.plist`,
   `**/*.entitlements`; strict-YAML frontmatter. A topic table linking
   **exactly** the eleven fixed filenames in index.md's shared-file rule, one
   line each on when to read it, and one sentence saying per-platform and
   integration references are added beside them (no link yet — S4).
5. **`skills/ux-gate/`** — the fixed-name `ux-gate` skill in flutter's shape:
   render at the resolved viewport (`design.viewports.<project>.<platform>` in
   `.config/vwf.yaml`, else the platform default), run the snapshot suite and
   the accessibility audit Xcode offers, return what the vwf ux reviewer needs.

## Verification

- `mise run p:plugins:check` green (rules 4, 11, 13).
- `mise run p:plugins:shellcheck` green over the tasks.
- Every file the router links is one of the eleven fixed filenames.

## Guardrails

- Touch nothing outside Owns — the topic files are U2's, the bundle U3's,
  `language/swift` is read-only.
- Never land `Project.swift`, `Tuist.swift`, `Package.swift` or a root config.
- Never format `config/` payload with this repo's dprint.
- Cite no plugin path in anything the pack lands (rule 13).
- Never run `git checkout`, `git restore`, `git stash`, or a formatter's
  `--fix`, over any path outside Owns.
- Delete with `rm`, never `git rm`.

## Commit

Wave 1 lands as one commit (E14):
`feat: SwiftUI app stack — the swiftui pack and the swift-swiftui bundle`
