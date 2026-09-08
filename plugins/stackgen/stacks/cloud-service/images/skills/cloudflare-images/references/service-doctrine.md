# Service doctrine — Cloudflare Images

This component realizes **no vwf capability token** — `media` is one of the
categories stackgen's taxonomy records as a known vwf-side gap — so there
is no neutral contract to satisfy clause by clause. What follows is the
service's own usage doctrine.

Two halves, in the order a project meets them.

## Turning transformations on is a zone decision, not a code one

Transformations are a **zone** setting. Until it is on, a
`/cdn-cgi/image/…` path is just a path, and the first symptom is the
original bytes served untransformed rather than an error
([Transformations overview](https://developers.cloudflare.com/images/optimization/transformations/overview/)).
The setting is spelled `image_resizing` in the API and takes `on`, `off`
or `open`
([zone settings](https://developers.cloudflare.com/api/go/resources/zones/subresources/settings)).

**Turn it on per zone, deliberately, and record which zones have it.** A
product with a marketing zone and an application zone has two answers, and
the one nobody enabled is the one where the responsive images silently
serve at full size.

## The allowed-origin fence is the security decision

Once transformations are on, the zone can also **restrict which sources
are permitted to be transformed** — the Media Transformations allowed-
origins setting, shared between image and video transformations
([allowed origins](https://developers.cloudflare.com/api/go/resources/zones/subresources/settings/methods/edit)).

Take this seriously, because the alternative is the default reading of a
transformation URL: **anyone who can type one can make the zone fetch and
re-serve an arbitrary image.** Left open, the hostname becomes a general
image proxy someone else's bandwidth bill routes through, and the product
pays for every unique transformation of it.

Two ways to hold the fence, and they compose:

1. **The allowed-origins list**, which is declarative and belongs in
   whatever records the zone's configuration.
2. **A Worker in front**, computing the source URL and the options from
   request data rather than reading them off the path — the documented
   origin-access control pattern
   ([control origin access](https://developers.cloudflare.com/images/optimization/transformations/control-origin-access/)).
   This is the stronger of the two, because the client never names the
   source at all.

The setting that says "resize images from any origin" is a **local
development convenience**
([framework integration](https://developers.cloudflare.com/images/optimization/transformations/integrate-with-frameworks)).
Enabling it on a production zone is the one configuration mistake on this
service with an open-ended bill attached.

## The two request forms

**The URL form** puts the options in the path, before the source path:

```text
/cdn-cgi/image/width=80,quality=75/uploads/image.jpg
```

which is the shape a `src` or a `srcset` uses directly
([responsive images](https://developers.cloudflare.com/images/optimization/make-responsive-images/)).

**The Worker form** puts the same options on a `fetch`:

```js
fetch(imageURL, { cf: { image: { fit: "scale-down", width: 800 } } });
```

([transform via Workers](https://developers.cloudflare.com/images/optimization/transformations/transform-via-workers/)),
and the **binding form** expresses it as a pipeline over a stream:

```js
const response = (
  await env.IMAGES.input(stream)
    .transform({ width: 800 })
    .output({ format: "image/webp" })
).response();
```

([Images binding](https://developers.cloudflare.com/images/optimization/binding/)).

The binding block the project adds to its own wrangler config is in
`conventions.md`; this component writes no config file.

## The four options that carry the decisions

The parameter list is long and belongs to Context7 at use time
([features](https://developers.cloudflare.com/images/optimization/features)).
Four of them are where the design lives:

- **`width`** (with `height`) — the requested size. **Constrain it to a
  fixed set.** A width taken from a query string is an unbounded set of
  distinct transformations, and each one is a billable unit; see
  [cost shape](cost-shape.md).
- **`fit`** — what happens when the aspect ratios disagree: `scale-down`,
  `contain`, `cover`, `crop`, `pad` and `scale-up`, the last of which only
  ever enlarges
  ([features](https://developers.cloudflare.com/images/optimization/features/)).
  This is a product decision, not a default: `cover` crops a face out of a
  portrait, `pad` puts a colour behind a logo, and which is right differs
  per surface. Decide it per variant and write it down.
- **`format`** — `auto`, `avif`, `webp`, `jpeg`, `baseline-jpeg` or `json`
  ([features](https://developers.cloudflare.com/images/optimization/features/)).
  **`auto` is the answer** for delivery: it negotiates per request, and it
  counts as a **single** billable transformation regardless of how many
  encodings are actually served
  ([Pricing](https://developers.cloudflare.com/images/pricing)). Naming
  formats explicitly to "support old browsers" buys a multiplied bill for
  a problem the negotiation already solved.
- **`quality`** — an integer 1–100 or a perceptual level
  ([features](https://developers.cloudflare.com/images/optimization/features)).
  Set it once, per surface, in the layer that builds the URLs. A quality
  that varies per call site is a variant matrix nobody meant to create.

## Caching is not automatic in every path

Each unique combination of source and parameters is **cached and billed
separately**, and the second request for that combination inside the same
calendar month is not billed
([Transformations overview](https://developers.cloudflare.com/images/optimization/transformations/overview/)).
That is the URL path's caching, and it is free.

A Worker producing a response from the binding is a different case: the
transformed bytes are whatever the Worker returns, so **set
`Cache-Control` on the response yourself**
([Images binding](https://developers.cloudflare.com/images/optimization/binding/)).
Where the Worker is the byte path for repeat requests, enable the Workers
cache too — the documented shape for not re-running a transformation on
every hit
([watermark example](https://developers.cloudflare.com/images/examples/watermark-from-kv/)).

Forgetting this is the most common performance surprise here: the URL form
gets caching by construction and the binding form does not, so a project
that moved from one to the other for the security argument can lose the
caching without noticing.

## The storage half

Everything above is a read path over bytes stored elsewhere. This section
is the case where Cloudflare holds them.

**Upload.** Server-side, an image goes up as a multipart `POST` of a file
or a URL for Cloudflare to fetch, and comes back with an **id** and the
list of **variant URLs**
([upload](https://developers.cloudflare.com/api/python/resources/images/subresources/v1/methods/create)).
From a Worker the same thing is `env.IMAGES.hosted.upload(body, options)`
over a readable stream
([storage binding](https://developers.cloudflare.com/images/storage/binding/)).

**Variants are account-level named presets**, and the delivery URL is
`https://imagedelivery.net/<delivery-hash>/<image-id>/<variant>`, where
the first segment is the account's own delivery hash
([features](https://developers.cloudflare.com/images/optimization/features)).
Two consequences: the variant vocabulary is shared by everything in the
account, so name variants for the **surface** they serve rather than for a
pixel width that will change; and a variant that no longer suits one
consumer cannot be edited without editing it for all of them.

**Direct creator upload** is the flow worth designing for. The product
calls `POST /images/v2/direct_upload` and gets back an `id` and a
one-time `uploadURL` the browser posts to directly. The request takes an
`expiry` — no sooner than two minutes out and no later than six hours —
plus optional `metadata`, `creator` and `requireSignedURLs`
([direct upload](https://developers.cloudflare.com/api/go/resources/images/subresources/v2/subresources/direct_uploads/methods/create)).

Design it as: authorize the request, mint the URL with the **shortest
expiry the flow tolerates**, hand it out once, and record the returned id
on the product's own record before the browser uploads. The id is what
makes the eventual object findable; an upload whose id nobody wrote down
is an orphan, and there is no lifecycle rule here to expire one.

**Signed URLs make an image private.** Set `requireSignedURLs` on the
image, then serve it behind an HMAC-SHA256 signature over the path and an
`exp` query parameter, generated in a Worker from a signing key held as a
secret
([serve private images](https://developers.cloudflare.com/images/optimization/hosted-images/serve-private-images)).
The key comes from the account's Hosted Images settings, and it is a
credential — see [identity shape](identity-shape.md).

**The trap in that pair:** an image given a **custom id** at direct upload
is **incompatible with signed URL tokens** and cannot be made private that
way. So the choice of a readable custom id, which looks like a small
convenience, silently forecloses the privacy model. Decide privacy first,
ids second.

**The metadata model is a label, not a record.** `metadata` is a
user-modifiable key-value store meant for keeping a reference back to
another system of record
([upload](https://developers.cloudflare.com/api/python/resources/images/subresources/v1/methods/create)).
Read that as written: **the product's datastore holds the entity, and the
image id hangs off it.** Anything the product queries, filters or reports
on belongs in the datastore. The reverse — treating the Images account as
the index of what exists — leaves the product unable to answer its own
questions without listing an external service.

## The access rule

A project reaches this service **only through the shared services layer** —
no page builds a `/cdn-cgi/image/` path inline and no module holds the
signing key but that one. Signing, the variant vocabulary and the allowed
width set are decided in one place, which is what keeps the billable set
of transformations finite and the private images actually private.
