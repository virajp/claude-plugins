# CSR — a browser-routed application in an Astro shell

`output: 'static'`, **no adapter**. The config is SSG's; the shape is not.
Astro prerenders a shell page, the application mounts into it as a
`client:only` island, and a client router owns every URL below it.

**CSR is a shape, not a mode.** Nothing in `astro.config` distinguishes it
from SSG — which is the first thing to know when reading such a project, and
the reason this reference exists.

## The shape

**One shell page**, `src/pages/index.astro`, rendering the application root:

```astro
---
import App from "../app/App";
---
<Layout>
  <App client:only="react" />
</Layout>
```

`client:only` skips server rendering entirely: Astro does not run the
component at build time, and the framework name is a required literal because
Astro has no other way to know which client runtime to load.

**A catch-all**, `src/pages/[...path].astro`, rendering the same shell. Astro
prerenders it, so every path the build knows about — and, through the host's
fallback, every path it does not — serves the shell, and the client router
takes over from there. Without it, a deep link is a 404 before any JavaScript
runs.

**The host's not-found handling switched to single-page-application mode.**
The Workers Static Assets deploy pack ships `not_found_handling: "404-page"`,
which is right for SSG and wrong here: it serves `404.html` for an unmatched
path instead of the shell. A CSR project flips that setting to the
single-page-application value, which serves the shell for anything unmatched.
This is the one deploy-config change the CSR shape requires, and the deploy
pack owns the file it lives in.

## The router

**React Router in Data mode** — `createBrowserRouter` plus `RouterProvider`
— inside the island. Routes are objects with `loader` and `action`; in a
client-only application those are `clientLoader` and `clientAction`, and they
run in the browser.

```tsx
const router = createBrowserRouter([
  { path: "/", Component: Home },
  { path: "/items/:id", Component: Item, loader: itemLoader },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
```

**Why Data and not Declarative.** Declarative mode (`<BrowserRouter>`) is the
smaller API, but its routes do not participate in loaders, actions or route
code splitting — data fetching lives in effects inside components, and moving
to loaders later is a rewrite of every route. Data mode is the same component
tree with the fetch hoisted out of it.

**Why not Framework mode.** It owns the Vite build — its own plugin, its own
build output, its own type generation. Astro owns this build. Two frameworks
cannot both own it, and a project that wants React Router's framework mode
wants React Router, not Astro.

**The swap: TanStack Router**, when the URL is genuinely the application's
state — typed search parameters validated by a schema, inferred parameter
types, loaders with caching built in. What it costs inside Astro: its Vite
plugin goes inside Astro's `vite.plugins` and must be ordered before the React
plugin, and file-based routing generates a `routeTree.gen.ts` that is a build
artifact living in the source tree. Code-based routing avoids the plugin and
the generated file, at the cost of the file-based ergonomics that are the
reason to pick it. Decide once, at the start; both routers are a rewrite away
from each other.

Router facts above are Context7 `/websites/reactrouter` and
`/tanstack/router`, read 2026-09-06.

## What `<ClientRouter />` is not

Astro's `<ClientRouter />` from `astro:transitions` animates navigation
**between prerendered pages** — it is view transitions over the file router,
not client-side application routing, and it has no loaders, no route objects
and no shared state across a navigation. It belongs to SSG and Hybrid sites.
Do not add it to a CSR project: there is one page.

## What CSR gives up

Prerendered content. The shell has no meaningful HTML, so search engines and
link previews see an empty page, and the first paint waits for the bundle. If
any part of the product is content that must be indexed — marketing, docs, a
blog — put it in real Astro pages beside the application rather than inside
the island. That is a CSR application in an otherwise static site, and it is
the common honest answer.

## Everything else

`site`, `trailingSlash`, the CSP-forced inlining settings and `dist` are
SSG's ([`ssg.md`](ssg.md), [`build-output.md`](build-output.md)) and apply
unchanged. There is no adapter, no middleware and no server endpoint: an API
this application calls belongs to a service on another axis.
