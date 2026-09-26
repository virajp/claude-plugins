# U1 — Swift toolchain packs: the `.swiftpm/` claim, swift-format's command, swiftlint's folds

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/stacks/package-manager/swiftpm/conventions.md`,
  `plugins/stackgen/stacks/toolchain-gate/swift-format/skills/swift-format/SKILL.md`,
  `plugins/stackgen/stacks/toolchain-gate/swiftlint/conventions.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file, top to bottom, before editing.
- **Lazy-load:**
  `plugins/stackgen/stacks/language/swift/config/.config/mise/tasks/code/format`
  (the command swift-format actually runs, `:160-180`);
  `plugins/stackgen/stacks/repo-hygiene/repo-hygiene/conventions.md:105-141`
  (which gitignore sections a `swift` repo gets).

## Ruling

> **A1** — Reword to match upstream: the conventions say `.build/` is ignored by
> the Swift gitignore section, and `.swiftpm/` is left to the repo, as upstream
> leaves it. Rejected: ignore `.swiftpm/` too; ignore `.swiftpm/*` but
> `configuration/`.

> **A2** — swift-format's SKILL.md shows the command the `code:format` task
> actually runs; swiftlint conventions' ragged folds are reflowed.

## Edits

1. **`package-manager/swiftpm/conventions.md`** — at `:33-34` (and anywhere else
   in the file that repeats it), replace the claim that `.build/` and
   `.swiftpm/` are "regenerable and ignored" with: `.build/` is regenerable and
   ignored by the Swift section repo-hygiene appends from upstream
   `Swift.gitignore`; `.swiftpm/` is left to the repo — upstream leaves it
   commented out because `.swiftpm/configuration/` can hold shared Xcode
   settings, so a repo that wants it ignored adds the line itself. Cite no
   plugin path (rule 13).
2. **`toolchain-gate/swift-format/skills/swift-format/SKILL.md`** — at `:36-42`,
   replace the two direct commands (`swift format lint --strict` and
   `--in-place`, each with `--recursive Sources Tests Package.swift`) with what
   the task runs: `mise run code:format` (check) and
   `mise run code:format --fix` (apply), and under it the underlying calls —
   `swift format lint --strict --parallel` and `swift format format --in-place`
   over the Swift files git tracks, never `--recursive`. Read the task file to
   quote the exact flags. Keep each code span on one line.
3. **`toolchain-gate/swiftlint/conventions.md`** — reflow the paragraph holding
   `:32` and `:35` so no line stops short of the ~80-column fold without a
   reason (a list item end or a table). Words unchanged.

## Verification

- `mise run p:plugins:check` passes.
- `grep -n 'swiftpm/' plugins/stackgen/stacks/package-manager/swiftpm/conventions.md`
  shows no line saying `.swiftpm/` is ignored.
- `grep -n -- '--recursive' plugins/stackgen/stacks/toolchain-gate/swift-format/skills/swift-format/SKILL.md`
  is empty.

## Guardrails

- Do not touch any `pack.yaml`, bundle, or `language/swift` task — U5's and plan
  B's.
- `plugins/**/*.md` is not dprint-formatted: fold by hand at the surrounding
  width. Write with the Write/Edit tools, never shell heredocs.
- Delete with `rm`, never `git rm`.

## Commit

`fix: swift packs — the .swiftpm claim, swift-format's real command, swiftlint's folds`
