# U2 — plan-management: run paths, unclaim and prune

- **Read first:** every owned file, top to bottom, before editing.
- **Lazy-load:** `plugins/vwf/skills/plan-management/scripts/plan.mjs`;
  `plugins/vwf/skills/git-workflow/references/worktree-setup.md:21-61`;
  `plugins/vwf/skills/execute/SKILL.md:653-662` (the plan's name).

## Ruling

> - D3: plan-management claim sets run to {"worktree": ".worktrees/<name>",
>   "log": "~/Library/Caches/vwf/<repo>/<folder basename>.jsonl"} in the
>   folder's index.json, in the claim commit, with one plan.mjs set --json.
>   <name> is the plan's name (the branch and worktree name /vwf:execute
>   uses); <repo> is the repo name log.mjs derives. The ~ is literal: no home
>   path is committed, and VWF_LOG_ROOT does not change the committed value.
>   This reverses the rule 'the index row is the one edit the run makes in
>   the main checkout' (approved 2026-10-24).
> - D5: A new verb log.mjs prune --repo <root> --days 30 --keep <folder
>   basename>. It deletes a log only when its plan folder is under
>   <root>/docs/plans/archived/ and the log's mtime is more than 30 days old.
>   It never deletes the log named by --keep. Every plan-management archive
>   calls it after the move, with --keep set to the folder it archives. A
>   live plan paused for 30 days keeps its log. prune touches only <log
>   root>/<repo>/*.jsonl.
> - D10: log.mjs imports them from
>   plugins/vwf/skills/plan-management/scripts/lib/schema.mjs with a relative
>   path (rule 16 permits it). U2 exports the two enums as named exports if
>   they are not exported yet, and does not change their values.
> - D11: Keep both. index.json keeps units[].status, commit, rounds, range,
>   gaps and overrides; it is committed and survives a lost machine, and
>   resume and the final report keep reading it. The log gets the same facts
>   as events and is the pane's source.
> - D13: plan-management unclaim sets run to {} in its own commit. The log
>   file stays; a later claim writes the same log path.
> - D14: run is {} or exactly {worktree: string, log: string}, both
>   non-empty. It is no longer an open object; the template's key rules and
>   the schema header comment say so.
> - D17: No. U1 waits for U2: U1 sits in wave 2 and depends on U2, because
>   it imports the named status-enum exports that U2 adds to schema.mjs. The
>   review is wave 3, docs wave 4, gates wave 5.
> - D19: prune treats a log <basename>.jsonl as archived when
>   <root>/docs/plans/archived/<basename> or
>   <root>/docs/plans/archived/<basename>-<n> (n a decimal number, the
>   archive name-clash suffix) is a directory. The other D5 conditions stay.
> - D20: In the folder's own repo. Under a multi-repo topology the run edit
>   is a direct commit on the integration branch of the repo that holds the
>   folder, beside the base repo's claim commit (same message). worktree is
>   relative to that repo, <repo> is that repo's name, and archive passes
>   that repo's root to prune as --repo. log.mjs derives <repo> from the git
>   common dir of the repo that contains the --folder path (start) or the
>   --repo root (prune), not from the current directory.
> - D21: The real path. claim writes the repo-relative path of the worktree
>   that this run will use: <dir>/<branch>, where <dir> is the directory
>   git-workflow's own rule picks (.worktrees wins over worktrees, the
>   default is .worktrees). Under an all override that makes several plans
>   share one worktree, it is the path of the shared worktree. D3's
>   .worktrees/<name> is the common case of this rule.
> - D27: Only after a move. prune runs as the last step of each
>   plan-management archive that moves a folder into docs/plans/archived/,
>   the later archive of a folder kept live included. A landing that keeps
>   the folder live calls no prune, and /vwf:execute never calls prune
>   itself.
> - D29: The root of the checkout where archive runs: the run's worktree at
>   landing, the main checkout for a later archive by hand. Both give the
>   same <repo> name, because log.mjs derives it from the git common dir
>   (D20), and both hold docs/plans/archived/ as of that moment; the folder
>   that this archive moved is --keep anyway.

## Edits

1. **`plugins/vwf/skills/plan-management/scripts/lib/schema.mjs`** — `run`
   (`:145`) accepts `{}` or exactly `{worktree, log}`, both non-empty
   strings; any other key or shape is a finding. Update the header comment
   (`:5-6`): `run` is no longer open. Export the unit status enum and the
   stage state enum as named exports (D10), values unchanged. `consent.lsp`
   stays open.
2. **`plugins/vwf/skills/plan-management/SKILL.md`**
   - `claim` (`:194-204`): after the row edit, one
     `plan.mjs set <folder>/index.json run --json '{"worktree": …, "log": …}'`
     with the D3 values; both files ride the claim commit. Replace "edits no
     folder status" with what it now edits (the `run` key only; the folder's
     `status` is still the run's).
   - `unclaim` (`:206-258`): also `plan.mjs set <folder>/index.json run --json '{}'`,
     in its commit (D13).
   - `archive` (`:297-458`): after the move, run
     `node ${CLAUDE_PLUGIN_ROOT}/skills/execute/scripts/log.mjs prune --repo <repo root> --days 30 --keep <folder basename>`;
     its failure is a warning, never a stop of the archive. Say it deletes
     only logs of archived plans older than 30 days.
   - `:109-111`: the rule on main-checkout edits names the `run` key edit of
     claim and unclaim.
3. **`plugins/vwf/skills/plan-management/references/plan-index.md`** —
   `:104`, `:225`, `:293`: restate the rule so it names the two edits the
   claim makes in the main checkout (the row and the folder's `run`), and
   the reversal (D3).
4. **`plugins/vwf/assets/templates/plan-folder.md`** — the open-key rule
   (`:289`): only `consent.lsp` is open. The `run` rule (`:453`): `{}` at
   planning; `claim` sets `{worktree, log}` (D3); `unclaim` resets it; the
   two values and the literal `~`. The "There is no run log" passage
   (`:455-459`): the run fields stay (D11), and `/vwf:execute` also appends
   each fact to the plan's action log at `run.log`.
5. **`scripts/src/plan-script.test.ts`** — add cases: `run` `{}` valid;
   `{worktree, log}` valid; an unknown key in `run`, an empty `log`, a missing
   `worktree` each a finding; `set … run --json` with a valid value writes.

## Verification

- `mise x -- pnpm vitest run scripts/src/plan-script.test.ts` is green.
- `node plugins/vwf/skills/plan-management/scripts/plan.mjs validate docs/plans/2026-10-25-action-log-per-plan/index.json`
  prints `valid`.
- `mise x -- mise run p:plugins:check` is green.
- `mise x -- mise run code:format` is green.

## Guardrails

- Touch nothing outside the owned paths. `log.mjs` is U1's.
- Do not change the values of any enum in `schema.mjs`; U1 imports them.
- `plugins/**/*.md` is not formatted: keep the 80-column fold by hand.
- Delete with `rm`, never `git rm`.

## Commit

`feat: claim records the worktree and log paths, archive prunes old logs`
