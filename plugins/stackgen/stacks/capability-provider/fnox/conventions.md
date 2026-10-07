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

| Lands at                           | Is                                          |
| ---------------------------------- | ------------------------------------------- |
| `fnox.toml`                        | the providers and the declared secret names |
| `.config/mise/tasks/setup/secrets` | the fill for the toolchain manager's slot   |

The CLI pin is the pack's template, not a copied file:
`templates/.config/mise/conf.d/fnox/mise.toml`, which `stackgen:tool-config`
renders into the repo, pinning `fnox` exactly.

**`fnox.toml` at the repository root is an accepted exception**, and the only
one this pack takes. fnox searches upward from the working directory; a copy
under `.config/` is reachable only by passing `--config` on every call, and
`--config` also bypasses the directory recursion and the local override — so
moving the file would take `fnox.local.toml` out of the scheme with it. The
pin, which has no such constraint, does live under `.config/`.

**The task fills a slot and never prints a value.** `setup:secrets` replaces
the universal `#PLACEHOLDER` task at that path — the one file a pack may ship
where tool-config ships its own — and checks
that the CLI and the config are both present and reports the keychain service
and prefix. It never runs a command whose normal output is a secret — `get` is
that command, and a scrollback is more widely readable than the repo.

**The shipped config declares one provider, the OS keychain**, with
`if_missing = "warn"` so a contributor whose keychain is not yet populated can
still run the repo's tasks. Every secret is declared in `[secrets]` even
before its keychain entry exists — the name is the contract, and
`docs/blueprint/environment.md` catalogs the same names. A secret better held
in a cloud store gets a second provider entry and a reference; the keychain
stays the default.

## Naming — one set per repo

| Prefix         | Is                          | Example             |
| -------------- | --------------------------- | ------------------- |
| `<REPO>_<KEY>` | this repository's own value | `SITE_DATABASE_URL` |
| `GLB_<KEY>`    | shared across repositories  | `GLB_GITHUB_TOKEN`  |

Names are `[A-Z0-9_]`, the same set every injector can export. The keychain
provider's `prefix = "global/"` is the shared namespace inside the `fnox`
service; a repository with its own material declares a second provider with
its own prefix rather than widening that one. Machine-local additions go in
`fnox.local.toml`, which is gitignored.

## Moving from the encrypted mode

An earlier version of this pack offered committed ciphertext; it is retired.
A repo that materialized that version keeps an inert
`.claude/hooks/fnox-ciphertext-guard.sh` — delete it by hand, and
`/stackgen:stackgen-sync` then drops its lock record. A hand-added
`fnox-ciphertext` pre-commit entry, a gitleaks allowlist line naming
`fnox.toml` and the `.gitignore` age lines are removed by hand too. Any value
once committed, even as ciphertext, is rotated at its source.

Full judgment: the `fnox` skill's references. The contract it cites is
stackgen's secrets contract.
