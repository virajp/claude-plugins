# Decision — the row above the prompt names the project, as claude-status does

**Date** 2026-11-15 · **Branch** `monitor-row-project`

## What changed

The `vwf-monitor` row above the prompt shows in every git repository. On the
left it names the project and the worktree as the claude-status status line
does. The plan chip shows the open gaps, and it goes when the plan's folder is
archived. The user asked for the change to be built in place, with no plan
folder.

## Reversals

All three were confirmed by the user on 2026-11-15.

- **The row in a repo with no plan index.** The manual and the `vwf-plugin`
  skill said that a repo with no `docs/plans/index.json` has no row. Now every
  git repository has the row. Outside a git repository there is no row.
- **The last status until `/clear`.** The last plan's chip stayed until a
  `/clear`. Now it also goes when the plan's row points under
  `docs/plans/archived/`.
- **"Names no technology" (`CLAUDE.md`).** The monitor module now knows
  claude-status: it ports its logic and reads its config files. It reads them
  only when they exist, and it uses claude-status's shipped defaults when
  claude-status is not installed. The workflow doctrine still names no
  technology.

## The decisions

1. **Outside git.** No row at all. Rejected: the Monitor button alone; the
   folder name with a plain glyph.
2. **The source of the name.** A TypeScript port of claude-status, in
   `hooks/monitor/project.ts`. Rejected: a new claude-status flag that the
   module runs, because a second repo changes and the row then needs
   claude-status installed.
3. **The port's depth.** All of claude-status's `project()`: linked worktrees,
   submodules, bare and `.bare` stores, the `origin` read and the URL classify.
   Rejected: worktrees and `origin` only.
4. **The config.** The name, the glyphs, the colors of the `project` and
   `worktree` segments, the palette, `worktreePattern` and the powerline
   glyphs, plus the worktree block. The user layer merges whole; the repo
   layer gives `projectName` alone. Rejected: name and glyphs only; the color as
   text only.
5. **The layout.** The terminal draws claude-status's powerline: the cap, the
   separators, the closing separator. Rejected: two plain blocks; the worktree
   inside the project block.
6. **The desktop app.** The Nerd Font glyphs dropped, because the app has no
   Nerd Font. Each block is bold text in the segment's `bg` color, with a dim
   `·` between the blocks and before the plan. Rejected: the same glyphs
   everywhere. Revised the same day: the first build drew rounded boxes, and
   the user found them ugly, twice as tall as the row and loud. Rejected then:
   a tinted pill; a compact solid block.
7. **The end of the chip.** When its folder is archived, or at a `/clear`.
   Rejected: archive only.
8. **The gaps.** The folder's open gaps, as `· N gaps` in yellow after the
   status, hidden at 0. Rejected: every gap, always shown.

## Out of scope

No branch, ahead or dirty segments; no change to the claude-status repo; the
B121 parked items; no change to the pane itself.
