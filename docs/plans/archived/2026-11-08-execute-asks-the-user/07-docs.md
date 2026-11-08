# U7 — Docs

- **Read first:** `plugins/vwf/skills/docs-sync/SKILL.md`, then each passage
  the facts section lists under *Docs that describe the old behaviour*.
- **Lazy-load:** `plugins/vwf/assets/memory.md` (the decisions-doc shape);
  `plugins/vwf/skills/execute/references/questions.md`.

## Ruling

> D17 — It reverses D9 of
> docs/memory/decisions/2026-10-07-plans-carry-every-answer.md (an uncovered
> decision was a blocking-gap stop, and pause-and-ask was rejected), the
> 'execute asks nothing at run time' rule, and the 'questions that block'
> alternative rejected in 2026-11-06-execution-solo-teams.md. The planners
> keep their full interview: they still ask every question they can before
> the run, and a run question exists only for what the plan missed. The
> session question and the run-level questions of all stay as they are.

> D12 — This plan wins, and B110 stays open. Each question puts the agent's
> recommendation first, so a good recommendation takes one answer.

> D29 — U7 owns both files and rewords each passage so that it does not claim
> the run never asks. The home page is marketing text: keep its tone, remove
> only the false claim.

> D43 — brag-output/** is out of scope: it was a test and is not used. U7 owns
> the four Landing .dc.html design sources under docs/design/site/ (option-a,
> option-b, option-c, final) and removes the false claim from each, changing
> nothing else.

> D44 — (8) U7 owns .claude/skills/skill-kit/references/archetype-workflow.md
> and standard.md and rewords only the unattended-run reason.

The rulings D1 to D11, D18 and D19 to D44 are in `index.json`'s `decisions`; describe the
behaviour as `references/questions.md` now states it, never from memory.

## Edits

1. Run `/vwf:docs-sync` over the run's branch delta and apply its findings,
   plus every `DOCS FALSIFIED:` line the earlier units returned, plus the
   survey list in index.md's facts:
   - `site/src/content/docs/plugins/vwf.md` — every "unattended",
     "autonomous", "asks nothing" and "never asks" passage about execute; the
     GAP and UNRESOLVED descriptions (2449-2452, 2585-2586, 2609-2630,
     2695-2708); the action log's question and answer events and the hook's
     `QUESTION` lines (2775-2776); the pane's waiting state; `all`'s relay.
     Passages about the planner, the LSP answer and `blueprint` condense stay.
   - `site/src/content/docs/how-to/operate/ad-hoc-change.md`,
     `how-to/greenfield/single-repo.md`, `how-to/index.md`,
     `how-to/operate/sessions-and-handoff.md` — "walk away" and "unattended"
     become: the run asks you only what the plan missed, so stay near it.
   - `readme.md` lines 23, 30, 64, 249, 265, 407-410.
   - `CLAUDE.md` line 73 ("asks nothing at run time…") and the *Hooks*
     section's pane sentence: the pane also reads the open questions from the
     action log.
   - `.claude/docs/plugins.md` line 12, if it says execute asks nothing.
   - `site/src/pages/index.astro` lines 34, 132, 139, 150, 181, 246 and
     `site/src/pages/llms.txt.ts` line 14 ("builds unattended",
     "autonomously"), per D29.

   - The four Landing design sources under `docs/design/site/`
     (`option-a-drafting-table`, `option-b-manual`, `option-c-schematic`,
     `final`), per D43: remove the "unattended" or "autonomous" claim about
     the run and change nothing else in each file.

   - `.claude/skills/skill-kit/references/archetype-workflow.md` line 20 and
     `.claude/skills/skill-kit/references/standard.md` line 79: reword only
     the reason "an unattended run" so that it holds for a run that asks at a
     declared gate (D44 (8)). Change no rule.

   The vwf `plugin.json` description is U8's (D33), not this unit's.
   `brag-output/**` is out of scope (D43).
   - `.claude/skills/vwf-plugin/SKILL.md` lines 84-104 and the pane section
     398-446; `.claude/skills/vwf-plugin/references/skills-and-agents.md`
     lines 38 and 72.
2. **`docs/memory/decisions/2026-11-08-execute-asks-the-user.md`** — new, per
   `memory.md`: the reversal of D17, the rulings D1 to D18 in short with what
   each rejected, and the platform facts of 2026-11-08 from the facts section.

## Verification

- `mise x -- mise run code:format` and `mise x -- mise run code:lint` pass.
- `grep -rn "asks nothing at run time\|asks the user nothing" readme.md CLAUDE.md site/src/content/docs .claude`
  finds nothing that describes `/vwf:execute`.
- `mise x -- mise run p:site:check` passes (the link checker).

## Guardrails

- Do not touch `plugins/**`; a falsified passage there is a `DOCS FALSIFIED:`
  line.
- `readme.md`, `CLAUDE.md` and `site/**` are dprint's: widening one table cell
  re-pads the table, and a cell that ends in `*` oscillates between the
  formatter and the linter.
- Delete with `rm`, never `git rm`.

## Commit

`docs: describe the run that asks the user when the plan is silent`
