# U1 — The tree and the checker

This unit does four parts, A to D, in one commit: the old checker fails on the new tree and the new checker fails on the old tree (D21). Do the parts in order A, B, C, D. Each part keeps its own rulings.

## Part A — Tool knowledge

- **Read first:** each `pack.yaml` and `conventions.md` under
  `plugins/stackgen/stacks/{language,package-manager,toolchain-gate}/`, and
  `plugins/stackgen/assets/pack-format.md` (the pack keys).
- **Lazy-load:** the skills of those packs, only to fix a path they cite.

### Ruling

This file states each ruling in its final form. The ids point at the
`decisions` list of `index.json`.

- **D4:** move each of the 18 packs to `plugins/stackgen/tools/<slug>/`, the
  slug unchanged, with `mv`. Each entry keeps `conventions.md`, `skills/` and
  `hooks/` (pnpm). Its manifest is `tool.yaml`: `name`, `summary`,
  `version: 1.0.0`, and `tools`, the bootstrap tools the entry applies to:

  | Entry | `tools` |
  | ----- | ------- |
  | typescript, eslint, tsconfig | `[node, bun]` |
  | pnpm | `[pnpm]` |
  | kotlin, detekt, ktlint | `[kotlin, android]` |
  | gradle | `[kotlin, java, android]` |
  | swift, swiftpm, swiftlint, swift-format | `[swift]` |
  | pub, analysis-options | `[flutter]` |
  | uv, ruff | `[python]` |
  | bash, markdown | `[]` — applies to every repo |

- **D16:** `tool.yaml` carries no `type`, `kind`, `axis`, `languages`,
  `lsp_servers`, `package_manager`, `lockfile`, `harness`, `category` or
  `platforms` (D38: bundles carry their own `platforms`).
- **D15:** `ux-gate` and the `docs/blueprint/` references stay in
  `tools/typescript/`; R5b moves them.
- A passage in a moved file that names its own old pack path
  (`stacks/language/...`) or "this pack" is rewritten to the new path and
  "this entry". Other prose stays.
- **D31:** `tools/pnpm/hooks/npm-normalize.sh` and `tools/pnpm/conventions.md`
  drop the `package_manager` grep of `.config/vwf.yaml` (a key R4b removes).
  The upward walk still stops at the directory that holds
  `.config/vwf.yaml` and returns pnpm there (D37). The hook keeps every other
  behaviour; its table test has no case for the removed grep.
- **D29, D30:** `plugins/stackgen/assets/kinds.md` removes the `design-tool`
  and `addon` headings and their two passages in the reviewer section (D42)
  only, and rewords `language-bundle` to "rooted at a
  language tool" (a bundle whose `tools:` names a language). It is U1's, so
  the regeneration in the last step sees it.

### Edits

1. Move the 18 folders.
2. Replace each `pack.yaml` with `tool.yaml`.
3. Fix the self-references of item 4 of the ruling.

### Verification

- `mise x -- mise run code:format` passes.
- `plugins/stackgen/stacks/{language,package-manager,toolchain-gate}` no longer
  exist.

### Guardrails

- Touch nothing outside the owned paths.
- `plugins/**/*.md` is not formatted by dprint: keep the fold width by hand.


## Part B — Design tools

- **Read first:** every file under `plugins/stackgen/stacks/design-tool/` and
  `stacks/addon/`, and `plugins/vwf/assets/design-adapter.md` (the adapter
  contract, read only).

### Ruling

This file states each ruling in its final form. The ids point at the
`decisions` list of `index.json`.

- **D6:** `plugins/stackgen/design-tools/` holds:
  - `skills/design-import-screens/`, `skills/design-import-design-system/`
    and `skills/design-import-conversations/`: one generic `SKILL.md` per
    role, at the fixed names. The caller passes the project name (D27); each
    body reads that project's `design` value from `.config/vwf.yaml`, loads
    `references/<tool>.md` in its own folder in `vwf-tools` (D32, D35), and
    follows it. If that file is absent, the skill stops and names the tool
    and `/vwf:setup`.
  - `<tool>/` for `claude-code`, `lovable` and `stitch`: `tool.yaml`
    (`name`, `summary`, `version: 1.0.0`), `conventions.md` (with its
    `## MCP servers` section), `references/<role>.md` (the tool part of each
    old skill), and `skills/` for a skill only that tool has
    (`claude-code/skills/design-session/` with `scripts/serve.mjs`).
- The generic bodies keep every rule the three old skills share: the
  payload-only return, `null` with a `notes` line, model-invocable, and the
  `harvested: n/a` answer of a tool with no review surface. A rule only one
  tool has goes to that tool's reference.
- **D7:** delete `stacks/addon/` and `stacks/design-tool/` after the move.

### Edits

1. Write the three generic skills.
2. Write the three tool folders from the old packs.
3. Delete the old pack folders.

### Verification

- `mise x -- mise run code:format` passes.
- Each old skill's rules are in a generic body or a tool reference; the
  `DECIDED` line names any rule dropped, and why.

### Guardrails

- Touch nothing outside the owned paths.
- `plugins/**/*.md` is not formatted by dprint: keep the fold width by hand.
- Keep `serve.mjs` byte for byte; only its path changes.


## Part C — Knowledge packs and bundles

- **Read first:** `plugins/stackgen/assets/pack-format.md` (pack and bundle
  keys), `plugins/stackgen/stacks/readme.md`, and the `pack.yaml` of every
  pack you own.
- **Lazy-load:** a bundle's prose, only where it names a removed component.

### Ruling

This file states each ruling in its final form. The ids point at the
`decisions` list of `index.json`.

- **D16:** each knowledge pack's `pack.yaml` loses `languages`,
  `lsp_servers`, `package_manager`, `lockfile` and `harness`. Every other key
  stays. `version` does not change here (U5, D14).
- **D8:** delete `framework/android/config/.config/mise/tasks/test/e2e`,
  `app-framework/compose/config/.config/mise/tasks/test/golden` and
  `app-framework/swiftui/config/.config/mise/tasks/test/golden`; delete a
  `config/` folder left empty. `p/_project/deploy`, `p/_project/icons` and
  `wrangler.jsonc` stay. Each pack's `conventions.md` that names its old test
  task says that bootstrap's tool ships it as a part.
- **D3:** each bundle's `components:` becomes two lists:
  - `tools:` — the bootstrap tool names the bundle needs, no version. A
    `language/<x>`, `package-manager/<x>` or `toolchain-gate/<x>` component
    maps to tools by the part A table (D4): typescript → `node`, pnpm → `pnpm`,
    kotlin → `kotlin`, gradle → `kotlin` (or `android` when the bundle has
    `framework/android`), swift and swiftpm → `swift`, pub → `flutter`, uv →
    `python`; bash, markdown and the gates add no tool beyond their language.
    A bundle with `framework/android` adds `android`.
  - **D24:** a `@generated` ref of a removed kind becomes a tool name
    (`package-manager/bun@generated` → `bun`). Every other `@generated` ref
    (`build-orchestrator/turbo@generated`) stays in `packs:`. A bundle whose
    `tools:` and `packs:` are both empty (`claude-code-plugin.md`) is valid.
  - `packs:` — every other component, `<type>/<slug>@<version>` as today.
- **D6, D7:** delete `bundles/claude-code.md`, `bundles/lovable.md`,
  `bundles/stitch.md` and `bundles/taste-skill.md`.
- `stacks/readme.md` describes the knowledge kinds, `tools/` and
  `design-tools/` in one paragraph each; it lists no removed kind.

### Edits

1. Every owned `pack.yaml` (D16).
2. The three test task files (D8).
3. Every bundle (D3), and the four deletions.
4. `stacks/readme.md`.

### Verification

- `mise x -- mise run code:format` passes.
- No owned file has `components:`, `lsp_servers:`, `package_manager:`,
  `lockfile:`, `harness:` or `languages:` as a key.

### Guardrails

- Touch nothing outside the owned paths.
- `plugins/stackgen/stacks/*/*/config/` is payload: do not format or edit a
  file there other than the deletions above.
- `plugins/**/*.md` is not formatted by dprint: keep the fold width by hand.


## Part D — The checker, the inventory and the tool snapshot

- **Read first:** `scripts/src/check.ts` (rules 4 at about line 730, 8 at
  1192, 9 at 1270, 11 at 458, 13 at 932, 14 at 1351, and `stackTypes`
  at about 1052), `scripts/src/inventory.ts`, their tests, and
  `.claude/skills/plugin-authoring/references/checks.md` (the rule text).

### Ruling

This file states each ruling in its final form. The ids point at the
`decisions` list of `index.json`.

- **D12:**
  - Rule 4 also checks the skills under `plugins/stackgen/tools/*/skills/`
    and `plugins/stackgen/design-tools/**/skills/`.
  - Rule 8 checks `design-tools/`: the three role skills exist, and each
    `design-tools/<tool>/` has `tool.yaml`, `conventions.md` and the three
    `references/<role>.md`.
  - Rule 9: no change in what it asserts; fix only paths.
  - Rule 11: a pack's `config/` holds no `test/` task; a `tools/` entry has
    no `config/`; the retired-key list adds `lsp_servers`,
    `package_manager`, `lockfile`, `harness` and `languages` for `pack.yaml`
    and `tool.yaml`.
  - Rule 13 also scans `tools/` and `design-tools/`.
  - Rule 14 stays, and also fails a bundle with `components:`, a bundle
    `tools:` name not in the snapshot, and a `packs:` ref whose pack does not
    exist (`@generated` refs excepted).
  - `stackTypes` drops `language`, `package-manager`, `toolchain-gate`,
    `design-tool` and `addon`.
- **D12, inventory:** `inventory.md` lists the knowledge packs and bundles as
  today (a bundle with its `tools` and `packs`), then the tool entries (slug,
  version, `tools`), then the design tools.
- **D13:** `scripts/src/bootstrap-tools.ts` runs `bootstrap catalog --json`,
  and writes `scripts/src/bootstrap-tools.json`: a sorted list of
  `{ name, category }`. With `--check` it writes nothing and exits 1 when the
  file differs. A failed or absent `bootstrap` exits 1 with its `errors`.
  Rule 14 reads the JSON file and never calls bootstrap. Write the JSON from a
  real run (the hand step installs bootstrap 4.0.0).
- The tests: every new and changed rule has a failing and a passing fixture;
  `bootstrap-tools.ts` is tested with a stub `bootstrap` on `PATH`; no test
  runs a real bootstrap.
- No new dependency.

### Edits

1. `check.ts`, `check.test.ts` and the fixtures.
2. `inventory.ts` and `inventory.test.ts`.
3. `bootstrap-tools.ts`, its test and `bootstrap-tools.json`.
4. `.claude/skills/plugin-authoring/references/checks.md` is U4's: report
   each falsified rule text as DOCS FALSIFIED.

### Verification

- `mise x -- pnpm vitest run` passes.
- `mise x -- pnpm exec tsc --noEmit -p scripts` passes.
- `mise x -- mise run code:format` passes.

### Guardrails

- Touch nothing outside `scripts/src/`.
- Do not run `inventory.ts` without `--check` before the last step.


## Last step

After part D, run `mise x -- node scripts/src/inventory.ts` to regenerate `plugins/stackgen/stacks/inventory.md` (D21: the one generator this unit runs), then `mise x -- mise run p:plugins:check` and `mise x -- node scripts/src/inventory.ts --check`. Both must pass.

## Commit

`refactor: stackgen bundles list bootstrap tools; tool knowledge, design tools, checker`
