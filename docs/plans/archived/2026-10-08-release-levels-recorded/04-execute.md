# U4 — execute writes release levels and bumps nothing

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/execute/SKILL.md`,
  `plugins/vwf/skills/execute/references/all.md`,
  `plugins/vwf/skills/execute/references/edit-unit.md`,
  `plugins/vwf/skills/execute/references/preflight.md`,
  `plugins/vwf/agents/execute-runner.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file, top to bottom, before editing.
- **Lazy-load:** `plugins/vwf/assets/templates/plan-folder.md`,
  `plugins/vwf/assets/vwf-config.md` (U1 and U5 own them — read only)

## Ruling

> - Decision D2: No plan carries a release after-landing step. `/release` is
>   always a hand step. Ruling 9 of 2026-09-17, the CLAUDE.md exception and
>   override O4 are reversed.
> - Decision D3: The file is `.config/releases.yaml`. It has one key for each
>   project, with the value `NONE`, `PATCH`, `MINOR` or `MAJOR`. An absent key
>   reads as `NONE`. An absent file reads as all `NONE`.
> - Decision D4: The highest level wins. The executor raises a key only when the
>   new level is higher, and never lowers a key. `PATCH` after `MAJOR` stays
>   `MAJOR`. The release tasks clear a key when they release it.
> - Decision D5: `/vwf:execute` writes the file itself, on the integration
>   branch after the merge, in the commit that marks the plan `COMPLETE`. Two
>   runs at the same time thus cause no merge conflict.
> - Decision D6: `index.md` has a fixed-shape `## Release levels` table, columns
>   Project, Level, Reason, after the Consent block. One row for each project
>   the units touch, `NONE` included. The `Release <project>` rows leave the
>   Consent block.
> - Decision D9: The last unit is the "gates unit", file `NN-gates.md`. It runs
>   the generators the plan names and passes the full wave gate. It bumps
>   nothing.
> - Decision D10: A folder with no `## Release levels` section is an old-shape
>   folder. Its units run as written, the executor writes nothing to
>   `.config/releases.yaml`, and the final report says so in one line. Preflight
>   does not refuse it.
> - Decision D11: A new optional key in `.config/vwf.yaml`, `after_landing:`, is
>   a list of commands. The user edits it by hand. `/vwf:execute` runs these
>   commands after every green landing, after the plan's own After landing rows,
>   as `run` steps. A command that the plan also lists runs once. The key is
>   additive: `config_format` stays 23.
> - Decision D12: In an `all` run, the `after_landing:` commands are steps like
>   the plan rows, so the "Deduped after-landing steps" override applies to them
>   too.

## Edits

1. **`plugins/vwf/skills/execute/SKILL.md`**
   - Fixed final units (`:677`, `:749-751`): "gates-and-bump unit" → "gates
     unit"; it runs the generators the plan names and passes the full wave gate;
     remove "bumps each released project's version per the consent block with
     the command that block names".
   - Final report (`:776`): "versions bumped" becomes "release levels recorded"
     — the rows written to `.config/releases.yaml`, or the one line "old-shape
     folder — no release levels recorded" (D10).
   - Landing (`:804-838`) and the step that marks the plan `COMPLETE`: add the
     **release-levels write** (D3, D4, D5). After the merge, on the integration
     branch in the main checkout, read the folder's `## Release levels` table;
     for each row whose Level is higher than the key's current value in
     `.config/releases.yaml` (absent = `NONE`), set the key; create the file
     when absent, with a two-line header comment (written by `/vwf:execute` at
     landing; cleared by the release tasks); never lower a key; `NONE` rows
     change nothing. Stage the file into the same commit that records
     `COMPLETE`. When the branch did not merge, write nothing.
   - After landing (about `:886-912`): remove "a release step recorded `run`
     runs on the same terms" and any other release-step text. Add the
     `after_landing:` default (D11): after the plan's own rows, run each command
     in `.config/vwf.yaml`'s `after_landing:` list in order, as a `run` step,
     skipping a command the plan's rows already ran; same failure rule as a plan
     step (a failed step stops the rest). When the branch did not merge, no
     default step runs, as for plan steps. Remove the `hold release` deferral
     sentence; keep the `skip as deduped` one, and say it applies to default
     steps too (D12).
   - Never-do (`:950-962`): "Runs a generator or bumps a version outside the
     gates-and-bump unit" → "Bumps a version, ever; runs a generator outside the
     gates unit"; the consented after-landing step stays the one exception for
     generators. Rename every other "gates-and-bump".
2. **`plugins/vwf/skills/execute/references/all.md`**
   - Remove the run-level question "One release at the end" (`:44-47`), the
     `hold release:` override line (`:68`), and the held-release run after the
     last plan (`:133-136`). Renumber or re-word what refers to them.
   - "Deduped after-landing steps" (`:39`): say it covers the `after_landing:`
     default commands too (D12).
3. **`plugins/vwf/skills/execute/references/edit-unit.md:22`** — "do not bump a
   version" stays; rename any "gates-and-bump".
4. **`plugins/vwf/skills/execute/references/preflight.md`** — add: a missing
   `## Release levels` section is not a refusal (D10); a present section whose
   Level cell is not one of `NONE`, `PATCH`, `MINOR`, `MAJOR` is a refusal
   naming the row. A `Release <project>` Consent row in an old-shape folder is
   ignored.
5. **`plugins/vwf/agents/execute-runner.md:39`** — remove the `hold release:`
   parse line and any text that depends on it.

## Verification

- The full wave gate, notably `mise run p:plugins:check` and
  `mise run code:precommit`.
- `grep -rn "hold release\|One release at the end\|gates-and-bump" plugins/vwf/skills/execute plugins/vwf/agents/execute-runner.md`
  returns nothing.
- `grep -n "releases.yaml" plugins/vwf/skills/execute/SKILL.md` returns the
  landing write.

## Guardrails

- Do not touch any file outside Owns;
  `plugins/vwf/skills/execute/references/acceptance-and-ux.md`,
  `review-unit.md`, `code-unit.md` and `blocking.md` are not this unit's.
- `plugins/**/*.md` is not formatted by dprint: match the fold width by hand.
- The agent file's frontmatter is strict YAML; keep it valid.
- Keep each code span on one line; never end a table cell in a bare asterisk.
- Delete with `rm`, never `git rm`. No `git checkout`/`git restore` and no
  formatter `--fix` outside Owns.

## Commit

`feat: execute records release levels at landing and bumps no version`
