# Identity shape — Cloudflare Images

The account and role model, what automation authenticates with, and why
the unscoped Global API Key is never the answer are the `cloudflare`
skill's identity-and-iam reference — cited here and restated nowhere. This
file states only the grants **this** service needs, and the one secret it
introduces.

## The binding holds no credential

A Worker reaching Images through an `images` binding presents nothing: the
platform resolves the binding for that Worker, so there is no token in the
project, none in CI, and none to rotate
([Images binding](https://developers.cloudflare.com/images/optimization/binding/)).
The transformation half needs no credential at all in its URL form either
— a `/cdn-cgi/image/` path is authorized by the zone's own settings, which
is exactly why those settings are the security boundary; see
[service doctrine](service-doctrine.md).

So the first identity question is not which token to issue. It is whether
anything other than a Worker or a zone touches this service.

## The permission to grant

The Images REST API authenticates with an account API token carrying
**`Images Read`** or **`Images Write`**
([list images](https://developers.cloudflare.com/api/python/resources/images/subresources/v1/methods/list),
[delete image](https://developers.cloudflare.com/api/python/resources/images/subresources/v1/methods/delete)).
That is the whole vocabulary, which makes the rule short and the
discipline entirely about who holds which:

- **A read path gets `Images Read`.** Listing, fetching metadata,
  resolving variants. It cannot delete, and that is the point.
- **`Images Write` is what deletes.** The same permission that uploads
  removes, so any job holding it can erase the account's images. The
  service issuing direct-upload URLs needs it; a rendering path does not,
  and giving it one because "it is the same service" is the privilege
  mistake this service offers.
- **Nothing gets the Global API Key**, per the provider reference.

**Zone-level settings are a different grant entirely.** Enabling
transformations and editing the allowed-origins list are zone settings
([zone settings](https://developers.cloudflare.com/api/go/resources/zones/subresources/settings/methods/edit)),
so the identity that changes them is a zone-editing one, not an Images
one. Keep them apart: a token that can serve images should not be able to
open the zone to transforming anyone's.

## The signing key is a secret, and it is the one this service adds

Serving private images means signing the delivery URL with an
HMAC-SHA256 over the path and expiry, using a signing key taken from the
account's Hosted Images settings
([serve private images](https://developers.cloudflare.com/images/optimization/hosted-images/serve-private-images),
[signing keys](https://developers.cloudflare.com/api/go/resources/images/subresources/v1/subresources/keys/methods/list)).

Treat it as any other long-lived credential under the provider's secrets
doctrine — never in the repo, catalogued by name in the project's
environment doc, injected rather than read from a file. Where it is
injected differs by environment, and both homes are pinned components
rather than improvisations: `capability-provider/fnox` holds it for a
developer machine and for CI, and `stacks/cloud-service/secrets-store/`
is the account-level store a deployed Worker reads it from in staging and
production. Neither replaces the other.

The reason it deserves that care rather than a shrug: **the key is the
whole privacy model.** Anyone holding it can mint a valid URL for any
image in the account, for any expiry they choose. Two rules follow:

- **Sign in the services layer, once.** Expiry is then a single decision
  rather than a per-caller one, and short by default: long enough for the
  page to load, not long enough to be pasted into a ticket.
- **A signed URL is a bearer credential for as long as it lasts**, and it
  ends up in browser history, referrer headers and access logs. That is
  the argument for minutes rather than days, and it is the same argument
  the object store's presigned URLs make.

## Two traps in the privacy model itself

**A custom image id forecloses signing.** An image given a custom id at
direct upload is incompatible with signed URL tokens
([direct upload](https://developers.cloudflare.com/images/llms-full.txt)),
so a readable id chosen for convenience quietly makes that image
unprivatable. Decide privacy per entity **before** deciding ids.

**`requireSignedURLs` is per image, not per account.** It is a flag set at
upload
([upload](https://developers.cloudflare.com/api/python/resources/images/subresources/v1/methods/create)),
which means an upload path that forgets it produces a publicly reachable
image among private ones, and nothing about the delivery URL looks
different. Set it in the one place that issues uploads, not at each call
site.

## Reviewing this service

1. Does anything hold **`Images Write`** that only ever reads?
2. Is the **signing key** in exactly one module, and injected from the
   environment's own provider rather than checked in?
3. What is the **longest-lived signed URL** the product issues, and why?
4. Can any image the product treats as private have been uploaded
   **without** `requireSignedURLs`, or with a custom id?
5. Who can change the **zone's** transformation settings, and is that a
   different set of people from who can upload?
