# Astro — conventions

Astro layers **on top of** the TypeScript baseline rather than replacing it:
the baseline's rules — `strict`, the `@/` alias, one mapping home for errors,
config read once at the composition root, Vitest — apply to every `.ts` and
`.tsx` file the site holds. Astro adds the `.astro` component file, the file
router, content collections, and the build.

**Astro owns the build.** No other bundler config competes with it: a Vite
plugin a project needs goes inside Astro's `vite` block, never in a second
Vite config beside it.

## The four modes

Astro has exactly **two** `output` values. The four project shapes below are
decisions over those two values plus two more: whether an adapter is present,
and whether the pages are content or an application.

| Mode   | `output`   | Adapter  | Renders                                                    |
| ------ | ---------- | -------- | ---------------------------------------------------------- |
| SSG    | `static`   | none     | every route prerendered at build time                      |
| Hybrid | `static`   | required | prerendered by default; `prerender = false` opts a route in |
| SSR    | `server`   | required | on demand by default; `prerender = true` opts a route out  |
| CSR    | `static`   | none     | one prerendered shell; the app is a `client:only` island   |

**When each is the answer.** Nothing per-request: SSG. A content site with a
few request-time pages: Hybrid. Anything reading a request, a session or a
datastore on most routes: SSR. An application whose state lives in the browser
and whose pages are not content: CSR.

**Two honest notes.** `output: 'hybrid'` was a config value until Astro 5,
which removed it and merged its behaviour into `static` — material written
before that release names a value the current config rejects. And **CSR is a
shape, not a mode**: it is `static` output with one page, so nothing in the
config distinguishes it. What distinguishes it is the routing — the client
router owns the URL, and Astro's file router serves one shell to every path.

`prerender` is a per-route `export` and takes a literal `true` or `false`;
Astro 5 removed support for a computed value.

## Build output

**The build writes `./dist`** — Astro's `outDir` default — and a deploy pack
may rely on that path. It is the contract between the project axis and the
deploy axis: what a deploy target uploads, and where it looks for it.

A repo that changes `outDir` has changed that contract and must change its
deploy configuration in the same commit. Nothing detects the mismatch: a
deploy target pointed at a directory that no longer exists uploads nothing and
reports success.

What lands there differs by mode — files only for SSG and CSR; files plus the
adapter's server entry for Hybrid and SSR. Details, and the rule that a
post-build step writes **into** `dist/` rather than beside it, are the
`build-output` reference.

## Islands

**Zero JavaScript by default.** An `.astro` component renders to HTML at build
or request time and ships no client bundle. A UI-library component ships one
only when it carries a `client:*` directive, and each directive is a
deliberate cost paid for interactivity that HTML cannot give.

React is available in every Astro bundle this plugin offers, and is used only
where interactivity demands it. **A page with no island ships no JavaScript**
— that is the property the framework is chosen for, and a project that
hydrates every component has given it up without noticing.

## Four config facts, and the reasons for them

Measured against a proven static Astro site, not asserted:

- **`site` must be set.** Sitemap generation and canonical URLs are built from
  it. Without it a static build silently emits no sitemap and no canonical —
  no error, no warning, just an absent file nobody looks for. It is the one
  value the `## Head` section below cannot do without, and the head is the
  reason it is not optional.
- **`trailingSlash` is chosen to match the host**, not to taste. A static host
  that redirects the bare form to the slashed one (the common default) makes
  `"always"` the shape where an internal link never takes a redirect; a host
  with the opposite default inverts it. Choosing it independently of the host
  costs one redirect per navigation.
- **A Content-Security-Policy with no inline allowance forces two settings.**
  `style-src 'self'` admits no inline `<style>`, and Astro's default inlines a
  stylesheet under Vite's size limit — so `build.inlineStylesheets: "never"`.
  `script-src 'self'` needs the same on the script side, which is
  `vite.build.assetsInlineLimit: 0`. Set one and not the other and the build
  passes while the page fails in the browser.
- **A search index is built over `dist/` after the build**, as a second step
  in the build task, writing into the output directory. It is not an Astro
  integration and does not run at request time.

## Head

**One layout owns the head**, and every page passes it values — the title,
the one-sentence description, whether the page is offered to search, and
which picture a shared link shows. Those four are the per-screen contract the
blueprint pins; the layout declares them as props and decides none of them.
A second layout emitting its own tags is the failure this rule exists for: a
page whose description was written into its own markup is invisible to
everything that would check it.

Which pages get the full set is not Astro's decision. A site-shaped project
ships all of it; an application-shaped one ships the icons, the manifest and
the title unconditionally, and the search-facing half only when the project
declares that it means to be found. What the set contains — the canonical,
the icon links, the OpenGraph and twitter tags, the locale, the theme colour,
the JSON-LD with every `<` escaped — is the web-head contract, stated for
every framework rather than for this one.

Astro's own half of it:

- **The canonical is built, never typed.** `new URL(Astro.url.pathname,
  Astro.site)` is the whole of it, which is why `site` is mandatory above.
  Set `trailingSlash` before the first page ships: the canonical carries
  whichever form the config produces, and changing it later republishes every
  URL the product has.
- **The sitemap is the sitemap integration's**, and its `filter` is where a
  page pinned as not-indexed is excluded. The `<meta name="robots">` on the
  page is the other half, and neither alone is enough — a noindex page listed
  in the sitemap is an invitation followed by a refusal.
- **Static files live under `public/`**: the SVG mark, the rasterized icon
  set, the ICO, the web app manifest, `robots.txt` naming the sitemap by
  absolute URL, and the social-preview image. They carry the product's own
  name, colours and art, so the workflow writes them from the contract rather
  than a pack landing them.
- **The JSON-LD is inlined deliberately.** Serialize each block, escape every
  `<`, and emit it with `is:inline` and `set:html` — Astro must not process a
  script it did not author, and the escape is what keeps a product name
  containing an angle bracket from closing the element.
- **The icons task** is the pack's one landed file: it rasterizes the whole
  set from `public/brand/favicon.svg` with one-off tools and lands under the
  project's own task group. It is run by hand when the mark changes, never in
  a gate and never in the build.

Depth — the tag order this settles on, the escaping, and how `trailingSlash`
interacts with the canonical — is the `head` reference.

## What this component does not decide

The UI kit; **how styles are authored** — that is the project's own
`stylesheet` pin, a separate axis, and two projects on Astro routinely answer
it differently; the deploy target (the deploy-axis pin decides it, and the
adapter follows from it); the value of `site`; the words in the head; the
content model's schemas. It decides how Astro is used, never whether Astro is
the answer.

Full judgment: the `astro` skill's references.
