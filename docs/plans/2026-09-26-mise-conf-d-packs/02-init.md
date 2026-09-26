# U2 — init merges pack mise lines into the section files and asks on drift

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/init/SKILL.md`,
  `plugins/vwf/skills/init/references/**`, `plugins/vwf/skills/init/packs/**`
- **Model:** opus
- **Kind:** edit
- **Read first:** `init/references/fragments-and-sections.md` whole (the
  `pre-commit.d` and `vscode.d` idioms); `init/SKILL.md`; the parts of
  `new-repo.md` and `existing-repo.md` that land packs and plan a reshape;
  `init/packs/mise/**` files the Facts list; index.md's Facts.

## Ruling

> - Decision 2: init reads a pack's `mise.d/` from the plugin and merges each
>   file into `.config/mise/conf.d/<section>[.<env>].toml` between
>   `# >>> <pack>` / `# <<< <pack>` markers: replace between markers, keep
>   everything outside byte for byte, prune a block whose pack is no longer
>   landed, validate the TOML.
> - Decision 3: No hash. On a later init or setup run, a block whose content
>   differs from the pack's current lines — with the repo's `machine_env` values
>   spliced into the pack's lines first — is shown to the user with take the
>   pack's / keep mine / merge, and the answer applied. The user: *"the next
>   time `setup` or `init` is run and finds the drift, skill must check with
>   user on what to do and accordingly do it"*.
> - Decision 5: A reshape folds an existing `.config/mise/conf.d/<pack>.toml`
>   into the section blocks (values kept) and deletes the file, as one consent
>   row per repo.
> - Decision 11: Any sentence a unit adds is short.

## Edits

1. **`references/fragments-and-sections.md`** — a new section, "mise section
   blocks", in the shape of the `pre-commit.d` one: inputs (every landed pack
   that ships `mise.d/`, read from the plugin — the user: *"it must stay with
   the plugin and only be used from there"*), the marker format, the merge, the
   prune, TOML validation, the drift question (decision 3) and how `machine_env`
   values are spliced before comparing.
2. **`SKILL.md`, `new-repo.md`, `existing-repo.md`** — the merge runs after
   packs land and on every reshape; the reshape plan carries decision 5's
   migration row.
3. **`packs/mise/**`** — `tasks/setup/secrets:16`,
   `skills/mise/SKILL.md:24,131-133`, `references/config-files.md:222,272-276`,
   `task-library.md:276`, `conventions.md:225`: provider lines live in pack
   blocks in the section files, not in `conf.d/<pack>.toml`.
   **`packs/repo-hygiene/conventions.md:258`** likewise.
4. **`new-repo.md:449`** — the `machine_env` note names the block in
   `conf.d/env.toml`.

## Verification

- `MISE_ENV=dev mise run p:plugins:check` green
- `MISE_ENV=dev mise run p:plugins:shellcheck` green
- `grep -rn "conf.d/<pack>\|conf.d/\*.toml" plugins/vwf/skills/init` shows only
  the migration row

## Guardrails

- `plugins/**/*.md` is not formatted — match the fold width by hand; no code
  span wraps a line; payload excluded from this repo's dprint; keep exec bits.
- Touch nothing outside the owned paths.
- Delete with `rm`, never `git rm`; no `git checkout`/`restore`.

## Commit

`feat: vwf init merges pack mise lines into conf.d section blocks` — written by
the orchestrator after the wave gate.
