# U7 — The gate packs: the dprint shim, the linter config, editor fragments, honest fill comments

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/stacks/toolchain-gate/**` — the dprint, eslint,
  tsconfig, ruff, analysis-options, pre-commit, gitleaks and grype packs. Touch
  nothing outside this list.
- **Model:** opus
- **Read first:** the editor-fragment convention U5 adds to
  `plugins/stackgen/assets/pack-format.md` (cite by name if not there yet);
  `toolchain-gate/dprint/config/.config/dprint.json` and `taplo.toml`;
  `toolchain-gate/eslint/skills/eslint/SKILL.md` (`:20` the frontmatter glob,
  `:85`, `:111`, `:114` — every mention of `.config/linter.yaml`),
  `eslint/config/.config/mise/tasks/code/lint:36` and
  `eslint/config/.config/pre-commit.d/eslint.yaml:12` (the two
  `pnpm dlx
  @askviraj/linter` invocations);
  `toolchain-gate/pre-commit/config/.config/pre-commit-config.yaml` (`:25`
  `default_stages`, `:120-124` `no-commit-to-branch`, `:197-224`) and
  `pre-commit/config/.config/git-conventional-commits.yaml` (`:26-32`
  `commitScopes`, `:73-79` the forge links); each pack's `conventions.md`,
  `pack.yaml` and `skills/*/SKILL.md`. The **source of the user's editor keys**,
  read-only:
  `/Users/virajpatel/Projects/github.com/95octane/95octane/.vscode/settings.json`
  and
  `/Users/virajpatel/Projects/github.com/virajp/claude-status/.vscode/settings.json`
  and the `extensions.json` beside each — take from them only the keys and ids
  that belong to the tool a pack ships, verbatim.
- **Lazy-load:**
  `plugins/stackgen/stacks/cloud-service/workers-static-assets/config/wrangler.jsonc`
  for the marked-position comment voice; Context7 `/websites/dprint_dev` for
  `extends` and `${configDir}`.

## Ruling

D28 — "dprint discovery is root-only and cannot be pointed at `.config/`; the
gate ships root `dprint.json` = `{ "extends": ".config/dprint.json" }` … The
unit verifies `includes` resolve through `extends` on the real CLI." The user:
"Dprint extension for vscode has limitation where you cannot specify the config
file and looks for it in the repo root which makes those symlinks appear in my
repos."

D26 / D27 — every pack ships a fragment for the tool it owns; the hygiene pack
carries the baseline. The user: "Formatter is mostly constant, dprint, but in
rare occasions land up customising something which dprint doesn't support but
only for that particular file type."

D33 — "eslint gate ships `.config/linter.yaml`." Measured: the skill points at
that file four times and tells the user to create it with
`pnpm dlx @askviraj/linter --init`; nothing ships it.

D22 — "the `commitScopes` and forge-link comments say init fills them on a
re-run once the registry / remote exist."

D19 — `no-commit-to-branch` is **unchanged**.

D37 — no `pack.yaml` `version:` moves.

## Edits

1. **`dprint/config/dprint.json`** — new, at the pack's `config/` root: a JSONC
   file whose only content is `"extends": ".config/dprint.json"` plus a two-line
   comment stating why it exists at the root (dprint and its editor extension
   discover a config at the root only) and that the real config is the one it
   points at. **Verify first** on the real CLI, in a scratch dir holding both
   files and a few matching files: `dprint output-file-paths` from the root
   through the shim lists the same paths as
   `dprint --config .config/dprint.json output-file-paths`. If `includes`
   resolve differently through `extends`, fix it inside `.config/dprint.json`
   with `${configDir}` per the dprint docs and record the fact in `DECIDED:`; if
   it cannot be made equal, return `UNRESOLVED:` with the measurement.
2. **`dprint/config/.config/vscode.d/dprint.jsonc`** — new: `extensions`
   `["dprint.dprint", "tamasfe.even-better-toml"]`; `settings` — the formatter
   keys from the source (`editor.defaultFormatter`, `editor.formatOnSave`, the
   per-language `[…]` blocks that name dprint) and every `evenBetterToml.*` key,
   since this pack ships `taplo.toml`; no `nesting` (the shim and the config are
   in different directories).
3. **`dprint/conventions.md`** and **`skills/dprint/SKILL.md`** — one paragraph
   each: the shim, why, and that a repo edits `.config/dprint.json` never the
   shim.
4. **`eslint/config/.config/linter.yaml`** — new. Generate it in a scratch
   directory with `pnpm dlx @askviraj/linter --init` and ship that output with a
   header comment (what the file is, that the linter is zero-config without it,
   where overrides go); no repo-specific rule. If `--init` writes nothing or a
   different path, ship the minimal valid file the skill's `:111-114` describe
   and say so in `DECIDED:`.
5. **`eslint/skills/eslint/SKILL.md:85`** — "create it with `--init`" becomes
   "the pack ships it; edit it". `:20`, `:111`, `:114` unchanged.
6. **`eslint/config/.config/vscode.d/eslint.jsonc`** — `extensions`
   `["dbaeumer.vscode-eslint"]`; `settings` — every `eslint.*` key from the
   source, verbatim; `nesting` — `eslint.config.mjs` → `linter.yaml`? No: they
   are in different directories; ship no nesting.
7. **`tsconfig/config/.config/vscode.d/tsconfig.jsonc`** — the pack has no
   `config/` tier today; create it for this one file. `settings` — every
   `js/ts.*` and `typescript.*` key from the source; `nesting` — `tsconfig.json`
   → `["tsconfig.*.json"]`. No extension (built in).
8. **`ruff/config/.config/vscode.d/ruff.jsonc`** — `extensions`
   `["charliermarsh.ruff"]`; `settings` — only `[python]` or `ruff.*` keys the
   source actually carries, else none.
9. **`analysis-options/config/.config/vscode.d/analysis-options.jsonc`** — new
   `config/` tier for it: `extensions`
   `["Dart-Code.dart-code",
   "Dart-Code.flutter"]`; `settings` — the `[dart]`
   block and `dart.*` keys from the source, verbatim; `nesting` — `pubspec.yaml`
   → `["pubspec.lock", "analysis_options.yaml"]`.
10. **`pre-commit/config/.config/git-conventional-commits.yaml`** — `:26-32`:
    the comment says the orchestrator fills `commitScopes` **on a re-run**, from
    the project registry, once the registry exists — a first run leaves it
    empty, which is valid for a single-project repo; `:73-79`: the forge links
    are filled from the remote **on any run where a remote exists**, else left
    as shipped. Both in the marked-position voice. The keys and values
    themselves do not change.
11. **`pre-commit/config/.config/vscode.d/pre-commit.jsonc`** — `nesting` only:
    `pre-commit-config.yaml` → `["git-conventional-commits.yaml"]` (both in
    `.config/`). No settings, no extension.
12. **`gitleaks`**, **`grype`** — no fragment; nothing changes.
13. Each pack's `conventions.md` that enumerates what the pack ships gains its
    new file(s) in one clause.

## Verification

- `mise run plugins:check` exits 0 once U11's allowlist and fragment parse are
  in the tree — before that the root shim is a rule-11 finding; say so, do not
  work around it.
- `mise run plugins:shellcheck` exits 0 (no task changed; confirms nothing
  regressed).
- The dprint measurement from edit 1, reported as fact.
- Every `vscode.d/*.jsonc` you wrote parses after stripping comments and
  trailing commas (`node -e` is fine) and has only `settings`, `nesting`,
  `extensions` at the top level.
- `grep -rn "\-\-init" plugins/stackgen/stacks/toolchain-gate/eslint/skills/` no
  longer tells the user to create `linter.yaml`.
- `grep -n "re-run" plugins/stackgen/stacks/toolchain-gate/pre-commit/config/.config/git-conventional-commits.yaml`
  hits.
- `no-commit-to-branch` block (`pre-commit-config.yaml:120-124`) is
  byte-identical to `develop`.

## Guardrails

- `no-commit-to-branch` does not change (D19). `default_stages` does not change.
- Take editor keys **only** for the tool the pack owns; everything else is the
  hygiene fragment's (U8) or the mise pack's (U6). If a key's owner is unclear,
  leave it to the hygiene fragment and say so.
- Payload files under `config/` are excluded from this repo's dprint; JSONC
  fragments are hand-formatted, two-space. `cat` is `bat` — Write/Edit only.
- Do not create `config/.vscode/` anywhere — fragments live under
  `.config/vscode.d/`.
- No `pack.yaml` version moves.

## Commit

`feat(stackgen): gate packs — the dprint root shim, linter.yaml, editor fragments, honest fill comments`
— written by the orchestrator after the wave gate, not by the unit.
