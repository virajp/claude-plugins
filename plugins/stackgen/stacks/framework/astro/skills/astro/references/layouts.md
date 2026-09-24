# Layouts and slots

How an Astro project composes a page: the layout that is the shell, the page
that is the route, and the slots that join them. The `src/` table in
[`content-and-routing.md`](content-and-routing.md) names the two directories;
this says what goes in each and why the line sits where it does.

**Layouts and slots behave identically in SSG, Hybrid, SSR and CSR** — there
is no mode delta here, so this file has no per-mode section.

## The split: a layout is the shell, a page is the route

A **layout** is an ordinary `.astro` component under `src/layouts/` that
renders the document around a page: `<html>`, `<head>`, the navigation, the
footer, and a slot where the page goes. A **page** under `src/pages/` is one
URL: it fetches or enumerates what that URL shows, decides the values the
head needs, and renders its content inside a layout.

Each side of the line prevents one failure.

- **Nothing page-specific in a layout.** A layout that branches on the
  current path — a different header for `/blog`, an extra script for one
  route — has become a router nobody can see. Each branch is a page's
  decision hidden in a shared file, and the next page that needs a variant
  adds another. When two groups of pages genuinely differ, that is two
  layouts (see *Nesting* below), not a conditional in one.
- **No document shell in a page.** A page that writes its own `<html>` or
  `<head>` has left the shell, and with it everything the shell guarantees —
  the head contract, the navigation, the stylesheet order. It renders fine,
  which is why nobody notices until a search result or a shared link shows
  it without a description.

A layout takes **props** for the values it cannot decide and **slots** for
the markup it cannot decide. Data fetching stays in the page, or in
`src/lib/` where it can be tested; a layout that calls `getCollection` has
coupled every page it wraps to one content model.

## Slots

A slot is where a component renders the children it was given. Three forms
cover everything a layout needs.

**The default slot.** An unnamed `<slot />` receives every child that names
no slot. It is where the page's content goes, and every layout has exactly
one.

```astro
---
// src/layouts/Base.astro
---
<html lang="en">
  <head><!-- the head contract, from props --></head>
  <body>
    <header><!-- navigation --></header>
    <main><slot /></main>
    <footer><!-- footer --></footer>
  </body>
</html>
```

**Named slots.** `<slot name="aside" />` receives only the children that
carry `slot="aside"`. The attribute must sit on an **immediate child** of the
component — a `slot` attribute on an element nested inside another is ignored
and its content falls into the default slot. To pass several siblings to one
named slot without a wrapping element, put `slot` on a `<Fragment>`. A slot
name is a literal: it cannot be computed in a `map`.

```astro
---
import Docs from "@/layouts/Docs.astro";
---
<Docs title="Install" description="Install the CLI and run it once.">
  <Fragment slot="aside">
    <a href="#requirements">Requirements</a>
    <a href="#first-run">First run</a>
  </Fragment>
  <h1>Install</h1>
  <p>…</p>
</Docs>
```

**Fallback content.** Children written inside the `<slot>` element render
only when nothing was passed to it. Use it for the region most pages leave to
the layout — a default sidebar, a standard footer note — so a page overrides
it by passing content and otherwise says nothing.

```astro
<aside>
  <slot name="aside">
    <nav><!-- the section's default table of contents --></nav>
  </slot>
</aside>
```

When the wrapper itself should disappear with no content — an `<aside>` that
must not render empty — test with `Astro.slots.has("aside")` and render the
wrapper only when it returns true. Fallback content and that test answer
different questions: the first says what to show instead, the second says
whether to show the region at all.

**Prefer a prop to a slot for a value; prefer a slot to a prop for markup.**
A title is a string and belongs in a typed prop, where `astro check` catches
a missing one. A block of links is markup and belongs in a slot; a prop
carrying HTML is an escaping bug waiting for its first angle bracket.

## Props, and the head contract

A layout declares its props in a `Props` interface in its frontmatter, and
that interface is the layout's contract with every page: required fields are
the ones no page may omit, optional fields carry a default that is right for
almost every page.

The head is the pack's one fixed instance of this shape. `conventions.md`'s
`## Head` rules that **one layout owns the head**, that every page passes it
the title, the description, whether the page is offered to search, and the
shared-link image, and that a second layout emitting its own head tags is the
failure the rule exists for. The typed interface and its defaults are in
[`head.md`](head.md). Everything in this file is the general mechanism that
rule is built on; nothing here overrides it.

One consequence worth stating: **the head is not a slot.** A named slot
inside `<head>` lets any page inject any tag, which is a second head emitter
with extra steps — the very failure the contract rules out. The four values
travel as props. A tag the contract does not cover and a page genuinely
needs is a new optional prop on the owning layout, decided once, not a slot
every page may write into.

## Nesting layouts

A layout may render inside another. It earns its place when a **group** of
pages shares structure the rest of the site does not — a docs section with a
sidebar and a table of contents, a blog post with a byline — and the
alternative would be copying that structure into each page or branching on
the path inside the base layout.

```astro
---
// src/layouts/Docs.astro
import Base from "@/layouts/Base.astro";
import type { ComponentProps } from "astro/types";

type Props = ComponentProps<typeof Base>;
---
<Base {...Astro.props}>
  <div class="docs">
    <aside><slot name="aside" /></aside>
    <article><slot /></article>
  </div>
</Base>
```

**The head rule constrains nesting, and it is the only constraint.** Only
the outermost layout emits `<head>`; an inner layout never does. An inner
layout takes the head values as props and passes them straight through, so a
page wrapped in `Docs` states its title exactly as a page wrapped in `Base`
does — deriving `Docs`'s props from `Base`'s, as above, keeps the two from
drifting. An inner layout that needs to forward a named slot to its parent
writes `<slot name="x" slot="x" />`, which receives the page's content for
`x` and hands it on.

Two levels covers almost every site. A third level is usually a component
that has been filed as a layout — if it renders no shell of its own, it
belongs in `src/components/`.

## Layouts for markdown and content collections

Markdown reaches a layout two ways, and they are not interchangeable.

**The frontmatter `layout` key** applies only to a `.md` or `.mdx` file
**routed directly from `src/pages/`**. Astro renders the file into the named
layout's default slot and passes the parsed frontmatter as a `frontmatter`
prop. The key is **not** recognised on a content collection entry — it is
ordinary data there, and setting it does nothing.

**A collection entry is rendered by a page.** The page enumerates the entries,
renders one with `render()` from `astro:content`, and places the resulting
`Content` component inside a layout, passing the head values from the
entry's schema-checked data.

```astro
---
// src/pages/docs/[...id].astro
import { getCollection, render } from "astro:content";
import Docs from "@/layouts/Docs.astro";

export async function getStaticPaths() {
  const docs = await getCollection("docs");
  return docs.map((entry) => ({
    params: { id: entry.id },
    props: { entry },
  }));
}

const { entry } = Astro.props;
const { Content } = await render(entry);
---
<Docs title={entry.data.title} description={entry.data.description}>
  <Content />
</Docs>
```

**The pack prefers the collection route.** Content that has a layout almost
always has a shape, and the collection's schema is what makes that shape a
contract enforced at build time — a missing description fails the build with
the file named. A routed markdown page with a frontmatter `layout` has no
schema: its layout receives an untyped `frontmatter` object, and a page that
forgot its description renders an empty tag. The frontmatter key remains
fine for the odd standalone page — a changelog, a legal notice — where a
collection would be ceremony; the moment there are two pages of one kind,
they are a collection.

The `getStaticPaths` above is the static form. Where the route renders on
demand there is no `getStaticPaths`: the route parameters come from the
request, as [`content-and-routing.md`](content-and-routing.md) describes, and
the page finds the entry from them. The layout it lands in, and everything in
this file, is unchanged.

## What this does not decide

The UI kit a layout's navigation and footer are built from, and **how the
styles are authored** — the project's own `stylesheet` pin, a separate axis.
The words in the head, which are the blueprint's per-screen contract. The
content model's schemas. Which groups of pages a product has, and so which
inner layouts it needs — that follows from the product, not from Astro.
