# Artifact — Workers SSR

**The artifact is a script plus the file set it fronts**, uploaded
together under one Worker name. Not an image, not a tarball: the build
output directory, with an entry the platform executes. `./dist` is the
default this component ships because it is what the framework packs that
pair here emit; a repo whose site is a sub-project points
`assets.directory` at that project's output instead, and that is the only
place the path is written down.

## What the build must emit

- **The script's entry, at the value `main` names.** For an adapter that
  exports a unified entrypoint — Astro's `@astrojs/cloudflare` v13 — that
  is a package export and the build's job is to produce the module graph
  behind it. For an adapter that emits a built file, the path must exist in
  the output directory after the build and not before it. Which of the two
  is a fact about the adapter, and it is the one thing this pack takes from
  the framework side.
- **The prerendered pages**, wherever the framework's mode prerenders any.
  They are files, they are served by the platform, and the script never
  sees a request for one.
- **Fingerprinted asset filenames** wherever the framework offers them.
  This is the whole basis of the caching rule below, so a build configured
  to emit stable filenames for CSS and JavaScript has given up the only
  safe long-cache strategy available for the static half.
- **Nothing that is not meant to be public.** Every file in the directory
  is served, and served *before* the script is consulted — so an
  authorization check written into the script cannot protect a file that
  happens to sit in the output. Source maps, a stray environment file, a
  build report: the directory is half the deployment, and an ignore list is
  a correctness file rather than a size optimization.

**No `404.html` requirement.** That is the assets-only pack's rule, and it
follows from `not_found_handling`. Here the unmatched request reaches the
script, so the 404 page is whatever the framework's routing renders — see
[service doctrine](service-doctrine.md).

## The caching rule, and the split that is now two-sided

The static half caches exactly as the assets-only pack's does, and for the
same reason:

- **Content-hashed assets get a long `max-age` with `immutable`.** Their
  URL changes when their content changes, so nothing is ever stale and
  nothing needs revalidating.
- **The entry document does not**, where it is prerendered. Its URL stays
  the same across deploys, so caching it aggressively is caching the
  pointer to the old asset URLs.

**The rendered half is different, and it is the script's own business.** A
response the script produces carries whatever headers the script sets, and
that is a per-route decision: a page assembled from data that changes
hourly and a page that varies per user are not the same caching problem.
The rule worth stating is the negative one — **a rendered response with no
explicit cache policy is a rendered response someone will cache by
accident**, at the edge or in a browser, and personalized output cached
publicly is a data leak rather than a performance bug.

`_headers` and `_redirects` ship inside the asset directory as build
output, and they apply to the static half. A rule there does not reach a
response the script produced.

## One deploy is distinguishable from the next

Cloudflare hashes each asset's content and uploads only what changed, and
the script is versioned with it. The uploaded version identifies the
release, which is what makes the rollback path a *version* rather than a
rebuild of an old commit — see [pipeline](pipeline.md).

The consequence worth stating as a rule: **the deployed artifact is what
the build produced, not what a later step assembled.** A pipeline that
rewrites files between the build and the upload — injecting an environment
value into HTML, patching a path — has made the tested output and the
released output different things, and the difference is exactly the part
nobody tested. That bites harder here than for a static site, because the
script and the files are built together and rewriting one desynchronizes it
from the other.

## Where this sits relative to the neutral component

The provider-neutral `deploy-target/container-image` component states the
image contract for a host that belongs to no cloud. **This artifact shape
has no such counterpart, and unlike a directory of files it is not portable
either.** The script is compiled against a runtime that is not Node and
reaches its files through a platform binding, so moving it means the
framework's adapter producing a different output — which is a supported
move for an adapter-based framework and a rewrite for anything else. That
is the lock-in this shape actually carries, and it is worth naming when the
deploy target is chosen rather than when it is changed.

## Configuration is not in the artifact

Anything environment-specific baked into the built output is baked into
every environment that serves that build. Where a value must differ between
staging and production, the honest answers are a separate build per
environment or a value the platform supplies to the script at runtime — the
second being available here in a way it is not for a static site, and the
better one for anything the script reads. Not a post-build rewrite, and not
a claim that the same artifact is promoted when it is not.
