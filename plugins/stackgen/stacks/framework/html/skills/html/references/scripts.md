# Scripts

What a page may load, in what form, and what a script may import. The
language pack's standards own how TypeScript is written; this owns the seam
between a page and its behaviour.

## ES modules, and one tag per page

A page loads its behaviour with one tag, at the end of the head:

```html
<script type="module" src="/js/home.js"></script>
```

The module imports what it needs by relative path, and Vite bundles the
graph reachable from that tag — one entry per page, shared modules
deduplicated across pages by the build. That is the whole loading model:

- **No classic scripts.** A `<script>` without `type="module"` is a global,
  executes in order with every other one, and is not bundled — it is served
  as written and ships whatever it imports as separate requests, if it can
  import at all.
- **No inline scripts, no inline handlers.** `onclick="…"` and a `<script>`
  with a body are the two forms a content-security policy with no inline
  allowance refuses, and they are also the two forms that cannot be read
  beside the rest of the page's behaviour. A page's behaviour is its module,
  and the module is a file.
- **One module per page**, named for the page. Shared behaviour is a module
  both import, not a second tag.

The JSON-LD block is the one `<script>` that is not a module, and it is
data, not behaviour — the head reference owns it.

## `.js` by default, `.ts` allowed

**Plain `.js` is the default.** A site's behaviour is usually a few dozen
lines — a menu toggle, a copy button, a form's client-side check — and a
type pass over that buys nothing a reviewer does not see at a glance. The
file is an ES module, `strict` by construction, and the baseline's rules on
naming, placement and one mapping home for errors apply to it as they would
to any file.

**`.ts` is allowed, not required.** The language pin is TypeScript and Vite
compiles a `.ts` module with no configuration, so a page may load
`/js/<name>.ts` directly and the build emits JavaScript. Reach for it when
a module grows past the glance — a script that models state, talks to an
API, or is imported by several pages — and hold it to the baseline's `tsc`
pass, which is unchanged: there is no second checker because there is no
second file type.

**Under the copy-only opt-out there is no `.ts`.** Nothing compiles it, so
every script is `.js` and every import is one the browser resolves itself.
A repo that has opted out and finds itself wanting types has found the edge
of the opt-out.

## What may be imported

Imports stay within what the browser and Vite both resolve:

- **Relative paths** between modules under `src/js/` — `./menu.js`.
- **Bare package names**, which Vite resolves from `node_modules` and
  bundles. A dependency added for a script is a `dependencies` entry in the
  project's manifest, subject to the package-manager component's hygiene,
  and the reputation check every name in this plugin's generated output
  goes through applies to one typed by hand too.
- **Vite's own asset forms** — importing an image for its built URL, or a
  file with `?raw` — where the reference must survive hashing. Nothing
  else that is bundler-specific: no aliases the browser cannot follow, no
  virtual modules, no plugin-provided import syntax.

**Under the copy-only opt-out, only the first of those exists.** A bare
import fails in the browser, and an asset form is a string the browser
reads literally. The list is stated so the opt-out's cost is visible from
the script side too.

## What is not here

A component model, a state library, a client router — each is an
application's need, and an application is a different platform token and a
different bundle. A `js/` directory that is growing a router is the signal
the framework doctrine names.
