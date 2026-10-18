# U2 — Language, gate, package-manager and stylesheet packs drop bootstrap payload

- **Wave:** 2
- **Depends on:** U1
- **Owns:** `plugins/stackgen/stacks/language/kotlin/**`,
  `plugins/stackgen/stacks/language/swift/**`,
  `plugins/stackgen/stacks/language/typescript/**`,
  `plugins/stackgen/stacks/toolchain-gate/**`,
  `plugins/stackgen/stacks/package-manager/**`,
  `plugins/stackgen/stacks/stylesheet/**` — `pack.yaml` `version:` lines
  excepted
- **Model:** opus
- **Kind:** edit
- **Read first:** each owned `pack.yaml`, and every owned file that names
  `tool-config`, `stackgen.yaml`, `values:`, `templates/`, a conf.d pin or a
  removed task.
- **Lazy-load:** `plugins/stackgen/assets/pack-format.md`

## Ruling

> - Decision 3: A new `pack.yaml` key, `bootstrap_tools: [<tool>, …]`.
> - Decision 4: Drop the tier and the key from the pack format. Packs ship
>   `config/` only, copied as is.
> - Decision 6: Bootstrap's: conf.d pins, `setup/deps/**`, `setup/ai/**`,
>   `setup/secrets`, gate configs (`detekt.yml`, `ktlint.editorconfig`,
>   `swiftlint.yml`, `swift-format.json`), `code/format/**`, `code/lint/**`,
>   `code/check/**`, `.npmrc`, `fnox.toml`. Stays: `test/**`, `_scripts/xcode`,
>   `p/_project/**`, `wrangler.jsonc`.
> - Decision 7: kotlin, ktlint, detekt → `kotlin`; swift, swiftlint,
>   swift-format → `swift`; pnpm, typescript → `node`; uv, ruff → `python`. No
>   other pack gets the key.

## Edits

1. **Delete** with `rm`: every `templates/` directory, and every `config/` file
   that ruling 6 names as bootstrap's, in `language/kotlin`, `language/swift`,
   `package-manager/pnpm`, `package-manager/uv`,
   `toolchain-gate/{detekt,ktlint,ruff,swift-format,swiftlint}`. Remove an
   emptied `config/` directory.
2. **`pack.yaml`** — add `bootstrap_tools:` per ruling 7 to kotlin, swift,
   typescript, pnpm, uv, ktlint, detekt, ruff, swiftlint, swift-format. Remove
   any `values:` key and any field that describes a removed file or task. Leave
   `version:` alone.
3. **Prose in the owned packs** (`conventions.md`, `skills/**`, references —
   including gradle, swiftpm, eslint, plain-css, stylex, tailwindcss): rewrite
   every passage that names `stackgen:tool-config`, `.config/stackgen.yaml`,
   `templates/`, a pack value, a removed task or a removed pin. State instead
   that the pin, the gate config and the task come from the bootstrap tool the
   pack declares. Name no bootstrap file path except `docs/sync/vwf.md`. A
   landed file cites no plugin path (rule 13).

## Verification

- `mise run p:plugins:check` — green (U1's checker).
- `pnpm vitest run` — green.
- `grep -rnE 'tool-config|stackgen\.yaml|templates/|values:' <owned paths>` — no
  hit that describes current behaviour.

## Guardrails

- Do not touch `pack.yaml` `version:` lines, `inventory.md`, bundles or any doc
  — U9's and U8's.
- Do not touch `plugins/stackgen/stacks/framework/**` or `app-framework/**` —
  U3's.
- `plugins/**/*.md` is not formatted; match the surrounding fold width by hand.
- Delete with `rm`, never `git rm`.

## Commit

`feat: language and gate packs take their tools from bootstrap`
