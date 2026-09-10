# Cost shape — Cloudflare Email Service

The provider's billing principle is **seats, not traffic**, and it is
about the private plane; the `cloudflare` skill's cost doctrine owns it
and says explicitly that every other service this stack offers bills by
consumption instead. This file states what that consumption is for this
one service. No dollar figures — the billing model and its traps are what
stay true.

## The meter

**Outbound messages, and nothing else.** Sending requires the Workers
Paid plan, comes with a monthly included allowance, and charges per
thousand messages beyond it; the allowance runs on the subscription
billing cycle rather than a calendar month
([pricing](https://developers.cloudflare.com/email-service/platform/pricing/)).

**Inbound is unlimited on both the free and the paid plan**
([pricing](https://developers.cloudflare.com/email-service/platform/pricing/)),
which is the shape worth carrying forward: routing an address into a
Worker costs nothing at this meter. What it does cost is Workers — an
Email Routing Worker is billed as Workers usage
([pricing](https://developers.cloudflare.com/email-service/platform/pricing/))
— so the handler's own compute is on the hosting component's bill, not
this one's. A handler that parses every inbound MIME body is a Workers
cost decision wearing an email costume.

## What counts, and what does not

The line is drawn at acceptance, and it is drawn in a way that rewards
checking first
([pricing](https://developers.cloudflare.com/email-service/platform/pricing/)):

| Outcome | Counts |
| --- | --- |
| Accepted by the service | yes |
| Hard-bounced | yes |
| Rejected at the API boundary | no |
| Blocked by the suppression list | no |
| Sent to a verified destination address | no — free |

**A hard bounce is billed.** So sending to an address the service has
already recorded as bad pays for the message *and* damages the sending
reputation, and the suppression check that avoids it costs nothing
([hard bounce handling](https://developers.cloudflare.com/email-service/examples/email-routing/hard-bounce-handling/)).
This is the one place where a hygiene practice and a cost control are the
same action.

**Sends to verified destination addresses are free**, and that is the
fact most worth designing around. A health probe, a smoke test and an
end-to-end assertion all need a real send to prove anything, and all
three can address a verified sink the account owns — so the test path
costs nothing while the product path is metered. The alternative, mocking
the send in every environment, proves that the mock works.

## Trap one: the daily limit is granted, not provisioned

New accounts begin with conservative daily sending limits that scale up
over time based on sending behaviour, deliverability and account
standing, with a form to request an increase
([limits](https://developers.cloudflare.com/email-service/platform/limits/)).

There is no plan to upgrade to make that number jump. For a product
whose volume grows with its users, the ramp and the growth line up. For a
launch that must send a large batch on a known date — a migration
notice, an invitation wave — the headroom is requested in advance or the
batch fails partway through, and "partway through" is the expensive
version because the retry logic then has to know which recipients already
received it.

## Trap two: the fan-out is invisible in the design

Fifty recipients combined across `to`, `cc` and `bcc`
([limits](https://developers.cloudflare.com/email-service/platform/limits/)),
so anything addressed to more than that is several messages, and the
meter counts messages. A weekly digest to an audience is one line in a
flow diagram and a five-figure monthly count on the bill. Where a
notification could reasonably be one message to a shared address rather
than one per person, that is a design decision with a direct cost
consequence — and it is taken in the blueprint, not discovered in a
review.

## Trap three: the retry that is a second bill

There is no idempotency key, so a retried send is a new message and a new
charge, on top of being a duplicate in someone's inbox. A retry loop
around a failure whose code says the sender is not verified will bill for
every attempt and fix nothing —
[service doctrine](service-doctrine.md) is where the branch on the error
code belongs, and the cost is the second reason to take it seriously.

## The sizing question

Not "which plan" — sending is Paid-plan-only and there is no tier above
it to choose — but **"how many outbound messages does one user-month
generate, and which of them are actually necessary"**. The first is
countable from the flows in the blueprint before any code exists. The
second is the question that gets asked once the number is written down.

Never write dollar figures. They change; the shape does not.
