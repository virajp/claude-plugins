---
type: repo-plan
title: init behind setup — the slug is confirmed before it is written,
  /vwf:init
  leaves the slash menu, /vwf:setup is the one door (missing or drifted shape,
  plus an explicit reshape), and the stackgen adapter skills hide with it
requires: [ docs/plans/archived/2026-09-05-astro-static ]
---

# Plan — init behind setup: slug consent, one door, hidden adapter skills (2026-09-06)

## Status

**RUNNING** — started 2026-09-06. Worktree
`.worktrees/2026-09-06-init-behind-setup` on branch
`2026-09-06-init-behind-setup`, cut from `develop` at `d3abc802`.

APPROVED 2026-09-06 by the user, after the self-review.

## Consent

| Action                                       | Granted |
| -------------------------------------------- | ------- |
| Merge to `develop` and push on green run     | yes     |
| Stage locally (`plugins:local`) on green run | yes     |
| Release `vwf` publicly                       | minor   |
| Release `stackgen` publicly                  | patch   |
| Release installer publicly                   | none    |
| Release site publicly                        | none    |

**A release is two stages.** The local one — `mise run plugins:local` — stages
the changed plugins into the dev marketplace and updates this machine's install;
it publishes nothing, so execute-plan runs it without a further prompt and only
reports what it staged. The public one is the tags, and it is what the release
rows above are about: they are intent, and execute-plan stops once before the
`main` merge and the tags and asks, per `CLAUDE.md`. A staged plugin loads only
in a **restarted** session.

vwf `19.13.0` and stackgen `1.2.0` are staged and **untagged**, so the
`vwf-v19.14.0` and `stackgen-v1.2.1` tags ship that content too. The site is
edited (the manual re-routes from `/vwf:init` to `/vwf:setup`) but **not
bumped**: the user's answer was "not this time"; site `1.1.4` stays unreleased
and the next site tag carries both.

## Goal

After this lands, `/vwf:init` shows every detected project id with its slug and
the source it came from, and takes a replacement, **before** any `p:<slug>:*`
task group, commit scope, shell alias or `REPO_NAME` is written. And init is no
longer a command a user types: it leaves the `/` menu, `/vwf:setup` is the one
door — its Step 0 offers init when the shape is **missing or drifted**, and
`/vwf:setup reshape` forces the offer and stops after init — and `/vwf:doctor`
prints `/vwf:setup reshape` as the one repo-shape remedy. The two stackgen
adapter skills, `stackgen-stack-menu` and `stackgen-stack-template`, leave the
menu with it, and checker rule 9 asserts that they stay hidden.

**Framing.** The user's feedback after `/vwf:init`'s first release
(`vwf-v19.13.0`, staged 2026-09-06, untagged), verbatim:

> When detecting the project name to generate `p:<project-name>:*`, take user's
> consent with an option to customize by user

> Disable user invocation of this skill and let it be invoked by `vwf:setup`
> skill. I want to reduce the number of user invocable skills, since there are
> quite a few they are confusion users.

Asked whether the five other called-by-a-skill command skills should hide too,
the user ruled: *"Limit to init, stackgen-stack-menu, stackgen-stack-template
only"*. The three `vwf:import-*` skills are parked.

**Two reversals**, both recorded by the docs unit in one decisions doc:

1. **init is no longer user-invocable.**
   `.claude/skills/vwf-plugin/references/skills-and-agents.md:19` — "User
   **and** model-invocable, for setup's seam" — and the 2026-09-06 decision doc
   `docs/memory/decisions/2026-09-06-init-owns-the-first-commit.md` describe
   `/vwf:init` as a command the user runs (its "When to run it again" section
   tells the user when). Reversed: init is **called-only**, and setup is the
   door.
2. **setup becomes the repo-shape remedy.**
   `plugins/vwf/skills/doctor/references/stack-checks.md:212-215` states
   "`/vwf:setup` is not the remedy: it checks whether the repo is shaped and
   offers `/vwf:init`". Reversed: doctor prints `/vwf:setup reshape`, once, for
   the absent shape and for every §5 drift row.

**Not a reversal.** The 2026-09-06 decision `project-ids-are-slugged.md` keeps:
`plugins/stackgen/assets/ids.md` owns the slug rule and both consumers cite it.
This plan adds a consent *around* the rule and changes nothing *in* it.

## Facts the survey established

**Versions and branch.** vwf `19.13.0`, stackgen `1.2.0`, site `1.1.4` — all
staged locally, none tagged. `develop` is at `d3abc802`, clean.

**init — `plugins/vwf/skills/init/`.**

- `SKILL.md` (257 lines). Frontmatter `:1-13`: `name`, `description` (`:3-8`),
  `argument-hint: "[--new | --existing] [target-dir]"` (`:9`), `model: sonnet`,
  `effort: high`, `disable-model-invocation: false` (`:12`). **There is no
  `user-invocable` key.** Hard rules `:32`; Step 0 mode table `:76-87` (detects
  new vs existing without the flag); the five questions `:123-158` — "Five in
  all" at `:125`, question 1 (repo name, proposed from the target directory's
  basename) at `:130`, "Ask them **before** presenting the plan" at `:157-158`;
  pipeline table `:161-168`; the report `:187`; **When to run it again**
  `:226-257` (four bullets `:235-251`, closing paragraphs `:253-257` hand off to
  the `/vwf:setup` offer).
- `references/` holds **four** files: `new-repo.md` (358), `existing-repo.md`
  (314), `fragments-and-sections.md` (207), `readme-and-license.md` (87).
- `new-repo.md` §7 (`:96-187`) resolves ids by a three-source preference order
  (`:98-104`: registry → directory → the repo's own name) and **slugifies
  silently** at `:113-125`, citing `assets/ids.md` — "Read the asset; never
  re-derive the rule here" (`:125`). The repo-level slug (`REPO_NAME`) is
  derived at `:156-157` from question 1's answer. No confirmation exists. The
  only "confirmed" in the pipeline is the `<HOLDER>` row at `:72`, confirmed via
  the plan.
- `new-repo.md` is §-numbered (`§1` `:12` … `§7` `:96`, `§8` `:189`, `§9`
  `:195`, `§10` `:235`, `§11` `:251`); intra-file back-references at `:17`,
  `:24`, `:30`, `:237`, `:238`, `:240`, `:253`, `:293`. `existing-repo.md` cites
  new-repo §7 at `:134` and `:243`, §11 at `:282`; its own steps are
  `### 1`–`### 10`. Renumbering is not planned; these are the cites to keep true
  if a step is inserted.
- There is no `plugins/vwf/commands/` directory — invocability is the
  frontmatter alone.

**setup — `plugins/vwf/skills/setup/`.**

- `SKILL.md:11` `disable-model-invocation: true` (user-only); no
  `argument-hint`. `:55-59` hard rule "Don't write repo tooling": the shape is
  init's, "Setup checks for it and offers init; it never materializes a bundle
  itself." `:63-68` Step 0 runs before the mode fork; shaped == the adapter
  lockfile records the three unconditional slugs `mise`, `repo-gates`,
  `repo-hygiene`, resolved via `${CLAUDE_PLUGIN_ROOT}/assets/stack-adapter.md`.
  `:70-80` the offer: on a yes, invoke `/vwf:init` and continue when it returns
  — "init is model-invocable for exactly this seam"; a decline is a recorded
  deferral with unlock `/vwf:init, run whenever`; setup never halts on an
  unshaped repo.
- `references/onboard-pipeline.md:50`, `:61`, `:169` carry the deferral terms
  and name `/vwf:init`.

**doctor — `plugins/vwf/skills/doctor/`.**

- `SKILL.md:13` `disable-model-invocation: false`. `:172-178` §9 classifies the
  whole repo-shape check as `drift`, never blocking. `:199-201` the general
  escape hatch nudges `/vwf:setup`. `:202-206` "One remedy, printed once": every
  §5 shape row shares `/vwf:init`, and "re-shaping a repo is `/vwf:init`'s
  consent to take". Doctor **never invokes** init; it prints a line.
- `references/stack-checks.md:202-217`: no `.config/mise*.toml` at all → nudge
  `/vwf:init`; `:212-215` "`/vwf:setup` is not the remedy". `:234-242` "The repo
  shape against its baseline" — four sub-checks, all `drift`, one remedy: (a)
  `:244-262` pack versions from `.claude/stackgen/lock.yaml` `entries:` (no
  lockfile → `missing`, same remedy); (b) `:264-280` project ids → `p/<slug>/`,
  `commitScopes`, `setup-<id>` aliases, incl. the "id source changed" row; (c)
  `:282-287` `develop`/`main`; (d) `:289-293` `REPO_NAME`. `:295-297` closes
  "gives `/vwf:init` once as the remedy, and stops there".
  `harness-and-memory.md` and `code-intelligence.md` name no init remedy.

**The invocation doctrine.** `.claude/skills/vwf-plugin/SKILL.md:132-134` is a
three-row table: user **and** model (`disable-model-invocation: false`), model
only (`user-invocable: false` + `paths:`, auto-applying doctrine), user only
(`disable-model-invocation: true`). No command skill is `user-invocable: false`
today; the key appears only on doctrine skills (`documentation-standards`,
`blueprint-authoring`, `product-foundations`, `design-system-authoring`,
`rest-api-design`) and on this repo's own `.claude/skills/*` (all
`user-invocable: false` + `paths:`). The `user-invocable: false` doctrine skills
**do** appear in the Skill tool's listing, so a hidden skill remains callable by
another skill — the mechanism this plan relies on.

**The adapter skills.** `plugins/stackgen/skills/stackgen-stack-menu/SKILL.md:7`
and `stackgen-stack-template/SKILL.md:10` are `disable-model-invocation: false`;
`stackgen-stack-template/SKILL.md:9` has `argument-hint: "<slug>"`. Each carries
a blockquote ("**`disable-model-invocation` must stay `false`.**", menu `:18`)
explaining why.
`plugins/vwf/skills/import-{design-system,screens,conversations}` have the same
shape and are **out of scope**.

**Rule 9.** `.claude/skills/plugin-authoring/references/checks.md:62-75`;
`scripts/src/check.ts:868-928` asserts the literal line
`disable-model-invocation: false` on both adapter skills of every plugin
keyworded `vwf-stack-adapter`, in both directions. Its comment at `:869-870`
says a `user-invocable: false` skill "would wrongly pass" a mere absence-of-true
test — true of the assertion's design, and unaffected by adding the key beside
the explicit line. Tests are in `scripts/src/check.test.ts`. Rule 8
(`check.ts:792-845`) is the design-adapter twin and is untouched.

**Gates over these trees.** Pre-commit `plugins-check` and `plugins-marketplace`
fire on any `plugins/` path; `linter` (markdownlint) covers `plugins/**/*.md`
except `plugins/vwf/assets/{templates,examples}/`; `plugins/**/*.md` is **not**
dprint-formatted (match the fold width by hand); `CLAUDE.md`, `readme.md`,
`site/**`, `.claude/**` **are**. `plugins:check` also runs
`claude plugin validate --strict` over every plugin
(`.config/mise/tasks/plugins/check:48`). No mise `vwf:*` task exists; init is a
skill, not a task. `plugins:shellcheck` does not reach `plugins/vwf/`.

**Docs that state today's behaviour** (the docs unit's list):

- `readme.md:111` ("run `/vwf:init` before either"), `:253`.
- `CLAUDE.md:153`, `:210` ("`/vwf:init` (the repo-shape orchestrator)"), `:211`,
  `:339` ("run `/vwf:init` before either").
- `.claude/skills/vwf-plugin/SKILL.md:58` (workflow order), `:60-63`, `:76`,
  `:132-134` (the invocation table); `references/skills-and-agents.md:10-12`,
  `:19` (init row), `:20` (setup row), `:32` (doctor row), `:35` (readme row),
  `:66`.
- `.claude/skills/stackgen-plugin/SKILL.md` and `.claude/docs/plugins.md` where
  they describe the two adapter skills' invocation.
- `site/src/content/docs/plugins/vwf.md:722` (command table row), `:770-773`
  (the `### /vwf:init` section opener with the argument grammar), `:927`,
  `:936-937` ("that seam is why `init` is model-invocable"), `:1646`, `:1719`,
  `:1833` (quickstart).
- `site/src/content/docs/plugins/stackgen.md:706-707` ("adapter,
  model-invocable"), `:729`.
- `site/src/content/docs/how-to/greenfield/single-repo.md:50-54`, `:68`, `:85`;
  `multi-repo.md:36`, `:43-44`, `:48`, `:133-134`;
  `brownfield/onboard-existing-codebase.md:84`.
- Other skills and packs that name `/vwf:init`:
  `plugins/vwf/skills/readme/SKILL.md:28`;
  `plugins/stackgen/stacks/toolchain-manager/mise/skills/mise/references/task-library.md:205`,
  `:470`, `:506`;
  `plugins/stackgen/stacks/toolchain-gate/pre-commit/conventions.md:48`;
  `plugins/stackgen/stacks/bundles/mise.md:33` (U5's).

**Dependencies.** None needed; none added. `scripts/` already has vitest.

## Assumed decisions — confirm or override at review

The user's own rulings are quoted in the unit files; this table is the rulings
the planner made.

| # | Decision                                    | Ruling                                                                                                                                                                                                                                                                           | Rejected                                                                                                                                        | Unit       |
| - | ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| 1 | What "called-only" is, in frontmatter       | `user-invocable: false` **and** `disable-model-invocation: false`, with no `paths:`. A fourth row, **skill-invoked**, in the vwf-plugin invocation table: hidden from the `/` menu, reachable by the skill that owns the seam.                                                   | `disable-model-invocation: true` (setup's call would silently no-op); folding init into setup as a reference (the user said "invoked by setup") | U1, U4, U6 |
| 2 | The sixth question's mechanics              | One question after question 1: each detected id, its slug, its source (registry / directory / repo name), the repo's own name → `REPO_NAME`. Accept, or type a replacement; a replacement is slugged by `assets/ids.md` and shown once more only if slugging changed it.         | init restating the slug rule; an editable plan row (init's plan has no revise loop)                                                             | U1         |
| 3 | How Step 0 detects drift                    | Setup **cites** doctor's "The repo shape against its baseline" (`stack-checks.md`) for the four predicates and reads the same artifacts; it restates none of them.                                                                                                               | duplicating the four predicates in setup                                                                                                        | U2         |
| 4 | Doctor's absent-shape remedy                | The `stack-checks.md:202-217` no-mise-config finding prints the same `/vwf:setup reshape` as the §5 rows.                                                                                                                                                                        | a distinct remedy per severity                                                                                                                  | U3         |
| 5 | init mentions in other skills and pack docs | Only a passage that tells a **user to type** `/vwf:init` changes (to `/vwf:setup reshape`, or to setup's offer). "init" as the actor that lays a file down stays — the skill still exists and is still named init.                                                               | renaming init; scrubbing every mention                                                                                                          | U5, U6     |
| 6 | Who owns `checks.md` rule 9 text            | U4, with the rule and its test, so the rule and its doc land in one commit.                                                                                                                                                                                                      | the docs unit                                                                                                                                   | U4         |
| 7 | Argument hints                              | setup gains `argument-hint: "[reshape]"`; init's `argument-hint` line is removed (it has no user to hint). `stackgen-stack-template` keeps its `<slug>` hint — harmless on a hidden skill.                                                                                       | forwarding `[--new \| --existing] [target-dir]` through setup                                                                                   | U1, U2     |
| 8 | The decisions doc                           | One doc, `docs/memory/decisions/<run-date>-init-behind-setup.md`, carrying both reversals, the umbrella link to `2026-09-05-vwf-init-and-the-repo-shape.md`, and the rejected alternatives from this table.                                                                      | two docs                                                                                                                                        | U6         |
| 9 | The rule 9 test                             | Both directions: an adapter skill missing `user-invocable: false` fails; one carrying it beside the explicit `disable-model-invocation: false` passes; a `user-invocable: false` skill **without** the explicit line still fails (the existing assertion is kept, not replaced). | replacing the explicit-line assertion                                                                                                           | U4         |

## New dependencies

none

## Units

| Id | Wave | Unit file                                        | Owns                                                                                                                                                                                                                                         | Depends on | Status  | Commit |
| -- | ---- | ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------- | ------ |
| U1 | 1    | [01-init.md](01-init.md)                         | `plugins/vwf/skills/init/**`                                                                                                                                                                                                                 | —          | green   |        |
| U2 | 1    | [02-setup.md](02-setup.md)                       | `plugins/vwf/skills/setup/**`                                                                                                                                                                                                                | —          | green   |        |
| U3 | 1    | [03-doctor.md](03-doctor.md)                     | `plugins/vwf/skills/doctor/**`                                                                                                                                                                                                               | —          | green   |        |
| U4 | 1    | [04-adapter-contract.md](04-adapter-contract.md) | `plugins/stackgen/skills/stackgen-stack-menu/SKILL.md`, `plugins/stackgen/skills/stackgen-stack-template/SKILL.md`, `scripts/src/check.ts`, `scripts/src/check.test.ts`, `.claude/skills/plugin-authoring/references/checks.md`              | —          | green   |        |
| U5 | 1    | [05-cross-references.md](05-cross-references.md) | `plugins/vwf/skills/readme/SKILL.md`, `plugins/stackgen/stacks/toolchain-manager/mise/skills/mise/references/task-library.md`, `plugins/stackgen/stacks/toolchain-gate/pre-commit/conventions.md`, `plugins/stackgen/stacks/bundles/mise.md` | —          | green   |        |
| U6 | 2    | [06-docs.md](06-docs.md)                         | `readme.md`, `CLAUDE.md`, `site/CLAUDE.md`, `site/src/content/docs/**`, `.claude/docs/**`, `.claude/skills/vwf-plugin/**`, `.claude/skills/stackgen-plugin/**`, `docs/memory/decisions/<run-date>-init-behind-setup.md`                      | U1–U5      | pending |        |
| U7 | 3    | [07-gates-and-bump.md](07-gates-and-bump.md)     | `plugins/vwf/.claude-plugin/plugin.json`, `plugins/stackgen/.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `plugins/stackgen/stacks/inventory.md`                                                                           | U6         | pending |        |

Status is one of `pending`, `running`, `green`, `failed`, `unresolved`,
`skipped`.

## Shared-file rule

| File                                                                                                                                 | Why it collides                                    | Owner                |
| ------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------- | -------------------- |
| `plugins/*/.claude-plugin/plugin.json`                                                                                               | several units bumping one version is a lost update | U7 only              |
| `.claude-plugin/marketplace.json`, `plugins/stackgen/stacks/inventory.md`                                                            | generated; regenerating mid-wave races             | U7 only              |
| `readme.md`, `CLAUDE.md`, `site/CLAUDE.md`, `site/src/content/docs/**`, `.claude/docs/**`, `.claude/skills/{vwf,stackgen}-plugin/**` | n units editing one doc                            | U6 only              |
| `.claude/skills/plugin-authoring/references/checks.md`                                                                               | the rule's doc must land with the rule             | U4 only (decision 6) |
| `plugins/stackgen/assets/ids.md`                                                                                                     | the slug rule; cited by U1, never edited           | nobody — untouched   |
| `docs/memory/decisions/**`                                                                                                           | the reversal record                                | U6 only              |

## Waves

- **Wave 1 — U1, U2, U3, U4, U5.** Five disjoint trees: three vwf skill
  directories, the stackgen adapter skills plus the rule that asserts them, and
  the pack/skill docs that name init. U4 lands `check.ts`'s new assertion and
  the two frontmatters it asserts in one unit, so `plugins:check` never sees
  them apart. No unit edits a doc, a version or a generated file.
- **Wave 2 — U6.** The docs, after every `DOCS FALSIFIED:` line is in; the
  decisions doc for the two reversals.
- **Wave 3 — U7.** The bumps, the generators, the full gate, the real install.

## Wave gate

`mise run plugins:check`, `mise run plugins:marketplace --check`,
`mise run plugins:inventory --check`, `pnpm vitest run`,
`pnpm exec tsc --noEmit -p installer` and `-p scripts`,
`mise run plugins:npm-normalize-test`, `mise run site:check` (U6 owns
`site/src/content/docs/**`), plus the wave review, plus every report read for
`UNRESOLVED:`.

The plan's own checks, run by the orchestrator after wave 1 and again at the
end:

- `grep -c '^user-invocable: false$' plugins/vwf/skills/init/SKILL.md plugins/stackgen/skills/stackgen-stack-menu/SKILL.md plugins/stackgen/skills/stackgen-stack-template/SKILL.md`
  — each `1`.
- `grep -c '^disable-model-invocation: false$'` over the same three — each `1`
  (the explicit line is kept, decision 9).
- `grep -n 'argument-hint' plugins/vwf/skills/init/SKILL.md` — no match.
- `grep -rn '/vwf:init' plugins/vwf/skills/doctor/` — every remaining match is
  in a passage naming init as the actor, none as a command to type; and
  `grep -c '/vwf:setup reshape' plugins/vwf/skills/doctor/SKILL.md` ≥ 1.
- `grep -rn 'run whenever' plugins/vwf/skills/setup/` — the unlock names
  `/vwf:setup reshape`, not `/vwf:init`.

## Gates the orchestrator keeps

- **`target-verifier`**, after U7: a hermetic real install of the marketplace
  from the worktree. Pass: `claude plugin validate --strict` is green for every
  plugin, and the installed copies of `vwf/skills/init/SKILL.md`,
  `stackgen/skills/stackgen-stack-menu/SKILL.md` and
  `stackgen/skills/stackgen-stack-template/SKILL.md` each carry both
  `user-invocable: false` and `disable-model-invocation: false`. What survives
  an uninstall is reported as usual.
- **Not the orchestrator's:** an actual `/vwf:setup` run on a scratch repo needs
  a live session. The user runs it after `plugins:local` in a **restarted**
  session; the handoff for this plan says so.

## Unit contract

Every unit prompt carries, in order: its ruling quoted from this file, its owned
paths plus "touch nothing outside this list", the facts section, the shared-file
rule, and the return block below. A unit never bumps a version, never runs a
generator, never edits a doc, never adds a dependency this file does not list,
never commits. **A unit never runs `git checkout`, `git restore`, `git stash` or
a formatter with `--fix` on a path outside its Owns** — a concurrent unit's work
lives in the same worktree.

A unit returns exactly this block and nothing else — no file contents, no diff:

    CHANGED: <path> — <one line>            (one per file)
    DECIDED: <what> — <why>                 (choices made inside scope, or none)
    DOCS FALSIFIED: <path> — <passage>      (reported, never edited; or none)
    GAP: <what the plan left unspecified and the assumption taken>   (or none)
    UNRESOLVED: <the ruling needed>         (or none)

A `GAP:` is a hole in the plan the unit could proceed past on a stated
assumption; it is recorded and the run continues. An `UNRESOLVED:` is a ruling
the unit could not proceed without; it blocks the unit and its dependents.

## Out of scope

- **Hiding `vwf:import-design-system`, `vwf:import-screens`,
  `vwf:import-conversations`.** The user limited the scope to init and the two
  stackgen adapter skills. Parked below.
- **Forwarding init's `[target-dir]` or mode flag through setup.** The user
  chose "Drop both; init detects mode in cwd". A different directory means
  running setup there.
- **A site release.** "Not this time" — the manual is edited, the site version
  is not bumped.
- **A general checker rule for called-only skills.** Rule 9 extends for the
  adapter skills; init's frontmatter is one skill, not a contract, and is
  asserted by rule 4 and `claude plugin validate` alone.
- **Changing the slug rule or `assets/ids.md`.** The consent wraps the rule; the
  rule does not move.

## Parked

- **The three `vwf:import-*` skills stay user-visible.** They exist only to be
  called by `/vwf:design-system`, `/vwf:screens import` and
  `/vwf:feedback canvas`, and the user's reason for hiding init ("too many user
  invocable skills") applies to them. Rule 8 (`check.ts:792-845`) is the twin of
  the rule 9 change this plan makes, and the design-adapter doctrine at
  `site/src/content/docs/plugins/stackgen.md:194` and `:729` would move with it.
  The user chose not to include them here; the reason was not stated — ask
  before assuming it was only scope.

## Run log

| Wave | Unit      | Model | Round | Outcome     | Detail                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Commit |
| ---- | --------- | ----- | ----- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 0    | preflight | —     | 1     | green       | all 7 gate lines green on `develop` @ `d3abc802` (check, marketplace --check, inventory --check, vitest 271, tsc installer+scripts, npm-normalize 33, site:check)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | —      |
| 1    | U5        | opus  | 1     | green       | no-op: all 6 `/vwf:init` hits in the 4 owned files are actor descriptions (decision 5); DECIDED keep slash notation. GAP: `conventions.md:49` (re-run unnamed) and `bundles/mise.md:33` left as true actor statements — scope call for the reviewer                                                                                                                                                                                                                                                                                                                                                                                                                                           | —      |
| 1    | U2        | opus  | 1     | green       | 2 files. DECIDED: `description` gains a `reshape` clause (beyond decision 7's hint-only); predicates named by subject only, evaluation left to doctor (decision 3); `reshape` is its own section before Step 0. DOCS FALSIFIED: CLAUDE.md:211, skills-and-agents.md:20, site vwf.md setup row+section, doctor stack-checks.md:212-215 (U3's)                                                                                                                                                                                                                                                                                                                                                  | —      |
| 1    | U3        | opus  | 1     | green       | 2 files; "is not the remedy" gone; 5 remaining `/vwf:init` hits are actor/consent mentions. DECIDED: §9 severity block unchanged (names no remedy); harness/code-intelligence refs unchanged. DOCS FALSIFIED: skills-and-agents.md:32, site vwf.md:919,:929. GAP: verification expected a `reshape` hit at the §9 severity block — read the "one remedy" paragraph as that hit                                                                                                                                                                                                                                                                                                                | —      |
| 1    | U4        | opus  | 1     | green       | 5 files; rule 9 gains `user-invocable: false` assertion beside the kept explicit line; tests both directions (scripts 124 pass). DECIDED: key placed right after `disable-model-invocation`; keyword-drop test uses both-keys fixture. DOCS FALSIFIED: site stackgen.md:706-707,:729; stackgen-plugin SKILL.md; vwf-plugin SKILL.md:132-134 (4th row); .claude/docs/plugins.md                                                                                                                                                                                                                                                                                                                | —      |
| 1    | U1        | opus  | 1     | green       | 4 files; six questions (id-confirmation is q2); `argument-hint` removed; `user-invocable: false`; unlocks → `/vwf:setup reshape`; existing-repo pass 9 compares against confirmed ids + "customised id is neither" drift rule. DECIDED: blockquote under H1 (linter); per-question scope markers replace the two group headers; §7's inline slug mechanics dropped (citation only). GAP: `${STACK_ADAPTER_ROOT}` does not exist — cited as "the stack adapter's `assets/ids.md`" like §7 already does. DOCS FALSIFIED: site vwf.md:772,:823,:829,:907,:722,:927,:936-937,:1646,:1719,:1833; vwf-plugin SKILL.md:132-134; skills-and-agents.md:19; readme.md:111,:253; CLAUDE.md:153,:210,:339 | —      |
| 1    | R1        | opus  | 1     | findings(9) | CONTRACT clean; RULINGS clean. U1: readme-and-license.md:31,:50 question numbers stale after renumbering. U2: setup/SKILL.md:87 fold width. Docs unreported (→ U6): repo-shape.md:174 (rule 9 summary), site vwf.md:742 (invocation modes prose), skills-and-agents.md:19, vwf-plugin SKILL.md:73,:76, how-to trio fenced `/vwf:init` (single-repo.md:53, multi-repo.md:43,:133, onboard-existing-codebase.md:84), readme.md:111 / CLAUDE.md:339                                                                                                                                                                                                                                              | —      |
| 1    | U1        | opus  | 2     | green       | readme-and-license.md: licence → q5, security contact → q6, stub names q1/q3 explicitly; tree-wide re-grep clean                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | —      |
| 1    | U2        | opus  | 2     | green       | re-folded setup/SKILL.md Step 0 paragraph and two onboard-pipeline.md paragraphs to 68–79 cols; no wording change                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | —      |
| 1    | R1        | opus  | 2     | findings(1) | CONTRACT clean; RULINGS clean. readme-and-license.md:19 [U1] 4-char widow line "yet." — **contested** (loop capped at two rounds; cosmetic)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | —      |

## Launch

Run in a fresh session:

/execute-plan docs/plans/2026-09-06-init-behind-setup
