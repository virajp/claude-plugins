# U3 — the editor block: four fragments composed into `.vscode/`, and `setup:vscode`

- **Wave:** 1
- **Depends on:** —
- **Owns:** `.config/vscode.d/**` (new), `.vscode/settings.json`,
  `.vscode/extensions.json`, `.config/mise/tasks/setup/vscode` (new)
- **Model:** opus
- **Read first:**
  `plugins/vwf/skills/init/references/fragments-and-sections.md:147-193` (the
  editor merge — the algorithm you execute, verbatim);
  `plugins/stackgen/assets/pack-format.md:108-134` (the three keys, the marked
  block); `.vscode/settings.json` and `.vscode/extensions.json` in full.
- **Lazy-load:** the four fragments (paths in the facts section);
  `plugins/stackgen/stacks/toolchain-manager/mise/config/.config/mise/tasks/setup/vscode`;
  `docs/memory/decisions/2026-09-06-editor-fragments-inside-the-fence.md`.

## Ruling

From index.md's assumed decisions, verbatim:

> **3.** **A unit does the merge per the documented algorithm.** Copy the four
> fragments to `.config/vscode.d/`, compose the marked block into
> `.vscode/settings.json` and `.vscode/extensions.json` (settings deep-merge,
> nesting union, extensions union; block first; hand-authored content outside it
> untouched), add `setup/vscode` from the pack. `/vwf:setup reshape` printing an
> empty plan afterwards is the proof.

The user: *"A unit does the merge per the documented algorithm"*.

## Edits

1. **`.config/vscode.d/`** — copy, byte-identical, the four fragments:
   `mise.jsonc` (from the mise pack), `dprint-editor.jsonc` (dprint pack),
   `pre-commit.jsonc` (pre-commit pack), `repo-hygiene.jsonc` (hygiene pack).
   Source paths are in index.md's facts.
2. **`.vscode/settings.json`** — per `fragments-and-sections.md:147-193`:
   markers are absent, so insert the block **at the top** of the object:
   `// >>> vscode.d` … `// <<< vscode.d`; inside it, the four fragments'
   `settings` deep-merged (later fragment wins on a key; fragment order is the
   pack composition order: mise, dprint, pre-commit, repo-hygiene) and their
   `nesting` unioned per parent into `explorer.fileNesting.patterns`. **Every
   existing key outside the block stays byte-for-byte**, and where a
   hand-authored key repeats a block key, the hand-authored one (after the
   block) wins — do not delete it. The file is JSONC; keep its comments.
3. **`.vscode/extensions.json`** — the same block; `recommendations` = the union
   of the four fragments' `extensions` inside the block; the 19 existing
   recommendations stay outside it. Duplicates between the two lists are left as
   the algorithm leaves them; report the count as `DECIDED:`.
4. **`.config/mise/tasks/setup/vscode`** — copy from the mise pack,
   byte-identical, exec bit set. It reconciles a VS Code profile named
   `$REPO_NAME` (`claude-plugins`) — do **not** run it; that is the user's, in a
   terminal.
5. **`.vscode/launch.json`** — untouched (no pack ships a launch fragment).

## Ruling on the wave-1 block (2026-09-11)

The first pass composed the block correctly and left every hand key in place;
the repo's linter then failed `.vscode/settings.json` with 54
`json/no-duplicate-keys` errors — the algorithm's "hand key wins by later-key
precedence" is a duplicate key, and this repo forbids those. The user ruled
(index.md, decision 3 addendum). Apply it on top of the composed block already
in the worktree:

1. In the hand-authored section **below** the `// <<< vscode.d` marker, delete
   every top-level key that also appears inside the block and whose value is
   identical to the block's (52 keys). Delete the whole key — its comment lines
   directly above it go with it only when they describe that key alone.
2. `files.exclude` and `explorer.fileNesting.patterns` differ. Keep each as a
   hand key, with its value the **union** of the block's entries and the hand
   entries: for `files.exclude`, every glob from both, hand order then the
   block-only globs appended; for `explorer.fileNesting.patterns`, every parent
   from both, and for a parent in both the children unioned, sorted, and
   comma-joined. Put `// eslint-disable-next-line json/no-duplicate-keys` on the
   line directly above each of the two keys.
3. Touch nothing inside the block, nothing in `.vscode/extensions.json`
   (duplicates in a JSON array are not a linter rule), and not
   `.config/linter.yaml`.
4. Verify with the repo's own hook:
   `mise x -- pre-commit run --config .config/pre-commit-config.yaml --files .vscode/settings.json`
   → every hook Passed, Linter included. If the inline directive is **not**
   honoured by the linter on this file, do not widen the exemption — return
   `UNRESOLVED:` with the linter's exact output.

## Verification

- `command ls .config/vscode.d/` → the four files.
- `grep -c '>>> vscode.d' .vscode/settings.json .vscode/extensions.json` → 1
  each; `grep -c '<<< vscode.d'` → 1 each.
- Both files parse as JSONC: `node -e "require('jsonc-parser')"` is not
  available — use
  `pnpm exec dprint check .vscode/settings.json .vscode/extensions.json`
  (dprint's json plugin accepts JSONC) → green; and `git diff --stat` of each
  shows insertions only, no deleted lines.
- `git diff .vscode/settings.json | grep '^-' | grep -v '^---'` → nothing (no
  existing line removed).
- `mise tasks --hidden | grep -q setup:vscode`.
- `test -x .config/mise/tasks/setup/vscode`.

## Guardrails

- Do not touch anything under `.config/mise/tasks/` other than `setup/vscode`;
  not `.config/mise*.toml` (U1).
- Copy fragments and the task byte-for-byte; never retype; never format
  `.config/vscode.d/**` (payload).
- Never remove or reorder a hand-authored line in `.vscode/*.json`.
- Delete with `rm`, never `git rm`; stage nothing.
- Never run `git checkout`, `git restore`, `git stash`, or a formatter with
  `--fix` on a path outside your Owns. `dprint fmt` on the two `.vscode` files
  is allowed only if the pre-commit formatter would run there anyway — check
  `.config/dprint.json`'s excludes first; if `.vscode/` is excluded, do not
  format.

## Commit

`ops: compose the editor block from the pack fragments` — written by the
orchestrator after the wave gate, not by the unit.
