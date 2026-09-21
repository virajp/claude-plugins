# U4 — the mise runtime slot, the hygiene ignore table

- **Wave:** 1
- **Depends on:** —
- **Owns:**
  `plugins/stackgen/stacks/toolchain-manager/mise/config/.config/mise.toml`,
  `plugins/stackgen/stacks/toolchain-manager/mise/skills/mise/references/config-files.md`,
  `plugins/stackgen/stacks/toolchain-manager/mise/conventions.md`,
  `plugins/stackgen/stacks/repo-hygiene/repo-hygiene/conventions.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file, top to bottom, before editing —
  `mise.toml:78-89` (the runtime block), `:143-146` (`_.path`), `:148-159`
  (`[tools]`), and every existing marked position in the file (the `REPO_NAME`,
  `MERGE_MODEL`, `MEMBERS` shape); `config-files.md`'s passage on the block;
  `hygiene/conventions.md:77-107` (the section table).
- **Lazy-load:** `plugins/stackgen/assets/pack-format.md` (the marked-position
  syntax and the rule that a marked position is what the hash splice ignores).

## Ruling

Decision 3 — Runtime block: "The mise pack's runtime block (`mise.toml:78-89`)
and `_.path` (`:143-146`) become **marked positions** — `RUNTIME_BLOCK` and
`PATH_ENTRIES` — which init fills from the stack read (one runtime line per
detected language, `_.path` left empty when nothing needs it); the human
instruction comments go. A marked position is what the hash splice ignores, so
filling it is never content drift."

Decision 2 — Stack read, the part this unit carries: "the hygiene table, which
gains go/rust/swift rows if absent".

## Edits

1. **`mise.toml`** — replace `:78-89` with one marked position `RUNTIME_BLOCK`
   in the file's existing marker syntax, shipped **empty** with a one-line
   comment naming what init writes there (one runtime line per detected
   language); replace `:143-146` with a marked position `PATH_ENTRIES`, shipped
   empty, `_.path` commented above it as the example. `[tools]` (`:148-159`)
   unchanged. Cite nothing by plugin path (rule 13).
2. **`config-files.md`** — the passage describing the block and `_.path` now
   describes the two marked positions and their filler (init, from the stack
   read); the "keep one, delete the rest" instruction goes.
3. **`mise/conventions.md`** — the marked-position list gains the two.
4. **`hygiene/conventions.md:77-107`** — the section table gains `go`, `rust`
   and `swift` rows (patterns: `bin/`, `vendor/` for go; `target/` for rust —
   already the gitleaks allowlist's; `.build/`, `.swiftpm/` for swift) if
   absent; the language keys match decision 2's vocabulary (`node`, `python`,
   `dart`, `go`, `rust`, `swift`).

## Verification

- `mise run p:plugins:check` green (rule 11 walks the mise pack's `config/`;
  rule 13 refuses a plugin path).
- `grep -n "RUNTIME_BLOCK\|PATH_ENTRIES" plugins/stackgen/stacks/toolchain-manager/mise/config/.config/mise.toml plugins/stackgen/stacks/toolchain-manager/mise/skills/mise/references/config-files.md`
  — hits in both.
- `grep -n "keep ONLY\|delete the rest" plugins/stackgen/stacks/toolchain-manager/mise -r`
  — zero hits.
- `grep -n "^| go\|^| rust\|^| swift" plugins/stackgen/stacks/repo-hygiene/repo-hygiene/conventions.md`
  — three rows (or the table's equivalent shape).

## Guardrails

- `config/` is payload — no formatter; TOML by hand in the file's style, the
  marker syntax exactly as the file's other positions use it.
- No `pack.yaml` bump — U6.
- Do not edit `plugins/vwf/**` (U1–U3).
- No doc outside the two packs — `DOCS FALSIFIED:` lines.
- `plugins/**/*.md` outside `config/` is not dprint-formatted: match the fold
  width by hand.
- Delete with `rm`, never `git rm`.

## Commit

`feat: mise.toml runtime block and _.path become marked positions; hygiene ignore table gains go, rust, swift`
— written by the orchestrator after the wave gate. Type from
`.config/git-conventional-commits.yaml`; no scopes.
