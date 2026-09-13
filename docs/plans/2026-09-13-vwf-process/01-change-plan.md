# U1 — change-plan: recall the backlog, commit and push at hand-off, carry the bump rule

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/change-plan/SKILL.md`,
  `plugins/vwf/skills/change-plan/references/interview.md`,
  `plugins/vwf/skills/change-plan/references/plan-template.md`
- **Model:** opus
- **Read first:** every owned file, top to bottom, before editing.
- **Lazy-load:** `plugins/vwf/skills/git-workflow/SKILL.md` (Step 1 at 122–127,
  Step 3 at 134–168, Step 4 at 186–223, the caller-preference paragraph at
  47–55) — to phrase the declared preferences in git-workflow's own terms;
  `plugins/vwf/skills/plan/SKILL.md` §9 (361–365) — the sibling that already
  commits its plan through git-workflow.

## Ruling

Decision 7: "change-plan invokes `vwf:git-workflow` with declared preferences:
work in place on the current branch (no worktree); stage the plan folder plus
`docs/backlog.md` when it changed; commit
`docs: change plan — <name> — approved, awaiting execution`; push to the
branch's upstream, setting it when absent."

Decision 8 (the user, verbatim): "Let only `backlog` skill be responsible to
manage the file and content, others can simply call `backlog` skill to make
changes. `change-plan`, `change-execute`, `plan`, `execute` any of them can call
`backlog`."

Decision 9: "A `backlog:` frontmatter key — a list of ids — on change-plan
folders' `index.md` and on `/vwf:plan`'s flat files. Empty or absent means the
plan covers no backlog item."

Decision 1: "A version is forbidden when any component equals 13 or 17."
Decision 2: the bump tasks skip past such a number. Decision 13: the rule
sentence lives, among other places, "in the change-plan interview's
release-intent item and the plan template's gates-and-bump paragraph".

Goal sentence from index.md: "An approved change plan is committed on the branch
it was planned on and pushed before the hand-off line, so the fresh session's
worktree, cut from the integration branch, sees it."

## Edits

1. **`SKILL.md` §1 Recall** (the bullet list at 39–49) — add one bullet, after
   the archived-plan bullet: read `docs/backlog.md`, the repo's backlog that
   `/vwf:backlog` maintains, when the repo has one. The request is often one of
   its items; note every id the request covers, so the plan's frontmatter can
   carry them. Reading the file is fine; editing it is never this skill's —
   decision 8.
2. **`SKILL.md` §6 Write the folder** — one sentence: the frontmatter's
   `backlog:` list names the ids recalled in §1, or is empty.
3. **`SKILL.md` §8 Hand off** (227–240) — rewrite so the order is: set
   `APPROVED` with the date; when `backlog:` names ids, invoke
   `/vwf:backlog
   planned <ids> <folder>` (the skill edits the file; this
   skill does not); then invoke `vwf:git-workflow` with these declared
   preferences, stated in the skill's own vocabulary: work in place on the
   current branch without a worktree (its Step 1 "if declined" path — say why:
   the fresh session's worktree is cut from the integration branch and can see
   only a committed folder); stage exactly the plan folder and `docs/backlog.md`
   when it changed; commit type `docs`, message
   `docs: change plan — <name> — approved, awaiting execution`; push to the
   branch's upstream after the commit, setting the upstream when the branch has
   none, without asking — the gate approve in §5 is the explicit request
   git-workflow's push rule wants. Then the launch block, unchanged, and the "Do
   not start executing" paragraph. Keep "end with exactly this, and nothing
   after it" true: the commit and push happen before the launch block is
   printed.
4. **`SKILL.md` "What this skill never does"** (242–248) — add two bullets:
   pushes anywhere but the branch it stands on, and merges nothing; edits
   `docs/backlog.md` itself.
5. **`references/interview.md` item 17** (72–77) — add the rule sentence: a bump
   that would land on a component equal to 13 or 17 goes one further (`x.12.0`
   minor → `x.14.0`; `x.y.16` patch → `x.y.18`); those two integers are never
   issued on any version line; the consent row names the version the bump
   actually reaches. Item 18 (84–88) — extend "Only an explicit approve writes
   the folder" with: and the hand-off commits and pushes it.
6. **`references/plan-template.md`** — frontmatter gains `backlog: []` with a
   trailing comment "ids from docs/backlog.md this plan covers, or empty"; the
   gates-and-bump paragraph at 208 gains the same skip sentence as edit 5; the
   Launch block's preceding prose (around 148) gains one sentence that the
   folder is already committed and pushed on the branch the plan was written on.
   Consent-row example unchanged.

## Verification

- `mise run p:plugins:check` green (strict-YAML frontmatter, rule 10's
  technology-free prose — name no tool in the new sentences; "git" is fine, it
  is already throughout the tree).
- `command grep -n "backlog" plugins/vwf/skills/change-plan/SKILL.md` shows the
  recall bullet, the §6 sentence, the §8 call and the never-does bullet.
- `command grep -n "13" plugins/vwf/skills/change-plan/references/interview.md plugins/vwf/skills/change-plan/references/plan-template.md`
  shows the two rule sentences.
- The launch block text at the end of §8 is byte-identical to the template's.

## Guardrails

- Do not touch `plugins/vwf/skills/backlog/` (U2), the four caller skills (U3),
  or any doc (U7).
- `plugins/**/*.md` is not dprint-formatted: fold by hand at the file's existing
  width (80).
- Delete with `rm`, never `git rm`.
- Name no third-party tool in vwf prose (checker rule 10).

## Commit

`feat: change-plan commits and pushes the approved folder, recalls the backlog`
— written by the orchestrator after the wave gate, not by the unit. Type from
`.config/git-conventional-commits.yaml` (`feat`; no scopes).
