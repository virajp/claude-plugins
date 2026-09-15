# U4 — this repo's own `.config/mise.toml` comment

- **Wave:** 1
- **Depends on:** —
- **Owns:** `.config/mise.toml`
- **Model:** opus
- **Read first:** `.config/mise.toml` lines 20–50;
  `plugins/stackgen/stacks/toolchain-manager/mise/config/.config/mise.toml`
  lines 96–116 **as they are in the worktree when this unit runs** — U3 edits
  them in the same wave, so read the pack file last, and if U3's edit is not yet
  on disk, write the same wording from decision 1 rather than copying the old
  text.
- **Lazy-load:** nothing else.

## Ruling

Decision 9: "`.config/mise.toml`'s comment at 28–30 is re-landed by hand from
the pack's new text; the value stays `claude-plugins`; nothing else in this repo
changes."

Decision 1: "The slugified basename of the repo's **main checkout** folder …
written literally — never derived at load time".

Decision 11: "The phrase for the key is 'the repo's folder name, slugified'".

## Edits

1. **`.config/mise.toml`** lines 28–30 (the comment above `REPO_NAME`, which
   today says the same token is carried by the `p:<id>:*` task group, the member
   flags and the `setup-<id>` aliases) — replace with the comment the pack now
   ships: the repo's folder name, slugified; a literal, never derived; the task
   groups carry project ids. The value line `REPO_NAME = "claude-plugins"` (44)
   and every other line stay byte-identical.

## Verification

- `mise tasks` still lists every task (the file parses).
- `command git diff --stat -- .config/mise.toml` shows one file, comment lines
  only.
- `command grep -n "REPO_NAME" .config/mise.toml` shows the value unchanged.

## Guardrails

- Touch nothing else in `.config/`.
- Delete with `rm`, never `git rm`.

## Commit

`ops: this repo's mise.toml comment says REPO_NAME is the folder slug` — written
by the orchestrator after the wave gate, not by the unit. Type from
`.config/git-conventional-commits.yaml` (`ops`; no scopes).
