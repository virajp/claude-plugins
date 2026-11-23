---
name: design-import-screens
version: 0.1.0
category: design
description: Read a flow's designed screens back from the named project's design tool and return them as a vwf screens payload. Invoked by vwf's screens-import surface by this fixed name, with the project, the flow and the platform — not a general-purpose skill.
argument-hint: "<project> <flow> <platform>"
license: MIT
disable-model-invocation: false
user-invocable: false
model: sonnet
---

# design-import-screens

> **Invocation must stay model-invocable.** vwf reaches this skill by
> delegation, at this exact fixed name. A user-only skill is removed from the
> model's context entirely, so the call would not error — it would silently
> return nothing, which is indistinguishable from a design nobody authored.

One skill for every design tool. The caller passes the project; the tool is
that project's, and its reference in this skill's folder says how to read it.

## What to do

1. **Resolve the tool.** Read `projects.<project>.design` from
   `.config/vwf.yaml`. When it is absent, output exactly this line and stop:

   ```text
   ERROR: no design tool configured for project <project>.
   ```

2. **Load the tool's reference** — `references/<tool>.md` in this skill's own
   folder. When that file is absent, output exactly this line and stop:

   ```text
   ERROR: design tool <tool> has no design-import-screens reference — run /vwf:setup to materialize it.
   ```

3. **Follow the reference** for the flow and platform the caller passed, and
   return what it produces.

## Rules

These hold for every tool; the reference adds the tool's own.

- Return only the payload, or only the `ERROR:` line — nothing before it,
  nothing after.
- Never invent a screen code. The code is vwf's join key, and a wrong one maps
  a design onto the wrong contract row. A screen whose code cannot be
  recovered is `code: null` with a `notes` line.
- Report what the design contains, never what it appears intended to convey.
- Import is a read. Never write to the design tool, and never regenerate a
  screen while importing.
