# Cloudflare Images — conventions

The product's **media layer for images**: the thing a page or an app reads
from when it wants a picture at the right size, in the right format, for
the device asking. It is not a bucket — nothing here is the durable home
of the bytes — and it realizes no vwf capability token, because `media` is
one of the categories stackgen's taxonomy records as a known vwf-side gap.
There is no neutral media contract to satisfy
clause by clause; what this component owes is judgment, and that lives in
the `cloudflare-images` skill's five references.

**One name, two products, and telling them apart is the first thing to
get right.**

- **Transformations** are a **zone** feature. A URL under `/cdn-cgi/image/`
  on a hostname you control, or a `fetch` from a Worker carrying a
  `cf.image` object, returns a resized and re-encoded version of an image
  the transformation fetched from **somewhere else**
  ([Transformations overview](https://developers.cloudflare.com/images/optimization/transformations/overview/),
  [Transform via Workers](https://developers.cloudflare.com/images/optimization/transformations/transform-via-workers/)).
  The bytes stay wherever they already are. This half was called
  **Image Resizing** before the rename to Image Transformations — the
  zone setting is still spelled `image_resizing` in the API, which is
  where the old name still surfaces
  ([zone settings](https://developers.cloudflare.com/api/python/resources/zones/subresources/settings/methods/get)).
- **Images storage** is an **account** feature. Images are uploaded to
  Cloudflare, get an id, and are served from `imagedelivery.net` under the
  account's delivery hash and a named **variant**
  ([upload](https://developers.cloudflare.com/api/python/resources/images/subresources/v1/methods/create),
  [delivery URL](https://developers.cloudflare.com/images/optimization/features)).
  Signed URLs and direct creator upload belong to this half and to no
  other.

Both are reachable from one **binding**, and the binding is the surface to
prefer wherever a Worker is already in the path: `env.IMAGES.input(…)
.transform(…).output(…)` for the transformation half and
`env.IMAGES.hosted.*` for the storage half
([Images binding](https://developers.cloudflare.com/images/optimization/binding/),
[storage binding](https://developers.cloudflare.com/images/storage/binding/)).

**The binding is a block the project adds to its own wrangler config**,
beside whatever its hosting component already put there — this component
ships no config of its own and writes no file into the repo:

```jsonc
{
  "images": {
    "binding": "IMAGES"
  }
}
```

`binding` is the name the Worker code sees on `env` and must be a valid
JavaScript identifier
([configure the binding](https://developers.cloudflare.com/images/tutorials/optimize-user-uploaded-image/)).
Unlike a bucket or a namespace binding there is no per-environment
resource id to vary: the binding names the account's Images service, so
what differs between environments is the zone in front of it and the ids
the product uses, not the block.

**Where the original bytes live is the pairing decision.** Two answers,
and both are normal:

- **In the product's own object store**, with transformations reading from
  it. That is `stacks/cloud-service/r2/` — the bucket is the durable home,
  the record in the datastore names the key, retention and deletion are the
  bucket's lifecycle rules, and Images is a read-path optimization in front
  of it. Take this when the product already stores files, when the same
  object has non-image consumers, or when retention has to be expressible
  as a policy.
- **In Images storage**, when the image *is* the entity. An avatar, a
  product photo, a piece of uploaded creator media whose only consumer is
  the display path. Take it for the direct-creator-upload flow — a browser
  uploading straight to Cloudflare against a short-lived URL the product
  issued — and accept what comes with it: the metadata store is a label
  rather than a record, and lifecycle is the product's job because there
  are no bucket lifecycle rules here.

Deciding by reflex is the failure. Storing the same image in both is two
sources of truth for one entity, and the one nobody deletes is the one
that leaks.

**What this component does not cover.** Video, in any form — it is a
different service, and whether this stack offers it, plans it or has
declined it is the `cloudflare` skill's scope fence to state, not this
component's. General object storage is `stacks/cloud-service/r2/`: an
image in a bucket is bytes, and putting a PDF through this component is a
category error rather than an edge case.

Cost and identity are **cited, never restated**: the account-wide billing
principle and the credential rule are the `cloudflare` skill's cost
doctrine and identity-and-iam references, and what is Images' own — the
three metering dimensions, the `Images Read` / `Images Write` permissions,
the signing key — is the `cloudflare-images` skill's cost-shape and
identity-shape.

Full judgment: the `cloudflare-images` skill's five references.
