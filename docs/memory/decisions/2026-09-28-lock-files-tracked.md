# Decision — every lock file is tracked; only the mise local lock is ignored

**Date** 2026-09-28 · **Branch** `2026-09-28-one-pin-and-tracked-lock` ·
**Plan**
[`docs/plans/archived/2026-09-28-one-pin-and-tracked-lock/`](../../plans/archived/2026-09-28-one-pin-and-tracked-lock/index.md)
· **Supersedes**
[`2026-09-27-mise-local-files-ignored-by-name.md`](./2026-09-27-mise-local-files-ignored-by-name.md)
on the local lock patterns and on the rejected `**/` form; its `.toml` patterns
stand

## What was decided before

The 2026-09-27 record ignored the local lock under three bare names —
`mise.local.lock`, `mise.*.local.lock` and `.mise.local.lock` — and rejected the
`**/` spelling as identical in meaning. The plan this record comes from was
approved with a different answer for a repo whose own `.gitignore` ignores the
mise lock (a `*.lock` line, say): keep that line and append negation lines
re-including `.config/mise/mise.lock` and `.config/mise/locks/`.

## What changed

1. **One lock line.** tool-config's shipped `.gitignore` carries
   `**/mise.local.lock` as its only lock pattern; every other lock file is
   tracked, the per-environment local locks included.
2. **Lock-ignoring lines are removed, not negated.** When tool-config's `all`
   lands, each `.gitignore` line that ignores a lock file other than
   `mise.local.lock` — inside a block or among the user's own lines — is one
   delete row, answered `ok`, which init shows in its one consent and applies
   before the lock step. A fetched template's lock line is never written.
3. **No pack negates a lock file.** The flutter and pub packs no longer ask for
   `!pubspec.lock`.

## Why the reversal

The negation ruling needed a third line before it worked: with `*.lock` in the
file, the two approved negations still left `.config/mise/locks/x/uv.lock`
ignored. The user ruled at the resumed run: "Let's not mess the gitignore by
adding negation. Simply remove all the lock files from gitignore and add
`**/mise.local.lock` which is the only lock file to be ignored. Note that it can
be in any folder".

## The alternatives rejected

- **Negation lines** — order-sensitive, cannot reach a path whose parent folder
  is ignored, and took three lines to cover what one removal does.
- **Keeping the three bare local-lock names** — the user named one lock file to
  ignore; `mise.<env>.local.lock` is now tracked.

## Still out of scope

- The anchoring rule that treats `/x`, `x` and `**/x` as one pattern — backlog
  B79.
