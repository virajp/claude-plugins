# Decision — `/vwf:doctor` finds drift by previewing, not with `check`

**Date** 2026-10-05 · **Branch** `2026-10-05-vwf-callers-on-templates` ·
**Plan**
[`docs/plans/2026-10-05-vwf-callers-on-templates/`](../../plans/2026-10-05-vwf-callers-on-templates/index.md)
(F6, F8, F11) · **Backlog** B80 items 2 and 4

## What was decided before

doctor's content-drift predicate (e) re-tested each `tool-config/…` lockfile
record with `/stackgen:tool-config check`, which rendered what each block's
requester would write now and compared it with the file. The values init filled
— `REPO_NAME`, the merge models, `MEMBERS`, the runtime positions — were marked
positions in `conf.d/env.toml`, spliced out before a pack file counted as
drifted.

## What changed

Plan 2 retired `check` and the marked positions in tool-config's own files:
every universal file and every pack template is rendered from
`.config/stackgen.yaml`, and the script's `preview` returns, without writing,
every file that differs from a fresh render.

- **Drift is a preview (F6).** In each repo carrying `stackgen.yaml`, doctor
  runs `preview all`, then `preview pack --slug <s> --dir <d>` per pack the
  lockfile records. Each returned row is one drift row carrying its diff, and
  doctor says whether it reads as a deliberate local edit or a stale file — a
  judgement, said as such. Lines outside a `tool-config` marker pair are the
  repo's own and never a row. A refused call is one row naming its error. The
  remedy stays `/vwf:setup reshape`.
- **Copied pack files keep the hash test.** A lockfile entry with a `hash:` is
  still compared against the file, a mismatch re-tested with the pack's marked
  positions spliced out; a `rendered: true` entry is the preview's.
- **The values doctor reads** — `repo_name`, `merge_model.develop`,
  `merge_model.main`, `members` — come from `stackgen.yaml`, and the base's
  `members` is compared with `.config/vwf.yaml`'s `members:`.
- **vwf writes no ignore file (F8, B80 item 4).** vwf's lines —
  `docs/memory/{handoff,doctor,runs}/`, `docs/scratchpad/`, `.worktrees/` and
  the graph excludes — sit in tool-config's universal `.gitignore` and
  `.graphifyignore`, inside its markers. setup's memory tree, mockups,
  screen-review and worktree setup stop writing either file; each checks a path
  **inside** the folder (`.worktrees/x`), so a folder that does not exist yet
  still reads as ignored, and stops with `/vwf:setup reshape` as the remedy when
  it is not.
- **init keeps a repo's own lines.** An ignore file with no marker pair is one
  `write` row replacing it whole, so init lists the repo's own lines under the
  row and appends them below the closing marker on `ok`. `.gitattributes` has no
  markers: init appends its own lines to the end on `ok`, and every later
  preview preselects `keep-existing` for that row.
- **B80 item 2 (F11).** doctor's remedy reads
  `MISE_ENV=dev mise run setup:precommit`.

## Open

- **G4** — tool-config's `.gitattributes` asset has no marker pair, so a repo
  whose own lines init appended shows a `write` row on every preview and doctor
  reports it as drift every run. The fix is a marker pair in the asset; no unit
  of this plan owned that file.
- **G5** — `all` folds no root `mise.toml`, so init keeps it and reports it
  under Deferred, and a root `renovate.json` is now an off-allowlist stray on
  every run.

## The alternatives rejected

- **The LLM comparing files by eye** — the script already renders the exact
  file; comparing against anything else is a second, weaker renderer.
- **Keep `check`** — it judged blocks against requesters that no longer exist.
