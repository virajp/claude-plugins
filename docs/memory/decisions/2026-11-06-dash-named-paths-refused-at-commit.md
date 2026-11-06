DECISION 2026-09-27 ★3 | dash-named paths and tool pins | refuse a path that
starts with `-` at commit, harden no script; pin a dev tool in mise, never by a
fetch outside its ecosystem — no file with a leading dash exists, scripts stay
simple | alt `./`-prefix in twelve scripts, `--` in `code:precommit`, `pnpm dlx`
pin rejected

**Source plan** `2026-09-27-dash-names-and-mise-ignores`.

- Backlog B71 asked every code task to pass `./`-prefixed paths. A search of
  `~/Projects` found zero files or folders with a leading dash, `node_modules`
  included. The user ruled that handling them in twelve scripts is
  over-engineering.
- The ruling: a `language: fail` pre-commit hook with `files: '(^|/)-'` and a
  message that says rename. No task script changes. `code:precommit` gets no
  `--` before its file names.
- Known holes, left on purpose: `shell_files_in_scope` runs `head -n 1` without
  `--`, and `code:precommit` still dies in argparse on a dash-named file that
  got past the hook (`--no-verify`, or tracked before the hook). Do not
  rediscover them as new defects.
- The hook text `(^|/)-` is not stable under dprint. A comparison by words hid
  this.
- sort-package-json: pin it with mise in the dev environment only, resolve it
  with `mise which sort-package-json --tool npm:sort-package-json`, and skip
  the step when it is not installed. The user: "I don't want pinning to be done
  outside any ecosystem which has upgrade mechanism". Rejected: `pnpm dlx
  sort-package-json@<version>`, a devDependency in the target repo, and the
  `all` environments (it is a dev tool).
- The dev-only pin resolves only under `MISE_ENV=dev`, as shfmt did.
- This repo's own `.config/mise/tasks/code/format/sort-package-json` still runs
  an unpinned `pnpm dlx` and the repo carries no dash hook. The plan left both
  to a reshape; they are bootstrap's files now.
