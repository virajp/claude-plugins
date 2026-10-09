# U4 — Gates and the smoke run

- **Wave:** 3
- **Depends on:** U3
- **Owns:** none
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md's Wave gate and Gates the orchestrator keeps;
  `plugins/stackgen/skills/stackgen-reputation/SKILL.md` and its references in
  the worktree.

## Ruling

> - Decision R12: The gates unit runs the edited skill over a fixed name set
>   (listed in its file). Pass: each name has a verdict, no row is `UNRESOLVED`
>   for a missing ecosystem, and the androidx name does not block.

## Edits

1. Run the full wave gate, every line with `MISE_ENV=dev` exported. This plan
   names no generator; regenerate nothing and bump no version.
2. The smoke run: follow the worktree's `SKILL.md` procedure by hand — read it
   and its references, then make the WebFetch calls it names — over this set,
   each at its current release (read the version from the source the skill
   uses):
   - `spm:github.com/pointfreeco/swift-snapshot-testing@<latest>`
   - `mise:aqua:realm/SwiftLint`
   - `mise:github:detekt/detekt`
   - `mise:http:kotlin-lsp`
   - `mise:cargo:ripgrep`
   - `mise:core:java`
   - `maven:org.jetbrains.kotlin:kotlin-stdlib@<latest>`
   - `maven:androidx.core:core-ktx@<latest>`
   - `maven:org.jetbrains.kotlin.jvm:org.jetbrains.kotlin.jvm.gradle.plugin@<latest>`
   - `mise:swiftlint` — expected `UNRESOLVED` (R4), the one row allowed it
3. Report the verdict table in the return block's `DECIDED:` lines, one per
   name: verdict, or the `UNRESOLVED` reason.

## Verification

- Every wave gate line is green.
- The smoke pass condition in index.md's Gates the orchestrator keeps holds. A
  row `UNRESOLVED` because a source was unreachable is re-run once, then
  reported as a `GAP:`.

## Guardrails

- Edit no file. A failing gate or smoke row is reported as `UNRESOLVED:` naming
  the unit whose file caused it.
- No `git checkout`/`git restore` and no formatter `--fix` outside Owns.

## Commit

none — the unit changes no file.
