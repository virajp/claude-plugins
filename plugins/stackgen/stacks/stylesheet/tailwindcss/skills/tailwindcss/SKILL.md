---
name: tailwindcss
version: 0.1.0
category: development
description: Tailwind CSS v4 — the CSS-first theme block, the two-layer token
  mapping that lets one role carry a light and a dark value, the dark variant,
  the breakpoint namespace, and what a class-order and class-existence gate can
  assert. Realizes the product's design system; never defines it. Auto-applies
  when editing a stylesheet or a component's classes.
license: MIT
user-invocable: false
allowed-tools: Read Grep Glob Edit Write Bash
paths:
  - "**/*.css"
  - "**/tailwind.config.*"
  - "**/postcss.config.*"
---

# Tailwind CSS

**v4, CSS-first.** `@import "tailwindcss"` plus a `@theme` block is the
configuration; the JavaScript config file belongs to the v3 line and this line
does not read it. Anything written against v3 configures a file nothing loads.

The design system is the **contract** — role names and values. This approach is
the **realization**, and its whole job is turning each role into a utility. A
role with no theme entry has no class, and reaching for it fails silently.

**The one rule that catches most mistakes:** `@theme` must be top-level, so a
role with a light and a dark value cannot hold both there. Plain custom
properties hold the values, `@theme inline` holds the roles and references
them. Skipping the `inline` freezes the light value into every utility and the
dark scheme never appears.

| Doing | Read |
| --- | --- |
| Mapping the design system's tokens into the theme | [Tokens](references/tokens.md) |
| Wiring light/dark, the variant, the first-paint flash | [Theming](references/theming.md) |
| Writing component classes, extracting a repetition | the pack's conventions |
| Breakpoints and container queries | the pack's conventions |
| Wiring the build plugin or the entry stylesheet | the pack's conventions |
