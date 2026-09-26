# Decision — mise lock honoured: setup:all installs from the lockfile, --upgrade moves it

**Date** 2026-09-26 · **Branch** `2026-09-26-mise-lock-honoured` · **Plan**
[`docs/plans/2026-09-26-mise-lock-honoured/`](../../plans/2026-09-26-mise-lock-honoured/index.md)
· **Narrows**
[`2026-09-20-pack-first-run-safety.md`](./2026-09-20-pack-first-run-safety.md) —
`setup:all` now passes one flag on · **Backlog** B54, piece one of two (the lock
and upgrade piece; the `.config/mise/conf.d` piece is parked)

## What was decided before

The 2026-09-20 ruling put every state-rewriting step behind a flag and ruled
that `setup:all` passes **none** of them (`--force`, `--update`, `--upgrade`).
The mise pack's `setup:mise` ran a plain `mise install` — no `--locked` — and,
under `--upgrade`, `mise upgrade --local || true` and `dprint config update`.
Nothing ran `mise lock`, and nothing checked the environment. This repo's own
copy of `setup:mise` went further: it ran `mise upgrade --local`, `mise lock`
and `MISE_ENV=ci mise lock` on every run, with no flag.

B54 asked for `mise lock` on every run without `--upgrade`, and `mise upgrade`
with it.

## What changed

The mise pack's `setup:mise`, and this repo's byte-identical copy:

1. **Where `--upgrade` lives.** `setup:all` gains `#USAGE flag "--upgrade"` and
   passes it on to `setup:mise --upgrade` (the pack's copy passes it to every
   member's `setup:all` too; this repo's, which has no members, to `setup:mise`
   alone). Off by default, so a plain bootstrap still rewrites nothing.
2. **`--upgrade` outside dev.** When `,${MISE_ENV:-},` does not contain `,dev,`
   — an unset `MISE_ENV` included — `setup:mise --upgrade` exits 1 before any
   step, naming the reason. The same test `setup:external` uses.
3. **When a lockfile is created.** When no `mise*.lock` sits directly under
   `.config/`: in dev, `mise lock` runs once; outside dev, `setup:mise` exits 1
   before any step, naming the missing lockfile — the pipeline installs what a
   developer committed, or nothing. With a lockfile present, no lock step runs
   unless `--upgrade` is passed.
4. **What `--upgrade` bumps.** `mise lock --bump --upgrade` for the base config
   (`MISE_ENV` empty), then once per `.config/mise.<env>.toml` present (`.local`
   excluded) with that environment selected, `test` as `dev,test` — every
   environment's lockfile moves together. `--upgrade` on `mise lock` is the
   lockfile format upgrade, harmless when current.
5. **Install.** Always `mise install --locked`, after any lock step.
6. **`mise upgrade`** is removed from every task. `dprint config update` stays
   under `--upgrade`, behind its terminal probe.

**This repo's CI** — `.config/mise.ci.toml` now sets `locked = true`, so a
pipeline install reads `mise.lock` and `mise.ci.lock` and fails rather than
resolving. A security finding at review: without it, mise's pre-task
auto-install could write a lock before `setup:mise`'s own check ran.

## The reversals

- **The 2026-09-20 ruling is narrowed.** `setup:all` passes `--upgrade` on when
  the user passes it; `--force` and `--update` stay never passed.
- **B54's wording is corrected by the user:** *"lock file must only be created
  in 2 situations: 1. If the lock files do not exist 2. If `--upgrade` is passed
  and then versions must be upgraded across"* — not `mise lock` on every run.
- **Decision 3 is narrowed at run time.** As approved it created a missing
  lockfile "in any environment"; the review's security finding showed a deleted
  lockfile would then be silently re-resolved in CI. The user chose *"Fail
  outside dev"*: `mise lock` runs only in dev, and elsewhere a missing lockfile
  exits 1.

## The alternatives rejected

- **The flag on `setup:mise` only** — the bootstrap is what a person runs; a
  second command to remember is how lockfiles go stale.
- **Warn and skip `--upgrade` outside dev** — a pipeline asking for an upgrade
  is a mistake worth stopping on, not one to paper over.
- **`mise lock` on every run** (B54's wording) — every run would re-resolve
  "latest" and dirty the tree.
- **Bumping only the active environment's lockfiles** — leaves the others
  installing versions the active one moved past.
- **A new mise task or table test for the lock behaviour** — declined by the
  user; `p:plugins:shellcheck` and a one-off isolated scratch-repo run are the
  proof.

## Still out of scope

- **mise's own pre-task install** writes lockfiles in dev before a task body
  runs, so a fresh dev checkout is locked by mise, not by the task's `mise lock`
  step, and a tool newly added to `mise.dev.toml` is locked on a plain
  `setup:all`; that first lock is host-platform only unless `lockfile_platforms`
  is set, which the pack does not set. Open (plan gap G2).
- **Which lockfiles must exist** — any one `mise*.lock`, a gitignored
  `mise.local.lock` included, counts as present, so a missing committed
  `mise.dev.lock` is not created by the task. Open (G3).
- **An unset `MISE_ENV` is outside dev**, so a fresh repo's bootstrap from a
  shell without `MISE_ENV=dev` fails on the missing lockfile once G2 is ruled.
  Open (G4), adjacent to B67.
- **`plugins.yml`'s `mise x shellcheck@latest shfmt@latest` wrapper** under
  `locked = true` — expected to pass on the linux runner, unproven until CI
  runs. Open (G5).
- **The `.config/mise/conf.d` piece of B54**, init writing and committing
  `mise.lock` (B67), the lock sidecar exclusions (B69), and the doctor hash
  re-record after `--upgrade` (2026-09-20's plan 3).
