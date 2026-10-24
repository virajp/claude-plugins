# Decision — stackgen packs hand their toolchain to bootstrap

**Date** 2026-10-22 to 2026-10-24 · **Branch** `b102-packs` · **Plan** none —
the user ruled to do the work in place, without `/vwf:change-plan` · **A piece
of backlog item B102**

## What was decided before

On 2026-10-18 the user approved three plans for B102: packs hand off to
bootstrap, vwf hands off to bootstrap, and retire `stackgen:tool-config`. A
fourth plan, `2026-10-19-stackgen-gap-fixes`, held the gaps of the Kotlin,
Android Compose and OS device frames plans. bootstrap then shipped differently
from what the plans assumed, so their rulings went stale. The four plans were
archived not run (`67070b84`, `65fbed2c`).

## Reversals

All were confirmed by the user.

- `docs/memory/decisions/2026-10-05-packs-ship-templates-and-subtasks.md` —
  packs ship no `templates/` tier and no gate subtasks.
- `docs/memory/decisions/2026-10-05-pack-values-and-plugin-subtasks.md` — the
  `values:` key and the `setup/ai/<slug>` subtask route are gone.
- `docs/memory/decisions/2026-10-07-fnox-development-only.md` — the fnox payload
  goes; bootstrap replaces it.
- `docs/memory/decisions/2026-09-26-tool-config.md`, the part about packs —
  packs no longer call `stackgen:tool-config`.
- The `bootstrap_tools:` pack key and the pinned tool list in the checker,
  approved on 2026-10-23, were reversed the same day: "Embedding the tools that
  `bootstrap` provides in this repo will create drift in long run."

## The decisions

**The boundary.** bootstrap owns the tool pins, the gates and their configs, the
generic tasks, the pre-commit hooks, the secrets setup and the Claude plugin
installs. A pack keeps only what is specific to the repo: its `test/*` tasks,
its `p/_project/*` tasks, and the allowlisted root files (`wrangler.jsonc`).

**No bootstrap tool name in this repo.** The materializer clones bootstrap and
reads its `tools/` and `docs/sync/tools/*.md` to choose the tools a composition
needs. It sends `add tools` and `remove tools` instructions through bootstrap's
`docs/sync/vwf.md`, and never edits `.config/bootstrap.toml` itself. The
lockfile's `bootstrap:` block records only the tools and plugins it asked for.
The procedure is
`plugins/stackgen/skills/stackgen-stack-template/references/bootstrap-handoff.md`.

**Claude plugins.** A pack names its plugin in a `## Claude plugins` section of
its `conventions.md`. The materializer sends it as `add user plugins`. Rejected:
a `pack.yaml` key; dropping the plugin.

**Machine values.** `XCODE_VERSION`, `SIMULATOR_*`, `COMPILE_SDK` and
`EMULATOR_IMAGE` are found by bootstrap's tasks. A repo overrides one in the
`[env]` of `.config/mise/conf.d/zz-repo/mise.<env>.toml`. `/vwf:setup` no longer
pins them.

**`conditional:` is removed.** No pack used it. The `answers:` input and the
lockfile's `skipped:` list go with it.

**The pnpm `.npmrc` and `code:format:pnpm` are deleted** with no replacement.

**Checker rule 11 is an allowlist.** Under `.config/`, a pack's `config/` tier
may ship only `.config/mise/tasks/test/` and `.config/mise/tasks/p/_project/`. A
`templates/` tier and the `tool-config:`, `machine_env:`, `values:` and
`conditional:` keys are refused. Rejected: a denylist of bootstrap's paths (it
drifts), and a check of the shape only.

**Gap fixes folded in.** The still-needed rulings of the gap-fixes plan were
done here: D1, D3, D4, D6, D7, D8, D9, D10, D11, D12, D13 and D16. Gaps 15 and
16c are closed by bootstrap's Android deps task.

## Left for later phases

- Phase 2: vwf `init`, `setup`, `doctor` and `git-workflow` move onto bootstrap.
  `init` adopts a repo through a `bootstrap: adopt` instruction, which bootstrap
  must add to `docs/sync/vwf.md` first.
- Phase 3: delete `stackgen:tool-config`, its tests and fixtures, and its
  checker rules. miserc, `claude-status.json`, `code:count` and `code:check:all`
  are lost with it; the user accepted the loss.
