# Land

`plan-index.md` below means
`${CLAUDE_PLUGIN_ROOT}/skills/plan-management/references/plan-index.md`.

With every unit `green`, every unit gate, wave gate and plan gate line and every orchestrator
gate passed, and the gap list holding no blocking gap, prepare the landing commit:

1. **The consent.** Read `consent.merge`: *merge to the integration branch and push on green*,
   `true` read as `yes` and `false` as `no`. Under an `all` override reading `land: yes`, read
   `yes` in its place. Never edit `consent` itself.
2. **The status.** In the worktree, invoke:
   - on `yes`: `plan-management status <folder> COMPLETE "COMPLETE <date> — <commits>"`
   - on `no`: `plan-management status <folder> RUNNING "RUNNING — ready to land by hand on <branch>"`
3. **The folder.** On `yes`, when the gap list is **empty** — no `open` entry, whatever number of
   `closed` ones — invoke `plan-management archive <folder>` in the worktree, with the declared
   preference **do not ask**.
   - **Archived**: it moves the folder to `docs/plans/archived/`, and leaves the `COMPLETE` status as
     written. It closes the `backlog` ids through `/vwf:backlog done`, records the `backlog_pieces` ids
     through `/vwf:backlog partial`, and edits no row, since the index never rides a run branch. The
     folder is finished, and the archive is its record.
   - **On any completion warning the verb raises**: the folder is **not** archived. It stays live at its
     path, the backlog split below is made instead, the folder's `status` still reads `COMPLETE`, and the
     row still goes `COMPLETE` at the merge. The final report names the warning, and the
     `plan-management archive <folder>` request to make once it is settled.
   - **When any gap is `open`, or on `no`**: do not invoke `archive`. The folder stays live at its path, as
     the working record of what needs reconciling, or for the hand merge. Make the same split here instead:
     when the folder's `backlog` names ids, invoke `/vwf:backlog done <ids> <folder>`, and when its
     `backlog_pieces` names ids, invoke `/vwf:backlog partial <ids> <folder>`. That skill is the only writer
     of the backlog project, and its edit touches nothing in the tree.

   Either way, commit all of it as one final `docs:` commit in the worktree.

Then act on that consent:

- **yes** → hand off to `/vwf:git-workflow` step 4, *merge, push & clean up*, **with the declared preference
  that consent was recorded in the plan — do not ask again**.
  - Under an `all` shared-worktree override the option is *merge, push & keep worktree*: the next plan reuses
    it, and the loop's exit removes it unless the run ends on a `STOPPED` plan.
  - A merge conflict is a hard halt: abort, keep the worktree, invoke
    `plan-management status <folder> BLOCKED "<the conflicting files>"` there, and report the files.
  - When step 4 returns from the merge and push, invoke `plan-management complete <folder>` in the main
    checkout. It sets the row's `status` `COMPLETE` and its `gaps` to the count of `open` entries in the
    consolidated gap list. It re-points the row's `folder` under `archived/` when step 3 moved the folder, and
    leaves it at the live path otherwise. It runs the sweep, per *Writing a row — the completion*
    and *The sweep* in `plan-index.md`.
  - Before that commit is made, make the **release-levels write** below in the same checkout, right after
    `complete` edits the row. That is the commit `docs: plan queue — <folder> complete`, on the integration
    branch, in the main checkout, carrying the row and the raised levels together. A rejected push re-applies the
    same row and the same raise until it lands, and never re-picks.
- **no** → stop with the worktree path and the branch name, and say the branch is ready to land by hand. Say too
  that the index row stays `RUNNING` until the hand merge is followed by asking the session to archive the folder:
  `plan-management archive <folder>`, run in the main checkout, which moves the folder and applies the same row edit
  and sweep. No typed command does this. Ask nothing further.

## The release-levels write — on a merged landing only

The run bumps no version. It records how far each project it changed must move, and a release step a person runs
later bumps, tags and clears the key. `plan-management`'s verbs never commit, so this skill, the caller that owns the
completion commit, writes the file itself: in the main checkout, on the integration branch, after the merge, right
after `complete` edits the row and before the commit.

1. Read the folder's `release_levels`: `plan.mjs get docs/plans/archived/<basename>/index.json release_levels` when
   step 3 archived it, at its live path otherwise. An empty list, `[]`, is the old-shape case, which only a migrated
   folder can have: write nothing, and the final report says *old-shape folder — no release levels recorded*.
2. Read `.config/releases.yaml`: one key per project, each `NONE`, `PATCH`, `MINOR` or `MAJOR`. An absent key reads
   `NONE`; an absent file reads every key `NONE`.
3. **Raise, never lower.** For each entry, the order is `NONE < PATCH < MINOR < MAJOR`. When the entry's `level` is
   higher than the key's current value, set the key, named by the entry's `id` (the project), to the entry's `level`.
   Otherwise leave it. `PATCH` after `MAJOR` stays `MAJOR`, and a `NONE` entry changes nothing. Only the release step
   clears a key.
4. When a key changed and the file is absent, create it with this two-line header comment above the keys:

   ```yaml
   # Pending release levels, written by /vwf:execute at landing.
   # Each key is cleared by the release step that releases the project.
   ```
5. When a key changed, stage `.config/releases.yaml` together with `docs/plans/index.json` into the one
   `docs: plan queue — <folder> complete` commit, by the procedure *Writing a row* in `plan-index.md`. **This commit is
   the one exception to that procedure's staging step, "that file alone"**: the completion commit carries the levels
   file too, and nothing else. When nothing changed, the commit carries the row alone. There is no separate
   release-levels commit.
6. On a rejected push whose rebase conflicts, the procedure drops the commit and pulls. Restore `.config/releases.yaml`
   from the new tip as it restores the index. Then re-apply both — the row, and the levels from step 2, re-read at the
   new tip and raised again — and push again. Two runs landing at once thus both keep the higher level.

Writing on the integration branch after the merge, never on the run branch, keeps two concurrent runs from conflicting on
the file at merge time. When the branch did **not** merge — `no`, or a merge conflict — write nothing.

## When a landing condition fails

When any landing condition fails — a red gate line, a unit that is not green, a blocking gap — **stop at the report** with
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
closed. Say too that once no entry reads `open`, the folder that stayed live is retired by the
`plan-management archive <folder>` request, which the person makes in prose, never by a typed command.

## Chain forward — with `covers`

Scan the `plans` list of the base repo's `docs/plans/index.json` — not a walk of the members, most of which are not cloned here
— for rows whose `requires` names the folder just completed. For each one now unblocked
(`plan-management resolve <that folder>` returns *runnable*, per *Resolution* in `plan-index.md`), print its launch
line, `/vwf:execute <next-folder>`, for a fresh context: a fresh session, or a runner that `all` dispatches. Launch nothing.
