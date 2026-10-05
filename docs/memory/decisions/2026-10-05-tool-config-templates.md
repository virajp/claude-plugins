# Decision — tool-config renders from `assets/` and `templates/`, one marker pair, no lock

**Date** 2026-10-05 · **Branch** `2026-10-05-tool-config-templates` · **Plan**
[`docs/plans/2026-10-05-tool-config-templates/`](../../plans/2026-10-05-tool-config-templates/index.md)
· **Supersedes**
[`2026-10-01-tool-config-renders-with-a-node-script.md`](./2026-10-01-tool-config-renders-with-a-node-script.md)
R1 (assets are working files, no second template tree, `MARKED POSITION`
anchors); [`2026-09-26-tool-config.md`](./2026-09-26-tool-config.md) items 3, 4
and 8 (per-requester blocks, drift by take theirs/keep mine/merge, lock
records); and
[`2026-10-01-script-is-the-source-of-truth.md`](./2026-10-01-script-is-the-source-of-truth.md)
D4, D5 and D7 (the block machinery, the script's `check`, the brownfield
`needs-edit` split)

## What was decided before

On 2026-10-01 the script rendered the mise assets in place: each asset was a
valid working file whose `MARKED POSITION` anchors the script filled, and there
was deliberately no second template tree. Every requester — the base or a pack —
wrote its lines between its own `# >>> <requester>` / `# <<< <requester>`
markers; drift was a block differing from what its requester would write now,
answered take theirs, keep mine or merge; every path landed was a `lock.yaml`
record sourced `tool-config/<tool>@<version>`, which `check` read and doctor
called.

## What changed

The user confirmed the reversal on 2026-10-05: *"yes, confirm all ten"*.

- **T1 — two trees.** `skills/tool-config/assets/` holds static files laid out
  as they land at the repo root, copied as they are;
  `skills/tool-config/templates/` holds files carrying `@@NAME@@`,
  `@@#if NAME@@` and `@@#each NAME@@` tags, rendered by plan 1's engine
  (`lib/template.mjs`) from `.config/stackgen.yaml`. The `MARKED POSITION`
  anchors are gone from tool-config's files.
- **T2 — the values file.** `.config/stackgen.yaml` holds every stored value
  (`repo_name`, `merge_model`, `members`, `scopes`, `node`, `external`, `forge`,
  `secrets`, `packs.<slug>.*`), and the script is its only writer. `REPO_URL`
  and `PROJECT_NAME` derive from `origin` on every render.
- **T3 — four calls.** `all` (the values as flags), `pack --slug --dir --set`,
  `pack-remove --slug` and `upgrade`, each with `preview` and `--answers`.
  Retired: every per-tool verb, `apply-entries`, `check`, `remove --for`,
  `all add-exclude`, `--for`.
- **T4 — one marker pair in six files.** `# >>> tool-config` /
  `# <<< tool-config` (`//` in dprint's JSONC) wrap the rendered lines only in
  `.gitignore`, `.graphifyignore`, dprint's `excludes`, `linter.yaml`'s
  `ignores`, the gitleaks allowlist and the pre-commit global `exclude`. Lines
  outside are the repo's and survive every render. Every other file is owned
  whole.
- **T5 — no lock, no `check`.** A whole-owned file that differs from a fresh
  render is one `write` row, answered `ok` or `keep-existing` for that run
  alone. A template that renders empty is not written, and an existing copy is a
  delete row. Drift is judged by the session from `preview all`.

## Rulings during execution

- **W2** — pre-commit's `check-json` also excludes `.config/dprint.json`, which
  T4's `//` markers make JSONC.
- **W3** — this repo's own `.config/` excludes the template trees and the JSONC
  asset paths from its gates (the user's `ops:` commit, 1b696f49).
- **W7** — `linter.yaml` ships as an asset; the checker's exclusion-set rule
  does not compare its `ignores`.
- **G3** — the slugs `all`, `ai` and `_base` are reserved, and `pack-remove`
  never deletes a path tool-config ships.
- **G4** — a filled `#PLACEHOLDER` slot wins over T5's empty-render delete: a
  hand-filled file is never offered for deletion.

## The alternatives rejected

- **Per-requester blocks kept** — a pack no longer writes lines into a shared
  file (see
  [`2026-10-05-universal-supersets.md`](./2026-10-05-universal-supersets.md)),
  so one requester remains.
- **Lock hashes for whole-owned files** — a record the repo must keep in step is
  drift of its own; a fresh render compared with the file needs none.
- **Callers write `stackgen.yaml` by hand** — two writers is two spellings.
