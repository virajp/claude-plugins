# Content and routing

The file router, content collections, markdown transforms, and the `src/`
layout. These are the same in all four modes except where noted.

## `src/` layout

| Directory         | Holds                                                     |
| ----------------- | --------------------------------------------------------- |
| `src/pages/`      | routes — one file, one URL. Nothing else lives here       |
| `src/layouts/`    | page shells: `<head>`, navigation, the slot               |
| `src/components/` | `.astro` components and framework islands                 |
| `src/content/`    | content collections and their schema definition           |
| `src/lib/`        | plain TypeScript — data access, transforms, helpers       |

`src/pages/` is a router, not a source directory: a helper file dropped there
becomes a route. Put it in `src/lib/`.

**`src/lib/` is where testable logic goes.** A page that computes in its
frontmatter is a page that cannot be unit-tested — the frontmatter calls
`src/lib/`, and the tests are on `src/lib/` ([`testing.md`](testing.md)).

## File routes

- `index.astro` → `/`, `about.astro` → `/about`.
- `[slug].astro` → one dynamic segment, available as `Astro.params.slug`.
- `[...path].astro` → a catch-all, matching any depth. This is the route the
  CSR shape depends on ([`csr.md`](csr.md)) and the last one the router tries.
- A `.ts` file exporting `GET`, `POST` and so on is an **endpoint** returning
  a `Response`.

**In `static` output a dynamic route must enumerate its pages** through
`getStaticPaths`, which returns the parameter sets and the build renders one
file per entry. In `server` output it does not — the parameters come from the
request. This is the one routing difference between the modes, and a route
that cannot enumerate its parameters is by construction an on-demand route.

Static endpoints work the same way: prerendered, so the body is fixed at build
time. An endpoint that must read the request needs `prerender = false` and an
adapter.

## Content collections

A collection is a set of files with a **loader** and a **schema**, declared
once in `src/content.config.ts`:

```typescript
import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const docs = defineCollection({
  loader: glob({ pattern: "**/[^_]*.md", base: "./src/content/docs" }),
  schema: z.object({
    title: z.string(),
    published: z.date(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { docs };
```

**The schema is the contract, and it is enforced at build time.** An entry
missing a required field fails the build with the file named — which is the
whole reason to use a collection rather than reading a directory. Every field
a template renders is in the schema; a field that is optional in the schema is
handled in the template.

Entries are queried with `getCollection` and rendered through the entry's own
render. A collection is not a database: filtering and sorting happen in
`src/lib/` over the returned array, at build time.

`_`-prefixed files are excluded by the glob pattern above, which is how a
partial or a draft lives beside the content without becoming an entry.

## Markdown transforms

Markdown is processed at **build time** through remark and rehype plugins
configured in `astro.config`. A local plugin is the right tool for a
repo-specific rule over the whole content set — rewriting relative links to
routes, checking that a cross-reference resolves — and the strongest version
of such a plugin **fails the build** on a violation rather than repairing it
silently.

Heading id generation is Astro's default and is GitHub-compatible. Changing it
breaks every existing anchor link, including external ones; treat it as a
published contract.

Syntax highlighting also runs at build time, so a code block ships as styled
markup with no client-side highlighter.

## Middleware

`src/middleware.ts` runs per request and therefore exists only where routes
render on demand — Hybrid and SSR. It sees both the request and the eventual
response, which makes it the one home for cache policy ([`ssr.md`](ssr.md)).
An SSG or CSR project has no middleware, and adding one is a signal the mode
was decided wrong.
