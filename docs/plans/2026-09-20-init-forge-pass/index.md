---
type: vwf-change-plan
title: init forge pass — visibility, licence, default branch, protection,
  backlog project
requires: []
backlog: [ B28 ]
---

# Plan — init forge pass (2026-09-20)

## Status

**RUNNING**

RUNNING since 2026-09-19T20:44Z in
`/Users/virajpatel/Projects/github.com/virajp/claude-plugins/.worktrees/2026-09-20-init-forge-pass`

## Consent

| Action                                            | Granted                                                                                                                                          |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Merge to the integration branch and push on green | yes                                                                                                                                              |
| After landing: `mise run p:plugins:local`         | run                                                                                                                                              |
| Release vwf publicly                              | minor — `19.35.0` → `19.36.0`, a hand edit of `plugins/vwf/.claude-plugin/plugin.json` then `mise run p:plugins:marketplace`; no release step    |
| Release stackgen publicly                         | patch — `1.20.1` → `1.20.2`, a hand edit of `plugins/stackgen/.claude-plugin/plugin.json` then `mise run p:plugins:marketplace`; no release step |
| Release site publicly                             | patch — `1.1.30` → `1.1.31` via `mise run p:site:version`; no release step                                                                       |
| Release installer publicly                        | none — untouched                                                                                                                                 |

**The mode recorded here is the consent.** A `run` step runs on a green landing
without a prompt; an `ask` step stops the run once before it, reports what it
would do, and waits. The mode is the interview's answer (item 17), and a release
step recorded `run` is authorised by the interview's release question (item 18)
— a release recorded `ask`, or with no step at all, is intent, not
authorisation. Where a step stages something this session already loaded, it is
picked up only by a **restarted** session.

## Goal

After this lands, one `/vwf:init` run leaves every repo of the product with a
visibility decided (public or private), a licence and a security contact that
fit that visibility, `develop` and `main` both existing with the intended one
default on the forge, both branches protected there, and the product's backlog
project existing — asking the user to do by hand only what the forge has no CLI
for. `/vwf:doctor` reads that forge state back as a seventh drift predicate, so
`/vwf:setup` Step 0 and `/vwf:setup reshape` re-offer the pass when it drifts.

Backlog item B28, its first piece. The item's other pieces are parked below, one
folder each, and none of them stands on this one.

**Two reversals, confirmed at the interview.** First: init's git pass may now
**write forge settings** — the default branch and branch protection — through
the forge CLI, on consent. That supersedes the ruling that init reaches no
remote setting and that the default branch is set by hand per the hygiene pack's
`CONTRIBUTING.md`
(`docs/memory/decisions/2026-09-06-init-owns-the-first-commit.md` §forge, and
the D17-superseded passage of
`2026-09-12-task-library-configures-each-gate-once.md`); the by-hand line
survives as the fallback for a forge with no CLI. Second, a widening rather than
a reversal: the backlog skill's missing-project procedure — the browser
hand-over, since the forge's API cannot instantiate the Team planning template
(`2026-09-18-backlog-on-github-projects.md`) — becomes reachable from init as
well as from `/vwf:backlog add`; the skill stays the project's sole owner, and
init never runs `gh project create`. The docs unit writes one decisions doc for
both.

## Facts the survey established

- Init asks seven questions, one round each, all before the plan
  (`plugins/vwf/skills/init/SKILL.md:252-414`): Q1 repo name (new mode), Q2
  project ids — every row editable, free "other" offered (`:290-299`,
  `:319-322`), Q3 brief, Q4 secrets provider, Q5 agent plugins, **Q6 licence** —
  MIT / Apache-2.0 / none, one row per repo (`:401-405`), **Q7 security
  contact** — a URL per repo, default `<origin>/security/advisories/new`,
  decline writes no `SECURITY.md` (`:406-411`;
  `references/readme-and-license.md:64-74`). No visibility question exists
  anywhere in the plugin.
- LICENSE is copied by init from the hygiene pack's private catalogue
  `plugins/stackgen/stacks/repo-hygiene/repo-hygiene/config/_licenses/{MIT,Apache-2.0}.txt`
  (`readme-and-license.md:37-55`; pack `conventions.md:49-52`); an existing
  LICENSE is kept, never replaced (`:48-51`). `SECURITY.md` is the pack's
  template (`config/SECURITY.md:5-6`) with the contact spliced in.
- The git pass (`references/new-repo.md:437-607`, summary `SKILL.md:85-100`;
  existing mode `references/existing-repo.md:827-858`): asks `MERGE_MODEL`
  direct|pr once (`new-repo.md:460-486`); stages what the run wrote; one
  question, three answers — commit / commit + push / leave it (`:510-557`);
  creates whichever of `develop`/`main` is missing (`:21-29`, `:559-583`);
  pushes only on commit + push (`:585-598`). It refuses to touch forge settings:
  `SKILL.md:96`, `:532-535`, `new-repo.md:55-57`.
- Neither init nor setup invokes `gh` or `glab` today. The only forge CLI text
  is the hygiene pack's `config/CONTRIBUTING.md:34-36` — the by-hand
  default-branch line (`gh repo edit --default-branch` /
  `glab repo update --defaultBranch`) — and doctor's recommended forge-CLI probe
  (`plugins/vwf/skills/doctor/references/stack-checks.md:264-280`), which
  already names `/vwf:backlog`. No passage anywhere in the repo says "branch
  protection".
- The backlog skill (`plugins/vwf/skills/backlog/SKILL.md`,
  `references/github.md`): precondition is `gh` on PATH, logged in to the origin
  host, `project` scope; the project is resolved by title from the base repo's
  remote; **only `add` reaches the missing-project procedure** (`github.md`
  §Missing project), every other verb stops with "no backlog project yet".
  GitLab: every verb stops with "not yet supported". The skill never runs
  `gh project create`.
- Doctor's six baseline predicates (`stack-checks.md:284-453`): (a) pack
  versions, (b) ids vs groups/scopes, (c) develop/main pair, (d) REPO_NAME, (e)
  content hash with marked-position splice, (f) MERGE_MODEL/MEMBERS — all drift,
  none blocking, one remedy `/vwf:setup reshape`. Setup Step 0 cites them
  (`plugins/vwf/skills/setup/SKILL.md:92-138`, the words "six predicates" at
  `:107` and `:118`); `reshape` is `:72-90`. Init's re-run doctrine is
  `SKILL.md:552-604`.
- The hygiene pack:
  `plugins/stackgen/stacks/repo-hygiene/repo-hygiene/pack.yaml:5` is `1.1.0`,
  pinned once in `plugins/stackgen/stacks/bundles/repo-hygiene.md:7`, listed at
  `plugins/stackgen/stacks/inventory.md:91` and `:162` (generated by
  `mise run p:plugins:inventory`, which refuses a pin the pack no longer carries
  — pack bump, pin and inventory land in **one commit**). It lands `.gitignore`,
  `.graphifyignore`, `.editorconfig`, `.gitattributes`, `CONTRIBUTING.md`, three
  issue templates, `renovate.json`, its `vscode.d` fragment, `SECURITY.md` only
  when asked, LICENSE by init's copy (`conventions.md:16-26`; placeholders
  `:160-165`; licence and security policy `:167-177`). No CODEOWNERS, no CI
  workflow, no marked position about visibility.
- `p:plugins:check` rule 10 (technology-free vwf prose,
  `scripts/src/check.ts:1390`) does **not** list `gh`, `glab`, `github` or
  `gitlab`; rule 13 refuses a plugin-relative citation in any file a pack lands
  — the hygiene pack's `config/` edits must cite nothing by plugin path.
- `plugins/**/*.md` is not dprint-formatted — match the fold width by hand;
  `plugins/*/stacks/*/*/config/` is payload, excluded from every formatter.
  `readme.md`, `CLAUDE.md` and `site/**` are dprint's.
- Docs describing today's behaviour, every one owned by U5: `readme.md:117`;
  `CLAUDE.md:266`, `:272` ("asks seven questions"), `:280` (MERGE_MODEL), `:295`
  ("six baseline predicates"), `:462`; `.claude/docs/repo-shape.md:283`;
  `.claude/skills/vwf-plugin/SKILL.md:86`, `:103`, `:120`, `:130-134` ("six
  baseline predicates" at `:133`), `:231`;
  `.claude/skills/vwf-plugin/references/skills-and-agents.md:27-28`, `:40`;
  `.claude/skills/vwf-plugin/references/dependencies.md:43`;
  `.claude/skills/stackgen-plugin/SKILL.md:141`, `:167-169`;
  `site/src/content/docs/plugins/vwf.md:811-812`, `:887-891`, `:922`, `:990`,
  `:996` ("Seven questions"), `:1049-1050`, `:1151`, `:1190-1238` (git pass),
  `:1220`, `:1253-1257`, `:1272-1314`, `:1333`, `:2439` (`/vwf:backlog`);
  `site/src/content/docs/plugins/stackgen.md:593-604`, `:741`, `:893`, `:905`;
  `site/src/content/docs/how-to/greenfield/single-repo.md:59-84`,
  `how-to/greenfield/multi-repo.md:54`, `:165`,
  `how-to/brownfield/onboard-existing-codebase.md:84`, `:98`.
- Versions: vwf `19.35.0`, stackgen `1.20.1`, site `1.1.30`, installer
  untouched. Commit types allowed: `ops docs merge feat fix refactor`; no
  scopes. Plan index holds no row → priority 10.
- Standing decisions this plan keeps: Q2's free-typed id path already exists;
  `MERGE_MODEL` stays the one `[env]` marked position the landing model writes;
  init writes one key into `.config/vwf.yaml` (`enforcement.kept_files`) and
  this plan adds none; init never lands a CI workflow; the mempalace and the
  plan index are untouched.

## Assumed decisions — confirm or override at review

| #  | Decision             | Ruling                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Rejected                                                                          | Unit   |
| -- | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ------ |
| 1  | Visibility question  | Q6 becomes **visibility**: one row per repo, `public` / `private`; the default is read from the forge when the repo has an `origin` (`gh repo view --json visibility`, `glab repo view`), else `private`. The licence choice becomes **Q6a**, shown only for a `public` repo, MIT / Apache-2.0 / none as today; a `private` repo gets no licence row and no LICENSE. The count stays seven                                                                                                                           | one visibility for the product; default `public`; keep the licence row on private | U1     |
| 2  | Security contact     | **Q6b** replaces Q7's slot under the same question: a `public` repo keeps the advisory-URL default; a `private` repo is asked a free contact — an email or an internal URL — with no default; decline writes no `SECURITY.md` either way. The pack's `SECURITY.md` template reads naturally with an email as well as a URL                                                                                                                                                                                           | skip the row on a private repo                                                    | U1, U3 |
| 3  | Default branch       | In the forge pass, one row per repo with an `origin`, `develop` preselected, `main` the other; applied with `gh repo edit --default-branch <b>` / `glab repo update --defaultBranch <b>`. The forge is the record — no key in the tree; a repo with no remote gets nothing and the hygiene pack's by-hand line still covers it                                                                                                                                                                                       | default `main`; a `DEFAULT_BRANCH` marked env position beside `MERGE_MODEL`       | U1     |
| 4  | Protection rules     | On both `develop` and `main`, always: **no force-push, no deletion**; when `MERGE_MODEL` is `pr`, additionally **require a pull request** (no approval count). GitHub: one **ruleset** per branch named `vwf-<branch>` through `gh api` (rulesets, not classic protection); GitLab: `protected_branches` through `glab api`; any other forge: print the rules and ask the user to set them. **Idempotent**: a ruleset or protection already present on that branch is left untouched and reported, never merged with | identical rules regardless of `MERGE_MODEL`; overwriting existing protection      | U1     |
| 5  | Forge pass placement | A new step at the **end of the git pass, after the push**, run only for repos whose answer was *commit + push*; *commit* or *leave it* skips the repo and lists it as pending. **One consent for the whole product**, listing per repo what it will set (default branch, the two protections) plus the backlog project for the base. The backlog step runs once, base only, last                                                                                                                                     | a fourth answer on the push question; one consent per action                      | U1     |
| 6  | Backlog project      | init invokes the **backlog skill's missing-project procedure** — the browser hand-over, the title rule, the field bootstrap afterwards — and never `gh project create`; a project already present is reported and skipped. GitLab: the skill's "not yet supported" line is printed and the run continues; another forge: ask the user to create it by hand                                                                                                                                                           | `gh project create` from init                                                     | U1, U4 |
| 7  | Doctor predicate (g) | A seventh baseline predicate, **forge state**: the default branch as chosen, both branches protected, the backlog project present; evaluated per repo when the forge CLI is on PATH and logged in to the origin host, otherwise skipped with a note; drift, not blocking, remedy `/vwf:setup reshape` like the six. Setup Step 0 cites seven                                                                                                                                                                         | no predicate — the forge pass runs on init alone                                  | U2, U4 |
| 8  | Precondition         | The forge pass reuses the backlog skill's precondition shape: CLI on PATH, logged in to the origin host (`gh auth status --hostname <host>` / `glab auth status --hostname <host>`); a miss **reports the reason and falls back to the by-hand list**, never blocks the run. Scope: `gh` needs `repo`; the ruleset call fails without admin on the repo, and that failure is reported the same way                                                                                                                   | a hard stop                                                                       | U1     |
| 9  | Hygiene pack         | `config/CONTRIBUTING.md`'s by-hand default-branch line becomes the fallback — "`/vwf:init` sets this on GitHub and GitLab; elsewhere run …" — and gains the protection rules of decision 4 in the same by-hand form; `config/SECURITY.md` accepts an email; `conventions.md` §licence-and-security records the visibility rule. **Patch** `1.1.0` → `1.1.1`; the bundle pin follows and U3 runs `mise run p:plugins:inventory` so the three land in one commit                                                       | minor; leaving the pack unbumped                                                  | U3     |
| 10 | Review row           | None — every edit is skill prose or a payload template; nothing lands that executes                                                                                                                                                                                                                                                                                                                                                                                                                                  | a `Kind: review` row                                                              | —      |
| 11 | Vocabulary           | The pass is named the **forge pass** everywhere; "forge" is the word the repo already uses for the remote's host. The CLI is named per forge (`gh`, `glab`) only in the init references and the hygiene pack, never in vwf's `SKILL.md` prose beyond what the backlog skill already does                                                                                                                                                                                                                             | "remote settings pass"; naming the CLI in every skill                             | U1–U5  |

## New dependencies

none

## Units

| Id | Wave | Unit file                                          | Kind | Owns                                                                                                                                                                                                                 | Depends on     | Status  | Commit   |
| -- | ---- | -------------------------------------------------- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | ------- | -------- |
| U1 | 1    | [01-init.md](01-init.md)                           | edit | `plugins/vwf/skills/init/SKILL.md`, `plugins/vwf/skills/init/references/new-repo.md`, `plugins/vwf/skills/init/references/existing-repo.md`, `plugins/vwf/skills/init/references/readme-and-license.md`              | —              | green   | 517cca88 |
| U2 | 1    | [02-doctor.md](02-doctor.md)                       | edit | `plugins/vwf/skills/doctor/SKILL.md`, `plugins/vwf/skills/doctor/references/stack-checks.md`                                                                                                                         | —              | green   | 5c6f93db |
| U3 | 1    | [03-hygiene-pack.md](03-hygiene-pack.md)           | edit | `plugins/stackgen/stacks/repo-hygiene/repo-hygiene/**`, `plugins/stackgen/stacks/bundles/repo-hygiene.md`, `plugins/stackgen/stacks/inventory.md`                                                                    | —              | green   | 1db4af49 |
| U4 | 1    | [04-setup-and-backlog.md](04-setup-and-backlog.md) | edit | `plugins/vwf/skills/setup/SKILL.md`, `plugins/vwf/skills/backlog/SKILL.md`, `plugins/vwf/skills/backlog/references/github.md`                                                                                        | —              | green   | f9b13ae0 |
| U5 | 2    | [05-docs.md](05-docs.md)                           | edit | `readme.md`, `CLAUDE.md`, `.claude/docs/repo-shape.md`, `.claude/skills/vwf-plugin/**`, `.claude/skills/stackgen-plugin/SKILL.md`, `site/src/content/docs/**`, `docs/memory/decisions/2026-09-20-init-forge-pass.md` | U1, U2, U3, U4 | pending |          |
| U6 | 3    | [06-gates-and-bump.md](06-gates-and-bump.md)       | edit | `plugins/vwf/.claude-plugin/plugin.json`, `plugins/stackgen/.claude-plugin/plugin.json`, `site/package.json`, `.claude-plugin/marketplace.json`                                                                      | U5             | pending |          |

Status is one of `pending`, `running`, `green`, `failed`, `unresolved`,
`skipped`. Every unit is `edit`: the `edit` units of a wave are dispatched
together and judged by the wave review, the only check this plan runs.

## Shared-file rule

| File                                                                                                         | Why it collides                                          | Owner   |
| ------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------- | ------- |
| `plugins/vwf/.claude-plugin/plugin.json`, `plugins/stackgen/.claude-plugin/plugin.json`, `site/package.json` | version files                                            | U6 only |
| `.claude-plugin/marketplace.json`                                                                            | generated from the two manifests                         | U6 only |
| `plugins/stackgen/stacks/inventory.md`                                                                       | generated; the hygiene pin moves in U3's commit          | U3 only |
| `plugins/stackgen/stacks/repo-hygiene/repo-hygiene/pack.yaml`, `stacks/bundles/repo-hygiene.md`              | pack version and its pin, one commit                     | U3 only |
| every human-facing doc — `readme.md`, `CLAUDE.md`, `.claude/**`, `site/**`, `docs/memory/**`                 | n units would edit one doc                               | U5 only |
| `plugins/vwf/skills/setup/SKILL.md`                                                                          | U1 would name the seventh predicate; U4 owns the wording | U4 only |
| `plugins/vwf/skills/backlog/**`                                                                              | U1 would name the widened procedure; U4 owns the text    | U4 only |

## Waves

- **Wave 1** — U1, U2, U3, U4: four disjoint trees (init, doctor, the hygiene
  pack, setup + backlog); no unit reads another's output, each carries its
  ruling.
- **Wave 2** — U5: the docs, over the branch delta the four left, plus their
  `DOCS FALSIFIED:` lines and the decisions doc.
- **Wave 3** — U6: the three bumps, the marketplace regeneration, the full gate.

## Wave gate

    mise run p:plugins:marketplace -- --check
    mise run p:plugins:inventory -- --check
    mise run p:plugins:check
    mise run code:precommit
    mise run p:site:check

plus the wave review, plus every report read for `UNRESOLVED:`. Every line here
must be green before wave 1.

## After landing

| Step                       | Mode | Notes                                                                                                                                                                                |
| -------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `mise run p:plugins:local` | run  | stages vwf at `19.36.0+N` and stackgen at `1.20.2+N` into the dev marketplace and updates this machine's install; publishes nothing, cuts no tag; a **restarted** session loads them |

## Gates the orchestrator keeps

none beyond the wave gate. A real forge pass needs a scratch repo on the forge
and is left to the user's first `/vwf:setup reshape` on a real product after
landing.

## Unit contract

Every unit prompt carries, in order: its ruling quoted from this file, its owned
paths plus "touch nothing outside this list", the facts section, the shared-file
rule, and the return block below. A unit never bumps a version, never runs a
generator, never edits a doc, never adds a dependency this file does not list,
never commits — with the one exception this plan names: U3 runs
`mise run p:plugins:inventory`, per decision 9. A unit deletes with plain `rm`,
never `git rm` — it stages nothing.

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

- The editor block dedupe, the setup re-run doctrine and the greenfield /
  brownfield rework — B28's other pieces, parked below as their own folders.
- Free-typed project ids — Q2 already offers a free "other" and every row is
  editable (`init/SKILL.md:290-299`, `:319-322`); nothing to build.
- A CI workflow of any kind — init never lands one (standing decision).
- A GitLab backlog backend — the backlog skill says "not yet supported" and init
  repeats it.
- CODEOWNERS, required reviewers, status checks, or any protection beyond the
  two rules and the conditional require-PR of decision 4.
- A scratch-forge run as orchestrator verification — see Gates the orchestrator
  keeps.
- A public release — the three bumps land; the tags wait for the next
  `/release`.

## Parked

- **B28 piece B — editor block dedupe.** Duplicate keys in
  `.vscode/settings.json` / `extensions.json` are the designed algorithm
  (`docs/memory/decisions/2026-09-06-editor-fragments-inside-the-fence.md`:
  block first, a hand key after it wins by later-key precedence), and the
  2026-09-10 plan ruled "dedupe hand keys with an inline disable, don't change
  vwf's algorithm"
  (`docs/plans/archived/2026-09-10-repo-task-groups-and-editor-block/index.md:177-187`).
  Fixing it in init reverses that ruling; owner would be
  `init/references/fragments-and-sections.md:137-213` plus the hygiene pack's
  `vscode.d/repo-hygiene.jsonc`. Open gap to fold in: no existing-repo survey
  pass for `vscode.d` composition
  (`docs/plans/archived/2026-09-14-repo-name-split/index.md:363`).
- **B28 piece C — setup re-run on structural change.** Today: doctor's
  predicates + Step 0 offer + `/vwf:setup reshape`; architecture already invokes
  setup in-session. Decide which other commands invoke setup after a structural
  change (member add/remove, project add, pack bump) and whether a config-side
  drift signal is wanted (the open half of the 2026-09-06 memory note).
- **B28 piece D — greenfield stack detection and brownfield rework.** Mode is
  decided only by absence of `.config/` + the task dir
  (`init/SKILL.md:173-184`); nothing reads `stacks:` on a new repo; brownfield
  already adopts rather than flattens. The request's "config file with contents,
  intelligently update" and "dumping files blindly, causing side effects" need
  the concrete side-effect list before an interview.
- **Q2 discoverability.** If the free-typed id path was not visible in the
  question's rendering, a one-line rewording of Q2's option text.

## Run log

| Wave | Unit                 | Model | Round | Outcome     | Detail                                                                                                                                                                                                                                                                                                                                                                                                                       | Commit   |
| ---- | -------------------- | ----- | ----- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| 0    | preflight            | —     | 1     | pass        | doctor probes green (mise, graphify CLI, graph in main checkout); no .config/vwf.yaml so no LSP/stack read — all units edit; five wave-gate lines green on 1c25e6cd; format check skipped (no covers:); acceptance/ux skipped (no covers:)                                                                                                                                                                                   | —        |
| 1    | U2 doctor            | opus  | 1     | pass        | edit; DECIDED: frontmatter unchanged; existing protection counts by rules not name, require-PR present under direct is no finding. GAP: no tree record of chosen default branch — check is that it is develop or main. DOCS FALSIFIED ×4 handed to U5                                                                                                                                                                        | 5c6f93db |
| 1    | U4 setup-and-backlog | opus  | 1     | pass        | edit; DECIDED: setup names no CLI; init's third-miss on the backlog step reports and continues. DOCS FALSIFIED: none beyond index list. GAP: none                                                                                                                                                                                                                                                                            | f9b13ae0 |
| 1    | U3 hygiene-pack      | opus  | 1     | pass        | edit; pack 1.1.1, pin, inventory regenerated. DECIDED: CONTRIBUTING names /vwf:init literally; landed-files table untouched. GAP: SECURITY.md's REPO_URL token now carries the whole contact (email or URL) — assumed init splices the contact there, needs U1's readme-and-license.md to agree; ISSUE_TEMPLATE/config.yml:8 still hard-codes the advisories URL, left. DOCS FALSIFIED ×2 handed to U5                       | 1db4af49 |
| 1    | U1 init              | opus  | 1     | pass        | edit; DECIDED: seven = seven rounds, Q6 visibility round 6, Q6a+Q6b round 7; GitLab access levels pr=0/30 direct=30/30; GitHub idempotence = vwf-<branch> ruleset or any rule/classic protection on the branch, default branch set regardless; INTERNAL visibility proposes private. GAP: SECURITY.md slot described as 'the one contact slot' not by token; new-repo.md:759 'forge's settings pages' is by-hand prose, kept | 517cca88 |
| 1    | R1                   | opus  | 1     | findings(8) | review; 3 unit findings → U2 (weak-protection drift vs decision 4 idempotence), U1 (new-repo.md placeholder table contradicts SECURITY.md contact splice), U3 (ISSUE_TEMPLATE/config.yml:8 hard-codes advisories URL); 5 docs findings all inside U5's Owns, handed to U5. CONTRACT clean, RULINGS clean                                                                                                                     | —        |
| 1    | U2 doctor            | opus  | 2     | pass        | edit; R1 fix — (g) protected = any protection present; drift only when none; missing rule is an informational note (orchestrator ruling, GAP)                                                                                                                                                                                                                                                                                | 5c6f93db |
| 1    | U3 hygiene-pack      | opus  | 2     | pass        | edit; R1 fix — ISSUE_TEMPLATE config.yml vulnerability url is the whole-contact slot; conventions.md records fill-or-remove rule (orchestrator ruling, GAP)                                                                                                                                                                                                                                                                  | 1db4af49 |
| 1    | U1 init              | opus  | 2     | pass        | edit; R1 fix — placeholder-table note: SECURITY.md and issue-chooser token carry the whole contact; chooser fill-or-remove rule in readme-and-license.md                                                                                                                                                                                                                                                                     | 517cca88 |
| 1    | R1                   | opus  | 2     | pass        | review; all three fixes landed and agree; contract clean, rulings clean                                                                                                                                                                                                                                                                                                                                                      | —        |
| 1    | wave gate            | —     | 1     | pass        | marketplace --check, inventory --check, plugins:check, code:precommit (pass 2 clean; pass 1 reflowed only the plan folder), site:check all green; no UNRESOLVED in any report                                                                                                                                                                                                                                                | —        |

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the fresh session's worktree — cut from the integration branch — can see it.

Run in a fresh session:

/vwf:execute docs/plans/2026-09-20-init-forge-pass

or let the queue pick it, by priority:

/vwf:execute next
