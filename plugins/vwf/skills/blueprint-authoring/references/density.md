# Density — the contract is read by machines

A blueprint doc's audience is `plan`, `execute`, and their subagents. Every line
is re-read on every later turn of whatever loaded it, so length is not free. A
600-line flow doc costs the same attention whether or not the extra 450 lines
carry a decision. Write for that reader, not for a human skimming a spec.

The completeness bars ask *"is this decided?"* and can only ever ask for more.
This reference is the counter-pressure.

**A doc that specifies its contract in fewer lines is better, and one that is
long without deciding more is wrong.**

Both directions are reviewer failures: a doc fails review for being long exactly
as it fails for being thin.

## The test

For every line, ask: **would `plan` or `execute` do something different if this
line were deleted?**

- **Yes** → it is contract. Keep it.
- **No** → it is commentary. Delete it.

Rationale, history, emphasis, and restatement all fail this test. So does a
sentence explaining a table that is already unambiguous.

## Budgets

Soft ceilings per doc, at `status: reviewed`. This is not line-counting for its
own sake. A doc over budget is *almost always* over because of the anti-patterns
below. The number is a trigger to look, not an automatic failure.

| Doc                  | Budget              | Hard smell       |
| -------------------- | ------------------- | ---------------- |
| flow `index.md`      | 120 lines           | > 200            |
| **plugin** flow `index.md` | **160 lines** | > 240            |
| flow `<platform>.md` | 100 lines           | > 160            |
| entity `index.md`    | 120 lines           | > 200            |
| `product.md`         | 120 lines           | > 200            |
| `conventions.md`     | 60 lines per anchor | > 100 per anchor |
| `architecture.md`    | 100 lines           | > 160            |

A doc genuinely over budget with every line passing the test is fine — say so in
the review and move on. A doc over budget because nobody trimmed it is a gap.

**A plugin flow gets 160, not 120, and the extra is structural.** It owes five
sections that a service flow lacks (see the plugin-contract reference). They are host & extension point, invocation surface, what the host
supplies, gates & halts, and artifacts written. They measured at ~40 lines on the
first one authored. Judging it against 120 flags every plugin flow ever written,
and such a budget has stopped measuring anything. The **anti-patterns below still
apply unchanged**: the allowance is for the extra sections, not for looser prose
inside them.

## Anti-patterns

Each of these was measured in a real bundle; the line counts are what they cost
there.

**Rationale in the contract.** "…so the screen shows its correct gated form from
the first frame." The contract is *that* it renders gated. Why is a decision
record, and belongs in a `docs/memory/decisions/` file.

**Revision narration.** "`subscriber` was renamed to `premium`", "removed
entirely", "reverses the prior model". Git records this. A blueprint states what
**is**, never what it used to be. No exceptions — not even in a blockquote.

**Restating a link's target.** Name the entity and link it; do not summarize
what the linked doc says. The reader can follow the edge, and a summary is a
second copy that will drift.

**Emphasis as a substitute for structure.** When every third phrase is bold,
nothing is emphasized. If a step needs five bolded caveats, it is really five
steps, or a table.

**Prose where a table was meant.** Any "X applies to A but not B" comparison is
a table. Give it one column per case, with `yes`, `no` or a limit in each cell.
Examples are feature tiers, per-actor permissions and per-platform differences.
Prose comparisons are both longer and harder to diff.

**Sentence-length diagram labels.** A mermaid edge label is a term
(`cancellation webhook`), not a clause. The diagram is a *view* of the steps or
the lifecycle table. If a label carries a condition the table does not, the
table is what is incomplete.

**Open Questions as a parking lot.** Open Questions holds what blocks *this*
doc's contract. Anything else is out-of-scope and goes to a
`docs/memory/gaps/` file per the parked-scope rule in
`${CLAUDE_PLUGIN_ROOT}/assets/elicitation.md`. It does not go into a contract doc
that every later run must read past.

**Spillover with a cross-reference back.** Splitting one decision across two
sections with links costs more than stating it once in its owning section. Put it where it belongs; do not narrate the split.

## What is never trimmed

Density is not an excuse to drop contract. These stay at any length:

- an acceptance criterion, or a failure/compensation path
- a lifecycle transition, an invariant, or a concurrency rule
- an authorization row, or an audit-recorded marker
- an `UNRESOLVED:` marker — an unfilled decision is reported, never silently cut

Cutting one of these to hit a budget is a worse failure than the budget.
