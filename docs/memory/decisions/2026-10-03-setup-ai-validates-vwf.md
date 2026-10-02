# Decision — `setup:ai` checks for vwf, installs it at user scope only when absent, and upgrades everything

**Date** 2026-10-03 · **Branch** `2026-10-03-setup-ai-validates-vwf` (worktree
`.worktrees/2026-10-03-setup-ai-validates-vwf`) · **Plan**
[`docs/plans/2026-10-03-setup-ai-validates-vwf/`](../../plans/2026-10-03-setup-ai-validates-vwf/index.md)
· **Backlog** B86 · **Supersedes**
[`2026-09-12-setup-ai-is-project-scope-through-claude.md`](./2026-09-12-setup-ai-is-project-scope-through-claude.md)
· **Reverses** J1 of
[`2026-10-01-installer-plugins-only.md`](./2026-10-01-installer-plugins-only.md),
in part

## What was decided before

The 2026-09-12 decision made the shipped `setup:ai` install the repo's required
plugins at **project** scope, through `claude plugin …` alone, so "a
collaborator who never installed it gets it from the checkout". A copy at user
scope was ruled "not a substitute". `/vwf:init`'s question 5 filled two marked
positions, `EXTRA_MARKETPLACES` and `EXTRA_PLUGINS`, seeded by the task's
`--inventory` mode, and `--user` flipped every scope. The task also ran
`graphify install --platform claude` and hinted at the statusline package.

J1 of the 2026-10-01 decision then removed graphify's wiring from the installer
CLI because "a shaped repo's `setup:ai` wires it for the agent".

## What changed

The user, verbatim:

> - This task must first check whether `vwf` is installed at user-level or
>   project-level
> - If not, then only install `vwf` using the installer and only at user-level
> - This task will not install any extra plugins (for now)
> - There must not be any guard for this, only doctraine for LLM to create/sync
>   this task. This gives the user flexibility to extend this task for any
>   additional use they deem fit
> - Whether or not the task installs the `vwf` plugin, it must continue with the
>   rest: update marketplaces and upgrade all plugins to latest version

> In greenfield project, tool simply copyies the assets whereas in brownfield
> LLM renders the task as per requirement. Other stackgen tools can add their
> required plugins

As it landed:

- **The vwf check (D1).** The task reads `claude plugin list --json`.
  `vwf@virajp-plugins` counts as installed at **user** scope, or at **local** or
  **project** scope whose `projectPath` resolves to this repo's root. Installed:
  nothing more for vwf. Absent: it runs
  `pnpx @virajp.dev/claude-plugins@latest --all`, which registers the
  marketplace and installs vwf and stackgen at **user** scope. `@latest` because
  a bare name can replay a cached old version and an exact one needs a bump
  every release. It never installs at project scope.
- **Always continue (D2).** Then, whatever happened above:
  `claude plugin marketplace update` for every registered marketplace,
  `claude plugin update --scope <its scope> <id>` for every plugin installed at
  a scope that counts, and `claude plugin autoremove --scope project --yes`.
  Every `claude` and `pnpx` call warns and continues; none aborts the task. No
  `claude` on `PATH` still warns and exits 0.
- **Pack plugins (D5).** A pack asks for a plugin with a structured
  `tool-config:` entry,
  `{ tool: mise, verb: add-plugin, plugin: <name>@<marketplace>, source: <owner/repo> }`.
  tool-config writes it into `setup/ai` inside that pack's block, and the task
  treats it the same as vwf: installed at a scope that counts, nothing; else add
  its marketplace when it is not registered, then install at user scope. The
  design-tool/claude-code pack is the first, for `taste-skill@taste-skill`.
- **No guard (D7).** A repo with no `setup/ai` gets the shipped asset. One that
  tool-config landed and nobody edited takes the newer shipped task, naming any
  filled `EXTRA_*` entry it drops. One edited by hand, or unrecorded and
  different, is the repo's own: tool-config never overwrites it and never checks
  it for drift, returns one note, and the agent renders any missing step into it
  from the doctrine in tool-config's mise reference, keeping every line the user
  wrote. No test or checker asserts its content.
- **Dropped (D4, D8).** `EXTRA_MARKETPLACES`, `EXTRA_PLUGINS`, `--inventory`,
  `--user`, tool-config's `--plugin-sources` and `--plugins` keys, init's
  agent-plugins question (later questions renumber down by one), the graphify
  wiring and the statusline hint.

## What this reverses

- **The 2026-09-12 decision, superseded whole on scope.** Project scope was
  chosen so a checkout carried its plugin set to a collaborator; the user now
  rules that the toolkit installs only vwf, at user scope, and only when no
  scope already serves the repo. Its Claude-commands-only rule goes too: the
  task calls the installer when vwf is absent. Its source-agnostic marketplace
  handling survives in a different form: `marketplace update` takes no name, so
  a machine registered from `./.dev-marketplace` is served the same.
- **J1 of 2026-10-01, in part.** J1 removed graphify's wiring from the installer
  on the grounds that `setup:ai` did it. This plan drops it from `setup:ai` too,
  so **no caller remains: nothing in the toolkit now runs
  `graphify install --platform claude`**. Wiring graphify for the agent is the
  user's to do. The graph itself is still refreshed by a shaped repo's
  pre-commit `post-commit` hook, and `/vwf:doctor` still reports a missing
  `graphify` as blocking.

## The alternatives rejected

- **Installing at project scope**, for vwf or a pack's plugin — the user's
  ruling is user scope only.
- **Failing when vwf is absent**, or stopping after installing it — the task
  always goes on to update and upgrade.
- **Updating only the required set at one scope** — every installed plugin is
  upgraded at the scope it has.
- **An exact or bare installer pin** — an exact one needs a bump every release;
  a bare one can replay a cached package.
- **Keeping init's agent-plugins question and the arrays** — no extra plugin of
  the user's choosing "(for now)".
- **A conflict row or drift check on a brownfield `setup/ai`** — it would
  overwrite the user's extensions.
- **Keeping the graphify wiring or the statusline hint** in the task.

## What stays outside

- **This repo's own `.config/mise/tasks/setup/ai`** — the maintainer edits it by
  hand; it already upgrades everything and does not check for vwf.
- **A second clone of one repo** may install vwf at user scope again when the
  first clone's install is at project scope for its own path — accepted.
- **A vwf-installed check in `/vwf:doctor`** — not asked for.
