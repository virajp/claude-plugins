# U4 — Execute keeps the renders and names the review command

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/skills/execute/SKILL.md`,
  `plugins/vwf/skills/execute/references/acceptance-and-ux.md`
- **Model:** opus
- **Kind:** edit
- **Read first:** `plugins/vwf/skills/execute/SKILL.md:689-800`, and
  `plugins/vwf/skills/execute/references/acceptance-and-ux.md` top to bottom.

## Ruling

> - Decision E1: The person reviews the renders after the run. Execute asks
>   nothing; its final report names `/vwf:mockups renders` when it copied
>   renders.
> - Decision E2:
>   `docs/scratchpad/<project>/renders/<platform>/<route>/index.png` and
>   `index--<state>.png`. Latest set only.
> - Decision E5: After the last ux round, before the landing, the orchestrator
>   runs
>   `node ${CLAUDE_PLUGIN_ROOT}/skills/mockups/scripts/renders.mjs --worktree <worktree> --main <main checkout> --project <project> --plan <folder>`
>   with the `RENDER:` lines on stdin. A `RENDER:` line for an unknown code or a
>   missing file is one `SKIPPED:` stdout line; the rest are copied. stdout ends
>   with one `COPIED: <n>` line.
> - Decision E6: No `RENDER:` line, or `RENDERED: n/a`: the orchestrator runs no
>   copy; a Run log row (`renders`, `skipped`, the reason) says so, and the
>   final report names no review command.

## Edits

1. **`plugins/vwf/skills/execute/SKILL.md`** —
   - *Acceptance & UX* (line 689): after the ux stage's last round, the
     orchestrator runs the E5 copy with the `RENDER:` lines of that round — one
     Run log row (`wave —`, unit `renders`, `COPIED:` count and each `SKIPPED:`
     line as detail), mirrored to the journal; E6 when there is none. The copy
     writes only into the main checkout's gitignored `docs/scratchpad/`; it is
     not a git edit and never blocks the landing: a non-zero exit of the script
     is a gap, recorded, and the run continues.
   - *The final report* (line 758), in the `covers:` list: the renders kept —
     the count per platform and the line "review them with
     `/vwf:mockups renders`" — or the E6 reason.
   - *What does not stop the run*: one clause that the copy asks nothing.
2. **`plugins/vwf/skills/execute/references/acceptance-and-ux.md`** — one
   bullet: the renders of the last round are copied per E5 whatever the ux
   verdict, so a person can see what a residual finding looks like.

## Verification

- `mise run p:plugins:check` — green.
- `grep -n 'renders.mjs' plugins/vwf/skills/execute/SKILL.md` — the E5 command.
- `grep -n 'mockups renders' plugins/vwf/skills/execute/SKILL.md` — the final
  report line.

## Guardrails

- Execute asks nothing: no new question, no new pause condition.
- Do not touch the landing, the claim or the after-landing sections beyond the
  lines above.
- `plugins/**/*.md` is not formatted — match the fold width by hand; keep each
  code span on one line.
- Delete with `rm`, never `git rm`. No `git checkout`/`git restore` and no
  formatter `--fix` outside Owns.

## Commit

`feat: vwf execute — keep the ux renders for review after the run`
