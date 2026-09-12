# U4 — The language packs: fragments lose their gate hooks, overlays take a file list

- **Wave:** 1
- **Depends on:** —
- **Owns:** under `plugins/stackgen/stacks/`:
  `toolchain-gate/eslint/config/.config/pre-commit.d/eslint.yaml` (delete),
  `toolchain-gate/eslint/config/.config/mise/tasks/code/lint`;
  `toolchain-gate/ruff/config/.config/pre-commit.d/ruff.yaml` (delete),
  `toolchain-gate/ruff/config/.config/mise/tasks/code/{format,lint}`;
  `package-manager/pnpm/config/.config/pre-commit.d/pnpm.yaml` (delete),
  `package-manager/pnpm/config/.config/mise/tasks/code/{format,lint}`;
  `package-manager/uv/config/.config/pre-commit.d/uv.yaml`;
  `app-framework/flutter/config/.config/pre-commit.d/flutter.yaml` (delete),
  `app-framework/flutter/config/.config/mise/tasks/code/{format,lint}`; and each
  of those five packs' `conventions.md` and `skills/**` **only where they
  describe the fragment or the two tasks**. Touch nothing outside this list.
- **Model:** opus
- **Read first:** every owned file, top to bottom. Then, read-only, the mise
  pack's shipped `code/format` and `code/lint` **as they are on disk when you
  start** (U1 is rewriting them concurrently; the contract you honour is quoted
  below, not the file).
- **Lazy-load:**
  `plugins/stackgen/stacks/toolchain-manager/mise/skills/mise/references/task-library.md`
  §28 for the `#USAGE` header shape.

## Ruling

Quoted from index.md:

> **2. File-list contract.** `code:format`, `code:lint`, `code:sec` declare
> `#USAGE arg "[files]..."`; an empty list means the whole tree. Every overlay
> honours the list. A tool that cannot take a file list (dependency_validator,
> `dart analyze` on a package, `uv run ruff check` on a project) runs whole-tree
> when files are given, and the unit reports each such tool as `DECIDED:`.

> **3.** … `code:lint`'s two shipped defaults (shellcheck, actionlint) run
> before the placeholder notice and must survive an overlay. (From U2's wording
> of the same ruling: an overlay replacing `code/lint` **keeps** the two
> defaults and the file argument.)

> **5. Fragments.** Every language fragment loses its gate hooks. `eslint.yaml`,
> `ruff.yaml` and `pnpm.yaml` become empty and are deleted with `rm`.
> `flutter.yaml` is deleted too: import_sorter moves into flutter's
> `code/format` (it is a formatter), and dart analyze + dependency_validator
> already live in flutter's `code/lint`. `uv.yaml` keeps only `uv lock --check`,
> which is not a gate tool.

## Edits

1. **Fragments** — `rm` `eslint.yaml`, `ruff.yaml`, `pnpm.yaml`, `flutter.yaml`.
   Edit `uv.yaml` so only the `uv lock --check` hook remains, with its marker
   comments intact.
2. **Every overlay `code/format` and `code/lint`** (eslint lint; ruff format +
   lint; pnpm format + lint; flutter format + lint):
   - add
     `#USAGE arg "[files]..." help="Files to check; the whole tree when empty"`
     and read `${usage_files:-}`;
   - pass the list to every tool that takes one (`dprint fmt <files>`,
     `pnpm dlx @askviraj/linter <files>`, `ruff format <files>`,
     `ruff check <files>`, `dart format <files>`, `sort-package-json` over the
     given `package.json` files only, `import_sorter` where it takes paths);
   - a tool that cannot take the list runs whole-tree when files are given:
     `dependency_validator`, `dart analyze` (report each as `DECIDED:`);
   - every `code/lint` overlay keeps the mise pack's two defaults first:
     `shellcheck -x` over shell files in scope when the binary is present,
     `actionlint` over workflow files in scope when present, each skipping
     silently — copy the exact block shape U1 defines by reading the mise pack's
     `code/lint` **after** wave 1's commit if the orchestrator sequences you
     later; if you run concurrently, write the two defaults from this
     description and report `GAP:` naming that U1's shape may differ, so the
     orchestrator reconciles at the wave review;
   - flutter `code/format` gains the import_sorter step that `flutter.yaml:21`
     ran, same flags.
3. **Pack docs** — in each pack's `conventions.md` / skill, remove the sentence
   that says the pack ships a pre-commit fragment for the gate (keep uv's), and
   say the task takes a file list and the hook calls it.

## Verification

- `mise run p:plugins:check` green (rule 11 parses every surviving fragment; a
  deleted fragment is fine).
- `mise run p:plugins:shellcheck` green over every edited task.
- `test ! -e` for the four deleted fragments; `grep -c 'uv lock' …/uv.yaml` is 1
  and `grep -c 'ruff\|linter' …/uv.yaml` is 0.
- `grep -L 'usage_files' <each owned code/format and code/lint>` is empty.
- `grep -l 'shellcheck' <each owned code/lint>` lists all four.

## Guardrails

- Do not touch the mise pack (U1), the pre-commit pack (U3) or any `pack.yaml`
  (U9).
- Delete with `rm`, never `git rm`.
- Payload: cite nothing by plugin path; do not run this repo's formatter over
  these files.
- Every task file keeps its exec bit and shebang.
- Never write file content through a heredoc after a pipe (`npm` → `pnpm`
  rewrite).

## Commit

`feat: language packs drop their gate fragments and their tasks take a file list`
— written by the orchestrator after the wave gate. Type `feat`; no scope.
