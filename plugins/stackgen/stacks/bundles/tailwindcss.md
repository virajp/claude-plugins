---
name: Tailwind CSS
axis: stylesheet
kind: stylesheet
components:
- stylesheet/tailwindcss@0.1.0
---

# Stylesheet — Tailwind CSS

Utility classes generated from a token block. The design system's roles are
declared once in CSS and every style is written at the call site as a class,
so reading a component tells you how it looks without opening a second file.

**Pick it for speed and for the ceiling on stylesheet growth.** Output scales
with the number of distinct utilities used rather than with the size of the
codebase, and the token block is short enough that the whole realization of the
design system fits on a screen.

**What it costs.** Markup carries the styling, so class lists appear in every
rendered page rather than once in a file — cheap for a server-rendered site,
paid in the bundle for a client-rendered one. Nothing is type-checked: a class
name that does not exist is a class that does nothing, and a lint rule is what
turns that into a failure. A class name assembled at runtime is invisible to
the build's content scan and is simply absent. And the v4 line's CSS-first
configuration means most material written about Tailwind configures a file this
line does not read.

The slug is the `projects.<name>.stylesheet` token itself.
