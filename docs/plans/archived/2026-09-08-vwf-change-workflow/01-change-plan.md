# U1 — change-plan: the repo's create-plan, ported and made generic

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/change-plan/**` (new — `SKILL.md`,
  `references/interview.md`, `references/plan-template.md`); the one new `type`
  row in
  `plugins/vwf/skills/blueprint-authoring/references/frontmatter-and-links.md:47-61`
- **Model:** opus
- **Read first:** the three source files, top to bottom —
  `.claude/skills/create-plan/SKILL.md`,
  `.claude/skills/create-plan/references/interview.md`,
  `.claude/skills/create-plan/references/plan-template.md` (read-only; they are
  the second plan's to delete). Then `plugins/vwf/skills/plan/SKILL.md:1-15`
  (the frontmatter shape) and
  `plugins/vwf/skills/blueprint-authoring/references/frontmatter-and-links.md:45-62`.
- **Lazy-load:** `plugins/vwf/assets/memory.md:12-32`, `:39-48`, `:81-90` (the
  recall rooms — cite, never copy); `plugins/vwf/assets/elicitation.md` §2, §3,
  §7 (cite where the source restates them);
  `plugins/vwf/assets/harness.md:12-21`, `:46-57` and
  `plugins/vwf/assets/vwf-config.md:94-102` (the harness stamp the survey reads
  when present); `plugins/vwf/assets/docs-sync.md:9-31`;
  `.claude/skills/plugin-authoring/references/checks.md` (rules 4, 6, 7, 10).

## Ruling

The user's request:

> I like the repo-level `create-plan` and `execute-plan` skills. These are good
> for adhoc work which don't really follow vwf process of blueprint. There are
> times where adhoc work is required to be done which has nothing to do with the
> project so let's add both of these to `vwf`

Names: `change-plan` / `change-execute` (the user picked "change-plan /
change-execute" over `adhoc-*`).

From index.md's assumed decisions, verbatim:

> **1.** `docs/plans/<YYYY-MM-DD>-<kebab-name>/` in the target repo, `index.md`
> frontmatter `type: vwf-change-plan`. The type joins the closed vocabulary in
> `frontmatter-and-links.md` with a note that the blueprint completeness bars do
> not apply to it; no `paths:` carve-out.

> **2.** `index.md`'s **Wave gate** section carries the exact commands.
> change-plan proposes them from `mise tasks` and, when `.config/vwf.yaml`
> carries a `harness:` stamp, its capabilities; the user confirms.
> change-execute runs what is written, before wave 1 and after every wave, and
> nothing it infers.

> **3.** `index.md` gets an **After landing** list: ordered commands or skills,
> each marked `run` (executed unprompted after a consented landing; e.g. a local
> stage) or `ask` (the run stops once and asks; e.g. a release). change-plan
> proposes them from the survey; the user confirms. Empty is valid.

> **4.** The repo's project table becomes generic: per project the units touch,
> ask whether a user sees a difference and how that project ships (version
> command, tag, publish). Record as a `Release <project>` consent row
> (`none / patch / minor / major`) plus the `ask` step that ships it. The
> gates-and-bump unit bumps with the command the plan names.

> **5.** The fixed docs unit runs `vwf:docs-sync` over the run's branch delta
> and applies every `DOCS FALSIFIED:` line. A confirmed reversal lands as
> `docs/memory/decisions/<date>-<slug>.md` per `assets/memory.md`.

> **7.** The interview item stays, generic: "anything a diff cannot prove — a
> real install, a scratch-repo run, a smoke test — named with its pass
> condition". No agent is named in the shipped text.

> **10.** `change-plan`: user **and** model (`disable-model-invocation: false`,
> no `user-invocable`).

> **11.** Both `model: opus`, `effort: high`, as every other vwf workflow skill.

> **12.** change-plan's recall reads `docs/memory/decisions/`, the last archived
> plan touching the same tree (folder or flat file), and the mempalace rooms
> `planning`, `decisions`, `gaps` for the repo's wing when the server is up,
> skipping silently when not — citing `${CLAUDE_PLUGIN_ROOT}/assets/memory.md`,
> never restating the room list.

> **13.** The survey maps "the trees the change touches and which project each
> belongs to" using the repo's own layout (the vwf registry when one exists,
> else the top-level directories), "the gates that already cover those trees"
> (`mise tasks`, the harness stamp, CI workflow files), and "the docs that
> describe today's behaviour" (README, CLAUDE.md, `docs/`). No tree of this repo
> is named.

> **14.** No bare `npm` (or any other `TOOL_TOKENS` entry) outside a fence; no
> backticked `target-verifier`. Prose that needs a package-manager example says
> "the package manager".

> **16.** The template names no archived plan of this repo as a specimen;
> `plan-template.md:9-11` is cut.

## Edits

1. **Copy, then edit.** Byte-copy the source directory so the generic passages
   (index.md's "already generic" ranges) arrive verbatim, then edit in place.
   Every edit below is to the **copy**.

   ```sh
   cp -R .claude/skills/create-plan plugins/vwf/skills/change-plan
   ```
2. **`SKILL.md` frontmatter.** `name: change-plan`. `description`: rewrite so
   the first clause says it turns an ad-hoc change request — work outside the
   blueprint — into a plan folder `/vwf:change-execute` runs unattended in a
   fresh session, and the last says when to run it (the user wants to plan a
   change that is not a blueprint slice; a blueprint slice is `/vwf:plan`). Keep
   `argument-hint: "[what to plan]"`. Set `model: opus`, `effort: high`,
   `disable-model-invocation: false`. Drop `allowed-tools` unless another vwf
   workflow skill of the same weight carries one (`plan/SKILL.md:1-15` does
   not). Strict YAML: quote any value containing a colon; no tabs.
3. **`SKILL.md` body — the opener (`:15-25` of the source).** `/execute-plan` →
   `/vwf:change-execute` everywhere in the file; "this skill" stays. Add one
   sentence placing the pair beside vwf's chain: a blueprint slice is
   `/vwf:plan` → `/vwf:execute`; a change with no blueprint slice — tooling,
   docs, CI, a refactor, a repo the blueprint does not describe — is this pair.
4. **§1 Recall (`:29-40`).** Per decision 12: the three sources, with the
   mempalace clause citing `${CLAUDE_PLUGIN_ROOT}/assets/memory.md` for the
   wing/room resolution and the "skip silently when the server is down" rule
   already written there. "the last plan in `docs/plans/archived/` that touched
   the same tree" stays and gains "folder or flat file — `/vwf:plan`'s cycle
   plans are flat files in the same directory".
5. **§1 Survey (`:44-62`).** Per decision 13, replace the bullet list naming
   this repo's trees, `mise tasks` + checker rules + `plugins.yml` + `site.yml`,
   and `readme.md` + `CLAUDE.md` + `site/…` + `.claude/docs/` with the generic
   three: the trees and their project (registry `docs/blueprint/registry.yaml`
   when present, else top-level directories), the gates (`mise tasks`; the
   `harness:` stamp in `.config/vwf.yaml` when present — cite
   `${CLAUDE_PLUGIN_ROOT}/assets/harness.md`; CI workflow files), the docs
   (README, CLAUDE.md, `docs/`, any per-project README). Keep the Explore
   dispatch, the "conclusions and `file:line` only" rule, and the "do not read
   the files yourself" rule verbatim.
6. **§4 Compute the release proposal (`:96-134`).** Replace whole, per decisions
   2, 3 and 4, with three sub-steps: (a) **the wave gate** — propose the exact
   commands from the survey's gate list, one per line, and confirm; these are
   what `index.md`'s Wave gate section holds and what change-execute runs; a
   repo with no task runner and no harness stamp records "none" and the user is
   told the run has no gate but the wave review; (b) **after landing** — propose
   ordered steps from the survey (a local stage, a version command, a release
   skill), each `run` or `ask`, and confirm; say `ask` is where a release goes
   because change-execute stops once before it; (c) **release intent** — per
   project the units touch, ask user-visible-or-not and how it ships, record
   `none / patch / minor / major` with the command that bumps, which the
   gates-and-bump unit runs. Keep the source's sentence that "a release recorded
   here is intent, not authorisation" and the restart note only where a step
   stages a plugin. Cut every mention of `plugins:local`, `i:test`,
   `site:check`, the dev marketplace, `.claude/docs/dev-marketplace.md` and
   "user mode".
7. **§5 (`:136-154`)** stays; item 5 reads "the wave gate, the after-landing
   steps and the gates the orchestrator keeps"; item 6 "the consent block and
   the release intent".
8. **§6 Write the folder (`:156-187`).** "The two last units are fixed" bullet
   (`:175-177`): the docs unit runs `vwf:docs-sync` over the branch delta
   (`${CLAUDE_PLUGIN_ROOT}/skills/docs-sync/SKILL.md` — cite) and applies every
   `DOCS FALSIFIED:` line; the gates-and-bump unit bumps versions with the
   command the plan names, runs the repo's generators the plan names, and passes
   the wave gate. Shared-file bullet (`:171-174`): replace "`plugin.json`
   versions, the generated marketplace and inventory files" with "version files,
   generated files".
9. **§7, §8 (`:189-217`).** `/execute-plan` → `/vwf:change-execute`; the launch
   block reads `/vwf:change-execute docs/plans/<date>-<name>`.
10. **`references/interview.md`.** `:29` (item 5's tree examples) → "the
    survey's list of trees and projects"; `:57` (item 13) per decision 7 — no
    agent name; `:59` (item 14) "the docs unit reconciles exactly these plus
    whatever `vwf:docs-sync` finds"; §E `:63-78` → three items: **Landing**
    (unchanged), **After-landing steps** (each proposed step confirmed as `run`
    / `ask` / dropped; a `run` step must publish nothing and cut no tag — if it
    does, it is `ask`), **Release intent, per affected project**
    (`none / patch / minor / major`, the command that bumps; "not this time" is
    a valid answer; stress it is intent and change-execute stops once). Cut
    `plugins:local`, "user mode", "restarted session" except as a generic remark
    that a staged plugin loads in a restarted session **when** a step stages
    one.
11. **`references/plan-template.md`.** `:1-11`: drop the two specimen names
    (decision 16); the opening sentence names `/vwf:change-execute` as the
    parser. `:17` `type: repo-plan` → `type: vwf-change-plan`. Consent table
    `:34-40` → rows: `Merge to the integration branch and push on green run`,
    one `After landing: <step>` row per step with `run / ask`, one
    `Release <project>` row per project with `none / patch / minor / major`. The
    paragraph after it (`:42-48`) → intent-not-authorisation, generic. Units
    table `:77-78`, `:85-90`: the fixed rows' Owns read "the repo's docs
    (README, CLAUDE.md, `docs/**`, …)" and "version files, generated files".
    Wave gate `:98-103` → "<the exact commands confirmed in the interview, one
    per line, or `none`> plus the wave review, plus every report read for
    `UNRESOLVED:`". Add a new required section **`## After landing`** directly
    after Wave gate: a table `| Step | Mode | Notes |` with `run` / `ask`, "or
    none". Gates the orchestrator keeps `:107` per decision 7. `:195` the docs
    unit paragraph → `vwf:docs-sync`; `:203-205` → the version command the plan
    names, the generators the plan names, no agent name. Keep the Run log
    columns, the Units columns, the Status vocabulary and every heading
    change-execute parses **exactly** — U2 reads this file and matches it.
12. **`frontmatter-and-links.md:47-61`.** Add one row after `vwf-plan`:
    `| vwf-change-plan | a docs/plans/<date>-<name>/index.md ad-hoc change plan (/vwf:change-plan); the blueprint bars do not apply |`
    — match the column padding of the table by hand. Nothing else in the file.
13. **Rule 10 / rule 7 pass (decision 14).** Grep the three owned skill files
    for every `TOOL_TOKENS` entry (`scripts/src/check.ts:1253-1298`) outside a
    fence and for `target-verifier`, `docs-reconciler`, `claude-status`,
    `plugins:` and `site:`; rewrite each hit. `create-plan/SKILL.md:103` ("…;
    npm") is one known hit — it disappears with the release table.

## Verification

- `mise run plugins:check` green (rule 4 frontmatter, rule 6 root refs, rule 7
  agent names, rule 10 technology guard; `claude plugin validate --strict` if
  `claude` is on PATH).
- `grep -rnE '\b(npm|pnpm|vitest|bun|docker|astro)\b' plugins/vwf/skills/change-plan`
  → every hit inside a fence, or none.
- `grep -rn 'target-verifier\|docs-reconciler\|claude-status\|plugins:\|site:\|i:release\|dev-marketplace\|user mode\|execute-plan' plugins/vwf/skills/change-plan`
  → nothing (a `/vwf:change-execute` hit is fine; a bare `execute-plan` is not).
- `grep -c 'vwf-change-plan' plugins/vwf/skills/change-plan/references/plan-template.md`
  → `1`; the same grep over `frontmatter-and-links.md` → `1`.
- `grep -n '^## After landing' plugins/vwf/skills/change-plan/references/plan-template.md`
  → one hit, inside the index.md fence, after `## Wave gate`.
- `grep -c '^disable-model-invocation: false$' plugins/vwf/skills/change-plan/SKILL.md`
  → `1`; `grep -c '^model: opus$'` → `1`; `grep -c '^effort: high$'` → `1`.
- `command diff <(sed -n 64,94p .claude/skills/create-plan/SKILL.md) <(sed -n '/^### 2. Scope check/,/^### 4/p' plugins/vwf/skills/change-plan/SKILL.md)`
  — differences are only the edits above; the generic passages survived the
  copy.

## Guardrails

- Touch nothing under `.claude/` — the source skills are read-only here and are
  the second plan's to delete. Touch nothing under
  `plugins/vwf/skills/change-execute/` (U2's) or any other vwf skill except the
  one row in `frontmatter-and-links.md`.
- Never run `git checkout`, `git restore`, `git stash`, or any formatter or
  linter with `--fix` on a path outside your Owns.
- Strict-YAML frontmatter: an unparseable header drops the skill silently.
  Re-read both headers after editing.
- `plugins/**/*.md` is **not** dprint-formatted — match the surrounding fold
  width by hand; `pnpm exec markdownlint-cli2` runs over it in pre-commit.
- Every `${CLAUDE_PLUGIN_ROOT}/…` you write must resolve inside `plugins/vwf/`
  (rule 6). Cite `assets/memory.md`, `assets/harness.md`,
  `skills/docs-sync/SKILL.md`, `skills/git-workflow/SKILL.md` — never restate
  their rules.
- Write with Write/Edit, never `cat` heredocs (`cat` is aliased to `bat`). Copy
  with `cp -R`, then edit.

## Commit

`feat(vwf): change-plan — plan an ad-hoc change outside the blueprint` — written
by the orchestrator after the wave gate, not by the unit.
