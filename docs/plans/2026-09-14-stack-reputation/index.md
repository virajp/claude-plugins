---
type: vwf-change-plan
title: stack reputation — a verdict on every name stackgen generates, and a
  skill anyone can point at a package
requires:
  - docs/plans/archived/2026-09-14-notion-workspace
backlog: [ B10 ]
---

# Plan — stack reputation — a verdict on every name stackgen generates, and a skill anyone can point at a package (2026-09-14)

## Status

**APPROVED** 2026-09-14 by the user, after self-review.

## Consent

| Action                                            | Granted                                                                                                                                                                       |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Merge to the integration branch and push on green | yes                                                                                                                                                                           |
| After landing: `mise run p:plugins:local`         | run                                                                                                                                                                           |
| After landing: `/release`                         | ask                                                                                                                                                                           |
| Release stackgen publicly                         | minor — `plugins/stackgen/.claude-plugin/plugin.json`, the next minor above the value the tree holds when U4 runs, never a 13 or 17 component; by editing the `version` field |
| Release site publicly                             | patch — `mise run p:site:version` (bare; patch is its default; it refuses a dirty tree, so U4 runs it first)                                                                  |
| Release vwf publicly                              | none — untouched                                                                                                                                                              |
| Release installer publicly                        | none — untouched                                                                                                                                                              |

**A release recorded here is intent, not authorisation.** Every release step is
an `ask` step: the run stops once, reports what it would ship, and waits. A
`run` step publishes nothing and cuts no tag; where one stages something this
session already loaded, it is picked up only by a **restarted** session.

## Goal

No concrete third-party name — a package, a runner-invoked tool, a GitHub
Action, a container image — reaches a generated stack or its dry-run consent
gate without a reputation verdict, and a name whose verdict is `block` is never
landed: the generator halts that component and shows the table, and the user
picks the replacement, which is checked in turn. The same check is a skill
anyone can invoke on demand — `/stackgen:stackgen-reputation <name…>` — so a
person or the model can vet a package before typing it into anything.

The backlog framed this as "before stackgen recommends or generates". The survey
found that the menu never names a package — it returns bundle slugs and is
forbidden from reading anything — so the only place a name becomes concrete is
the generator, and that is where the check is wired. Shipped packs stay
hand-curated. No standing decision is reversed.

## Facts the survey established

**The dispatch flow.** `stackgen-stack-menu`
(`plugins/stackgen/skills/stackgen-stack-menu/SKILL.md`) returns a menu payload
of bundle slugs plus the one `generate:` entry (`:51-73`); it reads nothing
(`:114-116`), and its `note` (`:53-59`) is the only trust claim at recommend
time. `stackgen-stack-template`
(`plugins/stackgen/skills/stackgen-stack-template/SKILL.md`) forks at Resolution
step 3 (`:55-65`): a component with a `pack.yaml` is copied, an uncovered one is
generated. Step 1 (`:32-40`) is a pure read of an already-materialized template;
"reads are cheap and pure" (`:106-109`) forbids network on that path —
`/vwf:plan` and `/vwf:execute` read through it and must never trigger a lookup.
`stackgen-sync` (`plugins/stackgen/skills/stackgen-sync/SKILL.md`) is the
user-only re-sync path; where it offers regeneration it goes through the
generator and inherits the check.

**The generator.**
`plugins/stackgen/skills/stackgen-stack-template/references/generator.md`:
preconditions `:12-27` (principles catalog passed in; **Context7 reachable or
halt**); pipeline `:29-112` — 1 classify and detect `:31-40`, 2 resolve topics
`:41-51`, 3 topic loop `:52-80`, **4 assemble the pack shape `:81-97`** (where
`mise_tool`, harness tasks and `mcp_servers` are finalized — the hook point), 5
reviewer gate `:98-108` (four rounds cap), 6 materialize `:109-112`. The dry-run
consent gate is `references/materializer.md:181-190` and already shows "the
reviewer's clean verdict" — the verdict table sits beside it.

**The reviewer.** `plugins/stackgen/agents/stackgen-skill-reviewer.md` —
`tools: Read, Grep, Glob`, `model: opus`, stateless by design (`:14-22`); nine
checks at `:29-98`, none about supply chain; check 4 "emitted facts are honest"
(`:46-49`) and check 5 "configure, not conjure" (`:50-52`) are the neighbours.
It stays offline: a tenth check reads a table it is handed.

**Where shipped packs name things** — hand-curated, out of scope, listed so no
unit wonders: task libraries (`pnpm dlx @askviraj/linter` at
`plugins/stackgen/stacks/package-manager/pnpm/config/.config/mise/tasks/code/lint:96`,
`npx wrangler` in the Cloudflare deploy tasks, `uv run --with pip-audit`);
`plugins/stackgen/stacks/toolchain-gate/dprint/config/.config/dprint.json:60-68`
(eight wasm plugin URLs, one with a checksum); `config/.config/vscode.d/*.jsonc`
extension ids; `mcp_servers:` entries. `pack.yaml` has no dependency list
(`plugins/stackgen/assets/pack-format.md:144-176`). No pack ships a workflow
file or names a docker image tag.

**Network today.** Zero `WebFetch`/`WebSearch` references under `plugins/`.
Context7 is declared by vwf's manifest
(`plugins/vwf/.claude-plugin/plugin.json:40-48`), not stackgen's — stackgen's
`plugin.json` declares no `mcpServers`. `WebFetch` is a host tool: no
declaration, no key. Doctrine:
`plugins/stackgen/assets/artifact-doctrine.md:154` §5 — stackgen holds no
registry of servers.

**Adjacent doctrine not to duplicate.**
`plugins/stackgen/assets/kinds.md:97-100` (language-bundle topic 8: lockfile
discipline, supply-chain posture, the ecosystem's own audit tooling) and
`:541-548` (registry pinning, release-age cooldown, postinstall allowlist) are
what the generator *writes into a repo's conventions*; this plan checks the
names stackgen itself emits. The `setup:deps:audit` harness task (`pnpm audit`,
`pip-audit`) is post-hoc over installed dependencies. The principles catalog
(`plugins/vwf/assets/principles/index.md`, 13 entries) has no supply-chain entry
— parked, it is vwf's tree.

**Skill shape.** Two invocation modes in use: adapter
(`disable-model-invocation: false` + `user-invocable: false`, e.g.
`stackgen-stack-menu/SKILL.md:7-8`) and user-only
(`disable-model-invocation: true`, `stackgen-sync/SKILL.md:11`). This plan's
skill is a third: **both** — `disable-model-invocation: false` and no
`user-invocable: false`, so `/stackgen:stackgen-reputation` appears in the menu
and the generator can call it. Checker rule 9 keys off the two adapter names
only; rule 4 asserts strict-YAML frontmatter on every stackgen skill.

**Sources the skill will use, all keyless on their read paths.** deps.dev's REST
API (one surface across npm, PyPI, Go, Maven, Cargo, NuGet: versions, publish
dates, advisories, OpenSSF Scorecard, source repository); OSV.dev's query API
for advisories by package and version; the ecosystem registry for what deps.dev
lacks — npm's registry and download-counts endpoints for weekly downloads and
maintainers, PyPI's JSON API, pub.dev's API; GitHub's REST API for an action's
repository (age, stars, archived flag, latest release) and a package's source
repository; Docker Hub's and GHCR's manifest endpoints for an image's existence
and last push. U1 verifies each endpoint's exact path and response shape through
Context7 (`resolve-library-id` → `query-docs`) before writing it into
`references/sources.md`; nothing in this folder is a source for a URL.

**Gates over the touched trees.** `p:plugins:check` rules 4, 12, 13 (the skill
lands nothing, so 13 is moot). Commit convention
`.config/git-conventional-commits.yaml`: types `ops`, `docs`, `merge`, `feat`,
`fix`, `refactor`; no scopes.

**Docs describing today's behaviour** that this plan falsifies: the stackgen
dispatch rule and skill table in `.claude/skills/stackgen-plugin/SKILL.md` (two
adapter skills plus sync — becomes three plus sync); `.claude/docs/plugins.md`'s
stackgen skill inventory; `site/src/content/docs/plugins/stackgen.md` (the
skills section and the generator's description); `readme.md` where it describes
the generator; `CLAUDE.md`'s stackgen row only if it enumerates the skills.

## Assumed decisions — confirm or override at review

| # | Decision     | Ruling                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Rejected                                                                     | Unit   |
| - | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ------ |
| 1 | Placement    | One skill, `stackgen-reputation`, invocable by the user and by the model. The generator calls it at assemble (step 4) over every concrete name the component will emit — packages, runner-invoked tools, actions, images — and the verdict table is shown beside the reviewer's verdict at the dry-run consent gate. Shipped packs stay hand-curated. (User: "generator path, plus a skill which can be invoked whenever user or model wants to check reputation".)                                       | a reviewer check with network tools; generator-only with no user entry point | U1, U2 |
| 2 | Sources      | `WebFetch` against public read APIs — deps.dev, OSV.dev, the ecosystem registry (npm, PyPI, pub.dev), GitHub's API for actions and source repos, Docker Hub / GHCR for images. No MCP server, no key. (User, MCQ.)                                                                                                                                                                                                                                                                                        | a new `mcpServers` entry in stackgen's manifest (a vendor account); Context7 | U1     |
| 3 | Block policy | A `block` halts that component's generation with the verdict table; the user picks a replacement, which is checked in turn. The generator never swaps a name silently — a swap is a new recommendation. (User, MCQ.)                                                                                                                                                                                                                                                                                      | auto-substitute and re-check; warn-only                                      | U2     |
| 4 | Verdicts     | Three: `pass`, `warn`, `block`. Block: the name is absent from its registry; first publish under 30 days ago; an unpatched critical or high advisory on the version to be pinned; a near-name (edit distance ≤ 2) of a package with at least 100× its downloads; deprecated or archived. Warn: one maintainer; downloads in the bottom tier for its ecosystem; no provenance or attestation; a low Scorecard. Thresholds live in `references/signals.md`, each with its source and the reason. (Assumed.) | binary pass/fail; thresholds left to the model at run time                   | U1     |
| 5 | Offline      | A source that cannot be reached yields `UNRESOLVED: <source> unreachable for <name>`, never an inferred verdict — the same posture as the generator's Context7 precondition. (Assumed.)                                                                                                                                                                                                                                                                                                                   | proceed with a warning row                                                   | U1     |
| 6 | Reviewer     | A tenth, stateless check: every concrete name the generated component emits has a row in the verdict table the orchestrator hands the reviewer, and no row reads `block`. The reviewer's tools stay `Read, Grep, Glob`. (Assumed.)                                                                                                                                                                                                                                                                        | network tools for the reviewer                                               | U2     |
| 7 | Name syntax  | One argument per name, `<ecosystem>:<name>` — `npm:`, `pypi:`, `pub:`, `action:` (owner/repo), `image:` (registry/repo). A bare name defaults to the ecosystem of the component's language; the generator always writes the prefix. (Assumed.)                                                                                                                                                                                                                                                            | one skill per ecosystem; a YAML argument file                                | U1, U2 |
| 8 | Read path    | The check runs only where a name is first emitted — generator step 4 and, through it, sync's regeneration. Template step 1 (read-back for `/vwf:plan` and `/vwf:execute`) stays network-free. (Assumed, from `stackgen-stack-template/SKILL.md:106-109`.)                                                                                                                                                                                                                                                 | re-check on every read                                                       | U2     |

## New dependencies

none

## Units

| Id | Wave | Unit file                                    | Owns                                                                                                                                                                                                                                                                                                                                                                        | Depends on | Status  | Commit |
| -- | ---- | -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------- | ------ |
| U1 | 1    | [01-skill.md](01-skill.md)                   | `plugins/stackgen/skills/stackgen-reputation/**` (new)                                                                                                                                                                                                                                                                                                                      | —          | pending |        |
| U2 | 1    | [02-wiring.md](02-wiring.md)                 | `plugins/stackgen/skills/stackgen-stack-template/references/generator.md`, `plugins/stackgen/skills/stackgen-stack-template/references/materializer.md`, `plugins/stackgen/skills/stackgen-stack-template/SKILL.md`, `plugins/stackgen/skills/stackgen-sync/SKILL.md`, `plugins/stackgen/assets/artifact-doctrine.md`, `plugins/stackgen/agents/stackgen-skill-reviewer.md` | —          | pending |        |
| U3 | 2    | [03-docs.md](03-docs.md)                     | `readme.md`, `CLAUDE.md`, `.claude/**`, `site/src/content/docs/**`                                                                                                                                                                                                                                                                                                          | U1–U2      | pending |        |
| U4 | 3    | [04-gates-and-bump.md](04-gates-and-bump.md) | `plugins/stackgen/.claude-plugin/plugin.json`, `site/package.json`, `.claude-plugin/marketplace.json`                                                                                                                                                                                                                                                                       | U3         | pending |        |

Status is one of `pending`, `running`, `green`, `failed`, `unresolved`,
`skipped`.

## Shared-file rule

| File                                                               | Why it collides                                    | Owner   |
| ------------------------------------------------------------------ | -------------------------------------------------- | ------- |
| `plugins/stackgen/.claude-plugin/plugin.json`, `site/package.json` | several units bumping one version is a lost update | U4 only |
| `.claude-plugin/marketplace.json`                                  | generated; regenerating mid-wave races             | U4 only |
| `readme.md`, `CLAUDE.md`, `.claude/**`, `site/src/content/docs/**` | n units editing one doc                            | U3 only |
| `docs/backlog.md`                                                  | the backlog skill's; nobody in this run edits it   | nobody  |
| `plugins/vwf/**`                                                   | untouched — the generator calls the skill itself   | nobody  |
| `plugins/stackgen/skills/stackgen-stack-menu/**`                   | the menu names no package; untouched               | nobody  |
| `scripts/src/**`                                                   | no checker rule changes                            | nobody  |

## Waves

- **Wave 1** — U1 and U2 concurrently: U1 creates a new directory, U2 edits six
  existing files; the paths are disjoint. U2 names the skill and its argument
  syntax from the assumed decisions, not from U1's output.
- **Wave 2** — U3: docs over the branch delta.
- **Wave 3** — U4: version bumps, the generated marketplace, the full gate.

## Wave gate

```text
mise run p:plugins:marketplace -- --check
mise run p:plugins:inventory -- --check
mise run p:plugins:check
mise run p:plugins:shellcheck
mise run p:plugins:npm-normalize-test
pnpm vitest run
pnpm exec tsc --noEmit -p installer
pnpm exec tsc --noEmit -p scripts
mise run p:site:check
```

Plus the wave review, plus every report read for `UNRESOLVED:`. Every line is
green before wave 1.

## After landing

| Step                       | Mode | Notes                                                                                                                                                                                                                                                                                                |
| -------------------------- | ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mise run p:plugins:local` | run  | Stages stackgen into the dev marketplace and updates this machine's install. Publishes nothing, cuts no tag. A **restarted** session is what loads the staged plugin — and is where the user runs `/stackgen:stackgen-reputation npm:left-pad npm:lodahs` by hand to see one `pass` and one `block`. |
| `/release`                 | ask  | Cuts the stackgen and site tags per the consent block. The run stops once and asks first.                                                                                                                                                                                                            |

## Gates the orchestrator keeps

- **The skill is discoverable both ways.**
  `command sed -n '1,15p' plugins/stackgen/skills/stackgen-reputation/SKILL.md`
  shows `disable-model-invocation: false` and **no** `user-invocable: false`
  line.
- **The wiring is in every place the ruling names.**
  `command grep -ln 'stackgen-reputation' plugins/stackgen/skills/stackgen-stack-template/references/generator.md plugins/stackgen/skills/stackgen-stack-template/references/materializer.md plugins/stackgen/agents/stackgen-skill-reviewer.md plugins/stackgen/assets/artifact-doctrine.md`
  lists all four.
- **The read path stays pure.**
  `command grep -n -i 'reputation\|webfetch' plugins/stackgen/skills/stackgen-stack-template/SKILL.md`
  hits only inside the generate branch's description, never inside Resolution
  step 1.
- **The reviewer stays offline.**
  `command grep -n '^tools:' plugins/stackgen/agents/stackgen-skill-reviewer.md`
  still reads `Read, Grep, Glob`.
- **No URL was typed from memory.** Every endpoint in `references/sources.md`
  carries the Context7 library id it was verified against, in the file's source
  table.

## Unit contract

Every unit prompt carries, in order: its ruling quoted from this file, its owned
paths plus "touch nothing outside this list", the facts section, the shared-file
rule, and the return block below. A unit never bumps a version, never runs a
generator, never edits a doc, never adds a dependency this file does not list,
never commits. A unit deletes with plain `rm`, never `git rm` — it stages
nothing.

A unit returns exactly this block and nothing else — no file contents, no diff:

    CHANGED: <path> — <one line>            (one per file)
    DECIDED: <what> — <why>                 (choices made inside scope, or none)
    DOCS FALSIFIED: <path> — <passage>      (reported, never edited; or none)
    GAP: <what the plan left unspecified and the assumption taken>   (or none)
    UNRESOLVED: <the ruling needed>         (or none)

A `GAP:` is a hole in the plan the unit could proceed past on a stated
assumption; it is recorded and the run continues. An `UNRESOLVED:` is a ruling
the unit could not proceed without; it blocks the unit and its dependents.

## Out of scope

- **Vetting the names shipped packs carry** — hand-curated; parked as an audit
  mode.
- **Network tools for the reviewer** — it stays stateless and offline; it reads
  a table.
- **A check at menu time** — the menu names no package and reads nothing.
- **A check on template read-back** — `/vwf:plan` and `/vwf:execute` read a
  materialized template; that path stays network-free.
- **vwf's principles catalog** — parked.

## Parked

- **An audit mode over shipped packs.** A pass that extracts every concrete name
  from `plugins/stackgen/stacks/**` — task libraries'
  `dlx`/`npx`/`uv run
  --with` invocations, `dprint.json` plugin URLs,
  `vscode.d` extension ids, `mcp_servers:` commands — and runs the skill over
  the list; a repo-level report, not a gate. Until then the author hands the
  skill names by hand.
- **A `supply-chain` entry in vwf's principles catalog**
  (`plugins/vwf/assets/principles/`), so generated conventions carry release-age
  cooldown, postinstall allowlists and lockfile discipline as a cited principle
  rather than a kind topic. vwf's tree; a different concern (what the product
  does, not what stackgen recommends).
- **Checksums on the seven unpinned dprint wasm plugin URLs**
  (`toolchain-gate/dprint/config/.config/dprint.json:60-68`) — a pack fix the
  audit mode would surface first.
- **A cache of verdicts** — a name checked in one generation is re-checked in
  the next; fine until it is slow.

## Run log

<written by /vwf:change-execute; empty at approval>

| Wave | Unit | Model | Round | Outcome | Detail | Commit |
| ---- | ---- | ----- | ----- | ------- | ------ | ------ |

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the fresh session's worktree — cut from the integration branch — can see it.

Run in a fresh session:

/vwf:change-execute docs/plans/2026-09-14-stack-reputation
