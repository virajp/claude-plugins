# U1 — The language/swift pack

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/stacks/language/swift/**`
- **Model:** opus
- **Kind:** edit
- **Read first:** `plugins/stackgen/assets/kinds.md:50-134` (language-bundle and
  its 12-topic bar), `plugins/stackgen/assets/pack-format.md:151-258` and
  `:389-391`, `plugins/stackgen/assets/artifact-doctrine.md`, the whole
  `plugins/stackgen/stacks/language/typescript/` pack (the language-pack model)
  and `plugins/stackgen/stacks/app-framework/flutter/pack.yaml` (for the
  sourcekit-lsp block and the task headers).
- **Lazy-load:**
  `plugins/stackgen/stacks/app-framework/flutter/config/.config/mise/tasks/**`
  for task shape; `.claude/skills/stackgen-plugin/SKILL.md:272-349`.

## Ruling

Quoted from index.md:

- **E3** — "swift-format (`swift format`, from the toolchain) formats; SwiftLint
  (through mise) lints."
- **E6** — "A new optional language fact `binaries: [<name>…]` in `pack.yaml`,
  carried through `language_facts`, lets doctor report a missing binary on
  `PATH` as **blocking** once the project is pinned."
- **E7** — "`language/swift` in bundle `swift-package`."
- **E9** — "Where `language/swift` and `app-framework/swiftui` ship the same
  task path, the two files are byte-identical unless the swiftui one must differ
  for Tuist; each differing pair is named in the unit's report."
- **E10** — "`sourcekit-lsp` declared in both new packs byte-identical to
  `app-framework/flutter/pack.yaml:55-60`; `mise_tool: n/a` for Xcode-provided
  tools."
- **E11** — "Tool configs land under `.config/` (`.config/swift-format.json`,
  `.config/swiftlint.yml`), and the tasks pass `--configuration` / `--config`.
  No pack lands `Package.swift` …"
- **E18** — "Every unit resolves Tuist, SwiftLint, swift-format,
  swift-snapshot-testing and Apple framework APIs through Context7 … before
  writing about them."

## Edits

1. **`pack.yaml`** — `name: Swift`, `type: language`, `version: 0.1.0`,
   `kind: language-bundle`, the axis and `platforms: [packages]` the language
   pack shape requires (follow typescript's pack); `languages:` one entry,
   `token: swift`, facts `lsp: sourcekit-lsp` (naming the `lsp_servers` key),
   `mise_tool: n/a`, `manifest: Package.swift`, and the new `binaries: [swift]`
   (E6 — the field is specified by U7 in `pack-format.md`; write it as
   `binaries:` under `facts`). `lsp_servers:` the `sourcekit-lsp` entry copied
   **byte for byte** from `app-framework/flutter/pack.yaml:55-60` (E10).
2. **`conventions.md`** — the pack's conventions, in typescript's shape: Swift 6
   language mode and strict concurrency, SwiftPM as the manifest owner, the
   `.config/` config files, what the tasks do.
3. **`skills/swift/SKILL.md` + `references/`** — the language-bundle doctrine
   clearing the 12-topic bar at `kinds.md:77-114`, `user-invocable: false`,
   `paths:` scoped to `**/*.swift` and `**/Package.swift`, strict-YAML
   frontmatter. Name the reference files after the bar's topics. Contract-level
   guidance for a Swift **package** (library API design, access control, module
   layout, Swift Testing, DocC, platform availability, versioning) — no API
   listing.
4. **`config/.config/mise/tasks/`** — `code/format`, `code/lint`, and
   `setup/deps/{install,audit,cleanup,outdated,upgrade}`, in Flutter's task
   shape (helpers library, `#MISE`/`#USAGE` headers, 755, shebang,
   `# shellcheck source=/dev/null`):
   - `code/format` — dprint, shfmt, then `swift format` with
     `--configuration .config/swift-format.json` (in place under `--fix`, lint
     mode otherwise), over `Sources/`, `Tests/` and the given file list;
   - `code/lint` — shellcheck, actionlint, the house linter as Flutter's does,
     then `swiftlint lint --strict --config .config/swiftlint.yml`;
   - `setup/deps/install` — `swift package resolve` (`--frozen` → fail when
     `Package.resolved` would change); fail fast with a clear message when
     `swift` is not on `PATH`;
   - `setup/deps/audit` — an explicit no-op warning (SwiftPM has no audit
     command), as pub's;
   - `setup/deps/cleanup` — `swift package clean` and remove `.build/`;
   - `setup/deps/outdated` — `swift package show-dependencies` with the
     available-update report Context7 shows is current;
   - `setup/deps/upgrade` — `swift package update`. Write each task so U2's
     swiftui copy can be byte-identical where no Tuist step is needed (E9).

## Verification

- `mise run p:plugins:check` green (rules 4, 11, 13).
- `mise run p:plugins:shellcheck` green over the new tasks.
- The `sourcekit-lsp` block diffs empty against flutter's (E10).

## Guardrails

- Touch nothing outside Owns. The swiftpm, swift-format and swiftlint packs are
  U5's — this pack's tasks call the tools; U5's packs land their configs.
- Never land `Package.swift` or a root config file (E11).
- Never format `config/` payload with this repo's dprint.
- `plugins/**/*.md` is not formatted — keep a steady fold width by hand.
- Never run `git checkout`, `git restore`, `git stash`, or a formatter's
  `--fix`, over any path outside Owns.
- Delete with `rm`, never `git rm`.

## Commit

Wave 1 lands as one commit (E14):
`feat: native Swift stack — language, swiftui, swiftpm and gate packs, two bundles`
