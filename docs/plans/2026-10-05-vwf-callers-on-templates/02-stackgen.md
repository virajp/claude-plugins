# U2 — stackgen: values, vwf ignore lines, rendered records

- **Wave:** 2
- **Depends on:** U1
- **Owns:** `plugins/stackgen/stacks/app-framework/swiftui/pack.yaml` (not its
  `version:` line), `plugins/stackgen/skills/tool-config/assets/.gitignore`,
  `plugins/stackgen/skills/tool-config/assets/.graphifyignore`,
  `plugins/stackgen/assets/pack-format.md`,
  `plugins/stackgen/assets/output-tree.md`,
  `plugins/stackgen/skills/stackgen-stack-template/**`,
  `plugins/stackgen/skills/stackgen-sync/**`
- **Model:** opus
- **Kind:** edit
- **Read first:**
  `git show add4e104:plugins/stackgen/stacks/app-framework/swiftui/pack.yaml`
  (lines 37-77); the current swiftui `pack.yaml` and its
  `templates/.config/mise/conf.d/swiftui/mise.toml`; the two tool-config assets;
  the materializer reference and stackgen-sync `SKILL.md` as plan 2 left them.

## Ruling

> F1 — A `values:` list in `pack.yaml`, each entry `name`, `detect` and
> `question`. swiftui's four restored from `add4e104`'s `machine_env:` (lines
> 37-77), renamed.

> F5 — After `pack` writes a pack's templates, the materializer records each
> rendered path in `.claude/stackgen/lock.yaml` with `source: <pack>@<version>`,
> `rendered: true` and no hash. Removal deletes them with the pack's other files
> (after `pack-remove`). stackgen-sync re-runs `pack` for a newer pack version
> instead of diffing bytes.

> F8 — vwf's ignore lines (`docs/memory/handoff/`, `docs/memory/doctor/`,
> `docs/memory/runs/`, `docs/scratchpad/` and the rest the four writers add)
> join tool-config's universal `assets/.gitignore` and `assets/.graphifyignore`
> inside the `tool-config` markers.

## Edits

1. **swiftui `pack.yaml`** — add `values:` with the four entries, `detect` and
   `question` copied byte for byte from `add4e104`'s `machine_env:`, the key
   renamed; keep the comment block above it (lines 30-36 there) reworded from
   `machine_env` to `values`.
2. **tool-config assets** — add vwf's ignore lines to `.gitignore` (a
   `# vwf — working notes and scratch` group) and to `.graphifyignore`, inside
   the markers. Get the exact lines from the four writers named in index.md's
   facts (`rg -n "gitignore|graphifyignore" plugins/vwf`), plus the memory
   tree's banner section
   (`plugins/vwf/skills/setup/references/memory-tree.md:13-14` and around).
   Dedupe against lines already there.
3. **`pack-format.md`** — the `values:` key (fields, the detect/ask order, the
   checker's two cross-checks).
4. **`output-tree.md`** and the materializer reference — F5's record shape
   (`rendered: true`, no hash) and the removal order (`pack-remove`, then the
   recorded files). **stackgen-sync** — a rendered entry is refreshed by
   re-running `pack`, never byte-diffed.

## Verification

- `mise run p:plugins:check` green (U1's cross-checks pass for swiftui).
- `rg -n "machine_env" plugins/stackgen` prints nothing.

## Guardrails

- Touch nothing outside Owns — vwf files are U3–U5's.
- `plugins/**/*.md` is not dprint-formatted: match the fold width by hand.
- Assets under `tool-config/assets/` are dprint-excluded in this repo.
- Delete with `rm`, never `git rm`.

## Commit

`feat: packs declare values; tool-config ignores vwf's working files; the lock records rendered pack files`
