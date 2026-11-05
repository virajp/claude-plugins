---
name: import-screens
description: >-
  Reads a flow's designed screens back from the project's design tool, whichever
  it pins on the design axis, and returns them as a vwf screens payload. Invoked
  by /vwf:screens import as its design adapter. Not a general-purpose skill, and
  not for diffing against the contract (use screens).
argument-hint: "<flow> <platform>"
user-invocable: false
disable-model-invocation: false
model: sonnet
metadata:
  archetype: workflow
  depends-on: [design-import-screens]
  invocation-reason: vwf reaches this skill by delegation, and the only caller is /vwf:screens import
---

# import-screens

Returns one flow's designed screens, for one platform, as a vwf screens payload.
Reads from whichever design tool the project uses, and normalizes. Never diffs,
and never decides what a delta means.

Read the vwf adapter contract before returning anything, because it defines the
payload shape: `${CLAUDE_PLUGIN_ROOT}/assets/design-adapter.md`.

## State

| File                                             | Access  | Owner               |
| ------------------------------------------------ | ------- | ------------------- |
| `.config/vwf.yaml`: `projects.<project>.design`  | read    | the repo            |
| `${CLAUDE_PLUGIN_ROOT}/assets/design-adapter.md` | read    | vwf                 |
| the repo's `design-import-screens` skill         | invoked | the project's stack |

This skill writes no file.

## Phases

| §    | Phase                                                                             | Gate | File                                  | Loads  |
| ---- | --------------------------------------------------------------------------------- | ---- | ------------------------------------- | ------ |
| 1–3  | Read the inputs, resolve the project's design tool, invoke the repo's own adapter | auto | [delegate.md](references/delegate.md) | always |

## Halt and pause

| ID | Condition                                   | Action                                                                                                                                                                                                                                                                                                                         |
| -- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| H1 | `projects.<project>.design` is absent       | Stop, do not guess. Output only: `ERROR: no design tool configured for project <project>. Set projects.<project>.design in .config/vwf.yaml to one of the options the design-axis stack menu offers.`                                                                                                                           |
| H2 | The repo has no `design-import-screens` skill | The project's `design:` pin has not been materialized. Stop, do not improvise against an API with no reference. Output only: `ERROR: no design adapter materialized for project <project>. Its design pin is "<value>". Run the stack materializer for that pin so the repo's own design-import-screens skill exists, then retry.` |
| H3 | The repo's adapter returns an empty result         | An empty result is not an answer. Output the failure line of Output, and never an empty payload.                                                                                                                                                                                                                                |

## Output

Output only the screens payload as YAML, with nothing before or after it. vwf
parses the entire reply.

On failure, output only:

```text
ERROR: <what could not be reached or read, in one line>
```

## Rules

These hold for every tool.

- Never invent a screen code. Return a screen whose name carries no recoverable
  code with `code: null` and a `notes` line — vwf can diff around a missing code.
  It cannot recover from a wrong one. The code is the join key. A fabricated
  code silently maps a design onto the wrong contract row.
- Report, do not interpret. Report a component that the design shows and the
  contract does not mention. Deciding whether it is an addition or a mistake is
  the job of `/vwf:screens import`, and then of `/vwf:blueprint` — doing it here
  pre-empts them.
- Keep `user-invocable: false`, the same pair that `init` carries — the `/` menu
  is short on purpose, and `/vwf:screens import`, the only caller, still reaches
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
- Write to the design tool or to `docs/blueprint/`, or touch a blueprint doc;
  return the payload — import is a read.
