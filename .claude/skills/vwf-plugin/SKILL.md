---
name: vwf-plugin
description: The vwf plugin's own shape — its skills, agents, assets, hooks
  and vendored code, the docs tree its commands maintain, the two format
  stamps, the workflow ordering and what each gate means, how to add a skill
  and pick its invocation mode, and why it depends on exactly one plugin.
  Auto-applies when editing anything under plugins/vwf/.
user-invocable: false
allowed-tools: Read Grep Glob Edit Write Bash
paths:
  - "plugins/vwf/**"
---

# The vwf Plugin

`vwf` is the flagship plugin — a full Product → Blueprint → Plan → Execute
workflow: slash-invocable workflow skills, auto-applying doctrine skills, the
subagents they delegate to, the shared doctrine in `assets/` (the `docs/memory/`
file store's protocol among it), the five `/vwf:execute` action-log hooks and
the `/vwf:execute` progress pane (one TypeScript hooks module). It declares
**no**
MCP server: Context7 is a stackgen `addon` pack. It names **no** technology — no
stack templates, no language list;
what each axis offers comes from a stack plugin behind the stack-adapter
contract, and `p:plugins:check`'s technology-free guard enforces it.

**Each SKILL.md, agent file and asset is authoritative for its own behavior.**
The references below are an index of which file owns what, not a second copy of
their contents — a prose copy of the skill table drifted twice in one session
before it was cut.

| Read                         | For                                                                                           |
| ---------------------------- | --------------------------------------------------------------------------------------------- |
| [`skills-and-agents.md`][sa] | the `/vwf:` workflow skills and their gates, the subagents, the auto-applying doctrine skills |
| [`assets.md`][as]            | `assets/` — which file owns which doctrine — plus `hooks/` and `vendor/`                      |
| [`docs-tree.md`][dt]         | the `docs/blueprint/` tree vwf writes, the OKF profile, and the two format stamps             |
| [`dependencies.md`][de]      | why `stackgen`, what the retired dependencies became, memory as files, the vendored code      |

[sa]: references/skills-and-agents.md
[as]: references/assets.md
[dt]: references/docs-tree.md
[de]: references/dependencies.md

The sixteen checker rules, the two mise gates and the authoring traps are the
sibling `plugin-authoring` skill, which also applies here. The user-facing
reference is `site/src/content/docs/plugins/vwf.md`, published at
`https://claude-plugins.virajp.dev/plugins/vwf/`.

## Dependencies

vwf depends on exactly one plugin, `stackgen`, resolved from this marketplace —
declared in `plugin.json` with `"marketplace": "virajp-plugins"`, which
`p:plugins:check` asserts resolves. `devtools` was the other until it dissolved
into stackgen. `andrej-karpathy-skills` is **vendored** rather than depended on,
with provenance under `vendor/`; `mempalace` was vendored too and is now
removed; `markdown` was **absorbed**, and `context7` was too until it left vwf's
manifest for a stackgen `addon` pack. The reasoning is [`dependencies.md`][de].

## Foundations & ordering

The workflow is
`setup → product → architecture → design-system → blueprint → plan → execute`,
with `verify` (post-deploy) and `feedback` (production intake) closing the loop
back into `product`/`architecture`/`blueprint`/`plan`. The ad-hoc planner
`change-plan` sits **beside** that workflow line and never joins it — it plans
work with no blueprint slice behind it, reads neither the blueprint nor the
registry, and names the commands its plan folder gates on. Both planners write
the **same plan folder** — an `index.json` holding every structured fact, an
`index.md` holding the prose, and one file per unit, shaped by
`assets/templates/plan-folder.md`, interviewed from `assets/plan-interview.md` —
and every plan of either kind is one row of the base repo's
`docs/plans/index.json`, whose rows, every folder's `status` and `run`, the
archive move and the action-log prune after it are written by one skill-invoked
skill, `plan-management` — its `references/plan-index.md` is the contract and
the procedure, its `scripts/plan.mjs` (`get`, `set`, `append`, `remove`,
`rewave`, `validate`, `node:` builtins only; a unit moving above wave 1 gets its
`waits` from `set` before `rewave`) the one reader and writer of both JSON
files, and the planners and the executor call its verbs (`add`, `claim`,
`status`, `complete`, `archive`, `next`, `resolve`,
`priority <folder | requires…>`, `list`) rather than carrying it: `plan` and
`change-plan` append the row at hand-off with a derived priority and push the
folder; the **one executor**, `execute <folder>` — or `execute next`, which
reads the index with no `kind` filter, or `execute all`, which repeats `next`
and hands each pick to an `execute-runner` subagent, one at a time, until one
stops — runs `/vwf:doctor` in the main checkout, then claims it `RUNNING` with a
pushed commit before cutting a worktree — the same commit writing the folder's
`run`, the worktree and action-log paths — runs each unit by its `kind` (a
`code` unit through TDD and the coverage gate, a `review` row through the two
engines plus the code and security reviewers over the branch delta since the
last row — each later round over the last round's fix commits alone, the
security half alone on a row covering `edit` units alone — the `edit` units of a
wave concurrently under the wave review, the acceptance and UX pass and the
blueprint reconcile only when the plan has `covers`), runs the folder's unit
gate before each unit commit, its wave gate after each wave and its plan gate
once at the end, and sets the row `COMPLETE` after the merge lands — moving the
folder to `archived/` and re-pointing the row when no gap is open, leaving it
live when one is, for the `archive` verb once the user asks in prose, raising
the folder's `release_levels` in `.config/releases.yaml` in that same commit and
bumping no version — and runs each after-landing step without a prompt on a
green landing — every one is recorded `run` at the interview, none releases, and
the `.config/vwf.yaml` `after_landing:` commands follow — and at run time it
asks the user only what the plan missed, per the execute skill's
`references/questions.md`: a unit or reviewer returns `QUESTION Q<n>:`,
`OPTIONS Q<n>:` and `WHY Q<n>:` lines in place of the old `GAP:` and
`UNRESOLVED:`, the orchestrator asks each with `AskUserQuestion`, one at a time,
records the answer as a `decisions` entry and resumes the unit; a headless run
records each as an open `QUESTION Q<n>:` gap and stops at the final report;
under `all` the runner returns `OUTCOME: QUESTION` with the question lines and
the loop asks and resumes it. Beside them stay the run-level questions
`execute all` asks once, before its first plan — one shared worktree, deduped
after-landing steps, landing a plan recorded not to merge — each an override for
that run only. On the old markdown plan
format — a `docs/plans/index.md` in the base repo, or a live folder with
`index.md` and no `index.json` — `execute` and every `plan-management` verb stop
before any change and point to `docs/plans/migrate.md` in this repo; no
old-format copy of either skill exists. `init` is not a command on that line:
since 2026-09-06 it is **skill-invoked** and runs inside setup's Step 0, or
alone via `/vwf:setup reshape`. `init` shapes the **base repo and every member
repo the product has** and `setup` sets up **vwf** in the base — two different
things, and a repo can have either without the other. It resolves that set
itself and takes no argument: the base per the membership asset (so a run
started inside a member walks up and shapes the product), the members as the
**union** of `.gitmodules` walked recursively and the config's `members:` list,
deduped on realpath, with a path in only one of two present sources reported as
a disagreement and never shaped, and an absent member offered a **clone row
inside the same plan**. Mode resolves per repo from what its tree contains,
never a flag or setup's fork — `shaped` (`.config/bootstrap.toml`), `old layout`
(`.config/stackgen.yaml`, `.config/mise/conf.d/tools.toml`, `conf.d/env.toml` or
a root `.config/mise.dev.toml`, with no such file), `source` (none of those, but
a
language manifest, a source directory, a root tool config or a `.config/`),
`blank` (none of those). **bootstrap owns the shape.** Every universal file and
each repo's values are bootstrap's, and `init` reaches them through one step: it
gives the session bootstrap's readme prompt, once for the base, and the prompt
covers the submodules and the siblings, while bootstrap's `docs/sync` asks its
own
questions. A repo is **green** when it has `.config/bootstrap.toml` and
`mise run setup:configs --dry-run` shows no change; that read runs only where
mise
lists the repo as trusted, and executes bootstrap's `main` with no pin, which
the
resolved-set line discloses, since the survey runs it before the consent. An
`old layout` repo always takes the step, and `init` deletes
`.config/stackgen.yaml`
in each repo that reads green. A repo with no `.config/bootstrap.toml` after the
step stops there. `init` writes only its **hygiene assets** from
`skills/init/assets/hygiene/` (`CONTRIBUTING.md`, `SECURITY.md`, the licence
texts,
with no adapter fetch and no lock record), a two-line readme stub, and
`enforcement.kept_files` in the base's `.config/vwf.yaml`, the one key it writes
there, in a stub (`config_format` + `enforcement`) where the file is missing. A
hygiene asset the repo already has is kept; a struck create is a recorded keep.
It
asks **three rounds** at most — one round each for the whole product, a per-repo
answer showing as a row inside its single round: a one-line brief for a `blank`
or
`source` repo with no readme; each repo's **visibility**, `public` or `private`,
defaulted from the forge where the repo has an origin the forge CLI answers for
and
`private` otherwise, written nowhere in the tree; and its two dependent parts,
2a
the licence, rows for `public` repos only, and 2b the security contact. There is
**one plan with a section per repo and one consent**, answered **commit** or
**commit and push**, a tree that is not clean stopping the run before anything
is
written. Landing is `/vwf:git-workflow`'s, members before the base with the
moved
**gitlinks** staged: bootstrap's sync, where it left one uncommitted, is the
first
commit, `init`'s own files the second, and a member on no branch is a
**refused**
row naming the branch to check out. **After the base lands comes the forge
pass**,
on one further consent for the whole product: it sets each eligible repo's
default
branch on the forge, protects `develop` and `main` there — no force-push, no
deletion, and a pull request required on each branch whose
`[branch.<branch>].merge_model` reads `pr`; a branch already protected in any
form
is left exactly as it is — and reaches the backlog skill's missing-project
procedure for the base. Those three are the only forge settings it touches; a
repo
it could not reach is listed `pending`, and a forge it has no CLI for gets the
by-hand list, which the hygiene assets' `CONTRIBUTING.md` keeps, naming `gh` and
`glab` where vwf's `SKILL.md` prose may not (the init references name them, as
the
backlog skill already did). Init is **not a one-time bootstrap**: its "when it
runs
again" doctrine names the moments **and the four commands that bring the user to
the door** — `/vwf:setup` after its materialize pass, `/vwf:architecture`
through
setup, `/stackgen:stackgen-sync` invoking `/vwf:setup reshape` in-session, and
`/vwf:recall` printing its drift lines from `/vwf:doctor baseline`, which reads
files only, runs no mise task and no bootstrap code, and so does not report
config
drift — each an offer the Step 0 way, silent when clean. `/vwf:doctor`'s full
mode
reports config drift, through that explicit dry-run. `setup` is the Phase-0
bootstrapper — it onboards a repo
(a Step-0 shape check, run over **every repo in the product** — the base and
every locally-present member — that offers `/vwf:init` once when any of them has
no `.config/bootstrap.toml` **or** doctor's Bootstrap drift or Forge state
predicate fails in any of them — its explicit dry-run executing bootstrap's
`main`
with no pin, under a trust gate of mise that is not tied to file content —
**repeated once after the materialize pass** against the lockfile
that pass just wrote so a pack version moved in the run is offered in the run —
never on `reshape`, which runs no pass — the `reshape` argument forcing that
offer and stopping once init returns, detect-or-ask topology via MCQ,
consent-gated reconciliation into the `docs/blueprint/` format, the CLAUDE.md
vwf section, the memory tree, the `environment.md` bootstrap) and is
**re-runnable**: re-running *is* the resume mechanism, since Step 0 re-resolves
the mode from what is on disk and a conforming repo resolves to `current`. Setup
is also where a **pinned** stack is landed: **architecture decides, setup
pins.** Its **materialize pass** runs once per run in every mode — `current`
included, which is the mode a repo architecture just wrote pins into resolves to
— grouping the axes holding a slug the target repo's adapter lockfile does not
name, deduping by slug per repo, and invoking `-stack-template` once per
`(repo, slug)` with the contract's `repo:` line; the materializer copies each
pack's `config/` and hands the tools a pack needs to bootstrap. A template
pinned
months after `init` ran lands the same way; an **absent** axis is written
`unresolved` and a pinned slug is never rewritten. On the spine it runs before
the doctor gate, and a
declined landing is the expected way to reach doctor's blocking *pinned, not
materialized*. **It runs none of the foundations** — it ends by printing the
chain and offering to start `/vwf:product`, because each of those commands
resolves its own mode and reports what it did, which a gate inside setup could
only guess at on their behalf. The one return trip is `/vwf:architecture`'s,
which invokes `/vwf:setup` in-session after its own commit so the pins it just
recorded get materialized. `product.md` (the Phase −1 outcome contract, type
`vwf-product`, gated by the `product-reviewer`) and `architecture` (the
registry) are both unconditionally required before `blueprint` — every
**flow's** Purpose must `Serves:`-link a product goal anchor (entities trace to
goals transitively via their `Used by:` flow links), which the
`blueprint-reviewer` verifies and the minimalism check traces to.
`design-system` is a second foundation, **required once the registry has a UI
project** (some project declares a **screen platform**): `blueprint` halts on a
flow with a Screens surface if `docs/blueprint/design-system.md` is missing.
`environment.md` (the per-project env-var/secret catalog, type
`vwf-environment`) is a third foundation, **required once the registry declares
an external integration or a secrets-manager `config`** — `setup` bootstraps it
from the repo's existing env-var/secret usage (names only, never values) and
`blueprint` maintains it as flows add integrations, with `conventions.md#config`
holding only the injection mechanism. **Everything up to `blueprint` is done in
full before planning**: a blueprint run sweeps until whole-product coverage
holds (every goal served by a flow, every referenced entity/schema/API operation
authored + reviewed, every registry surface represented, the coherence review
clean) and stamps it; `plan` hard-halts on a partial stamp and chains its
slice's unimplemented dependencies as their own plans, so per-slice execution
never builds on an unblueprinted or unbuilt dependency. The blueprint is a
**code-independent technical contract** — it records only decisions that have
more than one reasonable answer *and* are true regardless of how the code is
written today; reuse/placement/ordering/library choices are `plan`'s job. The
`blueprint-reviewer` gate enforces the per-doc completeness bars (flow steps,
acceptance, screens, jobs; entity lifecycle, relationships, concurrency, schema;
API errors + idempotency), the goal-traceability bars (`Serves:` on flows,
`Used by:` on entities), and the code-independence guardrail (no
file/class/library/CSS/pixel leakage); the `blueprint-coherence-reviewer` closes
the sweep with the cross-doc pass (flow↔lifecycle↔schema↔operationId agreement,
catalog/erDiagram sync, goal-counter resolution, and the additive-only diff
against released APIs and released entity schemas).

## Adding a skill

Create `skills/<name>/SKILL.md` — no other registration is needed
(auto-discovered by directory convention; this repo has no `commands/` dirs, a
former command is a skill so one artifact serves both invocation paths). Then
pick the invocation mode per the policy below, and run
`mise run p:plugins:check` — strict-YAML frontmatter drops a skill **silently**
when it fails to parse.

Write the skill to the repo standard first: scaffold it with
[`skill-kit`](../skill-kit/SKILL.md) (`/skill-kit new <archetype> <name>`), and
run `/skill-kit lint` on it: one of the eight archetypes, both invocation keys
declared. Every vwf skill meets that standard, save the vendored
`karpathy-guidelines`, which stays verbatim.

### Invocation policy

Claude spells this with two independent booleans, and the useful states are
four:

| State              | Frontmatter                                                              | For                         |
| ------------------ | ------------------------------------------------------------------------ | --------------------------- |
| user **and** model | `disable-model-invocation: false`                                        | anything delegated to       |
| model only         | `user-invocable: false`, `paths:` optional                               | doctrine                    |
| **skill-invoked**  | `user-invocable: false` + `disable-model-invocation: false`, no `paths:` | a skill another skill calls |
| user only          | `disable-model-invocation: true`                                         | the user owns the timing    |

It is **not cosmetic**: a user-only skill is removed from the model's context
entirely, so it **cannot be invoked by another skill**, and the failure is
**silent** — the caller simply cannot see it. The rule: model-invocable when
anything delegates to it, user-only when nothing does.

The planners and the executor are the one place the rule is applied by hand
rather than read off the delegation graph. `execute` is **user and model**,
though nothing delegates to it: it must run in a fresh context — a fresh
session, or a runner that `all` dispatches — which no caller can guarantee, so
when the model invokes it rather than the person typing it, its first step asks
one question — start a **new session** (the host's session tool where it has
one, else the launch line printed) or **continue in this session** — before the
format test. The plan's own launch line is the usual invocation, and the folder
that line names arrives **already committed and pushed** on the integration
branch, because `plan` and `change-plan` commit it at hand-off with its index
row; a folder that is not on that branch is refused rather than swept into a
wave commit. `all`'s `execute-runner` reads the skill file it is handed rather
than invoking the skill, so a runner never meets the question. `execute` was
user-only from 2026-09-16, when `/vwf:plan`'s in-session execute hand-off was
retired, until 2026-11-03, when the user ruled that the model may start a run
as long as it asks where. `recall` still prints a cap-paused run's launch line
rather than launching it. `plan` and
`change-plan` are **user and model**: `plan` is reached by name from
`/vwf:feedback`'s blueprint-gap routes and by `execute`'s gap reconciliation,
and the seam `change-plan` reserved is live too — `/vwf:feedback`'s *not a
blueprint gap* route calls it by name, which marking it user-only would have
made a silent no-op. `setup` is **user and model** too: `/vwf:architecture`
hands off to it in-session once its commit lands, and `/stackgen:stackgen-sync`
invokes `/vwf:setup reshape` on drift. It was user-only from 2026-07-31, when
nothing called it, until 2026-10-28 — both calls, added after that, were silent
no-ops until the flag flipped. `mockups`, `recall` and `verify` stay user-only:
nothing calls them, and the user owns their timing. `design-system` is the one
exception to the rule: nothing calls it by name, but it is **user and model**,
`disable-model-invocation: false` since 2026-08-17, and the user ruled on
2026-10-31 to keep it so.

**Skill-invoked** is the fourth state and the newest: hidden from the `/` menu,
still reachable by the skill that owns its seam. Seven skills are in it today —
vwf's `init`, called by `/vwf:setup` (Step 0's offer, or `/vwf:setup reshape`);
vwf's three import adapters `import-design-system`, `import-screens` and
`import-conversations`, called by `/vwf:design-system`, `/vwf:screens import`
and `/vwf:feedback canvas` respectively, each its skill's only caller; vwf's
`plan-management`, called by `plan`, `change-plan` and `execute` at every write
to the plan index or a folder's `status` or `run`, and by a session when the
user asks in prose to archive a folder or list the queue — the typed archive
command it replaced was retired on 2026-09-18; and stackgen's
`stackgen-stack-menu` and `stackgen-stack-template`, called by vwf through the
adapter contract. Both keys are load-bearing together: `user-invocable: false`
alone would be the model-only row minus its `paths:`, and
`disable-model-invocation: true` would silently break the call. Checker rule 9
asserts the pair on the two stack-adapter skills; rule 8 asserts only
`disable-model-invocation: false` on the pack-landed `design-import-*` skills,
so `init`, `plan-management` and the three `vwf:import-*` carry
`user-invocable: false` as their own choice, not a contract, and rule 4 plus
`claude plugin validate` are all that check it.

**The frontmatter does not tell this state apart from doctrine.** Ten vwf skills
carry `user-invocable: false`: the five above, the four **path-scoped** doctrine
skills (`blueprint-authoring`, `design-system-authoring`,
`documentation-standards`, `product-foundations`), and `rest-api-design`, which
is doctrine with **no** `paths:` — no file pattern is narrow enough to mean "an
API is being designed", so the model loads it on its own judgment. So
`user-invocable: false` without `paths:` reads identically on `init` and on
`rest-api-design`. What separates them is **who calls** — a named caller, a
file, or the model's own judgment — and only the first is written down, in the
caller's own step. Adding a hidden skill means saying which of the three it is
in its own prose, because nothing in the frontmatter will say it for you.

Cross-plugin skill-name uniqueness is no longer required — Claude scopes a skill
to its plugin. The `<plugin>-` prefix on adapter skill names is readability now,
not correctness, and `prefixSkillNames` is gone.

> The host rules behind this — the three states and the silent failure — are
> `plugins/stackgen/assets/artifact-doctrine.md` §2. The per-skill rulings and
> the two contracts the checker enforces (the design adapter's three import
> skills, the stack adapter's menu + template pair) are
> `.claude/skills/plugin-authoring/references/checks.md`.

## Hooks

`hooks/hooks.json` is authored directly in Claude's own format, with the scripts
beside it: the five action-log hooks (`PreToolUse`, `PostToolUse`,
`SubagentStart`, `SubagentStop`, `SessionEnd`), plus one hooks module under
`modules`, described below. Plugin hooks are auto-discovered from that file and
**never written to `settings.json`**, so verify them with `/hooks`.

The verdict trap that shipped here: **a script's verdict shape is decided by its
event**. `hookSpecificOutput.permissionDecision` is `PreToolUse`-only — `Stop`
and `PreCompact` deny with the top-level `decision`/`reason`, and Claude rejects
the whole verdict if a `hookSpecificOutput` arrives without a matching
`hookEventName`. The retired mempalace checkpoint hook shipped with that
mistake, where a rejected verdict reads exactly like a hook that decided to stay
quiet. A shell-script test of a hook belongs under `installer/src/` or
`scripts/src/`, because `vitest.config.mts` collects only
`{installer,scripts}/src/**`.

The **action-log hooks** fire on every tool call of every session, so
`hooks/action-log.sh` exits at once unless some session holds a run marker under
`~/Library/Caches/vwf/active/`; only then does it run `hooks/action-log.mjs`,
which appends the event to that session's log and prints nothing, ever — it
gives no verdict and never blocks a tool. A Bash call is logged by its
description, else by its program name alone — `(command)` when that is unclear —
never by its arguments. On `SessionEnd` it appends `session.end` and deletes the
session's marker. The marker and the file are written by the execute skill's
`scripts/log.mjs`, which the orchestrator calls for what only it knows (phases,
gates, commits, review rounds, unit and stage `row` events, gaps, each
`question` before it is asked and each `answer` once recorded, stops; and
`next-question`, the next plan-wide `Q<n>`), per
`skills/execute/references/action-log.md`. The log is one append-only JSONL file
per plan at `~/Library/Caches/vwf/<repo>/<plan folder basename>.jsonl` — each
`start`, fresh or resume, appends a `run.start`, and every line carries its run
id `<YYYYMMDD-HHMMSS>-<session8>` — never committed, and never cleared by macOS;
`plan-management archive` runs `log.mjs prune`, which deletes the log of an
archived plan once it is more than 30 days old, and `start` sweeps dead markers.
The claim writes the log path, with a literal `~`, and the worktree path into
the folder's `run`. `$VWF_LOG_ROOT` moves the root, for the tests. Both scripts
are tested for real in `scripts/src/execute-log.test.ts`.

The host rules a hook must satisfy (BSD `sed`, the per-event verdict shapes),
are `plugins/stackgen/assets/artifact-doctrine.md` §4 and the `plugin-authoring`
skill.

The same `hooks/hooks.json` also lists one **hooks module** under `modules`:
`hooks/monitor/register.tsx`, a Claude Code mod that draws the `/vwf:execute`
progress pane and registers `/vwf-monitor` (no colon: a registered command name
refuses one). It reads three sources and nothing else: the rows of the base
repo's `docs/plans/index.json`, with each plan's `started` and `ended`, or a
folder with no row under `docs/plans/` or `docs/plans/archived/`; the folder's
`index.json` for the state and every unit, wave and stage time, which
`plan.mjs` stamps on each status set — the copy at `run.worktree` (or archived
there during the landing), else the main checkout's or its archived copy; and
the log at `run.log`, `~` expanded from `HOME`, replayed whole at each read
(from its last 4,000,000 bytes, through `tail`, when it is over 4 MiB) for each
unit's agent and its liveness, the transcript, the session and the open
questions alone — it computes no time and no run end. A folder `BLOCKED` or
`COMPLETE`, or the row
`COMPLETE`, is an ended run; a `RUNNING` one is live while an agent is live or
the log's last line is under 10 minutes old, and the header reads
`paused or stopped` otherwise; a `question` event with no later `answer`, after
the last `run.start` and with no `run.end` after it, makes the phase `question`
— `waiting for your answer` and the question text, however old the last line —
and once a `run.end` follows, the usual phase with one line per open question,
`open question: Q<n>, asked at the resume`; a row `APPROVED` or `DRAFT` is
`not-run`. It
never
searches a worktree. `/vwf:execute <folder>` shows that plan with
`claim in progress`; `/vwf:execute next` or `all` shows the plan list until a
`RUNNING` row outside the opening's `baseline`, or one with this session's
`run.start`, is the claim; `/vwf-monitor <plan>` shows any plan in any status; a
bare `/vwf-monitor` keeps a live run, else shows the running or latest plan,
else
the list. A landed plan stays on screen, and an `all` run moves on at the next
claim. Only the old markdown format and a missing `docs/plans/index.json` show
one message for 10 s and close. The pane hook branches on `e.surface`: the
terminal keeps its cell-padded `fit()` columns, block-character bar and key
hints; every other surface draws `view.tsx`'s `drawTimeline`, bars of
whole-percent
`Box` parts on one axis (the engine refuses a fractional percent) with the unit
id as the `Button`, and a `role: "dismiss"` Close; `drawList` draws the plan
list
on all surfaces, `drawChip` draws the `AbovePrompt` band from the `monitorLive`
state, which
`refreshLive` reads on its own 5 s timer in every session, separate from what
the
pane shows; the last live plan stays with its final status until `session.end`
says `clear`: colored `Text` glyphs and the plan's name beside a `Monitor`
`Button`,
since a desktop `Button` draws one plain label, or the button alone, a
`notify` in `register.tsx` raises the toast and the status
line
when a followed run changes, and
`pane.test.tsx` mounts it on both. `plan.ts` beside it holds the parsers, the
queue order and the
replay, and strips terminal control characters from plan and log text before it
renders; `plan.test.ts`, `pane.test.tsx`, `refresh.test.tsx` and
`agents.test.tsx` are its tests. Its `$.state` keys (`monitorRun`,
`monitorQuiet`, `monitorViewing`, `monitorLive`, `monitorHasPlans`) sit under
the plugin name `vwf` and are
declared in `types/index.d.ts`, which the manifest's `types` key names. It ties
an agent to a unit through the log: the Agent call's `tool.start` summary names
a unit (`U<n>`, `U<n>-late<k>`) or a wave review (`R<wave>`, `R<wave>-late`,
`R-late`), or a `vwf:execute-*` review-row reviewer, and `tool.end` gives the
child id. The per-plan log is the scope of an `all` run.
`claude plugin test plugins/vwf` and
`claude plugin validate --strict plugins/vwf` are its gates, run locally — CI
has no `claude`. Why it lives inside vwf rather than as its own plugin is
`docs/memory/decisions/2026-10-21-execute-monitor-inside-vwf.md`; how it reads
its sources, ties agents to units and ends the run is
`docs/memory/decisions/2026-10-25-pane-replays-the-log.md`, amended there by its
*times live in the JSON* section.

## Documentation

Any change to vwf's behaviour must reconcile `readme.md`, `CLAUDE.md` and
`site/src/content/docs/plugins/vwf.md` in the **same commit** — the repo's hard
rule. Delegate the sweep to `/vwf:docs-sync` (its surveyor agent reads the docs)
rather than reading those files inline; that file is large enough that loading
it costs the rest of the session. A behaviour change also bumps `version` in
`plugin.json` (plain `X.Y.Z`, and never onto a **13 or 17 component** — those
two integers are never issued on any version line, so `19.12.0` minor goes to
`19.14.0`; `p:plugins:check` refuses the manifest otherwise) and regenerates the
marketplace with `mise run p:plugins:marketplace`.
