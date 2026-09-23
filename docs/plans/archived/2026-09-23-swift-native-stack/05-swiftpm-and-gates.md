# U5 — The swiftpm, swift-format and swiftlint packs

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/stacks/package-manager/swiftpm/**`,
  `plugins/stackgen/stacks/toolchain-gate/swift-format/**`,
  `plugins/stackgen/stacks/toolchain-gate/swiftlint/**`
- **Model:** opus
- **Kind:** edit
- **Read first:** `plugins/stackgen/stacks/package-manager/pub/` and
  `plugins/stackgen/stacks/toolchain-gate/analysis-options/` whole (the models),
  `plugins/stackgen/assets/pack-format.md:97-149` (vscode.d fragment rules) and
  `:151-258`, `plugins/stackgen/assets/taxonomy.md:238-247` (package-manager in
  two kinds).
- **Lazy-load:** `plugins/stackgen/stacks/toolchain-gate/eslint/` (a second
  gate-pack model).

## Ruling

Quoted from index.md:

- **E3** — "swift-format (`swift format`, from the toolchain) formats; SwiftLint
  (through mise) lints."
- **E8** — "One per tool: `toolchain-gate/swift-format` and
  `toolchain-gate/swiftlint`, each landing its config under `.config/` and a
  vscode.d fragment on `editor: vscode`."
- **E11** — "Tool configs land under `.config/` (`.config/swift-format.json`,
  `.config/swiftlint.yml`), and the tasks pass `--configuration` / `--config`."
- **E18** — Context7 for SwiftLint and swift-format.

## Edits

1. **`package-manager/swiftpm/`** — in pub's shape: `pack.yaml`
   (`version: 0.1.0`, `package_manager: swiftpm`, the kind and axis pub declares
   — it composes into both the app-framework and the language-bundle bundle, per
   `taxonomy.md:238-247`; say which you chose and why in `DECIDED:`),
   `conventions.md` (`Package.swift` / `Package.resolved`, pinning, the
   `.build/` tree), `skills/swiftpm/SKILL.md`. No `config/` unless pub's shape
   calls for one. vwf keeps no closed list of `package_manager` values
   (`plugins/vwf/assets/vwf-config.md:77` defers to the template), so `swiftpm`
   needs no vwf edit.
2. **`toolchain-gate/swift-format/`** — `pack.yaml` (`version: 0.1.0`, kind and
   axis as analysis-options), `conventions.md`, `skills/swift-format/SKILL.md`,
   `config/.config/swift-format.json` (a house configuration resolved through
   Context7: indentation, line length, the rules the pack enables), and
   `config/.config/vscode.d/swift-format.jsonc` with its `conditional:` entry on
   `editor: vscode` (only the three keys `/vwf:init` composes).
3. **`toolchain-gate/swiftlint/`** — the same shape: `pack.yaml`
   (`version: 0.1.0`), `conventions.md`, `skills/swiftlint/SKILL.md`,
   `config/.config/swiftlint.yml` (rules that do not fight swift-format;
   `excluded:` covering `.build`, `Derived`, `*.generated.swift`), and a
   vscode.d fragment if SwiftLint has an editor extension worth recommending —
   otherwise none, and say so.

## Verification

- `mise run p:plugins:check` green (rule 11 on each `config/`, the vscode.d
  JSONC keys, the `conditional:` entries).
- `.config/swift-format.json` parses as JSON and `.config/swiftlint.yml` as
  YAML.

## Guardrails

- Touch nothing outside Owns. The tasks that call these tools are U1's and U2's;
  the bundles U6's.
- Never format `config/` payload with this repo's dprint.
- Cite no plugin path in anything a pack lands (rule 13).
- Never run `git checkout`, `git restore`, `git stash`, or a formatter's
  `--fix`, over any path outside Owns.
- Delete with `rm`, never `git rm`.

## Commit

Wave 1 lands as one commit (E14):
`feat: native Swift stack — language, swiftui, swiftpm and gate packs, two bundles`
