GAP 2026-11-27 ★4 | plugin:stackgen | move the Cloudflare packs from Wrangler
to `cf` | parked: plan when `cf` 1.0.0 is GA, as its own folder that
requires 2026-11-26-stackgen-bootstrap-tasks

**Condition** The user parked this on 2026-11-27 until `cf` 1.0.0 is GA. On
that day npm's `latest` was `1.0.0-rc.6` (2026-11-25), the first RC was
`1.0.0-rc.0` (2026-11-16), and Cloudflare released a new RC about every day.
Before the next plan, examine these again:

- the GA checklist, <https://github.com/cloudflare/cf/issues/810>: three
  release blockers (#801, #802, #803) and the sign-off item "Update docs for
  supported framework and static-site paths, Astro version support";
- <https://github.com/cloudflare/cf/issues/587> (open): `cf deploy --dry-run`
  fails on a migrated Astro 7 Worker project;
- the Astro statement of the docs, and the tests of `cf` at the GA tag: at
  `cf@1.0.0-rc.6`, only Astro 5 builds in the tests
  (`packages/cli/src/__tests__/commands/build/index.test.ts`);
- the facts below: the builders that are missing, the rollback command, and
  what `cf migrate` leaves to be written by hand.

**Source** The change-plan interview of
`docs/plans/2026-11-26-stackgen-bootstrap-tasks/`, decision D35. bootstrap's
`cloudflare` tool installs `npm:cf`, and its doc
(`docs/sync/tools/cloudflare.md` of bootstrap) says that `npm:cf` replaces
`wrangler`. The user chose to move the packs to `cf` in a second plan folder
that requires the first. The first plan ports the deploy tasks to Python and
keeps `wrangler deploy`.

## Why it is out of scope now

The move is a second piece with no shared ruling. The first plan was already
planned and reviewed for three rounds.

## The ruling that stands

- **Astro stays on Wrangler.** The `cf` docs say that "Astro 6 and later does
  not build with `cf` during the beta". A project whose framework is Astro
  keeps `wrangler.jsonc` and `wrangler deploy` until `cf` builds Astro. The
  packs say so and name the condition.

## Facts the next plan must decide on

- `cf dev`, `cf build` and `cf deploy` read `cloudflare.config.ts`, not
  `wrangler.jsonc`. In a project with no `cloudflare.config.ts`, every
  building command (also `cf deploy --dry-run`) first runs automatic
  configuration, which changes `package.json`, the lockfile and `.gitignore`
  with no prompt in CI.
- `cf migrate` does not migrate Durable Object migrations, Workflows or
  Containers. These are written by hand.
- `cf d1 migrations apply` takes the database ID, not the name, and applies
  to the remote database unless `--local` is given.
- `cf` has no binding builder for AI Gateway, Realtime or Zero Trust, and no
  documented rollback command.
- `cf` is 1.0.0-rc: its config format, Build Output and the develop and
  deploy commands are called stable.

## Size, from the survey of 2026-11-27

- 528 lines name Wrangler: about 24 packs and 22 bundles under
  `plugins/stackgen/stacks/`.
- Three packs ship `config/wrangler.jsonc` and a deploy task: workers-ssr,
  workers-static-assets, containers.
- The root allowlist names `wrangler.jsonc`: `scripts/src/check.ts:384-386`,
  `plugins/stackgen/assets/output-tree.md`, `assets/pack-format.md`,
  `skills/stackgen-stack-template/references/materializer.md`, and
  `.claude/skills/stackgen-plugin/SKILL.md:263`.
- The cloudflare-agents skill globs `**/wrangler.jsonc` and
  `**/wrangler.toml` in its `paths:`.
- 42 links point to `developers.cloudflare.com/workers/wrangler/`.
- 8 decision records tie the root allowlist and the packs to Wrangler.

## Sources

- <https://developers.cloudflare.com/cf/projects/>
- <https://developers.cloudflare.com/cf/projects/cloudflare-config/>
- <https://developers.cloudflare.com/cf/wrangler/migrate/>
- <https://developers.cloudflare.com/cf/wrangler/reference/>
- <https://developers.cloudflare.com/cf/ci/>
- <https://developers.cloudflare.com/cf/get-started/first-worker/>
