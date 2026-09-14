---
| 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED | 30ec1db4 |
type: vwf-change-plan
| 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED | 30ec1db4 |
title: stack reputation — a verdict on every name stackgen generates, and a
| 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED | 30ec1db4 |
  skill anyone can point at a package
| 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED | 30ec1db4 |
requires:
| 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED | 30ec1db4 |
  - docs/plans/archived/2026-09-14-notion-workspace
| 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED | 30ec1db4 |
backlog: [ B10 ]
| 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED | 30ec1db4 |
---

| 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
30ec1db4 |

| 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
30ec1db4 |

# Plan — stack reputation — a verdict on every name stackgen generates, and a skill anyone can point at a package (2026-09-14)

| 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
30ec1db4 |

| 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
30ec1db4 |

## Status

| 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
30ec1db4 |

| 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
30ec1db4 | **RUNNING** 2026-09-14 — started 2026-09-14, worktree | 2 | gate | —
| 1 | green | all nine lines green after wave 2; no UNRESOLVED | 30ec1db4 |
`.worktrees/2026-09-14-stack-reputation`, branch `2026-09-14-stack-reputation`.
| 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
30ec1db4 | (Approved 2026-09-14 by the user, after self-review.) | 2 | gate | —
| 1 | green | all nine lines green after wave 2; no UNRESOLVED | 30ec1db4 |

| 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
30ec1db4 |

## Consent

| 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
30ec1db4 |

## | 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED | 30ec1db4 | | Action | Granted | | 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED | 30ec1db4 | | ------------------------------------------------- |

| | 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED
| 30ec1db4 | | Merge to the integration branch and push on green | yes | | 2 |
gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
30ec1db4 | | After landing: `mise run p:plugins:local` | run | | 2 | gate | — |
1 | green | all nine lines green after wave 2; no UNRESOLVED | 30ec1db4 | |
After landing: `/release` | ask | | 2 | gate | — | 1 | green | all nine lines
green after wave 2; no UNRESOLVED | 30ec1db4 | | Release stackgen publicly |
minor — `plugins/stackgen/.claude-plugin/plugin.json`, the next minor above the
value the tree holds when U4 runs, never a 13 or 17 component; by editing the
`version` field | | 2 | gate | — | 1 | green | all nine lines green after wave
2; no UNRESOLVED | 30ec1db4 | | Release site publicly | patch —
`mise run p:site:version` (bare; patch is its default; it refuses a dirty tree,
so U4 runs it first) | | 2 | gate | — | 1 | green | all nine lines green after
wave 2; no UNRESOLVED | 30ec1db4 | | Release vwf publicly | none — untouched | |
2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
30ec1db4 | | Release installer publicly | none — untouched | | 2 | gate | — | 1
| green | all nine lines green after wave 2; no UNRESOLVED | 30ec1db4 |

| 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
30ec1db4 | **A release recorded here is intent, not authorisation.** Every
release step is | 2 | gate | — | 1 | green | all nine lines green after wave 2;
no UNRESOLVED | 30ec1db4 | an `ask` step: the run stops once, reports what it
would ship, and waits. A | 2 | gate | — | 1 | green | all nine lines green after
wave 2; no UNRESOLVED | 30ec1db4 | `run` step publishes nothing and cuts no tag;
where one stages something this | 2 | gate | — | 1 | green | all nine lines
green after wave 2; no UNRESOLVED | 30ec1db4 | session already loaded, it is
picked up only by a **restarted** session. | 2 | gate | — | 1 | green | all nine
lines green after wave 2; no UNRESOLVED | 30ec1db4 |

| 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
30ec1db4 |

## Goal

| 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
30ec1db4 |

| 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
30ec1db4 | No concrete third-party name — a package, a runner-invoked tool, a
GitHub | 2 | gate | — | 1 | green | all nine lines green after wave 2; no
UNRESOLVED | 30ec1db4 | Action, a container image — reaches a generated stack or
its dry-run consent | 2 | gate | — | 1 | green | all nine lines green after wave
2; no UNRESOLVED | 30ec1db4 | gate without a reputation verdict, and a name
whose verdict is `block` is never | 2 | gate | — | 1 | green | all nine lines
green after wave 2; no UNRESOLVED | 30ec1db4 | landed: the generator halts that
component and shows the table, and the user | 2 | gate | — | 1 | green | all
nine lines green after wave 2; no UNRESOLVED | 30ec1db4 | picks the replacement,
which is checked in turn. The same check is a skill | 2 | gate | — | 1 | green |
all nine lines green after wave 2; no UNRESOLVED | 30ec1db4 | anyone can invoke
on demand — `/stackgen:stackgen-reputation <name…>` — so a | 2 | gate | — | 1 |
green | all nine lines green after wave 2; no UNRESOLVED | 30ec1db4 | person or
the model can vet a package before typing it into anything. | 2 | gate | — | 1 |
green | all nine lines green after wave 2; no UNRESOLVED | 30ec1db4 |

| 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
30ec1db4 | The backlog framed this as "before stackgen recommends or generates".
The survey | 2 | gate | — | 1 | green | all nine lines green after wave 2; no
UNRESOLVED | 30ec1db4 | found that the menu never names a package — it returns
bundle slugs and is | 2 | gate | — | 1 | green | all nine lines green after wave
2; no UNRESOLVED | 30ec1db4 | forbidden from reading anything — so the only
place a name becomes concrete is | 2 | gate | — | 1 | green | all nine lines
green after wave 2; no UNRESOLVED | 30ec1db4 | the generator, and that is where
the check is wired. Shipped packs stay | 2 | gate | — | 1 | green | all nine
lines green after wave 2; no UNRESOLVED | 30ec1db4 | hand-curated. No standing
decision is reversed. | 2 | gate | — | 1 | green | all nine lines green after
wave 2; no UNRESOLVED | 30ec1db4 |

| 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
30ec1db4 |

## Facts the survey established

| 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
30ec1db4 |

| 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
30ec1db4 | **The dispatch flow.** `stackgen-stack-menu` | 2 | gate | — | 1 |
green | all nine lines green after wave 2; no UNRESOLVED | 30ec1db4 |
(`plugins/stackgen/skills/stackgen-stack-menu/SKILL.md`) returns a menu payload
| 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
30ec1db4 | of bundle slugs plus the one `generate:` entry (`:51-73`); it reads
nothing | 2 | gate | — | 1 | green | all nine lines green after wave 2; no
UNRESOLVED | 30ec1db4 | (`:114-116`), and its `note` (`:53-59`) is the only
trust claim at recommend | 2 | gate | — | 1 | green | all nine lines green after
wave 2; no UNRESOLVED | 30ec1db4 | time. `stackgen-stack-template` | 2 | gate |
— | 1 | green | all nine lines green after wave 2; no UNRESOLVED | 30ec1db4 |
(`plugins/stackgen/skills/stackgen-stack-template/SKILL.md`) forks at Resolution
| 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
30ec1db4 | step 3 (`:55-65`): a component with a `pack.yaml` is copied, an
uncovered one is | 2 | gate | — | 1 | green | all nine lines green after wave 2;
no UNRESOLVED | 30ec1db4 | generated. Step 1 (`:32-40`) is a pure read of an
already-materialized template; | 2 | gate | — | 1 | green | all nine lines green
after wave 2; no UNRESOLVED | 30ec1db4 | "reads are cheap and pure" (`:106-109`)
forbids network on that path — | 2 | gate | — | 1 | green | all nine lines green
after wave 2; no UNRESOLVED | 30ec1db4 | `/vwf:plan` and `/vwf:execute` read
through it and must never trigger a lookup. | 2 | gate | — | 1 | green | all
nine lines green after wave 2; no UNRESOLVED | 30ec1db4 | `stackgen-sync`
(`plugins/stackgen/skills/stackgen-sync/SKILL.md`) is the | 2 | gate | — | 1 |
green | all nine lines green after wave 2; no UNRESOLVED | 30ec1db4 | user-only
re-sync path; where it offers regeneration it goes through the | 2 | gate | — |
1 | green | all nine lines green after wave 2; no UNRESOLVED | 30ec1db4 |
generator and inherits the check. | 2 | gate | — | 1 | green | all nine lines
green after wave 2; no UNRESOLVED | 30ec1db4 |

| 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
30ec1db4 | **The generator.** | 2 | gate | — | 1 | green | all nine lines green
after wave 2; no UNRESOLVED | 30ec1db4 |
`plugins/stackgen/skills/stackgen-stack-template/references/generator.md`: | 2 |
gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
30ec1db4 | preconditions `:12-27` (principles catalog passed in; **Context7
reachable or | 2 | gate | — | 1 | green | all nine lines green after wave 2; no
UNRESOLVED | 30ec1db4 | halt**); pipeline `:29-112` — 1 classify and detect
`:31-40`, 2 resolve topics | 2 | gate | — | 1 | green | all nine lines green
after wave 2; no UNRESOLVED | 30ec1db4 | `:41-51`, 3 topic loop `:52-80`, **4
assemble the pack shape `:81-97`** (where | 2 | gate | — | 1 | green | all nine
lines green after wave 2; no UNRESOLVED | 30ec1db4 | `mise_tool`, harness tasks
and `mcp_servers` are finalized — the hook point), 5 | 2 | gate | — | 1 | green
| all nine lines green after wave 2; no UNRESOLVED | 30ec1db4 | reviewer gate
`:98-108` (four rounds cap), 6 materialize `:109-112`. The dry-run | 2 | gate |
— | 1 | green | all nine lines green after wave 2; no UNRESOLVED | 30ec1db4 |
consent gate is `references/materializer.md:181-190` and already shows "the | 2
| gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
30ec1db4 | reviewer's clean verdict" — the verdict table sits beside it. | 2 |
gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
30ec1db4 |

| 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
30ec1db4 | **The reviewer.**
`plugins/stackgen/agents/stackgen-skill-reviewer.md` — | 2 | gate | — | 1 |
green | all nine lines green after wave 2; no UNRESOLVED | 30ec1db4 |
`tools: Read, Grep, Glob`, `model: opus`, stateless by design (`:14-22`); nine |
2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
30ec1db4 | checks at `:29-98`, none about supply chain; check 4 "emitted facts
are honest" | 2 | gate | — | 1 | green | all nine lines green after wave 2; no
UNRESOLVED | 30ec1db4 | (`:46-49`) and check 5 "configure, not conjure"
(`:50-52`) are the neighbours. | 2 | gate | — | 1 | green | all nine lines green
after wave 2; no UNRESOLVED | 30ec1db4 | It stays offline: a tenth check reads a
table it is handed. | 2 | gate | — | 1 | green | all nine lines green after wave
2; no UNRESOLVED | 30ec1db4 |

| 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
30ec1db4 | **Where shipped packs name things** — hand-curated, out of scope,
listed so no | 2 | gate | — | 1 | green | all nine lines green after wave 2; no
UNRESOLVED | 30ec1db4 | unit wonders: task libraries
(`pnpm dlx @askviraj/linter` at | 2 | gate | — | 1 | green | all nine lines
green after wave 2; no UNRESOLVED | 30ec1db4 |
`plugins/stackgen/stacks/package-manager/pnpm/config/.config/mise/tasks/code/lint:96`,
| 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
30ec1db4 | `npx wrangler` in the Cloudflare deploy tasks,
`uv run --with pip-audit`); | 2 | gate | — | 1 | green | all nine lines green
after wave 2; no UNRESOLVED | 30ec1db4 |
`plugins/stackgen/stacks/toolchain-gate/dprint/config/.config/dprint.json:60-68`
| 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
30ec1db4 | (eight wasm plugin URLs, one with a checksum);
`config/.config/vscode.d/*.jsonc` | 2 | gate | — | 1 | green | all nine lines
green after wave 2; no UNRESOLVED | 30ec1db4 | extension ids; `mcp_servers:`
entries. `pack.yaml` has no dependency list | 2 | gate | — | 1 | green | all
nine lines green after wave 2; no UNRESOLVED | 30ec1db4 |
(`plugins/stackgen/assets/pack-format.md:144-176`). No pack ships a workflow | 2
| gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
30ec1db4 | file or names a docker image tag. | 2 | gate | — | 1 | green | all
nine lines green after wave 2; no UNRESOLVED | 30ec1db4 |

| 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
30ec1db4 | **Network today.** Zero `WebFetch`/`WebSearch` references under
`plugins/`. | 2 | gate | — | 1 | green | all nine lines green after wave 2; no
UNRESOLVED | 30ec1db4 | Context7 is declared by vwf's manifest | 2 | gate | — |
1 | green | all nine lines green after wave 2; no UNRESOLVED | 30ec1db4 |
(`plugins/vwf/.claude-plugin/plugin.json:40-48`), not stackgen's — stackgen's |
2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
30ec1db4 | `plugin.json` declares no `mcpServers`. `WebFetch` is a host tool: no
| 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
30ec1db4 | declaration, no key. Doctrine: | 2 | gate | — | 1 | green | all nine
lines green after wave 2; no UNRESOLVED | 30ec1db4 |
`plugins/stackgen/assets/artifact-doctrine.md:154` §5 — stackgen holds no | 2 |
gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
30ec1db4 | registry of servers. | 2 | gate | — | 1 | green | all nine lines
green after wave 2; no UNRESOLVED | 30ec1db4 |

| 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
30ec1db4 | **Adjacent doctrine not to duplicate.** | 2 | gate | — | 1 | green |
all nine lines green after wave 2; no UNRESOLVED | 30ec1db4 |
`plugins/stackgen/assets/kinds.md:97-100` (language-bundle topic 8: lockfile | 2
| gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
30ec1db4 | discipline, supply-chain posture, the ecosystem's own audit tooling)
and | 2 | gate | — | 1 | green | all nine lines green after wave 2; no
UNRESOLVED | 30ec1db4 | `:541-548` (registry pinning, release-age cooldown,
postinstall allowlist) are | 2 | gate | — | 1 | green | all nine lines green
after wave 2; no UNRESOLVED | 30ec1db4 | what the generator *writes into a
repo's conventions*; this plan checks the | 2 | gate | — | 1 | green | all nine
lines green after wave 2; no UNRESOLVED | 30ec1db4 | names stackgen itself
emits. The `setup:deps:audit` harness task (`pnpm audit`, | 2 | gate | — | 1 |
green | all nine lines green after wave 2; no UNRESOLVED | 30ec1db4 |
`pip-audit`) is post-hoc over installed dependencies. The principles catalog | 2
| gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
30ec1db4 | (`plugins/vwf/assets/principles/index.md`, 13 entries) has no
supply-chain entry | 2 | gate | — | 1 | green | all nine lines green after wave
2; no UNRESOLVED | 30ec1db4 | — parked, it is vwf's tree. | 2 | gate | — | 1 |
green | all nine lines green after wave 2; no UNRESOLVED | 30ec1db4 |

| 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
30ec1db4 | **Skill shape.** Two invocation modes in use: adapter | 2 | gate | —
| 1 | green | all nine lines green after wave 2; no UNRESOLVED | 30ec1db4 |
(`disable-model-invocation: false` + `user-invocable: false`, e.g. | 2 | gate |
— | 1 | green | all nine lines green after wave 2; no UNRESOLVED | 30ec1db4 |
`stackgen-stack-menu/SKILL.md:7-8`) and user-only | 2 | gate | — | 1 | green |
all nine lines green after wave 2; no UNRESOLVED | 30ec1db4 |
(`disable-model-invocation: true`, `stackgen-sync/SKILL.md:11`). This plan's | 2
| gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
30ec1db4 | skill is a third: **both** — `disable-model-invocation: false` and no
| 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
30ec1db4 | `user-invocable: false`, so `/stackgen:stackgen-reputation` appears
in the menu | 2 | gate | — | 1 | green | all nine lines green after wave 2; no
UNRESOLVED | 30ec1db4 | and the generator can call it. Checker rule 9 keys off
the two adapter names | 2 | gate | — | 1 | green | all nine lines green after
wave 2; no UNRESOLVED | 30ec1db4 | only; rule 4 asserts strict-YAML frontmatter
on every stackgen skill. | 2 | gate | — | 1 | green | all nine lines green after
wave 2; no UNRESOLVED | 30ec1db4 |

| 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
30ec1db4 | **Sources the skill will use, all keyless on their read paths.**
deps.dev's REST | 2 | gate | — | 1 | green | all nine lines green after wave 2;
no UNRESOLVED | 30ec1db4 | API (one surface across npm, PyPI, Go, Maven, Cargo,
NuGet: versions, publish | 2 | gate | — | 1 | green | all nine lines green after
wave 2; no UNRESOLVED | 30ec1db4 | dates, advisories, OpenSSF Scorecard, source
repository); OSV.dev's query API | 2 | gate | — | 1 | green | all nine lines
green after wave 2; no UNRESOLVED | 30ec1db4 | for advisories by package and
version; the ecosystem registry for what deps.dev | 2 | gate | — | 1 | green |
all nine lines green after wave 2; no UNRESOLVED | 30ec1db4 | lacks — npm's
registry and download-counts endpoints for weekly downloads and | 2 | gate | — |
1 | green | all nine lines green after wave 2; no UNRESOLVED | 30ec1db4 |
maintainers, PyPI's JSON API, pub.dev's API; GitHub's REST API for an action's |
2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
30ec1db4 | repository (age, stars, archived flag, latest release) and a
package's source | 2 | gate | — | 1 | green | all nine lines green after wave 2;
no UNRESOLVED | 30ec1db4 | repository; Docker Hub's and GHCR's manifest
endpoints for an image's existence | 2 | gate | — | 1 | green | all nine lines
green after wave 2; no UNRESOLVED | 30ec1db4 | and last push. U1 verifies each
endpoint's exact path and response shape through | 2 | gate | — | 1 | green |
all nine lines green after wave 2; no UNRESOLVED | 30ec1db4 | Context7
(`resolve-library-id` → `query-docs`) before writing it into | 2 | gate | — | 1
| green | all nine lines green after wave 2; no UNRESOLVED | 30ec1db4 |
`references/sources.md`; nothing in this folder is a source for a URL. | 2 |
gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
30ec1db4 |

| 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
30ec1db4 | **Gates over the touched trees.** `p:plugins:check` rules 4, 12, 13
(the skill | 2 | gate | — | 1 | green | all nine lines green after wave 2; no
UNRESOLVED | 30ec1db4 | lands nothing, so 13 is moot). Commit convention | 2 |
gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
30ec1db4 | `.config/git-conventional-commits.yaml`: types `ops`, `docs`,
`merge`, `feat`, | 2 | gate | — | 1 | green | all nine lines green after wave 2;
no UNRESOLVED | 30ec1db4 | `fix`, `refactor`; no scopes. | 2 | gate | — | 1 |
green | all nine lines green after wave 2; no UNRESOLVED | 30ec1db4 |

| 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
30ec1db4 | **Docs describing today's behaviour** that this plan falsifies: the
stackgen | 2 | gate | — | 1 | green | all nine lines green after wave 2; no
UNRESOLVED | 30ec1db4 | dispatch rule and skill table in
`.claude/skills/stackgen-plugin/SKILL.md` (two | 2 | gate | — | 1 | green | all
nine lines green after wave 2; no UNRESOLVED | 30ec1db4 | adapter skills plus
sync — becomes three plus sync); `.claude/docs/plugins.md`'s | 2 | gate | — | 1
| green | all nine lines green after wave 2; no UNRESOLVED | 30ec1db4 | stackgen
skill inventory; `site/src/content/docs/plugins/stackgen.md` (the | 2 | gate | —
| 1 | green | all nine lines green after wave 2; no UNRESOLVED | 30ec1db4 |
skills section and the generator's description); `readme.md` where it describes
| 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
30ec1db4 | the generator; `CLAUDE.md`'s stackgen row only if it enumerates the
skills. | 2 | gate | — | 1 | green | all nine lines green after wave 2; no
UNRESOLVED | 30ec1db4 |

| 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
30ec1db4 |

## Assumed decisions — confirm or override at review

| 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
30ec1db4 |

## | 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED | 30ec1db4 | | # | Decision | Ruling | Rejected | Unit | | 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED | 30ec1db4 | | - | ------------ |

| ---------------------------------------------------------------------------- |
------ | | 2 | gate | — | 1 | green | all nine lines green after wave 2; no
UNRESOLVED | 30ec1db4 | | 1 | Placement | One skill, `stackgen-reputation`,
invocable by the user and by the model. The generator calls it at assemble
(step 4) over every concrete name the component will emit — packages,
runner-invoked tools, actions, images — and the verdict table is shown beside
the reviewer's verdict at the dry-run consent gate. Shipped packs stay
hand-curated. (User: "generator path, plus a skill which can be invoked whenever
user or model wants to check reputation".) | a reviewer check with network
tools; generator-only with no user entry point | U1, U2 | | 2 | gate | — | 1 |
green | all nine lines green after wave 2; no UNRESOLVED | 30ec1db4 | | 2 |
Sources | `WebFetch` against public read APIs — deps.dev, OSV.dev, the ecosystem
registry (npm, PyPI, pub.dev), GitHub's API for actions and source repos, Docker
Hub / GHCR for images. No MCP server, no key. (User, MCQ.) | a new `mcpServers`
entry in stackgen's manifest (a vendor account); Context7 | U1 | | 2 | gate | —
| 1 | green | all nine lines green after wave 2; no UNRESOLVED | 30ec1db4 | | 3
| Block policy | A `block` halts that component's generation with the verdict
table; the user picks a replacement, which is checked in turn. The generator
never swaps a name silently — a swap is a new recommendation. (User, MCQ.) |
auto-substitute and re-check; warn-only | U2 | | 2 | gate | — | 1 | green | all
nine lines green after wave 2; no UNRESOLVED | 30ec1db4 | | 4 | Verdicts |
Three: `pass`, `warn`, `block`. Block: the name is absent from its registry;
first publish under 30 days ago; an unpatched critical or high advisory on the
version to be pinned; a near-name (edit distance ≤ 2) of a package with at least
100× its downloads; deprecated or archived. Warn: one maintainer; downloads in
the bottom tier for its ecosystem; no provenance or attestation; a low
Scorecard. Thresholds live in `references/signals.md`, each with its source and
the reason. (Assumed.) | binary pass/fail; thresholds left to the model at run
time | U1 | | 2 | gate | — | 1 | green | all nine lines green after wave 2; no
UNRESOLVED | 30ec1db4 | | 5 | Offline | A source that cannot be reached yields
`UNRESOLVED: <source> unreachable for <name>`, never an inferred verdict — the
same posture as the generator's Context7 precondition. (Assumed.) | proceed with
a warning row | U1 | | 2 | gate | — | 1 | green | all nine lines green after
wave 2; no UNRESOLVED | 30ec1db4 | | 6 | Reviewer | A tenth, stateless check:
every concrete name the generated component emits has a row in the verdict table
the orchestrator hands the reviewer, and no row reads `block`. The reviewer's
tools stay `Read, Grep, Glob`. (Assumed.) | network tools for the reviewer | U2
| | 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED
| 30ec1db4 | | 7 | Name syntax | One argument per name, `<ecosystem>:<name>` —
`npm:`, `pypi:`, `pub:`, `action:` (owner/repo), `image:` (registry/repo). A
bare name defaults to the ecosystem of the component's language; the generator
always writes the prefix. (Assumed.) | one skill per ecosystem; a YAML argument
file | U1, U2 | | 2 | gate | — | 1 | green | all nine lines green after wave 2;
no UNRESOLVED | 30ec1db4 | | 8 | Read path | The check runs only where a name is
first emitted — generator step 4 and, through it, sync's regeneration. Template
step 1 (read-back for `/vwf:plan` and `/vwf:execute`) stays network-free.
(Assumed, from `stackgen-stack-template/SKILL.md:106-109`.) | re-check on every
read | U2 | | 2 | gate | — | 1 | green | all nine lines green after wave 2; no
UNRESOLVED | 30ec1db4 |

| 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
30ec1db4 |

## New dependencies

| 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
30ec1db4 |

| 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
30ec1db4 | none | 2 | gate | — | 1 | green | all nine lines green after wave 2;
no UNRESOLVED | 30ec1db4 |

| 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
30ec1db4 |

## Units

| 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
30ec1db4 |

| 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
30ec1db4 | | Id | Wave | Unit file | Owns | Depends on | Status | Commit |

| 2  | gate | —                                            | 1                                                                                                                                                                                                                                                                                                                                                                           | green | all nine lines green after wave 2; no UNRESOLVED | 30ec1db4 |
| -- | ---- | -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- | ------------------------------------------------ | -------- |
| 2  | gate | —                                            | 1                                                                                                                                                                                                                                                                                                                                                                           | green | all nine lines green after wave 2; no UNRESOLVED | 30ec1db4 |
| U1 | 1    | [01-skill.md](01-skill.md)                   | `plugins/stackgen/skills/stackgen-reputation/**` (new)                                                                                                                                                                                                                                                                                                                      | —     | green                                            | 736599c2 |
| 2  | gate | —                                            | 1                                                                                                                                                                                                                                                                                                                                                                           | green | all nine lines green after wave 2; no UNRESOLVED | 30ec1db4 |
| U2 | 1    | [02-wiring.md](02-wiring.md)                 | `plugins/stackgen/skills/stackgen-stack-template/references/generator.md`, `plugins/stackgen/skills/stackgen-stack-template/references/materializer.md`, `plugins/stackgen/skills/stackgen-stack-template/SKILL.md`, `plugins/stackgen/skills/stackgen-sync/SKILL.md`, `plugins/stackgen/assets/artifact-doctrine.md`, `plugins/stackgen/agents/stackgen-skill-reviewer.md` | —     | green                                            | 968f3dfe |
| 2  | gate | —                                            | 1                                                                                                                                                                                                                                                                                                                                                                           | green | all nine lines green after wave 2; no UNRESOLVED | 30ec1db4 |
| U3 | 2    | [03-docs.md](03-docs.md)                     | `readme.md`, `CLAUDE.md`, `.claude/**`, `site/src/content/docs/**`                                                                                                                                                                                                                                                                                                          | U1–U2 | green                                            | 30ec1db4 |
| 2  | gate | —                                            | 1                                                                                                                                                                                                                                                                                                                                                                           | green | all nine lines green after wave 2; no UNRESOLVED | 30ec1db4 |
| U4 | 3    | [04-gates-and-bump.md](04-gates-and-bump.md) | `plugins/stackgen/.claude-plugin/plugin.json`, `site/package.json`, `.claude-plugin/marketplace.json`                                                                                                                                                                                                                                                                       | U3    | running                                          |          |
| 2  | gate | —                                            | 1                                                                                                                                                                                                                                                                                                                                                                           | green | all nine lines green after wave 2; no UNRESOLVED | 30ec1db4 |

| 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
30ec1db4 | Status is one of `pending`, `running`, `green`, `failed`,
`unresolved`, | 2 | gate | — | 1 | green | all nine lines green after wave 2; no
UNRESOLVED | 30ec1db4 | `skipped`. | 2 | gate | — | 1 | green | all nine lines
green after wave 2; no UNRESOLVED | 30ec1db4 |

| 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
30ec1db4 |

## Shared-file rule

| 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
30ec1db4 |

| 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
30ec1db4 | | File | Why it collides | Owner | | 2 | gate | — | 1 | green | all
nine lines green after wave 2; no UNRESOLVED | 30ec1db4 | |
------------------------------------------------------------------ |
-------------------------------------------------- | ------- | | 2 | gate | — |
1 | green | all nine lines green after wave 2; no UNRESOLVED | 30ec1db4 | |
`plugins/stackgen/.claude-plugin/plugin.json`, `site/package.json` | several
units bumping one version is a lost update | U4 only | | 2 | gate | — | 1 |
green | all nine lines green after wave 2; no UNRESOLVED | 30ec1db4 | |
`.claude-plugin/marketplace.json` | generated; regenerating mid-wave races | U4
only | | 2 | gate | — | 1 | green | all nine lines green after wave 2; no
UNRESOLVED | 30ec1db4 | | `readme.md`, `CLAUDE.md`, `.claude/**`,
`site/src/content/docs/**` | n units editing one doc | U3 only | | 2 | gate | —
| 1 | green | all nine lines green after wave 2; no UNRESOLVED | 30ec1db4 | |
`docs/backlog.md` | the backlog skill's; nobody in this run edits it | nobody |
| 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
30ec1db4 | | `plugins/vwf/**` | untouched — the generator calls the skill itself
| nobody | | 2 | gate | — | 1 | green | all nine lines green after wave 2; no
UNRESOLVED | 30ec1db4 | | `plugins/stackgen/skills/stackgen-stack-menu/**` | the
menu names no package; untouched | nobody | | 2 | gate | — | 1 | green | all
nine lines green after wave 2; no UNRESOLVED | 30ec1db4 | | `scripts/src/**` |
no checker rule changes | nobody | | 2 | gate | — | 1 | green | all nine lines
green after wave 2; no UNRESOLVED | 30ec1db4 |

| 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
30ec1db4 |

## Waves

| 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
30ec1db4 |

| 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
30ec1db4 |

- **Wave 1** — U1 and U2 concurrently: U1 creates a new directory, U2 edits six
  | 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED
  | 30ec1db4 | existing files; the paths are disjoint. U2 names the skill and
  its argument | 2 | gate | — | 1 | green | all nine lines green after wave 2;
  no UNRESOLVED | 30ec1db4 | syntax from the assumed decisions, not from U1's
  output. | 2 | gate | — | 1 | green | all nine lines green after wave 2; no
  UNRESOLVED | 30ec1db4 |
- **Wave 2** — U3: docs over the branch delta. | 2 | gate | — | 1 | green | all
  nine lines green after wave 2; no UNRESOLVED | 30ec1db4 |
- **Wave 3** — U4: version bumps, the generated marketplace, the full gate. | 2
  | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
  30ec1db4 |

| 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
30ec1db4 |

## Wave gate

| 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
30ec1db4 |

| 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
30ec1db4 |

```text
| 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED | 30ec1db4 |
mise run p:plugins:marketplace -- --check
| 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED | 30ec1db4 |
mise run p:plugins:inventory -- --check
| 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED | 30ec1db4 |
mise run p:plugins:check
| 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED | 30ec1db4 |
mise run p:plugins:shellcheck
| 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED | 30ec1db4 |
mise run p:plugins:npm-normalize-test
| 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED | 30ec1db4 |
pnpm vitest run
| 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED | 30ec1db4 |
pnpm exec tsc --noEmit -p installer
| 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED | 30ec1db4 |
pnpm exec tsc --noEmit -p scripts
| 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED | 30ec1db4 |
mise run p:site:check
| 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED | 30ec1db4 |
```

| 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
30ec1db4 |

| 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
30ec1db4 | Plus the wave review, plus every report read for `UNRESOLVED:`. Every
line is | 2 | gate | — | 1 | green | all nine lines green after wave 2; no
UNRESOLVED | 30ec1db4 | green before wave 1. | 2 | gate | — | 1 | green | all
nine lines green after wave 2; no UNRESOLVED | 30ec1db4 |

| 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
30ec1db4 |

## After landing

| 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
30ec1db4 |

## | 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED | 30ec1db4 | | Step | Mode | Notes | | 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED | 30ec1db4 | | -------------------------- | ---- |

| | 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED
| 30ec1db4 | | `mise run p:plugins:local` | run | Stages stackgen into the dev
marketplace and updates this machine's install. Publishes nothing, cuts no tag.
A **restarted** session is what loads the staged plugin — and is where the user
runs `/stackgen:stackgen-reputation npm:left-pad npm:lodahs` by hand to see one
`pass` and one `block`. | | 2 | gate | — | 1 | green | all nine lines green
after wave 2; no UNRESOLVED | 30ec1db4 | | `/release` | ask | Cuts the stackgen
and site tags per the consent block. The run stops once and asks first. | | 2 |
gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
30ec1db4 |

| 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
30ec1db4 |

## Gates the orchestrator keeps

| 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
30ec1db4 |

| 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
30ec1db4 |

- **The skill is discoverable both ways.** | 2 | gate | — | 1 | green | all nine
  lines green after wave 2; no UNRESOLVED | 30ec1db4 |
  `command sed -n '1,15p' plugins/stackgen/skills/stackgen-reputation/SKILL.md`
  | 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED
  | 30ec1db4 | shows `disable-model-invocation: false` and **no**
  `user-invocable: false` | 2 | gate | — | 1 | green | all nine lines green
  after wave 2; no UNRESOLVED | 30ec1db4 | line. | 2 | gate | — | 1 | green |
  all nine lines green after wave 2; no UNRESOLVED | 30ec1db4 |
- **The wiring is in every place the ruling names.** | 2 | gate | — | 1 | green
  | all nine lines green after wave 2; no UNRESOLVED | 30ec1db4 |
  `command grep -ln 'stackgen-reputation' plugins/stackgen/skills/stackgen-stack-template/references/generator.md plugins/stackgen/skills/stackgen-stack-template/references/materializer.md plugins/stackgen/agents/stackgen-skill-reviewer.md plugins/stackgen/assets/artifact-doctrine.md`
  | 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED
  | 30ec1db4 | lists all four. | 2 | gate | — | 1 | green | all nine lines green
  after wave 2; no UNRESOLVED | 30ec1db4 |
- **The read path stays pure.** | 2 | gate | — | 1 | green | all nine lines
  green after wave 2; no UNRESOLVED | 30ec1db4 |
  `command grep -n -i 'reputation\|webfetch' plugins/stackgen/skills/stackgen-stack-template/SKILL.md`
  | 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED
  | 30ec1db4 | hits only inside the generate branch's description, never inside
  Resolution | 2 | gate | — | 1 | green | all nine lines green after wave 2; no
  UNRESOLVED | 30ec1db4 | step 1. | 2 | gate | — | 1 | green | all nine lines
  green after wave 2; no UNRESOLVED | 30ec1db4 |
- **The reviewer stays offline.** | 2 | gate | — | 1 | green | all nine lines
  green after wave 2; no UNRESOLVED | 30ec1db4 |
  `command grep -n '^tools:' plugins/stackgen/agents/stackgen-skill-reviewer.md`
  | 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED
  | 30ec1db4 | still reads `Read, Grep, Glob`. | 2 | gate | — | 1 | green | all
  nine lines green after wave 2; no UNRESOLVED | 30ec1db4 |
- **No URL was typed from memory.** Every endpoint in `references/sources.md` |
  2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
  30ec1db4 | carries the Context7 library id it was verified against, in the
  file's source | 2 | gate | — | 1 | green | all nine lines green after wave 2;
  no UNRESOLVED | 30ec1db4 | table. | 2 | gate | — | 1 | green | all nine lines
  green after wave 2; no UNRESOLVED | 30ec1db4 |

| 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
30ec1db4 |

## Unit contract

| 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
30ec1db4 |

| 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
30ec1db4 | Every unit prompt carries, in order: its ruling quoted from this
file, its owned | 2 | gate | — | 1 | green | all nine lines green after wave 2;
no UNRESOLVED | 30ec1db4 | paths plus "touch nothing outside this list", the
facts section, the shared-file | 2 | gate | — | 1 | green | all nine lines green
after wave 2; no UNRESOLVED | 30ec1db4 | rule, and the return block below. A
unit never bumps a version, never runs a | 2 | gate | — | 1 | green | all nine
lines green after wave 2; no UNRESOLVED | 30ec1db4 | generator, never edits a
doc, never adds a dependency this file does not list, | 2 | gate | — | 1 | green
| all nine lines green after wave 2; no UNRESOLVED | 30ec1db4 | never commits. A
unit deletes with plain `rm`, never `git rm` — it stages | 2 | gate | — | 1 |
green | all nine lines green after wave 2; no UNRESOLVED | 30ec1db4 | nothing. |
2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
30ec1db4 |

| 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
30ec1db4 | A unit returns exactly this block and nothing else — no file
contents, no diff: | 2 | gate | — | 1 | green | all nine lines green after wave
2; no UNRESOLVED | 30ec1db4 |

| 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
30ec1db4 | CHANGED: <path> — <one line> (one per file) | 2 | gate | — | 1 |
green | all nine lines green after wave 2; no UNRESOLVED | 30ec1db4 | DECIDED:
<what> — <why> (choices made inside scope, or none) | 2 | gate | — | 1 | green |
all nine lines green after wave 2; no UNRESOLVED | 30ec1db4 | DOCS FALSIFIED:
<path> — <passage> (reported, never edited; or none) | 2 | gate | — | 1 | green
| all nine lines green after wave 2; no UNRESOLVED | 30ec1db4 | GAP:
<what the plan left unspecified and the assumption taken> (or none) | 2 | gate |
— | 1 | green | all nine lines green after wave 2; no UNRESOLVED | 30ec1db4 |
UNRESOLVED: <the ruling needed> (or none) | 2 | gate | — | 1 | green | all nine
lines green after wave 2; no UNRESOLVED | 30ec1db4 |

| 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
30ec1db4 | A `GAP:` is a hole in the plan the unit could proceed past on a
stated | 2 | gate | — | 1 | green | all nine lines green after wave 2; no
UNRESOLVED | 30ec1db4 | assumption; it is recorded and the run continues. An
`UNRESOLVED:` is a ruling | 2 | gate | — | 1 | green | all nine lines green
after wave 2; no UNRESOLVED | 30ec1db4 | the unit could not proceed without; it
blocks the unit and its dependents. | 2 | gate | — | 1 | green | all nine lines
green after wave 2; no UNRESOLVED | 30ec1db4 |

| 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
30ec1db4 |

## Out of scope

| 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
30ec1db4 |

| 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
30ec1db4 |

- **Vetting the names shipped packs carry** — hand-curated; parked as an audit |
  2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
  30ec1db4 | mode. | 2 | gate | — | 1 | green | all nine lines green after wave
  2; no UNRESOLVED | 30ec1db4 |
- **Network tools for the reviewer** — it stays stateless and offline; it reads
  | 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED
  | 30ec1db4 | a table. | 2 | gate | — | 1 | green | all nine lines green after
  wave 2; no UNRESOLVED | 30ec1db4 |
- **A check at menu time** — the menu names no package and reads nothing. | 2 |
  gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
  30ec1db4 |
- **A check on template read-back** — `/vwf:plan` and `/vwf:execute` read a | 2
  | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
  30ec1db4 | materialized template; that path stays network-free. | 2 | gate | —
  | 1 | green | all nine lines green after wave 2; no UNRESOLVED | 30ec1db4 |
- **vwf's principles catalog** — parked. | 2 | gate | — | 1 | green | all nine
  lines green after wave 2; no UNRESOLVED | 30ec1db4 |

| 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
30ec1db4 |

## Parked

| 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
30ec1db4 |

| 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
30ec1db4 |

- **An audit mode over shipped packs.** A pass that extracts every concrete name
  | 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED
  | 30ec1db4 | from `plugins/stackgen/stacks/**` — task libraries' | 2 | gate |
  — | 1 | green | all nine lines green after wave 2; no UNRESOLVED | 30ec1db4 |
  `dlx`/`npx`/`uv run
| 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED | 30ec1db4 |
  --with`
  invocations, `dprint.json` plugin URLs, | 2 | gate | — | 1 | green | all nine
  lines green after wave 2; no UNRESOLVED | 30ec1db4 | `vscode.d` extension ids,
  `mcp_servers:` commands — and runs the skill over | 2 | gate | — | 1 | green |
  all nine lines green after wave 2; no UNRESOLVED | 30ec1db4 | the list; a
  repo-level report, not a gate. Until then the author hands the | 2 | gate | —
  | 1 | green | all nine lines green after wave 2; no UNRESOLVED | 30ec1db4 |
  skill names by hand. | 2 | gate | — | 1 | green | all nine lines green after
  wave 2; no UNRESOLVED | 30ec1db4 |
- **A `supply-chain` entry in vwf's principles catalog** | 2 | gate | — | 1 |
  green | all nine lines green after wave 2; no UNRESOLVED | 30ec1db4 |
  (`plugins/vwf/assets/principles/`), so generated conventions carry release-age
  | 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED
  | 30ec1db4 | cooldown, postinstall allowlists and lockfile discipline as a
  cited principle | 2 | gate | — | 1 | green | all nine lines green after wave
  2; no UNRESOLVED | 30ec1db4 | rather than a kind topic. vwf's tree; a
  different concern (what the product | 2 | gate | — | 1 | green | all nine
  lines green after wave 2; no UNRESOLVED | 30ec1db4 | does, not what stackgen
  recommends). | 2 | gate | — | 1 | green | all nine lines green after wave 2;
  no UNRESOLVED | 30ec1db4 |
- **Checksums on the seven unpinned dprint wasm plugin URLs** | 2 | gate | — | 1
  | green | all nine lines green after wave 2; no UNRESOLVED | 30ec1db4 |
  (`toolchain-gate/dprint/config/.config/dprint.json:60-68`) — a pack fix the |
  2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
  30ec1db4 | audit mode would surface first. | 2 | gate | — | 1 | green | all
  nine lines green after wave 2; no UNRESOLVED | 30ec1db4 |
- **A cache of verdicts** — a name checked in one generation is re-checked in |
  2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
  30ec1db4 | the next; fine until it is slow. | 2 | gate | — | 1 | green | all
  nine lines green after wave 2; no UNRESOLVED | 30ec1db4 |

| 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
30ec1db4 |

## Run log

| 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
30ec1db4 |

| 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
30ec1db4 | <written by /vwf:change-execute; empty at approval> | 2 | gate | — |
1 | green | all nine lines green after wave 2; no UNRESOLVED | 30ec1db4 |

| 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
30ec1db4 | | Wave | Unit | Model | Round | Outcome | Detail | Commit |

| 2 | gate      | —    | 1 | green       | all nine lines green after wave 2; no UNRESOLVED                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | 30ec1db4           |
| - | --------- | ---- | - | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| 2 | gate      | —    | 1 | green       | all nine lines green after wave 2; no UNRESOLVED                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | 30ec1db4           |
| 0 | preflight | —    | 1 | green       | all nine gate lines green on `develop` @ 8b3f9faf                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | —                  |
| 2 | gate      | —    | 1 | green       | all nine lines green after wave 2; no UNRESOLVED                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | 30ec1db4           |
| 1 | U1        | opus | 1 | green       | three new files under stackgen-reputation/; DECIDED: optional `@version`/`@ref`/`:tag` suffix; bare-name language via leading `lang=<language>` token; image names carry host + full repo; npm maintainers/downloads verified via third-party client docs; action `stars` and `ref is tag` warns added. GAP: thresholds beyond ruling 4 assumed (latest-publish >730d warn, downloads <1,000/wk warn, Scorecard <4.0 warn, CVSS ≥7.0 block); near-name candidate set is model recall verified by fetch, pypi near-name/downloads `unavailable`; pub first-publish/deprecated/advisories, image last-push, action advisories `unavailable` (Context7 unconfirmed); deps.dev's other ecosystems left out, five prefixes kept. UNRESOLVED: none |                    |
| 2 | gate      | —    | 1 | green       | all nine lines green after wave 2; no UNRESOLVED                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | 30ec1db4           |
| 1 | U2        | opus | 1 | green       | six files wired; DECIDED: artifact-doctrine Rules renumbered §6→§7 (nothing cites §6); tenth check added to doctrine's "What the reviewer checks" list. GAP: none. UNRESOLVED: none. Checker green, tools line unchanged, step 1 clean                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |                    |
| 2 | gate      | —    | 1 | green       | all nine lines green after wave 2; no UNRESOLVED                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | 30ec1db4           |
| 1 | R1        | opus | 1 | findings(3) | CONTRACT clean, RULINGS clean. sources.md:55 [U1] OSV is POST+body, WebFetch is GET-only — advisory block criterion unfetchable, unreported; sources.md:181 [U1] OCI manifest HEAD needs bearer header — image existence unfetchable, unreported; SKILL.md:64/materializer.md:186/generator.md:127 [U2] ragged folds                                                                                                                                                                                                                                                                                                                                                                                                                         |                    |
| 2 | gate      | —    | 1 | green       | all nine lines green after wave 2; no UNRESOLVED                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | 30ec1db4           |
| 1 | U2        | opus | 2 | green       | three paragraphs reflowed to the surrounding fold; rest of diff scanned, remaining short lines paragraph-final. Checker green                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |                    |
| 2 | gate      | —    | 1 | green       | all nine lines green after wave 2; no UNRESOLVED                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | 30ec1db4           |
| 1 | U1        | opus | 2 | green       | OSV re-sourced to GET `/v1/vulns/{id}` with ids from deps.dev `advisory_keys`; OCI HEAD/bearer replaced by Docker Hub keyless tags GET; SKILL.md states WebFetch is a plain GET. GAP: image existence on ghcr.io and non-Docker-Hub hosts `unavailable`; action and pub advisories `unavailable` (OSV query is POST, deps.dev indexes neither). Checker green                                                                                                                                                                                                                                                                                                                                                                                |                    |
| 2 | gate      | —    | 1 | green       | all nine lines green after wave 2; no UNRESOLVED                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | 30ec1db4           |
| 1 | R1        | opus | 2 | findings(2) | prior three resolved; count 3→2, none resurfaced. RULINGS not clean: sources.md:74 [U1] decision #5 — OSV down with no deps.dev `cvss3_score` yields an inferred warn, must unresolve the advisories signal in that case; sources.md:200 [U1] stale signal name "manifest exists" vs signals.md "tag exists". CONTRACT clean                                                                                                                                                                                                                                                                                                                                                                                                                 |                    |
| 2 | gate      | —    | 1 | green       | all nine lines green after wave 2; no UNRESOLVED                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | 30ec1db4           |
| 1 | U1        | opus | 3 | green       | RULINGS residue fixed: no-score advisory with OSV down is now UNRESOLVED across sources.md, signals.md and SKILL.md; "manifest exists" renamed to "tag exists". Review cap reached, no further round. Checker green                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |                    |
| 2 | gate      | —    | 1 | green       | all nine lines green after wave 2; no UNRESOLVED                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | 30ec1db4           |
| 1 | gate      | —    | 1 | green       | all nine lines green after wave 1; no UNRESOLVED in any report                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | 736599c2, 968f3dfe |
| 2 | gate      | —    | 1 | green       | all nine lines green after wave 2; no UNRESOLVED                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | 30ec1db4           |
| 2 | U3        | opus | 1 | green       | five docs edited: stackgen-plugin SKILL.md, .claude/docs/plugins.md, site stackgen.md (skills table, trust section now five checks), site how-to choosing-your-stack.md (one clause), readme.md (one sentence). DECIDED: CLAUDE.md untouched (row enumerates no skills). GAP: none. UNRESOLVED: none. site:check, plugins:check, lint green                                                                                                                                                                                                                                                                                                                                                                                                  |                    |
| 2 | gate      | —    | 1 | green       | all nine lines green after wave 2; no UNRESOLVED                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | 30ec1db4           |
| 2 | R2        | opus | 1 | findings(1) | CONTRACT clean, RULINGS clean. site stackgen.md:918 [U3] skill row says "`@version` or `:tag`" where SKILL.md's Name syntax says a version or ref (`@ref`) — wording                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |                    |
| 2 | gate      | —    | 1 | green       | all nine lines green after wave 2; no UNRESOLVED                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | 30ec1db4           |
| 2 | U3        | opus | 2 | green       | skill row now says "an optional version or ref" with the skill's own three examples; lint green                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |                    |
| 2 | gate      | —    | 1 | green       | all nine lines green after wave 2; no UNRESOLVED                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | 30ec1db4           |
| 2 | R2        | opus | 2 | pass        | prior finding resolved; CONTRACT clean, RULINGS clean                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |                    |
| 2 | gate      | —    | 1 | green       | all nine lines green after wave 2; no UNRESOLVED                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | 30ec1db4           |

| 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
30ec1db4 |

## Launch

| 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
30ec1db4 |

| 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
30ec1db4 | This folder is already committed and pushed on the branch it was
planned on, so | 2 | gate | — | 1 | green | all nine lines green after wave 2;
no UNRESOLVED | 30ec1db4 | the fresh session's worktree — cut from the
integration branch — can see it. | 2 | gate | — | 1 | green | all nine lines
green after wave 2; no UNRESOLVED | 30ec1db4 |

| 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
30ec1db4 | Run in a fresh session: | 2 | gate | — | 1 | green | all nine lines
green after wave 2; no UNRESOLVED | 30ec1db4 |

| 2 | gate | — | 1 | green | all nine lines green after wave 2; no UNRESOLVED |
30ec1db4 | /vwf:change-execute docs/plans/2026-09-14-stack-reputation | 2 | gate
| — | 1 | green | all nine lines green after wave 2; no UNRESOLVED | 30ec1db4 |
