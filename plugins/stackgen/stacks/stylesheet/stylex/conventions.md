# StyleX — conventions

**Written against the StyleX line whose build integration is the unplugin**
(one plugin covering Vite, Rollup and the other bundlers) with the Babel plugin
as the older path. Both compile the same authored form; what differs is where
the plugin is registered.

StyleX is a **compiler**. Styles are written as typed objects in the same
language as the component, and the build turns them into atomic CSS class
names — one class per property-value pair, shared across the whole product. The
consequences that matter are not stylistic: there is no cascade to reason
about, style merging is an explicit argument order rather than a specificity
contest, and a token that does not exist is a type error rather than a blank
element.

## Tokens

The design system is the contract. Here it becomes a **variable group** —
`defineVars` — and every role in the contract is one entry in it.

**Variable groups live in their own files, and the extension is enforced.** The
lint rule that requires a `.stylex` extension on such a file is not
housekeeping: the compiler treats those files as the token source, and a group
defined elsewhere is a variable the build cannot resolve across module
boundaries.

**Light and dark are one entry, not two groups.** A value may be an object
keyed by condition, with a `default` and a media query, so a role carries both
schemes in the place the role is defined:

```ts
const DARK = "@media (prefers-color-scheme: dark)";

export const color = stylex.defineVars({
  textDefault: { default: "<light value>", [DARK]: "<dark value>" },
  textMuted: { default: "<light value>", [DARK]: "<dark value>" },
  surface: { default: "<light value>", [DARK]: "<dark value>" },
});
```

The media-query key is held in a constant rather than repeated, because the
condition has to be **byte-identical** across entries for the compiler to treat
them as the same condition.

**Group per token class, not one group for everything.** Colour, spacing, type,
radius, elevation and motion are separate groups, so a component importing
spacing does not pull the colour group's variables into its dependency graph.

**A scale is a named set, never an index.** `spacing.md`, not `spacing[3]` — an
index is a number the design system never agreed to, and renumbering the scale
silently moves every use.

Full judgment on the mapping, and on what this approach cannot express
natively, is the skill's `tokens.md`.

## Authoring

- **`create` defines, `props` applies.** Styles are declared once per component
  in a `create` call at module scope and spread onto the element with `props`.
  A `create` call inside a render path re-declares on every render and defeats
  the compilation.
- **Merge order is the whole cascade.** Later arguments to `props` win, and
  that is the only precedence rule there is. Two rules colliding is resolved by
  reading the call, not by counting selectors — which is the property to
  protect, so never reintroduce precedence with an important flag.
- **A conditional style is an argument, not a string.** Pass a falsy value and
  it is skipped; building a class name by concatenation throws away both the
  type checking and the merge semantics.
- **A dynamic style is a function, and it is a cost.** Values genuinely unknown
  at build — a progress width, a user-chosen accent — are expressed as a
  function of their inputs, which compiles to a custom property set inline.
  Everything else belongs in a static object. A dynamic style used where a
  conditional would do adds an inline style attribute to every instance.
- **A component that takes styles from its caller takes them as a prop and
  passes them last.** That is the extension point; reaching into a child's
  styles from outside is not available, by design, and working around it means
  the child needed a prop.

## Theming

**A theme is an override of a variable group applied to a subtree.**
`createTheme` takes the group and a set of replacement values and returns
something applied with `props` to a container element; every descendant reads
the overridden values.

Two forms, and the choice is the product's:

- **The media-query form** — the light/dark pair declared inside the variable
  group, as above. No theme object, no container, nothing to apply. Correct
  where the product offers no toggle, and it is a choice never to offer one.
- **The applied-theme form** — a theme per scheme, applied to the root
  container from state. Correct where the user can choose, and it composes:
  a brand theme and a scheme theme are two overrides of two groups on the same
  element.

**The two can be combined and usually should be**: the group carries the
system-preference pair, and an explicit user choice applies a theme on top.

**A theme may only override values.** It cannot add a role the group does not
define — which is the property that keeps a theme from becoming a second design
system, and it is why a new role starts in the variable group.

**Server-rendered pages paint before any script runs.** Where the applied form
is used, the container's theme must be decided before first paint or the first
frame is the wrong scheme. The script that does it is the head doctrine's; what
belongs here is that the state it sets is what selects the theme object.

## Responsive

**Media queries are conditions on a value, not blocks around rules.** A
property takes an object whose keys are conditions, and a `default` key is
required — a value with only conditional branches has no answer when none
matches.

- **The breakpoints come from the design system, through a constant**, and the
  same byte-identical rule applies: a condition string written two ways is two
  conditions in the output.
- **Mobile-first is a convention here, not a mechanism.** Nothing enforces the
  direction, so the project picks one and the reviewer holds it.
- **A container query is the right tool where the thing responds to its own
  box** rather than the viewport, and it is expressed the same way — as a
  condition key.

## Integration

Two hooks, and **neither is landed by this component** — the host framework
owns its own configuration, so `/vwf:execute` makes both edits in the project's
config after this doctrine is materialized.

1. **The build plugin, registered first in the framework's plugin list.**
   Order matters: the plugin must run before the framework's own transform, or
   the framework's fast-refresh handling sees code the compiler has not
   processed. Enable CSS layers in the plugin options — that is what keeps the
   generated CSS from competing with the framework's own on specificity.
2. **The generated stylesheet, imported once from the root layout.** The build
   emits one CSS file for the whole product; importing it per route emits it
   per route in some bundlers and once in others.

**A generated framework instantiates this section rather than reading it as a
recipe.** Both hooks are stated by role so a framework this pack has never seen
can be wired by finding its equivalent of each.

## Performance

- **Output is atomic and deduplicated across the product.** Two components
  setting the same padding share one class, so the stylesheet grows with the
  number of distinct property-value pairs and then stops. This is the property
  the approach is chosen for.
- **Nothing is evaluated at runtime.** There is no style engine in the bundle
  and no per-render string building — the cost was paid at build. A dynamic
  style is the exception and pays an inline custom property per instance, which
  is why the authoring rule above is a performance rule too.
- **The variable groups reach the browser as custom properties.** A group
  carrying roles nothing uses still ships them; define the roles the product
  has.
- **The build is slower, and that is the trade.** Every module is compiled.
  Measure it on the real tree before treating it as either fine or fatal.

## Testing

- **The type checker is the first gate and catches the most.** A misspelled
  role, a property that does not exist, a value of the wrong shape — all of
  them fail the build rather than the page.
- **The lint rules catch what types cannot**: a variable group in a file
  without the required extension, a `create` call in the wrong place, a
  condition object missing its `default`.
- **Nothing above catches a wrong token.** A component using the border role
  for text type-checks and is wrong on screen; that is a visual comparison's
  job, and the repo's gate bundle owns whether the product runs one.

## What this component does not decide

The token **values** — those are the product's design system, and a palette
shipped here would quietly become the product's. The component library. The
framework, its build configuration, or which file the two integration edits
land in. The head, the metadata and the favicon set. It decides how StyleX is
used, never whether StyleX is the answer.

Full judgment: the `stylex` skill's references.
