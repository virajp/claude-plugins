# U1 — the html pack, its bundle, the taxonomy token, the inventory

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/stacks/framework/html/**` (new),
  `plugins/stackgen/stacks/bundles/html.md` (new),
  `plugins/stackgen/assets/taxonomy.md`, `plugins/stackgen/stacks/inventory.md`
  (regenerated, decision 9)
- **Model:** opus
- **Read first:** `plugins/stackgen/stacks/framework/astro/**` in full — the
  model; `plugins/stackgen/stacks/bundles/astro-ssg.md`;
  `plugins/stackgen/assets/kinds.md:77-134`;
  `plugins/stackgen/assets/contracts/web-head.md` in full;
  `plugins/stackgen/assets/taxonomy.md:95-110`;
  `plugins/stackgen/assets/pack-format.md`;
  `plugins/stackgen/stacks/stylesheet/{plain-css,tailwindcss,stylex}/conventions.md`
  (the hook paragraphs: `:128-146`, `:161-181`, `:126-140`).
- **Lazy-load:** `.claude/skills/plugin-authoring/references/checks.md` (rules
  4, 11, 13); `plugins/stackgen/assets/output-tree.md:143-150` (how
  `p/_project/` lands);
  `cloud-service/workers-static-assets/conventions.md:73-82` (the citation the
  build-output heading must keep satisfying).

## Ruling

Decision 1: "`framework/html`, `category: document` — a new token appended to
`taxonomy.md:101-103` with a one-line gloss ("a hand-authored page tree; the
build, if any, is a bundler, not a framework")."

Decision 2: "One bundle, `stacks/bundles/html.md`, display name `HTML`,
`axis: project`, `kind: language-bundle`, `platforms: [site]`, **no** `default:`
key. Components: `astro-ssg`'s list with `framework/astro@0.2.0` replaced by
`framework/html@0.1.0` and `framework/react@generated` dropped — every other pin
copied verbatim."

Decision 3: "`dev` runs `vite`; `build` runs `vite build` writing `./dist`; the
copy-only build (`cp -R src/. dist/`) is documented as the opt-out in one
paragraph, with what it loses (hashing, minification, any stylesheet plugin).
`test` runs `html-validate` over `src/**/*.html`. The pack ships no task file
for these — init authors `p:<id>:*` from the doctrine."

Decision 4: "`conventions.md` carries the same fixed `## Build output` heading
as Astro's, stating `./dist`, so `workers-static-assets`' citation holds without
edit."

Decision 5: "`framework/astro/config/.config/mise/tasks/p/_project/icons` is
**byte-copied** (`cp -p`, exec bit kept) to
`framework/html/config/.config/mise/tasks/p/_project/icons`."

Decision 6: "ES-module plain `.js` by default (`<script type="module">`); `.ts`
is allowed and stated as such, since Vite compiles it and the language pin is
TypeScript."

Decision 7: "`conventions.md`'s stylesheet paragraph states: `plain-css` needs
nothing; `tailwindcss` uses the Vite plugin under the default build and its CLI
under copy-only; `stylex` needs the Vite build, so a repo on the copy-only
opt-out cannot pick it. No `stylesheets:` allowlist."

Decision 8: "No layout file exists: each page carries its full head, and the
doctrine states the contract's layout clause as met per page (a checklist of the
head set every page repeats, validated by `html-validate`). `robots.txt` and
`sitemap.xml` are hand-authored under `public/`, stated as such. Origin is one
constant in `vite.config.ts` read by nothing at build — the pages carry absolute
canonicals by hand."

Decision 9: "U1 owns `plugins/stackgen/stacks/inventory.md` and runs
`mise run p:plugins:inventory` as its last edit, the one generator exception in
this plan."

New dependencies: "`vite` — dev server and `build`" and "`html-validate` — the
Testing topic", both "to be vetted by `/stackgen:stackgen-reputation` and
Context7-checked by U1 before any version or config key is written". Nothing
else may be named as a dependency.

## Edits

Before writing: run `/stackgen:stackgen-reputation` over `vite` and
`html-validate`; a `block` verdict is `UNRESOLVED:`, a `warn` is a `DECIDED:`
line stating the signal. Resolve both through Context7 (`resolve-library-id` →
`query-docs`) for the current major, the `build` config keys used (`root`,
`build.outDir`, `build.rollupOptions.input` for multi-page), and
`html-validate`'s CLI invocation and config file name — never from memory.

1. **`plugins/stackgen/assets/taxonomy.md`** — `:101-103`: append `document` to
   the `framework` category list with the gloss in decision 1. Touch no other
   line.
2. **`plugins/stackgen/stacks/framework/html/pack.yaml`** — mirror
   `framework/astro/pack.yaml:1-15` field for field: `name: html`,
   `version: 0.1.0`, `type: framework`, `category: document`,
   `kind: language-bundle`, `axis: project`, `harness: n/a`, the same "Topic 2
   of the language-bundle bar" comment, contracts citing `web-head` exactly as
   Astro's does. Description names HTML5, CSS, ES modules, Vite, static site; no
   `platforms:` (language packs alone carry it).
3. **`plugins/stackgen/stacks/framework/html/conventions.md`** — the same
   heading set as Astro's `conventions.md` (`:1,13,41,57,69,93,139`) with the
   content replaced by this pack's doctrine:
   - the tree: `src/` is the site root (`index.html`, one `.html` per page,
     `css/`, `js/`, `assets/`), `public/` for files copied verbatim (`favicon`
     set, `robots.txt`, `sitemap.xml`, `site.webmanifest`); `vite.config.ts`
     with `root: 'src'`, `publicDir: '../public'`, `build.outDir: '../dist'`,
     `emptyOutDir: true`, and every page listed as a rollup input — state that a
     new page is added there or the build silently drops it;
   - `## Build output` — verbatim in shape to Astro's `:41-55`: the build writes
     `./dist`, a deploy pack may rely on it; then the copy-only opt-out
     paragraph (decision 3);
   - dev/build/test (decision 3), scripts (decision 6);
   - `## Head` — what `web-head.md:163-181` asks, answered per decision 8: the
     head set every page repeats, listed once as a checklist; canonical as an
     absolute URL per page; `public/robots.txt` and `public/sitemap.xml`
     hand-authored, with the `index: no` rule being "leave the page out of the
     sitemap and add `<meta name="robots" content="noindex">`"; the real
     `public/` path; the icons task under the project group;
   - the stylesheet paragraph (decision 7), citing the hooks by role the three
     stylesheet packs name, never by file path into a sibling pack;
   - "what this component does not decide" mirroring Astro's `:139-145`.
4. **`plugins/stackgen/stacks/framework/html/config/.config/mise/tasks/p/_project/icons`**
   — `cp -p` from the Astro pack; verify `cmp` silent and the exec bit set.
   Nothing else under `config/`.
5. **`plugins/stackgen/stacks/framework/html/skills/html/SKILL.md`** —
   frontmatter mirroring `skills/astro/SKILL.md:1-15`: `name: html`,
   `user-invocable: false`, `paths:` scoped to `**/*.html`, `**/vite.config.*`,
   `**/src/css/**`, `**/src/js/**`; description one sentence. Body: when the
   skill applies, the references list, the reading order.
6. **`plugins/stackgen/stacks/framework/html/skills/html/references/`** — one
   file per topic, named: `framework-doctrine.md` (the page-tree model, why no
   framework, when to leave for Astro), `pages-and-navigation.md` (multi-page
   input, relative links, 404 page), `build-output.md` (Vite build, the
   copy-only opt-out, what `dist/` holds), `head.md` (the head checklist per
   page, robots, sitemap, icons task), `scripts.md` (ES modules, `.ts` allowed,
   no bundler-specific imports outside Vite's), `testing.md` (`html-validate`
   config and invocation; the ux-gate skill for rendering). Six references; each
   cites `conventions.md` by relative path inside this pack only.
7. **`plugins/stackgen/stacks/bundles/html.md`** — decision 2. Frontmatter after
   `astro-ssg.md:1-14`; body: what the bundle is, when to pick it over
   `astro-ssg` (a handful of hand-written pages, no content collections, no
   islands), when not to (content-driven sites, MDX, per-route rendering modes —
   pick an Astro bundle), the stylesheet sentence from decision 7.
8. Last: `mise run p:plugins:inventory` — regenerates `inventory.md`. Report the
   before/after pack, bundle and kind counts in `DECIDED:`.

## Verification

- `mise run p:plugins:check` green.
- `mise run p:plugins:inventory -- --check` green after edit 8.
- `mise run p:plugins:shellcheck` green (the copied task).
- `command grep -rnE 'CLAUDE_PLUGIN_ROOT|\.\./|framework/astro' plugins/stackgen/stacks/framework/html/config`
  is empty.
- `command grep -c '^## Build output' plugins/stackgen/stacks/framework/html/conventions.md`
  is `1`.
- `command grep -n 'default' plugins/stackgen/stacks/bundles/html.md` shows no
  `default:` frontmatter key.
- `command grep -n 'react' plugins/stackgen/stacks/bundles/html.md` is empty.
- `command grep -n 'document' plugins/stackgen/assets/taxonomy.md` shows the new
  token on the framework line.

## Guardrails

- Touch nothing outside the owned paths. Never edit anything under
  `stacks/framework/astro/` — copy from it only. Never edit `stacks/readme.md`,
  `.claude/**`, `site/**` — report every passage the pack falsifies as
  `DOCS FALSIFIED:` (the survey's list is in `index.md`).
- Name no dependency but `vite` and `html-validate`; Tailwind's and StyleX's
  packages are the stylesheet packs' to name — cite them by role.
- `plugins/**/*.md` is **not** dprint-formatted: fold by hand to the width the
  Astro pack uses. `config/` is copied byte-for-byte into target repos — no
  formatter touches it, and it may cite nothing plugin-relative (rule 13).
- Strict-YAML frontmatter on `SKILL.md` and the bundle: a parse error drops the
  skill silently — validate with `mise run p:plugins:check`.
- `${CLAUDE_PLUGIN_ROOT}` names only this plugin — do not use it in anything
  under `config/`.
- Delete with `rm`, never `git rm`. Do not `git checkout` or `git restore`
  anything.

## Commit

`feat: stackgen — framework/html pack and the html site bundle` — written by the
orchestrator after the wave gate, not by the unit.
