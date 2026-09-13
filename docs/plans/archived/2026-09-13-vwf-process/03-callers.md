# U3 — the callers: change-execute, plan, execute, archive invoke the backlog skill

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/change-execute/SKILL.md`,
  `plugins/vwf/skills/plan/SKILL.md`, `plugins/vwf/skills/execute/SKILL.md`,
  `plugins/vwf/skills/archive/SKILL.md`
- **Model:** opus
- **Read first:** every owned file, top to bottom, before editing.
- **Lazy-load:** `plugins/vwf/skills/change-execute/references/blocking.md`
  (48–58, resume semantics — to confirm nothing there assumes an uncommitted
  folder).

## Ruling

Decision 8 (the user, verbatim): "Let only `backlog` skill be responsible to
manage the file and content, others can simply call `backlog` skill to make
changes. `change-plan`, `change-execute`, `plan`, `execute` any of them can call
`backlog`."

Decision 9: "A `backlog:` frontmatter key — a list of ids — on change-plan
folders' `index.md` and on `/vwf:plan`'s flat files. Empty or absent means the
plan covers no backlog item."

Decision 10 names the verbs the callers use: `planned <ids> <folder>` and
`done <ids>`.

Goal sentence from index.md: the approved change plan "is committed on the
branch it was planned on and pushed before the hand-off line, so the fresh
session's worktree, cut from the integration branch, sees it."

## Edits

Place every edit by section name; line numbers below are the survey's and may
have moved.

1. **`change-execute/SKILL.md`** —
   - §1 Resolve and refuse early (38–57): where it reads `index.md`, add that it
     also reads the `backlog:` list. The passage at 54–57 ("edited in the
     worktree only … never in the main checkout") gains one sentence: the folder
     arrives already committed on the integration branch — change-plan commits
     and pushes it at hand-off — so the worktree sees it from its first commit;
     a folder that is not on the branch is refused with the line to run
     (`/vwf:change-plan` again, or a commit by hand).
   - §7 Land (163–173): after the move to `archived/` and the `COMPLETE` status,
     before the final `docs:` commit, when `backlog:` names ids invoke
     `/vwf:backlog done <ids>`; its edit to `docs/backlog.md` rides that final
     commit. State plainly that this skill never edits `docs/backlog.md` itself.
2. **`plan/SKILL.md`** —
   - The recall step (91–94): add `docs/backlog.md`, when the repo has one, so a
     slice that is a backlog item carries its id.
   - The plan doc's frontmatter (wherever §6/§7 defines it): a `backlog:` list,
     empty when the slice came from nowhere in the backlog.
   - §9 Commit (361–365): after the approval commit, when `backlog:` names ids
     invoke `/vwf:backlog planned <ids> <path>`, then commit that edit with the
     same bare `docs:` shape through git-workflow. Never edit the file here.
3. **`execute/SKILL.md`** — at the final human gate, on the approve-and-merge
   path (the landing, near 119–122 and the declared preferences at 157–162):
   when the plan doc's `backlog:` names ids, invoke `/vwf:backlog done <ids>`
   before the merge so the edit lands with it. One sentence saying execute never
   edits the file.
4. **`archive/SKILL.md`** — in the move-and-status step (98–129): when the plan
   being archived carries `backlog:` ids whose status is not yet `done`, invoke
   `/vwf:backlog done <ids>`; the commit step (137–143) carries it.

## Verification

- `mise run p:plugins:check` green.
- `command grep -n "vwf:backlog" plugins/vwf/skills/{change-execute,plan,execute,archive}/SKILL.md`
  shows one call in each file with the right verb: `done` in change-execute,
  execute and archive; `planned` in plan.
- `command grep -n "already committed" plugins/vwf/skills/change-execute/SKILL.md`
  shows the §1 sentence.

## Guardrails

- Do not touch `change-plan/` (U1), `backlog/` or `feedback/` (U2), any doc
  (U7).
- Cite the backlog skill by name (`/vwf:backlog`), never by path — it is the
  same plugin, so `${CLAUDE_PLUGIN_ROOT}` would be valid, but the callers invoke
  it as a skill, not read it as a file.
- `plugins/**/*.md` is not dprint-formatted: fold by hand at 80.
- Delete with `rm`, never `git rm`.

## Commit

`feat: change-execute, plan, execute and archive call /vwf:backlog to move items`
— written by the orchestrator after the wave gate, not by the unit. Type from
`.config/git-conventional-commits.yaml` (`feat`; no scopes).
