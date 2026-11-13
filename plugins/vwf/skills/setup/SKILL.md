---
name: setup
description: Bring a repo into vwf's format and keep it there. Step 0 resolves
  one of three entry paths — onboard (a blank repo bootstraps, a repo with code
  is detected and confirmed), migrate (reconcile a tree written against an older
  format), or current (say so and exit) — then runs the shared spine that
  validates, stamps .config/vwf.yaml, checks the repo, commits, and prints the
  chain forward. The argument reshape skips the fork and runs the repo-shape
  pass alone.
argument-hint: "[reshape]"
model: sonnet

disable-model-invocation: false
---

# setup — Onboard & Keep a Repo in vwf Format

Bring any repo — new, existing, or written against an older vwf format — into
the shape the rest of the workflow reads. `setup` is the Phase-0 bootstrapper of
`setup → product → architecture → design-system → blueprint → plan → execute`,
and the only vwf command that onboards. It is also where a **pinned** stack is
materialized: `/vwf:architecture` decides the slug, setup lands it, and **the
materialize pass runs in every mode** — which is why `/vwf:architecture` comes
back here when it is done.

**The mode is resolved once, in Step 0, and never re-derived.** Everything after
it branches on the named mode. There is no progress key and no resume state:
re-running **is** the resume mechanism — a conforming repo resolves to
`current`, and a half-finished onboard re-detects and produces a smaller plan.

You own the user conversation, per `${CLAUDE_PLUGIN_ROOT}/assets/elicitation.md` — one
decision per round, MCQ where an option set exists. Every write is
consent-gated; never delete, never overwrite without consent.

## References

Read the one the step needs, not all of them.

| Reference                                                      | Read it when                                                       |
| -------------------------------------------------------------- | -------------------------------------------------------------------- |
| [materialize pass](references/materialize.md)                  | every mode — landing the pinned stacks, and the absent axes        |
| [onboard pipeline](references/onboard-pipeline.md)             | mode `onboard` — both sub-paths                                    |
| [migrate pipeline](references/migrate-pipeline.md)             | mode `migrate`, and an old tree found under `onboard`              |
| [topology detection](references/topology-detection.md)         | detecting or confirming topology, roles, platforms, stacks         |
| [structure](references/workspace-structure.md)                 | presenting the topology menu, or writing a layout recommendation   |
| [migration & consent](references/migration-and-consent.md)     | the dry-run discipline every write in either pipeline goes through |
| [format lineage](references/format-lineage.md)                 | a retired spelling has to resolve to what it became                |
| [environment bootstrap](references/environment-bootstrap.md)   | the registry declares integrations or a secrets-manager `config`   |
| [memory tree](references/memory-tree.md)                       | writing `docs/memory/` and its four folders                        |
| [CLAUDE.md section](references/claude-md.md)                   | merging the vwf section into the repo's `CLAUDE.md`                |

## Hard Rules

- **Consent + dry-run.** Present the full plan — every create, move and update —
  and get approval before any write.
- **Worktree-safe; all git via /vwf:git-workflow.** Operate in an isolated
  worktree and keep it local; never push. If the working tree is dirty, ask
  whether to commit, stash, or proceed before creating it.
- **Never move source.** setup writes and moves documentation only. Layout
  drift is a written recommendation — see Recommendations, never moves.
- **Don't write repo tooling.** The repo shape — the toolchain manager's config
  and task library, the repo gates, the secrets provider — belongs to
  [bootstrap](https://github.com/virajp/bootstrap), reached through
  `/vwf:init`, which also writes its own hygiene files. Setup checks for it and
  offers init; it never writes any of it itself. Setup
  is also the **only** way init is reached — Step 0's offer, or `reshape` —
  since init is hidden from the `/` menu. On a multi-repo product the shape is
  **per repo**, and one init run reaches them all, so setup checks every repo
  and still offers init once. **Never write a README by hand**
  either — `/vwf:readme` owns it, and setup only names it in the chain.
- **Idempotent.** A migrate run reconciles only what drifted; a conforming tree
  yields an empty plan, and Step 0 routes it to `current` before that.

## The `reshape` argument — the shape pass, alone

`$ARGUMENTS` carries at most one word. With `reshape`, setup **skips the
detection below entirely**: invoke `/vwf:init` — which surveys **the base and
every member**, shows its one plan, takes its own consents and runs its
bootstrap step, which adopts a repo and also brings an adopted repo up to
date — print init's report verbatim, and **stop**. No mode fork, no validation,
no stamp, no doctor, no commit; a re-shape never touches `.config/vwf.yaml`,
because the spine below is a setup run's, and a user who wants both runs
`/vwf:setup` again afterwards.

A run of `/vwf:setup reshape` started **inside a member** is not a reshape of
that member alone. init resolves the base per the membership asset
(`${CLAUDE_PLUGIN_ROOT}/assets/membership.md`) and runs from there, so what
gets reshaped is the product — the base and every member — whichever repo the
user happened to be standing in.

`/vwf:setup reshape` is the line `/vwf:doctor` prints for a row about bootstrap
or the forge state, so most runs of it arrive from a drift row and should act
on exactly what that row named. A row about a pack names `/vwf:setup` instead:
a reshape runs no materialize pass. The shape pass includes init's **forge
pass** — the default branch, the protection on `develop` and `main`, the base's backlog
project — which is idempotent on a repo already set, so a reshape that arrives
from a forge-state row sets only what drifted.

## Step 0 — Resolve the mode

**The shape check comes first, before the mode fork**, and on a multi-repo
product it asks its two questions of **every repo in the product**. Resolve the
base per `${CLAUDE_PLUGIN_ROOT}/assets/membership.md`, and take with it every
member that base declares and that is present on this machine — the same set
`/vwf:doctor` evaluates. A run started inside a member therefore checks the
product rather than the one repo it is standing in, and an **absent** member is
a blind spot, never a finding. On a single-repo product the set is one repo and
everything below reads as it always did.

First, is the shape **there**: in **each** repo of that set,
`.config/bootstrap.toml` exists — the values file bootstrap writes. No pack
slug is checked: a repo is shaped when that file is there. A repo **without**
it that carries `.config/stackgen.yaml` or an older layout —
`.config/mise/conf.d/tools.toml`, `.config/mise/conf.d/env.toml` or a root
`.config/mise.dev.toml` — is **on the old layout**: name the repo and the files
that marked it. Second, is it **current**, evaluated **per repo** on that repo's
own artifacts by two predicates under **"The repo shape against its baseline"**
in `/vwf:doctor`'s stack-checks reference, named here by title. **Bootstrap
drift**: `mise run setup:configs --dry-run`, run in that repo, shows no change.
This explicit dry-run writes nothing in the repository, but it runs code: the
repo's own `setup:configs` task, which refreshes bootstrap's clone under
`~/.cache/bootstrap` and executes the `main` branch of bootstrap from that clone
with no pin. Run it only when mise lists this repo as trusted:
`mise trust --show`, run in that repo, lists a path inside the repo, and every
such line reads `trusted`. A parent's line does not count. Otherwise drift is
unknown, with the reason `repo not trusted by mise`. That check is a limit, not
a safeguard: it stops only a clone mise has never run, and the trust gate of
mise is not tied to file content, so a repo trusted once runs whatever its task
holds now. The dry-run prints on
stderr, each line prefixed `repo-sync:`; after the prefix, a line
starting `would` is a change, and `unchanged`, `kept seed` or `skip` are not.
No `would` line and exit 0 is no drift. A listed change is drift. Exit 5 or any
other failure is unknown too. **Unknown**, either way: say setup could not check
drift in that repo, with the reason, and continue as current. **Forge state**:
the default branch as chosen, both branches protected, and the base's backlog project present,
read from the forge when its CLI is on `PATH` and logged in, else not checked.
Doctor owns both predicates. Its Pack versions, Project ids, Branches and
Content drift rows are not part of this check. Every repo shaped and holding
both predicates — say so in one line, naming the repos checked, and read on.

**Otherwise some repo needs init, and setup offers it — once, for the whole
product.** A repo with no `.config/bootstrap.toml` and no old-layout file is
**unshaped**: say what is absent. Either predicate failing in a repo, that repo
is **behind its baseline**: name which, in the words doctor's rows use. The
offer fires when **any** repo in the set is unshaped, on the old layout or
behind, and it names **which repos** and what each of them showed — a base that
is current while one member is behind is still an offer, because the shape is
per repo and the product is shaped only when all of them are. All three causes
reach the same offer — init is what runs bootstrap, which lays the shape down
and brings it forward, and bootstrap's `docs/sync/migrate.md` maps an old
layout's keys — and on a yes invoke `/vwf:init`, which surveys the base and
every member and shapes them in one run of its own, and continue once it
returns. init is **skill-invoked**: hidden from the
`/` menu and called from here alone, so this offer and `reshape` above are the
only two ways it is reached. A **decline** is a recorded deferral on the terms
in [the onboard pipeline](references/onboard-pipeline.md), named with its
unlock (`/vwf:setup reshape`, run whenever), and the run continues to the mode
table. setup never materializes a bundle itself and never halts on an unshaped
or drifted repo: the repo shape and the vwf format are two different things,
and a repo can be onboarded into one without the other. The check **repeats
after the materialize pass**, once per run, so a change that pass's bootstrap
handoff makes in this run is caught in this run — see [the second shape
check](#the-second-shape-check) under the pass.

Read `.config/vwf.yaml`, then compare its `blueprint_format` and `config_format`
against the shipped integers (`${CLAUDE_PLUGIN_ROOT}/assets/blueprint-format`, and the
current `config_format` named in `${CLAUDE_PLUGIN_ROOT}/assets/vwf-config.md`).
The current stamp is `config_format: 26`. The latest config step, `25 → 26`,
makes every MCP server the user's to install: its repo part removes the retired
tools from `addons:` and each lockfile, deletes every MCP record left in each
lockfile, re-pins every project on `claude-design` to claude-code, lovable or
stitch in one question, and moves the stamp only once every part is applied;
its machine part runs on every run, beside the claims reconcile in the
materialize pass. The
[format lineage](references/format-lineage.md) row for 26 names both. The step
before it, `24 → 25`, adds `addons:` and moves into it each optional tool the
repo already records, taking its slug out of `backing_template`, asking no
question; the row for 25 names the tools and their sources. Before that,
`23 → 24` retires the palace — the `memory:` block, each `mempalace.yaml`, and
the `docs/memory/planning/`, `runs/` and `doctor/` folders, one removal row
each on consent — and is this pipeline's, offered by state at any stamp;
[migrate pipeline](references/migrate-pipeline.md) step 1 names all three, and
the `22 → 23` step before them, which `/vwf:setup reshape` applies.

| `.config/vwf.yaml`                                       | Mode      |
| -------------------------------------------------------- | --------- |
| absent, and no legacy `docs/blueprint/.vwf.yml`          | `onboard` |
| parseable, either stamp behind — or only the legacy file | `migrate` |
| parseable, both stamps current                           | `current` |
| present but **unparseable**                              | halt      |

**Unparseable halts.** Report the parse error verbatim with the line it names,
and give the two remedies — fix the file, or delete it and re-run to onboard
from scratch. Never onboard over it: a config that will not parse still records
decisions nothing else does, and overwriting it discards them silently.

**`onboard` forks once more — on evidence, not on a second mode.** A **blank**
repo has no package or language manifest, no source directories, and no
`docs/blueprint/` tree. A README, LICENSE, `.gitignore` and `.gitattributes`
(bootstrap's git tool), and
tooling-only configs (mise, formatter, linter, pre-commit — at the root or under
`.config/`) are **not** code: a repo holding only those is blank. Anything else
takes the code sub-path. Both are in the onboard pipeline. This fork chooses
setup's onboard sub-path only: `/vwf:init` runs its **own** mode test per repo,
the table in `${CLAUDE_PLUGIN_ROOT}/skills/init/SKILL.md`, and nothing is
handed down, since init takes no argument.

**An old `docs/blueprint/` tree found under `onboard`** is handed to the migrate
pipeline once detection is confirmed. The two are one reconciliation at
different elicitation depths — onboard elicits every decision, migrate carries
most forward and maps the renames.

**`current` reports and exits — after the materialize pass.** Name both stamps,
say the repo is current, run [the materialize pass](#the-materialize-pass)
below on the config already there, and print the chain with that pass's report.
Nothing else re-walks the repo: that is `/vwf:doctor`'s job, and saying so is
the whole report.

## The materialize pass

**Architecture decides; setup pins.** A slug on a stack axis is a decision
`/vwf:architecture` made and wrote; landing it is setup's, and the pass that
does it is [materialize](references/materialize.md) — read it there, in full,
rather than reconstructing it here. The stackgen materializer, which hands the
tools a pack needs to bootstrap, is the one thing the pass calls.

It runs **once per run, in every mode**, on a `.config/vwf.yaml` that is
already current: in `onboard` and `migrate` between the spine's steps 2 and 3
below, and in `current` before that mode's report. `current` is not an
exception to be optimized away — a repo `/vwf:architecture` has just written
pins into resolves to exactly that mode, and skipping the pass there is
skipping the whole handoff.

In one paragraph, so a reader knows what the reference will say: setup groups
the axes holding a slug the target repo's adapter lockfile does not name,
dedupes by slug per repo, and invokes the adapter once per `(repo, slug)`,
each landing behind the **adapter's own** consent line; the adapter copies
each pack's `config/` as part of it. Setup reads nothing from
`.config/stackgen.yaml`, and a repo's secrets provider is bootstrap's. A
declined landing leaves the pin untouched and is reported. An `unresolved`
axis is skipped silently. An **absent** axis is written `unresolved` and the
run continues — a slug is never rewritten. The pass also reads `addons:` and
fetches each slug as an `addon`-axis pin through the stack adapter, on every
run and in the base repo only; a slug removed from `addons:` goes through the
adapter's removal path, and an absent `addons:` reads as none and is never
written `unresolved`. Beside the claims reconcile, on every run, the pass
offers the machine part of the `25 → 26` step: when this machine's stack
plugin manifest holds an MCP server key, one consent removes every key and
setup lists the servers for the user to install by hand.

### The second shape check

The pass ends with **a second shape check** — the same two questions Step 0
asked, is the shape *there* and is it *current*, over the same set of repos,
after everything the pass wrote. It exists because Step 0 runs before the pass:
a change the pass's bootstrap handoff made to `.config/bootstrap.toml` is drift
Step 0 could not see, and without this check it would wait for the next run.
Evaluate the repos by the same doctor predicates; on any repo unshaped, on the
old layout or
behind, make the offer exactly as Step 0's paragraph makes it — the drifted
repos, what each showed, the one question, `/vwf:init` on a yes, a recorded
deferral on a decline — and continue. Every repo clean, print nothing: a clean
second check is not a report line.

It runs **once per setup invocation**, wherever the pass ran — before step 3 in
`onboard` and `migrate`, before the report in `current` — and never a third
time. A `reshape` invocation is the shape pass itself, runs no materialize
pass, and does not run this check.

## The shared spine

Run the mode's pipeline. It returns the facts the config is written from and the
recommendations the report carries. Then, in this order — the ordering is the
point, since a stamp written before validation describes a tree nothing checked:

1. **Validate the bundle.** Every `docs/blueprint/` doc opens with valid OKF
   frontmatter and every relationship link resolves (the blueprint-authoring
   `frontmatter-and-links` reference); every YAML artifact parses; the required
   foundations are present for what the registry declares; `environment.md`
   carries no secret values. A bundle that fails here never reaches a stamp.
2. **Write `.config/vwf.yaml`.** `${CLAUDE_PLUGIN_ROOT}/assets/vwf-config.md` is
   authoritative for every key — write the two stamps plus exactly what the
   pipeline elicited, and nothing it did not. For a multi-repo product also
   write each member's `.config/vwf-membership.yaml`, per
   `${CLAUDE_PLUGIN_ROOT}/assets/membership.md`; which members are on this machine is
   detected every run and never recorded.

   **Then run [the materialize pass](#the-materialize-pass)**, before step 3 —
   the config it reads and writes is the one just written, and a stack that
   landed here is a stack the doctor gate below no longer reports as missing.

3. **Run /vwf:doctor** over the repo — it checks the config just written
   against what the repo actually is. setup **records** what it reports and does
   not gate on most of it: a missing LSP plugin or an unbuilt harness capability
   is a normal state for a freshly onboarded repo.

   **Halt on a `blocking` finding, and revert the stamp** — delete
   `.config/vwf.yaml` if this run created it, else `git checkout --` it — so no
   stamped-but-unrunnable artifact survives the halt. Report the finding with
   its remedy. **Halt the same way on an unknown language** (doctor's
   `unknown-language` row) of a project whose `template` is pinned: doctor and
   `/vwf:execute` only report it, as a degradation, but setup is the one-time
   place for the setup-shape checks, so setup alone stops on it
   (`${CLAUDE_PLUGIN_ROOT}/assets/stack-vocabulary.md`). It is the stop an
   otherwise-onboarded repo reaches: say plainly that the menu is closed to what
   the installed plugins define
   (`${CLAUDE_PLUGIN_ROOT}/assets/stack-adapter.md`), and never invent a template to
   get past it.

   **A declined landing is the expected way to reach "pinned, not
   materialized".** That finding is blocking, so it halts here and reverts the
   stamp like any other — the honest outcome of a repo whose stack the user
   chose not to land, with the pin left for `/vwf:setup` to offer again. A
   decline in mode `current` never reaches this step at all: that mode reports
   and exits with no stamp to revert, so the block is what `/vwf:doctor`
   reports on demand and what the next spine run halts on. An `unresolved` axis
   is the opposite case and **never** blocks: it is a degradation doctor
   reports every run, and setup names its unlock (`/vwf:architecture`) and
   finishes.

   **One exception.** A **declined `iac` extraction** recorded under
   `enforcement.rules.topology/iac-own-repo/<project>` is a settled choice,
   not an unmet mandate: the finding stays, as a warning reported every run,
   and neither setup nor `/vwf:execute` halts on it.
4. **Approval gate & commit.** Summarize everything created and updated, plus
   the recommendations, and wait for approval. On approval commit via
   `/vwf:git-workflow` with an `ops:` or `docs:` message.
5. **Chain forward.** Print the ordered chain and stop:
   `/vwf:product` → `/vwf:architecture` →
   `/vwf:design-system` (once a project declares a screen
   platform) → `/vwf:blueprint`, with
   `/vwf:readme` optional at any point. Offer to start
   `/vwf:product` now. **setup runs none of them** — each
   resolves its own mode and reports what it did, which a gate here can only
   guess at on their behalf.

   **`/vwf:architecture` comes back here when it is done** — it invokes
   `/vwf:setup` in-session at the end of its own run, so the pins it just
   decided are materialized by the pass above without the user remembering a
   second command. Printing the chain is still what this step does; the return
   trip is architecture's, not a gate here.

## Recommendations, never moves

setup moves no source file. A repo whose layout differs from its topology
template's grouping, and an `iac` project sitting inside another project's repo,
both end the run as **written recommendations** in the report — each naming the
target layout (`references/workspace-structure.md`) and why it is worth the
work. A declined `iac` extraction is recorded, on the user's consent, as
`enforcement.rules.topology/iac-own-repo/<project>`, set to
`{ waived: true, reason: <one line> }`
in `.config/vwf.yaml` — setup writes exactly that key, the one `/vwf:doctor` and
`/vwf:execute`'s start checks read. Recording a decline stops the proposal
recurring, not the finding: `/vwf:doctor` keeps reporting it as a warning,
which is the honest state of a repo that chose its own shape.

**Persist the decisions.** Per `${CLAUDE_PLUGIN_ROOT}/assets/memory.md`, write the
durable onboarding decisions and their rationale — topology, linkage, roles and
platforms, screen surfaces, stack pins — as `docs/memory/decisions/<date>-<slug>.md`
records (a slug already taken that day takes `-2`, then `-3`; no record is
overwritten), skipping what the docs capture verbatim. **Recall** them before
Step 0 so a re-run builds on what was settled: list the folder's file names and
read the files whose slug or title matches the onboarding at hand, newest first,
at most ten.
