# U2 — the pre-commit pack: the git-config entry, the check-json exclude, its prose

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/stacks/toolchain-gate/pre-commit/config/**`,
  `plugins/stackgen/stacks/toolchain-gate/pre-commit/conventions.md`,
  `plugins/stackgen/stacks/toolchain-gate/pre-commit/skills/**`
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file, top to bottom, before editing.
- **Lazy-load:** this repo's own `.config/pre-commit-config.yaml:191-199` (the
  hand-carried `check-json` exclude and its comment — read, never edit);
  `plugins/stackgen/assets/pack-format.md` (marked positions — do not add one).

## Ruling

Decision 2 — git-config contract, the part this pack carries: "The hook keeps
`--fix` — it is now constructive except for the two unsets, which are the rule
itself." The hook's `description` (`pre-commit-config.yaml:45-48`) states the
reversed rule: a per-repo identity equal to the forge variables, signed with
ssh.

Decision 4 — check-json: "The pack's `check-json` hook gains
`exclude: ^\.vscode/` — the two composed files are JSONC by design."

Decision 3, as the pack's prose describes it: "`setup:precommit`: … any present
→ print what was found and the two by-hand lines … and exit 1; a new `--force`
flag does today's `:29-30`. `pre-commit autoupdate` (`:19`) runs only under a
new `--update` flag."

## Edits

1. **`config/.config/pre-commit-config.yaml`** — `:43-52` the `git-config` hook:
   `name` and `description` reworded to the reversed rule (required per-repo
   identity from `GITHUB_*` / `GITLAB_*` / `GIT_*`, ssh signing); `entry`
   unchanged (`--fix` stays). `:132-135` `check-json`: add `exclude: ^\.vscode/`
   with a one-line comment that the composed editor files are JSONC. Cite
   nothing by plugin path (rule 13 — this file lands).
2. **`skills/**/SKILL.md`** — `:30` (setup:precommit = autoupdate + install) and
   `:42-45` (clears `core.hooksPath`) now say: autoupdate only under `--update`;
   a foreign hook manager or `core.hooksPath` is refused with the by-hand lines
   unless `--force`. `:157` (autoupdate moves `rev`) gains "under `--update`".
   The git-config hook's passage, wherever it is, states the new contract in two
   lines and names the variables.
3. **`conventions.md`** — the same three facts where the file describes the hook
   set or `setup:precommit`.

## Verification

- `mise run p:plugins:check` green (rule 11 parses the pack's
  `pre-commit-config.yaml`; rule 13 refuses a plugin path in it).
- `grep -n "exclude: \^\\\\.vscode/" plugins/stackgen/stacks/toolchain-gate/pre-commit/config/.config/pre-commit-config.yaml`
  — one hit under `check-json`.
- `grep -n "never per-repo\|never local\|global git-config" plugins/stackgen/stacks/toolchain-gate/pre-commit/ -r`
  — zero hits of the old rule.
- `grep -rn "\-\-update\|\-\-force" plugins/stackgen/stacks/toolchain-gate/pre-commit/skills plugins/stackgen/stacks/toolchain-gate/pre-commit/conventions.md`
  — at least one hit each.

## Guardrails

- `config/` is payload — no formatter; keep the file's style by hand.
- Do not edit the task scripts (U1) or the mise skill (U4).
- No `pack.yaml` bump — U7.
- No doc outside the pack — `DOCS FALSIFIED:` lines.
- `plugins/**/*.md` outside `config/` is not dprint-formatted: match the fold
  width by hand; strict-YAML frontmatter untouched.
- Delete with `rm`, never `git rm`.

## Commit

`feat: pre-commit pack — git-config hook states the forge identity rule; check-json skips .vscode`
— written by the orchestrator after the wave gate. Type from
`.config/git-conventional-commits.yaml`; no scopes.
