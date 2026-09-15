# Decision — `setup:ai` reconciles the repo's plugins at project scope, through Claude's own commands

**Date** 2026-09-12 · **Branch** `2026-09-12-setup-ai` (worktree
`.worktrees/2026-09-12-setup-ai`) · **Plan**
[`docs/plans/2026-09-12-setup-ai/`](../../plans/2026-09-12-setup-ai/index.md) ·
**Reverses** D22 of
[`docs/plans/archived/2026-09-05-vwf-init/index.md`](../../plans/archived/2026-09-05-vwf-init/index.md),
*"`code:ai`"* · **Umbrella**
[`2026-09-05-vwf-init-and-the-repo-shape.md`](./2026-09-05-vwf-init-and-the-repo-shape.md)

## What was decided before

D22 of the 2026-09-05 init plan gave the toolchain pack a plugin task —
`code:ai` then, `setup:ai` after the task-library plan renamed it — whose job
was to register the marketplace and then **run the installer CLI**,
`pnpx @virajp.dev/claude-plugins`, for `vwf` (which pulls `stackgen`), at
**user** scope by default with `--project` as the exception, followed by
`claude plugin autoremove`. Two arrays, `EXTRA_MARKETPLACES` and
`EXTRA_PLUGINS`, sat in the file for a repo that needed more, and nothing filled
them.

## What was measured

The user ran `/vwf:setup` on 95octane on 2026-09-12 and read the task that would
replace the repo's own. Three things were wrong with it at once:

- **It installed less than what it replaced.** 95octane's hand-written task
  installed the official marketplace, ten project plugins and the statusline.
  The pack's installed `vwf` alone, and the two arrays that were supposed to
  carry the rest had no filler — no question asked for them, so they stayed
  empty on every repo forever.
- **`pnpx` breaks the machine that authors the plugins.** The installer's
  marketplace source is hardcoded to `virajp/claude-plugins`. Measured
  hermetically the same day under a throwaway `CLAUDE_CONFIG_DIR`, adding that
  source while the name `virajp-plugins` is registered from a directory fails
  outright: *"Cannot add marketplace "virajp-plugins": its network source
  differs from the one declared for it in settings"*. A maintainer registered
  against `./.dev-marketplace` could not run the task the packs ship.
- **Scope was backwards.** A user-scope install follows the person between
  repos; the plugin set the task reconciles is the **repo's**.

## What changed

**Claude's own commands and nothing else.** The task runs no package runner and
no wrapper CLI. It reads `claude plugin marketplace list --json`, and for the
marketplace and every extra the repo names: registered under that **name** —
whatever source it was registered from — is `marketplace update`; not registered
is `marketplace add <source>`. The source is deliberately not compared. That one
rule is the whole of the two-mode guarantee, in the user's words:

> If `setup:ai` uses claude commands then it ideally should work in both cases.

A failed marketplace step is now fatal rather than swallowed with `|| true`:
every plugin step after it resolves through one of those names, and "unknown
marketplace" repeated once per plugin says less than the one failure that caused
it. The **official marketplace is never added** — it ships with Claude Code and
is kept current by the installer, so adding it is at best a no-op.

**Project scope by default**, on the user's ruling:

> `setup:ai` must only focus on the plugins required for the repo and ideally
> not touch the user-level plugins. There might be exceptions but rare.

Each required plugin is installed at project scope if absent there and updated
if present; `autoremove` runs for that one scope. A copy at user scope is
**not** a substitute — the point of project scope is that the repo's own
settings declare the plugin, so a collaborator who never installed it gets it
from the checkout. Nothing at user scope is installed, updated or removed.
`--user` is the rare exception the ruling allows for, and it flips every
`--scope`.

**The two slots get a filler.** `EXTRA_MARKETPLACES` and `EXTRA_PLUGINS` are now
**marked positions** in the pack's commented-template style, and `/vwf:init`'s
new **question 5** fills them — seeded by the machine itself. The task gained an
`--inventory` mode: one row per registered marketplace other than this one as
`<source-ref>|<name>`, then one row per installed plugin as
`<name>@<marketplace>|<scope>`, on stdout, nothing else, exit 0. `init` runs it,
offers the rows verbatim as a multi-select with **none**, and writes the
confirmed ones back. The licence and security-contact questions became 6 and 7.

`init` still **names no tool and reads no settings file** — it reaches the
inventory through the task-name contract, the same way it reaches every other
task. That half of D22's reasoning stands; only the mechanism under it moved.

**graphify is wired by the task**, not only by the installer: where the CLI is
on PATH it runs `graphify install --platform claude` and, inside a work tree,
the post-commit hook install — both idempotent, so a wiring since broken
self-heals. Where it is absent the task says so and prints the install line,
because vwf's own entry gate reports a missing graph as blocking.

**The statusline is hinted and never installed** — "check and hint, never
install". It is a per-machine Homebrew package like the CLI itself; a task that
installs it is a task reaching outside the repo it was run in.

## What this does not change

**The installer CLI is untouched.** `@virajp.dev/claude-plugins` remains the
user-facing one-shot — the thing a person runs once on a machine — and keeps its
flags, its graphify wiring and its `--uninstall`. Removing repo installs from it
was never on the table; the standing decision that CLI plugin installs are core
to it holds. What changed is only that **a task no longer calls it**. The
one-shot is for a person; `setup:ai` is what a checkout re-runs.

## What stays outside

- **A diverged `setup/ai` on a brownfield repo.** `init`'s existing-repo pass
  treats a pack file that differs from the pack's as *already owned, never
  overwritten*, so a repo carrying its own older plugin task never has its
  positions reached at all. How a diverged pack task is reconciled, and how its
  positions are re-derived, is the brownfield plan's.
- **The installer skips registration by name only.** It could read the source
  and warn when the registered one differs from the one it would add. Optional,
  installer-only.
- **No `--statusline` in any form**, and no user-scope mode beyond the one flag.
