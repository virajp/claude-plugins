# Browser Rendering — cost shape

The provider's cost doctrine is the `cloudflare` skill's, and it says
what the account-wide shape is, what the day-one guardrails are, and
what it deliberately does not cover. This is what consumption means for
this one service.

## The unit is time a browser was open, plus how many were open at once

Two metered terms, and which of them applies depends on how the service
was reached:

- **Browser hours** — wall-clock time a browser was open, shared across
  every path. Both Quick Actions and sessions incur it.
- **Concurrent browsers** — charged for **Browser Sessions only**
  (Puppeteer, Playwright, CDP), and averaged over the month rather than
  taken at the peak

([pricing](https://developers.cloudflare.com/browser-run/pricing/)).

Read the rates and the included allowances there before sizing anything;
never copy a figure into a document, because they change and a stale
number reads as authoritative in a way a stale principle does not. What
is stable is the shape: **Quick Actions are billed on one term, sessions
on two.**

## What that shape means

**Nothing is billed per render.** A screenshot is not a unit of price —
the seconds the browser was open to produce it are. So the same output
costs whatever the code took to reach it, and two implementations of the
same feature can differ by an order of magnitude without either being
wrong-looking in review.

**A session's cost is decided by when it closes, not by what it did.**
This is the fact the whole service turns on. An unclosed browser bills
until it idles out at 60 seconds, or up to ten minutes if `keep_alive`
was raised — Cloudflare names this the most common cause of unexpected
usage
([limits](https://developers.cloudflare.com/browser-run/limits/)). A
render that finished in two seconds and left the browser open costs
thirty times what it should have, silently and per invocation.

**Quick Actions are the cheaper expression of a one-shot render**,
because they carry no concurrent-browser term at all and cannot leak a
session. Reaching for a session to take a screenshot is paying the
session price for the Quick Action's work.

**Concurrency is a monthly average, which makes bursts cheap and
steady-state expensive.** A job that opens twenty browsers for an hour a
day averages to very little; a service that keeps twenty open all month
pays for twenty. That inverts the usual instinct to smooth load: for
this term, spiky is the cheap shape.

**Tabs are free where browsers are not.** Several `newPage()` calls
inside one browser cost one browser's time and one concurrency slot.
Several `launch()` calls cost several of each. Restructuring a fan-out
from browsers to tabs is the single largest lever here, and it is also
what keeps the run inside the account's concurrency ceiling.

## The trap

**The account is the meter, and it is shared.** Browser hours and the
concurrency ceiling are per account, not per project, per environment or
per binding
([limits](https://developers.cloudflare.com/browser-run/limits/)). Three
things follow, and each of them has surprised somebody:

- A pre-production suite that renders in a loop spends the same
  allowance production does, and can exhaust the day's on the Free plan
  before anyone deploys.
- A developer's laptop is billed exactly like the edge, because there is
  no local browser to render against — see [local dev](local-dev.md).
- There is no per-project attribution in the dashboard, which shows the
  account's browser time and the reason each session closed. The one
  handle the service gives is **`X-Browser-Ms-Used`**, returned on every
  Quick Actions response and carrying that request's browser time in
  milliseconds
  ([pricing](https://developers.cloudflare.com/browser-run/pricing/)) —
  so a Worker that renders should record it, with what it rendered and
  why. On the session paths there is no equivalent header and the
  measurement is the code's own.

**The second half of the trap is the retry.** A `429` handled by
retrying immediately in a tight loop does not bill browser time — but a
retry that succeeds on a browser the code then forgets to close bills
twice. Retries and the `finally` belong in the same review.

## The sizing question

Not "how many screenshots a month" but **"how many seconds is a browser
open, how many are open at once, and for how much of the month"**. Those
three numbers are the whole estimate, and the first is the one a design
controls: closing deterministically, using tabs instead of browsers,
suppressing images and fonts on a text-only scrape with
`rejectResourceTypes`, and preferring a Quick Action to a session where
the task is one shot.

A Workers plan includes an allowance of browser time and a number of
included concurrent browsers before anything is charged, and a product
that renders occasionally sits inside it. How large each allowance is,
and which plans the service is available on, belong to the pricing page
rather than to this reference — they have moved before.

**The cheapest render is the one that did not happen.** Output worth
keeping goes to the object store and is served from there; a cache TTL
on a Quick Action (`cacheTTL`, default 5 seconds, up to a day
([API reference](https://developers.cloudflare.com/api/resources/browser_rendering/)))
turns a repeated identical render into one. Both are cost decisions
before they are architecture ones.
