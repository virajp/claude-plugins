PROBLEM 2026-09-05 ★4 | scratch-repo gate of a setup task chain | PATH shims did
not contain `claude` and `pnpx`, and dprint prompts through the terminal device
| isolate HOME, guard on /dev/tty

**Source plan** `2026-09-05-vwf-init`.

The orchestrator ran `setup:all` in a throwaway repo to prove the shaped repo.
Two surprises:

- Containment failed. `setup:all` chains into `code:ai`, which installs
  plugins at user scope. The gate put inert `claude` and `pnpx` shims first on
  `PATH`, but mise resolves its own tool shims ahead of `PATH`, so the real
  `pnpx @virajp.dev/claude-plugins` ran. Nothing changed (vwf was current and
  `settings.json` kept its mtime), but only by luck. Fix: run such a gate
  with an isolated `HOME`, not with `PATH` shims.
- `dprint config update` prompts to accept a plugin move and reads the
  terminal device directly. Piping `N` to stdin does not help. With no
  controlling terminal it dies with "Device not configured (os error 6)". The
  task now guards on `(exec 3<>/dev/tty)`, not on `[ -t 0 ]`, and prints a
  skip notice that names the manual command. No `-y` flag, no version change.
- A bare `mise trust` trusts one file. The five-file mise split and
  `conf.d/` need `mise trust --all`. Under the default settings `mise run`
  auto-trusts but `mise tasks` still fails on an untrusted repo, so task
  discovery breaks either way.
- A command substitution that fails under `set -e` kills a task silently.
  `line_sep` failed this way (`tput cols` has no TTY in a non-interactive
  run) and printed nothing. Two more assignments of the same shape were
  found. Fix each site with `|| default`.
