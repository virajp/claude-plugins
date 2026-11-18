# U3 — doctor, setup and recall read the contract

- **Read first:** every owned file's passages named below, and
  `plugins/vwf/assets/bootstrap-contract.md` (U1).
- **Lazy-load (D19):** the contract plans that U1 cites, and `/Users/virajpatel/Projects/github.com/virajp/bootstrap/docs/design/cli.md` as it is after 4.0.0
  (`check --json`: `{valid, checks: [{name, status, findings}]}`;
  `sync --json --dry-run`: `data.plan.changes`).

## Ruling

This file states each ruling in its final form. The ids point at the
`decisions` list of `index.json`.

- **D4:** every "a repo is shaped when `.config/bootstrap.toml` exists" is the
  shaped test of the contract asset.
- **D6:** doctor calls `bootstrap check --json` and
  `bootstrap sync --json --dry-run` per repo. Each finding of a `fail` check,
  and each item of `data.plan.changes`, is one drift row, never blocking, as
  shape drift is today. Doctor's own reads of the branches and of
  `merge_model`, and its run of `mise run setup:configs --dry-run`, go.
- **D8:** with no contract, doctor reports one blocking finding with the
  install hint, and skips the D6 rows. setup and recall, where they need a
  bootstrap fact, stop with the same hint.
- **D14:** D6 wins for doctor: remove doctor's own branch and `merge_model`
  checks (the two branches, (f) Merge model, and their fix rows), because
  `bootstrap check` validates the branches. Keep the forge rows (the default
  branch, the protection), which R3b owns.
- **D17:** none of these is blocking. If `check` fails before its stages
  (D39: `ok` false and `checks` is `[]`; for `sync`, `data` is `null`), give
  one drift row with the `errors` text. On code 5, give
  one row: "not checked: the clone is stale and offline". A finding with
  severity `warning` is a drift row marked as a warning. A `skipped` stage
  gives no row. The same rules apply to `sync --json --dry-run`.
- **D26:** when the shaped test gives code 2, doctor gives one blocking row
  with the envelope's `errors` text, and skips `check` and `sync` on that
  repo. setup and recall stop with that text (D16).
- **D22:** setup's own no-drift test is: `bootstrap sync --json --dry-run`
  lists no change.
- **D12:** keep every passage that R3c, R4 or R5 owns. A doctor check that D6
  removes is removed whole, with its row in the fix tables.

## Edits

1. **`plugins/vwf/skills/doctor/SKILL.md`**: about lines 56, 66, 86, 217
   (the Covers cell: "whether the repo is shaped (`.config/bootstrap.toml`)",
   "the two branches", "`mise run setup:configs --dry-run`", "the
   `merge_model` values"), 220-230 (the paragraph on what the drift check
   runs), 264, 290, 299, 302 and 344: D4, D6, D8, D14, D26.
2. **`plugins/vwf/skills/doctor/references/stack-checks.md`**: about lines
   395, 455-480 (*The repo shape against its baseline* and its fix table),
   551 (the `docs/sync` remedy: it becomes `bootstrap init` or
   `/vwf:setup reshape`), 567-572 (the `setup:configs --dry-run` run),
   674-677 ((f) Merge model) and 725-726: D4, D6, D14, D17, D20.
3. **`plugins/vwf/skills/setup/SKILL.md`** (about lines 111, 119-121 (D22),
   142, 256),
   **`references/migrate-pipeline.md`** (about line 31) and
   **`references/onboard-pipeline.md`** (about line 52): D4; a repo's answers
   live in `.config/bootstrap/`, read and written through `bootstrap config`.
4. **`plugins/vwf/skills/recall/SKILL.md`** (about lines 83-86): D4; the fix
   text names `bootstrap init` for the old form.
5. **`plugins/vwf/assets/stack-adapter.md`** (about line 486) and
   **`plugins/vwf/assets/vwf-config.md`** (about lines 39, 132, 733): D4, and
   "a repo's answers live in `.config/bootstrap/`, written by the bootstrap
   CLI". Keep the history text of retired formats.

## Verification

- `mise x -- mise run code:format` passes.
- `grep -rnF 'setup:configs --dry-run' plugins/vwf/skills/doctor plugins/vwf/skills/setup`
  finds nothing.

## Guardrails

- Touch nothing outside the owned paths.
- `plugins/vwf/skills/doctor/scripts/` is not owned: `checks.mjs` reads no
  bootstrap file. If a needed change reaches it, return a QUESTION.
- `plugins/**/*.md` is not formatted by dprint: keep the fold width by hand.
- Delete with `rm`, never `git rm`.

## Commit

`feat: doctor, setup and recall read bootstrap through its contract`
