---
name: fnox
version: 0.1.0
category: development
description: fnox as this product's development secrets manager — values in
  the OS keychain or referenced in your own cloud store, nothing secret in the
  repo, CI and deployed environments served elsewhere. When it is the right
  pick, how it satisfies the secrets contract, the injection boundary and
  credentials, cost shape, and the local stack. Auto-applies when editing
  fnox.toml.
license: MIT
user-invocable: false
allowed-tools: Read Grep Glob Edit Write Bash
paths:
  - "**/fnox.toml"
  - "**/fnox.local.toml"
---

# fnox

The development environment's secrets manager. This skill carries the
judgment; the CLI and provider surface belong to Context7 at use time.

Read the reference that matches what you are doing — one, not all of them.

| Doing | Read |
| --- | --- |
| Choosing, or questioning, this manager | [Pick & trade](references/pick-and-trade.md) |
| Adding a secret, onboarding, offboarding | [Contract satisfaction](references/contract-satisfaction.md) |
| Wiring the injector, credentials, `environment.md` | [Integration & access shape](references/access-shape.md) |
| Weighing a cloud reference, or a surprise bill | [Cost shape](references/cost-shape.md) |
| Running the harness locally, or the same task in CI | [Local stack](references/local-stack.md) |

**The rule that does not wait for a reference:** the injector wraps the
repo's own task — `fnox exec -- <task>` — and never the application.
Everything downstream of that boundary knows only that the variables are set.

**The second rule that does not wait:** nothing in `fnox.toml` is a value —
every entry names a keychain or cloud provider. fnox serves development only;
CI takes the forge's variables and staging and production the cloud
provider's store.
