# G5 — The 22 gate entries become structured

- **Wave:** 3
- **Depends on:** G4
- **Owns:** the `dprint`, `pre-commit` and `all` entries of the `tool-config:`
  list in `plugins/stackgen/stacks/cloud-service/containers/pack.yaml`,
  `cloud-service/cloud-run/pack.yaml`, `framework/html/pack.yaml`,
  `framework/astro/pack.yaml`, `stylesheet/stylex/pack.yaml`,
  `stylesheet/plain-css/pack.yaml`, `stylesheet/tailwindcss/pack.yaml`,
  `language/typescript/pack.yaml`, `deploy-target/container-image/pack.yaml`,
  `package-manager/pnpm/pack.yaml`, `package-manager/uv/pack.yaml`,
  `package-manager/swiftpm/pack.yaml`, `app-framework/swiftui/pack.yaml`,
  `app-framework/flutter/pack.yaml` (all under `plugins/stackgen/stacks/`);
  `plugins/stackgen/assets/pack-format.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** each owned `pack.yaml`; G1's `TC/scripts/lib/schema.mjs`.

## Ruling

> G1 — A trailing `/` marks a directory, globs included (`*.xcassets/`).

> G9 — The 22 entries become structured YAML validated by the script's schema;
> swiftui's becomes `*.xcassets/`.

## Edits

1. Each string entry for `dprint`, `pre-commit` or `all` becomes one mapping in
   the same list position, keys as the schema names them — e.g.
   `{tool: dprint, verb: add-plugin, name: malva}`,
   `{tool: all, verb: add-exclude, paths: [node_modules], generated: true}`,
   `{tool: pre-commit, verb: add-linter-ignore, paths: [.build]}`, uv's hook as
   one `{tool: pre-commit, verb: add-hook, …}` mapping with every value carried
   byte for byte. swiftui's `*.xcassets` becomes `*.xcassets/`. git entries stay
   strings (plan 3). Never touch a `version:` line (G11).
2. `pack-format.md` — the `tool-config:` section: structured shapes for mise,
   dprint, pre-commit and `all`; the trailing-`/` directory rule; git entries
   still strings until plan 3.

## Verification

- `mise run p:plugins:check` green.
- `grep -n -E '^\s*-\s*"?(dprint|pre-commit|all) ' plugins/stackgen/stacks/*/*/pack.yaml`
  prints nothing.
- The full wave gate.

## Guardrails

- `plugins/**/*.md` is not dprint-formatted: match fold width by hand.
- Delete with `rm`, never `git rm`.

## Commit

`feat: pack gate entries become structured tool-config mappings`
