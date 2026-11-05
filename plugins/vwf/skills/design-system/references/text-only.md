# The text-only path

The run takes this path when the registry has no project that declares a screen
platform. A `cli`-only or `plugin`-only product is the usual case.

## At §1

Tell the user that no project has a screen surface, and ask which to do:

- (a) Add the UI project to the registry first, through `/vwf:architecture`, then
  return here.
- (b) Proceed text-only.

## At §3 and §4

On (b), skip §3 and §4 entirely, because the adapter exists for screens and there
are none. There is no payload to import.

A preflight for a repo with no screens halts on a condition that is vacuously
true. A `cli`-only or `plugin`-only product could then never get a design system,
while it still owes the **Terminal UX** section that §1 marks required.

## At §5

Elicit every section at §5, per `${CLAUDE_PLUGIN_ROOT}/assets/elicitation.md`.
Start with **Terminal UX**, per the terminal-ux reference of
`design-system-authoring`, for a product whose only surface is a terminal.

Elicit only the sections that the product's platforms oblige. A doc full of screen
tokens that no screen uses is the density bar's problem.
