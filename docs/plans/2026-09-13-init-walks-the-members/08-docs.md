# U8 — docs: the manual, the repo docs, the decisions doc

- **Wave:** 3
- **Depends on:** U1–U7
- **Owns:** `readme.md`, `CLAUDE.md`, `.claude/docs/**`,
  `.claude/skills/vwf-plugin/**`, `.claude/skills/stackgen-plugin/**`,
  `site/src/content/docs/**`,
  `docs/memory/decisions/2026-09-13-init-walks-the-members.md`, every
  `DOCS FALSIFIED:` path the earlier units returned.
- **Model:** opus
- **Read first:** `${CLAUDE_PLUGIN_ROOT}/skills/docs-sync/SKILL.md`; then the
  run's branch delta (`git diff develop...HEAD --stat`); then each file below at
  the cited lines before editing it; then
  `docs/memory/decisions/2026-09-06-init-behind-setup.md` in full (the decisions
  doc you write reverses part of it and must cite it the way that doc cites its
  own predecessor).
- **Lazy-load:** `${CLAUDE_PLUGIN_ROOT}/assets/memory.md` (the decisions-doc
  shape); `site/CLAUDE.md` (the link rule and the site's traps);
  `.claude/skills/vwf-plugin/references/skills-and-agents.md` row shape.

## Ruling

Every ruling in `index.md`'s table, 1–17, quoted there. The three reversals from
the Goal:

> 1. **"The shape is per repo, not per product."** … Both are reversed: the
>    shape is per repo, but the **run** is per product.
> 2. **"`init` never writes outside the target repo"** … The rule becomes: init
>    never writes outside the repos it **resolved** as the base and its members.
> 3. **The landing consent rule.** … Recorded as a one-plan override, not as a
>    change to the rule.

## Edits

1. Run `vwf:docs-sync` over the branch delta and apply its findings.
2. Apply every `DOCS FALSIFIED:` line the units returned.
3. Reconcile the survey's list, each at the cited lines (line numbers are
   pre-run; re-locate by the quoted text):
   - `site/src/content/docs/plugins/vwf.md` — `:814-815` (takes no arguments;
     shapes the base repo → shapes the base **and every member**), `:858-864`
     (member flags from the members, not the ids), `:866-872` (drop "no
     directory argument to point it elsewhere" / "Shaping a different repository
     means running `/vwf:setup` there"; init still takes no argument, and
     reaches members by walking), `:874-908` (still seven questions; say which
     rows repeat per repo), `:910-937` (one plan with a section per repo, still
     ten counted sections per repo, still eleven passes per repo, one yes),
     `:1018-1046` (the git pass: one question, every repo, the gitlinks),
     `:1066-1096` (re-run doctrine: after a member is added, removed or cloned;
     the empty plan per repo), `:1100-1122` (setup's Step 0 and reshape read
     every member; the six predicates per repo).
   - `site/src/content/docs/plugins/stackgen.md` — `:720-746` (member flags and
     aliases from the member repos; `MEMBERS` unchanged), `:392-400` (setup
     offers init when any member drifted).
   - `site/src/content/docs/how-to/greenfield/single-repo.md` — `:63-75` (seven
     questions, unchanged count; note the per-repo rows only if the page
     mentions members), and **`:76-79`, already stale**: remove "asks which
     branch the remote should default to" (the question was removed 2026-09-06;
     the page should say the landing model and the three-answer commit
     question).
   - `site/src/content/docs/how-to/greenfield/multi-repo.md` — `:46-51` (the
     strongest reversal-1 passage: one init run from the base shapes the base
     and every member; a member added later is picked up by the next reshape),
     `:136-148` (adding a repo: the setup run inside the member still records
     membership; the shape comes from the base's next reshape), `:310-314`
     (`MEMBERS` unchanged; flags and aliases from the members).
   - `site/src/content/docs/how-to/brownfield/onboard-existing-codebase.md` —
     `:82-94` (Step 0 checks every member; one plan, one consent, sections per
     repo).
   - `readme.md:109-114` — reshape reaches every member.
   - `CLAUDE.md:241-258` — the init sentence: shapes the base **and every member
     repo**, one plan, one consent; seven questions unchanged; `:393-396`
     reshape wording.
   - `.claude/skills/vwf-plugin/SKILL.md:64-98` — the init paragraph.
   - `.claude/skills/vwf-plugin/references/skills-and-agents.md:25` — the init
     row: drop "no target argument" only if it now reads as a claim about scope;
     keep "no flags"; add "walks the members"; `:26` setup row; `:38` doctor row
     (six sub-checks per repo).
   - `.claude/skills/vwf-plugin/references/dependencies.md:31-44`.
   - `.claude/skills/stackgen-plugin/SKILL.md:65-70`.
   - `.claude/docs/**` — only if docs-sync finds a passage.
4. Write `docs/memory/decisions/2026-09-13-init-walks-the-members.md` in the
   shape of `2026-09-06-init-behind-setup.md`: **Date**, **Branch**, **Plan**,
   **Reverses** (naming `2026-09-06-init-behind-setup.md`'s "What stays outside"
   bullet on the target directory, and `multi-repo.md:46-51`'s per-repo
   sentence), **Umbrella** `2026-09-05-vwf-init-and-the-repo-shape.md`; sections
   "What was decided before", "What changed" (the seven interview rulings and
   the motivating 95octane observation), "Rejected" (the table from `index.md`),
   "What stays outside" (the Out of scope and Parked lists, and the landing
   override stated as one-plan-only).
5. Run `mise run code:format --fix` over the owned files only (`CLAUDE.md`,
   `readme.md`, `site/src/content/docs/**` and `docs/memory/**` are
   dprint-formatted; the `.claude/skills/**` files are too).

## Verification

- `mise run p:site:check` green (the site build and its link checker).
- `mise run p:plugins:check` green.
- `grep -rn "shape is per repo, not per product" site/src/content/docs readme.md CLAUDE.md .claude`
  returns nothing.
- `grep -rn "Shaping a different repository means running" site/src/content/docs .claude`
  returns nothing.
- `grep -rn "which branch the remote should default to" site/src/content/docs`
  returns nothing.
- `grep -rn "seven questions" CLAUDE.md .claude site/src/content/docs | wc -l`
  is unchanged from before the run (the count is still true).
- `docs/memory/decisions/2026-09-13-init-walks-the-members.md` exists and its
  **Reverses** line names both predecessors.

## Guardrails

- Do not edit any `plugins/**` file — every `DOCS FALSIFIED:` path under
  `plugins/` is reported back as `UNRESOLVED:`, not fixed here.
- Do not touch version files or `.claude-plugin/marketplace.json` (U9).
- Widening a table cell in `CLAUDE.md` or `readme.md` re-pads every row — let
  the formatter do it, never by hand.
- Never end a table cell in a bare `*`.
- The site's link rule and traps are `site/CLAUDE.md` — read before editing a
  page.
- Delete with `rm`, never `git rm`. Stage nothing, commit nothing.

## Commit

`docs: init walks the members — the manual, the repo docs and the decision` —
written by the orchestrator after the wave gate.
