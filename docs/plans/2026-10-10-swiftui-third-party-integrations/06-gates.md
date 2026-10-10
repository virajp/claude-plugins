# U6 — Gates and the pack bump

- **Wave:** 4
- **Depends on:** U5
- **Owns:** `plugins/stackgen/stacks/app-framework/swiftui/pack.yaml`,
  `plugins/stackgen/stacks/bundles/swift-swiftui.md`,
  `plugins/stackgen/stacks/inventory.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** index.md's Wave gate and Gates the orchestrator keeps; the
  three owned files.

## Ruling

> - Decision T8: The gates unit bumps `app-framework/swiftui` from `0.6.0` to
>   `0.7.0`, re-pins `bundles/swift-swiftui.md` to
>   `app-framework/swiftui@0.7.0`, and regenerates `inventory.md`, in one
>   commit. The router's own frontmatter `version:` is not touched.

## Edits

1. **`pack.yaml:5`** — `version: 0.6.0` becomes `version: 0.7.0`. If it no
   longer reads `0.6.0`, stop: report `UNRESOLVED:` with the value found.
2. **`bundles/swift-swiftui.md:6`** — `app-framework/swiftui@0.6.0` becomes
   `app-framework/swiftui@0.7.0`.
3. Run `MISE_ENV=dev mise run p:plugins:inventory` to regenerate `inventory.md`.
4. Run the full wave gate, every line with `MISE_ENV=dev` exported.

## Verification

- Every wave gate line is green, notably
  `mise run p:plugins:inventory -- --check`.
- The orchestrator's router-link and rule-13 checks in index.md hold.

## Guardrails

- Touch nothing outside the three files. Never edit `plugin.json` or the
  marketplace manifest.
- A failing gate is reported as `UNRESOLVED:` naming the unit whose file caused
  it; do not fix another unit's file.
- No `git checkout`/`git restore` and no formatter `--fix` outside Owns.

## Commit

`feat: bump the swiftui pack to 0.7.0`
