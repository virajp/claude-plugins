# U5 — The materializer hands tools to bootstrap

- **Wave:** 2
- **Depends on:** U1
- **Owns:** `plugins/stackgen/skills/stackgen-stack-template/**`,
  `plugins/stackgen/skills/stackgen-sync/**`,
  `plugins/stackgen/skills/stackgen-stack-menu/**`
- **Model:** opus
- **Kind:** edit
- **Read first:** `stackgen-stack-template/SKILL.md`,
  `stackgen-stack-template/references/materializer.md`,
  `stackgen-sync/SKILL.md`, `stackgen-stack-menu/SKILL.md`.
- **Lazy-load:** `plugins/stackgen/assets/pack-format.md`

## Ruling

> - Decision 8: Plugins may run `mise run setup:configs`. To edit
>   `.config/bootstrap.toml`, a plugin shallow-clones bootstrap, reads
>   `docs/sync/vwf.md` in the clone and gives it instructions:
>   `bootstrap: add tools [<tool>, …]` or `bootstrap: remove tools [<tool>, …]`,
>   plus `reason: <why>`. It never edits `bootstrap.toml` by its own rules.
> - Decision 9: Remove a tool only when no other pinned pack declares it. With
>   no `.config/bootstrap.toml`, stop and name `/vwf:setup reshape`.
> - Decision 10: The materializer reads forge and secrets from the tools
>   `.config/bootstrap.toml` selects (`github`/`gitlab`; `fnox`/`doppler`), not
>   from `stackgen.yaml`.

The user, verbatim: "plugins can run `setup:configs` but to edit
`bootstrap.toml`, plugin must handoff to the `bootstrap` repo's
`docs/sync/index.md` file" — then corrected: "name the file `docs/sync/vwf.md`
so that it's absolutely clear that it's meant for this plugin";
"`docs/sync/vwf.md` will take all the instructions and follow respective tool's
md file from `docs/sync/<tool>.md`. This way I can maintain changes in
`bootstrap` without breaking the integration."

## Edits

1. **`references/materializer.md`** — replace the tool-config `pack` call
   (:110-182) and the `pack-remove` call (:470-489):
   - first pin: copy the pack's `config/` as is; collect its `bootstrap_tools:`;
     when any is not in `.config/bootstrap.toml`'s `tools`, run the ruling 8
     handoff with `add tools` and `reason: stackgen pack <type>/<slug> pinned`.
     The clone is `git clone --depth 1 git@github.com:virajp/bootstrap.git` into
     a `mktemp -d` directory, removed afterwards.
   - removal: per ruling 9, `remove tools` with the tools no other pinned pack
     declares.
   - With no `.config/bootstrap.toml`, stop per ruling 9. Also :23-26, :255
     (ruling 10), :362-416: drop every `stackgen.yaml` and tool-config step.
2. **`SKILL.md`** (:115-116, :167-169, :196-203) — the same change, in summary.
3. **`stackgen-sync/SKILL.md`** (:45-47, :78-105),
   **`stackgen-stack-menu/SKILL.md`** (:37, :89) — rewrite every passage that
   names tool-config, `stackgen.yaml`, `templates/` or `values:`.

## Verification

- `mise run p:plugins:check` — green.
- `grep -rnE 'tool-config|stackgen\.yaml|templates/|values:|docs/sync/index' <owned paths>`
  — no hit that describes current behaviour.
- `grep -rn 'docs/sync/vwf.md' <owned paths>` — at least one hit in
  `materializer.md`.

## Guardrails

- Name only `docs/sync/vwf.md` in bootstrap; never `docs/sync/index.md`,
  `docs/sync/<tool>.md` steps or the bootstrap tool tree.
- Do not touch `plugins/stackgen/skills/tool-config/**` or `plugins/vwf/**`.
- `plugins/**/*.md` is not formatted; match the surrounding fold width by hand.

## Commit

`feat: the materializer hands pack tools to bootstrap`
