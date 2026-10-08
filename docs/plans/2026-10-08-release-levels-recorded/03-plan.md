# U3 — plan derives release levels

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/plan/SKILL.md`,
  `plugins/vwf/skills/plan/references/plan-doc.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** both owned files, top to bottom, before editing.
- **Lazy-load:** `plugins/vwf/assets/plan-interview.md`,
  `plugins/vwf/assets/templates/plan-folder.md` (U1 owns them — read only)

## Ruling

> - Decision D2: No plan carries a release after-landing step. `/release` is
>   always a hand step. Ruling 9 of 2026-09-17, the CLAUDE.md exception and
>   override O4 are reversed.
> - Decision D6: `index.md` has a fixed-shape `## Release levels` table, columns
>   Project, Level, Reason, after the Consent block. One row for each project
>   the units touch, `NONE` included. The `Release <project>` rows leave the
>   Consent block.
> - Decision D7: Interview item 18 is stated, never asked. The planner derives
>   each level from the change: breaks users → `MAJOR`, new behaviour → `MINOR`,
>   a fix → `PATCH`, no user-visible change → `NONE`. It shows each level with
>   its reason at the approval gate, as it shows the priority; the user changes
>   a level there.
> - Decision D9: The last unit is the "gates unit", file `NN-gates.md`. It runs
>   the generators the plan names and passes the full wave gate. It bumps
>   nothing.

## Edits

1. **`plugins/vwf/skills/plan/SKILL.md:341-342`** — the consent step: "release
   intent per project … authorised by item 18's answer" becomes the release
   levels, derived per item 18 and stated at the gate with their reasons; a
   cycle plan carries no release step. A slice lands blueprint behaviour, so its
   levels are normally `MINOR` or `MAJOR`; say the D7 rule decides.
2. **`plugins/vwf/skills/plan/SKILL.md:406`** — the final units are the docs
   unit and the gates unit. Rename every "gates-and-bump" in the file.
3. **`plugins/vwf/skills/plan/SKILL.md:522-527`** — the never-do list: replace a
   mention of a release consent with "records a release step".
4. **`plugins/vwf/skills/plan/references/plan-doc.md:47`** — "the docs unit and
   the gates-and-bump unit close the plan" becomes "the docs unit and the gates
   unit close the plan"; if the passage mentions a bump, remove it.

## Verification

- The full wave gate, notably `mise run code:precommit`.
- `grep -n "gates-and-bump\|release intent" plugins/vwf/skills/plan/SKILL.md plugins/vwf/skills/plan/references/plan-doc.md`
  returns nothing.

## Guardrails

- Do not touch any file outside Owns;
  `plugins/vwf/skills/plan/references/delta-checks.md` is not this unit's and
  its API "major-version bump" text is a different subject.
- `plugins/**/*.md` is not formatted by dprint: match the fold width by hand.
- Keep each code span on one line.
- Delete with `rm`, never `git rm`. No `git checkout`/`git restore` and no
  formatter `--fix` outside Owns.

## Commit

`feat: plan derives release levels and asks no release question`
