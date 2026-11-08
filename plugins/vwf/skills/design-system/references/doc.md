# Distill, write and review the doc

## §5 — Distill into the doc

Map the payload onto the template's sections: semantic token values, type and
spacing scales, motion, accessibility, component behaviors, anti-patterns.
Contract vs realization holds: write values and scales, and never the component
library or CSS framework that the payload may mention.

**Brand is import-only.** When the payload carries a `brand:` block, write the
template's **Brand** section from it, verbatim in meaning. The brand reference of
`design-system-authoring` governs it. Include:

- The logo source.
- Every variant, with its path and use.
- The clear-space rule, the minimum sizes, and the rules.

Keep every path relative to the repo root, as the adapter returned it.

When the payload has no `brand:`, delete the section and elicit nothing. Brand is
never text-elicited, on the adapter path or the text-only path. A logo is a file
that the design tool holds, not a decision that an interview can produce.

**Nothing invented.** Elicit these now, per
`${CLAUDE_PLUGIN_ROOT}/assets/elicitation.md`:

- A field that the adapter returned as `null`.
- A section that no tool decided. Commonly: the accessibility conformance target,
  anti-patterns, or the Terminal UX section when a `cli` platform requires it.

The import fills the doc. Elicitation fills only the import's holes.

## §6 — Write the doc

Two equal forms exist:

- The single file `docs/blueprint/design-system.md`, the default.
- The folder `docs/blueprint/design-system/`, with `index.md`, `foundations.md`,
  `motion.md` and `components.md`, once the doc outgrows one sitting. An existing
  folder stays a folder.

Author from the template, with its OKF frontmatter: `type: vwf-design-system`,
`title`, `description`, and `status`. Set `status` to `draft` until §7 passes,
then `reviewed`. Every split file carries its own frontmatter.

## §7 — Reviewer loop

Self-review against the checklist of `design-system-authoring` first. Then loop:

1. Dispatch a fresh, stateless `design-system-reviewer`. Pass only the written
   doc, all files of the folder form. Tell it whether a `cli` platform exists.
   Tell it whether the payload carried `brand:`.
2. On gaps, elicit a decision hole and fix it in the doc.
3. On a visual gap, the rework is tool-side. The user iterates in the design
   tool. Then re-import the affected sections.
4. On `NO GAPS`, set `status: reviewed`.

If the gap count does not strictly decrease, take H5.
