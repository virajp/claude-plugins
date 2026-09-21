---
type: vwf-change-plan
title: init brownfield reads — root configs, hooks and tasks read first
requires: [ docs/plans/2026-09-20-init-mode-seam ]
backlog: [ B28 ]
---

# Plan — init brownfield reads (2026-09-20)

## Status

**RUNNING**

RUNNING since 2026-09-21T14:30Z in
/Users/virajpatel/Projects/github.com/virajp/claude-plugins/.worktrees/2026-09-20-init-brownfield-reads

## Consent

| Action                                            | Granted                                                                                                                                          |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Merge to the integration branch and push on green | yes                                                                                                                                              |
| After landing: `mise run p:plugins:local`         | run                                                                                                                                              |
| Release vwf publicly                              | minor — `19.39.0` → `19.40.0`, a hand edit of `plugins/vwf/.claude-plugin/plugin.json` then `mise run p:plugins:marketplace`; no release step    |
| Release stackgen publicly                         | patch — `1.23.0` → `1.23.1`, a hand edit of `plugins/stackgen/.claude-plugin/plugin.json` then `mise run p:plugins:marketplace`; no release step |
| Release site publicly                             | patch — `1.1.35` → `1.1.36` via `mise run p:site:version`; no release step                                                                       |
| Release installer publicly                        | none — untouched                                                                                                                                 |

**The mode recorded here is the consent.** A `run` step runs on a green landing
without a prompt; an `ask` step stops the run once before it, reports what it
would do, and waits. The mode is the interview's answer (item 17), and a release
step recorded `run` is authorised by the interview's release question (item 18)
— a release recorded `ask`, or with no step at all, is intent, not
authorisation. Where a step stages something this session already loaded, it is
picked up only by a **restarted** session.

## Goal

After this lands, the `shaped` and `source` pipelines of `/vwf:init` read what a
repo already has before landing over it: every root tool config a pack
supersedes is a plan row whose content is preserved through the replace-or-keep
offer; a foreign hook manager is a row, not a silent overwrite; the rename map
never proposes a task-file basename or a source directory; `.gitignore` is
merged section by section rather than replaced or left alone; inline `[tasks.*]`
are seen; README callers are rewritten; an unmapped commit type is asked; every
licence spelling counts; the post-landing steps every mode needs (placeholders,
licence and security files, the secrets provider, the aggregator) run in the
existing pipeline too; and the lockfile hashes are re-recorded by init after
every write it makes, so a kept or replaced file never reads as drift the next
morning.

Backlog item B28, piece D2, plan 3 of 5 — candidates 5–10, 12 and 13 of
`docs/memory/problems/2026-09-20-init-shape-audit.md`; closes B2, B4, B5, B6,
B7, B8, B9, B10, B11, B12, B14, B15, B16, B17, B19, B20, G4, G5, L4 (init's
half), L6, L7, L12, and B18's four stale passages. Requires
`2026-09-20-init-mode-seam` (the `source` mode this plan's passes serve, and the
chain).

Not a reversal. The "adopt, not flatten" doctrine
(`2026-09-12-init-brownfield-sidecar-and-diverged-files.md`) is what every rule
here extends.

## Facts the survey established

Paths: `E` = `plugins/vwf/skills/init/references/existing-repo.md`, `F` =
`…/fragments-and-sections.md`, `N` = `…/new-repo.md`, `R` =
`…/readme-and-license.md`, `S` = `plugins/vwf/skills/init/SKILL.md`, `MAT` =
`plugins/stackgen/skills/stackgen-stack-template/references/materializer.md`,
`OT` = `plugins/stackgen/assets/output-tree.md`, `HY` =
`plugins/stackgen/stacks/repo-hygiene/repo-hygiene`. Verified at `eb08c2b3`,
before plan 2 lands — plan 2 re-words `E`'s lead-in and pass 6's input; the
pointers below name today's passages and the units locate them by heading.

- **Pass 1** (`E:38-127`): reads every root entry `:41-46`; the rename map is
  the basename of every landed or landable pack `config/` path `:48-55` (the
  task library included → B2; no collision rule); off-allowlist entries are
  reported, not moved `:57-59`, filed under Deferred `:919-923` (B8); four
  exemptions `:61-88` (`.gitmodules`, the editor dir `:68-75`, `.claude/`,
  member paths); `.git/` by implication only `:64` (B19); nothing reads
  `.gitignore` for exemption. The allowlist: `OT:158-166`,
  `HY/conventions.md:28-47`.
- **Root tool configs** (candidate 5): the packs declare only the eight
  `.config/` files (the mise tomls, dprint, taplo, linter, gitleaks, grype,
  pre-commit-config, git-conventional-commits) and a root `dprint.json`; so
  `.pre-commit-config.yaml`, `.mise.toml`, `.gitleaks.toml`, `.grype.yaml`,
  `.dprint.json`, `.renovaterc` are no basename match and off the allowlist →
  reported (`E:57-59`); `.github/renovate.json` and `.github/dependabot.yml` sit
  inside the allowlisted `.github/` (`OT:165-166`), read as one entry → never
  seen. The model to generalise is move-and-shim for a real root `dprint.json`
  (`E:91-127`, content test `:123-127`). Renovate's root-first discovery
  `HY/conventions.md:36-38`; `code:sec` passes `--config` for the `.config/`
  copies (`…/tasks/code/sec:34-35, 41, 58, 70`).
- **Hook manager** (candidate 8): zero hits for `hooksPath`, `husky`, `lefthook`
  under `plugins/vwf/skills/init/`; only `E:854` ("may already have its hooks
  wired"). The gate-first commit `E:850-876` assumes the installed hooks read
  the file it commits (`:855-859`, `:896-899`). `setup:precommit` refuses a
  foreign manager without `--force` once plan 1 lands. The `code:format --fix`
  hook has `pass_filenames: true` (`…/pre-commit-config.yaml:66-72`) — staged
  files only; L8's whole-tree reformat is the merge safety net's, not a
  first-run effect.
- **Passes 2, 3, 4, 9, 10**: pass 2 `E:129-134` moves README with no caller
  rewrite (B16; contrast pass 3's callers `:147-152`); pass 3 `E:136-170`,
  contention rule `:153-170`; passes 3/4/10 read task **files** only (`:140`,
  `:174`, `:597-600`) → inline `[tasks.*]` invisible (B15); pass 9 fills
  `E:453-594`, repo-name rule `:495-512`; a kept file still receives fills
  `:825-838` with no rule for a kept file lacking the keys (B14).
- **Pass 6** (`E:271-414`): test 1 hash vs lockfile `:279-293` (claims the
  marked positions are already filled `:280-283`); an unrecorded file is
  compared against raw pack bytes `:290-293`, which carry `<REPO_URL>`
  (`HY/config/SECURITY.md:7`, `ISSUE_TEMPLATE/config.yml:4, 8`) and
  `commitScopes: []` (`…/git-conventional-commits.yaml:40`) → B11; test 2 splice
  `:300-316`; replace/keep `:346-357` — "records the file's hash once those
  fills have run" (`:351-353`) names no writer (B9). Creates are the
  materializer's (`E:808-809`); `MAT:167-180` refuses a path not in the
  lockfile; the lock hash is written only at landing (`MAT:113-118`; schema
  `OT:352-371`, `hash:` at `:365, 370`). Init's own appends and merges run last
  (`E:846-848`, after `:808-809`; `F:55-63` ignore append, `:101-119` hook
  merge, `:278-290` editor block) and nothing re-records a hash (L6, L7).
- **`.gitignore`** (B7): an ordinary pass-6 offer (`E:279-293`, `:346-357`,
  default keep `:359-363`); pass 7 append `E:420-422`; the algorithm `F:30-63` —
  banner skip `:49-53`, filter `:55-58` "against the patterns already present",
  verbatim, no normalisation (`HY/conventions.md:60-62`); the base sections
  never reach a kept file (`F:33-48`, `HY/config/.gitignore:21-61`,
  `conventions.md:63-65`).
- **Pass 8** `E:436-451`: ten names mapped, no rule for another type (B17).
  Licence: `S:433-434` "already carries a licence file keeps it"; only `LICENSE`
  is on the allowlist (`OT:163`, `HY/conventions.md:31`) → B20.
- **B5**: `E` never names `N` §3 (`:77-86`), §4 (`:88-112`), §8 (`:386-390`), §9
  (`:392-430`), §10 (`:432-446`); the pipeline jumps from the gate-first commit
  (`:850-876`) to `N` §11 at `:878-889`, yet the questions are asked in every
  mode (`S:268-270`; q4 `:355-373`, 6a `:426-434`, 6b `:436-445`; the slug fetch
  `:505-510`). B10: the Deferred rule for a keep or an editor answer with no
  config file `E:399-406`, `:825-838`, `F:259-267`.
- **Consent shape**: the plan `E:694-767`, one consent question `:769-790`,
  `S:87-88`; the aggregator offer only in `N:432-446`.
- **B18's four stale passages**: `HY/conventions.md:216-220` and `R:114-119` say
  renovate lands under `.config/` (it lands at the root,
  `HY/conventions.md:23`);
  `…/mise/skills/mise/references/task-library.md:631-634` says an unmapped call
  is "flagged" (it is moved to the sidecar, `E:214-219`);
  `…/pre-commit/config/.config/pre-commit-config.yaml:201-204` says fragments
  are "merged below this line" (they are appended inside the `repos:` list,
  `F:107-111`).
- **Docs describing today** (all U5's):
  `site/src/content/docs/plugins/vwf.md:891` (`### /vwf:init`), `:1098`
  (existing repo), `:1143` (helper library), `:1155` (function moves), `:1174`
  (diverged pack file), `:1206` (own tasks kept), `:1221` (readme moved),
  `:1229` (git pass), `:1312` (gate-first);
  `how-to/brownfield/onboard-existing-codebase.md:86-100` (`:91-93` stale even
  before plan 2 — says no `.config/` → existing survey);
  `how-to/brownfield/migrate-old-vwf-repo.md:68-74`; `CLAUDE.md:262-270`;
  `.claude/skills/vwf-plugin/SKILL.md:86, 152-162`;
  `references/skills-and-agents.md:27-28`.
- **Versions after plan 2**: vwf `19.39.0`, stackgen `1.23.0`, site `1.1.35`;
  hygiene pack `1.1.2`, pre-commit `1.1.2`, mise `1.4.0`. Bumps, pins and
  inventory land in one commit (U6). Commit types
  `ops docs merge feat fix refactor`, no scopes. Priority: `10 + 20` over the
  required plan's row → 30.

## Assumed decisions — confirm or override at review

| #  | Decision                  | Ruling                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Rejected                                     | Unit       |
| -- | ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- | ---------- |
| 1  | Root tool configs         | A **tool-config table** — one row per tool a pack ships: the tool, its known root spellings (`.pre-commit-config.yaml`; `.mise.toml`, root `mise.toml`; `.gitleaks.toml`; `.grype.yaml`; `.dprint.json`, root `dprint.json`; `.github/renovate.json`, `.renovaterc`, `renovate.json`; `.github/dependabot.yml`), the `.config/` path the pack lands, and the merge shape. Pass 1 reads inside `.github/` for the table's paths. Every root hit is a plan row with one outcome: **move** (default) — the repo's file becomes the `.config/` copy and is then offered through pass 6 against the pack's, the dprint move-and-shim model generalised; **keep both** — the file stays and is reported as unread by the gate; **delete** — only on the user's explicit pick. A twin the pack itself lands at the root (`renovate.json`) yields: the repo's `.github/renovate.json` or `.renovaterc` wins and the pack's is not landed, reported as such | report only; move-only                       | U1, U2     |
| 2  | Rename map                | Matches full declared pack paths plus the table's root spellings; never a task-file basename (the task library is excluded from the map); skips entries `.gitignore` ignores; a directory holding a manifest or source (plan 2's sub-project rule) is reported **once** as a project, never under Deferred; `.git/` is exempt by name                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | keep basename matching                       | U1         |
| 3  | `.gitignore`              | A **section merge** replaces the binary offer: the repo's file is kept whole; each pack banner section whose patterns are not already present is appended; patterns compared **normalised** — leading `/` and trailing `/` stripped, a `**/` prefix ignored, blank and comment lines skipped. A pattern present under a different spelling is never doubled                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | binary replace-or-keep                       | U2         |
| 4  | Hook manager              | Pass 1 reads `git config --local core.hooksPath`, `.husky/`, `lefthook.yml`, `.lefthook.yml`; a hit is one plan row "switch hook manager to pre-commit", **default keep**; on keep the gate-first commit runs under the installed hooks and `setup:precommit` is not invoked; on switch the run invokes `setup:precommit --force` (plan 1's flag) as its last shaping step and says so                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | silent switch                                | U1         |
| 5  | Post-landing steps        | After its landing and before the git pass, the existing pipeline runs `N` §3 (placeholders), §4 (licence and security files), §8 (secrets provider), §9 (fills it does not already own) and §10 (the aggregator offer) exactly as `N` states them — cited by section, not restated; every mode shares those five steps                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | skip the questions in `shaped` mode          | U1, U3     |
| 6  | Hashes                    | Every writer is named: the materializer at landing; pass 6's **replace and keep both re-record** the file's hash after the fills; and init, as its **last step before the git pass**, re-hashes every file it filled, appended to or merged (the ignore sections, the hook fragments, the editor block, the marked positions) into the lockfile. A file a pack task rewrote under `--update` / `--upgrade` reads as drift until the next reshape, where the offer's keep records it — accepted                                                                                                                                                                                                                                                                                                                                                                                                                                                     | region-specific splice rules; drop the flags | U1, U2, U4 |
| 7  | Inline tasks and the rest | Passes 3, 4 and 10 read inline `[tasks.*]` in every mise config as tasks; a moved root `mise.toml` is merged into the pack's split (its `[env]` and `[tools]` into the matching files, its tasks per pass 3) rather than kept whole; pass 2 rewrites README callers the way pass 3 rewrites task callers; pass 8 asks the user for a type outside both sets instead of guessing; `LICENSE`, `LICENSE.md`, `LICENCE`, `COPYING` all count as "already carries a licence file"                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | —                                            | U1, U2     |
| 8  | Config home               | When no `.config/vwf.yaml` exists, init writes a **stub** carrying `config_format` and the `enforcement` block alone so `kept_files` and `editor_keys` have a home; setup's migration and fill passes complete it later; the Deferred rule for those two keys goes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | defer and re-ask every reshape               | U3         |
| 9  | Stale passages            | B18's four corrected in place; `OT`'s lockfile schema and `MAT` name init as a hash writer after fills                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | leave to docs-sync                           | U4         |
| 10 | Not a finding             | L8 — the format hook is staged-files only; no consent row per first-run effect is added; the graphify post-commit hook `setup:ai` installs is a pack matter for plan 5                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | —                                            | —          |
| 11 | Review row                | None — prose, one payload comment, one asset note                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | —                                            | —          |
| 12 | Pack bumps                | hygiene `1.1.2` → `1.1.3`, pre-commit `1.1.2` → `1.1.3`, mise `1.4.0` → `1.4.1` — prose and a comment; pins and inventory in U6, one commit                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | per-unit bumps                               | U6         |

## New dependencies

none

## Units

| Id | Wave | Unit file                                              | Kind | Owns                                                                                                                                                                                                                                                                                                                                                                           | Depends on     | Status  | Commit   |
| -- | ---- | ------------------------------------------------------ | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------- | ------- | -------- |
| U1 | 1    | [01-existing-repo.md](01-existing-repo.md)             | edit | `plugins/vwf/skills/init/references/existing-repo.md`                                                                                                                                                                                                                                                                                                                          | —              | green   | bbc23b09 |
| U2 | 1    | [02-fragments-and-table.md](02-fragments-and-table.md) | edit | `plugins/vwf/skills/init/references/fragments-and-sections.md`, `plugins/vwf/skills/init/references/readme-and-license.md`, `plugins/vwf/skills/init/references/tool-configs.md` (new)                                                                                                                                                                                         | —              | green   | 31168f0a |
| U3 | 1    | [03-skill-and-new-repo.md](03-skill-and-new-repo.md)   | edit | `plugins/vwf/skills/init/SKILL.md`, `plugins/vwf/skills/init/references/new-repo.md`                                                                                                                                                                                                                                                                                           | —              | green   | 0f99429d |
| U4 | 1    | [04-packs-and-assets.md](04-packs-and-assets.md)       | edit | `plugins/stackgen/stacks/repo-hygiene/repo-hygiene/conventions.md`, `plugins/stackgen/stacks/toolchain-manager/mise/skills/mise/references/task-library.md`, `plugins/stackgen/stacks/toolchain-gate/pre-commit/config/.config/pre-commit-config.yaml`, `plugins/stackgen/assets/output-tree.md`, `plugins/stackgen/skills/stackgen-stack-template/references/materializer.md` | —              | green   | 473c7694 |
| U5 | 2    | [05-docs.md](05-docs.md)                               | edit | `readme.md`, `CLAUDE.md`, `.claude/docs/**`, `.claude/skills/vwf-plugin/**`, `.claude/skills/stackgen-plugin/**`, `site/src/content/docs/**`, `docs/memory/decisions/2026-09-20-init-brownfield-reads.md`                                                                                                                                                                      | U1, U2, U3, U4 | green   | e4b7cc03 |
| U6 | 3    | [06-gates-and-bump.md](06-gates-and-bump.md)           | edit | the three `pack.yaml` (hygiene, pre-commit, mise), `plugins/stackgen/stacks/bundles/repo-hygiene.md`, `bundles/repo-gates.md`, `bundles/mise.md`, `plugins/stackgen/stacks/inventory.md`, the two `plugin.json`, `site/package.json`, `.claude-plugin/marketplace.json`                                                                                                        | U5             | pending |          |

Status is one of `pending`, `running`, `green`, `failed`, `unresolved`,
`skipped`. Every unit is `edit`.

## Shared-file rule

| File                                                                                         | Why it collides                                   | Owner   |
| -------------------------------------------------------------------------------------------- | ------------------------------------------------- | ------- |
| the three `pack.yaml`, the three bundle files, `inventory.md`                                | the generator refuses a pin without its pack      | U6 only |
| the two `plugin.json`, `site/package.json`, `.claude-plugin/marketplace.json`                | version and generated files                       | U6 only |
| every human-facing doc — `readme.md`, `CLAUDE.md`, `.claude/**`, `site/**`, `docs/memory/**` | n units editing one doc                           | U5 only |
| `existing-repo.md`                                                                           | U2/U3 would name pass numbers; U1 owns the passes | U1 only |
| `tool-configs.md` (new)                                                                      | U1 would inline the table; U2 owns the file       | U2 only |
| `init/SKILL.md`, `new-repo.md`                                                               | U1 would restate §3–10; U3 owns them              | U3 only |

## Waves

- **Wave 1** — U1, U2, U3, U4: four disjoint file sets; U1 cites U2's table and
  U3's sections by name.
- **Wave 2** — U5.
- **Wave 3** — U6.

## Wave gate

    mise run p:plugins:marketplace -- --check
    mise run p:plugins:inventory -- --check
    mise run p:plugins:check
    mise run code:precommit
    mise run p:site:check

plus the wave review, plus every report read for `UNRESOLVED:`. Every line here
must be green before wave 1.

## After landing

| Step                       | Mode | Notes                                                                                                                                                                   |
| -------------------------- | ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mise run p:plugins:local` | run  | stages vwf at `19.40.0+N` and stackgen at `1.23.1+N` into the dev marketplace and updates this machine's install; publishes nothing; a **restarted** session loads them |

## Gates the orchestrator keeps

none beyond the wave gate. The reads are proven by the user's next
`/vwf:setup reshape` on a brownfield repo carrying a root tool config.

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

- The git pass, branch names, a detached member (B3, B13, G6, L14) — plan 4.
- Rendering the hygiene root set from answers, the editor baseline split, the
  gate values, the graphify post-commit hook — plan 5.
- A consent row per first-run effect — decision 10.
- Region-specific hash rules for pack-task rewrites — decision 6.
- A public release — the bumps land; the tags wait for the next `/release`.

## Parked

- Plan 5 owes the `setup:ai` graphify post-commit hook (rest of L16) and whether
  `renovate.json` lands at all when the survey found a Dependabot policy
  (candidate 14).
- B28 closes when plan 5 lands; `/vwf:execute`'s `done` at this landing may need
  the item moved back to `Backlog` by hand until then.

## Run log

| Wave | Unit      | Model | Round | Outcome     | Detail                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Commit   |
| ---- | --------- | ----- | ----- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| 0    | preflight | —     | —     | green       | doctor: mise, graphify CLI 0.9.65, graph in main checkout; no vwf.yaml in this repo (plugin repo, not shaped) — noted; no code unit: LSP and conventions skipped; format check skipped (no covers:); all 5 wave-gate lines green on develop @05fcc437                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | —        |
| 1    | U4        | opus  | 1     | green       | 5 files edited per unit file; DECIDED: names /vwf:init by name in task-library.md and materializer.md; GAP: mise skill never names _scripts/local — edit cites the_scripts/ sibling rule and introduces the name; p:plugins:check green                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | 473c7694 |
| 1    | U2        | opus  | 1     | green       | tool-configs.md new (7-row table, 3 merge shapes); section merge in fragments-and-sections.md; licence spellings + renovate root landing in readme-and-license.md. DECIDED: dependabot row merge shape yield, pack path none (plan 5 owns renovate-beside-dependabot); base ignore sections merged by the same section algorithm; re-hash cited as the existing-repo pipeline's last step before the git pass. GAP: decision 1 gives dependabot no shape/pack path — assumed yield/none; mise move-and-split target files named as .config/mise.toml + mise.<env>.toml, split deferred to the pack skill. p:plugins:check green                                                                                                    | 31168f0a |
| 1    | U3        | opus  | 1     | green       | SKILL.md: stub config, licence spellings, five shared steps once for every mode, one sentence on init re-hashing before the git pass; new-repo.md: §2 stub rule, every-mode lead-ins on §3/§4/§8/§9/§10, §7 note that shaped repos take fills from pass 9, §8 heading widened to the security file. DECIDED: §8 heading rename (no other citer). GAP: decision 5 glosses N §9 as fills but §9 is Bootstrap — took the sections by number, lead-in on §9, fills note on §7; plan cites SKILL.md :70-78 as the plan summary but that is the kept_files passage — list went into the Whichever-pipeline paragraph. p:plugins:check green                                                                                              | 0f99429d |
| 1    | U1        | opus  | 1     | green       | existing-repo.md: pass 1 rename map + Root tool configs + hook manager steps; pass 2 README callers; passes 3/4/10 inline tasks and split-merge; pass 6 moved configs, post-fill compare and hash on replace/keep; pass 8 asks unmapped types; apply runs N §3/§4/§8/§9/§10, hook switch then re-hash before the gate-first commit. DECIDED: kept-file record rewritten to decision 8's stub; pass-8 keep answer re-asked each run; hook switch before re-hash. DOCS FALSIFIED: site vwf.md /vwf:init passages (U5's). GAP: decision 5's section labels do not match N's numbering — cited by today's numbers; SKILL.md report shape has no Projects line; moved root manager config's non-owned tables assumed kept as repo-owned | bbc23b09 |
| 1    | R1        | opus  | 1     | findings(6) | tool-configs.md:25 [U2] leftover of move-and-split contradicts U1 (kept repo-owned); tool-configs.md:42/61 [U2] dependabot row labelled yield yet pack renovate.json still lands; SKILL.md:656 [U3] report block lacks Projects, root-tool-config and hook-manager lines U1 prints; existing-repo.md:1135 [U1] fold orphan; new-repo.md:106 [U3] fold orphan; existing-repo.md:179 [U1] shape names split/copy vs U2's move-and-split/move-and-offer. CONTRACT clean; RULINGS: U2 departed from decision 1 on the dependabot row                                                                                                                                                                                                   | —        |
| 1    | U2        | opus  | 2     | green       | R1 loop-back: move-and-split aligned to U1 (leftover kept repo-owned, pass 6 never reaches a split row); dependabot row relabelled keep both, pack renovate.json still lands, plan 5 owns whether it should. p:plugins:check green                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | 31168f0a |
| 1    | U1        | opus  | 2     | green       | R1 loop-back: gate-first paragraph refolded; shape names now U2's move-and-offer / move-and-split                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | bbc23b09 |
| 1    | U3        | opus  | 2     | green       | R1 loop-back: SKILL.md report gains Root tool configs, Hook manager, Projects lines mirroring existing-repo.md; count ten → thirteen; new-repo.md §2 refolded, §12 count updated. DOCS FALSIFIED: existing-repo.md:1193 'ten file sections' (U1's) — handed to U1                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | 0f99429d |
| 1    | U1        | opus  | 3     | green       | U3's DOCS FALSIFIED: report count ten → thirteen                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | bbc23b09 |
| 1    | R1        | opus  | 2     | findings(1) | contested at the 2-round cap: existing-repo.md:182 [U1] keep-both bullet assumes a .config/ twin and an unread-by-the-gate report line; U2's dependabot keep-both row has neither — reviewer calls it acceptable to leave. CONTRACT clean; RULINGS clean                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | —        |
| 1    | gate      | —     | —     | green       | marketplace, inventory, check, precommit (two fixup passes on index.md then green), site all green; no UNRESOLVED                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | —        |
| 2    | U5        | opus  | 1     | green       | 8 docs edited: site vwf.md /vwf:init (13 sections, root tool configs, hook manager, gitignore merge, stub, 5 steps, re-hash), onboard-existing-codebase.md, stackgen.md, CLAUDE.md, vwf-plugin SKILL + skills-and-agents, stackgen-plugin SKILL, decision record new. DECIDED: migrate-old-vwf-repo.md, readme.md, .claude/docs untouched — no false hit. GAP: docs-sync surveyor's report reached the orchestrator, not U5 — U5 grepped the inventory itself; the surveyor's 4 findings (vwf.md :948/:1253 stub, :1173/:1380 sections, :1131 licence) are all in U5's edits. p:site:check and code:precommit green                                                                                                                | e4b7cc03 |
| 2    | R2        | opus  | 1     | findings(2) | decision record :66 says four merge shapes (tool-configs.md defines three, keep both is pass 1's outcome); CLAUDE.md:314 five steps read as six items. CONTRACT clean; RULINGS clean                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | —        |
| 2    | U5        | opus  | 2     | green       | R2 loop-back: decision record three shapes + keep-both outcome; CLAUDE.md and onboard-existing-codebase.md five steps read as five                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | e4b7cc03 |
| 2    | R2        | opus  | 2     | pass        | both round-1 findings resolved; CONTRACT clean; RULINGS clean                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | —        |
| 2    | gate      | —     | —     | green       | all five lines green; no UNRESOLVED                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | —        |

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the fresh session's worktree — cut from the integration branch — can see it.

Run in a fresh session:

/vwf:execute docs/plans/2026-09-20-init-brownfield-reads

or let the queue pick it, by priority:

/vwf:execute next
