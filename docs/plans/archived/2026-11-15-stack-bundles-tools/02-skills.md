# U2 — stackgen skills and assets

- **Read first:** each `SKILL.md` under `plugins/stackgen/skills/` with its
  references, `assets/output-tree.md`, `assets/pack-format.md`,
  `assets/kinds.md`, `assets/taxonomy.md`.
- **Lazy-load:** `plugins/vwf/assets/stack-adapter.md` (the menu and payload
  contract, read only); bootstrap R1b and R2b rulings in
  `/Users/virajpatel/Projects/github.com/virajp/bootstrap/docs/plans/` (or its
  `archived/`).

## Ruling

This file states each ruling in its final form. The ids point at the
`decisions` list of `index.json`.

- **D5, menu:** `stackgen-stack-menu` lists shipped bundles, the repo bundles
  in `.claude/stackgen/bundles/`, the design tools (`design-tools/<tool>/`, the
  folder name is the token) and the addons (D7), plus the open entry "compose
  a bundle". A new verb `compose` takes `slug`, `axis`, `platforms`, `tools`
  and `packs` from the caller, checks each tool name with
  `bootstrap catalog --json` and each pack ref against `stacks/`, writes
  `.claude/stackgen/bundles/<slug>.md`, and returns the slug. An item no pack
  covers is the ref `<kind>/<slug>@generated`.
- **D10, template:** materializing a bundle (shipped or repo) copies its
  packs as today and generates each `@generated` ref. It also copies the
  tool-knowledge entries (`tools/<slug>/`) whose `tools` list meets a tool the
  project links (`bootstrap describe --json`) or the bundle names, and every
  entry with `tools: []`. The skills land in `.claude/skills/`; `lock.yaml`
  records `tool/<slug>@<version>`.
- **D25:** a tool entry's `conventions.md` and `hooks/` (the pnpm hook and
  its wiring) land where a pack's land today (`assets/output-tree.md`). When
  `bootstrap describe --json` lists no project yet, every tool the bundle
  names counts as linked.
- **D9, LSP:** the local plugin `vwf-tools` takes its `lspServers` from
  `data.servers` of `bootstrap lsp --json`, copied unchanged; no pack or
  generator writes an LSP entry.
- **D6, design:** when a project's `design` names a tool, materialize adds to
  `vwf-tools` the three generic role skills (once), the tool's
  `references/<role>.md` as `skills/<role>/references/<tool>.md` (D32, D35),
  and that tool's `skills/`. A tool no project names is
  not added; a tool already present is not added twice.
- **D7:** `assets/addons.yaml` lists each optional Claude plugin: `name`,
  `summary`, `source` (its marketplace), `design_tools` it serves.
  `taste-skill` is the one entry, serving `claude-code`.
- **D11, sync:** `stackgen-sync` converts a repo once: each
  `pack/{language,package-manager,toolchain-gate}/<slug>@<v>` row becomes
  `tool/<slug>@1.0.0`, the files kept; each `pack/design-tool/...` row is
  removed and the tool is installed into `vwf-tools` per D6, its old
  `.claude/skills/design-import-*` files left in place and reported (D26); each
  `pack/addon/...` row is removed; each row of a deleted test task file
  (D8) is removed and the file is left in place. The report lists each change.
  After the conversion, sync diffs knowledge packs and tool entries by
  version, as today.
- A failed `bootstrap` call stops the skill with bootstrap's `errors` (R3a
  D16).
- **D16:** the template payload carries no `language_facts`, `lsp_servers`,
  `package_manager`, `lockfile` or `harness`.
- The asset docs (`pack-format`, `taxonomy`, `output-tree`, `ids`,
  `artifact-doctrine`, `contracts/`) describe the new tree. `kinds.md` is
  U1's (D29): do not edit it.
- **D32:** in `vwf-tools`, a design tool's reference lands at
  `skills/<role>/references/<tool>.md`, inside each role skill's folder, and
  a tool-only skill at `skills/<skill>/`. Design-tool files join
  `claims.json` as the LSP keys do: a repo that names the tool claims them,
  they are removed when no repo claims them, and adding or removing them
  bumps the `vwf-tools` version and prints the update pair
  (`references/local-plugin.md`).
- `.claude-plugin/plugin.json`: the `description` describes bundles, tool
  knowledge and design tools; `version` does not change.
- **D36:** the description is copied into `.claude-plugin/marketplace.json`.
  As the last step, run `mise x -- mise run p:plugins:marketplace` and then
  `mise x -- mise run p:plugins:marketplace -- --check`; both must pass.

## Edits

1. The four skills and their references.
2. `assets/**`, with the new `addons.yaml`.
3. `agents/stackgen-skill-reviewer.md` where it names a removed kind.
4. The manifest description.

## Verification

- `mise x -- mise run code:format` passes.
- K1 of `gates.keeps` finds no hit in the owned files.

## Guardrails

- Touch nothing outside the owned paths.
- `plugins/**/*.md` is not formatted by dprint: keep the fold width by hand.
- A skill's node script stays dependency-free (checker rule 16).

## Commit

`feat: stackgen materializes bundles over bootstrap tools and design tools`
