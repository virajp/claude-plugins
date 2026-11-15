# U3 — Setup materializes bundles over bootstrap tools

- **Read first:** `plugins/vwf/skills/setup/references/materialize.md` whole
  and the `SKILL.md` passages that call it.
- **Lazy-load:** `plugins/vwf/assets/stack-adapter.md` as U1 leaves it.

## Ruling

This file states each ruling in its final form. The ids point at the
`decisions` list of `index.json`.

- The materialize pass, per repo of the product, in order:
  1. **D6:** read `.claude/stackgen/lock.yaml`. A
     `pack/{language,package-manager,toolchain-gate,design-tool,addon}/...`
     row runs `/stackgen:stackgen-sync` (its one-time conversion, R5a D11) on
     the user's consent, before anything else.
  2. **D7, D23:** for each landing (repo, bundle slug), read the bundle's
     `tools:` from the menu payload (U10). Each tool the repo does not
     select is added with `bootstrap add tool <t> --yes --json`; then
     `bootstrap detect --add --yes --json` links the tools to the projects.
     One consent line lists the tools to add, and `claude` when the base repo
     has addons and does not select it (D16). **D18:** when detect proposes no
     link of a bundle tool to the project that names the bundle, setup runs
     `bootstrap config set tools.<t>.projects '<JSON list>' --json` with that
     project added. **D25, D29:** only a tool of category `languages` or
     `package-managers` (`bootstrap describe --json`) gets a project link
     (bootstrap R2d D30); any other bundle tool only needs to be selected. A
     project with no `repo.projects.<name>` is skipped (R4b D26 reports it).
  3. Invoke the stack-template as today; it materializes packs, tool
     knowledge, LSP and the design tool (R5a).
  4. **D4, D34:** in the base repo, read the map with
     `bootstrap config get tools.claude.plugins.project --json`; add a key
     `<plugin>@<marketplace>` = `<owner/repo>` for each `addons:` name, from
     the entry's `plugin`, `marketplace` and `repo` in `addons.yaml` (D15);
     **D17:** drop each key that matches an `addons.yaml` entry not in
     `addons:`, and keep every other key; write the whole map back with
     `bootstrap config set tools.claude.plugins.project '<JSON object>' --json`.
     **D32:** when `claude` is not selected and step 2 did not add it, this
     step asks its own consent to add it first. **D30:** then,
     when `claude` is selected and this run set or unset a `plugins.project`
     key, `mise run setup:ai` installs and removes them.
- **D27:** `addons:` names are no landing entries: the landing list holds
  bundle slugs only, and a dropped addon is no stack-template removal call;
  step 4 replaces both.
- A declined step stops that repo's pass with a report; the other repos go
  on.
- A failed `bootstrap` or `mise` call stops that repo's pass with its errors
  (R3a D16, R4b D25).

## Verification

- `mise x -- mise run code:format` passes.

## Guardrails

- Touch nothing outside `plugins/vwf/skills/setup/`.
- `plugins/**/*.md` is not formatted by dprint: keep the fold width by hand.
- Do not change the steps of earlier formats.

## Commit

`feat: setup adds and links bundle tools and declares addons through bootstrap`
