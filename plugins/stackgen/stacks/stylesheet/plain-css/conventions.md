# Plain CSS — conventions

**Written against the CSS the browser ships**, not a preprocessor and not a
framework: custom properties, cascade layers, container queries, nesting where
the target browsers support it. There is no version line to pin because there
is no library — what there is instead is a **baseline decision**, and this
approach requires the project to name it. The features below are not uniformly
old, and "plain CSS" without a stated baseline is a claim rather than a
constraint.

This is the approach with no build step of its own, no generated classes and no
compiler between the contract and the browser. Its cost is that nothing checks
anything: a misspelled custom property is an empty value, a role used for the
wrong thing is a correct stylesheet, and there is no type error waiting. Every
convention below buys back some of what the other two approaches get for free.

## Tokens

The design system is the contract. Here it becomes **custom properties**, and
the mapping is close to literal — which is the reason to pick this and the
reason it needs discipline.

**One token module, declared on the root.** A single file holds every role; the
rest of the stylesheet references and never redeclares. A component declaring
its own role is a design system fork nobody reviewed.

```css
:root {
  /* Colour roles — light. */
  --color-text-default: <light value>;
  --color-text-muted: <light value>;
  --color-surface: <light value>;

  /* Scales — one value across both schemes. */
  --space-sm: <value>;
  --radius-md: <value>;
  --motion-fast: <value>;
  --ease-standard: <value>;
}

[data-theme="dark"] {
  --color-text-default: <dark value>;
  --color-text-muted: <dark value>;
  --color-surface: <dark value>;
}
```

**The name carries the role, and only the role.** `--color-text-muted`, never
`--color-gray-500`. This is the whole contract in this approach: there is no
compiler enforcing it and no generator deriving it, so the naming *is* the
enforcement.

**Scheme-dependent and scheme-independent roles are separated visibly.** The
colour block moves under the theme selector; the scales do not. Keeping them in
one undifferentiated list means the next dark value gets added in the wrong
block and nobody notices until dark mode.

**Breakpoints cannot be custom properties.** A media query's condition is not a
place a variable is substituted. They are written out, and the design system's
set appears in the stylesheet as literal widths — which is the one place this
approach is forced to repeat itself. Keep every one of them in a single
`## Responsive` region of the token module's comments so the set is at least
findable.

Full judgment on the mapping, and on what this approach cannot express
natively, is the skill's `tokens.md`.

## Authoring

- **Cascade layers are declared once, in order, at the top of the entry
  file** — reset, base, components, utilities, or whatever the project's set
  is. Layer order beats specificity, which is what lets a component rule be
  written simply instead of defensively.
- **A rule outside every layer beats every layer.** That is a footgun, not a
  convenience: unlayered styles win regardless of what any layer says. Nothing
  in the product's own CSS should be unlayered, and a third-party stylesheet
  that is gets imported into a layer.
- **No important flag.** With layers in place it has no legitimate use left,
  and each one is a precedence decision made where the next reader cannot see
  it.
- **A component's styles live beside the component**, in a file the component
  imports, or in one clearly named block of a shared sheet. Pick one and hold
  it; a product that does both has no answer to "where is this styled".
- **Class names follow one convention**, stated in the project's conventions,
  and its job is to keep specificity flat — a single class per rule, no
  descendant chains built to win a fight that layers already settled.
- **Every value is a `var()` reference.** A literal colour, size or duration in
  a component rule is a token the design system never agreed to. The exception
  is a value that is genuinely structural — a one-pixel hairline, a zero — and
  those are few enough to notice.

## Theming

**An attribute on the root element**, matching the shape shown above: the
colour roles are redeclared under it, and everything downstream is unchanged
because it referenced roles rather than values.

- **It is the only form a user can override.** Someone choosing dark against a
  light system preference needs somewhere for that choice to land.
- **The system preference is honoured through the same attribute**, set from a
  small script rather than by a second set of rules inside a preference media
  query. Two mechanisms declaring the same roles is how one of them ends up
  half-updated.
- **A scheme-preference media query alone is the simpler answer where the
  product offers no toggle** — and it is a decision never to offer one without
  a migration.

**A server-rendered page paints before any script runs.** Whatever sets the
attribute runs in the document head, synchronously, or the first frame is the
wrong theme. The script is the head doctrine's; what belongs here is that the
attribute name it writes is the one the token module's dark block selects on.

**A colour-scheme declaration is part of theming**, not a detail: without it
the browser's own form controls and scrollbars stay light under a dark theme,
and that is the most commonly shipped version of this bug.

## Responsive

- **Mobile-first**: the unprefixed rule is the narrow case and a media query
  widens it. One direction, product-wide.
- **The breakpoint set is the design system's**, written out as literal widths
  because the syntax gives no alternative. A width appearing in a query that is
  not in the set is a bug, and it is one only a reviewer will catch.
- **A container query is the right tool where the thing responds to its own
  box** rather than the viewport, and this approach has it natively — a card in
  a sidebar and the same card in a main column is the case.

## Integration

**There is nothing to wire, and that is the feature.** No plugin, no compiler,
no generated file. What the project does need is stated by role, and
`/vwf:execute` makes the edit in the project's own tree:

1. **The entry stylesheet, imported once from the root layout** — the layer
   declaration, the token module, then the rest.
2. **An import order that matches the layer order.** Layers are ordered by
   their declaration, not by import position, which is exactly why the
   declaration comes first: get it right once and import order stops mattering.

Where the framework inlines stylesheets under a size threshold and the project
carries a content-security policy that forbids inline styles, the framework's
own inlining setting has to be turned off. That is the framework pack's
setting; it is named here because this is the approach most likely to trip it.

**A generated framework instantiates this section rather than reading it as a
recipe** — both points are stated by role.

## Performance

- **What ships is what was written.** No generation, no atomic classes, no
  deduplication: a rule repeated in three files is three rules. The stylesheet
  grows with the product, and the only thing controlling that growth is the
  authoring discipline above.
- **That also means nothing is unused-but-shipped by a generator.** There is no
  theme block emitting variables nobody references and no utility set sized to
  the whole product. The trade runs both ways.
- **Custom properties are resolved at paint and are inherited.** Redeclaring a
  role deep in the tree is legitimate for a genuinely scoped override and is a
  maintenance problem everywhere else, because the value a component sees now
  depends on where it is mounted.
- **Route-splitting the stylesheet is possible here and rarely worth it.**
  Measure the file first; a token module plus disciplined component rules is
  usually smaller than the machinery to split it.

## Testing

- **A CSS linter is the only automated gate this approach has**, so it is not
  optional the way it is for the other two. Configure it to catch a custom
  property that is never declared, a literal where a token exists, an important
  flag, and a duplicate selector.
- **Nothing catches a wrong token.** A rule using the border role for text is
  valid CSS and wrong on screen; that is a visual comparison's job, and the
  repo's gate bundle owns whether the product runs one.
- **A misspelled property name is silently dropped by the browser.** The linter
  is what turns that into a failure; without it the rule simply does nothing
  and the page looks almost right.

## What this component does not decide

The token **values** — those are the product's design system, and a palette
shipped here would quietly become the product's. The component library. The
framework, its build configuration, or which file the entry stylesheet is
imported from. The head, the metadata and the favicon set. It decides how plain
CSS is used, never whether plain CSS is the answer.

Full judgment: the `plain-css` skill's references.
