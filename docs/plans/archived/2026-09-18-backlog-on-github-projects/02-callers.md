# U2 — The callers stop naming the file

- **Wave:** 2
- **Depends on:** U1
- **Owns:** `plugins/vwf/skills/change-plan/SKILL.md`,
  `plugins/vwf/skills/plan/SKILL.md`,
  `plugins/vwf/skills/plan/references/plan-doc.md`,
  `plugins/vwf/skills/execute/SKILL.md`,
  `plugins/vwf/skills/execute/references/blocking.md`,
  `plugins/vwf/skills/plan-management/SKILL.md`,
  `plugins/vwf/skills/plan-management/references/plan-index.md`,
  `plugins/vwf/skills/feedback/SKILL.md`,
  `plugins/vwf/assets/templates/plan-folder.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file, top to bottom;
  `plugins/vwf/skills/backlog/SKILL.md` (U1's, committed).
- **Lazy-load:** `plugins/vwf/skills/backlog/references/github.md` when a
  replaced passage needs to say how a caller's recall reads the project.

## Ruling

Decisions 2 and 14, quoted:

> **2.** The project is the one store. When `gh` is absent, unauthenticated for
> the remote's host, or without the `project` scope, every verb stops with the
> remedy … and a caller's recall reports "backlog unreadable: <reason>" and
> continues with nothing. `docs/backlog.md` is never read or written again.

> **14.** The skill still never commits — there is nothing in the tree to
> commit; the planners' and the executor's staging lines that named
> `docs/backlog.md` are dropped.

The ids are unchanged: `backlog:` frontmatter lists and the plan index's Backlog
column keep carrying `Bnn`, and every `planned <ids> <folder>` / `done <ids>`
call is unchanged in shape.

## Edits

Every "read `docs/backlog.md`" becomes "read the backlog through
`/vwf:backlog list` — the product's backlog, a project on the base repo's forge
that the `backlog` skill alone writes"; every "stage `docs/backlog.md` when
changed" is dropped; every "sole writer of `docs/backlog.md`" becomes "sole
writer of the backlog project".

1. **`skills/change-plan/SKILL.md`** — `:52-57` (§1 recall: the backlog is read
   by invoking `/vwf:backlog list`; when the skill reports it unreadable, record
   that in the facts and continue; ids noted as today); `:223` (frontmatter
   comment); `:314-315` (hand-off step 2 unchanged in shape — the verb edits the
   project, not a file); `:326-327` (drop `docs/backlog.md` from the staging
   list — the `backlog` edit no longer rides the commit); `:358` ("never does":
   never edits the backlog itself).
2. **`skills/plan/SKILL.md`** — `:54` (doc table row: the backlog is a forge
   project, not a path); `:99-101` (§2 recall, as in change-plan); `:393-396`
   (frontmatter wording); `:445-446` (hand-off step 2, as above); `:457-467`
   (staging: drop the file; the base-vs-member sentence now says the project is
   the base's — resolved from the base's remote — so a member session addresses
   the same project); `:499` ("never does").
3. **`skills/plan/references/plan-doc.md:19-21`** — `backlog:` ids are the `Bnn`
   prefixes of the backlog project's items.
4. **`skills/execute/SKILL.md`** — `:107-109`, `:227`, `:316-318` (the file is
   never edited → the backlog is never edited here; the verb is called);
   `:742-749` (landing: `done <ids>` unchanged; drop any staging of the file
   from the final `docs:` commit's list); `:886`.
5. **`skills/execute/references/blocking.md:69`** — leave the "is backlog B12"
   example; the id vocabulary survives. Edit only if the sentence names the
   file.
6. **`skills/plan-management/SKILL.md`** — `:40`, `:59`, `:100`, `:113` (wording
   of the ids' source); `:251-257` (archive → `done <ids>` unchanged; drop any
   mention of the file riding the archive commit).
7. **`skills/plan-management/references/plan-index.md`** — `:4`, `:141` ("the
   index lives in the base like the backlog project is the base's"); `:30`,
   `:37`, `:48` (Backlog column: `Bnn` ids of the project's items).
8. **`skills/feedback/SKILL.md:22`** — the boundary sentence names the backlog
   as the project `/vwf:backlog` keeps, not a file.
9. **`assets/templates/plan-folder.md:39`** — the `backlog:` comment: "ids
   (`Bnn`) of the backlog project's items this plan covers, or empty".

## Verification

- `grep -rn 'docs/backlog' plugins/vwf/skills plugins/vwf/assets` returns
  nothing.
- `grep -c 'vwf:backlog\|backlog' plugins/vwf/skills/change-plan/SKILL.md` ≥ 3
  and the same for `plan/SKILL.md` and `execute/SKILL.md` — the callers still
  call.
- `mise run p:plugins:check` green.
- `mise run code:precommit` green.

## Guardrails

- Touch nothing outside the nine owned files — not `skills/backlog/` (U1,
  committed), not `skills/doctor/` (U3, same wave), not a doc.
- Do not restate a verb's procedure; cite the verb.
- `plugins/**/*.md` is not dprint-formatted — fold by hand at the neighbouring
  width.
- No escaped backtick inside a code span; no table cell ending in a bare
  asterisk.
- Delete nothing; `rm` nothing.

## Commit

`refactor: planners, execute, plan-management and feedback — the backlog is the forge project`
— written by the orchestrator after the wave gate. `refactor` is in
`.config/git-conventional-commits.yaml`.
