# Browser Rendering — service doctrine

The service's own usage rules: how a browser is reached, how a session
lives and dies, what the endpoints take back, where the output goes, and
what the product owes the sites it renders.

**This component realizes no vwf capability token.** `browser` is one of
the categories the taxonomy records as a known vwf-side gap, so there is
no contract in `assets/contracts/` to satisfy clause by clause and
nothing here mints one — a contract is a reviewed asset, not something a
service component writes for itself.

## The binding, which the project adds

This component ships no config file. The block goes in the repo's own
`wrangler.jsonc`, beside whatever the hosting pin already put there:

```jsonc
{
  "browser": {
    "binding": "BROWSER"
  }
}
```

The Worker reaches it as `env.BROWSER`
([get started](https://developers.cloudflare.com/browser-run/get-started/),
[Wrangler configuration](https://developers.cloudflare.com/workers/wrangler/configuration/)).
There is no resource name in that block because there is no resource:
the binding grants access to account-wide capacity, so it is identical
in every environment and nothing about it varies per deploy.

## Quick Actions: one request, one output

Ten actions, each reachable two ways —
`env.BROWSER.quickAction("<action>", { … })` from a Worker, or
`POST https://api.cloudflare.com/client/v4/accounts/<account-id>/browser-rendering/<action>`
with a bearer token from anywhere:

| Action | Returns |
| --- | --- |
| `/content` | The rendered HTML |
| `/screenshot` | An image of the page |
| `/pdf` | A PDF of the page |
| `/markdown` | The page as Markdown |
| `/snapshot` | Several formats from one render |
| `/accessibilityTree` | The accessibility tree |
| `/scrape` | The elements matching selectors |
| `/json` | Structured data extracted by a model from a prompt |
| `/links` | The links on the page |
| `/crawl` | Multiple pages, asynchronously — REST only |

([Quick Actions](https://developers.cloudflare.com/browser-run/quick-actions/)).

Every action takes either a `url` or an `html` body, so a PDF can be
rendered from markup the product generated without that markup ever
being served. The shared options are the ones worth knowing before
reaching for a session: `gotoOptions`, `waitForSelector`,
`waitForTimeout`, `actionTimeout`, `viewport`, `emulateMediaType`,
`userAgent`, `cookies`, `authenticate`, `setExtraHTTPHeaders`,
`addScriptTag` / `addStyleTag`, `rejectResourceTypes` /
`rejectRequestPattern`, `bestAttempt` and a `cacheTTL`
([API reference](https://developers.cloudflare.com/api/resources/browser_rendering/)).
Between them these cover most of what looks at first like a reason to
drive a session — waiting for a selector, injecting a stylesheet,
suppressing images to make a text scrape cheaper.

**`env.BROWSER.quickAction()` has two preconditions.** The Worker's
`compatibility_date` must be `2026-03-24` or later, and the binding must
be in remote mode — locally the method does not exist and the error is
`The RPC receiver does not implement the method "quickAction"`
([Quick Actions](https://developers.cloudflare.com/browser-run/quick-actions/)).

## Sessions: the lifecycle is the whole doctrine

```js
import puppeteer from "@cloudflare/puppeteer";

const browser = await puppeteer.launch(env.BROWSER);
try {
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle0" });
  return await page.content();
} finally {
  await browser.close();
}
```

**The `finally` is the rule, not a flourish.** A browser that is not
closed keeps running until it idles out — 60 seconds by default — and
Cloudflare names unclosed sessions as the most common cause of usage
higher than expected. `puppeteer.history()` and `playwright.history()`
report why each recent session ended, and a session closed as
`BrowserIdle` rather than `NormalClosure` is one whose code forgot
([limits](https://developers.cloudflare.com/browser-run/limits/),
[browser close reasons](https://developers.cloudflare.com/browser-run/reference/browser-close-reasons/)).

**`keep_alive` extends the idle timeout, at most to ten minutes**:

```js
const browser = await puppeteer.launch(env.BROWSER, { keep_alive: 600000 });
```

The value is milliseconds, the ceiling 600000
([Puppeteer](https://developers.cloudflare.com/browser-run/puppeteer/)).
Extending it is how a session survives between Worker invocations; it is
also how a leaked session becomes ten minutes of billed time instead of
one, so the two go together and the second is the reason to extend it
deliberately rather than by default.

## Reuse, and the two verbs that are not the same

`browser.disconnect()` releases this invocation's connection and leaves
the browser open. `browser.close()` ends the browser. Reuse is built on
the first:

- `puppeteer.sessions(env.BROWSER)` lists open sessions, each with a
  `sessionId` and, if something is attached, a `connectionId`.
- `puppeteer.connect(env.BROWSER, sessionId)` attaches to one — and may
  fail, because another invocation can win the race, so the connect is
  wrapped and falls back to a launch.
- `puppeteer.limits()` reports `activeSessions`,
  `maxConcurrentSessions`, `allowedBrowserAcquisitions` and
  `timeUntilNextAllowedBrowserAcquisition` — the honest way to ask
  whether there is room before trying

([reuse sessions](https://developers.cloudflare.com/browser-run/features/reuse-sessions/),
[Puppeteer](https://developers.cloudflare.com/browser-run/puppeteer/)).

**Reuse trades a cold start for shared state.** A reused browser carries
the previous job's cookies, storage and cache. Where that is fine it is
free speed; where isolation matters — a test that must start clean, two
tenants' pages, an authenticated render followed by an anonymous one —
the answer is an **incognito browser context** inside the reused
browser, not a fresh browser
([limits FAQ](https://developers.cloudflare.com/browser-run/limits/)).
Getting this wrong is a correctness bug that looks like a caching bug.

**A Durable Object is the natural home for a reused session**, because
it gives the session an owner and an alarm to close it on. Cloudflare's
own worked example keeps a browser alive in one and closes it from the
alarm
([Browser Run with Durable Objects](https://developers.cloudflare.com/browser-run/how-to/browser-run-with-do/)).
That pattern belongs to the `cloud-service/durable-objects` component;
this one only notes that the seam exists.

## Concurrency is the account's, and `429` is routine

Concurrent browsers, new-instance rate and Quick Action request rate are
all per account and shared across every project and environment in it
([limits](https://developers.cloudflare.com/browser-run/limits/)). Over
any of them the service answers **`429`** with a **`Retry-After`**
header, on both the binding and the REST path.

Three consequences, in the order they bite:

- **Every call site needs a retry that reads `Retry-After`.** Not an
  exponential backoff invented locally — the service says how long to
  wait.
- **A fan-out is bounded outside the render code.** Cloudflare's own
  guidance is a queue or a workflow in front of the work, one browser
  per message, rather than a loop that launches N of them
  ([limits](https://developers.cloudflare.com/browser-run/limits/)).
  Those are the `cloud-service/queues` and `cloud-service/workflows`
  components; the choice between them is theirs to explain.
- **Tabs are cheaper than browsers.** Several `newPage()` calls in one
  browser use one concurrency slot; several browsers use several.

## Where the output goes

`/screenshot` and `/pdf` return bytes. Bytes returned straight to a
caller are bytes re-rendered on the next request, at full price.
Anything generated more than once — an Open Graph image, an invoice, a
report — is written to the object store, the `cloud-service/r2`
component, and the response carries a reference to it. Key layout,
lifecycle and the presigned-URL question are that component's doctrine
and are not restated here.

The bill is a good proxy for this decision: rendering is charged by
time, storage is charged by byte, and a render that could have been a
lookup is the expensive half of the pair.

## What the product owes the sites it renders

Rendering the product's own pages raises nothing here. Rendering anyone
else's raises three things, and all three are judgment rather than
configuration:

- **`robots.txt` is advisory and this service does not enforce it.**
  Cloudflare says so plainly, and points site owners at WAF rules
  instead
  ([robots.txt and sitemaps](https://developers.cloudflare.com/browser-run/reference/robots-txt/)).
  So honouring it is the product's choice, and a crawler that ignores it
  has made a decision that belongs in the blueprint rather than in a
  client option.
- **The requests are provably Cloudflare's.** `cf-brapi-request-id`,
  `cf-brapi-devtools`, `cf-biso-devtools` and the Web Bot Auth
  `Signature` / `Signature-Input` headers cannot be removed or
  overridden, and the crawl endpoint's `CloudflareBrowserRenderingCrawler/1.0`
  User-Agent cannot be changed
  ([automatic request headers](https://developers.cloudflare.com/browser-run/reference/automatic-request-headers/)).
  Any design that depends on the render being indistinguishable from a
  person is a design this service cannot support.
- **Rate is the product's to limit.** Nothing here paces requests to a
  single origin; the account-wide ceiling is not a politeness budget.
  A per-origin delay is the crawler's own, and the `/crawl` endpoint's
  own per-plan caps are a floor rather than a policy.

**Rendering the product's own site as a crawler-ready snapshot is the
one case with none of this in it**, and it is what the pre-render
pattern is for
([pre-render pages for crawlers](https://developers.cloudflare.com/browser-run/how-to/pre-render-pages/)).

## What this component stays silent on

**Which test framework asserts against the render.** This service opens
browsers; a testing stack is the project's own choice and its own
component.

**Whether a browser build with an extension, or a session measured in
hours, is needed.** That is a self-run browser in a container, and the
`cloud-service/containers` component owns what that costs.

**The managed crawl-and-index pipeline.** `cloud-service/ai-search`
calls this service to fetch pages; what it does with them afterwards is
that component's doctrine and none of it is repeated here.
