# MDX — markdown that can hold a component

MDX is markdown whose body may import and render a component. That is the
whole of what it adds, and the only reason to reach for it. Collections,
routing and the markdown pipeline are
[`content-and-routing.md`](content-and-routing.md)'s; this file is the format.

## When MDX earns its place

**Plain `.md` is the default.** A page of prose, headings, lists, code and
links is markdown, and gains nothing from being MDX — it loses the guarantee
that the file is just text, which every editor, reviewer and diff tool reads
without a compiler.

**MDX is for content that must embed a component** — a callout that is a
styled component rather than a blockquote, a diagram rendered from data, a
live example beside the prose that explains it. Name the component the page
needs before renaming the file; a `.mdx` extension with no import in it is a
markdown file paying MDX's costs.

**MDX everywhere forfeits the zero-JS default.** Every component an MDX file
imports is one more place a `client:*` directive can be added in a content
edit, by an author who is not thinking about bundles. The property the
conventions' `## Islands` section argues for — a page with no island ships no
JavaScript — survives MDX only if the content set treats a directive as the
exception it is on a page.

## The integration

MDX is not built in. It is the first-party `@astrojs/mdx` integration,
registered in `astro.config`'s `integrations` array:

```typescript
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";

export default defineConfig({
  integrations: [mdx()],
});
```

This is where MDX's config lives, and the only place. It is not one of the
conventions' four config facts — those are the proven static set, and MDX is
opt-in per project.

**MDX inherits the markdown configuration by default.** The remark and rehype
plugins, and the highlighter, configured for markdown apply to `.mdx` files
too, through the integration's `extendMarkdownConfig`, which is `true` unless
set. Leave it on: a build-failing link check written for markdown should fail
an MDX file the same way. Turning it off gives MDX its own pipeline, and two
pipelines over one content set drift apart without anyone deciding they should.

## MDX inside a content collection

**The loader decides whether `.mdx` is an entry.** A glob pattern matching
`**/[^_]*.md` does not match `.mdx`; widen it to `**/[^_]*.{md,mdx}` when the
collection takes both. The schema is unchanged — frontmatter is frontmatter in
either format, and is validated the same way at build time.

**A `.mdx` entry is queried exactly like a `.md` one.** `getCollection` and
`getEntry` return the same shape; the difference is what rendering returns.
`render(entry)` gives a `Content` component for both, but an MDX entry's
`Content` takes a `components` prop mapping HTML elements to components:

```astro
---
import { getEntry, render } from "astro:content";
import Heading from "@/components/Heading.astro";

const entry = await getEntry("docs", "intro");
if (!entry) throw new Error("docs/intro is missing");
const { Content, headings } = await render(entry);
---

<Content components={{ h2: Heading }} />
```

**Element overrides belong on the page, not in the entry.** Mapping `h2` once,
where the collection is rendered, styles every entry alike. An entry that
exports its own `components` map is one entry that renders differently from
its siblings, and the difference is invisible from the route.

## Components in MDX

An MDX file imports a component the way a module does, below its frontmatter,
and renders it as a tag:

```mdx
---
title: Pricing
---
import Callout from "@/components/Callout.astro";
import Estimator from "@/components/Estimator.tsx";

<Callout kind="note">Prices exclude tax.</Callout>

<Estimator client:visible />
```

**Two different costs, one syntax.** `Callout` is an `.astro` component: it
renders to HTML at build or request time and ships nothing to the browser.
`Estimator` carries a directive, so it is an island — its framework runtime
and its code ship to every reader of the page. The directive rules are the
same as anywhere else in the pack: the laziest one that works,
`client:visible` before `client:idle` before `client:load`, and `client:only`
never on a content page.

**Import from `@/`, not by relative climb.** An entry moved between folders
keeps working; a `../../components/` import breaks on the move and the build
names the file, not the reason.

**MDX is stricter than markdown.** `{` and `<` are syntax, so a literal one in
prose is escaped or put in a code span. An HTML comment is not valid MDX — use
`{/* … */}`. A file that was valid markdown can fail to compile the moment its
extension changes, which is one more reason not to rename files speculatively.

## Per mode

MDX authoring is identical in all four modes: the same integration, the same
imports, the same `components` prop. What differs is **when the collection is
queried and rendered**:

- **SSG** — at build. Every MDX entry is rendered once into the output
  directory, and an island inside it hydrates from static HTML.
- **Hybrid** — at build on prerendered routes, which should be every content
  route. A `prerender = false` route that renders an entry does it per request;
  that is only worth it when the page around the entry varies by request.
- **SSR** — per request by default. The entries are still compiled at build,
  so a content-only route gains nothing from rendering on demand: mark it
  `prerender = true`.
- **CSR** — at build, into the prerendered shell; there is no server. MDX
  never renders inside the `client:only` application. Content that belongs
  in the app is data the app fetches, not MDX.

## What this does not decide

Whether the project has MDX at all — a site of plain prose never adds the
integration. The components an MDX file may import, and their styling — the
project's UI kit and its `stylesheet` pin. The collection's schema, which is
the content model's. The remark and rehype plugins, which are
[`content-and-routing.md`](content-and-routing.md)'s `## Markdown transforms`.
