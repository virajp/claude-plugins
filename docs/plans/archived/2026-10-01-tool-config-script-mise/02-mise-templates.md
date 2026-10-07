# U2 — mise templates

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/skills/tool-config/assets/mise/.config/**`; and
  **only the `**/.config/mise/locks/` exclusion line** in
  `plugins/stackgen/skills/tool-config/assets/dprint/.config/taplo.toml`,
  `plugins/stackgen/skills/tool-config/assets/dprint/.config/dprint.json`,
  `plugins/stackgen/skills/tool-config/assets/pre-commit/.config/pre-commit-config.yaml`,
  `plugins/stackgen/skills/tool-config/assets/pre-commit/.config/linter.yaml`
- **Model:** opus
- **Kind:** edit
- **Read first:** every file under `TC/assets/mise/`, top to bottom.
- **Lazy-load:** `TC/references/mise.md` §1–3 and §6 (layout, marked positions,
  the task library); `.claude/skills/plugin-authoring/references/checks.md` rule
  11 and rule 15.

## Ruling

> D6 — Comment anchors, as today: `MARKED POSITION` comments and
> `# >>> <requester>` / `# <<< <requester>` blocks. Assets stay valid working
> files; no second template tree.

> D13 — Bare `mise use` is forbidden: a tool is entered into the config first,
> then installed with `mise install`.

> D14 — Every lock passage … the `**/.config/mise/locks/` exclusion line in all
> four base lists … removed in this plan.

> D16 — `tasks/setup/worktree` guards its install on `MISE_ENV` (B75 item 8);
> `tasks/setup/all` enters each member with `(cd <member> && mise run …)` in a
> subshell, so the member's own miserc is read (B75 item 9).

User, verbatim, on B75 item 8: *"must use `mise` skill to run any mise tasks
since they can be custom for each repo"* — the repo-local skill itself is U3's
(it lands in wave 2, beside U4's checker allowlist change, so no wave ends red).

## Edits

1. **Every `MARKED POSITION` anchor** in the mise assets stays where it is and
   keeps its wording, so `/vwf:doctor`'s splice test still finds it. Where a
   position has no anchor the script can find unambiguously (e.g. the
   `PATH_ENTRIES` comment at `conf.d/env.toml:15` and `RUNTIME_BLOCK` at the end
   of `mise.toml`), give it one `# MARKED POSITION: <NAME>` line in the same
   style as the others. Do not introduce `{{…}}` tokens.
2. **Pins** in `conf.d/tools.toml` and `conf.d/tools.dev.toml` keep the version
   the template *requests* (`latest` or exact) — the script resolves `latest` at
   write time (U3). Add one comment line at the top of each tools file:
   `# Pins are exact versions, resolved when written; never run a bare "mise use".`
3. **Lock leftovers.** Remove `conf.d/tools.toml:5` (the "Commit the lock and
   its sidecar" comment) and any other lock mention left in the mise assets.
   Remove the `**/.config/mise/locks/` line from the four exclusion files named
   in Owns — all four in this one unit, so checker rule 15's one exclusion set
   stays consistent. Remove the matching comment line above it in
   `linter.yaml:11`.
4. **`mise/tasks/setup/worktree`** — the plain `mise install` (`:15`) runs only
   when `MISE_ENV` is set, else prints the `MISE_ENV=dev` remedy through the
   helper library's print vocabulary and exits 1, the way `setup/all:16-18`
   refuses an unset `MISE_ENV`.
5. **`mise/tasks/setup/all`** — replace `mise run --cd <member> …` (`:54`) with
   a subshell `( cd "<member>" && mise run … )` so the member's own
   `miserc.toml` is the one read.

## Verification

- `grep -rn -E 'mise\.lock|mise/locks|lock-only|lockfile_platforms' plugins/stackgen/skills/tool-config/assets`
  prints nothing.
- `grep -rn 'mise use' plugins/stackgen/skills/tool-config/assets` prints only
  the "never run a bare" warnings.
- `mise run p:plugins:shellcheck` green (the edited task files).
- The full wave gate.

## Guardrails

- Do not touch `TC/scripts/**` (U1, U3), `TC/assets/mise/.claude/**` (U3),
  `TC/references/**` (U6) or `scripts/src/**` (U4).
- In the four non-mise asset files, change the lock exclusion line and its
  comment only.
- Task files keep mode `755` and their `#!/usr/bin/env bash` shebang; BSD `sed`
  only if you script an edit.
- Delete with `rm`, never `git rm`.

## Commit

`refactor: mise templates — no lock, worktree env guard, member subshell`
