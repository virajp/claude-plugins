# U8 — The mise assets: graphify as a dev tool, a code:graph task

- **Wave:** 2
- **Depends on:** U1
- **Owns:** `plugins/stackgen/skills/tool-config/assets/mise/**`
- **Model:** opus
- **Kind:** edit
- **Read first:** `assets/mise/.config/mise/conf.d/tools.dev.toml`;
  `assets/mise/.config/mise/tasks/setup/ai` :170–200; a sibling `code/*` task
  for shape; 95octane's task at
  `~/Projects/github.com/95octane/workspace/.config/mise/tasks/code/graph` (read
  only, if present); index.md's Facts.

## Ruling

> - Decision 9: `"pipx:graphifyy" = "latest"` in the mise base's
>   `conf.d/tools.dev.toml` (dev only); a `code:graph` task in the task library
>   (after 95octane's); `setup:ai` no longer runs `graphify hook install`. The
>   pre-commit `post-commit` hook is T2's.
> - Decision 15: Any comment a unit adds is one line.

## Edits

1. **`conf.d/tools.dev.toml`** — `"pipx:graphifyy" = "latest"` with a one-line
   comment that the PyPI name is `graphifyy`.
2. **`tasks/code/graph`** (new, executable, `#!/usr/bin/env bash`, sourcing
   `_scripts/helpers` like its siblings) — refresh the graph (the 95octane task
   as the model; if absent, `graphify update` or the documented refresh command,
   recorded under `DECIDED:`); a missing `graphify` prints the fix and exits 0
   so a commit never fails on it.
3. **`tasks/setup/ai`** :180–195 — keep `graphify install --platform claude`;
   remove `graphify hook install` and its branch; the missing-graphify hint says
   `MISE_ENV=dev mise run setup:all` instead of a global install.

## Verification

- `MISE_ENV=dev mise run p:plugins:shellcheck` green
- `ls -l …/tasks/code/graph` shows the exec bit
- any `mise` experiment runs with `HOME` and every `MISE_*` dir under one
  `mktemp -d`

## Guardrails

- Payload excluded from this repo's dprint; keep exec bits.
- Touch nothing outside `assets/mise/**`.
- Delete with `rm`, never `git rm`; no `git checkout`/`restore`.

## Commit

`feat: graphify is a universal dev tool with a code:graph task` — written by the
orchestrator after the wave gate.
