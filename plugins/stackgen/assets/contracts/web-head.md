# Web head — the metadata contract

What **any** web framework pack — shipped or generated — has to realize for a
project that the outside world reaches, stated without naming a framework.
The framework packs under `stacks/framework/` say how a particular one does
it; a generated framework component instantiates this contract at first fetch
and says, in its own conventions, where each item landed.

**Capability tokens realized here: none.** Nothing is minted here. What this
contract reads instead are tokens vwf already owns: the **platform** tokens
`site` and `webapp`, which say what kind of surface the project is, and the
**capability** token `seo`, which a `webapp` declares when it means to be
found. Blueprint prose calls the artifact **the head** and the images **the
brand assets**; no tag name belongs in a blueprint.

## The rule that outranks every other

**One layout owns the head, and every page passes it values.** Not a partial
per template, not a tag emitted from three places, not a framework helper
called wherever someone remembered.

This is what makes the head reviewable at all. A description written into one
page's markup is invisible to everything else: nothing can tell you which
pages have one, a rename of the product reaches only the pages someone
greps, and the first page that ships without a canonical is found by a search
engine rather than by a developer. One owner means the set of tags is a fact
about the project, the per-page values are an interface the layout declares,
and a page that omits a required value fails where the value is typed.

The corollary is that **every value in the head arrives as a prop or a
config read** — never as a literal inside the layout. The layout decides the
tags; it decides none of the words.

## The head set

What the one layout emits, for a page that is offered to the world:

1. **`<title>`**, and `og:title` carrying the same string.
2. **A description** — one sentence — as `<meta name="description">`,
   `og:description` and `twitter:description`.
3. **A canonical URL**, built from the project's configured site origin and
   the page's own route. Built, never typed: a canonical typed per page is a
   canonical that will point at a different page after a route rename.
4. **The icon links** — the SVG mark (`type="image/svg+xml"`), the ICO at
   `sizes="32x32"`, the apple-touch icon, and the web app manifest.
5. **The sitemap link**, `rel="sitemap"`, pointing at the generated index.
6. **The OpenGraph set** — `og:type`, `og:site_name`, `og:title`,
   `og:description`, `og:url` (the canonical), and `og:image` with its
   `og:image:width`, `og:image:height` and `og:image:alt`. The dimensions are
   part of the set, not decoration: a preview card that has to fetch the
   image to learn its shape renders a placeholder first, and some readers
   never come back for the second pass.
7. **The twitter set** — `twitter:card` as `summary_large_image`,
   `twitter:title`, `twitter:description`, `twitter:image`, and
   `twitter:site` naming the product's handle.
8. **`og:locale`**, the product's language and region.
9. **`theme-color`**, matching the manifest's.
10. **JSON-LD blocks** for the structured data a page carries, each one
    serialized into a `<script type="application/ld+json">`. **Every `<` in
    the serialized JSON is escaped** — it is the one character that can close
    the script element from inside a string, and a product name containing it
    is a script injection rather than a typo.

A `<meta charset>` and a viewport meta are the document's, not this set's:
every framework emits them and none of them is a per-page decision.

## Where each value comes from

Three sources, and the split is the point — a value in the wrong one is
either repeated on every page or missing from most of them.

- **Per screen**, from the screen's `Metadata` block in the blueprint's
  platform file: `title`, `description`, `index` and `image`. Those four and
  no others. A page's own words are the page's.
- **Product-wide text**, from the blueprint's conventions under its web
  metadata anchor: the site name (`og:site_name`), the default description a
  screen that pins none falls back to, the social handle (`twitter:site`),
  the locale, and the organisation facts the JSON-LD carries. Written once
  because they are true of every page.
- **Product-wide art**, from the design system's brand assets: the favicon
  source mark, the social-preview image at 1280×640, and the theme colour.
  They are named there because they are design decisions, and because the
  design system is where a rebrand is done.

`image: default` on a screen resolves to that social-preview image; a
`<slot>` names art the screen supplies of its own, and the project holds it
beside the default rather than inventing a second location.

## The gate — who ships what

- A **`site`** ships all of it, always.
- A **`webapp` declaring `seo`** ships all of it too.
- A **`webapp` not declaring `seo`** ships the icons, the manifest and
  `<title>` — and nothing else.

A `webapp` is an application behind a login far more often than it is a
surface a stranger lands on, and the SEO half of the set costs something
real when it is wrong: a canonical on an authenticated route, a description
of a screen nobody outside can reach, a sitemap advertising URLs that answer
403. The icons and the title are not part of that trade — a browser tab and
an installed icon are a product's face whether or not a crawler ever sees
the page — which is why they are unconditional.

`seo` is a **P** capability in vwf's vocabulary: the project declares it, and
this contract is what that declaration settles on the framework side.

## The files under `public/`

Static files the project serves from its web root. A pack **lands none of
them** — they carry the product's own name, colours and art, none of which
exists when a stack is pinned. They are written later, by the command that
implements the work, from this contract and from the brand assets the design
system names by then.

- **`robots.txt`** — naming the sitemap by absolute URL, and stating the
  product's crawl and AI-use position explicitly. An absent signal grants
  nothing and denies nothing; silence is the one answer that is never read
  the way it was meant.
- **The web app manifest** — the product name, a short name, the start URL,
  the display mode, the theme and background colours, and the 192 and 512
  icons with their sizes and type.
- **The icon set** — `favicon.ico` carrying the 16, 32 and 48 layers;
  `apple-touch-icon.png` at 180, **full-bleed**; `icon-192.png`;
  `icon-512.png`; and the SVG mark the rest are rasterized from. The touch
  icon is squared deliberately: iOS masks the corners itself and paints
  whatever is transparent black, so a rounded source arrives with a dark
  frame around it.
- **The social-preview image** at 1280×640, supplied by the product. The
  pack reserves the slot and never renders the art.

## The icons task

The project's task group gets an **`icons`** task that rasterizes the whole
set from the one SVG mark. It exists because the alternative is a set of
binaries that nobody can regenerate: a favicon committed without the command
that made it is a file that quietly stops matching the brand, and the person
who has to redo it starts by guessing the sizes.

Two rules on it:

- **Rasterizers are one-off tools, never repository dependencies.** The task
  is run by hand when the mark changes — a handful of times in a product's
  life — and a dependency that exists for that is a dependency the lockfile,
  the audit and the upgrade cadence all carry forever.
- **It runs from a scratch directory.** Nothing the task installs may resolve
  against the workspace, and nothing it writes may survive except the icons
  it was asked for.

## `index: no`

A screen pinning `index: no` is excluded from the outside twice, and both are
required:

1. The page carries `<meta name="robots" content="noindex">`.
2. The page is **excluded from the sitemap**, through whatever filter the
   framework's sitemap generation offers.

Either one alone is a half-measure that reads as a mistake: a noindex page
listed in a sitemap is an explicit invitation followed by an explicit
refusal, and a page merely absent from the sitemap is still indexed the
moment anything links to it.

## What a generated framework pack must instantiate

A component resolved through the generator rather than a shipped pack
satisfies this contract by writing, into its own conventions:

- **Which file is the one layout**, and the shape of the props it takes —
  the four per-screen fields, by those names.
- **Where the site origin is configured**, and how the canonical is derived
  from it. Naming the config key is not optional: a framework that silently
  emits no canonical and no sitemap when the origin is unset fails in the
  one direction nobody checks.
- **How the sitemap is generated**, and how `index: no` reaches its filter.
- **The `public/` root's real path** in that framework, since the name
  differs across them.
- **The `icons` task**, under the project's task group, meeting the two
  rules above.

A clause the framework cannot satisfy is **stated as such** in the pack's
own conventions, never omitted.

## What this contract does not decide

- **Which framework.** That is the project axis's pin; every framework that
  serves a `site` or an `seo` `webapp` answers this the same way.
- **The words.** Titles, descriptions and organisation facts are the
  blueprint's, per screen and per product — this contract says where they are
  read from, never what they say.
- **The art.** The mark, the preview image and the theme colour are the
  design system's brand assets.
- **Analytics, consent banners and third-party tags.** They are a product
  decision with their own privacy consequences, and a head contract that
  quietly made room for them would be deciding it.
