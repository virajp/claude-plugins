# Decision — a repo's forge and secrets provider live in its `.config/stackgen.yaml`; vwf.yaml loses `answers:`

**Date** 2026-10-05 · **Branch** `2026-10-05-vwf-callers-on-templates` ·
**Plan**
[`docs/plans/2026-10-05-vwf-callers-on-templates/`](../../plans/2026-10-05-vwf-callers-on-templates/index.md)
(F7, F9) · **Backlog** B80 (pieces) · **Reverses**
[`2026-09-22-persisted-answers.md`](./2026-09-22-persisted-answers.md), *What
changed* (init's answers recorded in a top-level `answers:` block of
`.config/vwf.yaml`)

## What was decided before

On 2026-09-22 `.config/vwf.yaml` gained a top-level `answers:` block
(`config_format` 21): `secrets` once for the product and, per repo, `forge` and
`update_bot`, written by `/vwf:init` alone, so `/vwf:setup`'s materialize pass
and `/stackgen:stackgen-sync` evaluated a pack's `conditional:` files against
the same answers months later. A caller that found the recorded forge stale
rewrote `answers.repos.<path>.forge` in place.

## What changed

Plan 2 of the chain gave every repo a values file, `.config/stackgen.yaml`,
written only by stackgen's `tool-config` script. Keeping a second record of the
same answers in vwf's config would leave two files answering one question.
Confirmed at the plan's gate on 2026-10-05.

- **`answers:` leaves `.config/vwf.yaml`; `config_format` 22 → 23.**
  `answers.secrets` becomes each repo's `secrets`, and
  `answers.repos.<path>.forge` that repo's `forge`, both in that repo's
  `stackgen.yaml`, passed by `/vwf:init` to `/stackgen:tool-config all` as
  `--secrets` and `--forge`. `blueprint_format` stays 25.
- **`update_bot` retires** with the Renovate config it chose
  ([`2026-10-05-renovate-dropped.md`](./2026-10-05-renovate-dropped.md)): init's
  update-bot question goes, so init asks five questions in six rounds.
- **The callers read `stackgen.yaml`.** The materialize pass, `stackgen-sync`
  and the materializer take `forge` and `secrets` from the target repo's own
  file, the forge still re-read live from `origin`. No caller edits the file: a
  stale forge is passed again through `all --forge`, and `/vwf:doctor` reports
  the contradiction as drift.
- **`members:` and `linkage:` stay in `vwf.yaml`.** init passes `--members` from
  them, and doctor checks the base's `stackgen.yaml` `members` agrees.
- **`enforcement.kept_files` is the one key init writes in `vwf.yaml`**, and
  init's stub is `config_format` plus `enforcement`.
- **The 22 → 23 migration is plan 4's** (`2026-10-05-reshape-migration`),
  carried by `/vwf:setup reshape` together with the old-layout move. Until it
  ships, a config at 22 is read with its block ignored.

## The alternatives rejected

- **Keep both records** — two files answering one question drift apart, and only
  one of them is what the templates render from.
- **Migrate in this plan** — the migration also moves old-layout repos onto
  `stackgen.yaml`, which is plan 4's whole subject; splitting it would ship a
  half migration.
