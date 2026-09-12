# U2 — The mise pack's skill and conventions

- **Wave:** 1
- **Depends on:** —
- **Owns:**
  `plugins/stackgen/stacks/toolchain-manager/mise/skills/mise/SKILL.md`,
  `.../skills/mise/references/task-library.md`,
  `.../skills/mise/references/config-files.md`,
  `plugins/stackgen/stacks/toolchain-manager/mise/conventions.md`. Touch nothing
  outside this list.
- **Model:** opus
- **Read first:** every owned file, top to bottom. Then, read-only, the index.md
  facts section's line map of task-library.md so you edit every passage the
  rulings falsify.
- **Lazy-load:** U1's unit file (`01-mise-pack-tasks.md`) for the exact shape of
  what the payload now does — you describe U1's result without reading U1's
  files, which are being written concurrently.

## Ruling

Quoted from index.md:

> **1. Hook shape.** "Every gate hook calls a task." The base config carries
> three tool-neutral hooks, ids `format`, `lint`, `sec`, each
> `language: system`, entry `mise x -- mise run code:<x> --fix` for format and
> lint with `pass_filenames: true`, and
> `entry: mise x -- mise run code:sec
> --staged` with `pass_filenames: false`.

> **2. File-list contract.** `code:format`, `code:lint`, `code:sec` declare
> `#USAGE arg "[files]..."`; an empty list means the whole tree. Every overlay
> honours the list.

> **3. The three tools with no task.** shellcheck and actionlint become shipped
> defaults inside the mise pack's `code:lint`; shfmt becomes a shipped default
> inside `code:format`.

> **4. `code:sec --staged`** runs `gitleaks protect --staged` and skips grype.

> **6. `MERGE_MODEL`** … `direct` is today's behaviour unchanged; `pr` runs the
> same predicates, pushes the branch, opens a pull request through `gh` or
> `glab` … and stops — nothing merges locally.

> **7. `MEMBERS`** … `_scripts/helpers` gains `members()` … `setup/all`'s
> `--all` recursion and `code/worktrees` both call `members()`.

> **10. Dropping `setup:default-branch`.** The mandatory-set row, the tree line,
> the "not in setup:all" sentence and the section go.

## Edits

1. **`references/task-library.md`**
   - §143 *The mandatory set*: remove the `setup:default-branch` row (`:156`);
     amend the `code:format`, `code:lint`, `code:sec` rows to show
     `[--fix] [files...]`, `[--fix] [files...]`, `[--staged] [files...]` and say
     in each cell that the hooks call it; amend `code:merge:*` rows to "merge,
     or open a pull request, per `MERGE_MODEL`".
   - `:171` the sentence naming `setup:default-branch` as the one `setup:*`
     member `setup:all` does not call — delete it; `setup:all` now calls every
     `setup:*` task except `setup:worktree`, say that instead if the paragraph
     needs a subject.
   - §175 *Slots*: add one paragraph — a slot that takes a file list keeps the
     `[files]...` argument when overlaid, and `code:lint`'s two shipped defaults
     (shellcheck, actionlint) run before the placeholder notice and must survive
     an overlay.
   - §245-260 tree: keep as is except nothing changes for `setup:ai`; no
     default-branch line exists there today, confirm.
   - §260 *Member flags*: add that the member list itself is `members()` in
     `_scripts/helpers`, reading `.gitmodules` or the `MEMBERS` marked position.
   - §351 *`setup:default-branch`*: delete the whole section. Where the
     surrounding text cross-references it, reword.
   - §384 *`code/*`* and §386 *pre-commit ordering*: add a subsection **"The
     hooks call the tasks"** — the three hooks, what each passes (filenames /
     `--staged`), why (one configuration per tool), and the rule that a repo
     customising a gate edits the task, never the hook.
   - §407 *merge tasks*: document `MERGE_MODEL`, both values, the forge CLI
     fallback order and the "prints the branch and stops" case.
   - §507 *Legacy names*: no new row — nothing is renamed. Confirm no row
     mentions default-branch.
2. **`references/config-files.md`** — beside the `REPO_NAME` marked position
   (`:84-86`), document `MERGE_MODEL` and `MEMBERS` as marked positions in the
   same table or paragraph, in the same voice.
3. **`SKILL.md`** — `:223` (default-branch) delete or reword; `:146-153` (marked
   positions) list the two new ones; wherever it summarises the hook
   relationship, add one sentence that the gate hooks call the tasks.
4. **`conventions.md`** — `:98` (default-branch) delete or reword; add the
   one-configuration-per-tool convention in one sentence where the gates are
   described.

## Verification

- `grep -rn 'default-branch' plugins/stackgen/stacks/toolchain-manager/mise/skills plugins/stackgen/stacks/toolchain-manager/mise/conventions.md`
  is empty.
- `grep -n 'MERGE_MODEL' .../references/task-library.md .../references/config-files.md`
  hits both.
- `grep -n 'MEMBERS' .../references/config-files.md` hits.
- `mise run p:plugins:check` green (the prose rules scan these files).
- Table rows stay aligned to the existing column widths by hand;
  `plugins/**/*.md` is not formatted.

## Guardrails

- Do not touch `config/` (U1) or `pack.yaml` (U9).
- These files ship; cite nothing by plugin path that a landed file could not
  resolve — they are skill files, so `${CLAUDE_PLUGIN_ROOT}` **is** allowed here
  where the neighbours use it, but never in anything under `config/`.
- Delete with `rm`, never `git rm` (nothing to delete in this unit).
- Match fold width by hand; no formatter runs over `plugins/**/*.md`.

## Commit

`docs: task library describes the task-calling hooks, MERGE_MODEL, members(), and drops setup:default-branch`
— written by the orchestrator after the wave gate. Type `docs`; no scope.
