# Decision — the mise lockfile is dropped; every pin is an exact version

**Date** 2026-10-01 · **Branch** `2026-10-01-tool-config-script-mise` · **Plan**
[`docs/plans/2026-10-01-tool-config-script-mise/`](../../plans/2026-10-01-tool-config-script-mise/index.md)
· **Supersedes**
[`2026-09-28-lock-files-tracked.md`](./2026-09-28-lock-files-tracked.md) on the
one tracked mise lock, and
[`2026-09-26-mise-lock-honoured.md`](./2026-09-26-mise-lock-honoured.md) whole;
the `**/mise.local.lock` ignore line stands

## What was decided before

On 2026-09-26 `setup:all` installed from a tracked mise lockfile and `--upgrade`
moved it; on 2026-09-28 one tracked lock with its sidecar folder held every
environment's tools, `mise.ci.toml` set `locked = true`, and `/vwf:init` wrote
or filled the lock with `setup:mise --lock-only` before its commit.

## What changed

The user removed the lock settings in commits `34b938ab` and `c285438c`
(2026-09-29/30): *"Mise lock is completed gone. It's creating more problems and
slows down the whole install process. However, this introduces version
pinning."*

- **R3 — no lockfile.** `lockfile = false` in the base; no `locked = true` in
  CI; no lock verb; no `lockfile_platforms`; the lock-sidecar line leaves every
  exclusion list; init's lock step is gone, and its git pass stages only what
  the run wrote. A repo shaped earlier gets one delete row for its tracked lock
  and sidecar folder from the next `all`.
- **D2 — exact pins.** Every pin the script writes is an exact version: a
  requested `latest`, or a prefix such as `"0.59"`, is resolved with
  `mise latest <tool>[@<prefix>]` at write time. A pin already written that
  answers the request is kept, so a second `all` writes nothing.
- **D12 — `mise upgrade` is the one mover.** One row per pin that has moved on,
  written on the answers; dev only. Narrowed at run time: a pin moves only
  within what declared it — an exact declaration never moves, a prefix moves
  within itself, `latest` re-resolves — so `upgrade` and `all` never undo each
  other. `setup:all` lost `--upgrade`, and `setup:mise` only installs the pinned
  versions.
- **D20 — mise required.** The script stops with the install remedy when `mise`
  is not on `PATH`, since resolving needs it.

## The alternatives rejected

- **Exact versions hardcoded in templates** — stale the day they ship.
- **Major or minor prefixes written as-is** — what a pipeline installs would
  move under it; the lock was what used to prevent that.
- **Renovate alone to move pins** — not every repo answers `renovate`.
