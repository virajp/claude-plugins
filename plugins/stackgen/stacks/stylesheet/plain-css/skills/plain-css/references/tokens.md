# Tokens — the design system's roles as custom properties

The design system defines **roles and values**. This file is how each role
becomes a custom property, and what to do with the classes this approach cannot
express natively.

## The shape

One module, declared on the root, referenced everywhere and redeclared nowhere.

```css
:root {
  color-scheme: light;

  /* Colour roles — the light values. */
  --color-text-default: <light value>;
  --color-text-muted: <light value>;
  --color-surface: <light value>;
  --color-border: <light value>;

  /* Type. */
  --font-body: <stack>;
  --font-heading: <stack>;
  --text-body: <size>;
  --text-body-leading: <line height>;

  /* Scales — one value across both schemes. */
  --space-xs: <value>;
  --space-sm: <value>;
  --radius-md: <value>;
  --shadow-raised: <value>;
  --motion-fast: <value>;
  --ease-standard: <value>;
}

[data-theme="dark"] {
  color-scheme: dark;

  --color-text-default: <dark value>;
  --color-text-muted: <dark value>;
  --color-surface: <dark value>;
  --color-border: <dark value>;
}
```

**`color-scheme` belongs in both blocks.** Without it the browser's own form
controls, scrollbars and focus rings stay light under a dark theme — the most
commonly shipped version of this bug, and one no rule in the product's own CSS
will fix.

**Only the scheme-dependent roles are repeated.** The scales appear once. A
list that does not separate them is one where the next dark value gets added in
the wrong block.

## Role by design-system class

| Class in the contract | Prefix | What to watch |
| --- | --- | --- |
| Colour roles | `--color-` | one property per **role**. A ramp is a palette, and a palette here is the design system being replaced by a default |
| Font families | `--font-` | the loader is the framework's, not this |
| Type scale | `--text-` | size and line height as a pair per step, named consistently |
| Weights | `--weight-` | only the weights the loaded faces actually have |
| Spacing | `--space-` | named steps, never a number sequence |
| Radius | `--radius-` | |
| Elevation | `--shadow-` | |
| Motion | `--motion-` for durations, `--ease-` for curves | both are in the contract; neither is a default to invent |
| Breakpoints | none — see below | |

## The two things this approach cannot express

**A breakpoint cannot be a custom property.** A media query's condition is not
a place a variable is substituted, so the design system's widths appear as
literals in every query. There is no fix at this layer. What there is: keep the
set written down in one comment block in this module, so the literals at least
have a source to be checked against. A width in a query that is not in the set
is a bug only a reviewer catches.

**A multi-property token** — "elevated surface" meaning a background, a border
and a shadow together — is not a property and does not belong here. It becomes
one class in the components layer, referencing three roles. Keeping it out of
the token module is what stops the module from drifting into a style sheet.

Two more worth stating in the project's own conventions:

- **A role computed at runtime** — a per-tenant brand colour — is set on the
  root element from the runtime, overriding the declaration here. That works
  natively and is one of this approach's genuine advantages; what it needs is a
  comment here saying which roles are runtime-set, because otherwise the value
  in this file reads as the truth.
- **A token the contract states as a keyword rather than a value** — a named
  easing with no curve given — is a gap in the design system. Report it; do not
  pick a curve.

## Review checklist

- Every role in the design system has a property, including the ones no rule
  uses yet.
- No property name encodes a value — no shade numbers, no pixel counts in
  names.
- `color-scheme` is set in both blocks.
- The dark block redeclares **only** the roles whose values differ.
- No component file declares a role; they reference only.
- The breakpoint set is written down here even though it cannot be
  parameterized.
