DECISION 2026-11-06 ★3 | docs/plans/archived | deleted 151 archived plans once,
by the user's word — too many plans, and the durable knowledge now lives in
docs/memory and the backlog | alt keep the 40 plans with an open item rejected
(their items now have records and backlog items)

**Source plan** every plan under `docs/plans/archived/` at commit `e29eef8e`.

The `plan-management` rule "Never delete — archive" stays. This was a one-time
action, and no skill changed. Later landings archive as before, so the folder
fills again.

To read a deleted plan, use the last commit that holds it:

```bash
git ls-tree --name-only e29eef8e docs/plans/archived/
```

```bash
git show e29eef8e:docs/plans/archived/2026-09-16-one-executor/index.md
```

What was done before the deletion:

- 48 records with the date 2026-11-06 hold what the existing records omitted.
  Each one names its source plan. A plan with a record of its own subject, or a
  mechanical plan, got no new record.
- 35 open gaps became backlog items `B115` to `B149`. Each body cites its record
  and its source plan.
- 4 gaps were closed and got no item: `optional_languages`, the stale install,
  plugin flow granularity, and the release target below the manifest.
- 111 markdown links from `docs/memory/` into `docs/plans/` became plain text.
  98 of them were already broken, because their plans had moved to the archive.

Effects that remain:

- `/vwf:change-plan` recall finds no earlier plan in the archive for these
  dates. `docs/memory/` is now the place to look.
- A `requires` entry that names a deleted plan is refused as unresolvable, so a
  new plan must not name one. No row named one at the deletion.
- The prune in `log.mjs` removes a log only when the archived folder exists. So
  the action logs of the deleted plans stay in `~/Library/Caches/vwf/` until a
  person removes them.
- Backlog items `B80`, `B94`, `B101`, `B102`, `B103`, `B108` and `B111` cite
  plan paths as text. Read those plans with the command above.
