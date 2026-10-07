# Decision — fnox is the development-only secrets provider, and no repo carries an encrypted secret

**Date** 2026-10-07 · **Branch** `2026-10-07-fnox-dev-only-doctrine` · **Plan**
[`docs/plans/2026-10-07-fnox-dev-only-doctrine/`](../../plans/2026-10-07-fnox-dev-only-doctrine/index.md)
· **Reverses** in part
[`2026-09-06-secrets-store-is-runtime-not-development.md`](./2026-09-06-secrets-store-is-runtime-not-development.md),
and the secrets contract's encrypt-into-git allowance · **Backlog** none

## The ruling

- **fnox serves the development environment only.** The OS keychain is the
  default provider; any single secret may instead reference a cloud store fnox
  supports, mixed per secret.
- **No encrypted secret ever enters a repo** — no age, no KMS, no committed
  ciphertext.
- **Every product follows one split.** The development manager on a developer's
  machine; **CI's secrets from the forge** (GitHub or GitLab); **staging and
  production secrets from the cloud provider**, where neither mise nor fnox
  runs.
- **The rule is contract-wide.** `assets/contracts/secrets.md` states the split
  and loses the allowance, and every provider pack is held to it, not fnox
  alone.
- **The guard goes with the mode.** `hooks/fnox-ciphertext-guard.sh`, the
  `permanent-ciphertext.md` reference and the four-condition doctrine (the
  gitleaks path allowlist, the mempalace exclude of `fnox.toml`, the
  `.gitignore` age lines) are deleted. There is no cleanup mechanism: a guard an
  earlier materialization landed in `.claude/hooks/` is inert while no age or
  KMS provider exists, and may be deleted by hand.

## The two reversed rules

1. **fnox for CI.** The 2026-09-06 decision ruled that a repo pins
   "`capability-provider/fnox` for the developer machine and CI". Its rationale
   was that one injector should wrap every task wherever it runs, so a pipeline
   decrypts or fetches with the same tool a laptop uses. CI now takes its
   secrets from the forge: the forge already holds a pipeline's credentials, and
   a CI step that authenticates to the development manager is one more
   long-lived credential to leak. The runtime half of that decision — Secrets
   Store holds staging and production — stands.
2. **The encrypt-into-git allowance.** The contract offered the mode "under four
   conditions", and fnox engaged it through age or KMS, on the rationale that
   ciphertext in git makes onboarding a public key plus a re-encrypt and keeps
   the secrets beside the code that reads them. It retires: committed ciphertext
   is permanent — a leaked key decrypts every past commit — and three of the
   four conditions sat outside the pack's boundary, needing hand-applied blocks
   and a guard hook to hold.

## The split with bootstrap

This ruling changes **doctrine only**. The fnox **config shape** — a
`development` and a `ci` profile, `FNOX_PROFILE` from the mise environment, a
`setup:secrets` prompt for each missing development secret — belongs to the
bootstrap project (`~/Projects/github.com/virajp/bootstrap`), which renders
`.config/fnox.toml` and `setup:secrets` as one of its core tools, and is parked
there. The fnox pack's shipped `config/fnox.toml`,
`config/.config/mise/tasks/setup/secrets` and `templates/` are unchanged; the
doctrine describes what the pack ships today and names the profile shape as
bootstrap's.

## Rejected

- **Keeping encrypt-into-git for staging.** It keeps the permanent-ciphertext
  risk for the environment where a leak costs most, and staging's secrets
  already have a home in the cloud provider.
- **A guard hook** in place of the mode — a provider guard refusing an age or
  KMS provider. With no mode to engage, a guard only guards against a config
  nobody ships.
- **fnox in CI**, or serving deployed environments — reversed above.
- **A full config rework in the pack.** The config shape is bootstrap's; doing
  it here would be rewritten there.
- **Retiring the fnox pack now.** It is still the provider `/vwf:init` lands
  until bootstrap replaces it.
- **A `stackgen-sync` cleanup rule** removing an unchanged, no-longer-shipped
  file, or a one-off fnox detector — declined; the stale hook is inert and the
  docs say so.
