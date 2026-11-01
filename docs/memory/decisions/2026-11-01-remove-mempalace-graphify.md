DECISION 2026-11-01 ★5 | plugins:vwf+stackgen | mempalace + graphify → removed —
memory is docs/memory/ files alone, cleanup in doctor §8 + config_format 24 |
alt optional rejected

# Decision — vwf and stackgen drop mempalace and graphify

**Date** 2026-11-01 · **Branch** `remove-mempalace-graphify` · **Plan**
`docs/plans/2026-11-01-remove-mempalace-graphify`

## What changed

Neither plugin needs, ships or names mempalace or graphify any more, except the
cleanup code that finds what they left. vwf's memory is the file store under
`docs/memory/`, and `/vwf:handoff` and `/vwf:recall` work from files only.

- vwf drops its mempalace MCP server, the two auto-save hooks and their test,
  the vendored `mempalace` and `mempalace-recall` skills and
  `vendor/mempalace/`, every agent's palace tool grants, and
  `assets/graphify.md` with every graph query, the execute halt on a missing
  graph and the `code:graph` step after a landing.
- stackgen's `tool-config` drops `.graphifyignore`, the `code:graph` task, the
  `graphify-refresh` hook with the `post-commit` and `post-merge` hook types it
  alone used, the graphify strip code in `setup/precommit`, every
  `graphify-out/` exclude, and the `pipx:graphifyy` and `pipx:mempalace` pins
  and `MEMPALACE_*` variables. python and uv stay, for pre-commit.
- `config_format` moves to **24**. The migrate pipeline offers the `memory:`
  block, each `mempalace.yaml` and each `docs/memory/planning/`, `runs/` and
  `doctor/` folder for removal, one numbered row each, on consent. The stamp
  moves to 24 either way.
- `/vwf:doctor` §8 is now a **Leftovers** table — every file, key and folder the
  two tools left, a `graphify-out/` directory among them, each drift with its
  remedy, never blocking. §7 is a short `docs/memory/` rule with no blocking
  finding.
- The manual's mempalace page and `docs/extras/mempalace-setup.md` are deleted.

## Rulings

- **D1 — Remove completely.** After the change no plugin names mempalace or
  graphify. The one exception is cleanup code: doctor's drift rule for leftovers
  and the `config_format` 24 migration in setup may name the old files and keys.
  Rejected: making them optional; removing only the hard dependency; no cleanup
  naming at all.
- **D2 — handoff and recall stay, files only.** handoff writes only
  `docs/memory/handoff/<name>.md`, named handoffs too; recall reads only that
  file. Rejected: deleting both skills; keeping handoff and deleting recall.
- **D3 — Who cleans a shaped repo.** vwf's own leftovers (the `memory:` key,
  `memory.wing`, each per-tree `mempalace.yaml`) go through the setup migration
  to `config_format` 24, on consent. stackgen `tool-config` stops shipping the
  tool files and has no removal code; bootstrap's repo-sync owns that cleanup
  (its migration M24, or a `remove tools` instruction). doctor reports each
  leftover as drift with its remedy. Rejected: removal rows in tool-config.
- **D4 — The store.** `docs/memory/` is the one store, with four folders:
  `decisions/`, `gaps/` and `problems/` (each `<date>-<slug>.md`) and `handoff/`
  (`<name>.md`). The palace rooms `planning`, `runs` and `doctor` are dropped:
  the plan folder and `docs/plans/index.json` hold the planning record,
  `index.json` and the action log hold the run state, and doctor reports afresh
  on each run. The location rule is the file mirror's (the base repo, in a
  multi-repo product). Rejected: all seven rooms as folders; decisions and
  handoff only; read-only files.

The rest of the plan's rulings (D5 to D20) — agent grants, the graph's other
pieces, the record suffix rule, the recall bound, the migration's shape — are in
the plan folder's `index.json`.

## Reversals

- Of the 2026-08-08 ruling **"mempalace absorbed into vwf"** — the plugin
  dropped, its skills vendored and its auto-save reimplemented in vwf: the
  vendored skills, the server and the hooks are all gone.
- Of the **graphify integration** added after it — the mandatory graph at the
  entry gate, the graph-first protocol, the refresh hook and `.graphifyignore`.
- Of part of the user's first ruling on shaped repos: stackgen `tool-config`
  gets no removal rows; bootstrap owns that cleanup (D3).

The earlier records under `docs/memory/decisions/` that describe the palace —
its wiring, its transport, its room hygiene — stay as history.
