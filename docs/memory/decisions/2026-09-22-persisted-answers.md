# Decision — the four conditional answers are recorded in the config, and every caller of the materializer evaluates them

**Date** 2026-09-22 · **Branch** `2026-09-22-persisted-answers` · **Plan**
[`docs/plans/2026-09-22-persisted-answers/`](../../plans/2026-09-22-persisted-answers/index.md)
· **Closes** gaps **G-2** and **G-7** of
[`2026-09-20-pack-intent-rendering`](2026-09-20-pack-intent-rendering.md) — the
two that plan recorded as a follow-up rather than closing itself. **G-6** and
**G-8** of that plan stay open; they are contested checker lows and a design
question, not this plan's. This file **supersedes** that file's G-2/G-7
passages; that file is the historical record and is not edited.

## What was decided before

`conditional:` shipped, and nothing held the answers. `/vwf:init` asked the
editor and the update bot, read the forge from each `origin` and took the
secrets provider from its own question, passed all four to the materializer as
an `answers:` map, and then **forgot them**: `init/SKILL.md:605` said plainly
that nothing about the two new answers was written into the tree and a later run
asked again. So the two callers that arrive afterwards passed nothing.
`/vwf:setup`'s materialize pass composed its invocation with the catalog paths
and a `repo:` line alone, and under the materializer's "an unanswered axis reads
true" rule every conditional path landed there — an architecture-pinned pack's
editor fragments (tsconfig, astro, pnpm, analysis-options, eslint, ruff) landing
in a repo that had answered **no**, gaining `entries:` records and being kept
for ever. `/stackgen:stackgen-sync` mentioned neither `conditional:`, `skipped:`
nor answers, so a path a condition had skipped read to it as a pack file the
repo was missing. A repo whose `origin` appeared after init ran kept skipping
its forge files until somebody remembered a reshape, and no predicate compared a
`skipped[].when` against what the answers read now. A removed or un-pinned pack
left its `skipped:` rows behind, since removal removed exactly the listed
`entries:`, `settings_keys` and `mcp_servers` and nothing else.

## What changed

**`.config/vwf.yaml` gains a top-level `answers:` block, and `config_format`
steps 20 → 21.** `editor` and `secrets` once for the product; `repos:` keyed by
the member path exactly as `enforcement.kept_files` spells one — `.` for the
base — each entry carrying `forge` and `update_bot`. Every key is always present
and `none` is the spelling of no answer, exactly as the map passed to the
materializer spells it. It sits **outside** `enforcement:`, immediately after
it: the answers are not enforcement opt-outs. Nothing converts — no surface
wrote any of the four into the tree before 21 — so the migration adds the block
from the reshape's own answers and there is no old spelling to map.
`blueprint_format` is untouched at 25, the fifth config-only bump after 14, 16,
18 and 20. Neither 13 nor 17 is in play.

**`init` writes it, and it is the third key init owns** beside
`enforcement.kept_files` and `enforcement.editor_keys` — in every mode, as part
of the pass that writes the stub, so the stub is now `config_format` plus the
`enforcement` block plus the `answers` block. The record is written into a
config that already exists as much as into the stub, and the plan carries it as
one row. `answers.editor` and `enforcement.editor_keys` are two different things
in two different blocks and neither reads the other: the first says whether an
editor is in use at all and is what decides whether a fragment lands, the second
says only what the user chose for a settings key the hand section already
carried.

**The three callers each pass a full map.** `/vwf:init`, which asks;
`/vwf:setup`'s materialize pass, which lands a pinned template long after init
ran and now carries `answers:` beside the contract's `repo:` line, reporting the
skips under their own heading as init reports its **Skipped** rows; and
`/stackgen:stackgen-sync`, which evaluates every `conditional:` entry before it
classifies a pack's landing set.

**The forge is read live by every caller.** The recorded value is the record and
the fallback for a repo whose remote cannot be read at all; every caller
re-reads the target repo's `origin` host at run time and passes **that**, so a
repo whose remote appeared after init is evaluated against the forge it actually
has with nobody remembering a reshape. **The one exception to "init is the only
writer"** is this: a caller that finds the live host contradicting the record
rewrites `answers.repos.<path>.forge` — that one value, nothing else — and says
so in its report. It writes no block of its own and no other key in one. Landing
the forge-conditioned files that staleness had skipped is the **reshape's**,
never the pass's, so those files never appear silently mid-pass.

**Sync gains three classifications beside its three.** A path whose condition
reads false and which has no `entries:` record is **skipped (condition)** —
never offered, never reported missing, its `skipped:` row rewritten for that
pack. A path that never landed and whose condition is **now true** is **landable
— condition now true**, offered as a create under the consent line a new pack
file already takes. A **landed** path whose condition has since turned false is
**kept**, reported once and never removed — removing a landed file is the user's
own act, never a side effect of an answer changing.

**A pack's `skipped:` rows live and die with its `entries:`.** Removal drops
them with the rest, so the lockfile never carries the ghost of a pack the repo
no longer runs — a row left behind would go on telling every reader that a path
is intentionally absent for a condition nothing evaluates any more. Dropping a
row removes a claim, never a file: a file sitting at a dropped row's path was
always the repo's own.

**Doctor gains rows and keeps the one it presumed.** Predicate (e) now reads
three rows from the config rather than the lockfile: a recorded
`answers.repos.<repo>.forge` the live `origin` host contradicts, or a `skipped:`
row whose `when: forge` it contradicts; a config stamped `config_format` 21 that
carries no `answers:` block at all; and the provider ignore-section row the
previous plan added, which now reads `answers.secrets` — the key it presumed and
that did not exist. A repo with **no** remote is neither forge row: there is
nothing live to contradict. A config stamped **20** is not predicate (e)'s
business — §2's stamp comparison already reports the format drift.

**A format-20 config is not a refusal.** A caller that finds no `answers:` block
**infers** what init's own seeds would give — the forge from `origin`, the
editor from a `.vscode/` directory or the editor binary, the secrets provider
from the lockfile's pinned provider, the update bot from a renovate or
dependabot file — passes that map and **writes nothing**. The gap degrades to
today's seeds rather than to an empty map, and the block is written on the next
`/vwf:setup reshape`.

**The materializer's default is unchanged.** "An unanswered axis reads true"
stays exactly as it was — but it is now the **fallback** for a caller this
plugin has never met, not the path any of the three above take.

## The alternatives rejected

- **The block under `enforcement:`**, or four flat base-only keys. The answers
  are not opt-outs, and two of the four are per repo.
- **Setup and sync writing all four**, or nobody writing them. One writer keeps
  the record a record; the stale-forge one-value rewrite is the single, narrow
  exception, and it corrects a reading rather than making a decision.
- **Re-evaluating and landing the forge files inside setup's pass**, and its
  mirror, reshape-only with no signal at all. Landing files mid-pass because a
  remote appeared is a surprise; reporting nothing is the bug this plan closes.
  Doctor reports, the reshape lands.
- **Sync reporting only and pointing at the reshape**, and its opposite,
  subtracting a condition-false path silently. The first makes sync useless on
  an answer that changed; the second deletes a file because an answer moved.
- **Inverting the materializer's default to false.** It would silently stop a
  caller nobody here has met from landing what it always landed.
- **Persisting three answers and leaving the editor session-only**, or planning
  backlog **B40** first. One mechanism carries all four and B40 has no date — so
  `answers.editor` is persisted now, and B40 retires it together with the axis
  and `enforcement.editor_keys` when it lands.

## Still out of scope

- **B40 — drop the editor configuration from init.** Parked, with the note
  above.
- **B55 — member repos' gate-config drift** (gap G15 of the shape audit).
- **G-6 and G-8** of `2026-09-20-pack-intent-rendering` — the three contested
  checker lows and the hook-exclude design point. Neither is about answers.
- **A new question.** The four answers were already asked; this plan records
  them and changes no interview round.
- **Persisting any other answer** — the visibility answer and the forge
  default-branch choice are the same shape and stay as they are.
- **A pack, a payload or a pack version.** No file under
  `plugins/stackgen/stacks/` was touched, so no bundle pin and no inventory
  regeneration either.
- **This repo's own `.config/vwf.yaml`.** The behaviour is proven by the next
  `/vwf:setup reshape` here, which writes the block and steps the stamp to 21,
  and by an architecture pin taken after an editor **no**.

## Gaps surfaced during execution

- **G1 (U4)** — the plan cited `stackgen-sync/SKILL.md:106-118` as the removal
  path that should drop a removed pack's `skipped:` rows, but that range is the
  **local-plugin** removal by subtraction, unrelated to lockfile rows. The rule
  was written into step 6, apply-and-commit, where lockfile entries are
  rewritten; step 4 was left untouched.
- **G2 (U1)** — the plan did not say where the block sits. Placed immediately
  after `enforcement:`, ahead of `pipeline:`, so the two init-written blocks are
  adjacent.
