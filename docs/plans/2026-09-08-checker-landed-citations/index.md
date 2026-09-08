---
type: repo-plan
title: Checker coverage for the pack tier — landed citations, pack
  frontmatter, bundle pins
requires: []
---

# Plan — Checker coverage for the pack tier (2026-09-08)

## Status

**RUNNING** — started 2026-09-08 11:11, worktree
`/Users/virajpatel/Projects/github.com/virajp/claude-plugins/.worktrees/2026-09-08-checker-landed-citations`,
branch `2026-09-08-checker-landed-citations`.

APPROVED 2026-09-08 by the user, after the shape gate and the post-self-review
yes.

## Consent

| Action                                       | Granted |
| -------------------------------------------- | ------- |
| Merge to `develop` and push on green run     | yes     |
| Stage locally (`plugins:local`) on green run | yes     |
| Release `vwf` publicly                       | none    |
| Release `stackgen` publicly                  | none    |
| Release installer publicly                   | none    |

**A release is two stages.** The local one — `mise run plugins:local` — stages
the changed plugins into the dev marketplace and updates this machine's install;
it publishes nothing, so execute-plan runs it without a further prompt and only
reports what it staged. The public one is the tags, and it is what the release
rows above are about: they are intent, and execute-plan stops once before the
`main` merge and the tags and asks, per `CLAUDE.md`. A staged plugin loads only
in a **restarted** session.

The user chose "not this time" for stackgen: the pack rewrites are prose-only
and ride the next release with the 1.1–1.6 work already queued behind the
`stackgen-v1.0.0` tag. **No `plugin.json` is bumped by this plan.** vwf is not
touched.

## Goal

After this lands, three silent failures become gate failures: a pack skill whose
frontmatter a strict YAML parser rejects (the host drops such a skill with no
error, and the 69 pack skills have never been parsed); a pack file that, once
copied into a target repo, cites a path that only exists inside the stackgen
plugin (`${CLAUDE_PLUGIN_ROOT}/assets/…`, bare `assets/…md`, a `../` climb out
of the pack, or a path into a sibling pack); and a bundle whose
`<type>/<slug>@<version>` pin names a pack that does not exist or a version the
pack no longer carries. The framing: `plugins:check` covers the plugin tier well
and the pack tier thinly, and the pack tier is now the larger surface (69 pack
skills against 33 plugin skills; 62 packs; 58 bundles).

This plan reverses no standing decision. It creates **one new ruling** — a
bundle's pin equals the pack's current `version` — which had lived only as an
acceptance criterion in an archived plan and now gets an owner in
`pack-format.md`.

## Facts the survey established

**The checker.** `scripts/src/check.ts` (1469 lines). Rule dispatch at `check()`
lines 76–98: per-plugin rules 83–91, cross-plugin 94–96. `Finding` is
`{scope, message}` at 50–57. `ROOT_REF_RE` at 67. `PACK_*` constants 255–358.
`checkPackConfigTier` 396–491 walks the filesystem with `filesUnder` (624–636)
because dot segments are invisible to the plugin file reader.
`checkFrontmatterYaml` 645–670 iterates `[...plugin.skills, ...plugin.agents]`
at 648. `checkRootRefs` 706–731 resolves every `${CLAUDE_PLUGIN_ROOT}/<ref>`
against the plugin root; `resolveRootRef` 733–735 is exported. `stripFences`
at 1057. `proseOf` 1411–1419, `captures` 1422–1429. Twelve rule functions today;
the docs say "twelve".

**The reader.** `scripts/src/plugins.ts`: `readPlugin` at 98; `files` is one
`globSync("**/*")` at 108 (561 files for stackgen, **no path containing a dot
segment** — zero `/.config/` entries, though 95 of the 104 config-tier files
live under one); `skills` is `globSync("skills/*/SKILL.md")` at 118 and `agents`
is `globSync("agents/*.md")` at 119 — plugin root only. Pack skills
(`stacks/*/*/skills/*/SKILL.md`, 69 files) and every `conventions.md` (62)
**are** in `files`. `frontmatterBlock(text): string | null` at 167, `bodyOf` at
176, memoising `readText(absolute)` at 151.

**The tests.** `scripts/src/check.test.ts`: `Fixture` at 88, `tree(plugins)` at
100 builds a temp `plugins/` root, `write` 128, `skill(name, extra, body)` 134
emits valid frontmatter, `messages()` 138. Corpus assertion at line 24:
`expect(check(repoRoot)).toEqual([])`. Describe blocks: "the pack config tier"
244 (with `const pack = "stacks/toolchain-manager/mise/config"` at 245),
"frontmatter" 486, "root-relative references" 575 (fixtures at 576, 596, 618 all
use plugin-root `skills/one/SKILL.md`), "the design-adapter contract" 636 (a
`pack()` helper at 641 seeding `stacks/design-tool/acme/pack.yaml`, `three()` at
650), "the stack-adapter contract" 700. No fixture puts strict-invalid
frontmatter in a pack skill or a plugin-root token in a landed tier, so nothing
existing breaks except the corpus assertion, which goes red until the rewrites
land.

**The inventory generator.** `scripts/src/inventory.ts`: `Pack` type 46 (carries
`type`, `slug`, `version`), `Bundle` 58 (`components: string[]`),
`readInventory(repoRoot)` 77 calls `readKinds` 100, `readPacks` 116,
`readBundles` 148, then `assertKind` 291 for packs and bundles — the module doc
at 24–27 says these are the only throw conditions. `readBundles` requires a
non-empty `components` list at 163 and stringifies entries at 171 without
parsing them. Exports: `readInventory`, `renderInventory`, four path constants
(41–44). `inventory.test.ts` reads the real repo (19–21) and has one synthetic
`renderInventory` case at 68; no temp-fixture idiom. CLI `--check` at 303–326.
Simulated against the committed tree: 68 unique component refs, 57 pinned to a
version, 11 `@generated`, 0 unresolved, 0 mismatches — change 3 lands green.

**The landed tiers.** Doctrine that output must work with no plugin installed:
`plugins/stackgen/assets/output-tree.md:3-6`, `materializer.md:265-267`. Copied
verbatim: `pack-format.md:24,207,256-258`, `materializer.md:34,44,99`; the
materializer's only mutation is the `p/_project/` → `p/<id>/` rename
(`materializer.md:57-68`). `conventions.md` lands as the body of
`.claude/stackgen/templates/<slug>.md` (`pack-format.md:246-252`), and so does a
**bundle's body** (`skills/stackgen-stack-template/SKILL.md:40,92`). So the
landed tiers are `stacks/*/*/{skills,agents,rules,hooks,config}/**`,
`stacks/*/*/conventions.md` and `stacks/bundles/*.md`. No pack ships `agents/`
or `rules/` today; two ship `hooks/`; 18 ship `config/`.
`artifact-doctrine.md:17-18` says of itself "this is never materialized".

**The population** (596 landed files, 119 carry a hit, 163 hits):

| Form                                  | Hits | Notes                                                                                                                                                                                                  |
| ------------------------------------- | ---: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| (a) `${CLAUDE_PLUGIN_ROOT}/…`         |   23 | 14 files; always backticked with braces; 22 name `assets/<path>.md`, one (`bundles/npm-package.md:31`) is the pathless token in an argument about the token itself                                     |
| (b) bare `assets/<path>.md`           |  111 | backticked or in parens; never a leading `./` or `../`                                                                                                                                                 |
| (c) `../` climbing out of the pack    |    2 | `cloud-service/email-service/conventions.md:133` (`../../../assets/taxonomy.md`); `cloud-service/workflows/skills/cloudflare-workflows/references/service-doctrine.md:220` (`../../../conventions.md`) |
| (d) path into another pack            |   29 | 24 at `cloud-provider/cloudflare/conventions.md`, 4 at `cloud-provider/cloudflare/skills/cloudflare/references/*`, 1 at `cloud-service/r2/conventions.md`                                              |
| (d-bare) `<type>/<slug>` with no path |  266 | **legitimate identifiers** (the lockfile's and a bundle's vocabulary) — never refused                                                                                                                  |

Five false positives a naive (c) regex hits: three intra-skill links in
`app-framework/flutter/skills/flutter-ios/references/standards.md:127,206,207`
(valid after landing) and two fenced `extends` examples in
`toolchain-gate/tsconfig/skills/tsconfig/SKILL.md:102,110`.

By type directory (a / b / d-path / files): cloud-service 18/51/25/69 — the 22
Cloudflare packs carry all 18 (a) and all 25 (d), the 7 GCP/Firebase packs only
(b); bundles 1/35/4/23; capability-provider 0/14/0/12; toolchain-manager
2/1/0/3; cloud-provider 0/3/0/3; toolchain-gate 0/2/0/2; deploy-target 0/2/0/2;
ci-system 0/2/0/2; repo-hygiene 2/0/0/1; datastore 0/1/0/1; app-framework
0/0/0/1.

Cited assets (134 citations, 15 assets): `contracts/secrets.md` 27,
`contracts/local-stack.md` 22, `contracts/release-trigger.md` 15,
`contracts/orchestration.md` 14, `output-tree.md` 12,
`contracts/observability.md` 12, `contracts/datastore.md` 7, `taxonomy.md` 7,
`contracts/object-storage.md` 6, `contracts/identity.md` 5, `ids.md` 3,
`kinds.md` 1, `pack-format.md` 1, `artifact-doctrine.md` 1,
`delivery-pipeline.md` 1 (vwf's asset, not stackgen's).

**Pack directories.** cloud-service: ai-gateway ai-search analytics-engine
browser-rendering containers d1 durable-objects email-service hyperdrive images
kv pipelines queues r2 realtime secrets-store vectorize workers-ai workers-ssr
workers-static-assets workflows zero-trust-access (Cloudflare, 22) and cloud-run
cloud-sql firebase-auth firebase-messaging firebase-storage firestore gke
(GCP/Firebase, 7). cloud-provider: cloudflare gcp. capability-provider: doppler
fnox oidc otel-lgtm temporal. datastore: postgres. deploy-target:
container-image. ci-system: github-actions. app-framework: flutter.
toolchain-manager: mise. toolchain-gate: analysis-options dprint eslint gitleaks
grype pre-commit ruff tsconfig. repo-hygiene: repo-hygiene. framework: astro
cloudflare-agents effect. language: bash markdown typescript. package-manager:
pnpm pub uv. design-tool: claude-design lovable stitch.

**Gates covering the trees.** `plugins:check` (`node scripts/src/check.ts` then
`claude plugin validate --strict`), `plugins:inventory --check`,
`plugins:marketplace --check`, `pnpm vitest run`, `tsc --noEmit -p scripts`.
Pre-commit: `plugins-inventory` (`.config/pre-commit-config.yaml:46-52`, files
`^plugins/stackgen/(stacks/|assets/kinds\.md)`) before `plugins-check` (53–59,
files `^plugins/`). No existing test under `installer/` or `scripts/` reads
`stacks/**` frontmatter or bundle refs.

**Docs that describe today's behaviour** (the docs unit's list): `CLAUDE.md:62`
("the twelve checker rules"), `:142-144` (what `plugins:inventory --check` fails
on), `:145` ("twelve rules"), `:199` (authoring traps);
`.claude/docs/repo-shape.md:69,148` ("twelve"), `:140-147` (inventory's only
throw condition), `:166-169` (rules 4 and 6);
`.claude/skills/plugin-authoring/references/checks.md:13` (inventory gate row),
`:29` ("## The twelve rules"), `:42-46` (rule 4), `:52-53` (rule 6), `:140-152`
("The plugin-root trap"); `.claude/skills/plugin-authoring/SKILL.md:103`;
`.claude/skills/stackgen-plugin/SKILL.md:204-206` (inventory throws on an
undefined kind only) and the "Two scripts" section (rule 6 reads nothing in
packs); `.claude/skills/vwf-plugin/SKILL.md:41` ("The twelve checker rules"),
`:157`; `site/src/content/docs/plugins/stackgen.md:747` (strict-YAML frontmatter
as a generator/reviewer gate only). `readme.md` states no rule count and needs
nothing. `plugins/stackgen/assets/pack-format.md:256-285` (Rules) has no
bundle-pin rule and no citation rule.

**Versions.** stackgen `plugin.json` 1.6.0, last tag `stackgen-v1.0.0`; vwf
19.14.0, last tag `vwf-v19.12.0`. Neither is bumped here.

**Dependencies already available** to `scripts/`: `yaml` (strict parser used by
rule 4), Node's own `fs.globSync`, vitest. Nothing new is needed.

## Assumed decisions — confirm or override at review

| #  | Decision                                                                                               | Ruling                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Rejected                                                  | Unit      |
| -- | ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | --------- |
| 1  | Rule 13 scope                                                                                          | Refuse **all four** citation forms in landed tiers: (a) the literal `${CLAUDE_PLUGIN_ROOT}` anywhere, pathless included; (b) bare `assets/<path>.(md\|yml\|yaml)`; (c) a `../` chain whose resolved target leaves the file's own `skills/<name>/` directory (or, for a non-skill landed file, any `../` chain at all); (d) `<type>/<slug>/<segment…>` where `<type>` is a `stacks/*` directory other than `bundles` (the user's choice)                          | token only; token plus bare                               | U1, U3–U6 |
| 2  | Landed tiers                                                                                           | `stacks/*/*/{skills,agents,rules,hooks,config}/**`, `stacks/*/*/conventions.md`, `stacks/bundles/*.md`. `config/` is walked with `filesUnder`, since `plugin.files` drops dot segments                                                                                                                                                                                                                                                                           | excluding bundles                                         | U1        |
| 3  | Bare component refs                                                                                    | `<type>/<slug>` with no trailing `/` (and `<type>/<slug>@<version>`) is an identifier and is never refused; only a trailing `/` plus a segment makes a path                                                                                                                                                                                                                                                                                                      | refusing bare refs                                        | U1        |
| 4  | Form (a) applies to every landed file; forms (b)–(d) to `.md` files only, fenced blocks stripped first | shell and config files under `config/` and `hooks/` legitimately use relative paths that land together; a fenced block is a worked example                                                                                                                                                                                                                                                                                                                       | one regex over every file                                 | U1        |
| 5  | Rule 6 narrows                                                                                         | `checkRootRefs` skips landed-tier files (the same predicate rule 13 uses), so a bad reference there yields exactly one finding                                                                                                                                                                                                                                                                                                                                   | letting both rules fire                                   | U1        |
| 6  | Rule 4 widens                                                                                          | `checkFrontmatterYaml` also parses `stacks/*/*/skills/*/SKILL.md` and `stacks/*/*/agents/*.md`; `rules/*.md` excluded because frontmatter is optional there                                                                                                                                                                                                                                                                                                      | skills only; rules included                               | U1        |
| 7  | Bundle pins                                                                                            | The inventory generator **throws** on a component ref that is malformed, names no `stacks/<type>/<slug>/pack.yaml`, or pins a version differing from that pack's `version`; `@generated` refs are skipped. The ruling is written into `pack-format.md`'s Rules section beside "a pack is copied, never referenced in place" (the user's choice)                                                                                                                  | warn on mismatch; add the inverse unreferenced-pack check | U2, U7    |
| 8  | Rewrite doctrine                                                                                       | Name the cited asset **by role** when the sentence already carries its own reason; **state the rule inline** when the passage depends on the cited content. Never delete a sentence to satisfy the rule                                                                                                                                                                                                                                                          | an exemption list                                         | U3–U6     |
| 9  | Canonical role names                                                                                   | `contracts/<x>.md` → "stackgen's <x> contract"; `output-tree.md` → "stackgen's output charter" (the root allowlist and the CI-workflow fence are stated inline where cited); `taxonomy.md` → "stackgen's taxonomy"; `kinds.md` → "stackgen's kind vocabulary"; `pack-format.md` → "stackgen's pack format"; `artifact-doctrine.md` → **never named**, its rule stated inline; `delivery-pipeline.md` → "vwf's delivery-pipeline contract"                        | per-unit phrasing                                         | U3–U6     |
| 10 | Cross-pack and own-pack conventions                                                                    | A path into a sibling pack becomes "the `<type>/<slug>` component's conventions, in this composition's template" (bare ref allowed); a skill citing its own pack's conventions becomes "this component's conventions, in the composition's template". A path into a sibling pack's `skills/…/references/*` names the sibling's skill by its skill name, which lands beside it                                                                                    | dropping the sentence                                     | U3, U4    |
| 11 | ids.md                                                                                                 | Both mise-pack citations reduce to the invariant: `REPO_NAME`, the `p:<id>:*` group, the member flag and the `setup-<id>` alias carry one identical token, the one `/vwf:init` showed and the user confirmed. The slug derivation stays single-sourced in ids.md (the user's choice)                                                                                                                                                                             | restating the slug rule inline                            | U5        |
| 12 | `bundles/npm-package.md:31`                                                                            | Rewritten without the literal — "no path from this plugin spells vwf's root" — rather than exempted                                                                                                                                                                                                                                                                                                                                                              | a stated exemption in the rule                            | U6        |
| 13 | Inventory failure tests                                                                                | A temp-root fixture mirroring `plugins/stackgen/stacks/` plus a minimal `assets/kinds.md`, driven through the existing `readInventory(repoRoot)` export; no new exports                                                                                                                                                                                                                                                                                          | exporting `readBundles`                                   | U2        |
| 14 | Rule 13's finding shape                                                                                | Reports `stackgen:<path>:<line>` like rule 12, with the form matched and the replacement doctrine in the message                                                                                                                                                                                                                                                                                                                                                 | file-level scope                                          | U1        |
| 15 | A decisions doc                                                                                        | U7 writes `docs/memory/decisions/2026-09-08-landed-pack-files-cite-nothing-by-path.md` recording decisions 1–3 and 7 so recall finds them                                                                                                                                                                                                                                                                                                                        | no doc (not a reversal)                                   | U7        |
| 1c | Form (c) refinement (orchestrator, wave 1)                                                             | The survey's "intra-skill" false positives at `flutter-ios/references/standards.md:127,206,207` are `../../flutter/references/*.md` — a sibling skill in the **same pack's** `skills/` tree, which lands beside it. So (c) fires for a skill file only when the resolved target leaves the pack's `skills/` directory; the literal "own `skills/<name>/`" wording would have refused 8 links the plan calls valid. Non-skill landed files still refuse any `../` | the literal wording                                       | U1        |
| 16 | Model                                                                                                  | `opus` on every unit                                                                                                                                                                                                                                                                                                                                                                                                                                             | —                                                         | all       |

## New dependencies

none

## Units

| Id | Wave | Unit file                                                      | Owns                                                                                                                                                                                                                                                                                                | Depends on | Status  | Commit   |
| -- | ---- | -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------- | -------- |
| U1 | 1    | [01-checker-rules.md](01-checker-rules.md)                     | `scripts/src/check.ts`, `scripts/src/check.test.ts`                                                                                                                                                                                                                                                 | —          | green   | edb42ee3 |
| U2 | 1    | [02-inventory-pins.md](02-inventory-pins.md)                   | `scripts/src/inventory.ts`, `scripts/src/inventory.test.ts`                                                                                                                                                                                                                                         | —          | green   | 43627c67 |
| U3 | 1    | [03-rewrite-cloudflare.md](03-rewrite-cloudflare.md)           | `plugins/stackgen/stacks/cloud-service/{ai-gateway,ai-search,analytics-engine,browser-rendering,containers,d1,durable-objects,email-service,hyperdrive,images,kv,pipelines,queues,r2,realtime,secrets-store,vectorize,workers-ai,workers-ssr,workers-static-assets,workflows,zero-trust-access}/**` | —          | green   | 5f970043 |
| U4 | 1    | [04-rewrite-gcp-and-singles.md](04-rewrite-gcp-and-singles.md) | `plugins/stackgen/stacks/cloud-service/{cloud-run,cloud-sql,firebase-auth,firebase-messaging,firebase-storage,firestore,gke}/**`, `plugins/stackgen/stacks/{cloud-provider,datastore,deploy-target,ci-system,app-framework,framework,language,package-manager,design-tool}/**`                      | —          | green   | 2b69a5a4 |
| U5 | 1    | [05-rewrite-repo-packs.md](05-rewrite-repo-packs.md)           | `plugins/stackgen/stacks/{capability-provider,toolchain-manager,toolchain-gate,repo-hygiene}/**`                                                                                                                                                                                                    | —          | green   | c665ddd4 |
| U6 | 1    | [06-rewrite-bundles.md](06-rewrite-bundles.md)                 | `plugins/stackgen/stacks/bundles/*.md`                                                                                                                                                                                                                                                              | —          | green   | a541dc81 |
| U7 | 2    | [07-docs.md](07-docs.md)                                       | `CLAUDE.md`, `.claude/docs/**`, `.claude/skills/plugin-authoring/**`, `.claude/skills/*-plugin/**`, `site/src/content/docs/**`, `readme.md`, `plugins/stackgen/assets/pack-format.md`, `docs/memory/decisions/2026-09-08-landed-pack-files-cite-nothing-by-path.md`                                 | U1–U6      | pending |          |
| U8 | 3    | [08-gates-and-bump.md](08-gates-and-bump.md)                   | `.claude-plugin/marketplace.json`, `plugins/stackgen/stacks/inventory.md` (generated; no `plugin.json` changes — release is none)                                                                                                                                                                   | U7         | pending |          |

Status is one of `pending`, `running`, `green`, `failed`, `unresolved`,
`skipped`.

## Shared-file rule

| File                                                                                                           | Why it collides                                                                                     | Owner                    |
| -------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------ |
| `plugins/*/.claude-plugin/plugin.json`                                                                         | several units bumping one version is a lost update — and this plan bumps **nothing**                | gates-and-bump unit only |
| `.claude-plugin/marketplace.json`, `plugins/stackgen/stacks/inventory.md`                                      | generated; regenerating mid-wave races                                                              | gates-and-bump unit only |
| `readme.md`, `CLAUDE.md`, `site/CLAUDE.md`, `site/src/content/docs/**`, `.claude/docs/**`, `.claude/skills/**` | n units editing one doc                                                                             | docs unit only           |
| `plugins/stackgen/assets/pack-format.md`                                                                       | doctrine the rewrite units cite and the bundle-pin ruling lands in; a rewrite unit must not edit it | docs unit only           |
| `plugins/stackgen/assets/**` (everything else)                                                                 | the assets the rewrites stop citing by path; not a landed tier, not in scope                        | nobody — untouched       |
| `scripts/src/plugins.ts`                                                                                       | both U1 and U2 import it; neither needs to change it                                                | nobody — untouched       |

## Waves

- **Wave 1 — U1, U2, U3, U4, U5, U6.** Disjoint paths: two `scripts/` pairs and
  four non-overlapping slices of `plugins/stackgen/stacks/`. Expected and
  intended: `plugins:check` and the corpus assertion at `check.test.ts:24` are
  **red mid-wave** (U1's rule fires on citations U3–U6 are removing) and green
  at the wave gate once all six land. The wave review must not resolve that red
  by weakening the rule or by "fixing" a citation outside its unit's Owns.
- **Wave 2 — U7.** Docs and the decisions doc, after every DOCS FALSIFIED line
  is in.
- **Wave 3 — U8.** Generators, the full gate, target-verifier.

## Wave gate

`mise run plugins:check`, `mise run plugins:marketplace --check`,
`mise run plugins:inventory --check`, `pnpm vitest run`,
`pnpm exec tsc --noEmit -p installer` and `-p scripts`,
`mise run plugins:npm-normalize-test`, plus the wave review, plus every report
read for `UNRESOLVED:`. `site:check` is not required: `site/src/content/docs/`
is edited only by U7 for one passage and the link checker is not affected by
prose; run it anyway if U7 touches a link.

The plan's own checks, run after wave 1 and again at U8:

```sh
# rule 13 must find nothing in the committed tree
node scripts/src/check.ts
# the four forms, over the landed tiers, outside fences — must be empty
# (a)
grep -rn --include='*.md' --include='*.yaml' --include='*.yml' --include='*.sh' --include='*.toml' --include='*.jsonc' 'CLAUDE_PLUGIN_ROOT' plugins/stackgen/stacks/*/*/{skills,agents,rules,hooks,config,conventions.md} plugins/stackgen/stacks/bundles
# (b)
grep -rnE --include='*.md' '(^|[^A-Za-z0-9_./])assets/[A-Za-z0-9_./-]+\.(md|ya?ml)' plugins/stackgen/stacks/*/*/{skills,conventions.md} plugins/stackgen/stacks/bundles
# (d)
grep -rnE --include='*.md' '(^|[^A-Za-z0-9_./-])(app-framework|capability-provider|ci-system|cloud-provider|cloud-service|datastore|deploy-target|design-tool|framework|language|package-manager|repo-hygiene|toolchain-gate|toolchain-manager)/[a-z0-9-]+/[A-Za-z0-9_]' plugins/stackgen/stacks/*/*/{skills,conventions.md} plugins/stackgen/stacks/bundles
```

The (b) and (d) greps are looser than the rule (they do not strip fences), so a
hit inside a fenced block is inspected, not rewritten.

## Gates the orchestrator keeps

- **target-verifier** at U8, because `plugins/` changed: pass condition is the
  existing one — the marketplace validates, stackgen installs hermetically, and
  an uninstall leaves nothing.
- **The rule fires on its own fixture.** After wave 1, the orchestrator confirms
  `pnpm vitest run` reports the new rule-13 and widened-rule-4 tests as run, not
  skipped, and that the corpus assertion passes — a rule that can never fire is
  the defect class this repo's checker exists to avoid.

## Unit contract

Every unit prompt carries, in order: its ruling quoted from this file, its owned
paths plus "touch nothing outside this list", the facts section, the shared-file
rule, and the return block below. A unit never bumps a version, never runs a
generator, never edits a doc, never adds a dependency this file does not list,
never commits, and **never runs `git checkout`, `git restore` or a formatter
`--fix` outside its Owns**.

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

- **A stackgen or vwf release.** "Not this time": the pack rewrites ride the
  next release. No `plugin.json` changes.
- **Warning rather than failing on a stale bundle pin.** The user chose fail.
- **The inverse inventory check** (a pack no bundle references). It would
  surface `package-manager/uv` and `toolchain-gate/ruff` on day one, which are a
  recorded gap
  (`docs/memory/gaps/2026-09-01-python-packs-authored-but-unreachable.md`), so
  it needs an exemption mechanism from the start. Parked.
- **Restating the slug rule in the mise pack.** The user chose the invariant.
- **Editing `plugins/stackgen/assets/**` other than the one rule added to
  `pack-format.md`.** The assets are not landed and are not what the rule
  refuses.
- **Any change to `scripts/src/plugins.ts`.** Both consumers can do their work
  from `plugin.files` plus `filesUnder`.
- **A relative-link checker outside `assets/examples/`.** Surveyed: 37
  unresolved relative links exist and every one is a template placeholder.
  Parked.

## Parked

- **The inverse inventory check** — packs no bundle references. Today: `uv`,
  `ruff`. Needs an allowlist keyed on the recorded gap.
- **kinds.md invocation rulings** are asserted only for `design-tool` packs
  (rule 8) and the two adapter skills (rule 9). The other kinds' "Invocation"
  rulings (paths-scoped routers, model-invocable cloud skills) are checked by
  nothing; all 69 pack skills conform today (surveyed 2026-09-08).
- **pack.yaml shape**: `type` equals its directory, the directory is a
  `taxonomy.md` type, `category` where the type has categories, `axis`,
  `platforms` on `language`, mandatory `extensionToLanguage` on `lsp_servers`,
  the `mcp_servers`/`user_mcp_servers` name collision that "halts the run".
  Inventory requires only `name`, `summary`, `version`, `kind`. All pass today.
- **Pack `hooks.yaml`** event and matcher shape (the pnpm pack's) is read by
  nothing; the stackgen-plugin skill already admits it.
- **Skill and agent `name:` versus directory/filename** — unchecked; all match
  today.
- **Relative markdown links outside `assets/examples/`** — 90 links, 37
  unresolved, all template placeholders; a real broken reference link would
  pass. Needs a placeholder-aware rule (`<…>` segments).
- **The technology-free guard's `TOOL_TOKENS` is hand-curated** and has no
  `cloudflare`, `wrangler`, `flutter`, `vercel` or `mise`; vwf names Flutter 7
  times as an example and `mise` 93 times as a prescribed command. Whether
  `mise` is a violation of "vwf names no technology" is a doctrine question the
  guard does not decide.
- **The `plugin-authoring` skill's own doc slips**: neither it nor `checks.md`
  says `plugins:check` also runs `claude plugin validate --strict`; the SKILL.md
  description says "the four mise gates" while listing more. U7 may fix the
  first in passing since it owns the file; the second is cosmetic.

## Run log

| Wave | Unit      | Model | Round | Outcome     | Detail                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Commit   |
| ---- | --------- | ----- | ----- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| 0    | preflight | —     | 1     | green       | check, marketplace --check, inventory --check, vitest (272 passed / 2 skipped), tsc installer + scripts, npm-normalize (33 cases) all green on develop                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | —        |
| 1    | U2        | opus  | 1     | returned    | `assertComponents(packs, bundles)` in readInventory; 5 temp-root cases via `readInventory(repoRoot)`. DECIDED: fifth case (bare ref, no `@version`) added since edit 1 rules it a throw; packs indexed in a Map keyed `<type>/<slug>`; dprint fmt on the two owned files only. DOCS FALSIFIED: stackgen-plugin/SKILL.md:204-206, CLAUDE.md:142-144, repo-shape.md:140-147, pack-format.md:256-285. GAP: mismatch message split across three literals for line width, runtime text identical.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |          |
| 1    | U5        | opus  | 1     | returned    | 15 files: capability-provider (temporal, otel-lgtm, oidc, fnox ×6, doppler ×3), mise SKILL.md + task-library.md (ids.md → decision 11 invariant), gitleaks SKILL.md, repo-hygiene conventions.md. DECIDED: kept task-library.md:466-467 (restates invariant, ruling forbids deletion); one stock opener across the five contract-satisfaction.md; refolded edited paragraphs only. DOCS FALSIFIED: none. GAP: three form-(b) hits left in place — `fnox/hooks/fnox-ciphertext-guard.sh:5` (comment), `mise/config/.config/mise.toml:101` (byte-copied payload), `mise/references/config-files.md:85` (inside a fenced toml block mirroring the payload) — decision 4 confines (b) to .md outside fences; assumption: rule 13 as specified does not refuse them, so the tree is green; the mise.toml payload comment and its config-files.md mirror would have to change together and that is a config-tier edit U5 may not make. Five further (b) hits sit in `pack.yaml` files, which decision 2 excludes. Also flagged `pnpm-lock.yaml` drift — orchestrator's bootstrap, restored and reinstalled frozen, not a unit's. UNRESOLVED: none. |          |
| 1    | U6        | opus  | 1     | returned    | 23 bundle files: contracts named by role, output charter by role, `claude-code-plugin.md` states the artifact-doctrine rule inline (never named), `npm-package.md:31` rewritten without the literal, sibling conventions by decision-10 phrasing. DECIDED: the "neutral X contract" opener absorbs the citation for the six capability bundles; edited paragraphs re-folded whole where a swap left a ragged line. DOCS FALSIFIED: none. GAP: decision 9 names no per-contract role — assumed `contracts/<x>.md` → "stackgen's <x> contract" applies to each. UNRESOLVED: none.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |          |
| 1    | U4        | opus  | 1     | returned    | 29+ files across gcp cloud-provider, the 7 GCP/Firebase service packs, postgres, container-image, github-actions: contracts named by role; gcp local-development-map.md drops the "Read it" pointer and keeps the readiness rule inline; github-actions conventions.md "delivery-pipeline rules" → "contract". Mid-run flagged 8 flutter `../<sibling-skill>/` links rule 13 (c) refused → orchestrator ruling 1c, links left unchanged. Also `language/typescript/.../build-and-run.md:16` (a `../../` idiom mention, restated as prose). DECIDED: two `pack.yaml` kinds.md comments left (not a landed tier); "Read it" pointers dropped with the rule kept inline; framework/package-manager/design-tool untouched. DOCS FALSIFIED: none. GAP: the 8 flutter links (plan listed only 3) valid per unit 04 and ruling 1c; `language/` was not empty as surveyed. UNRESOLVED: none.                                                                                                                                                                                                                                                         |          |
| 1    | U1        | opus  | 1     | returned    | rule 13 `checkLandedCitations` (landed-tier walk, four forms, line-stable fence blanking); rule 6 skips landed files; rule 4 parses pack skills + agents; 12 new tests. DECIDED: form (b) lookbehind `(?<![\w./-])` (plan's own guardrail needs the hyphen — fixture caught `my-assets/x.md`); one finding per match, not per line; CLI summary unchanged. DOCS FALSIFIED: none (U7's list covers them). GAP: form (c) boundary = the pack's whole `skills/` tier, not one skill's dir (= ruling 1c); `workflows/.../service-doctrine.md:220` and any climb from conventions.md/bundle still fire; tests pin both. Re-returned after ruling 1c: the extra `../two/references/z.md` case pinned (13 new tests), doc comment states the reason; corpus assertion green, check.ts "All checks passed", 110 tests, tsc clean, 0 rule-4 findings across 69 pack skills, zero flutter findings, dprint clean. UNRESOLVED: none.                                                                                                                                                                                                                    |          |
| 1    | U3        | opus  | 1     | returned    | Reports green. 27+ files across the 22 Cloudflare packs so far received: provider conventions cited as a component (decision 10), contracts/taxonomy/output charter named by role, `email-service/conventions.md` `../../../assets/` climb removed, sibling-skill references named by skill name, r2's notification rule stated inline in queues; realtime's four `../<pack>/` climbs → bare component refs; workers-ssr/static-assets output charter (allowlist + CI fence) and `GLB_` rule inline; workflows `../../../conventions.md` → "this component's conventions, in the composition's template". DECIDED: extensionless `assets/contracts/` rewritten only where a hit forced the sentence; output-charter sites reduced to the role name; realtime refs are identifiers (decision 3), not doc pointers. DOCS FALSIFIED: none. GAP: survey said 2 form-(c) hits, there are 6 (realtime/conventions.md:39,52,69,71 extra) — rewritten under 1(c)'s non-skill reading; no bundle composes queues with r2, so r2's rule stated inline with bare `cloud-service/r2` kept. All four greps clean; check.ts exit 0. UNRESOLVED: none.      |          |
| 1    | gate      | —     | 1     | green       | plugins:check (All checks passed + validate --strict), marketplace --check, inventory --check, vitest 288 passed / 2 skipped (+16), tsc installer + scripts, npm-normalize 33. Orchestrator gate: 8 landed-citation, 2 pack-frontmatter, 5 inventory component-ref tests ran (✓, none skipped); corpus assertion green. No UNRESOLVED in any report.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | —        |
| 1    | R1        | opus  | 1     | findings(3) | CONTRACT clean (120 paths, all in Owns). RULINGS: U4 departed from #8 — `github-actions/.../release.md:3` "**Read it first.**" deleted rather than reworded. Tree traps [U3]: `containers/conventions.md:94` 83 chars vs ~70 fold; `realtime/conventions.md:39` 77 vs ~68. CHECKS: check.ts exit 0; greps (a) 0, (b) 0 outside fences (config-files.md:85 inside fence), (d) 0; 16 new tests (11 check + 5 inventory; U1's "13" overcounts). Looped to U3, U4.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | —        |
| 1    | U4        | opus  | 2     | returned    | release.md:3 imperative restored as "**Read that contract first.**"; gcp local-development-map.md pointer restored as "Read that contract for the full mechanism". DECIDED: both name the contract by role; these were the only two dropped pointers. UNRESOLVED: none.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |          |
| 1    | U3        | opus  | 2     | returned    | Refolded containers/conventions.md Credentials tail (~70), realtime/conventions.md app-secret paragraph (~68), and self-caught queues service-doctrine.md four-tokens sentence (77). DECIDED: containers local-dev.md:15 stays 85 chars — a bare URL, same width as the line it replaced. Wording unchanged. UNRESOLVED: none.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |          |
| 1    | R1        | opus  | 2     | pass        | FINDINGS 0 — all three round-1 findings resolved. CONTRACT clean (same 120 paths). RULINGS clean (restorations name the contract by decision-9 role). check.ts exit 0, vitest 288/2 unchanged, width scan zero files over.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | —        |
| 1    | gate      | —     | 2     | green       | Re-run on the post-review tree: check + validate, marketplace, inventory, vitest 288/2, tsc ×2, npm-normalize 33 — all green.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | —        |
| 1    | commits   | —     | —     | green       | Committed U3 5f970043, U4 2b69a5a4, U5 c665ddd4, U6 a541dc81, U2 43627c67, U1 edb42ee3 — in that order, not U1-first: pre-commit stashes unstaged files, so with rule 13 already at HEAD a rewrite unit committed alone fails the plugins-check hook. U1's first commit (c7f39be7) was soft-reset before any rewrite commit; every hook passed on every commit.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | edb42ee3 |

## Launch

Run in a fresh session:

/execute-plan docs/plans/2026-09-08-checker-landed-citations
