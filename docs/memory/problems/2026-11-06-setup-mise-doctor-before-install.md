PROBLEM 2026-10-01 ★3 | setup:mise order and mise trust output | `mise doctor`
ran before `mise install` under `set -e`, so a fresh repo failed `setup:all` —
install, then reshim, then doctor; `mise trust` prints `~/` paths | this repo's
synced `setup/mise` still has the old order (open)

**Source plan** `2026-10-01-tool-config-script-gates`.

Found by a scratch-repo gate: isolated `HOME`, isolated `MISE_*` directories,
and `trusted_config_paths` set. No unit test saw it.

- **Doctor before install.** The shipped `setup:mise` ran reshim, doctor, then
  install. In a repo with no tools installed doctor fails, and `set -e` stops
  the task. Every fresh repo failed `setup:all`. The fix in the removed asset
  was install, reshim, doctor.
- **Open.** `.config/mise/tasks/setup/mise` in this repo (synced from
  bootstrap, "do not edit") still runs doctor, then install, with `set -e`.
  The fix belongs to bootstrap's `repo/tools/mise` task. Hand it over; do not
  edit the synced file.
- **Trust output.** mise prints trusted paths as `~/...`.
  Code that compared the printed path with a realpath never matched, so the
  trust check always failed. Expand `~` and compare realpaths.
- **Trust needs the environment.** A trust check without `MISE_ENV=dev` misses
  the `*.dev.toml` files.
- **A tool run as `mise x <tool>@<version> --`** may install a version other
  than the pinned one. Run `mise x -- <tool>` after `mise install`.
- **Review loops.** Both gate reviews ended at the convergence guard with
  counts of 8, 9 and 1, 4 findings. The contract was clean each time; the
  residuals were contested, not fixed.
