---
name: design-import-design-system
version: 0.1.0
category: design
description: Read the design system back from the named project's design tool and return it as a vwf design-system payload. Invoked by vwf's design-system import by this fixed name, with the project — not a general-purpose skill.
argument-hint: "<project>"
license: MIT
disable-model-invocation: false
user-invocable: false
model: sonnet
---

# design-import-design-system

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
   ERROR: design tool <tool> has no design-import-design-system reference — run /vwf:setup to materialize it.
   ```

3. **Follow the reference** for the project, and return what it produces.
   The reference says whether the system is stored or derived, and so the
   value of `derived`.

## Rules

These hold for every tool; the reference adds the tool's own.

- Return only the payload, or only the `ERROR:` line — nothing before it,
  nothing after. Never a payload built from nothing.
- Never invent a token. A value the tool does not define is `null` with a
  line in `notes`.
- Import is a read. Never write to the design tool.
