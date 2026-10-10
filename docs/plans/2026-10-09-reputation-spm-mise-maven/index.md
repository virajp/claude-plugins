---
type: vwf-change-plan
title: Reputation for SwiftPM, mise and Maven names
requires: [ docs/plans/2026-10-09-android-device-features ]
backlog: [ B60 ]
backlog_pieces: []
---

# Plan — Reputation for SwiftPM, mise and Maven names (2026-10-09)

## Status

**COMPLETE**

COMPLETE 2026-10-10 — 9f7ba469 5803fd53 910401c2

## Consent

| Action                                            | Granted |
| ------------------------------------------------- | ------- |
| Merge to the integration branch and push on green | yes     |
| End an `all` run after landing                    | no      |

There is no After landing row: `.config/vwf.yaml`'s `after_landing:` already
lists `mise run p:plugins:local`, and `/vwf:execute` runs it after every green
landing. A restarted session loads the staged stackgen. The End an `all` run row
is `no`: the plans in the queue edit files only and do not call the reputation
skill during a run, so the stale copy has no effect on them.

## Release levels

| Project  | Level | Reason                                                                          |
| -------- | ----- | ------------------------------------------------------------------------------- |
| stackgen | MINOR | new behaviour: `spm:`, `mise:` and `maven:` names get a verdict; more is vetted |
| site     | PATCH | the manual pages list the new prefixes; the site gets no new feature            |

## Goal

`stackgen-reputation` returns a `pass`, `warn` or `block` verdict for SwiftPM
packages, for every mise backend, and for Maven and Gradle names — none of them
comes back `UNRESOLVED` for want of an ecosystem — and the stackgen generator
names, prefixes and vets those names in what it generates. This finishes backlog
item B60, which the Swift chain parked on 2026-09-23 and the Kotlin plan widened
to Maven and Gradle names on 2026-10-09.

One reversal inside the interview: the user first accepted "no Go, Cargo, NuGet
or RubyGems" as a non-goal, then asked that every mise backend be supported. So
those four ecosystems are in scope, reachable only through `mise:` (R5, R6). No
standing decision doc is reversed.

## Facts the survey established

- The skill: `plugins/stackgen/skills/stackgen-reputation/SKILL.md` (163 lines)
  plus `references/sources.md` and `references/signals.md`. No script, no
  version of its own.
  - Frontmatter `:3-8` (the description lists npm, PyPI, pub.dev, Action,
    image), `:9` the argument hint, `:10-11` `disable-model-invocation: false`
    and `model: sonnet`. Body `:16-24` names what it vets.
  - `:39` the output column table, `ecosystem` one of five.
  - `:49-52` the name grammar; `:54-67` version and ref syntax, the image host
    rule; `:68-74` the `lang=` default map (typescript and javascript to npm,
    python to pypi, dart to pub, else `UNRESOLVED: no ecosystem for <name>`);
    `:78-80` "the five" prefixes, any other is `UNRESOLVED`; `:81-90` the closed
    source list; `:95-98` the verdict rule (any block, else any warn, else pass;
    `unavailable` adds nothing); `:101-115` the offline rule; `:133` and `:140`
    the return-shape enum; `:141-145` the unresolved row.
  - `references/sources.md:3-11` every row verified against Context7, never
    typed from memory; `:25-28` deps.dev also covers Go, Cargo, Maven, NuGet and
    RubyGems "which this skill does not yet address"; `:53-82` OSV by id only
    (no POST); `:152-180` the `github` source used by `action:`; `:208-229` "Not
    verified — and therefore not here".
  - `references/signals.md:20-45` the package table with an Ecosystems column,
    `:47-54` near-name candidates, `:56-68` actions, `:70-78` images; `:22` and
    `:38` the ecosystem cells.
- The generator:
  `plugins/stackgen/skills/stackgen-stack-template/references/generator.md:105-121`
  defines a concrete name (mise tools, runner-invoked tools, MCP commands,
  actions, images), lists the five prefixes at `:110-112` and "always writes the
  prefix", and halts on `UNRESOLVED` at `:112-121` and `:28-32`. No table maps a
  name to a prefix; the model picks it.
- `plugins/stackgen/assets/artifact-doctrine.md` section 6, `:205-236`: concrete
  name `:209-212`, the prefix list `:216-217`, the `UNRESOLVED` rule `:227`,
  shipped packs exempt `:231`.
- `plugins/stackgen/skills/stackgen-sync/SKILL.md:155` re-checks every emitted
  name on a re-sync.
- `plugins/stackgen/agents/stackgen-skill-reviewer.md:20-21`, `:105` reads the
  verdict table offline; a name with no row or a `block` row is a gap. It does
  not change (R2).
- Nobody passes `lang=` today; the default map is dormant.
- Nothing automated covers the skill: no test, fixture or eval; `check.ts` rule
  9 deliberately skips it. Changing it breaks no gate.
- mise 2026.10.5 lists 20 backends: aqua, asdf, cargo, conda, core, dotnet,
  forgejo, gem, github, gitlab, go, npm, packslip, pypi, spinel, spm, http, s3,
  ubi, vfox. This repo's own templates still write the older `pipx:` name. The
  command `mise registry swiftlint` prints `aqua:realm/SwiftLint` and
  `asdf:mise-plugins/mise-swiftlint`.
- Names packs carry today, all exempt: `aqua:realm/SwiftLint`
  (`toolchain-gate/swiftlint`), `github:detekt/detekt`
  (`toolchain-gate/detekt`), `http:kotlin-lsp` (`language/kotlin`),
  `npm:sort-package-json` (`package-manager/pnpm`), `pipx:mempalace` and
  `pipx:graphifyy` (tool-config).
- Docs the change falsifies (the docs unit owns them):
  `site/src/content/docs/plugins/stackgen.md:217`, `:224`, `:1402` (the full
  prefix list), `:1412`, `:1450-1473`;
  `site/src/content/docs/how-to/operate/choosing-your-stack.md:202`;
  `readme.md:280-285`; `.claude/skills/stackgen-plugin/SKILL.md:25-30`,
  `:105-112`, `:396`; `.claude/docs/plugins.md:13`.
- History, not edited: the archived plans, the Swift decisions doc
  (`docs/memory/decisions/2026-09-23-swift-native-stack.md:121-123`), the Kotlin
  plan folder (`docs/plans/2026-10-09-kotlin-language-stack/index.md:110-111`,
  `:236`) and `docs/memory/handoff/next.md`.
- Versions: stackgen `plugins/stackgen/.claude-plugin/plugin.json`. No unit
  bumps it; `/vwf:execute` records the levels.
- Commit types allowed (`.config/git-conventional-commits.yaml`): `ops`, `docs`,
  `merge`, `feat`, `fix`, `refactor`; no scopes.

## Assumed decisions — confirm or override at review

| #   | Decision       | Ruling                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Rejected                                                                                   | Unit   |
| --- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ------ |
| R1  | Ecosystems     | The skill gains three prefixes: `spm:`, `mise:` and `maven:`. `maven:` covers Maven coordinates and Gradle plugin ids. This plan finishes B60                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | `spm:` and `mise:` only; a separate `gradle:` prefix on the Plugin Portal                  | U1, U2 |
| R2  | Non-goals      | Names in shipped packs stay exempt. No top-level Go, Cargo, NuGet or RubyGems prefix. The offline `stackgen-skill-reviewer` agent does not change                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | add Go and Cargo; a shipped-pack audit                                                     | U1, U2 |
| R3  | spm syntax     | `spm:<host>/<owner>/<repo>@<version>`, the host mandatory as for `image:`. On `github.com` the name gets every `github` source signal plus the deps.dev project Scorecard, the route `action:` takes, with the version checked against the repo's tags. On any other host it gets the syntactic signals only and `exists` is `unavailable`, so it warns at most                                                                                                                                                                                                                                                                                                                     | `spm:<owner>/<repo>`, GitHub only; the full git URL from `Package.swift`                   | U1     |
| R4  | mise syntax    | `mise:<backend>:<path>[@<version>]`, the full backend form only. A short registry name (`mise:swiftlint`) is `UNRESOLVED`; the generator expands it first                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | the skill resolves short names from mise's registry file; no `mise:` prefix                | U1, U2 |
| R5  | mise backends  | The backend decides the checks. `core`: first-party, pass when the name is a mise core tool. `aqua`, `github`, `ubi`: the GitHub repo checks plus the Scorecard. `npm`: the npm checks. `pypi` and `pipx`: the PyPI checks. `spm`: the spm checks. `cargo`, `go`, `gem`, `dotnet`: the deps.dev systems cargo, go, rubygems, nuget. `asdf`, `vfox`: the GitHub repo checks on the plugin repo when the path is `owner/repo`, else syntactic only. `gitlab`, `forgejo`, `conda`, `http`, `s3`, `packslip`, `spinel`: syntactic signals only, `exists` `unavailable`, warn at most. No mise backend is `UNRESOLVED`; a backend mise adds later is syntactic only until a plan maps it | `http:` warns and the rest halt; every unknown backend warns; every unknown backend blocks | U1     |
| R6  | Prefix surface | The cargo, go, rubygems and nuget checks are reachable only as `mise:cargo:…`, `mise:go:…`, `mise:gem:…`, `mise:dotnet:…`. The top-level prefixes are `npm`, `pypi`, `pub`, `action`, `image`, `spm`, `maven`, `mise`                                                                                                                                                                                                                                                                                                                                                                                                                                                               | also add `cargo:`, `go:`, `gem:`, `nuget:` at the top level                                | U1     |
| R7  | Maven          | `maven:<group>:<artifact>@<version>`, through the deps.dev `maven` system. A Gradle plugin id is written as its marker coordinate, `maven:<id>:<id>.gradle.plugin@<version>`. A deps.dev 404 is repository-aware: for groups under `androidx.`, `com.android.` and `com.google.android.`, and for plugin markers, `exists` is `unavailable` — unless the Context7 check shows deps.dev indexes that repository. A 404 on any other name still blocks                                                                                                                                                                                                                                | add Google Maven and Plugin Portal sources; any 404 blocks                                 | U1     |
| R8  | Verification   | Every new endpoint and every new deps.dev system row is verified against Context7 before it is written, per the `sources.md` header rule. A row Context7 cannot confirm is not written: it goes under "Not verified" and its signal is `unavailable` — never `UNRESOLVED` for the ecosystem                                                                                                                                                                                                                                                                                                                                                                                         | —                                                                                          | U1     |
| R9  | Generator      | A concrete name now also covers each `Package.swift` dependency (`spm:`) and each Maven dependency or Gradle plugin in a build file (`maven:`). Every mise tool is written as `mise:<backend>:<path>`, the same as its toml key, after a short name is expanded with `mise registry <name>` (its first backend). The skill's `lang=` map gains swift to `spm`, and kotlin and java to `maven`                                                                                                                                                                                                                                                                                       | keep `npm:`/`pypi:` for mise tools; prefixes only, no widening                             | U1, U2 |
| R10 | Review         | No review row: the plan edits Markdown only and lands no runnable code                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | a review row                                                                               | —      |
| R11 | Order          | `requires: 2026-10-09-android-device-features`, so the plan runs after the B57 and B58 chain and never conflicts in `stackgen.md`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | require nothing (priority 10)                                                              | —      |
| R12 | Smoke run      | The gates unit runs the edited skill over a fixed name set (listed in its file). Pass: each name has a verdict, no row is `UNRESOLVED` for a missing ecosystem, and the androidx name does not block                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | the wave review only                                                                       | U4     |
| R13 | Decisions doc  | The docs unit writes `docs/memory/decisions/2026-10-09-reputation-spm-mise-maven.md` with R1 to R9                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | —                                                                                          | U3     |

## New dependencies

None.

## Units

| Id | Wave | Unit file                          | Kind | Owns                                                                                                                                                                                                                               | Depends on | Status | Commit   |
| -- | ---- | ---------------------------------- | ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------ | -------- |
| U1 | 1    | [01-skill.md](01-skill.md)         | edit | `plugins/stackgen/skills/stackgen-reputation/**`                                                                                                                                                                                   | —          | green  | 9f7ba469 |
| U2 | 1    | [02-generator.md](02-generator.md) | edit | `plugins/stackgen/skills/stackgen-stack-template/references/generator.md`, `plugins/stackgen/assets/artifact-doctrine.md`, `plugins/stackgen/skills/stackgen-sync/SKILL.md`                                                        | —          | green  | 5803fd53 |
| U3 | 2    | [03-docs.md](03-docs.md)           | edit | `site/src/content/docs/**`, `readme.md`, `.claude/skills/stackgen-plugin/**`, `.claude/docs/plugins.md`, `docs/memory/decisions/2026-10-09-reputation-spm-mise-maven.md`, and any other human-facing passage `vwf:docs-sync` finds | U1, U2     | green  | 910401c2 |
| U4 | 3    | [04-gates.md](04-gates.md)         | edit | none                                                                                                                                                                                                                               | U3         | green  | —        |

Status is one of `pending`, `running`, `green`, `failed`, `unresolved`,
`skipped`.

## Shared-file rule

| File                                                                      | Why it collides                             | Owner            |
| ------------------------------------------------------------------------- | ------------------------------------------- | ---------------- |
| `plugins/*/.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json` | version files and a generated file; no bump | nobody — never   |
| `.config/releases.yaml`                                                   | written by `/vwf:execute` at landing        | nobody in a unit |
| the human-facing docs                                                     | n units editing one doc                     | U3 only          |

## Waves

- **Wave 1 — U1, U2.** Disjoint files. U2 writes the prefix grammar from the
  rulings R1 to R9, never from U1's output, so neither waits on the other.
- **Wave 2 — U3.** Docs, over both.
- **Wave 3 — U4.** Gates and the smoke run.

## Wave gate

Every line runs with `MISE_ENV=dev` exported:

```text
mise run p:plugins:marketplace -- --check
mise run p:plugins:inventory -- --check
mise run p:plugins:check
pnpm vitest run
pnpm exec tsc --noEmit -p scripts
mise run code:precommit
mise run p:site:check
```

plus the wave review, plus every report read for `UNRESOLVED:`.

## After landing

none — `.config/vwf.yaml`'s `after_landing:` runs `mise run p:plugins:local`.

## Gates the orchestrator keeps

- The smoke run of R12, done by U4 over the worktree's skill files. Pass: the U4
  report lists one row per name with a `verdict:`, no row reads
  `UNRESOLVED: no ecosystem` or names an unknown prefix, and
  `maven:androidx.core:core-ktx` is not `block`. A row `UNRESOLVED` because a
  source was unreachable is reported, not failed — re-run once.

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

- **Vetting the names shipped packs carry** — they stay exempt, curated by hand
  (R2).
- **Top-level `cargo:`, `go:`, `gem:`, `nuget:` prefixes** — reachable through
  `mise:` only (R6).
- **The `stackgen-skill-reviewer` agent** — offline, it reads the verdict table
  and needs no prefix knowledge (R2).
- **Short mise names inside the skill** — the generator expands them (R4).
- **History** — archived plans, the Swift decisions doc, the Kotlin plan folder
  and the handoff file keep their wording.

## Parked

- B51: top-level `cargo:`, `go:`, `gem:` and `nuget:` prefixes over the deps.dev
  rows this plan adds, when the Rust and Go packs need them.
- Google Maven (`maven.google.com`) and the Gradle Plugin Portal as verified
  sources, so androidx names and plugin markers get a true `exists` signal.
- The audit mode over shipped packs, parked by the 2026-09-14 stack-reputation
  plan.

## Run log

| Wave | Unit       | Model | Round | Outcome               | Detail                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Commit |
| ---- | ---------- | ----- | ----- | --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 0    | preflight  | —     | 1     | green                 | doctor blocking predicates clear (mise, graphify CLI, graph in main checkout); edit units only, so no LSP read and no conventions fetch; no covers, so format check, acceptance, ux and reconcile stamps skipped; all 7 wave gate lines green — the mise lines run with MISE_TASK_RUN_AUTO_INSTALL, MISE_AUTO_INSTALL, MISE_EXEC_AUTO_INSTALL and MISE_NOT_FOUND_AUTO_INSTALL set false, since mise auto-installing pipx:mempalace 3.10.0 on python 3.15 fails (no onnxruntime cp315 wheel) — a machine fact, not the tree's                                                                                                                         |        |
| 0    | override   | —     | —     | applied               | override: shared worktree: all-2026-10-10-0934; skip as deduped: mise run p:plugins:local                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |        |
| 0    | order      | —     | —     | planned               | wave 1: U1, U2 (edit, dispatched together); wave 2: U3 (docs); wave 3: U4 (gates and smoke run); no review row (R10)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |        |
| 1    | U1         | opus  | 1     | green                 | SKILL.md eight prefixes, spm/maven/mise grammar, lang= map, R5 backend table, backend: field on mise rows; sources.md deps.dev maven/cargo/go/rubygems/nuget rows (Context7 /google/deps.dev), mise-core list of 13 tools (/jdx/mise 2026-10-10); signals.md maven 404 rule, spm and mise sections; DECIDED: a maven 404 always blocks, since deps.dev's Context7 docs list Google Maven and the Gradle Plugins repository as sources (R7's own exception clause); a core path off the list and an aqua repo 404 warn; GAP: Context7 does not confirm the lowercase deps.dev system path or %3A encoding of the colon — assumed, as the npm row does |        |
| 1    | U2         | opus  | 1     | green                 | generator.md step 4 widened (Package.swift, Maven/Gradle names), eight R6 prefixes plus a name-to-prefix table and the mise registry expansion rule; artifact-doctrine.md §6 matched; DECIDED: stackgen-sync SKILL.md:155 and generator.md:28-32 unchanged (no prefix list); an MCP command takes its runner's registry prefix (npx npm:, uvx pypi:); pre-commit run on owned files only                                                                                                                                                                                                                                                             |        |
| 1    | R1         | opus  | 1     | findings(4)           | RULINGS: U1 departed from R5 (aqua repo 404 warns, not the GitHub repo checks' block) signals.md:123; artifact-doctrine.md:225 [U2] colon now introduces the wrong sentence; SKILL.md:25, :102, :173 [U1] ragged hand-fold; signals.md:46-47, :102, :123, SKILL.md:126 [U1] unpadded table rows; cross-unit grammar agrees; R7 maven-404 reading confirmed against Context7                                                                                                                                                                                                                                                                          |        |
| 1    | U2         | opus  | 2     | green                 | artifact-doctrine.md §6: verdict list re-introduced by its own sentence, "Each name comes back as one of three verdicts:", paragraph refolded by hand                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |        |
| 1    | U1         | opus  | 2     | green                 | signals.md:123 mise aqua/github/ubi rows take the action checks, a 404 blocks (R5); the aqua-404-warns DECIDED line withdrawn; SKILL.md :25, :102, :173 refolded; four tables re-padded                                                                                                                                                                                                                                                                                                                                                                                                                                                              |        |
| 1    | R1         | opus  | 2     | findings(1) contested | all four round-1 findings fixed; CONTRACT clean, RULINGS clean; residual at cap 2, contested: generator.md:123 [U2] cross-unit drift — the table writes a mise tool as mise:backend:path with no @version, so the skill warns on every generated mise name and vets the backend's default version; follows R9's "same as its toml key" wording                                                                                                                                                                                                                                                                                                       |        |
| 1    | gate       | —     | 1     | green                 | all 7 wave gate lines green; no UNRESOLVED; U1 committed 9f7ba469, U2 5803fd53                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |        |
| 2    | U3         | opus  | 1     | green                 | docs-sync over 608f6ae9..HEAD found 4 passages, all in Owns; edited stackgen.md (:217, skill row, The names), readme.md, stackgen-plugin SKILL.md; wrote decisions doc R1–R9; DECIDED: mise names described as mise:backend:path, no version rule; plugins.md:13 and choosing-your-stack.md list no prefixes, left alone                                                                                                                                                                                                                                                                                                                             |        |
| 2    | R2         | opus  | 1     | pass                  | FINDINGS 0; CONTRACT clean; RULINGS clean                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |        |
| 2    | gate       | —     | 1     | green                 | all 7 wave gate lines green; no UNRESOLVED                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |        |
| 3    | U4         | opus  | 1     | green                 | all 7 wave gate lines green (vitest 708); smoke: spm swift-snapshot-testing@1.19.6 pass; mise aqua SwiftLint, github detekt, http kotlin-lsp, cargo ripgrep, core java warn (unpinned, plus http exists unavailable and no checksum, cargo no provenance); maven kotlin-stdlib@2.5.0-Beta1, androidx.core:core-ktx@1.19.1, kotlin.jvm plugin marker warn (deps.dev 200, no provenance) — androidx not block; mise:swiftlint UNRESOLVED: no backend (R4, expected); U1's GAP settled — lowercase system path and %3A both work on deps.dev; GAP G1, G2                                                                                                |        |
| 3    | R3         | opus  | 1     | pass                  | FINDINGS 0; CONTRACT clean (no file changed outside the plan folder); RULINGS clean; R12 smoke condition confirmed, deps.dev androidx spot-check 200                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |        |
| 3    | gate       | —     | 1     | green                 | U4's run of all 7 wave gate lines green; no UNRESOLVED                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |        |
| —    | acceptance | —     | —     | skipped               | no covers: — no acceptance criteria                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |        |
| —    | ux         | —     | —     | skipped               | no covers: — no Screens contract                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |        |
| —    | renders    | —     | —     | skipped               | no ux stage ran                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |        |
| —    | reconcile  | —     | —     | skipped               | no covers: (no stamps); edit units only, nothing to persist                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |        |
| —    | reconcile  | —     | 1     | green                 | kept gate, R12 smoke run: one verdict per name, none UNRESOLVED for a missing ecosystem or unknown prefix, androidx.core:core-ktx warn not block                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |        |
| —    | reconcile  | —     | 1     | green                 | final wave gate over the finished tree: all 7 lines green                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |        |
| —    | land       | —     | —     | green                 | consent yes; gaps G1, G2 open, so the folder stays live (no archive); /vwf:backlog done B60 — Done with its Landed line; after landing: mise run p:plugins:local skipped (deduped), deferred to the all loop's exit                                                                                                                                                                                                                                                                                                                                                                                                                                  |        |

## Gaps surfaced during execution

- G1 (U4, smoke run): deps.dev's default version for kotlin-stdlib and the
  kotlin.jvm plugin marker is the prerelease 2.5.0-Beta1; the skill takes the
  registry default, so an unpinned "latest" vets a beta. Assumption: the skill
  is followed as written. Closes with a ruling on whether the default-version
  read skips prereleases.
- G2 (U4, smoke run): the skill does not say what the Scorecard signal is when a
  Maven version has no related project (androidx.core:core-ktx, the plugin
  marker). Assumption: the signal stays silent, adding nothing to the verdict.
  Closes with a ruling in `references/signals.md`.

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the run's worktree — cut from the integration branch — can see it.

Run in a fresh context — a fresh session, or a runner that `all` dispatches —
whichever kind the plan is:

/vwf:execute docs/plans/2026-10-09-reputation-spm-mise-maven

or let the queue pick it, by priority:

/vwf:execute next

or run every runnable plan, highest priority first:

/vwf:execute all
