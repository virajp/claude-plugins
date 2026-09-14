# U2 — the screens contract pins metadata; conventions and the design system carry the defaults

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/vwf/assets/blueprint-format`,
  `plugins/vwf/assets/capability-vocabulary.md`,
  `plugins/vwf/assets/templates/flow-platform.md`,
  `plugins/vwf/assets/templates/conventions.md`,
  `plugins/vwf/assets/templates/design-system.md`,
  `plugins/vwf/skills/blueprint-authoring/references/flow-contract.md`,
  `plugins/vwf/skills/blueprint-authoring/references/ui-ux-contract.md`,
  `plugins/vwf/skills/design-system-authoring/references/foundations.md`,
  `plugins/vwf/skills/blueprint/SKILL.md`,
  `plugins/vwf/skills/blueprint/references/screen-review.md`,
  `plugins/vwf/agents/flow-writer.md`,
  `plugins/vwf/agents/blueprint-reviewer.md`,
  `plugins/vwf/agents/execute-ux-reviewer.md`,
  `plugins/vwf/agents/mockup-generator.md`,
  `plugins/vwf/agents/blueprint-condenser.md`, `plugins/vwf/skills/screens/**`,
  `plugins/vwf/skills/mockups/SKILL.md`, `plugins/vwf/skills/feedback/SKILL.md`
- **Model:** opus
- **Read first:** `flow-contract.md` 80–120; `ui-ux-contract.md` whole;
  `templates/flow-platform.md` whole; `templates/conventions.md` 30–100;
  `templates/design-system.md` whole; `foundations.md` 1–30;
  `capability-vocabulary.md` 30–60; `screen-review.md` whole; `flow-writer.md`
  and `blueprint-reviewer.md` whole; `blueprint/SKILL.md` — every passage that
  enumerates the Screens columns or the Components block (grep for "Components"
  and "Form validation").
- **Lazy-load:** `execute-ux-reviewer.md`, `mockup-generator.md`,
  `blueprint-condenser.md`, `screens/**`, `mockups/SKILL.md`,
  `feedback/SKILL.md` — open each, and **edit only where it enumerates the
  per-screen columns or the Components block**; a file that only says "the
  Screens contract" by name is left alone. `plugins/vwf/assets/vwf-config.md`
  38–42 — read only (U1 writes the numbers there).

## Ruling

Decision 9: "A `Metadata` block per Screens row on `site` and `webapp` platform
files, headed by the row's code, four fields: `title` (`<title>` and
`og:title`), `description`, `index: yes | no` (robots meta and sitemap
inclusion), `image: default | <slot>` (`og:image`; `default` is the product-wide
social preview). A `webapp` without `seo` pins `title` only; `blueprint_format`
24 → 25".

Decision 8: "`site`: the full set, always. `webapp`: favicons + manifest +
`<title>` always; the SEO/OG set (description, canonical, OG/twitter, robots,
sitemap) only when the project's registry `capabilities:` lists `seo`. `seo`
stays **P**; its vocabulary entry says this is what it settles".

Decision 10: "Text facts (site name, default description, twitter handle,
locale, JSON-LD organisation) in `docs/blueprint/conventions.md` under a "Web
metadata" section anchored `#web-metadata`; visual assets (the favicon source
mark, the social-preview image 1280×640, the theme colour) named by the design
system under a "Brand assets" section as assets the product supplies".

Decision 3, the vwf half: "`foundations.md:11`'s 'the theme/Tailwind config
file' becomes 'the stylesheet pack's realization of the tokens'".

Decision 14: "U1 writes both numbers in `vwf-config.md` (`config_format: 19`,
`blueprint_format: 25`), the `18 → 19` migration entry (which names the paired
blueprint bump), and both `format-lineage.md` rows; U2 writes
`assets/blueprint-format` and the blueprint-side files".

Decision 17: "A `site`/`webapp` platform file whose Screens rows carry no
`Metadata` block is `24` drift; … propose … never auto-fix". (U1 writes the
lineage row; this unit writes the format-25 rule the row points at.)

The user's words (2026-09-13, backlog B08): "Every website, and webapp where it
applies, ships SEO metadata, OpenGraph tags and a favicon set … lift that into
what the frontend packs land and what the blueprint's screen contract pins."

## Edits

1. **`assets/blueprint-format`** — the file's whole content becomes `25`.
2. **`flow-contract.md`** (`:83-117`) — after the Components-block sentence add
   one paragraph, **format 25**: on a `site` or `webapp` platform file each
   Screens row also carries a `Metadata` block headed by its code, with the four
   fields of decision 9 and their meanings; `index` and `image` are omitted on a
   `webapp` whose project does not declare `seo`, where only `title` is pinned;
   the product-wide values the head reads (site name, default description,
   handle, locale, the default image) are not repeated per screen — they are
   `conventions.md#web-metadata` and the design system's brand assets. The block
   is a contract on what the page *says about itself*, never on markup: no tag
   names, no framework.
3. **`ui-ux-contract.md`** — one bullet in the "reference, never re-decide"
   rule: the social-preview image and the favicon mark come from the design
   system's brand assets; a screen names `image: <slot>` only when it has art of
   its own.
4. **`templates/flow-platform.md`** — after the Components block (`:64-78`) add
   the `Metadata` block skeleton in the template's own HTML-comment voice:
   ```markdown
   ### `<code>` — `<Screen>` metadata

   | Field       | Value |
   | ----------- | ----- |
   | title       |       |
   | description |       |
   | index       |       |
   | image       |       |
   ```
   with a comment stating: one block per Screens row on a `site` or `webapp`
   platform file only; the four fields per decision 9; `title` only on a
   `webapp` without `seo`; `image: default` names the design system's
   social-preview asset.
5. **`templates/conventions.md`** — a new anchored section after the Audit
   section (`:56`), matching the file's one-line-per-section style: heading "Web
   metadata", anchor `{#web-metadata}` — site name, default description, twitter
   (or equivalent) handle, `og:locale`, the JSON-LD organisation block's facts;
   present only when some project declares `site`, or `webapp` with `seo`.
6. **`templates/design-system.md`** — a new section after `## Motion`:
   `## Brand assets` — favicon source mark (one SVG, square, the rounded tile
   noted if any), social-preview image (1280×640, its alt text), theme colour (a
   token reference); each an asset the product supplies, named by role, no path.
7. **`foundations.md`** (`:11`) — the realization cell "the theme/Tailwind
   config file" → "the stylesheet pack's realization of the tokens". Any
   neighbouring sentence naming Tailwind as *the* realization (`:18-19` per the
   survey) is reworded the same way.
8. **`capability-vocabulary.md`** (`:37`, `:49-50`) — the `seo` entry states
   what declaring it settles: the SEO/OG head set, robots and sitemap inclusion,
   and the per-screen `Metadata` fields beyond `title`, on a `webapp`; a `site`
   platform carries all of it without declaring `seo`. Keep it **P**.
9. **`blueprint/SKILL.md`** and **`screen-review.md`** — wherever the per-screen
   completeness bar enumerates code/route/reads/states/actions/form
   validation/Components, add the `Metadata` block for `site`/`webapp` rows,
   with the `webapp`-without-`seo` exception; the reviewer flags a missing block
   on those platforms and a block on any other platform.
10. **`flow-writer.md`** — writes the block per decision 9 from the
    orchestrator's elicited values; never invents a description.
    **`blueprint-reviewer.md`** — checks it per edit 9.
    **`execute-ux-reviewer.md`** — one check: the rendered page's title,
    description, indexability and social image agree with the screen's
    `Metadata` block and `conventions.md#web-metadata`.
11. **Lazy-load set** — `mockup-generator.md` (the page `<title>` in a mockup is
    the block's `title`), `blueprint-condenser.md` (the block is a decision,
    preserved verbatim), `screens/**`, `mockups/SKILL.md`, `feedback/SKILL.md`:
    edit only where a per-screen column list is enumerated, else leave.

## Verification

- `mise run p:plugins:check` green.
- `command cat plugins/vwf/assets/blueprint-format` prints `25`.
- `command grep -n "Metadata" plugins/vwf/assets/templates/flow-platform.md plugins/vwf/skills/blueprint-authoring/references/flow-contract.md plugins/vwf/agents/flow-writer.md plugins/vwf/agents/blueprint-reviewer.md`
  hits in each.
- `command grep -n "web-metadata" plugins/vwf/assets/templates/conventions.md`
  hits;
  `command grep -n "Brand assets" plugins/vwf/assets/templates/design-system.md`
  hits.
- `command grep -n "Tailwind" plugins/vwf/skills/design-system-authoring/references/foundations.md`
  is empty.

## Guardrails

- Do not touch `vwf-config.md`, `format-lineage.md`, `stack-*.md`,
  `architecture/**`, `setup/**`, `doctor/**` — U1 owns them.
- Do not touch `plugins/stackgen/**`.
- Name no tag, no framework, no technology in any blueprint file — the contract
  says what a page states about itself, the pack says how.
- `plugins/**/*.md` is not dprint-formatted: match the surrounding fold width;
  keep the template's HTML-comment voice.
- Strict-YAML frontmatter in the agents and skills: touch no frontmatter block.
- Delete with `rm`, never `git rm`.

## Commit

`feat: blueprint — per-screen Metadata block, web-metadata conventions, brand assets`
— written by the orchestrator after the wave gate, not by the unit.
