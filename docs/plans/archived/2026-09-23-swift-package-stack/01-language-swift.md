# U1 — The language/swift pack

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/stacks/language/swift/**`
- **Model:** opus
- **Kind:** edit
- **Read first:** `plugins/stackgen/assets/kinds.md:50-134`,
  `plugins/stackgen/assets/pack-format.md:151-258` (with the `binaries` fact)
  and `:389-391`, `plugins/stackgen/assets/artifact-doctrine.md`, the whole
  `plugins/stackgen/stacks/language/typescript/` pack, and
  `plugins/stackgen/stacks/app-framework/flutter/pack.yaml`.
- **Lazy-load:**
  `plugins/stackgen/stacks/app-framework/flutter/config/.config/mise/tasks/**`;
  `.claude/skills/stackgen-plugin/SKILL.md:272-349`.

## Ruling

Quoted from index.md:

- **E3** — "swift-format (`swift format`, from the toolchain) formats; SwiftLint
  (through mise) lints."
- **E6** — "`language/swift` declares `binaries: [swift]` (the fact 2a added)."
- **E7** — "`language/swift` in bundle `swift-package`."
- **E10** — "`sourcekit-lsp` declared byte-identical to
  `app-framework/flutter/pack.yaml:55-60`; `mise_tool: n/a` for
  toolchain-provided tools."
- **E11** — "Tool configs land under `.config/` (`.config/swift-format.json`,
  `.config/swiftlint.yml`), and the tasks pass `--configuration` / `--config`.
  No pack lands `Package.swift`; `swift package init` creates it."
- **E18** — "Units resolve SwiftLint, swift-format and SwiftPM behaviour through
  Context7 … before writing about it."

## Edits

1. **`pack.yaml`** — `name: Swift`, `type: language`, `version: 0.1.0`,
   `kind: language-bundle`, the axis and `platforms: [packages]` the language
   pack shape requires (follow typescript's); `languages:` one entry,
   `token: swift`, facts `lsp: sourcekit-lsp` (naming the `lsp_servers` key),
   `mise_tool: n/a`, `manifest: Package.swift`, `binaries: [swift]`.
   `lsp_servers:` the `sourcekit-lsp` entry copied **byte for byte** from
   `app-framework/flutter/pack.yaml:55-60`.
2. **`conventions.md`** — in typescript's shape: Swift 6 language mode and
   strict concurrency, SwiftPM as the manifest owner, the `.config/` config
   files, what each task does.
3. **`skills/swift/SKILL.md` + `references/`** — language-bundle doctrine
   clearing the 12-topic bar at `kinds.md:77-114`; `user-invocable: false`;
   `paths:` `**/*.swift`, `**/Package.swift`; strict-YAML frontmatter; reference
   files named after the bar's topics. Contract-level guidance for a Swift
   **package** (library API design, access control, module layout, Swift
   Testing, DocC, platform availability, semantic versioning) — no API listing.
4. **`config/.config/mise/tasks/`** — in Flutter's task shape (helpers library,
   `#MISE`/`#USAGE` headers, 755, shebang, `# shellcheck source=/dev/null`):
   - `code/format` — dprint, shfmt, then `swift format` with
     `--configuration .config/swift-format.json` (in place under `--fix`, lint
     mode otherwise) over `Sources/`, `Tests/` and the given file list;
   - `code/lint` — shellcheck, actionlint, the house linter as Flutter's does,
     then `swiftlint lint --strict --config .config/swiftlint.yml`;
   - `setup/deps/install` — fail fast with a clear message when `swift` is not
     on `PATH`, then `swift package resolve` (`--frozen` → fail when
     `Package.resolved` would change);
   - `setup/deps/audit` — an explicit no-op warning, as pub's;
   - `setup/deps/cleanup` — `swift package clean` and remove `.build/`;
   - `setup/deps/outdated` — the dependency-update report Context7 shows is
     current for SwiftPM;
   - `setup/deps/upgrade` — `swift package update`.

   Write every task **project-agnostic**: plan 2c's SwiftUI pack copies these
   files byte for byte where it needs no Tuist step.

## Verification

- `mise run p:plugins:check` green (rules 4, 11, 13).
- `mise run p:plugins:shellcheck` green over the new tasks.
- The `sourcekit-lsp` block diffs empty against flutter's.

## Guardrails

- Touch nothing outside Owns — the swiftpm and gate packs are U2's.
- Never land `Package.swift` or a root config file.
- Never format `config/` payload with this repo's dprint.
- `plugins/**/*.md` is not formatted — keep a steady fold width by hand.
- Never run `git checkout`, `git restore`, `git stash`, or a formatter's
  `--fix`, over any path outside Owns.
- Delete with `rm`, never `git rm`.

## Commit

Wave 1 lands as one commit (E14):
`feat: Swift package stack — language/swift, swiftpm, swift-format and swiftlint packs, swift-package bundle`
