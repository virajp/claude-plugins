# Migration & Consent

Onboarding and migration create and move **documentation** — and only with
consent.

**Always:**

- Produce a **dry-run plan** first: every file created, moved, or updated,
  grouped by kind (docs scaffold / config / CLAUDE.md / README / tooling).
  Nothing is written until the plan is approved.
- Work in an isolated **git-workflow worktree**. Keep it local; do not push.
- **Never delete.** Supersede by moving; leave originals discoverable. Never
  overwrite a file without consent — merge instead.
- **Move, don't rewrite** — a doc move is `git mv`, so history survives. Touch
  the links a move breaks, and nothing else.

**Source layout is never moved.** Anything that would relocate code — in-repo
grouping (`projects/`, `packages/`, project naming) as much as anything crossing
a repo boundary, such as splitting a repo into base plus members, or extracting
an `iac` project into its own — is a **written recommendation**, never an
action. A docs tool that moves source is one that can break a build it cannot
test, and a repo split is the least reversible thing setup could do.

A decline is recorded in `.config/vwf.yaml` under `enforcement:` (with the
choice and the reason) and not re-proposed on later runs. It settles the
proposal, not the finding: `/vwf:doctor` keeps reporting the
`iac` own-repo case as a persistent warning.

**`config_format` 24 → 25 takes one question and one consent line.** The
question is the yes/no the [format lineage](format-lineage.md) row for 25
states, about the MCP server vwf's manifest shipped, asked before the plan is
shown, and its answer is part of what the plan lists. The consent line is one
row of the plan: the `addons:` list and the `backing_template` entries it
removes. A decline is not recorded under `enforcement:` and is offered again on
the next migrate pass, because the stamp stays at 24. What the migration does to
the lockfile and to `.mcp.json` is stackgen's, under stackgen's own consent, in
the materialize pass that follows.

**Idempotent re-run:** this governs the migrate pipeline's doc reconciliation,
not structural change. Detect what already conforms and reconcile only what
drifted; a conforming tree produces an empty plan.
