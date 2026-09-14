# U3 — stackgen mints the `stylesheet` type and kind; three packs, three bundles

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/stacks/stylesheet/**` (new — `tailwindcss`,
  `stylex`, `plain-css`), `plugins/stackgen/stacks/bundles/tailwindcss.md`,
  `plugins/stackgen/stacks/bundles/stylex.md`,
  `plugins/stackgen/stacks/bundles/plain-css.md` (all new),
  `plugins/stackgen/assets/taxonomy.md`, `plugins/stackgen/assets/kinds.md`,
  `plugins/stackgen/assets/pack-format.md`,
  `plugins/stackgen/skills/stackgen-stack-menu/SKILL.md`,
  `plugins/stackgen/skills/stackgen-stack-template/SKILL.md`,
  `plugins/stackgen/stacks/inventory.md` (regenerated, never hand-edited)
- **Model:** opus
- **Read first:** `taxonomy.md` 15–90 and 145–170; `kinds.md` 1–50, 754–1010
  (the `app-framework`, `deploy-target` and `design-tool` kinds — the shape a
  kind definition takes — and the reviewer section); `pack-format.md` 140–215;
  `stackgen-stack-menu/SKILL.md` whole; `stackgen-stack-template/SKILL.md`
  60–130; `stacks/framework/astro/pack.yaml`, `conventions.md` and
  `skills/astro/SKILL.md` whole (the doctrine-only pack this one mirrors);
  `stacks/bundles/stitch.md` and `bundles/astro-ssg.md` whole (bundle shape).
- **Lazy-load:**
  `plugins/vwf/skills/design-system-authoring/references/foundations.md` 1–30
  and `assets/templates/design-system.md` (read only — what the tokens are, so
  the `## Tokens` section maps them); `scripts/src/inventory.ts` 100–115 (how
  the kind heading is parsed — read only); `scripts/src/check.ts` 873–925 (rule
  13 — read only).

## Ruling

Decision 2: "Three shipped packs — `tailwindcss`, `stylex`, `plain-css` (tokens
as CSS custom properties, what this repo's site does) — plus stackgen's
`generate` door, which every menu carries".

Decision 3: "Each stylesheet pack's `conventions.md` carries a `## Tokens`
section saying how the design-system's semantic tokens are realized in that
approach; vwf keeps naming no technology".

Decision 4: "Like `framework/astro`: `pack.yaml`, `conventions.md`,
`skills/<slug>/SKILL.md` (`user-invocable: false`, paths-scoped) with
references; no `config/`. Integration files (a Vite plugin in `astro.config.ts`,
a bundler plugin) are framework-specific edits `/vwf:execute` makes from the
doctrine".

Decision 5: "Mint `stylesheet` in `kinds.md` — a second-level heading of the
form "stylesheet — one-line title" with its topic bar and reviewer checklist, as
`design-tool` is to `design`; type `stylesheet` in `taxonomy.md`; one bundle per
pack, axis `stylesheet`, kind `stylesheet`, one component".

Decision 13: "Each pack unit regenerates and owns `stacks/inventory.md`".

Decision 1, as it binds this tree: "`projects.<name>.stylesheet: <slug>`, the
slug is the config value, required for a project declaring a `site` or `webapp`
platform" — so the menu skill answers the `stylesheet` axis with these three
bundles for such a project, and the template skill materializes one as doctrine.

Decision 16, as it binds the menu: "The stylesheet round offers *defer this
axis*" — the menu payload carries the defer option the technology axes carry.

## Edits

1. **`taxonomy.md`** (`:21-81`) — add the type entry, in the list's style:
   **`stylesheet`** — how a web frontend's styles are authored and how the
   design system's tokens become CSS: a utility framework, a compile-time
   CSS-in-JS system, or plain CSS custom properties. Pinned on the stylesheet
   axis, per project, for `site` and `webapp` platforms. Composes into a
   Stylesheet-Bundle. Where the file lists bundle roots per kind (`:152`) add
   the Stylesheet-Bundle: one `stylesheet` component, standing alone.
2. **`kinds.md`** — a new second-level section headed "stylesheet — the approach
   a web frontend's styles are authored in" (the kind name in a code span,
   exactly as the `design-tool` heading is punctuated), placed after
   `design-tool` (`:911-963`) and before the Reserved kinds section, in the same
   shape: what the output is (a Stylesheet-Bundle, one component, standing
   alone), why the kind exists (vwf names no stylesheet approach; the design
   system is contract, the pack is realization), a "The topic bar" subsection —
   tokens (how each design-system token class is realized), authoring (where
   styles live, colocated or global), theming (light/dark, the token switch),
   responsive (the breakpoints as authored), integration (the framework hook:
   bundler or build plugin, and what `/vwf:execute` edits), performance (what
   ships to the browser — atomic CSS, extracted CSS, cascade layers), testing
   (what a visual or lint gate asserts) — sized as the `design-tool` bar is,
   with the depth sizing; and the kind's ruling on skill invocation
   (`user-invocable: false`, paths-scoped to the stylesheet's own file globs).
   `:993` "all twelve kinds" → thirteen. `pack-format.md`'s `kind:` enum and
   `stackgen-stack-menu`'s `kinds:` list gain `stylesheet` (edits 3, 4).
3. **`pack-format.md`** — `:157` `kind:` enum gains `| stylesheet`; `:158` and
   `:201` `axis:` enums gain `| stylesheet`. If the file enumerates which
   components take `platforms:` or `languages:`, state that `stylesheet`
   components take neither.
4. **`stackgen-stack-menu/SKILL.md`** — `:69` `axes:` gains `stylesheet`; `:70`
   `kinds:` gains `stylesheet`; the dispatch prose says the stylesheet axis is
   answered with every `axis: stylesheet` bundle plus the `generate` entry and
   the defer option, and that vwf asks it only for a `site`/`webapp` project —
   the skill does not filter by platform itself, as on the design axis.
5. **`stackgen-stack-template/SKILL.md`** — `:77` enum gains `| stylesheet`; the
   kinds passage near `:116` counts thirteen; the materialize path treats a
   stylesheet bundle as a doctrine-only composition, landing `conventions.md`
   and the skill into the target repo's `.claude/` tree the way a `framework`
   component lands, and recording the slug in the lockfile.
6. **Three packs** at `stacks/stylesheet/<slug>/`, each with:
   - `pack.yaml`: `name`, `summary`, `version: 0.1.0`, `type: stylesheet`,
     `category` (`utility` for tailwindcss, `compile-time` for stylex, `plain`
     for plain-css — record the category tokens in `taxonomy.md`'s type entry),
     `kind: stylesheet`, `axis: stylesheet`, `harness: n/a`.
   - `conventions.md`: the pack's doctrine, headed by a `## Tokens` section that
     maps the design system's token classes (color roles with light/dark, type
     scale, spacing scale, radius, elevation, motion durations and easings,
     breakpoints) into that approach — Tailwind v4's CSS-first `@theme` block
     and `@custom-variant` for the dark scheme; StyleX's `defineVars` /
     `createTheme` with the light/dark pair; plain CSS custom properties on
     `:root` with a `[data-theme]` or `prefers-color-scheme` switch — then
     authoring, theming, responsive, integration, performance and testing per
     the topic bar. The integration section names what `/vwf:execute` edits in
     an Astro project (the Vite plugin, the global stylesheet import in the
     layout) **by role**, and says a generated framework's integration is the
     generator's to instantiate.
   - `skills/<slug>/SKILL.md` — `user-invocable: false`, `paths:` scoped to the
     approach's own globs (`**/*.css` and the framework config for tailwindcss;
     `**/*.stylex.{ts,tsx}` and `**/*.{ts,tsx}` for stylex; `**/*.css` for
     plain-css), with `references/` files per topic where the doctrine exceeds a
     screen — `tokens.md` at minimum for all three.
   - **Research every API claim through Context7** (`resolve-library-id` →
     `get-library-docs`) for `tailwindcss` (v4 line) and `@stylexjs/stylex`
     before writing; record the version line each doctrine describes in the
     pack's `conventions.md` header. Plain CSS cites no library.
7. **Three bundles** at `stacks/bundles/<slug>.md` in `bundles/stitch.md`'s
   shape: `name` (`Tailwind CSS`, `StyleX`, `Plain CSS`), `axis: stylesheet`,
   `kind: stylesheet`, `components: [ stylesheet/<slug>@0.1.0 ]`, no
   `platforms:`, no `artifact:`; a body of one or two paragraphs saying when to
   pick it and what it costs (build step, runtime, the lock-in).
8. **Regenerate the inventory**: `mise run p:plugins:inventory`, then confirm
   the header's pack and bundle counts each rose by three and its kinds count by
   one against the tree before this unit (the audit-capability plan lands first,
   so do not assume the pre-plan numbers), and `## Kinds` lists `stylesheet`.

## Verification

- `mise run p:plugins:check` green; `mise run p:plugins:inventory -- --check`
  green after edit 8.
- `command ls plugins/stackgen/stacks/stylesheet/` lists exactly `plain-css`,
  `stylex`, `tailwindcss`.
- `command grep -rn "CLAUDE_PLUGIN_ROOT\|assets/\|\.\./" plugins/stackgen/stacks/stylesheet/`
  is empty (rule 13 — every file here lands in a user's repo).
- `command grep -c "^## .stylesheet. —" plugins/stackgen/assets/kinds.md` prints
  `1`; `command grep -n "twelve kinds" plugins/stackgen/assets/kinds.md` is
  empty.
- `command grep -n "stylesheet" plugins/stackgen/assets/pack-format.md plugins/stackgen/skills/stackgen-stack-menu/SKILL.md plugins/stackgen/skills/stackgen-stack-template/SKILL.md`
  hits in each.

## Guardrails

- Do not touch `stacks/framework/astro/**`, `bundles/astro-*.md`,
  `assets/contracts/**`, `assets/output-tree.md` — U4 owns them.
- Do not touch `plugins/vwf/**`.
- The `kind` heading must be exactly the shape `inventory.ts:106` parses — copy
  the `design-tool` heading's punctuation.
- Strict-YAML frontmatter on every `SKILL.md` and bundle: a bad frontmatter
  drops the skill silently. `paths:` globs are a YAML list.
- `plugins/**/*.md` is not dprint-formatted: fold by hand to the neighbours'
  width.
- Never write a landed file through a heredoc: `cat` is aliased and the
  `npm-normalize` hook rewrites `npm` after a pipe — use the Write tool.
- Delete with `rm`, never `git rm`.

## Commit

`feat: stackgen — stylesheet type and kind; tailwindcss, stylex, plain-css packs`
— written by the orchestrator after the wave gate, not by the unit. The pack
manifests, the three bundles and the regenerated `inventory.md` land in this one
commit (the inventory hook fires on commit).
