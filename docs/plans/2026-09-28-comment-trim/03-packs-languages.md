# U3 — Trim the language, app-framework, package-manager and gate packs

- **Wave:** 1
- **Depends on:** —
- **Owns:** under
  `plugins/stackgen/stacks/{language,app-framework,package-manager,toolchain-gate}/*/`:
  `config/**`, `hooks/**`, `conventions.md` — today swift, swiftui, flutter,
  pnpm, uv, analysis-options, eslint, ruff, swift-format, swiftlint, tsconfig
- **Model:** opus
- **Kind:** edit
- **Read first:** each pack's `pack.yaml` and `conventions.md`, then its payload
  files top to bottom before editing.
- **Lazy-load:** `plugins/stackgen/assets/pack-format.md`,
  `.config/mise/tasks/p/plugins/npm-normalize-test` (what the pnpm hook's table
  test exercises).

## Ruling

> - Decision 1 — Scope: The shipped files — tool-config assets, pack payloads
>   and pack hooks — plus this repo's repo-only tooling. This repo's landed
>   copies of the assets and its root `.gitignore` wait for the next
>   `/vwf:setup reshape` (gate-hardening B6).

> - Decision 3 — The trim rule: Keep every comment a tool or skill reads:
>   `#MISE`/`#USAGE`, shebangs, `# shellcheck` directives, `# >>>`/`# <<<`
>   markers, `MARKED POSITION` lines, grype reason comments, fill-in templates,
>   and any comment a reference names as load-bearing. Keep a single-line
>   warning where a reader would otherwise break something non-obvious. Every
>   longer explanation goes: dropped when the owning reference already says it,
>   moved into that reference (tool-config `references/*.md`, the pack's
>   `conventions.md`) when it does not. Repeated boilerplate goes; a directive
>   under it stays.

> - Decision 6 — Proof that only comments changed: After each wave, the
>   orchestrator compares every touched file before and after with comment and
>   blank lines stripped; the diff must be empty. No review row.

## Edits

1. **Every payload file** under the owned packs' `config/**`, and the pnpm hooks
   `hooks/npm-normalize.sh` and `hooks/hooks.yaml`. Highest volume first: swift
   and swiftui `code/lint` and `code/format`, swiftui `test/golden`, flutter
   `code/lint`, pnpm `code/format` and `code/lint`, eslint `code/lint`, ruff
   tasks.
2. **Repeated boilerplate goes**, the directive under it stays: the "helpers
   ships with stackgen:tool-config…" sentence above each
   `# shellcheck source=/dev/null`; "This task is also the repo's linting HOOK…"
   in each `code/lint`; "This task is what the `format` pre-commit hook calls…"
   in each `code/format`; "The toolchain manager's two shipped defaults…". Where
   one line of it is a needed warning, one line stays.
3. **The byte-identical pair**: swift and swiftui `code/format` stay
   byte-identical after the trim; trim swift and swiftui `code/lint` the same
   way so they differ only where they differed before.
4. Moved explanations go into that pack's `conventions.md`, in its voice. Keep
   each file's structure: no reordering, no value or code changes.
5. Format a payload file only with the **shipped** dprint config
   (`plugins/stackgen/skills/tool-config/assets/dprint/.config/dprint.json`),
   never this repo's.

## Verification

- `mise run p:plugins:check`, `mise run p:plugins:shellcheck` and
  `mise run p:plugins:npm-normalize-test` green.
- Per file, the counts of `#MISE`, `#USAGE`, `# shellcheck` and marker lines are
  unchanged.
- `cmp` of the swift and swiftui `code/format` succeeds.
- Run the comment-stripped comparison the index's *Gates the orchestrator keeps*
  describes over your files yourself before returning; it must be empty.
- Report the before/after comment-line totals per pack in `DECIDED:`.

## Guardrails

- Touch no `pack.yaml` (U7 bumps versions), no bundle, no `inventory.md`, and no
  pack outside the four owned types (U2 owns the rest).
- Never change a value, a key, a code line or a directive.
- `plugins/**/*.md` is not dprint-formatted: match fold width by hand.
- Delete with `rm`, never `git rm`; never run `git checkout`/`git restore` or a
  formatter's `--fix` outside Owns.

## Commit

`refactor: trim language, app, package-manager and gate pack comments`
