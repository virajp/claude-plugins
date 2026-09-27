# Decision — mise's local files are ignored by file name

**Date** 2026-09-27 · **Branch** `2026-09-27-dash-names-and-mise-ignores` ·
**Plan**
[`docs/plans/2026-09-27-dash-names-and-mise-ignores/`](../../plans/2026-09-27-dash-names-and-mise-ignores/index.md)
· **Backlog** B73 · **Supersedes**
[`2026-09-26-mise-conf-d-layout.md:15`](./2026-09-26-mise-conf-d-layout.md) on
where the uncommitted local files are ignored, and closes that memo's open gap
on the local lock's ignore path (`:74`)

## What was decided before

The conf-d-layout plan replaced the any-depth `mise.local.lock` pattern with
hardcoded `.config/...` paths in the mise section of the `.gitignore` base:
`.config/mise.local.toml`, `.config/mise.*.local.toml`,
`.config/mise/config.*.local.toml`, `.config/mise/conf.d/*.local.toml` and
`.config/mise/mise.local.lock`.

Two of them were wrong. mise writes the local lock beside
`.config/mise.local.toml`, at `.config/mise.local.lock`, not under
`.config/mise/` — so the real local lock was never ignored. And
`config.*.local.toml` needs two dots, so it missed plain
`.config/mise/config.local.toml`, which mise loads.

## What changed

1. **Bare names, which match at any depth.** A `.gitignore` pattern with no
   slash matches a file name anywhere: `mise.local.toml`, `mise.*.local.toml`,
   `mise.local.lock`, `mise.*.local.lock`, `.mise.local.toml` and
   `.mise.local.lock` cover the root and every `.config/` variant alike.
2. **Two paths stay spelled out**, because their file names do not start with
   `mise`: `.config/mise/config*.local.toml` and
   `.config/mise/conf.d/*.local.toml`. `config.local.toml` is never made a bare
   name — far too generic.
3. **`config*.local.toml`**, with no dot after `config`, now catches plain
   `config.local.toml` as well as `config.<env>.local.toml`.
4. Every other hardcoded mise path is dropped.

## Why the reversal

The user confirmed it at the plan's interview. Hardcoded paths had to guess
where mise writes each file, and one guess was wrong; a bare name does not
guess.

## The alternatives rejected

- **Keep the hardcoded paths and fix the wrong one** — the next misplaced guess
  fails the same silent way.
- **The `**/` form** — identical meaning to a bare name, and the `git` tool's
  no-doubling rule strips `**/` anyway.

## Still out of scope

- **This repo's own root `.gitignore`**, which has no mise section — left to the
  next `/vwf:setup reshape`.
- Whether mise writes a separate local lock for `conf.d/*.local.toml` or
  `config.local.toml` was not verified; the bare `mise.*.local.lock` and the
  spelled-out paths cover every lock name observed so far.
