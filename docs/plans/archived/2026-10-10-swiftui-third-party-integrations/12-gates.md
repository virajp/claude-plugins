# U12 — Gates and the two pack bumps

- **Wave:** 4
- **Depends on:** U11
- **Owns:** `plugins/stackgen/stacks/app-framework/swiftui/pack.yaml`,
  `plugins/stackgen/stacks/app-framework/compose/pack.yaml`,
  `plugins/stackgen/stacks/bundles/swift-swiftui.md`,
  `plugins/stackgen/stacks/bundles/kotlin-compose.md`,
  `plugins/stackgen/stacks/inventory.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md's Wave gate and Gates the orchestrator keeps; the
  owned files.

## Ruling

> - Decision T8: The gates unit bumps `app-framework/swiftui` from `0.6.0` to
>   `0.7.0` and `app-framework/compose` from `0.3.0` to `0.4.0`, re-pins
>   `bundles/swift-swiftui.md` and `bundles/kotlin-compose.md`, and regenerates
>   `inventory.md`, in one commit. No router frontmatter `version:` is touched.

## Edits

1. **`swiftui/pack.yaml:5`** — `version: 0.6.0` becomes `version: 0.7.0`.
2. **`compose/pack.yaml:6`** — `version: 0.3.0` becomes `version: 0.4.0`.
3. **`bundles/swift-swiftui.md:6`** — the pin becomes
   `app-framework/swiftui@0.7.0`.
4. **`bundles/kotlin-compose.md:11`** — the pin becomes
   `app-framework/compose@0.4.0`.
5. Run `MISE_ENV=dev mise run p:plugins:inventory` to regenerate `inventory.md`.
6. Run the full wave gate, every line with `MISE_ENV=dev` exported.

If a `pack.yaml` no longer reads the "from" version above, stop and report
`UNRESOLVED:` with the value found.

## Verification

- Every wave gate line is green, notably
  `mise run p:plugins:inventory -- --check`.
- The orchestrator's rule-13 and router-link checks in index.md hold.

## Guardrails

- Touch nothing outside the five files. Never edit `plugin.json` or the
  marketplace manifest.
- A failing gate is reported as `UNRESOLVED:` naming the unit whose file caused
  it; do not fix another unit's file.
- No `git checkout`/`git restore` and no formatter `--fix` outside Owns.

## Commit

`feat: bump the swiftui pack to 0.7.0 and the compose pack to 0.4.0`
