---
type: vwf-change-plan
title: init keeps a brownfield task library working, and doctor keeps it
  relevant
requires: [ docs/plans/2026-09-12-task-library, docs/plans/2026-09-12-setup-ai ]
---

# Plan — init keeps a brownfield task library working, and doctor keeps it relevant (2026-09-12)

## Status

**BLOCKED at wave 1** — U1 UNRESOLVED: a kept-file record needs a new
enforcement key and a config_format bump; U2 UNRESOLVED: the same ruling; U4, U5
skipped (depend on U1, U2). U3 green at `2fc4c26e`. Worktree
`.worktrees/2026-09-12-init-brownfield`, branch `2026-09-12-init-brownfield`,
started 2026-09-12.

APPROVED 2026-09-12 by the user, after the self-review.

## Consent

| Action                                            | Granted                                                                                                                                                  |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Merge to the integration branch and push on green | yes                                                                                                                                                      |
| After landing: `mise run p:plugins:local`         | run                                                                                                                                                      |
| After landing: `/release`                         | ask                                                                                                                                                      |
| Release vwf publicly                              | minor — `plugins/vwf/.claude-plugin/plugin.json`, one minor step from whatever it holds (expected `19.17.0` → `19.18.0`), by editing the `version` field |
| Release site publicly                             | patch — `mise run p:site:version patch`                                                                                                                  |
| Release stackgen publicly                         | none — no pack changes                                                                                                                                   |
| Release installer publicly                        | none                                                                                                                                                     |

**A release recorded here is intent, not authorisation.** Every release step is
an `ask` step: the run stops once, reports what it would ship, and waits. A
`run` step publishes nothing and cuts no tag; where one stages something this
session already loaded, it is picked up only by a **restarted** session.

## Goal

After this lands, running `/vwf:setup reshape` on a repo that already has a task
library — 95octane is the case in hand — leaves that repo working: helper
functions the repo's own tasks call and the pack's helper does not carry move to
a repo-owned `_scripts/local` sidecar rather than being deferred; tasks the repo
has and no pack ships are kept and listed, with a note when one sits in a group
the contract reserves; a pack-owned file whose bytes have diverged is offered as
replace-or-keep in the single consent plan, with its marked positions re-filled
on replace; and `/vwf:doctor` reports a pack-owned file whose content drifted
from the locked pack version, and the two marked positions plan 1 added, so the
library stays relevant as the project evolves.

The framing, in the user's words: "greenfield projects/repos don't have anything
so byte-to-byte works at start but then init needs to adopt as the project
evolves and must ensure that these tasks are kept relevant", and for
`_scripts/*`: "in brownfield, you have to check whether it breaks any existing
functionality and adopt to the requirements of the repo."

**Two reversals, confirmed by the user 2026-09-12:**

- [`2026-09-10-init-replaces-a-diverged-helper-library`](../../memory/decisions/2026-09-10-init-replaces-a-diverged-helper-library.md)
  (`:35-62,76-95`): the helper is still replaced byte for byte and mapped calls
  rewritten only through the legacy table — that stands. What changes: an
  **unmapped** call is no longer a deferred line; the function moves to
  `_scripts/local`. "Move them to a repo-owned `_scripts/local` sidecar."
- The existing-repo rule that a pack-owned file differing from the pack's is
  "already owned, never overwritten"
  (`plugins/vwf/skills/init/references/existing-repo.md:149-153`): it becomes a
  per-file offer. "Offer replace-or-keep per file, replace re-fills the marked
  positions."

The docs unit writes one decisions doc covering both.

## Facts the survey established

**init today** (`plugins/vwf/skills/init/`): `SKILL.md:43-54` is the hard rule —
writes only what a pack declares plus the marked fills.
`references/existing-repo.md` is the brownfield pipeline, ten passes
(`:12-270`): moves `:16-32` and move-and-shim `:34-67`; readme rename `:69-74`;
renames via the pack's legacy table `:76-90`; deferred shebang flags `:92-102`;
the diverged helper library `:104-141` (byte-compare after rename; replace row
plus one sub-line per retired function; rewrite rows per call site from the
table; **unmapped → deferred** `:132-137`; a pack-owned file byte-identical is
untouched `:139`); creates for missing bundle files `:143-153` with "already
owned, never overwritten" at `:149-153`; project groups `:189-234` and the
`_default` slot `:226-227`; the marked positions checked `:229-234` (plan 1
added `MERGE_MODEL`, `MEMBERS`; plan 2 the two plugin arrays); gate fills
`:236-270`; the plan sections `:272-305`; one consent `:307-315`; apply order
`:317-340`; the report `:381-403`. **There is no rule for a task the repo has
and the pack lacks** — "repo-owned task file" appears once (`:126`) as a rewrite
target only. The legacy table lives in the mise pack:
`plugins/stackgen/stacks/toolchain-manager/mise/skills/mise/references/task-library.md`
§507 "Legacy names" (plan 1 removed the `setup:ai` row on 2026-09-12; the
`_scripts/_helpers` → `_scripts/helpers` row `:525` is what makes 95octane's old
`setup/ai`, which sources `_scripts/_helpers`, a file that references a retired
name).

**doctor today** (`plugins/vwf/skills/doctor/`): the four shape predicates are
`references/stack-checks.md:233-298` — (a) pack versions against
`.claude/stackgen/lock.yaml` `:244-261`; (b) project ids: `tasks/p/<slug>/`,
`commitScopes`, the `setup-<id>` alias, and the reverse "id source changed"
`:263-281`; (c) `develop`/`main` via `git show-ref` `:283-288`; (d) `REPO_NAME`
in `.config/mise.toml` `:290-294`. The summary is `SKILL.md:172-176` and the
one-remedy rule `:203-210`. Harness task names resolve via `mise tasks`
(`references/harness-and-memory.md:8-14`). Nothing compares a pack-owned file's
**content**.

**setup today** (`plugins/vwf/skills/setup/SKILL.md`): Step 0 `:79-108` — the
three slugs in the lockfile plus doctor's four predicates, cited by reference,
never restated; `reshape` `:66-77` skips everything else, invokes `init`, and
stops.

**The config schema** is `plugins/vwf/assets/vwf-config.md` (`config_format`
16); `enforcement:` already carries rule waivers and recorded declines ("a
decline recorded under `enforcement:` is settled and not re-proposed" —
`plugins/vwf/skills/setup/references/workspace-structure.md`). A new key under
it means a `config_format` bump, a lineage row in
`plugins/vwf/skills/setup/references/format-lineage.md`, and a migration step;
that is why ruling 4 forbids inventing one.

**95octane's shape, the verification fixture** (read-only; base repo
`~/Projects/github.com/95octane/95octane/`): `.config/mise/tasks/` carries
`setup/{ai,all,cleanup,doppler,mise,precommit,…}` and
`code/{all,count,format,git-config,lint,precommit,sec,worktrees}`, with
`_scripts/_helpers` (the retired path); `setup/ai` runs the retired
`pnpx @askviraj/ai-plugins` with ten `--project` flags and `--statusline`;
`.config/vwf.yaml` is `config_format` 14, `blueprint_format` 21,
`topology:
polyrepo`; `docs/blueprint/registry.yaml` has seven projects. Its
`.config/` and registry are the scratch copy's source; nothing is ever written
back.

**Gates, checker, commit types:** as plan 1's facts. No stackgen file changes,
so no pack bump, no inventory change. Commit types
`ops docs merge feat fix
refactor`, no scopes.

**Docs describing today's behaviour:** `site/src/content/docs/plugins/vwf.md`
wherever it describes `init`'s existing-repo survey (the "diverged helper"
paragraph, the "already owned" sentence), `/vwf:doctor`'s four predicates, and
`/vwf:setup`'s Step 0; `.claude/skills/vwf-plugin/**` where it summarises doctor
or init; `readme.md` if it lists doctor's checks.

## Assumed decisions — confirm or override at review

| # | Decision              | Ruling                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Rejected                                   | Unit   |
| - | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------ | ------ |
| 1 | The sidecar           | "Move them to a repo-owned `_scripts/local` sidecar." `_scripts/local` is repo-owned, shipped by no pack, and sourced **after** `_scripts/helpers` by each task that needs it. During the helper pass, every function the repo's tasks call that the legacy table does not map is extracted **verbatim** (its whole body) from the repo's old helper into `_scripts/local`, listed by name in the plan as one row each, and each calling task gains one `source "${MISE_PROJECT_ROOT}/.config/mise/tasks/_scripts/local"` line directly after its helpers `source`. Nothing is deferred on this account. A repo that already has `_scripts/local` gets the functions appended, never duplicated. | merge into the pack helper; keep deferring | U1     |
| 2 | Repo-only tasks       | "Keep, list, and flag only contract violations." A task file under `.config/mise/tasks/` that no landed pack ships is kept untouched and listed in the plan under "repo-owned, kept". One under `setup/` or `code/` whose name the task library's mandatory set does not carry gets a report note: the contract reserves those two groups for the shipped set, and the task's home is `p:<id>:*` unless it is a gate every project shares. init never moves or renames it.                                                                                                                                                                                                                       | auto-move; ignore                          | U1     |
| 3 | Diverged pack files   | "Offer replace-or-keep per file, replace re-fills the marked positions." The survey lists every pack-owned file whose bytes differ from the pack's after the rename pass, with a three-line summary (what the repo's version adds, what it lacks, whether it references a retired name). Each is one row in the single consent plan: **replace** (the pack's file lands; every marked position it carries is filled from the interview's confirmed answers, the same way a fresh landing fills them) or **keep** (untouched; recorded per ruling 4). The default is replace when the repo's file references any left-hand name of the legacy table; keep otherwise.                              | always replace; never overwrite            | U1     |
| 4 | Recording a kept file | A kept file is recorded under `enforcement:` in `.config/vwf.yaml` using the **existing** decline shape `assets/vwf-config.md` defines for a settled decline, so doctor does not re-report it and a later reshape does not re-offer it. If no existing shape fits, U1 and U2 return `UNRESOLVED: a kept-file record needs a new enforcement key and a config_format bump` rather than adding one.                                                                                                                                                                                                                                                                                                | invent `enforcement.kept_files`            | U1, U2 |
| 5 | Doctor predicate 5    | "Content drift." For each pack-owned path under `.config/` that the lockfile's packs ship, compare the repo's bytes with the pack's file at the locked version, reached exactly the way predicate (a) reaches the pack's version. A difference is one **warning** naming the file and `/vwf:setup reshape`; a file recorded as kept is skipped. If the adapter offers no way to read the pack's bytes at the locked version, U2 returns `UNRESOLVED: predicate 5 needs the adapter to return a pack file's content`.                                                                                                                                                                             | no doctor change                           | U2     |
| 6 | Doctor predicate 6    | `MERGE_MODEL` absent from `.config/mise.toml`'s env block or not one of `direct`, `pr` → warning; `MEMBERS` absent on a product whose config reads `topology: multi-repo` with `linkage: siblings` → warning. Each names `/vwf:setup reshape` as the remedy, per the one-remedy rule.                                                                                                                                                                                                                                                                                                                                                                                                            | leave parked                               | U2     |
| 7 | Setup Step 0          | Cites predicates 5 and 6 by reference beside the four, never restating them.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | —                                          | U3     |
| 8 | Versions and model    | vwf minor from whatever the file holds; site patch; stackgen and installer none. Every unit on `opus`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | —                                          | U5     |

## New dependencies

none.

## Units

| Id | Wave | Unit file                                    | Owns                                                                                                                                                                                                                                                                                                               | Depends on | Status     | Commit   |
| -- | ---- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------- | ---------- | -------- |
| U1 | 1    | [01-init.md](01-init.md)                     | `plugins/vwf/skills/init/**`                                                                                                                                                                                                                                                                                       | —          | unresolved |          |
| U2 | 1    | [02-doctor.md](02-doctor.md)                 | `plugins/vwf/skills/doctor/**`                                                                                                                                                                                                                                                                                     | —          | unresolved |          |
| U3 | 1    | [03-setup-step0.md](03-setup-step0.md)       | `plugins/vwf/skills/setup/SKILL.md`                                                                                                                                                                                                                                                                                | —          | green      | 2fc4c26e |
| U4 | 2    | [04-docs.md](04-docs.md)                     | `site/src/content/docs/**`, `readme.md`, `CLAUDE.md`, `.claude/docs/**`, `.claude/skills/**`, `docs/memory/decisions/2026-09-12-*.md`, every `DOCS FALSIFIED:` path, plus (widened at run time, conditional on ruling 4) `plugins/vwf/skills/architecture/SKILL.md:378` and `plugins/vwf/assets/vwf-config.md:195` | U1–U3      | skipped    |          |
| U5 | 3    | [05-gates-and-bump.md](05-gates-and-bump.md) | `plugins/vwf/.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `site/package.json`                                                                                                                                                                                                                   | U4         | skipped    |          |

Status is one of `pending`, `running`, `green`, `failed`, `unresolved`,
`skipped`.

## Shared-file rule

| File                                                                                             | Why it collides                                                                        | Owner   |
| ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- | ------- |
| `plugins/vwf/.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `site/package.json` | version and generated files                                                            | U5 only |
| `site/src/content/docs/**`, `readme.md`, `CLAUDE.md`, `.claude/**`                               | human-facing docs                                                                      | U4 only |
| `plugins/vwf/assets/vwf-config.md`                                                               | the config schema — **no unit owns it**; ruling 4 forbids a schema change in this plan | nobody  |

## Waves

- **Wave 1 — U1, U2, U3.** Three disjoint skill trees under
  `plugins/vwf/skills/`.
- **Wave 2 — U4.** Docs, after every `DOCS FALSIFIED:` line is in.
- **Wave 3 — U5.** Version, generated files, full gate.

## Wave gate

```text
mise run p:plugins:marketplace --check
mise run p:plugins:inventory --check
mise run p:plugins:check
mise run p:plugins:shellcheck
mise run p:plugins:npm-normalize-test
pnpm vitest run
pnpm exec tsc --noEmit -p installer
pnpm exec tsc --noEmit -p scripts
mise run p:site:check
```

plus the wave review, plus every report read for `UNRESOLVED:`. Every line must
be green before wave 1. `p:plugins:marketplace --check` is expected to fail
between U5's edit and its regeneration only.

## After landing

| Step                       | Mode | Notes                                                                                                                                                                |
| -------------------------- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mise run p:plugins:local` | run  | stages vwf into this machine's dev marketplace under `X.Y.Z+N` and updates the local install; reaches nothing beyond this machine; loaded by a **restarted** session |
| `/release`                 | ask  | cuts `vwf-v<minor>` and `site-v<patched>`; stops once and asks first                                                                                                 |

## Gates the orchestrator keeps

**Dry-run reshape on a scratch copy of 95octane's shape**, after wave 1 (with
the staged vwf from a restarted session, or by pointing the orchestrator's
`init` invocation at the worktree's skill files) and again before landing:

1. `mkdir` a temp dir; `git init -b develop`; copy, read-only from the source,
   `~/Projects/github.com/95octane/95octane/.config/` and
   `docs/blueprint/registry.yaml` into it (nothing is ever written back to
   95octane); `git add -A && git commit -m "ops: fixture"`.
2. Invoke the `init` skill there through `/vwf:setup reshape` and **decline**
   the consent when the plan is shown.
3. **Pass conditions, read from the plan the skill presents:** it lists
   `_scripts/local` as a create carrying the functions 95octane's `_helpers`
   defines that the pack's `helpers` does not (at minimum the ones the legacy
   table does not map — compare the two files by hand first to know the expected
   names); it lists every 95octane task no pack ships (at minimum
   `setup/cleanup` and `setup/doppler` → note: `setup:doppler` is a legacy-table
   rename, so it is a **rename** row, not a repo-only row — the plan must show
   it as such) under "repo-owned, kept" with the contract note where one sits in
   `setup/` or `code/`; it lists `setup/ai` as a diverged pack file defaulting
   to **replace** because it sources `_scripts/_helpers`; it lists no
   `setup:default-branch` row of any kind; and nothing is applied
   (`git status --short` in the temp dir is empty after the decline).
4. Run `/vwf:doctor` in the same temp dir: it reports predicate 6 warnings for
   `MERGE_MODEL` (absent) and, since the fixture's topology is `polyrepo` under
   `config_format` 14, **no** `MEMBERS` warning; it reports predicate 5 drift
   for at least `setup/ai` and `_scripts/_helpers` if the lockfile exists in the
   fixture — 95octane has no `.claude/stackgen/lock.yaml`, so predicate 5 must
   report "not checked — no lockfile" rather than a false pass or a crash.
   Record which.
5. Remove the temp dir.

## Unit contract

Every unit prompt carries, in order: its ruling quoted from this file, its owned
paths plus "touch nothing outside this list", the facts section, the shared-file
rule, and the return block below. A unit never bumps a version, never runs a
generator, never edits a doc, never adds a dependency this file does not list,
never commits. A unit deletes with plain `rm`, never `git rm` — it stages
nothing.

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

- **Any stackgen pack** — no pack ships or templates `_scripts/local`; no pack
  file changes. The legacy table is read, not edited.
- **A `config_format` bump** — ruling 4 forbids it here; if needed it is its own
  plan (see Parked).
- **Moving or renaming a repo-only task** — init lists and notes; the user
  moves.
- **Running init against 95octane for real** — the fixture is a copy; the real
  reshape is the user's to run after the three plans release.

## Parked

- **The machine-wide task survey** — plan 4: every `.config/mise/tasks/**` under
  `~/Projects/` compared with the contract, to find what the library is missing.
- **A kept-file record that needs a new key** — if U1/U2 return UNRESOLVED on
  ruling 4, the follow-up is a `config_format` 17 plan: the key, the lineage
  row, the setup migration.
- **95octane's own migration** — `config_format` 14 → 16, `polyrepo` →
  `multi-repo` + `linkage`, the registry role/platform remap (the mapping was
  written out in conversation on 2026-09-12: service/worker/common → backend,
  web → frontend/[site], console → backend/[service, webapp] + operator-rbac,
  frontend → frontend/[mobile, auto], devops → system/[iac]); wiki as blueprint
  source material, mkdocs as a `[site]` member only if it ships and then as a
  submodule, `data/` and `secrets-old/` out.

## Run log

| Wave | Unit              | Model | Round | Outcome     | Detail                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Commit   |
| ---- | ----------------- | ----- | ----- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| 0    | preflight         | —     | —     | green       | all nine gate lines green on the branch point (`p:plugins:marketplace --check`, `inventory --check`, `check`, `shellcheck`, `npm-normalize-test`, `vitest` 291 passed, both `tsc`, `p:site:check`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |          |
| 1    | U3                | opus  | 1     | returned    | DECIDED: subject list widened four → six so "six predicates" is not a miscount; checks cited by heading, not restated. DOCS FALSIFIED: CLAUDE.md "on the four baseline predicates". GAP: unit quoted CLAUDE.md wording not in the owned file — assumed SKILL.md's "four predicates … four subjects" was the target, CLAUDE.md left to U4                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |          |
| 1    | R1                | opus  | 1     | findings(5) | RULINGS: U1 departed from #4 — the value shape is the settled-decline one but the key `init/kept-file/<path>` names no catalogued rule (vwf-config.md:106's three namespaces each resolve to a shipped catalog; architecture/SKILL.md:378 asserts every entry names a known rule), so the fallback (UNRESOLVED) applied; U2 departed from #5, defensible — (e)'s path set is every lockfile record outside `.claude/` (root files too), matching output-tree.md:350's `config/` tier; confirm or narrow. Findings: architecture/SKILL.md:378 [U1] docs, nobody owns; vwf-config.md:195 [U1] docs "who writes what" row, nobody owns; doctor stack-checks.md:312 [U2] 113-col line; :315 [U2] (e)'s skip names no key, disagrees with U1; init new-repo.md:411-414 [U1] unauthorised paragraph. CONTRACT: clean                                                                                                                                                  |          |
| 1    | U4                | —     | —     | widened     | GAP: R1 rule-5 findings in nobody-owned files handed to the docs unit as `DOCS FALSIFIED:` — `plugins/vwf/skills/architecture/SKILL.md:378` ("every `enforcement.rules` entry names a known rule") and `plugins/vwf/assets/vwf-config.md:195` (the "who writes what" row lists `setup` / `architecture` as `enforcement`'s writers). Both hinge on ruling 4's answer: if the kept-file record is a new key, both passages are falsified; if init does not write `.config/vwf.yaml`, neither is. Owns widened to those two passages, conditional on that ruling                                                                                                                                                                                                                                                                                                                                                                                                  |          |
| 1    | U2                | opus  | 2     | unresolved  | fixed: (e)/(f) block rewrapped ≤79; (e)'s skip names "the same record `init` writes when it takes that answer". DECIDED: **kept the wider path set** for (e) — every lockfile record landing outside `.claude/` (the `config/` tier per output-tree.md:350), since root files ship through the same tier and the same reshape restores them; narrowing to the literal `.config/` is one word if the user prefers. UNRESOLVED: stands, confirmed by R1                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |          |
| 1    | U1                | opus  | 2     | unresolved  | fixed: kept-file record shape-neutral ("recorded as kept under `enforcement:` in `.config/vwf.yaml`", with a paragraph saying the key is not settled and `enforcement:` ids name catalogued rules, which a path is not); `init/kept-file/<path>` and every `enforcement.rules` claim gone; init-writes-vwf.yaml exception removed from SKILL.md; new-repo.md's added paragraph removed. DECIDED: until the key is ruled on, a keep is fully applied and only the *record* is a Deferred line naming the ruling as its unlock. UNRESOLVED: a kept-file record needs a new enforcement key and a config_format bump                                                                                                                                                                                                                                                                                                                                               |          |
| 1    | R1                | opus  | 2     | pass        | findings 5 → 0; all five round-1 findings resolved (two at source by withdrawing the key). CONTRACT: clean. RULINGS: clean — U1's #4 departure withdrawn; U2's wider (e) path set remains a restated DECIDED for the user                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |          |
| 1    | gate              | —     | —     | green       | all nine gate lines green with wave 1's edits in the tree (U1's and U2's uncommitted); no `UNRESOLVED:` beyond U1's and U2's, which block them                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |          |
| 1    | U3                | opus  | —     | green       | committed alone; U1's and U2's edits stay uncommitted in the worktree as the resume's tie-break                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | 2fc4c26e |
| 2    | U4                | —     | —     | skipped     | depends on U1, U2                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |          |
| 3    | U5                | —     | —     | skipped     | depends on U4                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |          |
| 1    | orchestrator gate | —     | —     | not run     | the 95octane fixture dry-run is deferred to the resumed run — its pass conditions read init's kept-file record, which is the very ruling the run blocks on                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |          |
| 1    | U1                | opus  | 1     | returned    | DECIDED: kept-file record is `enforcement.rules."init/kept-file/<path>": { waived: true, reason }` — the settled-decline shape, whose namespaces are an open "e.g." list, so no bump (contradicts U2's UNRESOLVED — see final report); sidecar `source` line spelled the way the file's helpers source spells it, since the ruling's `${MISE_PROJECT_ROOT}` literal names the toolchain manager; a called function defined nowhere goes to `Rewrites (flagged, not applied)`. DOCS FALSIFIED: vwf.md:911 "ten checks" (now eleven), :933 "eight counted sections" (now ten), :953 "flagged, never rewritten, and deferred" (now moves to `_scripts/local`). GAP: ruling 4 has init write `.config/vwf.yaml`, which SKILL.md reserves to `/vwf:setup` — assumed init writes that one key and never creates the file; on a repo setup has not reached, the record is Deferred with unlock "run `/vwf:setup`, then `/vwf:setup reshape`"                           |          |
| 1    | U2                | opus  | 1     | unresolved  | DECIDED: predicate 5 compares against the lockfile's per-entry `hash:` (pack content at the locked version) not the adapter — (a)'s route reaches only the installed version and would misreport a version-behind pack as a local edit; path set is every lockfile entry landing outside `.claude/` (root files too); `MEMBERS` warns on absent **or empty** under siblings (pack ships it empty). DOCS FALSIFIED: vwf.md:1020-1024, :1048-1052; how-to/brownfield/onboard-existing-codebase.md:84; CLAUDE.md:254; .claude/skills/vwf-plugin/SKILL.md:92, references/dependencies.md:41, references/skills-and-agents.md:26; plugins/vwf/skills/setup/references/onboard-pipeline.md:54 (no unit owns). UNRESOLVED: a kept-file record needs a new enforcement key and a config_format bump — only shape in vwf-config.md is `enforcement.rules.<rule-id>: {waived, reason}` and architecture asserts every entry names a known rule; (e) written shape-neutral |          |

## Launch

Run in a fresh session:

/vwf:change-execute docs/plans/2026-09-12-init-brownfield
