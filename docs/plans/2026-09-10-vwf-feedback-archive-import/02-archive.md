# U2 — archive: a change-plan folder is archived whole

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/archive/**`
- **Model:** opus
- **Read first:** `archive/SKILL.md` top to bottom — `:32` (`$ARGUMENTS`), `:33`
  (candidates from the index), `:55-56` (`requires:`/`covers:`), `:65-68` (the
  move), `:71-74` (the index row).
- **Lazy-load:** `plugins/vwf/skills/change-execute/SKILL.md:150-165` (§7, how
  change-execute archives its own folder and what Status it writes);
  `plugins/vwf/skills/change-plan/references/plan-template.md` (the frontmatter
  and Status shapes).

## Ruling

From index.md's assumed decisions, verbatim:

> **2.** **Teach archive folders.** A `docs/plans/<date>-<name>/` whose
> `index.md` frontmatter is `type: vwf-change-plan` is moved whole to
> `docs/plans/archived/<date>-<name>/`; `requires:`/`covers:` are read from
> `index.md`; only the Status line is rewritten (`ARCHIVED <date> — not run`
> unless it already reads `COMPLETE`); `docs/plans/index.md` is never touched
> (decision 9 of the 2026-09-08 plan stands).

The user: *"Teach archive folders"*.

## Edits

1. **The argument (`:32`).** `$ARGUMENTS` may name a flat plan file or a plan
   folder; a folder is recognised by `index.md` with `type: vwf-change-plan` in
   its frontmatter. Anything else that is a directory is refused with one line.
2. **Candidates (`:33`).** Folders are not listed from `docs/plans/index.md`
   (they are never in it); when no argument is given, list the folders under
   `docs/plans/` whose `index.md` Status is not `RUNNING` beside the flat
   candidates, marked as change plans.
3. **Frontmatter reads (`:55-56`).** For a folder, `requires:` and `covers:`
   come from `index.md`. A folder another non-archived plan `requires:` is
   refused, exactly as a flat plan would be.
4. **The move (`:65-68`).** For a folder:
   `mv docs/plans/<date>-<name>
   docs/plans/archived/<date>-<name>` — whole,
   unit files included. No gap-report companion exists for a folder.
5. **The Status line.** If `index.md` reads `COMPLETE`, leave it. Otherwise
   rewrite the Status heading's first bold word to `ARCHIVED` and the line under
   it to `ARCHIVED <date> — not run; was <previous status>`. Nothing else in the
   folder changes.
6. **The index row (`:71-74`).** Skipped for a folder: change plans are not
   listed in `docs/plans/index.md` (decision 9), and archive does not start
   listing them.
7. **The description in the frontmatter** — mention folders if it enumerates
   what is archived; strict YAML.

## Verification

- `mise run plugins:check` green.
- `grep -n 'vwf-change-plan' plugins/vwf/skills/archive/SKILL.md` → at least one
  hit.
- `grep -n 'docs/plans/index.md' plugins/vwf/skills/archive/SKILL.md` — the
  folder path says it is never written.
- Fold width by hand.

## Guardrails

- Do not touch `change-execute/**` or `change-plan/**` — cite, do not edit.
- Do not touch `feedback/**` (U1), the `import-*` skills (U3), any doc (U4),
  `plugin.json` (U5).
- Strict-YAML frontmatter.
- Delete with `rm`, never `git rm` (nothing here is deleted).
- Never run `git checkout`, `git restore`, `git stash`, or a formatter with
  `--fix` on a path outside your Owns.

## Commit

`feat(vwf): archive moves a change-plan folder whole` — written by the
orchestrator after the wave gate, not by the unit.
