# Stack Checks (§§3–5)

Read this before running §3. It covers the three per-project stack checks:
languages (LSP + toolchain + the bundle's tools), frameworks and dependencies
against each manifest, and the repo/axis tooling. **Blocking** findings live
in §3 (a pin not materialized) and §5 (a `custom` template pin, a missing
`mise`, an `iac` project inside another repo the user has not declined to
extract, a template that does not cover its project's platforms, the vwf
plugin installed at no scope). A project no bootstrap language tool links, a
registry project with no `repo.projects.<name>` entry in bootstrap, a bundle
tool not selected or not linked, a materialized entry with no `tools:` key and
an LSP server missing from `vwf-tools` (§3), and a design tool with no
reference in `vwf-tools`, an addon absent from `plugins.project` and a
lockfile row of a retired pack kind (§5), and an `lsp-check` row of
`code:lsp:check` (§3) are each a **degraded** row, never blocking.

**These checks are one script.** The findings `/vwf:execute` stops on —
pinned not materialized (§3), a `custom` pin, template platform coverage, the
`iac` own-repo rule and `mise` (§5) — and every degraded row above are
implemented by
`${CLAUDE_PLUGIN_ROOT}/skills/doctor/scripts/checks.mjs` (*The checks script* in
`SKILL.md`), which doctor runs and reports as it comes. Each rule below names
its row's `rule` id; the text keeps the reason, and the script is the source.
A failed `bootstrap` call stops doctor with bootstrap's `errors`.

## An unresolved axis is a degradation, and it makes two others conditional

Since `config_format` 16 any stack axis may read `unresolved` — deferred, not
decided (`${CLAUDE_PLUGIN_ROOT}/assets/vwf-config.md`, "The three axis states").
It is a **degradation**, reported every run, never blocking: it records a
decision postponed, not a repo in a bad state. Every check below that depends on
that axis reports **`not checked — no stack resolved`** and moves on — not a
pass, not a finding. Name the project and the axis, and give
`/vwf:architecture` as the remedy; never an install, since the question is
unanswered rather than unanswerable.

`unresolved` is the bare scalar on the list axes too, so `deploy: unresolved`
is deferral while `deploy: []` is a completed decision.
Treat them as opposites: `[]` is checked as an answer, `unresolved` is not
checked at all.

**Findings this file otherwise raises as blocking are conditional on it**,
because a product nobody has chosen a stack for yet would otherwise halt `setup`
and `execute` on day one:

| Finding                | Blocking when                                                | Degradation when                                     |
| ---------------------- | ------------------------------------------------------------ | ---------------------------------------------------- |
| **missing `mise`** (§5)   | any axis in the repo is pinned (a refusal instead, once a project's platforms imply a harness task) | no axis is pinned anywhere and no platform implies a harness task |
| **pinned, not materialized** (§3) | that project's `template` is a slug, the adapter materializes, and the target repo's `.claude/stackgen/lock.yaml` does not name the slug | never — the axis was answered |

The severity follows the pin, never the calendar — the moment an axis is
answered, the finding reverts to blocking on the next run.

The third row is the one that is **not** conditional on `unresolved`, and it
sits here because it is the state most easily mistaken for it: the axis *was*
answered, and what is missing is the artifact rather than the decision
(`${CLAUDE_PLUGIN_ROOT}/assets/stack-adapter.md`, "The materialized-template
variant"). It is reached only after a landing the user declined, or on a repo
`/vwf:setup` has not re-run on since the pin was made. Its remedy is
`/vwf:setup` — the materialize pass — and never `/vwf:architecture`, which
decides a pin rather than landing it.

## 3. Languages — LSP and toolchain

**First, the project's folder and its repo.** A project lives in the repo
`projects.<name>.repo` names, else in the base repo, and its folder is
bootstrap's: `bootstrap config get repo.projects.<name>.folder --json`, run in
that repo (`${CLAUDE_PLUGIN_ROOT}/assets/bootstrap-contract.md`), its name
checked per `## Passing values` there; doctor's script already reports a bad
name as the `project-folder` row below. Since
`blueprint_format` 26 the registry carries no `path`. A registry project with
no `repo.projects.<name>` entry is a **degraded** row naming the project, with
the fix `bootstrap config set repo.projects.<name> '{"folder":"<path>"}' --json`
run in that repo — the expected state for a project whose folder a later plan
unit creates, which runs that line then. The fix line is a command only for
a name that is a valid bootstrap key: letters, digits, `_` and `-`, and no
`.` (`## Passing values` of
`${CLAUDE_PLUGIN_ROOT}/assets/bootstrap-contract.md`). For a name that is not
valid, the row stays the same (`project-folder`, **degraded**), but its remedy
prints no command. It reads: project `<name>` is not a valid bootstrap key
(letters, digits, `_` and `-` only); rename the project by hand in
`docs/blueprint/registry.yaml` and in each `projects.<name>` key of
`.config/vwf.yaml`, then run `/vwf:setup` and `/vwf:doctor` again. Every
check below that needs the folder reports `not checked — no folder` for that
project. A failed
`bootstrap` call stops doctor with bootstrap's `errors`.

**Before the language walk, once per project.** A project whose `template` is a
slug, whose adapter is a **materializing** one, and whose target repo carries no
materialized entry for that slug in its `.claude/stackgen/lock.yaml` is
**pinned, not materialized — `/vwf:setup` materializes it** (`checks.mjs` row
`not-materialized`): raise that finding, name the repo in it, and **skip the
bundle-tools check for that project**. The bundle's `tools:` it would check
come from the payload the repo lacks, so they are **unread**, not absent. It is
**blocking**, on the second row of the table above, and its remedy is that one
line: one finding per project, never one per language. The target repo is the
repo that holds the project, as above. What this state is read from is the pin
and the lockfile, never the project's languages.

**A project's languages are bootstrap's.** Since `config_format` 28 the
`stack` block records no `languages`: a language is a bootstrap tool of
category `languages` linked to the project. Run `bootstrap describe --json` in
the repo that holds the project and take the `data.tools` entries of category
`languages` whose `projects` list names it; the tool name is the language. A
project no such tool links is a **degraded** row naming the project, with the
fix `bootstrap add tool <tool>` (or `bootstrap detect --add`) run in that repo,
a form whose real tool name follows `## Passing values` of
`${CLAUDE_PLUGIN_ROOT}/assets/bootstrap-contract.md` — **except** a project
whose platforms are all `iac`, `cicd` or `misc`, which needs no language tool
and gets no row. A failed `bootstrap` call stops doctor
with bootstrap's `errors`.

**The bundle's tools are linked** (`checks.mjs` rows `bundle-tools` and
`tool-link`). A materialized project entry,
`.claude/stackgen/templates/<slug>.md` in the repo that holds the project,
lists its bundle's bootstrap tools under `tools:`. An entry with no `tools:`
key — one materialized before the bundles carried tools — is one **degraded**
row naming the pin, remedy `/vwf:setup`, which lands it again; never a
refusal, and never read as an empty list. Otherwise each name must be a tool
`bootstrap describe --json` lists in that repo; one of category `languages` or
`package-managers` must also name the project in its `projects` list, and a
tool of any other category only needs to be selected. Each miss is one
**degraded** row naming the project and the tool, remedy
`bootstrap add tool <tool>`, then `bootstrap detect --add`, run in that repo;
the form follows `## Passing values` of
`${CLAUDE_PLUGIN_ROOT}/assets/bootstrap-contract.md`. A tool name that is not
letters, digits, `_` and `-` only gets no command: the remedy says that tool
`<name>` is not a valid bootstrap tool name, and the row stays the same.
A project with no `repo.projects.<name>` entry is skipped: bootstrap refuses a
link to it, and its folder row above already reports it.

**The LSP servers are bootstrap's** (`checks.mjs` row `lsp`). In each repo
that holds a project whose pin materialized, run `bootstrap lsp --json`: every
key of its `data.servers` is a server that repo needs, and the generated
`vwf-tools` plugin's manifest,
`~/.claude/plugins/local/vwf-tools/.claude-plugin/plugin.json`, must hold it
under `lspServers`. An absent manifest holds none. Each server it lacks is one
**degraded** row naming the server and the repo, remedy `/vwf:setup`, whose
materialize pass copies it there. A language `bootstrap lsp` lists no server
for needs none, and is no row.

**The LSP servers resolve** (`checks.mjs` row `lsp-check`). Once, from the
base repo root, run bootstrap's `mise run code:lsp:check` (a member repo's
servers are not checked). The task reads `bootstrap lsp --json` and prints
`<server>: <path>` for each server that resolves, or
`<server>: <command> not found - <fix>`; the fix is
`run MISE_ENV=dev mise install`, or for `sourcekit-lsp` "install the Xcode
Command Line Tools (xcode-select --install) or Xcode". It exits 0 when each
server resolves or the repo has none, 1 when one is missing, and 2 with no
bootstrap or no `.config/bootstrap/`. Each not-found line is one **degraded**
row, `project` `null`, `subject` the server as printed, `message` the line
without its colour and label, `remedy` the fix. A task `mise tasks ls --hidden`
does not list is one degraded row, `subject` `code:lsp:check`, remedy
`bootstrap sync`, which writes it. Any other failure — exit 2, a non-zero
exit with no not-found line, a failed `mise tasks ls`, a failed spawn, a
signal or the 60-second timeout, `mise` absent from `PATH` — is one degraded
row with `subject` `code:lsp:check`, the last stderr line mise did not write
as `message` and `remedy`, else `code:lsp:check failed with exit <n>` and
`run mise run code:lsp:check and fix what it prints`. `bootstrap lsp --json`
is the one call of these checks that can read the network; an offline failure
is such a row. The rows never block doctor; `/vwf:execute` stops a plan with a
code unit on any of them.

For each linked language tool of a project, resolve its row in the stack
vocabulary by the tool name:

- **Toolchain** — the row names a mise tool. Check it appears in the repo's mise
  tool pins (`.config/mise/conf.d/*/mise*.toml`, `.local` variants excluded) or
  resolves on `PATH`. Missing → finding; the pins are bootstrap's, so the
  remedy is `/vwf:setup reshape`, which brings the repo to bootstrap's config
  — then `mise install`.
  Never a bare `mise use`, which writes a pin outside the layout.
  A tool pinned only in `.config/mise.toml` or a `.config/mise.<env>.toml`
  counts as pinned, not a miss.
  A `—` in the column means the toolchain is not mise-managed; skip silently.

Report per tool, not per project — one missing toolchain is one finding even
when three projects link it.

## 4. Frameworks and dependencies — manifests

For each project, read the manifest its languages imply (the vocabulary's
Manifest column, resolved against the project's folder in the repo that holds
it, §3). Check
each `stack.frameworks` and `stack.dependencies` token appears there.

Match on the **token as a substring of a dependency name**, case-insensitively —
`effect` matches `effect` and `@effect/platform`; `tailwindcss` matches
`tailwindcss` and `@tailwindcss/vite`. This is deliberately loose: the goal is
catching a stack that has genuinely moved on, not policing package naming.

Two findings live here, and the second is the one that matters:

- **Declared but absent** — the config names something the manifest doesn't
  have. Usually a stale config entry.
- **Dominant but undeclared** — a framework or package manager doing obvious
  structural work that `stack` never mentions. Judge this from the manifest's
  scripts and its heaviest dependencies, not from a fixed list. This is the
  check that catches a runtime swap the config never recorded.

Report both as *drift to reconcile*, never as an error — the manifest is always
the truth and the config is what needs updating.

## 5. Repo tooling

**The eight stack axes.** Since format 19 a stack is composed from independent
axes — `project`, `backing`, `deploy`, `repo`, `design`, `cicd`, since
`config_format` 19 `stylesheet`, and since `config_format` 25 `addon`
(`assets/stack-adapter.md` holds the enum) — and every one but `repo` and `addon`
is **per project** (the three technology axes since format 13); `addon` is per
product, and has its own check, **Addons**, below. Check each pin resolves
to a template an installed stack plugin actually offers:
`projects.<name>.stack.template` (project axis), each entry of
`projects.<name>.stack.services`, `projects.<name>.stack.deploy`,
`repo.stack.template`, the `projects.<name>.design` and
`projects.<name>.cicd` pins, whose slug is the config value itself, and
`projects.<name>.stylesheet`, whose slug is likewise the config value and which
is **required only for a project declaring a `site` or a `webapp` platform** —
on any other project the key's absence is correct and is not a finding — and
each slug of the top-level `addons:` list. A pin naming
a template that isn't there is **drift** — usually a template renamed under the
user's feet, or a stack plugin that was never installed. A pin naming a tool
the stack plugin removed is the same **drift**, never blocking, remedy
`/vwf:setup`, whose format step re-pins or removes it: a `design:` pin to
claude-design — re-pin to claude-code, lovable or stitch with `/vwf:setup`. An
axis reading
`unresolved` is not a pin: report the degradation above and resolve nothing. A
**`custom` pin is
`13` drift and blocking** (`checks.mjs` row `custom-pin`): the value was
retired in `config_format` 14, and it names a stack with no `conventions` for
`plan` and `execute` to read and no
`harness` block to check against — remedy `/vwf:setup`, which
walks the axis back through the menu. A project whose
platforms ship through a store rather than to a deploy target (`mobile`,
`tablet`, `desktop`, `auto`, `watch`, `tv`, `spatial`) is correct with
`deploy: []`, not missing, as is an `iac` platform, which *is* the
deploy path. A project declaring `cli` **pins a deploy template for its
package registry** — **which one is the stack plugin's answer**, and **vwf
names no slug on this axis or any other**, so what this check asserts is that
the axis is **answered**, never what it was answered with.

**A project missing a required axis is a finding.** Every registry project needs
a `template` and a `deploy`. On the two list axes *answered* means a
list of slugs **or** `[]` — an absent key and an empty list mean different
things (nobody decided, versus decided: none). A bare `unresolved` on any axis
is **not** answered, and is the degradation above rather than this finding: the
key is present and names the gap out loud, which is the whole difference. A
project declaring a **screen platform** additionally needs `design`,
without which the design adapter halts at import time; every project needs
`cicd`, without which no CI system is pinned and the pipeline generator has
to ask on every run. Report each as
drift naming the project and the axis, and nudge `/vwf:architecture` — never
guess a value, and never copy one project's answer onto another, which is
exactly the product-wide assumption format 13 removed. A config still carrying a
product-wide `backing:`, `deploy:` or `design.tool` key is `12` drift: report it
and nudge `/vwf:setup`.

**Addons.** `addons:` is the top-level list of optional Claude plugins the
product picked in `.config/vwf.yaml`; absent or `[]` means none. `[]` is a
completed answer, **never a pending decision**, and the list never holds
`unresolved`, so neither is a finding. An addon is no pack: `/vwf:setup`
declares it in the base repo's `claude` tool, as a
`<plugin>@<marketplace>` key of `tools.claude.plugins.project`, and
`mise run setup:ai` installs it. An addon's name is its plugin's name, so in
the **base repo** read `bootstrap config get tools.claude.plugins.project
--json` and look, for each name in `addons:`, for a key that starts with
`<name>@` — the marketplace is not read (`checks.mjs` row `addon`). No such
key is one **degraded** row naming the addon, remedy `/vwf:setup`, never
blocking: a missing tool blocks no `execute`, since what needs a tool halts on
its own when it does. When `bootstrap describe --json` in the base lists no
`claude` tool, that `config get` cannot run: every name in `addons:` is the
same row, saying the `claude` tool is not selected, never a refusal. Whether
`setup:ai` installed the plugin is bootstrap's to report, not this check's.

The `vwf-tools` manifest has three more rows, each **drift**, remedied by
`/vwf:setup`, and never blocking:

- **An MCP server key in `vwf-tools`** — the manifest,
  `~/.claude/plugins/local/vwf-tools/.claude-plugin/plugin.json`, holds LSP
  servers only, so any MCP server key in it is drift, remedy `/vwf:setup`: its
  machine cleanup, offered on every run, removes every such key on one consent
  and lists the servers for the user to install by hand.
- **Unclaimed keys** — a server key in the `vwf-tools` manifest that
  `~/.claude/plugins/local/vwf-tools/.claude-plugin/claims.json` lists for no
  repo; an absent `claims.json` lists none, so that is one row naming every key.
  Nothing deletes such a key automatically: `/vwf:setup` in a repo that uses it
  adds that repo's claim.
- **The old plugin** — a `~/.claude/plugins/local/stackgen-lsp/` directory, read
  whatever the lockfile says, stays drift until its migration is accepted, and
  `/vwf:setup` is what offers it again (stackgen migrates it). The row says what
  the wait costs: until then the repo's LSP servers land nowhere.

**A design tool is in `vwf-tools`** (`checks.mjs` row `design-tool`). A
project's `design` pin names a design tool, and the vwf design wrappers call
the `vwf-tools` role skills with the project's name; each role follows that
tool's reference in its own folder. For each project in scope whose `design`
is a slug, `~/.claude/plugins/local/vwf-tools/skills/<role>/references/<tool>.md`
must exist for each of the three roles — `design-import-screens`,
`design-import-design-system` and `design-import-conversations`. A tool
missing any is one **degraded** row naming the project, the tool and the roles
that lack it, remedy `/vwf:setup`, whose materialize pass installs it. A
`design` reading `unresolved` is not checked.

**A lockfile row of a retired pack kind** (`checks.mjs` row `old-pack-row`).
The `language`, `package-manager`, `toolchain-gate`, `design-tool` and `addon`
packs are retired: their knowledge is a tool entry, a design tool or an addon
now. In each repo that holds a project in scope, and in the base always, an
`entries:` row of `.claude/stackgen/lock.yaml` whose `source:` is
`pack/<kind>/<slug>@<version>` for one of those kinds is a row awaiting
conversion: one **degraded** row per lockfile naming every such ref, remedy
`/vwf:setup`, whose materialize pass converts them through
`/stackgen:stackgen-sync` on consent, before anything lands.

**Declared MCP servers.** No plugin installs an MCP server: each is the user's.
A pack that needs one declares it in the `## MCP servers` section of its
conventions, and the stack plugin records each line on that component's
lockfile entry under `required_mcp_servers` — the server's name, what it is
for, its install page, and `optional: true` on a server the pack does not
require. Read that key from every entry of each repo's
`.claude/stackgen/lock.yaml` on this machine, base and members; an entry with
no such key declares no server, and is not a finding. Run `claude mcp list`
once and look for each declared name, exactly, in its output, at any scope.
That command health-checks — connects to — each server the user approved; it is
this check's one side effect, and the row says so. A listed server counts as
available even when its health check fails, and the row notes the failure. A
required name the output does not list is **drift, never blocking**: name the
server, the pack that declares it, what it is for and its install page, and ask
the user to install it under that exact name. An optional server is never a
finding. When the `claude` CLI is not on `PATH`, the row reads
**not checked**.

**A declared backing capability should have a provider.** For each registry
project, read its `capabilities:` and classify each token by the **kind** marked
in `${CLAUDE_PLUGIN_ROOT}/assets/capability-vocabulary.md`. For every **`B`**
(backing-service) token, check that some entry of that project's
`services` list declares it — resolve each pinned template and read the
`capabilities:` its payload carries. A `B` token no pinned template provides is
a **finding**: name the project, the token, and the pins that were checked. A
project whose `services` reads `unresolved` has no pins to resolve:
report `not checked — no stack resolved` for it rather than every `B` token it
declares as unprovided.

Three rules keep it honest:

- **`F` and `P` tokens are never reported.** A product foundation is the
  product's own code and a project-axis fact belongs to the project template;
  neither has anything to pin, so asking for one is a category error.
- **Consumers follow the publisher.** A capability this project only *consumes*
  is provided by the publishing project's pin, not its own — resolve the
  publisher before reporting (the rule is in the vocabulary asset). A consumer
  with `services: []` is correct, not drift.
- **Never blocking.** Some `B` tokens have no template offering them anywhere in
  the installed plugins, so this would otherwise halt `setup` and `execute` over
  a gap in the template library rather than in the user's repo. Report it and
  nudge `/vwf:architecture`; do not raise it to blocking without deciding that
  separately.

**An `iac` project must be its own repo.** For each registry project declaring
the `iac` platform, read its folder in the repo that holds it (§3). A folder
other than `.` means the project sits inside that repo — the monorepo it
shares, or the multi-repo **base** itself rather than a member — and it is a
**blocking** finding (`checks.mjs` row
`iac-own-repo`): `setup` and `execute` both halt on it. The rule and its
rationale are in `${CLAUDE_PLUGIN_ROOT}/assets/topologies/`. The remedy is the
extraction `/vwf:setup` writes up as a recommendation; doctor reports and stops
there, as with every other structural change. An `iac` project that is already
its own repo — an independent one, a submodule, or a sibling member — passes
silently.

**Unless the extraction is a recorded decline.** A decline written under
`enforcement:`, at exactly
`enforcement.rules.topology/iac-own-repo/<project>`, set to
`{ waived: true, reason: <one line> }`
— the key `/vwf:setup` writes — downgrades this finding to a **degradation**:
still reported, every run, but no longer blocking, so neither `setup` nor
`execute` halts on it. The decline settles the *proposal*, never the *fact* — a
product that chose to keep its `iac` project where it is should keep being told
what it costs, and silencing the finding would leave the most privileged repo in
the product looking clean.

**A project's template must cover its platforms.** Since format 22 a
project-axis template declares the platforms it serves in its own frontmatter,
and a project declares its own in the registry. Every platform the project
declares must appear in its pinned template's list; one that does not is
**blocking** (`checks.mjs` row `platform-coverage`), since `plan` and `execute`
would size that surface against conventions written for something else. A
project whose `template` reads `unresolved` has no list to check against: report
`not checked — no stack resolved` and move on. The common case is a project that
was `fullstack` before the migration and is now `[service, webapp]` — check the
pin rather than assuming the migration got it right.

**A viewport override must name something real.** A product may override a
device screen platform's default canvas viewport per project, at
`design.viewports.<project>.<platform>: <W>x<H>` in `.config/vwf.yaml` (the key
is `${CLAUDE_PLUGIN_ROOT}/assets/vwf-config.md`'s). For every entry, check that
`<project>` names a registry project, that `<platform>` is one that project
declares, that it is a **device** screen platform (`desktop`, `mobile`,
`tablet`, `auto`, `watch`, `tv`, `spatial`), and that the value is either the
scalar `<W>x<H>` with two positive integers or the **list** form,
`[ { os: <os>, size: <W>x<H> } ]`. For a list, check each entry: that `os` is a
token named for that platform by the OS vocabulary in
`${CLAUDE_PLUGIN_ROOT}/assets/standard-flows.md`, and that `size`, when
present, is `<W>x<H>` with two positive integers. Each miss is a **finding**
naming the key, or the list entry, and saying it is ignored — never blocking: a
stale override costs one canvas drawn at the default size, and the screens
skill skips any entry it cannot use, reading the rest of the list. An absent
`design.viewports` block is correct, not drift.

**A recorded OS map must name something real.** `/vwf:setup` copies a
project-axis template's `os:` map into `projects.<name>.stack.os` (the key is
the same vwf-config asset's). For every project carrying one, check that each
key is a platform that project declares in the registry and is a device screen
platform, and that each value is a list of tokens the OS vocabulary names for
that platform. Each miss is a non-blocking **finding** naming the project, the
platform and the token, and saying it is ignored: the canvas reads that
platform's OS list without it, or as empty — the generic frame. An absent
`stack.os`, or an absent platform in it, is correct, not drift — it reads as
no OS known.

**mise is mandatory once there is anything to run** — it is both vwf's task
runner (every worktree init, pre-commit and merge goes through it) and the
toolchain manager the §3 checks resolve against. Missing from `PATH` →
**blocking once any axis in the repo is pinned** (`checks.mjs` row `mise`),
remedy `curl https://mise.run | sh`. With **no** axis pinned anywhere, it is a
**degradation**: there is no toolchain to manage, so halting `setup`
and `execute` over it would block a product on day one for a stack nobody has
chosen yet. Either way, once a project's platforms imply a harness task
capability (`dev`, `screenshots` — any screen platform, §6), a missing `mise`
is no row at all: the harness read cannot run, so doctor **refuses** and stops
with that error, whatever is pinned. A repo with neither `.config/mise.toml`
nor `.config/mise/conf.d/` is the same finding one level up, at the same
severity: report it and nudge `/vwf:setup reshape`, the repo-shape remedy,
since bootstrap is what installs the mise config.
Setup materializes no tooling itself — `/vwf:init` does, by running
bootstrap's readme prompt, and fetches no bundle.
**Doctor reaches bootstrap only through its CLI**, by the rules of
`${CLAUDE_PLUGIN_ROOT}/assets/bootstrap-contract.md`, which owns the contract
check, the shaped test and the envelope and is not restated here. Run the
contract check once per run, before any repo is read. When it fails, report
one **blocking** finding carrying that asset's install hint word for word, and
run neither the shaped test nor (d) in any repo.
**A repo is shaped when the shaped test passes** — `bootstrap config get
repo.format --json`, run in that repo, prints an envelope with `ok` true. On
code 2 — the repo is not shaped, is on the old form, has both forms or has a
broken folder, as the envelope's `errors` text says — report one **blocking**
row naming the repo, with the `errors` messages as bootstrap gives them and no
text of doctor's own per case, remedy `bootstrap migrate`, reached through
`/vwf:setup reshape`. On that row no predicate below is evaluated in that
repo, (d) included. A leftover `repo-hygiene/repo-hygiene` lockfile record in
a shaped repo is one drift row, the same remedy. That is
the coarsest form of one question — is this repo still shaped the way
`/vwf:init` shapes one — and the section at the end of this file is the
fuller version of the same check: this one fires when the shape is absent,
that one when it is behind.

Then check each package manager: the `data.tools` entries of category
`package-managers` that `bootstrap describe --json` links to a project, in the
repo that holds it (§3). Each resolves — its lockfile present, the tool on
`PATH` or in mise config. The lockfile looked for is the package manager's
conventional one at the repo root, judged from the tool name: no payload
carries a `lockfile:` fact any more. Since `config_format` 28 `repo.stack`
holds only its `template` pin; an absent `repo.stack` block is `10` drift,
reported with a nudge to `/vwf:setup`.

**The forge CLI is recommended, never required.** `/vwf:backlog` keeps the
product's backlog on the base repo's forge and needs that forge's CLI to read
it. Resolve the forge the way the `backlog` skill does — the rule is in
`${CLAUDE_PLUGIN_ROOT}/skills/backlog/SKILL.md` and is not restated here —
then run three probes: the binary on `PATH` (`gh`, or `glab` on GitLab), its
`auth status` green for the base remote's host, and on GitHub the `project`
scope on the token (the scope check is the reference's,
`${CLAUDE_PLUGIN_ROOT}/skills/backlog/references/github.md`). Each miss is a
**degradation** no caller halts on: name what it costs — a missing binary or
login leaves the backlog unreadable, so every verb stops and the planners'
recall proceeds without it; a token carrying `read:project` but not `project`
keeps `list` and `next` working, the tolerance the skill states, and stops the
write verbs alone — and give the remedy (`brew install gh`, or the releases at
<https://github.com/cli/cli>; `gh auth login`; `gh auth refresh -s project`).
On a GitLab remote run the same three for `glab` and note that the backlog is
not yet supported there, so the row reports the CLI state as information
rather than a cost. An unsupported host reports `n/a — no forge CLI`. This is
reported on every run: a machine without the CLI runs correctly and simply has
no backlog to read, and nothing else says so until a verb fails.
The same three answers decide whether predicate **(g)** below runs at all —
it reuses them rather than probing a second time, and a miss here is what it
reports as its skip reason.

**The vwf plugin and the `virajp-plugins` tool.** Two checks, full mode only.
The user may have installed vwf at user scope rather than in the repo, so the
plugin is read from `claude`, at any scope, and the tool from bootstrap:

- **The vwf plugin.** Run `claude plugin list --json` once. An entry counts
  when it is `vwf@virajp-plugins`, its `enabled` is true, and either its scope
  is `user`, or its `projectPath` is this repo's main checkout or one of its
  worktrees (`git worktree list`). Another repo's project install, or a
  disabled entry, does not count. One counting entry passes; none is
  **blocking**. When `claude` is not on `PATH`, the check is a note, not a
  finding.
- **The `virajp-plugins` tool.** In the base repo only. vwf's `.gitignore`
  lines come from bootstrap's `virajp-plugins` tool, and a repo shaped before
  init added it loses them at its next sync. Read `bootstrap catalog --json`
  first: when the catalog has no `virajp-plugins` tool — only a local build of
  bootstrap can lack it — give a note, not a row. When the contract check
  failed, the base is not shaped, or `bootstrap describe --json` fails, skip
  the row: doctor already reports the shape problem. Otherwise, when
  `data.tools` of `describe` does not list `virajp-plugins`, report one
  **drift** row, never blocking: vwf's `.gitignore` lines are missing.

| Check | Finding | Remedy |
| --- | --- | --- |
| The vwf plugin | installed at no scope — **blocking** | install vwf: the installer's one-shot (`pnpx @virajp.dev/claude-plugins --all`), or `mise run setup:ai` in a repo with the tool |
| The `virajp-plugins` tool | not in the base's `describe` tools — **drift** | `/vwf:setup reshape`, whose init pass adds the tool |

## The repo shape against its baseline

Part of §5, and the one check that reads the **shape** `/vwf:init` lays down
rather than what `.config/vwf.yaml` declares. A repo drifts from that baseline
by standing still: the adapter's packs move, bootstrap moves, `/vwf:architecture`
names projects that did not exist when the repo was shaped, and a fresh clone
arrives with one branch. It drifts by moving, too — a pack-owned file the repo
edited in place is no longer the file the pack ships. None of that stops the
repo working, so **every finding here is `drift` or a `warning`, and none is
blocking** — a repo behind its baseline is out of date, not broken. The two
blocking findings above — no contract, and a repo the shaped test refuses —
come before this check and are not part of it.

**Each row carries the remedy of whoever owns what it read**, and §9 prints each
remedy once with the rows that led to it:

| Remedy | Rows |
| --- | --- |
| `/stackgen:stackgen-sync` — a landed pack's delta, shown for consent | Pack versions, Content drift |
| `/vwf:setup` — the packs not landed | a missing pack lockfile, Project ids |
| `/vwf:setup reshape` — bootstrap and the forge | the shaped test's row, Bootstrap drift, Forge state |

**The five run per repo** — the base and every **locally-present** member,
resolved the way `/vwf:init`'s **Step 0** resolves them: the paths
`.gitmodules` declares union the `submodule` and `sibling` members bootstrap's
`repo.members` lists, deduped on realpath; a `folder` member is part of the
base's tree and is checked with it. That step owns the rule and it is not restated here; a path only
one of the two sources names where both exist is the disagreement `init`
refuses to shape, and this check does not walk into it either. Every finding
is printed **under the repo it was found in**, so a row says which repo before
it says what drifted, and each remedy stays one line for the whole product —
both doors walk the members too, so one re-run covers that remedy's rows under
every heading.

**The local baseline predicates are every one but two**: (a) Pack versions, (b)
Project ids and (e) Content drift, which are what `/vwf:doctor baseline`
evaluates. (d) Bootstrap drift, which runs bootstrap's whole check, and (g)
Forge state, which reads the remote, run in full mode only. The letters (c)
and (f) are retired: the branches and their landing values are bootstrap's to
check, and (d) reports them.

**An absent member is a blind spot, not a finding.** A member this machine
does not carry is said in §5's output as `<member> — not present, not checked`
and nothing more: it is the blind spot the membership contract already
recorded (`${CLAUDE_PLUGIN_ROOT}/assets/membership.md`), and a drift row about
a repo the user declined to clone would describe a shape nobody here can read.

**(a) Pack versions.** Read each repo's **own** `.claude/stackgen/lock.yaml`,
the adapter's materialization record — its `-sync` skill owns the file, and
this check reads one thing out of it: the `entries:` list. Each entry names
the component it landed for and a `source:` of the form
`pack/<type>/<slug>@<version>`, or `tool/<slug>@<version>` for a
tool-knowledge entry; an entry sourced `generated` carries no version and is
skipped, as is everything outside `entries:`, and so is a row of a retired
pack kind, which §5's own row reports. Compare each
recorded version against the version the adapter ships **now** for that ref,
and resolve "now" from the adapter rather than by guessing: the
`-stack-template` payload for a pinned template carries the same
`<type>/<slug>@<version>` composition refs, so a component named there is read
off the payload. A component no pinned template names is read from
`stacks/<type>/<slug>/pack.yaml` — a tool row's from
`tools/<slug>/tool.yaml` — inside the installed adapter plugin's own
tree, located from `claude plugin list` the way this section locates `mise` —
vwf's own plugin-root token names vwf and can never spell another plugin's
root. For a
**pack** or **tool** record — and only those — a recorded version **older** than
the shipped one is one drift row naming the component and both versions. A
**newer** recorded version is not a finding here: the adapter went
backwards, which is the sync skill's conversation, not doctor's. **No
lockfile at all** on the base is `missing` rather than drift, remedy
`/vwf:setup` — no pack was ever materialized here.
A **member** with no lockfile is not a second `missing` row: it reads `not
checked — no lockfile` under that member, which says the same thing once, and
the product's one `/vwf:setup` is what lands it there.

**(b) Project ids.** Every project has an id, and a project whose pinned pack
ships `p/_project/` tasks gets a task group named for it, which setup's
materialize pass creates. Take **the ids that repo owns** — the base
its own, a member the `projects:` list on its entry where the base's config
declares one, and otherwise what init's section **"The project ids"** resolves,
in `${CLAUDE_PLUGIN_ROOT}/skills/init/references/new-repo.md` — that section
owns the source order and this one does not restate it. Slugify each id per the
adapter's `assets/ids.md` — that rule lives there and is not restated here
either — and check, **in the repo the id belongs to**, for each project whose
pinned pack ships `p/_project/` tasks — read from the pack's tree as (a) locates
it — that a task directory `.config/mise/tasks/p/<slug>/` exists. A project with
no such pack is not a finding. Commit scopes are not checked here: they are
bootstrap's `[tools.git].commit_scopes`, and (d) covers them.

Each miss is one drift row naming the repo, the project and the slug that was
expected, remedy `/vwf:setup`. The reverse direction is a row too: a
sub-directory of
`.config/mise/tasks/p/` whose segment matches no registry slug is drift worded
**"id source changed: `<dir>` is not a registry id"** — the expected state once
`/vwf:architecture` first writes ids into a repo that was shaped before it, and
a rename a re-run performs. It is never "a pack moved", and never a reason to
suspect the adapter.

**(d) Bootstrap drift.** Full mode only: `baseline`, and so `/vwf:recall`, never
runs it. In each repo the shaped test passed, from its root, run
`bootstrap check --json` and `bootstrap sync --json --dry-run`. Both read
bootstrap's clone and write nothing in the repository; `check` validates the
values folder, the branches and their landing values among its stages, and
the dry run lists what a sync would change. They are the only bootstrap
commands doctor runs beside the contract check and the shaped test. Judge
each by its envelope, never by its human lines on stderr:

- **`check`** — each finding of a stage whose `status` is `fail` is one drift
  row naming the repo, the stage and the finding's `message` (and its `path`
  when it has one). A finding whose `severity` is `warning`, in any stage, is
  one drift row marked as a warning. A `skipped` stage gives no row.
- **`sync --dry-run`** — each item of `data.plan.changes` is one drift row
  naming the repo and the item's `path`, with its `note` when it has one; and
  each item of `data.plan.files` whose `kind` says the sync would write or
  remove the file — `changed`, `new`, `seeded` or `removed` — is one drift row
  naming the repo, the `path` and the `kind`. Any other `kind` gives no row.
- **A failure before the stages** — `ok` false with `checks` `[]` for
  `check`, `data` `null` for `sync` — is one drift row naming the repo and the
  command, with the envelope's `errors` messages word for word.
- **Code 5** — one row naming the repo and the command: `not checked: the
  clone is stale and offline`.

None of these rows is blocking, and every one takes the remedy
`/vwf:setup reshape`. This covers every file bootstrap syncs, and the
branches, so none of them is read or hashed here.

**(e) Content drift.** A file a pack landed lives in the repo,
where anything may edit it; what it holds *today* is the question (a) does
not ask.

**What a pack copied is judged by its hash.** Every `entries:` record
carries a `hash:` — the content at the version this repo locked — so the
check is a hash comparison against the file on disk. Take every such record
whose `path` lands **outside `.claude/`**, which is the `config/` tier: the
tree setup's materialize pass lands, and the one this section is about. A file
whose
content no longer matches its recorded hash is one drift row naming the
path, once the second test below confirms it; a recorded path that no longer
exists at all is the same row, worded **removed**, and takes no second test.
A path the lockfile lists under `skipped:` has no `entries:` record — the two
lists never share a path, and `skipped:` holds only what was never landed. It
is intentionally absent — its pack declared a condition the repo's answer did
not meet — and is **never** reported as missing; a later run whose answer
changed re-evaluates it, which is `/vwf:setup` landing it. Present on disk, a
file at a skipped path is the repo's own — unread, unlisted, and never a row
here, since no re-run could clear it while the answer stands. A path that
**has** an `entries:` record — landed on an earlier run whose answer has since
flipped, or never conditional — is checked by hash like any landed file,
whatever its condition reads today.

The hash comparison stays the first and cheapest test, and a match ends it: a
file matching its record raises nothing and nothing further is read. **A
mismatch takes one more test before a row is written**, because a hash says
two contents differ and says nothing about *where*. Reconstruct what the file
would hold if the only divergence were a marked position's value: take the
pack's shipped payload for that path at the version the record's `source:`
pins, splice into it the repo file's **current** value at **every position
the payload marks** with its marked-position comment, and hash that. Equal
to the file on disk, and the whole divergence lies inside those positions:
**not** drift under (e), and no row here. Unequal, and it is drift under
(e), reported exactly as above. A filled position is the shaped state, not a
repo edit, which is the whole reason for the second test.

**A marked position is where a repo-specific value lives, so a value sitting
in one is never (e)'s finding**, and nothing reports it at all — a Worker's
name, any other a pack ships. Splicing every position the pack **marks**,
rather than a chosen few, is what makes a mixed file tractable: splicing only
some would leave the rest diverging and report the whole file as content
drift.

**A record whose `source:` is `generated` has no pack payload** to reconstruct
from, so there is nothing to splice: the second test is skipped, and test 1's
mismatch is (e)'s row exactly as it was before this test existed.

For a pack-copied file, (e) runs two tests: the hash, then the
marked-position splice. Nothing is reported here that `/vwf:setup` would not
offer to fix.

That comparison isolates exactly one thing — content drift is the **repo**
having edited a file the pack owns. A pack that merely moved leaves the file
still matching its landing hash and is (a)'s row instead, so the two never
double-count; a path appearing under both is a repo edit *and* a version
behind, which one `/vwf:setup` resolves together. Say which it is in the row,
because the fixes differ in kind: (a) is picked up by re-landing, (e) is a
file somebody meant to change.

**A file the user chose to keep is skipped.** A file recorded under
`enforcement.kept_files.<path>` is skipped by every check, a pack file included,
and that record settles it.
**The record lives in the base's `.config/vwf.yaml`, for every repo.** A
member carries only its back-link and no config of its own, so a keep taken
inside a member is keyed by the **base-relative** path: the member's path as
prefix, then the path the lockfile names inside it. So this sub-check reads
the base's one block whichever repo it is evaluating, and matches a member's
file by that prefixed key — on the base's own files the key is the lockfile's
spelling unprefixed, which is the same rule with an empty prefix. An absent
`kept_files:` block reads as empty, so a repo that has kept nothing skips
nothing. Reporting a kept file every run would re-accuse the user of a
decision already made, which is the one difference from the declined `iac`
extraction above: that cost is ongoing, this one is settled.

**No lockfile at all → `not checked — no lockfile`**, said plainly and counted
as neither a pass nor a drift row. A repo that has never been shaped landed
nothing, so no file's content *can* have drifted from a record that does not
exist; (a) already reports the absent lockfile as `missing`, and a second
finding saying the same thing would read as two problems. Never infer the pack
set from whatever happens to sit in `.config/` instead — anything not in the
lockfile is not the adapter's, which is the rule the materialization itself
lives by.

**(g) Forge state.** The one sub-check that reads the **remote** rather than
the checkout. `/vwf:init`'s **forge pass** — run once for the product, after
the base lands, for a repo `/vwf:git-workflow` landed with a push that run, or
one with nothing to land whose core branches are already on `origin` — sets
the repo's default branch on the forge, protects each of its core branches
there, and hands the base's
backlog project over to the user; the forge is the record for all three, and
nothing in the tree says what it chose. So this predicate asks the forge, in
**each** repo — the base and every locally-present member — through the same
CLI the recommended forge-CLI check above already probed. A repo's **core
branches** are the `data.value` of `bootstrap config get repo.core_branches
--json`, run in that repo: `develop` and `main`, or one of them. When that read
fails, the default-branch and protection checks print the note `forge state —
not checked: core branches unreadable` under that repo, never a drift row.

**The skip rule comes first.** A repo with no `origin`, or one whose host's
CLI is absent, unauthenticated for that host, or unsupported (`n/a — no forge
CLI`), prints one note line under that repo — `forge state — not checked:
<reason>` — and **no drift row**: the CLI's absence is already the degradation
above, and a second row saying the same would read as two problems. A call the
forge refuses — a ruleset listing on a repo the token has no admin on, a
project listing without the `project` scope — is the same note for that one
check, never drift: doctor cannot tell an absent setting from one it was not
allowed to read. Otherwise, three checks:

- **Default branch.** Read it from the forge — `gh repo view --json
  defaultBranchRef --jq .defaultBranchRef.name` on GitHub, the default-branch
  line of `glab repo view` on GitLab — and check it is one of that repo's core
  branches and that the branch exists. A default branch that is not a core
  branch — the forge's own first-push default, typically — or one that does
  not exist is one drift row naming the repo and the branch the forge holds.
  With two core branches, which of them it should be is the user's answer at
  the forge pass, recorded nowhere in the tree, so doctor never asserts
  `develop` over `main` or the reverse.
- **Protection.** On **each** core branch, whether the branch is
  protected on the forge at all. The pass leaves existing protection alone —
  it never merges its rules into a ruleset or protection already present — so
  a branch counts as protected when **any** ruleset or protection covers it,
  by any name: on GitHub, any active ruleset (`gh api
  repos/<owner>/<repo>/rulesets`) whose conditions include the branch, or
  classic protection on it
  (`gh api repos/<owner>/<repo>/branches/<branch>/protection`); on GitLab, a
  `protected_branches` entry for the branch
  (`glab api projects/:id/protected_branches`). **No protection at all** on
  a core branch is the one drift row here, naming the repo and the
  branch. Where protection exists but lacks one of the rules the pass would
  have set — **no force-push and no deletion**, always; **a pull request
  required** when that branch's own landing value reads `pr` — the
  `data.value` of `bootstrap config get repo.branches.<branch>.landing --json`
  in that repo, the branch name checked first (`## Passing values` of
  `${CLAUDE_PLUGIN_ROOT}/assets/bootstrap-contract.md`), `pr`, `direct-merge` or `direct-commit`, an unset key reading
  the default `direct-merge` (on
  GitHub the ruleset rules `non_fast_forward`, `deletion` and `pull_request`,
  or the classic `allow_force_pushes`, `allow_deletions` and
  `required_pull_request_reviews`; on GitLab `allow_force_push` and a
  `push_access_levels` list that lets nobody push directly, deletion being
  refused by protection itself) — doctor prints one
  **note** naming the branch and the missing rule, like the skip note: it is
  information, never drift, because a reshape would leave that protection
  exactly as it is, so no remedy exists to point at. On a branch whose value is
  not `pr` the require-PR rule is neither expected nor noted when present. A
  branch the
  forge does not carry reports `not on the forge — not checked` for that
  branch: pushing it is `/vwf:git-workflow`'s, and (d) already says whether it
  exists locally.
- **Backlog project.** **Base only, once per product**, and printed under the
  base's section. Resolve it exactly as the backlog skill's GitHub reference
  does — owner and name from `gh repo view --json owner,name`, then
  `gh project list --owner <owner>` filtered to an **open** project titled
  `<repo>` (`${CLAUDE_PLUGIN_ROOT}/skills/backlog/references/github.md`,
  "Resolving the project", which owns the rule and is not restated here). No
  match is one drift row: `backlog project <repo> — absent`. Two open matches
  is the skill's own stop, reported here as **information** naming both URLs,
  never as drift, since the user has to pick and a reshape cannot. On a GitLab
  remote print the skill's "not yet supported" line as information and check
  nothing; on any other host the skip rule already applies.

**A stray `develop`.** One more check in (g), per repo, which reads the
checkout rather than the forge, so the skip rule does not apply to it: a repo
whose core branches are **one** branch other than `develop` and that still has
a `develop` branch — locally (`refs/heads/develop`) or on `origin`
(`refs/remotes/origin/develop`) — is one drift row naming the repo and where
`develop` is. bootstrap's merge then refuses every landing into `main` from any
other branch while `develop` exists and `[branches.main]` sets neither
`merge_from` nor `merge_never`. Its fix is not a reshape: delete `develop`, or
set `merge_from` on `main` in that repo's `.config/bootstrap/repo.toml`
through the bootstrap CLI.

**Every row is `drift`, none is blocking**, and the remedy is
`/vwf:setup reshape` (the stray-`develop` row excepted, whose fix it names
itself), whose forge pass re-offers what is
absent — the default branch and a protection for an unprotected branch through
the CLI on one consent, the backlog project through the backlog skill's browser
hand-over — and leaves what is already set untouched, which is why an existing
protection short of a rule is a note and not a row. Doctor reads the forge and
never writes to it; every command above is a read, and a network miss is the
skip note, not a finding.

Doctor **writes none of this** — no branch, no directory, no key, no scope, no
pack-owned file, and no forge setting. It reports the rows, gives each remedy
once, and stops there, as it does with every other structural change in this
file.
