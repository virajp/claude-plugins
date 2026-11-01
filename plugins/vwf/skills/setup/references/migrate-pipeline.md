# The Migrate Pipeline

Read this in mode `migrate`, and when the onboard pipeline's code sub-path hands
over an existing tree. Migration is **state-based**: compare the repo against
what the current format *is* and converge on it. There is no delta ladder, no
per-version procedure, and no support window — a tree stamped `2` and a tree
stamped `22` reconcile the same way, in one pass.

## What "the current format" means

Four sources define it, and none of them is a history:

| Source | Defines |
| --- | --- |
| `${CLAUDE_PLUGIN_ROOT}/assets/templates/` | the skeleton of every doc vwf writes, frontmatter included |
| `${CLAUDE_PLUGIN_ROOT}/assets/examples/blueprint/` | a worked, conformant bundle — the concrete "what good looks like" |
| the blueprint-authoring skill's bars | what a doc must *say* to be complete, and the density budgets |
| `${CLAUDE_PLUGIN_ROOT}/assets/vwf-config.md` | every `.config/vwf.yaml` key, and which are retired |

## The pass

1. **Diff the tree against those four.** Every file that is missing, misplaced,
   misnamed, or carrying a section the current format does not have is one
   entry. Judge the tree as it stands; do not ask how it got there. A
   config whose `enforcement:` block
   lacks `kept_files:` is one entry: it gains `kept_files: {}` and the
   stamp is rewritten with the rest, with no content to migrate, since
   nothing wrote that key before `config_format` 18.
   **`config_format` 22 → 23** — the top-level `answers:` block leaving
   for each repo's `.config/stackgen.yaml` — is **not** an entry here:
   `/vwf:setup reshape` applies it
   ([format lineage](format-lineage.md)), in the release that moves the old
   layout. A config still carrying the block keeps it, and its stamp, and
   the report names `/vwf:setup reshape` as the unlock; a config without the
   block takes the 23 stamp with the rest.
   **`config_format` 21 → 22** retires the editor axis, as entries of their
   own: a config carrying `answers.editor` or `enforcement.editor_keys` loses
   each key, with nothing to convert, since both only decided whether an
   editor fragment landed; and every `.config/vscode.d/*.jsonc` in the base or
   a member is offered for delete, **one row each, defaulting to delete** —
   one of the two kinds of delete this pass offers, because nothing reads
   those files any more; the other is the `23 → 24` removals below. This
   pass **never touches** `.vscode/` — its `settings.json` is
   `/stackgen:tool-config`'s, and nothing else there is vwf's.
   **`config_format` 23 → 24** retires the palace. Offer one numbered removal
   row for each of these that exists: the `memory:` block (`memory.wing`) in
   `.config/vwf.yaml`; each `mempalace.yaml`, in the base or a member, at any
   depth; and each of `docs/memory/planning/`, `docs/memory/runs/` and
   `docs/memory/doctor/`. Each row is applied on consent and declinable on
   its own. The rows are offered **by state, at any stamp**: every migrate
   pass offers them while one of those items is present, whatever the stamp
   reads. The stamp still moves one step at a time — a config held at 22 by
   its `answers:` block stays at 22 — and once it reads 23 it moves to **24**
   whatever the answers, and also when nothing is found. A declined item
   stays where it is: the rows are offered by state on each migrate pass,
   which runs only while a stamp is behind current, so once the stamp reads
   24 setup is current, does not re-enter this step and does not ask again,
   and `/vwf:doctor` reports the item as drift with its remedy. The step reads,
   rewrites and deletes no palace data outside the repo.
2. **Resolve every unrecognised spelling through
   [format lineage](format-lineage.md)** before recording it as a gap. A tree
   written against an older format is usually *correct for that format* and
   wrong only for this one, and the difference between a rename and a hole is
   the difference between a `git mv` and an elicitation.
3. **Fan-outs are verified, never picked.** A retired token mapping to more than
   one current spelling is settled against the platforms-by-evidence and
   consumer-domain rows in [topology detection](topology-detection.md), proposed
   with the evidence quoted, and confirmed by MCQ per
   `${CLAUDE_PLUGIN_ROOT}/assets/elicitation.md` — one decision per round.
4. **Present the whole convergence as a dry-run plan** and wait, per
   [migration & consent](migration-and-consent.md). Move with `git mv` so
   history survives; never delete, save the offered rows step 1 names; merge
   rather than overwrite.
5. **Apply the approved plan**, then hand back to the shared spine — which
   validates the bundle, writes both stamps, and runs
   `/vwf:doctor`, in that order. The pipeline stamps nothing
   itself: a format number written before the tree was checked is a claim about
   a bundle nobody validated.

**Source layout is out of scope.** This pipeline reconciles documentation and
config only. A repo whose code sits somewhere the current topology template
would not put it produces a written recommendation, exactly as in onboarding —
never a move.
