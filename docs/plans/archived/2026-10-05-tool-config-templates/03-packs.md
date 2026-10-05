# U3 — Packs

- **Wave:** 2
- **Depends on:** U1
- **Owns:** `plugins/stackgen/stacks/**` — every `pack.yaml` (not its `version:`
  line), every `config/**`, new `templates/**`, the doppler pack directory and
  `stacks/bundles/doppler.md` (deleted), and `stacks/inventory.md` (regenerated,
  E20). Not the prose `*.md` files (U6).
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md's facts (the per-pack entries and overlays) and the
  Template names table; each `pack.yaml` you edit.
- **Lazy-load:** the overlay task files, one at a time, when splitting them.

## Ruling

> E2 — A pack has `templates/` beside `config/`. The materializer copies
> `config/` and keeps its lock exactly as today; the script renders `templates/`
> to the same relative paths.

> E9 — `code:check:all`, `code:lint:all`, `code:format:all`,
> `setup:deps:<verb>:all` and `setup:ai:all` call each subtask by name; an empty
> `…:all` passes.

> E3 — A pack's mise files always live in its `templates/`; they write
> `version = "latest"` and the script resolves CI-loaded pins at render.

> E10 — `code/format/swift-format`, `code/lint/swift-format` — swift-format
> pack; `code/lint/swiftlint` — swiftlint; `code/lint/eslint` — eslint;
> `code/format/ruff`, `code/lint/ruff` — ruff; `code/format/dart`,
> `code/lint/dart` — flutter; pnpm keeps only its own steps (e.g.
> sort-package-json); `setup/deps/<verb>/<slug>` for flutter, swiftui, swift,
> pnpm, uv; `code/check/uv` (the uv lock check, for a Python project);
> `setup/ai/claude-code` (taste-skill). language/swift and swiftui drop their
> format and lint overlays. A pack subtask carries only its own tool's steps.

> E14 — The doppler pack, its bundle and its `setup/secrets` overlay are
> deleted. E15 — swiftui's four values become `@@…@@` in
> `templates/.config/mise/conf.d/swiftui/mise.toml`; `machine_env` leaves its
> `pack.yaml`. E17 — B74, the shipped config only. E20 — U3 regenerates
> `inventory.md`.

User, verbatim: *"`uv` has 2 usecases, one with `mise` to replace `pipx` for
tools and other is when the repo is actually a python project. lock files are
only disabled for 1st usecase"*; *"For this we must add `code:check` mise task
where any pack hooks or repo's own hooks can keep the logic"*.

## Edits

1. **Every `pack.yaml`** — delete the `tool-config:` list and its comments;
   delete swiftui's `machine_env:`. Nothing replaces dprint plugins, excludes,
   linter ignores, gitignore or attribute entries — they are universal (U2).
2. **mise lines → `templates/.config/mise/conf.d/<slug>/`**: pnpm
   `mise.dev.toml` (`npm:sort-package-json` latest, alias `npx = "pnpm dlx"`);
   swiftlint `mise.toml` (`aqua:realm/SwiftLint` latest); fnox `mise.toml`
   (`fnox` latest); swiftui `mise.toml` (`[env]`
   `XCODE_VERSION = "@@XCODE_VERSION@@"` and the three `SIMULATOR_*`).
3. **Overlays → subtasks** per E10, under `config/.config/mise/tasks/`: move
   each overlay to its subtask path and strip what is now universal (dprint,
   shfmt, shellcheck, actionlint, the house linter, the placeholder notice) so
   only the pack's tool remains; `setup/deps/<verb>` overlays move to
   `setup/deps/<verb>/<slug>`. language/swift and swiftui lose their
   `code/format` and `code/lint` overlays; swift-format and swiftlint gain the
   subtasks (from that body). `rm` the old paths.
4. **uv** — `code/check/uv` runs `mise x -- uv lock --check` only when a
   `pyproject.toml` with a `uv.lock` beside it exists (a Python project); it
   passes otherwise.
5. **claude-code** — `config/.config/mise/tasks/setup/ai/claude-code` installing
   `taste-skill@taste-skill` from `Leonxlnx/taste-skill` the way `setup/ai/base`
   installs plugins (read `assets/.config/mise/tasks/setup/ai/base` after U2
   lands it, or the current `assets/mise/.config/mise/tasks/setup/ai`).
6. **swiftui** — the `set-env` hints in
   `config/.config/mise/tasks/_scripts/xcode:19` and `test/golden:36,43,56,59`
   name `/vwf:setup` as the remedy.
7. **Doppler** — `rm -r` the doppler pack and `bundles/doppler.md`.
8. **B74** — format `cloud-service/containers/config/wrangler.jsonc` with the
   shipped dprint config only —
   `plugins/stackgen/skills/tool-config/assets/.config/dprint.json` when U2 has
   already moved it there, else
   `plugins/stackgen/skills/tool-config/assets/dprint/.config/dprint.json` (U2
   changes no JSON formatting option).
9. **Inventory** — `mise run p:plugins:inventory` last (E20).

## Verification

- `rg -n "^tool-config:|^machine_env:" plugins/stackgen/stacks` prints nothing.
- `rg -ln "doppler" plugins/stackgen/stacks --glob '!*.md'` prints nothing.
- Every subtask leaf equals its pack's slug (U1's check):
  `mise run p:plugins:check` green.
- `mise run p:plugins:inventory -- --check` green.
- `shellcheck -x` over every moved task file passes.

## Guardrails

- Touch nothing outside Owns — not a prose `.md` (U6 rewrites conventions and
  bundle docs; record each falsified passage as `DOCS FALSIFIED:`), not a
  `version:` line or bundle pin (U8).
- Payload under `config/` is excluded from this repo's dprint; never format it
  with this repo's config.
- Never `cat > file <<EOF` — use the Write tool.
- Delete with `rm`, never `git rm`.

## Commit

`feat: packs ship mise templates and per-pack subtasks; doppler retires`
