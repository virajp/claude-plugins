# Land

`plan-index.md` below means
`${CLAUDE_PLUGIN_ROOT}/skills/plan-management/references/plan-index.md`.

Prepare the landing commit when all of these hold:

- Every unit is `green`.
- Every unit gate, wave gate and plan gate line and every orchestrator gate passed.
- The gap list holds no blocking gap.

The steps:

1. **The consent**. Read `consent.merge`: *merge to the integration branch and push on green*,
   `true` read as `yes` and `false` as `no`. Under an `all` override reading `land: yes`, read
   `yes` in its place. Never edit `consent` itself.
2. **The status**. In the worktree, invoke:
   - on `yes`: `plan-management status <folder> COMPLETE "COMPLETE <date> — <commits>"`
   - on `no`: `plan-management status <folder> RUNNING "RUNNING — ready to land by hand on <branch>"`
3. **The folder**. The gap list is **empty** when it has no `open` entry, whatever number of `closed`
   ones. On `yes`, with an empty gap list, invoke `plan-management archive <folder>` in the worktree.
   Pass the declared preference **do not ask**.
   - **Archived**: it moves the folder to `docs/plans/archived/`, and leaves the `COMPLETE` status as
     written. It closes the `backlog` ids through `/vwf:backlog done`, records the `backlog_pieces` ids
     through `/vwf:backlog partial`, and edits no row, since the index never rides a run branch. The
     folder is finished, and the archive is its record.
   - **On any completion warning the verb raises**: the folder is **not** archived. It stays live at its path, and the backlog split below is made instead. The folder's `status` still reads `COMPLETE`, and
     the row still goes `COMPLETE` at the merge. The final report names the warning, and the
     `plan-management archive <folder>` request to make once it is settled.
   - **When any gap is `open`, or on `no`**: do not invoke `archive`. The folder stays live at its path, as
     the working record of what needs reconciling, or for the hand merge. Make the same split here instead:
     when the folder's `backlog` names ids, invoke `/vwf:backlog done <ids> <folder>`, and when its
     `backlog_pieces` names ids, invoke `/vwf:backlog partial <ids> <folder>`. That skill is the only writer
     of the backlog project, and its edit touches nothing in the tree.

   Either way, commit all of it as one final `docs:` commit in the worktree.

Then act on that consent:

- **yes** → first make the **release-levels read** below in the run's worktree. Then hand off to
  `/vwf:git-workflow` step 4, *merge, push & clean up*. Pass **the declared preference
  that consent was recorded in the plan — do not ask again**.
  - Under an `all` shared-worktree override the option is *merge, push & keep worktree*. The next plan reuses
    it, and the loop's exit removes it unless the run ends on a `STOPPED` plan.
  - A merge conflict is a hard halt: run no `git merge --abort` — the `git:merge:<integration>` task leaves the
    main checkout mid-merge for the user to resolve and commit, or abort — keep the worktree, invoke
    `plan-management status <folder> BLOCKED "<the conflicting files>"` there, and report the files and that the
    main checkout is left mid-merge.
  - When step 4 returns from the merge and push, open the completion's protected-branch write —
    `node ${CLAUDE_PLUGIN_ROOT}/skills/git-workflow/scripts/land.mjs open <base> --into <integration> --name
    vwf-complete-<plan name>` (`git-workflow/references/protected-branch.md`) — and invoke
    `plan-management complete <folder>` in that write's worktree, never as a direct commit. It sets the row's `status` `COMPLETE` and its `gaps` to the count of `open` entries in the
    consolidated gap list. It re-points the row's `folder` under `archived/` when step 3 moved the folder, and
    leaves it at the live path otherwise. It runs the sweep, per *Writing a row — the completion*
    and *The sweep* in `plan-index.md`.
  - Before that commit is made, make the **release-levels write** below in the same worktree, right after
    `complete` edits the row, and before the row edit is committed. When a `bootstrap config` call of that
    write fails, abandon the write with `land.mjs`, so the partial `.config/bootstrap/releases.toml` goes with
    it, and stop per that section's last step. Otherwise `land.mjs close <worktree> --into <integration> --message "docs: plan queue —
    <folder> complete"` lands the row and the raised levels together. A conflict on the index abandons the write
    and makes it again, the same row and the same raise, until it lands, and never re-picks; a conflict is the
    only result retried. A `failed` result stops and is reported with its reason; one with `unpushed: true` also
    reports `git push origin <integration>`, run from the main checkout, and is never retried. A `pr` result
    waits on the pull request per that reference, then runs `land.mjs finish`; a `{finished: false, reason,
    command}` result is reported with its `command`, and the landing goes on.
- **no** → stop with the worktree path and the branch name, and say the branch is ready to land by hand. Say too
  that the index row stays `RUNNING` until the hand merge is followed by asking the session to archive the folder.
  That request is `plan-management archive <folder>`, made in a protected-branch write's worktree, never as a
  direct commit. It moves the folder, and applies the same row edit and sweep. No typed command does this. Ask nothing further.

## The release-levels read — before the merge

On `yes`, before the hand-off to `/vwf:git-workflow` step 4, read the folder's `release_levels` and run, in the
run's worktree, `bootstrap config get releases.<id> --json` for each entry, each `<id>` checked first per
`## Passing values` of `${CLAUDE_PLUGIN_ROOT}/assets/bootstrap-contract.md` — a bad `<id>` gets no call, and the
final report names it. The read only proves that the contract
works; its values are not the "from" level of the write. A failed call stops the run before the merge, with the
`errors` messages of bootstrap's envelope as bootstrap gives them, per
`${CLAUDE_PLUGIN_ROOT}/assets/bootstrap-contract.md`. The folder's status reads `BLOCKED` with that text, and the
normal resume, `/vwf:execute <folder>`, applies. An empty `release_levels` list makes no call.

## The release-levels write — on a merged landing only

The run bumps no version. It records how far each project it changed must move. A release step a person runs later
bumps, tags and clears the key. The levels live in `.config/bootstrap/releases.toml`, read and written only through
`bootstrap config`, per `${CLAUDE_PLUGIN_ROOT}/assets/bootstrap-contract.md`. This skill never reads or writes that
file itself. Every call below carries `--json` and runs with the worktree as the current folder. Every key and value
below follows `## Passing values` of `${CLAUDE_PLUGIN_ROOT}/assets/bootstrap-contract.md`: a `<key>` or `<id>` that
goes into `releases.<key>` contains only letters, digits, `_` and `-`, no `.`; each `<level>` is passed as raw text,
each `'` replaced with `'\''`, the whole value in single quotes, and a value with a backslash, a newline or another
control character stops that write with a report that names the key.

The verbs of `plan-management` never commit, so this skill, the caller that owns the completion commit, makes the
write itself. It writes in the completion's protected-branch write's worktree, after the merge. The write comes right
after `complete` edits the row, and before the row edit is committed with `land.mjs close`.

1. **The move from `.config/releases.yaml`**. Whenever `.config/releases.yaml` exists in the worktree, before
   anything else, even for an empty `release_levels` list: for each of its keys that is not `NONE`, run
   `bootstrap config get releases.<key> --json`, then `bootstrap config set releases.<key> '<level>' --json`, then the
   same get again. Each key is checked before its first get. A key that fails the name check is skipped: nothing is
   run for it, and the final report names it as *not a valid bootstrap key, kept in `.config/releases.yaml`*. The valid keys are still written, and the
   landing continues. When no key was skipped, delete the file with `rm`. When a key was skipped, do not delete the
   file: remove the moved keys from it, so only the skipped keys stay. Each later landing reports the same skip until
   the user renames the key, and no key is written twice. The final report lists each key moved as *moved from
   `.config/releases.yaml`: `<key>` `<level>`*.
2. Read the folder's `release_levels`: `plan.mjs get docs/plans/archived/<basename>/index.json release_levels` when
   step 3 archived it, at its live path otherwise. An empty list, `[]`, is the old-shape case, which only a migrated
   folder can have. Set nothing. The final report says *old-shape folder — no release levels recorded*.
3. **The sets**. For each entry whose `level` is not `NONE`, the entry's `id` (the project) names the key:
   - `bootstrap config get releases.<id> --json` gives the "from" level;
   - `bootstrap config set releases.<id> '<level>' --json` writes it. bootstrap keeps the higher of the old and the
     new level, so a key is never lowered. Read no field of the set's output;
   - the same get again gives the "to" level. A key changed when "from" and "to" differ. The final report lists
     each changed key, from and to.
4. **The commit**. When `.config/bootstrap/releases.toml` changed, or step 1 deleted or edited `.config/releases.yaml`,
   the one `docs: plan queue — <folder> complete` commit carries `docs/plans/index.json`,
   `.config/bootstrap/releases.toml` and the deletion or the edit of `.config/releases.yaml` — each that changed — and
   nothing else, by the procedure *Writing a row* in `plan-index.md`. This commit is **the one exception to that procedure's
   rule that the write carries the index alone**. When nothing changed, the commit carries the row alone. There is no separate release-levels commit.
5. **A failed call**. When a `bootstrap config` call fails, or the CLI is absent or has no contract 1, abandon the
   write with `land.mjs`, so a partial `releases.toml` goes with it. The row stays as it is: merged, not `COMPLETE`.
   Stop with the asset's hint, or with the `errors` messages of bootstrap's envelope as bootstrap gives them. The stop
   is a hand step: the report prints the exact `bootstrap config set releases.<id> '<level>' --json` lines, quoted
   per `## Passing values`, the move of step 1 when `.config/releases.yaml` exists, and the completion command,
   `plan-management complete <folder>` in a protected-branch write's worktree. For a key that step 1 skipped, the
   report prints no command: it names the key, says that it is not a valid bootstrap key, and says that it stays in
   `.config/releases.yaml`.
6. On a conflict, the procedure abandons the write and opens a new one from the new tip. Re-apply the row, and run
   steps 1 to 3 again there — the move, and each get, set and get. They are safe to repeat, because a set keeps the
   higher level, and "from" is read again at the new tip. Then close again. Two runs landing at once thus both keep
   the higher level.

Only the release step clears a key; this skill never unsets one.

Writing through a protected-branch write after the merge, never on the run branch, keeps two concurrent runs from conflicting on
the file at merge time. When the branch did **not** merge — `no`, or a merge conflict — write nothing.

## When a landing condition fails

A landing condition fails on a red gate line, a unit that is not green, or a blocking gap. Then **stop at the report** with
what failed and the exact resume command, `/vwf:execute <folder>`. The worktree stays committed, and nothing merges. The
folder's status reads `BLOCKED` with the detail. The report lists each failed condition: the gate line, the unit and its
outcome, the blocking gap. The run ends there, asking nothing.

A fix goes into the folder: a ruling into the unit file or one `append` to `decisions`, a finding appended to the unit file.
The person re-runs `/vwf:execute <folder>`, whose resume loops the affected units back through their pipeline per
[blocking and resume](blocking.md).

## Gap reconciliation (after the landing) — with `covers`

Whatever the landing decision, list each gap in the consolidated gap list with the command that closes it, and offer nothing.

**Never silently rewrite either doc.**

- Blueprint holes → `/vwf:blueprint` (the sweep re-stamps coverage).
- Plan holes → `/vwf:plan`, to re-derive the slice against the now-updated blueprint.

Whoever closes a gap sets the entry's `state` to `closed` with the ruling, so a later cycle's read of the folder sees it as
closed. Say too that once no entry reads `open`, the `plan-management archive <folder>` request retires the folder that stayed live.
The person makes that request in prose, never by a typed command.

## Chain forward — with `covers`

Scan the `plans` list of the base repo's `docs/plans/index.json` for rows whose `requires` names the folder just completed. Do
not walk the members, most of which are not cloned here.

A row is now unblocked when `plan-management resolve <that folder>` returns *runnable*, per *Resolution* in `plan-index.md`. For
each one, print its launch line, `/vwf:execute <next-folder>`, for a fresh context: a fresh session, or a runner that `all`
dispatches. Launch nothing.
