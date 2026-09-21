---
type: vwf-change-plan
title: branch model — landing model per branch; the git pass reads where it
  stands
requires: [ docs/plans/2026-09-20-init-brownfield-reads ]
backlog: [ B28, B53 ]
---

# Plan — branch model (2026-09-20)

## Status

**RUNNING**

RUNNING since 2026-09-21 in
/Users/virajpatel/Projects/github.com/virajp/claude-plugins/.worktrees/2026-09-20-branch-model

## Consent

| Action                                            | Granted                                                                                                                                          |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Merge to the integration branch and push on green | yes                                                                                                                                              |
| After landing: `mise run p:plugins:local`         | run                                                                                                                                              |
| Release vwf publicly                              | minor — `19.40.0` → `19.41.0`, a hand edit of `plugins/vwf/.claude-plugin/plugin.json` then `mise run p:plugins:marketplace`; no release step    |
| Release stackgen publicly                         | minor — `1.23.1` → `1.24.0`, a hand edit of `plugins/stackgen/.claude-plugin/plugin.json` then `mise run p:plugins:marketplace`; no release step |
| Release site publicly                             | patch — `1.1.36` → `1.1.37` via `mise run p:site:version`; no release step                                                                       |
| Release installer publicly                        | none — untouched                                                                                                                                 |

**The mode recorded here is the consent.** A `run` step runs on a green landing
without a prompt; an `ask` step stops the run once before it, reports what it
would do, and waits. The mode is the interview's answer (item 17), and a release
step recorded `run` is authorised by the interview's release question (item 18)
— a release recorded `ask`, or with no step at all, is intent, not
authorisation. Where a step stages something this session already loaded, it is
picked up only by a **restarted** session.

## Goal

After this lands, the landing model is set per repo **and per branch** —
`MERGE_MODEL_DEVELOP` and `MERGE_MODEL_MAIN`, each `direct` or `pr` — and every
reader honours it: `code:merge:develop` and `code:merge:main`, git-workflow's
Step 4, the forge pass's require-PR rule, and doctor's predicates. Init's git
pass reads where each repo stands before it commits: the ops commit lands on
`develop` in every mode, never on `main`; a repo whose mainline is `master` or
`trunk` gets `main` and `develop` created beside it and the old branch reported;
a detached member is refused with the branch to check out, never committed.

Backlog items **B53** ("Merging strategy must be configurable for each repo and
branch (`main` & `develop`)" — scoped at the interview to the landing model,
`direct` vs `pr`, per branch) and **B28**, piece D2, plan 4 of 5 — candidate 11
of `docs/memory/problems/2026-09-20-init-shape-audit.md`; closes B3, B13, G6 and
the init half of L14 (the literals `main` and `develop` stay: branch names are
fixed by the B53 answer). Requires `2026-09-20-init-brownfield-reads` (the
chain; the git pass this plan edits follows the passes that plan adds).

**Reversal, confirmed at the interview.** `MERGE_MODEL` — "a marked `[env]`
position, `direct|pr`, read as `direct` when unset, filled at landing"
(`docs/memory/decisions/2026-09-12-task-library-configures-each-gate-once.md:68-77`)
— is retired in favour of two positions, one per branch. A repo still carrying
the single key is read as both until its next reshape, and doctor reports it as
drift. The docs unit writes one decisions doc.

## Facts the survey established

Paths: `NR` = `plugins/vwf/skills/init/references/new-repo.md`, `ER` =
`…/existing-repo.md`, `MISE` =
`plugins/stackgen/stacks/toolchain-manager/mise/config/.config`, `DOC` =
`plugins/vwf/skills/doctor/references/stack-checks.md`. Verified at `39d8bb27`,
before plans 1–3 land; the units locate passages by heading.

- **Where the ops commit lands.** Never chosen: `NR:546-559` commits in the repo
  the pass runs in, on whatever is checked out; a repo created by §1 starts on
  `develop` (`NR:21-22`); existing repos "leave branches alone here"
  (`NR:31-32`). The develop/main creation table `NR:580-585` (no commits →
  `main` from HEAD, leave develop; main only → develop; develop only → main;
  both → nothing; "leave checked out: as it was"), restated `ER:905-907`;
  rationale `NR:24-29, 587-590`. **No** read of the current branch or a member's
  HEAD anywhere in init (only the toplevel and common-dir reads at
  `SKILL.md:169` and `:278`); `assets/membership.md:126` clones members with a
  plain submodule init — detached by construction (B3).
- **`MERGE_MODEL` today.** Asked once per product (`NR:455-462`); `direct|pr`
  written literally at the `mise.toml` marked position in every repo whose
  env-block file the run lands or replaces (`NR:473-479`); a kept file keeps its
  value (`NR:481-490`; `ER:330-333, 558-563`). Summary `init/SKILL.md:88-110`
  (branches `:93-94`, forge `:100-104`), `:350`, `:417-421`. The marked
  position: `MISE/mise.toml:118-128`. Not mentioned in `vwf-config.md`.
- **The forge pass** (`NR:612-760`): eligibility `:621-627`; precondition
  `:629-645`; default-branch row `develop` preselected `:674-681`; protection
  rules with require-PR under `pr` `:682-690`; idempotence `:691-702`; GitHub
  writes `:700-729` (the `pull_request` rule only under `pr`, `:731-733`);
  GitLab `:735-748`; backlog `:752-760`; `ER:889-911` references it.
- **Readers of `MERGE_MODEL`.** git-workflow
  `plugins/vwf/skills/git-workflow/SKILL.md:31-35`, Step 4 `:186-225` (reads
  `mise env -s bash` `:197-199`, unset → direct; the three options per mode
  `:206-219`); `:61` forbids force-push to main/develop;
  `references/landing.md:21, 34-35, 58-76`. execute hands to git-workflow's Step
  4 (`plugins/vwf/skills/execute/SKILL.md:757-770`); units commit only
  (`:331-332`). The mise skill: `skills/mise/references/task-library.md:164-165`
  (rows), `:487-503` (the merge procedure), `:515-532` (the `MERGE_MODEL`
  section), `:639`.
- **The merge tasks.** `MISE/mise/tasks/_scripts/merge`: `MERGE_MODE`
  `:150-151`; refuse FROM main, INTO main only from develop `:153-164`
  (`CURRENT_BRANCH` via rev-parse `:137-139`); destination must exist locally
  `:172-181`; direct = hop to the main worktree `:190-201`, `git checkout DEST`
  `:273`, `git pull origin DEST --tags` `:283`, a no-ff merge `:295`, a push
  with tags `:305`, restore `:318` — always `--no-ff` (`:17-19`); pr =
  `open_pull_request` `:99-125` (push with upstream `:104`; `gh pr create` with
  base and head `:116`; the `glab mr create` twin `:119`; no merge-method flag),
  dispatch `:258`. `code/merge/develop:21`
  `merge_to_destination_branch develop "$branch"`; `code/merge/main:16`
  `merge_to_destination_branch main develop` (`:9-14` "both branches are
  fixed"). `code/worktrees:15-23` `default_branch()` reads `origin/HEAD`, falls
  back to literal `main` (`:21`).
- **Other literals.**
  `plugins/stackgen/stacks/toolchain-gate/pre-commit/config/.config/pre-commit-config.yaml:161-164`
  `no-commit-to-branch --branch main`; hygiene `config/CONTRIBUTING.md:23-27`
  (feature → develop → main; the hook refuses main), `:30-32` (`MERGE_MODEL`),
  `:34-41` (the forge pass). No `setup:default-branch` task exists.
- **Doctor.** (c) `DOC:375-382` — `show-ref` on `develop` and `main`, either
  missing = drift; (f) `DOC:482-493` — `MERGE_MODEL` absent or not `direct|pr` =
  drift, falls back to direct; (g) `DOC:509-570` — default branch must be
  `develop` or `main` (`:528-535`), protection on both `:536-558` (require-PR
  note under `pr`), backlog `:559+`.
- **`master`/`trunk`.** Zero handling anywhere in `plugins/`; init's table has
  no row; doctor (c)/(g) would flag; the merge tasks refuse (destination
  missing); `worktrees` falls back to `main`.
- **Docs describing today** (U6's): `CLAUDE.md:283-288` (init's git pass),
  `:365-367` ("develop takes the work; main is what users read"), `:126`,
  `:471-473`; `.claude/docs/ci-and-releases.md:44-49, 59-60, 69-77, 102`;
  `site/src/content/docs/plugins/vwf.md:79-80, 197, 783, 1248-1252` (branch
  model), `:1255-1260` (`MERGE_MODEL`), `:1262-1284` (forge pass);
  `site/src/content/docs/plugins/stackgen.md:615, 728, 743-752`.
- **Versions after plan 3**: vwf `19.40.0`, stackgen `1.23.1`, site `1.1.36`;
  mise pack `1.4.1`, hygiene `1.1.3`. Bumps, pins and inventory in one commit
  (U7). Commit types `ops docs merge feat fix refactor`, no scopes. Priority:
  `10 + 30` over the required plan's row → 40.
- This repo's own `.config/mise.toml` carries `MERGE_MODEL` and its
  `.config/mise/tasks/` the old merge scripts — **not** in scope; they follow at
  the next `/vwf:setup reshape`.

## Assumed decisions — confirm or override at review

| # | Decision           | Ruling                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Rejected                             | Unit       |
| - | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ | ---------- |
| 1 | Per-branch landing | Two marked positions replace `MERGE_MODEL` in the mise pack's `mise.toml`: **`MERGE_MODEL_DEVELOP`** (preselected `direct`) and **`MERGE_MODEL_MAIN`** (preselected `pr`), values `direct` or `pr`. Init's git pass asks one row per repo per branch — a two-column table under the existing question. `code:merge:develop` reads the first, `code:merge:main` the second; git-workflow's Step 4 reads the one for its destination; the forge pass writes the require-PR rule per branch from that branch's value; doctor (f) checks both. A repo still carrying `MERGE_MODEL` alone: every reader takes it as both values, and doctor (f) reports "legacy `MERGE_MODEL` — reshape writes the pair" | `MERGE_MODEL` + a `_MAIN` override   | U1, U3, U4 |
| 2 | Branch names       | Fixed: `develop` and `main` (the B53 answer). A repo whose mainline is `master` or `trunk` (or any other name): the git pass creates `main` from that mainline and `develop` from `main`, checks out `develop`, leaves the old branch in place and reports it in the run's summary for the user to retire; the forge default-branch row applies to the new pair                                                                                                                                                                                                                                                                                                                                     | configurable branch names            | U1, U2     |
| 3 | The ops commit     | Lands on **`develop`** in every mode — checked out, or created first from the mainline per decision 2 — never on `main` or another branch; the creation table gains the "checked out: develop" column and loses "as it was"                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | wherever the repo stands             | U1, U2     |
| 4 | Detached member    | Before the git pass, read each member's HEAD (`git symbolic-ref -q HEAD`); a detached member is a **refused plan row** naming the branch to check out (`develop`, or the mainline), the member's shaping is deferred, the base's gitlink for it is not moved; `assets/membership.md`'s clone step checks out the member's default branch after `submodule update --init` so a member cloned by the run is never detached                                                                                                                                                                                                                                                                            | commit on the detached HEAD and warn | U1, U2     |
| 5 | Merge method       | Unchanged — `--no-ff` locally, the forge's default for a PR; B53 was scoped to the landing model                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | squash / rebase knobs                | —          |
| 6 | `code:worktrees`   | `default_branch()` keeps reading `origin/HEAD`; the literal fallback stays `main`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | fallback to develop                  | U3         |
| 7 | Review row         | `_scripts/merge`, `code/merge/develop`, `code/merge/main` and `code/worktrees` are shipped shell → one `Kind: review` row in wave 2 covering U1–U4                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | none                                 | R5         |
| 8 | Pack bumps         | mise `1.4.1` → **`1.5.0`** (two marked positions added, one retired), hygiene `1.1.3` → `1.1.4` (CONTRIBUTING); pins and inventory in U7, one commit                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | per-unit bumps                       | U7         |

## New dependencies

none

## Units

| Id | Wave | Unit file                                                | Kind   | Owns                                                                                                                                                                                                                                                                                                                                         | Depends on     | Status  | Commit   |
| -- | ---- | -------------------------------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | ------- | -------- |
| U1 | 1    | [01-init-git-pass.md](01-init-git-pass.md)               | edit   | `plugins/vwf/skills/init/SKILL.md`, `plugins/vwf/skills/init/references/new-repo.md`                                                                                                                                                                                                                                                         | —              | green   | 655a2219 |
| U2 | 1    | [02-existing-and-members.md](02-existing-and-members.md) | edit   | `plugins/vwf/skills/init/references/existing-repo.md`, `plugins/vwf/assets/membership.md`                                                                                                                                                                                                                                                    | —              | green   | 7c126e56 |
| U3 | 1    | [03-mise-pack.md](03-mise-pack.md)                       | edit   | `plugins/stackgen/stacks/toolchain-manager/mise/config/.config/mise.toml`, `…/mise/config/.config/mise/tasks/_scripts/merge`, `…/tasks/code/merge/develop`, `…/tasks/code/merge/main`, `…/tasks/code/worktrees`, `plugins/stackgen/stacks/toolchain-manager/mise/skills/**`, `plugins/stackgen/stacks/toolchain-manager/mise/conventions.md` | —              | green   | ccbd1980 |
| U4 | 1    | [04-readers.md](04-readers.md)                           | edit   | `plugins/vwf/skills/git-workflow/SKILL.md`, `plugins/vwf/skills/git-workflow/references/landing.md`, `plugins/vwf/skills/doctor/references/stack-checks.md`, `plugins/vwf/skills/doctor/SKILL.md` (widened at R1), `plugins/stackgen/stacks/repo-hygiene/repo-hygiene/config/CONTRIBUTING.md`                                                | —              | green   | a0d3585c |
| R5 | 2    | [05-review.md](05-review.md)                             | review | —                                                                                                                                                                                                                                                                                                                                            | U1, U2, U3, U4 | green   |          |
| U6 | 3    | [06-docs.md](06-docs.md)                                 | edit   | `readme.md`, `CLAUDE.md`, `.claude/docs/**`, `.claude/skills/vwf-plugin/**`, `.claude/skills/stackgen-plugin/**`, `site/src/content/docs/**`, `docs/memory/decisions/2026-09-20-branch-model.md`                                                                                                                                             | R5             | pending |          |
| U7 | 4    | [07-gates-and-bump.md](07-gates-and-bump.md)             | edit   | `…/mise/pack.yaml`, `…/repo-hygiene/repo-hygiene/pack.yaml`, `plugins/stackgen/stacks/bundles/mise.md`, `bundles/repo-hygiene.md`, `plugins/stackgen/stacks/inventory.md`, the two `plugin.json`, `site/package.json`, `.claude-plugin/marketplace.json`                                                                                     | U6             | pending |          |

Status is one of `pending`, `running`, `green`, `failed`, `unresolved`,
`skipped`. U1–U4, U6, U7 are `edit`; R5 is the review row — it runs the two
engines and the two reviewers over the delta since the branch base, covers U1–U4
through Depends on, and sits strictly later than each.

## Shared-file rule

| File                                                                                         | Why it collides                                     | Owner   |
| -------------------------------------------------------------------------------------------- | --------------------------------------------------- | ------- |
| the two `pack.yaml`, the two bundle files, `inventory.md`                                    | the generator refuses a pin without its pack        | U7 only |
| the two `plugin.json`, `site/package.json`, `.claude-plugin/marketplace.json`                | version and generated files                         | U7 only |
| every human-facing doc — `readme.md`, `CLAUDE.md`, `.claude/**`, `site/**`, `docs/memory/**` | n units editing one doc                             | U6 only |
| `doctor/references/stack-checks.md`                                                          | U1 would describe (f)'s legacy rule; U4 owns doctor | U4 only |
| hygiene `CONTRIBUTING.md`                                                                    | U3 would restate the model; U4 owns the landed file | U4 only |
| `…/mise/skills/**`                                                                           | U4 would cite the task rows; U3 owns the mise prose | U3 only |
| the pre-commit pack's `no-commit-to-branch` line                                             | untouched — names are fixed                         | —       |
| this repo's own `.config/mise.toml`, `.config/mise/tasks/**`                                 | out of scope — the next reshape's                   | —       |

## Waves

- **Wave 1** — U1, U2, U3, U4: four disjoint sets; U1/U2 split init by file and
  cite each other; U4's doctor and git-workflow edits cite U3's task names.
- **Wave 2** — R5.
- **Wave 3** — U6.
- **Wave 4** — U7.

## Wave gate

    mise run p:plugins:marketplace -- --check
    mise run p:plugins:inventory -- --check
    mise run p:plugins:check
    mise run p:plugins:shellcheck
    mise run p:plugins:npm-normalize-test
    mise run code:precommit
    mise run p:site:check

plus the wave review, plus every report read for `UNRESOLVED:`. Every line here
must be green before wave 1.

## After landing

| Step                       | Mode | Notes                                                                                                                                                                   |
| -------------------------- | ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mise run p:plugins:local` | run  | stages vwf at `19.41.0+N` and stackgen at `1.24.0+N` into the dev marketplace and updates this machine's install; publishes nothing; a **restarted** session loads them |

## Gates the orchestrator keeps

none beyond the wave gate. The per-branch model is proven by the user's next
`/vwf:setup reshape` on this repo, which rewrites its `MERGE_MODEL` into the
pair and lands the new merge scripts.

## Unit contract

Every unit prompt carries, in order: its ruling quoted from this file, its owned
paths plus "touch nothing outside this list", the facts section, the shared-file
rule, and the return block below. A unit never bumps a version, never runs a
generator, never edits a doc, never adds a dependency this file does not list,
never commits. A unit deletes with plain `rm`, never `git rm` — it stages
nothing.

A unit returns exactly this block and nothing else — no file contents, no diff:

    CHANGED: <path> — <one line>            (one per file)
    DECIDED: <what> — <why>                 (choices made inside scope, or none)
    DOCS FALSIFIED: <path> — <passage>      (reported, never edited; or none)
    GAP: <what the plan left unspecified and the assumption taken>   (or none)
    UNRESOLVED: <the ruling needed>         (or none)

A `GAP:` is a hole in the plan the unit could proceed past on a stated
assumption; it is recorded and the run continues. An `UNRESOLVED:` is a ruling
the unit could not proceed without; it blocks the unit and its dependents.

## Out of scope

- Configurable branch names, and the `no-commit-to-branch --branch main` hook
  line — names are fixed (decision 2).
- The merge method — squash, rebase, fast-forward (decision 5).
- PR requirements beyond require-PR (reviewers, checks) — not in B53's answer.
- This repo's own `.config/mise.toml` and task copies — the next reshape.
- Rendering the branch literals of the packs as values (rest of L14) — plan 5,
  if at all; with names fixed there may be nothing to render.
- A public release — the bumps land; the tags wait for the next `/release`.

## Parked

- Merge method per branch (squash / rebase / merge commit) and PR requirements
  per branch — raised at the B53 scoping question, declined for now; a later
  backlog item if wanted.
- B28 closes when plan 5 lands; B53 closes here. `/vwf:execute`'s `done` at this
  landing marks both — B28 may need moving back to `Backlog` by hand.

## Gaps surfaced during execution

- **Oscillation (convergence guard, R5 round 3)** — the R5 review loop did not
  converge: 8 → 4 → 7 findings across three rounds, each round's set fully
  resolved and a new set raised on the next reading of the same init prose. The
  diagnosis is the loop, not the plan's rulings. Seven findings recorded
  `contested`, none security: (1) `membership.md` step 3's remote-tip checkout
  is right for init alone — plan/execute/doctor/verify need the branch at the
  recorded commit, and the step's "deferred row" wording is init's; (2)
  `new-repo.md` §11(b) stages only the pointers of members that committed — a
  member cloned at the tip that commits nothing leaves a moved, unstaged
  gitlink; (3) an existing repo with an unborn HEAD takes neither §1's `develop`
  nor (b)'s branch work and commits on `master` — one line,
  `git symbolic-ref HEAD refs/heads/develop` before the commit; (4) no
  `git fetch` before reading `origin/develop`/`origin/main`; (5) §7's header
  still counts nine positions; (6) §1 still says §11 creates branches after the
  commit question; (7) on an existing repo the `develop` checkout precedes (c)'s
  consent, so leave-it still switches the branch — unsaid in the plan row. Full
  text: `engine/R5-3.review.log`, mempalace `problems` tag `R5/review/3`.
- **Late re-run GAPs (R5-late1 round 1)** — four LOW, none fixed here: (1)
  `new-repo.md` §11(b)'s `develop` checkout can re-pin a cloned member sideways
  when the base records a `--no-ff` `main` merge commit that `develop` lacks —
  (b) should keep membership's branch or defer; (2) the no-remote mainline
  should prefer a local `master`/`trunk` over the current branch, and
  `origin/HEAD` is unset on a `git remote add` repo; (3) doctor (g) is silent
  about a require-PR rule left on a branch later switched to `direct`, which
  refuses every push; (4) doctor reads no script body, so a kept customised
  `_scripts/merge` beside a replaced `mise.toml` is not reported. Full text:
  `engine/R5-late1-1.review.log`, mempalace `problems` tag `R5-late1/review/1`.
- **Late re-run GAPs (R5-late1 round 2)** — three more, none fixed here: (5) the
  survey, the stack read, the hash tests and the `.gitignore` merge run on the
  branch the repo stood on, while the commit lands on `develop` — with `develop`
  ahead of `main` the run surveys one tree and commits on another; the checkout
  belongs before the survey, or a repo not on `develop` is refused like a
  detached one; (6) §11(a)'s "preselected from what that file carries" is read
  after §7's replace landed the pack defaults — §6's splice already read the
  values at survey; carry them; (7) `_scripts/merge`'s `gh pr create` /
  `glab mr create` exit non-zero when the pair's request is already open, so
  `set -e` ends the task at 1 after a successful push — pre-existing, more
  visible now that `pr` is `main`'s default. **Note on decision 4** (not a
  defect): every `git clone --recurse-submodules` and `git submodule update`
  leaves members detached, so a fresh product checkout's first
  `/vwf:setup reshape` meets one refusal per member. Full text:
  `engine/R5-late1-2.review.log`, tag `R5-late1/review/2`.
- **Owns widened at run time (R1)** — `plugins/vwf/skills/doctor/SKILL.md` to
  U4: two `MERGE_MODEL` mentions nobody owned, U6 barred from `plugins/**`.
- **Wave-review residual (R1 round 2, cap)** —
  `mise/skills/mise/references/task-library.md:573` 89-char heading; a heading
  cannot fold.

## Run log

| Wave | Unit                    | Model | Round | Outcome     | Detail                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Commit   |
| ---- | ----------------------- | ----- | ----- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| 0    | preflight               | —     | —     | green       | doctor: mise, graphify CLI 0.9.65, graph in main checkout; no vwf.yaml (plugin repo, not shaped) — noted; edit units only: LSP and conventions skipped; format check skipped (no covers:); all 7 wave-gate lines green on develop @75b85ac8; sequence W1 U1,U2,U3,U4 → W2 R5 → W3 U6 → W4 U7                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | —        |
| 1    | U2 existing-and-members | opus  | 1     | pass        | edit; DECIDED: HEAD read at plan time (refused row before consent); detached base halts; develop checkout at head of git pass before gate-first commit; DOCS FALSIFIED: CLAUDE.md MERGE_MODEL summary, site vwf.md MERGE_MODEL/branch passages; GAP: develop checkout may be refused on a dirty tree — assumed §11(c) leave-it outcome, checkout named as unlock                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | 7c126e56 |
| 1    | U4 readers              | opus  | 1     | pass        | edit; DECIDED: unset fallbacks develop→direct, main→pr in git-workflow Step 4 and doctor (f); one mise env read resolves both with legacy key as shared fallback; DOCS FALSIFIED: none beyond U6's list; GAP: plan does not state the merge tasks' unset fallback per branch — 03-mise-pack.md says both unset → direct, 04-readers.md says main → pr; assumed U3 falls back to pr for main, to be aligned at the wave review                                                                                                                                                                                                                                                                                                                                                                                                                        | a0d3585c |
| 1    | U1 init-git-pass        | opus  | 1     | pass        | edit; DECIDED: (d)'s branch rows run before (c)'s commit on a repo with commits, after on a fresh one; an odd branch beside an existing main/develop takes the existing-branch row; §7 count nine → ten; DOCS FALSIFIED: CLAUDE.md init git-pass paragraph; .claude/skills/vwf-plugin/SKILL.md + references/skills-and-agents.md MERGE_MODEL; site vwf.md, stackgen.md, how-to/greenfield/single-repo.md (single key, "as it was" table); GAP: none                                                                                                                                                                                                                                                                                                                                                                                                  | 655a2219 |
| 1    | U3 mise-pack            | opus  | 1     | pass        | edit; DECIDED: shipped the two positions with values direct/pr, not empty (unit text said empty; decision 1 preselects, an empty MERGE_MODEL_MAIN would silently make main direct);_scripts/merge both-unset → direct; DOCS FALSIFIED: doctor stack-checks.md (f) "three of the five" (U4's), site stackgen.md:711 five positions (U6's); GAP: none                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | ccbd1980 |
| 1    | R1                      | opus  | 1     | findings(6) | wave review; CONTRACT clean; RULINGS: U1 departed from decision 1 (asks per product, not per repo); U3/U4 unset-fallback conflict is plan-internal (03 says both unset → direct; 04 says main → pr) — 03 governs the script, U4 aligns doctor (f) and git-workflow Step 4 to direct; U3's shipped values direct/pr consistent with decision 1, no departure; U1 two 80+ lines new-repo.md:976,988; rule 5: doctor/SKILL.md:176,214 still names MERGE_MODEL, nobody-owned — GAP: orchestrator widened U4's Owns to plugins/vwf/skills/doctor/SKILL.md (sits beside U4's stack-checks.md; U6 is barred from plugins/**)                                                                                                                                                                                                                                |          |
| 1    | U4 readers              | opus  | 2     | pass        | edit (R1 loop-back); git-workflow Step 4 and doctor (f) unset fallback → direct for both destinations, matching_scripts/merge; doctor/SKILL.md (widened) names the pair; round-1 GAP closed                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | a0d3585c |
| 1    | U1 init-git-pass        | opus  | 2     | pass        | edit (R1 loop-back); §11(a) is one row per repo per branch (Repo, Branch, Preselected, Position), report carries each repo's pair; two lines refolded; DECIDED: still one round, asked once by the first repo to reach the pass                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | 655a2219 |
| 1    | R1                      | opus  | 2     | findings(1) | wave review; all six round-1 findings resolved; CONTRACT clean; RULINGS clean; residual (cap): task-library.md:573 [U3] 89-char #### heading — contested, a heading cannot fold; rounds tried 2                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |          |
| 2    | R5                      | opus  | 1     | pass        | security; range 75b85ac8..a0d3585c; engine: no findings (main-based diff too wide, sub-task scoped to the delta); reviewer: no High/Medium, two Low informational — (U1) forge idempotence cannot tighten an earlier ruleset on a later direct→pr flip, no action; (U4) landing.md read_env sed pattern takes literal names only; tag R5/security/1                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | —        |
| 2    | R5                      | opus  | 1     | findings(8) | review; range 75b85ac8..a0d3585c; engine 8 findings, all in range, none dropped; reviewer: HIGH (U1) init's own clone path skips membership.md's checkout — a member init clones arrives detached; HIGH (U2) origin/HEAD checkout moves the member off the recorded gitlink commit; MEDIUM (U1) mainline definition differs new-repo vs existing-repo; MEDIUM (U2/U4) "reshape writes the pair" unreachable for a kept file; LOW (U1) (a) preselection ignores the legacy value; LOW (U2) checkout refusal has a second cause (develop in another worktree); LOW (U1/U2) stage/checkout order; LOW (U1) §7 position numbering; U3 clean; tag R5/review/1; loop-back U1, U2, U4                                                                                                                                                                       | —        |
| 2    | U1 init-git-pass        | opus  | 3     | pass        | edit (R5 r1 loop-back, findings 1,3,4,5,7,8); clone row follows membership.md's full sequence; HEAD read timing stated; mainline = origin/HEAD else current branch; (a) preselects from current pair, else legacy, else defaults; kept legacy file filled by the §7 splice; checkout before staging; §7 numbering fixed                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | 455d8cc9 |
| 2    | U2 existing-and-members | opus  | 2     | pass        | edit (R5 r1 loop-back, findings 2,4,6,7); membership clone lands a branch at the recorded commit (checkout -B), divergence reported never moved; kept legacy file filled into both positions; checkout refusal names both causes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | 9972f25f |
| 2    | U4 readers              | opus  | 3     | pass        | edit (R5 r1 loop-back, finding 4 doctor side); (f) legacy remedy holds on a kept file                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | bfbd3aa9 |
| 2    | R5                      | opus  | 2     | pass        | security; range 75b85ac8..bfbd3aa9; engine: no findings; reviewer: no High/Medium; verified never-detached, never-on-main, mainline from origin/HEAD, kept legacy fill weakens nothing; one new Low (U2) gitlink behind origin branch → stale develop, push refused non-ff, reported by ruling; tag R5/security/2                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | —        |
| 2    | R5                      | opus  | 2     | findings(4) | review; range 75b85ac8..bfbd3aa9; engine 4 findings, all in range; all eight round-1 findings resolved; new: MEDIUM (U2/U1) checkout -B at the recorded commit leaves the member behind its remote tip, (e)'s push rejected non-ff unhandled; MEDIUM (U2/U1) origin/HEAD=main with the gitlink on develop fabricates a local main holding develop work, (d) reads main-only; LOW (U1) "governs eight" vs the fill writing both, splice is a read-only test; LOW (U2) "inside a linked worktree the switch is impossible" is false; guard: 8→4, none resurfaced; tag R5/review/2; loop-back U1, U2                                                                                                                                                                                                                                                    | —        |
| 2    | U1 init-git-pass        | opus  | 4     | pass        | edit (R5 r2 loop-back); (e) rejected-push rule (deferral, never force); (d) creates missing local develop/main from remote-tracking first; §7 splice is a read, the fill writes, kept single key rewritten in place and re-hashed; DECIDED: remote-tracking rule applies only where a remote carries the branch                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | 1e321d27 |
| 2    | U2 existing-and-members | opus  | 3     | pass        | edit (R5 r2 loop-back); membership clone picks the remote branch holding the recorded commit, checks out at its remote tip, gitlink moving forward is expected; divergence → deferred row; existing-repo: local branches from remote-tracking first, refusal cause two reworded (only develop held elsewhere is impossible)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | ee88f359 |
| 2    | R5                      | opus  | 3     | pass        | security; range 75b85ac8..ee88f359; engine: no findings; reviewer: no High/Medium, no new Low; round-2 Low closed by design (tip checkout records nothing unpublished; rejected push is a deferral, never forced); tag R5/security/3                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | —        |
| 2    | R5                      | opus  | 3     | findings(7) | review; range 75b85ac8..ee88f359; engine 7 findings, all in range; all four round-2 findings resolved; 7 new — convergence guard tripped (r1 8 → r2 4 → r3 7: count did not strictly decrease), loop ended, all seven recorded contested (oscillation gap): MEDIUM (U2) membership.md tip checkout is right for init only, plan/execute/doctor/verify need the recorded commit; MEDIUM (U1) (b) stages only pointers of members that committed — a cloned member at the tip that commits nothing leaves an unstaged gitlink; MEDIUM-low (U1) unborn HEAD on an existing repo commits on master, develop never created; LOW (U1/U2) no fetch before reading origin/*; LOW (U1) §7 header still counts nine; LOW (U1) §1 says branches after the commit question; LOW (U2) leave-it still switches to develop, unsaid in the plan row; tag R5/review/3 | —        |
| 2    | R2                      | opus  | 1     | findings(3) | wave review over a0d3585c..ee88f359 (R5's fix commits); CONTRACT clean; RULINGS clean (branch pick develop > main > origin/HEAD aligned with decision 3, noted); (U1) §7 :436-439 still says the pair is written by §11(a) and nowhere else, contradicted by the kept-legacy fill; (U2) membership.md:140 diverged case names no branch, existing-repo.md:1160 deferred row has no unlock; (U1) new-repo.md:720 82-char line; note: 01 edit 1's kept-file wording superseded by R5 r1 finding 4, not a defect                                                                                                                                                                                                                                                                                                                                        | —        |
| 2    | U1 init-git-pass        | opus  | 5     | pass        | edit (R2 loop-back); §7 vs §11(a) ownership of the pair reconciled; refold                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | 66cd3073 |
| 2    | U2 existing-and-members | opus  | 4     | pass        | edit (R2 loop-back); diverged case names its branch; deferred row carries its unlock                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | 7be02ec7 |
| 2    | R2                      | opus  | 2     | pass        | wave review; all three round-1 findings resolved; CONTRACT clean; RULINGS clean; note: diverged-branch order (origin/HEAD > develop > main) differs from the contains-commit pick (develop > main > HEAD), harmless                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | —        |
| 2    | R5                      | opus  | 1     | pass        | security; re-run 1 (R5-late1) over ee88f359..7be02ec7; engine: no findings; reviewer: clean — diverged member deferred, nothing staged or pushed, unlock never a force; tag R5-late1/security/1                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | —        |
| 2    | R5                      | opus  | 1     | findings(1) | review; re-run 1 (R5-late1) over ee88f359..7be02ec7; engine 5 (4 carried-over dropped as already reported by R5); late delta clean; one defect LOW (U1) new-repo.md:935 forge pass's legacy clause unreachable after §7's fill — drop it; (U4) stack-checks.md:508 "through the splice" → "through its fill"; four GAPs recorded: (b) may re-pin a member sideways when develop lacks the recorded main merge commit; no-remote mainline should prefer local master/trunk and origin/HEAD is unset after git remote add; (g) silent on a require-PR rule left on a branch switched to direct; doctor reads no script body; tag R5-late1/review/1; loop-back U1, U4                                                                                                                                                                                   | —        |
| 2    | U1 init-git-pass        | opus  | 6     | pass        | edit (R5-late1 r1 loop-back); forge pass legacy clause dropped                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | 4423477f |
| 2    | U4 readers              | opus  | 4     | pass        | edit (R5-late1 r1 loop-back); (f) "through its fill"                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | e85f2898 |
| 2    | R5                      | opus  | 2     | pass        | security; re-run 1 (R5-late1) over ee88f359..e85f2898; engine: no findings; reviewer clean; tag R5-late1/security/2                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | —        |
| 2    | R5                      | opus  | 2     | pass        | review; re-run 1 (R5-late1) over ee88f359..e85f2898; engine 5 new (4 carried-over dropped); round-1 defect resolved; no new defect in the late delta; GAPs: survey runs on the branch the repo stood on while the commit lands on develop; (a) preselection reads the replaced file after §7 landed the defaults — carry §6's survey values;_scripts/merge gh/glab create exits non-zero when the request already exists (pre-existing, more visible with pr default); decision 4 premise note: every recursive clone leaves members detached, so a fresh checkout's first reshape meets one refusal per member; tag R5-late1/review/2                                                                                                                                                                                                               | —        |
| 2    | R2-late                 | opus  | 1     | pass        | contract review over 7be02ec7..e85f2898; CONTRACT clean; RULINGS clean                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | —        |

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the fresh session's worktree — cut from the integration branch — can see it.

Run in a fresh session:

/vwf:execute docs/plans/2026-09-20-branch-model

or let the queue pick it, by priority:

/vwf:execute next
