# U2 — Four Astro bundles: SSG, SSR (renamed), Hybrid, CSR

- **Wave:** 1
- **Depends on:** —
- **Owns:** `plugins/stackgen/stacks/bundles/typescript-astro-react.md` (to be
  `git mv`'d to `astro-ssr.md`), `plugins/stackgen/stacks/bundles/astro-ssr.md`,
  `plugins/stackgen/stacks/bundles/astro-ssg.md` (new),
  `plugins/stackgen/stacks/bundles/astro-hybrid.md` (new),
  `plugins/stackgen/stacks/bundles/astro-csr.md` (new). Touch nothing outside
  this list — no other bundle, no pack.
- **Model:** inherit
- **Read first:** `plugins/stackgen/stacks/bundles/typescript-astro-react.md`
  top to bottom; `typescript-parseargs-cli.md` and `typescript-effect-cli.md`
  (the sibling precedent — same platform, differing by what is present);
  `cloudflare-zero-trust.md:26-32` (how a bundle body names a pairing on another
  axis); `plugins/stackgen/assets/pack-format.md:144-154` (bundle frontmatter
  keys); `plugins/stackgen/stacks/framework/astro/pack.yaml` (U1's — read the
  `version:`; never edit).
- **Lazy-load:** `plugins/stackgen/stacks/framework/astro/conventions.md` and
  `skills/astro/references/{ssg,ssr,hybrid,csr}.md` (U1's) for the
  `## Build
  output` heading the bundles cite and the mode doctrine the bodies
  defer to. If U1 has not landed when you write, cite the heading and the
  references by the names D5 and D13 fix and say so in a `GAP:`. Context7
  `/withastro/docs` and `/websites/reactrouter` for any fact you state in a
  body.

## Ruling

D1: four sibling bundles on one pack, each pinning a mode; not a mode field.

D3: "One pack, four bundles" — SSG (`static`, no adapter), Hybrid (`static` +
adapter + per-route `prerender = false`), SSR (`server` + adapter), CSR
(`static`, shell + catch-all, `client:only` app).

D4: "React in all four": every bundle carries `framework/react@generated`.

D6: slugs `astro-ssg`, `astro-ssr`, `astro-hybrid`, `astro-csr`; display names
`Astro (SSG)`, `Astro (SSR)`, `Astro (Hybrid)`, `Astro (CSR)`. The user: "drop
`Typescript` since that's implicitly used for Astro projects and use
`Astro (SSG)`, `Astro (SSR)`, `Astro (CSR)` respectively. For `Hybrid
Rendering`
… use `Astro (Hybrid)`." The SSR bundle is **renamed**:
`typescript-astro-react.md` → `astro-ssr.md`, same body; the one live pin
(95octane's `.config/vwf.yaml:1034`) is re-pointed in that repo's own session
(parked).

D7 *(assumed)*: every bundle pins `language/typescript@0.1.0`,
`package-manager/pnpm@0.1.0`, `toolchain-gate/tsconfig@0.1.0`,
`toolchain-gate/eslint@0.1.0`, `framework/astro@0.1.0`,
`framework/react@generated`; SSR and Hybrid add `framework/effect@0.1.0`.

D10 *(assumed)*: testing per mode — SSG: Vitest, node for `lib/` and endpoints,
jsdom + Testing Library only for the islands a repo actually writes; Hybrid and
SSR: the SSR bundle's Vitest + jsdom + Testing Library plus endpoint tests; CSR:
jsdom + Testing Library, route tests through React Router's
`createMemoryRouter`. The SSR bundle's 100 %-coverage rule is **not** copied
into the three new bodies; each states its scoped include and leaves the
threshold to the repo.

D11 *(assumed)*: the SSR body keeps its decisions but cites the pack for what
Astro is and how the modes work; "SSR is not a published API" stays.

D12: deploy pairings, in the voice of `cloudflare-zero-trust.md:26-32`,
frontmatter naming no deploy slug. SSG and CSR: `cloudflare-workers-static` —
the artifact is a directory of files at `./dist` per the pack's named fact; CSR
adds that the host's not-found handling is set to single-page-application mode.
SSR and Hybrid: "Pair with all supported deployments, Cloudflare Workers as
preferred option" — `cloudflare-workers-ssr` **preferred** (the Cloudflare
adapter, U12's pack), then `gcp-cloud-run`, `gcp-gke` and `container-generic`
(the Node standalone adapter); the adapter follows the pairing, and the body
says so.

D38: "Hybrid is SSR with prerender flipped": `astro-hybrid` pins Effect and
cites the SSR bundle's server doctrine.

D39: CSR's router is React Router in Data mode; TanStack Router is the named
swap.

## Edits

1. **`git mv typescript-astro-react.md astro-ssr.md`** — then edit the moved
   file: frontmatter `name: Astro (SSR)`; `framework/astro@generated` →
   `framework/astro@0.1.0`; everything else in the frontmatter unchanged
   (`framework/react@generated` and `framework/effect@0.1.0` stay). Body heading
   `# site — Astro (SSR)`. The opening paragraph and the **Framework** stack
   bullet defer to the pack ("the `astro` pack carries the framework and the
   mode decision; this bundle pins `output: "server"`") rather than describing
   Astro from scratch; every other decision (React islands, UI kit, `AppLayer`,
   proxy endpoints, cache middleware, config, observability, testing) stays as
   written. The adapter sentence becomes: the adapter follows the deploy pairing
   — the Cloudflare adapter for `cloudflare-workers-ssr`, Node standalone for a
   container — per D12, with the pairing list in the zero-trust voice,
   Cloudflare first. One sentence names the three siblings so a reader on this
   page can find them.
2. **`astro-ssg.md`** — new. Frontmatter: `name: Astro (SSG)`, `axis: project`,
   `kind: language-bundle`, `components:` per D7 (six refs),
   `platforms: [site]`. **No** `unconditional:`. Body heading
   `# site — Astro (SSG)`. Body, in the parseargs register: what a static `site`
   is (a content surface built once, served as files, calling someone else's API
   if it calls one at all; "a static site publishes no API"); **Stack** —
   `output: "static"`, no adapter (the pack's `ssg.md` carries the rest), file
   routes and content collections, React present for islands and used only where
   interactivity demands it (a page with no island ships no JavaScript — say
   so), the `src/` layout; **Build output** — a directory of files at `./dist`,
   citing the pack's `## Build output` fact, and the deploy pairing per D12;
   **Testing** per D10; the axis note ("this doc covers the project axis only")
   copied from the SSR bundle.
3. **`astro-hybrid.md`** — new. Same frontmatter shape with
   `name: Astro (Hybrid)` and `framework/effect@0.1.0` added (seven refs). Body:
   what a hybrid `site` is (a content site that is prerendered except where a
   request must be read); **Stack** — `output: "static"` **with** an adapter,
   `export const prerender = false` on exactly the routes that read a request,
   and the server side for those routes per the SSR bundle's doctrine (cite
   `astro-ssr.md` for `AppLayer`, layered reads, proxy endpoints, cache
   middleware — do not restate them); the honest sentence that `hybrid` is not a
   config value since Astro 5; **Build output** — files plus the adapter's
   server entry at `./dist`; the pairing list per D12, Cloudflare first;
   **Testing** per D10.
4. **`astro-csr.md`** — new. Same frontmatter shape with `name: Astro (CSR)`
   (six refs, no Effect). Body: what a client-rendered `site` is (an app whose
   state lives in the browser; the server serves one shell); **Stack** —
   `output: "static"`, no adapter, the shell page and the catch-all, the app
   mounted `client:only="react"`, React Router in Data mode as the router the
   bundle was built with (`createBrowserRouter`, `RouterProvider`,
   `clientLoader`/`clientAction`) and TanStack Router as the swap when the URL
   is the state, citing the pack's `csr.md` for the reasoning; the UI kit is the
   repo's call — name the SSR bundle's shadcn/Radix/Tailwind list as one option,
   not a decision; **Build output** — a directory of files at `./dist`; the
   pairing per D12 with the not-found-handling flip stated; **Testing** per D10.

## Verification

- `mise run plugins:check` exits 0.
- `test ! -f plugins/stackgen/stacks/bundles/typescript-astro-react.md` and
  `git log --follow --oneline plugins/stackgen/stacks/bundles/astro-ssr.md`
  shows the rename (once committed; before that, `git status` shows the rename
  staged or the two paths).
- `grep -c "framework/astro@generated" plugins/stackgen/stacks/bundles/*.md`
  totals 0;
  `grep -l "framework/astro@0.1.0" plugins/stackgen/stacks/bundles/*.md` returns
  exactly the four `astro-*.md` files.
- `grep -l "framework/react@generated" plugins/stackgen/stacks/bundles/astro-*.md`
  returns all four; `grep -l "framework/effect@0.1.0"` over the same glob
  returns exactly `astro-ssr.md` and `astro-hybrid.md`.
- `grep -n "^name:" plugins/stackgen/stacks/bundles/astro-*.md` shows the four
  display names exactly as D6 spells them; none contains "TypeScript".
- `grep -n "unconditional" plugins/stackgen/stacks/bundles/astro-*.md` is empty;
  `grep -n "^- site" plugins/stackgen/stacks/bundles/astro-*.md` hits all four.
- `grep -n "cloudflare-workers-ssr" plugins/stackgen/stacks/bundles/astro-ssr.md plugins/stackgen/stacks/bundles/astro-hybrid.md`
  hits both, before any container pairing on the same list.
- Every `components:` ref in the four files either ends in `@generated` or names
  a `plugins/stackgen/stacks/<type>/<slug>/pack.yaml` that exists and declares
  that version — check by hand; nothing else does.
- The retired-terms scan: no backticked `web` on a line that also carries
  another platform token or the word "token"; no literal `stacks/project/`.
- `mise run plugins:inventory --check` is expected to be red until the
  orchestrator regenerates; say so, do not run the generator.

## Guardrails

- Do not edit any other bundle — `cloudflare-*.md` are U12's, and nothing else
  changes. Do not edit the pack (U1's).
- Frontmatter names no deploy slug; the pairing is body prose only (D12).
- The rename is a `git mv`, so history follows the file; do not create a new
  file and delete the old one.
- `plugins/**/*.md` is not dprint-formatted; match the fold width by hand. `cat`
  is aliased to `bat` — Write/Edit only. Strict YAML in the frontmatter.
- `plugins/stackgen/stacks/inventory.md` is generated (U4's); never touch it.

## Commit

`feat(stackgen): offer astro-ssg, astro-hybrid and astro-csr; rename the SSR bundle to astro-ssr and pin it to the astro pack`
— written by the orchestrator after the wave gate, not by the unit.
