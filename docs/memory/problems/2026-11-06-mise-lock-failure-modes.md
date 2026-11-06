PROBLEM 2026-09-26 ★3 | mise lockfile failure modes | the tracked lock needed
uv, Python, a sidecar and a flag order that broke first runs — the lock was
dropped 2026-10-01, but each trap is mise behaviour | superseded by no lock and
exact pins

**Source plan** `2026-09-25-gate-hardening`, `2026-09-26-init-commits-the-lock`,
`2026-09-26-mise-lock-sidecar-exclusions`, `2026-09-26-mise-lock-gaps`.

The lock chain is replaced by `lockfile = false` and exact pins (see
`2026-10-01-mise-lockfile-dropped-exact-pins`). The traps below come from
mise itself and return if a lock is ever used again.

- **First CI run fails.** With `locked = true`, CI refuses a tool that has no
  lock entry. A shaped repo had to commit `mise.lock` and its sidecar folder
  together before its first push. Init ran no `mise install`, so no lock
  existed.
- **Locking a `pipx:` tool needs uv and Python.** `mise lock` shells out to uv
  0.12.10 or later, then runs `uv lock --no-python-downloads`, so a Python 3.10
  or later must already be installed. A stray old uv on PATH gave a misleading
  error. A failed lock left a partial `mise.lock` that the next run took as
  present. Fix used: install uv, then Python, before locking; remove the
  partial lock and only the sidecars this run created.
- **Options change re-resolves an entry.** Adding `uvx = true` moved a locked
  version (graphifyy 0.9.68 to 0.9.69). "Locked versions are kept" is false
  then.
- **mise's pre-task install writes locks.** A task body runs after mise
  installs and locks, so a fresh dev checkout is locked by mise, host platform
  only, unless `lockfile_platforms` is set. `task.run_auto_install = false`
  stops it.
- **A union lock needs every environment.** A single-environment `mise lock`
  drops the other environments' tools.
- **The npm backend uses an aube sidecar.** `npm.package_manager = "aube"` set
  in a project config leaked into global tools: `mise install` rewrote the
  user's global `~/.config/mise/mise.lock` (restored by hand). A committed
  aube lock also fixes one installer for every machine. An `npm:` pin fixes
  only the top package; transitive dependencies float and install scripts run
  (`pnpm dlx` had blocked them).
- **Formatters rewrite sidecars.** dprint, taplo and the pre-commit global
  exclude each needed an entry for `.config/mise/locks/`. Gitleaks stayed
  unchanged on purpose: committed lock data is still scanned.
- **The migration upgrades silently.** Removing old locks and running a fresh
  `mise lock` re-resolved every `latest` pin (node, pnpm, uv, doppler, grype).
  Seed the new lock from the old ones first.
