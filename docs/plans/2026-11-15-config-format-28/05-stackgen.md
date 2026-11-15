# U5 — stackgen reads the new key names

- **Read first:** each owned file's passage that names `backing_template`,
  `deploy_template`, `package_manager`, a project's `languages` in `vwf.yaml`,
  or the workspace `harness`.
- **Lazy-load:** `plugins/vwf/assets/vwf-config.md` as U1 leaves it (S2).

## Ruling

This file states each ruling in its final form. The ids point at the
`decisions` list of `index.json`.

- **D13, D5:** stackgen reads and writes `services` and `deploy` in place of
  `backing_template` and `deploy_template`.
- **D9:** where stackgen reads a project's languages or package manager from
  `vwf.yaml`, it reads them from `bootstrap describe --json`.
- Pack data stays as it is: a pack's `languages:` frontmatter and its
  package-manager facts are R5's.

## Edits

1. Each owned file: the passages above.

## Verification

- `mise x -- mise run code:format` passes.
- `mise x -- mise run p:plugins:check` passes.

## Guardrails

- Touch nothing outside the owned paths.
- Do not edit `plugins/stackgen/stacks/**`.
- `plugins/**/*.md` is not formatted by dprint: keep the fold width by hand.

## Commit

`feat: stackgen reads services and deploy`
