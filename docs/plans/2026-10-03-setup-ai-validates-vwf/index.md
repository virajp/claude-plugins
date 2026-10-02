---
type: vwf-change-plan
title: setup:ai checks for vwf, installs it at user scope only when absent, and
  upgrades everything
requires: []
backlog: [ B86 ]
backlog_pieces: []
---

# Plan — setup:ai checks for vwf, installs it at user scope only when absent, and upgrades everything (2026-10-03)

## Status

**RUNNING**

RUNNING since 2026-10-03 00:37 in .worktrees/2026-10-03-setup-ai-validates-vwf

## Consent

| Action                                            | Granted |
| ------------------------------------------------- | ------- |
| Merge to the integration branch and push on green | yes     |
| After landing: `mise run p:plugins:local`         | run     |
| Release stackgen publicly                         | major   |
| Release vwf publicly                              | minor   |
| Release site publicly                             | patch   |

**The mode recorded here is the consent.** A `run` step runs on a green landing
without a prompt. The staged plugins are picked up only by a **restarted**
session.

**Release rows are intent, not authorisation** — no public release step is
recorded; the change ships with the next batched `/release`. A project is bumped
once per level since its last release: stackgen `3.0.0` (tag `stackgen-v2.0.0`),
vwf `20.1.0` (tag `vwf-v20.0.1`) and site `1.1.50` (tag `site-v1.1.49`) already
sit above their last released tags at the recorded level, so **this plan bumps
no plugin and not the site**. It bumps one pack — design-tool/claude-code, minor
— because a pack's version is what a materialized repo's lock compares. Were a
plugin bump needed, it is a hand edit of its `.claude-plugin/plugin.json` plus
`mise run p:plugins:marketplace` — not authorised here.

## Goal

The `setup:ai` task the toolkit ships never installs a plugin at project scope.
It checks whether `vwf@virajp-plugins` is installed at user or project scope;
only when it is at neither does it install vwf with the installer CLI, at user
scope. Whether or not it installed anything, it then updates every registered
marketplace, upgrades every installed plugin at its own scope, and prunes
project scope. A stackgen pack may request a plugin of its own, which the task
treats the same way — checked at either scope, installed at user scope only when
absent. In a greenfield repo tool-config copies the shipped task as an asset; in
a brownfield repo with a `setup/ai` of its own, the LLM renders the required
steps into it from doctrine, keeping everything the user added — there is no
mechanical guard on the task's content, so a user may extend it for any use they
see fit. This plan finishes backlog item B86.

**Reversal:**
`docs/memory/decisions/2026-09-12-setup-ai-is-project-scope-through-claude.md`
ruled that `setup:ai` installs the repo's required plugins at **project** scope
so "a collaborator who never installed it gets it from the checkout", that "a
copy at the other scope is not a substitute", and that init's question 5 fills
`EXTRA_MARKETPLACES`/`EXTRA_PLUGINS`. All three retire. U6 records the reversal
as a decisions doc.

The user's words, verbatim, are the rulings' source:

> - This task must first check whether `vwf` is installed at user-level or
>   project-level
> - If not, then only install `vwf` using the installer and only at user-level
> - This task will not install any extra plugins (for now)
> - There must not be any guard for this, only doctraine for LLM to create/sync
>   this task. This gives the user flexibility to extend this task for any
>   additional use they deem fit
> - Whether or not the task installs the `vwf` plugin, it must continue with the
>   rest: update marketplaces and upgrade all plugins to latest version

> In greenfield project, tool simply copyies the assets whereas in brownfield
> LLM renders the task as per requirement. Other stackgen tools can add their
> required plugins

## Facts the survey established

`TC` = `plugins/stackgen/skills/tool-config`. Line numbers are as of 2026-10-03.

- **The shipped task.** One copy: `TC/assets/mise/.config/mise/tasks/setup/ai`
  (129 lines). Steps: `--user` and `--inventory` flags (`:6-7`); no `claude` on
  PATH → warn, exit 0 (`:13-17`); `cd "${MISE_PROJECT_ROOT}"` (`:20`);
  `MARKETPLACE=virajp-plugins`, `MARKETPLACE_SOURCE=virajp/claude-plugins`
  (`:22-23`); helpers over `claude plugin marketplace list --json` and
  `claude plugin list --json` (`:26-47`); `--inventory` prints rows (`:50-57`);
  `EXTRA_MARKETPLACES=()` (`:59-62`) and `EXTRA_PLUGINS=()` (`:64-67`) marked
  positions; `SCOPE=project` (`:69-70`); marketplace add-or-update (`:73-84`);
  `REQUIRED=("vwf@virajp-plugins")` plus extras (`:87-94`); install-or-update at
  that one scope (`:97-106`); `autoremove --scope $SCOPE --yes` (`:109-110`);
  graphify wiring (`:113-121`); claude-status hint (`:124-127`).
- **This repo's own copy** (`.config/mise/tasks/setup/ai`, 38 lines, rewritten
  in `c285438c`): no `claude` → warn, exit 0 (`:10-14`);
  `claude plugins marketplace update` with no name — every marketplace
  (`:17-19`); `claude plugin list --json | jq` →
  `claude plugin update --scope
  <its scope> <id>` per installed plugin, user
  scope included (`:23-30`); `claude plugin autoremove --scope project --yes`
  (`:34`). It does **not** check for vwf. It is this repo's own file — the
  maintainer edits it by hand (Out of scope).
- **The extras pipeline.** `TC/scripts/lib/tools/mise.mjs:414-415` reads
  `--plugin-sources`/`--plugins`, `:525-529` checks them, `:572-575` writes them
  into the marked positions; `TC/scripts/lib/cli.mjs` declares the keys.
  `plugins/vwf/skills/init/SKILL.md:540-575` (question 5) runs
  `setup:ai --inventory`, drops vwf rows, asks, and passes the rows as
  `--plugin-sources`/`--plugins` (`init/references/new-repo.md:97,490-492`;
  `init/references/existing-repo.md:708`).
- **Pack requests to mise are structured entries** in a pack's `tool-config:`
  list — e.g. the doppler pack's `add-tool` entry
  (`stacks/capability-provider/doppler/pack.yaml:19`), validated in
  `TC/scripts/lib/schema.mjs` (`:255`, `:285`, `:297`) and dispatched by
  `mise.mjs`'s `VERBS` table (`:1467+`, `:1732`). A new `add-plugin` verb
  follows that shape; the hygiene plan's string-grammar retirement does not
  reach it.
- **The design-tool pack.** `stacks/design-tool/claude-code/pack.yaml` version
  `0.3.1`; pinned at `stacks/bundles/claude-code.md:7`
  (`design-tool/claude-code@0.3.1`); `conventions.md:71-80` says init's question
  5 adds `taste-skill@taste-skill` so "setup:ai installs it at project scope",
  with a halt message naming `mise run setup:ai`;
  `skills/design-session/SKILL.md:69` repeats the halt;
  `bundles/claude-code.md:22-24` says "the repo's `setup:ai` installs it". The
  `taste-skill` marketplace is the GitHub repo `Leonxlnx/taste-skill`.
- **The installer CLI** defaults to user scope: `--all` installs `vwf` (which
  pulls `stackgen`) at user scope and registers the marketplace
  (`installer/src/install.ts:95-96`, `installer/src/args.ts:43-45`).
- **Nothing else installs vwf.** No skill writes `enabledPlugins` or
  `extraKnownMarketplaces`; `vwf:doctor` has no vwf-installed check
  (`doctor/references/stack-checks.md:74-76` checks LSP plugins at either scope,
  unaffected).
- **Tests.** `scripts/src/fixtures/tool-config/mise/greenfield.json:110-113`
  carries the rendered task; `scripts/src/tool-config-mise.test.ts:83-86` passes
  `--plugin-sources`/`--plugins`; `:1102` asserts `setup:ai` is hidden from the
  task table. `p:plugins:shellcheck` covers every
  `TC/assets/*/.config/mise/tasks` tree
  (`.config/mise/tasks/p/plugins/shellcheck:34-36`). No behaviour test runs the
  task.
- **Triggers.** The shipped `setup/all` runs `setup:ai` last
  (`TC/assets/mise/.config/mise/tasks/setup/all:38`); tool-config `all` runs
  `setup:all` after writing (`TC/scripts/lib/run.mjs:139-141`); init's landing
  runs `setup:all`.
- **Passages the change falsifies** (each owned below):
  `TC/references/mise.md:291` (wires graphify), `:464`, `:819`, `:923`,
  `:999-1026`, `:1244-1245`; `TC/SKILL.md` (the `all` key table names the two
  flags); `readme.md:129-134`; `CLAUDE.md:271-275`, `:384-390`;
  `installer/CLAUDE.md:14` (setup:ai wires graphify), `:26-30`;
  `site/src/content/docs/plugins/vwf.md:38-43`, `:1136-1140`;
  `site/src/content/docs/plugins/stackgen.md:397-398` (and its task lists at
  `:1141`, `:1160`);
  `site/src/content/docs/how-to/greenfield/single-repo.md:84-89`;
  `site/src/content/docs/installer/targets.md:71` (setup:ai wires graphify); the
  design-tool pack passages above. Unaffected: the CLI's `--project` docs,
  `how-to/greenfield/multi-repo.md:32-34` (already says user scope),
  `execute/SKILL.md:413-414` and `target-verifier.md:297` (claude-status for the
  cap hook, not setup:ai).
- **Queue.** `2026-10-01-tool-config-script-gates` is RUNNING (blocked at G7) in
  `.worktrees/2026-10-01-tool-config-script-gates` and touches `TC/scripts/lib/`
  (schema, gate tool modules); `-hygiene`, `-init`,
  `2026-10-02-graphify-report-ignored` and `2026-10-02-fnox-dev-only` are
  APPROVED and edit init's question list. This plan runs independently (D9), so
  it lands first and those plans meet a renumbered question list.
- **Gates.** `mise tasks`:
  `p:plugins:{check,inventory,marketplace,shellcheck,npm-normalize-test,local,release}`,
  `p:site:{check,build,version,release}`, `code:{precommit,format,lint,sec}`.
  `plugins/**/*.md` is not dprint-formatted — match the fold width by hand.
- **Commit types** (`.config/git-conventional-commits.yaml:3-9`): `ops`, `docs`,
  `merge`, `feat`, `fix`, `refactor`; no scopes.

## Assumed decisions — confirm or override at review

| #  | Decision        | Ruling                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Rejected                                                                                      | Unit       |
| -- | --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ---------- |
| 1  | The vwf check   | The task reads `claude plugin list --json`; when `vwf@virajp-plugins` is installed at **user or project** scope it does nothing more for vwf. When it is at neither, it runs `pnpx @virajp.dev/claude-plugins@latest --all` — the installer, which registers the marketplace and installs vwf (and stackgen) at **user** scope. It never installs at project scope, and it continues whether or not it installed.                                                                                         | A project-scope install; failing when vwf is absent                                           | U1, U2     |
| 2  | Always continue | After the vwf check, always: `claude plugin marketplace update` (every registered marketplace), then `claude plugin update --scope <its scope> <id>` for every installed plugin, then `claude plugin autoremove --scope project --yes`, from `MISE_PROJECT_ROOT`. No `claude` on PATH → warn and exit 0, as today.                                                                                                                                                                                        | Updating only the required set at one scope                                                   | U1, U2     |
| 3  | Installer pin   | `@latest` on the package.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | An exact version (a bump every release); a bare name (a cached package can replay an old one) | U1         |
| 4  | No user extras  | Retired: `EXTRA_MARKETPLACES`, `EXTRA_PLUGINS`, `--inventory`, `--user`, tool-config's `--plugin-sources`/`--plugins` keys, and init's question 5 (the agent-plugins question). The task installs no extra plugin of the user's choosing "(for now)".                                                                                                                                                                                                                                                     | Keeping question 5 and the arrays                                                             | U1, U2, U4 |
| 5  | Pack plugins    | A pack may request a plugin with a structured `tool-config:` entry `{ tool: mise, verb: add-plugin, plugin: <name>@<marketplace>, source: <owner/repo> }`. tool-config writes it into `setup/ai` inside that requester's block markers. The task treats each the same as vwf: installed at either scope → nothing; else `claude plugin marketplace add <source>` when the marketplace is not registered, then `claude plugin install --scope user <plugin>`. `remove <requester>` drops the block.        | Project-scope install for pack plugins; doctrine with no mechanism                            | U1, U2, U3 |
| 6  | design-tool     | The design-tool/claude-code pack requests `{ tool: mise, verb: add-plugin, plugin: taste-skill@taste-skill, source: Leonxlnx/taste-skill }`; its conventions, its design-session halt text and `bundles/claude-code.md` say `setup:ai` installs it at user scope when absent.                                                                                                                                                                                                                             | —                                                                                             | U3         |
| 7  | No guard        | Greenfield: tool-config copies the shipped task as an asset (plus pack blocks). Brownfield — the repo already has a `setup/ai` of its own: tool-config does not overwrite it, offers no conflict or drift row, and records no content hash for it; the doctrine in `TC/references/mise.md` tells the LLM which steps the task must carry (D1, D2, the pack blocks) and it renders any missing step into the user's file, keeping everything else. No test or checker asserts a brownfield task's content. | A conflict row or drift check that would overwrite the user's task                            | U1, U2     |
| 8  | Dropped steps   | Graphify wiring (`graphify install --platform claude`) and the claude-status hint leave the task.                                                                                                                                                                                                                                                                                                                                                                                                         | Keeping either                                                                                | U1, U2     |
| 9  | Sequencing      | Independent: `requires: []`, priority 10. Mise pack requests are already structured, so the hygiene plan's grammar retirement needs no edit for `add-plugin`.                                                                                                                                                                                                                                                                                                                                             | Chaining after `2026-10-02-fnox-dev-only` (priority 80)                                       | —          |
| 10 | Review          | One `Kind: review` row (U5) covers U1, which lands runnable code — the shell task, `mise.mjs`, `schema.mjs`, `cli.mjs` and their tests.                                                                                                                                                                                                                                                                                                                                                                   | No review row                                                                                 | U5         |
| 11 | Decisions doc   | The reversal is recorded as `docs/memory/decisions/2026-10-03-setup-ai-validates-vwf.md`, naming the 2026-09-12 doc it supersedes.                                                                                                                                                                                                                                                                                                                                                                        | Leaving it in the plan only                                                                   | U6         |
| 12 | Versions        | design-tool/claude-code `0.3.1` → `0.4.0`, its pin in `bundles/claude-code.md`, and `plugins/stackgen/stacks/inventory.md` regenerated — one commit. No plugin or site bump.                                                                                                                                                                                                                                                                                                                              | Bumping the plugins again                                                                     | U7         |

## New dependencies

none — the installer CLI `@virajp.dev/claude-plugins` is this repo's own,
already published.

## Units

| Id | Wave | Unit file                                      | Kind   | Owns                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Depends on     | Status  | Commit   |
| -- | ---- | ---------------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | ------- | -------- |
| U1 | 1    | [01-task-and-script.md](01-task-and-script.md) | edit   | `plugins/stackgen/skills/tool-config/assets/mise/.config/mise/tasks/setup/ai`, `plugins/stackgen/skills/tool-config/scripts/lib/cli.mjs`, `plugins/stackgen/skills/tool-config/scripts/lib/schema.mjs`, `plugins/stackgen/skills/tool-config/scripts/lib/tools/mise.mjs`, `scripts/src/tool-config-mise.test.ts`, `scripts/src/fixtures/tool-config/mise/**`; widened at run time (D7): `plugins/stackgen/skills/tool-config/scripts/tool-config.mjs` (setup/ai hash skip only — unused, ruling (b)) | —              | green   | 510fabfb |
| U2 | 1    | [02-doctrine.md](02-doctrine.md)               | edit   | `plugins/stackgen/skills/tool-config/SKILL.md`, `plugins/stackgen/skills/tool-config/references/mise.md`                                                                                                                                                                                                                                                                                                                                                                                             | —              | green   | a2bfb025 |
| U3 | 1    | [03-design-tool.md](03-design-tool.md)         | edit   | `plugins/stackgen/stacks/design-tool/claude-code/pack.yaml` (the `tool-config:` list only), `plugins/stackgen/stacks/design-tool/claude-code/conventions.md`, `plugins/stackgen/stacks/design-tool/claude-code/skills/design-session/SKILL.md`, `plugins/stackgen/stacks/bundles/claude-code.md` (prose only, not the pin)                                                                                                                                                                           | —              | green   | d90e20ae |
| U4 | 1    | [04-init.md](04-init.md)                       | edit   | `plugins/vwf/skills/init/SKILL.md`, `plugins/vwf/skills/init/references/new-repo.md`, `plugins/vwf/skills/init/references/existing-repo.md`; widened at run time (D4): `init/references/{readme-and-license,tool-configs}.md`                                                                                                                                                                                                                                                                        | —              | green   | 48f54954 |
| U5 | 2    | [05-review.md](05-review.md)                   | review | —                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | U1             | green   | —        |
| U6 | 3    | [06-docs.md](06-docs.md)                       | edit   | `readme.md`, `CLAUDE.md`, `installer/CLAUDE.md`, `.claude/docs/**`, `.claude/skills/**`, `site/src/content/docs/**`, `docs/memory/decisions/2026-10-03-setup-ai-validates-vwf.md`; widened at run time (R1 rule 5): `plugins/vwf/skills/doctor/references/stack-checks.md` (the :547 passage only), `plugins/stackgen/assets/pack-format.md` (the :240 mise verb table only)                                                                                                                         | U2, U3, U4, U5 | pending |          |
| U7 | 4    | [07-gates.md](07-gates.md)                     | edit   | `plugins/stackgen/stacks/design-tool/claude-code/pack.yaml` (the `version:` line only), `plugins/stackgen/stacks/bundles/claude-code.md` (the pin line only), `plugins/stackgen/stacks/inventory.md`                                                                                                                                                                                                                                                                                                 | U6             | pending |          |

## Shared-file rule

| File                                                    | Why it collides                   | Owner                                                       |
| ------------------------------------------------------- | --------------------------------- | ----------------------------------------------------------- |
| `stacks/design-tool/claude-code/pack.yaml`              | request (U3) and version (U7)     | U3 the `tool-config:` list, U7 `version:` — different waves |
| `stacks/bundles/claude-code.md`                         | prose (U3) and pin (U7)           | U3 prose, U7 the pin line — different waves                 |
| `plugins/stackgen/stacks/inventory.md`                  | generated                         | U7 only                                                     |
| the verb name and keys `add-plugin`, `plugin`, `source` | named in U1 code, U2 and U3 prose | each unit quotes D5 verbatim                                |
| `docs/plans/index.md`                                   | plan-management's                 | no unit — ever                                              |
| every human-facing doc                                  | n units editing one doc           | U6 only                                                     |
| plugin manifests, `.claude-plugin/marketplace.json`     | versioned or generated            | nobody — D12                                                |

## Waves

- **Wave 1 — U1, U2, U3, U4.** Disjoint paths: tool-config's script and task,
  tool-config's prose, the design-tool pack, vwf's init. They share only the
  names D5 fixes, quoted verbatim in each.
- **Wave 2 — U5**, the review row over U1's commit range.
- **Wave 3 — U6**, docs. **Wave 4 — U7**, the pack bump and inventory.

## Wave gate

Every line runs with `MISE_ENV=dev` exported:

- `mise run p:plugins:marketplace -- --check`
- `mise run p:plugins:inventory -- --check`
- `mise run p:plugins:check`
- `mise run p:plugins:shellcheck`
- `pnpm vitest run`
- `pnpm exec tsc --noEmit -p scripts`
- `mise run code:precommit`
- `mise run p:site:check`

plus the wave review, plus every report read for `UNRESOLVED:`.

## After landing

| Step                       | Mode | Notes                                                                                   |
| -------------------------- | ---- | --------------------------------------------------------------------------------------- |
| `mise run p:plugins:local` | run  | stages vwf and stackgen into the dev marketplace; a **restarted** session picks them up |

## Gates the orchestrator keeps

Run the shipped `setup/ai` (from the worktree's
`plugins/stackgen/skills/tool-config/assets/mise/.config/mise/tasks/setup/ai`)
in a `mktemp -d` directory with `MISE_PROJECT_ROOT` set to it and a stub
directory first on `PATH` holding a `claude` stub (answers `plugin list --json`
from a fixture file, logs every other call) and a `pnpx` stub (logs its argv).
Never against the real `claude`. Cases:

- vwf installed at **user** scope only → the log has no `pnpx` call.
- vwf installed at **project** scope only → no `pnpx` call.
- vwf absent → exactly one `pnpx @virajp.dev/claude-plugins@latest --all`.
- every case → then `plugin marketplace update`, one
  `plugin update --scope
  <scope> <id>` per installed plugin, and
  `plugin autoremove --scope project
  --yes`, in that order; no
  `plugin install --scope project` anywhere.
- no `claude` on PATH → exit 0 with the warning.

## Unit contract

Every unit prompt carries, in order: its ruling quoted from this file, its owned
paths plus "touch nothing outside this list", the facts section, the shared-file
rule, and the return block below. A unit never bumps a version, never runs a
generator, never edits a doc, never adds a dependency this file does not list,
never commits. A unit deletes with plain `rm`, never `git rm` — it stages
nothing. A unit never runs `git checkout`, `git restore` or a formatter with
`--fix` outside its Owns.

A unit returns exactly this block and nothing else — no file contents, no diff:

    CHANGED: <path> — <one line>            (one per file)
    DECIDED: <what> — <why>                 (choices made inside scope, or none)
    DOCS FALSIFIED: <path> — <passage>      (reported, never edited; or none)
    GAP: <what the plan left unspecified and the assumption taken>   (or none)
    UNRESOLVED: <the ruling needed>         (or none)

## Out of scope

- This repo's own `.config/mise/tasks/setup/ai` — the maintainer edits this
  repo's `.config` files by hand; it already carries D2 and lacks D1.
- Installing user-chosen extra plugins — declined "(for now)" (D4).
- A vwf-installed check in `/vwf:doctor` — not asked for.
- Amending the queued `-init`, `graphify-report-ignored` or `fnox-dev-only`
  plans — they locate init's passages by content at run time.

## Parked

- The queued `2026-10-01-tool-config-script-init`,
  `2026-10-02-graphify-report-ignored` and `2026-10-02-fnox-dev-only` plans cite
  init's questions by number as of 2026-10-02; after this plan lands, question 5
  is gone and later questions shift by one. Their units read their owned files
  first and should locate by content; a run that stops on a numbering mismatch
  needs a one-line ruling, not a re-plan.
- `p:plugins:inventory` regenerates `inventory.md`; a chain plan landing a pack
  change after this one regenerates it again — expect a merge conflict on that
  generated file, resolved by re-running the generator.

## Run log

| Wave | Unit         | Model | Round | Outcome                         | Detail                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Commit                     |
| ---- | ------------ | ----- | ----- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------- |
| 0    | preflight    | —     | 1     | pass                            | mise, graphify CLI present; graph reachable from main checkout; wave gate 8/8 green; no code unit, so LSP and conventions fetch skipped                                                                                                                                                                                                                                                                                                                                                                                                                | —                          |
| —    | format check | —     | —     | skipped                         | why: no covers: — the plan reads no blueprint artifact                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | —                          |
| 1    | U3           | opus  | 1     | green                           | tool-config: list added with the D6 add-plugin entry; conventions, design-session halt, bundle prose updated; DECIDED: halt drops the retired required-plugins wording; GAP: p:plugins:check red only on unknown verb add-plugin until U1 lands the schema                                                                                                                                                                                                                                                                                             | —                          |
| 1    | U4           | opus  | 1     | unresolved→widened              | q5 deleted, later questions renumbered (6/6a/6b/7→5/5a/5b/6), counts 8→7, plugin flags gone; UNRESOLVED: readme-and-license.md and tool-configs.md cite moved numbers outside Owns; GAP: orchestrator widened U4 Owns to both under D4, re-dispatched                                                                                                                                                                                                                                                                                                  | —                          |
| 1    | U2           | opus  | 1     | green                           | mise.md setup:ai section rewritten as the 7-step doctrine (D1, D2, D5, D7), add-plugin verb documented, falsified passages fixed; SKILL.md key table drops the two flags; DECIDED: add-plugin takes --for like add-tool, block markers named per mise.md's form (to verify against U1); DOCS FALSIFIED: CLAUDE.md setup:ai paragraph and "Nothing calls this CLI from a task" (U6)                                                                                                                                                                     | —                          |
| 1    | U4           | opus  | 2     | green                           | readme-and-license.md (9 citations) and tool-configs.md:72 renumbered; nothing else                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | —                          |
| 1    | U1           | opus  | 1     | green                           | setup/ai rewritten (D1, D2, D8): vwf check is the base mise block, pack blocks after it, then D2; cli.mjs drops two keys; schema.mjs + mise.mjs add add-plugin; tests +4, fixture regenerated; DECIDED: pack line is ensure_plugin "<plugin>" "<source>", source refuses shell chars; add-plugin refuses without setup/ai or its mise block; unrecorded byte-identical setup/ai is claimed; DOCS FALSIFIED: U2's prose needs those details (U2 re-dispatched)                                                                                          | —                          |
| 1    | U2           | opus  | 2     | green                           | doctrine synced to U1: base mise block, pack block shape with ensure_plugin, add-plugin --for/refusals/sorted, brownfield claim-if-identical and exact note text; p:plugins:check green                                                                                                                                                                                                                                                                                                                                                                | —                          |
| 1    | R1           | opus  | 1     | findings(4)                     | RULINGS: U1 departed from D7 (recorded setup/ai still drift-checked, mise.mjs:1189) → U1; mise.md:292, :1077 over fold width → U2; doctor/references/stack-checks.md:547 names retired agent-plugin lists, nobody-owned (rule 5) → DOCS FALSIFIED to U6, Owns widened; CONTRACT clean                                                                                                                                                                                                                                                                  | —                          |
| 1    | U2           | opus  | 3     | green                           | mise.md :292 and :1077 rewrapped to ~80 columns, wording unchanged                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | —                          |
| 1    | U1           | opus  | 2     | unresolved→widened              | existing setup/ai (recorded or not) never overwritten or drift-checked; add-plugin writes when a mise block exists; +1 test; DECIDED: all no longer moves a landed setup/ai forward (D7); UNRESOLVED: engine still hashes setup/ai in tool-config.mjs settleRecords, outside Owns; GAP: orchestrator widened U1 Owns to tool-config.mjs (hash skip only) under D7, re-dispatched                                                                                                                                                                       | —                          |
| 1    | U1           | opus  | 3     | green (no change)               | dropping the hash needs lib/record.mjs serializer + lock readers (stackgen-sync, materializer) to accept a hashless entry; orchestrator ruled option (b): keep the unread hash — D7's no-guard behaviour already holds (no drift row, no overwrite); GAP: setup/ai lock entry keeps an unused hash; tool-config.mjs widening unused                                                                                                                                                                                                                    | —                          |
| 1    | R1           | opus  | 2     | findings(3)                     | CONTRACT clean, RULINGS clean (U1 now matches D7); mise.md :1066, :579, :339 still describe pre-round-2 brownfield behaviour → U2 loop-back; cap reached, no third review — R3 re-checks these passages                                                                                                                                                                                                                                                                                                                                                | —                          |
| 1    | U2           | opus  | 4     | green                           | mise.md :339, add-plugin passage, brownfield passage now match mise.mjs (any existing setup/ai is the user's; add-plugin writes when a mise block exists, note otherwise, refused only when setup/ai is missing)                                                                                                                                                                                                                                                                                                                                       | —                          |
| 1    | U1           | opus  | 4     | green                           | wave gate code:lint red on schema.mjs:24:67 (no-useless-escape) → escape removed, same matches; lint and vitest green                                                                                                                                                                                                                                                                                                                                                                                                                                  | —                          |
| 1    | wave gate    | —     | 1     | pass                            | 8/8 green after U1 round 4 (first pass: code:lint red, attributed to U1 schema.mjs)                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | —                          |
| 1    | commits      | —     | —     | pass                            | U1 510fabfb, U2 a2bfb025, U3 d90e20ae, U4 48f54954 (first attempt aborted: pre-commit stash vs formatter on index.md; settled with code:format, re-committed)                                                                                                                                                                                                                                                                                                                                                                                          | —                          |
| 2    | U5           | opus  | 1     | security findings(2)            | from..to 225adbdc..2a9cad20; engine /security-review: no findings; reviewer: medium leading '-' in pluginRef/pluginSource can inject a CLI option (U1, cap-exempt); low pnpx @latest unpinned (D3 ruling, accepted); safe widened-source spec recorded                                                                                                                                                                                                                                                                                                 | —                          |
| 2    | U5           | opus  | 1     | review findings(5)              | from..to 225adbdc..2a9cad20; engine /code-review: 10 findings saved engine/U5-1-review.log; reviewer CHANGES: BLOCKING mise.mjs:1187 recorded-untouched setup/ai must take new asset (D7 'repo's own'); setup/ai project rows from other repos counted/updated; pnpx unguarded; marketplace update fatal → all U1; engine 6 (graphify J1 reversal unrecorded) → U6 decisions doc; engine 8 → U6; engine 7 rejected (D5); engine 10 rejected                                                                                                            | —                          |
| 2    | U1           | opus  | 5     | green                           | U5 round-1 fix: plugin/source segments must start alnum (security); recorded-untouched setup/ai replaced by new asset, edited/unrecorded → note + hash: none (tool-config.mjs 4 lines); rows filtered to user or projectPath == root; pnpx guarded; marketplace update non-fatal; +tests, vitest 530; DECIDED: 'hash: none' as record.mjs always writes a hash line; DOCS FALSIFIED: U2 mise.md → U2 re-dispatched                                                                                                                                     | 3d00549c                   |
| 2    | U2           | opus  | 5     | green                           | doctrine synced to 3d00549c: untouched landed setup/ai replaced, edited/differing → note + hash: none, add-plugin segment rule and old-landing refusal, repo-scoped rows, pnpx and marketplace warnings                                                                                                                                                                                                                                                                                                                                                | a736499e                   |
| 2    | U5           | opus  | 2     | security clean                  | from..to 225adbdc..a736499e; engine no findings; round-1 medium (leading dash) resolved; low pnpx @latest = D3 ruling, closed; projectPath field name to confirm                                                                                                                                                                                                                                                                                                                                                                                       | —                          |
| 2    | U5           | opus  | 2     | review findings(3)              | from..to 225adbdc..a736499e; engine /code-review 10 (engine/U5-2-review.log); round-1 all resolved; U1: pnpx/update/autoremove fatal under set -e (D1/D2), ~/ source unexpanded in quotes, local scope + symlinked projectPath missed; rejected: engine 1 (D1 says installed), 5, 8, 9; engine 7 on U2 (uncovered) → routed to U2 anyway as a falsified shipped doc, GAP; engine 10 → U6                                                                                                                                                               | —                          |
| 2    | U1           | opus  | 6     | green                           | U5 round-2 fix: installer/update/autoremove warn and continue; local+project rows counted when projectPath resolves (pwd -P) to root; ~/ source dropped; vitest 530; DOCS FALSIFIED: U2 mise.md → U2                                                                                                                                                                                                                                                                                                                                                   | ba10c3e0                   |
| 2    | U2           | opus  | 6     | green                           | doctrine synced to ba10c3e0 (local/project rows by resolved projectPath, warn-and-continue, no ~/ source); engine 7 fixed: hash: none only for a recorded hand-edited file; UNRESOLVED: ensure_plugin add/install unguarded → ruled under D5 (same as vwf: warn and continue) → U1                                                                                                                                                                                                                                                                     | 8132633d                   |
| 2    | U1           | opus  | 7     | green                           | D5 ruling: ensure_plugin marketplace add / user install warn and continue; stub run exits 0 with failing add/install; shellcheck, vitest 530                                                                                                                                                                                                                                                                                                                                                                                                           | 0156545e                   |
| 2    | U2           | opus  | 7     | green                           | mise.md:1056 never-aborts covers steps 3 to 7                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | 472f44d0                   |
| 2    | U5           | opus  | 3     | security clean                  | from..to 225adbdc..472f44d0; engine no findings; leading-dash fix holds; pnpx @latest = D3 ruling, closed; foreign() skip is ownership not security → code review                                                                                                                                                                                                                                                                                                                                                                                      | —                          |
| 2    | U5           | opus  | 3     | review approve, findings(5 low) | from..to 225adbdc..472f44d0; engine 10 (engine/U5-3-review.log); round-2 resolved; needs-ruling decided by orchestrator: (1) name dropped `EXTRA_*` rows → U1; (2) add-plugin refusal on old landing stays — GAP: setup ordering of mise base vs pack entries unruled; (3) second-clone duplicate user install accepted — GAP; lows 5 (stdin), 6 (foreign()) → U1; engine 9 → U2; engine 10 → U3 (uncovered, routed as falsified shipped doc, GAP); 4 → U6; 7, 8 rejected                                                                              | —                          |
| 2    | U3           | opus  | 2     | green                           | conventions.md:73-80 local/project-for-this-repo scope wording; halt adds 'then restart the session' in conventions.md and design-session SKILL.md:69                                                                                                                                                                                                                                                                                                                                                                                                  | —                          |
| 2    | U2           | opus  | 8     | green                           | mise.md step 3 rewrapped; brownfield paragraph names dropped `EXTRA_*` entries on replace; SKILL.md verbs table re-padded                                                                                                                                                                                                                                                                                                                                                                                                                              | —                          |
| 2    | U1           | opus  | 8     | green                           | U5 round-3 fix: replace of an untouched older task notes each filled EXTRA array entry it drops; addPlugin and remove skip a setup/ai owned by another source (foreign check); ensure_plugin add/install stdin from /dev/null; +tests, vitest 531                                                                                                                                                                                                                                                                                                      | —                          |
| 2    | commits      | —     | —     | pass                            | U5 round-3 fixes: U1 1ee4fda4, U2 5a96c91d, U3 997a6b68                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | 1ee4fda4 5a96c91d 997a6b68 |
| 2    | U5           | opus  | 4     | security clean                  | from..to 225adbdc..997a6b68; engine no findings (dropped EXTRA entries reach notes only; foreign skips and /dev/null remove capability)                                                                                                                                                                                                                                                                                                                                                                                                                | —                          |
| 2    | U5           | opus  | 4     | review approve — contested(3)   | from..to 225adbdc..997a6b68; engine 9 (engine/U5-4-review.log); round 3 resolved; cap reached. contested: (1) failed claude plugin list read as absent → silent no-op with exit 0 — reviewer suggests early skip-and-warn; (8) marketplace update keeps stdin; (5) disowned setup/ai reverted to shipped bytes never re-claimed. GAPs: add-plugin refuses untouched old landing (setup ordering unruled); second-clone duplicate user install; pack-format.md:240 lacks add-plugin, nobody-owned → U6 Owns widened. 2/3/4 as ruled, 7 → U6, 9 rejected | —                          |

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the fresh session's worktree — cut from the integration branch — can see it.

Run in a fresh session:

/vwf:execute docs/plans/2026-10-03-setup-ai-validates-vwf

or let the queue pick it, by priority:

/vwf:execute next
