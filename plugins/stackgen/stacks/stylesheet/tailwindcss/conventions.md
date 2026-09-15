# Tailwind CSS — conventions

**Written against the Tailwind CSS v4 line**, whose configuration is CSS-first:
`@import "tailwindcss"` and a `@theme` block replace the JavaScript config file
the v3 line used. Material written before v4 configures a file this line does
not read, and that is the single most common way a token mapping here is wrong
without failing.

Tailwind is a **generator**, not a stylesheet. The `@theme` block is its input,
the utility classes are its output, and the classes exist **because** a theme
variable does. That is why the token mapping below is not a style decision but
the whole configuration: a design-system role with no entry in the theme has no
utility, and a developer reaching for it gets a class that silently does
nothing.

## Tokens

The design system is the contract — role names and their values. This section
is how those roles become utilities, class by class.

**Every role gets a theme variable, and the variable name carries the role.**
`--color-text-muted`, never `--color-gray-500`. The utility inherits the name,
so a semantic theme yields `text-text-muted` and a literal one yields
`text-gray-500` — and the second has thrown the contract away at the moment it
was written down.

**The namespace decides which utility appears.** These are the ones a vwf
design system actually lands in:

| Design-system class | Namespace | Notes |
| --- | --- | --- |
| Colour roles | `--color-*` | one entry per role, not per shade |
| Font families | `--font-*` | heading / body / mono |
| Type scale steps | `--text-*` | each step may carry a paired `--text-<step>--line-height` |
| Weights | `--font-weight-*` | |
| Letter spacing | `--tracking-*` | |
| Line height, where not paired to a step | `--leading-*` | |
| Radius scale | `--radius-*` | |
| Elevation scale | `--shadow-*` | `--inset-shadow-*` and `--drop-shadow-*` are separate namespaces |
| Motion easings | `--ease-*` | |
| Named animations | `--animate-*` | `@keyframes` may sit inside the theme block beside the entry that uses them |
| Breakpoints | `--breakpoint-*` | each entry is a responsive variant, which is the whole responsive story |
| Spacing scale | the spacing namespace | see below — the one namespace whose shape depends on the scale |

**Spacing is the namespace to check against the release before writing it.** A
strict multiple ladder (a 4-point scale) and an irregular named set are
expressed differently, and the difference is whether the steps are derived from
one base or declared one by one. Confirm the current namespace table rather
than copying a scale from another project.

**Light and dark cannot both live in `@theme`.** This is the constraint the
whole mapping is built around: `@theme` is required to be top-level, so it
cannot be nested under a media query or a selector, and a role with two values
therefore has nowhere to put the second one.

The resolution is two layers, and it is not optional:

1. **Plain CSS variables hold the values**, declared on the root and again
   under whatever selector the dark scheme uses. These are ordinary custom
   properties — they generate no utility and are not meant to.
2. **`@theme inline` holds the roles**, each entry referencing the variable
   from layer 1. The `inline` option is what makes a utility resolve the
   referenced variable at the point of use rather than freezing its value, and
   without it every dark override is ignored: the theme captured the light
   value at build time and the utility keeps emitting it.

```css
@import "tailwindcss";

:root {
  --role-text-muted: <the design system's light value>;
}

[data-theme="dark"] {
  --role-text-muted: <the design system's dark value>;
}

@theme inline {
  --color-text-muted: var(--role-text-muted);
}
```

**`@theme static` is for the roles nothing references yet.** Tailwind emits
only the variables it sees used; a token a runtime reads by name — a chart
colour looked up in JavaScript, a canvas fill — is invisible to that analysis
and disappears from the build. Put those in a static block and say why.

Full judgment on the mapping, including what the design system may define that
this approach cannot express natively, is the skill's `tokens.md`.

## Authoring

**Styles live at the call site.** The point of this approach is that reading a
component tells you how it looks without opening a second file, and every
convention below protects that property rather than decorating it.

- **A custom class is a smell until it is a repetition.** Three occurrences of
  the same run of utilities is the threshold; before that, extracting it hides
  the styling for no gain. Where one is warranted it goes in a `components`
  layer and references theme variables with `var()`, never a literal.
- **An arbitrary value is a token that was not defined.** A one-off length or
  colour written inline is the design system leaking a value it never agreed
  to. Either it is a real token — add it to the theme — or it is a deviation
  the screen contract should have recorded.
- **Class order follows one rule, enforced by the formatter, never by
  agreement.** The project's formatter sorts them; a reviewer arguing about
  order is a gate that has not been wired.
- **Conditional classes are composed in the markup, not concatenated into
  strings.** A class name assembled from fragments is invisible to the content
  scan that decides which utilities get generated, and the class is simply
  absent at runtime with no error anywhere.

## Theming

The light/dark switch is **one decision for the whole product**, made once and
not revisited per component.

**An attribute on the root element is the default**, because it is the only
form that can also be set by hand: a user choosing dark against a light system
preference needs somewhere for that choice to land. The dark variant is
redefined to read that attribute, replacing the class-based default:

```css
@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));
```

The `:where()` wrapper keeps the variant's specificity at zero, which is what
stops a dark rule beating an unrelated, more specific one for reasons nobody
intended.

**A media query alone is the simpler answer where the product offers no
toggle** — and choosing it is choosing never to offer one later without a
migration. Say which was chosen and why in the project's own conventions.

**A server-rendered page paints before the script runs.** Whatever sets the
attribute must run before first paint, from the document head, or the first
frame is the wrong theme and every user sees the flash. This is a head concern
and the web-head doctrine owns where the script goes; what belongs here is that
the attribute name it sets is the one the variant above reads.

## Responsive

**The breakpoint namespace is the whole mechanism.** Each entry becomes a
variant, so the design system's breakpoint set is transcribed once and every
responsive class in the product is one of those names.

- **Mobile-first, always.** An unprefixed utility is the narrow case and a
  prefixed one widens it. Mixing directions in one product means every reader
  has to work out which convention a given line follows.
- **An arbitrary breakpoint at a call site is a bug.** It is a width the design
  system never agreed to, and it will not match the next component that needs
  the same one.
- **A container query is the right tool where the thing responds to its own
  box rather than the viewport** — a card in a sidebar and the same card in a
  main column. Reaching for a viewport breakpoint there produces a component
  that is only correct in the layout it was written for.

## Integration

Tailwind needs exactly two things wired, and **neither is landed by this
component** — the host framework owns its own configuration, so `/vwf:execute`
makes both edits in the project's config after this doctrine is materialized.

1. **The build plugin, registered in the framework's build pipeline.** Where
   the framework owns a bundler, the plugin goes in that framework's own
   configuration block and nowhere else — a second bundler config beside it
   competes for the same files. Where the framework has no bundler, the
   equivalent hook is the CSS pipeline's plugin list.
2. **The entry stylesheet, imported once from the root layout.** One file
   carries the import, the two token layers and the variant redefinition; it is
   imported from the layout every page shares. Importing it per page produces
   duplicate style tags in some build modes and none in others.

**Content detection is automatic and has an edge.** The build discovers which
utilities to generate by scanning source files, and a class name that exists
only as a runtime string — from a database, a CMS field, a computed key — is
not in any source file and is therefore not generated. Where a project needs
such classes it declares them explicitly; the failure is silent otherwise.

**A generated framework instantiates this section rather than reading it as a
recipe.** The two hooks above are stated by role precisely so a framework this
pack has never seen can be wired by finding its equivalent of each.

## Performance

- **Output scales with the number of distinct utilities used, not with the
  size of the codebase.** Two thousand components reusing the same forty
  classes produce forty rules. This is the property the approach is chosen for,
  and the arbitrary values banned above are what erodes it — each one is a rule
  nothing else shares.
- **Theme variables reach the browser too.** Every entry emits a custom
  property, so a theme carrying a full colour ramp per role ships every unused
  shade. Define the roles the product uses, not a palette.
- **The markup pays what the stylesheet saves.** Class lists appear in every
  rendered page rather than once in a file, so a server-rendered page's HTML is
  larger and compresses well; a client-rendered one pays it in the bundle. Say
  which the project is before treating either number as a surprise.
- **A page still ships the whole stylesheet.** Utilities are generated
  per-project, not per-route; a route needing five classes loads the file that
  serves all of them. Splitting it is almost always the wrong trade.

## Testing

- **The formatter's class-order rule is the first gate**, and it belongs in the
  repo's own format task rather than in a reviewer's head.
- **A lint rule catches the two failures that are otherwise invisible**: a
  class name that does not exist (a typo, or a token never defined) and an
  arbitrary value where a token exists. Both pass every build.
- **Nothing above catches a wrong token.** A component using the border role
  for text is correct to every checker and wrong on screen; that is a visual
  comparison's job, and the repo's gate bundle owns whether the product runs
  one.

## What this component does not decide

The token **values** — those are the product's design system, and a palette
shipped here would quietly become the product's. The component library. The
framework, its build configuration, or which file the two integration edits
land in. The head, the metadata and the favicon set. It decides how Tailwind is
used, never whether Tailwind is the answer.

Full judgment: the `tailwindcss` skill's references.
