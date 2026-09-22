# Images

How a picture gets from the repository to the page: which directory it lives
in, which API renders it, and what changes when the route renders per request
instead of at build. It is the one topic in this pack where the four modes
genuinely differ, and the difference is easy to miss until production.

## `src/` or `public/` — processed or copied

The directory decides whether Astro touches the file at all:

| Lives in  | Referenced as                   | What the build does                             |
| --------- | ------------------------------- | ----------------------------------------------- |
| `src/`    | an `import`                     | reads its dimensions, converts, resizes, hashes |
| `public/` | a root-relative path, `/x.png`  | copies it byte-for-byte, at the same path       |

**Content imagery belongs in `src/`** — a photograph in an article, a
screenshot on a docs page, a hero illustration. It is what the pipeline exists
for: the page gets a smaller file in a modern format, a fingerprinted URL that
caches forever, and dimensions read from the file rather than typed by hand.
The usual home is `src/assets/`, beside the components that import from it;
a content collection's entries may instead keep their images next to the
entry and reference them relatively.

**`public/` is for files whose URL is itself the contract** — a path something
outside the page asks for by name and that must not be renamed by a hash. The
`## Head` section of this pack's `conventions.md` already rules which files
those are: the brand mark, the rasterized icon set and the social-preview
image live under `public/`, and [`head.md`](head.md) states the tree. That
ruling stands; this file adds nothing to it.

The **icons task** that rasterizes the favicon set is a different thing
again: a one-off command run by hand when the mark changes, writing into
`public/`. It is not part of this pipeline and never runs in the build — see
[`head.md`](head.md).

The mistake to avoid in both directions: a content photo dropped in `public/`
ships at full size forever because nothing ever looks at it; a social-preview
image moved into `src/` gets a hashed name and every link already shared
points at a file that no longer exists.

## `<Image>`, from `astro:assets`

```astro
---
import { Image } from "astro:assets";
import hero from "@/assets/hero.jpg";
---
<Image src={hero} alt="The dashboard's overview screen, in dark mode." />
```

What it requires:

- **`src`** — for a local file, the imported value, never a string path into
  `src/`. The import is what lets the build read the file.
- **`alt`, always.** The component refuses to render without it. An image that
  is pure decoration takes `alt=""`, which is a decision, not an omission.
- **`width` and `height`** only where the build cannot read them: a file under
  `public/` or a remote URL. For a remote URL, `inferSize` fetches them
  instead — at the cost of a request per image per build.

What it emits is one `<img>` with the converted, fingerprinted `src`, the
intrinsic `width` and `height`, `loading="lazy"` and `decoding="async"`.
Override the loading attribute for the one image that is the page's largest
paint — the hero above the fold — since lazy-loading that one delays the
metric it most affects.

**Why the pack prefers it over a hand-written `<img>`** for anything served
from `src/`: a hand-written tag gets none of the conversion, none of the
fingerprint, and dimensions only if someone typed them and kept them in step
with the file. `<Image>` makes the correct tag the one with the least typing.

A remote image is processed only when its host is authorized in the config's
`image.domains` or `image.remotePatterns`. An unauthorized one is still
rendered, just untouched — so a missing entry degrades quietly rather than
failing. List the hosts the product actually serves from, deliberately.

`<Picture>`, from the same module, is for the case that genuinely needs
several formats or art-directed sources; reach for it when there is a reason,
not by default.

## `getImage`, where a component cannot go

Some images are not an `<img>`: a CSS `background-image`, an `og:image` URL a
layout computes, a preload link, an image an endpoint returns. `getImage`
runs the same pipeline and hands back the result as data:

```astro
---
import { getImage } from "astro:assets";
import texture from "@/assets/texture.png";

const bg = await getImage({ src: texture, format: "avif" });
---
<div style={`background-image: url(${bg.src});`}><slot /></div>
```

It runs **on the server only** — in frontmatter, an endpoint or middleware.
Astro's reference is exact about the failure: it relies on server-only APIs
and throws an error on the client, `GetImageNotUsedOnServer`. A client script
or island that needs an optimized URL gets the `src` computed during the
server render — as a prop, or through `define:vars` — never by calling this
itself.

Note the example writes an inline `style`. A project whose
Content-Security-Policy admits no inline style (the third of the config facts
in `conventions.md`) moves that URL into a stylesheet or a custom property set
by a class instead.

## Layout shift

A browser that does not know an image's size reserves no space for it, and
the text below jumps when it arrives. That jump is measured, it counts against
the page, and it is the defect people notice on a slow connection.

**The pipeline solves this for local images and only for them.** An imported
file's dimensions are read at build and written into the tag, so the space is
reserved before a byte of the image loads. A `public/` path or a remote URL
has no such guarantee: the dimensions are whatever was typed, and a file
replaced later with a different aspect ratio makes them wrong without any
check failing.

What it does **not** do: size the image to its container. The intrinsic
`width` and `height` fix the aspect ratio; the rendered size is still the
stylesheet's job. An image with fixed dimensions in a fluid column needs the
usual `max-width: 100%; height: auto` from the project's styles, or it
overflows on a narrow screen.

## Per mode

The pipeline is the same code in every mode. **When it runs is not.**

| Mode   | Prerendered routes             | Request-time routes                           |
| ------ | ------------------------------ | --------------------------------------------- |
| SSG    | processed at build, in `dist/` | none exist                                    |
| Hybrid | processed at build, in `dist/` | Astro's image endpoint, converted per request |
| SSR    | processed at build, in `dist/` | Astro's image endpoint, converted per request |
| CSR    | the shell only                 | none — the app is an island; see below        |

**SSG.** Every image is converted and written to `dist/` at build
([`build-output.md`](build-output.md)); the deploy uploads files and nothing
processes an image ever again. This is the case the rest of this file
describes, and it is the cheapest one to operate.

**Hybrid and SSR.** On a route rendered per request, `<Image>` does not point
at a built file. It points at Astro's own image endpoint, and the image service
converts the file **when a browser asks for it** — on the server, at request
time, on every request the cache does not absorb. Two consequences follow, and
both surprise a project that assumed build-time behaviour:

- **The image service has to run where the server runs.** The deploy target,
  not this pack, decides whether it can. A container running `@astrojs/node`
  runs `sharp` as it would at build. A Worker cannot run `sharp` at all, so the
  adapter substitutes its own: `@astrojs/cloudflare`'s `imageService` option
  chooses between the platform's image binding at request time and processing
  prerendered routes at build while passing request-time images through
  unconverted. Read the adapter's documentation for the current choices; they
  move between adapter majors.
- **Conversion is now a request cost.** The endpoint's responses need the
  same cache policy as any other request-time route — set in middleware, per
  [`ssr.md`](ssr.md) — or the server re-encodes the same photograph for every
  visitor.

In Hybrid, the simplest answer is often structural: the prerendered pages
carry the imagery and the request-time routes carry little, so most images
never reach the endpoint.

**CSR.** The prerendered shell is an `.astro` page and uses `<Image>` like any
SSG page — the logo in the shell, a loading illustration. The application is
a `client:only` island, and `<Image>` is an Astro component an island cannot
render. An image imported into the island's own code resolves to an object
whose `src` is a fingerprinted but **unconverted** URL. For an app whose
screens are mostly controls and data, that is fine and the question is
sidestepped. For one that shows real imagery, the answer is to serve it
already sized — from the product's own media service, or from `public/` at
the dimensions it is displayed at.

## `sharp`, and when it cannot run

Astro's default image service is built on `sharp`, a native image library.
Two things follow:

- **Under pnpm it must be a direct dependency of the project.** pnpm does not
  hoist a transitive dependency where Astro's code can resolve it, so the build
  fails asking for `sharp` until it is added to the project's own manifest.
  This is a build dependency in SSG and a **runtime** dependency in SSR and
  Hybrid on a Node target, where the server image must carry it too.
- **Where it cannot run, the service is swapped, not removed.** A deploy
  target without native module support takes the adapter's own service, or
  `passthroughImageService()` from `astro/config` — which renders every
  `<Image>` correctly with the original file, unconverted. That is a
  legitimate choice for a site with little imagery; it is not a silent
  default anyone should discover in production.

Any image-service configuration a project needs lives in its `astro.config`'s
`image` block. It is not one of the counted config facts in `conventions.md`,
and is written only where the deploy target calls for it.

## What this does not decide

The **deploy target**, and therefore which image service runs at request time
— that is the deploy axis's pin, and the adapter follows from it. The CDN or
media service a product serves user-uploaded images from. The formats and
quality settings, beyond Astro's defaults. The alt text — that is the
content's, and the blueprint's where a screen pins it. The files under
`public/` and the icons task, which are the head doctrine's.
