# U1 — stackgen's side: the binaries fact, hygiene mapping, exclusion lists

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/assets/pack-format.md`,
  `plugins/stackgen/skills/stackgen-stack-template/SKILL.md`,
  `plugins/stackgen/stacks/repo-hygiene/repo-hygiene/conventions.md`,
  `plugins/stackgen/stacks/toolchain-gate/dprint/config/.config/dprint.json`,
  `plugins/stackgen/stacks/toolchain-gate/dprint/config/.config/taplo.toml`,
  `plugins/stackgen/stacks/toolchain-gate/pre-commit/config/.config/pre-commit-config.yaml`
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file, top to bottom; `CLAUDE.md`'s rule 15
  paragraph.

## Ruling

Quoted from index.md:

- **E6** — "A new optional language fact `binaries: [<name>…]` in `pack.yaml`,
  carried through `language_facts`, lets doctor report a missing binary on
  `PATH` as **blocking** once the project is pinned."
- **E12** — "`.build` and `Derived` join all three formatter lists; `.swiftpm`
  does not (it holds user config); gitleaks untouched."

## Edits

1. **`pack-format.md`** — the `languages[].facts` schema (`:157-184`) gains
   optional `binaries: [<name>…]`: executables the stack needs on `PATH` that
   mise does not manage (Xcode's `xcodebuild`, say); absent means none. Beside
   the honest-facts rule (`:389-391`), say a `mise_tool: n/a` tool the stack
   cannot run without belongs in `binaries`.
2. **stack-template `SKILL.md:87`** — the `language_facts` payload line gains
   `binaries: [<name>…]`, passed through from `pack.yaml`.
3. **hygiene `conventions.md:124-131`** — the slug-to-key prose maps the Swift
   slugs (`swift-swiftui`, `swift-package`, and the `swift` language token) to
   the `swift` key / `Swift.gitignore` (row `:111`), so init appends that
   section rather than proposing it. If upstream `Swift.gitignore` does not
   cover Tuist's `Derived/`, say how the section gains it, in this file's
   existing idiom.
4. **The three exclusion lists** — add `.build` and `Derived` to `dprint.json`
   (`:5-18`), `taplo.toml` (`:14-27`) and the pre-commit global `exclude`
   (`pre-commit-config.yaml:48-61`), each in its own list's syntax, so the three
   still normalise to one set (rule 15). Do not touch `gitleaks.toml`.

## Verification

- `mise run p:plugins:check` green — rule 15 in particular.
- `grep -n 'binaries'` hits in `pack-format.md` and the stack-template
  `SKILL.md`.

## Guardrails

- Touch nothing outside Owns; the three packs' `pack.yaml` versions and pins are
  U4's.
- The three exclusion files are **payload**: never format them with this repo's
  dprint; keep their layout byte for byte outside the added entries.
- `plugins/**/*.md` is not formatted — match each file's fold width by hand.
- Never run `git checkout`, `git restore`, `git stash`, or a formatter's
  `--fix`, over any path outside Owns.
- Delete with `rm`, never `git rm`.

## Commit

`feat: stackgen binaries fact, Swift hygiene mapping and build-tree exclusions`
