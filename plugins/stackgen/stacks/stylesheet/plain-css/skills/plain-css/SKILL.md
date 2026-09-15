---
name: plain-css
version: 0.1.0
category: development
description: Plain CSS — the design system's roles as custom properties in one
  token module, cascade layers in place of specificity fights, an attribute-
  driven theme, and the linter that is this approach's only automated gate.
  Realizes the product's design system; never defines it. Auto-applies when
  editing a stylesheet.
license: MIT
user-invocable: false
allowed-tools: Read Grep Glob Edit Write Bash
paths:
  - "**/*.css"
---

# Plain CSS

No build step, no generated classes, no compiler between the contract and the
browser. Its cost is that **nothing checks anything**: a misspelled custom
property is an empty value, a role used for the wrong thing is a valid
stylesheet, and a dropped property is a rule that quietly does nothing. The
conventions exist to buy back what the other approaches get from a compiler.

The design system is the **contract** — role names and values. This approach is
the **realization**: one token module declares every role as a custom property,
and every rule in the product references a role rather than a value.

**Two rules carry most of it.** Layer order beats specificity, so declare the
layers once at the top and put everything in one — an unlayered rule beats
every layer, which makes it the highest-precedence thing in the product by
accident. And the project must **name its browser baseline**: layers, container
queries and nesting are not uniformly old, and "plain CSS" with no stated
baseline is a claim rather than a constraint.

| Doing | Read |
| --- | --- |
| Mapping the design system's tokens into the token module | [Tokens](references/tokens.md) |
| Layers, class naming, where a component's styles live | the pack's conventions |
| Theming, the attribute, first paint, form controls | the pack's conventions |
| Breakpoints and container queries | the pack's conventions |
| Configuring the linter this approach depends on | the pack's conventions |
