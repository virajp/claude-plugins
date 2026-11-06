# §6 — Write the folder

Write `docs/plans/<YYYY-MM-DD>-<kebab-name>/` from
`${CLAUDE_PLUGIN_ROOT}/assets/templates/plan-folder.md`, the one folder shape
both planners write. It owns the file set, every `index.json` key and its
initial value, the creation rule, the `plan.mjs` verbs, the `index.md` sections,
and the unit file shape.

- **`index.json`:** write the keys the template names, in its order. Create it
  once with the Write tool, then run
  `node ${CLAUDE_PLUGIN_ROOT}/skills/plan-management/scripts/plan.mjs validate <folder>/index.json`.
  The Write and its validate are one step. From the first green validate on,
  every change, the self-review's fixes included, is one `plan.mjs` call. To
  move units between waves, from the self-review or the rulings review, use
  `plan.mjs rewave <file> <unit>=<wave>...`; when a unit moves above wave 1,
  first `set` its `waits`. Write `status.detail` as `DRAFT <date>`.
- **`index.md`:** write the template's sections, for the prose only. It has no
  frontmatter, no table `/vwf:execute` reads, and no Run log.
- **`type`** is `vwf-change-plan`. Omit the cycle-only keys, and omit the
  `index.md` sections the template marks *cycle plans only*.
- **`execution`** is `solo` or `teams`, the answer to interview item 10b, with
  its reason in the `decisions` list.

## The backlog lists

`index.json` carries three lists of the `Bnn` ids recalled in §1. Write an empty
one as `[]`.

- `source` names every item this plan was made for. Each also sits on one of the
  other two. It is empty only when no backlog item asked for the plan: work the
  user brought that the backlog does not hold.
- `backlog` names the items this plan finishes. Landing sets them `Done`.
- `backlog_pieces` names the items it lands one piece of. Landing sets them
  `Partially done`.
- No id sits on both `backlog` and `backlog_pieces`. The last plan of a chain
  moves the id to `backlog`.

A fourth list, `gaps_of`, names the landed plan folders whose gaps this plan
takes (interview item 2b). It is `[]` otherwise.

## Rules the plan must obey

These rules come from the plans that came before.

- **One unit, one subagent, one commit** — a unit is stateless and inherits no
  context. Its file carries its ruling quoted from the `decisions` list, its
  verification and its commit line. Its owned paths are its `owns` entry, which
  `/vwf:execute` puts into the dispatch prompt.
- **Every unit is `kind` `edit`** — a change plan has no code unit in this
  release. `/vwf:execute` dispatches the `edit` units of a wave together, in one
  message, and judges them by the wave review. Add a `review` unit only when the
  change lands runnable code, per [review-unit.md](review-unit.md).
- **A unit deletes with plain `rm`, never `git rm`** — a unit stages nothing, so
  no unit's deletion can ride another unit's commit.
- **Fewest waves** — the edit units of one wave run at once, so each needless
  wave is a serial step the run pays for. A unit waits only when it edits a path
  an earlier unit creates or moves, or its Verification needs an earlier unit's
  output. A unit that only reads the same files, or edits a neighbour of another
  unit's files, shares the wave. The fixed final units and a `review` unit keep
  their own waves.
- **Shared-file rule** — any file two units would write is owned by exactly one,
  or by the orchestrator: a `shared_files` entry, its `owner` a unit id or the
  orchestrator. Version files are nobody's, because the release task bumps them.
  Generated files and every doc are always the orchestrator's or the final
  units'. Units in one wave own disjoint paths.
- **Gate deltas are units** — plan a new or altered check, test or task as an
  owned edit, never as "update the gates".
- **`requires` names a folder by its basename** — write it as its
  `docs/plans/<date>-<name>` path as planned. `/vwf:execute` and the plan index
  match the basename alone, so the line is never re-pointed when the folder
  moves to `docs/plans/archived/`.
- **The two last units are fixed** — the docs unit and the gates unit,
  `NN-gates.md`, each per the template's *The two fixed final units*. Nothing
  else touches docs, and no unit bumps a version.
- **Every ruling is a `decisions` entry** — write one entry per ruling you made.
  It is the review surface.
- **Out of scope and Parked are explicit `index.md` sections** — they hold what
  the user declined, with the reason, and what was raised and deferred, so
  `/vwf:execute` never "helpfully" picks either up. What remains of a
  `backlog_pieces` item is a `- Bnn: <piece>` Parked line, at least one per id.
  A `backlog` id has none. `plan.mjs validate` and the executor's preflight both
  refuse a folder that breaks either rule.
