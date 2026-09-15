---
name: stylex
version: 0.1.0
category: development
description: StyleX — variable groups as the design system's realization,
  themes as subtree overrides, styles authored as typed objects and compiled to
  atomic CSS, merge order in place of the cascade, and what the type checker
  and lint rules can assert. Realizes the product's design system; never
  defines it. Auto-applies when editing a component's styles or a token file.
license: MIT
user-invocable: false
allowed-tools: Read Grep Glob Edit Write Bash
paths:
  - "**/*.stylex.ts"
  - "**/*.stylex.js"
  - "**/*.tsx"
  - "**/*.jsx"
---

# StyleX

A **compiler**, not a stylesheet. Styles are typed objects in the component's
own language; the build emits atomic CSS. Three consequences drive everything
below: there is no cascade to reason about, merging is explicit argument order,
and a token that does not exist is a type error rather than a blank element.

The design system is the **contract** — role names and values. This approach is
the **realization**: each role is one entry in a variable group, and a role with
no entry is a role nothing can reference.

**Two rules catch most mistakes.** A variable group must live in a file with
the enforced `.stylex` extension, or the compiler cannot resolve it across
modules. And a condition key — a media query — must be byte-identical wherever
it appears, so it is held in a constant and never retyped.

| Doing | Read |
| --- | --- |
| Mapping the design system's tokens into variable groups | [Tokens](references/tokens.md) |
| Writing component styles, merging, dynamic values | [Authoring](references/authoring.md) |
| Themes, the light/dark pair, first paint | the pack's conventions |
| Breakpoints and container queries | the pack's conventions |
| Wiring the build plugin or the generated stylesheet | the pack's conventions |
