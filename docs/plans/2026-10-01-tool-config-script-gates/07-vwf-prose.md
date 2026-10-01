# G7 — vwf prose: trust as a prerequisite, `setup:all` inside `all`, post-merge

- **Wave:** 3
- **Depends on:** G3
- **Owns:** `plugins/vwf/skills/init/SKILL.md`,
  `plugins/vwf/skills/init/references/new-repo.md`,
  `plugins/vwf/skills/init/references/existing-repo.md`,
  `plugins/vwf/skills/init/assets/hygiene/CONTRIBUTING.md`,
  `plugins/vwf/skills/setup/references/materialize.md`,
  `plugins/vwf/skills/doctor/references/code-intelligence.md`
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

## Verification

- `grep -rn -E 'mise x [a-z@]' plugins/vwf` prints nothing.
- `grep -rn 'skills/tool-config/scripts' plugins/vwf` prints nothing (rule 6).
- `mise run p:plugins:check` green.
- The full wave gate.

## Guardrails

- Init's other passes are plan 4's; edit only these passages.
- `plugins/**/*.md` is not dprint-formatted: match fold width by hand.
- Delete with `rm`, never `git rm`.

## Commit

`refactor: vwf expects trust and lets tool-config run setup:all`
