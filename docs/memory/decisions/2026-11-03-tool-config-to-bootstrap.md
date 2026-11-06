# Decision — vwf's callers move onto bootstrap, and `stackgen:tool-config` is deleted

DECISION 2026-11-03 ★5 | plugin:vwf, plugin:stackgen | repo shape → bootstrap,
init runs its readme prompt, shaped = `.config/bootstrap.toml`, drift =
`setup:configs --dry-run` in explicit runs only | alt adopt-instruction,
drift at every session start rejected

**Date** 2026-11-03 to 2026-11-04 · **Branch** `tool-config-to-bootstrap` ·
**Plan**
`docs/plans/2026-11-03-tool-config-to-bootstrap/`
· **Backlog** B102 (phases 2 and 3), B103

The earlier piece is
[`2026-10-24-packs-hand-off-to-bootstrap.md`](2026-10-24-packs-hand-off-to-bootstrap.md).
`miserc`, `claude-status.json`, `code:count` and `code:check:all` are lost with
the skill, which the user accepted. The plan's own `index.json` holds every
ruling in full.

## What was decided

- **D3, the merge model.** `git-workflow` reads `merge_model` of
  `[branch.<destination>]` from each repository's `.config/bootstrap.toml`. A
  missing file or key is `direct`. The `MERGE_MODEL_*` env reads are deleted.
- **D4, the hand-over.** `init` runs bootstrap's readme prompt, quoted word for
  word. The same prompt brings an adopted repository up to date, so
  `/vwf:setup reshape` reaches it through `init`. `init` drafts no values and
  asks
  none of the questions `docs/sync` asks.
- **D5, what stays in `init`.** The hygiene files, `enforcement.kept_files` and
  the forge pass. The secrets pass, the git landing question, the trust check
  and
  `init/references/tool-configs.md` go.
- **D6, shaped and drift.** Shaped means `.config/bootstrap.toml`. Drift means
  `mise run setup:configs --dry-run` shows a change. A `.config/stackgen.yaml`
  with no such file is the old layout, and `init` deletes it after a green
  adoption.
- **D7, the format.** `config_format` does not change; setup's old-layout
  detection is the migration path.
- **D8, the materialize pass.** It loses every `tool-config` call and reads
  nothing from `.config/stackgen.yaml`.
- **D9, the checker.** Rule 15 is retired with its tests, and rules 16 and 17
  keep
  their numbers: sixteen rules. The `tool-config` walks in `check.ts` are
  removed.
- **D46, when the dry-run runs.** The user reversed D17 and changed D20.
  Doctor's
  `baseline` and `/vwf:recall` are file reads only: no mise task, no bootstrap
  code, and they do not report config drift. The dry-run runs on explicit runs:
  doctor's full mode, setup's Step 0 and `init`'s own reads. Doctor and setup
  state
  that it executes bootstrap's `main` with no pin and that mise's trust gate is
  not
  tied to file content. A request to bootstrap for a reviewed-commit pin is an
  open
  gap of the plan, for the user to hand to bootstrap.

## Reversals

All confirmed by the user (D13). Each record below carries a superseded line.

- `2026-09-26-tool-config`, `2026-09-26-tool-config-gates`,
  `2026-09-27-tool-config-hygiene`,
  `2026-10-01-tool-config-renders-with-a-node-script`,
  `2026-10-01-trust-is-the-users-setup-all-is-tool-configs` and
  `2026-10-05-tool-config-templates` — the skill, its script, its trees and its
  trust rule are gone.
- `2026-10-05-shaped-means-stackgen-yaml`, `2026-10-05-doctor-drift-by-preview`
  and `2026-10-05-stackgen-yaml-replaces-vwf-answers` — by D6.
- `2026-09-20-branch-model`, its `MERGE_MODEL_*` env reads — by D3.
- `2026-09-06-init-owns-the-first-commit` — bootstrap makes the first commit and
  the core branches, and `init` lands through `/vwf:git-workflow` (D14, D37,
  D43).
- `2026-09-10-init-replaces-a-diverged-helper-library`,
  `2026-09-12-init-brownfield-sidecar-and-diverged-files` and
  `2026-09-20-init-brownfield-reads` — `init` keeps only the existing-repo
  passes
  for its own files, and bootstrap's `docs/sync` owns the rest (D24).
- Checker rule 15 — by D9.

## Rejected

- A `bootstrap: adopt` instruction with values drafted by `init`, or reading the
  prompt from the clone at run time (D4).
- The merge-model env variables as a fallback (D3).
- Keeping the secrets pass, which would make two owners of secrets setup;
  dropping
  the forge pass too (D5).
- A `config_format` bump to 26 with a migrate step (D7).
- Renumbering rules 16 and 17 (D9).
- A landing engine of `init`'s own (D37), and `init` creating `develop` and
  `main`
  (D43).
- Keeping the dry-run in `baseline` and recall, and requiring content-tied
  trust,
  which mise does not supply (D46).
