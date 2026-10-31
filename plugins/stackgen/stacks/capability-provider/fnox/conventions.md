# fnox — conventions

The secrets manager for **the development environment, and nothing else**.
Configuration is a **committed `fnox.toml`** holding names and lookups only;
each secret's value lives in the **OS keychain** by default, or any single
secret may instead be a reference into a fnox-supported cloud store (AWS
Secrets Manager, Azure Key Vault, 1Password, Vault and the rest), and the two
mix freely per secret. **Nothing encrypted ever enters the repo** — no age, no
KMS, no encrypted value in any tracked file.

**Each environment takes its secrets from the system that runs it.** A
developer's machine resolves them through fnox. CI takes the forge's own
variables (GitHub or GitLab) and does not run fnox. Staging and production run
neither mise nor fnox: their secrets come from the cloud provider's own store.
stackgen's secrets contract states that split; this pack is its development
half.

**Secrets reach a process as environment variables, injected by
`fnox exec -- <the repo's own task>`.** This is the rule that outranks the
rest in stackgen's secrets contract, and fnox satisfies it without an SDK:
nothing downstream of that boundary knows fnox exists. CI runs the same task
with the forge's variables already in its environment, so one task definition
serves both callers.

**Nothing in `fnox.toml` is a value.** Every entry carries `provider = "…"`
and names a keychain entry or a cloud-store lookup; a bare `default = "…"`
value is not permitted, even for a throwaway. Non-secret configuration — an
API URL, a log level — belongs in the mise env, not in the secrets file.

**The profile shape is the setup tool's, not this pack's.** A development
profile and a `ci` profile, selected by `FNOX_PROFILE`, are rendered by the
repo's setup tool (bootstrap); this pack ships a single root `[secrets]` block
and states no profile of its own.

## What this pack writes

Nothing into the repo. The fnox pin, the fnox config and the secrets check
are bootstrap's. The config is a seed: it lands once, and the repo owns it
from then on. `mise run setup` runs the check, which confirms the CLI and
the config are in place and runs `fnox check`. It never runs a command whose
normal output is a secret — `get` is that command, and a scrollback is more
widely readable than the repo.

**The seed declares one provider, the OS keychain, as the default.** Every
secret is declared in `[secrets]` even before its keychain entry exists —
the name is the contract, and `docs/blueprint/environment.md` catalogs the
same names. A secret better held in a cloud store gets a second provider
entry and a reference; the keychain stays the default.

## Naming — one set per repo

| Prefix         | Is                          | Example             |
| -------------- | --------------------------- | ------------------- |
| `<REPO>_<KEY>` | this repository's own value | `SITE_DATABASE_URL` |
| `GLB_<KEY>`    | shared across repositories  | `GLB_GITHUB_TOKEN`  |

Names are `[A-Z0-9_]`, the same set every injector can export. The seed's
keychain provider keeps this repository's entries under its own service and
prefix; a value shared across repositories gets a second provider for the
shared namespace rather than widening that one. Machine-local additions go in
`fnox.local.toml`, which is gitignored.

## Moving from the encrypted mode

An earlier version of this pack offered committed ciphertext; it is retired.
A repo that materialized that version keeps an inert
`.claude/hooks/fnox-ciphertext-guard.sh` — delete it by hand, and
`/stackgen:stackgen-sync` then drops its lock record. A hand-added
`fnox-ciphertext` pre-commit entry, a secret-scanner allowlist line naming
`fnox.toml` and the `.gitignore` age lines are removed by hand too. Any value
once committed, even as ciphertext, is rotated at its source.

Full judgment: the `fnox` skill's references. The contract it cites is
stackgen's secrets contract.
