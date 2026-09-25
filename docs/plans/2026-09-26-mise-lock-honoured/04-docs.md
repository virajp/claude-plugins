# U4 — Docs

- **Wave:** 3
- **Depends on:** U3
- **Owns:** `plugins/stackgen/stacks/toolchain-manager/mise/skills/mise/**`,
  `plugins/stackgen/stacks/toolchain-manager/mise/conventions.md`,
  `site/src/content/docs/plugins/stackgen.md`,
  `site/src/content/docs/plugins/vwf.md`,
  `docs/memory/decisions/2026-09-26-mise-lock-honoured.md` (new), `readme.md`,
  `CLAUDE.md`, `.claude/**` (the last three owned so docs-sync's findings have a
  home; the survey found no passage in them this change falsifies)
- **Model:** opus
- **Kind:** edit
- **Read first:** `plugins/vwf/skills/docs-sync/SKILL.md`; the committed wave-1
  files (the pack's `setup/mise` and `setup/all`); index.md's Facts section (its
  docs bullet is the passage list); every `DOCS FALSIFIED:` line U1 and U2
  returned; `docs/memory/decisions/2026-09-20-pack-first-run-safety.md` (the
  ruling this narrows); `plugins/vwf/assets/memory.md` (the decision-doc rules).
- **Lazy-load:** `site/CLAUDE.md` before touching a heading or an anchor.

## Ruling

Decisions 1–6 of index.md, as the behaviour the docs now describe (quoted in
full in `01-pack-tasks.md`). The Goal, quoted:

> After this lands, the mise pack's `setup:all` always installs tools from the
> committed lockfile (`mise install --locked`), a lockfile is written only when
> none exists or when the user passes `--upgrade` in the dev environment, and
> nothing runs `mise upgrade` any more.

Decision 10: *The docs unit writes
`docs/memory/decisions/2026-09-26-mise-lock-honoured.md` recording both
reversals and rulings 1–6.* The two reversals, quoted from index.md's Goal: the
2026-09-20 ruling is **narrowed** (`setup:all` forwards `--upgrade`, off by
default), and B54's "without `--upgrade`: run `mise lock`" is corrected by the
user: *"lock file must only be created in 2 situations: 1. If the lock files do
not exist 2. If `--upgrade` is passed and then versions must be upgraded
across"*.

## Edits

1. **Run `vwf:docs-sync`** over the branch delta and apply its findings inside
   Owns.
2. **The survey's passages**:
   - `task-library.md` :148 (`setup:mise [--upgrade]` row), :201–213 (the
     no-clobber contract — `setup:all` now passes `--upgrade` when the user
     does), :259–320 (the `setup/*` section; :320 the upgrade is
     `setup:all --upgrade`, dev only); add `--upgrade` to `setup:all`'s row.
   - `SKILL.md` :245–272 (:255 no `mise upgrade --local`).
   - `conventions.md` :22, :88, :124–153 (:152 the flag list).
   - `site/.../stackgen.md` :982–1102 (:989).
   - `site/.../vwf.md` :3344 — check; edit only if falsified.
3. **The decision doc** — new file, per `memory.md`'s shape, linking
   `2026-09-20-pack-first-run-safety.md` as narrowed.
4. **Every `DOCS FALSIFIED:` line** from U1 and U2.
5. `grep -rn "mise upgrade"` across `plugins/stackgen`, `site/src/content/docs`,
   `.claude`, `readme.md`, `CLAUDE.md` prints nothing but the decision doc's
   history.

## Verification

- `mise run code:precommit` green
- `mise run p:plugins:check` green
- `mise run p:site:check` green

## Guardrails

- Never touch a task file, a config payload or a version.
- `plugins/**/*.md` is not formatted — match the surrounding fold width by hand.
- No table cell ends in a bare `*`; no code span wraps a line.
- Delete with `rm`, never `git rm`; no `git checkout`/`restore`.

## Commit

`docs: mise lock honoured — the task library, the manual and the decision` —
written by the orchestrator after the wave gate.
