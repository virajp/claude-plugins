---
type: vwf-change-plan
title: tool-config's script gains a template engine, a stackgen.yaml reader and
  a values loader
requires: []
backlog: []
backlog_pieces: []
---

# Plan — tool-config's template engine (2026-10-05)

## Status

**RUNNING**

RUNNING since 2026-10-05 in .worktrees/2026-10-05-tool-config-template-engine

## Consent

| Action                                            | Granted |
| ------------------------------------------------- | ------- |
| Merge to the integration branch and push on green | yes     |
| Release stackgen publicly                         | none    |

No after-landing steps. **Release is none for this plan**: the chain releases
once, after plan 4, when no plan folder is left unarchived. No version bump —
stackgen (`3.0.0`) already sits a major above its last tag (`stackgen-v2.0.0`).

## Goal

tool-config's node script carries a tested, zero-dependency template engine
(`@@NAME@@`, `@@#if@@`, `@@#each@@`), a reader for the constrained
`.config/stackgen.yaml` grammar, and a values loader that turns that file plus
the repo's `origin` into the names a template reads. Nothing calls them yet.

**Plan 1 of the four-plan chain** agreed 2026-10-05 — tool-config becomes a
template-based system:

1. `2026-10-05-tool-config-template-engine` — this plan
2. `2026-10-05-tool-config-templates` — the script rewrite, `assets/` +
   `templates/`, the new mise layout, universal supersets, `…:all` subtask
   tasks, the packs' `tool-config:` retirement, checker rules 11 and 15
3. `2026-10-05-vwf-callers-on-templates` — init, setup, doctor and the
   materializer on the new model
4. `2026-10-05-reshape-migration` — old-layout repos migrated through
   `/vwf:setup reshape`

The interview that produced the chain ran in one session, 2026-10-04/05. Its
rulings that bind this plan are D1–D8 below; the rest are the later plans'. The
user's words on the engine, verbatim: *"Does node have any template engine that
can be used ? considering it may require some dependency it's ok to build a
simply template engine using delimiters which don't conflict with `mise`
template system"*.

No reversal in this plan: it adds modules and touches no existing behaviour. The
reversals the chain makes ("no second template tree", marked positions, lock
records, exact dev pins) are plan 2's and plan 3's.

## Facts the survey established

- **Script tree** — `plugins/stackgen/skills/tool-config/scripts/`:
  `tool-config.mjs` (1191 lines) plus
  `lib/{blocks,cli,drift,record,rows,run,schema}.mjs` and
  `lib/tools/{dprint,exclude,gitleaks,grype,index,mise,pre-commit}.mjs`, ~9.7k
  lines, zero npm dependencies (checker rule 16: `scripts/src/check.ts:270-316`
  — `node:` or relative imports only, shebang and executable bit on
  `scripts/*.mjs` entries only; `lib/*.mjs` are modules, no shebang).
- **No general YAML parser exists.** Narrow readers: `lib/schema.mjs:466-661`
  (pack.yaml: `scalar`, `stripComment`, `splitFlow`, `flowMapping`,
  `topLevelBlock`) and `lib/record.mjs:33-290` (the lock shape). Plan 2 deletes
  both files; the new reader must not import from them — copy and adapt what
  helps.
- **Origin → forge links** — `lib/tools/pre-commit.mjs:693` `forgeLinks` derives
  the commit/issue URL bases from `git remote get-url origin`. Plan 2 deletes
  that file too; the values loader re-implements the derivation, not imports it.
- **Tests** — vitest, `vitest.config.mts` at the root includes
  `{installer,scripts}/src/**/*.test.ts`, 30s timeout; existing suites
  `scripts/src/tool-config-{core,gates,mise}.test.ts` import the `.mjs` modules
  directly and drive the script with temp repos. No `p:scripts:*` task: the gate
  calls `pnpm vitest run` and `pnpm exec tsc --noEmit -p scripts`.
- **Commit convention** — `.config/git-conventional-commits.yaml`: types `ops`,
  `docs`, `merge`, `feat`, `fix`, `refactor`; no scopes.
- **mise templating** — mise's own config uses Tera `{{ … }}` and `{% … %}`
  (e.g. `dir = "{{exec(command='git rev-parse --show-toplevel')}}"`), so the
  engine's delimiters must never be `{{`/`{%`; bash and TOML use `${…}`, so JS
  template literals are out too.
- **Docs that mention the script layout** —
  `.claude/skills/stackgen-plugin/SKILL.md:32-36`.

## Assumed decisions — confirm or override at review

| #   | Decision                  | Ruling                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Rejected                                                                                      | Unit     |
| --- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | -------- |
| D1  | Engine syntax             | `@@NAME@@` substitutes a value; names are `UPPER_SNAKE` (`[A-Z][A-Z0-9_]*`). `@@#if NAME@@ … @@#else@@ … @@/if@@` — true when the value is boolean `true`, a non-empty string or a non-empty list; `#else` optional. `@@#each NAME@@ … @@/each@@` loops a list; inside, `@@.@@` is the item of a list of strings, `@@.key@@` a field of a list of mappings. Blocks nest.                                                                                | values-only engine (list shapes in JS); an npm engine (rule 16); `{{ }}` (collides with Tera) | U1       |
| D2  | Strictness                | An unknown name is an error, never an empty string. A leftover `@@` after rendering is an error. No escaping — `@@` never appears legitimately in a rendered file. An unbalanced or mismatched block tag is an error naming the line.                                                                                                                                                                                                                   | unknown renders empty; an escape sequence                                                     | U1       |
| D3  | Standalone tag lines      | A line holding only one block tag (`@@#if X@@`, `@@#else@@`, `@@/if@@`, `@@#each L@@`, `@@/each@@`), optionally indented, is removed whole, newline included. An inline tag removes only itself.                                                                                                                                                                                                                                                        | tags leave blank lines                                                                        | U1       |
| D4  | Raw insertion             | Values are inserted raw; the template supplies quoting (`"@@REPO_NAME@@"`). The engine refuses a scalar value holding a line break, a control character, or a Unicode line/paragraph separator. A list or mapping substituted with `@@NAME@@` (not iterated) is an error.                                                                                                                                                                               | per-format auto-quoting                                                                       | U1, U2   |
| D5  | Where values live         | `.config/stackgen.yaml` owns every value tool-config renders. Forge and secrets move there from `.config/vwf.yaml` (plan 3); `update_bot` retires with renovate; `members` is the one deliberate copy of `vwf.yaml`'s topology, written by init, checked by doctor (plan 3). Each repo and each member has its own file.                                                                                                                                | values in both files; renderer reads `vwf.yaml` (stackgen would depend on vwf)                | U2       |
| D6  | File shape and names      | Keys: `format` (int, 1), `repo_name`, `merge_model.develop`, `merge_model.main`, `members` (list), `scopes` (list), `node` (bool), `external` (bool), `forge`, `secrets`, `packs.<slug>.<key>`. A key maps to a name by upper-casing and joining nested keys with `_` (`merge_model.develop` → `MERGE_MODEL_DEVELOP`). A pack's template sees `packs.<slug>.*` unprefixed (`XCODE_VERSION`) plus the global names; a clash between the two is an error. | —                                                                                             | U2       |
| D7  | Derived, never stored     | `REPO_URL` (`https://<host>/<owner>/<repo>`) and `PROJECT_NAME` (`<owner>/<repo>`) are derived from `git remote get-url origin` at load time (ssh and https forms); with no `origin`, both are absent, and a template guards them with `@@#if REPO_URL@@`. The `…:all` subtask lists are plan 2's, derived from files.                                                                                                                                  | stored in the file (goes stale when the remote moves)                                         | U2       |
| D8  | Reader grammar            | Block mappings (2-space indent), plain/single/double-quoted scalars, booleans `true`/`false`, integers, block lists (`- x`) and flow lists (`[a, b]`) of scalars, `#` comments, blank lines. Anchors, aliases, tags, multi-line scalars, flow mappings and lists of mappings are refused with an error naming the line.                                                                                                                                 | a general YAML parser                                                                         | U2       |
| D9  | Review row                | One `review` row: the plan lands runnable code (two script modules).                                                                                                                                                                                                                                                                                                                                                                                    | wave review only                                                                              | R        |
| D10 | No bump, no release       | stackgen 3.0.0 is already a major above `stackgen-v2.0.0`; the modules change nothing a user sees; the chain releases after plan 4. No after-landing step.                                                                                                                                                                                                                                                                                              | `p:plugins:local` after landing (nothing to stage)                                            | U4       |
| D11 | Cancellations at hand-off | At this plan's hand-off, in its commit: empty `backlog:` in `2026-10-02-graphify-report-ignored/index.md` (B84 stays open for plan 2); archive `2026-10-01-tool-config-script-hygiene`, `2026-10-01-tool-config-script-init` and `2026-10-02-graphify-report-ignored` through `plan-management archive`; re-point `2026-10-02-fnox-dev-only`'s `requires:` and index row to `docs/plans/2026-10-05-reshape-migration`.                                  | cancelling when plan 2 is approved (the queue could pick hygiene first)                       | hand-off |

## New dependencies

none.

## Units

| Id | Wave | Unit file                                    | Kind   | Owns                                                                                                                                                               | Depends on | Status  | Commit   |
| -- | ---- | -------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------- | ------- | -------- |
| U1 | 1    | [01-engine.md](01-engine.md)                 | edit   | `plugins/stackgen/skills/tool-config/scripts/lib/template.mjs`, `scripts/src/tool-config-template.test.ts`                                                         | —          | green   | 7f7f6920 |
| U2 | 1    | [02-values.md](02-values.md)                 | edit   | `plugins/stackgen/skills/tool-config/scripts/lib/yaml.mjs`, `plugins/stackgen/skills/tool-config/scripts/lib/values.mjs`, `scripts/src/tool-config-values.test.ts` | —          | pending |          |
| R  | 2    | [03-review.md](03-review.md)                 | review | —                                                                                                                                                                  | U1, U2     | pending |          |
| U3 | 3    | [04-docs.md](04-docs.md)                     | edit   | `.claude/skills/stackgen-plugin/**`, `readme.md`, `CLAUDE.md`, `.claude/docs/**`, `site/src/content/docs/**`                                                       | R          | pending |          |
| U4 | 4    | [05-gates-and-bump.md](05-gates-and-bump.md) | edit   | gate only — no version file changes (D10)                                                                                                                          | U3         | pending |          |

## Shared-file rule

| File                                   | Why it collides                                                     | Owner                    |
| -------------------------------------- | ------------------------------------------------------------------- | ------------------------ |
| `plugins/*/.claude-plugin/plugin.json` | version files                                                       | gates-and-bump unit only |
| `.claude-plugin/marketplace.json`      | generated                                                           | gates-and-bump unit only |
| every human-facing doc                 | n units editing one doc                                             | docs unit only           |
| `vitest.config.mts`                    | both test files are picked up by its glob already — nobody edits it | none                     |

## Waves

- **Wave 1** — U1 and U2: disjoint files, no import between them (`values.mjs`
  never imports `template.mjs`; U2's value-safety check is its own).
- **Wave 2** — R reviews both.
- **Wave 3** — U3 docs. **Wave 4** — U4 final gate.

## Wave gate

Every line runs with `MISE_ENV=dev` exported:

- `mise run p:plugins:marketplace -- --check`
- `mise run p:plugins:inventory -- --check`
- `mise run p:plugins:check`
- `pnpm vitest run`
- `pnpm exec tsc --noEmit -p scripts`
- `mise run code:precommit`

plus the wave review, plus every report read for `UNRESOLVED:`.

## After landing

none.

## Gates the orchestrator keeps

none — every claim is a unit test.

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

- Calling the engine from `tool-config.mjs`, converting any asset, the new mise
  layout — plan 2.
- Writing `.config/stackgen.yaml` from init or setup, moving forge and secrets
  out of `vwf.yaml` — plan 3.
- A general-purpose YAML parser — D8.

## Parked

Raised in the interview, owned by the chained plans:

- Plan 2: `npm.package_manager = "pnpm"` in `_base` contradicts memory
  `mise-experiments-must-isolate-home` ("never ship project-level
  npm.package_manager") — the user put it in `_base` deliberately; name it a
  reversal there. `task.run_auto_install = true` reverses
  `docs/memory/decisions/2026-09-26-mise-conf-d-layout.md:38-40`. The mise
  local-file ignore (`2026-09-27-mise-local-files-ignored-by-name.md:32-33`)
  must match nested `conf.d/<owner>/` folders. dprint 0.58+ exclude patterns
  need the `../X` + `**/X` pair with `includes: ["../**"]`. The claude-code
  pack's mise `add-plugin` entry
  (`stacks/design-tool/claude-code/pack.yaml:19-24`) has no home in the conf.d
  model. The doppler pack's entries vs the fnox plan's retirement of it.
  Containers `wrangler.jsonc` trailing commas (B74).
- Plan 3: the "shaped" signal once lock records are gone (setup
  `SKILL.md:108-113`, init's mode detection); the `update_bot` axis retiring
  across `vwf.yaml`; the `setup:ai` pack-plugin route
  (`2026-10-03-setup-ai-validates-vwf.md:59-65`); doctor's drift check moving
  from the script's `check` to the LLM
  (`doctor/references/stack-checks.md:556-565`).

## Gaps surfaced during execution

- **D2 needs a carve-out** (R1, wave 1) — D2 says an unknown name is an error,
  but D7's `@@#if REPO_URL@@` guard only works if an absent name reads false in
  `#if`. U1 took that reading: absent → false in `#if`, still an error in a
  substitution or `#each`. Side effect: a mistyped name in `#if` reads false
  silently. Non-blocking; for plan 2 to confirm or tighten.
- **`forge` and `secrets` value shape** (U2, wave 1) — D6 gives no type; U2
  typed both as strings. Non-blocking; plan 3 may need a mapping.

## Run log

| Wave | Unit      | Model | Round | Outcome     | Detail                                                                                                                                                                                                                                                                                                                                                                                                           | Commit   |
| ---- | --------- | ----- | ----- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| 0    | preflight | —     | 1     | pass        | wave gate 6/6 green; doctor 0 blocking (repo not onboarded — no `.config/vwf.yaml`); format check skipped — no `covers:`; conventions skipped — no `code` unit; order U1,U2 → R → U3 → U4                                                                                                                                                                                                                        |          |
| 1    | U1        | opus  | 1     | green       | 61 cases green. DECIDED: unknown name in `#if` is false (D7 guard), substitution/`#each` still error; `#if`/`#each` take `.`/`.key`; tab + C1 refused. GAP: number in `#if` taken as true                                                                                                                                                                                                                        |          |
| 1    | U2        | opus  | 1     | green       | 68 tests green. DECIDED: no null (empty list is `[]`); only space/tab trimmed so U+2028 reaches D4; escapes limited to `\"` `\\`; `format` required; no file → origin names only; origin paths ≥2 segments, host lowercased; C1 refused. GAP: `forge`/`secrets` typed as strings — plan 3 may need a mapping                                                                                                     |          |
| 1    | R1        | opus  | 1     | findings(5) | RULINGS: U1 departed D1 — a number is truthy in `#if` → loop to U1. Not a departure: unknown name in `#if` reads false (only reading that makes D7's guard work; D2's text needs a carve-out — gap). U2 extra exports `ValuesError`/`STACKGEN_PATH` accepted (needed for errors naming the key). `forge`/`secrets` typing — U2's gap. Docs: `.claude/skills/stackgen-plugin/SKILL.md:36-37` → U3. CONTRACT clean |          |
| 1    | U1        | opus  | 2     | green       | R1 loop-back: number is false in `#if` per D1's closed truth set; 62 cases green                                                                                                                                                                                                                                                                                                                                 |          |
| 1    | R1        | opus  | 2     | pass        | D1 now matched exactly; CONTRACT clean, RULINGS clean                                                                                                                                                                                                                                                                                                                                                            |          |
| 1    | gate      | —     | 1     | red         | `code:precommit` lint: `template.mjs:28` no-control-regex [U1]; `values.mjs:176` no-control-regex, `yaml.mjs:181` no-irregular-whitespace [U2]; the other 5 lines green                                                                                                                                                                                                                                          |          |
| 1    | U1        | opus  | 3     | green       | gate loop-back: control regex replaced by a code-point check, same refusals, no disable comment; 62 green                                                                                                                                                                                                                                                                                                        | 7f7f6920 |
| 1    | U2        | opus  | 2     | green       | gate loop-back: D4 regex → code-point check; BOM strip via `charCodeAt(0) === 0xfeff` (Write had turned the escape literal); 68 green                                                                                                                                                                                                                                                                            |          |

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the fresh session's worktree — cut from the integration branch — can see it.

Run in a fresh session, whichever kind the plan is:

/vwf:execute docs/plans/2026-10-05-tool-config-template-engine

or let the queue pick it, by priority:

/vwf:execute next
