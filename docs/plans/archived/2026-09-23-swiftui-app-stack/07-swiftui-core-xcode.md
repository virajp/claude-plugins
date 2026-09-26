# U7 — The swiftui pack, reworked for a committed Xcode project

- **Wave:** 3
- **Depends on:** —
- **Owns:** `plugins/stackgen/stacks/app-framework/swiftui/pack.yaml`,
  `plugins/stackgen/stacks/app-framework/swiftui/conventions.md`,
  `plugins/stackgen/stacks/app-framework/swiftui/config/**`,
  `plugins/stackgen/stacks/app-framework/swiftui/skills/swiftui/SKILL.md`,
  `plugins/stackgen/stacks/app-framework/swiftui/skills/ux-gate/**`
- **Model:** opus
- **Kind:** edit
- **Read first:** every file in Owns as it stands (U1 wrote it for Tuist; this
  unit replaces Tuist throughout), the landed
  `plugins/stackgen/stacks/language/swift/` pack whole, index.md's *Amendment
  2026-09-24* section and *Gaps surfaced during execution* (G4),
  `plugins/stackgen/assets/kinds.md:754-796`, and
  `plugins/stackgen/assets/pack-format.md:151-258`.

## Ruling

Quoted from index.md:

- **E2′** — "A committed `.xcodeproj`, created once by a person in Xcode; no
  project generator; tasks call `xcodebuild` and `swift` only;
  `conf.d/swiftui.toml` removed."
- **E6′** — "The repo sets `XCODE_VERSION` in its mise `[env]`; every task that
  builds checks `xcodebuild -version` against it and fails fast with an
  actionable message — which also catches a Command-Line-Tools-only Mac."
- **E11′** — "No pack lands the `.xcodeproj`; doctrine says create it in Xcode,
  add a `SnapshotTests` unit-test target, and add swift-snapshot-testing through
  Xcode's package UI; `Package.resolved` is committed inside the project."
- **E20** — "The golden simulator is pinned in mise `[env]` —
  `SIMULATOR_DEVICE`, `SIMULATOR_OS`, `SIMULATOR_PLATFORM`; `test:golden` builds
  the `-destination` from them, `--device` / `--os` / `--platform` override one
  run; the result bundle goes to a fixed path under `.build/` so the diff
  attachments are findable."
- **E21** — "The ux-gate runs goldens once per changed platform and reports the
  rest `n/a`, never `ok`."
- **E22** — "The swiftui pack's `manifest:` is `n/a`."
- **E5** — "swift-snapshot-testing (Point-Free), through SwiftPM, under a
  `test:golden` task and the `goldens` harness."
- **E9** — "The swiftui pack's tasks are **copied** from the landed
  `language/swift` tasks, byte-identical wherever no Xcode step is needed; each
  file that differs is named in the report with the reason."
- **E10** — "`sourcekit-lsp` declared byte-identical to
  `app-framework/flutter/pack.yaml:55-60`."
- **E25** — "The `Derived` exclusions in the gate configs and the Swift task
  scripts stay."
- **S4** — "The router links topics 1–11 only."
- **E18** — Context7 (`resolve-library-id` → `query-docs`) for
  swift-snapshot-testing and Apple APIs; `xcodebuild -help` on this machine for
  every flag, never training knowledge.

## Edits

1. **`pack.yaml`** — `manifest: n/a` with a one-clause reason (the dependency
   list lives in `<Name>.xcodeproj/project.pbxproj`, a name the fact cannot
   fix); `mise_tool: n/a` reworded without Tuist; the `binaries` list
   (`xcodebuild`, `swift`) unchanged; the SDK-is-root note says Xcode owns the
   project. Version stays `0.1.0`.
2. **`config/.config/mise/conf.d/swiftui.toml`** — delete with `rm` (nothing is
   pinned through mise any more). If `config/.config/mise/conf.d/` is then
   empty, remove the directory.
3. **Tasks** — keep `code/format`, `code/lint`, `setup/deps/audit`
   byte-identical to `language/swift`. Rewrite the rest for a committed Xcode
   project, locating the project as the single root `*.xcodeproj` (fail with a
   clear message on none or several):
   - a shared Xcode check used by every task that builds or resolves:
     `xcodebuild -version` must succeed (a CLT-only Mac fails it) and, when
     `XCODE_VERSION` is set, report the version it wants and the one selected;
   - `setup/deps/install` — `xcodebuild -resolvePackageDependencies` against the
     project; `--frozen` adds `-onlyUsePackageVersionsFromResolvedFile` (verify
     both against `xcodebuild -help`);
   - `setup/deps/upgrade` — resolve past the lockfile (remove `Package.resolved`
     then resolve, or the flag `xcodebuild -help` offers);
   - `setup/deps/outdated` — report from the committed `Package.resolved` inside
     the project, in the swift pack's shape;
   - `setup/deps/cleanup` — remove `.build/` and the project's cloned-packages
     path if the tasks set one; keep `Package.resolved`;
   - `test/golden` — `xcodebuild test` on the project and scheme, limited by
     `-only-testing` to `SnapshotTests` (target overridable), `-destination`
     from E20's variables, `-resultBundlePath` under `.build/`,
     `-collect-test-diagnostics never`, record mode through the `TEST_RUNNER_`
     prefix (xcodebuild forwards it natively), `--record` then a compare pass.
     No Tuist anywhere.
4. **`conventions.md`** — rewrite for E2′/E6′/E11′/E20: the project is created
   in Xcode (New Project → App, then a Unit Testing Bundle target named
   `SnapshotTests`, then swift-snapshot-testing via File → Add Package
   Dependencies), committed whole except `xcuserdata/`; `Package.resolved` lives
   at `<Name>.xcodeproj/project.xcworkspace/xcshareddata/swiftpm/`;
   `XCODE_VERSION` and the `SIMULATOR_*` variables go in the repo's mise
   `[env]`; the task table matches step 3; agents edit `project.pbxproj` only
   for what Xcode's synchronized folders do not cover (targets, packages,
   settings) and prefer asking a person to do it in Xcode. Keep the
   no-root-config rule.
5. **`skills/swiftui/SKILL.md`** — `paths:` drop `**/Project.swift` and
   `**/Tuist.swift`; add `**/*.xcodeproj/project.pbxproj`. The table of eleven
   links is unchanged.
6. **`skills/ux-gate/SKILL.md`** — every Tuist command becomes its `xcodebuild`
   form on E20's destination with `-resultBundlePath` under `.build/`; the
   inline default-viewport table stays; E21's per-platform run; the artifact
   wording: reference in `__Snapshots__`, render under
   `.build/snapshot-artifacts/`, diff inside the pinned result bundle.

## Verification

- `mise run p:plugins:check` and `mise run p:plugins:shellcheck` green.
- `grep -rni tuist plugins/stackgen/stacks/app-framework/swiftui` is empty.
- `cmp` of `code/format`, `code/lint`, `setup/deps/audit` against
  `language/swift` is clean.

## Guardrails

- Touch nothing outside Owns — the topic files are U8's, the bundle U9's.
- Never land an `.xcodeproj`, `Package.swift` or a root config.
- Never format `config/` payload with this repo's dprint.
- Cite no plugin path in anything the pack lands (rule 13).
- Never run `git checkout`, `git restore`, `git stash`, or a formatter's
  `--fix`, over any path outside Owns.
- Delete with `rm`, never `git rm`.

## Commit

Wave 3 lands as one commit (E27):
`refactor: swiftui stack — a committed Xcode project in place of Tuist`
