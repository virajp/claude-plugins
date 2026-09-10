# Cloudflare Browser Rendering — conventions

**Headless Chrome as a service.** The product asks for a real browser to
load a page — its own or someone else's — and takes back what only a
rendered page can give: the DOM after JavaScript has run, a screenshot,
a PDF, the text of an element, a set of links. Nothing is installed and
no browser is operated; the browsers run on Cloudflare's network and are
billed by the time they are open.

**Cloudflare renamed the docs to "Browser Run" and kept every identifier
as it was.** The product pages now sit under `browser-run/`
([overview](https://developers.cloudflare.com/browser-run/), which says
"formerly known as Browser Rendering"), while the Wrangler key is still
`browser`, the REST path is still `/browser-rendering/`, and the API
token permission is still `Browser Rendering - Edit`. This component
keeps the old name because that is what the configuration and the
credential say; a reader searching the current docs should search for
Browser Run.

## Three ways in, and the choice is about who is calling

- **The `browser` binding, from a Worker.** The Worker gets a real
  browser and drives it with Cloudflare's forks of the two automation
  libraries — `@cloudflare/puppeteer` and `@cloudflare/playwright`,
  each a fork of the open-source project adapted to run inside a Worker
  ([Puppeteer](https://developers.cloudflare.com/browser-run/puppeteer/),
  [Playwright](https://developers.cloudflare.com/browser-run/playwright/)).
  No credential is in the request path. This is the path for anything
  multi-step: fill a form, wait for a selector, click, then capture.
- **Quick Actions, as a binding method or a REST endpoint.** One request,
  one rendered output, no session to manage —
  `/content`, `/screenshot`, `/pdf`, `/markdown`, `/snapshot`,
  `/accessibilityTree`, `/scrape`, `/json`, `/links` and `/crawl`
  ([Quick Actions](https://developers.cloudflare.com/browser-run/quick-actions/)).
  From a Worker it is `env.BROWSER.quickAction()`; from anything else it
  is `POST` to
  `https://api.cloudflare.com/client/v4/accounts/<account-id>/browser-rendering/<action>`
  with a bearer token. `/crawl` is REST-only.
- **The `/devtools` CDP endpoints, from anywhere.** A WebSocket a
  standard `puppeteer-core` or `playwright-core` client connects to,
  reachable from a laptop, a CI runner or another cloud
  ([CDP](https://developers.cloudflare.com/browser-run/cdp/)). This is
  the path for a browser job that is not a Worker, and it is the one
  that needs a token in a place that is not Cloudflare.

**Prefer Quick Actions until the task needs more than one step.** A
screenshot or an HTML fetch expressed as a session is a session someone
has to remember to close, and an unclosed session is the single most
common source of a surprising bill
([limits FAQ](https://developers.cloudflare.com/browser-run/limits/)).
Reach for the binding when the render depends on interaction, and for
CDP only when the caller cannot be a Worker.

## The binding is the project's to add, and this component ships no config file

The block goes in the repo's own `wrangler.jsonc`, beside whatever the
hosting pin already put there:

```jsonc
{
  "browser": {
    "binding": "BROWSER"
  }
}
```

The Worker then reaches it as `env.BROWSER`
([get started](https://developers.cloudflare.com/browser-run/get-started/),
[Wrangler configuration](https://developers.cloudflare.com/workers/wrangler/configuration/)).
`env.BROWSER.quickAction()` additionally requires a `compatibility_date`
of `2026-03-24` or later, and does not work in local mode — the skill's
local dev reference has that trap in full.

**There is no resource to create and nothing per environment.** Unlike a
bucket or an index, the binding names no instance: it is account-wide
capacity. Every environment of every project in the account draws on the
same browser hours and the same concurrent-browser ceiling, which is the
fact that shapes both the cost and the pre-production story.

## A session is open until it is closed, and that is what is billed

`puppeteer.launch(env.BROWSER)` opens a browser. It closes when the code
calls `browser.close()`, or after **60 seconds of inactivity** —
extendable to at most **10 minutes** with `keep_alive` in milliseconds,
`puppeteer.launch(env.BROWSER, { keep_alive: 600000 })`. There is no
fixed maximum lifetime for a session that stays active; sessions also
close when Cloudflare rolls out a release, so no design may assume one
survives indefinitely
([limits](https://developers.cloudflare.com/browser-run/limits/)).

**`disconnect()` and `close()` are different verbs and confusing them is
expensive.** `browser.disconnect()` releases *this* Worker's connection
and leaves the browser open for another invocation to reconnect to;
`browser.close()` ends the browser. Reuse is built on the first —
`puppeteer.sessions()` lists open sessions and their `connectionId`, and
`puppeteer.connect(env.BROWSER, sessionId)` attaches to a free one
([reuse sessions](https://developers.cloudflare.com/browser-run/features/reuse-sessions/)).
Reuse trades a cold start for shared cookies and cache, so a run that
must start clean uses an incognito browser context rather than a fresh
browser.

**The limits are the design constraint, not the price.** On the Workers
Paid plan: 200 concurrent browsers per account, 3 new instances per
second, 30 Quick Action requests per second, and the 60-second idle
timeout. On the Workers Free plan: 3 concurrent browsers, one new
instance every 20 seconds, one Quick Action request every 10 seconds,
and 10 minutes of browser time per day
([limits](https://developers.cloudflare.com/browser-run/limits/)). Over
any of them the service answers `429` with a `Retry-After` header, which
means **every caller needs a retry path and a bounded concurrency** —
Cloudflare's own guidance is to put a queue or a workflow in front of a
fan-out rather than launching browsers in a loop. Queues and Workflows
are their own components here; this one only says the ceiling exists.

## What to render, and the etiquette that is judgment rather than a limit

Rendering the product's **own** pages — an Open Graph image, a PDF
invoice, a crawler-ready snapshot of a JavaScript-heavy route, a visual
regression shot — has no third party in it and no question to answer
beyond cost.

Rendering **someone else's** pages does. Cloudflare attaches headers to
every request that cannot be removed — `cf-brapi-request-id`,
`cf-biso-devtools`, and Web Bot Auth `Signature` headers that
cryptographically prove the request came from Browser Rendering — so
these requests are identifiable as automated whatever User-Agent they
carry, and the crawl endpoint sends `CloudflareBrowserRenderingCrawler/1.0`
and cannot be made to say otherwise
([automatic request headers](https://developers.cloudflare.com/browser-run/reference/automatic-request-headers/)).
`robots.txt` is advisory and this service does not enforce it
([robots.txt and sitemaps](https://developers.cloudflare.com/browser-run/reference/robots-txt/)),
so honouring it, rate-limiting per origin, and deciding what a site's
terms permit are the product's decisions and belong in the blueprint
rather than in a client library's options.

**Do not render a page a `fetch` would have answered.** A browser costs
seconds of billed time and a concurrency slot to produce what an HTTP
request produces for free. The browser earns its price only when the
content is produced by JavaScript, or when the output is inherently
visual — a screenshot or a PDF.

## Where the output goes

A screenshot or a PDF comes back as bytes, and bytes returned straight
to a caller are bytes generated again on the next request. Anything worth
keeping goes to the object store — the `cloud-service/r2` component —
and the response carries a reference to it. That is that component's
doctrine, cited here and not restated.

## AI Search uses this service, and does not replace it

Cloudflare's managed retrieval pipeline crawls websites by calling this
service to fetch rendered pages. A product that wants a searchable index
over crawled content wants that component —
`cloud-service/ai-search` — and gets this one underneath it without
pinning it. A product that wants the rendered page *itself* wants this
one directly.

## What this component is not

It is not a browser test runner — it renders and drives a browser, and
which assertions run, in which framework, is the project's testing
choice. It is not a scraping product: it fetches what it is pointed at
and takes no position on whether it should be. And it is not a place to
run long jobs — the idle timeout and the concurrency ceiling mean a job
longer than a few minutes is a queue, a workflow or a container, each of
which is its own component here.

Full judgment: the `cloudflare-browser-rendering` skill and its
references. The provider-wide doctrine it cites — the account and role
model, how the meter runs, what exists on a laptop, and the fence saying
which Cloudflare services this stack offers at all — is the `cloudflare`
skill's.
