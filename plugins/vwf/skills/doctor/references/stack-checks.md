# Stack Checks (§§3–5)

Read this before running §3. It covers the three per-project stack checks:
languages (LSP + toolchain + binaries), frameworks and dependencies against each
manifest, and the repo/axis tooling. **Blocking** findings live in §3 (a
language no installed plugin claims, a materialized `binaries` entry missing
from `PATH` or whose declared probe exits non-zero — each blocking once the
project's `template` is pinned, a degradation while it reads `unresolved`) and
§5 (a `custom` template pin, a missing `mise`, an `iac` project inside another
repo the user has not declined to extract). The package manager's lockfile is
looked for where the pack's `lockfile:` fact says, when it declares one (§5).

## An unresolved axis is a degradation, and it makes two others conditional

Since `config_format` 16 any stack axis may read `unresolved` — deferred, not
decided (`${CLAUDE_PLUGIN_ROOT}/assets/vwf-config.md`, "The three axis states").
It is a **degradation**, reported every run, never blocking: it records a
decision postponed, not a repo in a bad state. Every check below that depends on
that axis reports **`not checked — no stack resolved`** and moves on — not a
pass, not a finding. Name the project and the axis, and give
`/vwf:architecture` as the remedy; never an install, since the question is
unanswered rather than unanswerable.

`unresolved` is the bare scalar on the list axes too, so `deploy_template:
unresolved` is deferral while `deploy_template: []` is a completed decision.
Treat them as opposites: `[]` is checked as an answer, `unresolved` is not
checked at all.

**Two findings this file otherwise raises as blocking are conditional on it**,
because a product nobody has chosen a stack for yet would otherwise halt `setup`
and `execute` on day one:

| Finding                | Blocking when                                                | Degradation when                                     |
| ---------------------- | ------------------------------------------------------------ | ---------------------------------------------------- |
| **unknown language** (§3) | that project's `template` is **pinned**                     | that project's `template` reads `unresolved`         |
| **missing `mise`** (§5)   | any axis in the repo is pinned, or any harness capability is claimed | no axis is pinned anywhere and no capability is claimed |
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

**Before the token walk, once per project.** A project whose `template` is a
slug, whose adapter is a **materializing** one, and whose target repo carries
no materialized entry for that slug in its `.claude/stackgen/lock.yaml` is
**pinned, not materialized — `/vwf:setup` materializes it**: raise that
finding, name the repo in it, and **skip the token walk for that project**.
The languages it would check come from the payload the repo lacks, so every
token would otherwise be reported as a stack vwf has no template for when the
template is pinned and merely absent from disk — they are not unknown there,
they are **unread**. It is **blocking**, on the third row of the table above,
and its remedy is that one line: one finding per project, never one per
token. Resolve the target repo as the member whose `projects:` list holds
this project, at that member's `path` relative to the base root; a project no
member claims lives in the current repo. A project carrying `languages: []`
is reached here exactly as one carrying tokens is: what this state is read
from is the pin and the lockfile, never the token list.

For each project, for each token in `stack.languages`, resolve its row in the
stack vocabulary. A project whose `template` reads `unresolved` records
`languages: []` — the one legal empty — so there is nothing to resolve and the
whole section reports `not checked — no stack resolved` for it:

- **LSP** — the row names a plugin. Check it is active
  (`claude plugin list --scope project`, falling back to user scope). Missing →
  finding, with `/plugin` as the remedy. Row says `none` → report *no LSP
  available in this marketplace* and move on. **No installed plugin declares
  the token, but the project's pin resolves to a materialized template whose
  payload carries `language_facts` for it** (the materialized escape,
  `${CLAUDE_PLUGIN_ROOT}/assets/stack-vocabulary.md`) — read from the **target
  repo's** own `.claude/` tree, resolved as the gate above → the language is
  **known**: verify against those facts instead — the LSP per how the facts say
  it is provided, which for a stack stackgen materialized is a server in its
  generated `vwf-tools` local plugin, the mise tool and manifest per the fact
  values, `n/a` accepted silently as an answer. **A token declared only under
  a template's `optional_languages:` counts as declared** — the template admits
  it, which is what this test asks. Say so in the report, though: an optional
  token carries no language facts of its own, so its LSP/toolchain/manifest rows
  read **unverified** rather than passing. Known-but-unverified is an honest
  third answer, and quietly reporting it as a pass would be the drift this check
  exists to catch. **No installed plugin declares the
  token and no materialized facts cover it** → report **unknown language**.
  **Blocking once this project's `template` is pinned**: nothing else can be
  checked for the token, and a stack vwf has no template for is one it cannot
  plan or build against. **A degradation while that `template` reads
  `unresolved`** — a project in that state should carry no tokens at all, and
  one that does cannot be blocked on a plugin that has not been chosen yet
  (`${CLAUDE_PLUGIN_ROOT}/assets/stack-vocabulary.md`). Either way the remedy is
  two lines — install the stack plugin that declares the language, or write one
  (`${CLAUDE_PLUGIN_ROOT}/assets/stack-adapter.md`) — never a suggestion to
  drop the token, which would only hide the project.
- **Toolchain** — the row names a mise tool. Check it appears in the repo's mise
  tool pins (`.config/mise/conf.d/*/mise*.toml`, `.local` variants excluded) or
  resolves on `PATH`. Missing → finding; the pins are bootstrap's, so the
  remedy is `/vwf:setup reshape`, which brings the repo to bootstrap's config
  — then `mise install`.
  Never a bare `mise use`, which writes a pin outside the layout.
  A tool pinned only in `.config/mise.toml` or a `.config/mise.<env>.toml`
  counts as pinned, not a miss.
  A `—` in the column means the toolchain is not mise-managed; skip silently.
- **Binaries** — only where the language is known through materialized
  `language_facts` that carry a `binaries` list (absent means none; a language
  plugin's row has no such column). An entry takes one of two forms. A **bare
  name** is looked up with `command -v <name>`; missing → finding naming the
  binary. A **map**, `{ name: <binary>, probe: "<command>" }`, has its `probe`
  run instead — from the repo root, inside the repo's mise environment, the
  command held in a variable and passed to the shell as **one argument**
  (`mise x -- sh -c "$cmd"`), never spliced into a quoted string, so the
  quotes and `$` references a probe carries reach the shell intact; stdout
  and stderr discarded, stopped after 30 seconds — and exit 0 is required;
  anything else, a timeout included, is a finding naming the binary, the
  probe and its exit status (or `timed out`). **The probe runs only while its
  entry matches what the lockfile last recorded:** it is run only when the
  committed template entry it was read from
  (`.claude/<adapter>/templates/<slug>.md`) still hashes to the value its
  adapter lockfile records. On a mismatch it is not run — the entry changed
  after it was recorded, and doctor stays report-only — and the binary is
  reported **probe not run**, the drift as the reason, at the severity a
  failed probe would carry. A probe is what tells a
  binary that is present but unusable from one that works — for example,
  `xcodebuild -version` exits non-zero on a machine that has only a stub on
  `PATH`, where `command -v` would pass. A map with no `probe` is a bare name.
  Either finding carries the remedy that installs the binary (for
  `xcodebuild`: install Xcode, then `sudo xcode-select -s` at it).
  **Blocking once this project's `template` is pinned** — mise will not supply
  it, so the skip above would otherwise hide it and the build fails on first
  run. **A degradation while that `template` reads `unresolved`** — the same
  severity for a failed probe as for a missing name.

Report per language, not per project — one missing Dart LSP is one finding even
when three projects declare `dart`.

## 4. Frameworks and dependencies — manifests

For each project, read the manifest its languages imply (the vocabulary's
Manifest column, resolved against the project's `path` from the registry). Check
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
`projects.<name>.stack.backing_template`, `projects.<name>.stack.deploy_template`,
`repo.stack.template`, the `projects.<name>.design` and
`projects.<name>.cicd` pins, whose slug is the config value itself, and
`projects.<name>.stylesheet`, whose slug is likewise the config value and which
is **required only for a project declaring a `site` or a `webapp` platform** —
on any other project the key's absence is correct and is not a finding — and
each slug of the top-level `addons:` list. A pin naming
a template that isn't there is **drift** — usually a template renamed under the
user's feet, or a stack plugin that was never installed. An axis reading
`unresolved` is not a pin: report the degradation above and resolve nothing. A
**`custom` pin is
`13` drift and blocking**: the value was retired in `config_format` 14, and it
names a stack with no `conventions` for `plan` and `execute` to read and no
`harness` block to check against — remedy `/vwf:setup`, which
walks the axis back through the menu. A project whose
platforms ship through a store rather than to a deploy target (`mobile`,
`tablet`, `desktop`, `auto`, `watch`, `tv`, `spatial`) is correct with
`deploy_template: []`, not missing, as is an `iac` platform, which *is* the
deploy path. A project declaring `cli` **pins a deploy template for its
package registry** — **which one is the stack plugin's answer**, and **vwf
names no slug on this axis or any other**, so what this check asserts is that
the axis is **answered**, never what it was answered with.

**A project missing a required axis is a finding.** Every registry project needs
a `template` and a `deploy_template`. On the two list axes *answered* means a
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

**Addons.** `addons:` is the top-level list of optional tools the product picked
in `.config/vwf.yaml`; absent or `[]` means no optional tool. `[]` is a completed
answer, **never a pending decision**, and the list never holds `unresolved`, so
neither is a finding. Every mismatch below is **drift**, remedied by
`/vwf:setup`, and **never blocking**: a missing tool blocks no `execute`, since
what needs a tool halts on its own when it does.

Read the **base repo's** `.claude/stackgen/lock.yaml` for this check, never a
member's: addon pins materialize in the base repo alone. **Read every owner from
that lockfile**, and never match keys against pack declarations. Each item
carries its owners as a list:

- a server under `local_plugin.mcp_servers` is `{name, packs: [...]}`;
- a `bootstrap.plugins` map entry lists its owners in `components: [...]`;
- a skill entry names its owner by its component.

An item is **owned by `addon/<slug>`** when that owner is a ref to that pack, at
whatever version the ref carries. An entry with no owners — the old shape — reads
as **owners unknown** and is skipped; the next sync rewrites it.

- **Forward** — for each slug in `addons:`: no lockfile item is owned by
  `addon/<slug>`; or an owned server is missing from the `vwf-tools` manifest,
  `~/.claude/plugins/local/vwf-tools/.claude-plugin/plugin.json`; or an owned
  bootstrap plugin is not installed (`claude plugin list`).
- **Reverse** — any lockfile item (server, skill entry, bootstrap plugin) owned
  by `addon/<slug>` whose slug is not in `addons:`.
- **Unclaimed keys** — a server key in the `vwf-tools` manifest that
  `~/.claude/plugins/local/vwf-tools/.claude-plugin/claims.json` lists for no
  repo; an absent `claims.json` lists none, so that is one row naming every key.
  Nothing deletes such a key automatically: `/vwf:setup` in a repo that uses it
  adds that repo's claim.
- **The old plugin** — a `~/.claude/plugins/local/stackgen-lsp/` directory, read
  whatever the lockfile says, stays drift until its migration is accepted, and
  `/vwf:setup` is what offers it again (stackgen migrates it). The row says what
  the wait costs: until then a picked tool's server and a design tool's server
  land nowhere, and the repo's `.mcp.json` entries stay.

**A declared backing capability should have a provider.** For each registry
project, read its `capabilities:` and classify each token by the **kind** marked
in `${CLAUDE_PLUGIN_ROOT}/assets/capability-vocabulary.md`. For every **`B`**
(backing-service) token, check that some entry of that project's
`backing_template` list declares it — resolve each pinned template and read the
`capabilities:` its payload carries. A `B` token no pinned template provides is
a **finding**: name the project, the token, and the pins that were checked. A
project whose `backing_template` reads `unresolved` has no pins to resolve:
report `not checked — no stack resolved` for it rather than every `B` token it
declares as unprovided.

Three rules keep it honest:

- **`F` and `P` tokens are never reported.** A product foundation is the
  product's own code and a project-axis fact belongs to the project template;
  neither has anything to pin, so asking for one is a category error.
- **Consumers follow the publisher.** A capability this project only *consumes*
  is provided by the publishing project's pin, not its own — resolve the
  publisher before reporting (the rule is in the vocabulary asset). A consumer
  with `backing_template: []` is correct, not drift.
- **Never blocking.** Some `B` tokens have no template offering them anywhere in
  the installed plugins, so this would otherwise halt `setup` and `execute` over
  a gap in the template library rather than in the user's repo. Report it and
  nudge `/vwf:architecture`; do not raise it to blocking without deciding that
  separately.

**An `iac` project must be its own repo.** For each registry project declaring
the `iac` platform, resolve its `path` and check which repo's working tree it
falls in (`git -C <path> rev-parse --show-toplevel`). If that resolves to
another project's repo — the monorepo it sits inside, or the multi-repo **base**
itself rather than a member — it is a **blocking** finding: `setup` and
`execute` both halt on it. The rule and its rationale are in
`${CLAUDE_PLUGIN_ROOT}/assets/topologies/`. The remedy is the extraction
`/vwf:setup` writes up as a recommendation; doctor reports and
stops there, as with every other structural change. An `iac` project that is
already its own repo — an independent one, a submodule, or a sibling member —
passes silently.

**Unless the extraction is a recorded decline.** A decline written under
`enforcement:` downgrades this finding to a **degradation**: still reported,
every run, but no longer blocking, so neither `setup` nor `execute` halts on it.
The decline settles the *proposal*, never the *fact* — a product that chose to
keep its `iac` project where it is should keep being told what it costs, and
silencing the finding would leave the most privileged repo in the product
looking clean.

**A project's template must cover its platforms.** Since format 22 a
project-axis template declares the platforms it serves in its own frontmatter,
and a project declares its own in the registry. Every platform the project
declares must appear in its pinned template's list; one that does not is
**blocking**, since `plan` and `execute` would size that surface against
conventions written for something else. A project whose `template` reads
`unresolved` has no list to check against: report `not checked — no stack
resolved` and move on. The common case is a project that was
`fullstack` before the migration and is now `[service, webapp]` — check the pin
rather than assuming the migration got it right.

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
**blocking once any axis in the repo is pinned or any harness capability is
claimed**, remedy `curl https://mise.run | sh`. With **no** axis pinned anywhere
and no capability claimed, it is a **degradation**: there is no toolchain to
manage and no harness task to run, so halting `setup` and `execute` over it
would block a product on day one for a stack nobody has chosen yet. A repo with
neither `.config/mise.toml` nor `.config/mise/conf.d/` is the same finding one
level up, at the same severity: report it and nudge `/vwf:setup reshape`, the
repo-shape remedy, since bootstrap is what installs the mise config.
Setup materializes no tooling itself — `/vwf:init` does, by running
bootstrap's readme prompt, and fetches no bundle.
**A repo is shaped when `.config/bootstrap.toml` exists** — the values file
bootstrap writes and a plugin never edits. A repo without it, carrying
`.config/stackgen.yaml` or the older files —
`.config/mise/conf.d/tools.toml`, `.config/mise/conf.d/env.toml`, or a
root `.config/mise.dev.toml` — is **shaped on the old layout**: one drift row
naming the files found, remedy `/vwf:setup reshape`, whose init adopts
bootstrap. A repo without it and carrying none of those is **not shaped**: one
row, the same remedy. On either row no predicate below is evaluated in that
repo. A leftover `repo-hygiene/repo-hygiene` lockfile record is the same
old-layout row. That is
the coarsest form of one question — is this repo still shaped the way
`/vwf:init` shapes one — and the section at the end of this file is the
fuller version of the same check: this one fires when the shape is absent,
that one when it is behind.

Then check `repo.stack`: the `package_manager` resolves (lockfile present, tool
on `PATH` or in mise config) and each entry in `tools` has its expected marker —
a config file, a mise tool, or a manifest dependency. Absent `repo.stack` block
→ `10` drift; report and nudge `/vwf:setup`.

**Where the lockfile is looked for comes from the pack.** A `lockfile:` list —
paths or globs relative to the repo root — rides whichever template payload
composes the package manager, on **any** axis: `repo.stack.template`, and a
project's `template` as much, since a package manager can ship inside a
project bundle only. So read it from **every pinned, materialized payload
that carries one**, each in the repo that pin materialized in, not from
`repo.stack` alone. The lockfile is present when **any** entry matches at
least one file; the finding, when none does, names the slug and every entry
it tried, at the severity of the `package_manager` check above. A glob
reaches into a project bundle as readily as the root: a package manager whose
lockfile an IDE keeps inside its project directory declares that path beside
the root one (for example
`*.xcodeproj/project.xcworkspace/xcshareddata/swiftpm/Package.resolved`).
Where **no** pinned payload carries a `lockfile:` list, `repo.stack` keeps
today's reading — the package manager's conventional lockfile at the repo
root, judged from the token — and that is the only case read that way.

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

## The repo shape against its baseline

Part of §5, and the one check that reads the **shape** `/vwf:init` lays down
rather than what `.config/vwf.yaml` declares. A repo drifts from that baseline
by standing still: the adapter's packs move, bootstrap moves, `/vwf:architecture`
names projects that did not exist when the repo was shaped, and a fresh clone
arrives with one branch. It drifts by moving, too — a pack-owned file the repo
edited in place is no longer the file the pack ships. None of that stops the
repo working, so **every finding here is `drift` or a `warning`, and none is
blocking** — a repo behind its baseline is out of date, not broken.

**Each row carries the remedy of whoever owns what it read**, and §9 prints each
remedy once with the rows that led to it:

| Remedy | Rows |
| --- | --- |
| `/vwf:setup` — the packs | Pack versions, a missing pack lockfile, Project ids, Content drift |
| `/vwf:setup reshape` — bootstrap and the forge | not shaped, shaped on the old layout, Branches, Bootstrap drift, Forge state |
| fix the value in `.config/bootstrap.toml` | Merge model |

**The seven run per repo** — the base and every **locally-present** member,
resolved the way `/vwf:init`'s **Step 0** resolves them: the paths
`.gitmodules` declares union the `members:` list the config carries, deduped
on realpath. That step owns the rule and it is not restated here; a path only
one of the two sources names where both exist is the disagreement `init`
refuses to shape, and this check does not walk into it either. Every finding
is printed **under the repo it was found in**, so a row says which repo before
it says what drifted, and each remedy stays one line for the whole product —
both doors walk the members too, so one re-run covers that remedy's rows under
every heading.

**An absent member is a blind spot, not a finding.** A member this machine
does not carry is said in §5's output as `<member> — not present, not checked`
and nothing more: it is the blind spot the membership contract already
recorded (`${CLAUDE_PLUGIN_ROOT}/assets/membership.md`), and a drift row about
a repo the user declined to clone would describe a shape nobody here can read.

**(a) Pack versions.** Read each repo's **own** `.claude/stackgen/lock.yaml`,
the adapter's materialization record — its `-sync` skill owns the file, and
this check reads one thing out of it: the `entries:` list. Each entry names
the component it landed for and a `source:` of the form
`pack/<type>/<slug>@<version>`; an entry sourced `generated` carries no
version and is skipped, as is everything outside `entries:`. Compare each
recorded version against the version the adapter ships **now** for that ref,
and resolve "now" from the adapter rather than by guessing: the
`-stack-template` payload for a pinned template carries the same
`<type>/<slug>@<version>` composition refs, so a component named there is read
off the payload. A component no pinned template names is read from
`stacks/<type>/<slug>/pack.yaml` inside the installed adapter plugin's own
tree, located from `claude plugin list` the way this section locates `mise` —
vwf's own plugin-root token names vwf and can never spell another plugin's
root. For a
**pack** record — and only a pack record — a recorded version **older** than
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
bootstrap's `commit_scopes`, and (d) covers them.

Each miss is one drift row naming the repo, the project and the slug that was
expected, remedy `/vwf:setup`. The reverse direction is a row too: a
sub-directory of
`.config/mise/tasks/p/` whose segment matches no registry slug is drift worded
**"id source changed: `<dir>` is not a registry id"** — the expected state once
`/vwf:architecture` first writes ids into a repo that was shaped before it, and
a rename a re-run performs. It is never "a pack moved", and never a reason to
suspect the adapter.

**(c) Branches.** In **each** repo, ask that repo for `refs/heads/develop` —
`git show-ref --verify --quiet` — and the same for `refs/heads/main`. Either
one missing is a drift row: work flows from a feature branch or a worktree to
`develop`, and from `develop` to `main`, and the repo's own merge tasks refuse
a destination branch that does not exist locally. The remedy is bootstrap's
`docs/sync`, reached through `/vwf:setup reshape`. A repo with no commit yet has
neither branch
and reports one row saying that, not two — and a member is its own repository,
so a base carrying both branches says nothing about the member beside it.

**(d) Bootstrap drift.** First, from the repo's root, run `mise trust --show`.
Run the dry-run only when it lists a config of that repo and every one it lists
there reads `trusted`; a line for a parent directory does not count, and a repo
with no config listed is not trusted. `mise run` runs a repo's task with no
trust prompt, and trusts the repo's config as it does, so this is the one check
before a cloned repo's code runs. Otherwise the dry-run does not run: drift is
**unknown**, one `warning` naming the repo with the reason
`repo not trusted by mise`.

In a trusted repo, from its root, run `mise run setup:configs --dry-run`,
bootstrap's own done-check. It writes nothing in the repository, but it does run
code: the repo's own `setup:configs` task, which refreshes bootstrap's clone of
its `main` under `~/.cache/bootstrap` and executes bootstrap's task code from
that clone, unpinned. It is the only bootstrap command doctor runs. Judge it by
its exit code and its stderr, where it prints its lines, each with the prefix
`repo-sync:`. After that prefix, a line that starts with `would` — `would
update`, `would remove`, `would chmod`, `would set bootstrap_commit` — is a
change; a line that reads `unchanged`, `kept seed` or `skip` is not:

- **Exit 0 and no `would` line** — no drift, and no row.
- **Exit 0 and a `would` line** — one drift row naming the repo, with those
  lines under it, remedy `/vwf:setup reshape`.
- **Exit 5, or any other failure** — drift **unknown**: one `warning` naming the
  repo and the reason, the exit status and the last line on stderr. It is never
  a drift row and never a guessed one.

This covers every file bootstrap syncs, so none of them is hashed here.

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

**(f) Merge model.** In **each** repo, read `merge_model` of every `[branch.*]`
table in that repo's own `.config/bootstrap.toml`. A value other than `direct`
or `pr` is one `warning` naming the repo, the table and the value, remedy: fix
the value in `.config/bootstrap.toml`. The repo's merge tasks read any such value
as `direct`, so what breaks quietly is the repo that meant `pr` and has been
landing that branch locally ever since. An absent key means `direct`, bootstrap's
own default, and is no row.

**(g) Forge state.** The one sub-check that reads the **remote** rather than
the checkout. `/vwf:init`'s **forge pass** — run once for the product, after
the base lands, for a repo `/vwf:git-workflow` landed with a push that run, or
one with nothing to land whose core branches are already on `origin` — sets
the repo's default branch on the forge, protects `develop` and `main` there,
and hands the base's
backlog project over to the user; the forge is the record for all three, and
nothing in the tree says what it chose. So this predicate asks the forge, in
**each** repo — the base and every locally-present member — through the same
CLI the recommended forge-CLI check above already probed.

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
  line of `glab repo view` on GitLab — and check it is one of the two branches
  the forge pass offers, `develop` or `main`. Anything else — the forge's own
  first-push default, typically — is one drift row naming the repo and the
  branch the forge holds. Which of the two it should be is the user's answer at
  the forge pass, recorded nowhere in the tree, so doctor never asserts
  `develop` over `main` or the reverse.
- **Protection.** On **both** `develop` and `main`, whether the branch is
  protected on the forge at all. The pass leaves existing protection alone —
  it never merges its rules into a ruleset or protection already present — so
  a branch counts as protected when **any** ruleset or protection covers it,
  by any name: on GitHub, any active ruleset (`gh api
  repos/<owner>/<repo>/rulesets`) whose conditions include the branch, or
  classic protection on it
  (`gh api repos/<owner>/<repo>/branches/<branch>/protection`); on GitLab, a
  `protected_branches` entry for the branch
  (`glab api projects/:id/protected_branches`). **No protection at all** on
  `develop` or `main` is the one drift row here, naming the repo and the
  branch. Where protection exists but lacks one of the rules the pass would
  have set — **no force-push and no deletion**, always; **a pull request
  required** when that branch's own value reads `pr` —
  `[branch.develop].merge_model` for `develop`, `[branch.main].merge_model` for
  `main`, in the base's `.config/bootstrap.toml`, a missing file or key reading
  `direct` (on
  GitHub the ruleset rules `non_fast_forward`, `deletion` and `pull_request`,
  or the classic `allow_force_pushes`, `allow_deletions` and
  `required_pull_request_reviews`; on GitLab `allow_force_push` and a
  `push_access_levels` list that lets nobody push directly, deletion being
  refused by protection itself) — doctor prints one
  **note** naming the branch and the missing rule, like the skip note: it is
  information, never drift, because a reshape would leave that protection
  exactly as it is, so no remedy exists to point at. On a branch whose value is
  `direct` the require-PR rule is neither expected nor noted when present. A
  branch the
  forge does not carry reports `not on the forge — not checked` for that
  branch: pushing it is `/vwf:git-workflow`'s, and (c) already says whether it
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

**Every row is `drift`, none is blocking**, and the remedy is
`/vwf:setup reshape`, whose forge pass re-offers what is
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
