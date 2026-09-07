# Browser Rendering — pick & trade

## What it is for

Getting from a URL, or from a blob of HTML, to something only a real
browser can produce: the DOM after scripts have run, a screenshot, a
PDF, the text behind a selector, the accessibility tree, the links on a
page. The browsers run on Cloudflare's network; the product installs
nothing and operates nothing
([overview](https://developers.cloudflare.com/browser-run/)).

## When it is the answer

- **The content is produced by JavaScript.** A page whose markup arrives
  empty and fills in on the client cannot be read by an HTTP request. A
  browser is the only thing that can.
- **The output is inherently visual.** A screenshot, an Open Graph image,
  a PDF laid out from HTML and CSS. Reproducing a browser's layout engine
  in a library is a much larger commitment than paying for the browser.
- **The product already runs on this platform.** From a Worker the
  binding carries no credential and no egress, and the render happens
  next to the request that asked for it.
- **The volume is bursty and small-to-moderate.** Browsers open in
  seconds and are billed by the second they are open, which suits a job
  that renders sometimes and nothing at all in between.

## When it is not the answer

- **A `fetch` would have answered.** Server-rendered HTML, a JSON API, a
  file — all of these are one HTTP request. Sending a browser after them
  costs seconds of billed time and one of a small number of concurrency
  slots to arrive at the same bytes.
- **The job runs for tens of minutes.** A session idles out after 60
  seconds and can be extended to at most 10 minutes; there is no fixed
  maximum for an *active* session, but Cloudflare also closes sessions
  when it rolls out a release, so nothing may assume one survives
  ([limits](https://developers.cloudflare.com/browser-run/limits/)). A
  long render job is a sequence of short ones with state kept outside
  the browser.
- **The work is a sustained, high-concurrency crawl.** The ceiling is
  account-wide — 200 concurrent browsers on Workers Paid by default, 3
  on Free — and it is shared with every other project and environment in
  the account
  ([limits](https://developers.cloudflare.com/browser-run/limits/)). A
  crawler that wants hundreds of parallel browsers all day is asking for
  a raised limit and a queue in front of it, and should be sized against
  that ceiling before it is designed.
- **The browser needs an extension, a specific Chrome build, or a
  non-Chromium engine.** The environment is Cloudflare's; a product with
  a hard requirement on the exact browser is running its own.

## The three ways in, and how to choose between them

| Path | Reached by | Right when |
| --- | --- | --- |
| Quick Actions | `env.BROWSER.quickAction()`, or `POST` to the REST endpoint with a token | One render, one output, no interaction |
| The `browser` binding | `@cloudflare/puppeteer` or `@cloudflare/playwright` from a Worker | The render needs steps — wait, type, click, then capture |
| CDP `/devtools` | `puppeteer-core` or `playwright-core` over a WebSocket, with a token | The caller cannot be a Worker — a CI runner, a laptop, another cloud |

([Quick Actions](https://developers.cloudflare.com/browser-run/quick-actions/),
[Puppeteer](https://developers.cloudflare.com/browser-run/puppeteer/),
[CDP](https://developers.cloudflare.com/browser-run/cdp/)).

**Start at the top of that table and move down only when forced.** Quick
Actions have no session to leak and no library to keep current; the
binding buys interaction at the price of a lifecycle to manage; CDP buys
reach at the price of a credential living somewhere that is not
Cloudflare.

**Puppeteer or Playwright is not a real decision here.** Both ship as
Cloudflare forks of the upstream project —
`@cloudflare/puppeteer` and `@cloudflare/playwright` — adapted to run
inside a Worker, and both expose the same `sessions()`, `limits()` and
`history()` helpers over the same service
([Playwright](https://developers.cloudflare.com/browser-run/playwright/)).
Pick whichever the team already writes, and whichever existing scripts
are written in; there is no capability here that only one of them has.

## The alternatives, stated plainly

- **A self-run headless browser in a container.** The `cloud-service/containers`
  component is where that lives on this platform. It buys an exact
  browser build, extensions, arbitrary session length and no per-browser
  price — and costs an image to maintain, a Dockerfile with the
  browser's system dependencies in it, and a container that is billed
  whether or not it is rendering. Prefer it when the requirement is a
  *specific* browser or a *long* session; prefer this component when the
  requirement is simply "a browser, sometimes".
- **A third-party rendering API.** Buys the same shape from someone else,
  usually with a fuller feature surface. Costs a second vendor, a
  credential on the request path, and a round trip out of the platform
  the request is already on.
- **Not rendering at all.** Fetch the source. Read the API the page
  itself calls. Ask the origin for a feed. This is the alternative that
  gets skipped and it is the cheapest one whenever it applies.

## The trade, stated plainly

**What it buys:** a real browser reachable in one line, with no
infrastructure, no browser to patch, and a free allowance that covers a
low-volume product entirely.

**What it costs:**

- **A shared, account-wide ceiling.** Concurrency and browser hours are
  not per project, per environment or per binding, so the blast radius of
  a runaway loop is every other thing in the account
  ([limits](https://developers.cloudflare.com/browser-run/limits/)).
- **A lifecycle that bills when it is got wrong.** A session that is not
  closed keeps running to its timeout, and Cloudflare names this the most
  common cause of unexpected usage
  ([limits](https://developers.cloudflare.com/browser-run/limits/)).
- **No local browser.** The dev loop renders against the live service and
  is billed for it — see [local dev](local-dev.md).
- **Identifiability, if that matters.** Every request carries
  non-removable headers and a cryptographic signature proving it came
  from this service
  ([automatic request headers](https://developers.cloudflare.com/browser-run/reference/automatic-request-headers/)).
  For rendering the product's own pages that is a feature. For anything
  else it is a fact to design around rather than defeat.

## What choosing it does not decide

**Whether rendering someone else's site is appropriate.** That is a
product and legal decision, not a capability one, and the etiquette this
component holds itself to is [service doctrine](service-doctrine.md)'s.

**Where the rendered output lives.** Screenshots and PDFs are objects;
the object-storage component's doctrine applies to them and nothing here
restates it.

**Whether the product wants a managed crawl-and-index pipeline instead.**
If the goal is a searchable index over crawled pages rather than the
pages themselves, that is the `cloud-service/ai-search` component, which
calls this service underneath to fetch them — so it needs no pin here.
Pinning this component as well is for the case where the product also
wants a rendered page in its own hands.
