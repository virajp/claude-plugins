# H5 — The last string entries become structured; Flutter's template

- **Wave:** 3
- **Depends on:** H4
- **Owns:** the git entries of the `tool-config:` list in
  `plugins/stackgen/stacks/package-manager/pnpm/pack.yaml`,
  `package-manager/uv/pack.yaml`, `package-manager/pub/pack.yaml`,
  `package-manager/swiftpm/pack.yaml`, `language/typescript/pack.yaml`,
  `language/swift/pack.yaml`, `app-framework/flutter/pack.yaml`,
  `app-framework/swiftui/pack.yaml`, `capability-provider/fnox/pack.yaml`,
  `capability-provider/doppler/pack.yaml` (all under
  `plugins/stackgen/stacks/`);
  `plugins/stackgen/stacks/app-framework/flutter/conventions.md`;
  `plugins/stackgen/stacks/package-manager/swiftpm/conventions.md`;
  `plugins/stackgen/assets/pack-format.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** each owned file; H1's schema.

## Ruling

> H2 — A Flutter app gets the vendored Dart template plus the flutter pack's own
> `add-ignore` patterns for what a Flutter app generates, researched through
> Context7 at run time and recorded in the pack.

> H8 — Every pack entry is structured.

## Edits

1. The 12 git string entries become mappings in the same list position, values
   byte for byte: `{tool: git, verb: add-ignore, template: Node}`,
   `{tool: git, verb: add-attribute, pattern: pnpm-lock.yaml, attrs: [linguist-generated]}`,
   `{tool: git, verb: add-ignore, paths: [fnox.local.toml]}`, and so on.
2. **flutter** — `template=Flutter` becomes `template: Dart`, plus one
   `{tool: git, verb: add-ignore, paths: [...]}` mapping listing what a Flutter
   app generates and must not commit. Research the list through Context7
   (`resolve-library-id` for Flutter, then its docs on project files and
   `.gitignore`); name the source in `DECIDED:`. `flutter/conventions.md`
   records why Dart plus the pack's list replaced `Flutter.gitignore` (it is the
   SDK repo's own ignore file).
3. **`swiftpm/conventions.md:35`** and **`pack-format.md`** (`:256` and the
   `tool-config:` section) — git entries are structured; the template names are
   the vendored set; no string grammar remains.
4. Never touch a `version:` line (H11).

## Verification

- `mise run p:plugins:check` green.
- `grep -n -E '^\s*-\s*"?[a-z-]+ (add|set|remove) ' plugins/stackgen/stacks/*/*/pack.yaml`
  prints nothing — no string entry left in any pack.
- The full wave gate.

## Guardrails

- `plugins/**/*.md` is not dprint-formatted: match fold width by hand.
- Delete with `rm`, never `git rm`.

## Commit

`feat: the last pack tool-config entries become structured; flutter takes the Dart template`
