# Decision — plans record derived release levels; execute bumps no version

**Date** 2026-10-08 · **Branch** `2026-10-08-release-levels-recorded` · **Plan**
[`docs/plans/2026-10-08-release-levels-recorded/`](../../plans/2026-10-08-release-levels-recorded/index.md)
· **Reverses** ruling 9 of
[`2026-09-17-after-landing-runs-on-recorded-consent.md`](./2026-09-17-after-landing-runs-on-recorded-consent.md),
confirmed again in
[`2026-10-07-plans-carry-every-answer.md`](./2026-10-07-plans-carry-every-answer.md);
override O4 of
[`2026-10-07-execute-all-overrides.md`](./2026-10-07-execute-all-overrides.md);
the release exception in `CLAUDE.md` · **Backlog** B96 (piece 1 of 2)

## What prompted it

A plan asked a release question and could carry a release after-landing step,
recorded `run`, which `/vwf:execute` ran on a green landing; its gates-and-bump
unit bumped each released project's version. Backlog item B96 moves the bump and
the tag to a release step a person runs: each plan now records a derived release
level per project, and the landing raises it in one pending-levels file.

This is plan 1 of 2 for B96. Plan 2 makes this repo's release tasks read the
file.

## The reversals, confirmed by the user on 2026-10-08

1. **Ruling 9 of 2026-09-17** (confirmed 2026-10-07) is reversed. The release
   question is gone, and no plan carries a release after-landing step. A release
   is always a hand step with `/release`.
2. **The exception** in `CLAUDE.md`, the release skill, `installer/CLAUDE.md`
   and `.claude/docs/ci-and-releases.md` — "unless the plan folder records that
   release as `run`" — goes. The rule is now: always ask before a release task.
3. **Override O4** of 2026-10-07 is retired. `/vwf:execute all` no longer asks
   "one release at the end" and no longer writes `hold release:`.
4. **Interview item 18** changes from a question to a stated fact, as item 12
   (priority) is.

## The rulings, with what each rejected

Numbered as in the plan's decisions table.

- **Release steps (D2).** No plan carries a release after-landing step;
  `/release` is always a hand step. Rejected: keeping an optional release step
  at item 17.
- **The file (D3).** `.config/releases.yaml`, one key per project, each `NONE`,
  `PATCH`, `MINOR` or `MAJOR`. An absent key reads `NONE`; an absent file reads
  all `NONE`. Rejected: `docs/releases/pending.yaml`;
  `docs/plans/releases.yaml`.
- **Combine (D4).** The highest level wins: the executor raises a key only when
  the new level is higher and never lowers one, so `PATCH` after `MAJOR` stays
  `MAJOR`. The release tasks (plan 2) clear a key when they release it.
  Rejected: the last write wins.
- **Writer (D5).** `/vwf:execute` writes the file itself, on the integration
  branch after the merge, in the `docs: plan queue — <folder> complete` commit,
  so two concurrent runs cause no merge conflict. Rejected: the gates unit
  writing it on the plan branch; a `plan-management` verb.
- **Record in the folder (D6).** `index.md` carries a fixed-shape
  `## Release levels` table — Project, Level, Reason — after the Consent block,
  one row per project the units touch, `NONE` included; the `Release <project>`
  rows leave the Consent block. Rejected: rows in the Consent block; a
  frontmatter map.
- **Who sets the level (D7).** Interview item 18 is stated, never asked. The
  planner derives each level — breaks users → `MAJOR`, new behaviour → `MINOR`,
  a fix → `PATCH`, no user-visible change → `NONE` — and shows each with its
  reason at the approval gate, where the user may change it. Rejected: asking
  the level, as before.
- **Last unit name (D9).** The last unit is the "gates unit", file
  `NN-gates.md`: it runs the generators the plan names and passes the full wave
  gate, and bumps nothing. Old folders with `NN-gates-and-bump.md` still run,
  since the executor finds the unit by its role. Rejected: keeping the name
  "gates-and-bump".
- **Implicit after-landing commands (D11).** A new optional `.config/vwf.yaml`
  key, `after_landing:`, a hand-edited list of commands `/vwf:execute` runs
  after every green landing, after the plan's own After landing rows, as `run`
  steps; a command the plan also lists runs once. Additive, so `config_format`
  stays 23. Rejected: a post-merge git hook; a `CLAUDE.md` rule.
