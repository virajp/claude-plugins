# U7 — The binaries fact, doctor, init, hygiene mapping and exclusion lists

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/assets/pack-format.md`,
  `plugins/stackgen/skills/stackgen-stack-template/SKILL.md`,
  `plugins/vwf/assets/stack-adapter.md`,
  `plugins/vwf/assets/stack-vocabulary.md`,
  `plugins/vwf/skills/doctor/references/stack-checks.md`,
  `plugins/vwf/skills/init/SKILL.md`,
  `plugins/stackgen/stacks/repo-hygiene/repo-hygiene/conventions.md`,
  `plugins/stackgen/stacks/toolchain-gate/dprint/config/.config/dprint.json`,
  `plugins/stackgen/stacks/toolchain-gate/dprint/config/.config/taplo.toml`,
  `plugins/stackgen/stacks/toolchain-gate/pre-commit/config/.config/pre-commit-config.yaml`
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file's passage named below, then the file top to
  bottom around it; `CLAUDE.md`'s rule 15 paragraph.

## Ruling

Quoted from index.md:

- **E6** — "A new optional language fact `binaries: [<name>…]` in `pack.yaml`,
  carried through `language_facts`, lets doctor report a missing binary on
  `PATH` as **blocking** once the project is pinned."
- **E12** — "`.build` and `Derived` join all three formatter lists; `.swiftpm`
  does not (it holds user config); gitleaks untouched."
- **E13** — "init's manifest table maps `Project.swift` and `Tuist.swift` →
  swift, beside `Package.swift`."

## Edits

1. **`pack-format.md`** — `:157-184` the `languages[].facts` schema gains
   optional `binaries: [<name>…]`: executables the stack needs on `PATH` that
   mise does not manage (Xcode's `xcodebuild`, say); absent means none. Beside
   the honest-facts rule (`:389-391`) say a `mise_tool: n/a` tool the stack
   cannot run without belongs in `binaries`.
2. **stackgen-stack-template `SKILL.md:87`** — the `language_facts` payload line
   gains `binaries: [<name>…]`, passed through from `pack.yaml`.
3. **vwf `stack-adapter.md:355`** and **`stack-vocabulary.md:48`** — the payload
   contract's facts gain `binaries`, optional, "the same three facts" becoming
   four where the text counts them.
4. **doctor `stack-checks.md`** — in the per-language section (`:65-103`), a
   **Binaries** bullet beside Toolchain: for each name in the language's
   materialized `binaries` fact, `command -v <name>`; missing → **blocking once
   the project's `template` is pinned**, a degradation while it reads
   `unresolved`, remedy naming the binary (for `xcodebuild`: install Xcode and
   `xcode-select -s`). Reported per language, like the rest of the section.
5. **init `SKILL.md:340`** — the manifest table gains `Project.swift` → swift
   and `Tuist.swift` → swift beside `Package.swift`, in the table's shape.
6. **hygiene `conventions.md:124-131`** — the slug-to-key prose maps the new
   slugs (`swift-swiftui`, `swift-package`, and the `swift` language token) to
   the `swift` key / `Swift.gitignore` (row `:111`), so init appends that
   section rather than proposing it. If upstream `Swift.gitignore` does not
   cover Tuist's `Derived/`, say how the section gains it, in this file's
   existing idiom.
7. **The three exclusion lists** — add `.build` and `Derived` to `dprint.json`
   (`:5-18`), `taplo.toml` (`:14-27`) and the pre-commit global `exclude`
   (`pre-commit-config.yaml:48-61`), each in its own list's syntax, so the three
   still normalise to one set (rule 15). Do not touch `gitleaks.toml`.

## Verification

- `mise run p:plugins:check` green — rule 15 in particular.
- `grep -n 'binaries'` hits in `pack-format.md`, the template `SKILL.md`,
  `stack-adapter.md`, `stack-vocabulary.md` and `stack-checks.md`.
- `grep -n 'Project.swift' plugins/vwf/skills/init/SKILL.md` hits.

## Guardrails

- Touch nothing outside Owns. The three gate packs' `pack.yaml` versions and
  their pins are U10's.
- The three exclusion files are **payload** — never format them with this repo's
  dprint; keep their existing layout byte for byte outside the added entries.
- `plugins/**/*.md` is not formatted — match each file's fold width by hand.
- Never run `git checkout`, `git restore`, `git stash`, or a formatter's
  `--fix`, over any path outside Owns.
- Delete with `rm`, never `git rm`.

## Commit

Wave 1 lands as one commit (E14):
`feat: native Swift stack — language, swiftui, swiftpm and gate packs, two bundles`
