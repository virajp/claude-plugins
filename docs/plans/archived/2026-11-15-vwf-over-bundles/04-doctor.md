# U4 — Doctor over bundles and bootstrap tools

- **Read first:** `plugins/vwf/skills/doctor/scripts/lib/stack.mjs` (about
  lines 123-146, 243-316, 335-340), `references/stack-checks.md` (about lines
  48-149, 234-270, 415-430, 471-647), `SKILL.md` (about lines 39-64), their
  tests and fixtures, as R4b leaves them.

## Ruling

This file states each ruling in its final form. The ids point at the
`decisions` list of `index.json`. Every new row is `degraded` (R4b D28).

- **D8:**
  - Remove the `binaries` and probe checks from `language_facts`, and the
    `lockfile:` fact check.
  - LSP: the `lspServers` of `vwf-tools` hold every server of `data.servers`
    of `bootstrap lsp --json` run in that repo (D35); a missing one is a
    row with the fix `/vwf:setup`.
  - The pack-version check also covers `tool/<slug>` rows.
  - New: each `tools:` name of a project's bundle, read from the
    materialized entry `.claude/stackgen/templates/<slug>.md` (D23; an entry
    with no `tools:` key is a row with the fix `/vwf:setup`, D33), is
    linked to the project (`bootstrap describe --json`); only a tool of
    category `languages` or `package-managers` needs a link, any other only
    needs to be selected (D29), and a project with no
    `repo.projects.<name>` is skipped (D25); else a row with the fix
    `bootstrap add tool <t>`, then `bootstrap detect --add`.
  - New: a project's design tool has `skills/<role>/references/<tool>.md` in
    `vwf-tools` for the three roles; else a row with the fix `/vwf:setup`.
  - Addons: each `addons:` name has a key that starts with `<name>@` in
    `tools.claude.plugins.project` (`bootstrap config get`; D24, D31); else a row
    with the fix `/vwf:setup`. When the `claude` tool is not selected, the
    same row (D26), not a refusal.
  - New: a `pack/{language,package-manager,toolchain-gate,design-tool,addon}`
    row in `lock.yaml` is a row with the fix `/vwf:setup`.
  - `p/_project` ids and not-materialized: no change.
- A failed `bootstrap` call is a refusal (R4a D23).
- The tests use the stub `bootstrap` and `mise` on `PATH` (R4b D22); every
  new and changed row has a case.

## Verification

- `mise x -- pnpm vitest run` passes.
- `mise x -- mise run code:format` passes.

## Guardrails

- Touch nothing outside `plugins/vwf/skills/doctor/` and its test files and
  fixtures under `scripts/src/`.
- Each script stays dependency-free (checker rule 16).

## Commit

`feat: doctor examines bundle tool links, LSP from bootstrap and vwf-tools`
