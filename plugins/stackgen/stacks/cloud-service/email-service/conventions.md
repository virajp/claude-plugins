# Cloudflare Email Service — conventions

The product's email provider, run on a domain the product already owns.
A Worker sends transactional mail through a binding, and mail arriving at
an address on the zone is routed back into a Worker — one service with
two halves, and the halves are configured, billed and tested separately.

**One product, two names that predate it, and both are still in use.**
Cloudflare gathers the whole surface under **Email Service**
([Email Service](https://developers.cloudflare.com/email-service/)), and
inside it keeps **Email Sending** for the outbound half and **Email
Routing** for the inbound one — the same two names appear on the DNS
records each half needs
([domains](https://developers.cloudflare.com/email-service/configuration/domains/)).
**Email Workers** is not a third product: it is the name for the shape
where a routing rule's destination is a Worker exporting an `email()`
handler rather than a mailbox. So a search that lands on Email Routing
documentation has landed in the right place; this component is stated
once here and not renamed again.

## The send side

**The binding is the access path, and it carries no credential.** A
Worker declares `send_email`, reads the name off `env`, and calls
`send()` with the message
([Workers API](https://developers.cloudflare.com/email-service/api/send-emails/workers-api/)).
There is no API key in the request path, which is the whole reason to
prefer this over a third-party provider when the domain is already here.
The same message can be sent over a REST endpoint with an account API
token, or over SMTP, for callers that are not Workers
([REST API](https://developers.cloudflare.com/email-service/api/send-emails/rest-api/)).

`send()` takes `to`, `from` and `subject` as required fields, with
`html`, `text`, `cc`, `bcc`, `replyTo`, `attachments` and `headers`
optional, and returns a `messageId`; it throws errors carrying a `code`
such as `E_SENDER_NOT_VERIFIED` or `E_RATE_LIMIT_EXCEEDED`, which is
what makes those two failures distinguishable in a log
([Workers API](https://developers.cloudflare.com/email-service/api/send-emails/workers-api/)).
The `from` address must belong to a domain onboarded to the service
([send bindings](https://developers.cloudflare.com/email-service/configuration/send-bindings/)).

**A binding can be narrowed, and narrowing it is a design decision rather
than a hardening step.** Four shapes are documented, and the difference
between them is which mistakes become impossible
([send bindings](https://developers.cloudflare.com/email-service/configuration/send-bindings/)):

| On the binding entry | The binding may send |
| --- | --- |
| nothing | to any verified destination address in the account |
| `destination_address` | only to that one address |
| `allowed_destination_addresses` | only to addresses on that list |
| `allowed_sender_addresses` | only *from* addresses on that list |

## The receive side

**A routing rule pairs an address pattern with a destination**, and the
destination is either a verified mailbox or a Worker with an `email()`
handler
([Email Service](https://developers.cloudflare.com/email-service/)). A
catch-all rule covers everything the specific rules did not
([Terraform resources](https://developers.cloudflare.com/api/terraform/resources/email_routing)),
and a destination mailbox is verified before it can be routed to.

The handler receives the message, the environment and the execution
context; `message.forward()` hands it to another address,
`message.reply()` answers it with an `EmailMessage`, and `message.raw` is
the stream a MIME parser reads
([email handler](https://developers.cloudflare.com/email-service/api/route-emails/email-handler/)).
Parsing and message construction are library work, not platform work —
Cloudflare's own examples use `postal-mime` to read and `mimetext` to
build, with `EmailMessage` from `cloudflare:email` as the wrapper
([route emails](https://developers.cloudflare.com/email-service/get-started/route-emails/)).

## The DNS is the zone's, and the two halves do not share it

Sending records sit on a **`cf-bounce.` subdomain** — MX to return
bounces, SPF authorizing Cloudflare to send, DKIM for signing — with
DMARC on `_dmarc`; routing records sit on the **root** domain, with its
own MX set and a different DKIM selector
([domains](https://developers.cloudflare.com/email-service/configuration/domains/),
[email authentication](https://developers.cloudflare.com/email-service/concepts/email-authentication/)).
Cloudflare creates them during onboarding and can hold them locked; the
values are the platform's and are never invented, read back with `dig`
against the documented names
([postmaster](https://developers.cloudflare.com/email-service/reference/postmaster/)).

**This is the one thing pinning the component cannot lay down.** Every
other decision here is code and configuration in the repository; the
zone's records are account state, and a product whose domain is not on
Cloudflare has a prerequisite rather than a setting.

## The binding block, and where it goes

**This pack ships no `wrangler.jsonc`.** A project pinning Email Service
adds the entry below to the file its hosting pack already owns at the
repo root — `workers-ssr`'s or `workers-static-assets`':

```jsonc
{
  "send_email": [
    {
      "name": "EMAIL",
      "allowed_destination_addresses": [
        "ops@example.com"
      ]
    }
  ]
}
```

`name` is what the Worker reads off `env`; the restriction key is
optional and is the environment guardrail described above. Nothing in
that block is a secret — see the `cloudflare-email` skill's identity
shape for what is.

The receive half has **no entry in this file at all**: a routing rule is
account state pointing at a deployed Worker, not a binding the Worker
declares. The only thing the code carries is the exported `email()`
handler.

## What this component is not

**It is transactional email, by Cloudflare's own statement.** The service
is "currently intended exclusively for transactional emails", with
marketing and bulk sender tooling named as future work
([FAQ](https://developers.cloudflare.com/email-service/reference/faq/)).
A product with a campaign surface — segments, templates, unsubscribe
management, open tracking — needs a marketing provider beside this one,
and pinning this component does not answer that need.

**It is one channel of three.** `messaging` covers email, push
notifications and SMS, and this component realizes `email` alone, in
stackgen's taxonomy. A product that also notifies a device or
a phone number pins a different component for each; there is no
Cloudflare answer to the other two in this stack.

Which Cloudflare services this stack offers, plans and declines is the
provider component's to state — see the `cloud-provider/cloudflare`
component's conventions, in this composition's template.

Full judgment: the `cloudflare-email` skill's references. The
provider-wide half — cost doctrine, account roles and API tokens, the
local development map — is the `cloudflare` skill's, cited there and
restated nowhere.
