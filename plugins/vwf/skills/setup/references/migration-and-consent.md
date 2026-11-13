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
choice and the reason) and not re-proposed on later runs. A declined `iac`
extraction is exactly
`enforcement.rules.topology/iac-own-repo/<project>`, set to
`{ waived: true, reason: <one line> }`. It settles the proposal, not
the finding: `/vwf:doctor` keeps reporting the `iac` own-repo case as a
persistent warning.

**`config_format` 24 → 25 takes one consent line and no question.** The
consent line is one row of the plan: the `addons:` list, the
`backing_template` entries it removes, and each repo where the stack adapter's
`remove:` takes the `capability-provider/notion` component. A decline is not
recorded under `enforcement:` and is offered again on the next migrate pass,
because the stamp stays at 24. What the materialize pass that follows does to
the lockfile is stackgen's, under stackgen's own consent.

**`config_format` 25 → 26 takes one question and one consent per part.** The
question is the [format lineage](format-lineage.md) row for 26's re-pin: one
MCQ naming every project pinned to `claude-design`, offering claude-code (the
default, with `taste-skill` offered for `addons:`, yes the default), lovable
and stitch, asked before the plan is shown; its answer applies to every project
it names. Each repo-part row of the plan is consented on its own, and setup
passes that consent to each `remove:` call it makes, so the stack adapter asks
no second time. A declined row is not recorded under `enforcement:`: it writes
nothing, the stamp stays at 25, and the next migrate pass offers only the rows
that remain. The machine part is one more consent, asked on every
`/vwf:setup` run while this machine's stack plugin manifest holds an MCP server
key: it lists every key and the other repos that claim one, and a decline
writes nothing and is offered again on the next run.

**Idempotent re-run:** this governs the migrate pipeline's doc reconciliation,
not structural change. Detect what already conforms and reconcile only what
drifted; a conforming tree produces an empty plan.
