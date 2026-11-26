# U2 — Architecture picks or composes a bundle

- **Read first:** `plugins/vwf/skills/architecture/SKILL.md` (the axis rounds,
  about lines 236-272; step 5 Write) and `references/stack-menu.md` whole.
- **Lazy-load:** `plugins/vwf/assets/stack-adapter.md` as U1 leaves it.

## Ruling

This file states each ruling in its final form. The ids point at the
`decisions` list of `index.json`.

- **D5:** each project's round shows the menu's shipped bundles and repo
  bundles for its axis and platforms, and the entry "compose a bundle". A
  bundle is never mandatory. "Compose" asks for the tools (from
  `bootstrap catalog --json`, category `languages` and `package-managers`
  first), the packs, and the items no pack covers, then calls
  `/stackgen:stackgen-stack-menu compose` and records the slug it returns in
  `stack.template`. A project with no pick keeps `unresolved`.
- The design axis lists the menu's design tools; the token is the tool folder
  name, recorded in `projects.<p>.design` as today.
- **D4:** the tools round lists `assets/addons.yaml` through the menu and
  writes `addons:` as today.
- A failed `bootstrap` call stops the skill with bootstrap's `errors` (R3a
  D16).

## Verification

- `mise x -- mise run code:format` passes.

## Guardrails

- Touch nothing outside `plugins/vwf/skills/architecture/`.
- `plugins/**/*.md` is not formatted by dprint: keep the fold width by hand.

## Commit

`feat: architecture picks a stackgen bundle or composes a repo bundle`
