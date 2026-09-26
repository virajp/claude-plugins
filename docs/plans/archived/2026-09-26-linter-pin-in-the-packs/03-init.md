# U3 — init writes shared pins once; its mise pack drops the base linter

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/init/references/fragments-and-sections.md`,
  `plugins/vwf/skills/init/packs/mise/**`
- **Model:** opus
- **Kind:** edit
- **Read first:** `fragments-and-sections.md` "mise section blocks" (B2's
  section); init's mise pack `conf.d/tools.toml`, `conventions.md:36-43`,
  `skills/mise/SKILL.md:93`, `references/config-files.md:118`,
  `tasks/code/lint:15-35`; index.md's Facts.

## Ruling

> - Decision 3: init's merge writes a tool that more than one landed pack pins
>   once, in a `# >>> shared` block, with a one-line comment listing the packs
>   that need it; the line stays while any of them is landed and is pruned when
>   none are; differing versions across packs are asked.
> - Decision 4: init's mise pack drops the linter pin from its payload; its
>   prose stops calling it the base's one tool.
> - Decision 10: Any comment or sentence a unit adds is one line.

## Edits

1. **`fragments-and-sections.md`** — the shared-block rule in the mise section
   blocks procedure: detect a key two landed packs' same section file declares,
   write it once in `# >>> shared` / `# <<< shared` with a
   `# needed by: <packs>` line, omit it from each pack's block, prune when
   unneeded, ask on a version mismatch.
2. **Mise pack payload** — remove the linter pin from `conf.d/tools.toml` (drop
   the file if it empties — a section with no content ships no file); the
   `code/lint` slot comment says the language packs pin and call the linter.
3. **Mise pack prose** — `conventions.md:36-43`, `SKILL.md:93`,
   `config-files.md:118` no longer describe a base linter.

## Verification

- `MISE_ENV=dev mise run p:plugins:check` green
- `MISE_ENV=dev mise run p:plugins:shellcheck` green
- `grep -rn "askviraj/linter" plugins/vwf/skills/init/packs/mise` shows only
  prose naming the language packs

## Guardrails

- Payload excluded from this repo's dprint; `plugins/**/*.md` not formatted; no
  code span wraps a line.
- Touch nothing outside the owned paths.
- Delete with `rm`, never `git rm`; no `git checkout`/`restore`.

## Commit

`feat: init writes shared pins once; the mise base drops the linter` — written
by the orchestrator after the wave gate.
