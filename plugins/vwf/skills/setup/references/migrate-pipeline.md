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
   reads the block: a repo's answers live in its `.config/bootstrap/`,
   read and written through `bootstrap config`. A config still carrying the
   block keeps it, and its stamp, and the report says the block can be
   removed by hand; a config without the block takes the 23 stamp with the
   rest.
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
   **`config_format` 26 → 27** moves the repo facts to bootstrap's
   `.config/bootstrap/repo.toml`, each key as the
   [format lineage](format-lineage.md) row for 27 maps it. It runs once the
   stamp reads 26, including when this pass just moved it there, and reaches
   bootstrap only through its CLI, by
   `${CLAUDE_PLUGIN_ROOT}/assets/bootstrap-contract.md`. Each value and each
   name in a key path of this step follows `## Passing values` of that file.
   **Check the names first.** Before the first write, check every name that
   the step puts into a key path: each member name of `repo.members.<name>`,
   and each `<env>` and `<project>` of `repo.deploy.<env>.<project>`. A bad
   name stops the step for that repo before any write. The report names it
   and the rename route: for a member or an env name, rename it in
   `.config/vwf.yaml` by hand (for a submodule member, also its name in
   `.gitmodules`); for a project name, rename it by hand in
   `docs/blueprint/registry.yaml` and in each `projects.<name>` key of
   `.config/vwf.yaml`; then run `/vwf:setup` again. `vwf.yaml` keeps the
   key, the stamp stays at 26, and the next `/vwf:setup` offers the step
   again. Other repos continue. **The base step:**
   1. For each moved key, read `bootstrap config get <repo key> --json`.
   2. If its `source` is `default` (no value), run
      `bootstrap config set <repo key> '<value>' --json` with the `vwf.yaml`
      value, a list or a table as JSON, quoted per `## Passing values`.
   3. If the two values are the same, only remove the key from `vwf.yaml`.
   4. If they differ, ask the user which to keep, one key at a time, per
      `${CLAUDE_PLUGIN_ROOT}/assets/elicitation.md`, and set the kept value.
   5. Remove the moved keys from `vwf.yaml`, add `projects.<p>.repo` from
      `members[].projects`, and set `config_format: 27`.
   6. Run `bootstrap sync --json` in the base, since a set of
      `repo.product_name` or `repo.members` is a key a sync reads.

   **Members are compared field by field.** A member that `repo.members` does
   not list yet is set as one whole table:
   `bootstrap config set repo.members.<name> '<JSON table>' --json`. A member
   it lists is set one field at a time:
   `bootstrap config set repo.members.<name>.<field> '<value>' --json`. One
   difference is a known result of bootstrap's own `init`, which wrote each old
   member as `sibling`: when `linkage` is `submodule`, `.gitmodules` lists the
   member's path and `repo.toml` says `sibling`, set `submodule` with no
   question. Every other difference asks. A member with no `url` takes it
   from `.gitmodules` (a submodule) or `git -C <folder> remote get-url origin`;
   when neither gives one, ask the user.

   **Projects.** A project a member lists with no `projects.<p>` entry gets
   one holding only `repo`, and the report names it. A project two members
   list stops the base step with one question: which member owns it.

   **Then each present member.** Delete its `.config/vwf-membership.yaml` once
   `bootstrap config get repo.home --json`, run in that member, resolves to
   the base. A submodule or sibling member whose back-link does not resolve
   keeps the file, and the report names it with the fix: from the base repo,
   run `setup:configs` with the member's flag (`--<member>`). A member with no
   `.config/bootstrap/` keeps the file too, and the report names the fix: run
   `bootstrap init` in the member, then, from the base repo, `setup:configs`
   with the member's flag. A `folder` member is a folder of the base repo's
   tree and has no `vwf-membership.yaml` to delete.

   **Order and commits.** The base step's sets (steps 1-6) come first; then
   each member commits the deletion of its `vwf-membership.yaml` through
   `/vwf:git-workflow`; then the base makes its step commit — the spine's
   approval-gate commit, after its validation and doctor steps — carrying
   `vwf.yaml`, what bootstrap wrote, the sync's output and the new submodule
   pointers. A failed `bootstrap` call stops that repo's step with
   bootstrap's `errors` messages, and nothing of that repo's step is
   committed. The step's questions come before the plan, and each repo is one
   consent row of it, per [migration and consent](migration-and-consent.md):
   a declined row writes nothing, the stamp stays at 26, and the next migrate
   pass offers the step again.

   **`config_format` 27 → 28** slims the stack to a decision record and moves
   each project's folder to bootstrap, as the
   [format lineage](format-lineage.md) rows for 28 and for `blueprint_format`
   26 map them. It runs once the stamp reads 27, including when this pass just
   moved it there, and reaches bootstrap only through its CLI, by
   `${CLAUDE_PLUGIN_ROOT}/assets/bootstrap-contract.md`. Each value and each
   name in a key path of this step follows `## Passing values` of that file.
   **Check the names first.** Before this repo's first write, check every
   name that the step puts into a key path: each project name of
   `repo.projects.<name>`, each `<tool>` of `tools.<tool>.projects` and each
   `<old name>` it unsets. A bad name stops the step for this repo before any
   write. The report names it and, for a project name, the rename route:
   rename it by hand in `docs/blueprint/registry.yaml` and in each
   `projects.<name>` key of `.config/vwf.yaml`, then run `/vwf:setup` again.
   `vwf.yaml` keeps the key, the stamp stays at 27, and the next
   `/vwf:setup` offers the step again. Other repos continue.
   **The step, per repo of the product** — each present member, then the
   base:
   1. For each registry project this repo holds, run
      `bootstrap config set repo.projects.<name> '{"folder":"<path>"}' --json`
      in this repo, with the folder its registry `path` gives (below).
   2. Run `bootstrap detect --json` and show its `projects` and `links`. On
      the user's yes, run `bootstrap detect --add --yes --json`.
   3. Report each project of this repo that no tool of category `languages`
      links, with the fix: `bootstrap add tool <tool>`, then
      `bootstrap detect --add`, a form whose `<tool>` follows
      `## Passing values`. A project whose platforms are all `iac`,
      `cicd` or `misc` is skipped: it has no language tool by nature. The
      report is a `degraded` row like any other, pinned `template` or not:
      it never stops the step, which continues.
   4. Rename `backing_template` → `services` and `deploy_template` →
      `deploy` in every `projects.<name>.stack`, each slug kept as it is.
   5. Remove `languages`, `package_manager`, `repo.stack.package_manager`,
      `repo.stack.tools` and the workspace `harness` block. Report each
      non-canonical task name that block recorded, with the canonical name of
      `${CLAUDE_PLUGIN_ROOT}/assets/harness.md`, so the user renames that
      task; nothing reads the old name any more.
      `projects.<name>.harness.health` stays.
   6. Remove `path` from every project of `docs/blueprint/registry.yaml`, and
      set `config_format: 28`, `blueprint_format: 26` and `vwf_registry: 3`.
   7. Run `bootstrap sync --json` in this repo, then commit as the `26 → 27`
      step does.

   Steps 1, 2, 3 and 7 run in each repo that holds a project; steps 4 to 6
   edit the base's `.config/vwf.yaml` and registry, and run in the base step
   alone, since a member carries no `vwf.yaml`.

   **The folder.** A registry `path` is base-relative; the folder is relative
   to the repo that holds the project — the member `projects.<name>.repo`
   names, else the base. Strip that member's `folder` prefix from the path; a
   path equal to the prefix becomes `.`. A path in the base keeps its
   spelling. A path outside every repo of the product stops that repo's step
   with one question, per `${CLAUDE_PLUGIN_ROOT}/assets/elicitation.md`. A
   project name that is not kebab case stops the step with a report naming
   it. When `repo.projects` already has an entry:
   - under the same name at another folder, ask which folder to keep, as the
     `26 → 27` step asks where two values differ;
   - under another name at the same folder, vwf's name wins: set the entry
     under the registry name, move each tool link to it with
     `bootstrap config set tools.<tool>.projects '<JSON list>' --json`, then
     `bootstrap config unset repo.projects.<old name> --json`;
   - under the same name at the same folder, set nothing.

   A project whose folder does not exist yet takes no `config set`: the
   report shows the line to run once it does,
   `bootstrap config set repo.projects.<name> '{"folder":"<path>"}' --json`,
   with the name checked and the value quoted per `## Passing values`, and
   `/vwf:doctor` reports the missing entry as `degraded` until then.

   **Order and commits.** Each member's step runs and commits first, through
   `/vwf:git-workflow`, carrying what bootstrap wrote and the sync's output;
   then the base makes its step commit — the spine's approval-gate commit,
   after its validation and doctor steps — carrying `vwf.yaml`, the registry,
   what bootstrap wrote, the sync's output and the new submodule pointers.
   The base's step 6 and its stamps run only after every member step
   succeeds: a member step that fails stops the base step too, so the
   registry keeps each `path` a re-run still needs. A member that is not on
   this machine stops the migration: the report names the member to clone,
   and the base stays at 27 until it is present. A failed `bootstrap` call
   stops that repo's step with bootstrap's `errors` messages, and nothing of
   that repo's step is committed. The step's questions come before the plan,
   and each repo is one consent row of it, per
   [migration and consent](migration-and-consent.md): a declined row writes
   nothing, the stamp stays at 27, and the next migrate pass offers the step
   again.
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
