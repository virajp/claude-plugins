# U4 — the stack packs: the moved keys, the per-language formatter, the markdown exclude

- **Wave:** 1
- **Depends on:** —
- **Owns:** every file under `plugins/stackgen/stacks/toolchain-gate/dprint/`,
  `…/toolchain-gate/pre-commit/`, `…/toolchain-gate/tsconfig/`,
  `…/toolchain-gate/analysis-options/`,
  `plugins/stackgen/stacks/framework/astro/`,
  `plugins/stackgen/stacks/package-manager/pnpm/` — except each `pack.yaml`'s
  version line (U9's)
- **Model:** opus
- **Kind:** edit
- **Read first:** each pack's `pack.yaml`, `conventions.md` and its
  `config/.config/vscode.d/*.jsonc` where one exists (dprint's
  `dprint-editor.jsonc:20-21, 39, 47`; pre-commit's; tsconfig's;
  analysis-options's `:19-20`); `pre-commit-config.yaml:151-154`
  (trailing-whitespace), `:39`; the four exclusion lists (`dprint.json:5-16`,
  `taplo.toml:10-16`, `gitleaks.toml:42-49` — read only, U4 owns dprint and
  pre-commit but not gitleaks; a rule-15 mismatch involving gitleaks is a `GAP:`
  for the orchestrator).
- **Lazy-load:** the hygiene fragment as it is today
  (`repo-hygiene/repo-hygiene/config/.config/vscode.d/repo-hygiene.jsonc`, U3's
  — read for the keys to move, never edit);
  `plugins/stackgen/assets/pack-format.md` (`conditional:`, U1's).

## Ruling

Decision 3, the fragments' part: "every pack's `vscode.d/*.jsonc` when the
editor is vscode".

Decision 4 — Editor split: "Moves: Node/TS keys (`node_modules`, `tsbuildinfo`,
`pnpm-lock` excludes, `*.js` nesting, the template-string converter and its
extension) → the tsconfig fragment; Dart (`.dart_tool`) → analysis-options;
Astro (`.astro`) → a **new** fragment in `framework/astro`; pnpm and Turbo
excludes and the `package.json` children → a **new** fragment in
`package-manager/pnpm` (turbo is generated, pnpm-turbo is the bundle that
carries it); `yaml.*` and `redhat.vscode-yaml` → the pre-commit fragment …
`defaultFormatter: dprint.dprint` leaves the editor-wide scope and is set per
language in the dprint fragment for the languages its plugins cover. L18:
`dprint-editor.jsonc:39, 47` aligned to `taplo.toml`."

Decision 5, the pack's part: "`trailing-whitespace` gains `exclude: \.md$`." And
the four sets must agree once U2's rule 15 runs — the dprint pack's two lists
and the pre-commit global exclude are this unit's to align; the gitleaks list is
plan 1's landed shape and is the reference.

## Edits

1. **tsconfig** — its fragment gains the Node/TS keys from the hygiene fragment
   (verbatim values); `pack.yaml` gains `conditional:` for the fragment
   (`editor: vscode`); `conventions.md` lists the keys.
2. **analysis-options** — its fragment gains `.dart_tool` in the three exclude
   maps; `conditional:`; conventions.
3. **framework/astro** — a **new** `config/.config/vscode.d/astro.jsonc`
   carrying the `.astro` excludes (the three maps), in the fragment shape
   `pack-format.md:97-137` gives; `conditional:`; conventions table row.
4. **package-manager/pnpm** — a **new** `config/.config/vscode.d/pnpm.jsonc`
   carrying the pnpm and turbo excludes and the `package.json` nesting children;
   `conditional:`; conventions.
5. **pre-commit** — its fragment gains `yaml.*` and `redhat.vscode-yaml`;
   `conditional:`; `pre-commit-config.yaml:151-154` `trailing-whitespace` gains
   `exclude: \.md$` with a one-line comment (markdown hard breaks;
   `.editorconfig` agrees); the global `exclude` at `:39` aligned to the agreed
   set.
6. **dprint** — `dprint-editor.jsonc`: `:20-21` editor-wide `defaultFormatter`
   removed; per-language `[json]`, `[jsonc]`, `[markdown]`, `[toml]`, `[yaml]`
   (and whatever else `dprint.json`'s plugins cover — read them) each set the
   default formatter to dprint; `:39` `arrayAutoCollapse` → true and `:47`
   `indentEntries` → false to match `taplo.toml:23, 31`; `conditional:`;
   `dprint.json:5-16` and `taplo.toml:10-16` aligned to the agreed set (the
   union of the four, normalised — the gitleaks list as landed by plan 1 is the
   reference, with `.env`, `.env.*`, `.venv/`).

## Verification

- `mise run p:plugins:check` green — rule 11 (the `conditional:` blocks), rule
  13, and rule 15 once U2 lands in the same wave: the four sets agree.
- `command ls plugins/stackgen/stacks/framework/astro/config/.config/vscode.d/astro.jsonc plugins/stackgen/stacks/package-manager/pnpm/config/.config/vscode.d/pnpm.jsonc`
  — both exist.
- `grep -n "exclude: .*md" plugins/stackgen/stacks/toolchain-gate/pre-commit/config/.config/pre-commit-config.yaml`
  — one hit under `trailing-whitespace`.
- `grep -n "defaultFormatter" plugins/stackgen/stacks/toolchain-gate/dprint/config/.config/vscode.d/dprint-editor.jsonc`
  — every hit inside a `[<language>]` scope.
- `grep -c "conditional:" <each of the six pack.yaml>` — one each.

## Guardrails

- `config/` is payload — no formatter; JSONC/YAML/TOML by hand.
- Do not edit the hygiene pack (U3), gitleaks or grype (not owned — a needed
  change there is a `GAP:`), the assets (U1) or the checker (U2).
- The `pack.yaml` version lines are U9's.
- No doc outside the six packs — `DOCS FALSIFIED:` lines.
- Delete with `rm`, never `git rm`.

## Commit

`feat: stack packs carry their editor keys; dprint formats per language; the exclusion sets agree`
— written by the orchestrator after the wave gate. Type from
`.config/git-conventional-commits.yaml`; no scopes.
