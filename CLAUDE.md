# CLAUDE.md

## Rules

- ALWAYS ask user before running a `p:release`, `p:i:release`,
  `p:plugins:release` or `p:site:release` task — `--dry-run` alone excepted
- **Docs ship with the change.** Any change to plugin behavior must reconcile
  `readme.md`, this file, and the manual under `site/src/content/docs/` in the
  same commit — stale docs are more harmful than no docs

## What This Repo Is

A multi-agent plugin toolkit (`virajp-plugins`) containing MCP servers and `vwf`
— a full Product → Blueprint → Plan → Execute workflow plugin (with post-deploy
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
else), each of which **commits and pushes the approved folder** on the branch it
was planned on together with its row in `docs/plans/index.md`'s **one table**,
and run, in a fresh context, by the one executor, `/vwf:execute <folder>` — or
`/vwf:execute next`, which reads that table alone, of either kind, and picks the
runnable plan with the lowest `Priority` value, or `/vwf:execute all`, which
runs every runnable plan in turn, each in its own `execute-runner` subagent,
until one stops — which refuses a folder that is not on that branch, claims the
row `RUNNING` with a pushed commit before it cuts a worktree, and marks it
`COMPLETE` once the merge lands (archiving the folder there and re-pointing the
row when no gap is open; leaving it live when one is, archived once you ask) —
each plan folder carries this repo's gate lines, `mise run p:plugins:local` as
an after-landing step, recorded `run` at the interview or dropped, and the
release levels it derives per project, which `/vwf:execute` writes to
`.config/releases.yaml` at landing: it runs the step on a green landing without
a prompt, bumps no version, releases nothing, and asks nothing at run time, save
the run-level questions `/vwf:execute all` asks once, before its first plan —
every stop is a report with its resume command.

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
| [`.claude/skills/plugin-authoring/`][auth]                   | the seventeen checker rules, the invocation frontmatter, the plugin-root trap, dprint exclusions                                                                                                                                                                                                                                                              |
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
  skills/ agents/ hooks/ assets/ stacks/ vendor/
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
- **`p:plugins:check`** — validates the authored tree, seventeen rules: the
  manifest (rule 1 refuses a version with a 13 or 17 component), a pack's
  `config/` payload and `templates/` folder — no `tool-config:` or
  `machine_env:` key, a `values:` list matching the templates' `@@` names both
  ways, no reserved slug (`all`, `ai`, `_base`), a subtask's leaf its own slug,
  mise files in its own `conf.d/<slug>/` alone — and each `stackgen:tool-config`
  `assets/` and `templates/` tree (rule 11), no plugin-relative citation in
  anything that lands (rule 13), one `default: true` bundle per axis per
  platform (rule 14), one formatter exclusion set with gitleaks' allowlist a
  subset of it (rule 15), a skill's node script shebanged, executable and
  dependency-free (rule 16), and no bare `mise use` anywhere a plugin ships
  (rule 17). Each rule in full is the [`plugin-authoring`][auth] skill's
  `references/checks.md`.
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

Beside them the local gate runs **three tool-neutral hooks** — `format`, `lint`
and `sec` — each of which calls a mise task (`code:format --fix`,
`code:lint --fix`, `code:sec --staged`) rather than a tool. dprint, the house
linter and gitleaks are configured **once**, inside those tasks; no hook names a
binary — and no gate lints or formats shell. The shape `stackgen:tool-config`
lands is the same hook-to-task path with one hook more: its hooks call
`code:format:all --fix`, `code:lint:all --fix`, `code:check:all` and
`code:sec --staged`, each `…:all` task calling every subtask beside it, shell
and workflow linting among them — this repo's own
`.config/pre-commit-config.yaml` keeps the older names until it is edited by
hand. graphify's graph is refreshed the same way: a `graphify-refresh` hook runs
`code:graph`, in place of graphify's raw git hooks — at `post-commit` and
`post-merge` in the shape `stackgen:tool-config` lands, at `post-commit` alone
in this repo's own `.config/pre-commit-config.yaml` until it is edited by hand.

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
  calls `code:lint` (`code:lint:all` in the shape tool-config lands), which runs
  the house linter over the whole tree, so every linter exclusion lives in
  `.config/linter.yaml` and nowhere else.
- **`plugins/*/stacks/*/*/config/` is excluded whole, and the reason is not
  style.** That tree is **payload**: it is copied byte-for-byte into a target
  repo, where the dprint config `stackgen:tool-config` lands formats it — and
  that config deliberately omits the `bracketSpacing`/`braceSpacing` this repo
  sets. Format a payload file here and a freshly initialised repo fails its own
  first hook run on a file nobody touched. The exclusion is on the
  **directory**, so a new payload file type cannot silently re-acquire the
  defect. When a payload file needs formatting, run the **shipped** config over
  it, never this repo's.
- The authoring traps — strict-YAML frontmatter dropping a skill silently, the
  dprint exclusion, and `${CLAUDE_PLUGIN_ROOT}` naming only its own plugin — are
  in `.claude/skills/plugin-authoring/`.

## Plugins

Two plugins ship. Each row's linked home is authoritative; the cells are an
index.

| Plugin     | Is                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `vwf`      | The flagship: the Product → Blueprint → Plan → Execute workflow, its subagents, `init` (the repo-shape orchestrator, reached through `/vwf:setup`), the two planners `plan` and `change-plan`, one executor `execute`, writing and running one plan folder shape, the guarded `rtk` hook, the two mempalace auto-save hooks, and two MCP servers. Names **no** technology. Depends on `stackgen` alone. → [`vwf-plugin`][vwf]                                                                                                                                                                                                                                                                                                                     |
| `stackgen` | The principles-driven stack materializer — shipped packs for the covered path, a Context7-researched generator for the uncovered tail, and the repo's own toolchain manager, gates and hygiene since `devtools` dissolved into it. `stackgen:tool-config` owns the mise, dprint, taplo, pre-commit, gitleaks, grype, house linter, git, graphify, editor and statusline configs — a shipped node script copies its `assets/` and renders its `templates/` from `.config/stackgen.yaml`, exact pins only where CI loads them — and a pack ships `config/` payload, its subtasks among it, and a `templates/` folder the script renders, asking it for no line. `/vwf:init` lands them and writes its own hygiene assets. → [`stackgen-plugin`][sg] |

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
one plan index, and one executor, `execute`, runs both, each unit's `Kind`
deciding what runs over it. How `init` surveys, asks and adopts, what it records
in `.config/vwf.yaml` — `enforcement.kept_files` alone; a repo's answers live in
its own `.config/stackgen.yaml`, written by `stackgen:tool-config` — the
materialize pass, the ordering gates, the skill and agent tables, and the
dependency reasoning are the [`vwf-plugin`][vwf] skill.

## The installer CLI

`@virajp.dev/claude-plugins`, run as `pnpx @virajp.dev/claude-plugins …`, does
two things: **plugin installs as a thin wrapper** that sequences Claude's own
marketplace registration and plugin install commands, and **`--uninstall`**.
graphify is not its job — the skills own it. It never edits Claude's settings
itself and writes **no receipt**. `installer/` is the source; `bin/` is the tsup
output, is gitignored, and is what npm publishes. The statusline is a separate
package (`claude-status`), not a plugin and not installed here.

**It is the one-shot, not a repo's reconcile step.** A repo shaped by
`/vwf:init` keeps its plugins current with the task library's `setup:ai:all`,
whose universal subtask `setup:ai:base` calls this CLI only when `vwf` is
installed at no scope that serves the repo —
`pnpx @virajp.dev/claude-plugins@latest --all`, at user scope — and otherwise
runs `claude plugin …` alone, so a machine that registered `virajp-plugins` from
`./.dev-marketplace` is served by the same task as one that registered it from
the forge.

Everything else — the flag surface, the legacy-receipt reader, the interactive
uninstall, the GitHub token rule, testing — is [`installer/CLAUDE.md`][icl]; the
user-facing reference is `site/src/content/docs/installer/`, published at
`https://claude-plugins.virajp.dev/installer/`.

## CI & Releases

**`develop` takes the work; `main` is what users read** — Claude resolves the
marketplace against the default branch, so `main` stays default and PRs target
`develop`. `main` is merge-only, enforced by pre-commit locally and a ruleset
remotely. The landing model `stackgen:tool-config` lands is **per branch** —
`MERGE_MODEL_DEVELOP` and `MERGE_MODEL_MAIN`, `direct` or `pr` — but this repo's
own `.config/mise/conf.d/_base/mise.toml` still carries the legacy single
`MERGE_MODEL`, read as both, until its next `/vwf:setup reshape`. A release task
bumps, commits on `develop`, merges to `main` with `code:merge:main`, and only
then tags — so `main` stays merge-only; that full sequence refuses unless both
merge models into `main` are `direct`.

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
sidecar beside the pack-owned `helpers`, which no pack file may source; the
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
one an untagged manifest implies, and clears its own keys; `p:release` runs all
three with one bump commit and one merge, then tags each. **Ask the user before
running `p:release`, `p:plugins:release`, `p:i:release` or `p:site:release`** —
always; no plan carries a release step.

The mise environment split, the four workflows and why `deps-update.yml`
dispatches rather than calls `release.yml`, the supply-chain settings and the
one-time npm setup are [`.claude/docs/ci-and-releases.md`][ci]. The release
ritual itself is the [`release`][rel] skill — run `/release`.

## Hooks

What ships as a plugin hook today is vwf's only — the guarded `rtk` Bash hook
and the two mempalace auto-save hooks — and is the [`vwf-plugin`][vwf] skill's.
One more script ships as a **stackgen pack payload** copied into a target repo
rather than discovered here, covered by the [`stackgen-plugin`][sg] skill. The
three host rules that bite any hook — BSD `sed`, never in `settings.json`, the
per-event verdict shape — are the [`plugin-authoring`][auth] skill's.

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
`mempalace` is not a name here at all — its memory layer ships inside `vwf`, and
`devtools` is not one either — its toolchain and gate doctrine ships inside
`stackgen`. **A machine that installed `devtools` before it dissolved must
uninstall it by hand** (`claude plugin uninstall devtools`): an update simply
stops listing it as a dependency, leaving it enabled and its stale skills
shadowing the stackgen packs they moved into. The reasoning is
[`dependencies.md`](.claude/skills/vwf-plugin/references/dependencies.md).

**On a repo that has been shaped, the reconcile step is the repo's own.**
`mise run setup:ai:all` — the task library's, through its `setup:ai:base`
subtask — checks that `vwf@virajp-plugins` is installed at user scope, or at
project or local scope whose `projectPath` is this repo; only when it is not
does it run the installer above, at **user** scope. Whether or not it installed,
it then updates every registered marketplace and upgrades every plugin installed
at a scope that serves the repo, at that scope, then prunes project scope. It
never installs at project scope, every `claude` and `pnpx` call warns and
continues, and a pack may add a plugin of its own through a `setup:ai:<slug>`
subtask in its payload, which `setup:ai:all` calls beside `setup:ai:base`. This
repo keeps its own hand-edited copy, still named `setup:ai`. The installer above
is the one-shot for a person; this is what a checkout re-runs.

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
