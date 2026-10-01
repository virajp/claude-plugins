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
   entry. Judge the tree as it stands; do not ask how it got there. The root
   `.graphifyignore` is part of the current shape too — absent, or missing the
   vwf-standard excludes (`${CLAUDE_PLUGIN_ROOT}/assets/graphify.md`), is one entry
   like any other. A config whose `enforcement:` block lacks `kept_files:` is
   one entry as well: it gains `kept_files: {}` and the stamp is rewritten with
   the rest, with no content to migrate, since nothing wrote that key before
   `config_format` 18. A config with no **top-level** `answers:` block is one
   entry on the same terms — it gains the block, from the answers this run
   asks (the update-bot round) and reads (the forge from each `origin`, the
   provider from the lockfile), every key present and `none` where no answer
   was picked; a block already there is left alone, since nothing wrote it
   before `config_format` 21 and the pass invents no answer to fill a key.
   **`config_format` 21 → 22** retires the editor axis, as entries of their
   own: a config carrying `answers.editor` or `enforcement.editor_keys` loses
   each key, with nothing to convert, since both only decided whether an
   editor fragment landed; and every `.config/vscode.d/*.jsonc` in the base or
   a member is offered for delete, **one row each, defaulting to delete** —
   the one delete this pass offers, because nothing reads those files any
   more. `.vscode/` is the user's and is **never touched**: not its files,
   not a block an earlier `/vwf:init` composed there, not its markers.
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
