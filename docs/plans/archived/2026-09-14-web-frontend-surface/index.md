---
type: vwf-change-plan
title: web frontend surface — a stylesheet axis, and the head every site ships
requires:
  - docs/plans/2026-09-14-audit-capability
  - docs/plans/archived/2026-09-14-repo-name-split
backlog: [ B07, B08 ]
---

# Plan — web frontend surface — a stylesheet axis, and the head every site ships (2026-09-14)

## Status

**COMPLETE** 2026-09-14. Worktree `.worktrees/2026-09-14-web-frontend-surface`,
branch `2026-09-14-web-frontend-surface`. Every unit green, every wave gate and
orchestrator gate green. Commits: `13b11c4e` (U1), `12ae5539` (U2), `2ca10c7e`
(U3), `698d38fd` (U4), `68685dce` (U5), `0f19eadc` (U6), plus the run-log
commits `929da9d1`, `0cd65f59`, `0ecc9922`. Two review findings stand
`contested` after the two-round cap (see the run log); two `GAP:` lines need a
later ruling — whether a Flutter project declaring `webapp` is asked the
stylesheet round, and the broken 13-skip loop in `p:site:version`.

## Consent

| Action                                            | Granted                                                                                                                                                                    |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Merge to the integration branch and push on green | yes                                                                                                                                                                        |
| After landing: `mise run p:plugins:local`         | run                                                                                                                                                                        |
| Release `stackgen` publicly                       | minor — `1.9.0` → `1.10.0`, by editing `plugins/stackgen/.claude-plugin/plugin.json`; tagged by a later `/release`, not this run                                           |
| Release `vwf` publicly                            | minor — `19.21.0` → `19.22.0`, by editing `plugins/vwf/.claude-plugin/plugin.json`; tagged by a later `/release`, not this run                                             |
| Release `site` publicly                           | patch — `1.1.10` → `1.1.11`, by `mise run p:site:version` (bare — the task takes no positional and refuses a dirty tree, so it runs first); deployed by a later `/release` |
| Release `installer` publicly                      | none — untouched                                                                                                                                                           |

**A release recorded here is intent, not authorisation.** No release step runs
in this plan: the versions are bumped so the next `/release` ships them, and
that release is asked for then. The one `run` step publishes nothing and cuts no
tag; it stages the two plugins into this machine's dev marketplace, which a
**restarted** session picks up.

## Goal

After this lands, a web-frontend project pinned through stackgen carries a
chosen stylesheet approach on a seventh vwf axis — `stylesheet`, per project,
asked only of a project with a `site` or `webapp` platform, answered from a
three-entry stackgen menu (`tailwindcss`, `stylex`, `plain-css`) plus the
`generate` door — and every `site` it materializes, and every `webapp` that
declares the `seo` capability, ships SEO metadata, OpenGraph tags and a favicon
set: pinned per screen in the blueprint's platform files, defaulted product-wide
in `conventions.md` and the design system, realized from the Astro pack's head
doctrine, with the icon rasterizer landed as a task.

The framing: backlog Group E, items B07 and B08, one plan because both land in
the same pack, the same screen contract and the same manual pages. The
stylesheet is a **choice** and so an axis; the head is a **contract** and so
doctrine plus a screens block. No standing decision is reversed. The Astro
decision's rejection of sibling bundles differing by one choice
(`docs/memory/decisions/2026-09-06-astro-four-modes-four-bundles.md`) is what
rules out carrying the stylesheet in the bundles, and the design-system
foundations' contract-vs-realization line ("the theme/Tailwind config file" is
realization) is what keeps the token mapping in the stylesheet packs.

## Facts the survey established

**stackgen.** Pack types are the directory names under
`plugins/stackgen/stacks/` — fourteen today — with the vocabulary in prose at
`plugins/stackgen/assets/taxonomy.md:21-81` and `type:` citing it at
`assets/pack-format.md:154`. Kinds are **closed**: the enum at
`pack-format.md:157`, the definitions as second-level headings of the form
"kind-name — one-line title" in `assets/kinds.md` (twelve, `design-tool` at
`:911`), read by `scripts/src/inventory.ts:106`; `kinds.md:993` says "all twelve
kinds". The axis enum is repeated at `pack-format.md:158` and `:201`,
`skills/stackgen-stack-template/SKILL.md:77`, and
`skills/stackgen-stack-menu/SKILL.md:69` (axes) and `:70` (kinds).
`framework/astro` (`stacks/framework/astro/`, version `0.1.0`, type `framework`,
category `meta-framework`, kind `language-bundle`, axis `project`) is the only
web-frontend pack and ships **no `config/`** — `conventions.md` plus
`skills/astro/references/{ssg,ssr,csr,hybrid,build-output,content-and-routing,testing}.md`.
The four bundles `stacks/bundles/astro-{ssg,ssr,csr,hybrid}.md` pin
`framework/astro@0.1.0` at line 10 of each; `astro-ssr.md:45-46` and
`astro-csr.md:73` name Tailwind as the UI layer in prose. Deploy packs are the
precedent for a landed task:
`cloud-service/workers-static-assets/config/.config/mise/tasks/p/_project/deploy`
(mode 755, a bash shebang, the `#MISE description` and `#MISE dir` lines, and
the "THIS FILE SHIPS UNDER `p/_project/` AND MUST BE RENAMED" header). Bundle
frontmatter is `name`, `axis`, `kind`, `components`, `platforms`, `artifact`
(`pack-format.md:201-208`); a design-axis bundle (`bundles/stitch.md`) has axis
`design`, kind `design-tool`, one component. Cross-pack contracts live at
`assets/contracts/<area>.md` (`datastore`, `identity`, `local-stack`,
`object-storage`, `observability`, `orchestration`, `release-trigger`,
`secrets`; `audit` is being added by the audit-capability plan).
`assets/output-tree.md:143-145` describes the deploy overlay a pack lands.
Nothing styling- or metadata-related ships anywhere; `stylex`, `favicon`,
`opengraph`, `robots`, `postcss` have zero hits under `plugins/`.

**The checker.** `scripts/src/check.ts` rule 11 (`:418-510`) asserts exec bit
and shebang on every `config/.config/mise/tasks/**` file (`:428-432`,
`PACK_TASK_SHEBANGS` at `:298`), root files against `PACK_CONFIG_ROOT_FILES`
(`:333-359`), root dirs only `.config/` and `.github/` (`:367-370` — a `public/`
dir is refused, which is why B08 lands no root files). Rule 13 (`:873-925`)
refuses, in any landed file, `${CLAUDE_PLUGIN_ROOT}`, a bare `assets/…` path, a
`../` climb, or a path into a sibling pack. `p:plugins:shellcheck` runs
`shellcheck -x` and `shfmt -d` over every `config/.config/mise/tasks/**` file
that is bash. `p:plugins:inventory` regenerates `stacks/inventory.md` (header
"**62 packs, 58 bundles, 12 kinds.**") and `--check` fails a bundle pin naming
no pack or a differing version (`inventory.ts:306-340`) — so a pack version bump
and its bundle pins and the regenerated inventory land in **one commit**.

**vwf.** Six axes, no stylesheet: the table at
`plugins/vwf/assets/stack-vocabulary.md:67-81`; the enum at
`assets/stack-adapter.md:15`, `:183`, `:221`, `:248` and the "Neither axis takes
`platforms:`" rule at `:226-236`; the config keys at
`assets/vwf-config.md:67-91` (`design:` at `:90`, `cicd:` at `:91`), the schema
heading `:38` and the two format numbers `:40-41` (`config_format: 18`,
`blueprint_format: 24`); the migration entries as bold "N → M migration" bullets
(the `16 → 18` entry at `:547-558` is the newest and states whether
`blueprint_format` moved); the 13/17 rule at `:251-256`. The menu table is
`skills/architecture/references/stack-menu.md:9-20` and the defer section
`:57-83`; `/vwf:architecture` records the pin at
`skills/architecture/SKILL.md:237-250` ("six independent axes … the `design` and
`cicd` pins are the per-project keys of the same name"). `/vwf:setup`'s
materialize pass reads every axis at
`skills/setup/references/materialize.md:31-36` and builds the landing list at
`:62-80` (a scalar axis holding a slug is one repo-and-slug entry; `unresolved`
is skipped silently). Doctor's §5 lists the axes at
`skills/doctor/references/stack-checks.md:128-140` and "pinned, not
materialized" at `:33`, `:47-52`; the loose framework match naming `tailwindcss`
at `:112-113`; `skills/doctor/SKILL.md:60-72`, `:171-175`, `:192-196` restate
the finding classes. The lineage table
is`skills/setup/references/format-lineage.md:36-135`(columns Retired spelling,
Current spelling, Kind, Fan-out);`assets/blueprint-format`holds`24`.

**The screens contract.**
`skills/blueprint-authoring/references/flow-contract.md:83-117` pins per screen:
code, route, reads, states, actions, form validation, plus a Components block;
`references/ui-ux-contract.md:1-36` is the design-system reference rule; the
template is `assets/templates/flow-platform.md:32-35` (the Screens table) and
`:64-78` (the Components block). Nothing covers title, description, indexability
or a social image. `seo` already exists as a **P** capability token at
`assets/capability-vocabulary.md:37`, with `:49-50` saying `ssr`/`ssg`/`seo`
"are rendering strategies the project template settles".
`assets/templates/conventions.md` is anchored sections (`## Audit {#audit}` at
`:56` … `## Shared patterns {#patterns}` at `:98`);
`assets/templates/design-system.md:20-48` is Color Tokens, Typography, Spacing &
Layout, Motion. `skills/design-system-authoring/references/foundations.md:11`
names "the theme/Tailwind config file" as the realization column. The files that
enumerate or judge the Screens columns: `agents/flow-writer.md`,
`agents/blueprint-reviewer.md`, `agents/execute-ux-reviewer.md`,
`agents/mockup-generator.md`, `agents/blueprint-condenser.md`,
`skills/blueprint/SKILL.md`, `skills/blueprint/references/screen-review.md`,
`skills/screens/SKILL.md` and `references/{prompt-mode,import-mode}.md`,
`skills/feedback/SKILL.md`, `skills/mockups/SKILL.md`.

**This repo's site — the source B08 lifts from, read-only.**
`site/src/layouts/Base.astro:24-73` is the one head: title, description,
canonical from `Astro.site`, SVG + ICO + apple-touch icon links, manifest,
`rel=sitemap`, the OG set (`type`, `site_name`, `title`, `description`, `url`,
`image` 1280×640 with alt), the twitter set (`summary_large_image`, `site`),
`og:locale`, `theme-color`, JSON-LD blocks with `<` escaped. `astro.config.ts`
sets `site:` and the `@astrojs/sitemap` integration; `public/robots.txt` names
the sitemap; `public/site.webmanifest`. `.config/mise/tasks/p/site/icons`
rasterizes 512/192/180/16/32/48 from one SVG via one-off `pnpx sharp-cli@6`
(`--density 1200`), squares the touch icon with BSD `sed`, and builds the
16/32/48 ICO by installing `png-to-ico@3` into a temp dir and driving its
library entry (the CLI drops sizes). The site plan
(`docs/plans/archived/2026-09-05-site-seo-and-markdown/`) ruled "one-off pnpx
icons, never deps"; parked a task-rendered OG image, `icons --check`, and
materialising `site/` from the Astro bundle. `site/` uses plain CSS
(`src/styles/tokens.css`, `global.css`).

**Docs the change falsifies** (every hit has an owner below). "six axes":
`stack-adapter.md:15,221`, `vwf-config.md:15`, `stack-vocabulary.md:67,70`,
`stack-menu.md:9`, `stack-checks.md:130-131`, `architecture/SKILL.md:238` (U1);
the enums at `pack-format.md:158,201`, `stackgen-stack-template/SKILL.md:77`,
`stackgen-stack-menu/SKILL.md:69-70`, `kinds.md:993` "twelve kinds" (U3);
`foundations.md:11` (U2); the Tailwind prose in `bundles/astro-ssr.md:45-46` and
`astro-csr.md:73` (U4); the manual —
`site/src/content/docs/plugins/vwf.md:103,549,584`, `plugins/stackgen.md:205`,
`how-to/operate/choosing-your-stack.md:3,12`, `how-to/index.md:63` — plus
`readme.md`, `CLAUDE.md`, `.claude/docs/plugins.md` and
`.claude/skills/{vwf,stackgen}-plugin/` wherever they count packs, kinds or axes
(U5).

**Gates, convention, versions.** `mise tasks`:
`p:plugins:{check,inventory,local,marketplace,npm-normalize-test,release,shellcheck}`,
`p:site:{build,check,dev,icons,release,version}`,
`code:{format,lint,sec,precommit,…}`. Commit types
(`.config/git-conventional-commits.yaml`): `ops`, `docs`, `merge`, `feat`,
`fix`, `refactor`; no scopes. vwf `19.21.0`, stackgen `1.9.0`, site `1.1.10`.
This repo has no `.config/vwf.yaml`. Deps available: `site/` has `astro`,
`@astrojs/sitemap`; `scripts/` has `yaml`. Nothing here is needed.

**Plans in flight.** `2026-09-14-audit-capability` (APPROVED, not yet run) owns
`kinds.md`, `taxonomy.md`, `capability-vocabulary.md` and `blueprint/SKILL.md`;
`2026-09-14-repo-name-split` landed on `develop` at `be650fca` during this
interview and is archived as `docs/plans/archived/2026-09-14-repo-name-split/` —
it touched doctor, setup and architecture files, so every line pointer above
into those files is read against the tree **after** that merge and may be off by
a few lines. Both are `requires:`; the second already reads `COMPLETE`.
`2026-09-14-feedback-gaps` overlaps nothing here.

## Assumed decisions — confirm or override at review

| #  | Decision                       | Ruling                                                                                                                                                                                                                                                                                                                                                                                    | Rejected                                                                                                                            | Unit   |
| -- | ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 1  | Who asks for the stylesheet    | A seventh vwf axis `stylesheet`, per project, mirroring `design` in every rule: `projects.<name>.stylesheet: <slug>`, the slug is the config value, required for a project declaring a `site` or `webapp` platform, absent otherwise; `config_format` 18 → 19                                                                                                                             | bundle multiplication (the Astro decision's rejected pairs); a framework-pack option (needs the parked derived-questions mechanism) | U1     |
| 2  | The menu                       | Three shipped packs — `tailwindcss`, `stylex`, `plain-css` (tokens as CSS custom properties, what this repo's site does) — plus stackgen's `generate` door, which every menu carries                                                                                                                                                                                                      | the two named only; a literal `none` value                                                                                          | U3     |
| 3  | Token mapping                  | Each stylesheet pack's `conventions.md` carries a `## Tokens` section saying how the design-system's semantic tokens are realized in that approach; vwf keeps naming no technology; `foundations.md:11`'s "the theme/Tailwind config file" becomes "the stylesheet pack's realization of the tokens"                                                                                      | a vwf-side mapping reference                                                                                                        | U3, U2 |
| 4  | Stylesheet packs are doctrine  | Like `framework/astro`: `pack.yaml`, `conventions.md`, `skills/<slug>/SKILL.md` (`user-invocable: false`, paths-scoped) with references; no `config/`. Integration files (a Vite plugin in `astro.config.ts`, a bundler plugin) are framework-specific edits `/vwf:execute` makes from the doctrine                                                                                       | landed integration files                                                                                                            | U3     |
| 5  | A new closed kind              | Mint `stylesheet` in `kinds.md` — a second-level heading of the form "stylesheet — one-line title" with its topic bar and reviewer checklist, as `design-tool` is to `design`; type `stylesheet` in `taxonomy.md`; one bundle per pack, axis `stylesheet`, kind `stylesheet`, one component                                                                                               | `kind: language-bundle` as a placeholder — the unminted-kind failure `kinds.md:964-985` itself records                              | U3     |
| 6  | B08's shape                    | Doctrine + contract + one task: Astro's `conventions.md` gains `## Head`; the pack lands `config/.config/mise/tasks/p/_project/icons`; `public/` files (`robots.txt`, `site.webmanifest`, the icons, the social image) are written by `/vwf:execute` from the doctrine; rule 11 is not widened                                                                                            | a landed `public/` payload (checker widening); doctrine only                                                                        | U4     |
| 7  | The cross-pack contract        | `assets/contracts/web-head.md` (new, in `contracts/secrets.md`'s shape) states what any web framework pack — shipped or generated — realizes for a `site` or `seo` project: the head set, the icon sizes, the manifest, robots and sitemap, the task. Astro's `conventions.md` restates it by role and cites nothing by path                                                              | Astro-only prose                                                                                                                    | U4     |
| 8  | Applies to                     | `site`: the full set, always. `webapp`: favicons + manifest + `<title>` always; the SEO/OG set (description, canonical, OG/twitter, robots, sitemap) only when the project's registry `capabilities:` lists `seo`. `seo` stays **P**; its vocabulary entry says this is what it settles                                                                                                   | both always; site only                                                                                                              | U2, U4 |
| 9  | Per-screen pins                | A `Metadata` block per Screens row on `site` and `webapp` platform files, headed by the row's code, four fields: `title` (`<title>` and `og:title`), `description`, `index: yes \| no` (robots meta and sitemap inclusion), `image: default \| <slot>` (`og:image`; `default` is the product-wide social preview). A `webapp` without `seo` pins `title` only; `blueprint_format` 24 → 25 | title + description only; a full head per screen (JSON-LD type, canonical override, locale)                                         | U2     |
| 10 | Product-wide defaults          | Text facts (site name, default description, twitter handle, locale, JSON-LD organisation) in `docs/blueprint/conventions.md` under `## Web metadata {#web-metadata}`; visual assets (the favicon source mark, the social-preview image 1280×640, the theme colour) named by the design system under a `## Brand assets` section as assets the product supplies                            | all in `conventions.md`; all in the design system                                                                                   | U2     |
| 11 | Icon task tooling              | The landed task runs one-off `pnpx sharp-cli@6` and installs `png-to-ico@3` into a temp dir, exactly as `.config/mise/tasks/p/site/icons` does — the site plan's "one-off pnpx icons, never deps" ruling; no dependency in this repo or the user's                                                                                                                                        | a package dependency                                                                                                                | U4     |
| 12 | Astro pack version             | `framework/astro` `0.1.0` → `0.2.0`; all four bundle pins follow in U4's commit, with the regenerated inventory                                                                                                                                                                                                                                                                           | leave at `0.1.0`                                                                                                                    | U4     |
| 13 | Inventory ownership            | Each pack unit regenerates and owns `stacks/inventory.md`, so U3 and U4 run in consecutive waves                                                                                                                                                                                                                                                                                          | one unit for both trees                                                                                                             | U3, U4 |
| 14 | Format bumps                   | U1 writes both numbers in `vwf-config.md` (`config_format: 19`, `blueprint_format: 25`), the `18 → 19` migration entry (which names the paired blueprint bump), and both `format-lineage.md` rows; U2 writes `assets/blueprint-format` and the blueprint-side files                                                                                                                       | one unit per format                                                                                                                 | U1, U2 |
| 15 | Ordering against today's plans | `requires:` the approved `2026-09-14-audit-capability` and the archived `2026-09-14-repo-name-split` (already `COMPLETE`); `/vwf:change-execute` halts until both read `COMPLETE`                                                                                                                                                                                                         | run concurrently, resolve at merge                                                                                                  | index  |
| 16 | Deferral and migration         | The stylesheet round offers *defer this axis* like the technology axes, recorded as `unresolved`; the `18 → 19` migration writes `stylesheet: unresolved` on every project declaring `site` or `webapp` and nothing else moves, so the materialize pass skips it, doctor reports it as a deferred axis, and `/vwf:architecture` elicits it on its next run                                | require an answer at migration; leave the key absent                                                                                | U1     |
| 17 | Blueprint 25 migration         | A `site`/`webapp` platform file whose Screens rows carry no `Metadata` block is `24` drift; the lineage row proposes one per row — `title` from the Screen cell, `description` empty, `index: yes` for `site` and `no` for `webapp`, `image: default` — and never auto-fixes                                                                                                              | auto-fill silently                                                                                                                  | U1, U2 |

## New dependencies

none — the landed icon task uses one-off tools, never a dependency (decision
11).

## Units

| Id | Wave | Unit file                                            | Owns                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Depends on | Status | Commit   |
| -- | ---- | ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------ | -------- |
| U1 | 1    | [01-vwf-axis.md](01-vwf-axis.md)                     | `plugins/vwf/assets/stack-vocabulary.md`, `plugins/vwf/assets/stack-adapter.md`, `plugins/vwf/assets/vwf-config.md`, `plugins/vwf/skills/architecture/SKILL.md`, `plugins/vwf/skills/architecture/references/stack-menu.md`, `plugins/vwf/skills/setup/references/materialize.md`, `plugins/vwf/skills/setup/references/format-lineage.md`, `plugins/vwf/skills/doctor/SKILL.md`, `plugins/vwf/skills/doctor/references/stack-checks.md`                                                                                                                                                                                                                                                                                                                                                           | —          | green  | 13b11c4e |
| U2 | 1    | [02-blueprint-contract.md](02-blueprint-contract.md) | `plugins/vwf/assets/blueprint-format`, `plugins/vwf/assets/capability-vocabulary.md`, `plugins/vwf/assets/templates/flow-platform.md`, `plugins/vwf/assets/templates/conventions.md`, `plugins/vwf/assets/templates/design-system.md`, `plugins/vwf/skills/blueprint-authoring/references/flow-contract.md`, `plugins/vwf/skills/blueprint-authoring/references/ui-ux-contract.md`, `plugins/vwf/skills/design-system-authoring/references/foundations.md`, `plugins/vwf/skills/blueprint/SKILL.md`, `plugins/vwf/skills/blueprint/references/screen-review.md`, `plugins/vwf/agents/{flow-writer,blueprint-reviewer,execute-ux-reviewer,mockup-generator,blueprint-condenser}.md`, `plugins/vwf/skills/screens/**`, `plugins/vwf/skills/mockups/SKILL.md`, `plugins/vwf/skills/feedback/SKILL.md` | —          | green  | 12ae5539 |
| U3 | 1    | [03-stylesheet-packs.md](03-stylesheet-packs.md)     | `plugins/stackgen/stacks/stylesheet/**` (new — `tailwindcss`, `stylex`, `plain-css`), `plugins/stackgen/stacks/bundles/{tailwindcss,stylex,plain-css}.md` (new), `plugins/stackgen/assets/taxonomy.md`, `plugins/stackgen/assets/kinds.md`, `plugins/stackgen/assets/pack-format.md`, `plugins/stackgen/skills/stackgen-stack-menu/SKILL.md`, `plugins/stackgen/skills/stackgen-stack-template/SKILL.md`, `plugins/stackgen/stacks/inventory.md`                                                                                                                                                                                                                                                                                                                                                   | —          | green  | 2ca10c7e |
| U4 | 2    | [04-astro-head.md](04-astro-head.md)                 | `plugins/stackgen/stacks/framework/astro/**`, `plugins/stackgen/stacks/bundles/astro-{ssg,ssr,csr,hybrid}.md`, `plugins/stackgen/assets/contracts/web-head.md` (new), `plugins/stackgen/assets/output-tree.md`, `plugins/stackgen/stacks/inventory.md`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | U3         | green  | 698d38fd |
| U5 | 3    | [05-docs.md](05-docs.md)                             | `readme.md`, `CLAUDE.md`, `.claude/**`, `site/src/content/docs/**`, `docs/backlog.md`; widened at run time by R1 round 1 (rule 5, nobody-owned): `plugins/vwf/assets/examples/blueprint/**`, `plugins/stackgen/stacks/readme.md`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | all        | green  | 68685dce |
| U6 | 4    | [06-gates-and-bump.md](06-gates-and-bump.md)         | `plugins/vwf/.claude-plugin/plugin.json`, `plugins/stackgen/.claude-plugin/plugin.json`, `site/package.json`, `.claude-plugin/marketplace.json`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | U5         | green  | 0f19eadc |

Status is one of `pending`, `running`, `green`, `failed`, `unresolved`,
`skipped`.

## Shared-file rule

| File                                                               | Why it collides                                                        | Owner                                                                                                     |
| ------------------------------------------------------------------ | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `plugins/vwf/.claude-plugin/plugin.json`                           | version                                                                | U6 only                                                                                                   |
| `plugins/stackgen/.claude-plugin/plugin.json`                      | version                                                                | U6 only                                                                                                   |
| `site/package.json`                                                | version                                                                | U6 only                                                                                                   |
| `.claude-plugin/marketplace.json`                                  | generated from the manifests                                           | U6 only                                                                                                   |
| `plugins/stackgen/stacks/inventory.md`                             | generated with the pack pins; must land with them in one commit        | U3 in wave 1, U4 in wave 2                                                                                |
| `plugins/stackgen/stacks/framework/astro/pack.yaml`                | the version bump and the `## Head` doctrine are one change             | U4 only                                                                                                   |
| `plugins/vwf/assets/vwf-config.md`                                 | both format numbers, the axis key and the migration entry are one edit | U1 only — U2 does not touch                                                                               |
| `plugins/vwf/skills/setup/references/format-lineage.md`            | both lineage rows                                                      | U1 only — U2 hands its row's wording to U1 through decision 17                                            |
| `plugins/vwf/assets/blueprint-format`                              | the blueprint stamp                                                    | U2 only                                                                                                   |
| `plugins/vwf/skills/architecture/SKILL.md`                         | the axis passage (U1) is the only edit; U2 does not touch              | U1 only                                                                                                   |
| `plugins/stackgen/assets/{taxonomy,kinds,pack-format}.md`          | the type, kind and enum edits                                          | U3 only — U4 does not touch                                                                               |
| `readme.md`, `CLAUDE.md`, `.claude/**`, `site/src/content/docs/**` | human-facing docs                                                      | U5 only                                                                                                   |
| `docs/backlog.md`                                                  | B07/B08 rows                                                           | U5 only (marks nothing — the rows are already `planned`; U5 touches it only if docs-sync finds a passage) |

## Waves

- **Wave 1 — U1, U2, U3.** Three trees, disjoint paths: vwf's axis files, vwf's
  blueprint files, stackgen's new packs and vocabulary. U1 and U2 share nothing
  by the shared-file rule above; U3 alone regenerates the inventory.
- **Wave 2 — U4.** The Astro pack, after U3's inventory commit, so the second
  regeneration builds on the first.
- **Wave 3 — U5.** Docs, over the whole branch delta.
- **Wave 4 — U6.** Bumps, generators, the full gate.

## Wave gate

```text
mise run p:plugins:marketplace -- --check
mise run p:plugins:inventory -- --check
mise run p:plugins:check
mise run p:plugins:shellcheck
mise run p:plugins:npm-normalize-test
pnpm vitest run
pnpm exec tsc --noEmit -p installer
pnpm exec tsc --noEmit -p scripts
mise run p:site:check
```

Plus the wave review, plus every report read for `UNRESOLVED:`. Every line is
green before wave 1. `p:plugins:inventory -- --check` is expected red on the
wave-1 tree until U3's commit regenerates it, and again on the wave-2 tree until
U4's — the orchestrator commits each with its regenerated inventory before
re-running the gate, per the shared-file rule.

## After landing

| Step                       | Mode | Notes                                                                                                                                                              |
| -------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `mise run p:plugins:local` | run  | Stages `stackgen` and `vwf` into this machine's dev marketplace as `X.Y.Z+N` and updates the local install. Publishes nothing; a **restarted** session picks it up |

No release step. The bumped versions ship with the next `/release`.

## Gates the orchestrator keeps

- **The icon task runs.** After wave 2, copy
  `plugins/stackgen/stacks/framework/astro/config/.config/mise/tasks/p/_project/icons`
  into a temp repo as `.config/mise/tasks/p/site/icons` beside a
  `.config/mise/config.toml` naming that task dir and a
  `public/brand/favicon.svg` (any 64×64 SVG with an `rx=` attribute), then
  `mise run p:site:icons` there. Pass: `public/favicon.ico`,
  `public/apple-touch-icon.png`, `public/icon-192.png` and `public/icon-512.png`
  exist, and `file public/favicon.ico` reports three icons (16, 32, 48). Needs
  network for the one-off `pnpx`.
- **Three packs, three bundles.**
  `command ls plugins/stackgen/stacks/stylesheet/` lists `plain-css`, `stylex`,
  `tailwindcss`, each holding `pack.yaml`, `conventions.md` and
  `skills/<slug>/SKILL.md`;
  `command ls plugins/stackgen/stacks/bundles/ | command grep -E "^(tailwindcss|stylex|plain-css)\.md$"`
  lists three.
- **Rule 13 by hand.**
  `command grep -rn "CLAUDE_PLUGIN_ROOT\|assets/contracts\|\.\./" plugins/stackgen/stacks/stylesheet/ plugins/stackgen/stacks/framework/astro/config/ plugins/stackgen/stacks/framework/astro/conventions.md`
  is empty.
- **No six left.**
  `command grep -rn "six axes\|six independent" plugins/ site/src/content/docs/ readme.md CLAUDE.md .claude/`
  is empty after wave 3.
- **The kind is counted.** `plugins/stackgen/stacks/inventory.md`'s header after
  wave 1 shows one more kind, three more packs and three more bundles than the
  tree the worktree was cut from, and lists `stylesheet` under `## Kinds`.
- **The formats moved together.**
  `command grep -n "config_format: 19\|blueprint_format: 25" plugins/vwf/assets/vwf-config.md`
  shows both; `command cat plugins/vwf/assets/blueprint-format` prints `25`.

## Unit contract

Every unit prompt carries, in order: its ruling quoted from this file, its owned
paths plus "touch nothing outside this list", the facts section, the shared-file
rule, and the return block below. A unit never bumps a version, never runs a
generator (U3 and U4 excepted, for the inventory alone, per decision 13), never
edits a doc, never adds a dependency this file does not list, never commits. A
unit deletes with plain `rm`, never `git rm` — it stages nothing.

A unit returns exactly this block and nothing else — no file contents, no diff:

    CHANGED: <path> — <one line>            (one per file)
    DECIDED: <what> — <why>                 (choices made inside scope, or none)
    DOCS FALSIFIED: <path> — <passage>      (reported, never edited; or none)
    GAP: <what the plan left unspecified and the assumption taken>   (or none)
    UNRESOLVED: <the ruling needed>         (or none)

A `GAP:` is a hole in the plan the unit could proceed past on a stated
assumption; it is recorded and the run continues. An `UNRESOLVED:` is a ruling
the unit could not proceed without; it blocks the unit and its dependents.

## Out of scope

- **This repo's own `site/`** — not re-materialized from the Astro bundle, not
  moved to Tailwind. It is the evidence B08 lifts from, not a target; the
  2026-09-05 site plan already parked materialising it. Its release line is its
  own.
- **A task-rendered OpenGraph image** — the pack reserves the slot
  (`image: default`, the path the head reads) and the doctrine says the product
  supplies the art; rendering it is the site plan's parked item, still parked.
- **`p:site:icons --check`** — a gate feature, not part of shipping a favicon
  set; still parked from the site plan. The landed task has no `--check` either.
- **The `build_output:` payload field** the Astro decision parked — untouched.
- **A stylesheet choice for non-web frontends** (Flutter, native) — the axis is
  conditioned on `site` and `webapp` by definition.
- **Stylesheet options beyond the three shipped** (vanilla-extract, Panda, CSS
  modules) — the `generate` door covers them; a shipped pack is a later plan.
- **Rule 11 widening for a `public/` root dir** — declined with decision 6.

## Parked

- **A `stylesheet` pack for the generated webapp frameworks' own conventions**:
  `typescript-hono-refine` is `@generated`, so its head and stylesheet
  integration come from the generator instantiating `contracts/web-head.md` and
  the stylesheet pack's doctrine at first fetch; nothing to plan until a webapp
  framework pack ships.
- **Doctor verifying the head at runtime** — a fetched page's `<head>` against
  the screen's `Metadata` block belongs to `/vwf:verify`'s environment mode, not
  this plan.

## Run log

<written by /vwf:change-execute; empty at approval>

| Wave | Unit      | Model | Round | Outcome     | Detail                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Commit   |
| ---- | --------- | ----- | ----- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| 0    | preflight | —     | —     | green       | All nine gate lines green on the branch cut from `develop` at `fcdee7c2`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |          |
| 1    | U1        | opus  | 1     | green       | 9 files; config_format 19 / blueprint_format 25 in vwf-config.md, 18 → 19 migration, two lineage rows. DECIDED: every new mention qualified as `config_format` 19 (bare "format 19" already means blueprint_format 19 in eight files); "two tool axes" heading renamed to three in stack-adapter.md and stack-menu.md; materialize.md writes `stylesheet: unresolved` only where the registry declares site/webapp; doctor/SKILL.md needed one edit (never enumerates design/cicd by name). GAP: unit said insert the migration "before 16 → 18 (newest first)" but the file is oldest-first with a stray 10 → 11 last — inserted after 16 → 18, before the stray. GAP: stack-menu.md's "since format 19" kept as the blueprint-side format this file has always cited; the historical claim not verified                                                                                                                                                                                                                                                                                                                                                                                                                                                | 13b11c4e |
| 1    | U2        | opus  | 1     | green       | 15 files; blueprint-format 25. DECIDED: `## Brand assets` sentence case (gate greps it); `screens/**` and `feedback/SKILL.md` left unedited — canvas-facing enumerations, a frame states no title/description/indexability; Metadata reaches render via mockup-generator. GAP: `assets/templates/screen-prompt.md:72` enumerates the brief from Components and is in no Owns — left untouched. GAP: new conventions anchor sits under the "foundation anchors only when cross_cutting accepted" comment (:52-54) — resolved by the section's own "NOT a product foundation" comment. Pre-existing, untouched: `agents/execute-ux-reviewer.md:25-26` still says Screens live in `index.md`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | 12ae5539 |
| 1    | U3        | opus  | 1     | green       | 3 packs (14 files), 3 bundles, `stylesheet` type and kind, enums in pack-format and both stackgen skills, inventory 64→67 packs / 60→63 bundles / 12→13 kinds. DECIDED: kind topic 7 (Testing) is the conditional bar entry; Tailwind tokens are two layers (custom properties + `@theme inline`, Context7-verified v4); Tailwind spacing namespace left unpinned (no Context7 entry); plain-css requires a named browser baseline. GAP: unit said `stackgen-stack-template/SKILL.md:116` counts thirteen — no kind count exists there, nothing renumbered                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | 2ca10c7e |
| 1    | R1        | opus  | 1     | findings(5) | CONTRACT clean, RULINGS clean. Rule 5 in nobody-owned trees → widened to U5 as `DOCS FALSIFIED:` per the wave-review reference: (a) `plugins/vwf/assets/examples/blueprint/**` — the conformance example is a `webapp` declaring `seo`, no Screens row carries a Metadata block, `conventions.md:13` stamped format 24 with no `#web-metadata` anchor, `design-system.md:11` has no Brand assets; (b) `plugins/stackgen/stacks/readme.md:171,184` — "the two tool axes" is now three, and the orchestrator's "six axes" grep does not match that spelling. Looped to U1: (c) `vwf-config.md:586` "the first paired bump since `16`'s predecessors" is an invented lineage claim (last paired bump was 14 → 15); (d) `stack-vocabulary.md:83` and `stack-menu.md:24` new table rows not padded to the column widths. Gates re-run green by the reviewer; rule 13 grep empty over `stacks/stylesheet/`                                                                                                                                                                                                                                                                                                                                                     |          |
| 1    | U1        | opus  | 2     | green       | Dropped the lineage claim in `vwf-config.md`; repadded the axes tables in `stack-vocabulary.md` (col 1 11 → 14) and `stack-menu.md`. DECIDED: kept the pre-existing overflow of the `backing`/`deploy` rows in `stack-vocabulary.md` — padding to them would widen the whole table by ~40 columns                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | 13b11c4e |
| 1    | R1        | opus  | 2     | findings(1) | CONTRACT clean, RULINGS clean; both U1 fixes landed, nothing else moved. One new finding, **contested** after the two-round cap: `vwf-config.md:589` [U1, rule 4] the round-2 reflow left `fields:` alone on a line mid-sentence — a ragged wrap in a non-formatted tree                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |          |
| 2    | U4        | opus  | 1     | green       | 9 changes: `contracts/web-head.md` (new), Astro `## Head` + `references/head.md`, the landed `p/_project/icons` task (755, bash), pack 0.2.0 with four bundle pins, `output-tree.md` row (g), inventory regenerated (counts unchanged 67/63/13). DECIDED: `#MISE dir="{{ config_root }}"` with in-script project resolution by the favicon mark (a marked position in `#MISE dir` would be a second rename edit); header block renamed deploy → icons; `rx` squaring generalised to `r[xy]`; png-to-ico comment no longer cites a doc absent from the target repo. DOCS FALSIFIED → U5: `.claude/skills/stackgen-plugin/SKILL.md:39` (newest contract is `web-head.md`), `:92-117` (row (g) missing), `site/.../plugins/stackgen.md:67,89` and `how-to/operate/choosing-your-stack.md:52` (astro bundles without the head doctrine or the icons task). GAP: edit 3's "`#MISE dir` in the deploy form" is self-contradictory (deploy uses the repo root) — resolved per the DECIDED. GAP: rule-13 grep over the astro tree is non-empty before and after — `references/csr.md:17` has a `../app/App` import inside a fence, which rule 13 blanks; `p:plugins:check` green. Task run end-to-end in two throwaway repos; Astro API claims Context7-verified | 698d38fd |
| 2    | R2        | opus  | 1     | findings(3) | CONTRACT clean; RULINGS: U4 departed from decision #6 — `contracts/web-head.md:111` and `references/head.md:151` attribute the `public/` files to "the workflow at materialization" (setup's pass) where the ruling says `/vwf:execute` writes them from the doctrine. Rule 4: the icons task's `sed -E "s/ r[xy]=\"[^\"]*\"//g"` deletes the radii instead of zeroing them, so an `<ellipse>` mark rasterizes blank (verified on a sample SVG). Rule 3: `skills/astro/SKILL.md:6` frontmatter description reworded beyond edit 2's reference-list instruction (low weight, validate passes). All nine edits landed, four pins at 0.2.0, gates green                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |          |
| 2    | U4        | opus  | 2     | green       | `public/` files re-attributed to `/vwf:execute` in `web-head.md` and `references/head.md`; `SKILL.md` description restored verbatim; icons task squaring rewritten to zero `rx`/`ry` only inside `<rect>` tags, in node. DECIDED: the reviewer's stated remedy (zero every radius) does not fix the defect — `rx="0"` on an `<ellipse>` renders nothing, and line-scoping fails on a minified one-line mark — so zeroed per element. Re-run end to end on a mark with `<rect>` + `<ellipse>` on one line: touch icon corner squared, ellipse intact, ICO 3 icons                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | 698d38fd |
| 2    | R2        | opus  | 2     | pass        | All three fixes landed, nothing else moved; the node squaring checked against `<rect rx>` alone, `<rect rx ry>`, `<ellipse>` and `<circle>` — rects zeroed, the rest untouched; task 755, shellcheck/shfmt/rule 13 clean                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | 698d38fd |
| 3    | U5        | opus  | 1     | green       | Manual (`plugins/vwf.md`, `plugins/stackgen.md`, `choosing-your-stack.md`, `how-to/index.md`, four greenfield/brownfield how-tos, `migrate-old-vwf-repo.md` lineage rows), `readme.md`, `.claude/skills/stackgen-plugin/SKILL.md` (newest contract `web-head.md`, row (g), editor fragment → (h)), `.claude/skills/vwf-plugin/references/{assets,docs-tree,dependencies}.md`, the widened `plugins/stackgen/stacks/readme.md` and `plugins/vwf/assets/examples/blueprint/**` (Metadata block per Screens row, `#web-metadata`, Brand assets, stamped 25). DECIDED: example stamps per file — only the two files format 25 reaches bumped, `registry.yaml` and flow `index.md` stay 24; interior example titles drop the site-name suffix (`og:site_name` carries it); `CLAUDE.md` and `docs/backlog.md` untouched (neither counts axes, packs, kinds or formats). dprint run on the nine owned files it flagged only                                                                                                                                                                                                                                                                                                                                     | 68685dce |
| 3    | R3        | opus  | 1     | findings(6) | CONTRACT clean, RULINGS clean. Looped to U5: `choosing-your-stack.md:34` "six of the seven asked of every project" (five — `repo` is per checkout); `plugins/vwf.md:599` bare "format 19" needs `blueprint_format`; `plugins/vwf.md:1421` edit 3's stylesheet-round mention in the `/vwf:architecture` section did not land; `ui-with-design-tool.md:85` asserts a `dart-flutter` project declaring `webapp` is asked the stylesheet round — a claim the plan never made (Out of scope names Flutter) → the example is dropped, the condition stated as the plan states it; `plugins/stackgen/stacks/readme.md:190,193,201` ragged folds. Nobody-owned: `plugins/stackgen/.claude-plugin/plugin.json:5` description still says "Two tool axes (design, cicd)" — the file is U6's by the shared-file rule, so U6's edit widens to that one string. GAP: whether a Flutter project declaring `webapp` is asked the stylesheet round is unruled; the docs now assert nothing about it                                                                                                                                                                                                                                                                       |          |
| 3    | U5        | opus  | 2     | green       | Five fixed: five-of-seven per project with `repo` named as the once-per-checkout axis; "Before `blueprint_format` 19"; `/vwf:architecture` section names the stylesheet round; Flutter claim dropped; `stacks/readme.md` paragraphs refolded 69–78. DECIDED: refolding the Bundles paragraph normalized two pre-existing 79/81 lines inside it                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | 68685dce |
| 3    | R3        | opus  | 2     | findings(1) | CONTRACT clean, RULINGS clean; all routed fixes landed, other 17 files byte-identical, `p:site:check` green. One new finding, **contested** after the two-round cap: `site/src/content/docs/plugins/vwf.md:1425` [U5, rule 5] the new wording "one round per axis per project" — `repo` is answered once per checkout                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | 68685dce |
| 4    | U6        | opus  | 1     | green       | `site/package.json` 1.1.12 → 1.1.14; stackgen 1.10.0 → 1.11.0 with the description "Two tool axes (design, cicd)" → "Three tool axes (design, cicd, stylesheet)"; vwf 19.23.0 → 19.24.0; marketplace regenerated (stackgen-v1.11.0, vwf-v19.24.0). Gate 9/9. GAP: the Consent block's literal numbers were stale — the base already carried stackgen 1.10.0, vwf 19.23.0, site 1.1.12 (landed by repo-name-split and audit-capability after this plan was written) — so the consented **levels** (minor, minor, patch) were applied, not the literals. GAP: `.config/mise/tasks/p/site/version` is broken for the 13-skip case its own comment documents — the second `pnpm version` refuses the tree the first bump dirtied (`ERR_PNPM_UNCLEAN_WORKING_TREE`), left 1.1.13 on disk and exited 1; U6 set 1.1.14 by hand; the task is outside every Owns and stays unfixed (`p:i:version` likely shares it)                                                                                                                                                                                                                                                                                                                                               | 0f19eadc |
| 4    | R4        | opus  | 1     | pass        | CONTRACT clean, RULINGS clean — each bump one level of the consented kind over the base's actual version, no 13/17 component, marketplace `--check` up to date pinning `stackgen-v1.11.0` / `vwf-v19.24.0`, no lockfile moved, no tag cut. Its two listed findings restate U6's recorded GAP (the broken skip loop) and the orchestrator's widening (the description string) — nothing to loop                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | 0f19eadc |

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the fresh session's worktree — cut from the integration branch — can see it.

Run in a fresh session:

/vwf:change-execute docs/plans/2026-09-14-web-frontend-surface
