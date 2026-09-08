# Service doctrine — Cloudflare Email Service

This component realizes the `email` capability. **There is no neutral
contract file for it** — `assets/contracts/` carries datastore, secrets,
observability and local-stack doctrine, and messaging is not among them
— so unlike a datastore component this file has no clause list to
answer, and states the service's own discipline instead. If a messaging
contract is ever written, this is the file that owes it an answer.

## Sending

**The binding is the whole send path in a Worker.** `send()` takes `to`,
`from` and `subject`, with `html`, `text`, `cc`, `bcc`, `replyTo`,
`attachments` and `headers` optional, and returns a `messageId`
([Workers API](https://developers.cloudflare.com/email-service/api/send-emails/workers-api/)).
Two other doors reach the same service — a REST endpoint authenticated
with an account API token
([REST API](https://developers.cloudflare.com/email-service/api/send-emails/rest-api/))
and SMTP submission
([SMTP](https://developers.cloudflare.com/email-service/api/send-emails/smtp/))
— and both exist for callers that are not Workers. **A Worker that
reaches for the REST API is a Worker that has given itself a credential
to hold for no reason**, and that is worth catching in review.

**Send both `html` and `text`.** They are separate optional fields, so a
message with only one is trivially constructible and is what a client
without HTML rendering, or a spam filter reading for a plain part, sees
as an empty message.

**Accepted is not delivered, and the API says so structurally.** The
REST response's `result` splits the recipients into `delivered`,
`queued` and `permanent_bounces`
([REST API](https://developers.cloudflare.com/email-service/api/send-emails/rest-api/)).
Anything that treats a call which did not throw as a message that
arrived has discarded that distinction. Where the flow's correctness
depends on arrival — an invitation, a password reset — the design needs
an answer for the bounce, and that answer is the receive side's
(below), not a retry.

**Errors are coded, and the codes are the branch.** Failures arrive as
errors carrying a `code` — `E_SENDER_NOT_VERIFIED`,
`E_RATE_LIMIT_EXCEEDED` and the rest of the documented table
([Workers API](https://developers.cloudflare.com/email-service/api/send-emails/workers-api/)).
The distinction that matters operationally is between a configuration
fault, which no retry will fix and which should page someone, and a rate
limit, which is the one case where backing off is the right move.
Catching every error into one log line erases it.

**Retries need an idempotency story the platform does not provide.**
There is no request key that makes a repeated send a no-op, so a retried
send is a second email. Two shapes work, and the choice belongs in the
blueprint rather than in the catch block:

- **Do not retry a user-visible message.** Record the failure against
  the thing that triggered it and let a person or a later flow decide.
  A duplicate password-reset mail is worse than a missing one.
- **Retry behind a claim the product owns.** If the send is driven from
  a queue or a workflow, the deduplication key is that record's — mark
  it sent before or atomically with the send, and accept the failure
  mode you have chosen. Cloudflare's own durable primitives are their
  own components (`cloud-service/queues`,
  `cloud-service/workflows`), and this component neither ships nor
  implies one.

**Restrict the binding per environment.** `destination_address`,
`allowed_destination_addresses` and `allowed_sender_addresses` are
optional keys on the binding entry, and an unrestricted binding may send
to any verified destination in the account
([send bindings](https://developers.cloudflare.com/email-service/configuration/send-bindings/)).
In a non-production environment, an allowlist is what makes reaching a
real customer **impossible** rather than merely unlikely — the failure
becomes an error at the binding instead of a delivered message with an
apology after it.

**Check the suppression list before sending where the address is not
freshly supplied.** Cloudflare's own hard-bounce guidance is to consult
it and abort for a suppressed recipient
([hard bounce handling](https://developers.cloudflare.com/email-service/examples/email-routing/hard-bounce-handling/)),
and sends blocked by it are rejected at the API boundary rather than
charged
([pricing](https://developers.cloudflare.com/email-service/platform/pricing/)).
Repeatedly sending to a known-bad address is how a sending reputation is
spent.

**The ceilings shape the message, not the infrastructure.** Fifty
recipients combined across `to`, `cc` and `bcc`; a 998-character subject
per RFC 5322; 5 MiB for a message, 25 MiB only to a verified
destination; 16 KB of custom headers in total
([limits](https://developers.cloudflare.com/email-service/platform/limits/)).
A digest to a large audience is therefore many sends and a fan-out the
product owns, and an attachment-heavy message is a link to a stored
object — which is `cloud-service/r2`'s job, not this one's.

## Receiving

**A routing rule pairs an address pattern with a destination**, either a
verified mailbox or a Worker exporting `email()`
([Email Service](https://developers.cloudflare.com/email-service/)),
with a catch-all rule for whatever the specific rules missed
([Terraform resources](https://developers.cloudflare.com/api/terraform/resources/email_routing)).
That rule is **account state, not repository state**: nothing in
`wrangler.jsonc` declares it, so an environment's routing is configured
alongside its DNS and reviewed there. A Worker deployed without its rule
is a handler nothing ever calls, and it fails silently.

The handler gets `message`, `env` and `ctx`, so every other binding the
Worker holds is available to it — the inbound path can write to a
datastore, enqueue work or send a reply with the same `env.EMAIL`
([email handler](https://developers.cloudflare.com/email-service/api/route-emails/email-handler/)).
What the message offers is deliberately low-level: `from` and `to` are
the **envelope** addresses, `headers` carries the parsed header set,
`raw` is a stream of the MIME body, `rawSize` its length, and
`canBeForwarded` says whether forwarding is even available for this
message.

**Envelope and header addresses are different values, and trusting the
wrong one is the security bug this API makes available.** `message.from`
is the envelope sender; a `From:` header inside the body is text the
sender wrote. Authorization decisions — "is this reply from the person
who owns the ticket" — read the envelope, and even that is only as
trustworthy as SPF and DKIM make it, so anything consequential is keyed
on a token the product itself put in the address or the subject rather
than on an address at all.

**Three verbs, and choosing between them is the handler's whole job**
([email handler](https://developers.cloudflare.com/email-service/api/route-emails/email-handler/)):

- **`forward(rcptTo, headers?)`** — hand the message on to another
  address, optionally with added headers. The address must be a verified
  destination.
- **`reply(message)`** — answer in the same thread with an
  `EmailMessage`. Threading is not automatic: Cloudflare's examples set
  `In-Reply-To` and `References` from the original's `Message-ID`
  ([route emails](https://developers.cloudflare.com/email-service/get-started/route-emails/)),
  and a reply without them starts a new conversation in every client.
- **`setReject(reason)`** — refuse with a permanent SMTP error. This is
  the right answer for an address the product has retired or a message
  it will never process: the sender is told now, by their own mail
  server, instead of receiving silence. Rejecting is a decision to
  make explicitly; the documentation does not state what an unhandled
  exception or an empty handler does, so do not rely on either as an
  implicit reject.

**Parsing is a library's job.** `postal-mime` reads `message.raw` and
`mimetext` builds the reply, wrapped in `EmailMessage` from
`cloudflare:email`
([route emails](https://developers.cloudflare.com/email-service/get-started/route-emails/)).
Hand-parsing MIME is a decision to reimplement encodings, multipart
boundaries and header folding, and it goes wrong on the first message
from a client nobody tested against.

**Guard the handler by size and shape before doing work.** `rawSize` is
available without reading the stream, and inbound accepts up to 25 MiB
([limits](https://developers.cloudflare.com/email-service/platform/limits/))
— which is a large parse to run on every message that arrives at a
public address.

## DNS and verification

The zone carries both halves' records, and they do not overlap: sending
records — MX for bounces, SPF, DKIM — sit under a `cf-bounce.`
subdomain with DMARC on `_dmarc`, while routing's MX and its own DKIM
selector sit on the root
([domains](https://developers.cloudflare.com/email-service/configuration/domains/),
[email authentication](https://developers.cloudflare.com/email-service/concepts/email-authentication/)).
Cloudflare creates them at onboarding and may hold them locked, meaning
the service manages the record and it cannot be edited until unlocked.
`dig` against the documented names is how propagation is confirmed
([postmaster](https://developers.cloudflare.com/email-service/reference/postmaster/)).

Two rules follow. **Never write a record's value from memory** — read it
from the dashboard or the API for that zone; an SPF or DKIM value typed
approximately produces mail that is accepted and then filtered, which is
the slowest failure available. And **a domain is not an environment**:
each environment sends from its own zone or its own onboarded subdomain,
because a shared sending domain means a staging mistake spends
production's reputation, and reputation is not recoverable by rolling
back a deploy.

## What the capability commits to

`email` is one of the three channels `messaging` can realize, alongside
`push-notifications` and `sms`, in stackgen's taxonomy. A
blueprint that names the `email` capability is answered by this
component and by nothing else in this stack; the other two channels have
no Cloudflare component here at all, so a product needing them has a
provider to choose rather than a binding to add.
