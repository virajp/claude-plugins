# No always-loaded budget for a workflow

**Decision.** The `workflow` archetype of `skill-kit` has no always-loaded
budget,
so `SK003` does not apply to it. The other seven archetypes keep their budgets.

**Why.** `execute` has 18,804 always-loaded words against a budget of 1,500. An
unattended run must load each rule, and a lost rule fails silently. A warning
that
a skill cannot act on has no use.

**Reversal.** This narrows the ruling of 2026-11-05 that each archetype has one
warn-only budget.

**Rejected.** Accept the warning on `execute`. Reduce the count in a second
plan. A
named list in `assets/config.json`. A `metadata` key. A ninth archetype.

**Source.** B111.
