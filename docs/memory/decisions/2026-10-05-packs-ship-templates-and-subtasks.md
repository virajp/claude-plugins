# Decision — packs ship templates and subtasks; the hooks call `…:all` tasks

**Date** 2026-10-05 · **Branch** `2026-10-05-tool-config-templates` · **Plan**
[`docs/plans/2026-10-05-tool-config-templates/`](../../plans/2026-10-05-tool-config-templates/index.md)
· **Supersedes**
[`2026-10-01-pack-entries-are-structured.md`](./2026-10-01-pack-entries-are-structured.md)
whole; [`2026-09-26-tool-config.md`](./2026-09-26-tool-config.md) items 6 and 10
(pack `tool-config:` lists, `machine_env`, `set-env`); and
[`2026-09-12-task-library-configures-each-gate-once.md`](./2026-09-12-task-library-configures-each-gate-once.md)
lines 40-46 (the hooks call `code:format`, `code:lint`)

## What was decided before

A pack asked tool-config for its lines through a `tool-config:` list in
`pack.yaml` — structured mise entries since 2026-10-01, git strings otherwise —
which the materializer ran through `apply-entries`. A machine value was a
`machine_env` entry `/vwf:setup` detected, asked and wrote with `set-env`. A
stack's format and lint steps were whole-file overlays of `code/format` and
`code/lint`, so the last pack in composition order won and two packs
byte-identical overlays were deduped by hand. The three gate hooks called
`code:format`, `code:lint` and `code:sec`.

## What changed

The user, verbatim: *"your task name then changes to `code:check:all` as
`code:check` requires `check` to be a file"*. Confirmed with the other nine
reversals on 2026-10-05: *"yes, confirm all ten"*.

- **K1 — no `tool-config:` list, no `machine_env`.** The checker refuses both
  keys. A pack's mise files and any file needing a value live in its
  `templates/`, rendered by tool-config's `pack`; its values are `@@` names
  stored under `packs.<slug>` and given with `--set`. swiftui's `XCODE_VERSION`
  and three simulator values are the first.
- **K2 — subtasks.** `code:check:all`, `code:lint:all`, `code:format:all`,
  `setup:deps:<verb>:all` and `setup:ai:all` are templates calling every subtask
  in their folder, re-rendered whenever a pack adds or removes one; an empty one
  passes. Universal subtasks: `code/format/dprint`, `code/format/shell`,
  `code/lint/shell`, `code/lint/workflows`, `code/lint/house`, `setup/ai/base`.
- **K3 — one owner per tool.** A pack's subtask is named for the pack and runs
  its own tool alone — `code/{format,lint}/swift-format`, `code/lint/swiftlint`,
  `code/{format,lint}/ruff`, `code/check/uv`, `setup/deps/<verb>/<slug>`,
  `setup/ai/claude-code`. `language/swift` and `swiftui` drop their format and
  lint overlays.
- **K4 — the hooks** call `code:format:all --fix`, `code:lint:all --fix`,
  `code:check:all` and `code:sec --staged`, plus `graphify-refresh`.

## Rulings during execution

- **G5** — flutter's subtasks are named `flutter`, not `dart`: a subtask's leaf
  must equal the pack's slug.
- **W4** — no `code/lint/eslint`: eslint runs only through the house linter,
  which needs the eslint config its installer generates; `code/lint/house`
  covers it.
- **W5** — fnox's `setup/secrets` replaces tool-config's `#PLACEHOLDER` slot of
  that name; a pack may ship a file at a tool-config path only to fill a slot.
- **W6** — the doppler pack, its bundle and its `setup/secrets` overlay are
  deleted; fnox is the one secrets provider, and any remaining doppler mention
  is stale.
- **W8** — the checker's name check on a pack's templates is grammar-only: a
  pack's own keys live in the target repo's `stackgen.yaml`, so any upper-snake
  name is allowed there, and the render refuses a key colliding with a global
  name.

## The alternatives rejected

- **Whole-file overlays with byte-identical dedupe** — composition order picked
  a winner silently, and removing a pack could not restore what it replaced.
- **Language packs own the tools** — two languages sharing a tool would each
  ship it.
- **`machine_env` kept** — a value asked by setup and written by tool-config is
  two writers for one key.
