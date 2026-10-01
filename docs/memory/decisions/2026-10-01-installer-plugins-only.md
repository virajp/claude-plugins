# Decision — the installer installs plugins only

**Date** 2026-10-01 · **Branch** `2026-10-01-installer-plugins-only` · **Plan**
[`docs/plans/2026-10-01-installer-plugins-only/`](../../plans/2026-10-01-installer-plugins-only/index.md)

## What was decided before

Installers `@virajp.dev/claude-plugins` 1.0.0–1.0.2 had three jobs: plugin
installs through the `claude` CLI, graphify's wiring
(`graphify install --platform claude` after every install), and `--uninstall`,
which also listed graphify's raw git hooks, its graph (`graphify-out/`) and
`.graphifyignore`.

## What changed

The user, verbatim: *"Installing graphify, creation of `code:graph` task and
using that in `pre-commit` config is job of skills. Installer will only install
these plugins using `claude` cli"*.

- **J1 — install**: no graphify step. `installer/src/graphify.ts` and its test
  are deleted; the skills own graphify — a shaped repo's `setup:ai` wires it for
  the agent and its pre-commit `post-commit` hook runs `code:graph`.
- **J2 — uninstall**: `--uninstall` lists no graphify item. Graphify's hooks,
  graph, `.graphifyignore` and the user-level Claude wiring an earlier version
  left are the repo's or the user's to remove. The `delete` removal kind, used
  only by those items, went with them.
- **J3 — release**: a minor bump, `1.0.2 → 1.1.0`, released with the tool-config
  chain.

## The alternatives rejected

- **Keep a soft-skipping graphify step** — it duplicates `setup:ai`, and the
  installer is the one-shot for a person, not a repo's reconcile step.
- **Keep the uninstall items** — the graph and `.graphifyignore` are repo files
  the skills land; an installer removing them reaches past what it installs.
- **Release after landing, or a major** — the flag surface is unchanged; only a
  side effect is gone.
