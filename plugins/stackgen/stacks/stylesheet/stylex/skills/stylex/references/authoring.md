# Authoring — create, props, and what replaces the cascade

## The two calls

`create` declares a set of named styles. `props` applies some of them to an
element. Both are compiled away.

```tsx
import * as stylex from "@stylexjs/stylex";
import { color, spacing } from "./color.stylex";

const styles = stylex.create({
  root: {
    backgroundColor: color.surface,
    padding: spacing.md,
  },
  selected: {
    backgroundColor: color.surfaceSelected,
  },
  // A function is a dynamic style — see below for when that is right.
  width: (fraction: number) => ({ width: `${fraction * 100}%` }),
});

<div {...stylex.props(styles.root, isSelected && styles.selected)} />;
```

**`create` belongs at module scope.** A call inside a render path re-declares
on every render and gives back the compilation this approach exists for.

## Merge order is the entire precedence model

Later arguments win. There is no specificity, no source order, no cascade.

- **A collision is resolved by reading the call**, which is the property to
  protect. Never reintroduce precedence with an important flag — it is a way of
  saying the argument order is wrong somewhere else.
- **A falsy argument is skipped**, which is how conditionals are written. Pass
  the style object behind a condition; do not build a class name.
- **A component that accepts styling from its caller takes a style prop and
  passes it last.** That is the extension point. Reaching into a child's styles
  from outside is unavailable by design, and wanting to is the signal the child
  needed a prop.

## Static, conditional, dynamic — in that order of preference

1. **Static** — a value known at build. Always the answer where it applies.
2. **Conditional** — one of a known set, chosen by a boolean or a key. Still
   fully compiled; the branch is in the call, not in the CSS.
3. **Dynamic** — a function of values genuinely unknown at build: a progress
   width, a user-chosen accent, a measured offset. Compiles to a custom
   property set inline on the element.

**A dynamic style used where a conditional would do puts an inline style
attribute on every instance**, which is both bytes on the page and a value
outside the token system. The test: can the set of possible values be written
down? If yes, it is conditional.

## Pseudo-states and nesting

A pseudo-class or pseudo-element is a **condition on a value**, the same shape
as a media query — a `default` plus the conditional branch. There are no nested
rule blocks and no descendant selectors: an element is styled by the styles
passed to it, and a parent cannot reach down.

That constraint is the point. A style that needs to reach a descendant is a
descendant that needs a prop, and every attempt to work around it recreates the
cascade the approach removed.

## Shared styles

A run of properties used in several places is a **style object exported from
one module** and merged where it is needed. It is not a token and does not
belong in a variable group; the group holds values, this holds a combination.

Keep them few. The merge is cheap but a deep stack of shared objects makes the
final value a trace through five files, which is the readability cost the
explicit order was supposed to avoid.
