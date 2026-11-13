# CLAUDE.md

## Rules

- ALWAYS ask user before running a `p:release`, `p:i:release`,
  `p:plugins:release` or `p:site:release` task — `--dry-run` alone excepted
- **Docs ship with the change.** Any change to plugin behavior must reconcile
  `readme.md`, this file, and the manual under `site/src/content/docs/` in the
  same commit — stale docs are more harmful than no docs

## What This Repo Is

A multi-agent plugin toolkit (`virajp-plugins`) containing `stackgen`, which
generates a repo's LSP servers into one local plugin, and `vwf` — a full
Product → Blueprint → Plan → Execute workflow plugin (with post-deploy
verify + production-feedback intake).

The repo also ships a small **installer CLI** (`@virajp.dev/claude-plugins`),
which sequences Claude's own plugin commands and nothing else — see The
installer CLI.

It also ships the **website** (`site/`) — the Astro build of the user manual,
published at `https://claude-plugins.virajp.dev` — see Four projects, four
homes.

### Four projects, four homes

This file is the repo-wide map. Each project carries its own context, rules and
traps, loaded the moment you work in its tree — **look there first**, and put a
project-specific fact there, not here:

| Project            | Context lives in                        | Loads when                         |
| ------------------ | --------------------------------------- | ---------------------------------- |
| `installer/`       | [`installer/CLAUDE.md`][icl]            | Claude reads or edits `installer/` |
| `plugins/vwf/`     | [`.claude/skills/vwf-plugin/`][vwf]     | editing `plugins/vwf/**`           |
| `plugins/stackgen` | [`.claude/skills/stackgen-plugin/`][sg] | editing `plugins/stackgen/**`      |
| `site/`            | [`site/CLAUDE.md`][scl]                 | Claude reads or edits `site/`      |

The two plugin homes are path-scoped skills rather than nested CLAUDE.md files
on purpose: `plugins/<name>/` is the installed shape, so a file there ships to
every user and is scanned by `p:plugins:check`'s prose rules. The installer and
site trees are not shipped (npm publishes `bin/` alone, and the site deploys
only its build output), so their context can sit in place.

### Where the detail lives

Each row below is loaded **on demand** — follow the link when you need more than
the summary here. The `.claude/skills/` rows also auto-apply the moment you edit
the tree they govern; `release` is a slash command; a change to this repo is
planned with `/vwf:plan` (a blueprint slice) or `/vwf:change-plan` (anything
else), each of which **lands the approved folder** on the integration branch
through git-workflow's `land.mjs` together with its row in
`docs/plans/index.json`, the **one plan
index**, created once with the Write tool and validated, every later change made
through `plan.mjs set`, `append` or `remove`, and a folder's waves renumbered by
the planner through `plan.mjs rewave`, after `plan.mjs set` gives each unit
moving above wave 1 its `waits` reason — `/vwf:plan` printing the launch line
only once `/vwf:backlog unplanned` finds nothing left to plan at its priority,
else the next item to plan, and `/vwf:change-plan` always printing it, with the
next item to plan above it when one is left — and run, in a fresh context, by
the one executor, `/vwf:execute <folder>` — or `/vwf:execute next`, which reads
that index alone, of either kind, and picks the runnable plan with the lowest
`priority` value, or `/vwf:execute all`, which runs every runnable plan in turn,
each in its own `execute-runner` subagent, until one stops — which refuses a
folder that is not on that branch, and starts with one script call, `start.mjs`,
that runs its start checks and claims the row `RUNNING`
with a commit landed through `land.mjs` — never a direct commit — before it
cuts a worktree — the same commit writing the
folder's `run`, the worktree and action-log paths — and marks it `COMPLETE` once
the merge lands (archiving the folder there and re-pointing the row when no gap
is open; leaving it live when one is, archived once you ask) — each plan folder
carries this repo's gate lines in three tiers (a unit gate before each unit
commit, a wave gate after each wave, a plan gate once at the end),
`mise run p:plugins:local` as an after-landing step, recorded `run` at the
interview or dropped, and the release levels it derives per project, which
`/vwf:execute` writes to `.config/releases.yaml` at landing: it runs the step on
a green landing without a prompt, bumps no version, releases nothing, and at run
time asks you only what the plan missed — one question at a time, the
recommendation first, the answer recorded in the folder's `decisions` — beside
the run-level questions `/vwf:execute all` asks once, before its first plan;
every stop is a report with its resume command. A repo still on the old markdown
plan format (a `docs/plans/index.md`) is stopped before any change and pointed
to `docs/plans/migrate.md`.

| Read                                                         | For                                                                                                                                                                                                                                                                                                                                                           |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`.claude/docs/repo-shape.md`][repo]                         | the one authored tree, what the installer writes, the mise tasks, the traps                                                                                                                                                                                                                                                                                   |
| [`.claude/docs/plugins.md`][plug]                            | the full plugin inventory, the native manifest shape, the generated marketplace manifest                                                                                                                                                                                                                                                                      |
| [`.claude/docs/ci-and-releases.md`][ci]                      | the mise environments, the branch model, the three tag families, the workflows, the rituals                                                                                                                                                                                                                                                                   |
| [`.claude/docs/dev-marketplace.md`][dev]                     | running the plugins you are editing — setup, the refresh loop, and why `update` is not it                                                                                                                                                                                                                                                                     |
| [`installer/CLAUDE.md`][icl]                                 | the installer — flags, the read-only receipt path, the interactive uninstall, testing                                                                                                                                                                                                                                                                         |
| [`site/CLAUDE.md`][scl]                                      | the website — the tree, the link rule, the gate, the release model, the design source, traps                                                                                                                                                                                                                                                                  |
| [`.claude/skills/vwf-plugin/`][vwf]                          | vwf's own shape — skills, agents, assets, hooks, adding a skill, the docs tree it maintains                                                                                                                                                                                                                                                                   |
| [`.claude/skills/stackgen-plugin/`][sg]                      | stackgen's own shape — the dispatch rule, packs and bundles, where output lands, consent                                                                                                                                                                                                                                                                      |
| [`.claude/skills/plugin-authoring/`][auth]                   | the sixteen checker rules, the invocation frontmatter, the plugin-root trap, dprint exclusions                                                                                                                                                                                                                                                                |
| [`.claude/skills/skill-kit/`][kit]                           | the standard for every skill — archetypes, the lint, the scaffold, and the rule ledger that proves a rewrite keeps every rule                                                                                                                                                                                                                                 |
| [`.claude/skills/release/`][rel]                             | the release ritual, the note format, the CI facts that make a failed publish legible                                                                                                                                                                                                                                                                          |
| [`site/src/content/docs/plugins/vwf.md#vwfchange-plan`][chg] | planning a change to this repo with the ad-hoc planner — the interview, the folder; running it is [`/vwf:execute`][chge] — waves, the gate, after-landing steps; the how-to is [`how-to/operate/ad-hoc-change.md`][chgh]. A blueprint slice is the guarded planner, [`#vwfplan`][pln], run by the same [`#vwfexecute`][exe] — the same folder shape and index |

[repo]: .claude/docs/repo-shape.md
[plug]: .claude/docs/plugins.md
[ci]: .claude/docs/ci-and-releases.md
[dev]: .claude/docs/dev-marketplace.md
[icl]: installer/CLAUDE.md
[scl]: site/CLAUDE.md
[vwf]: .claude/skills/vwf-plugin/SKILL.md
[sg]: .claude/skills/stackgen-plugin/SKILL.md
[auth]: .claude/skills/plugin-authoring/SKILL.md
[kit]: .claude/skills/skill-kit/SKILL.md
[rel]: .claude/skills/release/SKILL.md
[chg]: site/src/content/docs/plugins/vwf.md#vwfchange-plan
[chge]: site/src/content/docs/plugins/vwf.md#vwfexecute
[chgh]: site/src/content/docs/how-to/operate/ad-hoc-change.md
[pln]: site/src/content/docs/plugins/vwf.md#vwfplan
[exe]: site/src/content/docs/plugins/vwf.md#vwfexecute

The user-facing docs are a different tree and a different audience: `readme.md`,
and `site/src/content/docs/{installer,plugins,how-to}/`, published as the
website at `https://claude-plugins.virajp.dev`.

### One authored tree

Plugins are **authored natively for Claude Code**, once, and installed by
Claude's own plugin commands. What you edit is exactly what a user gets:

```text
plugins/<plugin>/          the authored source, and the installed shape
  .claude-plugin/plugin.json   the manifest
  skills/ agents/ hooks/ assets/ stacks/ vendor/ types/
  ↓  scripts/src/marketplace.ts
.claude-plugin/marketplace.json    generated at the repo root, committed
.dev-marketplace/                  generated too — the authoring machine's, gitignored

installer/src/**                 installer source (TypeScript)
  ↓  tsup
bin/installer.mjs          gitignored build output — the published entrypoint
scripts/src/**             repo tooling: the generator and the checker
sunset/**                  the retired @askviraj/ai-plugins stub — standalone, never built, published by hand once
site/**                    the website (Astro) — src/content/docs/ is the user manual
  ↓  astro build + pagefind
site/dist/                 gitignored build output — deployed on a site-v* tag
```

**Two files are generated**, both projections of the same 2 plugin manifests and
differing in exactly one field per entry — `source`:

| File                                               | Is                                                                                                                                                                                                                  |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.claude-plugin/marketplace.json`                  | **published** — what users read from `main`. `git-subdir` at a per-plugin tag, so a merge ships nothing until `p:plugins:release` cuts it                                                                           |
| `.dev-marketplace/.claude-plugin/marketplace.json` | **local authoring only**, gitignored and never published. Repo-relative sources into `.dev-marketplace/plugins/`, the staged copies `p:plugins:local` writes under `X.Y.Z+N`, so this machine runs the working tree |

The dev marketplace is what lets the toolkit be **used before it is published**
— without it, the author runs the last release and a plugin edited today reaches
nobody, including them. Both declare the **same marketplace `name`**, which is
load-bearing: a plugin's `dependencies` edge names its marketplace by name, so
vwf installed from a differently-named one would send its `stackgen` edge back
to the tagged marketplace and fail on a tag that does not exist yet. A machine
registers one or the other, never both. Setup and the refresh loop are
[`.claude/docs/dev-marketplace.md`](.claude/docs/dev-marketplace.md).

Note the three neighbours that read confusingly: `.claude-plugin/` is the
published manifest, `.dev-marketplace/` is the local one, and `.claude/` is this
repo's own skills, docs, agents and worktrees. None of them is `plugins/`.

The template layer and the four render trees this replaced, and the receipts the
installer no longer writes, are in [`repo-shape.md`][repo].

### Tasks

Run in `plugins.yml` (never in `release.yml`, which is the installer's and whose
trigger surface must stay untouched, and never in `site.yml`, which is the
website's); the first four also run locally via pre-commit, with marketplace,
inventory and check in that order — freshness before validity:

- **`p:plugins:marketplace`** — generates **both** marketplace manifests from
  the 2 plugin manifests, plus the `.dev-marketplace/plugins/` staging directory
  the dev sources resolve into; **`--check`** fails if the committed file
  differs, or if that path is the retired symlink.
- **`p:plugins:inventory`** — generates `plugins/stackgen/stacks/inventory.md`
  from the stacks tree, so no pack, bundle or kind count is ever typed by hand;
  **`--check`** fails if the committed file differs. Generation itself fails a
  bundle whose `<type>/<slug>@<version>` pin is malformed, names no pack, or
  pins a version that pack no longer carries — `@generated` refs name no pack by
  design and are skipped.
- **`p:plugins:check`** — validates the authored tree, sixteen rules, rule 15
  retired and the rest keeping their numbers: the manifest (rule 1 refuses a
  version with a 13 or 17 component), a pack's `config/` payload — under
  `.config/` only `test/` and `p/_project/` tasks, no `templates/` folder, no
  retired `tool-config:`, `machine_env:`, `values:`, `conditional:` or
  `user_mcp_servers:` key, since the toolchain is bootstrap's and the user
  installs every MCP server (rule 11), no plugin-relative citation in
  anything
  that lands (rule 13), one `default: true` bundle per axis per platform (rule
  14), a skill's node script shebanged, executable and dependency-free (rule
  16),
  and no bare `mise use` anywhere a plugin ships (rule 17). Each rule in full is
  the [`plugin-authoring`][auth] skill's `references/checks.md`.
- **`p:plugins:npm-normalize-test`** — table-tests the `npm-normalize.sh` hook
  through the system sed, for both package managers.
- **`p:releases:test`** — table-tests the release-level functions in
  `.config/mise/tasks/_scripts/local`, the 13/17 skip and "highest wins" among
  them. In `plugins.yml`, not in pre-commit.
- **`vitest run`** — the `scripts/` and `installer/` suites.
- **`tsc --noEmit`** per TypeScript project — `installer/` and `scripts/`.
- **`p:site:check`** — the website's gate: `astro check`, `p:site:build` (Astro
  plus the pagefind index), then the link checker over `site/dist/**/*.html` and
  the markdown mirror it also emits (`dist/**/*.md`, `llms.txt`,
  `llms-full.txt`, plus each page's markdown alternate link). Runs in
  `site.yml`, not `plugins.yml`, and not in pre-commit. Beside it:
  **`p:site:dev`**, **`p:site:build`**, **`p:site:icons`** (rasterizes the
  committed favicon set, by hand when the mark changes), **`p:site:version`**
  (kept for hand use) and **`p:site:release`**, which bumps, merges and tags —
  see CI & Releases.

Beside them the local gate runs **tool-neutral hooks** — `format`, `lint` and
`sec` among them — each of which calls a mise task rather than a tool. Those
hooks, the `setup:*` and `code:*` tasks and their configs are
[bootstrap](https://github.com/virajp/bootstrap)'s, synced into this repo like
any
other. No plugin uses graphify or mempalace any more.

What each rule asserts, and what the checker deliberately no longer checks, is
in [`repo-shape.md`][repo].

### Traps worth knowing

- **Only the published manifest is committed.** `.dev-marketplace/`, `bin/`,
  `site/dist/`, `site/.astro/` and the per-package `dist/` are gitignored. The
  published manifest is meant to be diffed in review; a bundle diff is noise,
  and a second committed file declaring the marketplace name `virajp-plugins` is
  a footgun on the branch users read. So `p:plugins:marketplace --check` reports
  an **absent** dev manifest as not applicable — the normal state in CI and in a
  fresh clone — and a **present but stale** one as a failure.
- **`claude plugin marketplace add` needs a path that looks like one.**
  `add .dev-marketplace` is rejected with *"Invalid marketplace source format"*;
  `add ./.dev-marketplace` works. The leading `./` is not optional.
- `CLAUDE.md`, `installer/CLAUDE.md`, `site/CLAUDE.md` and `readme.md` **are**
  dprint-formatted, so widening one table cell re-pads every row.
  `plugins/**/*.md` is **not** formatted — match the surrounding fold width by
  hand. `**/*.astro` **is** dprint's, via the markup plugin, and is ignored by
  the linter in `.config/linter.yaml`: the linter has no Astro parser. There is
  no pre-commit argument list to exclude it from any more — the `lint` hook
  calls `code:lint`, which runs the house linter over the whole tree, so every
  linter exclusion lives in
  `.config/linter.yaml` and nowhere else.
- **`plugins/*/stacks/*/*/config/` is excluded whole, and the reason is not
  style.** That tree is **payload**: it is copied byte-for-byte into a target
  repo, where the dprint config bootstrap syncs there formats it. Format a
  payload file here under a different config and a freshly shaped repo fails its
  own first hook run on a file nobody touched. The exclusion is on the
  **directory**, so a new payload file type cannot silently re-acquire the
  defect. When a payload file needs formatting, run bootstrap's config over it,
  never this repo's overrides.
- The authoring traps — strict-YAML frontmatter dropping a skill silently, the
  dprint exclusion, and `${CLAUDE_PLUGIN_ROOT}` naming only its own plugin — are
  in `.claude/skills/plugin-authoring/`.

## Plugins

Two plugins ship. Each row's linked home is authoritative; the cells are an
index.

| Plugin     | Is                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `vwf`      | The flagship: the Product → Blueprint → Plan → Execute workflow, its subagents, `init` (the repo-shape orchestrator, reached through `/vwf:setup`), the two planners `plan` and `change-plan`, one executor `execute`, writing and running one plan folder shape, the `docs/memory/` file store, the `/vwf:execute` action log (five command hooks and one append-only JSONL file per plan under `~/Library/Caches/vwf/`), and the `/vwf:execute` progress pane (a TypeScript hooks module, `/vwf-monitor`). Ships **no** MCP server: the user installs any MCP server, and the agent asks for it. Names **no** technology. Depends on `stackgen` alone. → [`vwf-plugin`][vwf]                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `stackgen` | The principles-driven stack materializer — shipped packs for the covered path, a generator for the uncovered tail that researches with Context7 first when Context7 is installed, else the official documentation and the package registries, and never halts on or asks for Context7, the `addon` axis of optional tools (`taste-skill`) picked in `/vwf:architecture` and recorded in `addons:`, `vwf-tools`, the one local plugin holding every LSP server a repo materializes. It installs no MCP server: a pack that needs one names it in its `conventions.md`, and the user installs it. Every universal file a repo runs — the mise config and task library, the gates, the hooks, git, the editor settings — is [bootstrap](https://github.com/virajp/bootstrap)'s, and a repo's values are its `.config/bootstrap.toml`. A pack ships no toolchain: its tool pins, gates and generic tasks are bootstrap's, which the materializer reads from a clone and asks for through bootstrap's `docs/sync/vwf.md`; a pack's `config/` payload is its `test/` and `p/_project/` tasks. `/vwf:init` reaches bootstrap through its readme prompt and writes its own hygiene assets. → [`stackgen-plugin`][sg] |

Full inventory, the native manifest shape, and the generated marketplace
manifest: [`.claude/docs/plugins.md`][plug]. Authoring doctrine that applies to
both — the checker rules, the two mise gates, the hook rules, the traps — is the
[`plugin-authoring`][auth] skill, which auto-applies under `plugins/`.

The workflow runs `setup` → `product` → `architecture` → `design-system` →
`blueprint` → `plan` → `execute`, with `verify` and `feedback` closing the loop.
`init` is **skill-invoked**, reached only from `setup` (Step 0's offer, or
`/vwf:setup reshape`), and shapes the base repo and every member repo on one
consent. **Architecture decides the stack and setup pins it.** **Everything up
to `blueprint` is done in full before planning.** The ad-hoc planner
`change-plan` sits beside that line; both planners write one folder shape into
one plan index, and one executor, `execute`, runs both, each unit's `kind` in
the folder's `index.json` deciding what runs over it. How `init` surveys, asks
and adopts, what it records in `.config/vwf.yaml` — `enforcement.kept_files`
alone; a repo's answers live in its own `.config/bootstrap.toml`, written by
bootstrap — the materialize pass, the ordering gates, the skill and
agent tables, and the dependency reasoning are the [`vwf-plugin`][vwf] skill.

## The installer CLI

`@virajp.dev/claude-plugins`, run as `pnpx @virajp.dev/claude-plugins …`, does
two things: **plugin installs as a thin wrapper** that sequences Claude's own
marketplace registration and plugin install commands, and **`--uninstall`**. It
never edits Claude's settings itself and writes **no receipt**. `installer/` is
the source; `bin/` is the tsup output, is gitignored, and is what npm publishes.
The statusline is a separate package (`claude-status`), not a plugin and not
installed here.

**It is the one-shot, not a repo's reconcile step.** A repo shaped by
`/vwf:init` keeps its plugins current with bootstrap's `setup:ai` task.

Everything else — the flag surface, the legacy-receipt reader, the interactive
uninstall, the GitHub token rule, testing — is [`installer/CLAUDE.md`][icl]; the
user-facing reference is `site/src/content/docs/installer/`, published at
`https://claude-plugins.virajp.dev/installer/`.

## CI & Releases

**`develop` takes the work; `main` is what users read** — Claude resolves the
marketplace against the default branch, so `main` stays default and PRs target
`develop`. `main` is merge-only, enforced by pre-commit locally and a ruleset
remotely. The landing model is **per branch** — `[branch.<branch>].merge_model`
in `.config/bootstrap.toml`, `direct` or `pr`, a missing file or key reading
`direct`. A release task bumps, commits on `develop`, merges to `main` with
`code:merge:main`, and only then tags — so `main` stays merge-only; that full
sequence refuses unless `[branch.main].merge_model` is `direct`.

Every plugin is pinned to its own tag in the marketplace manifest, which is what
decouples **merged** from **released**. Three tag families, all namespaced:

| Tag                    | Releases                     | Triggers                       |
| ---------------------- | ---------------------------- | ------------------------------ |
| `<name>-v<version>`    | one plugin                   | nothing — refs resolve to it   |
| `installer-v<version>` | `@virajp.dev/claude-plugins` | `release.yml` → npm publish    |
| `site-v<version>`      | the website                  | `site.yml` → `wrangler deploy` |

A tracked plugin version is always plain `X.Y.Z` — `p:plugins:check` fails one
carrying build metadata. The `X.Y.Z+N` the authoring machine runs between
releases exists only in the gitignored staged copies `mise run p:plugins:local`
writes, so `claude plugin update` sees each edit without a commit.

**13 and 17 are never issued as a version component** — the two plugin
manifests, the installer, the site, `config_format`, `blueprint_format` alike.
`p:plugins:check` refuses such a manifest; the release tasks — and `p:i:version`
and `p:site:version`, which they call — **skip past** the number, computing the
target first, stepping the bumped component past a 13 or 17 and printing what
they skipped, refusing before they write anything when the level cannot reach
the forbidden component; all three release tasks **refuse** to tag one. The
guard is four functions in `.config/mise/tasks/_scripts/local`, this repo's own
sidecar beside bootstrap's `helpers`, which no pack file may source; the
release-level functions sit beside it — `releases_level`, `releases_raise`,
`releases_clear`, `level_max`, `level_implied` and `release_target`, over a
private `level_rank`. Versions issued before the rule stand, and the `+N`
staging counter is not a component.

**A release is two stages, and only the second reaches anyone else.** Local
first — `mise run p:plugins:local` stages the changed plugins into the dev
marketplace and updates this machine's install, publishing nothing and cutting
no tag, so `/vwf:execute` takes it as the plan's after-landing step — run
without a prompt on a green landing, as the plan records it `run`, and named in
`.config/vwf.yaml`'s `after_landing:` so every landing here runs it — and a
staged plugin loads in the next **restarted** session. Public second — the tags.

**No person and no plan bumps a version by hand**, and a tracked version moves
only at release. A plan records each project's release level, and `/vwf:execute`
raises it in `.config/releases.yaml` at landing. The release tasks read it: each
bumps its project from the last tag at the higher of the recorded level and the
one an untagged manifest implies, never below the manifest, and clears its own
keys; `p:release` runs all three with one bump commit and one merge, then tags
each. **Ask the user before running `p:release`, `p:plugins:release`,
`p:i:release` or `p:site:release`** — always; no plan carries a release step.

The mise environment split, the four workflows and why `deps-update.yml`
dispatches rather than calls `release.yml`, the supply-chain settings and the
one-time npm setup are [`.claude/docs/ci-and-releases.md`][ci]. The release
ritual itself is the [`release`][rel] skill — run `/release`.

## Hooks

What ships as a plugin hook today is vwf's only — the five `/vwf:execute`
action-log hooks (`PreToolUse`, `PostToolUse`, `SubagentStart`, `SubagentStop`
and `SessionEnd`, each running `hooks/action-log.sh`, which exits at once unless
a run is logging; on `SessionEnd` it appends `session.end` and deletes the
session's run marker), plus one hooks module, `hooks/monitor/register.tsx`,
listed under `modules` in `hooks/hooks.json`, which draws the `/vwf:execute`
progress pane against the state contract the manifest's `types` key names — and
is the [`vwf-plugin`][vwf] skill's. The pane shows any plan of
`docs/plans/index.json` or of its archive, in any status, with a plan list, and
the plan's times from its row, its state and the unit, wave and stage times from
that folder's `index.json` — the copy in the run's worktree, else the main
checkout's; `plan.mjs` stamps every `started` and `ended` as it sets a status —
and from the plan's action log only each unit's agent, the log's freshness,
which tells a live run from a paused one, and the open questions — a `question`
event with no later `answer` — which show a run waiting for your answer. One
more script ships as a **stackgen pack payload** copied into a target repo
rather than discovered here, covered by the [`stackgen-plugin`][sg] skill. The
three host rules that bite any command hook — BSD `sed`, never in
`settings.json`, the per-event verdict shape — and the local gates of a hooks
module are the [`plugin-authoring`][auth] skill's.

## Adding a Plugin

1. Create `plugins/<name>/.claude-plugin/plugin.json` with `name`, `version`
   (what an install pins to; plain `X.Y.Z`, bumped to ship changes) and
   `description`.
2. Run `mise run p:plugins:marketplace` and stage the result.
3. Give it a home: a path-scoped skill under `.claude/skills/<name>-plugin/`,
   and a row in the two tables above.

There is no second place to register it: the marketplace manifest is generated
from the manifests, so step 2 *is* the registration.

## Installation (end-user)

```sh
# The wrapper: registers the marketplace and installs in one run
pnpx @virajp.dev/claude-plugins --all                      # vwf (+ stackgen) at user scope
pnpx @virajp.dev/claude-plugins --project <plugin-name>    # into this repo

# Or Claude's own commands directly — the same thing, unsequenced
claude plugin marketplace add --scope user virajp/claude-plugins
claude plugin install --scope project <plugin-name>@virajp-plugins
```

Available plugin names: `vwf`, `stackgen`. Every one of them is authored here —
no name on this list is re-listed from another repo. (The statusline is not
among them and is not a plugin — it is a separate package,
`brew install virajp/tap/claude-status`.)

Installing `vwf` pulls in its dependency (`stackgen`) automatically from the
same `virajp-plugins` marketplace — no other marketplace needs to be registered.
`mempalace` is not a name here at all — vwf's memory is the `docs/memory/` file
store, and `devtools` is not one either — its toolchain and gate doctrine ships
inside `stackgen`. **A machine that installed `devtools` before it dissolved
must uninstall it by hand** (`claude plugin uninstall devtools`): an update
simply stops listing it as a dependency, leaving it enabled and its stale skills
shadowing the stackgen packs they moved into. The reasoning is
[`dependencies.md`](.claude/skills/vwf-plugin/references/dependencies.md).

**On a repo that has been shaped, the reconcile step is the repo's own.**
`mise run setup:ai` is bootstrap's task. A pack names a plugin of its own in its
`conventions.md`, and the materializer asks bootstrap to install it — no pack
ships a `setup:ai` task. The installer above is the one-shot for a person; this
is what a checkout re-runs.

Upgrading is `claude plugin marketplace update virajp-plugins` then
`claude plugin update <name>`. The **manifest** is served from this repo's
`main`, which `plugins.yml` validates on every push; each plugin's **content**
comes from the `<name>-v<version>` tag that manifest pins it to. So a merge to
`main` no longer reaches users — only a tag does, which is what
`mise run p:plugins:release` cuts. The `marketplace update` step is what picks
up new refs, and it is not optional: without it `plugin update` re-reads the
same pins and finds nothing.

**Nothing is gated at install time**, so the first thing to run afterwards is
`/vwf:doctor` — it is what reports a missing required binary, as a **blocking**
finding. On a repo that has never been shaped, run `/vwf:setup` — its Step 0
offers `init`, which lays down the config layout and the gates the rest of the
workflow assumes — in that repo and every member repo it has — and
`/vwf:setup reshape` runs that pass alone on a product that has drifted.

For **other agents** there is no marketplace and no rendered tree: point the
tool at this repo and ask it to adapt the plugin. `readme.md`'s "Other tools"
section carries the prompts and states plainly what is and is not promised.
