# U4 — The pack format declares `bootstrap_tools:` and drops `templates/`

- **Wave:** 2
- **Depends on:** U1
- **Owns:** `plugins/stackgen/assets/pack-format.md`,
  `plugins/stackgen/assets/output-tree.md`, `plugins/stackgen/assets/kinds.md`,
  `plugins/stackgen/assets/taxonomy.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** every owned file, top to bottom, before editing.

## Ruling

> - Decision 3: A new `pack.yaml` key, `bootstrap_tools: [<tool>, …]`.
> - Decision 4: Drop the tier and the key from the pack format. Packs ship
>   `config/` only, copied as is.
> - Decision 6: Bootstrap's: conf.d pins, `setup/deps/**`, `setup/ai/**`,
>   `setup/secrets`, gate configs, `code/format/**`, `code/lint/**`,
>   `code/check/**`, `.npmrc`, `fnox.toml`. Stays: `test/**`, `_scripts/xcode`,
>   `p/_project/**`, `wrangler.jsonc`.
> - Decision 8: Plugins may run `mise run setup:configs`. To edit
>   `.config/bootstrap.toml`, a plugin shallow-clones bootstrap, reads
>   `docs/sync/vwf.md` in the clone and gives it instructions:
>   `bootstrap: add tools [<tool>, …]` or `bootstrap: remove tools [<tool>, …]`,
>   plus `reason: <why>`. It never edits `bootstrap.toml` by its own rules.

## Edits

1. **`pack-format.md`** — at :34-85 and :191-277: remove the `templates/` tier,
   `values:` (:239) and the subtask doctrine (:271) that lands bootstrap's
   tasks. Add a `bootstrap_tools:` section: an optional list of bootstrap tool
   names; the materializer hands them to bootstrap per ruling 8; the checker
   validates the names against a pinned list. Restate what `config/` may carry
   per ruling 6. Leave the `os:` paragraph (:403-409) alone.
2. **`output-tree.md`** — :110 ("fourth target"), :324, :420: drop tool-config
   as a target; say the toolchain comes from bootstrap.
3. **`kinds.md`**, **`taxonomy.md`** (:95) — rewrite every passage that names
   tool-config, `templates/`, `values:` or pack-landed pins.

## Verification

- `mise run p:plugins:check` — green.
- `grep -nE 'tool-config|stackgen\.yaml|templates/|values:' <owned paths>` — no
  hit that describes current behaviour.

## Guardrails

- Do not touch `plugins/stackgen/skills/**` or `stacks/**`.
- `plugins/**/*.md` is not formatted; match the surrounding fold width by hand.

## Commit

`docs: the pack format declares bootstrap_tools`
