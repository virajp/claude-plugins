# U1 — The language/swift tasks and their two docs

- **Wave:** 1
- **Depends on:** —
- **Owns:**
  `plugins/stackgen/stacks/language/swift/config/.config/mise/tasks/code/format`,
  `plugins/stackgen/stacks/language/swift/config/.config/mise/tasks/code/lint`,
  `plugins/stackgen/stacks/language/swift/conventions.md`,
  `plugins/stackgen/stacks/language/swift/skills/swift/references/build-and-run.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** both tasks whole; the mise pack's
  `plugins/stackgen/stacks/toolchain-manager/mise/config/.config/mise/tasks/_scripts/helpers`
  (`print_error` at `:79`); the "Gaps surfaced during execution" section of
  `docs/plans/2026-09-23-swift-package-stack/index.md` (G1, G2).

## Ruling

Quoted from index.md:

- **F1** — "Fix G1 plus the G2 doc lines in the same pack; G3–G7 stay open on
  the swift-package-stack folder."
- **F2** — "Drop `--deduplicate`; the read loop skips a path equal to the one
  before it (git's output is sorted, a conflicted path's stages are adjacent)."
- **F3** — "Write the `ls-files -z` output to a `mktemp` file with a plain
  command, then check its exit status; on failure `print_error` and exit
  non-zero; read the NUL list from the file; remove it on EXIT. Portable to bash
  3.2."
- **F4** — "The deliberate `2>/dev/null || true` on the actionlint list and in
  the mise helpers stays."

## Edits

1. **`code/format`** — the ls-files call at `:68`: drop `--deduplicate`; list
   into a temp file per F3; skip an adjacent repeat per F2 in the read loop.
   Keep everything the previous plan settled: `core.quotePath=off`, `-z`,
   `--cached --others --exclude-standard`, the `./` prefix on every path, the
   Swift-scope exclusions (`.build`, `.swiftpm`, `Derived`, `DerivedData`,
   `*.generated.swift` at any depth), `--fix` then `lint --strict`.
2. **`code/lint`** — the same for both ls-files calls (`:133` the house-linter
   list, `:156` the Swift list). Consider listing once and filtering `*.swift`
   from that one list, if it keeps the task simpler; say so in `DECIDED:`. Leave
   the actionlint `2>/dev/null || true` at `:87` as is (F4).
3. **The temp file** — one `mktemp`, a `trap … EXIT` that removes it, and no
   path outside `${TMPDIR:-/tmp}`. The error names the failing command, e.g.
   `git ls-files failed (exit <n>)`.
4. **`conventions.md:32-33`** — the `code:lint` row: shellcheck and actionlint
   take the staged list in hook mode; the Swift gates take the whole Swift
   scope. The `code:format` row: drop "skips what SwiftLint excludes" — it takes
   the tasks' fixed exclusion list, which a user's `excluded:` entry in
   `.config/swiftlint.yml` does not reach. Agree with build-and-run.md.
5. **`build-and-run.md:30`** — the any-depth exclusion is the tasks', not the
   shipped `swiftlint.yml`'s, which excludes `../.build` and `../.swiftpm` at
   the repo root only. Keep the hand fold at 80 or less.

## Verification

- `mise run p:plugins:check` and `mise run p:plugins:shellcheck` green.
- `grep -n -- '--deduplicate'` over both tasks is empty.
- In a scratch repo (the orchestrator's smoke setup in index.md, gate 1):
  `code:format --fix`, `code:format` and `code:lint` exit 0; with a `git` shim
  that exits 129 on `ls-files`, both tasks exit non-zero with the error; mid
  merge on a conflicted `.swift` file each path is handed over once.

## Guardrails

- Touch nothing outside Owns — no other pack, not the mise helpers.
- Never land a new file in the pack.
- Never format `config/` payload with this repo's dprint.
- `plugins/**/*.md` is not formatted — keep the surrounding fold by hand.
- Never run `git checkout`, `git restore`, `git stash`, or a formatter's
  `--fix`, over any path outside Owns.

## Commit

`fix: Swift tasks — fail loudly when git ls-files fails, no --deduplicate`
