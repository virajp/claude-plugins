# U5 — Project ids, the editor fragment convention, and the widened fence

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/assets/**`,
  `plugins/stackgen/skills/stackgen-stack-template/references/materializer.md`.
  Touch nothing outside this list — no pack, no bundle, no vwf file.
- **Model:** inherit
- **Read first:** `plugins/stackgen/assets/pack-format.md` (the `config/` tier,
  `:51-56` the `p/_project` cross-reference, the `pre-commit.d` fragment
  passage), `plugins/stackgen/assets/output-tree.md` (`:142-150` the root
  allowlist, `:173-178` composition order, `:202-214` the charter fence),
  `plugins/stackgen/skills/stackgen-stack-template/references/materializer.md`
  (`:57-68` the copy rules and the `p/_project` rename with its stated reason,
  `:87` the fragment copy sentence), `plugins/stackgen/assets/kinds.md` (the
  `repo-hygiene` kind's file list, if it enumerates files).
- **Lazy-load:**
  `docs/memory/decisions/2026-09-05-charter-fence-opens-for-gate-configs.md` and
  its 2026-09-05 addendum, for the fence's own wording of what stays outside;
  `plugins/stackgen/stacks/toolchain-manager/mise/config/.config/mise/tasks/setup/all:8-17`
  for the marked-position voice.

## Ruling

D15 — the slug: "One asset `plugins/stackgen/assets/ids.md`: lowercase, runs
outside `[a-z0-9]` → one `-`, trimmed; reason: mise strips an extension from a
task's **last** segment and `_default` makes the directory that segment. Init §7
and the materializer cite it."

The measured facts the reason rests on, from the 2026-09-06 survey: on mise
2026.9.1 a directory `tasks/p/virajp.dev/` holding `deploy` lists as
`p:virajp.dev:deploy`, dot intact; the same directory holding `_default` lists
as `p:virajp` — `_default` collapses into its parent, the parent becomes the
last segment, and the extension rule strips `.dev`. The reason written on
2026-09-05 — "mise reads `p/virajp.dev/deploy` as a task with an extension" — is
false as written and is replaced, not reworded.

D26 — the editor fragments: "each pack ships
`config/.config/vscode.d/<pack>.jsonc` (settings keys, nesting rules, extension
ids); init merges into `.vscode/settings.json` + `extensions.json` between
marked blocks … Init never names the editor: the fragment convention names the
target."

D27 — nesting: "Parent `.gitignore` collects every ignore file any pack ships;
each pack nests its own files." The user: "I don't want cognitive overload so
grouping files is very important … all ignore files are ideally grouped under
gitignore; logic being that my brain thinks gitignore when we talk about any
ignore files and then I expand it to find the one I am looking for."

D30 — `REPO_NAME` carries the **slug**, so one id reaches every surface.

D36 — the allowlist: "Root allowlist gains `dprint.json`, `.npmrc`,
`CONTRIBUTING.md`, `.graphifyignore`, `.github/` — with `.github/workflows/`
refused inside it."

Reversal 1 (confirmed): "The fence's editor-settings clause is narrowed to
'nothing a pack cannot compose': whole `.vscode/` files stay outside, fragments
merged by init come inside. `dprint.json` joins `eslint.config.mjs` as a root
shim whose only content is a pointer into `.config/`."

## Edits

1. **`plugins/stackgen/assets/ids.md`** — new. Title "Project ids". Sections:
   **The rule** — lowercase; every run of characters outside `[a-z0-9]` becomes
   one `-`; no leading or trailing `-`; worked examples (`virajp.dev` →
   `virajp-dev`, `My App 2` → `my-app-2`, `claude-plugins` unchanged). **Why** —
   the two measured mise facts above, stated as facts about the task name
   grammar, plus the two other grammars the id reaches: a shell alias key and a
   `#USAGE` flag name. **Where the id lands** — the `p/<id>/` task group, the
   `--<id>` member flag, the `setup-<id>` alias, and the `REPO_NAME` environment
   key the toolchain pack ships (D30: the slug, never the raw name). **Who
   applies it** — the orchestrator that resolves ids (name it as "the
   orchestrator", not a vwf command), and the materializer when it renames
   `p/_project/`. **What it is not** — not a display name; the repo's readme and
   manifests keep the real name.
2. **`plugins/stackgen/assets/pack-format.md`** — (a) `:51-56`: the `p/_project`
   cross-reference cites `ids.md` for the slug instead of carrying its own
   words. (b) New subsection beside the `pre-commit.d` fragment passage:
   **Editor fragments** — a pack may ship
   `config/.config/vscode.d/<pack>.jsonc`, a JSONC object with exactly three
   optional top-level keys: `settings` (an object of editor settings keys),
   `nesting` (an object: parent file name → list of child names or globs, for
   `explorer.fileNesting.patterns`), `extensions` (a list of extension ids). The
   materializer copies fragments verbatim; the orchestrator composes them into
   `.vscode/settings.json` and `.vscode/extensions.json` — settings keys in
   composition order, later wins; `nesting` and `extensions` as unions — inside
   one marked block placed **first** in each file, so keys a person adds after
   the block win. Name the block markers: `// >>> vscode.d` and
   `// <<< vscode.d` on their own lines. State the ownership rule for the base:
   the hygiene pack's fragment carries the editor baseline (nesting map, exclude
   lists, editor-wide keys); every other pack carries only keys for the files or
   tools it ships.
3. **`plugins/stackgen/assets/output-tree.md`** — (a) `:202-214` the fence: the
   editor-settings item becomes "whole editor files — a pack never ships
   `.vscode/settings.json`; it ships a fragment under `.config/vscode.d/` and
   the orchestrator composes" with the date 2026-09-06 and a pointer to the
   decision doc U3 writes
   (`docs/memory/decisions/2026-09-06-editor-fragments-inside-the-fence.md`).
   The other three items — language manifests, CI workflow files, `CLAUDE.md` —
   stay as they are. (b) `:142-150` the root allowlist gains `dprint.json` (a
   shim whose only content is `extends` into `.config/`, the same shape as
   `eslint.config.mjs`), `.npmrc`, `CONTRIBUTING.md`, `.graphifyignore`, and the
   directory `.github/` **with `.github/workflows/` refused inside it** — the CI
   fence holds; issue templates and the like come in. One sentence on why each
   is at the root: the tool that reads it discovers it there and cannot be
   pointed elsewhere.
4. **`…/references/materializer.md`** — (a) `:57-68`: the rename rule keeps
   "renamed to the project's registry id, slugified" and replaces the
   parenthetical reason with "per `assets/ids.md`"; the sentence about `mise`
   reading a path as a task with an extension is deleted. (b) The allowlist
   restatement gains the five entries from edit 3(b), same order. (c) Beside
   `:87`: editor fragments under `config/.config/vscode.d/` are copied verbatim
   like `pre-commit.d` fragments; composition is the orchestrator's, per
   `pack-format.md`.
5. **`plugins/stackgen/assets/kinds.md`** — only if the `repo-hygiene` kind's
   bar enumerates the files the pack ships: add `.graphifyignore`,
   `CONTRIBUTING.md` and the issue templates to that list. If it does not
   enumerate, change nothing and say so in `DECIDED:`.

## Verification

- `mise run plugins:check` exits 0.
- `test -f plugins/stackgen/assets/ids.md` and
  `grep -n "_default" plugins/stackgen/assets/ids.md` hits.
- `grep -rn "as a task with an extension" plugins/stackgen/` returns nothing.
- `grep -ln "ids.md" plugins/stackgen/assets/pack-format.md plugins/stackgen/skills/stackgen-stack-template/references/materializer.md`
  returns both.
- `grep -ln "vscode.d" plugins/stackgen/assets/pack-format.md plugins/stackgen/assets/output-tree.md plugins/stackgen/skills/stackgen-stack-template/references/materializer.md`
  returns all three.
- `grep -n "dprint.json\|\.npmrc\|CONTRIBUTING.md\|\.graphifyignore\|\.github" plugins/stackgen/assets/output-tree.md`
  hits each name at least once;
  `grep -n "workflows" plugins/stackgen/assets/output-tree.md` still shows the
  CI fence.

## Guardrails

- Do not edit any file under `plugins/stackgen/stacks/` — U6, U7 and U8 own the
  packs; U1 and U2 own the Astro pack and bundles.
- Do not edit `plugins/stackgen/skills/stackgen-sync/SKILL.md`; if its
  composition-order or allowlist restatement is falsified, report it as
  `DOCS FALSIFIED:`.
- `plugins/**/*.md` is not dprint-formatted; match the surrounding fold width by
  hand. `cat` is aliased to `bat` — Write/Edit only.
- The reason in `ids.md` states what was **measured**, in the words above; do
  not soften it into "mise may".

## Commit

`feat(stackgen): define project ids, the editor fragment convention and the widened fence`
— written by the orchestrator after the wave gate, not by the unit.
