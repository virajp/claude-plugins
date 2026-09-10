# U6 — docs: the manual, the how-tos, the doctrine, the two reversals

- **Wave:** 2
- **Depends on:** U1, U2, U3, U4, U5
- **Owns:** `readme.md`, `CLAUDE.md`, `site/CLAUDE.md`,
  `site/src/content/docs/**`, `.claude/docs/**`, `.claude/skills/vwf-plugin/**`,
  `.claude/skills/stackgen-plugin/**`,
  `docs/memory/decisions/<run-date>-init-behind-setup.md` (new)
- **Model:** opus
- **Read first:** every owned file the survey list below names, at the cited
  lines, before editing; the wave-1 diff
  (`git diff <develop>..HEAD -- plugins/ scripts/`) once, to describe what
  landed rather than what was planned.
- **Lazy-load:**
  `docs/memory/decisions/2026-09-06-init-owns-the-first-commit.md` and
  `2026-09-06-project-ids-are-slugged.md` (the two docs the reversal stands
  beside), `2026-09-05-vwf-init-and-the-repo-shape.md` (the umbrella);
  `site/CLAUDE.md` (the link rule and the gate before editing under `site/`).

## Ruling

The user, on the feedback that produced this plan:

> When detecting the project name to generate `p:<project-name>:*`, take user's
> consent with an option to customize by user

> Disable user invocation of this skill and let it be invoked by `vwf:setup`
> skill. I want to reduce the number of user invocable skills, since there are
> quite a few they are confusion users.

The interview's rulings this unit must state as the current behaviour: init is
called-only; setup's Step 0 offers init on a missing **or drifted** shape;
`/vwf:setup reshape` forces the offer and stops after init; doctor prints
`/vwf:setup reshape` once; init's `[--new | --existing] [target-dir]` is gone;
the two stackgen adapter skills are hidden and rule 9 asserts it; the three
`vwf:import-*` skills are unchanged.

From index.md's assumed decisions:

> **1.** […] A fourth row, **skill-invoked**, in the vwf-plugin invocation
> table: hidden from the `/` menu, reachable by the skill that owns the seam.

> **5.** Only a passage that tells a **user to type** `/vwf:init` changes […]
> "init" as the actor that lays a file down stays.

> **8.** One doc, `docs/memory/decisions/<run-date>-init-behind-setup.md`,
> carrying both reversals, the umbrella link to
> `2026-09-05-vwf-init-and-the-repo-shape.md`, and the rejected alternatives
> from this table.

The two reversals, from index.md's Goal, verbatim:

> 1. **init is no longer user-invocable.**
>    `.claude/skills/vwf-plugin/references/skills-and-agents.md:19` — "User
>    **and** model-invocable, for setup's seam" — and the 2026-09-06 decision
>    doc `docs/memory/decisions/2026-09-06-init-owns-the-first-commit.md`
>    describe `/vwf:init` as a command the user runs (its "When to run it again"
>    section tells the user when). Reversed: init is **called-only**, and setup
>    is the door.
> 2. **setup becomes the repo-shape remedy.**
>    `plugins/vwf/skills/doctor/references/stack-checks.md:212-215` states
>    "`/vwf:setup` is not the remedy: it checks whether the repo is shaped and
>    offers `/vwf:init`". Reversed: doctor prints `/vwf:setup reshape`, once,
>    for the absent shape and for every §5 drift row.

## Edits

The orchestrator dispatches the `docs-reconciler` agent with the wave-1 diff
first and hands this unit its findings, plus every `DOCS FALSIFIED:` line U1–U5
returned. Apply those, and the survey's list:

1. **`.claude/skills/vwf-plugin/SKILL.md`.** `:58` the workflow-order line: init
   is no longer the first *command* — say the workflow runs
   `setup → product → …` with init inside setup's Step 0 (or `setup reshape`);
   `:60-63` keep init as what shapes the base repo, say how it is reached; `:76`
   setup's Step 0 offers init on a missing or drifted shape; `:132-134` the
   invocation table gains the fourth row from decision 1 — mode
   **skill-invoked**, keys `user-invocable: false` +
   `disable-model-invocation: false`, no `paths:`, "for": a skill another skill
   calls (init; the stack-adapter skills) — and the prose around it says which
   skills use it today.
2. **`.claude/skills/vwf-plugin/references/skills-and-agents.md`.** `:10-12` the
   invocation preamble names the fourth mode; `:19` the init row: the sixth
   question (ids and slugs confirmed before the plan), no arguments,
   "**Skill-invoked**: hidden from the `/` menu, reached from setup's Step 0
   offer or `/vwf:setup reshape`"; `:20` the setup row: Step 0 offers init on a
   missing **or drifted** shape (doctor's four baseline predicates, cited),
   `reshape` invokes init and stops; `:32` the doctor row: "one
   `/vwf:setup reshape` remedy printed once"; `:35` the readme row per what U5
   wrote; `:66` the doctrine note distinguishes `user-invocable: false` +
   `paths:` (auto-applying) from `user-invocable: false` alone (skill-invoked).
3. **`.claude/skills/stackgen-plugin/SKILL.md`** and
   **`.claude/docs/plugins.md`** where they describe `stackgen-stack-menu` /
   `stackgen-stack-template`'s invocation: both keys, and that rule 9 now
   asserts both. `.claude/docs/repo-shape.md` if it lists rule 9's assertions.
4. **`CLAUDE.md`.** `:210` the vwf row: "`/vwf:init` (the repo-shape
   orchestrator)" → init reached through `/vwf:setup`; `:339` "On a repo that
   has never been shaped, run `/vwf:init` before either" → run `/vwf:setup`,
   whose Step 0 offers init (and `/vwf:setup reshape` re-shapes a drifted one);
   the sentence after it about `/vwf:setup` offering init already — merge the
   two. `:153` and `:211` name init as the actor — keep. The "Plugins" paragraph
   that says "`init` → `setup` → `product` …" changes the same way as the
   vwf-plugin skill's line. Update the description of the `plugins:check` rules
   only if `repo-shape.md`'s summary in `CLAUDE.md` lists rule 9's assertions.
5. **`readme.md`.** `:111` "run `/vwf:init` before either" → `/vwf:setup` (Step
   0 offers init; `reshape` re-shapes); `:253` names init as the actor — keep.
6. **`site/src/content/docs/plugins/vwf.md`.** `:722` the command-table row for
   `/vwf:init`: either drop it from the *commands* table and list init under a
   "reached through setup" note, or keep the row and mark it skill-invoked —
   follow the table's existing convention for non-user skills (check how
   `import-*` rows read). `:770-773` the section stays (it documents the
   pipeline) but the opener loses the argument grammar and says how init is
   reached; add the sixth question to the questions passage; `:927` "re-run
   `/vwf:init` whenever" → `/vwf:setup reshape`; `:936-937` "that seam is why
   `init` is model-invocable" → skill-invoked, and Step 0 also offers init on
   drift, `reshape` forces it; `:1646` and `:1719` name init as the actor —
   keep; `:1833` quickstart: "On a bare repo, run `/vwf:setup` — its Step 0
   offers init, which shapes the repo, then setup continues". Add `reshape` to
   setup's section with its argument and its stop-after-init rule. The "When to
   run it again" doctrine, wherever the manual mirrors it, names
   `/vwf:setup reshape`.
7. **`site/src/content/docs/plugins/stackgen.md`.** `:706-707` the two adapter
   rows: "adapter, skill-invoked (hidden)" or the table's equivalent; `:729` the
   invocation-state sentence names both keys. `:194` (design-tool packs) is
   unchanged — out of scope.
8. **`site/src/content/docs/how-to/greenfield/single-repo.md`** `:50-54` the
   `### /vwf:init` step and its fenced `/vwf:init` block: the step becomes
   `/vwf:setup`, whose Step 0 offers init — show the offer, not a typed init
   command; `:68`, `:85` per decision 5. **`multi-repo.md`** `:36` heading
   "/vwf:init, then /vwf:setup" → one `/vwf:setup` step; `:43-44` and `:133-134`
   the fenced blocks lose the `/vwf:init` line; `:48` per decision 5.
   **`brownfield/onboard-existing-codebase.md:84`** already describes the offer
   — add drift. Keep every relative link valid (`site/CLAUDE.md`'s link rule;
   `site:check` runs the link checker).
9. **The decisions doc** —
   `docs/memory/decisions/<run-date>-init-behind-setup.md`, in the shape of
   `2026-09-06-init-owns-the-first-commit.md`: header with Date, Branch, Plan
   link, **Reverses** (both cites), **Umbrella**; "What was decided before"
   (init a user command; setup not the remedy); "What changed" (the user's two
   verbatim rulings, the sixth question, the fourth invocation mode, Step 0's
   drift offer, `reshape`, doctor's remedy, the hidden adapter skills and rule
   9); "Rejected" (every row of index.md's assumed decisions table with its
   rejected alternative); "What stays outside" (the `import-*` skills, `ids.md`,
   `[target-dir]`).
10. **`site/CLAUDE.md`** only if a passage there names init as a user command
    (expected: none).

## Verification

- `mise run site:check` green — `astro check`, the build, the link checker over
  `dist/**/*.html` and the markdown mirror.
- `pnpm exec dprint check` over every owned root doc and `.claude/**` file you
  touched (they **are** dprint's; a widened table cell re-pads every row — let
  dprint do it, on your files only).
- `grep -rn '/vwf:init' readme.md CLAUDE.md site/src/content/docs .claude/skills/vwf-plugin .claude/skills/stackgen-plugin .claude/docs`
  — every remaining hit names init as the actor; none tells a user to type it;
  no fenced block contains a bare `/vwf:init` line.
- `grep -rn 'skill-invoked' .claude/skills/vwf-plugin/SKILL.md` → the table row
  exists.
- `command ls docs/memory/decisions/ | grep init-behind-setup` → one file.
- `mise run plugins:check` still green (you touched nothing under `plugins/`).

## Guardrails

- Touch nothing under `plugins/`, `scripts/` or `installer/`; nothing under
  `docs/plans/`; no `plugin.json`, no generated file.
- Never run `git checkout`, `git restore`, `git stash`, or any formatter or
  linter with `--fix` on a path outside your Owns.
- Do not edit `docs/memory/decisions/2026-09-06-init-owns-the-first-commit.md`
  or any other existing decision doc — a reversal is a new doc that cites the
  old one.
- Describe what wave 1 **landed**, from the diff, not what this plan said it
  would; where they differ, report the difference as a `GAP:`.
- `readme.md` is lowercase (`2026-09-05-readme-is-lowercase.md`).
- Write with Write/Edit, never `cat` heredocs; never a `git commit -m` body with
  backticks.

## Commit

`docs: init is setup's door — slug consent, reshape, the fourth invocation mode`
— written by the orchestrator after the wave gate, not by the unit.
