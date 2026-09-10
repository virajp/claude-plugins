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
  no error, no warning, just an absent file nobody looks for.
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

## What this component does not decide

The UI kit; the deploy target (the deploy-axis pin decides it, and the adapter
follows from it); the value of `site`; the content model's schemas. It decides
how Astro is used, never whether Astro is the answer.

Full judgment: the `astro` skill's references.
