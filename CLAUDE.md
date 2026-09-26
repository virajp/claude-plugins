# CLAUDE.md

## Rules

- ALWAYS ask user before running a `p:i:release`, `p:plugins:release` or
  `p:site:release` task — the one exception is a plan folder whose After landing
  table records that release as `run`, consented at its interview
- **Docs ship with the change.** Any change to plugin behavior must reconcile
  `readme.md`, this file, and the manual under `site/src/content/docs/` in the
  same commit — stale docs are more harmful than no docs

## What This Repo Is

A multi-agent plugin toolkit (`virajp-plugins`) containing MCP servers and `vwf`
— a full Product → Blueprint → Plan → Execute workflow plugin (with post-deploy
verify + production-feedback intake).

The repo also ships a small **installer CLI** (`@virajp.dev/claude-plugins`),
which sequences Claude's own plugin commands and wires graphify — see The
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
and run, in a fresh session, by the one executor, `/vwf:execute <folder>` — or
`/vwf:execute next`, which reads that table alone, of either kind, and picks the
runnable plan with the lowest `Priority` value — which refuses a folder that is
not on that branch, claims the row `RUNNING` with a pushed commit before it cuts
a worktree, and marks it `COMPLETE` once the merge lands (archiving the folder
there and re-pointing the row when no gap is open; leaving it live when one is,
archived once you ask) — each plan folder carries this repo's gate lines, and
`mise run p:plugins:local` and `/release` as after-landing steps, each carrying
`run` or `ask` as the interview recorded: `/vwf:execute` runs the `run` steps on
a green landing without a prompt and stops once before each `ask` step.

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
| [`.claude/skills/plugin-authoring/`][auth]                   | the fifteen checker rules, the invocation frontmatter, the plugin-root trap, dprint exclusions                                                                                                                                                                                                                                                                |
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
website's); the first five also run locally via pre-commit, with marketplace,
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
- **`p:plugins:check`** — validates the authored tree, fifteen rules. Rule 1
  covers the manifest: `name` agreeing with the directory, and the `version`
  being plain semver **and** free of a 13 or 17 component — those two integers
  are never issued on any version line this repo maintains, and it is the
  component that counts, so `1.13.0` fails where `1.130.0` passes. Rule 11 is
  the widest: it walks a stackgen pack's whole `config/` payload tier, and each
  `stackgen:tool-config` asset tree as one — seven assertions. Exec bit and
  shebang on every task file, exec bit and shebang on every shipped hook script,
  the `config/` root against the **landable** tier of the hygiene allowlist
  (whose two allowed directories are `.config/` and `.github/`; the list's other
  tier is the root files vwf writes, which may sit at a shaped root and which no
  pack may land), a CI workflow **refused** inside `.github/`, every
  `vscode.d/*.jsonc` parsing as JSONC with only the three keys `/vwf:init`
  composes, and every `conditional:` entry in the pack's `pack.yaml` naming a
  relative path or glob (no `..`) that matches at least one file under `config/`
  — the checker's own walk, so `**` enters dot-directories — and a `when:` of
  exactly one known axis (`forge`, `editor`, `secrets`, `update_bot`) with a
  value that axis takes, `secrets: none` refused, and the pack's `binaries`,
  `lockfile` and `machine_env` facts in the shapes doctor and setup read — a
  binary a name or `{name, probe}`, a lockfile path with no `..`, and each
  `machine_env` name set by a `mise add env` entry in the pack's `tool-config:`
  list — every entry of which must parse as `mise add tool`, `mise add env` or
  `mise add alias` with a legal name and scope, a template delimiter allowed
  only in an `add env` value, or as one of the gate verbs: `dprint add plugin`,
  `all add exclude [generated]`, `pre-commit add linter-ignore`,
  `pre-commit add hook` or `grype add ignore`. An exclude asked of one tool
  alone is a finding, and so is a mise `conf.d` fragment or a `pre-commit.d`
  file in a pack's `config/` tier: a pack asks the skill instead. Rule 13
  refuses a plugin-relative citation in anything a pack or the skill **lands** —
  the token, a bare `assets/…` path, a `../` climb out of the tree the file
  lands in, or a path into a sibling pack — since that file is copied into a
  repo with no plugin, where each resolves to nothing silently. Rule 14: across
  `stacks/bundles/*.md`, at most one bundle per axis **per platform** carries
  `default: true` — the entry vwf's architecture menu preselects on a round —
  and the value is boolean. Two flagged bundles on one axis conflict when either
  declares no `platforms:` list (it is offered on every round of the axis) or
  their lists intersect; that is a preselection decided by file order, and the
  finding names both files plus the platform they share, or the one that
  declares no list. Disjoint platform lists are fine — one default per platform.
  Rule 15 is the newest: the three formatter exclusion lists
  `stackgen:tool-config` ships under `skills/tool-config/assets/` — dprint's
  `dprint.json` and `taplo.toml`, and pre-commit's global `exclude` — state one
  set after normalisation (anchors, `**/`, escapes and trailing `/` stripped),
  and the gitleaks `[allowlist] paths` is a **subset** of it, never the reverse:
  the scanner extends upstream's default allowlist and must still walk
  `.claude/`, so the formatters' set is wider by design. A formatter entry
  missing from a sibling list, a scanner entry no formatter excludes, or a list
  that is missing or cannot be parsed is one finding naming the file and the
  entry.
- **`p:plugins:shellcheck`** — the shell gate over everything a pack ships as
  shell: `shellcheck -x` plus `shfmt -d` over the pack task libraries and their
  `_scripts/*`, and a second pass over `hooks/*.sh` with no flags, since a hook
  lands without its helper library beside it and may declare `sh`.
- **`p:plugins:npm-normalize-test`** — table-tests the `npm-normalize.sh` hook
  through the system sed, for both package managers.
- **`vitest run`** — the `scripts/` and `installer/` suites.
- **`tsc --noEmit`** per TypeScript project — `installer/` and `scripts/`.
- **`p:site:check`** — the website's gate: `astro check`, `p:site:build` (Astro
  plus the pagefind index), then the link checker over `site/dist/**/*.html` and
  the markdown mirror it also emits (`dist/**/*.md`, `llms.txt`,
  `llms-full.txt`, plus each page's markdown alternate link). Runs in
  `site.yml`, not `plugins.yml`, and not in pre-commit. Beside it:
  **`p:site:dev`**, **`p:site:build`**, **`p:site:icons`** (rasterizes the
  committed favicon set, by hand when the mark changes), **`p:site:version`**
  and **`p:site:release`**.

Beside them the local gate runs **three tool-neutral hooks** — `format`, `lint`
and `sec` — each of which calls a mise task (`code:format --fix`,
`code:lint --fix`, `code:sec --staged`) rather than a tool. dprint, shfmt,
shellcheck, actionlint, the house linter and gitleaks are configured **once**,
inside those tasks; no hook names a binary. This repo takes the same shape
`stackgen:tool-config` lands, so its own commits prove the hook-to-task path.
graphify's graph is refreshed the same way: a `graphify-refresh` hook at the
`post-commit` stage runs `code:graph`, in place of graphify's raw git hooks.

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
  linter exclusion lives in `.config/linter.yaml` and nowhere else.
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

| Plugin     | Is                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `vwf`      | The flagship: the Product → Blueprint → Plan → Execute workflow, its subagents, `init` (the repo-shape orchestrator, reached through `/vwf:setup`), the two planners `plan` and `change-plan`, one executor `execute`, writing and running one plan folder shape, the guarded `rtk` hook, the two mempalace auto-save hooks, and two MCP servers. Names **no** technology. Depends on `stackgen` alone. → [`vwf-plugin`][vwf]                                                                             |
| `stackgen` | The principles-driven stack materializer — shipped packs for the covered path, a Context7-researched generator for the uncovered tail, and the repo's own toolchain manager, gates and hygiene since `devtools` dissolved into it. `stackgen:tool-config` owns the mise, dprint, pre-commit, gitleaks and grype configs, and a pack asks it for lines through `tool-config:` in its `pack.yaml`; the hygiene pack still ships its **config files**. `/vwf:init` lays both down. → [`stackgen-plugin`][sg] |

Full inventory, the native manifest shape, and the generated marketplace
manifest: [`.claude/docs/plugins.md`][plug]. Authoring doctrine that applies to
both — the checker rules, the two mise gates, the hook rules, the traps — is the
[`plugin-authoring`][auth] skill, which auto-applies under `plugins/`.

The workflow runs `setup` → `product` → `architecture` → `design-system` →
`blueprint` → `plan` → `execute`, with `verify` and `feedback` closing the loop.
`init` is no longer a command in that line: since 2026-09-06 it is
**skill-invoked**, hidden from the `/` menu and reached only from inside `setup`
— Step 0's offer, or `/vwf:setup reshape`, which runs the shape pass alone.
`init` shapes the **base repo and every member repo the product has** — the
config layout, the task vocabulary, the gates, the hygiene files — through
`/stackgen:tool-config all`, which lands the mise config and the gates with
init's answers as its arguments, the commit scopes among them — previewed first,
its rows shown in init's plan, then run with `answers=` on the one consent —
then stackgen's one unconditional bundle, `repo-hygiene`, resolving the members
itself as the union of `.gitmodules` and the config's `members:` list, surveying
all of them at once and applying **one plan with a section per repo on one
consent**, members first so the base commits its gitlinks current. Each repo's
**mode** is decided from its tree, never a flag: `shaped` where the adapter
lockfile exists, `source` where there is no lockfile but a language manifest, a
source directory, a root tool config or a `.config/`, `blank` otherwise — and a
**stack read** (pins, else lockfile components, else a fixed manifest table,
first hit per language) drives the `.gitignore` language sections and the
`runtimes` argument. It asks nine questions (the first naming each `blank` or
`source` repo's folder, which is what the `repo` argument carries; the second
confirming every project id, its slug and the source the name came from — the
registry, a sub-project directory (the registry's `projects[].path`, or on a
first run in `source` mode a non-root directory with its own manifest or one a
workspace file lists), or the project's platform token — grouped by repo, before
any `p:<slug>:*` group or commit scope is written; the fifth asking which agent
plugins this product requires, seeded by the plugin task's own inventory mode
and passed to the skill as `plugin_sources` and `plugins`, which fill that
task's two marked positions; the sixth each repo's **visibility**, `public` or
`private`, defaulted from the forge, with the licence — public repos only — and
the security contact — an advisories URL for a public repo, a free email or
internal URL for a private one — asked under it as the seventh round; the eighth
and ninth rounds the **editor** — once per product, is VS Code in use, defaulted
from a `.vscode/` directory or the `code` binary — and the **update bot** — per
repo, `renovate`, `dependabot` or `none`, seeded from the survey — whose
answers, with the forge read from each origin host and the provider slug, are
passed to the materializer as an `answers:` map beside `repo:`, `none` the
no-match value on `forge`, `editor` and `secrets` and a legal `when:` value on
`update_bot`, so a pack's `conditional:` files — the hygiene pack's GitHub issue
forms, its Renovate policy, every pack's editor fragment — land only where the
answer holds and are otherwise listed under a **Skipped** heading in the plan
and under `skipped:` in the lockfile), and closes with a consent-gated git pass
(a read of where each repo stands — a member on no branch is a refused row
naming the branch to check out; the landing model asked **one row per repo per
branch**, `develop` and `main` each `direct` or `pr`, passed to the skill as
`merge_model_develop` and `merge_model_main`, which fill `MERGE_MODEL_DEVELOP`
and `MERGE_MODEL_MAIN` — a file still carrying the single legacy `MERGE_MODEL`
is read as both until the skill's `all` rewrites it into the pair; the
`develop`/`main` pair created beside a mainline of another name, the old branch
left in place and reported; the `ops:` commit, on `develop` in every mode, never
on `main`; the push, and — after the push, on one further consent for the
product — the **forge pass**, which sets each pushed repo's default branch on
the forge, protects `develop` and `main` there — a pull request required on
whichever of the two has its landing model set to `pr` — and reaches the backlog
skill's missing-project procedure for the base; those three are the only forge
settings it touches, existing protection is left alone, and a forge it has no
CLI for gets the by-hand list the hygiene pack's `CONTRIBUTING.md` keeps). The
aggregator's member flags and the `setup-<slug>` aliases are named for the
**member repos**, never for a project id. On a `shaped` repo it **adopts rather
than flattens**: a root tool config a pack or the skill supersedes
(`.pre-commit-config.yaml`, `.gitleaks.toml`, … — the seven-row table in
`plugins/vwf/skills/init/references/tool-configs.md`, whose `handed` mise row
marks a root `.mise.toml` as the skill's own migration, no row of init's) is a
plan row — move into `.config/` and offer, keep both, or delete on an explicit
pick — a foreign hook manager (`core.hooksPath`, `.husky/`, lefthook) is a row
defaulting to keep, `.gitignore` is merged section by section rather than
offered, an unmapped helper function moves to a repo-owned `_scripts/local`
sidecar, a task no pack ships — a file or an inline `[tasks.*]` table — is kept
and listed, and a pack-owned file whose **content** diverged is offered as
replace-or-keep — content being what survives two tests, the hash against the
lock and then a splice of every marked position's current value into the pack's
payload, so a file diverging only inside those positions is never offered and
the owning pass shows the change instead. A file `stackgen:tool-config` owns is
never offered: the skill shows its own drift rows. The offer is **every
mode's**: on a `source` or `blank` repo every path the materializer reports as a
conflict gets the same row (a readme, licence or security file already there is
kept outright). A keep covers that content and never a marked position's value,
and is recorded under `enforcement.kept_files` in the **base's**
`.config/vwf.yaml`, keyed by the member path as prefix. The editor merge reads
each `.vscode` file whole, and a settings key or nesting parent the hand section
already carries that the packs also compose is a **collision** — asked once per
run inside the plan (keep mine, take the pack's, or union for an object-valued
key or a nesting parent), never resolved by the file carrying the key twice, and
recorded under `enforcement.editor_keys` beside it, spelled as `kept_files`
spells its paths; the four conditional answers themselves are recorded too, in
every mode, under a **top-level `answers:`** block — the editor and the secrets
provider once for the product, the forge and the update bot per repo, every key
present and `none` the spelling of no answer — so every later caller of the
materializer evaluates a `when:` against the same values rather than against
nothing. Those three are the only keys `init` writes into `.config/vwf.yaml` —
into a **stub** (`config_format` plus the `enforcement` and `answers` blocks)
where the file does not exist yet — and `config_format` 20 is the bump that
added `editor_keys`, 21 the bump that added `answers`. No other skill writes the
block, with one exception: a caller that finds the recorded forge contradicted
by the live `origin` host rewrites that one value and says so. The five
post-landing steps (the secrets provider; the placeholders; the readme, licence
and security files as one; the bootstrap; the aggregator offer) run in **every**
mode, and `init` re-records the lockfile hash of every file it filled, appended
to or merged as its last step before the git pass. `setup` then sets up **vwf**
in the base, and offers `init` once for the whole product when any repo's shape
is **missing or drifted** — at Step 0 and again after its materialize pass — on
the seven baseline predicates `/vwf:doctor` owns and now evaluates per repo —
the seventh, (g), reading the forge state back (default branch, both branches
protected, the base's backlog project) where the forge CLI answers;
`/stackgen:stackgen-sync` ends by bringing the same offer in-session, and
`/vwf:recall` prints one drift line from `/vwf:doctor baseline` — the local
predicates (a)–(f) alone, never (g) — pointing at `/vwf:setup reshape`, so
nobody has to remember to reshape. **Architecture decides the stack and setup
pins it**: architecture records a slug and materializes nothing, then invokes
`/vwf:setup` in-session, whose **materialize pass** — every mode, once per
`(repo, slug)`, carrying the contract's `repo:` line and, beside it, the
config's recorded `answers:` map with the forge re-read live from that repo's
`origin` — lands each pinned template in the member repo that project belongs
to, writes `unresolved` on an axis it finds absent, and never rewrites a pin. A
pin nobody landed is `/vwf:doctor`'s blocking *pinned, not materialized*.
**Everything up to `blueprint` is done in full before planning** — `plan`
hard-halts on a partial coverage stamp. The ad-hoc planner `change-plan` sits
**beside** that line rather than in it: it plans work with no blueprint slice
behind it — tooling, CI, docs, a refactor, a tree the blueprint does not
describe — reads neither the blueprint nor the registry, and names the commands
its plan folder gates on. The two planners share the folder shape
(`assets/templates/plan-folder.md`), the interview checklist
(`assets/plan-interview.md`) and the one plan index, whose contract and every
write to it — the row, the Status block, the archive move — are the
skill-invoked `plan-management`'s
(`skills/plan-management/references/plan-index.md`); and one executor,
`execute`, runs both: each unit's `Kind` cell decides what runs over it — a
`code` unit TDD and the coverage gate, a `review` row the two engines plus the
code and security reviewers over the branch delta since the last row, an `edit`
unit the concurrent dispatch and the wave review — and the acceptance and UX
pass and the blueprint reconcile fire only when the plan has `covers:`. The
ordering gates, the skill and agent tables, how to add a skill and pick its
invocation mode, and the dependency reasoning are the [`vwf-plugin`][vwf] skill.

## The installer CLI

`@virajp.dev/claude-plugins`, run as `pnpx @virajp.dev/claude-plugins …`, does
three things: **plugin installs as a thin wrapper** that sequences Claude's own
marketplace registration and plugin install commands, **graphify's wiring**, and
**`--uninstall`**. It never edits Claude's settings itself and writes **no
receipt**. `installer/` is the source; `bin/` is the tsup output, is gitignored,
and is what npm publishes. The statusline is a separate package
(`claude-status`), not a plugin and not installed here.

**It is the one-shot, not a repo's reconcile step.** A repo shaped by
`/vwf:init` reconciles its own plugin set with the task library's `setup:ai`,
which runs `claude plugin …` and no package runner — so a machine that
registered `virajp-plugins` from `./.dev-marketplace` is served by the same task
as one that registered it from the forge. Nothing calls this CLI from a task.

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
own `.config/mise/conf.d/env.toml` still carries the legacy single
`MERGE_MODEL`, read as both, until its next `/vwf:setup reshape`. No release
task commits: all three tag what has already landed.

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
`p:plugins:check` refuses such a manifest; `p:i:version` and `p:site:version`
**skip past** the number — each computes its target first, stepping the bumped
component past a 13 or 17, then writes it in a single `pnpm version` call and
prints what it skipped, refusing before it writes anything when the level it was
given cannot reach the forbidden component; all three release tasks **refuse**
to tag one. The guard is four functions in `.config/mise/tasks/_scripts/local`,
this repo's own sidecar beside the pack-owned `helpers`, which no pack file may
source. Versions issued before the rule stand, and the `+N` staging counter is
not a component.

**A release is two stages, and only the second reaches anyone else.** Local
first — `mise run p:plugins:local` stages the changed plugins into the dev
marketplace and updates this machine's install, publishing nothing and cutting
no tag, so `/vwf:execute` takes it as the plan's first after-landing step — run
without a prompt on a green landing when the plan records it `run`, asked for
once when it records `ask` — and a staged plugin loads in the next **restarted**
session. Public second — the tags.

**Ask the user before running `p:plugins:release`, `p:i:release` or
`p:site:release`** — unless the plan folder being landed records that release as
a `run` step, consented at its interview.

The mise environment split, the four workflows and why `deps-update.yml`
dispatches rather than calls `release.yml`, the supply-chain settings and the
one-time npm setup are [`.claude/docs/ci-and-releases.md`][ci]. The release
ritual itself is the [`release`][rel] skill — run `/release`.

## Hooks

What ships as a plugin hook today is vwf's only — the guarded `rtk` Bash hook
and the two mempalace auto-save hooks — and is the [`vwf-plugin`][vwf] skill's.
Two more scripts ship as **stackgen pack payloads** copied into a target repo
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
`mise run setup:ai` — the task library's, and this repo runs the same one —
registers or refreshes `virajp-plugins` and installs or updates the plugins the
repo requires at **project** scope, through `claude plugin …` and nothing else.
It is idempotent, it never touches a user-scope plugin, and it works unchanged
on a machine registered from `./.dev-marketplace`. The installer above is the
one-shot for a person; this is what a checkout re-runs.

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
