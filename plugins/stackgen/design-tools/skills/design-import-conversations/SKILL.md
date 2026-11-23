---
name: design-import-conversations
version: 0.1.0
category: design
description: Read the design review conversation back from the named project's design tool and return it as a vwf conversations payload. Invoked by vwf's feedback-canvas surface by this fixed name, with the project — not a general-purpose skill.
argument-hint: "<project>"
license: MIT
disable-model-invocation: false
user-invocable: false
model: sonnet
---

# design-import-conversations

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
   ERROR: design tool <tool> has no design-import-conversations reference — run /vwf:setup to materialize it.
   ```

3. **Follow the reference** for the project, and return what it produces.

## A tool with no review surface

A tool that holds no review conversation answers `n/a`, never an empty
payload, in exactly this shape, the reason taken from its reference:

```yaml
harvested: n/a
reason: <why the tool holds no review remarks>
source:
  tool: <tool>
```

`n/a` is not a failure: vwf reports it plainly and stops.

## Rules

These hold for every tool; the reference adds the tool's own.

- Return only the payload — nothing before it, nothing after.
- Never invent a screen code. A remark whose code cannot be recovered is
  `code: null` with a `notes` line.
- Import is a read. Never write to the design tool.
