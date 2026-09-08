# U2 — change-execute: the repo's execute-plan, ported and made generic

- **Wave:** 2
- **Depends on:** U1 (reads the template it wrote)
- **Owns:** `plugins/vwf/skills/change-execute/**` (new — `SKILL.md`,
  `references/wave-review.md`, `references/blocking.md`)
- **Model:** opus
- **Read first:** the three source files, top to bottom —
  `.claude/skills/execute-plan/SKILL.md`,
  `.claude/skills/execute-plan/references/wave-review.md`,
  `.claude/skills/execute-plan/references/blocking.md` (read-only). Then U1's
  `plugins/vwf/skills/change-plan/references/plan-template.md` in full — every
  heading and column this skill parses comes from there. Then
  `plugins/vwf/skills/archive/SKILL.md:1-10` (the user-only frontmatter shape).
- **Lazy-load:** `plugins/vwf/skills/git-workflow/SKILL.md:17-32`, `:121-128`,
  `:130-166`, `:180-215` (the worktree, commit and land steps this skill invokes
  — cite); `plugins/vwf/assets/execute-stages.md:45-63`, `:106-111` (review
  round cap and convergence guard), `:167-205` (the run-journal shape);
  `plugins/vwf/skills/docs-sync/SKILL.md:26-35` (the standalone mode the docs
  unit runs); `.claude/skills/plugin-authoring/references/checks.md` (rules 4,
  6, 7, 10).

## Ruling

The user's request:

> I like the repo-level `create-plan` and `execute-plan` skills. These are good
> for adhoc work which don't really follow vwf process of blueprint. […] let's
> add both of these to `vwf`

From index.md's assumed decisions, verbatim:

> **2.** […] change-execute runs what is written, before wave 1 and after every
> wave, and nothing it infers.

> **3.** `index.md` gets an **After landing** list: ordered commands or skills,
> each marked `run` (executed unprompted after a consented landing; e.g. a local
> stage) or `ask` (the run stops once and asks; e.g. a release). […] Empty is
> valid.

> **5.** The fixed docs unit runs `vwf:docs-sync` over the run's branch delta
> and applies every `DOCS FALSIFIED:` line. A confirmed reversal lands as
> `docs/memory/decisions/<date>-<slug>.md` per `assets/memory.md`.

> **6.** The repo's prompt-based `general-purpose` reviewer subagent, as
> `wave-review.md` has it, with the round cap and convergence guard cited from
> `assets/execute-stages.md:45-63`, `:106-111`.

> **7.** […] No agent is named in the shipped text.

> **8.** "an injected cap directive from an external hook" — no tool named.

> **9.** change-execute moves the folder to `docs/plans/archived/<folder>/`
> itself on completion, as the repo copy does. Change plans are **never**
> written into the base repo's `docs/plans/index.md`, so `/vwf:archive`,
> `/vwf:execute` and `/vwf:recall` are untouched.

> **10.** `change-execute`: user-only (`disable-model-invocation: true`) — it
> must start a fresh session, which only the user can guarantee.

> **11.** Both `model: opus`, `effort: high`, as every other vwf workflow skill.

> **14.** No bare `npm` (or any other `TOOL_TOKENS` entry) outside a fence; no
> backticked `target-verifier`. […]

> **17.** U2 runs in wave 2 so it reads the template U1 wrote, and its
> `index.md` parsing (Status, Consent, Units, Wave gate, After landing, Run log)
> matches U1's headings exactly. Any mismatch U2 finds is a `GAP:` resolved in
> U2's favour by editing only U2's files and reporting the template line.

## Edits

1. **Copy, then edit.** Byte-copy the source directory; every edit below is to
   the copy.

   ```sh
   cp -R .claude/skills/execute-plan plugins/vwf/skills/change-execute
   ```
2. **`SKILL.md` frontmatter.** `name: change-execute`. `description`: first
   clause — runs an approved `/vwf:change-plan` folder autonomously in a fresh
   session; keep the source's middle (preflight, one worktree, waves, wave
   review, gate between waves, a commit per green wave, the run log, docs
   reconciled and versions bumped by the fixed final units, land per consent,
   the after-landing steps, stop once before any `ask` step); last clause —
   "Invoke as `/vwf:change-execute <plan-folder>` in a session that has done
   nothing else". `argument-hint` stays. `model: opus`, `effort: high`,
   `disable-model-invocation: true`. Drop `allowed-tools` (the user-only
   `archive/SKILL.md:1-10` is the shape). Strict YAML.
3. **Opener (`:16-25`).** `/create-plan` → `/vwf:change-plan`; the rest stays.
4. **§1 (`:36-53`).** "run /create-plan to finish it" → `/vwf:change-plan`.
   Everything else stays — the Status vocabulary and the `requires:` rule are
   U1's template's, unchanged.
5. **§2 (`:55-66`).** Keep; it already invokes `vwf:git-workflow` by name with
   the declared preference. "branch from `develop`" → "branch from the repo's
   integration branch (`git-workflow` resolves it)". Keep "no unit gets
   `isolation: "worktree"`" and the reason.
6. **§3 Preflight (`:68-82`).** Replace the fenced command list with: run every
   line of `index.md`'s **Wave gate** section, in order, from the worktree root;
   when the section reads `none`, say so in the run log and continue (the wave
   review is then the only gate). Keep "a red line here is the integration
   branch's, not the plan's — stop and report it as such" and the `wave 0`,
   `preflight` run-log row.
7. **§4 Waves (`:84-131`).** Step 4 "the six lines from §3" → "every line of the
   Wave gate section". Step 5 stays (`vwf:git-workflow` step 3, one commit per
   unit). The fixed-final-units paragraph (`:124-131`): the docs unit invokes
   `vwf:docs-sync` over the branch delta
   (`${CLAUDE_PLUGIN_ROOT}/skills/docs-sync/SKILL.md` — cite its standalone
   mode) and applies its findings plus every `DOCS FALSIFIED:` line; the
   gates-and-bump unit bumps versions per the consent block **with the command
   the plan names**, runs the generators the plan names, and passes the wave
   gate. Cut `plugin.json`, `i:version`, and the `target-verifier` sentence; in
   its place: "runs every item under *Gates the orchestrator keeps* — the checks
   a diff cannot prove".
8. **§5, §6 (`:133-163`).** Stay. §6's "the local stage, once §7a has run" →
   "each after-landing `run` step and its outcome, once §7a has run".
9. **§7 Land (`:165-170`).** "move the folder to `docs/plans/archived/`" stays
   (decision 9); "Merge to `develop` and push" → "Merge to the integration
   branch and push"; `vwf:git-workflow` step 4 stays.
10. **§7a (`:172-196`) → "After landing — the `run` steps".** Replace whole:
    when the landing merged and pushed (or, when landing was not consented, from
    the worktree if the step's Notes say it may run there), execute every
    **After landing** step marked `run`, in order, from the repo root; each is
    reported with its outcome, never asked about, because the plan recorded it
    as publishing nothing and cutting no tag. A step that exits non-zero is
    reported verbatim and does not block the rest; it is never worked around. A
    step whose Notes say a restarted session is needed for its effect is
    reported with that sentence. No step named; no `plugins:local`, no dev
    marketplace, no "user mode".
11. **§8 (`:198-215`) → "The `ask` steps — always stop once".** If the After
    landing list has an `ask` step and the landing merged and pushed, ask
    **one** question naming every `ask` step in order: run them now? A yes
    authorises exactly those steps and nothing else; the run reports each
    outcome. Keep "offer waiting as the equal option, not the fallback" and
    "consent in the plan is intent, asked again in the moment". Cut the
    `release` skill, `plugins:release`, `i:release`, `site:release`, and
    "`CLAUDE.md`'s hard rule".
12. **Resource caps (`:217-226`).** Per decision 8: "an injected cap directive
    from an external hook" — cut the parenthetical naming the provider.
13. **"What does not stop the run" and "What this skill never does"
    (`:228-252`).** "the local stage" → "an after-landing `run` step"; "Runs
    `plugins:release`, `i:release` or `site:release` itself, or merges to
    `main`" → "Runs an `ask` step without the in-the-moment yes, or merges past
    the integration branch"; "Treats the local stage as a release" → "Treats a
    `run` step as an `ask` step's consent". `plugins:local` sentence under "Runs
    a generator or bumps a version" → "an after-landing `run` step is the one
    exception, and it is the orchestrator's because it may write outside the
    worktree".
14. **`references/wave-review.md`.** `:30` — the guard line naming `npm` after a
    pipe: rewrite without any `TOOL_TOKENS` word ("no package-manager command
    after a pipe" is enough, or drop the clause if it only made sense for this
    repo's hook). Add one sentence citing
    `${CLAUDE_PLUGIN_ROOT}/assets/execute-stages.md` for the round cap and the
    convergence guard where the file states them (decision 6). Nothing else.
15. **`references/blocking.md`.** Generic in full per the survey; `/create-plan`
    → `/vwf:change-plan`, `/execute-plan` → `/vwf:change-execute` wherever they
    appear. Nothing else.
16. **Parsing agreement (decision 17).** Cross-check every heading, table column
    and status word this skill reads against U1's `plan-template.md`:
    `## Status`, `## Consent`, `## Units` (columns Id, Wave, Unit file, Owns,
    Depends on, Status, Commit), `## Wave gate`, `## After landing` (columns
    Step, Mode, Notes), `## Gates the orchestrator keeps`, `## Run log` (columns
    Wave, Unit, Model, Round, Outcome, Detail, Commit), `## Launch`. A mismatch
    is fixed on this side and returned as `GAP:` with the template line.
17. **Rule 10 / rule 7 pass (decision 14).** Grep the three files for every
    `TOOL_TOKENS` entry outside a fence and for `target-verifier`,
    `docs-reconciler`, `claude-status`, `plugins:`, `site:`, `i:release`;
    rewrite each hit.

## Verification

- `mise run plugins:check` green (rules 4, 6, 7, 10;
  `claude plugin validate
  --strict` if `claude` is on PATH).
- `grep -rnE '\b(npm|pnpm|vitest|bun|docker|astro)\b' plugins/vwf/skills/change-execute`
  → every hit inside a fence, or none.
- `grep -rn 'target-verifier\|docs-reconciler\|claude-status\|plugins:\|site:\|i:release\|i:version\|dev-marketplace\|user mode\|create-plan\|execute-plan' plugins/vwf/skills/change-execute`
  → nothing (`/vwf:change-plan` and `/vwf:change-execute` hits are fine).
- `grep -c '^disable-model-invocation: true$' plugins/vwf/skills/change-execute/SKILL.md`
  → `1`; `grep -c '^model: opus$'` → `1`; `grep -c '^effort: high$'` → `1`.
- `grep -n 'After landing' plugins/vwf/skills/change-execute/SKILL.md` — the
  section name matches U1's template heading byte for byte.
- `grep -n 'docs/plans/archived' plugins/vwf/skills/change-execute/SKILL.md` →
  the archive move in §7.
- `grep -c 'vwf:git-workflow' plugins/vwf/skills/change-execute/SKILL.md` ≥ 3
  (create, commit, land).

## Guardrails

- Touch nothing under `.claude/`; nothing under
  `plugins/vwf/skills/change-plan/` (U1's — a template mismatch is a `GAP:`, not
  an edit); nothing in `archive/`, `plan/`, `execute/`, `recall/`, `docs-sync/`,
  `git-workflow/`.
- Never run `git checkout`, `git restore`, `git stash`, or any formatter or
  linter with `--fix` on a path outside your Owns.
- Strict-YAML frontmatter; re-read the header after editing.
- `plugins/**/*.md` is not dprint-formatted — match the fold width by hand.
- Every `${CLAUDE_PLUGIN_ROOT}/…` must resolve inside `plugins/vwf/` (rule 6).
- Write with Write/Edit, never `cat` heredocs. Copy with `cp -R`, then edit.

## Commit

`feat(vwf): change-execute — run an approved change plan unattended` — written
by the orchestrator after the wave gate, not by the unit.
