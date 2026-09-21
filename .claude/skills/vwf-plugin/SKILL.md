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
subagents they delegate to, the shared doctrine in `assets/`, the guarded `rtk`
hook, the two mempalace auto-save hooks, and two MCP servers. It names **no**
technology — no stack templates, no language list; what each axis offers comes
from a stack plugin behind the stack-adapter contract, and `p:plugins:check`'s
technology-free guard enforces it.

**Each SKILL.md, agent file and asset is authoritative for its own behavior.**
The references below are an index of which file owns what, not a second copy of
their contents — a prose copy of the skill table drifted twice in one session
before it was cut.

| Read                         | For                                                                                           |
| ---------------------------- | --------------------------------------------------------------------------------------------- |
| [`skills-and-agents.md`][sa] | the `/vwf:` workflow skills and their gates, the subagents, the auto-applying doctrine skills |
| [`assets.md`][as]            | `assets/` — which file owns which doctrine — plus `hooks/` and `vendor/`                      |
| [`docs-tree.md`][dt]         | the `docs/blueprint/` tree vwf writes, the OKF profile, and the two format stamps             |
| [`dependencies.md`][de]      | why `stackgen`, what the retired dependencies became, the memory layer, the vendored code     |

[sa]: references/skills-and-agents.md
[as]: references/assets.md
[dt]: references/docs-tree.md
[de]: references/dependencies.md

The fifteen checker rules, the two mise gates and the authoring traps are the
sibling `plugin-authoring` skill, which also applies here. The user-facing
reference is `site/src/content/docs/plugins/vwf.md`, published at
`https://claude-plugins.virajp.dev/plugins/vwf/`.

## Dependencies

vwf depends on exactly one plugin, `stackgen`, resolved from this marketplace —
declared in `plugin.json` with `"marketplace": "virajp-plugins"`, which
`p:plugins:check` asserts resolves. `devtools` was the other until it dissolved
into stackgen. `mempalace` and `andrej-karpathy-skills` are **vendored** rather
than depended on, with provenance under `vendor/`; `markdown` and `context7`
were **absorbed**. The reasoning is [`dependencies.md`][de].

## Foundations & ordering

The workflow is
`setup → product → architecture → design-system → blueprint → plan → execute`,
with `verify` (post-deploy) and `feedback` (production intake) closing the loop
back into `product`/`architecture`/`blueprint`/`plan`. The ad-hoc planner
`change-plan` sits **beside** that workflow line and never joins it — it plans
work with no blueprint slice behind it, reads neither the blueprint nor the
registry, and names the commands its plan folder gates on. Both planners write
the **same plan folder** — `index.md` plus one file per unit, shaped by
`assets/templates/plan-folder.md`, interviewed from `assets/plan-interview.md` —
and every plan of either kind queues in the **one table** of the base repo's
`docs/plans/index.md`, whose rows, every folder's Status block and the archive
move are written by one skill-invoked skill, `plan-management` — its
`references/plan-index.md` is the contract and the procedure, and the planners
and the executor call its verbs (`add`, `claim`, `status`, `complete`,
`archive`, `next`, `resolve`, `priority <folder | requires…>`, `list`) rather
than carrying it: `plan` and `change-plan` append the row at hand-off with a
derived priority and push the folder; the **one executor**, `execute <folder>` —
or `execute next`, which reads the table with no `Kind` filter — claims it
`RUNNING` with a pushed commit before cutting a worktree, runs each unit by its
`Kind` (a `code` unit through TDD and the coverage gate, a `review` row through
the two engines plus the code and security reviewers over the branch delta since
the last row, the `edit` units of a wave concurrently under the wave review, the
acceptance and UX pass and the blueprint reconcile only when the plan has
`covers:`), and sets the row `COMPLETE` after the merge lands — moving the
folder to `archived/` and re-pointing the row when no gap is open, leaving it
live when one is, for the `archive` verb once the user asks in prose — and runs
each after-landing step on the mode the interview recorded, `run` without a
prompt on a green landing or `ask` with one stop before it. `init` is not a
command on that line: since 2026-09-06 it is **skill-invoked** and runs inside
setup's Step 0, or alone via `/vwf:setup reshape`. `init` shapes the **base repo
and every member repo the product has** and `setup` sets up **vwf** in the base
— two different things, and a repo can have either without the other. It
resolves that set itself and takes no argument: the base per the membership
asset (so a run started inside a member walks up and shapes the product), the
members as the **union** of `.gitmodules` walked recursively and the config's
`members:` list, deduped on realpath, with a path in only one of two present
sources reported as a disagreement and never shaped, and an absent member
offered a **clone row inside the same plan**. Mode resolves per repo from what
its tree contains, never a flag or setup's fork — `shaped` (the adapter lockfile
exists), `source` (no lockfile, but a language manifest, a source directory, a
root tool config or a `.config/`), `blank` (none of those); `source` runs the
new-repo landing plus the survey passes with something to read, and the
replace-or-keep offer over materializer conflicts runs in every mode. The root
survey reads a repo's own tooling before a pack lands over it: every root
spelling in the seven-row tool-config table
(`skills/init/references/tool-configs.md`) is a plan row — move into `.config/`
and offer through pass 6 (default), keep both, delete on an explicit pick; the
toolchain manager's root file is split into the pack's files, the
dependency-update policy yields to one the repo has — a foreign hook manager is
a row defaulting to keep (switch runs `setup:precommit --force` last),
`.gitignore` is merged section by section with normalised patterns, inline
`[tasks.*]` tables count as tasks, an unmapped commit type is asked, and every
licence spelling counts. After any mode's landing the five new-repo steps (§3
secrets, §4 placeholders, §8 readme/licence/security, §9 bootstrap, §10
aggregator) run, and `init` re-records the lockfile hash of every file it
filled, appended to or merged — pass 6's replace and keep re-record too — as the
last step before the git pass; a missing `.config/vwf.yaml` gets a stub
(`config_format` + `enforcement`) so `kept_files` and `editor_keys` are never
deferred. A **stack read** — pins, else lockfile components, else a fixed
manifest table, first hit per language, six keys — drives the ignore sections
and the toolchain config's `RUNTIME_BLOCK` / `PATH_ENTRIES`. There is **one plan
with a section per repo and one consent**, and the apply order is members first
so the base commits its gitlinks current. `init` materializes the three
unconditional bundles through the stack adapter by the fixed slugs `mise`,
`repo-gates` and `repo-hygiene` — per repo, each with its own lockfile — fills
the marked positions those packs leave it (the member flags and their aliases,
named for the **member repos** and never from a project id; the per-project
groups, their aliases and the commit gate's scopes, all three from the project
ids; the repo-name key, from that repo's own main-checkout folder name slugified
and never from a project id; `MERGE_MODEL_DEVELOP`, `MERGE_MODEL_MAIN`,
`MEMBERS`, the two runtime positions from the stack read and the forge links,
and the plugin task's two agent-plugin lists), runs **three** merges — ignore
sections, pre-commit fragments, editor fragments — and writes a two-line readme
stub; it names no tool, and every file it lays down is a pack's. The editor
merge reads each `.vscode` file whole: a settings key or nesting parent the hand
section already carries that the packs also compose is a **collision**, asked
once per run inside the plan (keep mine, take the pack's, or union for an
object-valued key or a nesting parent) and recorded under
`enforcement.editor_keys` in the base's `.config/vwf.yaml` — with
`enforcement.kept_files`, one of the two keys `init` writes there — so a hand
key wins because the block **omits** it, never because the file carries it
twice. Before any of that it asks **seven** questions — one round each for the
whole product, a per-repo answer showing as a row inside its single round — the
first naming each `blank` or `source` repo's folder, which is the one thing that
fills `REPO_NAME`, and the second confirming every project id, the slug it
resolves to and the source the name came from — the registry, a sub-project
directory (defined once in init: the registry's `projects[].path`, or on a first
run in `source` mode a non-root directory with its own manifest or one a
workspace file lists), or the project's platform token — grouped by repo:
nothing writes a `p:<slug>:*` group, its alias or a commit scope until that list
is accepted, and the scopes are filled on **every** run, the first included, one
per confirmed id. The fifth asks which agent plugins this product requires,
seeded by running the plugin task's own inventory mode and written into those
two lists. The sixth asks each repo's **visibility**, `public` or `private`,
defaulted from the forge where the repo has an origin the forge CLI answers for
and `private` otherwise, written nowhere in the tree; its two dependent parts
are the seventh round — 6a the licence, rows for `public` repos only (a private
repo gets no `LICENSE`), and 6b the security contact, a public repo's row
defaulted to its advisories page and a private repo's a free email or internal
URL with no default. The seventh asks the **editor** once for the product — is
VS Code in use, defaulted yes where any resolved repo carries a `.vscode/` or
the `code` binary is on `PATH` — and the eighth the **update bot** per repo,
`renovate`, `dependabot` or `none`, seeded from the survey; those two are the
eighth and ninth rounds, and with the forge read from each `origin` host and
question 4's provider slug they are the `answers:` map every fetch passes the
materializer beside `repo:` — every key present, `none` the no-match value on
`forge`, `editor` and `secrets` and a legal answer on `update_bot` — against
which a pack's `conditional:` files are evaluated, the skips listed per repo
under a **Skipped** heading in the plan. 4, 5 and 7 are answered once for every
repo, 2, 6, 6b and 8 carry a row per repo, 6a a row per public repo, and 1 and 3
a row per repo that resolved `blank` or `source`. It then closes with a
**consent-gated git pass**, whose two questions are asked once and applied to
every repo. It first reads where each repo stands (`git symbolic-ref -q HEAD`):
a member on no branch is a **refused** row naming the branch to check out, its
shaping deferred and its gitlink unmoved, and a member the run clones is checked
out on the remote branch holding the recorded gitlink commit, at that branch's
tip, so it never arrives detached. It asks the landing model **one row per repo
per branch** — `develop` and `main`, each `direct` or `pr`, preselected `direct`
and `pr`, or from what a replaced file carries — and writes each row to that
repo's `MERGE_MODEL_DEVELOP` and `MERGE_MODEL_MAIN`; a kept file still carrying
the single legacy `MERGE_MODEL` is not asked, but its line is rewritten in place
into the pair carrying the one value, and until then every reader takes that
value for both branches. It creates whichever of `develop` and `main` the repo
lacks — from the remote-tracking branch first, else from the table; a mainline
of another name (`master`, `trunk`, read from `origin/HEAD`, else the branch the
repo is on) gets `main` from it and `develop` from `main`, the old branch left
in place and reported to retire by hand — checks out `develop`, stages what the
run wrote, asks one question with three answers (commit / commit and push /
leave it), commits with a fixed `ops:` message **on `develop` in every mode**,
never on `main` — the members first, then the base with the moved **gitlinks**
staged — and pushes; a rejected push is a deferral, never a force. **After the
push comes the forge pass**, on one further consent for the whole product: it
sets each pushed repo's default branch on the forge (`develop` preselected),
protects `develop` and `main` there — no force-push, no deletion, and a pull
request required on each branch whose own value is `pr`, `MERGE_MODEL_DEVELOP`
for `develop` and `MERGE_MODEL_MAIN` for `main`; a branch already protected in
any form is left exactly as it is — and reaches the backlog skill's
missing-project procedure for the base, never running the project-creating
command itself. Those three are the only forge settings it touches; a repo whose
answer was not *commit and push* is listed `pending`, and a forge it has no CLI
for, or a CLI it cannot log in with, gets the by-hand list — which the hygiene
pack's `CONTRIBUTING.md` keeps, naming `gh` and `glab` where vwf's `SKILL.md`
prose may not (the init references name them, as the backlog skill already did).
Init is **not a one-time bootstrap**: its "when it runs again" doctrine names
the moments **and the four commands that bring the user to the door** —
`/vwf:setup` after its materialize pass, `/vwf:architecture` through setup,
`/stackgen:stackgen-sync` invoking `/vwf:setup reshape` in-session, and
`/vwf:recall` printing one drift line from `/vwf:doctor baseline` — each an
offer the Step 0 way, silent when clean; and `/vwf:doctor` has the drift finding
that prints the one remedy, `/vwf:setup reshape`. `setup` is the Phase-0
bootstrapper — it onboards a repo (a Step-0 shape check, run over **every repo
in the product** — the base and every locally-present member — that offers
`/vwf:init` once when any of the three slugs is missing **or** any of doctor's
seven baseline predicates fails in any of them, **repeated once after the
materialize pass** against the lockfile that pass just wrote so a pack version
moved in the run is offered in the run — never on `reshape`, which runs no pass
— the `reshape` argument forcing that offer and stopping once init returns,
detect-or-ask topology via MCQ, consent-gated reconciliation into the
`docs/blueprint/` format, the CLAUDE.md vwf section, the memory tree and
`mempalace.yaml`, the `environment.md` bootstrap) and is **re-runnable**:
re-running *is* the resume mechanism, since Step 0 re-resolves the mode from
what is on disk and a conforming repo resolves to `current`. Setup is also where
a **pinned** stack is landed: **architecture decides, setup pins.** Its
**materialize pass** runs once per run in every mode — `current` included, which
is the mode a repo architecture just wrote pins into resolves to — grouping the
axes holding a slug the target repo's adapter lockfile does not name, deduping
by slug per repo, and invoking `-stack-template` once per `(repo, slug)` with
the contract's `repo:` line; an **absent** axis is written `unresolved` and a
pinned slug is never rewritten. On the spine it runs before the doctor gate, and
a declined landing is the expected way to reach doctor's blocking *pinned, not
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
rather than read off the delegation graph. `execute` is **user only**: it must
run in a session that has done nothing else, which no caller can guarantee, and
nothing delegates to it — the plan's own launch line is the invocation, and the
folder that line names arrives **already committed and pushed** on the
integration branch, because `plan` and `change-plan` commit it at hand-off with
its index row; a folder that is not on that branch is refused rather than swept
into a wave commit. `next` is the same skill reading that index for its
argument, and no more model-invocable for it. `execute` joined this state on
2026-09-16, when `/vwf:plan`'s in-session execute hand-off — the one caller that
needed it model-invocable — was retired; every resume is a person re-running
`/vwf:execute <folder>`. `plan` and `change-plan` are **user and model**: `plan`
is reached by name from `/vwf:feedback`'s blueprint-gap routes and by
`execute`'s gap reconciliation, and the seam `change-plan` reserved is live too
— `/vwf:feedback`'s *not a blueprint gap* route calls it by name, which marking
it user-only would have made a silent no-op.

**Skill-invoked** is the fourth state and the newest: hidden from the `/` menu,
still reachable by the skill that owns its seam. Seven skills are in it today —
vwf's `init`, called by `/vwf:setup` (Step 0's offer, or `/vwf:setup reshape`);
vwf's three import adapters `import-design-system`, `import-screens` and
`import-conversations`, called by `/vwf:design-system`, `/vwf:screens import`
and `/vwf:feedback canvas` respectively, each its skill's only caller; vwf's
`plan-management`, called by `plan`, `change-plan` and `execute` at every write
to the plan index or a Status block, and by a session when the user asks in
prose to archive a folder or list the queue — the typed archive command it
replaced was retired on 2026-09-18; and stackgen's `stackgen-stack-menu` and
`stackgen-stack-template`, called by vwf through the adapter contract. Both keys
are load-bearing together: `user-invocable: false` alone would be the model-only
row minus its `paths:`, and `disable-model-invocation: true` would silently
break the call. Checker rule 9 asserts the pair on the two stack-adapter skills;
rule 8 asserts only `disable-model-invocation: false` on the pack-landed
`design-import-*` skills, so `init`, `plan-management` and the three
`vwf:import-*` carry `user-invocable: false` as their own choice, not a
contract, and rule 4 plus `claude plugin validate` are all that check it.

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
beside it: the guarded `rtk` Bash hook, and the two mempalace auto-save hooks
(`Stop` and `PreCompact`). Plugin hooks are auto-discovered from that file and
**never written to `settings.json`**, so verify them with `/hooks`.

The verdict trap that shipped here: **a script's verdict shape is decided by its
event**. `hookSpecificOutput.permissionDecision` is `PreToolUse`-only — `Stop`
and `PreCompact` deny with the top-level `decision`/`reason`, and Claude rejects
the whole verdict if a `hookSpecificOutput` arrives without a matching
`hookEventName`. The mempalace checkpoint hook shipped with that mistake, where
a rejected verdict reads exactly like a hook that decided to stay quiet. Its
shell-script test lives at `installer/src/mempalace-checkpoint-script.test.ts`,
because `vitest.config.mts` collects only `{installer,scripts}/src/**`.

Why the mempalace hooks are reimplemented rather than vendored, and the host
rules a hook must satisfy (BSD `sed`, the per-event verdict shapes), are
`plugins/stackgen/assets/artifact-doctrine.md` §4 and the `plugin-authoring`
skill.

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
