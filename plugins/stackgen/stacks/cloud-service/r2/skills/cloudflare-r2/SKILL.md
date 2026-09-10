---
name: cloudflare-r2
version: 0.1.0
category: development
description: >-
  Cloudflare R2 as this product's object storage — when a bucket is the
  right home and when it is not, how it satisfies the object-storage
  contract, the key layout as the security boundary, the binding versus
  the S3 API, what the operation classes and the storage tiers actually
  bill, the token permission to grant, and what the local simulation does
  not reproduce. Includes R2 Data Catalog and R2 SQL, which are R2
  features rather than separate services.
license: MIT
allowed-tools: Read Grep Glob Edit Write Bash
---

# Cloudflare R2

S3-compatible object storage with no egress fee. This skill carries the
judgment; the SDK surface, the Workers API signatures and wrangler's
current flags belong to Context7 at use time. The provider-wide half —
the account and role model, the billing principle, what exists locally —
is the `cloudflare` skill's, cited and never restated.

Read the reference that matches what you are doing — one, not all of them.

| Doing | Read |
| --- | --- |
| Choosing, or questioning, this store | [Pick & trade](references/pick-and-trade.md) |
| Designing buckets, keys, uploads and retention | [Service doctrine](references/service-doctrine.md) |
| Sizing, or explaining, the bill | [Cost shape](references/cost-shape.md) |
| Issuing a credential, or granting a token | [Identity shape](references/identity-shape.md) |
| Running or testing against a bucket on a laptop | [Local dev](references/local-dev.md) |

**Three rules that do not wait for a reference.** The **key layout is the
authorization boundary** and is effectively immutable once objects exist,
so design it before the first upload. **A bucket per environment**, never
a prefix inside one bucket, because policy is bucket-level. And **the
egress line that dominates every other object store's bill is zero here**
— which moves the cost question to operations and storage tiers, and makes
the usual instincts about this service the wrong ones.
