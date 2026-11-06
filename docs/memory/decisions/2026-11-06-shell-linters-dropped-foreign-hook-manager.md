DECISION 2026-10-04 ★3 | gate tools and hook managers | shell linters leave the
gates; a foreign hook manager makes `setup:precommit` warn and exit 0 — the
linters cost more than they give, and `all` must not refuse on a kept manager |
alt run `setup:precommit --force` before `all`, or an `all` flag that skips
hooks, rejected

**Source plan** `2026-10-01-tool-config-script-gates`.

Both rulings came from the user during the run, on 2026-10-04.

- **Shell tools.** The user removed shfmt, shellcheck and actionlint from the
  gates: "They don't add too much value and simply slow every commit". After a
  develop reorg the pins sat in `conf.d` subfolders that mise did not load, so
  every hook failed with "No version is set for shim". The plan dropped its
  `p:plugins:shellcheck` gate line. No gate lints or formats shell now. Do not
  add one back without asking.
- **Foreign hook manager.** With husky, lefthook or a `core.hooksPath` set, the
  old `setup:precommit` exited 1, so `setup:all` and therefore the whole
  `all` call refused. A switch to the pre-commit manager (`--force`) ran only
  after `all`, so it could never help. Ruling: without `--force`,
  `setup:precommit` warns and exits 0 and keeps the manager. With `--force` it
  switches. A hooksPath outside the repo still exits 1 under `--force`.
- Gaps left by the run, now moot because the script is gone: init's survey
  missed a global or system `core.hooksPath` and lefthook `.toml` and `.json`
  files; `setup:precommit --update` on a foreign manager exits before
  autoupdate.
