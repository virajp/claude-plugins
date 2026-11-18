# U4 — execute writes release levels through bootstrap config

- **Read first:** `plugins/vwf/skills/execute/references/land.md` (*The
  release-levels write*, about lines 70-95), every other owned file's
  `releases.yaml` passage, and `plugins/vwf/assets/bootstrap-contract.md` (U1).
- **Lazy-load (D19):** the contract plans that U1 cites, and `/Users/virajpatel/Projects/github.com/virajp/bootstrap/docs/design/cli.md` as it is after 4.0.0
  (`config set releases.<p>`: keeps the higher level; `releases.toml`).

## Ruling

This file states each ruling in its final form. The ids point at the
`decisions` list of `index.json`.

- The release levels live in `.config/bootstrap/releases.toml`, read and
  written only through `bootstrap config`. In the land worktree, for each
  entry of the folder's `release_levels` that is not `NONE`, execute runs
  `bootstrap config set releases.<id> <level> --json`, with the worktree as
  the current folder. bootstrap keeps the higher of the old and new level (R1a
  D10). **D34, D36:** before each set, `config get releases.<id> --json` in
  the same worktree gives the "from" level; after it, the same get gives the
  "to" level. A key changed when they differ. This holds at every tip, D32's
  retries included.
- **D5:** before those sets, if `.config/releases.yaml` exists in the
  worktree, execute sets each of its keys that is not `NONE` the same way,
  then deletes the file with `rm`. Then the landing commit carries
  `docs/plans/index.json`, `.config/bootstrap/releases.toml` and the deletion
  of `.config/releases.yaml`, and nothing else.
- **D8, D35:** a failed call stops with the asset's hint; after the merge,
  D25 says how (abandon the worktree, show bootstrap's `errors`, print the hand
  step).
- **D36:** the final report lists each key that D5 moved as "moved from
  `.config/releases.yaml`: `<key>` `<level>`".
- **D21:** execute adds no start check (D38 of
  `docs/memory/decisions/2026-11-12-execute-scripted-start.md` stands).
- **D28:** before the merge, in the run's worktree, run
  `bootstrap config get releases.<id> --json` for each `release_levels` entry.
  It only proves that the contract works (D36). A failure there stops the run before
  the merge, with bootstrap's `errors` text (D16); the normal resume applies.
- **D25, D29:** in the completion worktree, the D5 move and the
  `config set releases.<id> <level> --json` calls run first, before the row
  edit is committed. After each set, `config get releases.<id> --json` gives
  the "to" level; a key changed when "from" and "to" differ. Execute reads no
  field of the set output. If a call fails after the merge, abandon that
  worktree with `land.mjs`, so the partial `releases.toml` goes with it, and
  stop with a hand step: the report prints the exact `config set` lines and
  the completion command.
- **D31:** the D5 move runs whenever `.config/releases.yaml` exists, before
  step 1's early exit for an empty `release_levels` list.
- **D32:** step 6 (a conflict re-opens the write at the new tip) runs the D5
  move and the set calls again; they are safe to repeat.
- Only the release step clears a key; the plugins never unset one.

## Edits

1. **`execute/references/land.md`**: rewrite steps 1 to 6 of *The
   release-levels write* per the ruling, D5 and D31 to D32. Remove the YAML
   header comment of step 4. Add the D28 read to the steps before the merge.
2. **`execute/SKILL.md`** (the state table row, about line 144),
   **`reconcile.md`** (about line 45), **`final-report.md`** (about line 26),
   **`preflight.md`** (about lines 32-37), **`rules.md`** (about line 227):
   `.config/releases.yaml` becomes the release levels in
   `.config/bootstrap/releases.toml`, through `bootstrap config`.
   `land.md` also gets D25 in the steps of the completion write.
3. **`plan-management/references/plan-index.md`** (about lines 294-297): the
   exception names `releases.toml` and the D5 deletion.
4. **`change-plan/references/gates-consent.md`** (about line 62),
   **`plugins/vwf/assets/plan-interview.md`** (about line 179),
   **`plugins/vwf/assets/templates/plan-folder.md`** (about line 408): the same
   name change.

## Verification

- `mise x -- mise run code:format` passes.
- `grep -rnF '.config/releases.yaml'` over the owned files finds only the D5
  move in `land.md`, `final-report.md` and `plan-index.md` (D38).

## Guardrails

- Touch nothing outside the owned paths (paths are under
  `plugins/vwf/skills/` unless named in full).
- Do not change `plan.mjs`, `land.mjs` or any script.
- `plugins/**/*.md` is not formatted by dprint: keep the fold width by hand.
- Delete with `rm`, never `git rm`.

## Commit

`feat: execute writes release levels through bootstrap config`
