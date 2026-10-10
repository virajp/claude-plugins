# U1 — Interview checklist and plan-folder template

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/assets/plan-interview.md`,
  `plugins/vwf/assets/templates/plan-folder.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** both owned files, top to bottom, before editing.
- **Lazy-load:** `plugins/vwf/assets/vwf-config.md` (U5 owns it — read only)

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
> - Decision D8: The 13/17 skip leaves the plan text and the gates unit. A level
>   is not a version; the release task applies the skip when it bumps.
> - Decision D9: The last unit is the "gates unit", file `NN-gates.md`. It runs
>   the generators the plan names and passes the full wave gate. It bumps
>   nothing.
> - Decision D11: A new optional key in `.config/vwf.yaml`, `after_landing:`, is
>   a list of commands. The user edits it by hand. `/vwf:execute` runs these
>   commands after every green landing, after the plan's own After landing rows,
>   as `run` steps. A command that the plan also lists runs once.

## Edits

1. **`plugins/vwf/assets/plan-interview.md`**
   - Item 7 (about `:57`): "drives the release intent" becomes "drives the
     release level (item 18)".
   - Item 17: add one sentence — a command that `.config/vwf.yaml`'s
     `after_landing:` already lists is not proposed as a plan step, because
     `/vwf:execute` runs it after every green landing (`vwf-config.md` is the
     doctrine). Remove every mention of a release step from item 17.
   - Item 18: rewrite as **"Release level, per affected project — stated, never
     asked"**, in the style of item 12. The planner derives each level by the D7
     rule, writes one `## Release levels` row per project the units touch
     (`NONE` included) with its reason, and shows the table at the gate; the
     user changes a level there and nothing else changes it. Say that the plan
     never bumps a version and never releases: at landing `/vwf:execute` raises
     each level in `.config/releases.yaml` (highest wins), and a release is cut
     later by hand. Remove the 13/17 sentences from item 18 (D8). Remove the
     consent sentences ("doubles as the consent…", "intent only").
   - Item 18a stays; it does not mention releases.
   - The closing paragraph of section E: remove anything that implies a release
     step.
2. **`plugins/vwf/assets/templates/plan-folder.md`**
   - Consent table: remove the `Release <project> publicly` row and the prose
     that names it (the "one `Release` row per project…" clause; "A release step
     recorded `run` is authorised…" and "a release with no step is intent
     only…").
   - Add a fixed-shape **`## Release levels`** section directly after the
     Consent section, in the index.md template block: a table
     `| Project | Level | Reason |`, one example row, and prose: one row per
     project the units touch, `NONE` included; Level is `NONE`, `PATCH`, `MINOR`
     or `MAJOR`; derived by the planner (interview item 18), never a consent;
     `/vwf:execute` raises each level in `.config/releases.yaml` at landing; a
     folder with no such section is an old-shape folder, run as written, with
     nothing written to the file.
   - Add `Release levels` to the list of blocks "the executor parses" in the
     opening paragraph.
   - Units table: last row `NN-gates-and-bump.md` → `NN-gates.md`; its Owns
     becomes "generated files".
   - Shared-file rule: the version-file row is removed (no unit bumps a
     version); the generated-file row's owner becomes "gates unit only".
   - Unit contract: "A unit never bumps a version" stays.
   - The section **"Gates and bump"** becomes **"Gates"**: runs the generators
     the plan names and passes the full wave gate; bumps no version; remove the
     13/17 sentences (D8). Keep the sentences about the `implementation:` stamps
     and about after-landing steps.
   - Every other "gates-and-bump" in the file becomes "gates unit".

## Verification

- The full wave gate, notably `mise run code:precommit`.
- `grep -n "gates-and-bump\|Release <project>\|publicly" plugins/vwf/assets/plan-interview.md plugins/vwf/assets/templates/plan-folder.md`
  returns nothing.
- `grep -n "Release levels" plugins/vwf/assets/templates/plan-folder.md` returns
  the new section.

## Guardrails

- Do not touch any file outside Owns; `plugins/vwf/skills/**` belongs to U2, U3,
  U4.
- `plugins/**/*.md` is not formatted by dprint: match the fold width of the
  surrounding text by hand.
- Keep each code span on one line; never end a table cell in a bare asterisk.
- Delete with `rm`, never `git rm`. No `git checkout`/`git restore` and no
  formatter `--fix` outside Owns.

## Commit

`feat: plan folders record derived release levels`
