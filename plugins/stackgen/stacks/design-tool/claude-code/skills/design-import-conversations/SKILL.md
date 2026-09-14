---
name: design-import-conversations
version: 0.1.0
category: design
description: Read the design review conversation back from the repo's committed design canvas — docs/design/<project>/ — and return it as a vwf conversations payload. Invoked by vwf's feedback-canvas surface by this fixed name — not a general-purpose skill.
license: MIT
disable-model-invocation: false
user-invocable: false
model: sonnet
---

# design-import-conversations — Claude Code

> **Invocation must stay model-invocable.** vwf reaches this skill by
> delegation, at this exact fixed name. A user-only skill is removed from the
> model's context entirely, so the call would not error — it would silently
> return nothing, which is indistinguishable from a design nobody authored.

## import-conversations — Claude Code

The project's design tool resolved to `claude-code`. **This release holds no
review surface** — the canvas is the design system and the logo, and the
review that produced them happened in the terminal, which keeps no thread a
harvest could read. So this path returns `n/a` rather than a payload.

## What to do

1. **Look for a comments file** in `docs/design/<project>/`. A later release
   lands one beside the screens canvas; until then there is none.
2. **Finding none, return exactly:**

   ```yaml
   harvested: n/a
   reason: the canvas holds no review comments yet — the terminal keeps none.
   source:
     tool: claude-code
   ```

   That is the whole run. `n/a` is the one answer of the three imports allowed
   to come back empty-handed, and it is not a failure: vwf reports it plainly
   and stops.

## Do not reconstruct one

Two temptations, both wrong here:

- **Reading the session transcript** the design was authored in. A transcript
  is the authoring, not a review of the result, and nothing in it is
  addressable to a screen code.
- **Diffing the canvas against the blueprint** to infer what a reviewer must
  have wanted. That is `/vwf:screens import`'s job, already routed through
  `/vwf:blueprint` with the user confirming each delta; doing it here would
  route the same delta twice by two paths.

When the comments file lands, this file is where the harvest is described, and
`harvested: ok` becomes reachable without vwf changing at all.
