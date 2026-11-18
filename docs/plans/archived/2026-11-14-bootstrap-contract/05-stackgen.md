# U5 — stackgen calls the bootstrap CLI

- **Read first:** every owned file, top to bottom, and
  `plugins/stackgen/assets/bootstrap-contract.md` (U1).
- **Lazy-load (D19):** the contract plans that U1 cites, and `/Users/virajpatel/Projects/github.com/virajp/bootstrap/docs/design/cli.md` as it is after 4.0.0
  (`catalog --json`: the tools with their category, description, questions
  and defaults; `add tool --json`).

## Ruling

This file states each ruling in its final form. The ids point at the
`decisions` list of `index.json`.

- **D9:** the handoff finds the tools with `bootstrap catalog --json`, in
  place of a clone of bootstrap and its `docs/sync` files. For the tools it
  needs and the repo does not select (read with
  `bootstrap describe --json`, `data.tools`), it runs
  `bootstrap add tool <t>... --json --dry-run`, shows the user the plan and
  each pending question, and after the user's consent runs it again with
  `--yes` and the answers as `--answer <tool>.<key>=<value>`. It commits
  what bootstrap wrote, as the handoff commits today. The "instruction for an
  agent" form and its verbs go, except the plugin verbs, which R3c owns.
- **D4:** every "a repo with no `.config/bootstrap.toml`" test is the shaped
  test of the asset.
- **D8:** with no contract, the handoff stops with the asset's hint.
- `repo_name` (`ids.md`, about line 56) comes from
  `bootstrap config get repo.repo_name --json`.
- **D12:** keep every passage on Claude plugins (R3c) and on packs (R5).

## Edits

1. **`plugins/stackgen/skills/stackgen-stack-template/references/bootstrap-handoff.md`**:
   D9, D4, D8. Keep its consent and commit rules.
2. **`.../references/materializer.md`** (about lines 22, 109, 113, 339,
   394): the repo's
   tools come from `bootstrap describe --json`; stackgen never writes a file in
   `.config/bootstrap/`.
3. **`plugins/stackgen/skills/stackgen-sync/SKILL.md`** (about line 108): D4.
4. **`plugins/stackgen/assets/ids.md`** (about line 56): the `repo_name` row;
   about line 63: `commit_scopes` is read with
   `bootstrap config get repo.commits --json` (D27).
5. **`plugins/stackgen/skills/stackgen-stack-template/SKILL.md`** (about lines
   237-239) and **`plugins/stackgen/assets/pack-format.md`** (about line 61):
   the fresh clone and `docs/sync/vwf.md` become D9's `catalog` and `add tool`
   calls (D18).

## Verification

- `mise x -- mise run code:format` passes.
- `grep -rnF '.config/bootstrap.toml'` over the owned files finds nothing.
- `grep -nF 'catalog --json'` finds the handoff's tool step.

## Guardrails

- Touch nothing outside the owned paths.
- `plugins/**/*.md` is not formatted by dprint: keep the fold width by hand.
- Delete with `rm`, never `git rm`.

## Commit

`feat: stackgen's handoff calls the bootstrap CLI`
