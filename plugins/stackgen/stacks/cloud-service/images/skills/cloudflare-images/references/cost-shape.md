# Cost shape — Cloudflare Images

The provider-wide billing principle is the `cloudflare` skill's cost
doctrine, and this service is one of the cases that principle hands over:
the private plane bills by **seats**, and every other Cloudflare service —
this one included — bills by **consumption**. This file states only what
is Images' own. No dollar figures; the current rates are on
[the pricing page](https://developers.cloudflare.com/images/pricing/) and
the billing model is what stays true.

## The meter

Three dimensions, and which of them apply depends on which half the
product uses
([Pricing](https://developers.cloudflare.com/images/pricing)):

1. **Unique transformations** — optimizing images stored **outside**
   Images bills on this alone, and it is available on the free plan.
2. **Images stored** — the count held in Images storage.
3. **Images delivered** — served from Images storage.

The second and third are the **storage half only, and paid plan only**
([Pricing](https://developers.cloudflare.com/images/pricing/index.md)).
So a product whose originals live in its own bucket has exactly one line
on this bill, and a product that moves them into Images storage acquires
two more. That is the cost half of the pairing decision in
[pick & trade](pick-and-trade.md).

There is an included monthly allowance for transformations before the
billable rate starts
([Pricing](https://developers.cloudflare.com/images/pricing)).

## The whole doctrine follows from the word "unique"

**A unique transformation is a distinct combination of source image and
parameters**, billed the first time it is requested in a calendar month;
every repeat of that same combination within the month is free
([Transformations overview](https://developers.cloudflare.com/images/optimization/transformations/overview/),
[Pricing](https://developers.cloudflare.com/images/pricing)).

Read that carefully, because it inverts the instinct most teams bring. The
bill is **not** a function of traffic. A viral image served ten million
times at three sizes is three billable transformations. The bill is a
function of **how many distinct variants the product invents**, which is
a property of the code, not of the audience.

So the expensive designs here are the **varied** ones, not the busy ones.

## Trap one: a width taken from the request is an unbounded meter

`width=<whatever the client asked for>` turns every distinct integer into
its own billable transformation, and a crawler walking the range bills the
whole range. The same applies to any parameter a client can influence —
quality, fit, a cropping rectangle derived from a viewport.

The remedy is structural rather than a limit: **a fixed set of allowed
widths, chosen in the services layer**, and a request for anything else
rounded up to the nearest member of the set. That is one decision that
bounds the meter permanently, and it is the single highest-value control
on this service.

The same reasoning is the argument for the responsive-image pattern:
`srcset` naming three or four widths is a bounded set by construction,
where a JavaScript resizer computing an exact device width is not.

## Trap two: multiplying the format axis by hand

`format=auto` counts as **one** billable transformation regardless of
which encoding is served to which browser
([Pricing](https://developers.cloudflare.com/images/pricing)). Enumerating
`avif`, `webp` and `jpeg` yourself to "be safe" therefore triples the
count for an outcome the negotiation already produced. Free calls exist
too: the `.info()` method is not billed.

## Trap three: the storage half has no lifecycle, so the store only grows

Unlike a bucket, Images storage has **no lifecycle rules and no expiry**.
"Images stored" is a monotonic line unless the product deletes, and the
product is the only thing that can. Two habits follow:

- **Deletion is application code that has to exist**, written when the
  upload path is written rather than when the bill is read. An image whose
  owning record was deleted stays and stays billing.
- **Every abandoned direct-creator upload is an orphan.** The upload URL
  expires; the image it created does not. Record the id before handing the
  URL out, and reconcile ids against records on a schedule someone owns —
  there is no rule to do it for you.

## Trap four: a Worker on the byte path can lose the free repeat

The URL form's caching is what makes the second request free. A Worker
returning transformed bytes controls its own response, so a missing
`Cache-Control` — or a Workers cache left off — turns repeat traffic back
into repeat work
([Images binding](https://developers.cloudflare.com/images/optimization/binding/),
[watermark example](https://developers.cloudflare.com/images/examples/watermark-from-kv/)).
The transformation count may hold, but the Worker's own invocations do
not, and that is a second bill under the provider's consumption
principle.

## The review to run

1. Can any parameter reaching a transformation be **influenced by the
   client**, and is the set it can produce finite?
2. How many **distinct variants** does the product actually define, and
   does anyone still use the oldest ones?
3. Is `format=auto` the only format instruction anywhere?
4. On the storage half: what **deletes** an image, and what reconciles
   stored ids against the records that should name them?
5. Where a Worker is on the byte path, what is its `Cache-Control` and is
   the Workers cache on?
