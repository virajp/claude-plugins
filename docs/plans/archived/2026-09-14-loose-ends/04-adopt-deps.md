# U4 — this repo adopts the pnpm pack's deps verbs

- **Wave:** 2
- **Depends on:** U2 (its commit is the source of the copies)
- **Owns:** `.config/mise/tasks/setup/deps/install`,
  `.config/mise/tasks/setup/deps/outdated`,
  `.config/mise/tasks/setup/deps/audit`,
  `.config/mise/tasks/setup/deps/upgrade`,
  `.config/mise/tasks/setup/deps/cleanup`
- **Model:** opus
- **Read first:** the five owned files, and their five pack sources under
  `plugins/stackgen/stacks/package-manager/pnpm/config/.config/mise/tasks/setup/deps/`
  as committed by U2; `.config/mise/tasks/setup/worktree` and
  `.config/mise/tasks/setup/deps/all` (not owned — to confirm the callers).
- **Lazy-load:** `.config/mise/tasks/_scripts/helpers` — the pack-owned helper
  library the pack verbs `source`; confirm the `source` line in each copied file
  resolves from this repo's layout.

## Ruling

Decision 3:
"`.config/mise/tasks/setup/deps/{install,outdated,audit,upgrade,cleanup}` become
**byte copies** of the pnpm pack's fixed files (`cp`, then `diff -q` empty),
mode 755 preserved. `install` thereby honours `--frozen`, `cleanup` stops
deleting `pnpm-lock.yaml`, `upgrade` loses `self-update latest-11`." Rejected:
"patch the copies by hand; leave them for a later `/vwf:setup reshape`".

The standing decision
`docs/memory/decisions/2026-09-05-worktree-init-becomes-setup-worktree.md:15-17`:
the worktree body ends in `setup:deps:install --frozen` — "dependencies
installed **from the lockfile** and nothing else".

## Edits

1. For each of the five verbs:
   `cp plugins/stackgen/stacks/package-manager/pnpm/config/.config/mise/tasks/setup/deps/<verb> .config/mise/tasks/setup/deps/<verb>`
   then `chmod 755` on the copy.
2. Read each copy's `source` line; if it names a helper path that does not
   resolve from `.config/mise/tasks/setup/deps/` in this repo, stop and return
   `UNRESOLVED:` naming the path — do not rewrite the file, it must stay a byte
   copy.
3. Confirm `setup/worktree:36` still reads
   `mise run setup:deps:install --frozen` and `setup/deps/all` still calls the
   five verbs — no edit expected.

## Verification

- For each verb,
  `diff -q .config/mise/tasks/setup/deps/<verb> plugins/stackgen/stacks/package-manager/pnpm/config/.config/mise/tasks/setup/deps/<verb>`
  is silent; `ls -l` shows `-rwxr-xr-x` on both.
- `command grep -n "frozen" .config/mise/tasks/setup/deps/install` shows the
  `#USAGE` flag and the `--frozen-lockfile` mapping.
- `command grep -n "pnpm-lock" .config/mise/tasks/setup/deps/cleanup` is empty.
- `command grep -n "latest-11\|--depth\|reporter=summary" .config/mise/tasks/setup/deps/*`
  is empty.
- `git status --porcelain -- pnpm-lock.yaml` is empty before and after running
  `mise run setup:deps:install --frozen` from the worktree root, and that run
  exits 0.
- `mise run code:lint` green (this repo's own tasks go through the `lint` hook).

## Guardrails

- Byte copies only: no edit of any kind inside the five files. If a copy needs a
  change to work here, that is a pack defect and an `UNRESOLVED:`, not a local
  patch.
- Do not touch `setup/worktree`, `setup/deps/all`, `setup/all`, `_scripts/*`,
  the pack tree, or any doc.
- Do not run `setup:deps:all`, `setup:deps:upgrade` or `setup:deps:cleanup` —
  they move the lockfile or the installed tree.
- Delete with `rm`, never `git rm`; stage nothing.

## Commit

`ops: adopt the pnpm pack's setup:deps verbs — frozen install, lockfile kept` —
written by the orchestrator after the wave gate, not by the unit.
