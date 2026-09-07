# Browser Rendering — local dev

**There is no local browser, and the substitution is the live service
rather than a simulation.** The provider's local development map owns
the general shape — which bindings simulate locally, which connect
remotely, and which do only one of the two — and its row for this
service says remote only. This is what that means for the dev loop.

## What runs locally, and what does not

`wrangler dev` runs the Worker on the laptop, and by default its
bindings resolve to locally simulated resources. There is no local
simulation for this one, so the binding is **opted into the live
service** instead, per binding, in the configuration file:

```jsonc
{
  "browser": {
    "binding": "BROWSER",
    "remote": true
  }
}
```

The Worker is local; the browser is a real one on Cloudflare's network
([local development](https://developers.cloudflare.com/workers/local-development/)).
`wrangler dev --remote` pushes the whole Worker to the network instead,
which is a different trade and not needed just to reach a browser.

**Omitting `remote: true` produces a warning, not an error.** Cloudflare
warns for this binding, for Vectorize, for mTLS and for Images, and
errors only for Workers AI
([local development](https://developers.cloudflare.com/workers/local-development/)).
So the failure mode here is a session that starts and behaves oddly
rather than a session that refuses to start, which is worth knowing
before debugging the code.

**`env.BROWSER.quickAction()` does not exist locally at all.** Without
remote mode the call fails with
`The RPC receiver does not implement the method "quickAction"`
([Quick Actions](https://developers.cloudflare.com/browser-run/quick-actions/)).
That error names a method, not a mode, which is why it reads as a
version problem the first time it appears.

## The dev browser is a real browser, and that is the whole trap

Three things follow from the substitution being live rather than
simulated:

- **It bills, from a laptop exactly as from the edge.** Every render in
  the dev loop spends the account's browser hours — see
  [cost shape](cost-shape.md). On the Workers Free plan the day's
  allowance is ten minutes of browser time, which an afternoon of
  debugging a page that waits for a selector can spend.
- **It shares the account's ceiling.** Two developers running the loop,
  and a CI job, and production, all draw on the same concurrent-browser
  limit. A `429` on a laptop may be somebody else's fan-out, and vice
  versa.
- **It renders real pages.** Pointing the loop at a third party's site
  sends identifiable, signed traffic from the account
  ([automatic request headers](https://developers.cloudflare.com/browser-run/reference/automatic-request-headers/)).
  A dev loop that hammers an origin while a selector is being got right
  is the ordinary way that happens by accident; point it at a fixture
  page, or at the product's own local site made reachable, until the
  script works.

## The stub seam, which is what tests actually want

**A test that opens a browser is not a unit test.** The seam is the
narrowest thing the product's own code calls — one function that takes a
URL and returns HTML, bytes or a parsed result — with the launch, the
`try`/`finally` and the retry inside it. Everything above that seam is
tested against a fake that returns fixture bytes and needs no network,
no token and no allowance.

Two rules make the seam hold:

- **Nothing above the seam imports the automation library.** The moment
  a caller reaches for `page` or `browser`, the fake has to become a
  browser and the test has to open one.
- **The seam returns data, not a page.** Handing back a live `Page`
  moves the lifecycle out of the function that owns it, and the
  unclosed-session bug follows immediately.

What such a fake cannot tell you is the last section of this reference.
The small number of tests that genuinely exercise the render — the
selector is right, the PDF has the page break where it should — run
against the live service, deliberately, few in number, and closing every
browser they open.

## Driving a browser from the laptop without a Worker at all

The CDP path needs no Worker and no `wrangler dev`: a standard
`puppeteer-core` or `playwright-core` client connects to the
`/devtools/browser` WebSocket with a bearer token
([CDP](https://developers.cloudflare.com/browser-run/cdp/)). That is
often the fastest way to get a script right — iterate against a real
browser in a plain Node file, then move the working steps inside the
Worker. It needs the token from
[identity shape](identity-shape.md) on the laptop, which is the reason
not to make it the default loop.

Wrangler also manages sessions directly, which is what makes a stuck
one visible:

```sh
wrangler browser create --keepAlive 300
wrangler browser list
wrangler browser view
wrangler browser close <session-id>
```

`--keepAlive` is in seconds and takes 60 to 600
([Wrangler commands](https://developers.cloudflare.com/browser-run/reference/wrangler-commands/)).
`browser list` after a debugging session is the cheap way to find the
browser the code forgot.

## The `local_stack` answer is `n/a`, honestly

There is no engine to compose behind a readiness gate, because there is
nothing to run locally. Nothing about the local task changes because
this component is pinned — the task starts whatever the rest of the
stack needs, and the browser is simply reachable over the network.

Running a headless Chrome in Docker as a stand-in is possible and is not
recommended: it proves that *a* browser works, not that this service's
version, its session lifecycle, its concurrency behaviour or its
non-removable headers do. That is the fidelity trap the provider's local
development map names, and paying for a second, differently-behaved
browser to avoid paying for the real one is the wrong side of it.

## What local therefore cannot tell you

- **Whether the render is fast enough, or cheap enough.** Latency and
  billed seconds on a laptop include a round trip that production does
  not have, and exclude the queueing production does.
- **Whether the fan-out fits.** Concurrency limits and their `429`s
  appear at volume, and a dev loop opens one browser at a time.
- **Whether the destination will serve it.** A site's bot rules, its
  rate limiting and its response to a signed automated request are
  answered by the real destination, not by a fixture — and are the same
  in the dev loop as in production, which is the one thing local *does*
  faithfully reproduce here.
