# U9 — Gates: pack versions, bundle pins, inventory

- **Wave:** 6
- **Depends on:** U8
- **Owns:** the `version:` line of every changed
  `plugins/stackgen/stacks/**/pack.yaml`, the pins in
  `plugins/stackgen/stacks/bundles/*.md`, `plugins/stackgen/stacks/inventory.md`
- **Model:** opus
- **Kind:** edit
- **Read first:**
  `git diff --stat <branch base>..HEAD -- plugins/stackgen/stacks/`.

## Ruling

> - Decision 17: U9 bumps the `pack.yaml` version of every changed pack (major
>   component, skipping 13 and 17), the bundle pins, and regenerates
>   `inventory.md`, in one commit.

## Edits

1. For each pack directory the branch changed, bump its `pack.yaml` `version:`
   major component (`0.x.y` → `1.0.0`; `1.x.y` → `2.0.0`), stepping past 13
   and 17.
2. Update every bundle pin `<type>/<slug>@<version>` that names a bumped pack.
3. `mise run p:plugins:inventory` — regenerate `inventory.md`.
4. Run the full wave gate.

## Verification

- Every wave-gate line in `index.md` — green.

## Guardrails

- The plugin manifests (`plugins/*/.claude-plugin/plugin.json`) are not touched
  — the release task bumps them.
- Versions, pins and `inventory.md` land in one commit.

## Commit

`ops: bump the changed packs and regenerate the inventory`
