# Decision — tools run only as `mise x -- <tool>`, node is a repo pin

**Date** 2026-10-01 · **Branch** `2026-10-01-tool-config-script-gates` ·
**Plan**
[`docs/plans/2026-10-01-tool-config-script-gates/`](../../plans/2026-10-01-tool-config-script-gates/index.md)
(rulings G3, G8) · **Supersedes**
[`2026-10-01-tool-config-renders-with-a-node-script.md`](./2026-10-01-tool-config-renders-with-a-node-script.md)
D1's "run with the `node` on `PATH`"

## The user's words

> we need to ensure that the mise commands don't install the tool, the tools
> must be pre-installed via mise only. `mise x dprint -- ...` may install a
> different version that what is mentioned in mise config so use
> `mise x -- dprint ...`. This also means that `mise install` must be run before
> executing such commands

## What was decided before

The tool-config script ran with whatever `node` sat on `PATH`, and plan 1
drafted it as `mise x node@lts -- node`. The gate tools it would call had no
stated invocation form.

## What changed

- **G3 — pinned tools only.** Every tool the script calls runs as
  `mise x -- <tool>`, the version the repo's config pins, and only after
  `mise which <tool>` says it is installed. Never `mise x <tool>@… --`, which
  can install a version the config does not pin. A tool the call needs and the
  repo has not installed refuses the call before the first byte is written,
  naming `MISE_ENV=dev mise run setup:all`.
- **G8 — node is a dev pin.** `node` is pinned, exact and resolved, in the base
  `conf.d/tools.dev.toml`, and the script runs as
  `MISE_ENV=dev mise x -- node …`. Only the first `all` on a repo with no mise
  config has no pin to run on and needs `node` on `PATH`.

## The alternatives rejected

- **Ad-hoc `mise x <tool>`** — installs on demand, at a version nobody pinned.
- **`node` on `PATH` always** — the script's runtime would differ per machine.
- **A bash rewrite** — the engine is already node, and rule 16 holds it to
  built-ins.
