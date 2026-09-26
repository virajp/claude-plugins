# Doppler — integration & access shape

## Where the boundary sits

**At the process boundary, and nowhere else.** The product never reaches
Doppler; the CLI reaches it, once, and hands a populated environment to the
task. Everything the application knows is that its variables are set.

That boundary is the whole integration. There is no client library to add, no
initialization order to get right, and no failure mode inside the application to
handle — if the injector could not resolve the secrets, the task never started.

## Wrap the task, never the application

```sh
doppler run -- mise run dev
doppler run -- mise run test:e2e
```

Wrap the repo's **task**, so the same task is what CI runs directly under its
own injected environment. Wrapping the application binary instead pushes the
injector into the task file, and CI then has to route around it — which is how
a repo ends up with two versions of every command.

Do not wrap an interactive shell: see clause 5 in
[contract satisfaction](contract-satisfaction.md).

## Linking a working directory

`doppler setup` links the directory to a project and a config, and that link is
what makes the environment selection explicit rather than ambient. The link is
local state under `.doppler/`, which is **gitignored** — it is per-developer,
and it is not a secret worth mining either, so it belongs in
`mempalace.yaml`'s `exclude_patterns` alongside the rest of the local state.

`doppler login` is the one interactive step, once per machine.

## The toolchain placement

The CLI arrives through the doppler pack's `tool-config:` list, which
`stackgen:tool-config` writes inside the pack's own `# >>> doppler` block:

```yaml
tool-config:
  - mise add tool doppler latest to all environments
  - mise add env DOPPLER_CONFIG="local" to all environments
  - mise add env DOPPLER_PROJECT="{{ config_root | split(pat='/') | last }}" to
    all environments
```

The tool lands in `.config/mise/conf.d/tools.toml` and the two values in
`.config/mise/conf.d/env.toml`, so they load in **every** environment. Change
them through the pack, not by hand: a hand edit inside the block reads as drift
on the next run.
CI still authenticates to its own secret store, never to the developer's login.

## Credentials

**The developer's credential is their own login**, held by the CLI on their
machine. Nothing is stored in the repo and nothing is shared, which is the
property that makes clause 3's revocation meaningful — there is no copy to keep
working after a member is removed.

**A service token is a secret nothing is managing.** If one is ever introduced —
for a machine that has no human to log in — say where it is stored, because by
definition the secrets manager is not holding it. Prefer not to need one; see
clause 2 in [contract satisfaction](contract-satisfaction.md).

## Names in the blueprint, values nowhere

`docs/blueprint/environment.md` catalogs each project's variable and secret
**names** and their issuer. It stays true when the injector changes, which is
the point of cataloguing names — and it is the reconciliation surface the
two-supplier split depends on ([two injectors](two-injectors.md)).

**Doppler's project and config naming never reaches a blueprint doc.** The
blueprint records that a credential exists and what reads it, not where it is
stored.
