# U3 — the hygiene pack: its conditionals, the editor-wide fragment, the provider row

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/stacks/repo-hygiene/repo-hygiene/**` — every file,
  except the version line of `pack.yaml` (U9's)
- **Model:** opus
- **Kind:** edit
- **Read first:** `pack.yaml` whole; `conventions.md:15-26` (the landed set),
  `:60-65` (ignore sections), `:77-107` (the section table), `:135-141` (the
  fragment rule), `:216-220` (renovate, as plan 3 left it);
  `config/.gitignore:55-57`; `config/.config/vscode.d/repo-hygiene.jsonc` whole;
  `config/CONTRIBUTING.md:23-41`.
- **Lazy-load:** `plugins/stackgen/assets/pack-format.md` (U1's — the
  `conditional:` shape, cite by key name); the destination fragments
  (`toolchain-gate/tsconfig`, `analysis-options`, `pre-commit`,
  `framework/astro`, `package-manager/pnpm` — U4's; the moved keys are listed
  here and written there).

## Ruling

Decision 3 — Hygiene conditions: "`ISSUE_TEMPLATE/*` when the forge is github;
`renovate.json` `when: update_bot: renovate`; every pack's `vscode.d/*.jsonc`
`when: editor: vscode`; the `fnox.local.toml` line leaves the base `.gitignore`
and becomes an ignore-section row keyed on the provider slug `fnox` (the stack
read passes the pinned provider as a component); `setup:vscode` unchanged."

Decision 4 — Editor split, the hygiene half: "The hygiene fragment keeps
editor-wide keys (`:14-37, 72, 93-106`, the non-stack nesting rows, the generic
extensions). Moves: Node/TS keys … → the tsconfig fragment; Dart (`.dart_tool`)
→ analysis-options; Astro (`.astro`) → a **new** fragment in `framework/astro`;
pnpm and Turbo excludes and the `package.json` children → a **new** fragment in
`package-manager/pnpm` …; `yaml.*` and `redhat.vscode-yaml` → the pre-commit
fragment; the fish extension is **dropped**. … L19: `.env` under `.gitignore`
only, `CLAUDE.md` under `readme.md` only."

Decision 6 — Stale passages, the hygiene half: "`H/config/CONTRIBUTING.md:34-35`
names `/vwf:setup` (the forge pass is reached through it)".

## Edits

1. **`pack.yaml`** — a `conditional:` block (U1's shape) with three entries:
   `.github/ISSUE_TEMPLATE/*` → `forge: github`; `renovate.json` →
   `update_bot: renovate`; `.config/vscode.d/repo-hygiene.jsonc` →
   `editor: vscode`. Version line untouched.
2. **`config/.gitignore:55-57`** — the fnox comment and line removed from the
   base.
3. **`conventions.md`** — the section table (`:77-107`) gains a row keyed `fnox`
   (pattern `fnox.local.toml`) under a "provider" heading beside the language
   rows, and the lead-in says the stack read passes the pinned provider as a
   component; the landed-set table (`:15-26`) marks the three conditional
   entries with their condition; `:135-141` stays and now holds.
4. **`config/.config/vscode.d/repo-hygiene.jsonc`** — remove every
   stack-specific key named in decision 4 (the `files.exclude`, `watcherExclude`
   and `search.exclude` entries for astro, dart_tool, turbo, node_modules,
   tsbuildinfo, pnpm-lock; the template-string converter block and its
   extension; the fish extension; the `yaml.*` keys and `redhat.vscode-yaml`;
   the `*.js` nesting row and the `package.json` children), leaving the
   editor-wide keys, the generic nesting rows and the generic extensions; fix
   L19 (`.env` under `.gitignore` only, `CLAUDE.md` under `readme.md` only); the
   comment at `:6-11` now true. Return the removed keys, verbatim, as the last
   lines of `DECIDED:` so U4 and the orchestrator can confirm each landed in its
   destination.
5. **`config/CONTRIBUTING.md:34-35`** — `/vwf:init` → `/vwf:setup`, the sentence
   still true; no plugin path (rule 13).

## Verification

- `mise run p:plugins:check` green (rule 11 with U2's new assertions; rule 13
  over `config/`).
- `grep -n "conditional:" plugins/stackgen/stacks/repo-hygiene/repo-hygiene/pack.yaml`
  — one block, three entries.
- `grep -n "fnox" plugins/stackgen/stacks/repo-hygiene/repo-hygiene/config/.gitignore`
  — zero hits; `grep -n "fnox" …/conventions.md` — the table row.
- `grep -n "astro\|dart_tool\|turbo\|tsbuildinfo\|fish\|vscode-yaml" plugins/stackgen/stacks/repo-hygiene/repo-hygiene/config/.config/vscode.d/repo-hygiene.jsonc`
  — zero hits.
- `grep -n "vwf:init" plugins/stackgen/stacks/repo-hygiene/repo-hygiene/config/CONTRIBUTING.md`
  — zero hits.

## Guardrails

- `config/` is payload — no formatter; JSONC and YAML by hand in the file's
  style.
- Do not edit the destination fragments (U4) — list the moved keys in
  `DECIDED:`.
- The `pack.yaml` version line is U9's.
- No doc outside the pack — `DOCS FALSIFIED:` lines.
- Delete with `rm`, never `git rm`.

## Commit

`feat: hygiene pack — conditional forms, renovate and fragment; the editor baseline is editor-wide`
— written by the orchestrator after the wave gate. Type from
`.config/git-conventional-commits.yaml`; no scopes.
