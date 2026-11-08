DECISION 2026-10-05 ★3 | fnox profile shape | two profiles, `development` full
and `ci` empty on purpose, `fnox exec` in every task — a fail-closed CI needs no
per-task condition | alt top-level dev secrets with `FNOX_NO_DEFAULTS` in CI
rejected (fails open)

**Source plan** `2026-10-02-fnox-dev-only`, `2026-10-05-fnox-dev-only` (both
archived unrun; the doctrine landed as `2026-10-07-fnox-dev-only-doctrine`, and
the config shape went to bootstrap).

The doctrine record omits the config design these plans agreed. Bootstrap owns
the file now; use this as the reasoning.

- `fnox.toml` has `[profiles.development.secrets]` for every dev secret and
  `[profiles.ci.secrets]`, empty on purpose. The top-level `[secrets]` is empty
  on purpose too, because every profile inherits it. No `staging` or
  `production` profile exists.
- `FNOX_PROFILE` is `ci` when `CI` is set, else `development`, in a mise `[env]`
  loaded in every environment.
- Every task that needs a secret runs `fnox exec -- <cmd>` with no CI
  condition. In CI the empty profile resolves nothing and the forge's variables
  pass through.
- `setup:secrets` lists the development secrets that are missing and prompts
  for each with hidden input (`fnox set NAME`). It tests presence by exit
  status only (`FNOX_IF_MISSING=error FNOX_PROFILE=development fnox get NAME`
  with output discarded) and never prints a value. A secret that points at a
  cloud store is reported, never prompted.
- Rejected: dev secrets at the top level with `FNOX_NO_DEFAULTS` in CI, because
  a missing flag then leaks every dev secret into CI (fails open); keeping all
  four profiles; skipping fnox in CI by a condition; the experimental
  mise-env-fnox plugin.
- Declined, as the doctrine record says: a `stackgen-sync` cleanup of the old
  ciphertext hook, and a guard hook. The Doppler pack retired with the
  template chain; repos that materialized it get no migration.
