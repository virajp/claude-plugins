# Astro — framework doctrine

The one artifact the `language-bundle` bar owes for this framework component:
what Astro is for, the four-mode decision in full, the routing model, and the
seam with the language pack.

**Every opinion below traces to a source**, in the bar's precedence order:
(1) the repo's settled pattern where one exists; (2) Astro's own documented
recommendation — Context7 `/withastro/docs`, read 2026-09-06; (3) a catalog
entry. Where the ecosystem is genuinely split, this file says so rather than
manufacturing consensus.

## What Astro is for

A **content-first web framework that owns the build.** Its default output is
HTML with no client JavaScript; interactivity is added per component, as an
island, and paid for explicitly. That default is the reason to pick it: a
content site built on a component framework ships a runtime on every page
whether or not any page needs one, and Astro inverts that.

It is the wrong pick when almost every page is interactive and the URL is the
application's state — that is an application, and the CSR shape below is
Astro hosting one rather than Astro doing the work.

**Selection is not this file's business.** The bundle a project pins decides
that Astro is the answer; this file decides how Astro is used once it is.

## The two config values

Everything else is built on these.

**`output`** takes `'static'` or `'server'`, and nothing else:

- `'static'` (the default) prerenders every route at build time. A route
  exporting `prerender = false` renders on demand instead — and the moment one
  does, an adapter is required.
- `'server'` renders every route on demand. A route exporting
  `prerender = true` is prerendered at build time instead. An adapter is
  always required.

`prerender` is a per-route `export` and takes a literal boolean. Astro 5
removed support for a computed value; a project needing the decision made
programmatically does it in an integration through the `astro:route:setup`
hook, not in the route.

**The adapter** is what teaches Astro to render on a particular server. It is
mandatory wherever a route renders on demand and pointless where none does.
Which adapter is the **deploy pairing's** call, not this pack's — see
[`ssr.md`](ssr.md).

`output: 'hybrid'` was a third value until Astro 5, which removed it and
merged its behaviour into `'static'`. Material written before that release
names a value the current config rejects.

## The four modes

| Mode   | `output`   | Adapter  | Default per route | Opt-out              |
| ------ | ---------- | -------- | ----------------- | -------------------- |
| SSG    | `static`   | none     | prerendered       | —                    |
| Hybrid | `static`   | required | prerendered       | `prerender = false`  |
| SSR    | `server`   | required | on demand         | `prerender = true`   |
| CSR    | `static`   | none     | prerendered shell | —                    |

SSG and CSR share a config and differ entirely in shape: CSR prerenders one
page, mounts the whole application into it as a `client:only` island, and lets
a client router own every URL below it. Hybrid and SSR share an adapter and
differ only in which way the default points.

**Deciding.** Take the routes the project actually has and ask what each one
needs at request time:

- None of them: **SSG**. Do not add an adapter to keep options open — an
  adapter with nothing on demand is a build-time dependency that pays for
  nothing and a deploy target that is harder than it needs to be.
- A handful of them, in a site that is mostly content: **Hybrid**. The default
  stays cheap and the exceptions are marked one route at a time.
- Most of them — a request header, a session, a datastore read that changes
  between requests: **SSR**. Marking the majority as exceptions is the same
  configuration written backwards.
- None of them, because the pages are not content and the browser holds the
  state: **CSR**.

A project moves between them by changing `output` and the adapter; no route
file changes except the `prerender` exports. That is what makes starting at
SSG safe.

## The routing model

**File routes.** A file under `src/pages/` is a route: `index.astro` is `/`,
`about.astro` is `/about`, `[slug].astro` a dynamic segment, and
`[...path].astro` a catch-all. A `.ts` file there is an **endpoint** — an
exported `GET`/`POST` returning a `Response`, which is how an Astro project
serves JSON, and which needs a server unless it is prerendered.

In `static` output a dynamic route must enumerate its pages through
`getStaticPaths`; in `server` output it does not. This is the one place where
changing `output` changes route code, and it is why a route that cannot
enumerate its parameters is an on-demand route by construction.

Middleware (`src/middleware.ts`) runs per request, so it exists only where
routes render on demand. Full detail:
[`content-and-routing.md`](content-and-routing.md).

## The seam with the language pack

Astro adds a file type and a build; it changes none of the baseline's rules.
`.astro` frontmatter is TypeScript and is held to them. The type gate over
`.astro` files is `astro check`, which the baseline's `tsc` pass cannot do —
both run, neither replaces the other.

The one deliberate divergence: `astro.config.*` reads environment-driven
values at module load, which is the composition root for the build. That is
the baseline's rule applied, not an exception to it.

Neighbours are named only through the capability vocabulary. This file does
not decide the UI kit, the datastore, the deploy target or the CI system, and
cross-framework integration judgment lives in the language pack's standards
reference — never here.
