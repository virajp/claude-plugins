---
name: fnox
axis: backing
kind: capability-provider
components:
- capability-provider/fnox@3.0.0
---

# Backing — fnox

The development environment's secrets manager: a committed `fnox.toml` of
names and lookups, each secret's value in the OS keychain by default or behind
a reference into your own cloud store, the two mixing per secret. Nothing
secret is ever in the repo. No vendor account, no per-seat bill, nothing to
reach at install time.

**The composition is stackgen's neutral secrets contract plus this one
manager, for development only.** The contract leads with the rule that
outranks the rest — a secret reaches a process as an environment variable,
injected by a wrapper around the repo's own task — which fnox satisfies
without an SDK: `fnox exec -- mise run <task>`, and nothing downstream knows
fnox exists. CI runs the same task with the forge's own secret variables
(GitHub or GitLab) and no fnox; staging and production take their secrets from
the cloud provider's store and run neither mise nor fnox.

The axis this is chosen on is **where the secret lives, and what onboarding a
teammate costs**. Here: on each developer's machine, and onboarding is
populating your own keychain. That is a different answer from a hosted
platform's, not a better one — the argument belongs in the component's
pick-and-trade reference, and neither the contract nor this bundle ranks them.

**What it lands in the repo.** Nothing of its own. The tool's pin, its
config and the secrets check are bootstrap's: the config is a seed the repo
owns once it lands, and `mise run setup` checks that the tool is reachable
and the secrets are configured. The local override file, `fnox.local.toml`,
is gitignored by the repo's `.gitignore`. It ships no hook and asks for no
scanner, gitignore or mining edit. The
profile shape — a development and a `ci` profile under `FNOX_PROFILE` — is
the repo's setup tool's to render, not this pack's.

Full judgment: the component's own skill and its references. The contract it
cites is stackgen's secrets contract.
