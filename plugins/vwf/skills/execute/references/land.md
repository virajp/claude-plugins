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

- **yes** → hand off to `/vwf:git-workflow` step 4, *merge, push & clean up*. Pass **the declared preference
  that consent was recorded in the plan — do not ask again**.
  - Under an `all` shared-worktree override the option is *merge, push & keep worktree*. The next plan reuses
    it, and the loop's exit removes it unless the run ends on a `STOPPED` plan.
  - A merge conflict is a hard halt: abort, keep the worktree, invoke
    `plan-management status <folder> BLOCKED "<the conflicting files>"` there, and report the files.
  - When step 4 returns from the merge and push, open the completion's protected-branch write —
    `node ${CLAUDE_PLUGIN_ROOT}/skills/git-workflow/scripts/land.mjs open <base> --into <integration> --name
    vwf-complete-<plan name>` (`git-workflow/references/protected-branch.md`) — and invoke
    `plan-management complete <folder>` in that write's worktree, never as a direct commit. It sets the row's `status` `COMPLETE` and its `gaps` to the count of `open` entries in the
    consolidated gap list. It re-points the row's `folder` under `archived/` when step 3 moved the folder, and
    leaves it at the live path otherwise. It runs the sweep, per *Writing a row — the completion*
    and *The sweep* in `plan-index.md`.
  - Before that commit is made, make the **release-levels write** below in the same worktree, right after
    `complete` edits the row. Then `land.mjs close <worktree> --into <integration> --message "docs: plan queue —
    <folder> complete"` lands the row and the raised levels together. A conflict on the index abandons the write
    and makes it again, the same row and the same raise, until it lands, and never re-picks. A `pr` result waits
    on the pull request per that reference, then runs `land.mjs finish`.
- **no** → stop with the worktree path and the branch name, and say the branch is ready to land by hand. Say too
  that the index row stays `RUNNING` until the hand merge is followed by asking the session to archive the folder.
  That request is `plan-management archive <folder>`, made in a protected-branch write's worktree, never as a
  direct commit. It moves the folder, and applies the same row edit and sweep. No typed command does this. Ask nothing further.

## The release-levels write — on a merged landing only

The run bumps no version. It records how far each project it changed must move. A release step a person runs later
bumps, tags and clears the key.

The verbs of `plan-management` never commit, so this skill, the caller that owns the completion commit, writes the file
itself. It writes in the completion's protected-branch write's worktree, after the merge. The write comes right
after `complete` edits the row, and before `land.mjs close`.

1. Read the folder's `release_levels`: `plan.mjs get docs/plans/archived/<basename>/index.json release_levels` when
   step 3 archived it, at its live path otherwise. An empty list, `[]`, is the old-shape case, which only a migrated
   folder can have. Write nothing. The final report says *old-shape folder — no release levels recorded*.
2. Read `.config/releases.yaml`: one key per project, each `NONE`, `PATCH`, `MINOR` or `MAJOR`. An absent key reads
   `NONE`; an absent file reads every key `NONE`.
3. **Raise, never lower**. For each entry, the order is `NONE < PATCH < MINOR < MAJOR`. The entry's `id` (the project) names the key. When the entry's `level` is
   higher than the key's current value, set the key to that `level`.
   Otherwise leave it. `PATCH` after `MAJOR` stays `MAJOR`, and a `NONE` entry changes nothing. Only the release step
   clears a key.
4. When a key changed and the file is absent, create it with this two-line header comment above the keys:

   ```yaml
   # Pending release levels, written by /vwf:execute at landing.
   # Each key is cleared by the release step that releases the project.
   ```
5. When a key changed, `.config/releases.yaml` lands with `docs/plans/index.json` in the one
   `docs: plan queue — <folder> complete` commit, by the procedure *Writing a row* in `plan-index.md`. This commit is
   **the one exception to that procedure's rule that the write carries the index alone**. The completion commit
   carries the levels file too, and nothing else. When nothing changed, the commit carries the row alone. There is
   no separate release-levels commit.
6. On a conflict, the procedure abandons the write and opens a new one from the new tip. Re-apply the row, and the
   levels from step 2, re-read at the new tip and raised again. Then close again. Two runs landing at once thus both
   keep the higher level.

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
