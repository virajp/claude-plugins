---
name: Cloudflare Images
axis: backing
kind: cloud-provider
components:
- cloud-provider/cloudflare@0.1.0
- cloud-service/images@0.1.0
---

# Backing — Cloudflare Images

**Transform, optimize and deliver images at the edge.** One picture,
resized and re-encoded per request for the device asking, served from
wherever the originals already live — the product's own object store, or
Cloudflare's account-level image store when the image *is* the entity.
Pick it when a product has pictures and a range of screens to put them on,
and the set of sizes is not something anyone wants to settle at upload
time.

**The composition is the provider plus one service**, which is what a
Cloud-Bundle is. The provider component carries what spans services — the
account and role model, the billing principle, what exists on a laptop —
and the service component carries Images alone and **cites** that doctrine
rather than restating it. Two components rather than one because the
provider facts are written once: a second Cloudflare service pinned beside
this one reuses them instead of repeating them, and a fact stated twice is
a fact that will disagree with itself.

**What pinning it gives a project** is the judgment, not a config file.
The two halves under one name and which one a decision belongs to; the
zone setting and the allowed-origin fence as the security boundary rather
than as setup; the variant, signed-URL and direct-creator-upload model on
the storage half, including the custom id that quietly forecloses privacy;
the meter counting distinct transformations rather than requests, and the
bounded width set that is the one control worth taking on day one; the
`Images Read` and `Images Write` split and the signing key that is the
whole privacy model; and the two local modes, of which the default proves
five parameters. No file lands in the repo: the wrangler binding block is
a shape the project adds to the config its own hosting component already
owns.

**It pins beside other backing entries rather than instead of them.**
`backing_template` is "A LIST: one slug per capability the project needs —
datastore, identity, queue, object storage, telemetry sink", so a project
that needs a store and a media layer records both slugs. This one is the
media element, and it makes no claim on the rest of the axis.

**An Images pin usually sits beside an R2 pin**, and that pairing is the
normal shape rather than a redundancy: the bucket is the durable home of
the originals — the place retention, deletion and prefix-scoped access are
expressible — and Images is the read path in front of it. Pin
`cloudflare-images` alone only where the images are stored in Images
itself, and never store the same original in both, because the copy
nobody deletes is the one that outlives the deletion request.

**The category realizes no vwf capability token.** `media` is one of the
categories the taxonomy records as a known vwf-side gap, so the service
component leaves `capability` unset and nothing here mints one. There is
also no neutral media contract to satisfy — what this bundle brings is
doctrine, not clause-by-clause conformance.

**What this bundle decides that neither component decides alone** is that
the media layer is a **per-project** choice on a per-project axis. Two
projects in one repo may transform images and a third may have none; the
provider component being shared does not make the media decision shared,
and recording it per project is what lets `/vwf:doctor` check a project
against what it actually declared.

Full judgment: the components' own skills and their references.
