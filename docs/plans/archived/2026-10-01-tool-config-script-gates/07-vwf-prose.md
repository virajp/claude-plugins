# G7 — vwf prose: trust as a prerequisite, `setup:all` inside `all`, post-merge

- **Wave:** 3
- **Depends on:** G3
- **Owns:** `plugins/vwf/skills/init/SKILL.md`,
  `plugins/vwf/skills/init/references/new-repo.md`,
  `plugins/vwf/skills/init/references/existing-repo.md`,
  `plugins/vwf/skills/init/assets/hygiene/CONTRIBUTING.md`,
  `plugins/vwf/skills/setup/references/materialize.md`,
  `plugins/vwf/skills/doctor/references/code-intelligence.md`; widened at resume
  for the foreign-hook-manager ruling:
  `plugins/stackgen/skills/tool-config/assets/mise/.config/mise/tasks/setup/precommit`,
  `scripts/src/fixtures/tool-config/mise/greenfield.json` (regenerated, never
  hand-edited), the `setup:precommit` row of
  `plugins/stackgen/skills/tool-config/references/mise.md` and the
  foreign-hook-manager passage of
  `plugins/stackgen/skills/tool-config/references/pre-commit.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** `new-repo.md` §9 and §10 (`:548-615`); every owned file at the
  passages below.

## Ruling

> G3 — Tools run only as `mise x -- <tool>` … A tool not installed → the call
> stops with the remedy `MISE_ENV=dev mise run setup:all`.

> G4 — `all` = land every file → `MISE_ENV=dev mise run setup:all` → format and
> validate the files it wrote → record hashes. Trust is assumed: an untrusted
> config stops the call with the remedy.

> G6 — `post-merge` joins `default_install_hook_types`; `graphify-refresh` runs
> at `post-commit` and `post-merge`.

User, verbatim: *"`mise trust` is expected to be run before hand by user, script
must expect that this is in-place. `mise run setup:all` is the best way to get
the repo setup."*

**Foreign hook manager (ruled 2026-10-04, resolves this unit's UNRESOLVED).**
`setup:precommit` without `--force` on a foreign hook manager (husky, lefthook,
`core.hooksPath`) **warns and exits 0** — it names the manager and the by-hand
switch lines, installs nothing, and so `setup:all` and `tool-config all`
complete. Keep: nothing more runs; the report names the manager and that the
gate configuration is landed but not wired. Switch: init runs
`setup:precommit --force` as its **last shaping step, after `all`** — the order
`existing-repo.md` already states. One refusal stays exit 1: `--force` against a
`core.hooksPath` set outside the repo (global or system git-config), which
`--force` never edits. The user first picked init running `--force` **before**
`all`, then dropped it: `all` is what lands the task, so it does not exist yet
on a first shaping.

## Edits

1. **init §9 (bootstrap)** — trust is the user's prerequisite: init checks it
   before the plan and, when missing, tells the user the one command
   (`mise trust --all`, or `trusted_config_paths` in the global mise config) and
   waits; it never runs trust. `mise run init` (the exec-bit step) stays.
2. **init §10** — the "offer the bootstrap aggregator" step is removed:
   `tool-config all` runs `setup:all` itself. Its mentions in `SKILL.md` and
   `existing-repo.md`'s post-landing paragraph go with it.
3. **Calls** — every `tool-config` call init and setup spell (`all`,
   `preview all`, `all add exclude`) in the flag grammar;
   `existing-repo.md:158-165`'s exclude call uses `all add-exclude --paths …`.
4. **`CONTRIBUTING.md`** (`:52,69`) — the setup line is
   `MISE_ENV=dev mise run setup:all`, after trusting the repo.
5. **`setup/references/materialize.md`** (`:172-210`) — mapping entries run
   through the script; no `mise x <tool>@`.
6. **`doctor/references/code-intelligence.md`** (`:32-38`) — the graph hook is
   installed at `post-commit` and `post-merge`.
7. **`setup:precommit` task** — the no-`--force` foreign-manager branch prints a
   warning (not an error) and `exit 0`; the `#MISE description` says it skips a
   foreign hook manager rather than refusing. The global/system `core.hooksPath`
   branch keeps `exit 1` only under `--force`; without `--force` it warns and
   exits 0 like the rest. Regenerate the greenfield golden with
   `TOOL_CONFIG_GOLDEN=write`.
8. **`existing-repo.md` keep bullet** (`:261-268`) — the **Open question** is
   replaced by the ruling: `all` completes, the hooks stay the foreign
   manager's, and the report says so. The switch bullet stays as written.
9. **tool-config prose** — `mise.md`'s `setup:precommit` row and
   `pre-commit.md`'s foreign-manager passage say "skips with a warning", not
   "refuses".

## Verification

- `grep -rn -E 'mise x [a-z@]' plugins/vwf` prints nothing.
- `grep -rn 'skills/tool-config/scripts' plugins/vwf` prints nothing (rule 6).
- `mise run p:plugins:check` green.
- `mise run p:plugins:shellcheck` green.
- In a scratch repo with a `.husky/` directory, `setup:precommit` exits 0 with
  the warning; with `--force` it installs pre-commit's hooks.
- `grep -n 'Open question' plugins/vwf/skills/init/references/existing-repo.md`
  prints nothing.
- The full wave gate.

## Guardrails

- Init's other passes are plan 4's; edit only these passages.
- `plugins/**/*.md` is not dprint-formatted: match fold width by hand.
- Delete with `rm`, never `git rm`.

## Commit

`refactor: vwf expects trust and lets tool-config run setup:all`
