# Pick & trade — Cloudflare Images

## What this actually is

**On-demand resizing, format conversion and optimization for images
served through the network**
([Transformations overview](https://developers.cloudflare.com/images/optimization/transformations/overview/)),
plus an optional account-level store for images the product owns
([Pricing](https://developers.cloudflare.com/images/pricing/)). The first
half is a read path over bytes that live somewhere else; the second half
is where the bytes live. They are billed differently, secured differently
and decided separately — see [service doctrine](service-doctrine.md).

The consequence that shapes every argument below: **a transformed image
is derived, and derived data can be regenerated.** Nothing here is a
system of record, so the questions are about cost, latency and who may
ask for what — never about durability.

## Transformations over pre-rendered variants in a bucket

The alternative to this component is the one most products already have:
on upload, generate a thumbnail, a card image and a hero image, write all
four to the object store, and serve them as static objects.

**Take transformations when the set of sizes is not settled.** A
pre-rendered set is a decision made at upload time about every consumer
that will ever exist, and adding a fifth size means a backfill over every
object ever uploaded. Transformations move that decision to read time, so
a new breakpoint is a new URL and nothing has to be reprocessed
([responsive images](https://developers.cloudflare.com/images/optimization/make-responsive-images/)).

**Take pre-rendered variants when the set is small, fixed and enormous in
volume.** Each distinct transformation is a billable unit the first time
it is asked for in a calendar month, and repeat requests within that month
are not billed
([Pricing](https://developers.cloudflare.com/images/pricing)) — so a
handful of sizes over a large library is cheap here and a large size
matrix over a large library is not. Count the product of images and
variants before assuming.

**The honest hybrid exists and is usually right**: transformations as the
serving path, with a bucket holding the originals only.

## Images storage over a bucket as the origin

Both work — a transformation reads happily from a bucket, and the
reference architecture for exactly that pairing is documented
([image delivery with R2](https://developers.cloudflare.com/reference-architecture/diagrams/content-delivery/optimizing-image-delivery-with-cloudflare-image-resizing-and-r2)).
The trade is what the product gets and gives up:

- **Images storage gives** direct creator upload — a browser uploading
  straight to Cloudflare against a short-lived URL the product issued,
  with no upload bytes crossing the product's own compute
  ([direct upload](https://developers.cloudflare.com/api/go/resources/images/subresources/v2/subresources/direct_uploads/methods/create))
  — plus named variants and signed URLs as first-class features.
- **Images storage takes away** everything a bucket policy expresses.
  There are no lifecycle rules, no storage classes and no prefix-scoped
  credentials; the metadata field is a key-value label, not a record. If
  retention or deletion is a compliance answer rather than a convenience,
  the bucket is the home and this is the read path.

**Do not store the same original in both.** Two homes for one entity means
one of them is the one nobody deletes, and it will be the one holding the
image someone asked to have removed.

## The binding over URL transformations

Prefer the **binding** wherever a Worker is already handling the request:
it carries no credential, the transformation is expressed in code rather
than in a path a client composed, and the result is a stream the Worker
can cache, sign or refuse
([Images binding](https://developers.cloudflare.com/images/optimization/binding/)).

Prefer the **URL form** where there is no Worker and there does not need
to be one — a static site, a CMS template, an `img` tag with a `srcset`.
It is genuinely simpler, and its cost is that the parameters are public
and writable by anyone who can type a URL, which is what the allowed-origin
fence exists to bound
([media transformations allowed origins](https://developers.cloudflare.com/api/python/resources/zones/subresources/settings/methods/get)).

The failure mode worth naming: reaching for a Worker *only* to build a
transformation URL. That adds a request, a deploy and a place for the
parameters to disagree, and buys nothing the `srcset` did not already do.

## When this is the wrong answer

- **Video.** A different service entirely, and whether this stack offers
  one is the `cloudflare` skill's scope fence — check it rather than
  assuming, because a product that needs video has a gap to name.
- **Non-image assets.** PDFs, fonts, archives, downloads. This component
  transforms images; anything else is an object, and objects belong in
  `stacks/cloud-service/r2/`.
- **A framework's image pipeline that already works.** Next.js, Astro and
  their kind ship their own optimizers, and several integrate with this
  service directly
  ([framework integration](https://developers.cloudflare.com/images/optimization/transformations/integrate-with-frameworks)).
  Running both is two caches and two sets of parameters producing subtly
  different bytes for the same source. Pick one layer and turn the other
  off — and if the framework's is already in production and correct,
  leaving it alone is a legitimate outcome of reading this file.
- **Images whose exact bytes are the point.** Anything signed, hashed,
  compared or archived for evidence. A transformation re-encodes, so the
  bytes that come back are not the bytes that went in.

## What this does not decide

**Which images the product holds, for how long, and what happens when a
user asks for one to be deleted.** Those are blueprint retention and PII
contracts; this component provides the delivery mechanism they choose
between, and — on the storage half — provides no retention mechanism at
all.
