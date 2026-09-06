# Workers SSR — cost shape

The provider's cost doctrine — never write dollar figures, and run the
billing review against the same evidence as the privilege review — is the
`cloudflare` skill's, and this cites it rather than restating it.

**This service is the case that doctrine explicitly set aside, and it is
the second half of the carve-out.** The provider doctrine is written for
the account's seat-billed surface, where the bill tracks the population
allowed through and traffic growth does not move it. Hosting is the other
shape entirely, and this stack is hosting: **requests and CPU time, not
seats**. Reading the seat principle across to a rendering deployment gets
the answer exactly backwards.

## The bill tracks invocations, and only some requests are one

The unit is a **request that invokes the script**, with the CPU time each
invocation consumes as the second term and the stored asset set as a small
third. The rule that follows is the whole shape of this file:

**Requests the assets answer are free and unlimited; requests that reach
the script are billed.** A deployment that prerenders most of its pages
pays for the fraction that renders, and one that renders everything pays
for everything. So:

- **Team growth does not move the bill.** Nobody consumes a seat here;
  there is no seat.
- **Traffic growth does**, in proportion to how much of the traffic reaches
  the script.
- **What the framework prerenders is therefore a cost decision as well as a
  latency one**, and it is made in the project's own configuration rather
  than anywhere in this component.

## The three traps

**`run_worker_first` bills the static half.** Turning it on invokes the
script ahead of asset matching, so every hashed CSS file, every image and
every prerendered page becomes an invocation. It also changes the failure
shape: under free-tier request limits a request that must invoke the script
returns 429 rather than falling back to serving the asset, so exceeding the
limit stops serving files that would have been free. This pack ships it
off — see [service doctrine](service-doctrine.md).

**CPU time is billed, and it is not wall-clock time.** Waiting on a
downstream is not what costs; computing is. A rendering path that does real
work per request — a large template, a sort over a big list, anything
cryptographic — is a cost line that grows with traffic *and* a latency line
that grows with it, and it is the same line. This is the lever with the
most room in it and the one nobody looks at, because the code that causes it
looks like ordinary rendering code.

**A cache miss is a billed invocation.** For the static half the fix is the
build's — fingerprinted filenames with a long immutable cache, exactly as
the assets-only sibling states. For the rendered half it is the script's:
a response with no explicit cache policy is re-rendered for every visitor
who could have been served a copy. Both are the same trap from two
directions, and only one of them is fixed where a static site's is — see
[artifact](artifact.md).

## What is not a cost lever

- **Instance sizing.** There are none, and there is no memory or CPU
  allocation to choose. The only thing that can be made smaller is the work
  the script does.
- **Idle.** Nothing runs between requests. There is no floor to pay for
  keeping something warm, which is the largest structural difference from
  any container target and the reason a low-traffic rendering site is
  cheaper here than on one.
- **Regions.** The script and the file set run everywhere; there is no
  per-region multiplier and no placement decision.

## The sizing question

Not "how many people work on this" but **"how many requests reach the
script, and how much CPU does each one spend"**. Two products with
identical traffic and different prerender ratios have different bills, and
the ratio is the number to know before the deploy target is chosen.

Where the honest answer is "nearly all traffic renders, and each render is
heavy", that is the signal from [pick & trade](pick-and-trade.md) pointing
at a container: not because this stack cannot serve it, but because the CPU
ceiling will be met before the bill is the problem.

## Two costs that are not this service's

- **The build.** Whatever runs the build costs whatever it costs, on the CI
  system pinned on the project's `cicd` axis, and moving the build around
  does not change what serving the output costs.
- **What the script calls.** A datastore, an API, a third-party service —
  each is its own pin with its own cost doctrine, and a rendering front end
  amplifies them: one page view can be several downstream calls, and that
  multiplier belongs in their sizing rather than in this one.

Never write dollar figures. They change; the shape does not.
