# Head

How Astro realizes the web-head contract: the one layout, the canonical, the
sitemap filter, the JSON-LD, and the static files beside them. The contract
says *what* a page has to state about itself; this says how Astro states it.

## One layout, and the props are the contract

The document shell is one `.astro` component every page renders inside, and
its `Props` interface is where the per-screen contract becomes typed. Four
fields, named for what the blueprint pins: the title, the one-sentence
description, whether the page is offered to search, and which image a shared
link shows.

```astro
---
interface Props {
  title: string;
  description: string;
  /** Offered to search, and listed in the sitemap. Defaults to true. */
  index?: boolean;
  /** Site-relative path of this page's social image; the product default
      when omitted. */
  image?: string;
}
---
```

`title` and `description` are **not** optional, and that is the whole value
of the interface: a page that forgot them fails `astro check` in the gate
rather than shipping an empty `og:description` that nobody notices for a
quarter. Everything else defaults, because a default that is right for
almost every page is better than a required field people copy.

A second layout that emits head tags of its own undoes all of this. Nest
layouts by all means — a docs shell inside the document shell — but only the
outermost one owns `<head>`.

## The canonical, and what `trailingSlash` does to it

```astro
const canonical = new URL(Astro.url.pathname, Astro.site);
```

That is the whole derivation, and `site` must be set for it: with no `site`,
`Astro.site` is undefined and the `URL` constructor throws rather than
emitting a wrong value — the one failure mode here that is loud.

**`Astro.url.pathname` is the path that was requested**, not a normalized
form of it. `trailingSlash` defaults to `'ignore'`, which matches a route
with or without the slash — so the same page reached at `/about` and
`/about/` produces **two different canonicals**, each declaring itself the
original. That is a duplicate-content report waiting to happen, and it does
not reproduce in development unless someone types the other form.

So pick `'always'` or `'never'` before the first page ships, match it to what
the host does with the other form, and keep every internal link in that
shape. Changing it later republishes every URL the product has: the old form
redirects, the canonical moves, and every external link takes an extra hop
forever.

## Tag order

Order is not semantics — a browser reads the whole head — but it is
reviewability, and one order consistently applied is what makes a missing tag
visible in a diff:

1. `charset`, then the viewport meta.
2. `<title>`, then the description.
3. The canonical.
4. The icon links — the SVG mark, the ICO at `sizes="32x32"`, the
   apple-touch icon — then the manifest, then `rel="sitemap"`.
5. Any `rel="alternate"` the page offers.
6. The OpenGraph set, then the twitter set, then the image dimensions and
   alt text, then `og:locale`.
7. `theme-color`.
8. The JSON-LD blocks, last.

The icons come before the social tags for a practical reason: they are the
block that is identical on every page, so a diff that touches it is either a
rebrand or a mistake, and putting it where the eye expects makes that call
cheap.

## JSON-LD

```astro
---
// `<` is the one character that can close the script element from inside a
// JSON string, so every one is escaped before it reaches the template.
const blocks = (Array.isArray(jsonLd) ? jsonLd : [jsonLd])
  .map(block => JSON.stringify(block).replace(/</g, "\\u003c"));
---
{blocks.map(block => (
  <script type="application/ld+json" is:inline set:html={block} />
))}
```

Three facts hold this together:

- **`set:html` does not escape.** Astro's own reference says so outright: the
  value is injected as written, and trusting it is the caller's job. A
  product name or a description containing `</script>` is then not a typo but
  a script injection, which is why the `<` replacement is not optional
  and is not a style choice. JSON keeps the escape: `<` inside a JSON
  string parses back to `<`, so the structured data a crawler reads is
  unchanged.
- **Astro does not process a `<script>` carrying any attribute other than
  `src`**, so `type="application/ld+json"` already opts out of bundling.
- **`is:inline` is still written**, because these blocks are rendered
  conditionally — from a map over a possibly empty list — and Astro 5 stopped
  implicitly inlining conditionally rendered scripts. Without it the block is
  subject to the script pipeline it was never meant to enter.

## The sitemap, and `index: no`

The sitemap integration **cannot see a page's source** — Astro's integration
API gives it URLs, not modules — so nothing about a page's own frontmatter
can reach it. Its `filter` receives the full URL and returns whether to keep
it, which means the set of non-indexed routes has to be knowable from the
config side: a path prefix, a route list, or a query against the content
collection the pages are generated from.

That constraint is worth designing around rather than fighting. A product
whose non-public pages live under one prefix gets a one-line filter; a
product that sprinkles them gets a list in the config that some page will
eventually fall out of.

The page's own half is `<meta name="robots" content="noindex">`, emitted by
the layout when `index` is false. **Both halves, always.** A noindex page
listed in the sitemap is an invitation followed by a refusal — crawlers
report it, and the report is right. A page merely absent from the sitemap is
still indexed the moment anything links to it.

## The files under `public/`

Everything in `public/` is copied to the build output untouched, at the same
path, so these are the URLs the head above names:

```text
public/
  brand/favicon.svg          the mark; the SVG icon link, and the task's input
  brand/social-preview.png   1280x640; the default og:image
  favicon.ico                16/32/48 layers
  apple-touch-icon.png       180, full-bleed
  icon-192.png  icon-512.png the manifest's icons
  site.webmanifest           name, short name, start URL, display, colours
  robots.txt                 the crawl position, and the sitemap's absolute URL
```

None of it is landed by the pack: every file carries the product's own name,
colours or art, and none of that exists yet when the stack is pinned.
`/vwf:execute` writes them when it implements the work, from the head
doctrine — by which point the mark, the preview image and the theme colour
are brand assets the design system has already named.

`robots.txt` states the product's position **explicitly**, including on AI
training and agent access. An absent signal grants nothing and denies
nothing, and silence is the one answer that is never read the way it was
meant.

## The icons task

The pack lands one file: an `icons` task under the project's own task group,
rasterizing the whole set from the SVG mark. Run it by hand when the mark
changes — never in a gate, never in the build. It is a handful of runs in a
product's life, and a build step that shells out to a downloader is a build
that fails offline for no benefit.

Its two shapes are worth keeping when the task is edited. The rasterizer and
the ICO packer are **one-off tools, never repository dependencies**: a
dependency that exists for six runs is carried by the lockfile, the audit
and every upgrade forever. And it works in a **scratch directory**, so
nothing it installs resolves against the workspace and nothing it writes
survives except the icons.

The touch icon is squared before rasterizing. iOS masks the corners itself
and paints whatever is transparent black, so a rounded source arrives with a
dark frame around it — a defect that shows up only on a home screen, which is
the last place anybody looks.
