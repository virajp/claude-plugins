---
type: vwf-change-plan
title: Astro pack — MDX, the image pipeline, and layouts
requires: []
backlog: [ B47 ]
---

# Plan — Astro pack — MDX, the image pipeline, and layouts (2026-09-22)

## Status

**COMPLETE**

COMPLETE 2026-09-23 — 5097542e 03343a34 c98c6ac8 577f498f 56950a19 d253c9c7

## Consent

| Action                                                                                                                                    | Granted |
| ----------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| Merge to the integration branch and push on green                                                                                         | yes     |
| After landing: `mise run p:plugins:local`                                                                                                 | run     |
| Release stackgen publicly — version hand-edited in `plugins/stackgen/.claude-plugin/plugin.json`, tag cut by `mise run p:plugins:release` | none    |
| Release site publicly — `mise run p:site:version` then `mise run p:site:release`                                                          | none    |

**The mode recorded here is the consent.** A `run` step runs on a green landing
without a prompt; an `ask` step stops the run once before it, reports what it
would do, and waits. The mode is the interview's answer (item 17), and a release
step recorded `run` is authorised by the interview's release question (item 18)
— a release recorded `ask`, or with no step at all, is intent, not
authorisation. Where a step stages something this session already loaded, it is
picked up only by a **restarted** session.

Both releases are recorded `none`: the stackgen version still moves in the tree
(`1.26.0` to `1.27.0`, U6) because that is what an install pins to and what
`p:plugins:local` stages, but no tag is cut and nothing reaches a user from this
plan. The site is not bumped at all — see *Out of scope*.

## Goal

The `framework/astro` pack tells a generated Astro project how to author MDX,
how to use the image pipeline, and how to compose layouts and slots — three
topics it is silent or near-silent on today — and it tells every one of its four
rendering modes, not just the static one.

The framing: B47 reads "astro-ssg defined in detail, MDX for static content",
and its body claims the pack does not cover MDX, content collections, or the
page/layout split. The survey falsified part of that premise. Content
collections **are** covered in depth already. There is also no such thing as an
"astro-ssg pack" to deepen — there is one pack, `framework/astro`, and all four
bundles pin the same version of it. What is genuinely missing is MDX (zero
occurrences pack-wide), the image pipeline (zero occurrences pack-wide), and a
real treatment of layouts, which today exists only as a one-line table row and
as the head-props contract.

**No reversal.** Nothing here contradicts a standing decision, a decisions doc,
a CLAUDE.md rule or a recalled drawer. The correction to B47's premise is a
fact, not a reversal, and needs no decisions doc.

## Facts the survey established

**There is one Astro pack, not four.**
`plugins/stackgen/stacks/framework/astro/` is at `pack.yaml:9` version `0.3.0`.
All four bundles pin that same version: `bundles/astro-ssg.md:11`,
`bundles/astro-csr.md:10`, `bundles/astro-hybrid.md:10`,
`bundles/astro-ssr.md:10`. SSG is a bundle, not a pack — so anything written
into the pack reaches all four modes automatically, and there is no SSG-only
pack to write into.

**The bundles differ only slightly.** SSG and CSR carry six components; SSR and
Hybrid carry the same six plus `framework/effect@0.1.0`. Only `astro-ssg`
carries `default: true` (`bundles/astro-ssg.md:5`), and all four declare
`platforms: [site]`. This plan changes none of that — only the shared
`framework/astro` pin moves.

**The pack today.** `conventions.md` is 155 lines with seven headings: The four
modes (13), Build output (41), Islands (57), Four config facts and the reasons
for them (69), Head (93), What this pack writes (139), What this component does
not decide (146). The skill is `skills/astro/SKILL.md` (40 lines, frontmatter
`version: 0.1.0`, a routing table of nine rows) plus eight references:
`framework-doctrine.md` (118), `ssg.md` (73), `ssr.md` (78), `hybrid.md` (70),
`csr.md` (106), `content-and-routing.md` (98), `head.md` (179),
`build-output.md` (65), `testing.md` (63). Total pack markdown: 1045 lines over
10 files.

**Coverage, verified by grep, not assumption.** Content collections are covered
in depth at `content-and-routing.md:42-75` — `defineCollection`, the glob
loader, a `z.object` schema, `getCollection`, build-time schema enforcement,
`_`-prefix exclusion. Islands are covered at `conventions.md:57-67` plus
`csr.md`. Markdown transforms are covered at `content-and-routing.md:76-91`. The
page/layout split exists only as two one-line rows in the `src/` table at
`content-and-routing.md:6-21` plus the head-props contract at
`conventions.md:93-101`. **MDX returns zero hits** across the entire pack.
**`astro:assets`, `<Image>` and `getImage` return zero hits** across the entire
pack.

**Depth against siblings.** astro (1045 lines, 10 files) is already the
second-largest framework-category pack and its `conventions.md` is longer than
`framework/html`'s equivalent section-for-section. The contrast is
`app-framework/flutter` (5851 lines, 30 references, per-topic deep-dives and two
platform sub-skills). So "the depth the other packs have" in B47 points at
reference *breadth*, not at a deficiency in `conventions.md` — and that breadth
is explicitly out of scope here.

**The gates that cover this tree.** Editing
`plugins/stackgen/stacks/framework/astro/**` fires pre-commit hooks
`plugins-marketplace --check`, `plugins-inventory --check` and `plugins-check`;
`plugins-shellcheck` fires only for `config/` or `hooks/`, neither of which this
plan touches. All nine wave-gate lines below were run on `develop` at plan time
and all nine exited 0.

**Formatting.** `plugins/**/*.md` is excluded from dprint
(`.config/dprint.json:9`) but is **not** excluded from the linter —
`.config/linter.yaml` has no `plugins/**` entry. So new reference files are
linted (including `markdown/no-multiple-h1`) but never auto-formatted: fold
width is matched by hand. `plugins/*/stacks/*/*/config/` is excluded too
(`.config/dprint.json:10`), and is untouched here.

**Commit convention.** `.config/git-conventional-commits.yaml:3-9` allows
exactly `ops`, `docs`, `merge`, `feat`, `fix`, `refactor`. `commitScopes` is an
empty list, so any scope or none is accepted.

**Versions at plan time.** `plugins/stackgen/.claude-plugin/plugin.json:4` is
`1.26.0`; `plugins/vwf/.claude-plugin/plugin.json:4` is `19.43.1`;
`site/package.json` is `1.1.40`. The pack is `0.3.0` and the astro skill's own
frontmatter is `0.1.0`. Neither `1.27.0` nor `0.4.0` nor `0.2.0` lands on a 13
or 17 component, so the version guard does not bite.

**The plan index is empty.** `docs/plans/index.md` carries no rows at plan time,
so this plan requires nothing and blocks nothing.

**This repo's own `site/` is not generated from this pack.** It is hand-built
Astro with one content collection and no MDX. `2026-09-05-website` still parks
"materialising `site/` through stackgen's bundle" as never done, and
`2026-09-15-html-site-pack` states outright that `site/` stays on its own Astro.
The pack describes generated projects; `site/` is not one.

**Docs that may describe today's behaviour**, for the docs unit to check rather
than assume: `site/src/content/docs/plugins/stackgen.md` (the "Four bundles on
one pack — the Astro example" section),
`site/src/content/docs/how-to/operate/choosing-your-stack.md:55-85` (the
five-entry `site` round and the html-versus-astro comparison, which today reads
"no content collections, no islands"),
`.claude/skills/stackgen-plugin/SKILL.md`, and `readme.md` (the Astro example
section, and the favicon-rasterizer mention at `readme.md:293-299`).

## Assumed decisions — confirm or override at review

| #  | Decision                       | Ruling                                                                                                                                                                                                                                                                                                             | Rejected                                                                               | Unit   |
| -- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- | ------ |
| D1 | Where the material sits        | Three new shared references — `mdx.md`, `images.md`, `layouts.md` — written once at pack level, each stating the genuine mode deltas inline. The four mode references gain a routing line only. All four bundles get it.                                                                                           | SSG-scoped material; a substantive per-mode section duplicated into all four mode refs | U1–U4  |
| D2 | `conventions.md` is not opened | "Four config facts, and the reasons for them" is a counted heading over the proven-static set. The MDX integration entry and any image-service config live in the new references instead, so the heading is never renumbered.                                                                                      | Renaming it to "Five config facts"; adding a new `## Integrations` section to it       | U1, U2 |
| D3 | The boundary with markdown     | `mdx.md` owns MDX-the-format. `content-and-routing.md` keeps its `## Markdown transforms` section and gains one cross-link; the `src/` table's `src/layouts/` row gains a cross-link to `layouts.md`.                                                                                                              | Moving markdown transforms out of `content-and-routing.md` into `mdx.md`               | U4     |
| D4 | No review row                  | The plan lands prose only — no shell, no hook scripts, no TypeScript, nothing that executes. Per interview item 10a a `Kind: review` row is written only when the change lands runnable code, so there is none. The wave review is the only check.                                                                 | A review row after U4                                                                  | —      |
| D5 | Who bumps the skill version    | U4 owns `SKILL.md` wholly, including bumping its frontmatter `version:` from `0.1.0` to `0.2.0`. The gates-and-bump rule governs *released project* versions; a skill's own frontmatter version is content U4 is already rewriting, and splitting it would put two units in one file against the shared-file rule. | U6 owning that one line inside a file U4 edits                                         | U4     |
| D6 | Context7 before writing        | U1, U2 and U3 each resolve Astro's docs through Context7 (`resolve-library-id` then `get-library-docs`) before writing, and confirm from the pack which Astro major it targets rather than assuming one. This is a CLAUDE.md hard rule.                                                                            | Writing Astro API prose from training knowledge                                        | U1–U3  |
| D7 | No reputation unit             | The only concrete third-party names the new prose emits are `@astrojs/mdx` and `sharp`, both first-party Astro and both inside the `astro` / `@astrojs/*` scope the pack already emits. A unit that finds it needs a name outside that scope stops and returns `UNRESOLVED:` rather than inventing one.            | A `stackgen-reputation` vetting unit                                                   | U1, U2 |
| D8 | The checker-numbering mismatch | `CLAUDE.md` numbers the checker rules 11/13/14/15 as config-tier / landed-citations / bundle-defaults / exclusion-sets; the call order in `scripts/src/check.ts:76` reads 11 = design adapters, 13 = bundle defaults, 14 = exclusion sets, 15 = vwf-technology-free. One is stale. It is parked, not fixed here.   | Widening this plan to reconcile them                                                   | —      |

## New dependencies

**None.** No package is added to this repo. Two names appear in new *prose*, as
instructions to a generated project rather than as dependencies of this tree:
`@astrojs/mdx` (the first-party Astro integration MDX requires) and `sharp`
(Astro's own default image service). Both are inside the `astro` / `@astrojs/*`
scope the pack already emits — see D7. A unit adds nothing not listed here.

## Units

| Id | Wave | Unit file                                    | Kind | Owns                                                                                                                                                                                                                                                                             | Depends on | Status | Commit   |
| -- | ---- | -------------------------------------------- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------ | -------- |
| U1 | 1    | [01-mdx.md](01-mdx.md)                       | edit | `plugins/stackgen/stacks/framework/astro/skills/astro/references/mdx.md`                                                                                                                                                                                                         | —          | green  | 5097542e |
| U2 | 1    | [02-images.md](02-images.md)                 | edit | `plugins/stackgen/stacks/framework/astro/skills/astro/references/images.md`                                                                                                                                                                                                      | —          | green  | 03343a34 |
| U3 | 1    | [03-layouts.md](03-layouts.md)               | edit | `plugins/stackgen/stacks/framework/astro/skills/astro/references/layouts.md`                                                                                                                                                                                                     | —          | green  | c98c6ac8 |
| U4 | 2    | [04-wiring.md](04-wiring.md)                 | edit | `plugins/stackgen/stacks/framework/astro/skills/astro/SKILL.md`, and under `skills/astro/references/`: `ssg.md`, `ssr.md`, `hybrid.md`, `csr.md`, `content-and-routing.md`                                                                                                       | U1, U2, U3 | green  | 577f498f |
| U5 | 3    | [05-docs.md](05-docs.md)                     | edit | `readme.md`, `CLAUDE.md`, `site/src/content/docs/**`, `.claude/skills/stackgen-plugin/SKILL.md`                                                                                                                                                                                  | U4         | green  | 56950a19 |
| U6 | 4    | [06-gates-and-bump.md](06-gates-and-bump.md) | edit | `plugins/stackgen/stacks/framework/astro/pack.yaml`, `plugins/stackgen/stacks/bundles/astro-ssg.md`, `astro-ssr.md`, `astro-hybrid.md`, `astro-csr.md`, `plugins/stackgen/stacks/inventory.md`, `plugins/stackgen/.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json` | U5         | green  | d253c9c7 |

Status is one of `pending`, `running`, `green`, `failed`, `unresolved`,
`skipped`.

Every unit is `Kind: edit`. There is no `Kind: review` row — see D4.

## Shared-file rule

| File                                                  | Why it collides                                                                                       | Owner                |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | -------------------- |
| `plugins/stackgen/.claude-plugin/plugin.json`         | the released plugin version; several units bumping one version is a lost update                       | U6 only              |
| `plugins/stackgen/stacks/framework/astro/pack.yaml`   | the pack version, which the four bundle pins must agree with byte-for-byte                            | U6 only              |
| the four `plugins/stackgen/stacks/bundles/astro-*.md` | each pins the pack version; a pin that disagrees with `pack.yaml` fails inventory generation outright | U6 only              |
| `plugins/stackgen/stacks/inventory.md`                | generated from the stacks tree; regenerating mid-wave races every other unit                          | U6 only              |
| `.claude-plugin/marketplace.json`                     | generated from the plugin manifests                                                                   | U6 only              |
| `readme.md`, `CLAUDE.md`, `site/src/content/docs/**`  | human-facing docs; n units editing one doc                                                            | U5 only              |
| `skills/astro/SKILL.md`                               | U4 rewrites the routing table and the frontmatter version in one pass (D5)                            | U4 only              |
| `skills/astro/references/content-and-routing.md`      | U4 adds the two cross-links; U1 and U3 must not reach into it (D3)                                    | U4 only              |
| `skills/astro/conventions.md`                         | deliberately not opened by any unit (D2)                                                              | nobody — do not edit |

## Waves

- **Wave 1 — U1, U2, U3.** Three brand-new files under one directory, no shared
  path, no cross-reference between them. Their filenames and heading shapes are
  fixed by this plan, so none needs to read another's output. Safe concurrently.
- **Wave 2 — U4 alone.** Its routing lines and cross-links must name files and
  headings that now exist, so it waits on all three of wave 1.
- **Wave 3 — U5 alone.** The docs unit reconciles against the full branch delta,
  which is complete only after U4.
- **Wave 4 — U6 alone.** The version bump, the four pins and both generated
  files must land in one commit; splitting them fails `inventory --check`.

## Wave gate

    mise run p:plugins:marketplace -- --check
    mise run p:plugins:inventory -- --check
    mise run p:plugins:check
    mise run p:plugins:shellcheck
    mise run p:plugins:npm-normalize-test
    pnpm vitest run
    pnpm exec tsc --noEmit -p scripts
    mise run code:precommit
    mise run p:site:check

plus the wave review, plus every report read for `UNRESOLVED:`. Every line here
must be green before wave 1 — all nine were run on `develop` at plan time and
all nine exited 0.

Note for the orchestrator: `p:plugins:inventory -- --check` and
`p:plugins:marketplace -- --check` will fail *during* wave 4 between U6's edit
and U6's regeneration. That is expected and is not a gate break — U6 regenerates
both inside its own unit, and the post-wave-4 gate is what must be green.

## After landing

| Step                       | Mode | Notes                                                                                                                                                          |
| -------------------------- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mise run p:plugins:local` | run  | stages stackgen at `1.27.0+N` into the dev marketplace and updates this machine's install; publishes nothing and cuts no tag; a **restarted** session loads it |

No release step. Both release rows in the consent block read `none`.

## Gates the orchestrator keeps

- **The zero-hit claims must actually close.** After wave 2, a grep for `mdx`
  (case-insensitive) and for `astro:assets`, `<Image` and `getImage` across
  `plugins/stackgen/stacks/framework/astro/` must each return hits in the new
  references and in `SKILL.md`'s routing table. Pass condition: non-empty for
  every term.
- **No unit opened `conventions.md`.** Pass condition: `conventions.md` is
  absent from the branch diff's file list (D2).
- **The pack version and the four pins agree.** Pass condition:
  `mise run p:plugins:inventory -- --check` exits 0 after U6, which it can only
  do when `pack.yaml`'s version and all four `framework/astro@` pins are the
  same string.

## Unit contract

Every unit prompt carries, in order: its ruling quoted from this file, its owned
paths plus "touch nothing outside this list", the facts section, the shared-file
rule, and the return block below. A unit never bumps a version, never runs a
generator, never edits a doc, never adds a dependency this file does not list,
never commits. A unit deletes with plain `rm`, never `git rm` — it stages
nothing.

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

- **Flutter-style per-topic breadth for astro** — state management on the
  client, data and networking, performance, internationalization, deployment
  adapters. This was offered at the interview as option B and declined in favour
  of option A. Several of those topics belong to `framework/react@generated` or
  to the deploy-axis pack, not to a meta-framework pack.
- **This repo's own `site/`** — it is hand-built Astro, never materialized from
  this pack, and two prior plans rule it out explicitly: `2026-09-05-website`
  still parks materialising it as undone, and `2026-09-15-html-site-pack` states
  it "stays on its own Astro". Adding MDX to the pack does not mean adding MDX
  to `site/`.
- **The other three bundles' composition** — `astro-ssr`, `astro-hybrid` and
  `astro-csr` keep their component lists, their `platforms:` and their absent
  `default:` exactly as they are. Only the shared `framework/astro` pin moves,
  and only because the pack version does.
- **Any bundle's `default:` or `platforms:` key** — untouched, so the
  bundle-defaults checker rule stays quiet and `astro-ssg` remains the one
  preselected `site` entry.
- **`conventions.md`** — deliberately not opened; see D2.
- **A site version bump and a `site-v*` tag** — `p:site:version` takes no
  positional argument and refuses a dirty tree, so bumping it mid-run would
  force the bump ahead of every plugin edit and constrain U6 for marginal gain.
  U5's manual edits land on `main` and ship with the next site release someone
  cuts.
- **A stackgen tag** — the version moves in the tree so `p:plugins:local` can
  stage it, but no `stackgen-v*` tag is cut from this plan.

## Parked

- **Flutter-style reference breadth for the astro pack.** The gap B47 gestured
  at with "the depth the other packs have" is real but is about reference count,
  not about MDX: astro has 8 references where flutter has 30, with no per-topic
  deep-dives for state, data, performance or i18n. Worth its own backlog item
  and its own plan; declined here as option B.
- **The checker rule-numbering mismatch.** `CLAUDE.md` and
  `scripts/src/check.ts:76` disagree about which rule is 11, 13, 14 and 15. One
  of the two is stale and should be reconciled; whichever it is, the fix belongs
  to a plan that owns both files.
- **`build_output:` as a template-payload field.** Parked by
  `2026-09-05-astro-static` and still parked; unrelated to this plan.
- **Materializing this repo's own `site/` from the pack.** Parked since
  `2026-09-05-website`; this plan does not disturb it.

## Run log

| Wave | Unit       | Model | Round | Outcome     | Detail                                                                                                                                                                                                                                                                                                                                                                             | Commit   |
| ---- | ---------- | ----- | ----- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| 0    | preflight  | —     | 1     | pass        | doctor: no blocking (no .config/vwf.yaml — stopped at Load); wave gate 9/9 green; no code unit so no LSP/conventions step; no covers: so format check skipped; mempalace has no palace — journal not written                                                                                                                                                                       | —        |
| 0    | sequence   | —     | —     | pass        | wave 1 U1 U2 U3 (edit) → R1; wave 2 U4 → R2; wave 3 U5 → R3; wave 4 U6 → R4; no review row (D4)                                                                                                                                                                                                                                                                                    | —        |
| 1    | U1 mdx     | opus  | 1     | pass        | edit; targets Astro 5/6 render() + glob loader (Context7 /withastro/docs); notes `**/[^_]*.md` glob must widen to {md,mdx} (stated in mdx.md only); omitted MDX processor options; GAP none                                                                                                                                                                                        | —        |
| 1    | U3 layouts | opus  | 1     | pass        | edit; head is not a slot (keeps conventions.md head contract), extra head tags become optional layout props; inner layouts type props via ComponentProps<typeof Base>; collection entries rendered from a page, frontmatter layout key for standalone routed pages only; no mode delta; GAP none                                                                                   | —        |
| 1    | U2 images  | opus  | 1     | pass        | edit; targets Astro 6 (Context7 /withastro/docs); Cloudflare imageService described generally, points to adapter docs; getImage inline-style example carries a CSP note citing conventions.md; names @astrojs/node, @astrojs/cloudflare, sharp (inside D7 scope); GAP none                                                                                                         | —        |
| 1    | R1         | opus  | 1     | findings(4) | mdx.md:130 [U1] CSR rendered 'server side of the shell' — no server in CSR; mdx.md:102 [U1] 81-col line over hand fold; layouts.md:212 [U3] cross-ref promises entry lookup text content-and-routing.md lacks; images.md:98 [U2] getImage 'throws in the browser' unverified; CONTRACT clean; RULINGS clean                                                                        | —        |
| 1    | U3 layouts | opus  | 2     | pass        | edit; R1 fix — on-demand pointer now claims only that route params come from the request (content-and-routing.md:32-36)                                                                                                                                                                                                                                                            | c98c6ac8 |
| 1    | U2 images  | opus  | 2     | pass        | edit; R1 fix — getImage now quotes Astro docs verbatim (server-only APIs, throws on the client, GetImageNotUsedOnServer), client gets src via prop or define:vars; finding's 'breaks the build' premise not in docs (Context7)                                                                                                                                                     | 03343a34 |
| 1    | U1 mdx     | opus  | 2     | pass        | edit; R1 fixes — CSR bullet: MDX renders at build into the prerendered shell, never inside the client:only app; refolded to 79 cols                                                                                                                                                                                                                                                | 5097542e |
| 1    | R1         | opus  | 2     | findings(1) | 4 round-1 findings resolved, none resurfaced; new: images.md:99 [U2] define:vars offered for passing a getImage URL to a client script makes an inline script, which the pack's CSP (script-src 'self', conventions.md:83-88) forbids — fix: data-src read by a bundled script, or a CSP caveat; recorded contested at the 2-round cap; CONTRACT clean; RULINGS clean              | —        |
| 2    | U4 wiring  | opus  | 1     | pass        | edit; SKILL.md 0.2.0 + 3 routing rows; one routing paragraph in each mode ref (links mdx.md#per-mode, images.md#per-mode; layouts unchanged); content-and-routing: src/layouts/ row links layouts.md, Markdown transforms gains closing mdx.md link; collection glob example left alone (D3 allows two cross-links only), mdx.md carries the widening; GAP none                    | —        |
| 2    | R2         | opus  | 1     | findings(1) | SKILL.md:40 [U4] Images routing row lacks `astro:assets` — orchestrator grep gate miss; DOCS FALSIFIED for U5: inventory.md:81 astro description (generated from pack.yaml, U6's), site/.../plugins/stackgen.md:117 Astro passage; CONTRACT clean; RULINGS clean                                                                                                                   | —        |
| 2    | U4 wiring  | opus  | 2     | pass        | edit; R2 fix — Images row now reads `<Image>` from `astro:assets`                                                                                                                                                                                                                                                                                                                  | 577f498f |
| 2    | R2         | opus  | 2     | pass        | astro:assets fix confirmed, none resurfaced; orchestrator grep gate pass (mdx, astro:assets, <Image, getImage hit new refs + SKILL.md); conventions.md absent from diff; CONTRACT clean; RULINGS clean                                                                                                                                                                             | —        |
| —    | acceptance | —     | —     | skipped     | why: no covers: — no blueprint acceptance criteria                                                                                                                                                                                                                                                                                                                                 | —        |
| —    | ux         | —     | —     | skipped     | why: no covers: — no Screens contract                                                                                                                                                                                                                                                                                                                                              | —        |
| —    | reconcile  | —     | —     | skipped     | why: no covers: — no registry/environment/stamps; no code unit so nothing to persist                                                                                                                                                                                                                                                                                               | —        |
| 3    | U5 docs    | opus  | 1     | pass        | edit; stackgen.md gains paragraph after the head passage (all four Astro bundles carry MDX/images/layouts since framework/astro 0.4.0 — true once U6 lands); choosing-your-stack.md:71 one sentence; readme/CLAUDE.md/stackgen-plugin skill checked, not falsified; GAP: docs-sync surveyor report reached the orchestrator, not U5 (forwarded; no finding beyond stackgen.md:117) | 56950a19 |
| 3    | R3         | opus  | 1     | pass        | U5 in Owns; stackgen.md 0.4.0 cites pack version (true after U6); existing 'framework/astro 0.2.0 ships the head' verified against 698d38fd; readme/CLAUDE.md/stackgen-plugin skill correctly untouched; CONTRACT clean; RULINGS clean                                                                                                                                             | —        |
| 4    | U6 bump    | —     | —     | dispatched  | GAP: Owns unchanged but edits widened — R2's DOCS FALSIFIED inventory.md:81 (generated from pack.yaml description, U6-owned) appended to U6: extend pack.yaml description to name MDX, images, layouts before regenerating                                                                                                                                                         | —        |
| 4    | U6 bump    | opus  | 1     | pass        | edit; pack 0.3.0→0.4.0, four pins 0.4.0, stackgen 1.26.0→1.27.0, inventory.md + marketplace.json regenerated; pack.yaml summary gains 'It covers MDX, the image pipeline, and layouts and slots' (fixes inventory.md:81); vwf 19.43.1 and site 1.1.40 untouched; no 13/17; gate 9/9                                                                                                | d253c9c7 |
| 4    | R4         | opus  | 1     | pass        | 8 owned files only; versions exact (pack 0.4.0, 4 pins, stackgen 1.27.0, vwf/site unchanged, no 13/17); generators --check clean; stackgen.md 0.4.0 claim matches; conventions.md absent from diff; CONTRACT clean; RULINGS clean                                                                                                                                                  | —        |
| —    | reconcile  | —     | —     | pass        | final wave gate 9/9 green over the finished tree; orchestrator gates: mdx, astro:assets, <Image, getImage each hit new refs + SKILL.md; conventions.md absent from branch diff; inventory --check green (pack version = four pins)                                                                                                                                                 | —        |

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the fresh session's worktree — cut from the integration branch — can see it.

Run in a fresh session:

/vwf:execute docs/plans/2026-09-22-astro-mdx-images-layouts

or let the queue pick it, by priority:

/vwf:execute next
