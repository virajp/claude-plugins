---
type: vwf-change-plan
title: comment trim — shipped config and task files, and this repo's own
  tooling, keep only the comments a tool reads plus one-line warnings
requires: [ docs/plans/2026-09-27-dash-names-and-mise-ignores ]
backlog: [ B65 ]
backlog_pieces: []
---

# Plan — comment trim (2026-09-28)

## Status

**APPROVED**

APPROVED 2026-09-28 by the user

## Consent

| Action                                            | Granted                                                                                                                                                                                                                                                                                       |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Merge to the integration branch and push on green | yes                                                                                                                                                                                                                                                                                           |
| After landing: `mise run p:plugins:local`         | run                                                                                                                                                                                                                                                                                           |
| Release stackgen publicly                         | patch if `stackgen-v2.0.0` is tagged when the run starts (`2.0.0` → `2.0.1`, by editing `plugins/stackgen/.claude-plugin/plugin.json`), else none — rides the unreleased `2.0.0`; no release step. Each edited pack takes a patch bump unless already bumped since the last `stackgen-v*` tag |
| Release vwf publicly                              | none — untouched                                                                                                                                                                                                                                                                              |
| Release site publicly                             | none — not this time                                                                                                                                                                                                                                                                          |

**The mode recorded here is the consent.** A `run` step runs on a green landing
without a prompt; an `ask` step stops the run once before it, reports what it
would do, and waits. The mode is the interview's answer (item 17), and a release
step recorded `run` is authorised by the interview's release question (item 18)
— a release recorded `ask`, or with no step at all, is intent, not
authorisation. Where a step stages something this session already loaded, it is
picked up only by a **restarted** session.

## Goal

After this lands, every config and task file stackgen ships — the
`stackgen:tool-config` assets, every pack's `config/` payload and hook scripts —
and this repo's own repo-only tooling carry only the comments a tool or skill
reads, plus a one-line warning where a reader would otherwise break something
non-obvious. Every longer explanation lives in the owning reference, or is gone
because the reference already said it. The authoring doctrine states the rule,
so the next plan that edits a payload does not grow the essays back.

Framing: B65 — "Reduce the amount of comments that are written across mise and
other tool/config files … trim to what is load-bearing." Every plan since
2026-09-26 ruled "added comments are one line; trimming is B65"; this is that
item coming due. No reversal.

## Facts the survey established

- **Volume** (a comment line is one whose first non-space character is `#`, or
  `//` in JSON/JSONC/`.mjs`; shebangs, `#MISE`/`#USAGE` and block markers not
  counted):
  - tool-config assets (`plugins/stackgen/skills/tool-config/assets/**`): 58
    files, 3697 lines, 1328 comment lines (36%). Worst:
    `mise/.config/mise/conf.d/tools.toml` 49 of 52 (48 lines explain one pin),
    `conf.d/env.toml` 53/63, `mise.toml` 60/86, `mise.ci.toml` 25/29,
    `grype/.config/grype.yaml` 35/40, `gitleaks/.config/gitleaks.toml` 38/52,
    `pre-commit/.config/linter.yaml` 50/61, `pre-commit-config.yaml` 63/240,
    `tasks/_scripts/merge` 97/345, `tasks/setup/ai` 89/200,
    `tasks/_scripts/helpers` 67/147. `dprint.json` (both) and `renovate.json`
    carry none.
  - pack payloads (`plugins/stackgen/stacks/*/*/config/**`): 60 files, 3989
    lines, 1551 comment lines (39%). Per pack (total/comment): swiftui 804/266,
    swift 530/179, containers 276/159, workers-ssr 232/156, pnpm 391/135,
    workers-static-assets 190/119, flutter 356/118, astro 154/69, ruff 209/56,
    html 128/56, eslint 151/52, uv 116/51, fnox 80/41, tsconfig 82/31, swiftlint
    65/20, analysis-options 47/18, swift-format 129/17, doppler 49/8. Worst: the
    three `wrangler.jsonc` (68–84%), the swift/swiftui `code/lint` and
    `code/format`, the three `p/_project/deploy` and two `p/_project/icons`.
  - pack hooks: `capability-provider/fnox/hooks/fnox-ciphertext-guard.sh`
    131/39, `package-manager/pnpm/hooks/npm-normalize.sh` 89/24,
    `pnpm/hooks/hooks.yaml` 12/4.
  - this repo: 86 files, 5902 lines, 1854 comment lines (31%). Repo-only
    offenders: `.config/mise/tasks/p/plugins/shellcheck` 76/179,
    `p/plugins/marketplace` 50/61 (a 46-line header), `p/plugins/local`,
    `_scripts/local` 58/181, `p/i/test` 52/184, `pnpm-workspace.yaml` 55/74,
    `mempalace.yaml` 52/119, `.github/workflows/*` 159/481.
- **Byte-identical duplicates**: `code/format` in `language/swift` and
  `app-framework/swiftui`; `p/_project/icons` in `framework/astro` and
  `framework/html`. `code/lint` is near-identical between swift and swiftui.
  Both units that own such a pair are U3 (swift/swiftui) and U2 (astro/html), so
  each pair stays identical within one unit.
- **Repeated boilerplate**: "helpers ships with stackgen:tool-config, not this
  pack, so there is no path here for -x to follow." sits above a
  `# shellcheck source=/dev/null` directive in **40 pack files**; a stale
  "helpers ships in the toolchain-manager pack…" variant is in 7 of this repo's
  landed copies (out of scope). Others: "This task is also the repo's linting
  HOOK…" (~6 lines, 7 `code/lint` files), "This task is what the `format`
  pre-commit hook calls…" (6 files), "The toolchain manager's two shipped
  defaults…" (7 files), "THIS FILE SHIPS UNDER `p/_project/` AND MUST BE
  RENAMED…" (~14 lines, the 3 deploys and 2 icons).
- **Comments a tool or skill reads — never removed:**
  - `#MISE` / `#USAGE` lines (mise's parser;
    `task.disable_spec_from_run_scripts` makes them the only usage source) and
    shebang lines (`scripts/src/check.ts`
    `PACK_TASK_SHEBANGS`/`PACK_HOOK_SHEBANGS`, and shellcheck's dialect).
  - `# shellcheck …` directives (123; 104 are `source=/dev/null`).
  - tool-config block markers `# >>> <requester>` / `# <<< <requester>` and the
    JSONC `// >>>` / `// <<<` form (tool-config `SKILL.md:152-189`).
  - `MARKED POSITION` comment lines — doctor finds each marked position by that
    comment block before its second drift test
    (`plugins/vwf/skills/doctor/references/stack-checks.md:524-532`), init fills
    them (`plugins/vwf/skills/init/references/new-repo.md:468-475`), and
    `tool-config/references/mise.md:285-300` writes a marked value directly
    below its comment. Present in tool-config `mise.toml`, `conf.d/env.toml`,
    `tasks/setup/ai`, `pre-commit/.config/git-conventional-commits.yaml`, the
    three `wrangler.jsonc`, the three `deploy` and the two `icons`. The marker
    line and whatever a filler needs to identify the value stay; explanatory
    paragraphs after it are prose.
  - grype ignore-reason comments — one unit with their entry
    (`tool-config/references/grype.md:46-62`).
  - commented-out templates a skill fills in and uncomments:
    `git-conventional-commits.yaml:30,80` (scopes, origin URLs), the gitleaks
    custom-rule template (`references/gitleaks.md:22`).
  - comments a reference names as load-bearing: the comment naming the mise
    release `env_conf_d` was tested on, above `min_version`
    (`references/mise.md:254-260`); the plugin-list template comments "so a
    later run can re-derive them" (`references/mise.md:364-366`); `#USAGE flag`
    lines' anchor comment in `tasks/setup/all` (`references/mise.md:344-347`); a
    trailing `# retired` on a kept scope (`references/pre-commit.md:143-145`);
    `#` comment lines serving as markers inside the `(?x)` exclude regex
    (`references/pre-commit.md:187`); the `.gitignore` banner names, which the
    retired-hygiene migration matches by name (`references/git.md:231-243`).
    Before removing any comment in a tool-config asset, grep its reference for
    what it says about that file's comments.
- **What trimming does to already-shaped repos.** tool-config's drift rule
  (`SKILL.md:273-276`) compares words outside quoted strings and does not skip
  comments, so a trimmed block shows as one drift row — doctor
  (`stack-checks.md:553-567`) or the next `tool-config`/init run — and the repo
  takes the new text; `.gitignore` comments are not compared
  (`references/git.md:236`). A trimmed pack payload shows as "pack moved" to
  `stackgen-sync` (`skills/stackgen-sync/SKILL.md:51-60`). A file's **frame** —
  its leading comment run up to the first blank line — is written on create and
  never compared (`SKILL.md:203-205`), so shaped repos keep their old frames
  (decision 5). A comment-only payload change still patch-bumps its pack so
  doctor does not report unexplained drift
  (`docs/memory/decisions/2026-09-13-init-walks-the-members.md:154-160`).
- **Nothing in the checker asserts comment text.** `scripts/src/check.ts` strips
  JSONC comments (`:1010-1014`) and `(?x)` regex comments (`:1960`) before
  parsing; rule 13 (`checkLandedCitations`, `:1350`) forbids
  `${CLAUDE_PLUGIN_ROOT}` in any landed file, comments included, and trimming
  can only reduce hits; `checkRetiredVocabulary` (`:2611`) scans YAML comments.
  `inventory.ts` reads no payload content.
- **Formatting.** `plugins/*/stacks/*/*/config/` is excluded from this repo's
  dprint because it is payload: format a payload file only with the **shipped**
  config
  (`plugins/stackgen/skills/tool-config/assets/dprint/.config/dprint.json`),
  never this repo's. `p:plugins:shellcheck` runs `shellcheck -x` and
  `shfmt -d -i 2 -ci` over the pack and tool-config task trees; its own header
  (`.config/mise/tasks/p/plugins/shellcheck:40-48`) holds one load-bearing
  sentence — keep its flags in step with the shipped `code:format` hook.
- **This repo's landed copies** — every `.config/**` file whose path also exists
  under a tool-config `assets/<tool>/` tree or a pack's `config/` tree (18 of
  the 32 asset task files differ from their copies), plus the root `.gitignore`
  — are out of scope (decision 1). **Repo-only** files are the rest of
  `.config/**` (for example `tasks/p/**`, `tasks/_scripts/local`),
  `.github/workflows/**`, `mempalace.yaml` and `pnpm-workspace.yaml`.
- **vwf** ships no config or task file under this scope:
  `skills/init/assets/hygiene/` holds Markdown only (licenses,
  `CONTRIBUTING.md`, `SECURITY.md`).
- **Doctrine today**: no rule tells an author to write explanatory comments into
  a config or task file. `.claude/skills/plugin-authoring/SKILL.md` is the
  authoring skill that auto-applies under `plugins/`;
  `plugins/stackgen/assets/pack-format.md` (`:445-456` restates the
  cite-nothing-by-path rule) is the pack authoring contract.
- **Versions**: stackgen `2.0.0` unreleased (latest tag `stackgen-v1.33.0`). A
  pack bump re-pins every bundle naming it (`pack-format.md:438-444`) and
  regenerates `stacks/inventory.md` (`mise run p:plugins:inventory`). Packs with
  `config/` payloads: flutter, swiftui, doppler, fnox, containers, workers-ssr,
  workers-static-assets, astro, html, swift, pnpm, uv, analysis-options, eslint,
  ruff, swift-format, swiftlint, tsconfig.
- **Commit convention** (`.config/git-conventional-commits.yaml`): `ops`,
  `docs`, `merge`, `feat`, `fix`, `refactor`; no scopes.

## Assumed decisions — confirm or override at review

| # | Decision                         | Ruling                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Rejected                                                                    | Unit           |
| - | -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | -------------- |
| 1 | Scope                            | The shipped files — tool-config assets, pack payloads and pack hooks — plus this repo's repo-only tooling. This repo's landed copies of the assets and its root `.gitignore` wait for the next `/vwf:setup reshape` (gate-hardening B6)                                                                                                                                                                                                                                                                                                                                                 | Shipped only; everything, including hand-trimming this repo's landed copies | U1, U2, U3, U4 |
| 2 | One plan or several              | One plan, one unit per tree, finishing B65                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Three chained plans                                                         | all            |
| 3 | The trim rule                    | Keep every comment a tool or skill reads: `#MISE`/`#USAGE`, shebangs, `# shellcheck` directives, `# >>>`/`# <<<` markers, `MARKED POSITION` lines, grype reason comments, fill-in templates, and any comment a reference names as load-bearing. Keep a single-line warning where a reader would otherwise break something non-obvious. Every longer explanation goes: dropped when the owning reference already says it, moved into that reference (tool-config `references/*.md`, the pack's `conventions.md`) when it does not. Repeated boilerplate goes; a directive under it stays | Machine-read comments only; a size cap per comment block                    | U1, U2, U3, U4 |
| 4 | Keeping it from growing back     | The rule is written into the `plugin-authoring` skill and stackgen's `pack-format.md`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Also a `p:plugins:check` rule capping comment blocks; nothing               | U5             |
| 5 | Frames in shaped repos           | Accepted: tool-config writes a frame on create and never compares it, so shaped repos keep their old frames; parked                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Teach tool-config to refresh a frame                                        | —              |
| 6 | Proof that only comments changed | After each wave, the orchestrator compares every touched file before and after with comment and blank lines stripped; the diff must be empty. No review row                                                                                                                                                                                                                                                                                                                                                                                                                             | A review row; both                                                          | all            |
| 7 | vwf                              | Untouched — its init hygiene assets are Markdown only, with no config comments                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | A vwf unit                                                                  | —              |

## New dependencies

none

## Units

| Id | Wave | Unit file                                      | Kind | Owns                                                                                                                                                                                                                                                          | Depends on         | Status  | Commit |
| -- | ---- | ---------------------------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ | ------- | ------ |
| U1 | 1    | [01-tool-config.md](01-tool-config.md)         | edit | `plugins/stackgen/skills/tool-config/assets/**`, `plugins/stackgen/skills/tool-config/references/**`                                                                                                                                                          | —                  | pending |        |
| U2 | 1    | [02-packs-services.md](02-packs-services.md)   | edit | under `plugins/stackgen/stacks/{cloud-service,framework,capability-provider}/*/`: `config/**`, `hooks/**`, `conventions.md`                                                                                                                                   | —                  | pending |        |
| U3 | 1    | [03-packs-languages.md](03-packs-languages.md) | edit | under `plugins/stackgen/stacks/{language,app-framework,package-manager,toolchain-gate}/*/`: `config/**`, `hooks/**`, `conventions.md`                                                                                                                         | —                  | pending |        |
| U4 | 1    | [04-this-repo.md](04-this-repo.md)             | edit | this repo's repo-only files: every `.config/**` file with no shipped counterpart at the same path, `.github/workflows/**`, `mempalace.yaml`, `pnpm-workspace.yaml`                                                                                            | —                  | pending |        |
| U5 | 1    | [05-doctrine.md](05-doctrine.md)               | edit | `.claude/skills/plugin-authoring/**`, `plugins/stackgen/assets/pack-format.md`                                                                                                                                                                                | —                  | pending |        |
| U6 | 2    | [06-docs.md](06-docs.md)                       | edit | `site/src/content/docs/**`, `.claude/**` except `.claude/skills/plugin-authoring/**`, `CLAUDE.md`, `readme.md`                                                                                                                                                | U1, U2, U3, U4, U5 | pending |        |
| U7 | 3    | [07-gates-and-bump.md](07-gates-and-bump.md)   | edit | the `version:` line of every pack `pack.yaml` U2 or U3 changed, those packs' bundle pins under `plugins/stackgen/stacks/bundles/**`, `plugins/stackgen/stacks/inventory.md`, `plugins/stackgen/.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json` | U6                 | pending |        |

Status is one of `pending`, `running`, `green`, `failed`, `unresolved`,
`skipped`.

## Shared-file rule

| File                                                                     | Why it collides                                                       | Owner                           |
| ------------------------------------------------------------------------ | --------------------------------------------------------------------- | ------------------------------- |
| every pack `pack.yaml`                                                   | U2/U3 never touch it; U7 bumps `version:`                             | U7 only                         |
| bundle pins, `stacks/inventory.md`, `plugin.json`, `marketplace.json`    | version-derived or generated; regenerating mid-wave races             | U7 only                         |
| `site/**`, `CLAUDE.md`, `readme.md`, `.claude/**` (not plugin-authoring) | human-facing docs                                                     | U6 only                         |
| tool-config `references/**`                                              | receives the explanations moved out of assets                         | U1 only                         |
| each pack's `conventions.md`                                             | receives the explanations moved out of that pack's payload            | the unit owning that pack       |
| `.config/mise/tasks/p/plugins/shellcheck`                                | repo-only; its flags must stay in step with the shipped `code:format` | U4 (text only, never the flags) |

## Waves

- **Wave 1 — U1, U2, U3, U4, U5.** Disjoint trees: tool-config's skill tree; the
  service/framework/capability packs; the language/app/package/gate packs; this
  repo's repo-only files; the two doctrine files. No unit reads another's output
  — each moves explanations only into its own references.
- **Wave 2 — U6.** Runs `vwf:docs-sync` over the delta once every trim has
  landed.
- **Wave 3 — U7.** Bumps what the consent block names, regenerates, passes the
  full gate.

## Wave gate

```text
mise run p:plugins:marketplace -- --check
mise run p:plugins:inventory -- --check
mise run p:plugins:check
mise run p:plugins:shellcheck
mise run p:plugins:npm-normalize-test
mise run p:site:check
```

plus the wave review, plus every report read for `UNRESOLVED:`. Every line here
must be green before wave 1 — a check that holds only once a unit has landed
belongs in that unit's **Verification**, not here.

## After landing

| Step                       | Mode | Notes                                                                      |
| -------------------------- | ---- | -------------------------------------------------------------------------- |
| `mise run p:plugins:local` | run  | stages stackgen on this machine; picked up by a **restarted** session only |

## Gates the orchestrator keeps

**The comment-stripped diff** (decision 6), after wave 1 and after wave 3. For
every file the wave changed, other than `.md` files, compare the version at the
wave's base with the version after, each passed through the same filter: drop
blank lines, and drop lines whose first non-space characters are `#` — or `//`
in `.json`, `.jsonc` and `.mjs` files — **unless** the line is a shebang, a
`#MISE` or `#USAGE` line, a `# shellcheck` directive, or a `# >>>`/`# <<<` (or
`// >>>`/`// <<<`) marker; then trim trailing whitespace and drop a trailing
`# …` inline comment only where the file is shell, TOML or YAML and the `#` is
preceded by whitespace and outside quotes. **Pass:** every filtered pair is
identical. A difference is routed to the unit that owns the file as a failed
check naming the line. The kept kinds are compared too, so a lost directive or
marker also fails. `MARKED POSITION` lines are `#`-comments and are filtered;
their survival is each owning unit's own Verification.

## Unit contract

Every unit prompt carries, in order: its ruling quoted from this file, its owned
paths plus "touch nothing outside this list", the facts section, the shared-file
rule, and the return block below. A unit never bumps a version, never runs a
generator, never edits a doc, never adds a dependency this file does not list,
never commits. A unit deletes with plain `rm`, never `git rm` — it stages
nothing. A unit never runs `git checkout`, `git restore` or a formatter's
`--fix` over a path outside its Owns.

A unit returns exactly this block and nothing else — no file contents, no diff:

    CHANGED: <path> — <one line>            (one per file)
    DECIDED: <what> — <why>                 (choices made inside scope, or none)
    DOCS FALSIFIED: <path> — <passage>      (reported, never edited; or none)
    GAP: <what the plan left unspecified and the assumption taken>   (or none)
    UNRESOLVED: <the ruling needed>         (or none)

A unit whose file list is long returns one `CHANGED:` line per **directory**
with a file count, not one per file.

A `GAP:` is a hole in the plan the unit could proceed past on a stated
assumption; it is recorded and the run continues. An `UNRESOLVED:` is a ruling
the unit could not proceed without; it blocks the unit and its dependents.

## Out of scope

- **This repo's landed copies** of tool-config assets and pack payloads under
  `.config/**`, and the root `.gitignore` — declined (decision 1): the next
  `/vwf:setup reshape` re-lands them trimmed. This includes the 7 files carrying
  the stale "helpers ships in the toolchain-manager pack…" sentence.
- **A `p:plugins:check` rule** capping comment blocks — declined (decision 4).
- **Refreshing frames in shaped repos** — declined (decision 5).
- **Comments in code** — `scripts/src/**`, `installer/src/**`, `site/src/**`,
  pack `skills/**` scripts such as `design-tool/*/skills/**/serve.mjs`, and
  vwf's plugin hooks. B65 is about config and task files.
- **Markdown** anywhere — prose docs are not comments.

## Parked

- tool-config writes a file's frame (its leading comment run up to the first
  blank line) on create and never compares it afterwards
  (`plugins/stackgen/skills/tool-config/SKILL.md:203-205`), so a trimmed frame
  never reaches a repo shaped before this plan. A frame-refresh rule — compare
  the shipped frame, offer a drift row — would carry it; not planned.
- This repo's landed copies get trimmed at the next `/vwf:setup reshape`.

## Run log

| Wave | Unit | Model | Round | Outcome | Detail | Commit |
| ---- | ---- | ----- | ----- | ------- | ------ | ------ |

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the fresh session's worktree — cut from the integration branch — can see it.

Run in a fresh session, whichever kind the plan is:

/vwf:execute docs/plans/2026-09-28-comment-trim

or let the queue pick it, by priority:

/vwf:execute next
