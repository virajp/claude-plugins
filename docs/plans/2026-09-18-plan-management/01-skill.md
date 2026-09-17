# U1 — The `plan-management` skill

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/plan-management/SKILL.md`,
  `plugins/vwf/skills/plan-management/references/plan-index.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** `plugins/vwf/assets/plan-index.md` (the contract you are
  moving, whole), `plugins/vwf/skills/archive/SKILL.md` (the pipeline you are
  folding, whole), `plugins/vwf/skills/backlog/SKILL.md` (the shape you are
  copying, whole), `plugins/vwf/skills/init/SKILL.md:1-30` (the frontmatter and
  guard note), `plugins/vwf/skills/execute/SKILL.md:75-205,720-791` (the caller
  whose steps become verbs),
  `plugins/vwf/skills/execute/references/blocking.md`.
- **Lazy-load:** `plugins/vwf/skills/plan/SKILL.md:425-460` and
  `plugins/vwf/skills/change-plan/SKILL.md:290-330` (the planners' hand-off, to
  see what `add` replaces); `plugins/vwf/assets/templates/plan-folder.md:40-55`
  (the Status block shape); `plugins/vwf/assets/memory.md` (the `runs` room and
  drawer naming, for `archive`'s drawer mark).

## Ruling

Decisions 1–7, 11 and 14, quoted:

> **1.** `docs/plans/index.md` rows, the archive move, and each plan folder's
> Status block. Planners keep writing the folder's content; `execute` keeps
> writing the Run log.

> **2.** Model-only: `user-invocable: false`, `disable-model-invocation: false`,
> with the guard note `init` carries. A user reaches `archive` or `list` by
> asking in prose.

> **3.** Nine: `add`, `claim`, `status`, `complete`, `archive`, `next`,
> `resolve`, `priority`, `list`.

> **4.** The skill never commits; the caller does — `execute` keeps
> `docs: plan queue — <folder> running` and `… complete`, the planners their
> approval commit, a standalone archive the session's git-workflow commit.

> **5.** `assets/plan-index.md` moves to
> `skills/plan-management/references/plan-index.md`, edited so its writers table
> names verbs.

> **6.** Warn only when the plan being archived never landed — the rule the
> check's own later paragraph states; every completion warning asks, none
> refuses.

> **7.** `model: sonnet`, like `backlog`.

> **11.** U1 lands alone in wave 1 so the references path exists before U2/U3
> cite it; `rm -r skills/archive` and `rm assets/plan-index.md` are U5's, after
> every citation has moved.

> **14.** `archive` marks the mempalace `runs` drawer `archived` when the server
> is up, silently skipping otherwise.

## Edits

1. **`plugins/vwf/skills/plan-management/SKILL.md`** — new. Frontmatter, in this
   order and nothing else:

   ```yaml
   ---
   name: plan-management
   description: <one paragraph — the one owner of docs/plans/ bookkeeping:
     the plan index docs/plans/index.md, every plan folder's Status block,
     and the move into docs/plans/archived/; and the one implementation of
     the reads on them — the next pick, requires: resolution, priority
     derivation, the listing. Invoked by /vwf:plan and /vwf:change-plan at
     hand-off, by /vwf:execute at claim, status changes and landing, and by a
     session when the user asks to archive or list plans — never typed.>
   argument-hint: "[add <folder> | claim <folder> | status <folder> <state> [detail] | complete <folder> | archive [folder] | next | resolve <folder> | priority <folder> | list]"
   model: sonnet
   user-invocable: false
   disable-model-invocation: false
   ---
   ```

   The description is one YAML scalar — indent its continuation lines, no
   colon-space inside it unquoted, no tab. Strict-YAML: a rejected frontmatter
   drops the skill silently.

   Body sections, in order, in `backlog`'s register:

   - **Title** `# plan-management — The Plans as a Set`, then the guard note
     `init` carries at `skills/init/SKILL.md:19-25`, adapted: *Called by the
     planners and the executor, never typed.* `user-invocable: false` keeps it
     off the `/` menu; `disable-model-invocation: false` keeps every caller's
     invocation working — the same pair `init` and the `import-*` adapters
     carry. A user who wants a folder archived or the queue listed asks in
     prose, and the session invokes the verb.
   - **What it owns, and what it does not.** Decision 1 in prose: the index
     rows, the Status block, the move. Not the folder's content (the planners'),
     not the Run log (`execute`'s), not `docs/backlog.md` (`/vwf:backlog`'s —
     called, never edited), not a commit (decision 4: every verb writes and
     stops; the caller commits, and the section names which commit each verb's
     edit rides).
   - **The files.** A short table: the index (base repo, `docs/plans/index.md`),
     the plan folder (`<target-repo>/docs/plans/<date>-<name>/index.md`, the
     Status block at its top), the archive
     (`<target-repo>/docs/plans/archived/`), the folder shape
     (`${CLAUDE_PLUGIN_ROOT}/assets/templates/plan-folder.md`), membership
     (`${CLAUDE_PLUGIN_ROOT}/assets/membership.md`), the backlog
     (`docs/backlog.md`, via `/vwf:backlog`), and the contract —
     `references/plan-index.md` beside this file, cited as
     `${CLAUDE_PLUGIN_ROOT}/skills/plan-management/references/plan-index.md`.
     State the two-kinds paragraph from archive `:14-29` once here — cycle plan
     in its target repo, change plan in the base, one row each — and the
     read-the-index-never-walk-the-members rule from archive `:68-72`.
   - **Where each verb runs.** One paragraph the verbs rely on: the index is
     edited **only in the main checkout, on the integration branch** — a run
     branch never touches it (plan-index `:78-87`); the Status block and the
     move are edited **wherever the folder is** — a worktree during a run, the
     main checkout otherwise. A verb that edits both, invoked from a worktree,
     does the folder half and says the row is left for the landing's `complete`
     — archive `:146-152` is the source.
   - **Verbs.** `$ARGUMENTS` selects one; with none, `list`. One `###` per verb:
     - `add <folder>` — read the folder's frontmatter (`type:`, `title:`,
       `requires:`, `backlog:`); set the Status block to `**APPROVED**` with
       `APPROVED <date> by the user`; derive the priority (the `priority` rule);
       append the row — `Folder`, `Kind` from `type:`, `Plan`,
       `Target
       repo` per membership, `Priority`, `APPROVED`, `Requires`
       basenames or `—`, `Backlog` ids or `—` — creating the file's prose frame
       and header first when absent (plan-index `:15-30`). Refuse a folder whose
       Status is not `DRAFT` in one line. Its edit rides the planner's approval
       commit.
     - `claim <folder>` — plan-index `:186-241` *the claim*: on the integration
       branch in the main checkout, pull, set the row `RUNNING`, report the edit
       for the caller's `docs: plan queue — <folder> running` commit and push; a
       rejected push is the caller's to retry per that text; a row already
       `RUNNING`, or absent, is refused in one line. Edits no Status block — the
       worktree does not exist yet.
     - `status <folder> <state> [detail]` — rewrite only the Status block: the
       bold word to `<state>` (`RUNNING`, `BLOCKED`, `COMPLETE`, or `APPROVED` —
       `DRAFT` is the planners' alone) and the line under it to `<detail>` as
       given (`RUNNING since <ts> in <worktree>`,
       `RUNNING —
       paused at unit <n> …`, `BLOCKED at wave <n> — …`,
       `COMPLETE <date> —
       <commits>`,
       `RUNNING — ready to land by hand on <branch>`). Never mirrors to the
       index — plan-index `:51-56`. Rides the caller's next commit in whatever
       checkout the folder sits.
     - `complete <folder>` — plan-index `:186-241` *the completion* plus
       `:243-253` *the sweep*: in the main checkout after the merge, set the row
       `COMPLETE`, re-point `Folder` to `docs/plans/archived/<basename>` when
       that directory exists on disk in the folder's repo and leave it at the
       live path otherwise, run the sweep; report for the caller's
       `docs: plan queue — <folder> complete` commit.
     - `archive [folder]` — archive `:57-175` folded whole, with these changes:
       §1's interactive resolution stays for the no-argument case; §2 keeps
       every warning as warn-and-ask, and the `requires:` bullet is rewritten to
       decision 6 — *an unarchived plan's `requires:` names this plan **and**
       this plan's Status is not `COMPLETE`* — dropping the duplicate paragraph
       at `:102-116` into one statement; §3 is unchanged except that the row
       edit is done only when the verb runs in the main checkout, per *Where
       each verb runs*, and otherwise reported as left for `complete`; §4 loses
       its commit — the verb reports the moved paths and the commit message the
       caller should use, `docs: archive plan <name>`, and keeps the mempalace
       drawer mark (decision 14) and the `/vwf:backlog done <ids>` call.
     - `next` — plan-index `:113-131` *the pick* and `:133-184` *reading the
       queue*, moved verbatim in meaning: the candidates, the resolution per
       row, the ordering, the nothing-runnable message. Returns the folder to
       run, or the message.
     - `resolve <folder>` — plan-index `:89-112` *Resolution*: for each
       `requires:` basename, the cycle-plan test (every `covers:` doc
       `implementation: complete` in the base's blueprint) or the change-plan
       test (a `COMPLETE` row, or a folder under `archived/`), returning
       *runnable* or the names that block, each with the reason.
     - `priority <folder>` — plan-index `:44`: `10 + max` over the `Priority`
       column of every unarchived `requires:` row, or `10`, naming the row it
       stands on. Never asked, never hand-edited.
     - `list` — the table ordered by priority then folder, each `RUNNING` row
       marked *in flight*, each `COMPLETE` row at a live path marked *awaiting
       archive*, then the folders under the current repo's `docs/plans/` that
       have no row, marked *unindexed* (archive `:73-75`).
   - **Who calls it.** A table in `backlog`'s shape (`:128-133`): `/vwf:plan`
     and `/vwf:change-plan` → `priority` at the gate, `resolve` at self-review,
     `add` at hand-off; `/vwf:execute` → `next` in its `next` mode, `resolve` at
     preflight, `claim` before the worktree, `status` at every Status change,
     `archive` on a green landing with no open gap, `complete` after the merge;
     *a session, on the user's word* → `archive` and `list`.
   - **What this skill never does.** Commit; edit a unit file, the Run log or
     any doc; walk the members for plans; re-point a `requires:` line; delete a
     folder; decide whether a warning blocks (it asks); take a `RUNNING` row.

2. **`plugins/vwf/skills/plan-management/references/plan-index.md`** — the
   content of `plugins/vwf/assets/plan-index.md`, copied whole (read it; write
   the new file; do not `mv` — U5 deletes the original), then edited:
   - `:12` — the four writers become *its writers are the verbs of
     `plan-management`, called by `/vwf:plan`, `/vwf:change-plan` and
     `/vwf:execute`*.
   - `:58-66` *Writers and their edits* — rows keyed by verb (`add`, `claim`,
     `complete`, `archive`) with the same edits, plus a line that the caller
     named in each row commits.
   - `:77`, `:87`, `:205-208`, `:251` — every `/vwf:archive` becomes the
     `archive` verb; `:87`'s "rides the archive commit" becomes "rides the
     commit of the session that asked".
   - Every self-citation `${CLAUDE_PLUGIN_ROOT}/assets/plan-index.md` inside the
     file, if any, becomes the new path.
   - Nothing else changes: the columns, the resolution, the pick, reading the
     queue, writing a row, the sweep stay word for word — the verbs point at
     these sections rather than restate them.

## Verification

- `mise run p:plugins:check` green — rule 4 (strict-YAML frontmatter) is the one
  that bites; a dropped skill is silent, so also run
  `python3 -c "import yaml,sys; yaml.safe_load(open('plugins/vwf/skills/plan-management/SKILL.md').read().split('---')[1])"`
  and see it print nothing.
- `grep -c '^### ' plugins/vwf/skills/plan-management/SKILL.md` ≥ 9.
- `grep -n 'vwf:archive' plugins/vwf/skills/plan-management/` returns nothing.
- `grep -n 'assets/plan-index' plugins/vwf/skills/plan-management/` returns
  nothing.
- `mise run code:precommit` green on the two files (`git add -N` them first so
  the pre-stage pass sees them).

## Guardrails

- Touch nothing outside the two owned paths. Do **not** delete or edit
  `plugins/vwf/assets/plan-index.md` or `plugins/vwf/skills/archive/` — U5
  deletes them after every citation has moved; deleting them now breaks the
  checker for U2 and U3.
- `plugins/**/*.md` is not dprint-formatted — fold prose by hand at the width
  the neighbouring skills use (80).
- No code span containing an escaped backtick, none starting with `##`, no table
  cell ending in a bare `*`.
- BSD `sed` — but you are writing new files; use the Write tool, never a shell
  heredoc (`cat` is aliased to `bat`).
- Delete nothing.

## Commit

`feat: plan-management — the one owner of the plan index, the Status block and the archive`
— written by the orchestrator after the wave gate, not by the unit. `feat` is in
`.config/git-conventional-commits.yaml`.
