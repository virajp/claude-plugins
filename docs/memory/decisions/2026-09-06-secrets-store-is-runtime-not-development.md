# Decision — Secrets Store is the runtime store, not a development one

**Date** 2026-09-06 · **Branch** `2026-09-06-cloudflare-media-messaging-secrets`
· **Plan**
[`docs/plans/2026-09-06-cloudflare-media-messaging-secrets/`](../../plans/2026-09-06-cloudflare-media-messaging-secrets/index.md)
· **Extends** the `secrets-manager`-under-two-types placement recorded in
[`2026-09-06-cloud-service-categories-for-twenty-cloudflare-services.md`](./2026-09-06-cloud-service-categories-for-twenty-cloudflare-services.md)

## What was decided before

`secrets-manager` has been a `capability-provider` category since the packs that
fill it landed: `doppler` and `fnox`, the second being the provider `/vwf:init`
question 4 picks by default. Both answer the same question — how a secret
reaches a process on a developer's machine and in CI — and
`assets/contracts/secrets.md` is the neutral contract they cite, whose cardinal
rule is that **a secret reaches a process as an environment variable, injected
at the process boundary — never read by the application from a file**, and whose
injector **wraps the task, not the application**.

Nothing on that axis said anything about staging or production. The contract's
numbered "what a manager must be able to do" list assumes a laptop and a
pipeline throughout, and `fnox`'s own summary — "the local-first secrets manager
— you hold them, encrypted into git or referenced in your own cloud" — says so
plainly. The gap was invisible while every stack this repo shipped deployed a
container whose orchestrator handed it an environment.

## What changed

The user asked for Cloudflare Secrets Store while briefing the twenty-service
Cloudflare effort, with the reason attached: "Include `Secrets Store` as it will
be required if hosting containers in CloudFlare or even Workers." A hosted
Worker has no shell to wrap, so no injector on the developer axis can reach it;
the platform hands it a binding instead.

**The ruling, in the user's words:** *"Secrets Store is NOT for development
environment but for Cloud Environment where applications run in production or
staging"*.

So Secrets Store ships as a `cloud-service` pack — `type: cloud-service`,
`category: secrets-manager`, `kind: cloud-provider`, `axis: backing`,
`capability` unset — reachable as its own bundle `cloudflare-secrets-store`. It
is the runtime store, and only the runtime store.

**The two coexist, and the shared noun is deliberate.** A repo pins both:
`capability-provider/fnox` for the developer machine and CI, and
`cloudflare-secrets-store` for staging and production. Neither replaces the
other, and the taxonomy already carries `secrets-manager` under both types for
exactly this reason — the placement is
[`2026-09-06-cloud-service-categories-for-twenty-cloudflare-services.md`](./2026-09-06-cloud-service-categories-for-twenty-cloudflare-services.md)'s,
recorded before either pack existed. The pack's `capability` comment and its
bundle prose both state the split, so a reader who arrives at either one is told
about the other.

**The pack cites the neutral contract rather than claiming it.** The Workers
binding *is* the process-boundary injection the cardinal rule demands — it is
neither a file the application opens nor an SDK it compiles in — so the pack
cites `assets/contracts/secrets.md` and walks it clause by clause, naming the
one place the model genuinely differs (a `.get()` on the binding rather than a
shell variable already in the environment) as a difference rather than
explaining it away. The clauses about a developer's machine and a pipeline it
does **not** satisfy, which is the correct outcome for a runtime store.

## Rejected

- **A `capability-provider` pack.** It would be a second init-time secrets
  provider, competing with `fnox` at question 4 for a slot it cannot fill: there
  is no laptop-side injection, so it cannot feed a pre-commit hook or wrap a
  mise task. Pinning it would leave a repo with no answer to `setup:secrets`.
- **Folding it into the `cloud-provider/cloudflare` pack.** The provider pack is
  never on the menu as a pin of its own, so a service folded into it cannot be
  pinned, cannot be traded against an alternative, and would carry no bundle for
  `/vwf:architecture` to offer. Every other Cloudflare service is its own pack
  for the same reason.

## Consequences

- **A project may pin both, and that is the expected shape**, not a conflict to
  resolve. Two components sharing one category noun is the taxonomy working, as
  it already is for `key-value` and `vector`.
- **vwf may one day want to split the token by environment.** `secrets-manager`
  has no vwf capability token at all today, and both packs leave `capability`
  unset with the same comment. With two components realizing one noun in
  different environments, minting one token would under-describe them — that is
  vwf's move to make, and it is parked, not scheduled.
- **No other Cloudflare pack describes secret storage.** The three that hold a
  credential of their own — Realtime's app secret among them — point at this
  pack by path rather than restating where a secret lives, the same way they
  cite the provider's identity and cost doctrine.
- **The next plan that touches secrets does not re-open this.** The runtime and
  development halves are separate components by ruling, and moving either one
  needs a fresh decision answering the ground above.
