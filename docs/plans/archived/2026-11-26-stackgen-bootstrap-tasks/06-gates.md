# U6 — Gates

- **Read first:** `git diff --name-only <branch base>...HEAD -- plugins/stackgen`
  to find every changed pack and tool entry.

## Ruling

> D16 — Every pack.yaml and tool.yaml whose directory holds a file this
> branch changed gets a PATCH bump (the version component skips 13 and 17);
> every bundle pin to a bumped pack moves with it; inventory.md is regenerated
> with `mise run p:plugins:inventory`.

## Edits

1. For each `plugins/stackgen/stacks/<kind>/<pack>/`,
   `plugins/stackgen/tools/<slug>/` and `plugins/stackgen/design-tools/<name>/`
   with a changed file on this branch: bump the `version:` of its `pack.yaml`
   or `tool.yaml` by one PATCH step (D19). When
   the new component would be 13 or 17, step past it.
2. Every bundle under `plugins/stackgen/stacks/bundles/` whose `packs:` list
   pins a bumped pack: move the pin to the new version.
3. Run `mise run p:plugins:inventory` and keep what it writes to
   `plugins/stackgen/stacks/inventory.md`.

## Verification

- `mise x -- mise run code:format --all` and `mise x -- mise run code:lint --all` green.
- `mise run p:plugins:inventory -- --check` and `mise run p:plugins:check` green.

## Guardrails

- Bump no plugin version: `plugins/*/.claude-plugin/plugin.json` moves only
  at release.
- Touch nothing outside the owned paths. No `git checkout`, `git restore`.

## Commit

`ops(stackgen): bump the changed packs and tools, and regenerate the inventory`
