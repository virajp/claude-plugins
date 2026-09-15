# U5 — init: no forge step, two new marked positions

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/init/SKILL.md`,
  `plugins/vwf/skills/init/references/new-repo.md`,
  `plugins/vwf/skills/init/references/existing-repo.md`,
  `plugins/vwf/skills/init/references/fragments-and-sections.md`,
  `plugins/vwf/skills/init/references/readme-and-license.md`. Touch nothing
  outside this list.
- **Model:** opus
- **Read first:** every owned file, top to bottom. The marked-positions contract
  is `new-repo.md:138-172`; the existing-repo checks of the same positions are
  `existing-repo.md:229-234`; the forge step is `new-repo.md:332` and
  `existing-repo.md:379`.
- **Lazy-load:**
  `docs/memory/decisions/2026-09-06-init-owns-the-first-commit.md` §D17
  (`:91-104`) read-only, to see the exact step you are removing.

## Ruling

Quoted from index.md:

> **10. Dropping `setup:default-branch`.** "init stops touching the remote." …
> `init`'s two references drop the forge question and the
> `mise run setup:default-branch` line …

> **Reversal, confirmed by the user 2026-09-12:** … Now `init`'s git pass ends
> at the `develop`/`main` pair and the first push; it never touches the remote's
> settings. The repo-hygiene pack's CONTRIBUTING stub carries the forge
> one-liner (a pack may name `gh`/`glab`; vwf prose may not).

> **6. `MERGE_MODEL`.** … `init` asks the value inside its existing git-pass
> consent step, not as a new numbered question.

> **7. `MEMBERS`.** … space-separated paths relative to the repo root, filled by
> `init` from the registry's `members:` list (submodule products leave it
> empty).

## Edits

1. **`new-repo.md`**
   - §138 *The marked positions*: "Three" becomes five — add `MERGE_MODEL`
     (repo-level; asked, see below) and `MEMBERS` (repo-level; filled from the
     registry's `members:` list when the product is multi-repo with
     `linkage: siblings`; left as shipped otherwise, because `.gitmodules` is
     the source under submodule linkage and for a single repo there are no
     members). Write both literally at the marked positions, same rule as
     `REPO_NAME`.
   - The git pass (`:332` and its surrounding step): remove the forge default
     question and the `mise run setup:default-branch <answer>` line. The pass
     now ends at the pair and the first push. Add, in the same consent step, the
     `MERGE_MODEL` ask: one MCQ, `direct` (recommended, "merge locally and
     push") or `pr` ("push the branch and open a pull request"), written to the
     marked position. Do not name a forge or a CLI anywhere in this file.
   - Where the closing report lists what was set up, drop the forge line and add
     the two positions.
2. **`existing-repo.md`**
   - `:229-234`: the marked-position check covers the two new positions ("still
     carrying the pack's shipped default on a repo that has sibling members" is
     a create for `MEMBERS`; `MERGE_MODEL` is never a create — an unfilled one
     means `direct` and is left alone; report it in the plan as "unfilled,
     defaults to direct").
   - `:379`: remove the forge step from the apply order and the report.
   - The legacy-name pass reads the pack's table; nothing to add here, but
     confirm the text does not say the table lists a default-branch row.
3. **`SKILL.md`** — the question count. Today it says six questions (`:144-165`
   region and the description). Removing the forge question and folding
   `MERGE_MODEL` into the git-pass consent keeps the count; verify by reading
   the list and correct it if the forge question was one of the six. Mention
   `MERGE_MODEL` and `MEMBERS` wherever `REPO_NAME` is named as a marked
   position (`:164-165` region).
4. **`fragments-and-sections.md`**, **`readme-and-license.md`** — read; edit
   only if either names the forge step or the pre-commit fragments of a language
   pack as carrying the gate hooks (they no longer do). Otherwise untouched; say
   so in `CHANGED:` by omission.

## Verification

- `grep -rn 'default-branch' plugins/vwf/skills/init` is empty.
- `grep -rn 'MERGE_MODEL' plugins/vwf/skills/init` hits `new-repo.md`,
  `existing-repo.md`, `SKILL.md`.
- `grep -rn 'MEMBERS' plugins/vwf/skills/init` hits the same three.
- `grep -rniE '\bgh\b|\bglab\b|github|gitlab' plugins/vwf/skills/init` returns
  no new hit (vwf names no forge).
- `mise run p:plugins:check` green (prose rules; strict-YAML frontmatter
  unchanged).

## Guardrails

- Do not touch `git-workflow` (U6), `doctor`, `setup`, or any asset under
  `plugins/vwf/assets/`.
- Do not name a tool, a forge or a CLI — `init` names none (decision
  2026-09-05-vwf-init-and-the-repo-shape).
- Strict-YAML frontmatter: do not touch the frontmatter block.
- Delete with `rm`, never `git rm` (nothing to delete here).
- Match fold width by hand; `plugins/**/*.md` is not formatted.
- `${CLAUDE_PLUGIN_ROOT}` names only vwf's own plugin; never cite a stackgen
  path with it.

## Commit

`feat: init leaves the forge default alone and fills MERGE_MODEL and MEMBERS` —
written by the orchestrator after the wave gate. Type `feat`; no scope.
