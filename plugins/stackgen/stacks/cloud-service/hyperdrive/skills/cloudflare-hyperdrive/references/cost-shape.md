# Cloudflare Hyperdrive — cost shape

The provider's billing principle is the `cloudflare` skill's cost
doctrine, which owns the account-level shape and the review that runs
over it. This is what that principle means for this one service — and
here it means something slightly unusual, because **the proxy is not
where the money is.**

## The proxy's own bill is a quota, not a meter

Hyperdrive is available on both the Workers Free and Paid plans. The
free plan allows 100,000 database queries per day, resetting at 00:00
UTC, and operations fail once that is exceeded; the paid plan has no
query limit ([Pricing][pri]). There is no per-query charge to model on
either.

So the sizing question is not "how many queries will this cost" but
**"is the free plan's daily ceiling a ceiling this product will hit"**
— and it is a hard failure when it does, not a slowdown. A product with
real traffic is on the paid plan for other reasons anyway; the ceiling
matters for a prototype, and it matters as the thing that explains a
sudden wall of errors at a fixed time of day.

## The origin's bill is the real one, and it moves

The database this fronts is somewhere else, on someone else's meter,
and that is where the money is. Three effects worth naming before the
first invoice:

- **Egress from the origin's provider.** Every row Hyperdrive reads
  leaves the database's network. A managed database on another cloud
  charges for that, and a proxy in front of it does not reduce the
  volume — only the connection count. A cached response, on the other
  hand, is a read that never reaches the origin at all, which makes
  caching a **cost** decision as much as a latency one.
- **The connection ceiling is a sizing input.** The soft origin
  connection limit ([Tune the connection pool][tcp]) is what the
  database instance must be provisioned to accept. Raising it to buy
  throughput is a decision to pay for a larger origin.
- **Long transactions cost twice.** They hold an origin connection for
  their duration, so the pool has to be wider — which is to say the
  origin has to be bigger — for the same concurrency.

## The trap

**Turning caching off "to be safe" is a bill decision made as a safety
decision.** Caching is on by default; disabling it globally sends every
read to the origin, and on a distant managed database that shows up as
both latency and egress. The correct shape is the narrow one: caching
on, and a **second cache-disabled configuration** used for the queries
that genuinely must be current — see [service
doctrine](service-doctrine.md). One binding for everything is the
expensive answer whichever way it is set.

The second half of the trap is the quiet configuration. A Hyperdrive
configuration for an environment that no longer exists still holds
credentials to a database that does, which is a privilege review
finding before it is a cost one — the two reviews read the same list,
which is why the provider runs them as one pass.

## The sizing question

Not "what will Hyperdrive cost" but **"what does the origin cost now,
and which way does this move it"**. Pooling moves it down by letting a
smaller instance serve the same concurrency. Caching moves it down
again by removing reads. The plan tier is a yes-or-no ceiling on top.

Never write dollar figures. They change; the shape does not.

[pri]: https://developers.cloudflare.com/hyperdrive/platform/pricing/
[tcp]: https://developers.cloudflare.com/hyperdrive/configuration/tune-connection-pool/
