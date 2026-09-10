# U1 — change-plan: commit types from the convention file, the retired-name grep, wave-scoped checks, `rm` never `git rm`

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/change-plan/SKILL.md`,
  `plugins/vwf/skills/change-plan/references/interview.md`,
  `plugins/vwf/skills/change-plan/references/plan-template.md`
- **Model:** opus
- **Read first:** every owned file, top to bottom, before editing.
- **Lazy-load:** `plugins/vwf/skills/git-workflow/SKILL.md:155-176` (step 3.4
  and the commit format — quote its common-types list exactly);
  `.config/git-conventional-commits.yaml` (this repo's file, as the example
  shape).

## Ruling

From index.md's assumed decisions, verbatim:

> **1.** **Plan-time.** Survey §1 reads `.config/git-conventional-commits.yaml`
> (or the repo's equivalent convention file); the template constrains every
> `## Commit` line to its types and scopes; absent a file, git-workflow's
> common-types list applies. git-workflow step 3.4 stays as the second check;
> change-execute is unchanged.

> **2.** Survey §1 gains a bullet: when the request retires or renames a name,
> grep the name itself across every tree — `.claude/`, `installer/`,
> `site/src/content/docs/`, `plugins/`, the root docs — and every hit gets an
> owner in the unit table. Interview item 14 and the self-review point at it.

> **3.** **Doctrine, not syntax.** The Wave gate holds from preflight on,
> unchanged; a check that only holds once unit N has landed is written into unit
> N's Verification and repeated in the gates-and-bump unit's. One sentence in
> the template and in §4(a).

> **4.** **Both ends.** Unit contract and dispatch prompt: delete with plain
> `rm`, never `git rm` — a unit stages nothing. […]

The user, on decision 1: *"Plan-time: change-plan reads the convention file"*.
On decision 3: *"Doctrine: it is not a wave-gate line"*. On decision 4: *"Both
ends"*.

## Edits

1. **`SKILL.md` §1, the survey bullets (`:55-68`).** Add two bullets, in the
   file's own voice:
   - the repo's commit convention — `.config/git-conventional-commits.yaml`
     where the repo has one, else whatever its commit-message gate reads — so
     every unit file's `## Commit` line uses a type and scope that gate accepts;
     a repo with no convention file takes git-workflow's common types (quote
     that list from `git-workflow/SKILL.md:170-176`, do not restate it from
     memory);
   - when the request retires or renames a name, the name itself, grepped across
     every tree the repo has — `.claude/`, `installer/`,
     `site/src/content/docs/`, `plugins/`, the root docs — because every hit is
     a passage the change falsifies, and every one needs an owner in the unit
     table before the plan is written; the three plans that skipped this each
     left the docs unit inheriting nobody-owned passages at run time.
2. **`SKILL.md` §4(a), the wave gate.** After "Confirm them.", one sentence: a
   check that only holds once a particular unit has landed is not a wave-gate
   line — the gate runs before wave 1 and must be green then — it is that unit's
   Verification, repeated in the gates-and-bump unit's.
3. **`SKILL.md` §6, the rules list.** Add one bullet beside "One unit, one
   subagent, one commit": a unit deletes with plain `rm`, never `git rm` — it
   stages nothing, so no unit's deletion can ride another unit's commit.
4. **`SKILL.md` §7, self-review.** Add one bullet: every hit of the retired-name
   grep is inside some unit's Owns, and every `## Commit` line's type is in the
   convention file's list.
5. **`references/interview.md` item 14.** After "Confirm the survey's list.",
   add: including every hit of the retired-name grep — a hit with no owner is a
   unit-table row to add now, not a `DOCS FALSIFIED:` line to discover at run
   time.
6. **`references/plan-template.md`, the `## Commit` block (`:187-190`).** Extend
   the placeholder note: the type (and scope, where the file lists any) comes
   from the repo's convention file the survey read; never a type it does not
   allow.
7. **`references/plan-template.md`, the Wave gate section (`:90-94`).** Add one
   sentence to the placeholder: every line must be green before wave 1 — a check
   that holds only after a unit lands belongs in that unit's Verification.
8. **`references/plan-template.md`, the Unit contract (`:110-128`).** After
   "never commits.", add: "A unit deletes with plain `rm`, never `git rm` — it
   stages nothing."
9. **`references/plan-template.md`, the unit file skeleton, Guardrails.** Add a
   sample guardrail line: "Delete with `rm`, never `git rm`."

## Verification

- `mise run plugins:check` green (strict-YAML frontmatter untouched).
- `grep -n 'git-conventional-commits' plugins/vwf/skills/change-plan/SKILL.md plugins/vwf/skills/change-plan/references/plan-template.md`
  → at least one hit in each.
- `grep -n 'git rm' plugins/vwf/skills/change-plan/SKILL.md plugins/vwf/skills/change-plan/references/plan-template.md`
  → only the sentences that forbid it.
- `grep -n 'Verification' plugins/vwf/skills/change-plan/references/plan-template.md`
  shows the wave-gate sentence from edit 7.
- Fold width matches the surrounding prose (80 columns, by hand —
  `plugins/**/*.md` is not dprint's).

## Guardrails

- Do not touch `plugins/vwf/skills/change-execute/**` (U2),
  `plugins/vwf/skills/git-workflow/**` (U3), `plugins/vwf/skills/init/**` (U4),
  any doc (U5), or `plugin.json` (U6).
- The frontmatter of `SKILL.md` is strict YAML — do not edit it.
- Delete with `rm`, never `git rm` (nothing here is deleted).
- Never run `git checkout`, `git restore`, `git stash`, or a formatter with
  `--fix` on a path outside your Owns.

## Commit

`fix: change-plan reads the commit convention, greps a retired name, keeps
wave-scoped checks out of the gate`
— written by the orchestrator after the wave gate, not by the unit.
