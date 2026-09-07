# Local dev — Cloudflare Email Service

**Both halves of this service really run on a laptop**, which is not what
a service with a mail network behind it usually manages. Where this row
sits among Cloudflare's other surfaces — which have a local mode, which
have only a remote one, which have neither — is the `cloudflare` skill's
local development map, which this cites rather than restates.

## Sending: simulated, and the simulation is legible

`wrangler dev` intercepts the binding call. Nothing is transmitted:
Wrangler logs the envelope and writes the body to a file under its own
temporary directory, naming the path in the log so the message can be
opened and read
([local development — sending](https://developers.cloudflare.com/email-service/local-development/sending/)).
The shape of that output is roughly:

```text
[wrangler:info] send_email binding called with MessageBuilder:
From: sender@example.com
To: recipient@example.com
Subject: Test Email

Text: /tmp/miniflare-.../files/email-text/<message-id>.txt
```

So the local loop is: start `wrangler dev`, drive the route that sends —
a `curl` at the Worker's own endpoint is enough
([local development — sending](https://developers.cloudflare.com/email-service/local-development/sending/))
— and read the file. That covers the failure this component makes
easiest to miss, which is not delivery but **content**: a template
variable that rendered as `undefined`, an HTML part with no text
alternative, a reply missing its threading headers.

## Receiving: triggered by an HTTP request you make yourself

The `email()` handler has a local endpoint. With `wrangler dev` running,
a POST to `/cdn-cgi/local/email` carrying `from` and `to` as query
parameters and a raw RFC 5322 message as the body — which **must include
a `Message-ID` header** — invokes the handler exactly as an inbound
message would
([local development — routing](https://developers.cloudflare.com/email-service/local-development/routing/)).

That makes the parsing path, the routing branch and the reply
construction all testable without a mailbox, which is more than most
inbound-email designs get. Two things it does not give you:

- **The routing rule is not exercised.** The rule that decides *which*
  messages reach this Worker is account state
  ([Email Service](https://developers.cloudflare.com/email-service/)),
  and nothing local evaluates it. A handler that works perfectly against
  a hand-posted message and is never called in production is the failure
  this hides, and it is caught by checking the rule in the environment,
  not by running the suite again.
- **What `forward()` and `reply()` actually do in a local session is not
  stated on that page.** Verify the behaviour before depending on either
  — and until you have, assume nothing about whether a local forward
  leaves the machine.

Keep a small set of raw messages in the repository as fixtures — a plain
text one, a multipart one, one with an attachment, one from a client that
folds headers oddly — and post them. They are the cheapest regression
suite available for a parser, and they are exactly what a real inbox
eventually delivers.

## The `remote: true` trap, which is the one that matters

Setting `remote: true` on the `send_email` binding routes the local
session's sends to the real service, **and the real service sends real
mail to real recipients**
([local development — sending](https://developers.cloudflare.com/email-service/local-development/sending/)).

The hazard is not the flag; it is that the flag lives in the
configuration file rather than on the command line, so it is set once by
someone debugging a delivery problem and then committed. Three rules:

- **`remote: true` is never committed.** If a delivery question needs
  the real service, set it, answer the question, and revert it in the
  same sitting. A configuration file is a bad place for a temporary
  decision that can email a customer.
- **When it is set, every address is a test address.** Cloudflare's own
  guidance for this mode is to use test addresses to prevent unintended
  deliveries. The stronger version is a
  `destination_address` on the same binding entry, which makes the
  intended recipient the only possible one
  ([send bindings](https://developers.cloudflare.com/email-service/configuration/send-bindings/)).
- **Never in an automated loop.** A watcher, a test setup step or a
  dev-loop task that sends for real spends quota and reputation on
  nobody's behalf, and does it repeatedly.

## Substituting where the local mode is not enough

The local send is a simulation, so it proves the message was constructed
and hands back nothing about delivery. Where a flow's logic branches on
the outcome — a bounce recorded against a user, a retry decision, a
suppression check — put the send behind the product's own seam and stub
that seam in tests. The stub returns the outcomes the real service
returns: accepted, queued, permanently bounced
([REST API](https://developers.cloudflare.com/email-service/api/send-emails/rest-api/)).
Testing against a stub that only ever succeeds tests the happy path and
calls it coverage.

That seam is worth having for a second reason: it is the boundary a
different provider would be swapped in behind, and
[pick & trade](pick-and-trade.md) names the case where one is.

## Staging, and the sink mailbox

The environment above local is where a real send is finally worth making,
and it is affordable: **sends to verified destination addresses are free
and do not count toward the quota**
([pricing](https://developers.cloudflare.com/email-service/platform/pricing/)).
So a verified sink address the environment owns is where the acceptance
suite sends, and reading it back is a real assertion about a real
delivery rather than about a mock.

Two conditions on that, both from
[service doctrine](service-doctrine.md): the environment sends from **its
own** zone or onboarded subdomain, so a staging mistake cannot spend
production's sending reputation, and the staging binding carries
`allowed_destination_addresses` so the suite physically cannot reach
anyone but the sink.

## What does not reproduce locally

- **Deliverability.** SPF, DKIM and DMARC are evaluated by the receiving
  mail server against published DNS
  ([email authentication](https://developers.cloudflare.com/email-service/concepts/email-authentication/)).
  Nothing local touches any of it, so "did it arrive in an inbox rather
  than a spam folder" is a question only a deployed environment and a
  real mailbox can answer.
- **The rate limits and the daily quota.** Limits are enforced by the
  service
  ([limits](https://developers.cloudflare.com/email-service/platform/limits/)),
  so `E_RATE_LIMIT_EXCEEDED` is a branch the local suite will never take
  on its own. Exercise it by injecting the error at the seam.
- **The suppression list.** It lives with the account, so a local run
  cannot discover that a recipient is suppressed
  ([hard bounce handling](https://developers.cloudflare.com/email-service/examples/email-routing/hard-bounce-handling/)).
- **Bounces.** They arrive at the `cf-bounce` records asynchronously,
  minutes or hours after the send
  ([domains](https://developers.cloudflare.com/email-service/configuration/domains/)).
  No local session waits that long, and no local session has the DNS.
