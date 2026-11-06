PROBLEM 2026-09-20 ★3 | forge identity git-config task and hook | nine edge
cases left unfixed at the review cap — a multi-valued key blocks every commit,
the host match is case-sensitive, a GUI git client has no exported variables |
open in bootstrap if its copy of the task kept them

**Source plan** `2026-09-20-pack-first-run-safety`

The review loop ended at its cap of four rounds. Each case below is a case a
ruling did not foresee. The task was `code/git-config`, since moved out of this
repo with the other task scripts. The decision record
`2026-09-20-pack-first-run-safety` holds the rulings; it omits these cases.

- A multi-valued local key (two `user.email` lines) makes
  `git config --local` exit 5 mid-loop with no remedy, and every commit stays
  blocked until `.git/config` is edited by hand. Fix: `--replace-all`.
- The host match is case-sensitive: `https://GitHub.com/...` resolves to the
  `GIT` variable set. Fix: lowercase before the match.
- Under `pre-commit run --all-files` the exit 1 after a correction reads as
  "failed without changing anything". The second run passes. Widen the message
  to "re-run the command".
- The hook depends on three exported variables. A GUI git client that does not
  read the shell profile is refused with "Cannot fix — unset". Set them in
  mise's global `[env]` block so `mise x` carries them into hooks.
- A repo with no `origin` resolves to `GIT_*` and flips to `GITHUB_*` or
  `GITLAB_*` once the remote exists. A new repo needs `GIT_*` between hook
  wiring and the push, then one refused commit after it. Add the remote before
  the first commit.
- `init` commits the gate configuration through the live hook and never asks
  for the variables. Interim rule: export them before a reshape and expect one
  refused-then-rerun commit.
- grype exits 1 for findings and for a scanner error alike, so the `ignore:`
  remedy prints on an offline database refresh too. Accepted: no exit-code
  split is reliable.
- `setup/all` runs `setup:precommit` under `set -e`. The refusal for a foreign
  hook manager exits 1, so a brownfield clone never reaches `setup:ai` or
  `setup:vscode`. The by-hand cleanup the refusal prints makes the next run
  converge.
- The docs said a bare `ssh-ed25519 ...` signing key "fails inside git". Git
  reads a raw `ssh-` key as `key::` (deprecated, works). The failing case is a
  non-`ssh-` key type without `key::`.
