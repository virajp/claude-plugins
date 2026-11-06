PROBLEM 2026-09-23 ★3 | task scripts that list files with git | `git ls-files
--deduplicate` needs git 2.31, and a failed listing inside a process
substitution is invisible to `set -e` — the scope came back empty and format and
lint exited 0 having checked nothing | fix: list into a temp file, test the exit
status, fail loudly

**Source plan** `2026-09-23-swift-package-stack`,
`2026-09-23-swift-tasks-git-compat`

The Swift pack's `code:format` and `code:lint` called
`git ls-files --deduplicate` inside `done < <(...)`. On git older than 2.31 the
call failed, the loop read nothing, and both gates passed silently. The review
loop found it only at the round cap, and the round-3 fix had introduced it.

What the fix ruled:

- Drop `--deduplicate`. Git output is sorted and a conflicted path's stages are
  adjacent, so the read loop skips a path equal to the one before it. Rejected:
  `sort -zu`; a git version check.
- Write the `ls-files -z` output to a `mktemp` file with a plain command, then
  check the exit status. On failure print an error and exit non-zero. Remove
  the file on EXIT. Rejected: `wait $!` (needs bash 4.4, macOS ships 3.2); a
  probe that runs git twice.
- Inside a repo (a `.git` entry in cwd or a parent, or `GIT_DIR` set), one
  `ls-files` decides: a list or a loud error. Outside one, walk with `find`.
  A probe by `git rev-parse` matched unreadable repos and `2>&1` capture broke
  under `GIT_TRACE=1`, so both were removed.
- The `2>/dev/null || true` on the actionlint list stayed on purpose.

Other facts met on the way:

- `swift package init` output has no trailing newline, so a read-only
  `swift format lint --strict` fails on it. Run `code:format --fix` first.
- The house linter ignores `.gitignore`. A task must hand it explicit targets
  or it walks `.build/` (and Flutter's `build/`, `.dart_tool/`).
- A smoke test of a pack payload needs the unconditional baseline a real init
  lands, because `code:format` needs the dprint config.

The Swift task scripts left this repo when tasks moved to bootstrap. Check any
bootstrap task that lists files with git for the same two defects.
