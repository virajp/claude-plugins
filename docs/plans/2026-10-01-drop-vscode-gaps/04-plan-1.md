# W4 — Plan 1 carries the setup/vscode retirement

- **Wave:** 1
- **Depends on:** —
- **Owns:** `docs/plans/2026-10-01-tool-config-script-mise/index.md` (the
  frontmatter `requires:` line only),
  `docs/plans/2026-10-01-tool-config-script-mise/03-mise-module.md`,
  `docs/plans/2026-10-01-tool-config-script-mise/06-stackgen-prose.md`
- **Model:** opus
- **Kind:** edit
- **Read first:**
  `plugins/stackgen/skills/tool-config/references/mise.md:505-520` (§5, "The
  retired editor task" — the behaviour to carry); `03-mise-module.md` whole (its
  migration list at `:80-87`); `06-stackgen-prose.md` whole (`:57-60` rewrites
  `mise.md`); plan 1's `index.md:1-10`.

## Ruling

> G7 — This plan amends plan 1's folder: U3's migration list gains the
> `setup/vscode` retirement as §5 states it; U6 is told to keep that §5 bullet's
> behaviour in its rewrite; plan 1's `requires:` gains
> `docs/plans/2026-10-01-drop-vscode-gaps`.

## Edits

1. `03-mise-module.md` — in the **Migration** bullet's list (`:80-87`), add one
   item: the retired `.config/mise/tasks/setup/vscode` is a delete row where its
   content still matches its lock record and the repo's `setup/all` no longer
   calls it; otherwise kept and reported — the §5 bullet's behaviour, stated in
   the list's own terse style.
2. `06-stackgen-prose.md` — where it rewrites `mise.md`, add one line: §5's "The
   retired editor task" bullet keeps its behaviour, now pointing at the script
   step U3 implements.
3. Plan 1's `index.md` frontmatter — `requires:` becomes
   `[ docs/plans/2026-10-01-drop-vscode, docs/plans/2026-10-01-drop-vscode-gaps ]`.
   Touch nothing else in that file: not its Status block, Run log, Units table
   or any other section.
4. Keep each file's fold width by hand; one-line code spans; never write a
   backslash-escaped backtick.

## Verification

- `grep -n 'setup/vscode' docs/plans/2026-10-01-tool-config-script-mise/03-mise-module.md`
  matches the new item.
- `grep -n '^requires:' docs/plans/2026-10-01-tool-config-script-mise/index.md`
  names both folders.
- `git diff --stat` on plan 1's `index.md` shows one changed line.
- `mise run code:precommit` green.
- The full wave gate.

## Guardrails

- Never edit `docs/plans/index.md` — the plan index is `plan-management`'s.
- Never edit plan 1's Status block.
- Delete with `rm`, never `git rm`.

## Commit

`docs: plan 1 carries the setup/vscode retirement and requires drop-vscode-gaps`
