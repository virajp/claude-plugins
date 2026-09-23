# Stack Checks (§§3–5)

Read this before running §3. It covers the three per-project stack checks:
languages (LSP + toolchain), frameworks and dependencies against each manifest,
and the repo/axis tooling. **Blocking** findings live in §3 (a language no
installed plugin claims) and §5 (a `custom` template pin, a missing `mise`, an
`iac` project inside another repo the user has not declined to extract).

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
  it is provided, the mise tool and manifest per the fact values, `n/a`
  accepted silently as an answer. **A token declared only under a template's
  `optional_languages:` counts as declared** — the template admits it, which is
  what this test asks. Say so in the report, though: an optional token carries
  no language facts of its own, so its LSP/toolchain/manifest rows read
  **unverified** rather than passing. Known-but-unverified is an honest third
  answer, and quietly reporting it as a pass would be the drift this check
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
  config (`.config/mise*.toml`, per the mise skill's five-file split) or
  resolves on `PATH`. Missing → finding, with the `mise use` line as the remedy.
  A `—` in the column means the toolchain is not mise-managed; skip silently.

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

**The seven stack axes.** Since format 19 a stack is composed from independent
axes — `project`, `backing`, `deploy`, `repo`, `design`, `cicd` and, since
`config_format` 19, `stylesheet`
(`assets/stack-adapter.md` holds the enum) — and every one but `repo` is **per
project** (the three technology axes since format 13). Check each pin resolves
to a template an installed stack plugin actually offers:
`projects.<name>.stack.template` (project axis), each entry of
`projects.<name>.stack.backing_template`, `projects.<name>.stack.deploy_template`,
`repo.stack.template`, the `projects.<name>.design` and
`projects.<name>.cicd` pins, whose slug is the config value itself, and
`projects.<name>.stylesheet`, whose slug is likewise the config value and which
is **required only for a project declaring a `site` or a `webapp` platform** —
on any other project the key's absence is correct and is not a finding. A pin naming
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
looking clean. Treat it exactly as a declined graph build.

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
`tablet`, `auto`, `watch`, `tv`, `spatial`), and that the value is `<W>x<H>`
with two positive integers. Each miss is a **finding** naming the key — never
blocking: a stale override costs one canvas drawn at the default size, and the
screens skill falls back to the default on any entry it cannot use. An absent
`design.viewports` block is correct, not drift.

**mise is mandatory once there is anything to run** — it is both vwf's task
runner (every worktree init, pre-commit and merge goes through it) and the
toolchain manager the §3 checks resolve against. Missing from `PATH` →
**blocking once any axis in the repo is pinned or any harness capability is
claimed**, remedy `curl https://mise.run | sh`. With **no** axis pinned anywhere
and no capability claimed, it is a **degradation**: there is no toolchain to
manage and no harness task to run, so halting `setup` and `execute` over it
would block a product on day one for a stack nobody has chosen yet. A repo with
no `.config/mise*.toml` at all is the same finding one level up, at the same
severity: report it and nudge `/vwf:setup reshape`, the one repo-shape remedy.
Setup materializes no tooling itself — `/vwf:init` does, laying down the three
unconditional bundles `mise`, `repo-gates` and `repo-hygiene` by their fixed
slugs through the stack adapter's `-stack-template` skill. That is the coarsest
form of one question — is this repo still shaped the way `/vwf:init` shapes one
— and the section at the end of this file is the fuller version of the same
check: this one fires when the shape is absent, that one when it is behind.

Then check `repo.stack`: the `package_manager` resolves (lockfile present, tool
on `PATH` or in mise config) and each entry in `tools` has its expected marker —
a config file, a mise tool, or a manifest dependency. Absent `repo.stack` block
→ `10` drift; report and nudge `/vwf:setup`.

**`rtk` is recommended, never required.** vwf ships a `PreToolUse` Bash hook
that pipes each command through `rtk hook claude` to cut token cost, and the
hook entry is guarded (`command -v rtk … || true`), so a machine without it
runs correctly and simply pays full price. Missing from `PATH` → a
**degradation**, never blocking: name what it buys and give the remedy
(`brew install --formulae rtk`, or the releases at
<https://github.com/rtk-ai/rtk>). This is the one place vwf tells a user the
tool exists at all — without it the hook is silent in both directions, which is
why the finding is worth reporting on every run rather than once.

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
rather than a cost. An unsupported host reports `n/a — no forge CLI`. Like
`rtk`, this is reported on every run: a machine without the CLI runs correctly
and simply has no backlog to read, and nothing else says so until a verb fails.
The same three answers decide whether predicate **(g)** below runs at all —
it reuses them rather than probing a second time, and a miss here is what it
reports as its skip reason.

## The repo shape against its baseline

Part of §5, and the one check that reads the **shape** `/vwf:init` lays down
rather than what `.config/vwf.yaml` declares. A repo drifts from that baseline
by standing still: the adapter's packs move, `/vwf:architecture` names projects
that did not exist when the repo was shaped, and a fresh clone arrives with one
branch. It drifts by moving, too — a pack-owned file the repo edited in place
is no longer the file the pack ships. None of that stops the repo working, so
**every finding here is `drift`, and none is blocking** — a repo behind its
baseline is out of date, not broken. All seven sub-checks carry the **same
remedy, `/vwf:setup reshape`**,
which is why §9 prints that line once with the rows that led to it.

**The seven run per repo** — the base and every **locally-present** member,
resolved the way `/vwf:init`'s **Step 0** resolves them: the paths
`.gitmodules` declares union the `members:` list the config carries, deduped
on realpath. That step owns the rule and it is not restated here; a path only
one of the two sources names where both exist is the disagreement `init`
refuses to shape, and this check does not walk into it either. Every finding
is printed **under the repo it was found in**, so a row says which repo before
it says what drifted, and the remedy stays one line for the whole product —
`reshape` walks the members too, so one re-run covers every row under every
heading.

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
root. A recorded version **older** than the shipped one is one drift row
naming the component and both versions. A **newer** recorded version is not a
finding here: the adapter went backwards, which is the sync skill's
conversation, not doctor's. **No lockfile at all** on the base is `missing`
rather than drift, with the same remedy — the shape was never laid down here.
A **member** with no lockfile is not a second `missing` row: it reads `not
checked — no lockfile` under that member, which says the same thing once, and
the product's one `reshape` is what lands it there.

**(b) Project ids.** Every project has an id, and two surfaces in the repo
that owns it are generated from it. Take **the ids that repo owns** — the base
its own, a member the `projects:` list on its entry where the base's config
declares one, and otherwise what init's own **§7** resolves, in
`${CLAUDE_PLUGIN_ROOT}/skills/init/references/new-repo.md` — that section owns
the source order and this one does not restate it. Slugify each id per the
adapter's `assets/ids.md` — that rule lives there and is not restated here
either — and check, **in the repo the id belongs to**, that:

- a task directory `.config/mise/tasks/p/<slug>/` exists;
- the slug appears in `.config/git-conventional-commits.yaml`'s `commitScopes`.
  An **empty** list is not a miss: a single-project repo is meant to leave it
  empty and use no scope, and the shipped config says so.

Each miss is one drift row naming the repo, the project, the surface, and the
slug that was expected. The reverse direction is a row too: a sub-directory of
`.config/mise/tasks/p/` whose segment matches no registry slug is drift worded
**"id source changed: `<dir>` is not a registry id"** — the expected state once
`/vwf:architecture` first writes ids into a repo that was shaped before it, and
a rename a re-run performs. It is never "a pack moved", and never a reason to
suspect the adapter.

**The aggregator's member flags and its aliases are a different list, and it
is not this one.** The base's bootstrap aggregator carries one member flag per
**member repo**, and `.config/mise.dev.toml` carries one `setup-<member>`
alias beside each — both named for the members, never for a project id. That
split is stated in the same **§7** cited above, and it is why a member holding
three projects is still one flag. Compare the two lists on the **base**
against the member set this check resolved: a resolved member with no flag, or
none with an alias where the alias block exists at all, is one drift row; a
flag or an alias named for a **project id** on a product that has members is a
drift row worded **"named from project ids"**, which one reshape rewrites. A
repo whose alias block was never laid down is not drifting from it, exactly as
above.

**(c) Branches.** In **each** repo, ask that repo for `refs/heads/develop` —
`git show-ref --verify --quiet` — and the same for `refs/heads/main`. Either
one missing is a drift row: work flows from a feature branch or a worktree to
`develop`, and from `develop` to `main`, and the repo's own merge tasks refuse
a destination branch that does not exist locally. Remedy `/vwf:setup reshape`,
which creates the missing branch. A repo with no commit yet has neither branch
and reports one row saying that, not two — and a member is its own repository,
so a base carrying both branches says nothing about the member beside it.

**(d) The environment key.** In each repo, that repo's own `.config/mise.toml`
sets `REPO_NAME`, and its value is **that repo's folder name, slugified** —
the basename of that repo's **main checkout** directory, run through the
adapter's `assets/ids.md`. It is not a project id and never has to match one:
the `p/<slug>/` groups (b) reads are named for the projects, this key for the
folder they sit in. A member names its **own** folder, never the base's.

Read the folder from the **main checkout**, not from the working directory: a
linked worktree's directory is named for its branch, so resolve the common
git dir — `git rev-parse --path-format=absolute --git-common-dir` — and take
the basename of the directory holding it. Absent, or still holding the marked
position the toolchain pack ships, is a drift row; so is a value that is not
that folder's slug. Both carry the same remedy, `/vwf:setup reshape`, which
shows the change as init's `repo-name key: <old> → <new>` replace row and
applies it on the one consent. That key is what the user's own shell aliases
read, so a wrong one is quietly wrong everywhere it is used.

**(e) Content drift.** A pack-owned file is landed once and then lives in the
repo, where anything may edit it; what it holds *today* is the question (a)
does not ask. The lockfile answers it without re-reading the adapter: every
`entries:` record carries a `hash:` — the content at the version this repo
locked — so the check is a hash comparison against the file on disk. Take
every record whose `path` lands **outside `.claude/`**, which is the `config/`
tier: the tree `/vwf:init` shapes, and the one this section is about. A file
whose content no longer matches its recorded hash is one drift row naming the
path, once the second test below confirms it; a recorded path that no longer
exists at all is the same row, worded **removed**, and takes no second test.
A path the lockfile lists under `skipped:` has no `entries:` record — the two
lists never share a path, and `skipped:` holds only what was never landed. It
is intentionally absent — its pack declared a condition the repo's answer did
not meet — and is **never** reported as missing; a later run whose answer
changed re-evaluates it, which is the reshape landing it. Present on disk, a
file at a skipped path is the repo's own — unread, unlisted, and never a row
here, since no reshape could clear it while the answer stands. A path that
**has** an `entries:` record — landed on an earlier run whose answer has since
flipped, or never conditional — is checked by hash like any landed file,
whatever its condition reads today. Three rows are read from the config rather
than the lockfile. A repo whose config's `answers.secrets` names a provider
that has a row in the hygiene pack's provider table must carry that provider's
ignore section in `.gitignore`; absent, it is one drift row naming the
provider, remedy `/vwf:setup reshape`. A repo whose recorded
`answers.repos.<repo>.forge` differs from the host its live `origin` remote
names is one drift row naming both, same remedy — and so is a `skipped:` row
whose `when: forge` names a host the live one contradicts, since the files
that axis skipped are waiting for that reshape to land them. A repo with **no**
remote at all is neither row: there is nothing live to contradict, and the
recorded value stands. And a config stamped `config_format` 21 that carries no
`answers:` block at all is a drift row on its own, same remedy — that block is
what every caller now evaluates a conditional file against. A config stamped
**20** is not this row's business: §2's stamp comparison already reports the
format drift, and the callers infer the four answers meanwhile.

The hash comparison stays the first and cheapest test, and a match ends it: a
file matching its record raises nothing and nothing further is read. **A
mismatch takes one more test before a row is written**, because a hash says
two contents differ and says nothing about *where*. Reconstruct what the file
would hold if the only divergence were a marked position's value: take the
pack's shipped payload for that path at the version the record's `source:`
pins, splice into it the repo file's **current** value at **every marked
position init's `new-repo.md` enumerates**, each marked in the pack's payload
by its `MARKED POSITION` comment block — owned by another predicate or not —
and hash that. Equal to the file on disk, and the whole divergence lies inside
those positions: **not** drift under (e), and no row here. Unequal, and it is
drift under (e), reported exactly as above. A filled position is the shaped
state, not a repo edit, which is the whole reason for the second test.

**A marked position is where a repo-specific value lives, so a value sitting
in one is never (e)'s finding** — owned or not. A position another predicate
owns still gets that predicate's row and nothing more: (d)'s repo-name key,
(f)'s `MERGE_MODEL_DEVELOP`, `MERGE_MODEL_MAIN` and `MEMBERS`, (b)'s member
flag list and alias list each
report the value they found there. A position **no** predicate owns — the
plugin task's two agent-plugin lists, the `_default` slot, any other a pack
ships — is a value the repo set, and nothing reports it at all. Splicing by
what the pack **marks** rather than by what a predicate **owns** is what makes
a mixed file tractable: `.config/mise.toml` carries the repo-name key and
`MEMBERS` beside positions no predicate reads, and splicing only the owned
half would leave the rest diverging and report the whole file as content
drift.

**A record whose `source:` is `generated` has no pack payload** to reconstruct
from, so there is nothing to splice: the second test is skipped, and test 1's
mismatch is (e)'s row exactly as it was before this test existed.

This is `/vwf:init`'s existing-repo pass 6 asking the same question of the
same record on the same terms — the same two tests over the same set of
positions — which is what keeps the two agreeing: a file that pass leaves
alone is a file this predicate reports clean, and nothing is reported here
that a reshape would not offer to fix.

That comparison isolates exactly one thing — content drift is the **repo**
having edited a file the pack owns. A pack that merely moved leaves the file
still matching its landing hash and is (a)'s row instead, so the two never
double-count; a path appearing under both is a repo edit *and* a version
behind, which one reshape resolves together. Say which it is in the row,
because the fixes differ in kind: (a) is picked up by re-landing, (e) is a
file somebody meant to change.

**A file the user chose to keep is skipped.** A diverged pack-owned file that
`/vwf:init` offered as replace-or-keep and the user kept is recorded under
`enforcement.kept_files.<path>` — the same record `init` writes when it takes
that answer, read here rather than a second one — and that record settles it.
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

**(f) Three of the five marked positions beside `REPO_NAME`.** The toolchain
pack ships five more positions marked in its base config —
`MERGE_MODEL_DEVELOP`, `MERGE_MODEL_MAIN` and `MEMBERS` in the same `[env]`
block, and the two runtime positions `RUNTIME_BLOCK` under `[settings]` and
`PATH_ENTRIES` at the end of `[env]`, which `init` fills from its stack read
and which are **legitimately empty** on a repo with no detected language, so
this check reads neither of them, and (e) splices their values out like any
other position's. The two landing-model positions are read in **each** repo,
from that repo's own block; `MEMBERS` is read on the **base alone**, since a
member declares no members of its own unless it carries its own `.gitmodules`,
in which case it is a base in its turn and this check reaches it as one. Each
is read by a task rather than by vwf, so an unfilled one is wrong only where it
is used — which is why it goes unnoticed until the day that task runs:

- **`MERGE_MODEL_DEVELOP` and `MERGE_MODEL_MAIN`** — one per branch, each
  checked on its own: absent from the block, or holding anything other than
  `direct` or `pr`, is one drift row naming the position. The merge tasks fall
  back to `direct` for either destination when its position is unset, so
  nothing breaks loudly; what breaks quietly is the repo that meant `pr` — the
  shipped preselection for `main` — and has been landing that branch locally
  ever since. A block carrying the **legacy single `MERGE_MODEL`** and neither
  new position is one drift row reading `legacy MERGE_MODEL — reshape writes
  the pair`: every reader takes that one value as both until the reshape, so
  the row is the only thing that says the pair is missing. The remedy holds
  on a kept file too — a keep never covers a marked position's value, so the
  reshape fills both positions from the legacy value through its fill
  whether the file is replaced or kept.
- **`MEMBERS`** — absent **or empty** on a product whose config reads
  `topology: multi-repo` with `linkage: siblings` is one drift row. Under that
  linkage the list is the only place the task library learns the member set,
  so an empty one leaves `setup:all --all` and `code:worktrees` walking
  nothing. Empty is **correct** everywhere else — submodule linkage reads
  `.gitmodules`, and a single-project repo has no members — so this row is
  never raised outside siblings linkage. It is not the §1 membership check and
  does not replace it: that one compares `members:` against each member repo's
  own file and is blocking; this one asks only whether the repo's own tasks
  can see the same list.

`.config/mise.toml` absent altogether is (d)'s row for that repo, already
printed — (f) adds nothing to it.

**(g) Forge state.** The one sub-check that reads the **remote** rather than
the checkout. `/vwf:init`'s **forge pass** — the last step of its git pass,
run for a repo whose answer was *commit + push* — sets the repo's default
branch on the forge, protects `develop` and `main` there, and hands the base's
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
  required** when that branch's own value reads `pr` — `MERGE_MODEL_DEVELOP`
  for `develop`, `MERGE_MODEL_MAIN` for `main`, a legacy single `MERGE_MODEL`
  standing in for both — read from the same `[env]` block (f) reads (on GitHub
  the ruleset rules `non_fast_forward`,
  `deletion` and `pull_request`, or the classic `allow_force_pushes`,
  `allow_deletions` and `required_pull_request_reviews`; on GitLab
  `allow_force_push` and a `push_access_levels` list that lets nobody push
  directly, deletion being refused by protection itself) — doctor prints one
  **note** naming the branch and the missing rule, like the skip note: it is
  information, never drift, because a reshape would leave that protection
  exactly as it is, so no remedy exists to point at. On a branch whose value is
  `direct` the require-PR rule is neither expected nor noted when present. A
  branch the
  forge does not carry reports `not on the forge — not checked` for that
  branch: pushing it is the git pass's, and (c) already says whether it exists
  locally.
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

**Every row is `drift`, none is blocking**, and the remedy is the same one
line as (a)–(f): `/vwf:setup reshape`, whose forge pass re-offers what is
absent — the default branch and a protection for an unprotected branch through
the CLI on one consent, the backlog project through the backlog skill's browser
hand-over — and leaves what is already set untouched, which is why an existing
protection short of a rule is a note and not a row. Doctor reads the forge and
never writes to it; every command above is a read, and a network miss is the
skip note, not a finding.

Doctor **writes none of this** — no branch, no directory, no key, no scope, no
pack-owned file, and no forge setting. It reports the rows, gives
`/vwf:setup reshape` once as the remedy, and stops there, as it does with every
other structural change in this file.
