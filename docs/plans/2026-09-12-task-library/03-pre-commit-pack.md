# U3 — The pre-commit gate pack: hooks call the tasks

- **Wave:** 1
- **Depends on:** —
- **Owns:**
  `plugins/stackgen/stacks/toolchain-gate/pre-commit/config/.config/pre-commit-config.yaml`,
  `plugins/stackgen/stacks/toolchain-gate/pre-commit/skills/pre-commit/SKILL.md`
  and its `references/*.md`,
  `plugins/stackgen/stacks/toolchain-gate/pre-commit/conventions.md`. Touch
  nothing outside this list.
- **Model:** opus
- **Read first:** every owned file, top to bottom. The `git-config` hook at
  `:49` is the model: `language: system`,
  `entry: mise x -- mise run code:git-config --fix`.
- **Lazy-load:** `.config/pre-commit-config.yaml` at this repo's root,
  read-only, only to compare how this repo's copy diverged (U7 will re-copy
  yours).

## Ruling

Quoted from index.md:

> **1. Hook shape.** "Every gate hook calls a task." The base config carries
> three tool-neutral hooks, ids `format`, `lint`, `sec`, each
> `language: system`, `entry: mise x -- mise run code:<x> --fix` for format and
> lint with `pass_filenames: true`, and
> `entry: mise x -- mise run code:sec
> --staged` with `pass_filenames: false`.
> The `formatter`, `shellcheck`, `shfmt`, `actionlint` and `gitleaks-system`
> hooks are removed. Builtins, `git-config`, `conventional-commits`,
> `no-commit-to-branch`, `meta` stay as they are.

> **3.** shellcheck and actionlint become shipped defaults inside the mise
> pack's `code:lint`; shfmt becomes a shipped default inside `code:format`.

## Edits

1. **`config/.config/pre-commit-config.yaml`**
   - Remove the `formatter` (`:133`), `shellcheck` (`:145`), `shfmt` (`:154`),
     `actionlint` (`:164`) and `gitleaks-system` (`:172-183`) hooks, each with
     its `repo:` block where the block then holds nothing.
   - Add, in the `repo: local` block beside `git-config`, three hooks in this
     order: `format` (`entry: mise x -- mise run code:format --fix`,
     `pass_filenames: true`, `language: system`, no `files:` filter — the task
     decides what it formats), `lint`
     (`entry: mise x -- mise run code:lint --fix`, same), `sec`
     (`entry: mise x -- mise run code:sec --staged`, `pass_filenames: false`,
     `always_run: true`). Each carries a `name:` a human reads in the hook
     output that names the task it calls, e.g. `Format (mise run code:format)`.
   - Keep the fragment marker pairs `/vwf:init` composes on exactly as they are
     (read `plugins/vwf/skills/init/references/fragments-and-sections.md:80-130`
     read-only if the markers' shape is unclear).
   - Keep every comment that explains ordering; rewrite the one that explains
     why the formatter runs first so it names the task.
   - Confirm the file still parses with a top-level `repos:` list (rule 11).
2. **`skills/pre-commit/SKILL.md`** — the examples at `:96,108` show
   `mise x -- <tool>` entries; rewrite them to the task-calling form and add the
   doctrine in one paragraph: a gate tool is configured in its mise task, the
   hook is a thin call, and a repo customising a gate edits the task. Where the
   skill enumerates the shipped hooks, update the list.
3. **`conventions.md`** — same one-paragraph doctrine where the pack states what
   it ships.

## Verification

- `mise run p:plugins:check` green (rule 11 parses the gate config).
- `grep -c 'mise x -- mise run code:' plugins/stackgen/stacks/toolchain-gate/pre-commit/config/.config/pre-commit-config.yaml`
  is 4.
- `grep -nE 'dprint|gitleaks|shellcheck|shfmt|actionlint' …/pre-commit-config.yaml`
  returns only comment lines, or nothing.
- `pre-commit validate-config …/pre-commit-config.yaml` exits 0 (run under
  `mise x --`).

## Guardrails

- Do not touch `pack.yaml` (U9) or any language pack's `pre-commit.d/` (U4).
- Delete with `rm`, never `git rm` (nothing to delete here).
- The config is payload: cite nothing by plugin path; do not format it with this
  repo's dprint.
- Do not add a `files:` regex to the three hooks — the task filters, so the hook
  stays tool-neutral.

## Commit

`feat: pre-commit gate hooks call the format, lint and sec tasks` — written by
the orchestrator after the wave gate. Type `feat`; no scope.
