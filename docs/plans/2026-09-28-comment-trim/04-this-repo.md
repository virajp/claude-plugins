# U4 — Trim this repo's repo-only tooling

- **Wave:** 1
- **Depends on:** —
- **Owns:** this repo's repo-only files — every file under `.config/**` whose
  path does **not** also exist under a
  `plugins/stackgen/skills/tool-config/assets/<tool>/` tree or a
  `plugins/stackgen/stacks/*/*/config/` tree (for example
  `.config/mise/tasks/p/**`, `.config/mise/tasks/_scripts/local`);
  `.github/workflows/**`; `mempalace.yaml`; `pnpm-workspace.yaml`
- **Model:** opus
- **Kind:** edit
- **Read first:** build the owned-file list first — for each `.config/**` file,
  test whether the same relative path exists in any shipped tree, and list the
  ones that do not. Then read each owned file top to bottom before editing it.
- **Lazy-load:** `.claude/docs/repo-shape.md` and
  `.claude/docs/ci-and-releases.md` (where a moved explanation lands, if it is
  not already there).

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

1. **Every owned file.** Highest volume first:
   `.config/mise/tasks/p/plugins/shellcheck`, `p/plugins/marketplace` (a 46-line
   header), `p/plugins/local`, `_scripts/local`, `p/i/test`,
   `pnpm-workspace.yaml`, `mempalace.yaml`, `.github/workflows/*.yml`.
2. **`p/plugins/shellcheck`**: keep the one load-bearing sentence of its header
   — its `shfmt` flags must stay in step with the shipped `code:format` hook —
   as a single line. Never change the flags.
3. **`_scripts/local`**: keep what documents its four 13/17 version-guard
   functions' contract in one line each at most.
4. **Moved explanations**: this repo's docs are U6's, so a unit here moves
   nothing into them — an explanation not already in `.claude/docs/**`,
   `CLAUDE.md` or a skill is reported as `DOCS FALSIFIED:` naming where it
   belongs, and U6 writes it. Drop what those docs already say.
5. Keep each file's structure: no reordering, no value or code changes.

## Verification

- `mise run p:plugins:shellcheck` and `mise run p:plugins:check` green.
- `actionlint` over `.github/workflows/*.yml` clean (it runs in `code:lint`).
- `mise tasks` lists the same tasks with the same descriptions (the `#MISE`
  lines are untouched).
- Run the comment-stripped comparison the index's *Gates the orchestrator keeps*
  describes over your files yourself before returning; it must be empty.
- List the owned files in `DECIDED:` as a count per directory, and the
  before/after comment-line totals.

## Guardrails

- Touch no landed copy: a `.config/**` path that exists in any shipped tree is
  out of scope (decision 1), and so is the root `.gitignore`.
- Never touch `.config/pre-commit-config.yaml` — it is a landed copy, and a
  modified-but-unstaged copy aborts every commit.
- Never change a value, a key, a code line, a flag or a directive.
- Delete with `rm`, never `git rm`; never run `git checkout`/`git restore` or a
  formatter's `--fix` outside Owns.

## Commit

`refactor: trim this repo's own tooling comments`
