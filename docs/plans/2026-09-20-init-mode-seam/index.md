---
type: vwf-change-plan
title: init mode seam — three modes from evidence, the stack read, conflicts
  offered in every mode
requires: [ docs/plans/2026-09-20-pack-first-run-safety ]
backlog: [ B28 ]
---

# Plan — init mode seam (2026-09-20)

## Status

**RUNNING**

RUNNING since 2026-09-21 in .worktrees/2026-09-20-init-mode-seam

## Consent

| Action                                            | Granted                                                                                                                                          |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Merge to the integration branch and push on green | yes                                                                                                                                              |
| After landing: `mise run p:plugins:local`         | run                                                                                                                                              |
| Release vwf publicly                              | minor — `19.38.0` → `19.39.0`, a hand edit of `plugins/vwf/.claude-plugin/plugin.json` then `mise run p:plugins:marketplace`; no release step    |
| Release stackgen publicly                         | minor — `1.22.0` → `1.23.0`, a hand edit of `plugins/stackgen/.claude-plugin/plugin.json` then `mise run p:plugins:marketplace`; no release step |
| Release site publicly                             | patch — `1.1.34` → `1.1.35` via `mise run p:site:version`; no release step                                                                       |
| Release installer publicly                        | none — untouched                                                                                                                                 |

**The mode recorded here is the consent.** A `run` step runs on a green landing
without a prompt; an `ask` step stops the run once before it, reports what it
would do, and waits. The mode is the interview's answer (item 17), and a release
step recorded `run` is authorised by the interview's release question (item 18)
— a release recorded `ask`, or with no step at all, is intent, not
authorisation. Where a step stages something this session already loaded, it is
picked up only by a **restarted** session.

## Goal

After this lands, `/vwf:init` decides a repo's mode from what the repo contains
— `blank`, `source` or `shaped` — and never shapes a source-bearing repo as if
it were empty. It learns the stack from the pins, the lockfile or the manifests,
in that order, and drives the `.gitignore` sections and the mise runtime block
from that read instead of from an empty first-run lockfile. "Sub-project
directory" is defined. Every path the materializer reports as a conflict is
offered replace-or-keep and recorded in `kept_files`, in every mode. The
`stacks:` adapter roster init reads is documented in the config schema.

Backlog item B28, piece D2, plan 2 of 5 — candidates 1–4 of
`docs/memory/problems/2026-09-20-init-shape-audit.md`; closes B1, G1, G2, G3,
L5, G7, G8, G10, G13, G14. Requires `2026-09-20-pack-first-run-safety` (the
chain; and this plan bumps the mise pack that plan bumps first).

Not a reversal. The two-marker mode test was never a recorded decision; the
"adopt, not flatten" doctrine
(`2026-09-12-init-brownfield-sidecar-and-diverged-files.md`) is extended to the
new `source` mode, not changed.

## Facts the survey established

Paths: `I` = `plugins/vwf/skills/init`, `S` = `plugins/vwf/skills/setup`, `SG` =
`plugins/stackgen`. Verified at `7aa93dbe`.

- **Mode today.** `I/SKILL.md:183-188` (table: no `.config/` **and** no
  task-library dir → `new`; else `existing`), prose `:190-194`, per-repo
  `:177-181`; "takes no arguments and reads no flag" `:127-129`.
  `I/references/new-repo.md:3-5` restates it ("never a source file");
  `existing-repo.md` does not restate it (`:84` only).
- **Setup's fork.** `S/SKILL.md:168-174`: blank = no package or language
  manifest, no source dirs, no `docs/blueprint/`; README, LICENSE, `.gitignore`,
  `.gitattributes` and tooling configs are "not code"; else the code sub-path.
  Branches in `S/references/onboard-pipeline.md:12` (Blank) and `:85` (Code).
  Init is invoked with no arguments at `S/SKILL.md:75` (reshape) and `:134`
  (Step 0), and is unreachable otherwise (`:62-66`).
- **Materialize pass.** `S/SKILL.md:187-207`, `S/references/materialize.md`;
  reads `.config/vwf.yaml` axes
  `projects.<name>.stack.{template,backing_template,deploy_template}`,
  `repo.stack.template`, `projects.<name>.stylesheet` (`:33-42`), the lockfile
  `.claude/stackgen/lock.yaml` for `entries:` slugs (`:38-42`); writes
  `unresolved` on absent axes and `languages: []` (`:130-161`); never rewrites a
  slug (`:155`). Lockfile schema `SG/assets/output-tree.md:354-380`.
- **Schema gap.** `plugins/vwf/assets/vwf-config.md:41-142` (format 20) has no
  top-level `stacks:`; `:112` says `stacks:` was retired in format 10 — that was
  `enforcement.stacks`. Yet the adapter roster `stacks: [stackgen]` is
  documented at `plugins/vwf/assets/stack-adapter.md:53-59, 171` and read by
  `I/SKILL.md:239-259`, `S/references/topology-detection.md:39`,
  `S/references/workspace-structure.md:92`,
  `SG/skills/stackgen-stack-menu/SKILL.md:6`.
- **Mode new's conflicts.**
  `SG/skills/stackgen-stack-template/references/materializer.md:167-178`: a path
  that exists and is not in this repo's `lock.yaml` is a conflict, never a
  write; the dry-run plan lists them `:180-185`; `output-tree.md:394-396`.
  `new-repo.md` §2 `:60-76` says only that a decline is a deferral — no
  replace/keep, no `kept_files`, no report row anywhere in the file.
  `kept_files` is the existing pipeline's alone.
- **`.gitignore` §5.** `new-repo.md:114-123` (detected stack = lockfile
  components; none pinned → append nothing); the algorithm
  `I/references/fragments-and-sections.md:31-48` (resolve from pinned packs),
  `:49-63` (skip present); the section table
  `SG/stacks/repo-hygiene/repo-hygiene/conventions.md:77-107` (rows `:86-89`).
- **mise.toml.**
  `SG/stacks/toolchain-manager/mise/config/.config/mise.toml:78-89` the runtime
  block ("keep ONLY … delete the rest"); `:143-146` `_.path` commented;
  `:148-159` `[tools]` empty by contract. The pack's
  `skills/mise/references/config-files.md` describes the block.
- **"Sub-project directory".** `I/SKILL.md:295, 298, 321`;
  `new-repo.md:141, 151`;
  `SG …/mise/skills/mise/references/task-library.md:567`; not in
  `SG/assets/ids.md` (`:37-45` is `tasks/p/<dir>` naming). Also
  `site/src/content/docs/plugins/vwf.md:964, 1035, 1038`,
  `how-to/greenfield/single-repo.md:71`, `CLAUDE.md:275`,
  `.claude/skills/vwf-plugin/SKILL.md:118`. Defined nowhere.
- **Registry shape.** `plugins/vwf/assets/templates/registry.yaml:22-54` — the
  project keys are name, role, platforms, path, capabilities, threat_notes,
  depends_on and doc_unit; languages/frameworks live in the config
  (`vwf-config.md:34, 64-72`, under `projects.<name>.stack`); repo location via
  `members[].projects` (`:21-26`). Stack shape `vwf-config.md:57-72`; the three
  axis states `:143-175`; `enforcement.kept_files` / `editor_keys` `:111-115`.
- **Pass 6 today.** `existing-repo.md:271-283` (compare), `:342-356`
  (replace/keep outcomes), `:358-362` (default rule), `:369-374` (summary);
  `kept_files` record `:385-406` (base's config, member paths prefixed, Deferred
  when no config file), apply `:826-838`, `:953`. Summary `I/SKILL.md:476-481`,
  `:70-78`.
- **Already-there rules.** `readme-and-license.md:32-35` (readme never
  rewritten), `:51-56` (LICENSE kept), `:69-97` (SECURITY — none), `:99-108`
  (copied as-is), `:114-119` (renovate caveat — plan 3's).
- **Docs describing today** (all owned by U5):
  `site/src/content/docs/plugins/vwf.md:818` (table row), `:891`
  (`### /vwf:init`), `:1009-1016` (mode rule), `:1018` (seven questions),
  `:1098` (existing survey), `:1471` (blank/code fork row);
  `how-to/greenfield/single-repo.md:58-67` (`:63` "new pipeline"), `:99-101`;
  `how-to/brownfield/onboard-existing-codebase.md:81-100` (`:91-92` no
  `.config/` → existing survey); `CLAUDE.md:264-276`, `:306-308`;
  `.claude/skills/vwf-plugin/SKILL.md:94-96, 116-118, 131`;
  `references/skills-and-agents.md:27-28`.
- **Sizes.** `I/SKILL.md` 673 lines, `new-repo.md` 794, `existing-repo.md` 963,
  `fragments-and-sections.md` 307, `readme-and-license.md` 128; `S/SKILL.md`
  323, `onboard-pipeline.md` 197.
- **Versions after plan 1**: vwf `19.38.0`, stackgen `1.22.0`, site `1.1.34`;
  mise pack `1.3.0` (`bundles/mise.md:7`), hygiene `1.1.1`
  (`bundles/repo-hygiene.md:7`). Pack bump + pin + inventory land in one commit
  (U6). Commit types `ops docs merge feat fix refactor`, no scopes. Priority:
  `10 + 10` over the required plan's row → 20.

## Assumed decisions — confirm or override at review

| # | Decision         | Ruling                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Rejected                                                                      | Unit       |
| - | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------- | ---------- |
| 1 | Mode             | Three modes, decided per repo by init from what the tree contains: **`shaped`** — the materializer lockfile exists (today's existing path); **`source`** — no lockfile, but a language manifest, a source directory, a root tool config, or a `.config/` without the lockfile; **`blank`** — none of those (README, LICENSE, `.gitignore`, `.gitattributes` and docs are not evidence — setup's own definition at `S/SKILL.md:168-174`, cited not restated). `source` runs the new-repo landing **plus** the read-before-land passes of the existing pipeline that have something to read (pass 1 survey, pass 6 offer; the sidecar and rename passes only when a task library exists). Init still takes no argument; setup's fork stays for its onboard sub-paths | setup hands `blank`/`code` down; widen the two-marker test and keep two modes | U1, U2, U3 |
| 2 | Stack read       | One read, in order, first hit per language wins: the pins under `projects.<name>.stack.*` and `languages` in `.config/vwf.yaml`; else the lockfile's components (`shaped`); else, in `source` mode, a **manifest table** — `package.json` → node, `pyproject.toml` / `requirements.txt` → python, `pubspec.yaml` → dart, `go.mod` → go, `Cargo.toml` → rust, `Package.swift` → swift — read at the root and in every sub-project directory (decision 4). `blank` reads nothing and lands no section. The read drives the `.gitignore` sections (the hygiene table, which gains go/rust/swift rows if absent) and decision 3's slots                                                                                                                                | lockfile only; ask the user for the languages                                 | U1, U2, U4 |
| 3 | Runtime block    | The mise pack's runtime block (`mise.toml:78-89`) and `_.path` (`:143-146`) become **marked positions** — `RUNTIME_BLOCK` and `PATH_ENTRIES` — which init fills from the stack read (one runtime line per detected language, `_.path` left empty when nothing needs it); the human instruction comments go. A marked position is what the hash splice ignores, so filling it is never content drift                                                                                                                                                                                                                                                                                                                                                                | leave the comment for a human                                                 | U4, U1     |
| 4 | Sub-project      | Defined: the registry's `projects[].path` list when a registry exists; else, in `source` mode, a non-root directory carrying its own manifest from decision 2's table, or a member a workspace file enumerates (`pnpm-workspace.yaml` globs, `melos.yaml`, a Cargo or Go workspace). `docs/`, `scripts/`, `.config/`, `.github/` and any dotdir never qualify. `blank` proposes none                                                                                                                                                                                                                                                                                                                                                                               | keep undefined                                                                | U1         |
| 5 | Conflicts        | Pass 6's replace-or-keep offer, its default rule and its `kept_files` record run in **every** mode over every path the materializer reports as a conflict — `blank` included; the plan shows one row per conflict before consent. `SECURITY.md` and `README.md` get the already-there rule LICENSE has (`readme-and-license.md:51-56`): kept, never replaced, reported                                                                                                                                                                                                                                                                                                                                                                                             | mode `new` keeps silent conflicts; SECURITY replaced                          | U1, U2     |
| 6 | `stacks:` roster | Documented in `vwf-config.md` where init reads it (`I/SKILL.md:239-259`) as the adapter roster, with the `:112` retirement note corrected to name `enforcement.stacks`; **no** `config_format` bump — the key is already read and written                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | bump to 21                                                                    | U3         |
| 7 | Review row       | None — skill prose and a TOML payload slot; nothing executes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | —                                                                             | —          |
| 8 | Pack bumps       | mise `1.3.0` → `1.4.0` (a new marked position), hygiene `1.1.1` → `1.1.2` (table rows); pins and inventory in U6, one commit                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | per-unit bumps                                                                | U6         |

## New dependencies

none

## Units

| Id | Wave | Unit file                                        | Kind | Owns                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Depends on     | Status  | Commit   |
| -- | ---- | ------------------------------------------------ | ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | ------- | -------- |
| U1 | 1    | [01-init-core.md](01-init-core.md)               | edit | `plugins/vwf/skills/init/SKILL.md`, `plugins/vwf/skills/init/references/new-repo.md`                                                                                                                                                                                                                                                                                                                                                                  | —              | green   | 67ed9cc5 |
| U2 | 1    | [02-init-passes.md](02-init-passes.md)           | edit | `plugins/vwf/skills/init/references/existing-repo.md`, `plugins/vwf/skills/init/references/fragments-and-sections.md`, `plugins/vwf/skills/init/references/readme-and-license.md`                                                                                                                                                                                                                                                                     | —              | green   | 9e2eff94 |
| U3 | 1    | [03-config-and-setup.md](03-config-and-setup.md) | edit | `plugins/vwf/assets/vwf-config.md`, `plugins/vwf/skills/setup/SKILL.md`, `plugins/vwf/skills/setup/references/onboard-pipeline.md`                                                                                                                                                                                                                                                                                                                    | —              | green   | 82b96d13 |
| U4 | 1    | [04-packs.md](04-packs.md)                       | edit | `plugins/stackgen/stacks/toolchain-manager/mise/config/.config/mise.toml`, `plugins/stackgen/stacks/toolchain-manager/mise/skills/mise/references/config-files.md`, `plugins/stackgen/stacks/toolchain-manager/mise/conventions.md`, `plugins/stackgen/stacks/repo-hygiene/repo-hygiene/conventions.md`                                                                                                                                               | —              | green   | 3d1c5b48 |
| U5 | 2    | [05-docs.md](05-docs.md)                         | edit | `readme.md`, `CLAUDE.md`, `.claude/docs/**`, `.claude/skills/vwf-plugin/**`, `.claude/skills/stackgen-plugin/**`, `site/src/content/docs/**`, `docs/memory/decisions/2026-09-20-init-mode-seam.md`, `plugins/stackgen/stacks/toolchain-manager/mise/skills/mise/SKILL.md`, `plugins/vwf/skills/doctor/SKILL.md`, `plugins/vwf/skills/doctor/references/stack-checks.md` (widened at wave 1: nobody-owned passages falsified by the runtime positions) | U1, U2, U3, U4 | pending |          |
| U6 | 3    | [06-gates-and-bump.md](06-gates-and-bump.md)     | edit | `plugins/stackgen/stacks/toolchain-manager/mise/pack.yaml`, `plugins/stackgen/stacks/repo-hygiene/repo-hygiene/pack.yaml`, `plugins/stackgen/stacks/bundles/mise.md`, `plugins/stackgen/stacks/bundles/repo-hygiene.md`, `plugins/stackgen/stacks/inventory.md`, the two `plugin.json`, `site/package.json`, `.claude-plugin/marketplace.json`                                                                                                        | U5             | pending |          |

Status is one of `pending`, `running`, `green`, `failed`, `unresolved`,
`skipped`. Every unit is `edit`.

## Shared-file rule

| File                                                                                         | Why it collides                                        | Owner   |
| -------------------------------------------------------------------------------------------- | ------------------------------------------------------ | ------- |
| the two `pack.yaml`, the two bundle files, `inventory.md`                                    | the generator refuses a pin without its pack           | U6 only |
| the two `plugin.json`, `site/package.json`, `.claude-plugin/marketplace.json`                | version and generated files                            | U6 only |
| every human-facing doc — `readme.md`, `CLAUDE.md`, `.claude/**`, `site/**`, `docs/memory/**` | n units editing one doc                                | U5 only |
| `init/SKILL.md`                                                                              | U2 would restate the mode table; U1 owns it            | U1 only |
| `existing-repo.md`                                                                           | U1 would name pass 6's new callers; U2 owns the passes | U2 only |
| `plugins/vwf/assets/vwf-config.md`                                                           | U1 would describe `stacks:`; U3 owns the schema        | U3 only |
| `SG/assets/ids.md`, `SG/assets/pack-format.md`                                               | untouched — cited, never edited                        | —       |

## Waves

- **Wave 1** — U1, U2, U3, U4: four disjoint trees; U1 and U2 split the init
  skill by file and cite each other's passes by name.
- **Wave 2** — U5: the docs over the branch delta plus the decisions doc.
- **Wave 3** — U6: the two pack bumps, pins, inventory, the three versions, the
  marketplace, the full gate.

## Wave gate

    mise run p:plugins:marketplace -- --check
    mise run p:plugins:inventory -- --check
    mise run p:plugins:check
    mise run code:precommit
    mise run p:site:check

plus the wave review, plus every report read for `UNRESOLVED:`. Every line here
must be green before wave 1.

## After landing

| Step                       | Mode | Notes                                                                                                                                                                   |
| -------------------------- | ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mise run p:plugins:local` | run  | stages vwf at `19.39.0+N` and stackgen at `1.23.0+N` into the dev marketplace and updates this machine's install; publishes nothing; a **restarted** session loads them |

## Gates the orchestrator keeps

none beyond the wave gate. The three modes are proven on a real repo by the
user's next `/vwf:setup` on a source-bearing repo without `.config/`.

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

- The brownfield read-before-land rules for root tool configs, the rename map,
  the `.gitignore` section merge, the hook-manager survey, the missing
  §3/4/8/9/10, writers and hashes, inline `[tasks.*]` — plan 3
  (`init-brownfield-reads`).
- The git pass, branch names and members' HEAD — plan 4 (`branch-model`).
- Rendering the hygiene root set, the editor baseline split, the gate values —
  plan 5 (`pack-intent-rendering`).
- A `config_format` bump — decision 6.
- A public release — the bumps land; the tags wait for the next `/release`.

## Parked

- Plan 3 owes the `source`-mode survey rows this plan's decision 1 names as "the
  passes that have something to read" for root tool configs (candidate 5) — this
  plan wires the mode; plan 3 widens what pass 1 sees.
- B28 closes when plan 5 lands; `/vwf:execute`'s `done` at this landing may need
  the item moved back to `Backlog` by hand until then.

## Gaps surfaced during execution

- **Owns widened (wave 1, R1 rule 5):** U5 takes
  `plugins/stackgen/stacks/toolchain-manager/mise/skills/mise/SKILL.md:144-165`,
  `plugins/vwf/skills/doctor/SKILL.md:176` and
  `plugins/vwf/skills/doctor/references/stack-checks.md:482-483` — each counts
  the mise pack's marked positions as three or "two beside REPO_NAME", falsified
  by `RUNTIME_BLOCK` and `PATH_ENTRIES`; no unit owned them.
- **U1 GAP:** `new-repo.md` §11(c) still reasons that the first commit precedes
  hook wiring; a `source` repo with hooks already wired is plan 4's (git pass).
- **U2 GAP:** a repo keeping its own `SECURITY.md` has no 6b row, so the
  issue-template chooser's vulnerability entry has no address — the declined
  shape (entry removed) is assumed.
- **U4 GAP:** the language-keyed hygiene table has no row for a pin with no
  language (a `flutter` pin alone) — assumed the stack read always yields `dart`
  beside it.
- **R1 contested (round cap):** (1) "differ on exactly one item" at
  `setup/SKILL.md:183`, `onboard-pipeline.md:9`, `init/SKILL.md:217` — setup's
  fork also counts `docs/blueprint/`, init's test does not; two items differ.
  (2) `init/SKILL.md:329` proposes an unmapped slug while the hygiene table
  (`conventions.md:105-110`) says such slugs need no row — init should exempt
  the slugs the adapter lists.

## Run log

| Wave | Unit      | Model | Round | Outcome                 | Detail                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Commit   |
| ---- | --------- | ----- | ----- | ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| 0    | preflight | —     | 1     | green                   | doctor: repo not onboarded (no `.config/vwf.yaml`), no blocking finding — mise, graphify CLI and the main checkout's graph present; all five gate lines green; no `code` unit — conventions fetch and per-unit recall skipped; format check skipped (no `covers:`)                                                                                                                                                                                                                                                                                                                            | —        |
| 1    | U3        | opus  | 1     | green                   | DECIDED: `stacks:` placed after `integrations:`, before `members:` (product-wide, mode-neutral); writers row lists architecture and doctor as readers (stack-adapter.md:171). Noted pre-existing `onboard-pipeline.md:54` "six predicates" vs SKILL.md's seven — not this plan's, flagged for U5. DOCS FALSIFIED: none beyond U5's. GAP: none                                                                                                                                                                                                                                                 | 82b96d13 |
| 1    | U4        | opus  | 1     | green                   | DECIDED: hygiene table keeps its template-name shape (upstream Go/Rust/Swift templates, fetched and resolving) rather than the plan's pattern lists — the file appends templates, never patterns; marker syntax is the file's own comment-plus-slot form. DOCS FALSIFIED: mise pack `skills/mise/SKILL.md:144-165` (three positions → five; nobody-owned, handed to U5 — Owns widened), `fragments-and-sections.md:31-36` (U2's), `site/…/vwf.md:1368` (U5's). GAP: language-keyed table has no row for a language-less pin; assumed the stack read always yields `dart` beside a flutter pin | 3d1c5b48 |
| 1    | U2        | opus  | 1     | green                   | DECIDED: already-there paths (readme, licence, security) get no `kept_files` entry — never offered; plan heading reads `── <repo> ── (shaped)`, U1's summary must agree (wave review checks); pass 7's ignore check cites the stack read. DOCS FALSIFIED: none beyond U5's. GAP: a kept SECURITY.md has no 6b row — assumed the declined shape (chooser entry removed); hygiene table keyed on language assumed (U4 confirmed)                                                                                                                                                                | 9e2eff94 |
| 1    | U1        | opus  | 1     | green                   | DECIDED: runtime fill is a §5 subsection (section numbers cited elsewhere); workspace filenames in a fenced block (rule 10); mode table carries the widened `source` evidence (root tool config) beside the setup cite. DOCS FALSIFIED: all within U5's Owns (site vwf.md, two how-tos, CLAUDE.md, vwf-plugin skill). GAP: new-repo.md §11(c) still assumes the first commit precedes hook wiring — a `source` repo with hooks wired is left to plan 4                                                                                                                                        | 67ed9cc5 |
| 1    | R1        | opus  | 1     | findings(4)             | RULINGS: U3 departed from #1 (setup says init re-derives "the same evidence" while a root tool config is `source` evidence for init, blank for setup); U1/U4 leave #2's language vocabulary unmapped from pin/lockfile slugs (mapping only in U4's pack file). Tree trap: setup/SKILL.md:79 85-char line. Rule 5 nobody-owned: doctor/references/stack-checks.md:482-483 and doctor/SKILL.md:176 ("two marked positions" beside REPO_NAME, now four) — handed to U5, Owns widened. CONTRACT: clean. Looping U1, U3                                                                            | —        |
| 1    | U1        | opus  | 2     | green                   | R1 fix: "The stack read" gains a one-vocabulary paragraph — every source resolves to the six keys (node, python, dart, go, rust, swift); pin tokens and lockfile slugs mapped via the hygiene pack's template table (adapter owns the mapping); "first hit per language" counts keys; unmapped → proposed, never guessed. new-repo.md §5 mirrors it in one sentence                                                                                                                                                                                                                           | 67ed9cc5 |
| 1    | U3        | opus  | 2     | green                   | R1 fix: setup's fork and init's mode test stated as two tests differing on one item (a root tool config — not code for setup, `source` evidence for init), init's table cited by path; onboard-pipeline.md lead-in likewise; line 79 re-folded                                                                                                                                                                                                                                                                                                                                                | 82b96d13 |
| 1    | R1        | opus  | 2     | findings(2) — contested | Round-1 fixes verified; CONTRACT clean, RULINGS clean. Two new precision findings at the two-round cap, recorded contested: (1) setup/SKILL.md:183, onboard-pipeline.md:9, init/SKILL.md:217 say the two tests "differ on exactly one item" — setup also counts `docs/blueprint/`, init does not, so two items differ; (2) init/SKILL.md:329 proposes an unmapped slug while the hygiene table (conventions.md:105-110) says such slugs need no row — init should exempt what the adapter lists                                                                                               | —        |

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the fresh session's worktree — cut from the integration branch — can see it.

Run in a fresh session:

/vwf:execute docs/plans/2026-09-20-init-mode-seam

or let the queue pick it, by priority:

/vwf:execute next
