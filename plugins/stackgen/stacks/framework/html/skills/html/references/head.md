# Head

How a hand-authored page tree realizes the web-head contract: per page,
with no layout to own it. The contract says *what* a page has to state about
itself; this says how a page states it when nothing but the page can.

## No layout, so the checklist is the contract

The contract's first rule is that one layout owns the head and every page
passes it values. **This component has no layout**, and it does not fake
one: an include mechanism would be a template language, and the framework
doctrine says why that is refused. So the rule is met per page, and stated
as such rather than omitted — every page carries its full head, in the
order below, and the checklist is what a layout's typed props would have
been.

What that costs, honestly: a product renaming itself edits every page; a
tag added to the set is added to every page; and nothing typed catches a
page that dropped a line. `html-validate` catches the malformed half — a
missing `<title>`, a missing `lang`, an unclosed element — and a review
against this checklist catches the rest. A site where that review is no
longer cheap has outgrown the pack.

## The checklist, in order

Order is not semantics — a browser reads the whole head — but it is
reviewability, and one order consistently applied is what makes a missing
tag visible in a diff between two pages:

1. `<meta charset="utf-8">`, then the viewport meta.
2. `<title>`, then `<meta name="description">` — the page's own words.
3. **The canonical**, as an absolute URL, typed by hand.
4. The icon links — the SVG mark at `/brand/favicon.svg` with
   `type="image/svg+xml"`, `/favicon.ico` at `sizes="32x32"`,
   `/apple-touch-icon.png` — then `/site.webmanifest`, then
   `rel="sitemap"` pointing at `/sitemap.xml`.
5. Any `rel="alternate"` the page offers.
6. The OpenGraph set — `og:type`, `og:site_name`, `og:title`,
   `og:description`, `og:url` (the canonical again), `og:image` with its
   width, height and alt — then the twitter set, then `og:locale`.
7. `theme-color`, matching the manifest's.
8. The JSON-LD blocks, last.
9. The stylesheet links, then the one `<script type="module">`.

The icons come before the social tags because they are the block that is
identical on every page, so a diff that touches it is either a rebrand or a
mistake, and putting it where the eye expects makes that call cheap.

A page pinned `index: no` adds `<meta name="robots" content="noindex">`
after the description, and is left out of the sitemap — both, always.

## The canonical is typed, and one constant keeps it honest

There is no config read and no build to derive a canonical from, so the
contract's "built, never typed" clause cannot be met and is stated as such.
What stands in for it:

- `vite.config.ts` exports one constant, `SITE_ORIGIN`. Nothing reads it at
  build. It exists so the origin is written in exactly one place a review
  can compare every page against.
- Every canonical is `SITE_ORIGIN` plus the page's URL, in the URL shape the
  pages-and-navigation reference settled — `.html` or trailing slash, never
  both — and `og:url` repeats it.
- **A page that moves rewrites its own canonical in the same commit.** The
  failure a built canonical prevents, a canonical pointing at a page's old
  URL after a rename, is exactly the failure a typed one invites, and the
  commit discipline is the only guard.

## JSON-LD

Serialized by hand into `<script type="application/ld+json">`, and **every
`<` in the JSON is written as `\u003c`**. It is the one character that can
close the script element from inside a JSON string, and a product name or
description containing `</script>` is then a script injection rather than a
typo. JSON keeps the escape: `\u003c` parses back to `<`, so what a crawler
reads is unchanged. There is no framework here to do the escaping, so it
is done in the editor, and a review greps the page for a raw `<` inside
the block.

## The sitemap and `robots.txt` are hand-authored

**`public/sitemap.xml`** carries one `<url>` per page offered to search,
each `<loc>` an absolute URL in the same shape as its page's canonical. No
build step owns page discovery in this component, so nothing can generate
it, and the honest statement is that it is maintained by hand beside the
page list in `vite.config.ts`: a page added there is added here unless it is
pinned `index: no`. The two lists drifting is the failure to watch for, and
a review that adds a page checks both.

**`public/robots.txt`** names the sitemap by absolute URL and states the
product's crawl and AI-use position **explicitly**. An absent signal grants
nothing and denies nothing, and silence is the one answer that is never
read the way it was meant.

## The files under `public/`

`public/` sits beside `src/` and is copied to the build's root untouched, at
the same path, so these are the URLs the head above names:

```text
public/
  brand/favicon.svg          the mark; the SVG icon link, and the task's input
  brand/social-preview.png   1280x640; the default og:image
  favicon.ico                16/32/48 layers
  apple-touch-icon.png       180, full-bleed
  icon-192.png  icon-512.png the manifest's icons
  site.webmanifest           name, short name, start URL, display, colours
  robots.txt                 the crawl position, and the sitemap's absolute URL
  sitemap.xml                one <url> per indexed page
```

None of it is landed by the pack: every file carries the product's own name,
colours or art, and none of that exists yet when the stack is pinned.
`/vwf:execute` writes them when it implements the work, from the head
doctrine — by which point the mark, the preview image and the theme colour
are brand assets the design system has already named.

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
