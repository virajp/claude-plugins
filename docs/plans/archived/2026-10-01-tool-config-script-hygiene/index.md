---
type: vwf-change-plan
title: tool-config's hygiene tools move onto the script — git, graphify,
  renovate; the string grammar retires
requires: [ docs/plans/2026-10-01-tool-config-script-gates ]
backlog: []
backlog_pieces: []
---

# Plan — tool-config's hygiene tools move onto the script (2026-10-01)

## Status

**ARCHIVED**

ARCHIVED 2026-10-05 — not run; was APPROVED (superseded by the tool-config
template chain, docs/plans/2026-10-05-tool-config-template-engine)

## Consent

| Action                                            | Granted |
| ------------------------------------------------- | ------- |
| Merge to the integration branch and push on green | yes     |
| After landing: `mise run p:plugins:local`         | run     |
| After landing: `/vwf:backlog close B79`           | run     |
| Release stackgen publicly                         | major   |
| Release vwf publicly                              | minor   |
| Release site publicly                             | patch   |

**The mode recorded here is the consent.** A `run` step runs on a green landing
without a prompt. The staged plugins are picked up only by a **restarted**
session.

**Release rows are intent, not authorisation** — the chain releases at its end.
The chain's bump rule: **bump a project once per level since its last release**;
packs too. stackgen, vwf and site are expected to be above their released tags
already → no bump; each pack this plan edits takes one patch unless plans 0–2
already bumped it. Commands, when a bump is needed: edit
`plugins/{stackgen,vwf}/.claude-plugin/plugin.json` then
`mise run p:plugins:marketplace`; `mise run p:site:version` (bare, first, on a
clean tree); pack `version:` lines plus bundle pins then
`mise run p:plugins:inventory`.

## Goal

git, graphify and renovate are configured by tool-config's node script, with the
`.gitignore` templates vendored in the plugin — no network at shaping time.
Every pack `tool-config:` entry is structured YAML and the checker's string
grammar is gone. vwf writes `.gitignore` and `.graphifyignore` only through
tool-config. The LLM relays rows and makes `needs-edit` changes only.

**Plan 3 of the five-plan chain** agreed 2026-10-01. Requires plan 2. Supersedes
B79 — its four items are met here and the item is closed as superseded after
landing. Also meets B80 items 3 and 4 (B80 itself closes at plan 4).

**Reversals**, written as decision docs by H10:

- `docs/memory/decisions/2026-09-27-tool-config-hygiene.md` — templates fetched
  from github/gitignore at shaping time, pinned per repo by commit SHA plus a
  `written:` hash, moved by `upgrade`. Now: vendored in the plugin, refreshed by
  a repo task here, moved by a stackgen release.
- vwf's direct writers of `.graphifyignore`
  (`plugins/vwf/assets/graphify.md:54-85`, setup) and of `.gitignore` (setup's
  memory tree, mockups, blueprint's screen review, git-workflow's worktree
  setup). Now: through `graphify add-ignore` and `git add-ignore`, as a `vwf`
  block.

## Facts the survey established

(`TC` = `plugins/stackgen/skills/tool-config`; line numbers pre-chain.)

- **git** (`TC/references/git.md`, 274 lines; `TC/assets/git/.gitignore` 55,
  `.gitattributes` 23): `all` lands a `git` block of seven banner sections
  (asset `.gitignore:4,12,18,27,36,46,50`) and the attributes block; reads no
  keys (`:49`). Verbs: `add ignore <pattern> …`, `add ignore template=<Name>`,
  `add attribute <pattern> <attr> …`, `remove` (`:53-84`). Written order, never
  sorted (`:88-92`); no-doubling (`:94-106`, the normalisation B79 item 1
  faults); block content rules (`:108-116`); conflict rows — secret re-include
  (`:118-124`), re-ignore (`:126-131`); lock-file lines (`:133-149`, reworded by
  plan 1); templates (§4 `:157-246`: `ls-remote` + raw fetch at a SHA,
  `written:` hash, `upgrade` moves SHAs — owned by `mise upgrade`, which plan 1
  made pins-only, so the bump has no owner today); template table `:198-205`;
  language mapping `:211-234`; fallback `:236-242`; migration §5 `:248-274`.
- **graphify** (`TC/references/graphify.md`, 61 lines): `all` lands
  `.graphifyignore` with a `graphify` block (`graphify-out/`) and asks git for
  `graphify-out/* !graphify-out/GRAPH_REPORT.md for graphify` (`:18-39`); only
  verb `remove`. A second writer: `plugins/vwf/assets/graphify.md:54-85`
  (vwf-standard excludes `docs/memory/`, `docs/plans/archived/`,
  `docs/prompts/`, `archived/`), written by setup
  (`setup/references/onboard-pipeline.md:36-38`, `migrate-pipeline.md:24-26`,
  `setup/SKILL.md:325-328`) outside any block.
- **renovate** (`TC/references/renovate.md`, 66 lines;
  `TC/assets/renovate/renovate.json`): lands whole only on
  `update_bot=renovate`; yield rule over 13 alternative spellings plus a
  `package.json` `renovate` key (`:46-54`); the pre-commit manager
  (`renovate.json:8-10`) lacks a match for `.config/pre-commit-config.yaml` (B80
  item 3).
- **String entries left after plans 1–2 — 12, all git, in 10 packs**
  (`plugins/stackgen/stacks/`): `package-manager/pnpm:16` (template Node), `:17`
  (attribute `pnpm-lock.yaml linguist-generated`); `package-manager/uv:15`
  (Python); `package-manager/pub:12` (Dart); `package-manager/swiftpm:23`
  (Swift), `:24` (attribute `Package.resolved linguist-generated`);
  `language/typescript:50` (Node); `language/swift:31` (Swift);
  `app-framework/flutter:70` (`template=Flutter` — the SDK repo's file, B79 item
  2); `app-framework/swiftui:102` (Swift); `capability-provider/fnox:20` (ignore
  `fnox.local.toml`); `capability-provider/doppler:23` (ignore `.doppler/`).
  Prose naming the git verb strings:
  `plugins/stackgen/assets/pack-format.md:256`,
  `package-manager/swiftpm/conventions.md:35`.
- **init's fallback**: `plugins/vwf/skills/init/references/new-repo.md:288-318`
  (call `:293-296`, "covered means landed here" `:310-316`, propose-don't-guess
  `:316-318`); `init/SKILL.md:388-392,886`. Nothing removes the
  `gitignore:<Name>` block once a pack asks for the template (B79 item 3).
- **B79 item 4 ambiguities**: banner-section end (`git.md:253-262`), order of
  no-doubling vs conflict rows (`:94` vs `:118-131`), blank line between
  template and pack lines (`:108-109`), whether the comment-run drop
  (`:112-114`) removes a template's header.
- **vwf's other loose `.gitignore` writers**:
  `setup/references/memory-tree.md:12-17` (the `# ==== vwf memory ====` banner,
  B80 item 4), `plugins/vwf/skills/mockups/SKILL.md:73`,
  `plugins/vwf/skills/blueprint/references/screen-review.md:9`,
  `plugins/vwf/skills/git-workflow/references/worktree-setup.md:44`.
- **doctor**: baseline reads the git and graphify records
  (`doctor/references/stack-checks.md:286-296`), a provider's `.gitignore` block
  (`:505-508`), template blocks by `written:` (`:552-563`, replaced by `check`
  in plan 1); `code-intelligence.md:36-46` (`.graphifyignore` with the vwf
  excludes, merge driver, raw hooks).
- **check.ts string grammar** (today's lines): `packFactFaults` string gate
  `:637-652` (the `declared` set from `mise add env` `:638,648-649` feeds the
  `machine_env` check `:670-674`); `TOOL_CONFIG_SCOPE`/`VALUE` `:687-690`;
  `TOOL_CONFIG_VERBS` `:692-704`; git rows of `TOOL_CONFIG_GATE_VERBS`
  `:736-744`; `TOOL_CONFIG_FOR` `:747,777-788`; `toolConfigCall` `:761-825`.
  `isStringList` (`:975`) and `TOOL_CONFIG_ROOT_FILES` (`:345-356`) stay. Tests
  `check.test.ts:785-834`; `checks.md:172-190`. No template-name check exists
  (B78 item 13), and nothing refuses `gitignore:<Name>` in a pack list (B78 item
  2).
- **Docs**: `readme.md:299-300,306`; `.claude/docs/plugins.md:13`;
  `.claude/skills/stackgen-plugin/SKILL.md:102-103,180-181,188,208-209,224,260-266`;
  `.claude/skills/plugin-authoring/references/checks.md:137,146,172-190`;
  `site/src/content/docs/plugins/stackgen.md:349-350,507-513,602,607,649,729-777,815,829-830,839,882,947`;
  `installer/src/graphify.ts:59` (a comment naming the post-commit hook).

## Assumed decisions — confirm or override at review

| #   | Decision               | Ruling                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Rejected                                        | Unit           |
| --- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- | -------------- |
| H1  | Templates vendored     | The `.gitignore` templates (Node, Python, Dart, Swift, Go, Rust) are vendored under `TC/templates/gitignore/<Name>.gitignore`, each with its upstream github/gitignore commit SHA in a header line. The script copies them — no network. A repo task `p:plugins:gitignore-templates` refreshes them from upstream; a stackgen release moves them. Per-repo SHA and `written:` records go away; `upgrade` moves no template. They sit outside `assets/`, which the checker treats as a landed repo root. | fetch at a pinned SHA per repo                  | H1, H2, H3, H6 |
| H2  | Flutter                | A Flutter app gets the vendored Dart template plus the flutter pack's own `add-ignore` patterns for what a Flutter app generates, researched through Context7 at run time and recorded in the pack.                                                                                                                                                                                                                                                                                                     | pack-owned list only; Dart alone                | H5             |
| H3  | `.graphifyignore`      | One writer: `graphify add-ignore --paths … --for <requester>`; vwf's excludes become a `vwf` block; the base block keeps `graphify-out/`.                                                                                                                                                                                                                                                                                                                                                               | the base block carries vwf's paths; two writers | H1, H3, H7     |
| H4  | vwf `.gitignore` lines | vwf's four loose writers call `git add-ignore … --for vwf` (one `vwf` block); renovate's pre-commit manager matches `.config/pre-commit-config.yaml` (B80 items 3 and 4).                                                                                                                                                                                                                                                                                                                               | leave to plan 4                                 | H2, H7         |
| H5  | No-doubling            | Follows git's semantics: `x` and `**/x` are the same pattern; `/x` is anchored and distinct; a trailing `/` is kept.                                                                                                                                                                                                                                                                                                                                                                                    | today's normalisation                           | H3             |
| H6  | Fallback handover      | When a pack asks for a template init's `gitignore:<Name>` fallback block holds, the template is handed to the pack's block and the fallback block removed.                                                                                                                                                                                                                                                                                                                                              | —                                               | H3, H7         |
| H7  | git.md ambiguities     | Conflict rows are evaluated before no-doubling; one blank line separates template lines from pack patterns; a vendored template's upstream header comment is kept; a banner section ends at the next banner or the block's end.                                                                                                                                                                                                                                                                         | —                                               | H3, H6         |
| H8  | String grammar retired | Every pack entry is structured; `check.ts`'s string path, `for`-suffix grammar and their tests are deleted; template names are validated against the vendored set (covers B78 items 2 and 13; B78 stays open for the rest).                                                                                                                                                                                                                                                                             | keep the string grammar                         | H4, H5, H8     |
| H9  | Migration              | A banner section that matches a vendored template exactly is adopted as that requester's block; anything else is a `needs-edit` row.                                                                                                                                                                                                                                                                                                                                                                    | match by network fetch                          | H3             |
| H10 | Review row             | One `Kind: review` row: runnable code lands (the script, the checker, a repo task).                                                                                                                                                                                                                                                                                                                                                                                                                     | wave review alone                               | H9             |
| H11 | Bumps                  | Once per level since the last release, across the chain; packs too.                                                                                                                                                                                                                                                                                                                                                                                                                                     | every plan bumps                                | H11            |

## New dependencies

None.

## Units

| Id  | Wave | Unit file                                    | Kind   | Owns                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Depends on     | Status  | Commit |
| --- | ---- | -------------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | ------- | ------ |
| H1  | 1    | [01-engine.md](01-engine.md)                 | edit   | `plugins/stackgen/skills/tool-config/scripts/tool-config.mjs`, `plugins/stackgen/skills/tool-config/scripts/lib/*.mjs` (not `lib/tools/`), `scripts/src/tool-config-core.test.ts`                                                                                                                                                                                                                                                                                                                    | —              | pending |        |
| H2  | 1    | [02-templates.md](02-templates.md)           | edit   | `plugins/stackgen/skills/tool-config/assets/{git,graphify,renovate}/**`, `plugins/stackgen/skills/tool-config/templates/gitignore/**` (new), `.config/mise/tasks/p/plugins/gitignore-templates` (new)                                                                                                                                                                                                                                                                                                | —              | pending |        |
| H3  | 2    | [03-tool-modules.md](03-tool-modules.md)     | edit   | `plugins/stackgen/skills/tool-config/scripts/lib/tools/{index,git,graphify,renovate}.mjs`, `scripts/src/tool-config-hygiene.test.ts`, `scripts/src/fixtures/tool-config/hygiene/**`, and for this wave `scripts/src/tool-config-{mise,gates}.test.ts` and `scripts/src/fixtures/tool-config/{mise,gates}/**`                                                                                                                                                                                         | H1, H2         | pending |        |
| H4  | 2    | [04-checker-widen.md](04-checker-widen.md)   | edit   | `scripts/src/check.ts`, `scripts/src/check.test.ts`                                                                                                                                                                                                                                                                                                                                                                                                                                                  | H1             | pending |        |
| H5  | 3    | [05-pack-entries.md](05-pack-entries.md)     | edit   | the git entries of the `tool-config:` list in `plugins/stackgen/stacks/{package-manager/pnpm,package-manager/uv,package-manager/pub,package-manager/swiftpm,language/typescript,language/swift,app-framework/flutter,app-framework/swiftui,capability-provider/fnox,capability-provider/doppler}/pack.yaml`; `plugins/stackgen/stacks/app-framework/flutter/conventions.md`; `plugins/stackgen/stacks/package-manager/swiftpm/conventions.md`; `plugins/stackgen/assets/pack-format.md`              | H4             | pending |        |
| H6  | 3    | [06-stackgen-prose.md](06-stackgen-prose.md) | edit   | `plugins/stackgen/skills/tool-config/SKILL.md`, `plugins/stackgen/skills/tool-config/references/{git,graphify,renovate}.md`, the `upgrade` passage only in `plugins/stackgen/skills/tool-config/references/mise.md`, `plugins/stackgen/skills/stackgen-stack-template/references/materializer.md`                                                                                                                                                                                                    | H3             | pending |        |
| H7  | 3    | [07-vwf-prose.md](07-vwf-prose.md)           | edit   | `plugins/vwf/skills/init/SKILL.md`, `plugins/vwf/skills/init/references/new-repo.md`, `plugins/vwf/skills/setup/SKILL.md`, `plugins/vwf/skills/setup/references/{memory-tree,onboard-pipeline,migrate-pipeline}.md`, `plugins/vwf/assets/graphify.md`, `plugins/vwf/skills/mockups/SKILL.md`, `plugins/vwf/skills/blueprint/references/screen-review.md`, `plugins/vwf/skills/git-workflow/references/worktree-setup.md`, `plugins/vwf/skills/doctor/references/{stack-checks,code-intelligence}.md` | H3             | pending |        |
| H8  | 4    | [08-checker-retire.md](08-checker-retire.md) | edit   | `scripts/src/check.ts`, `scripts/src/check.test.ts`                                                                                                                                                                                                                                                                                                                                                                                                                                                  | H4, H5         | pending |        |
| H9  | 5    | [09-review.md](09-review.md)                 | review | —                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | H2, H3, H8     | pending |        |
| H10 | 6    | [10-docs.md](10-docs.md)                     | edit   | `readme.md`, `CLAUDE.md`, `.claude/docs/**`, `.claude/skills/{stackgen-plugin,vwf-plugin,plugin-authoring}/**`, `site/src/content/docs/**`, `installer/src/graphify.ts` (the comment only), `docs/memory/decisions/2026-10-01-*.md` (new files only)                                                                                                                                                                                                                                                 | H5, H6, H7, H9 | pending |        |
| H11 | 7    | [11-gates-and-bump.md](11-gates-and-bump.md) | edit   | `site/package.json`, `plugins/{stackgen,vwf}/.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, the `version:` line of the 10 packs in H5 and the bundle pins naming them, `plugins/stackgen/stacks/inventory.md`                                                                                                                                                                                                                                                                       | H10            | pending |        |

## Shared-file rule

| File                                                | Why it collides                                      | Owner                 |
| --------------------------------------------------- | ---------------------------------------------------- | --------------------- |
| version files, `marketplace.json`, `inventory.md`   | versions and generated                               | H11 only              |
| the 10 edited `pack.yaml` files                     | H5 rewrites entries; H11 bumps `version:`            | H5 wave 3, H11 wave 7 |
| `scripts/src/check.ts`, `scripts/src/check.test.ts` | H4 widens, H8 retires the string path                | H4 wave 2, H8 wave 4  |
| plans 1–2's suites and fixtures                     | `all` now lands git, graphify and renovate files too | H3 in wave 2          |
| `TC/references/mise.md`                             | the `upgrade` passage no longer moves template SHAs  | H6, that passage only |
| every human-facing doc                              | n units editing one doc                              | H10 only              |

## Waves

- **Wave 1 — H1, H2.** Engine against templates, vendored files and a repo task:
  disjoint trees.
- **Wave 2 — H3, H4.** H3 needs the engine and templates; H4 imports only H1's
  schema. Disjoint paths.
- **Wave 3 — H5, H6, H7.** H5 needs H4 to validate the new entries; H6 and H7
  describe H3's interface. Stacks, stackgen skills, vwf skills — disjoint.
- **Wave 4 — H8**, retiring the string path only once H5 migrated the last
  string entries.
- **Wave 5 — H9**, the review row, after every unit it covers.
- **Wave 6 — H10**, docs. **Wave 7 — H11**, gates and bump.

## Wave gate

Every line runs with `MISE_ENV=dev` exported:

- `mise run p:plugins:marketplace -- --check`
- `mise run p:plugins:inventory -- --check`
- `mise run p:plugins:check`
- `mise run p:plugins:shellcheck`
- `pnpm vitest run`
- `pnpm exec tsc --noEmit -p scripts`
- `mise run code:precommit`
- `mise run p:site:check`

plus the wave review, plus every report read for `UNRESOLVED:`.

## After landing

| Step                       | Mode | Notes                                                                                                                           |
| -------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------- |
| `mise run p:plugins:local` | run  | stages stackgen and vwf into the dev marketplace; a restarted session picks them up                                             |
| `/vwf:backlog close B79`   | run  | reason: `superseded by docs/plans/2026-10-01-tool-config-script-hygiene — items 1–4 met by H5, H2, H6, H7 (templates vendored)` |

## Gates the orchestrator keeps

The **scratch-repo run**, after wave 3 and again after H11: a temporary git
repo, an isolated `HOME` and `MISE_*` directories, the isolated global mise
config setting `trusted_config_paths` to the scratch path, `node` and `mise` on
`PATH`; **network blocked for the script's own work** (the vendored templates
must suffice — `setup:all` may still reach the network to install tools):

1. `all --repo scratch --update-bot renovate --answers <every row ok>` lands
   every tool; `.gitignore` carries the vendored templates it was asked for; no
   `needs-edit` row.
2. The same `preview all` returns **no rows**; `check` reports no drift.
3. `git check-ignore -q packages/web/node_modules/x` succeeds (B79 item 1), and
   `git check-ignore -q graphify-out/GRAPH_REPORT.md` fails.
4. `renovate.json`'s pre-commit manager matches
   `.config/pre-commit-config.yaml`.

## Unit contract

Every unit prompt carries, in order: its ruling quoted from this file, its owned
paths plus "touch nothing outside this list", the facts section, the shared-file
rule, and the return block below. A unit never bumps a version, never runs a
generator, never edits a doc, never adds a dependency this file does not list,
never commits. A unit deletes with plain `rm`, never `git rm` — it stages
nothing. A unit never runs `git checkout`, `git restore` or a formatter's
`--fix` on any path outside its Owns.

A unit returns exactly this block and nothing else — no file contents, no diff:

    CHANGED: <path> — <one line>            (one per file)
    DECIDED: <what> — <why>                 (choices made inside scope, or none)
    DOCS FALSIFIED: <path> — <passage>      (reported, never edited; or none)
    GAP: <what the plan left unspecified and the assumption taken>   (or none)
    UNRESOLVED: <the ruling needed>         (or none)

Keep the block under 1,500 characters.

## Out of scope

- B78's other items (pack gitignore requester checks beyond H8, the init asset
  allowlist, secret negation guard) — B78 stays open.
- B80's items other than 3 and 4 — plan 4.

## Parked

- Plan 4: `vwf:init`'s mise steps scripted — bootstrap, the `_default` slot,
  existing-repo passes 3, 4, 5, 8 and 9 — and B80's remaining items (1, 2, 5–9).
  Closes B80 as superseded.
- `/release` once plans 0–4 have all landed.

## Run log

| Wave | Unit | Model | Round | Outcome | Detail | Commit |
| ---- | ---- | ----- | ----- | ------- | ------ | ------ |

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the fresh session's worktree — cut from the integration branch — can see it.

Run in a fresh session:

/vwf:execute docs/plans/2026-10-01-tool-config-script-hygiene

or let the queue pick it, by priority:

/vwf:execute next
