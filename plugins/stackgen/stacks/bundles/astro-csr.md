---
name: Astro (CSR)
axis: project
kind: language-bundle
components:
- language/typescript@0.1.0
- package-manager/pnpm@0.1.0
- toolchain-gate/tsconfig@0.1.0
- toolchain-gate/eslint@0.1.0
- framework/astro@0.1.0
- framework/react@generated
platforms:
- site
---

# site — Astro (CSR)

An **app whose state lives in the browser**: a dashboard, a console, an editor,
anything where navigation is a state change rather than a page. The server
serves **one shell**, and everything after the first paint is the client's —
routing, data fetching, and rendering all happen there.

**CSR is a shape, not an Astro mode.** The build is `output: "static"`, exactly
as [`astro-ssg`](astro-ssg.md), and what makes it an app is what the shell
contains: a component mounted `client:only`, which Astro never renders on the
server at all. The pack's `csr.md` carries the reasoning; what this bundle pins
is that shape. Its siblings pin the others — [`astro-ssg`](astro-ssg.md) for
pages that are content, [`astro-hybrid`](astro-hybrid.md) for content with a
few on-demand routes, [`astro-ssr`](astro-ssr.md) for a site rendered per
request.

**Take this only when the browser really is where the state lives.** The cost
is paid on the first paint and it is not refundable: the shell arrives empty,
the bundle downloads, and only then is there a page. A content surface pays
that for nothing, and search engines see the shell —
[`astro-ssg`](astro-ssg.md) is the right bundle for anything a stranger is
meant to land on from a search result.

A `site` calls someone else's API rather than publishing its own; here it calls
it **from the browser**, so every call is public and the API's own
authorization is the only thing standing behind it. A project that owns an API
contract is `fullstack` instead.

This doc covers the **project axis** only; backing services and deploy target
are their own axes.

## Stack

- **Framework**: Astro on `output: "static"`, no adapter. Two pages carry the
  whole app: the shell at the root, and a **catch-all route** that renders the
  same shell, so a deep link opens the app instead of a 404 before the router
  has ever run.
- **The app is one `client:only="react"` island.** `client:only` skips server
  rendering entirely, which is what makes browser-only code — `window`,
  storage, anything reading the DOM at import time — safe here and unsafe on
  every other Astro bundle. The framework name in the directive is required;
  Astro cannot infer it when it never renders the component.
- **Routing: React Router in Data mode** — routes as objects passed to
  `createBrowserRouter`, rendered by `RouterProvider`, with each route's
  `loader` and `action` running in the browser. Data mode is the one that gives
  loaders, actions and per-route code splitting while leaving the build alone,
  which is the constraint here: Astro owns the build, so a router that wants to
  own it is not available. (`clientLoader`/`clientAction` are Framework mode's
  SPA spelling and do not apply inside an island.)
- **The swap is TanStack Router**, when the URL *is* the app's state — typed
  and validated search params, inferred params and loader data are its reason
  to exist, and a filter-heavy console is where that pays. Its cost inside
  Astro is concrete: file-based routing means a second Vite plugin inside
  Astro's own, ordered before the React plugin, and a generated
  `routeTree.gen.ts` in the tree. Code-based routing needs no plugin and avoids
  both. Pick one router and keep it; the two are not layered.
- **UI**: the repo's call. The shadcn-style set [`astro-ssr`](astro-ssr.md)
  names — Radix UI primitives with Tailwind CSS — is one good option here and
  not a decision this bundle makes.
- **Layout**: `src/pages/` (the shell and the catch-all only), `src/app/` (the
  router, its routes and their loaders), `src/components/`, `src/lib/` (the API
  client and pure helpers).
- **Config**: everything is a **build**-time value that reaches the browser.
  There are no secrets in this project; an API base URL is public and a token
  is a defect.

## Build output and deploy

The build leaves **a directory of files at `./dist`** — the `## Build output`
fact in the `framework/astro` pack's conventions, which is what a deploy pack's
asset directory cites rather than guessing.

**Pair with `cloudflare-workers-static`**, with one change from the
[`astro-ssg`](astro-ssg.md) pairing: the host's **not-found handling is set to
single-page-application mode**, so a path no file matches serves the shell
instead of a 404 page and the router resolves it. The catch-all page and that
setting are the same requirement approached from the two ends; a deploy that
keeps the default 404 behaviour breaks every deep link, and it breaks it only
in production.

## Testing

**jsdom + Testing Library** is the default environment, not the exception — in
this bundle every component is a client component. Route-level tests run the
real router through `createMemoryRouter`, which is what exercises loaders,
actions and error elements without a browser; a component tested outside its
route proves less than it looks like it does. Scope the coverage include to
`app/`, `components/` and `lib/`, excluding the `.astro` shells, which hold no
logic; the repo sets the threshold.
