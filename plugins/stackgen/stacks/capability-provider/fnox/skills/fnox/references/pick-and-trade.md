# fnox — pick & trade

The axis this category is chosen on is **where the secret lives, and what
onboarding a teammate costs** (stackgen's secrets contract, "What this
contract does not decide"). fnox's answer: **on the developer's own machine**
— in the OS keychain, or behind a reference into your own cloud store — and
onboarding is populating your own keychain. It serves the development
environment alone; CI takes the forge's variables and staging and production
the cloud provider's store.

That is a different answer from a hosted platform's, not a better one. The
contract declines to rank them, and so does this file: what follows is what
picking fnox buys and what it costs, so the comparison can be made against
clauses rather than against marketing.

## When it is the answer

- **You do not want a third party in the development loop.** No vendor
  account, no vendor outage, no per-seat bill. For a solo maintainer or a
  small team this is often the entire argument.
- **The config should be reviewable.** `fnox.toml` is a committed file of
  names and lookups, so which secrets exist and which provider backs each one
  arrive through code review like anything else.
- **Nothing secret should ever be in the repo.** Every value is outside the
  tree, so there is no history to re-key and nothing for a scanner to
  allowlist.
- **You already have a cloud secrets store and want one interface.** A cloud
  reference puts AWS Secrets Manager, Vault, 1Password and the rest behind
  the same `fnox exec --` boundary, so the product's read path stays
  identical whichever backend a given secret uses.

## When it stops being the answer

- **When a development secret must be shared centrally and audited.** The
  keychain is per machine and records no reads. Reference that secret into a
  cloud store instead — the store's IAM and access log then answer — or pick
  a hosted platform for development too.
- **When a non-engineer must set a secret.** The workflow is a CLI. There is
  no web UI to hand to someone who does not have the repo.
- **When you wanted one tool for every environment.** fnox is not that tool
  here by design; CI and the deployed environments have their own sources.

## One provider by default, a cloud reference where it earns it

**The keychain** is the shipped default: values in the OS keychain, only the
entry name in `fnox.toml`. Nothing to run, nothing to pay for, works offline.

**A cloud reference** (AWS Secrets Manager or Parameter Store, Azure, GCP,
1Password, Bitwarden, Infisical, Vault) puts only a pointer in `fnox.toml`.
It beats the keychain when a value is shared by the team and rotated
centrally, or when access to it must be revocable and logged; the cost
becomes that store's bill and its availability ([cost shape](cost-shape.md)).

They are chosen **per secret**, in one config.

## The choice this does not make

Whether the product must have a secrets manager at all is a vwf-side
statement, not this pack's — the contract says so explicitly. This file
answers only "if one, why this one".
