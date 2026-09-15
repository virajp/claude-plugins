---
name: StyleX
axis: stylesheet
kind: stylesheet
components:
- stylesheet/stylex@0.1.0
---

# Stylesheet — StyleX

Styles authored as typed objects in the component's own language and compiled
to atomic CSS at build. The design system's roles become a variable group, so a
token that does not exist is a type error rather than a blank element.

**Pick it where the styling has to be checked.** The type checker catches a
misspelled role, a property that does not exist and a value of the wrong shape
before the page renders — which is the one thing neither other option offers.
The cascade is replaced by explicit merge order, so a collision is resolved by
reading the call rather than by counting selectors, and a component cannot
reach into a child's styles at all.

**What it costs.** A build step and a slower one: every module is compiled.
A bundler plugin has to be registered, and registered before the framework's
own transform, which is a constraint a framework this pack has not seen may
express differently. The authored form is not CSS, so the ecosystem of
copy-pasteable snippets does not apply, and the approach is the most locked-in
of the three — leaving it is a rewrite of every component's styles, not a
config change.

The slug is the `projects.<name>.stylesheet` token itself.
