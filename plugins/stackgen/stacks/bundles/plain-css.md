---
name: Plain CSS
axis: stylesheet
kind: stylesheet
components:
- stylesheet/plain-css@0.2.0
---

# Stylesheet — Plain CSS

The design system's roles as CSS custom properties in one token module, and
hand-authored rules in cascade layers. No build step of its own, no generated
classes, nothing between the contract and the browser.

**Pick it where the styling surface is small or long-lived.** A documentation
site, a marketing build, a console with a few dozen components: the token
module is a near-literal transcription of the design system, layers keep
specificity flat without a methodology, and there is no toolchain to keep
current. It is also the only option with no lock-in — what ships is what was
written.

**What it costs.** Nothing checks anything. A misspelled custom property is an
empty value, a misspelled property is a rule the browser drops, and a role used
for the wrong thing is a perfectly valid stylesheet — so the linter is not
optional here the way it is for the other two. There is no deduplication: a
rule repeated in three files is three rules, and the only thing bounding growth
is authoring discipline. Breakpoints cannot be parameterized, so the design
system's widths are repeated as literals in every query. And the project must
name its **browser baseline** — layers, container queries and nesting are not
uniformly old.

The slug is the `projects.<name>.stylesheet` token itself.
