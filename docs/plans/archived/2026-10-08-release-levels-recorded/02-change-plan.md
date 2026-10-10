# U2 — change-plan derives release levels

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/change-plan/SKILL.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** the owned file, top to bottom, before editing.
- **Lazy-load:** `plugins/vwf/assets/plan-interview.md`,
  `plugins/vwf/assets/templates/plan-folder.md` (U1 owns them — read only)

## Ruling

> - Decision D2: No plan carries a release after-landing step. `/release` is
>   always a hand step. Ruling 9 of 2026-09-17, the CLAUDE.md exception and
>   override O4 are reversed.
> - Decision D3: The file is `.config/releases.yaml`. It has one key for each
>   project, with the value `NONE`, `PATCH`, `MINOR` or `MAJOR`. An absent key
>   reads as `NONE`. An absent file reads as all `NONE`.
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
> - Decision D11: A new optional key in `.config/vwf.yaml`, `after_landing:`, is
>   a list of commands. The user edits it by hand. `/vwf:execute` runs these
>   commands after every green landing, after the plan's own After landing rows,
>   as `run` steps. A command that the plan also lists runs once.

## Edits

1. **Frontmatter `description:` (`:9`)** — "agree the gate, the after-landing
   steps and the release intent" becomes "agree the gate and the after-landing
   steps, derive the release levels". Keep the YAML valid (strict YAML; a colon
   inside the value needs the existing quoting).
2. **§4 heading and intro (`:150`)** — the heading names the gate, the
   after-landing steps and the release levels. "Four sub-steps, each proposed
   and confirmed" stays true only for (a), (b), (d); say (c) is stated, not
   confirmed.
3. **§4(b)** — remove "a local staging step and a release step alike"; a plan
   never carries a release step. Add: a command already in `.config/vwf.yaml`'s
   `after_landing:` list is not proposed, because `/vwf:execute` runs it after
   every green landing.
4. **§4(c)** — rewrite as **"Release levels"**: for each project the units
   touch, derive `NONE`/`PATCH`/`MINOR`/`MAJOR` by the D7 rule, with a one-line
   reason; write them as the `## Release levels` table; never ask. State that no
   unit bumps a version and no plan releases: `/vwf:execute` raises each level
   in `.config/releases.yaml` at landing, and `/release` is a later hand step.
   Remove the "doubles as the consent" paragraph and "The gates-and-bump unit
   bumps with the command the plan names".
5. **§5 item 6** (`:226`) — "the consent block — … — and the release intent"
   becomes "the consent block — the End an `all` run after landing row among it
   — and the release levels, each with its reason, stated as a fact like the
   priority; the user may change a level here".
6. **§6 rules** (`:291-293`) — "the **gates-and-bump unit**, which bumps each
   released project's version with the command the plan names, runs the
   generators …" becomes "the **gates unit**, which runs the generators the plan
   names and passes the full wave gate. Nothing else touches docs; no unit bumps
   a version." Rename every other "gates-and-bump" in the file to "gates unit".
7. **§7 self-review** — add a bullet: every project the units touch has a
   `## Release levels` row with a reason, and the Consent block has no `Release`
   row.
8. **Never-do list** (`:386-388`) — "Executes a unit, edits a file the plan
   names, or bumps a version" stays. "Records a release or landing consent it
   did not explicitly ask for" becomes "Records a landing consent it did not
   explicitly ask for, or a release step".

## Verification

- The full wave gate, notably `mise run p:plugins:check` (strict-YAML
  frontmatter) and `mise run code:precommit`.
- `grep -n "gates-and-bump\|release intent\|Release <project>" plugins/vwf/skills/change-plan/SKILL.md`
  returns nothing.

## Guardrails

- Do not touch any file outside Owns.
- `plugins/**/*.md` is not formatted by dprint: match the fold width by hand.
- Keep each code span on one line; never end a table cell in a bare asterisk.
- Delete with `rm`, never `git rm`. No `git checkout`/`git restore` and no
  formatter `--fix` outside Owns.

## Commit

`feat: change-plan derives release levels and asks no release question`
