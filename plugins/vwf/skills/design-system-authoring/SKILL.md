---
name: design-system-authoring
version: 0.1.0
category: design
description: Authoring discipline for a product's design system — the
  code-independent UX/visual contract (semantic tokens, typography, spacing,
  motion, accessibility standard, component behaviors, anti-patterns) that every
  blueprint screen references. Auto-applies when editing
  docs/blueprint/design-system.
license: MIT
user-invocable: false
disable-model-invocation: false
allowed-tools: Read Grep Glob Edit Write
paths:
  - "docs/blueprint/design-system.md"
  - "docs/blueprint/design-system/**/*.md"
metadata:
  archetype: doctrine
---

# Design System

The product-wide **UX and visual language, as a contract**. It is mandatory once
the product has a UI surface: a frontend or app project in the registry. Read
the reference that matches the layer you are defining.

## Routing

| Doing                                                  | Read                                                                     | Loads     |
| ------------------------------------------------------ | ------------------------------------------------------------------------ | --------- |
| Deciding what belongs here and what belongs in plan    | [Foundations](references/foundations.md)                                 | always    |
| Defining color tokens                                  | [Color tokens](references/color-tokens.md)                               | sometimes |
| Choosing the font pairing and the type scale           | [Typography](references/typography.md)                                   | sometimes |
| Defining spacing, grid, breakpoints, radius, elevation | [Layout & spacing](references/layout-and-spacing.md)                     | sometimes |
| Defining duration and easing tokens, reduced motion    | [Motion](references/motion.md)                                           | sometimes |
| Stating the committed accessibility standard           | [Accessibility](references/accessibility.md)                             | sometimes |
| Defining component behaviors and anti-patterns         | [Components & anti-patterns](references/components-and-anti-patterns.md) | sometimes |
| Writing the logo section, when a payload has `brand:`  | [Brand](references/brand.md)                                             | sometimes |
| Pinning CLI/TUI conventions, for platform `cli`        | [Terminal UX](references/terminal-ux.md)                                 | sometimes |
| Passing the pre-delivery gate of the doc               | [Checklist](references/checklist.md)                                     | always    |

## Rules that don't wait

- Record only decisions that are true regardless of framework — they survive a
  rebuild.
- Name no component library, CSS framework or design file — that mapping is
  realization, which `plan` owns.

## Neighbours

For the elicitation and the write of `docs/blueprint/design-system.md`, see
`/vwf:design-system`.
