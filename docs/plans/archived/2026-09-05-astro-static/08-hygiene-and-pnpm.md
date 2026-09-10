# U8 — The hygiene pack's additions and the editor baseline; the pnpm pack's `.npmrc` and `npx` alias

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/stacks/repo-hygiene/**`,
  `plugins/stackgen/stacks/package-manager/pnpm/**`. Touch nothing outside this
  list.
- **Model:** opus
- **Read first:** the editor-fragment convention U5 adds to
  `plugins/stackgen/assets/pack-format.md` (cite by name if not there yet);
  `repo-hygiene/repo-hygiene/config/.gitignore` (`:4`–`:65`, the sections and
  the `/vwf:init` append line), `repo-hygiene/repo-hygiene/conventions.md`,
  `repo-hygiene/repo-hygiene/pack.yaml`, the `_licenses/` and `SECURITY.md`
  payloads; `package-manager/pnpm/conventions.md` (53 lines), `pack.yaml`,
  `config/.config/mise/tasks/setup/deps/*`,
  `config/.config/pre-commit.d/pnpm.yaml`; the `conf.d` mise fragment another
  pack ships — find it under
  `plugins/stackgen/stacks/capability-provider/doppler/config/.config/mise/` (or
  `fnox`) and mirror its path and shape exactly. The **sources**, read-only:
  `/Users/virajpatel/Projects/github.com/95octane/95octane/.vscode/settings.json`
  and `.vscode/extensions.json`,
  `/Users/virajpatel/Projects/github.com/virajp/claude-status/.vscode/settings.json`,
  `.vscode/extensions.json`, `CONTRIBUTING.md`, `.github/ISSUE_TEMPLATE/*`,
  `.graphifyignore`, and `.gitignore`'s graphify lines;
  `/Users/virajpatel/Projects/github.com/95octane/95octane/backend/.npmrc`.
- **Lazy-load:**
  `plugins/stackgen/stacks/toolchain-gate/pre-commit/config/.config/pre-commit-config.yaml:197-224`
  for how a payload comments a block that a young repo must not trip over.

## Ruling

D27 — "all ignore files are ideally grouped under gitignore; logic being that my
brain thinks gitignore when we talk about any ignore files and then I expand it
to find the one I am looking for." The hygiene fragment carries the editor
baseline: the nesting map, the exclude lists, editor-wide keys, and every
extension no other pack owns.

D32 — "`.graphifyignore`; a graphify `.gitignore` section (`graphify-out/*`,
`!graphify-out/GRAPH_REPORT.md`); `CONTRIBUTING.md`;
`.github/ISSUE_TEMPLATE/{bug,feature,config}`." Not
`.config/claude-status.json`.

D33 — "pnpm pack ships `.npmrc` (`ignore-scripts=true`, `fund=false`) and the
alias `npx = "pnpm dlx"`."

D26 — "Composed from per-pack fragments": the hygiene pack ships
`config/.config/vscode.d/repo-hygiene.jsonc`, the baseline every other fragment
sits on, per the convention in `pack-format.md`.

D20 — the lockfile is tracked; **`.gitignore` does not change for it**.

D36 — `.github/` is allowlisted at a payload root with `workflows/` refused;
`CONTRIBUTING.md` and `.graphifyignore` are allowlisted.

D37 — no `pack.yaml` `version:` moves.

## Edits

1. **`repo-hygiene/repo-hygiene/config/.graphifyignore`** — new, modelled on the
   source: excludes `graphify-out/` from graphify's own ingest, with a two-line
   header saying what it is and that a repo appends its own lines below.
2. **`repo-hygiene/repo-hygiene/config/.gitignore`** — a new section in the
   file's own sectioned style, placed after the AI-tooling section: **graphify**
   — `graphify-out/*` and `!graphify-out/GRAPH_REPORT.md`, with the one-line
   reason (the report is the one artifact worth diffing). The mise section is
   untouched: the lockfiles are tracked (D20). The `/vwf:init` append line at
   the end stays last.
3. **`repo-hygiene/repo-hygiene/config/CONTRIBUTING.md`** — new, modelled on the
   source's shape: how to set up (`mise run setup:all`), the branch model in
   three lines (feature or worktree → `develop` → `main`; never commit to
   `main`), conventional commits and where the types live, the gates and how to
   run them locally, where to report a vulnerability (`SECURITY.md`).
   Repo-neutral; no project name, no tool the packs do not ship.
4. **`repo-hygiene/repo-hygiene/config/.github/ISSUE_TEMPLATE/`** — three files
   from the source's three (`bug`, `feature`, `config`), repo-neutral wording,
   with a `config.yml` only if the source has one. Nothing else under `.github/`
   — no workflow.
5. **`repo-hygiene/repo-hygiene/config/.config/vscode.d/repo-hygiene.jsonc`** —
   the baseline. From the sources, verbatim keys: (a) `settings` — every key
   that is **not** owned by another pack's tool (not `dprint`/formatter, not
   `evenBetterToml.*`, not `eslint.*`, not `js/ts.*`/`typescript.*`, not
   `[dart]`/`dart.*`, not `ruff`/`[python]`, not the mise extension): the
   `explorer.fileNesting.enabled`/`expand` pair, `files.exclude`,
   `search.exclude`, `files.watcherExclude`, `editor.*` generic keys,
   `todo-tree.*`, `template-string-converter.*`, `yaml.*`, `git.*`,
   `workbench.*`, and anything else present. (b) `nesting` — the source's
   `explorer.fileNesting.patterns` map, **re-keyed by ownership**: every parent
   whose children are hygiene or repo-root files stays here — in particular
   `.gitignore` → every ignore file (`.dockerignore`, `.graphifyignore`,
   `.prettierignore`, whatever the source lists) plus `.gitattributes` and
   `.editorconfig` if the source nests them there; `readme.md` → the docs
   siblings the source nests (`CONTRIBUTING.md`, `SECURITY.md`, `LICENSE`,
   `CLAUDE.md`, `AGENTS.md`, …); `package.json` → its siblings; and any parent
   no other pack owns. Parents another pack owns (`tsconfig.json`,
   `pubspec.yaml`, `mise.toml`, `pre-commit-config.yaml`) are **left out** —
   those packs ship them. Preserve the source's `$(capture)` patterns exactly.
   (c) `extensions` — the source's 19 minus the ids other packs ship
   (`dprint.dprint`, `tamasfe.even-better-toml`, `dbaeumer.vscode-eslint`,
   `charliermarsh.ruff`, `Dart-Code.*`, `hverlin.mise-vscode`).
6. **`repo-hygiene/repo-hygiene/conventions.md`** and the kind's prose in the
   pack — the three new files and the graphify section, one clause each; the
   editor baseline in one paragraph, quoting the user's grouping rule.
7. **`package-manager/pnpm/config/.npmrc`** — new, at the pack's `config/` root:
   `ignore-scripts=true` and `fund=false`, each with a one-line comment (`#`) —
   the supply-chain reason, and that a dependency needing a build step is
   allowed explicitly via `pnpm-workspace.yaml`'s `onlyBuiltDependencies` (this
   repo's own precedent).
8. **`package-manager/pnpm/config/.config/mise/conf.d/pnpm.toml`** (at whatever
   exact path the doppler pack's fragment establishes) — `[shell_alias]`
   `npx = "pnpm dlx"` with a one-line comment. If no pack ships a mise `conf.d`
   fragment today and `mise.toml` does not load one, return a `GAP:` with the
   alternative you took (the pack's `conventions.md` telling the user to add it
   globally) rather than inventing a load mechanism.
9. **`package-manager/pnpm/conventions.md`** — `.npmrc` and the alias, one
   paragraph.

## Verification

- `mise run plugins:check` exits 0 once U11's allowlist is in the tree — before
  that `.npmrc`, `CONTRIBUTING.md`, `.graphifyignore` and `.github/` are rule-11
  findings; say so, do not work around it.
- `repo-hygiene.jsonc` parses after stripping comments and trailing commas, has
  only the three top-level keys, and its `nesting` has a `.gitignore` parent
  whose children include `.graphifyignore`.
- `grep -n "graphify" plugins/stackgen/stacks/repo-hygiene/repo-hygiene/config/.gitignore`
  hits the new section; `grep -n "mise" …/.gitignore` shows the mise section
  unchanged against `develop`.
- `ls plugins/stackgen/stacks/repo-hygiene/repo-hygiene/config/.github/ISSUE_TEMPLATE/`
  lists three or four files and **no** `workflows/` anywhere under
  `config/.github/`.
- `test -f plugins/stackgen/stacks/package-manager/pnpm/config/.npmrc`.
- No key appears in both `repo-hygiene.jsonc` and another pack's fragment —
  check against U7's and U6's fragments if they have landed; if not, list the
  keys you kept so the reviewer can.

## Guardrails

- The mise section of `.gitignore` does not change — the lock is tracked.
- Nothing under `config/.github/workflows/`, ever.
- Take keys verbatim from the sources; do not invent settings. Do not copy
  repo-specific values (a project name, a path outside the repo, a schema URL
  pointing at a dead package).
- Payload files under `config/` are excluded from this repo's dprint and are
  formatted by the shipped config; JSONC fragments hand-formatted, two-space.
  `cat` is `bat` — Write/Edit only. A pipe containing `npm` is rewritten to
  `pnpm` — write `.npmrc` with Write.
- No `pack.yaml` version moves.

## Commit

`feat(stackgen): hygiene ships graphify, CONTRIBUTING, issue templates and the editor baseline; pnpm ships .npmrc and the npx alias`
— written by the orchestrator after the wave gate, not by the unit.
