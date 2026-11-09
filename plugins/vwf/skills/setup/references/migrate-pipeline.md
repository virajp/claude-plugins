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
   **`config_format` 22 → 23** — the top-level `answers:` block retiring
   ([format lineage](format-lineage.md)) — is **not** an entry here. Nothing
   reads the block: a repo's answers live in its `.config/bootstrap.toml`,
   written by bootstrap. A config still carrying the block keeps it, and its
   stamp, and the report says the block can be removed by hand; a config
   without the block takes the 23 stamp with the rest.
   **`config_format` 21 → 22** retires the editor axis, as entries of their
   own: a config carrying `answers.editor` or `enforcement.editor_keys` loses
   each key, with nothing to convert, since both only decided whether an
   editor fragment landed; and every `.config/vscode.d/*.jsonc` in the base or
   a member is offered for delete, **one row each, defaulting to delete** —
   one of the two kinds of delete this pass offers, because nothing reads
   those files any more; the other is the `23 → 24` removals below. This
   pass **never touches** `.vscode/` — its `settings.json` is
   bootstrap's, and nothing else there is vwf's.
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
   **`config_format` 24 → 25** adds `addons:` and moves into it each optional
   tool the repo already records. It runs once the stamp reads 24, including
   when this pass just moved it there; a config held at 22 takes none of it
   yet. Build the list as the
   [format lineage](format-lineage.md) row for 25 states, reading the
   `.claude/stackgen/lock.yaml` of every repo of the product cloned locally,
   with one warning line per member that is not. The step asks no question:
   it adds no retired tool to `addons:`, so a repo at 24 is never asked about a
   tool the `25 → 26` step then removes. The result is **one numbered row** in
   the dry-run plan: the `addons:` list it writes, each `backing_template`
   entry it removes, a list it empties reading `[]`, and each repo — the base
   and each member — whose lockfile records the `capability-provider/notion`
   pack, where the stack adapter's plain `remove:` takes that component's
   skills and server. On consent it is applied and the stamp moves to
   **25**, unless a member that records the pack is not cloned locally: that
   member is a part not yet applied, the stamp stays at 24 and the next pass
   offers only that part. A declined row leaves the config and the stamp at 24,
   since a 25 stamp over a slug left in `backing_template` would claim a move
   that did not happen, and the next migrate pass offers it again. The
   lockfile's `local_plugin` rename is stackgen's, behind its own consent, run
   by the [materialize pass](materialize.md) that follows.
   **`config_format` 25 → 26** makes every MCP server the user's to install.
   It runs once the stamp reads 25, including when this pass just moved it
   there, and has the two parts the [format lineage](format-lineage.md) row for
   26 states. The **repo part** is this step: in each repo whose
   `.claude/stackgen/lock.yaml` names the component — the base and each member,
   setup calling the stack adapter inside each member as it materializes
   members — plain `remove:` for each retired tool and its `addons:` entry;
   the row's one re-pin question, asked before the plan is shown, for every
   project pinned to `claude-design`, re-pinned to claude-code, lovable or
   stitch, then plain `remove: claude-design`, the picked tool's materialize
   and the cleared `design.*` values; and one row that deletes every MCP
   record left in each lockfile directly, whichever slug recorded it or none,
   so no MCP record survives the migration. Each is a numbered row of the
   dry-run plan; setup passes the consent to each `remove:` call it makes.
   Each accepted row is applied and stays, a declined row writes nothing, and a
   member that is not cloned locally is a row not yet applied. The stamp moves
   to **26** only once every row is applied; until then each migrate pass
   offers only the rows that remain, since every row is idempotent. The
   **machine part** is not a migrate row: it runs on every `/vwf:setup` run,
   beside the claims reconcile in the [materialize pass](materialize.md).
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
