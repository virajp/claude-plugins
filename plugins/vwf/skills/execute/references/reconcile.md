# Reconcile and the fixed final waves

## Reconcile (in the worktree, before the fixed final waves)

Reconcile runs **before** the docs unit's wave, so that unit's delta is complete. The
human docs are the docs unit's, not this step's; this skill runs no docs-sync of its own.

1. **Architecture, environment, harness and implementation stamps — with `covers`**.
   Reconcile per the Reconcile section of `${CLAUDE_PLUGIN_ROOT}/assets/execute-stages.md`:
   - the registry block for any topology change;
   - `environment.md` for any new secret or env var;
   - the `.config/vwf.yaml` `harness:` block for any capability the run added;
   - the **`implementation:` stamp** on each blueprint doc in the plan's `covers` list, the
     single sanctioned blueprint edit (state only, per the stage rules).

   Commit it in the worktree like every other unit. A plan without `covers` skips this step
   whole, said in `stages.reconcile`'s `detail`.
2. **Persist — when the plan has a `code` unit**. Follow `${CLAUDE_PLUGIN_ROOT}/assets/memory.md`
   and its run exception. Write the run's durable decisions as `docs/memory/decisions/` files,
   one record per file, and nothing else. Write them in the worktree, or the base checkout under
   `linkage: siblings`. File no finding, and keep the run's gaps in the folder's `gaps` list alone.
   Skip anything a doc already captures. The `code` pipeline already wrote most per-unit
   decisions, so fill only what is missing here.

   Every `docs/memory/` file the run wrote rides the Reconcile commit. That commit is made for
   this step alone when step 1 was skipped, and under `linkage: siblings` it is the base repo's
   commit, made last. It is the one commit whose paths are no unit's Owns.

   A plan of `edit` units alone has nothing to persist here: an `edit` unit's decisions are in
   its file and its report.
3. **Set `stages.reconcile`**: `running` as step 1 starts, then `state` `green`, or `skipped`
   with its `why`. Its `detail` names what ran and the Reconcile commit's hash, which lets a
   `review` row's commit map exclude it. Log the same as its `row` event. It is set for every
   plan.

## The fixed final waves

The two fixed final units run as their own waves, in this order, and **only when no unit is
skipped**:

1. **The docs unit** invokes `vwf:docs-sync` over the run's branch delta, in its standalone mode,
   `${CLAUDE_PLUGIN_ROOT}/skills/docs-sync/SKILL.md`. It applies its findings, plus every
   `DOCS FALSIFIED:` line the units returned.
2. **The gates unit** runs the generators the plan names, and passes the full wave gate. It bumps
   no version. A release level is recorded at the landing, in `.config/releases.yaml`. The release
   step a person runs bumps the version.

Each runs the wave loop in full: dispatch, wave review, unit gate, wave gate, commit.

Then, before calling the run green, run over the finished tree:

- every line of the folder's `gates.plan` once, or every line of `gates.wave` once more when
  `gates.plan` is empty;
- every entry of `gates.keeps`, its `check` held to its `pass` — the checks a diff cannot prove.

Each is a `run --tier plan` call in the action log. Attribute and handle a red plan gate line as a
red wave gate line is. The gate runs again once its fix is committed.
