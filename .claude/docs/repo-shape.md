# Repo shape

How this repo is laid out, what generates what, the mise tasks that validate it,
and the traps that bite. Linked from [`CLAUDE.md`](../../CLAUDE.md); read it
when you need more than the one-line summary there.

## One authored tree

Plugins are **authored natively for Claude Code**, once, and installed by
Claude's own plugin commands. What you edit is exactly what a user gets. The
tree diagram is [`CLAUDE.md`](../../CLAUDE.md)'s and is not repeated here.

**Two files are generated**, both projections of the same 2 plugin manifests and
differing in exactly one field per entry — `source`. Only the **published** one
is committed, so what users install is inspectable and diffable;
`p:plugins:marketplace --check` asserts it matches a fresh generation.

`.claude-plugin/marketplace.json` is the **published** one, and it lives at the
repo **root** because that is where Claude looks when this repo is added as a
marketplace. Every `source` is a `git-subdir` fetch pinned to a per-plugin tag,
which is what lets unreleased work sit on `develop`.

`.dev-marketplace/.claude-plugin/marketplace.json` is **local authoring only**,
**gitignored**, and never published. Every `source` is a repo-relative
`./plugins/<name>`, resolved into the `.dev-marketplace/plugins/` staging
directory the same run creates and `p:plugins:local` fills with `X.Y.Z+N`
copies, so the authoring machine runs the working tree rather than the last
release. It exists because this repo ships a workflow plugin whose author could
not otherwise run the unreleased version of it.

**It is gitignored rather than committed**, which was the reverse of the plan's
D1. Committing it would buy a fresh clone one command, at the price of a second
file in the tree declaring the marketplace name `virajp-plugins` on the branch
users read — a footgun that outweighs the convenience, since regenerating is
`mise run p:plugins:marketplace`. The consequence is that `--check` has to tell
**absent** (normal in CI and in a fresh clone) apart from **present but stale**
(a real bug on a machine that uses it), which is what `MANIFESTS`'s `tracked`
flag is for.

Three things make that design forced rather than chosen, each probed against the
real `claude` CLI:

- **A path inside the marketplace root is the only way in.** An absolute path, a
  `{"source": "directory"|"local", "path": …}` object and a parent-relative
  `../plugins/<name>` are each rejected with `source: Invalid input`. A
  repo-relative path that stays inside the marketplace root is the one accepted
  form, so the plugins have to be reachable from within `.dev-marketplace/` —
  and as **staged copies**, not a symlink to the tree: for a directory source
  Claude reads the plugin's own `plugin.json` version and ignores the entry's,
  and `update` compares versions only, so a copy is the only place the `X.Y.Z+N`
  it needs to see can be written without touching the tracked manifest.
- **Both manifests carry the same marketplace `name`.** A plugin's
  `dependencies` edge names its marketplace by name, so vwf installed from a
  differently-named dev marketplace would send its `stackgen` edge back to the
  tagged marketplace and fail on a tag that does not exist yet. The consequence
  — one registered at a time, never both — is a feature, not a limitation.
- **A `ref: develop` variant also works** and needs no staging, but it serves
  *pushed* develop. The failure being fixed is "I cannot run what I just
  changed", so the working-tree form won. It stays the fallback if staging ever
  costs more than it does today.

Note the three neighbours that read confusingly: `.claude-plugin/` is the
published manifest, `.dev-marketplace/` is the local one, and `.claude/` is this
repo's own skills, docs, agents and worktrees. None of them is `plugins/`.

Setup and the refresh loop — `mise run p:plugins:local`, and the three measured
CLI facts that shape it — are [`dev-marketplace.md`](dev-marketplace.md).

> **Authoring one:** the sixteen checker rules, the invocation frontmatter,
> the plugin-root trap and the dprint exclusion live in
> `.claude/skills/plugin-authoring/`, which auto-applies while you edit
> `plugins/`.

**This replaced a template layer and four render trees**, and the shape of what
went is worth knowing, because a fair amount of this file used to describe it.
Plugins were authored target-agnostically in `templates/` with Eta helpers, a
`renderer/` package rendered them into committed `claude/`, `cursor/`, `ohmypi/`
and `opencode/` trees, `schema/` held the neutral contract, and the CLI
installed from those trees through four adapters. It was the repo's single
largest complexity bill, paid for support that was limited anyway — the coverage
report conceded 17–18 dropped and 20–30 degraded features on the flat targets
every build. Other agents are now served by
[a documented prompt](../../readme.md), not a bespoke render. Do not reconstruct
any of it from this paragraph; git has it.

## Installing, and the receipts nothing writes

The CLI installs plugins as a **thin wrapper** — `--all` / `--user <name>` /
`--project <name>` drive `claude plugin marketplace add` and
`claude plugin install`, reading the manifest on this repo's `main` (which then
pins each plugin to its own tag), and Claude's own commands work just as well
directly. It also removes whatever the toolkit put on the machine, and does
nothing else.

**Nothing it does writes a receipt.** The install path belongs to another tool —
`claude` for plugins — and it keeps its own records, which is what `--uninstall`
reads live.

What survives is the **reader**, and it is load-bearing rather than vestigial: a
machine that installed an earlier version still carries receipts recording what
was there *before* that install, and `--uninstall` replays them so the user gets
their own state back rather than a deletion. What it can still meet are the
retired render targets' receipts — `claude.json`, `cursor.json`, `ohmypi.json`
and `opencode.json` among them. Nothing this CLI does adds to that pile, and
**it deletes only what it wrote** — which, since it writes nothing, means it
deletes nothing a receipt or another tool does not account for.

> **Working on it:** the receipt entry kinds, the interactive uninstall and the
> packaging traps are in `installer/CLAUDE.md`, which Claude loads whenever it
> works under `installer/`.

## Tasks

Run in `plugins.yml`, the first four also locally via pre-commit, with
marketplace, inventory and check in that order — freshness before validity
(never in `release.yml`, which is the installer's and whose trigger surface must
stay untouched — npm allows one Trusted Publisher and validates the entry-point
filename — and never in `site.yml`, which runs the website's own gate):

Pre-commit also runs the repo's three tool-neutral gate hooks, none of which is
on this list because none is a `p:` task: `format` and `lint` call
`mise run code:format --fix` and `mise run code:lint --fix` with the staged
files, `sec` calls `mise run code:sec --staged`. Every gate tool is inside those
tasks and nowhere else — dprint in `code:format`, the house linter in
`code:lint`, gitleaks in `code:sec`; no gate lints or formats shell. Those
hooks and tasks are bootstrap's, synced here like any other repo's. No pack adds
one: a stack's own gates are bootstrap's.

- **`p:plugins:marketplace`** — generates **both** marketplace manifests from
  the 2 `plugins/*/.claude-plugin/plugin.json` manifests, mapping `keywords` →
  `tags` and supplying what no manifest holds: the marketplace header, and the
  per-entry `category`, `strict` and `source`. It also creates the
  `.dev-marketplace/plugins/` staging directory the dev sources resolve into.
  **`--check`** regenerates both in memory and fails if the committed published
  file differs, or if a dev manifest that **exists** is stale or its staging
  path is the retired symlink. An absent `.dev-marketplace/` is reported as not
  applicable, since it is gitignored and CI never has one. That mode is the only
  guard on a file that is generated **and** committed — a manifest edited
  without a regenerate is invisible to every other check, and the committed
  manifest keeps advertising the old version. It is what `plugins:render-clean`
  narrowed down to. **There is no `--dev` flag**: both are written together
  because a flag is one more thing to forget, and a stale dev manifest fails as
  a plugin quietly serving yesterday's tree.
- **`p:plugins:inventory`** — generates `plugins/stackgen/stacks/inventory.md`
  from the stacks tree: every `<type>/<slug>/pack.yaml`, every bundle
  frontmatter, the kind headings in `assets/kinds.md`, every
  `tools/<slug>/tool.yaml` and every `design-tools/<tool>/tool.yaml`. It exists
  because the pack, bundle and kind counts were typed into four prose files and
  drifted; the tree is the only inventory true by construction. It throws on a
  `kind` no heading defines, since the vocabulary is closed — on a bundle
  missing its `tools:` or `packs:` list, or still carrying the retired
  `components:` — and on a bundle `packs:` ref that is not
  `<type>/<slug>@<version>`, that names no
  `stacks/<type>/<slug>/pack.yaml`, or that pins a version the pack no longer
  carries: a bundle is the recorded composition, so a stale pin advertises
  something the materializer cannot copy. `@generated` refs name no pack by
  design and are skipped. **`--check`** is the same byte compare the marketplace
  task makes, run by pre-commit and `plugins.yml`, and `inventory.test.ts` pins
  it in vitest too.
- **`p:plugins:check`** — validates the authored tree. Sixteen rules, rule 15
  retired and the rest keeping
  their numbers: manifest
  name↔dir **plus the two things the version itself must be** — plain semver,
  and free of a 13 or 17 component, those two integers never being issued on any
  version line this repo maintains; dependencies resolving within the
  marketplace; hook scripts existing and executable; **a pack's `config/`
  payload tier being materializable as-is** (assertions in one rule, the
  landed-tree ones also run over `/vwf:init`'s
  `skills/init/assets/<name>/` trees against init's own allowlist
  (`CONTRIBUTING.md`, `CONTRIBUTING-one-branch.md`, `SECURITY.md`,
  `licenses/`):
  exec bit, the `<name>.py` name *and* the `#!/usr/bin/env -S uv run --script`
  shebang on every file under `config/.config/mise/tasks/**` — a Python uv
  script in bootstrap's M51 form, importing `helpers.py`, since a bash task
  could source a shell library bootstrap retired — because mise reports a 644
  task as an *unknown* one rather than a permission error and execs the file
  directly; the exec bit and a known shebang on every `hooks/*.sh`, which the
  host execs from a bare path in
  `settings.json`; the tier's root against the **landable** tier of the root
  allowlist, whose two allowed **directories** are `.config/` and `.github/` and
  whose sibling tier — the root file vwf writes, `CLAUDE.md` — no pack may land;
  a **CI workflow refused inside `.github/`**, since a pack names the task CI
  runs and never the workflow; under `.config/`, an allowlist — only a
  `p/_project/` task, a `test/` task refused as a bootstrap tool's part, since
  the toolchain is bootstrap's — and no pack `templates/` tier; no `config/`
  tier at all in a tool-knowledge entry under `tools/`; and a retired key —
  `tool-config:`, `machine_env:`, `values:`, `conditional:`,
  `user_mcp_servers:`, `languages:`, `lsp_servers:`, `package_manager:`,
  `lockfile:` or `harness:` — refused outright in a `pack.yaml` or a
  `tool.yaml`, since nothing reads any of them); **strict-YAML frontmatter**
  (every skill and agent a plugin ships, every
  `stacks/*/*/skills/*/SKILL.md` and `stacks/*/*/agents/*.md` a pack ships, and
  every skill of a `tools/` entry and of `design-tools/` — the larger half, and
  the half that actually lands in a user's repo or in `vwf-tools`; a pack's
  `rules/*.md` is out, frontmatter being optional there); relative links under
  `assets/examples/**`; **root-relative reference resolution** (every such
  reference resolves inside the plugin that wrote it — in the files a pack
  **lands** the rule stands aside, because rule 13 owns those on stricter terms
  and one bad reference should be one finding); **agent cross-reference
  resolution** in both directions (every role-shaped `` `token` `` in a plugin's
  own prose names a real agent, and every declared agent is referenced at least
  once — the two directions cover each other on a rename); the vwf
  design-adapter contract (all **three** role skills present under
  `design-tools/skills/` and model-invocable, and each `design-tools/<tool>/`
  carrying `tool.yaml`, `conventions.md` and one reference per role); the vwf
  **stack-adapter** contract (both
  `<plugin>-stack-menu` and `<plugin>-stack-template` present, each carrying an
  explicit `disable-model-invocation: false` **and** a `user-invocable: false` —
  an adapter is vwf's to call, not a user's to type — on every plugin keyworded
  `vwf-stack-adapter`, **and** the keyword declared by every plugin shipping
  either skill — the same two-directions-cover-each-other idiom, since
  `stackgen` is now the only adapter left and dropping that one keyword would
  otherwise have turned the rule off entirely while `check()` still passed); the
  **technology-free vwf** guard; **retired vocabulary stated as live** (a closed
  list of spellings the corpus stopped meaning, flagged per line and exempt on a
  line that marks itself as history); and **a landed pack file citing nothing by
  plugin path** (in `skills/`, `agents/`, `rules/`, `hooks/`, `config/`, a
  pack's or tool entry's `conventions.md`, a bundle's body and every file under
  `design-tools/` but a `tool.yaml` — all copied verbatim where no plugin
  root resolves — the literal `${CLAUDE_PLUGIN_ROOT}`, a bare `assets/…` path,
  a `../` climb leaving the tree the file lands in, and a path into a sibling
  pack are each refused; a bare `<type>/<slug>` ref is the identifier vocabulary
  and stays legal, and the last three forms read `.md` only, with fenced blocks
  blanked to their own line count); and **a bundle's composition resolving,
  and at most one default bundle per axis per platform** (each `tools:` name in
  the committed snapshot `scripts/src/bootstrap-tools.json`, each `packs:` ref
  naming a pack under `stacks/` or `@generated`, the retired `components:`
  refused; and across `stacks/bundles/*.md`, grouped by `axis`, two
  frontmatters carrying `default: true` — the entry vwf's architecture menu
  preselects on a round — conflict when either declares no `platforms:` list or
  their lists intersect, and the value is boolean; a conflict is a preselection
  decided by file order, and the finding names both files plus the platform they
  share, or the one that declares no list); rule 15 is retired; **a skill's node
  script runs with nothing installed** (every `skills/*/scripts/**/*.mjs`: an
  entry directly
  under `scripts/` starts `#!/usr/bin/env node` and is executable, and no file
  calls `require(` or imports anything but a `node:` built-in or a relative
  module); and **no bare `mise use`** anywhere a plugin ships, dot directories
  included, unless the line forbids it — a tool is added with
  `bootstrap add tool <tool>`. The retired-vocabulary, plugin-path and
  bare-`mise use` rules are the three that report a **line number**, being the
  three that fire on a sentence rather than a file.

  Two of those are worth the extra sentence. The technology-free guard bans vwf
  naming a concrete technology **only where the mention prescribes**, which is
  subtler than it sounds — and it refuses any `mcp__` server prefix in vwf
  prose, since vwf reaches no MCP server. Beside it the checker refuses an
  `mcpServers` key in any plugin manifest and a retired `user_mcp_servers:` key
  in any pack, because a plugin installs no MCP server — the user does. And the
  plugin-root rule caught a defect that had shipped in all four render trees for
  months: `${CLAUDE_PLUGIN_ROOT}` names only its *own* plugin, so `typescript`
  pointing at vwf's `delivery-pipeline.md` resolved to nothing at runtime. Both
  are in `.claude/skills/plugin-authoring/references/checks.md`, along with the
  eight rules that retired.
- **`p:plugins:npm-normalize-test`** — table-tests the `npm-normalize.sh` hook
  through the system sed (the BSD-sed portability guarantee), for **both**
  package managers: each table runs in a temp dir seeded with the lockfile that
  selects pnpm or bun, so resolution is exercised alongside the rewrite. It runs
  against `plugins/stackgen/tools/pnpm/hooks/` — the path the task and the
  pre-commit lines are pointed at by hand in this repo's `.config/` — which is
  both the source and what the `pnpm` tool-knowledge entry copies into a target
  repo. The hook lives with the **package manager** it rewrites for, not in
  `vwf`: a JS/TS rewrite is
  stack doctrine, and vwf's workflow doctrine stays language-agnostic — the one
  TypeScript module vwf ships is engine glue for the progress pane, not
  doctrine.
- **`vitest run`** — the `scripts/` and `installer/` suites. The `scripts/`
  suite also runs `/vwf:execute`'s action log for real — `execute-log.test.ts`
  spawns `log.mjs` and the `action-log.sh` hook over a temp `$VWF_LOG_ROOT` —
  and is the gate on the node scripts a skill ships.
- **`tsc --noEmit`** per TypeScript project — `installer/` and `scripts/`.
  Nothing emits, so `tsc` is only ever a checker, and there are no project
  references to walk.
- **`p:site:*`** — the website's family, all under `.config/mise/tasks/p/site/`
  and all run from `site/`: `p:site:dev` (the Astro dev server), `p:site:build`
  (`astro build` then `pagefind --site dist`), `p:site:check` (the gate:
  `astro check`, `p:site:build`, then `scripts/check-links.ts` in two passes —
  over `dist/**/*.html`, asserting every internal href resolves to a built file
  and every `#fragment` to an id in its target, and over the markdown mirror the
  build also emits, asserting every absolute site URL in `dist/**/*.md`,
  `llms.txt` and `llms-full.txt` resolves the same way and that each docs page
  carries exactly one markdown alternate link to a file that exists),
  `p:site:icons` (rasterizes the committed favicon set from
  `public/brand/vwf-favicon.svg`, run by hand when the mark changes and part of
  no gate) and `p:site:release` (bumps `site/package.json` from the last
  `site-v*` tag and the recorded level, **skipping past a 13 or 17 component**,
  so `1.1.12` patched is `1.1.14`, commits on `develop`, merges to `main`, tags
  `site-v<version>` and watches `site.yml`). None of them runs in `plugins.yml`
  or in pre-commit — `site.yml` owns them.
- **`p:plugins:release`**, **`p:i:release`** and **`p:site:release`** — the
  own release tasks, which bootstrap's `release:<project>:<kind>` tasks run
  through the `[release.<project>.<kind>]` tables of
  `.config/bootstrap/repo.toml` (`p:plugins:release --plugin <name>` for
  `release:<plugin>:production`, `p:i:release --ci` for `release:installer:ci`).
  Each reads its own key in `.config/bootstrap/releases.toml`, bumps from the
  project's last tag by the recorded level, never below the manifest, makes one
  commit `ops: release <tag>` on `develop`, lands it on `main` with
  `git:merge:main` and tags `main` with `git:tag --push`. Each takes
  `--dry-run`. None runs in a gate; the ritual is `/release`.
- **`p:releases:test`** — a Python table test of `_scripts/local.py`: the
  version guard and its 13/17 skip, the manifest floor and the `releases.toml`
  levels. It runs in `plugins.yml`, not in pre-commit.

The 13/17 guard itself is three functions — `forbidden`, `bump` and
`next_version` — in **`.config/mise/tasks/_scripts/local.py`**, this repo's own
Python module beside bootstrap's `_scripts/helpers.py`. `bump` returns the plain
result of the level; `next_version` returns that same result stepped past a
forbidden component, and raises `VersionError` when the level it was given can
never reach one. Beside the guard sit the release-level functions:
`read_level`, `raise_level` and `clear_level` read, raise and clear one
`<project> = "LEVEL"` line of `.config/bootstrap/releases.toml` with tomllib
and a line edit (`read_level` refuses an unknown value), and `release_target`
turns a tag and a level into the next version through `next_version`, with the
manifest as its floor. `release()` is the one release flow the three release
tasks call. The release tasks and `p:releases:test` import it with the preamble
of a bootstrap task; `deps-update.yml` imports it too, to raise the installer's
level, because the bootstrap engine is a macOS binary and the workflow runs on
Linux. `helpers.py` is bootstrap's and is replaced on every sync, `local.py` is
the repo's and never is — and nothing a pack lands may import it.

`p:plugins:check` is deliberately much smaller than the checker it replaced, and
smaller again than the Python task before that. Whole families of assertion
became *unrepresentable* rather than merely unchecked — the two dependency lists
kept identical by hand, marketplace registration in both directions, skill
`name:`/`description:`/`model:` shape, and everything that existed to compare
four render trees. What remains is what no format and no type can state.

Plugin/skill version numbers are **not** cross-checked — they are independent by
design (a plugin may hold skills versioned on their own cadence).

The traps — the committed manifest vs the gitignored bundles, which markdown
dprint formats, and the authoring traps — are in [`CLAUDE.md`](../../CLAUDE.md)
and the `plugin-authoring` skill.
