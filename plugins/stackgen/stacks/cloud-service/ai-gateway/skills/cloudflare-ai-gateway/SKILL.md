---
name: cloudflare-ai-gateway
version: 0.1.0
category: development
description: >-
  Cloudflare AI Gateway as the single plane in front of every model call
  this product makes — when a gateway earns its hop and when it does not,
  the URL and binding shapes a project writes, cache, rate-limit, retry and
  fallback policy, what is safe to log, the bill it does and does not
  change, the token permission and where the upstream provider key lives,
  and why there is no local form of it.
license: MIT
allowed-tools: Read Grep Glob Edit Write Bash
---

# Cloudflare AI Gateway

One URL in front of every model call — to Workers AI or to any third-party
provider — carrying caching, rate limiting, logging, retries and fallbacks,
and holding the upstream keys so the Worker never does. This skill carries
the judgment; the current provider list, the exact request shapes and the
dashboard belong to Context7 at use time.

Read the reference that matches what you are doing — one, not all of them.

| Doing | Read |
| --- | --- |
| Deciding whether the model calls belong behind a gateway | [Pick & trade](references/pick-and-trade.md) |
| Setting cache, rate-limit, retry, fallback or logging policy | [Service doctrine](references/service-doctrine.md) |
| Sizing, or explaining, the bill | [Cost shape](references/cost-shape.md) |
| Granting the API token, or placing the provider key | [Identity shape](references/identity-shape.md) |
| Running or testing the project on a laptop | [Local dev](references/local-dev.md) |

**Three rules that do not wait for a reference.** The **gateway id is
environment configuration**, never a constant in the source — one gateway
per environment, because the cache, the logs, the rate limit and the spend
limit are all per gateway. A **fallback changes which model answered**, so
the step the response names is logged with the answer or the product cannot
say afterwards what produced it. And a gateway with stored provider keys and
`authentication` left off is a **URL that spends those keys for anyone who
learns two ids** — the default is off, so the choice is made by omission
unless it is made deliberately.

The rule this skill leans on hardest is that the gateway is a **plane, not a
model**. It does not decide which model to call, it does not make one
cheaper, and it does not remove the secret — it moves the provider key
server-side and hands the Worker a gateway token instead, which is a secret
under the `cloudflare` skill's identity and IAM doctrine like any other.
