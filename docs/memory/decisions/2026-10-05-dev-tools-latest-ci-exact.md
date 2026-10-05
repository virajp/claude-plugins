# Decision — dev tools pin `latest`, what CI loads pins exact

**Date** 2026-10-05 · **Branch** `2026-10-05-tool-config-templates` · **Plan**
[`docs/plans/2026-10-05-tool-config-templates/`](../../plans/2026-10-05-tool-config-templates/index.md)
· **Supersedes**
[`2026-10-01-mise-lockfile-dropped-exact-pins.md`](./2026-10-01-mise-lockfile-dropped-exact-pins.md)
D2 (every pin the script writes is exact) and
[`2026-10-01-mise-x-runs-pinned-tools.md`](./2026-10-01-mise-x-runs-pinned-tools.md)
G8 (node exact in `tools.dev.toml`)

## What was decided before

With the mise lockfile dropped on 2026-10-01, every pin the script wrote was an
exact version, `latest` or a prefix resolved by `mise latest` at write time, and
the repo's own node pin sat exact in `conf.d/tools.dev.toml`.

## What changed

The user, verbatim: *"For all `dev` tools, use `version = "latest"` and only for
tools that are used in `ci` will have exact versions"*; and *"if the repo is
built with `node` (which is very high probability) then `node` and `pnpm` must
be setup in `mise.toml`. Node has very good backward compatibility and thus
`latest` won't really hurt"*. Confirmed with the other nine reversals on
2026-10-05: *"yes, confirm all ten"*.

- **P1 — dev files stay `latest`.** Every `mise.dev.toml` — universal or a
  pack's — keeps `version = "latest"`, under `minimum_release_age = "10h"`.
- **P2 — CI-loaded files are exact.** In `.config/mise.toml` and every
  `mise.toml`, `mise.ci.toml` and `mise.test.toml` in a `conf.d/` folder, the
  script resolves each `latest` to an exact version with `mise latest <tool>` at
  render. A pin the file already holds exactly is kept, so a second `all` shows
  no row.
- **P3 — node and pnpm stay `latest`** even where CI loads them, in
  `_base/mise.toml` on a node repo.
- **P4 — `upgrade` is the one mover**, one `pin` row per tool whose latest has
  moved on. A pin `mise latest` cannot resolve is skipped with a note.
- **P5 — a pack's mise files always live in its `templates/`**, so the script
  applies the same rule to them; no pack hardcodes an exact pin.

## The alternatives rejected

- **Hardcoded exact pins in packs** — a pack release would be the only way to
  move a pin.
- **Pins as template values** — a value the person types for every tool.
