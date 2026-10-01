# W2 — stackgen: sync drops retired lock records; two stale passages

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/skills/stackgen-sync/**`,
  `plugins/stackgen/assets/ids.md`,
  `plugins/stackgen/skills/tool-config/references/mise.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** `stackgen-sync/SKILL.md` whole (its hash states, `:26`,
  `:192-194`); `plugins/stackgen/assets/output-tree.md:355-440` (the lockfile
  shape, read only); `ids.md:80-95`; `tool-config/references/mise.md:505-520`.

## Ruling

> G3 — `stackgen-sync` drops a lock record whose component no longer ships the
> path **and** whose file is absent from the tree — no preview row, said in its
> report. vwf's 21→22 row is unchanged.

> G4 — Remove "a per-repo editor profile" as a `REPO_NAME` reader wherever it is
> named.

> G6 — `TC/references/mise.md:514` reads "which the shipped `setup:all` no
> longer calls".

## Edits

1. `stackgen-sync/SKILL.md` (and any reference under `stackgen-sync/` that lists
   the states): add the case — a recorded path the recording component
   (`component:` or `source:`) no longer ships, and that is absent from the
   tree, is dropped from `entries:` with no row; the run's report says which
   records it dropped. A recorded path the component no longer ships that is
   **present** is not this rule's — leave its existing handling untouched. Name
   the motivating case once: the `.config/vscode.d/*.jsonc` fragments vwf's
   21→22 migration deletes.
2. `ids.md:87` — drop "a per-repo editor profile" from the list of `REPO_NAME`
   readers, keeping the sentence true for the readers that remain.
3. `mise.md:514` — "which `setup:all` no longer calls" → "which the shipped
   `setup:all` no longer calls". Nothing else in the bullet changes.
4. Keep the fold width by hand.

## Verification

- `grep -rn -i 'editor profile' plugins/stackgen` prints nothing.
- `grep -n 'the shipped' plugins/stackgen/skills/tool-config/references/mise.md`
  matches the bullet.
- `mise run p:plugins:check` green.
- The full wave gate.

## Guardrails

- Do not edit `output-tree.md`, the materializer, or any pack; a passage there
  this rule falsifies is a `DOCS FALSIFIED:` / `GAP:` line.
- Delete with `rm`, never `git rm`.

## Commit

`fix: stackgen-sync drops retired lock records; ids and mise passages corrected`
