# U3 — App, framework, fnox and claude-code packs drop bootstrap payload

- **Wave:** 2
- **Depends on:** U1
- **Owns:** `plugins/stackgen/stacks/app-framework/**`,
  `plugins/stackgen/stacks/framework/android/**`,
  `plugins/stackgen/stacks/capability-provider/fnox/**`,
  `plugins/stackgen/stacks/design-tool/claude-code/**`, the prose of
  `plugins/stackgen/stacks/bundles/{bun,fnox,pnpm-turbo,pnpm-workspace}.md`,
  `scripts/src/tool-config-pack.test.ts` — `pack.yaml` `version:` lines and
  bundle pins excepted
- **Model:** opus
- **Kind:** edit
- **Read first:** each owned `pack.yaml`, and every owned file that names
  `tool-config`, `stackgen.yaml`, `values:`, `templates/`, a conf.d pin or a
  removed task.
- **Lazy-load:** `plugins/stackgen/assets/pack-format.md`

## Ruling

> - Decision 4: Drop the tier and the key from the pack format. Packs ship
>   `config/` only, copied as is. swiftui's `XCODE_VERSION` moves to bootstrap's
>   `swift` tool.
> - Decision 5: Its plugin installs move to bootstrap's `claude` tool; the pack
>   drops `setup/ai/claude-code` and declares `bootstrap_tools: [claude]`.
> - Decision 6: Bootstrap's: conf.d pins, `setup/deps/**`, `setup/ai/**`,
>   `setup/secrets`, gate configs, `code/format/**`, `code/lint/**`,
>   `code/check/**`, `.npmrc`, `fnox.toml`. Stays: `test/**`, `_scripts/xcode`,
>   `p/_project/**`, `wrangler.jsonc`.
> - Decision 7: flutter → `flutter`; android → `android`; swiftui → `swift`;
>   fnox → `fnox`; claude-code → `claude`. No other pack gets the key.
> - Decision 13: `scripts/src/tool-config-pack.test.ts` reads the real swiftui
>   templates, so it is deleted with them.
> - Decision 16: `_scripts/xcode` is kept only when a kept task (`test/golden`)
>   sources it; otherwise deleted.

## Edits

1. **Delete** with `rm`: every `templates/` directory, and every `config/` file
   that ruling 6 names as bootstrap's, in `app-framework/flutter`,
   `app-framework/swiftui`, `framework/android`, `capability-provider/fnox`,
   `design-tool/claude-code`. Keep `test/golden` (swiftui, compose), `test/e2e`
   (android). Apply ruling 16 to `_scripts/xcode`. Remove an emptied `config/`
   directory.
2. **`scripts/src/tool-config-pack.test.ts`** — delete with `rm`.
3. **`pack.yaml`** — add `bootstrap_tools:` per ruling 7 to flutter, swiftui,
   android, fnox, claude-code. Remove the swiftui `values:` key and any field
   that describes a removed file or task. Leave `version:` alone.
4. **Prose in the owned packs and the four bundles** (`conventions.md`,
   `skills/**`, references, bundle prose): rewrite every passage that names
   `stackgen:tool-config`, `.config/stackgen.yaml`, `templates/`, a pack value,
   a removed task or a removed pin. State that it comes from the bootstrap tool
   the pack declares. A swiftui passage about `XCODE_VERSION` says bootstrap's
   `swift` tool sets it. Name no bootstrap file path except `docs/sync/vwf.md`.
   A landed file cites no plugin path (rule 13). Do not touch a bundle's pin
   lines.

## Verification

- `mise run p:plugins:check` — green (U1's checker).
- `pnpm vitest run` — green.
- `grep -rnE 'tool-config|stackgen\.yaml|templates/|values:' <owned paths>` — no
  hit that describes current behaviour.

## Guardrails

- Do not touch `pack.yaml` `version:` lines, bundle pins, `inventory.md`,
  `stacks/readme.md` or any doc — U9's and U8's.
- Do not touch `language/**`, `toolchain-gate/**`, `package-manager/**` — U2's.
- `test:*` tasks stay in this repo.
- `plugins/**/*.md` is not formatted; match the surrounding fold width by hand.
- Delete with `rm`, never `git rm`.

## Commit

`feat: app and provider packs take their tools from bootstrap`
