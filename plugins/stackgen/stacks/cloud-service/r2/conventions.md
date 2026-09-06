# Cloudflare R2 — conventions

The product's **object store**: user uploads, generated documents, build
artifacts, exports, datasets, archived logs — anything whose natural unit
is a file rather than a row. It realizes the `object-file-storage`
capability, and what it owes is
`assets/contracts/object-storage.md`, satisfied clause by clause in the
skill's service doctrine rather than restated here.

**Two access paths, and picking between them is the first decision.** A
Worker reaches a bucket through a **binding**, with no credential in the
project at all; anything else reaches it through the **S3-compatible
API** at an account endpoint, with an access key pair
([S3 API](https://developers.cloudflare.com/r2/get-started/s3/)). The
S3 path is what makes existing SDKs and tools work unchanged — the region
string is `auto` and is ignored, and the credentials are R2's own, not
Cloudflare's account credentials
([AWS SDK for JavaScript](https://developers.cloudflare.com/r2/examples/aws/aws-sdk-js-v3/)).
Prefer the binding wherever a Worker is already in the path: it is one
fewer credential to issue, rotate and leak.

**The binding is a block the project adds to its own wrangler config**,
beside whatever its hosting component already put there — this component
ships no config of its own and writes no file into the repo:

```jsonc
{
  "r2_buckets": [
    { "binding": "MY_BUCKET", "bucket_name": "<bucket>" }
  ]
}
```

`binding` is the name the Worker code sees on `env` and must be a valid
JavaScript identifier; `bucket_name` is the bucket it resolves to, and it
is the field that differs per environment
([Workers API](https://developers.cloudflare.com/r2/get-started/workers-api/)).

**A bucket per environment, never a prefix inside one bucket.** Public
access, CORS and lifecycle rules are all bucket-level settings, so two
environments sharing a bucket cannot hold two policies — and the staging
suite that deletes a prefix has deleted production's data with a typo.

**Nothing is public by default, and `r2.dev` is not how it becomes
public.** A bucket can be exposed through a **custom domain** on a zone
you control, or through an `r2.dev` subdomain
([Public buckets](https://developers.cloudflare.com/r2/buckets/public-buckets/)).
The custom domain is the one to use for anything real: it is the only one
that puts the product's own hostname, cache and rules in front of the
bytes. Reach for neither by reflex — a bucket opened to the internet is
irreversible in the sense that matters, because you cannot know what was
copied while it was open.

**Where a client needs an object it does not own the path to, the answer
is a presigned URL** issued by a service that authorized the request
([Presigned URLs](https://developers.cloudflare.com/r2/api/s3/presigned-urls/)),
or a Worker that reads through the binding and streams the response. The
choice is about who enforces the rule: a presigned URL moves the bytes
without the product in the path and cannot be revoked before it expires; a
Worker keeps the decision on every request and puts the product's compute
on the byte path. Serving a large file through application code is the one
answer that is always wrong.

**R2 can emit event notifications into a queue** when objects are written
or deleted
([Event notifications](https://developers.cloudflare.com/r2/buckets/event-notifications/)),
which is how an upload becomes a job. The queue half is a separate service
and whether this stack offers it is the `cloudflare` skill's scope fence to
say — check it before designing against the pattern, rather than assuming
the consumer exists.

**R2 Data Catalog and R2 SQL are R2's own, not neighbours to pin
separately.** Enabling the catalog on a bucket turns it into an Apache
Iceberg REST catalog, so the objects under it are readable as tables by
ordinary Iceberg engines
([Data Catalog](https://developers.cloudflare.com/r2/data-catalog/get-started/)),
and R2 SQL runs read-only queries over those tables from the command line
([R2 SQL](https://developers.cloudflare.com/r2-sql/reference/limitations-best-practices/)).
Both arrive with this component; the decision they present — when a set of
objects is better modelled as a table — is the skill's pick-and-trade
reference.

**What this component does not cover.** Image transformation and delivery
is a different service and this pack does not stand in for it: storing an
image here is storing bytes, not resizing them. Whether that service is
offered, planned or declined is the `cloudflare` skill's fence, and a
product that needs it has a gap to name rather than a gap to improvise.

Cost and identity are **cited, never restated**: the account-wide billing
principle and the credential rule are the `cloudflare` skill's cost
doctrine and identity-and-iam references, and what is R2's own — the
operation classes, the storage tiers, the token permission — is the
`cloudflare-r2` skill's cost-shape and identity-shape.

Full judgment: the `cloudflare-r2` skill's five references.
