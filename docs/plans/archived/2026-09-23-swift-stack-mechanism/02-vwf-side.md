# U2 — vwf's side: the binaries contract, doctor's check, init detection

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/assets/stack-adapter.md`,
  `plugins/vwf/assets/stack-vocabulary.md`,
  `plugins/vwf/skills/doctor/references/stack-checks.md`,
  `plugins/vwf/skills/init/SKILL.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file's passage named below, then the file around
  it.

## Ruling

Quoted from index.md:

- **E6** — "A new optional language fact `binaries: [<name>…]` in `pack.yaml`,
  carried through `language_facts`, lets doctor report a missing binary on
  `PATH` as **blocking** once the project is pinned."
- **E13** — "init's manifest table maps `Project.swift` and `Tuist.swift` →
  swift, beside `Package.swift`."

## Edits

1. **`stack-adapter.md:355`** and **`stack-vocabulary.md:48`** — the payload
   contract's facts gain `binaries`, optional; "the same three facts" becomes
   four wherever the text counts them.
2. **doctor `stack-checks.md`** — in the per-language section (`:65-103`), a
   **Binaries** bullet beside Toolchain: for each name in the language's
   materialized `binaries` fact, `command -v <name>`; missing → **blocking once
   the project's `template` is pinned**, a degradation while it reads
   `unresolved`, remedy naming the binary (for `xcodebuild`: install Xcode, then
   `xcode-select -s`). Reported per language, like the rest of the section.
3. **init `SKILL.md:340`** — the manifest table gains `Project.swift` → swift
   and `Tuist.swift` → swift beside `Package.swift`, in the table's shape.

## Verification

- `mise run p:plugins:check` green.
- `grep -n 'binaries'` hits in all three vwf assets/references;
  `grep -n 'Project.swift' plugins/vwf/skills/init/SKILL.md` hits.

## Guardrails

- Touch nothing outside Owns.
- `plugins/**/*.md` is not formatted — match each file's fold width by hand.
- Never run `git checkout`, `git restore`, `git stash`, or a formatter's
  `--fix`, over any path outside Owns.
- Delete with `rm`, never `git rm`.

## Commit

`feat: doctor blocks on a missing stack binary, init detects a Tuist app`
