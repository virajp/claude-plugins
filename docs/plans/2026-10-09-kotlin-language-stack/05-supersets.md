# U5 — Gradle and Kotlin in the universal supersets

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/skills/tool-config/assets/.gitignore`,
  `plugins/stackgen/skills/tool-config/assets/.graphifyignore`,
  `plugins/stackgen/skills/tool-config/assets/.config/dprint.json`,
  `plugins/stackgen/skills/tool-config/assets/.config/gitleaks.toml`,
  `plugins/stackgen/skills/tool-config/assets/.config/taplo.toml`,
  `plugins/stackgen/skills/tool-config/assets/.config/linter.yaml`,
  `plugins/stackgen/skills/tool-config/assets/.config/pre-commit-config.yaml`,
  `plugins/stackgen/skills/tool-config/references/dprint.md`,
  `plugins/stackgen/skills/tool-config/references/pre-commit.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file;
  `.claude/skills/plugin-authoring/references/checks.md` rule 15 — read only.

## Ruling

> - Decision K12: The universal `.gitignore` gets a Gradle/Kotlin section:
>   `.gradle/`, `.kotlin/`, `local.properties`, `*.iml`. The rule-15 exclusion
>   lists stay in agreement.

## Edits

1. **`assets/.gitignore`** — a `# Gradle / Kotlin` section after the Swift/Xcode
   section (`:82`), with `.gradle/`, `.kotlin/`, `local.properties`, `*.iml`. Do
   not add a bare `build/` line unless the file already ignores build output in
   the same form for other stacks; if it does not, record a `GAP:` and leave it
   out.
2. **The rule-15 exclusion set** — add the same generated directories
   (`.gradle`, `.kotlin`) to each exclusion list rule 15 requires to agree
   (dprint, the linter, taplo, pre-commit, graphify, and gitleaks' allowlist as
   a subset), in the form each file already uses for `.dart_tool` or the Xcode
   directories. Add only what rule 15 needs.
3. **`references/dprint.md`, `references/pre-commit.md`** — where they list the
   excluded directories by stack, add Gradle/Kotlin.

## Verification

- `mise run p:plugins:check` (rule 15) passes.
- The full wave gate.

## Guardrails

- Do not touch any file outside Owns; never edit this repo's own `.config/`
  files or the root `assets/dprint.json` (backlog B88 owns that file).
- Delete with `rm`, never `git rm`. No `git checkout`/`git restore` and no
  formatter `--fix` outside Owns.

## Commit

Rides the wave-1 commit (K13):
`feat: kotlin language stack — packs, bundle, init row, supersets`.
