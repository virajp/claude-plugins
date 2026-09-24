# Decision — init's forge pass: visibility, licence by visibility, default branch, protection, backlog project

**Date** 2026-09-20 · **Branch** `2026-09-20-init-forge-pass` · **Plan**
[`docs/plans/2026-09-20-init-forge-pass/`](../../plans/2026-09-20-init-forge-pass/index.md)
· **Reverses** §forge (D17 and its 2026-09-12 supersession) of
[`2026-09-06-init-owns-the-first-commit.md`](./2026-09-06-init-owns-the-first-commit.md)
and "The D17 reversal" of
[`2026-09-12-task-library-configures-each-gate-once.md`](./2026-09-12-task-library-configures-each-gate-once.md)
· **Widens** the missing-project procedure of
[`2026-09-18-backlog-on-github-projects.md`](./2026-09-18-backlog-on-github-projects.md)
· **Backlog** B28, its first piece

## What prompted it

After one `/vwf:init` run a repo still had no visibility decided, a licence
offered regardless of whether anyone outside could read it, the forge's default
branch on whatever the first push made it, neither `develop` nor `main`
protected, and no backlog project until the first `/vwf:backlog add`. The user
asked for one init run to leave every repo of the product with those settled,
asking for by-hand work only where the forge has no CLI.

## What changed

Question 6 of init's seven is now **visibility** — `public` or `private`, one
row per repo, defaulted from the forge where the repo has an `origin` the forge
CLI can read and `private` otherwise, written nowhere in the tree. Its two
dependent parts are the **seventh round**: 6a the licence, rows for public repos
only (a private repo gets no `LICENSE`; an existing licence file is kept
whichever the answer), and 6b the security contact — a public repo's row
defaulted to its advisories page, a private repo's a free email or internal URL
with no default; either fills the hygiene pack's one contact slot in
`SECURITY.md`, and the issue chooser's *Report a vulnerability* link takes a URL
contact or is removed.

The git pass gained a **forge pass** after the last push, on one further consent
for the product: each pushed repo's default branch on the forge (`develop`
preselected, `main` the other), protection on `develop` and `main` (no
force-push, no deletion; a pull request required when `MERGE_MODEL` is `pr`),
and — base only, last — the backlog skill's missing-project procedure. GitHub
writes one ruleset per branch named `vwf-<branch>` through `gh api`; GitLab one
`protected_branches` entry through `glab api`; any other forge gets the table as
a by-hand list. Existing protection in any form is left exactly as it is and
reported. A precondition miss — no CLI, not logged in, a refused call — is never
a stop: the reason lands on the repo's `Forge` line, the by-hand list prints,
the run continues. `/vwf:doctor` reads the forge state back as a **seventh
baseline predicate (g)** — drift, never blocking, the same `/vwf:setup reshape`
remedy — and setup's Step 0 cites seven. The hygiene pack is `1.1.1`:
`CONTRIBUTING.md`'s by-hand default-branch line became the fallback for a forge
the pass cannot reach and gained the protection rules; `SECURITY.md` accepts an
email; `conventions.md` records the visibility rule.

## The two reversals

**Init's git pass may now write forge settings.** D17 of 2026-09-06 had init ask
the default branch and run a pack task; 2026-09-12 deleted the task on the
argument that a one-time act is not a task a machine re-runs, leaving the
by-hand line in `CONTRIBUTING.md` and ruling that init "names no forge and
inspects none". This plan reverses the second half: init's forge pass sets the
default branch and branch protection through the forge CLI, on consent, and
reads the forge for question 6's default. What survives from both: no `setup:*`
task edits a remote, the by-hand line stays in `CONTRIBUTING.md` as the fallback
for a forge with no CLI, and vwf's `SKILL.md` prose still names no CLI — `gh`
and `glab` appear in the init references and the hygiene pack alone, as the
backlog skill's reference already did.

**The missing-project procedure has a second caller.** 2026-09-18 made `add` the
one verb that reaches the browser hand-over (the API cannot instantiate the Team
planning template). Init's forge pass now reaches the same procedure by name,
ends after the field bootstrap adding no item, reports a project already present
and skips it, and prints the GitLab "not yet supported" line and continues. A
widening, not a reversal: the skill stays the project's sole owner and neither
caller runs `gh project create`.

## The rulings, in brief

1. **Visibility** is Q6, per repo, forge-read default else `private`; licence
   becomes Q6a for public repos only. Rejected: one visibility for the product;
   default `public`; a licence row on a private repo.
2. **Security contact** is Q6b: advisory URL for public, free contact for
   private, decline writes no file either way. Rejected: skipping the row on a
   private repo.
3. **Default branch**: one row per pushed repo, `develop` preselected; the forge
   is the record — no tree key. Rejected: default `main`; a `DEFAULT_BRANCH`
   marked position.
4. **Protection**: no force-push, no deletion on both branches; require-PR under
   `pr` only. GitHub rulesets `vwf-<branch>`, GitLab `protected_branches`;
   idempotent — existing protection never merged with or replaced. Rejected:
   identical rules regardless of `MERGE_MODEL`; overwriting.
5. **Placement**: after the push, repos answered *commit + push* only, one
   consent for the product, backlog step last. Rejected: a fourth push answer;
   one consent per action.
6. **Backlog project**: the backlog skill's procedure, invoked by name; never
   `gh project create`. Rejected: creating from init.
7. **Doctor (g)**: forge state per repo where the CLI answers, skipped with a
   note otherwise; drift, not blocking. Rejected: no predicate.
8. **Precondition**: the backlog skill's shape; a miss reports and falls back to
   the by-hand list. Rejected: a hard stop.

Rulings made during the run, on gaps the plan left: "seven questions" means
seven rounds — Q6 is round 6, Q6a and Q6b together round 7. Predicate (g) counts
a branch as protected when **any** ruleset or protection covers it; drift is
only "no protection at all", an existing protection short of a rule is an
informational note, and the default-branch check is "develop or main" since no
tree key holds the choice. In the hygiene pack, `SECURITY.md`'s `<REPO_URL>`
token and the issue chooser's *Report a vulnerability* `url:` both carry the
whole contact; init fills them with a URL and removes the chooser entry for an
email or a decline. GitLab protection is `push_access_level` 0 / `merge` 30
under `pr`, 30 / 30 under `direct`, `allow_force_push` false; a GitLab
`internal` visibility proposes `private`.

## What init still never does

- Creates a remote, or pushes without the push answer.
- Lands a CI workflow of any kind.
- Touches any forge setting beyond the three — no reviewers, required checks,
  CODEOWNERS, description or visibility write.
- Creates the backlog project through the API; the procedure is the backlog
  skill's and the user's browser.
- Writes a tree key for the default branch or the visibility — the forge is the
  record for both, which is why doctor reads it back.
