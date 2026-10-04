# H7 — vwf writes ignore files only through tool-config

- **Wave:** 3
- **Depends on:** H3
- **Owns:** `plugins/vwf/skills/init/SKILL.md`,
  `plugins/vwf/skills/init/references/new-repo.md`,
  `plugins/vwf/skills/setup/SKILL.md`,
  `plugins/vwf/skills/setup/references/memory-tree.md`,
  `plugins/vwf/skills/setup/references/onboard-pipeline.md`,
  `plugins/vwf/skills/setup/references/migrate-pipeline.md`,
  `plugins/vwf/assets/graphify.md`, `plugins/vwf/skills/mockups/SKILL.md`,
  `plugins/vwf/skills/blueprint/references/screen-review.md`,
  `plugins/vwf/skills/git-workflow/references/worktree-setup.md`,
  `plugins/vwf/skills/doctor/references/stack-checks.md`,
  `plugins/vwf/skills/doctor/references/code-intelligence.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** the passages below in each owned file.

## Ruling

> H3 — One writer: `graphify add-ignore --paths … --for <requester>`; vwf's
> excludes become a `vwf` block.

> H4 — vwf's four loose writers call `git add-ignore … --for vwf` (one `vwf`
> block) (B80 item 4).

> H6 — When a pack asks for a template init's `gitignore:<Name>` fallback block
> holds, the template is handed to the pack's block and the fallback block
> removed.

## Edits

1. **init** — `new-repo.md:288-318` (§5 fallback): the call in the flag form
   (`git add-ignore --template <Name> --for gitignore:<Name>`), the template
   list is the vendored set, and a later pack asking for the same template takes
   it over (H6). `SKILL.md:388-392,886`: no network, so a template is never
   "deferred" offline.
2. **`.graphifyignore`** — `plugins/vwf/assets/graphify.md:54-85`,
   `setup/references/onboard-pipeline.md:36-38`, `migrate-pipeline.md:24-26`,
   `setup/SKILL.md:325-328`: setup lands the vwf-standard excludes with
   `/stackgen:tool-config graphify add-ignore --paths … --for vwf`; drop the
   claim that `graphify-out/` never needs listing.
3. **`.gitignore`** — `setup/references/memory-tree.md:12-17` (no raw banner),
   `mockups/SKILL.md:73`, `blueprint/references/screen-review.md:9`,
   `git-workflow/references/worktree-setup.md:44`: each line goes in through
   `/stackgen:tool-config git add-ignore --paths … --for vwf`.
4. **doctor** — `stack-checks.md:286-296,505-508,552-563`: template blocks are
   checked by the script's `check` like any block — no `written:` hash;
   `code-intelligence.md:36-46`: the vwf excludes are the `vwf` block of
   `.graphifyignore`.

## Verification

- `grep -rn -E '>> *\.gitignore|>> *\.graphifyignore|written:' plugins/vwf`
  prints nothing.
- `grep -rn 'skills/tool-config/scripts' plugins/vwf` prints nothing (rule 6).
- `mise run p:plugins:check` green.
- The full wave gate.

## Guardrails

- Init's mise passes are plan 4's; edit only these passages.
- `plugins/**/*.md` is not dprint-formatted: match fold width by hand.
- Delete with `rm`, never `git rm`.

## Commit

`refactor: vwf writes .gitignore and .graphifyignore only through tool-config`
