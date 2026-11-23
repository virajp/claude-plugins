---
name: import-design-system
description: >-
  Reads the design system back from the project's design tool, whichever it pins
  on the design axis, and returns it as a vwf design-system payload. Invoked by
  /vwf:design-system as its design adapter. Not a general-purpose skill, and not
  for writing the blueprint doc (use design-system).
user-invocable: false
disable-model-invocation: false
model: sonnet
metadata:
  archetype: workflow
  depends-on: [vwf-tools:design-import-design-system]
---

# import-design-system

Returns the product's design system as a vwf design-system payload. Reads from
whichever design tool the project uses, and normalizes. Never decides what the
design system should be.

Read the vwf adapter contract before returning anything, because it defines the
payload shape: `${CLAUDE_PLUGIN_ROOT}/assets/design-adapter.md`.

## State

| File                                                      | Access  | Owner                |
| --------------------------------------------------------- | ------- | -------------------- |
| `.config/vwf.yaml`: `projects.<project>.design`           | read    | the repo             |
| `.config/vwf.yaml`: `design.design_system_id`             | read    | `/vwf:design-system` |
| `${CLAUDE_PLUGIN_ROOT}/assets/design-adapter.md`          | read    | vwf                  |
| `vwf-tools:design-import-design-system`, with the project | invoked | `/vwf:setup`         |

This skill writes no file.

## Phases

| §   | Phase                                                                               | Gate                         | File                                  | Loads  |
| --- | ----------------------------------------------------------------------------------- | ---------------------------- | ------------------------------------- | ------ |
| 1–3 | Read the inputs, resolve the project's design tool, invoke the vwf-tools role skill | user, only with no pinned id | [delegate.md](references/delegate.md) | always |

## Halt and pause

| ID | Condition                                                                                       | Action                                                                                                                                                                                                                                                                                                                                |
| -- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| H1 | `projects.<project>.design` is absent                                                           | Stop, do not guess. Output only: `ERROR: no design tool configured for project <project>. Set projects.<project>.design in .config/vwf.yaml to one of the options the design-axis stack menu offers.`                                                                                                                                 |
| H2 | `vwf-tools` has no `design-import-design-system` skill, or it stops on an absent tool reference | The project's `design:` pin has not been set up in `vwf-tools`. Stop, do not improvise against an API with no reference. Output only: `ERROR: no design adapter in vwf-tools for project <project>. Its design pin is "<value>". Run /vwf:setup so vwf-tools:design-import-design-system and the tool's reference exist, then retry.` |
| H3 | The role skill returns an empty result                                                          | An empty result is not an answer. Output the failure line of Output, and never an empty payload.                                                                                                                                                                                                                                      |

## Output

Output only the design-system payload as YAML, with nothing before or after it:
no preamble, no summary. vwf parses the entire reply.

On failure, output only:

```text
ERROR: <what could not be reached or read, in one line>
```

## Rules

These hold for every tool.

- Never invent a value. Set an undefined token to `null`, with a line in `notes`
  — vwf otherwise writes an authoritative-looking `design-system.md` from a guess.
- Report semantic color roles, not raw swatch lists, and report a palette entry
  with no stated role in `notes` — a role is never invented.
- Set `derived:` honestly: `false` for a stored design system, `true` for one
  reconstructed from generated output — vwf records it. A derived system can
  drift silently on the next generation. A stored one is authoritative until
  someone changes it.
- Keep `user-invocable: false`, the same pair that `init` carries — the `/` menu
  is short on purpose, and `/vwf:design-system`, the only caller, still reaches
  this skill.

## Never

- Set `disable-model-invocation` to `true`; keep it `false` — vwf reaches this
  skill by delegation. `true` removes it from the model's context and blocks
  programmatic invocation. The call then imports nothing, silently and with no
  error.
- Build the adapter's name from the config value; invoke the fixed name — a wrong
  name assembled from configuration silently resolves to nothing.
  This contract exists to prevent that failure.
- Fall back to another tool or return an empty payload; take H3 — an empty
  result is indistinguishable from a design that was never made. This skill
  exists to prevent that silent failure.
- Write to the design tool or to `docs/blueprint/`; return the payload — vwf
  owns that write, gated by its `design-system-reviewer`.
