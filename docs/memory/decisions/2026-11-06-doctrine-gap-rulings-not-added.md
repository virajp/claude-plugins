DECISION 2026-09-02 ★3 | vwf doctrine gaps: what was deliberately not added |
canary rollout and a STRIDE document stay out; validation rules never halt | alt
mandate canary, alt full threat-model doc (both rejected)

**Source plan** `2026-09-02-doctrine-gaps`.

The plan added seven doctrine drafts to vwf (reliability core, expand and
contract, release safety, metrics wiring, validation, security, incidents).
Five points were rulings, not edits. The shipped doctrine does not state
the two "not added" items, so a later reader needs this record.

- Canary or percentage rollout is not mandated. The pipeline requires a
  rollback guarantee only (`pipeline/rollback-path`). A search of
  `plugins/vwf` finds no mention of canary.
- No STRIDE or threat-model document. Security doctrine is abuse-case criteria
  on flows plus threat notes in the registry. No mention of STRIDE exists in
  `plugins/vwf`.
- The riskiest-assumption validation rule is reviewer-flagged. It is satisfied
  by `accepted-risk — <why>` and never halts a run.
- Experiment records are optional. They are mandatory only for goals that are
  measured by a counter.
- The core foundation set is users, observability, reliability targets, and
  disaster recovery with backup. Other foundations are elective.

Rule ids the plan introduced, to keep spelled the same everywhere:
`pipeline/load-proven`, `pipeline/rollback-path`, `pipeline/dependency-audit`,
`baseline/expand-contract`.

The plan recorded no reason for the rulings beyond "recommended". The source
proposals lived in a scratchpad file that is gone.
