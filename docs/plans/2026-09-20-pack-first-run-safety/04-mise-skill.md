# U4 — the mise skill: the task library's prose

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/stacks/toolchain-manager/mise/skills/**`,
  `plugins/stackgen/stacks/toolchain-manager/mise/conventions.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file, top to bottom, before editing —
  `skills/mise/references/task-library.md` (`:148`, `:153`, `:162`, `:168`,
  `:263`, `:267`), `skills/mise/SKILL.md`,
  `skills/mise/references/config-files.md`, `conventions.md`.
- **Lazy-load:**
  `plugins/stackgen/stacks/toolchain-gate/dprint/skills/**/SKILL.md:100-105`
  (says `dprint config update` runs from `setup:mise` — read only; it is U6's if
  it reads false, report it as `DOCS FALSIFIED:`).

## Ruling

Decision 1 — Posture: "A pack task **never clobbers foreign state** … Every
destructive step sits behind an explicit flag the user passes on purpose, and
`setup:all` passes none of them."

Decision 2 — git-config contract, in full as index.md states it, is what the
`code:git-config` row and its paragraph now describe: the seven keys, the three
variables per forge, equality, `--fix` sets and never deletes an identity.

Decision 3 — precommit / mise flags: "`setup:precommit`: … a new `--force` flag
does today's `:29-30`. `pre-commit autoupdate` (`:19`) runs only under a new
`--update` flag. `setup:mise`: `mise upgrade --local` (`:22`) and
`dprint config update` (`:44`) run only under a new `--upgrade` flag.
`setup:all` passes neither flag."

Decision 9 — Vocabulary: the flag names and the variable names, exactly.

## Edits

1. **`skills/mise/references/task-library.md`** — the task table rows: `:148`
   `setup:mise` gains `[--upgrade]` and says upgrade + dprint config update run
   only under it; `:153` `setup:precommit` gains `[--force] [--update]` and
   says: refuses a foreign hook manager or `core.hooksPath` without `--force`,
   autoupdate only under `--update`; `:162` `code:git-config [--fix]` reads
   "require the forge identity and ssh signing in the local git-config; `--fix`
   sets them from `GITHUB_*` / `GITLAB_*` / `GIT_*`". `:168`, `:263`, `:267`
   wherever they restate any of the three. A short new passage under the setup
   tasks: **what a task never does to the host** — the posture in three lines,
   and the three flags. The passage at `:174` ("Nothing in this set edits a
   remote's settings") stands.
2. **`skills/mise/SKILL.md`** and **`references/config-files.md`** — any
   restatement of the above; the environment-variable names appear once, in the
   git-config paragraph, with the forge rule.
3. **`conventions.md`** — the same where it describes `setup:all` or the
   hook-wired tasks.

## Verification

- `mise run p:plugins:check` green (rule 10 — the technology-free guard is
  vwf's, not stackgen's; still, name no tool the pack does not ship).
- `grep -rn "GITHUB_USER_NAME" plugins/stackgen/stacks/toolchain-manager/mise/skills`
  — at least one hit.
- `grep -rn "\-\-upgrade\|\-\-force\|\-\-update" plugins/stackgen/stacks/toolchain-manager/mise/skills/mise/references/task-library.md`
  — all three present.
- `grep -rn "never per-repo\|never local" plugins/stackgen/stacks/toolchain-manager/mise`
  — zero hits of the old rule.

## Guardrails

- Do not edit the task scripts (U1), the pre-commit pack (U2) or the
  gitleaks/grype packs (U3).
- No `pack.yaml` bump — U7.
- No doc outside the mise pack — `DOCS FALSIFIED:` lines (the dprint skill's
  `:100-105` is one if it reads false).
- `plugins/**/*.md` is not dprint-formatted: match the fold width by hand;
  strict-YAML frontmatter untouched.
- Delete with `rm`, never `git rm`.

## Commit

`docs: mise skill — the three setup flags and the git-config identity rule` —
written by the orchestrator after the wave gate. Type from
`.config/git-conventional-commits.yaml`; no scopes.
