# U1 — plan-management: the `unclaim <folder>` verb

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/plan-management/SKILL.md`,
  `plugins/vwf/skills/plan-management/references/plan-index.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** both owned files, top to bottom; the plan's Facts section;
  `plugins/vwf/assets/templates/plan-folder.md:40-52` (the Status block's shape
  — one bold state word plus one detail line, the worktree path only in that
  line).
- **Lazy-load:**
  `plugins/vwf/skills/git-workflow/references/worktree-setup.md:30-52` (where a
  worktree sits and how the branch is named) only if the refusal wording needs
  the default path; `plugins/vwf/skills/backlog/SKILL.md` for the verb-heading
  style the two skills share.

## Ruling

Decision 1, quoted:

> The run is proven gone when the worktree the folder's Status block names is
> absent from `git worktree list`. The verb refuses while it exists, naming
> `git worktree remove <path>` as the user's act of proof — that command refuses
> a dirty tree itself, so unfinished work is never lost silently. No new state,
> no heartbeat.

Decision 2, quoted:

> Reported, never touched. The report names the branch and the
> `git branch -D <branch>` line, and says a fresh `/vwf:execute` refuses to cut
> a worktree over it until it is gone; the user decides whether the committed
> units are worth keeping.

Decision 3, quoted:

> Runs in the main checkout on the integration branch after `git pull --ff-only`
> — `claim`'s procedure. Edits the row's `Status` cell `RUNNING` → `APPROVED`,
> and the folder's Status block only when it does not already read `APPROVED`
> (at claim the block is edited in the worktree, so on the integration branch it
> usually still reads `APPROVED`). Refuses a row that is not `RUNNING`, in one
> line. Reports `docs: plan queue — <folder> unclaimed` for the caller's commit;
> the skill never commits.

Decision 4, quoted:

> The verb shows what it found — the worktree absent, the branch present or not,
> the Status detail line — and asks once before editing anything.

Decision 7, quoted:

> `SKILL.md:256` "an item `In Progress` forever" becomes `In progress` — the
> file is touched, so the parked item rides.

And the standing rule this verb sits beside, from the Goal: "a `RUNNING` row is
never stolen" stands; `unclaim` releases a claim on the user's consent after the
proof, it never takes one.

## Edits

1. **`SKILL.md` frontmatter `argument-hint`** (`:10`) — add `unclaim <folder>`
   after `claim <folder>`.
2. **`SKILL.md` description** (`:3-9`) — one clause: invoked "by a session when
   the user asks to unclaim, archive or list plans". Keep the YAML strict — the
   description is a folded scalar; no colon-space inside it.
3. **`SKILL.md` — a new `### unclaim <folder>` section** placed directly after
   `### claim <folder>` (`:120-130`), in the same register as `claim`. It
   specifies, in order:
   - **Where:** the main checkout, on the integration branch, after
     `git pull --ff-only` — the same procedure `claim` follows, including the
     stash-if-dirty and the push-rejection handling the reference gives.
   - **Precondition — the row.** The folder's row must read `RUNNING`; any other
     state, or no row, is a one-line refusal naming what it found (`APPROVED` —
     "nothing to release"; `COMPLETE` — "landed; `archive` is the verb"; absent
     — "no row").
   - **Precondition — liveness.** Read the folder's Status block in the main
     checkout; when its detail line names a worktree path
     (`RUNNING since <ts> in <path>`), and also when it does not, derive the
     run's worktree as `git worktree list --porcelain` filtered to a path whose
     basename is the folder's basename or whose branch is named for it. When
     such a worktree is listed, refuse: print the path, and the one line the
     user runs to prove the run is gone — `git worktree remove <path>` — noting
     that git refuses to remove a dirty worktree, so nothing uncommitted is lost
     silently, and that a live session in another window is exactly what this
     refusal protects. The verb never removes a worktree.
   - **The branch.** Check `git branch --list <folder basename>`; when it
     exists, the report (below) names it and the line `git branch -D <branch>`
     with the note that a fresh `/vwf:execute` refuses to cut a worktree over an
     existing branch until it is gone, and that the user decides whether its
     committed units are worth keeping. The verb never deletes a branch.
   - **Consent.** Print what it found — the row `RUNNING`, the worktree absent,
     the branch present or absent, the Status detail line — and ask once: "reset
     `<folder>` to `APPROVED`?" A no ends the verb with nothing edited.
   - **The edits.** The row's `Status` cell `RUNNING` → `APPROVED`, nothing else
     in the row. The folder's Status block: when it does not already read
     `**APPROVED**`, set it to `**APPROVED**` with the detail line
     `APPROVED <date> — unclaimed; was: <the previous detail line>`; when it
     already reads `APPROVED`, leave it.
   - **The report.** The edit for the caller's commit —
     `docs: plan queue — <folder> unclaimed` — plus the branch note when the
     branch exists. The caller commits and pushes on the integration branch, the
     way `claim`'s commit lands.
   - **Idempotence.** A second `unclaim` on the same folder is the `APPROVED`
     refusal above.
4. **`SKILL.md` "Where each verb runs"** (`:83-91`) — add `unclaim` to the verbs
   that edit the index in the main checkout; it edits both halves there, since
   no worktree exists by its own precondition.
5. **`SKILL.md` "Called by" table** (`:337`) — one row: a session, when the user
   asks to unclaim a stale plan → `unclaim <folder>`; and one row:
   `/vwf:execute`'s resume path, on the user's yes when the worktree is gone →
   `unclaim <folder>`.
6. **`SKILL.md` "What this skill never does"** (`:356-358`) — rewrite the **Take
   a `RUNNING` row** bullet: `next` never picks one and `claim` refuses one; a
   stale claim is released only by `unclaim`, on the user's consent, once the
   worktree it names is gone — never by a hand edit. Add one bullet: **Remove a
   worktree or delete a branch** — `unclaim` names the commands and the user
   runs them.
7. **`SKILL.md:256`** — `In Progress` → `In progress`.
8. **`plan-index.md` "Writers and their edits"** (`:59-68`) — add `unclaim`:
   `RUNNING` → `APPROVED`, the one reverse edit, in the main checkout.
9. **`plan-index.md` the `next` rules** (`:126-128`) — "a claim whose session is
   gone is reset to `APPROVED` by hand, in a commit on the integration branch" →
   "is released by `unclaim <folder>`, once the worktree it names is gone, in a
   commit on the integration branch". Keep "never taken".
10. **`plan-index.md` step 5** (`:174-178`) — the same substitution for "a claim
    is released only by a hand edit back to `APPROVED`".
11. **`plan-index.md` "Writing a row — the claim, and the completion"**
    (`:191-245`) — add the unclaim commit message beside the claim's and the
    completion's (`:214-215`), and one sentence that `unclaim` follows the claim
    procedure with the reverse edit; the push-rejection rule applies unchanged.

## Verification

- `grep -n 'unclaim' plugins/vwf/skills/plan-management/SKILL.md` hits the
  frontmatter hint, the description, the new heading, the "where" paragraph, the
  Called-by table and the never-does list — at least six lines.
- `grep -n 'unclaim' plugins/vwf/skills/plan-management/references/plan-index.md`
  hits at least four lines.
- `grep -n 'by hand\|hand edit' plugins/vwf/skills/plan-management/SKILL.md plugins/vwf/skills/plan-management/references/plan-index.md`
  returns no hit that describes releasing a `RUNNING` row.
- `grep -n 'In Progress' plugins/vwf/skills/plan-management/SKILL.md` returns
  nothing.
- `mise run p:plugins:check` green (rule 3 parses the frontmatter — a broken
  description drops the skill silently, so this line is the proof).
- `mise run code:precommit` green.

## Guardrails

- Do not touch `plugins/vwf/skills/execute/**` (U2), any doc (U3), any version
  file (U4).
- `plugins/**/*.md` is not dprint-formatted: fold by hand at the width the
  surrounding paragraphs use.
- Strict-YAML frontmatter: no unquoted colon-space in the description; keep
  `user-invocable: false` and `disable-model-invocation: false` exactly.
- `${CLAUDE_PLUGIN_ROOT}` names vwf alone; cite skills as the file already does.
- No table cell ending in a bare asterisk; no escaped backtick inside a code
  span.
- Delete nothing; `rm` nothing.

## Commit

`feat: plan-management unclaim — release a stale RUNNING claim once its worktree is gone`
— written by the orchestrator after the wave gate. `feat` is in
`.config/git-conventional-commits.yaml`.
