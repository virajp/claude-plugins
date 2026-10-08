# U1 — The TypeScript ux-gate returns its renders

- **Wave:** 1
- **Depends on:** —
- **Owns:**
  `plugins/stackgen/stacks/language/typescript/skills/ux-gate/SKILL.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** the owned file, top to bottom; then *The UX gate* in
  `plugins/vwf/assets/stack-adapter.md` (its `renders:` key, from plan 2a).

## Ruling

> - Decision F1: Only the TypeScript `ux-gate`. Flutter and SwiftUI return no
>   `renders:` list; B94 covers them.
> - Decision F2: The gate writes each capture to
>   `docs/scratchpad/ux-gate/<platform>/<code>--<state>.png` in the worktree,
>   `state` `default` for the default view. It reads each changed screen's code
>   from the Screens contract it gets, and the states from that screen's pinned
>   States.
> - Decision F3: The gate returns
>   `renders: [ { code, platform, state, file } ]`, one item for each capture,
>   `file` the path relative to the worktree root. `renders:` replaces the
>   `artifacts:` key; the reviewer reads the captures from it.

## Edits

1. **`plugins/stackgen/stacks/language/typescript/skills/ux-gate/SKILL.md`** —
   - *What to do*, step 2 (lines 34-38): capture the default view and every
     pinned state of each changed screen that the app can reach; name each
     capture by F2; create the directory; the path is gitignored and never
     committed. A pinned state the app cannot reach gets no capture and one
     `findings` item that says so.
   - *Return contract* (lines 44-55): replace `artifacts:` with the F3
     `renders:` list, with a comment that names each key. One sentence says that
     vwf copies these files after the run so a person can review the built app,
     and that each `code` is the Screens-table code.
   - Keep `findings[].screen` as `<screen>/<state>`.
   - Cite no plugin-relative path: the file lands in user repos (rule 13).

## Verification

- `mise run p:plugins:check` — green (rule 13 over the landed file).
- `grep -n 'artifacts' plugins/stackgen/stacks/language/typescript/skills/ux-gate/SKILL.md`
  — no hit.
- `grep -n '<code>--<state>' plugins/stackgen/stacks/language/typescript/skills/ux-gate/SKILL.md`
  — the F2 path.

## Guardrails

- Do not touch `pack.yaml`, a bundle or `inventory.md` — U3's.
- Do not touch the Flutter or SwiftUI gates (F1).
- `plugins/**/*.md` is not formatted — match the fold width by hand; keep each
  code span on one line.
- Delete with `rm`, never `git rm`. No `git checkout`/`git restore` and no
  formatter `--fix` outside Owns.

## Commit

`feat: stackgen typescript ux-gate — captures named by screen code, returned as renders`
