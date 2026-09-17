# Pages and navigation

Adding a page, linking between pages, and the not-found page. The one rule
that matters most is first.

## A page is added in two places

The file under `src/`, and its line in the `input` map of `vite.config.ts`:

```ts
input: {
  index: resolve(import.meta.dirname, "src/index.html"),
  about: resolve(import.meta.dirname, "src/about.html"),
  docs: resolve(import.meta.dirname, "src/docs/index.html"),
  notFound: resolve(import.meta.dirname, "src/404.html"),
},
```

Vite's documentation on multi-page apps says why both are needed: in
development a nested page is served by its path, as a static file server
would, so a new file works the moment it is saved — but the production
build takes its page list from `input`, and a page missing from it is
simply not emitted. No warning is raised, because as far as the build is
concerned the file is not a page. The failure shows up as a 404 in
production that development never produced.

Two facts about that map, both from the same documentation:

- **The keys are names, not paths.** The build ignores the key when
  deciding where an HTML entry lands and uses the resolved file path
  instead, so `dist/` mirrors `src/`: `src/docs/index.html` becomes
  `dist/docs/index.html` whatever it was called in the map. Name the keys
  for readability and nothing else.
- **The values are resolved from the config file's directory, not from
  `root`.** Because the root is `src`, every value carries the `src/`
  prefix. A value without it resolves to a file beside the config, which
  does not exist, and the build fails naming it — the loud failure, and the
  better one.

**`input` is the top-level option in Vite 8.** The form older material
shows, `build.rollupOptions.input`, is deprecated in that major (the
bundler under Vite is Rolldown, and the key was renamed with it); it still
works, and it is not written here because a deprecated key is a migration
waiting to happen.

## URLs, and links between pages

The URL is the file path under `src/`, and nothing rewrites it:

| File                   | URL             |
| ---------------------- | --------------- |
| `src/index.html`       | `/`             |
| `src/about.html`       | `/about.html`   |
| `src/docs/index.html`  | `/docs/`        |
| `src/docs/setup.html`  | `/docs/setup.html` |

**Links are root-absolute**, `/about.html` and `/docs/`, never relative.
A relative link is correct from the page it was written on and wrong from
the page that copies its navigation, and every page copies its navigation.
Root-absolute is also the form Vite requires for anything under `public/` —
its documentation states that a `public/` asset is always referenced by
root-absolute path — so one rule covers both.

**Pick one URL shape and hold it.** Either every page is `<name>.html`, or
every page is `<name>/index.html` served at `<name>/`. The second is the
cleaner URL and costs a directory per page; the first is one file per page
and shows the extension. Mixing them produces a site where half the links
carry `.html` and half do not, and a static host's trailing-slash handling
then decides which ones redirect. The choice is the repo's and is recorded
in its own conventions; what this pack rules is that it is made once.

**A canonical is typed per page** and must match the URL shape above
exactly — the head reference owns it, and the URL-shape decision here is
what it depends on.

## The not-found page

`src/404.html` is a page like any other, listed in `input`, carrying the
full head with `<meta name="robots" content="noindex">` and left out of the
sitemap. It is served **by the host, by name**: a static host that serves a
directory looks for `404.html` at the root when a path resolves to nothing,
and the deploy pack for that host states whether and how. Vite's dev server
does not serve it for a missing path — it returns its own not-found — so the
page is checked by opening `/404.html` directly, and its production
behaviour is the host's to prove.

Nothing else is special about it. It links home with the same root-absolute
link every page uses, and it validates with the rest.

## What this reference does not cover

The head each page carries is [`head.md`](head.md); what the build does to
the tree is [`build-output.md`](build-output.md); a script a page loads is
[`scripts.md`](scripts.md). Where the site's pages come from — which pages
exist, what they say — is the blueprint's, per screen.
