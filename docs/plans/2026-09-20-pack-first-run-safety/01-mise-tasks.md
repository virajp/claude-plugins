# U1 — the four mise task scripts

- **Wave:** 1
- **Depends on:** —
- **Owns:** under
  `plugins/stackgen/stacks/toolchain-manager/mise/config/.config/mise/tasks/`:
  `code/git-config`, `setup/precommit`, `setup/mise`, `code/sec`
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file, top to bottom, before editing; then
  `…/tasks/_scripts/helpers` (the print helpers and `shell_files_in_scope` —
  read, never edit) and `…/tasks/setup/all` (what it passes to each `setup:*`
  task — read, never edit).
- **Lazy-load:**
  `plugins/stackgen/stacks/toolchain-gate/gitleaks/conventions.md:53-56` (the
  baseline passage the grype remedy mirrors);
  `.config/mise/tasks/p/plugins/shellcheck` (the flags the gate runs over these
  files).

## Ruling

Decision 1 — Posture: "A pack task **never clobbers foreign state**: it never
unsets, overwrites or upgrades anything it did not create; where it would have
to, it stops, names what it found, and prints the one by-hand command. Every
destructive step sits behind an explicit flag the user passes on purpose, and
`setup:all` passes none of them."

Decision 2 — git-config contract: "Required local state: `user.name` =
`<FORGE>_USER_NAME`, `user.email` = `<FORGE>_EMAIL`, `user.signingkey` =
`<FORGE>_SIGNING_KEY` (**equality**, not presence); `commit.gpgsign` and
`tag.gpgsign` = `true`; `gpg.format` = `ssh`; `gpg.program` and
`gpg.ssh.program` **absent**. `<FORGE>` is `GITHUB` when the origin host is
`github.com`, `GITLAB` when `gitlab.com`, `GIT` for any other host or no remote.
Check mode lists each failing key with expected vs actual and the variable to
export, exit 1. `--fix` writes the identity keys from the variables (fails
naming any unset one, writes nothing partial), sets the two booleans and
`gpg.format`, unsets the two `gpg.*program` keys. The hook keeps `--fix` — it is
now constructive except for the two unsets, which are the rule itself."

Decision 3 — precommit / mise flags: "`setup:precommit`: before anything, read
`git config --local core.hooksPath`, test `.husky/`, `lefthook.yml`,
`.lefthook.yml`; any present → print what was found and the two by-hand lines
(the hooksPath unset and the overwrite install) and exit 1; a new `--force` flag
does today's `:29-30`. `pre-commit autoupdate` (`:19`) runs only under a new
`--update` flag. `setup:mise`: `mise upgrade --local` (`:22`) and
`dprint config update` (`:44`) run only under a new `--upgrade` flag.
`setup:all` passes neither flag."

Decision 5 — gitleaks: "`code:sec`'s full mode stays `dir` (the comment at
`sec:54-56` stands)."

Decision 6 — grype: "`code:sec` prints that remedy on a grype failure."

Decision 9 — Vocabulary: "The flags are `--force` (precommit), `--update`
(precommit autoupdate), `--upgrade` (mise upgrade + dprint config update),
declared as `#USAGE flag` lines like `--fix`; the env-variable names are exactly
`GITHUB_USER_NAME`, `GITHUB_EMAIL`, `GITHUB_SIGNING_KEY` and the `GITLAB_` /
`GIT_` twins."

## Edits

1. **`code/git-config`** — rewrite to the contract of decision 2. Resolve
   `<FORGE>` from `git remote get-url origin` (host `github.com` → `GITHUB`,
   `gitlab.com` → `GITLAB`, anything else or no remote → `GIT`). Check mode:
   compare each of the seven keys against its required value (a local git-config
   get per key), collect every mismatch as one line — the key, the expected
   value and its variable, the actual value or unset — print them under
   `print_error`, print the export line for each unset variable, exit 1 on any
   mismatch; `print_ok` otherwise. `--fix`: first verify all three variables are
   set — if any is not, print which and exit 1 **before writing anything**; then
   set each identity key locally, `commit.gpgsign true`, `tag.gpgsign true`,
   `gpg.format ssh`, and `--unset` each `gpg.*program` key present; re-run the
   check and exit with its status. Replace the `:15` comment with one stating
   the new rule in one line. Keep the `#MISE description` and
   `#USAGE flag "--fix"` lines, reworded.
2. **`setup/precommit`** — add `#USAGE flag "--force"` and
   `#USAGE flag "--update"`. Before `:19`: the foreign-hook check of decision 3
   — `core.hooksPath` set to anything, or any of the three husky/lefthook paths
   present → print the finding and the two by-hand lines, exit 1, unless
   `--force`. `:19` autoupdate runs only under `--update`. `:29-30` run only
   under `--force` **or** when the check found nothing foreign (a clean repo
   still gets its hooks installed — that is the task's purpose; `--overwrite` on
   a pre-commit-managed hook is not clobbering).
3. **`setup/mise`** — add `#USAGE flag "--upgrade"`; `:22` and the `:35-49`
   block run only under it; without it, print one line saying what `--upgrade`
   would do.
4. **`code/sec`** — on a non-zero grype exit (`:70` / `:72`), print the baseline
   remedy: "to accept a finding, add its id under `ignore:` in
   `.config/grype.yaml` with a one-line reason — see the grype conventions" —
   one `print_warn` line; no behaviour change otherwise. Full mode stays
   `gitleaks dir .` (decision 5).

## Verification

- `mise run p:plugins:shellcheck` green (`shellcheck -x`, `shfmt -d -i 2 -ci`
  over these files).
- `mise run p:plugins:check` green (exec bit and shebang intact — do not
  recreate the files; edit in place).
- `grep -n "USAGE flag" <each owned file>` shows `--fix` on git-config,
  `--force` and `--update` on precommit, `--upgrade` on mise.
- `grep -n "GITHUB_USER_NAME\|GITLAB_\|GIT_USER_NAME" code/git-config` — all
  three prefixes present.
- `grep -n "husky\|lefthook\|hooksPath" setup/precommit` — the check exists
  before the install.
- `bash -n <each file>` passes.

## Guardrails

- These files are **payload** — no dprint, no linter; shfmt `-i 2 -ci` is the
  only formatter and `p:plugins:shellcheck` runs it.
- Edit in place — never delete and recreate (the exec bit is asserted).
- Do not touch `_scripts/helpers`, `setup/all`, or any other task; do not edit
  `…/mise/skills/**` (U4) or the pre-commit pack (U2).
- No `pack.yaml` bump — U7.
- No doc — `DOCS FALSIFIED:` lines.
- BSD sed on macOS — prefer bash parameter expansion; anything written must run
  under `bash` 3.2 as the shebang declares.
- Delete with `rm`, never `git rm`.

## Commit

`feat: mise tasks — git-config requires a forge identity; setup tasks never clobber`
— written by the orchestrator after the wave gate. Type from
`.config/git-conventional-commits.yaml`; no scopes.
