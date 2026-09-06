# Cloudflare Workers SSR — conventions

A **Worker with a script in front of its own static assets**: `main` names
an entry, the platform serves the uploaded file set for every request that
matches one, and everything else falls through to the script. One
`wrangler deploy` uploads both halves and that is the release.

**This is a hosting pin, and it produces an artifact.** Like its sibling
`workers-static-assets`, this is where the project actually runs — which
makes it the entry a `site` project pins on the `deploy` axis when some of
its responses are decided per request. The two are alternatives, not
layers: a deployment either has a `main` or it does not.

## What a Worker with a script is, and is not

**It is not a container.** There is no image, no base OS, no process to
size or keep warm. The script runs in a V8 isolate on the platform's own
runtime, which starts per request in single-digit milliseconds and has no
Node runtime underneath it. What Node surface exists is the compatibility
layer the `nodejs_compat` flag turns on, and the framework adapter this
pairing names requires it. A dependency that reaches for a Node built-in
the flag does not cover fails at the edge and not at build time, which is
the failure mode most worth predicting here.

**It is not a second stack in front of the static one.** The assets and
the script are one deployment under one Worker name. The script fetches
its own files through the `ASSETS` binding rather than over the network,
and a request that matched a file never reached it at all.

## What this component writes

**`wrangler.jsonc` at the repo root**, not under `.config/`. Wrangler
discovers its configuration by walking up from the working directory to a
`wrangler.jsonc` / `wrangler.toml`, and it has no ambient way to be told
otherwise — the alternative is `--config .config/wrangler.jsonc` on every
invocation any caller might ever type, which is a flag someone eventually
forgets and then deploys from a config that does not exist. The root
allowlist admits the file for exactly that reason
(`${CLAUDE_PLUGIN_ROOT}/assets/output-tree.md`); being on the list makes
it landable, not standard.

**`.config/mise/tasks/p/<project-id>/deploy`**, an overlay in the
project's own task group. It ships as `p/_project/deploy` — a marked
directory name, not a task — and the command that pins this stack renames
the directory to the project's registry id. Until it is renamed the task
is inert rather than wrong: mise ignores a task directory whose name
starts with an underscore, which is the same rule that keeps `_scripts/`
out of `mise tasks`.

**Three marked positions in `wrangler.jsonc`**, and one of them is the
whole difference from the static sibling: the Worker `name`, the `routes[]`
entry that binds it to a custom domain, and **`main`**. Everything else
ships with a real value, because everything else is this component's
judgment rather than the repo's identity.

## The script is the framework adapter's output, not this pack's

**`main` names an entry the project's framework adapter defines, and the
adapter is named by the project bundle that pairs here.** For Astro that
is `@astrojs/cloudflare`, whose v13 — the release Astro 6 requires — moved
`main` from a built file path to the unified entrypoint
`@astrojs/cloudflare/entrypoints/server`, one value that serves local
development and production alike; that is the value shipped below, and it
is the single fact this deploy component takes from a framework. A
different framework's adapter names a different entry, and filling the
marked position is what pinning the pair does.

Nothing here writes the script, chooses the adapter or installs it. The
adapter is a dependency in the project's language manifest, and a manifest
is outside the config tier's fence.

## Credentials

`wrangler` reads **`CLOUDFLARE_API_TOKEN`** and
**`CLOUDFLARE_ACCOUNT_ID`** from the environment. They are account-wide
values shared across every repo that deploys to the account, so the
secrets convention names them **`GLB_CLOUDFLARE_API_TOKEN`** and
**`GLB_CLOUDFLARE_ACCOUNT_ID`** in the secrets provider
(`${CLAUDE_PLUGIN_ROOT}/assets/contracts/secrets.md`), and the provider
supplies them to the process under the names wrangler expects. They never
appear in `wrangler.jsonc`, and the deploy task refuses to start without
them rather than letting wrangler fail with an auth trace that reads like
a network problem.

`wrangler login` is the interactive alternative and is a developer's
convenience only. It stores an OAuth grant on one laptop; CI has no
browser and no laptop, and a pipeline that depends on someone's grant is
one that breaks when they leave.

## The pipeline

**The task CI must run is `p:<project-id>:deploy`.** The workflow that
calls it is the repo's own — a pack states the task name and never writes
the workflow (`${CLAUDE_PLUGIN_ROOT}/assets/output-tree.md`, the charter
fence). Nothing here decides the trigger either; that belongs to the CI
system pinned on the project's `cicd` axis.

The task does not build. It runs `p:<project-id>:build` when that task
exists and otherwise assumes the output directory is already built,
because what produces the directory — and the script inside it — is the
framework's business and not this component's.

## The artifact contract

**A script plus the file set it fronts**, uploaded together: `./dist` by
default, matching what the framework packs that pair here emit, and
overridable in one place when a project's site is a sub-project.

- **Fingerprinted assets are immutable.** Where the framework hashes
  content into the filename, those paths get a long `max-age` with
  `immutable`. What the script renders is a different question, and it is
  the script's own response headers that answer it.
- **No `not_found_handling`.** With a `main` present, a request that
  matches no asset falls through to the script, so what an unknown path
  gets is the framework's routing and its 404 page — a decision in code
  rather than in this file.
- **One deploy is distinguishable from the next** by the uploaded version,
  which is what makes the rollback path a version rather than a rebuild.

## What is explicitly not here

**`run_worker_first` ships off.** The knob invokes the script ahead of
asset matching, which turns every request for a hashed asset into a billed
script invocation and puts a cold path in front of files that needed none.
It earns its keep only where the script must see requests the assets would
otherwise have answered — an auth check over the whole site, a redirect
table in code — and that is a decision a product makes deliberately with
its cost in view, not a default.

**No other Cloudflare service.** Pages, R2, D1, KV, Durable Objects,
Queues, Images and Stream remain planned under their own effort and are
**not offered**. A service nobody wrote doctrine for is a service nobody
reviewed; that gap is one to name rather than to fill from general
Cloudflare knowledge.

**No wrangler pin, and no adapter pin.** Both are development
dependencies of the project that deploys, declared in that project's
language manifest. The deploy task calls the manifest's wrangler through
the package manager rather than a globally pinned binary, so the version
CI runs is the version the lockfile records.

Full judgment: the `workers-ssr` skill and its references. The
provider-wide doctrine it cites — the account model, the role grants, the
private plane — is the `cloudflare` skill's. The assets-only shape, with
no script at all, is `cloud-service/workers-static-assets`.
