---
type: vwf-change-plan
title: tool-config hygiene — git, graphify and renovate move into
  stackgen:tool-config; init fetches no bundle
requires:
  - docs/plans/2026-09-26-tool-config-gates
backlog: [ B66, B72 ]
backlog_pieces: []
---

# Plan — tool-config hygiene — git, graphify and renovate move into stackgen:tool-config; init fetches no bundle (2026-09-27)

## Status

**APPROVED**

APPROVED 2026-09-27 by the user

## Consent

| Action                                                 | Granted                                                                                                 |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| Merge to the integration branch and push on green      | yes                                                                                                     |
| After landing: `mise run p:plugins:local`              | run                                                                                                     |
| After landing: `MISE_ENV=dev mise run setup:precommit` | run                                                                                                     |
| After landing: `/release`                              | ask                                                                                                     |
| Release stackgen publicly                              | none here — rides the unreleased `2.0.0` (T1); tagged `stackgen-v2.0.0` at the asked `/release`         |
| Release vwf publicly                                   | none here — rides the unreleased `20.0.0` (T1); tagged `vwf-v20.0.0` at the asked `/release`            |
| Release installer publicly                             | patch — `1.0.1` → `1.0.2` via `mise run p:i:version`; tagged `installer-v1.0.2` at the asked `/release` |
| Release site publicly                                  | none here — rides the unreleased `1.1.47`; tagged `site-v1.1.47` at the asked `/release`                |

**The mode recorded here is the consent.** A `run` step runs on a green landing
without a prompt; an `ask` step stops the run once before it, reports what it
would do, and waits. The mode is the interview's answer (item 17), and a release
step recorded `run` is authorised by the interview's release question (item 18)
— a release recorded `ask`, or with no step at all, is intent, not
authorisation. Where a step stages something this session already loaded, it is
picked up only by a **restarted** session.

## Goal

After this lands, `/vwf:init` fetches no bundle through the stack adapter for
its baseline: it calls `/stackgen:tool-config all` — now eight tools, git,
graphify and renovate joining mise, dprint, pre-commit, gitleaks and grype — and
writes its own hygiene assets. The repo-hygiene pack, its bundle, its kind and
the `unconditional:` bundle key are gone; `.editorconfig` and `merge=graphify`
land nowhere; a pack asks for its `.gitignore` lines and `.gitattributes` lines
through `tool-config:` calls, GitHub's ignore templates still fetched but
pinned; and the installer no longer installs graphify's raw git hooks.

T3 of three: T1 (`docs/plans/archived/2026-09-26-tool-config-mise`) made the
skill and moved mise; T2 (`docs/plans/2026-09-26-tool-config-gates`) moved the
gates. This plan finishes **B66** and **B72**, and closes T2's gaps 3, 7, 11
(the init and doctor items), 15 and 24.
`docs/plans/2026-09-26-init-commits-the-lock` (B67) requires this plan and runs
next.

**Reversals, each confirmed at the interview one at a time:**

1. The `unconditional:` bundle key and init's fixed-slug fetch
   (`docs/memory/decisions/2026-09-05-vwf-init-and-the-repo-shape.md`) retire
   outright. A repo is shaped when its `tool-config/*` lock records are present.
2. `.gitignore`'s `# ==== <Name> ====` banner sections and init's section merge
   become tool-config blocks, kept in written order.
3. "init copies the hygiene pack's payload" becomes "init writes its own hygiene
   assets".
4. Ruling 3's first wording (a covered language stops fetching its template) was
   caught at write time as a reversal of the hygiene conventions' "a pack that
   froze them would age" rule; the interview kept the rule — covered languages
   still get GitHub's template, asked for by the pack, pinned by commit.

The docs unit writes `docs/memory/decisions/2026-09-27-tool-config-hygiene.md`.

## Facts the survey established

- **The pack** — `plugins/stackgen/stacks/repo-hygiene/repo-hygiene/`
  (`pack.yaml` 1.2.4, kind `repo-hygiene`, axis `repo`). `config/`: `.gitignore`
  (8 banner sections :4-65, the append marker :71-72), `.graphifyignore`,
  `.editorconfig`, `.gitattributes` (`merge=graphify` :11-15),
  `CONTRIBUTING.md`, `SECURITY.md`, `renovate.json`,
  `.github/ISSUE_TEMPLATE/{bug_report,feature_request,config}.yml`,
  `_licenses/{MIT,Apache-2.0}.txt`, `.config/vscode.d/repo-hygiene.jsonc`.
  `conventions.md`: what lands :13-26, gitignore section rule :62-90, the
  language→template table and provider rows :91-162, editor baseline :163,
  contributing and issue forms :190, placeholders `<REPO_URL>` `<YEAR>`
  `<HOLDER>` :203-223, licence and security :224, dependency updates :245.
  `skills/repo-hygiene/SKILL.md` is the generated-skill payload. Conditions
  (`pack.yaml:16-25`): issue forms on `forge: github`, `renovate.json` on
  `update_bot: renovate`, the vscode fragment on `editor: vscode`.
- **The bundle** — `plugins/stackgen/stacks/bundles/repo-hygiene.md`
  (`unconditional: true` :5, pin :7), the only unconditional bundle.
- **The template table** — node → `Node.gitignore` (pnpm, typescript); python →
  `Python.gitignore` (uv); dart → `Dart.gitignore`, plus `Flutter.gitignore` on
  Flutter (pub, flutter); swift → `Swift.gitignore` (swift, swiftpm, swiftui);
  go → `Go.gitignore` and rust → `Rust.gitignore` (no pack). Provider rows: fnox
  → `fnox.local.toml`; doppler → `.doppler/`.
- **tool-config** — `plugins/stackgen/skills/tool-config/SKILL.md` (338 lines):
  tools table :29-35 (mise, dprint, pre-commit, gitleaks, grype), `all` keys
  :91-101 (already carries `forge`, `editor`, `update_bot`), `all add exclude`
  :125-140, blocks :142-222 (entries sorted; plain JSON unmarked, keys in the
  lock :201-203; editor fragments wrapped by the skill :153-156), drift :260,
  removal :284, lock record :295.
  `references/{mise,dprint,pre-commit,gitleaks,grype}.md`;
  `assets/{mise,dprint,pre-commit,gitleaks,grype}/`. Raw-hook strip:
  `assets/mise/.config/mise/tasks/setup/precommit:131-139`, documented
  `references/pre-commit.md:343-348`. `.editorconfig` named in a comment at
  `assets/pre-commit/.config/pre-commit-config.yaml:194`.
- **`unconditional` readers** — `scripts/src/inventory.ts:69,178,237,247`;
  `plugins/stackgen/skills/stackgen-stack-menu/SKILL.md:27-43,88-103,107-111`;
  `plugins/stackgen/assets/pack-format.md:368,379-393`, `taxonomy.md:234`,
  `kinds.md:380`, `output-tree.md:316-322`; vwf `init/SKILL.md:5-7,754-774`,
  `init/references/new-repo.md:119-122`,
  `doctor/references/stack-checks.md:286-296`, `setup/SKILL.md:108-116`,
  `setup/references/onboard-pipeline.md:55-62`.
- **init** — `SKILL.md`: description :5-7, pack framing :42-68, mode row :227,
  "three slugs are fixed" :317, language keys :364-383, editor and update-bot
  questions :594, :614, :640-654, merges :741-752, baseline order :754-774.
  `references/new-repo.md` §2 :80-122, answers :132-198, §4 placeholders
  :258-287, §5 ignore sections :289-317, §8 :519, commit subject :761,
  CONTRIBUTING :1019. `references/existing-repo.md` pass 1 allowlist :54, :77;
  pass 6 :428-448; never-offered files :610-621; pass 8 commit types :636-680;
  pass 10 :765; pass 11 :800. `references/fragments-and-sections.md` ignore
  sections :16-118, editor fragments :125-323.
  `references/readme-and-license.md` (licence :40-60, security :98, copied as-is
  :116-148). `references/tool-configs.md` rows :37-45, renovate/dependabot notes
  :54-66. init has no `assets/` directory today.
- **setup/doctor** — setup `SKILL.md:63,108-116,178`,
  `onboard-pipeline.md:55-62`; doctor
  `stack-checks.md:286-296,353+,385+,499-501`, `code-intelligence.md:35` (wrong
  remedy for a raw graphify hook).
- **stackgen docs** — `pack-format.md:137,158,314,368-408`;
  `taxonomy.md:52-59,225-234`; `output-tree.md:138,167,249,316-322,381`;
  `kinds.md:288-369,379-380,403,948,958` (11 kinds; `repo-hygiene` among them);
  `stackgen-stack-template/SKILL.md:80`,
  `references/materializer.md:86-91,145-152`; `stackgen-sync/SKILL.md:120`;
  `stacks/inventory.md:10,19,92,158`.
- **checker** — `scripts/src/check.ts`: `PACK_CONFIG_ROOT_FILES` :329-352 (holds
  `.editorconfig`, `.gitattributes`, `.gitignore`, `.graphifyignore`,
  `CONTRIBUTING.md`, `LICENSE`, `SECURITY.md`, `renovate.json`),
  `PACK_CONFIG_ROOT_DIRS` :363, `checkPackConfigTier` :420, the tool-config line
  grammar near :723-808. Tests: `check.test.ts` pack config tier :280+,
  exclusion sets :1702+. No test names repo-hygiene or unconditional.
- **installer** — `installer/src/graphify.ts:60-75` runs
  `graphify hook install`; `installer/src/graphify.test.ts`; uninstall runs
  `graphify hook uninstall` (`installer/src/uninstall.ts`). Version lives in the
  root `package.json` (`1.0.1`, tag `installer-v1.0.1`).
- **this repo** — `.editorconfig` byte-identical to the pack's; `.gitattributes`
  already has no `merge=graphify` (4cf863e9); `.gitignore` sectioned, hand-kept;
  `.config/mise/tasks/setup/precommit` lacks the raw-hook strip (T2 gap 24).
- **Retired-name grep** (`repo-hygiene`, `editorconfig`, `merge=graphify`,
  `unconditional`, outside `docs/plans` and `docs/memory`): every hit sits in a
  unit's Owns — plugin files in U1, U2, U3, U5, U7; `.claude/**`, `site/**` and
  the root docs in U10.
- **Versions** — stackgen `2.0.0` (last tag `stackgen-v1.33.0`), vwf `20.0.0`
  (last tag `vwf-v19.46.0`), site `1.1.47` (last tag `site-v1.1.46`).
- **Commit types** (`.config/git-conventional-commits.yaml:3-9`): `ops`, `docs`,
  `merge`, `feat`, `fix`, `refactor`; no scopes.

## Assumed decisions — confirm or override at review

| #  | Decision            | Ruling                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Rejected                                                                                          | Unit           |
| -- | ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | -------------- |
| 1  | Content home        | Split by kind: the config files become tool-config tools; the prose files and the VS Code baseline become init's own assets.                                                                                                                                                                                                                                                                                                                                                                                                      | all into tool-config; all into init                                                               | U1, U2         |
| 2  | Tool list           | Three new tools — `git` (`.gitignore`, `.gitattributes`), `graphify` (`.graphifyignore`, plus its `.gitignore` lines as a `graphify` block through `git add ignore`), `renovate` (`renovate.json`, only on `update_bot=renovate`, keeping the yield rule). `all` lands eight tools, the three after the five. Each gets `references/<tool>.md` and `assets/<tool>/`.                                                                                                                                                              | git and renovate only; one `repo` tool                                                            | U1             |
| 3  | Ignore sources      | A pack asks with `git add ignore <pattern…>` or `git add ignore template=<Name>` in its `tool-config:` list, or both. A template is fetched from github/gitignore into the pack's block; one several packs ask for is written once and removed when no requester is left (the shared-entry rule). init's fallback fetches a template only for a detected language no pack covers, as a `gitignore:<Name>` block. The provider rows retire into fnox's and doppler's `pack.yaml`. The template table moves to `references/git.md`. | packs hand-write patterns (reverses the no-freeze rule); init fetches every template by detection | U1, U2, U7     |
| 4  | Template pin        | The lock records the upstream commit SHA per template (resolved with `git ls-remote https://github.com/github/gitignore main`, fetched from `raw.githubusercontent.com/github/gitignore/<sha>/<Name>.gitignore`); re-runs fetch the same SHA, so drift is a real local edit; the tool-config upgrade verb re-fetches `main` and moves the SHA inside its consent.                                                                                                                                                                 | always fetch `main`                                                                               | U1             |
| 5  | Attribute verb      | `git add attribute <pattern> <attr…>`. The base `.gitattributes` keeps the universal lines — `* text=auto eol=lf`, `*.lock linguist-generated`, the binaries — and no `merge=graphify`; a pack adds its own lockfile's generated marker when the lockfile does not end in `.lock`.                                                                                                                                                                                                                                                | base keeps every stack's lines                                                                    | U1, U7         |
| 6  | Order in .gitignore | Entries inside a `.gitignore` block keep written order, never sorted, so a negation follows its pattern — an exception to the sorted-block rule. The base is one `git` block with its banner comments kept inside it.                                                                                                                                                                                                                                                                                                             | negation-aware sort; keep banner sections                                                         | U1             |
| 7  | No doubling         | The normalised comparison (leading and trailing `/` stripped, `**/` ignored, blanks and comments skipped) stays: a non-negation pattern the file already carries is not written again.                                                                                                                                                                                                                                                                                                                                            | drop it                                                                                           | U1             |
| 8  | Banner conversion   | On adoption the git tool converts landed banner sections: one whose content matches the retired base section or a fetched template becomes the matching block; anything else stays outside every block as the user's. init's section merge is removed.                                                                                                                                                                                                                                                                            | leave landed files as they are                                                                    | U1, U2         |
| 9  | Unconditional key   | The `unconditional:` key retires everywhere — pack-format, the menu's skip rule and empty case, init's fixed-slug fetch, the inventory field and column, taxonomy, kinds, output-tree. Shaped means the `tool-config/*` records are present.                                                                                                                                                                                                                                                                                      | keep the key, unused                                                                              | U2, U3, U5, U7 |
| 10 | Kind retires        | The `repo-hygiene` kind retires (11 → 10 kinds). The pack directory and `bundles/repo-hygiene.md` are deleted with `rm`.                                                                                                                                                                                                                                                                                                                                                                                                          | —                                                                                                 | U7             |
| 11 | init assets         | `plugins/vwf/skills/init/assets/hygiene/` holds `CONTRIBUTING.md`, `SECURITY.md`, `licenses/{MIT,Apache-2.0}.txt`, `.github/ISSUE_TEMPLATE/*`, `.config/vscode.d/hygiene.jsonc`, laid out as they land. The placeholder, licence and security doctrine moves into init's reference. No lock record for them.                                                                                                                                                                                                                      | keep the fragment name `repo-hygiene.jsonc`                                                       | U2             |
| 12 | .editorconfig       | Stops landing. Reshape offers deleting a landed `.editorconfig` byte-identical to the retired payload, inside its one consent; an edited one is left as the user's. This repo's copy is deleted.                                                                                                                                                                                                                                                                                                                                  | leave it; keep shipping it                                                                        | U2, U8         |
| 13 | Migration           | Reshape replaces a `repo-hygiene/repo-hygiene` lock record with `tool-config/{git,graphify,renovate}` records and renames a landed `.config/vscode.d/repo-hygiene.jsonc` to `hygiene.jsonc`. Doctor stops requiring the slug.                                                                                                                                                                                                                                                                                                     | —                                                                                                 | U2, U3         |
| 14 | Gaps 7 and 15       | The raw-hook strip in `setup/precommit` also removes a `merge=graphify` line from `.gitattributes` and every `merge.graphify.*` key from the local git config; it never deletes `.gitattributes`.                                                                                                                                                                                                                                                                                                                                 | —                                                                                                 | U1             |
| 15 | Gap 3               | The commit-type rename table and its "a type in neither column is asked" rule move into `references/pre-commit.md` as an adoption conflict row; init's pass 8 is removed and later passes renumbered.                                                                                                                                                                                                                                                                                                                             | init keeps it through a row                                                                       | U1, U2         |
| 16 | Gap 11              | init `SKILL.md:317` and the description stop naming fixed slugs and bundles; doctor `code-intelligence.md:35`'s remedy for a raw graphify hook becomes `mise run setup:precommit`.                                                                                                                                                                                                                                                                                                                                                | —                                                                                                 | U2, U3         |
| 17 | Gap 24              | This repo's `.config/mise/tasks/setup/precommit` becomes a byte-copy of the tool-config asset.                                                                                                                                                                                                                                                                                                                                                                                                                                    | —                                                                                                 | U8             |
| 18 | Gap 20              | The installer drops `graphify hook install`, keeps `graphify install`; `--uninstall` keeps `graphify hook uninstall` to clean old hooks.                                                                                                                                                                                                                                                                                                                                                                                          | park it                                                                                           | U4             |
| 19 | Checker             | Grammar first (U6): `git`, `graphify`, `renovate` are known tools; `git add ignore <pattern…>`, `git add ignore template=<Name>` and `git add attribute <pattern> <attr…>` parse. Then (U7, with the pack gone): a pack `config/` landing `.gitignore`, `.gitattributes`, `.graphifyignore`, `.editorconfig`, `renovate.json`, `CONTRIBUTING.md`, `SECURITY.md` or `LICENSE` at its root is a finding; the tool-config asset tree still passes.                                                                                   | one checker commit                                                                                | U6, U7         |
| 20 | Inventory           | `stacks/inventory.md` is regenerated in U7's commit, with the pack bumps, the bundle pins, `kinds.md` and `inventory.ts` — pre-commit checks it every commit.                                                                                                                                                                                                                                                                                                                                                                     | the gates unit regenerates it                                                                     | U7             |
| 21 | Pack asks           | node → `template=Node` from pnpm and typescript; python → `template=Python` from uv; dart → `template=Dart` from pub, `template=Flutter` from flutter; swift → `template=Swift` from swift, swiftpm and swiftui; fnox → `fnox.local.toml`; doppler → `.doppler/`; pnpm → `git add attribute pnpm-lock.yaml linguist-generated`; swiftpm → `git add attribute Package.resolved linguist-generated`.                                                                                                                                | —                                                                                                 | U7             |
| 22 | Pack bumps          | Every pack U7 edits bumps one minor from its `pack.yaml` version at run time (skipping a 13 or 17 component), with every bundle pin, in U7's commit.                                                                                                                                                                                                                                                                                                                                                                              | no bumps                                                                                          | U7             |
| 23 | Review row          | One review row — runnable code lands: `check.ts`, `inventory.ts`, the installer, the `setup/precommit` shell task.                                                                                                                                                                                                                                                                                                                                                                                                                | the wave review alone                                                                             | U9             |
| 24 | Release             | stackgen stays `2.0.0`, vwf `20.0.0`, site `1.1.47`, all unreleased; the installer goes `1.0.1` → `1.0.2` through `mise run p:i:version`. `/release` for all four is an `ask` step.                                                                                                                                                                                                                                                                                                                                               | further bumps; release after each plan                                                            | U11            |
| 25 | Comments            | Any comment or sentence a unit adds is one line (B65).                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | —                                                                                                 | all            |

## New dependencies

none.

## Units

| Id  | Wave | Unit file                                      | Kind   | Owns                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Depends on     | Status  | Commit |
| --- | ---- | ---------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------- | ------- | ------ |
| U1  | 1    | [01-tool-config.md](01-tool-config.md)         | edit   | `plugins/stackgen/skills/tool-config/**`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | —              | pending |        |
| U2  | 1    | [02-init.md](02-init.md)                       | edit   | `plugins/vwf/skills/init/**`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | —              | pending |        |
| U3  | 1    | [03-setup-doctor.md](03-setup-doctor.md)       | edit   | `plugins/vwf/skills/setup/**`, `plugins/vwf/skills/doctor/**`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | —              | pending |        |
| U4  | 1    | [04-installer.md](04-installer.md)             | edit   | `installer/src/graphify.ts`, `installer/src/graphify.test.ts`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | —              | pending |        |
| U5  | 1    | [05-stackgen-docs.md](05-stackgen-docs.md)     | edit   | `plugins/stackgen/assets/{pack-format,taxonomy,output-tree}.md`, `plugins/stackgen/skills/{stackgen-stack-menu,stackgen-stack-template,stackgen-sync}/**`, `plugins/stackgen/stacks/readme.md`, `plugins/stackgen/agents/stackgen-skill-reviewer.md`                                                                                                                                                                                                                                                                                             | —              | pending |        |
| U6  | 1    | [06-checker-grammar.md](06-checker-grammar.md) | edit   | `scripts/src/check.ts`, `scripts/src/check.test.ts`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | —              | pending |        |
| U7  | 2    | [07-retire-pack.md](07-retire-pack.md)         | edit   | `plugins/stackgen/stacks/repo-hygiene/**` (removed), `plugins/stackgen/stacks/bundles/repo-hygiene.md` (removed), the `pack.yaml` of `package-manager/{pnpm,uv,pub,swiftpm}`, `language/{typescript,swift}`, `app-framework/{flutter,swiftui}`, `capability-provider/{fnox,doppler}`, every `plugins/stackgen/stacks/bundles/*.md` pin naming them, `plugins/stackgen/assets/kinds.md`, `scripts/src/inventory.ts`, `scripts/src/inventory.test.ts`, `scripts/src/check.ts`, `scripts/src/check.test.ts`, `plugins/stackgen/stacks/inventory.md` | U1, U2, U6     | pending |        |
| U8  | 2    | [08-this-repo.md](08-this-repo.md)             | edit   | `.editorconfig` (removed), `.config/mise/tasks/setup/precommit`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | U1             | pending |        |
| U9  | 3    | [09-review.md](09-review.md)                   | review | —                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | U1, U4, U7, U8 | pending |        |
| U10 | 4    | [10-docs.md](10-docs.md)                       | edit   | `.claude/**`, `CLAUDE.md`, `readme.md`, `installer/CLAUDE.md`, `site/src/content/docs/**`, `docs/memory/decisions/2026-09-27-tool-config-hygiene.md` (new)                                                                                                                                                                                                                                                                                                                                                                                       | U9             | pending |        |
| U11 | 5    | [11-gates-and-bump.md](11-gates-and-bump.md)   | edit   | `package.json` (the installer version, through `p:i:version`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | U10            | pending |        |

Status is one of `pending`, `running`, `green`, `failed`, `unresolved`,
`skipped`.

## Shared-file rule

| File                                                                  | Why it collides                                                                   | Owner                            |
| --------------------------------------------------------------------- | --------------------------------------------------------------------------------- | -------------------------------- |
| `scripts/src/check.ts`, `scripts/src/check.test.ts`                   | the grammar must land before the pack lines, the allowlist after the pack is gone | U6 (wave 1), then U7 (wave 2)    |
| `plugins/stackgen/stacks/repo-hygiene/**`                             | U1 and U2 read it as their source; U7 deletes it                                  | read-only in wave 1; U7 (wave 2) |
| `plugins/stackgen/assets/kinds.md`                                    | feeds `inventory.md`, which must land in the same commit                          | U7 only                          |
| the edited packs' `version:` lines, their bundle pins, `inventory.md` | a version, its pins and the inventory land in one commit                          | U7 only                          |
| `.config/mise/tasks/setup/precommit` (this repo)                      | a byte-copy of U1's asset                                                         | U8, after U1                     |
| `package.json` (installer version)                                    | a version file                                                                    | U11 only                         |
| every human-facing doc outside `plugins/`                             | n units, one doc                                                                  | U10 only                         |

## Waves

- **Wave 1 — U1, U2, U3, U4, U5, U6.** Disjoint trees. U1 and U2 copy from the
  repo-hygiene pack, which nothing deletes until wave 2. U6 only widens the
  grammar, so no commit in the wave trips a new finding. Any commit order.
- **Wave 2 — U7, U8.** Disjoint. U7 deletes the pack, adds the `git add` lines
  U6's grammar accepts, shrinks the pack root allowlist and regenerates the
  inventory in one commit. U8 copies U1's asset into this repo.
- **Wave 3 — U9**, review. **Wave 4 — U10**, docs. **Wave 5 — U11**, gates and
  the installer bump.

## Wave gate

- `mise run p:plugins:marketplace -- --check`
- `mise run p:plugins:inventory -- --check`
- `mise run p:plugins:check`
- `mise run p:plugins:shellcheck`
- `pnpm vitest run`
- `mise run code:precommit`
- `mise run p:site:check`

every line with `MISE_ENV=dev` exported, plus the wave review, plus every report
read for `UNRESOLVED:`.

## After landing

| Step                                    | Mode | Notes                                                                                                                                |
| --------------------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `mise run p:plugins:local`              | run  | stages the landed stackgen and vwf on this machine; picked up by a **restarted** session                                             |
| `MISE_ENV=dev mise run setup:precommit` | run  | in the main checkout: strips any raw graphify hook and the `merge.graphify.*` git config from this checkout; nothing tracked changes |
| `/release`                              | ask  | stackgen-v2.0.0, vwf-v20.0.0, installer-v1.0.2, site-v1.1.47 — the release skill's ritual; merges develop to main and tags           |

## Gates the orchestrator keeps

**The git tool in a scratch repo**, after wave 2, isolated (`HOME` and every
`MISE_*` dir under one `mktemp -d`): follow
`plugins/stackgen/skills/tool-config/SKILL.md` and its references by hand for
`/stackgen:tool-config all repo=scratch update_bot=renovate`, then run pnpm's
and fnox's `tool-config:` calls. Pass condition: `.gitignore` carries a `git`
block, a `graphify` block with `!graphify-out/GRAPH_REPORT.md` directly after
`graphify-out/*`, a pnpm block holding `Node.gitignore` fetched at a commit SHA
the lock records, and a fnox block with `fnox.local.toml`; `.gitattributes` has
no `merge=graphify` and is not empty; `renovate.json` lands; no `.editorconfig`
lands; every landed file passes the shipped dprint check; `remove pnpm` deletes
only pnpm's blocks; a line added outside every block survives. **Then** a second
scratch repo carrying the retired pack's sectioned `.gitignore` plus one hand
line: adoption converts the base sections to the `git` and `graphify` blocks,
loses no pattern, and leaves the hand line outside every block. Record in the
Run log; a failure goes back to U1.

**The strip**, after wave 2: in a scratch git repo with `merge=graphify` in
`.gitattributes` and `merge.graphify.driver` set in its local config, run the
asset `setup/precommit` isolated; both are gone and `.gitattributes` still
exists. A failure goes back to U1.

## Unit contract

Every unit prompt carries, in order: its ruling quoted from this file, its owned
paths plus "touch nothing outside this list", the facts section, the shared-file
rule, and the return block below. A unit never bumps a version, never runs a
generator, never edits a doc, never adds a dependency this file does not list,
never commits — except where its own file names a bump or a generator. A unit
deletes with plain `rm`, never `git rm` — it stages nothing. A unit never runs
`git checkout`, `git restore` or a formatter's `--fix` outside its Owns.

A unit returns exactly this block and nothing else — no file contents, no diff,
under 1500 characters:

    CHANGED: <path> — <one line>            (one per file)
    DECIDED: <what> — <why>                 (choices made inside scope, or none)
    DOCS FALSIFIED: <path> — <passage>      (reported, never edited; or none)
    GAP: <what the plan left unspecified and the assumption taken>   (or none)
    UNRESOLVED: <the ruling needed>         (or none)

A `GAP:` is a hole in the plan the unit could proceed past on a stated
assumption; it is recorded and the run continues. An `UNRESOLVED:` is a ruling
the unit could not proceed without; it blocks the unit and its dependents.

## Out of scope

- **T2's other gaps** — 1, 4, 5, 8, 10, 14, 16–19, 21–23, 25; the gap-closing
  plans that follow this chain.
- **B67** (`docs/plans/2026-09-26-init-commits-the-lock`) — requires this plan,
  runs next.
- **B68, B70, B65** — later plans.
- **Dependabot's configuration** — unchanged; only renovate's policy moves.
- **The language gate packs** (eslint, ruff, swiftlint, swift-format,
  analysis-options, tsconfig) — they stay packs.
- **Converting this repo's own `.gitignore` to blocks** — its next
  `/vwf:setup reshape`.

## Parked

none.

## Run log

| Wave | Unit | Model | Round | Outcome | Detail | Commit |
| ---- | ---- | ----- | ----- | ------- | ------ | ------ |

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the fresh session's worktree — cut from the integration branch — can see it.

Run in a fresh session, whichever kind the plan is:

/vwf:execute docs/plans/2026-09-26-tool-config-hygiene

or let the queue pick it, by priority:

/vwf:execute next
