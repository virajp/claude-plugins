# U2 — init, setup and doctor: current keys and dry-run output

- **Read first:** every owned file, top to bottom, before editing.
- **Lazy-load:** `/Users/virajpatel/Projects/github.com/virajp/bootstrap/docs/design/cli.md`, section "The output of a run" (about lines 1079-1170) and "The exit codes" (about line 1272); `.../bootstrap/docs/design/bootstrap-config.md`; `.../bootstrap/docs/sync/migrate.md` (M34).

## Ruling

D3, the user's answer, verbatim:

> Include in P0 (Recommended): It is the same kind of drift: today the checks
> detect nothing. The fix is prose in 4 places (init SKILL.md, setup SKILL.md,
> doctor stack-checks.md). R3 replaces it later with `bootstrap check --json`.

D4, the user's answer, verbatim:

> New key only: Read only `[tools.git.branch.<b>]`. A repo in the old form
> reads as `direct` until a bootstrap sync migrates it, which is today's silent
> behavior.

D9: lines to add go into the repo's `.gitignore` directly; lines to remove from
the shared `.gitignore` become `[tools.git.files.".gitignore"]` entries with
`"$mode" = "remove"` in `.config/bootstrap.toml`.

D14, the rule for the new dry-run output:

> By exit code and stderr. The CLI prints a last line, the headline: 'Dry run:
> no file would change' or 'Dry run: <n> file(s) would change', after a glyph or
> an [OK] tag. Exit 0 with 'Dry run: no file would change' and no
> 'bootstrap_commit would change to' line is no drift. Exit 0 with a headline of
> one or more files, or a 'bootstrap_commit would change to' line, is drift; the
> list lines (would change, would add, would seed, would remove) are the detail.
> Any other exit code is drift unknown, with the last stderr line as the reason;
> code 2 with 'run bootstrap init' means the values file is in an old form.

D15, the user's answer to a rulings-review gap, verbatim:

> Drift unknown (Recommended): Drift unknown, with the reason "no Dry run
> headline: the repo's setup:configs runs an older sync engine; run bootstrap
> init". It is never green and never a guessed drift row.

D16, the user's answer to a rulings-review gap, verbatim:

> 3 passages (Recommended): D3 means the three parser passages. doctor
> SKILL.md:290 stays unchanged, because the new list lines still begin with
> `would`. The plan records the correction.

D20, the user's answer to a rulings-review gap, verbatim:

> Name bootstrap init (Recommended): Any prose that names the migration says
> "run bootstrap init", the words bootstrap itself prints. D4's ruling (new key
> only) does not change.

D24, the user's answer to a rulings-review gap, verbatim:

> Unset it for the run (Recommended): The checks run
> `env -u BOOTSTRAP_VERBOSE mise run setup:configs --dry-run`, so the output is
> always the non-verbose form that D14 reads. One parser stays.

D25, the user's answer to a rulings-review gap, verbatim. It replaces the last
clause of D14 ("code 2 with 'run bootstrap init' means the values file is in
an old form") and the reason part of "drift unknown":

> bootstrap's error + fix (Recommended): Report the exit code, the last
> bootstrap error line (it starts with `✗` or `[ERROR]`) and its fix line
> (`→ …`) when one follows, word for word. With no such line, report the last
> stderr line. The check does not guess the cause from the code; this replaces
> the "code 2 means old form" clause of D14.

D28, the user's answer to a rulings-review gap, verbatim:

> Only the 3 run lines (Recommended): Only the line each check executes: init
> SKILL.md:411, setup SKILL.md:119, doctor stack-checks.md:570. The other
> mentions name the task in prose and stay as they are (D16 already keeps
> doctor SKILL.md:290).

So on those three run lines only, the command becomes
`env -u BOOTSTRAP_VERBOSE mise run setup:configs --dry-run`. That is the one
change allowed inside the mise-trust paragraph that edit 1 otherwise keeps.

D26, the planner's rulings from round 3: the headline is matched as the start of
the last line; the init parser passage is lines 424-432.

D7: U1 states the same key rule. In `teams` mode, agree the wording with U1.

## Edits

1. **The dry-run parsers** — replace each description of the old output with
   the D14 rule. Keep each passage's own outcome words (no drift / drift / drift
   unknown, the green and not-green terms, doctor's row and warning shapes, the
   remedy `/vwf:setup reshape`), and keep the mise-trust paragraph before it
   unchanged. Remove every mention of the `repo-sync:` prefix, `would update`,
   `would chmod`, `would set bootstrap_commit`, `kept seed` and `skip` as
   output words. Mention that the list lines name the files, so a drift row or
   report lists those lines.
   - `plugins/vwf/skills/init/SKILL.md` lines 424-432.
   - D26 (6): the headline is matched as the start of the last line, after
     the glyph or `[OK]` tag; count suffixes such as ` · 161 unchanged` follow
     it on the same line and do not change the result.
   - `plugins/vwf/skills/setup/SKILL.md` lines 129-133: replace only the text after "holds now." on line 129 (D31).
   - `plugins/vwf/skills/doctor/references/stack-checks.md` lines 576-587: in
     the "Exit 5, or any other failure" bullet, say "any exit code other than
     0", and keep the warning's shape (repo, reason, exit status), with the
     reason text per D25.
2. **`[branch.*]` table names** — change to `[tools.git.branch.*]`, keeping the
   sentences otherwise:
   - `plugins/vwf/skills/init/SKILL.md` line 438.
   - `plugins/vwf/skills/init/references/new-repo.md` line 375.
   - `plugins/vwf/skills/init/assets/hygiene/CONTRIBUTING.md` line 38. This
     file lands in user repos: keep its tone and fold width.
   - `plugins/vwf/skills/doctor/references/stack-checks.md` lines 674 and 725.
3. **`commit_scopes`** — `plugins/vwf/skills/doctor/references/stack-checks.md`
   line 535: name it `[tools.git].commit_scopes`.
4. **`[overrides.gitignore]`** — `plugins/vwf/skills/init/references/new-repo.md`
   line 128: replace with the D9 form.
5. **The tool verb** — `plugins/vwf/skills/doctor/SKILL.md` line 256: "its
   `remove tools` instruction" becomes "its `bootstrap: remove […]`
   instruction" (bootstrap `docs/sync/vwf.md` names the verb
   `bootstrap: remove [<tool>, …]`).
6. Any other occurrence of the same stale names in the owned files gets the
   same change. Report each one under `CHANGED`.

## Verification

- `mise x -- mise run code:format` passes.
- Over the six owned files, `grep -nF` finds none of: `[branch.`,
  `repo-sync:`, `would chmod`, `would update`, `would set bootstrap_commit`,
  `[overrides.gitignore]`, `remove tools`.
- `grep -nF 'Dry run: no file would change'` finds the rule in each of
  init `SKILL.md`, setup `SKILL.md` and doctor `stack-checks.md`.

## Guardrails

- Touch nothing outside the six owned files.
- `plugins/**/*.md` is not formatted by dprint: keep the fold width by hand.
- Do not add a fallback to the old key (D4).
- Do not change what doctor or setup does with the result; change only how the
  output is read.
- Delete with `rm`, never `git rm`.

## Commit

`fix: init, setup and doctor read bootstrap's current keys and dry-run output`
