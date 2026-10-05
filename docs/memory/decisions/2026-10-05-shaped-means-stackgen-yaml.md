# Decision — a repo is shaped when `.config/stackgen.yaml` holds `format: 1`

**Date** 2026-10-05 · **Branch** `2026-10-05-vwf-callers-on-templates` ·
**Plan**
[`docs/plans/2026-10-05-vwf-callers-on-templates/`](../../plans/2026-10-05-vwf-callers-on-templates/index.md)
(F2, F3, F4, F9) · **Reverses**
[`2026-09-27-tool-config-hygiene.md`](./2026-09-27-tool-config-hygiene.md) item
7 ("Shaped means the `tool-config/*` records are present")

## What was decided before

Since 2026-09-27 a repo counted as shaped when the stack adapter's lockfile held
the `tool-config/<tool>@<version>` records `/stackgen:tool-config all` wrote.
`/vwf:init` picked its mode from the lockfile, `/vwf:setup`'s Step 0 offered
init when the records were missing, and `/vwf:doctor` re-tested each record with
`tool-config check`.

## What changed

Plan 2 made tool-config record nothing in the lockfile: its files are judged
against a fresh render, and its values sit in `.config/stackgen.yaml`, which
only its script writes. Confirmed at the plan's gate on 2026-10-05.

- **Shaped** — `.config/stackgen.yaml` exists with `format: 1`. init, setup's
  Step 0 and doctor all read this one file.
- **Shaped on the old layout** — no `stackgen.yaml`, but
  `.config/mise/conf.d/tools.toml`, `.config/mise/conf.d/env.toml` or a root
  `.config/mise.dev.toml`. Moving such a repo is plan 4's
  (`2026-10-05-reshape-migration`). Until then init names each such repo and its
  evidence and **stops before the plan**, setup names it and stops without an
  init offer, and doctor reports one drift row and raises none of the predicates
  that read `stackgen.yaml`. A leftover `tool-config/*` or
  `repo-hygiene/repo-hygiene` record is the same row.
- **`NODE` (F3)** — init passes `--node true` only where `stackgen.yaml` holds
  no `node` yet, since most repos run node; setup re-derives it after pinning —
  `true` when a pinned pack is node-based — and calls `all --node` when it
  changed.
- **`EXTERNAL` (F4)** — init passes `--external false` the same way; setup sets
  it `true` only when a pinned pack ships a `setup/external/*` task, which none
  does today.
- **init's `all` call (F9)** — `--repo-name`, `--members`,
  `--merge-model-develop`, `--merge-model-main` (defaults `direct`, `pr`),
  `--scopes`, `--node`, `--external`, `--forge`, `--secrets`. `--linkage`,
  `--runtimes` and `--update-bot` are gone, and with `--runtimes` the stack
  read's only job is proposing sub-projects.

## The alternatives rejected

- **A layout probe** — guessing shape from which files happen to exist reads a
  repo's own files as the shipped ones; one file written by one script is
  unambiguous.
- **Reshape an old-layout repo as `source`** — it would land the new layout
  beside the old and leave two configs answering for one tool.
