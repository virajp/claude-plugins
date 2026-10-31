# U4 — Android in the universal supersets

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

> - Decision C8: The universal `.gitignore` gets an Android section (`.cxx/`,
>   `.externalNativeBuild/`, `captures/`). The rule-15 lists stay in agreement.

## Edits

1. **`assets/.gitignore`** — an `# Android` section after the Gradle/Kotlin
   section plan A added, with `.cxx/`, `.externalNativeBuild/`, `captures/`.
2. **The rule-15 exclusion set** — add the same directories to each list rule 15
   requires to agree, in the form each file uses for the Gradle directories. Add
   only what rule 15 needs.
3. **`references/dprint.md`, `references/pre-commit.md`** — where they list
   excluded directories by stack, add Android.

## Verification

- `mise run p:plugins:check` (rule 15) passes.
- The full wave gate.

## Guardrails

- Do not touch any file outside Owns; never edit this repo's own `.config/`
  files or the root `assets/dprint.json`.
- Delete with `rm`, never `git rm`. No `git checkout`/`git restore` and no
  formatter `--fix` outside Owns.

## Commit

Rides the wave-1 commit (C9):
`feat: android compose stack — packs, bundles, supersets`.
