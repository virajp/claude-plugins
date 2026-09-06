# Testing an Astro project

The Astro layer on top of the language pack's Vitest reference. That file owns
the runner — config, `_testUtils/`, how suites are run. This one owns what
Astro adds.

## Two gates, and neither replaces the other

**`astro check`** is the type gate over `.astro` files. The baseline's `tsc`
pass does not read them, so a project running only `tsc` has its pages
unchecked — including every prop an island receives. Run both; `astro check`
belongs in the same task the baseline's type check runs in.

**Vitest** is the test runner. It does not render `.astro` files, and that is
the constraint the rest of this file is built around.

## What is tested, and in which environment

| Under test                          | Environment | Notes                          |
| ----------------------------------- | ----------- | ------------------------------ |
| `src/lib/` — logic, data, transforms | node        | the bulk of the suite          |
| Endpoints (`src/pages/**/*.ts`)     | node        | call the handler with a `Request` |
| Islands the repo writes             | jsdom       | Testing Library                |
| The CSR application                 | jsdom       | Testing Library, memory router |
| `.astro` pages and layouts          | —           | not unit-tested; see below     |

**Endpoints are plain functions.** An exported `GET` takes a context and
returns a `Response`; a test constructs the input, calls it, and asserts on
the status and the parsed body. No server is started.

**Islands are components.** Render with Testing Library, assert on what a user
sees, drive it through user events rather than by poking state. A component
that needs a provider in the application gets the same provider in the test.

**The CSR application's routes** are tested through React Router's
`createMemoryRouter` with `initialEntries` set to the path under test, wrapped
in `RouterProvider` and rendered with Testing Library. That exercises the
loader and the component together, which is the reason Data mode is the pick
([`csr.md`](csr.md)).

## The scoped include, and why `.astro` is excluded

Point coverage at what the tests can actually reach — `src/lib/`,
`src/components/` and the endpoints — and exclude `.astro` files and any
vendored UI primitives.

The exclusion is not a concession. Vitest cannot render an `.astro` file, so
including them measures a denominator the suite can never move; the number
falls as the site grows and says nothing about the project. Keeping a page
thin — frontmatter that calls `src/lib/` and markup that renders the result —
is what makes the untested surface genuinely trivial, and it is the discipline
this exclusion assumes.

**The coverage threshold is the repo's to set.** A bundle or a project may
require one; this pack states the include and leaves the number alone.

## What is not unit-tested

Rendering a whole page, the file router's URL mapping, `getStaticPaths`
enumeration and the deployed cache behaviour are all **build or end-to-end**
concerns. A build that fails is the first of those tests, and it runs on every
commit; the rest belong to whatever end-to-end suite the project runs against
a served build, not to Vitest.
