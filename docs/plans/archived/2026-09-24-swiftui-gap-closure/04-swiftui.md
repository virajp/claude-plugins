# U4 — The swiftui pack: probe, machine env, an honest ux-gate

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/stacks/app-framework/swiftui/**`,
  `plugins/stackgen/stacks/bundles/swift-swiftui.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md's Facts, Assumed decisions and Out of scope; the
  whole `app-framework/swiftui/` pack as it stands; `bundles/swift-swiftui.md`;
  `plugins/stackgen/stacks/toolchain-gate/swiftlint/config/.config/mise/conf.d/swiftlint.toml`
  (a conf.d precedent); the `# A MARKED POSITION` comment style in
  `toolchain-manager/mise/config/.config/mise.toml:78`;
  `plugins/vwf/agents/execute-ux-reviewer.md:45-52`, `:99-102`;
  `plugins/vwf/assets/templates/canvas-claude.md:49-62`.

## Ruling

Quoted from index.md:

- **F1** — "The swiftui pack declares
  `{ name: xcodebuild, probe: "xcodebuild -version" }` and a bare `swift`."
- **F3** — the `machine_env:` fact: "a list of `{ name, detect, question }` —
  `name` an env var, `detect` a shell command whose stdout is the default,
  `question` the prompt."
- **F4** — "The swiftui pack ships `config/.config/mise/conf.d/swiftui.toml`
  holding an `[env]` table with `XCODE_VERSION`, `SIMULATOR_PLATFORM`,
  `SIMULATOR_DEVICE`, `SIMULATOR_OS`, each a marked position
  (`# A MARKED POSITION`), and declares the four in `machine_env:` with detect
  commands (`xcodebuild -version` for the Xcode version;
  `xcrun simctl list devices available` for the simulator). Every task refusal
  and every doc that names the `[env]` line names this file instead."
- **F5** — "`rendered: ok` only when at least one changed platform's goldens
  were compared; a run where only the accessibility audit ran reports
  `rendered: n/a` with its reason, so vwf's `n/a` human gate fires."
- **F6** — "The accessibility audit runs on the pinned simulator for **its own**
  vwf platform only, read from the pinned device's family (iPhone → `mobile`,
  iPad → `tablet`, Apple Watch → `watch`, Apple TV → `tv`, Apple Vision →
  `spatial`), plus `platform=macOS` for `desktop`. Every other changed platform
  — `auto` (CarPlay) always among them — is reported `a11y … n/a` with a
  finding, never clean."
- **F9** — "`app-framework/swiftui` 0.1.0 → 0.2.0 … `bundles/swift-swiftui.md`
  pins swiftui@0.2.0 and swiftpm@0.1.1."
- **F14** — `xcodebuild` and `xcrun simctl` behaviour checked on this machine.
- The landed plan's E9 still holds: `code/format`, `code/lint`,
  `setup/deps/audit`, `setup/deps/cleanup` stay byte-identical to
  `language/swift`'s.

## Edits

1. **`pack.yaml`** — `version: 0.2.0`; `binaries` per F1; `machine_env:` with
   the four entries (F3/F4). Each `detect` prints just the value: the Xcode
   version (e.g. `27.0`) from `xcodebuild -version`; for the simulator, one
   available iOS device, its OS and `iOS Simulator` from
   `xcrun simctl list devices available` (prefer an iPhone; `-j` plus a parser
   the pack may rely on — check what is available on a stock Mac, `DECIDED:`).
   Verify each command's output here.
2. **`config/.config/mise/conf.d/swiftui.toml`** — new; the `[env]` table with
   the four marked positions, the default values empty strings, and a comment
   saying `/vwf:setup` fills them from this machine and that they are the repo's
   committed pins (E6′, E20 of the landed plan). No plugin path cited (checker
   rule 13).
3. **Tasks** — `_scripts/xcode` and `test/golden`: every refusal that names the
   `[env]` line names `.config/mise/conf.d/swiftui.toml` instead. The E9 copies
   are untouched.
4. **`skills/ux-gate/SKILL.md`** — F5 in the return-contract sentence at
   `:119-121` and wherever step 3/4 imply it; F6 in step 4 (`:82-97`): how the
   gate reads the pinned device's family (verify the `xcrun simctl` output that
   carries it), the per-platform audit set, the `n/a` finding for the rest,
   `auto` always `n/a`. Where F5/F6 rewrite a passage that also carries one of
   the landed plan's G9 low findings (the "macOS included" wording on a macOS
   pin; the audit skipping the `XCODE_VERSION` check), fix it in the same
   rewrite; do not seek the others out (Out of scope).
5. **`conventions.md`** — the pin passage (`:49-57`, `:99`): the pins live in
   the pack's `conf.d/swiftui.toml`, filled by `/vwf:setup` from this machine;
   the ux-gate's F5/F6 rules in one sentence each.
6. **`skills/swiftui/references/testing.md`** (`:88` and the gate bullets) and
   **`build-and-signing.md`** (`:26`) — name the conf.d file; testing.md's gate
   bullets match F5/F6.
7. **`bundles/swift-swiftui.md`** — pins per F9; `:66` names the conf.d file and
   that `/vwf:setup` asks for the values.

## Verification

- `mise run p:plugins:check`, `mise run p:plugins:shellcheck` green;
  `mise run code:lint -- <every changed task file>` exits 0.
- `cmp` of `code/format`, `code/lint`, `setup/deps/audit`, `setup/deps/cleanup`
  against `language/swift` clean.
- Each `detect` command, run here, prints one value and exits 0.
- `grep -rni tuist plugins/stackgen/stacks/app-framework/swiftui` empty.

## Guardrails

- Touch nothing outside Owns — the swiftpm pack is U5's, the gate packs U6's.
- Never land an `.xcodeproj`, `Package.swift` or a root config; never format
  `config/` payload with this repo's dprint; cite no plugin path in anything the
  pack lands.
- Never run `git checkout`, `git restore`, `git stash` or a formatter's `--fix`
  outside Owns. Delete with `rm`, never `git rm`.

## Commit

Wave 1 lands as one commit (F12):
`feat: pack facts — binary probes, lockfile paths, machine env`
