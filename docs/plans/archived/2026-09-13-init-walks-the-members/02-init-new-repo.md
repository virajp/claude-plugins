# U2 — new-repo.md: the marked fills from the members, the git pass per repo

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/init/references/new-repo.md`
- **Model:** opus
- **Read first:** the owned file, top to bottom, before editing.
- **Lazy-load:** `plugins/vwf/assets/membership.md` (the clone commands, the
  base-repo resolution); the mise pack's
  `plugins/stackgen/stacks/toolchain-manager/mise/config/.config/mise/tasks/setup/all:1-30`
  and `mise.dev.toml:40-50` (the two templates §7 fills — read the shape, name
  no tool); `plugins/vwf/skills/init/SKILL.md` (U1 is editing it concurrently —
  read the committed version only for heading names).

## Ruling

Quoted from `index.md`:

> **1** — init walks members itself: one survey across the base and every
> member, one plan with a section per repo, one consent, per-repo report
> sections.

> **3** — The landing model and the three-answer commit question are asked once
> and applied to every repo. Members commit first, then the base commits the
> run's files **plus** the changed gitlinks, which init deliberately stages.
> Push, on the commit-and-push answer, pushes every repo. The branch pair is
> created per repo that lacks it.

> **5** — Filled from the resolved **member repos**, one flag and one alias per
> member, never from project ids. A reshape rewrites flags an earlier run wrote
> from project ids, as a rewrite row. Project ids still fill `p:<slug>:*` and
> `REPO_NAME` in each repo.

> **9** — Members are applied and committed before the base, so the base's
> gitlinks are current when it commits. Within a repo the existing order holds —
> fills, three merges, git pass.

> **10** — The base registry's `members[].projects` where the config declares
> them; else the member's own sub-project directories; else the member's name.
> Each member's own row carries its `REPO_NAME`.

> **11** — Unchanged: empty where `.gitmodules` exists, the sibling paths from
> `members:` otherwise. Ruling 5 changes the flags and aliases only.

Reversal 2: line 176's "`init` never writes outside the target repo" becomes
"never writes outside the repos it resolved as the base and its members".

## Edits

1. **Opening** (`:1-11`): the pipeline runs once **per repo** that resolved to
   mode new, members before the base (ruling 9). One sentence; nothing else in
   the opening changes.
2. **§1 The repository itself** (`:12-35`): "the repository" is the repo this
   pass is running in. Add: a member being created fresh is created at its
   resolved path; under submodule linkage init does not run
   `git submodule
   add` — a member that is not yet a submodule is the user's
   to add, and init reports it under Deferred with that unlock.
3. **§7 The project ids, and the three things they fill** (`:98-240`):
   - The resolution order gains the member case per ruling 10, stated in full.
   - "That list is one list with three surfaces" is **no longer true**: the
     per-project task groups and `REPO_NAME` take the **project ids** of the
     repo being shaped; the aggregator's member flags and the shell aliases take
     the **member repos**, one each, in the resolved order, named by each
     member's confirmed slug (ruling 5). Rewrite `:133-138` and `:150-163`
     accordingly. A single-project repo with no members still leaves both
     positions as shipped. A member repo has no members of its own unless it
     declares them, so its flag and alias positions stay as shipped.
   - Add the rewrite rule: a position already carrying lines named for something
     other than the resolved members is **rewritten**, shown as a rewrite row in
     the plan.
   - `:176` — reversal 2 wording.
   - `MEMBERS` (`:191-198`): unchanged in substance (ruling 11); re-read for the
     words "single-project" and keep them accurate.
4. **§11 The git pass** (`:304-403`): rewrite so it reads across the resolved
   repos per ruling 3 and 9.
   - (a) `MERGE_MODEL`: asked once; written into every repo's environment block.
   - (b) staging: per repo, its own run lists into its own index — **plus**, for
     the base, each member path whose gitlink changed because that member
     committed in step (c). Say plainly this is the one thing init stages that
     it did not write, and why (a superproject pinned at the shaped commits is
     the run's result, and leaving the gitlinks unstaged leaves the base
     mid-commit).
   - (c) the commit question: asked once. Order: every member, in resolved
     order, then the base. The fixed `ops:` message per repo. A member that is
     absent-and-declined is skipped here and said so.
   - (d) branches: the table applies per repo.
   - (e) push: on the commit-and-push answer only, every repo that committed,
     members first then the base; a repo with no origin is reported as not
     pushed.
   - Add the report carry (`:400`): one line per repo for branches, commit and
     push; one `Gitlinks staged <n>` line for the base.
5. **§12 The report** (`:405-`): point at SKILL.md's per-repo shape; do not
   duplicate the block.
6. Name no tool anywhere. The two templates §7 fills are "the bootstrap
   aggregator's flag list" and "the shell alias list".

## Verification

- `mise run p:plugins:check` green.
- `grep -n "never writes outside the target repo" plugins/vwf/skills/init/references/new-repo.md`
  returns nothing.
- `grep -n "one list with three surfaces" …/new-repo.md` returns nothing.
- `grep -n "Gitlinks staged" …/new-repo.md` hits at least once, in §11.
- Every `§N` heading present before the edit is present after it, same text.

## Guardrails

- Do not touch `SKILL.md`, `existing-repo.md`, `fragments-and-sections.md` or
  `readme-and-license.md`.
- Keep every heading's text — U3 and SKILL.md cite "§7" and "§11" by name.
- `plugins/**/*.md` is not dprint-formatted — match the fold width by hand.
- Delete with `rm`, never `git rm`. Stage nothing, commit nothing.

## Commit

`feat: init fills the member flags from the members and commits every repo` —
written by the orchestrator after the wave gate.
