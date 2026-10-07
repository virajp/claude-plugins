# V1 — tool-config drops its vscode fragments, `setup:vscode` and the `editor` key

- **Wave:** 1
- **Depends on:** —
- **Owns:**
  `plugins/stackgen/skills/tool-config/assets/dprint/.config/vscode.d/`,
  `plugins/stackgen/skills/tool-config/assets/mise/.config/vscode.d/`,
  `plugins/stackgen/skills/tool-config/assets/pre-commit/.config/vscode.d/`,
  `plugins/stackgen/skills/tool-config/assets/mise/.config/mise/tasks/setup/vscode`,
  `plugins/stackgen/skills/tool-config/assets/mise/.config/mise/tasks/setup/all`,
  the `check-json` comment only in
  `plugins/stackgen/skills/tool-config/assets/pre-commit/.config/pre-commit-config.yaml`,
  `plugins/stackgen/skills/tool-config/SKILL.md`,
  `plugins/stackgen/skills/tool-config/references/dprint.md`,
  `plugins/stackgen/skills/tool-config/references/mise.md`,
  `plugins/stackgen/skills/tool-config/references/pre-commit.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file whole.

## Ruling

> E1 — Retired everywhere: init's question 7, `answers.editor`, tool-config's
> `editor` key, the pack `conditional:` `when: editor`, the checker's axis, the
> materializer's condition.

> E2 — All 12 shipped fragments; init's editor merge …; the `setup:vscode` task
> and its call in `setup/all`.

> E5 — The lines protecting a user's own `.vscode/` stay — dprint's
> `jsonTrailingCommaFiles` entry, pre-commit's `check-json` exclude, the
> `.gitignore` note; only the pre-commit comment changes to "`.vscode/` files
> are JSONC by design".

User, verbatim: *"drop vscode settings from the plugin, let user create and
manage their vscode settings"*.

## Edits

1. `rm -r` the three `vscode.d/` directories under
   `TC/assets/{dprint,mise,pre-commit}/.config/`.
2. `rm` `TC/assets/mise/.config/mise/tasks/setup/vscode`; in `tasks/setup/all`
   (`:44-46`) remove the step that runs it and any help or comment naming it.
3. `pre-commit-config.yaml:138` — the comment above `exclude: ^\.vscode/`
   becomes `# .vscode/ files are JSONC by design.`; the exclude line stays.
4. `TC/SKILL.md` — drop `editor` from the `all` key table (`:108`) and its
   spelling note; drop the JSONC editor-fragment marker sentence (`:161-164`)
   and any other editor-fragment mention.
5. `TC/references/dprint.md` (`:33,51-58,73,185,193,221`), `references/mise.md`
   (`:252-254,267,288-290,333,675,782,884-906,1110-1111`),
   `references/pre-commit.md` (`:35,127-136`) — remove every editor fragment,
   `editor` key, `editor=vscode` condition, `.vscode/extensions.json`
   prerequisite and the `setup:vscode` section and mandatory-set row. Where
   dprint's `editor` was its one key, say it now takes none. Keep the passages
   about `jsonTrailingCommaFiles` and the `.vscode/` exclude, reworded to "a
   user's own `.vscode/` files".

## Verification

- `grep -rn -i -E 'vscode|editor' plugins/stackgen/skills/tool-config` prints
  only the E5 lines and generic uses of the word "editor" unrelated to an editor
  configuration (state each one kept in `DECIDED:`).
- `mise run p:plugins:shellcheck` green (`setup/all` edited).
- The full wave gate.

## Guardrails

- Plan 1 rewrites `references/mise.md` later: change only the editor and
  `setup:vscode` passages here.
- `plugins/**/*.md` is not dprint-formatted: match fold width by hand.
- Delete with `rm`, never `git rm`.

## Commit

`refactor: tool-config ships no vscode fragment, setup:vscode or editor key`
