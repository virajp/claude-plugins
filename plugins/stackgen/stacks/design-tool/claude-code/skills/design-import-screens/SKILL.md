---
name: design-import-screens
version: 0.1.0
category: design
description: Read a flow's designed screens back from the repo's committed design canvas — docs/design/<project>/screens/ — and return them as a vwf screens payload. Invoked by vwf's screens-import surface by this fixed name — not a general-purpose skill.
license: MIT
disable-model-invocation: false
user-invocable: false
model: sonnet
---

# design-import-screens — Claude Code

> **Invocation must stay model-invocable.** vwf reaches this skill by
> delegation, at this exact fixed name. A user-only skill is removed from the
> model's context entirely, so the call would not error — it would silently
> return nothing, which is indistinguishable from a design nobody authored.

## import-screens — Claude Code

The project's design tool resolved to `claude-code`. Screens, when this tool
holds them, are files under the committed canvas —
`docs/design/<project>/screens/<flow>--<platform>/`, one file per pinned
screen code, mirroring the naming the design brief commissions.

**This release lands no screens canvas.** `design-session` authors the design
system and the logo and stops there; layouts, mockups and the review loop are
a later release, and that release is where this skill fills in.

## Prerequisites

None. The canvas is a directory in the repo — no key, no server, no network.

## What to do

1. **Look for the flow's directory** —
   `docs/design/<project>/screens/<flow>--<platform>/`, using the flow and
   platform vwf passes.
2. **Finding nothing, halt** — output exactly this line and nothing else:

   ```text
   ERROR: no screens for <flow> on <platform> — this tool authors none yet.
   ```

   The screens import has **no empty form**: an empty payload here is
   indistinguishable from a design nobody made, so the answer is a halt that
   names the reason, not `screens: []`.
3. **Finding the directory** — a canvas an earlier session could not have
   written — treat it as this tool's screens all the same: one file per
   screen, the pinned code recovered from the file name, `code: null` plus a
   `notes` line for a file whose name carries none. Report what the file
   contains, never what it appears intended to convey.

## Rules

- Never write to the canvas. Import is a read.
- Never invent a screen code. The code is vwf's join key, and a wrong one maps
  a design onto the wrong contract row.
- Return only the payload, or only the `ERROR:` line.
