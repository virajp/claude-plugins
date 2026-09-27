# Cloudflare Workers Static Assets — conventions

An **assets-only Worker**: the build output directory is the whole
deployment. There is no `main`, so no script runs; the edge matches a
request against the uploaded file set and serves it. `wrangler deploy`
uploads the directory and that is the release.

**This is a hosting pin, and it produces an artifact.** Unlike
`zero-trust-access`, which fronts something that runs elsewhere, this is
where the project actually runs — which makes it the entry a `site`
project pins on the `deploy` axis. The two compose: a static site behind
the identity-aware proxy is both pins on the same axis, and neither
replaces the other.

## What this component writes

**`wrangler.jsonc` at the repo root**, not under `.config/`. Wrangler
discovers its configuration by walking up from the working directory to a
`wrangler.jsonc` / `wrangler.toml`, and it has no ambient way to be told
otherwise — the alternative is `--config .config/wrangler.jsonc` on every
invocation any caller might ever type, which is a flag someone eventually
forgets and then deploys from a config that does not exist. The root
allowlist in stackgen's output charter admits the file for exactly that
reason; being on the list makes it landable, not standard, and the three
Cloudflare deploy packs ship one
— this pack, `workers-ssr` and `containers`.

**`.config/mise/tasks/p/<project-id>/deploy`**, an overlay in the
project's own task group. It ships as `p/_project/deploy` — a marked
directory name, not a task — and the command that pins this stack renames
the directory to the project's registry id. Until it is renamed the task
is inert rather than wrong: mise ignores a task directory whose name
starts with an underscore, which is the same rule that keeps `_scripts/`
out of `mise tasks`.

**Two marked positions in `wrangler.jsonc`**, both filled by the pinning
command and neither guessable by the pack: the Worker `name`, and the
`routes[]` entry that binds it to a custom domain. Everything else ships
with a real value, because everything else is this component's judgment
rather than the repo's identity.

## The values `wrangler.jsonc` ships

- **`$schema`** is relative to the file, so a repo that installs wrangler
  inside a sub-project points it at that project's `node_modules`.
- **`name`** is account-unique and lowercase — letters, digits and dashes —
  and derived from the project rather than the domain, so a repo that moves
  domains keeps its Worker. The shipped `PLACEHOLDER` is deliberately
  invalid, so an unfilled slot fails at the first deploy instead of
  publishing a Worker nobody meant to create.
- **`compatibility_date`** is a date, not a version: pinning it stops a
  future runtime change from altering an already-shipped deployment. Move
  it deliberately and read the changelog for the span skipped.
- **`assets.directory`** is relative to the file; a repo whose site is a
  sub-project points at that project's output (`./site/dist`).
- **`not_found_handling: "404-page"`** serves `404.html` with a 404 status,
  the right answer for a multi-page site. A client-routed single-page app
  wants `"single-page-application"`, which serves `index.html` with a 200
  so the router can take the path; picked for a multi-page site, it makes
  every typo a 200 and drops the site from search results.
- **`routes`** ships commented out. Filling it means uncommenting it with
  the hostname the site answers on; the zone must already be on the same
  account, and `custom_domain` is what makes wrangler create and manage the
  DNS record. A repo with no custom domain deletes the block, and the
  Worker answers at `<name>.<account-subdomain>.workers.dev` — a complete
  deployment for a preview surface or an internal tool.

## Credentials

`wrangler` reads **`CLOUDFLARE_API_TOKEN`** and
**`CLOUDFLARE_ACCOUNT_ID`** from the environment. They are account-wide
values shared across every repo that deploys to the account, so the
secrets convention names them **`GLB_CLOUDFLARE_API_TOKEN`** and
**`GLB_CLOUDFLARE_ACCOUNT_ID`** in the secrets provider, per stackgen's
secrets contract, and the provider supplies them to the process under the
names wrangler expects. They never
appear in `wrangler.jsonc`, and the deploy task refuses to start without
them rather than letting wrangler fail with an auth trace that reads like
a network problem.

`wrangler login` is the interactive alternative and is a developer's
convenience only. It stores an OAuth grant on one laptop; CI has no
browser and no laptop, and a pipeline that depends on someone's grant is
one that breaks when they leave.

**`--dry-run` needs no credentials.** It neither authenticates nor
uploads, so the deploy task skips the credential check for it — requiring
them would stop a contributor without account access from ever validating
the config, which is the one thing the flag exists for.

## The pipeline

**The task CI must run is `p:<project-id>:deploy`.** The workflow that
calls it is the repo's own — a pack states the task name and never writes
the workflow, which is stackgen's output charter's fence. Nothing here
decides the trigger either; that belongs to the CI
system pinned on the project's `cicd` axis.

The task does not build. It runs `p:<project-id>:build` when that task
exists and otherwise assumes the output directory is already built,
because what produces the directory is the framework's business and not
this component's.

## The artifact contract

**A directory of files** — `./dist` by default, overridable in one place
when a framework disagrees. **That default is not this pack's guess — it is
the framework pack's stated fact**, under the heading `## Build output` in
the project bundle's framework component, which says where the build writes
and that a deploy target may rely on the path. `framework/astro` is the
specimen that states it today; any framework pack stating the same fact
under the same heading pairs here the same way, and one that states a
different path is one whose `assets.directory` differs by that much.

- **Fingerprinted assets are immutable.** Where the framework hashes
  content into the filename, those paths get a long `max-age` with
  `immutable`; the entry HTML does not, or a deploy is invisible to every
  browser that already has it.
- **`404.html` at the directory root** is what `not_found_handling:
  "404-page"` serves, so the build has to emit one. A missing file turns
  every unknown path into a bare edge 404 with no branding and no
  navigation, and nothing reports it.
- **One deploy is distinguishable from the next** by the uploaded file
  set, which is what makes the rollback path a version rather than a
  rebuild.

## What is explicitly not here

**No Worker script.** No `main`, no `assets.binding`, no
`run_worker_first`. Those are the shape where code fronts the files —
server-side rendering, an API route beside the site, an auth check at the
edge — and that shape is **`cloud-service/workers-ssr`**, a separate pack
and a separate pin. The two are alternatives rather than layers: a
deployment either has a `main` or it does not.

**No other Cloudflare service is this component's to speak for.** Which
Cloudflare services stackgen offers, and which are planned or declined, is
the provider component's to state — see the `cloud-provider/cloudflare`
component's conventions, in this composition's template.

**No wrangler pin.** Wrangler is a development dependency of the project
that deploys, declared in that project's language manifest — and a
manifest is outside the config tier's fence. The deploy task calls the
manifest's wrangler through the package manager rather than a globally
pinned binary, so the version CI runs is the version the lockfile
records.

Full judgment: the `workers-static-assets` skill and its references. The
provider-wide doctrine it cites — the account model, the role grants,
seat-shaped billing, the private plane — is the `cloudflare` skill's. The
shape with a script in front of the files is
`cloud-service/workers-ssr`.
