# Tokens — the design system's roles as theme variables

The design system defines **roles and values**. This file is how each role
becomes a utility class, and what to do with the classes this approach cannot
express natively.

## The shape

```css
@import "tailwindcss";

/* Layer 1 — the values. Ordinary custom properties; no utility comes from
   these, and none should. */
:root {
  --role-text-default: <light value>;
  --role-text-muted: <light value>;
  --role-surface: <light value>;
}

[data-theme="dark"] {
  --role-text-default: <dark value>;
  --role-text-muted: <dark value>;
  --role-surface: <dark value>;
}

/* Layer 2 — the roles. `inline` is load-bearing: it makes each utility
   resolve the referenced variable where it is used, so the dark override
   above actually reaches the page. */
@theme inline {
  --color-text-default: var(--role-text-default);
  --color-text-muted: var(--role-text-muted);
  --color-surface: var(--role-surface);
}
```

**Without `inline`, the theme captures the light value at build time** and
every dark override is inert. The page looks right in light, wrong in dark, and
nothing in the build says a word.

**A role with one value across both schemes still goes through both layers.**
Putting the single-valued ones directly in `@theme` and the rest in the pair
means a reader has to know which is which, and the first role that later grows
a dark value has to be moved.

## Namespace by design-system class

| Class in the contract | Namespace | What to watch |
| --- | --- | --- |
| Colour roles | `--color-*` | one entry per **role**. A ramp — fifty through nine-fifty — is a palette, and a palette here is the design system being replaced by a default |
| Font families | `--font-*` | heading, body, mono; the loader is the framework's, not this |
| Type scale | `--text-*` | a step may carry a paired `--text-<step>--line-height`, which is how a size and its line height stay one decision |
| Weights | `--font-weight-*` | only the weights the loaded faces actually have |
| Letter spacing | `--tracking-*` | |
| Line height | `--leading-*` | for line heights not paired to a size step |
| Radius | `--radius-*` | |
| Elevation | `--shadow-*` | `--inset-shadow-*`, `--drop-shadow-*` and `--text-shadow-*` are separate namespaces and are not interchangeable |
| Motion easing | `--ease-*` | |
| Named animation | `--animate-*` | the `@keyframes` may be written inside the theme block beside the entry that uses it, which keeps the two from drifting apart |
| Breakpoints | `--breakpoint-*` | each entry is a responsive variant; the set here **is** the product's breakpoint set |
| Spacing | the spacing namespace | confirm the shape against the release — a strict multiple ladder and an irregular named set are expressed differently |

## The two things a build silently drops

**A role nothing references is not emitted.** Tailwind emits the variables it
sees used. A colour a runtime reads by name — a chart series, a canvas fill, a
value passed to a third-party widget — appears in no class and in no source
file, so it vanishes from the output and the runtime reads an empty string.
Declare those in a `@theme static` block, and say in a comment which runtime
reads them.

**A class name assembled at runtime is not generated.** The content scan reads
source files; a name built by concatenation, or read from a CMS field, is in
none of them. The class is absent, the element is unstyled, and there is no
error. Either write the full name in source, or map the runtime value to a
complete class name in a lookup the scan can see.

## What the approach cannot express natively

State these in the project's own conventions rather than pretending the
mapping is total:

- **A role whose value depends on more than the scheme** — a per-tenant brand
  colour, a value computed from user settings. Layer 1 can hold it, set from
  the runtime; layer 2 references it unchanged. The utility is static and the
  value is not, which is exactly what the two layers buy.
- **A multi-property token** — "elevated surface" meaning a background, a
  border and a shadow together. There is no namespace for a bundle of
  properties; this becomes a `components`-layer class referencing three theme
  variables, and it is one of the few cases where extracting a class is right
  on the first use rather than the third.
- **A motion token the design system states as a duration** — durations have
  no namespace of their own the way easings do. Carry them as custom
  properties in layer 1 and reference them from the animation entries, so the
  contract's number still appears exactly once.

## Review checklist

- Every role in the design system has an entry, including the ones no
  component uses yet.
- No literal value appears in layer 2 — every entry is a `var()`.
- No colour ramp, no shade numbers, no value invented here.
- `inline` is present on the role block.
- Breakpoint entries match the design system's set exactly, in both names and
  values.
