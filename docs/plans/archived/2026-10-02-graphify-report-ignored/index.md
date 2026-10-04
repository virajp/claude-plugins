---
type: vwf-change-plan
title: graphify's report is gitignored unless the repo opts in
requires: [ docs/plans/2026-10-01-tool-config-script-init ]
backlog: []
backlog_pieces: []
---

# Plan — graphify's report is gitignored unless the repo opts in (2026-10-02)

## Status

**ARCHIVED**

ARCHIVED 2026-10-05 — not run; was APPROVED (superseded by the tool-config
template chain, docs/plans/2026-10-05-tool-config-template-engine)

## Consent

| Action                                            | Granted |
| ------------------------------------------------- | ------- |
| Merge to the integration branch and push on green | yes     |
| After landing: `mise run p:plugins:local`         | run     |
| Release vwf publicly                              | minor   |
| Release stackgen publicly                         | minor   |
| Release site publicly                             | patch   |

**The mode recorded here is the consent.** A `run` step runs on a green landing
without a prompt. The staged plugins are picked up only by a **restarted**
session.

**Release rows are intent, not authorisation** — no public release step is
recorded; the change ships with the next batched `/release`. A project is bumped
once per level since its last release. The chain this plan requires bumps vwf
minor and stackgen major (`2026-10-01-tool-config-script-init`, unit I9), and
the site already sits at `1.1.50` above `site-v1.1.49` — all unreleased — so
**this plan bumps nothing**; the intent rides those versions. Were a bump
needed, a plugin's is a hand edit of its `.claude-plugin/plugin.json` plus
`mise run p:plugins:marketplace`, and the site's is `mise run p:site:version` —
neither is authorised here.

## Goal

In a repo vwf shapes, `graphify-out/GRAPH_REPORT.md` is gitignored unless that
repo's user chose to commit it; the choice is recorded per repo in
`.config/vwf.yaml`, and a repo already tracking the report is asked, never
silently untracked. The choice belongs to the person whose repo vwf shapes, not
to this toolkit's maintainer.

**Reversal:** stackgen's tool-config today keeps the report tracked on purpose —
it asks git for `graphify-out/*` then `!graphify-out/GRAPH_REPORT.md`, because
the report is "prose worth diffing in review"
(`plugins/stackgen/skills/tool-config/references/graphify.md:31-38`, before the
chain this plan requires rewrites it). That rule retires: the default is
ignored, and the old two-line block becomes the `commit` opt-in. U6 records the
reversal as a decisions doc.

## Facts the survey established

`TC` = `plugins/stackgen/skills/tool-config`. Line numbers are as of 2026-10-02,
**before** the required chain (`-gates`, `-hygiene`, `-init`) lands — that chain
rewrites several of these files, so every unit re-reads its owned files and
locates passages by content, not by line.

- **Today's graphify ignore.** `TC/references/graphify.md:23-25`:
  `.graphifyignore`'s one entry is `graphify-out/`. `:31`: graphify asks git for
  `graphify-out/* !graphify-out/GRAPH_REPORT.md for graphify` — only the report
  tracked; `graph.json`, `graph.html`, the cache and dated subdirectories are
  ignored. `:35-38` the rationale. `:46` "The keys it reads: none". The site
  manual repeats the block at
  `site/src/content/docs/plugins/stackgen.md:764-769`.
- **After the hygiene plan**
  (`docs/plans/2026-10-01-tool-config-script-hygiene`, ruling H3): git and
  graphify run on the node script — modules `TC/scripts/lib/tools/git.mjs` and
  `TC/scripts/lib/tools/graphify.mjs`; graphify's `all` lands `.graphifyignore`
  and asks git for its two lines "for graphify"; the base `graphify` block keeps
  `graphify-out/`. Its scratch gate 3 asserts
  `git check-ignore -q graphify-out/GRAPH_REPORT.md` **fails** — true until this
  plan lands. The hygiene tool test and its fixtures are H3's.
- **The `all` key table.** `TC/SKILL.md:200-214` (fixed keys; an unknown key is
  refused); `TC/scripts/lib/cli.mjs:25-39` `ALL_KEYS` (`"update-bot"` at `:38`).
  `TC/references/renovate.md:18-20` is the model for a flag-conditioned row
  (renovate lands only on `update_bot=renovate`).
- **Dedupe gap.** `TC/references/git.md:94-99`: the duplicate check strips a
  leading/trailing `/` and `**/` but not a trailing `/*`, so `graphify-out/` and
  `graphify-out/*` count as different lines. Git cannot re-include a file whose
  parent directory is excluded, so any bare `graphify-out/` line — an old banner
  section, as in this repo's `.gitignore:22` — silently defeats the negation.
  The migration (`git.md:253-262`) converts only a graphify section matching the
  block's two patterns exactly.
- **No untrack step anywhere.** No `git rm --cached` or `ls-files` step in init
  or the git/graphify references; an identical existing line is a silent no-op
  (`git.md:94-99`). "Conflict row" exists for root config twins, mise pins,
  secret-reincluding template lines and attribute clashes
  (`git.md:80-81,
  117-130`), and delete rows for lock-file ignore lines
  (`git.md:133-142`).
- **Readers of the report.** None in vwf: every consumer reads
  `graphify-out/graph.json` (`plugins/vwf/assets/graphify.md`,
  `agents/plan-surveyor.md:36`, `setup/SKILL.md:320`,
  `doctor/references/code-intelligence.md:20-49`).
  `plugins/vwf/assets/graphify.md:109` already calls `graphify-out/` untracked.
  `code:graph`'s rebuild-loop guard
  (`TC/assets/mise/.config/mise/tasks/code/graph:48-49`) skips a rebuild after a
  commit touching only `graphify-out/` — harmless under either mode.
- **`answers:` block.** `plugins/vwf/assets/vwf-config.md:123-128` (`secrets`,
  `repos.<member-path>.{forge,update_bot}`, every key always present, `none`
  when unanswered); `:236` init alone writes it; `:287-293` bump rules ("when a
  key's shape changes", never onto 13 or 17); `:270-276` the additive
  `viewports` precedent; migration notes `21 → 22` at `:668-688`, ending with
  the "Nth config bump without a paired blueprint bump" paragraph. Current
  `config_format` is **22** (`:37,46,49,123,633,650`).
- **Where 22 is named** (a bump to 23 touches each): `vwf-config.md` above;
  `setup/SKILL.md:156-162` (`:159` hard-codes "The latest config step,
  `21 → 22`"); `setup/references/migrate-pipeline.md:7,28-40`;
  `setup/references/format-lineage.md:18,22,126-127`;
  `.claude/skills/vwf-plugin/references/docs-tree.md:121,137`;
  `.claude/skills/vwf-plugin/references/assets.md:24`. Doctor reads the number
  from vwf-config (`doctor/SKILL.md:164-168`); `:217-219` is the answers-drift
  check; `doctor/references/stack-checks.md:511-515` related. No test pins
  `config_format`. `.claude/skills/stackgen-plugin/SKILL.md:135` and
  `plugins/stackgen/skills/stackgen-sync/SKILL.md:70` name 22 historically and
  stay true.
- **init's questions.** `plugins/vwf/skills/init/SKILL.md:399-415` "Eight in
  all"; q7 the update bot `:614-637`, passed as `--update-bot` (`:629-630`);
  "Ask all eight" `:639`; summary `:640-646`; recorded into `answers.repos`
  `:648-657`. `init/references/new-repo.md:90-99` the `all` flag table (`:99`),
  `:139-187` the answers each fetch carries (`:156` `update_bot`), `:189+`
  question 7's mechanics. `init/references/existing-repo.md:612-631` records
  `answers` on a reshape. `init/references/tool-configs.md:72-75` seeds q7 from
  an existing bot file. The `-init` plan's I5 rewrites these passages (feeding
  q3, 6a, 6b into `all --brief --license --security-contact`).
- **Other readers of `answers.repos`.**
  `setup/references/materialize.md:38-46,
  108-156` (`:145-156` infers a
  missing block; `update_bot` at `:154`); `setup/SKILL.md:217-237`; stackgen
  `stackgen-sync/SKILL.md:80-96` (rewrites only `forge`),
  `stackgen-stack-template/references/materializer.md:22-24,204`,
  `stackgen-stack-template/SKILL.md:185,192`, `assets/pack-format.md:294`,
  `assets/output-tree.md:379` — those stackgen readers pass the map through and
  need no edit unless a unit finds a closed key list. `scripts/src/check.ts:876`
  closes the `update_bot` axis vocabulary; `graphify_report` is **not** a pack
  `when:` axis, so the checker is untouched.
- **This repo.** `git ls-files graphify-out` is empty; `.gitignore:22` ignores
  the whole directory; `.config/pre-commit-config.yaml:30` claims "Some of it is
  tracked". Both are this repo's own files — out of scope (Parked).
- **Gates.** `mise tasks`:
  `p:plugins:{check,inventory,marketplace,shellcheck,npm-normalize-test,local,release}`,
  `p:site:{check,build,version,release}`, `code:{precommit,format,lint,sec}`.
  `plugins/**/*.md` is not dprint-formatted — match the fold width by hand.
- **Commit types** (`.config/git-conventional-commits.yaml:3-9`): `ops`, `docs`,
  `merge`, `feat`, `fix`, `refactor`; no scopes.
- **Versions.** vwf `20.1.0` (tag `vwf-v20.0.1`), stackgen `3.0.0` (tag
  `stackgen-v2.0.0`), site `1.1.50` (tag `site-v1.1.49`) at planning time; the
  required `-init` plan bumps vwf minor and stackgen major.

## Assumed decisions — confirm or override at review

| # | Decision        | Ruling                                                                                                                                                                                                                                                                                                                                                      | Rejected                                                                              | Unit   |
| - | --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ------ |
| 1 | Default         | `graphify-out/GRAPH_REPORT.md` is ignored by default. The `ignore` mode asks git for `graphify-out/` alone; the `commit` mode keeps today's `graphify-out/*` then `!graphify-out/GRAPH_REPORT.md`, negation after its pattern. The "diffable in review" rationale retires.                                                                                  | Ignoring always with no opt-in                                                        | U1, U2 |
| 2 | Sequencing      | Chained after the tool-config script chain: `requires: [docs/plans/2026-10-01-tool-config-script-init]`, which requires `-hygiene` in turn. The hygiene plan runs untouched; this plan edits the scripted modules it leaves.                                                                                                                                | Amending the hygiene plan before it runs; landing in prose first and patching hygiene | —      |
| 3 | The choice      | init asks one more per-repo question — commit graphify's report, default `ignore` — and records `answers.repos.<path>.graphify_report: ignore \| commit` beside `update_bot`, always present. A reshape re-asks, seeded with the recorded value. The answer reaches tool-config `all` as `--graphify-report ignore\|commit`; an absent flag means `ignore`. | A tool-config flag not persisted; no question, a hand-added negation                  | U1, U3 |
| 4 | Format bump     | `config_format` 22 → 23, with a `22 → 23` migration note: a config without `graphify_report` gains it per repo entry — `commit` when `git ls-files graphify-out/GRAPH_REPORT.md` lists the file in that repo, else `ignore`. Neither 13 nor 17 is in play; `blueprint_format` untouched.                                                                    | Treating the key as additive with no bump (the `viewports` precedent)                 | U4     |
| 5 | Already tracked | When `git ls-files` shows the report tracked, the question's default becomes `commit` and the plan summary says why. Answering `ignore` adds a conflict row — untrack `graphify-out/GRAPH_REPORT.md` with `git rm --cached`, the file kept on disk — applied only on an `ok`; declining keeps it tracked and records `commit`. Never a silent untrack.      | Always defaulting to `ignore`                                                         | U1, U3 |
| 6 | Bare line       | In `commit` mode, a bare `graphify-out/` (or `/graphify-out/`) line outside the graphify block becomes a conflict row: replace it with the block's lines, applied only on an `ok`; declining leaves the line and warns the negation is inert. The duplicate check normalises a trailing `/*` against a trailing `/`.                                        | Parking the defect                                                                    | U1, U2 |
| 7 | Review          | One `Kind: review` row (U5) covers U1, which lands runnable code — the node script's `cli.mjs`, `git.mjs`, `graphify.mjs` and their tests.                                                                                                                                                                                                                  | No review row                                                                         | U5     |
| 8 | Decisions doc   | The reversal is recorded as `docs/memory/decisions/2026-10-02-graphify-report-ignored-by-default.md`.                                                                                                                                                                                                                                                       | Leaving it in the plan only                                                           | U6     |
| 9 | Bumps           | None: the chain's unreleased vwf minor and stackgen major, and site `1.1.50`, already cover the intent.                                                                                                                                                                                                                                                     | Bumping again                                                                         | U7     |

## New dependencies

none

## Units

| Id | Wave | Unit file                                    | Kind   | Owns                                                                                                                                                                                                                                                          | Depends on     | Status  | Commit |
| -- | ---- | -------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | ------- | ------ |
| U1 | 1    | [01-script.md](01-script.md)                 | edit   | `plugins/stackgen/skills/tool-config/scripts/lib/cli.mjs`, `plugins/stackgen/skills/tool-config/scripts/lib/tools/{git,graphify}.mjs`, the hygiene tool test file and its fixtures as the hygiene plan's H3 created them (git and graphify cases)             | —              | pending |        |
| U2 | 1    | [02-stackgen-prose.md](02-stackgen-prose.md) | edit   | `plugins/stackgen/skills/tool-config/SKILL.md`, `plugins/stackgen/skills/tool-config/references/{git,graphify}.md`                                                                                                                                            | —              | pending |        |
| U3 | 1    | [03-init.md](03-init.md)                     | edit   | `plugins/vwf/skills/init/SKILL.md`, `plugins/vwf/skills/init/references/{new-repo,existing-repo,tool-configs}.md`                                                                                                                                             | —              | pending |        |
| U4 | 1    | [04-config.md](04-config.md)                 | edit   | `plugins/vwf/assets/vwf-config.md`, `plugins/vwf/skills/setup/SKILL.md`, `plugins/vwf/skills/setup/references/{migrate-pipeline,format-lineage,materialize}.md`, `plugins/vwf/skills/doctor/SKILL.md`, `plugins/vwf/skills/doctor/references/stack-checks.md` | —              | pending |        |
| U5 | 2    | [05-review.md](05-review.md)                 | review | —                                                                                                                                                                                                                                                             | U1             | pending |        |
| U6 | 3    | [06-docs.md](06-docs.md)                     | edit   | `readme.md`, `CLAUDE.md`, `.claude/docs/**`, `.claude/skills/{vwf-plugin,stackgen-plugin}/**`, `site/src/content/docs/**`, `docs/memory/decisions/2026-10-02-graphify-report-ignored-by-default.md`                                                           | U2, U3, U4, U5 | pending |        |
| U7 | 4    | [07-gates.md](07-gates.md)                   | edit   | —                                                                                                                                                                                                                                                             | U6             | pending |        |

## Shared-file rule

| File                                                        | Why it collides                                | Owner                                        |
| ----------------------------------------------------------- | ---------------------------------------------- | -------------------------------------------- |
| `TC/SKILL.md` key table vs `cli.mjs` `ALL_KEYS`             | one flag, two files — must name it identically | U1 code, U2 prose; both quote D3's flag name |
| `docs/plans/index.md`                                       | plan-management's                              | no unit — ever                               |
| every human-facing doc                                      | n units editing one doc                        | U6 only                                      |
| version files, `.claude-plugin/marketplace.json`, inventory | generated or versioned                         | nobody — D9                                  |

## Waves

- **Wave 1 — U1, U2, U3, U4.** Four disjoint path sets: the stackgen script, the
  stackgen prose, vwf's init, vwf's config/setup/doctor. They share only names
  fixed by the rulings — the flag `--graphify-report`, the key
  `graphify_report`, the values `ignore` and `commit` — quoted verbatim in each
  unit.
- **Wave 2 — U5**, the review row over U1's commit range.
- **Wave 3 — U6**, docs. **Wave 4 — U7**, gates.

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

| Step                       | Mode | Notes                                                                                   |
| -------------------------- | ---- | --------------------------------------------------------------------------------------- |
| `mise run p:plugins:local` | run  | stages vwf and stackgen into the dev marketplace; a **restarted** session picks them up |

## Gates the orchestrator keeps

A scratch-repo run of `/stackgen:tool-config`'s script `all` (in a `mktemp -d`
git repo, never this checkout), each case its own fresh repo:

- `--graphify-report ignore` (and the flag absent): after applying,
  `git check-ignore -q graphify-out/GRAPH_REPORT.md` **succeeds**.
- `--graphify-report commit`: the same command **fails** (the report is
  committable), and `graphify-out/graph.json` is still ignored.
- report committed first, then `--graphify-report ignore`: the preview carries
  the untrack conflict row; applied without `ok` on that row,
  `git ls-files graphify-out/GRAPH_REPORT.md` still lists it; with `ok`, it no
  longer does and the file is still on disk.
- a pre-existing bare `graphify-out/` line, then `--graphify-report commit`: the
  preview carries the replace conflict row.

## Unit contract

Every unit prompt carries, in order: its ruling quoted from this file, its owned
paths plus "touch nothing outside this list", the facts section, the shared-file
rule, and the return block below. A unit never bumps a version, never runs a
generator, never edits a doc, never adds a dependency this file does not list,
never commits. A unit deletes with plain `rm`, never `git rm` — it stages
nothing. A unit never runs `git checkout`, `git restore` or a formatter with
`--fix` outside its Owns.

A unit returns exactly this block and nothing else — no file contents, no diff:

    CHANGED: <path> — <one line>            (one per file)
    DECIDED: <what> — <why>                 (choices made inside scope, or none)
    DOCS FALSIFIED: <path> — <passage>      (reported, never edited; or none)
    GAP: <what the plan left unspecified and the assumption taken>   (or none)
    UNRESOLVED: <the ruling needed>         (or none)

## Out of scope

- Ignoring the whole `graphify-out/` with no opt-in — declined (D1); B84 keeps
  the commit option for the repo's user.
- Making `graphify_report` a pack `when:` axis — not needed; the checker's axis
  vocabulary (`scripts/src/check.ts:876`) is untouched.
- `code:graph`'s rebuild-loop guard — harmless under either mode.
- Amending the `-hygiene` or `-init` plans — declined (D2); they run as
  approved.

## Parked

- This repo's own `.gitignore:22` (bare `graphify-out/`) and
  `.config/pre-commit-config.yaml:30` ("Some of it is tracked") — the maintainer
  edits this repo's `.config` and root files by hand; a `/vwf:setup reshape`
  after this lands would offer the same rows.

## Run log

| Wave | Unit | Model | Round | Outcome | Detail | Commit |
| ---- | ---- | ----- | ----- | ------- | ------ | ------ |

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the fresh session's worktree — cut from the integration branch — can see it.

Run in a fresh session:

/vwf:execute docs/plans/2026-10-02-graphify-report-ignored

or let the queue pick it, by priority:

/vwf:execute next
