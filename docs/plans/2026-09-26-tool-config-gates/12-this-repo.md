# U12 — This repo refreshes graphify from a pre-commit post-commit hook

- **Wave:** 1
- **Depends on:** —
- **Owns:** `.config/pre-commit-config.yaml`, `.config/mise/tasks/code/graph`
  (new), `.config/mise/conf.d/tools.dev.toml`
- **Model:** opus
- **Kind:** edit
- **Read first:** `.config/pre-commit-config.yaml` (:20
  `default_install_hook_types`, :39 `exclude: ^graphify-out/`, the local hook
  block);
  `plugins/stackgen/skills/tool-config/assets/mise/.config/mise/tasks/code/graph`
  (T1's); `.config/mise/conf.d/tools.dev.toml` (B1's layout); index.md's Facts.

## Ruling

> - Decision 9: This repo takes the graphify hook now: `post-commit` in
>   `default_install_hook_types`, the `graphify-refresh` hook, a `code/graph`
>   task copied from T1's `assets/mise/.config/mise/tasks/code/graph`, and
>   `"pipx:graphifyy" = "latest"` in `.config/mise/conf.d/tools.dev.toml`. The
>   hook swap on this machine is an after-landing step.
> - Decision 5: a local `graphify-refresh` hook at stage `post-commit` runs
>   `mise x -- mise run code:graph`, `always_run`, `pass_filenames: false`.
> - Decision 12: Any comment a unit adds is one line (B65).

## Edits

1. **`.config/pre-commit-config.yaml`** — add `post-commit` to
   `default_install_hook_types`; add the `graphify-refresh` hook to the local
   repo block, exactly as decision 5 spells it.
2. **`.config/mise/tasks/code/graph`** — copy T1's asset verbatim, exec bit set.
3. **`.config/mise/conf.d/tools.dev.toml`** — add `"pipx:graphifyy" = "latest"`
   unless already present (report which under `DECIDED:`).
4. Do not run `graphify hook uninstall` or `pre-commit install` — those are
   after-landing steps.

## Verification

- `pre-commit validate-config .config/pre-commit-config.yaml` passes
- `MISE_ENV=dev mise tasks ls` lists `code:graph`
- `MISE_ENV=dev mise run code:precommit` green on the three files

## Guardrails

- The orchestrator commits this unit **first** in wave 1 (it owns
  `.config/pre-commit-config.yaml`).
- Touch nothing outside the three owned files; never edit `.git/hooks`.
- Delete with `rm`, never `git rm`; no `git checkout`/`restore`.

## Commit

`ops: graphify refreshes from a pre-commit post-commit hook` — written by the
orchestrator, first in wave 1.
