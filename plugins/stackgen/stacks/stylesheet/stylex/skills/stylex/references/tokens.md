# Tokens — the design system's roles as variable groups

The design system defines **roles and values**. This file is how each role
becomes a variable a component can reference, and what to do with the classes
this approach cannot express natively.

## The shape

```ts
// color.stylex.ts — the extension is enforced, and it is what makes this
// file the compiler's token source rather than an ordinary module.
import * as stylex from "@stylexjs/stylex";

// One constant, so the condition is byte-identical in every entry.
const DARK = "@media (prefers-color-scheme: dark)";

export const color = stylex.defineVars({
  textDefault: { default: "<light value>", [DARK]: "<dark value>" },
  textMuted: { default: "<light value>", [DARK]: "<dark value>" },
  surface: { default: "<light value>", [DARK]: "<dark value>" },
  border: { default: "<light value>", [DARK]: "<dark value>" },
});
```

**A role with one value across both schemes is still written as an object**
with just a `default`, or as a bare value — but be consistent within a group.
Mixed forms make a reader check each entry to learn whether the dark case was
considered or forgotten.

## One group per token class

| Class in the contract | Group | What to watch |
| --- | --- | --- |
| Colour roles | `color` | one entry per **role**. A ramp is a palette, and a palette here is the design system being replaced by a default |
| Spacing scale | `spacing` | named steps, never indices |
| Type scale | `text` | size and line height are two entries per step, or one object per step — pick one and hold it |
| Font families | `font` | the loader is the framework's, not this |
| Radius | `radius` | |
| Elevation | `shadow` | |
| Motion | `motion` | durations and easings; both are values, and both belong to the contract |
| Breakpoints | not a group | conditions are strings, held as constants in one module — see below |

**Breakpoints are the exception and it catches people.** They are condition
keys, not values, so they cannot be variables. Export them as string constants
from one module and import them wherever a responsive value is written. A
breakpoint retyped at a call site is a second condition in the output, and the
two never collapse.

## What the approach cannot express natively

State these in the project's own conventions rather than pretending the mapping
is total:

- **A multi-property token** — "elevated surface" meaning a background, a
  border and a shadow together. A variable group holds values, not
  combinations. This becomes a shared style object exported from one module and
  merged by every user of it; it is a style, not a token, and it should not be
  smuggled into the group.
- **A role computed at runtime** — a per-tenant brand colour. A variable group
  is compiled, so the value cannot come from a request. Either a theme is
  created per known tenant, or the value is a dynamic style at the one place it
  is applied; both are real answers and they have different costs. Do not
  create the role twice.
- **A token the design system states as a keyword rather than a value** — a
  named easing curve, a semantic duration. These are values here, so the
  contract's name becomes the entry name and the contract's value becomes the
  entry value; if the contract gives only a name, that is a gap in the design
  system and it is reported rather than filled.

## Review checklist

- Every role in the design system has an entry, including the ones no
  component uses yet.
- Every file defining a group carries the enforced extension.
- The media-query condition is a constant, used everywhere, retyped nowhere.
- No value is invented here — every one traces to the contract.
- Scales are named, never indexed.
- Groups are split by token class, so importing spacing does not pull in
  colour.
