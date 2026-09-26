# U5 — Docs

- **Wave:** 3
- **Depends on:** U3, U4
- **Owns:** `plugins/stackgen/stacks/toolchain-manager/mise/skills/mise/**`,
  `plugins/stackgen/stacks/toolchain-manager/mise/conventions.md`,
  `site/src/content/docs/**`, `readme.md`, `CLAUDE.md`, `.claude/**`,
  `docs/memory/decisions/2026-09-26-mise-lock-gaps.md` (new)
- **Model:** opus
- **Kind:** edit
- **Read first:** `plugins/vwf/skills/docs-sync/SKILL.md`; the committed wave-1
  files; index.md's Facts (its docs bullet is the passage list); every
  `DOCS FALSIFIED:` line U1–U3 returned;
  `docs/memory/decisions/2026-09-26-mise-lock-honoured.md` (the decision this
  one extends); `plugins/vwf/assets/memory.md`.
- **Lazy-load:** `site/CLAUDE.md` before touching a heading or an anchor.

## Ruling

Decisions 1–6 of index.md, as the behaviour the docs now describe (quoted in
full in `01-pack-tasks.md`, `02-repo-config.md`, `03-vwf-callers.md`). The Goal,
quoted:

> After this lands, a lockfile is written only by `setup:mise` — when a config
> file that declares at least one tool has no lockfile, or under `--upgrade` in
> dev — and `setup:all` refuses to run with `MISE_ENV` unset, while every vwf
> caller of it passes `MISE_ENV=dev`.

Decision 9: any sentence you add is short; trimming existing prose is B65's.

## Edits

1. **Run `vwf:docs-sync`** over the branch delta; apply its findings inside
   Owns.
2. **The survey's passages**: the mise pack's `SKILL.md` :66,
   `references/config-files.md` :40, `references/task-library.md` (the
   `setup:all` / `setup:mise` rows and the no-clobber contract),
   `conventions.md` :164 (unset `MISE_ENV` is now refused by `setup:all`);
   `site/.../plugins/stackgen.md` (the `setup:all` passage); `readme.md` and
   `CLAUDE.md` wherever they show `mise run setup:all`;
   `.claude/docs/ci-and-releases.md:17-23` (the CI lock files).
3. **The decision doc** — new, per `memory.md`, recording decisions 1–5 and
   linking `2026-09-26-mise-lock-honoured.md` as extended.
4. **Every `DOCS FALSIFIED:` line** from U1–U3.

## Verification

- `MISE_ENV=dev mise run code:precommit` green
- `mise run p:plugins:check` green
- `mise run p:site:check` green

## Guardrails

- Never touch a task file, a config payload, a vwf skill U3 owns, or a version.
- `plugins/**/*.md` is not formatted — match the fold width by hand.
- No table cell ends in a bare `*`; no code span wraps a line.
- Delete with `rm`, never `git rm`; no `git checkout`/`restore`.

## Commit

`docs: mise lock gaps — the task library, the manual and the decision` — written
by the orchestrator after the wave gate.
