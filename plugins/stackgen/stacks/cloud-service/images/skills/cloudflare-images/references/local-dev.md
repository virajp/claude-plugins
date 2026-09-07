# Local dev — Cloudflare Images

The provider's map of what exists on a laptop is the `cloudflare` skill's
local-development reference, and its row for this service is the shape of
everything below: Images is **simulated locally, and can be pointed at the
real service instead** — the binding supports both modes
([bindings per development mode](https://developers.cloudflare.com/workers/local-development/bindings-per-env/)).
This file is what that means in practice, and where the simulation stops
resembling the service.

## Two modes, and the default is the weaker one

`wrangler dev` resolves an `images` binding to a **low-fidelity offline
version**, which is also what the Workers Vitest integration uses so that
tests make no external calls. It covers a limited subset — resize, rotate,
width, height and format. `wrangler dev --remote` runs the **high-fidelity
version**, which mirrors the production feature set
([Images binding](https://developers.cloudflare.com/images/optimization/binding/)).

**Neither mode incurs a usage charge**
([Images binding](https://developers.cloudflare.com/images/optimization/binding/)),
which makes this one of the few Cloudflare services where reaching for
`--remote` costs nothing but latency — unlike the AI bindings the provider
map groups separately, where a remote session is a billed one.

The storage half behaves the same way with a different mechanism: local
image management runs against a **mock backed by an embedded KV
namespace**, and `--remote` reaches the real Images service
([storage binding](https://developers.cloudflare.com/images/storage/binding/)).

**The consequence to hold on to:** a transformation that works under the
default local mode has been proven against five parameters. Anything using
`fit`, a blur, a border, a background, a watermark composite or perceptual
quality has not run at all until someone passes `--remote`. Decide per
project which mode the test suite uses, and say so — a suite that silently
exercises the subset is a suite that reports green on a feature it never
touched.

## The zone half has no local existence

Transformations are enabled and fenced at the **zone**, and a laptop has
no zone. So nothing local exercises the settings that decide whether the
design was right: the transformation setting itself, and the allowed-
origins fence that keeps the hostname from being an open image proxy (see
[service doctrine](service-doctrine.md)).

There is a documented local convenience here worth naming precisely
because it is a footgun in the other direction: the **"Resize images from
any origin"** zone setting exists so that local development can use
absolute source URLs rather than relative ones
([framework integration](https://developers.cloudflare.com/images/optimization/transformations/integrate-with-frameworks)).
It is a **development** setting. Turning it on for a production zone to
make something work is opening the fence, and the bill for that is the
open-ended one.

## Seeding: one fixture image, committed

Keep a **small, committed fixture image** — a few kilobytes, known
dimensions, a known aspect ratio that is not 1:1 — and run every
transformation test against it. Three reasons, in order of how often each
one bites:

1. A test that fetches a real photograph from a real origin is a test that
   fails when the network does, and one whose bytes nobody controls.
2. Known dimensions and a non-square aspect ratio are what make `fit`
   assertions meaningful: `cover`, `contain` and `pad` are
   indistinguishable on a square source.
3. A committed fixture is the only way an assertion about output size or
   format stays stable across machines.

For the storage half, **seed through the product's own upload path**
rather than through the API directly wherever the upload path is what the
test is about — seeding around the code under test proves the fixture, not
the feature.

## What local cannot tell you

- **The zone settings.** Both of them, per above. The transformation
  setting's failure mode is the quiet one: the original bytes served
  untransformed rather than an error, which looks like a working page with
  a slow one.
- **Delivery and caching.** The URL form's free-repeat behaviour is a
  property of the edge cache; locally every call is a fresh call, so
  nothing about the cache header design is exercised. The Workers cache is
  the same story.
- **Cost.** Every transformation is free locally and the meter counts
  distinct combinations, so the design most likely to be expensive — an
  unbounded width — is the design local development is most comfortable
  with. See [cost shape](cost-shape.md).
- **Signed URLs and `requireSignedURLs`.** A signature is verified by the
  delivery service, so privacy is a deployed-environment property. A local
  mock hands back bytes for any id it holds.
- **Format negotiation.** `format=auto` picks per request from what the
  browser advertises. One developer's browser is not the negotiation.

## Hygiene

- **Point the mode at an environment variable, never a code branch** —
  code that special-cases "local" is code that never runs in production.
- **Do not let the local mock's image ids leak into fixtures** the deployed
  suite also uses; the mock's ids are the mock's.
- **Run the suite in both modes at least once** before trusting it, and
  know which mode CI uses.
