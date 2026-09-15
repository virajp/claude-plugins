# U4 — the web-head contract; Astro realizes it and lands the icon task

- **Wave:** 2
- **Depends on:** U3 (the inventory commit)
- **Owns:** `plugins/stackgen/stacks/framework/astro/**`,
  `plugins/stackgen/stacks/bundles/astro-ssg.md`,
  `plugins/stackgen/stacks/bundles/astro-ssr.md`,
  `plugins/stackgen/stacks/bundles/astro-csr.md`,
  `plugins/stackgen/stacks/bundles/astro-hybrid.md`,
  `plugins/stackgen/assets/contracts/web-head.md` (new),
  `plugins/stackgen/assets/output-tree.md`,
  `plugins/stackgen/stacks/inventory.md` (regenerated, never hand-edited)
- **Model:** opus
- **Read first:** `stacks/framework/astro/pack.yaml`, `conventions.md` and
  `skills/astro/references/{ssg,ssr,build-output,content-and-routing}.md` whole;
  `assets/contracts/secrets.md` whole (the contract shape);
  `assets/output-tree.md` 130–160; the four `bundles/astro-*.md` whole;
  `stacks/cloud-service/workers-static-assets/config/.config/mise/tasks/p/_project/deploy`
  whole (the landed-task shape and its `_project` header);
  `site/src/layouts/Base.astro` 24–73 and `.config/mise/tasks/p/site/icons`
  whole (**read only** — the source lifted from); `site/public/robots.txt` and
  `site/public/site.webmanifest` (read only).
- **Lazy-load:** `scripts/src/check.ts` 298, 418–450 (rule 11's task assertions)
  and 873–925 (rule 13); `.config/mise/tasks/p/plugins/shellcheck` 60–120 (what
  the shell gate walks); `plugins/vwf/assets/templates/flow-platform.md` (read
  only — the `Metadata` block U2 adds, so the doctrine names the same four
  fields).

## Ruling

Decision 6: "Doctrine + contract + one task: Astro's `conventions.md` gains
`## Head`; the pack lands `config/.config/mise/tasks/p/_project/icons`;
`public/` files (`robots.txt`, `site.webmanifest`, the icons, the social image)
are written by `/vwf:execute` from the doctrine; rule 11 is not widened".

Decision 7: "`assets/contracts/web-head.md` (new, in `contracts/secrets.md`'s
shape) states what any web framework pack — shipped or generated — realizes for
a `site` or `seo` project: the head set, the icon sizes, the manifest, robots
and sitemap, the task. Astro's `conventions.md` restates it by role and cites
nothing by path".

Decision 8: "`site`: the full set, always. `webapp`: favicons + manifest +
`<title>` always; the SEO/OG set (description, canonical, OG/twitter, robots,
sitemap) only when the project's registry `capabilities:` lists `seo`".

Decision 9, the fields the head reads per screen: "`title` (`<title>` and
`og:title`), `description`, `index: yes | no` (robots meta and sitemap
inclusion), `image: default | <slot>` (`og:image`; `default` is the product-wide
social preview)".

Decision 10, the product-wide values the head reads: "site name, default
description, twitter handle, locale, JSON-LD organisation" from
`conventions.md#web-metadata`; "the favicon source mark, the social-preview
image 1280×640, the theme colour" from the design system's brand assets.

Decision 11: "The landed task runs one-off `pnpx sharp-cli@6` and installs
`png-to-ico@3` into a temp dir, exactly as `.config/mise/tasks/p/site/icons`
does — the site plan's 'one-off pnpx icons, never deps' ruling; no dependency in
this repo or the user's".

Decision 12: "`framework/astro` `0.1.0` → `0.2.0`; all four bundle pins follow
in U4's commit, with the regenerated inventory".

Decision 13: "Each pack unit regenerates and owns `stacks/inventory.md`, so U3
and U4 run in consecutive waves".

Decision 1, as it falsifies the bundles' prose: the stylesheet is a per-project
axis pick, so no Astro bundle presumes Tailwind.

## Edits

1. **`assets/contracts/web-head.md`** (new) — in `contracts/secrets.md`'s shape,
   capability-neutral, naming the vwf tokens `site`, `webapp` and `seo` by role.
   Sections: **the head set** — `<title>`, description, canonical (from the
   configured site URL and the route), the icon links (SVG mark, ICO at 32,
   apple-touch at 180, the manifest), the sitemap link, the OpenGraph set
   (`type`, `site_name`, `title`, `description`, `url`, `image` with
   width/height/alt), the twitter set (`summary_large_image`, `title`,
   `description`, `image`, `site` handle), `og:locale`, `theme-color`, JSON-LD
   blocks with `<` escaped; **what each value is read from** — the screen's
   `Metadata` block (decision 9's four fields) and the product-wide
   `conventions.md#web-metadata` and the design system's brand assets (decision
   10); **the gate** — `site` ships all of it; `webapp` ships the icons,
   manifest and title always and the rest only with `seo` (decision 8); **the
   files under `public/`** — `robots.txt` (naming the sitemap), the manifest
   (name, short name, icons 192/512, theme and background colour, display), the
   icon set (`favicon.ico` 16/32/48, `apple-touch-icon.png` 180 full-bleed,
   `icon-192.png`, `icon-512.png`, the SVG mark), the social-preview image
   (1280×640, supplied by the product); **the task** — an `icons` task in the
   project's task group that rasterizes the set from the SVG mark with one-off
   tools, never a dependency; **`index: no`** — the page carries
   `<meta name="robots" content="noindex">` and is excluded from the sitemap.
   State what a generated framework pack must instantiate from this.
2. **`stacks/framework/astro/conventions.md`** — a `## Head` section restating
   edit 1 for Astro by role: one layout owns the head; the `site` config value
   and the sitemap integration; the per-screen values come as layout props from
   the page (the screen's `Metadata` block); `index: no` sets the robots meta
   and the sitemap integration's filter; the `public/` files above; the icons
   task under the project's task group. Cite nothing by path (rule 13 — this
   file lands). Adjust `:73` ("set `site`") to point at the section rather than
   stand alone. Add `skills/astro/references/head.md` carrying the depth — the
   meta tag order this repo's site settled, the JSON-LD escaping, the
   `trailingSlash` interaction with canonical — and list it in
   `skills/astro/SKILL.md`'s reference list.
3. **`config/.config/mise/tasks/p/_project/icons`** (new; mode `755`;
   `#!/usr/bin/env bash`) — lifted from `.config/mise/tasks/p/site/icons` with
   these changes only: the `deploy` task's "THIS FILE SHIPS UNDER `p/_project/`
   AND MUST BE RENAMED" header block copied verbatim; `#MISE description` reads
   "Rasterize the favicon set from public/brand/favicon.svg"; `#MISE dir` is the
   project's directory in the same form the `deploy` task uses; `SRC` is
   `public/brand/favicon.svg` (the contract's name for the mark); the `rx`
   squaring keeps the BSD-`sed` comment. Everything else — `--density 1200`, the
   six renders, the `png-to-ico@3` temp-dir install and the library-entry
   one-liner with its explanatory comment — is byte-for-byte. The file must pass
   `shellcheck -x` and `shfmt -d` with the repo's flags.
4. **`pack.yaml`** — `version: 0.2.0`; the `summary` gains a clause that the
   pack lands an icons task and carries the head doctrine.
5. **`bundles/astro-{ssg,ssr,csr,hybrid}.md`** — line 10 →
   `framework/astro@0.2.0` in all four. `astro-ssr.md:45-46` — the "**UI**:
   shadcn-style components — Radix UI primitives + Tailwind CSS with …" bullet
   is reworded: the component layer is Radix-style primitives; the styling is
   whatever the project's stylesheet axis pins — no framework named.
   `astro-csr.md:73` — same treatment for its Tailwind clause.
6. **`assets/output-tree.md`** (`:143-145`) — beside the deploy overlay
   sentence, note that `framework/astro` lands an `icons` overlay under the same
   `_project` marked position, renamed the same way.
7. **Regenerate the inventory**: `mise run p:plugins:inventory`; confirm the
   astro row reads `0.2.0` and `--check` is green.

## Verification

- `mise run p:plugins:check` green (rule 11 on the task: exec bit, shebang; rule
  13 on every landed file).
- `mise run p:plugins:shellcheck` green.
- `mise run p:plugins:inventory -- --check` green after edit 7.
- `command grep -rn "framework/astro@" plugins/stackgen/stacks/bundles/` shows
  `0.2.0` four times and nothing else.
- `command grep -rn -i "tailwind" plugins/stackgen/stacks/bundles/astro-*.md` is
  empty.
- `command grep -rn "CLAUDE_PLUGIN_ROOT\|assets/contracts\|\.\./" plugins/stackgen/stacks/framework/astro/`
  is empty.
- `command test -x plugins/stackgen/stacks/framework/astro/config/.config/mise/tasks/p/_project/icons`.
- `command grep -c "site\|webapp\|seo" plugins/stackgen/assets/contracts/web-head.md`
  is non-zero.

## Guardrails

- Do not touch `assets/{taxonomy,kinds,pack-format}.md`, `stacks/stylesheet/**`,
  the stylesheet bundles, or either stackgen skill — U3 owns them.
- Do not touch `site/**` — it is read-only source for this unit.
- Do not touch `plugins/vwf/**`.
- The task file is **payload**: write it with the Write tool, never a heredoc
  (`cat` is aliased to `bat`; the `npm-normalize` hook rewrites `npm` after a
  pipe); set the exec bit with `chmod 755`; it lands in a repo with no plugin,
  so it cites nothing plugin-relative.
- `plugins/*/stacks/*/*/config/` is excluded from this repo's dprint on purpose
  — do not format it here.
- `plugins/**/*.md` is not dprint-formatted: fold by hand.
- Strict-YAML frontmatter on the bundles and the skill: touch only the component
  line in each bundle's frontmatter.
- Delete with `rm`, never `git rm`.

## Commit

`feat: stackgen — web-head contract; astro 0.2.0 lands the head doctrine and the icons task`
— written by the orchestrator after the wave gate, not by the unit. The pack
version, the four bundle pins and the regenerated `inventory.md` land in this
one commit.
