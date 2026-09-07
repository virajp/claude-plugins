# Pick & trade — Cloudflare Email Service

## When this is the answer

- **The domain is already on Cloudflare.** This is the signal that
  decides it. Onboarding a sending domain creates the bounce MX, SPF,
  DKIM and DMARC records automatically when the zone's DNS is here
  ([domains](https://developers.cloudflare.com/email-service/configuration/domains/)),
  so the setup a third-party provider turns into a support ticket is a
  dashboard step. On a zone hosted elsewhere the same records are typed
  by hand, and the advantage is most of the argument.
- **The compute is already Workers.** The send is a binding call from
  the runtime that issued it: no API key in the request path, no secret
  to rotate, no outbound HTTP to a provider that can be down separately
  from the product
  ([Workers API](https://developers.cloudflare.com/email-service/api/send-emails/workers-api/)).
- **The mail is transactional.** Receipts, password resets, invitations,
  alerts. Cloudflare states the service is "currently intended
  exclusively for transactional emails"
  ([FAQ](https://developers.cloudflare.com/email-service/reference/faq/)),
  and that is exactly the traffic a product generates from its own
  flows.
- **Inbound matters too.** Routing an address on the product's domain
  into a Worker turns email into an input — a reply-to-ticket path, an
  ingest address, a bounce handler — and inbound is unlimited on both
  plans
  ([pricing](https://developers.cloudflare.com/email-service/platform/pricing/)).
  A provider that only sends leaves that half to a second vendor.

## When a third party still wins

- **The mail is marketing.** Campaigns, segments, scheduled sends,
  subscriber lists, open and click tracking, unsubscribe management as a
  managed surface. Cloudflare names support for marketing and bulk
  sender tools as future work rather than a current feature
  ([FAQ](https://developers.cloudflare.com/email-service/reference/faq/)),
  so this is a gap in the product and not a gap in the doctrine.
- **Templates are a product surface.** There is no template store, no
  visual editor and nothing a non-engineer edits. Message bodies are
  built in code — Cloudflare's own examples reach for `mimetext`
  ([route emails](https://developers.cloudflare.com/email-service/get-started/route-emails/))
  — so a product whose copy is owned by marketing gets a deployment for
  every wording change, which is usually the reason a template service
  was bought in the first place.
- **Deliverability is being actively worked.** Reputation dashboards,
  seed-list testing, per-domain warmup consoles, complaint feedback
  loops as a reporting product: the tooling a team assembles when
  inbox placement is a business metric rather than a background
  assumption.
- **Volume is the point, and it is growing fast.** New accounts start at
  conservative daily limits that "scale up over time based on your
  sending behavior, deliverability rates, and account standing", with a
  form to request an increase
  ([limits](https://developers.cloudflare.com/email-service/platform/limits/)).
  That is a fine shape for a product whose volume tracks its users, and
  a poor one for a launch that must send a large batch on a known date.
- **The recipients per message exceed the ceiling.** Fifty combined
  across `to`, `cc` and `bcc`
  ([limits](https://developers.cloudflare.com/email-service/platform/limits/)).
  A digest to a large list is many sends, which is the right shape
  anyway — but it makes the fan-out the product's problem.

## Receiving: Email Workers versus a mailbox provider's webhooks

The alternative to routing an address into a Worker is a hosted mailbox
that posts parsed messages to an HTTP endpoint. The trade is narrow and
worth stating:

- **A Worker gets the message before anything stores it**, in the same
  runtime the rest of the product runs in, with the same bindings. There
  is no webhook signature to verify, no retry queue owned by someone
  else, and no mailbox accumulating a copy of every message the product
  already processed.
- **A mailbox provider gets you a mailbox**, which is what you want when
  a human also needs to read the thread. Routing rules can forward to a
  verified address as well as to a Worker
  ([Email Service](https://developers.cloudflare.com/email-service/)),
  so the two are not exclusive — the rule that hands support mail to a
  Worker can also forward it.
- **Parsing is yours either way here.** `message.raw` is a stream, and
  MIME is a library's job
  ([email handler](https://developers.cloudflare.com/email-service/api/route-emails/email-handler/)).
  A provider that delivers already-parsed JSON has done work this one
  leaves to `postal-mime`, and that work is not nothing.

## The trade, stated plainly

What is given up: a template and campaign surface, deliverability
tooling as a product, and headroom that is granted rather than
provisioned. What is gained: no API key on the send path, DNS the
platform configures on a domain it already hosts, inbound routing into
the same runtime at no charge, and a bill that starts at an included
monthly allowance
([pricing](https://developers.cloudflare.com/email-service/platform/pricing/)).

That trade is worth taking for a product's own transactional mail on a
zone that is already here. It is rarely worth taking as a migration away
from a marketing platform, because the thing being migrated is not the
sending.
