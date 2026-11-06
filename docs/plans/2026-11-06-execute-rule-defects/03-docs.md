# U3 — Docs

- **Read first:** `plugins/vwf/skills/docs-sync/SKILL.md`.

## Ruling

> D7: H6 goes: an all-blocking gap ends at the final report, as
> references/blocking.md says. H4 stays a pause, as references/pause.md says, so
> references/blocking.md stops treating a dead agent as an isolated block. Do not
> renumber the other H ids.

## Edits

1. Run `vwf:docs-sync` over the run's branch delta. Apply its findings, and each
   `DOCS FALSIFIED:` line that the earlier units returned.
2. **`site/src/content/docs/plugins/vwf.md`** — at line 207, remove the all-blocking
   gap from the list of stops. It is now one of the reasons for the final report.
   At lines 2606-2607, remove "a gap that blocks *all* remaining work". Keep "a stage
   subagent dying twice on the same unit" at line 2601, because it stays a stop.
3. **`docs/memory/decisions/2026-11-06-execute-stops-at-the-final-report.md`** —
   write the reversal, per `plugins/vwf/assets/memory.md`. State the old rule, the
   new rule, the reason (one stop lists every ruling together), and the rejected
   alternatives from the ruling's decision, D7 in the plan's `index.json`.

If `readme.md` or `CLAUDE.md` has no falsified passage, change neither.

## Verification

- `mise x -- mise run code:format`
- `mise x -- mise run code:lint`
- The decisions doc exists.

## Guardrails

- Change only a passage that this plan falsifies. Describe no new behavior.
- `readme.md`, `CLAUDE.md` and `site/` are dprint-formatted. Run
  `mise x -- mise run code:format -- --fix <file>` on each file that you changed.
- Do not edit an old decision doc. It is history.

## Commit

`docs: reconcile the docs with the rules of execute`
