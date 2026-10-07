---
type: vwf-change-plan
title: stackgen's doctrine makes fnox the development-only secrets provider
requires: []
backlog: []
backlog_pieces: []
---

# Plan — fnox development-only doctrine (2026-10-07)

## Status

**COMPLETE**

COMPLETE 2026-10-07 — f804d7a3 eb208b7d dc418bf5 0a6e1d4e 37ca6ab1 fe54aca4

## Consent

| Action                                            | Granted |
| ------------------------------------------------- | ------- |
| Merge to the integration branch and push on green | yes     |
| After landing: `mise run p:plugins:local`         | run     |
| Release stackgen publicly                         | none    |
| Release vwf publicly                              | none    |
| Release site publicly                             | none    |
| End an `all` run after landing                    | no      |

**The mode recorded here is the consent.** A `run` step runs on a green landing
without a prompt. The staged plugins are picked up only by a **restarted**
session.

**Release none** — the user, 2026-10-07: no release step; they test the local
stage first, then ask for `/release`. No plugin or site version is bumped
(stackgen `3.0.0`, vwf `21.0.0` and the site `1.1.50` already sit above their
tags); only the changed packs' own `version:` lines move (D7).

**End an `all` run: no** — the user, 2026-10-07: the plan changes fnox and
secrets doctrine prose; no skill `/vwf:execute` uses changes.

## Goal

After this lands, stackgen's doctrine makes fnox the **development-only**
secrets provider: development secrets live in the OS keychain by default, any
single secret may instead reference a fnox-supported cloud store, and no repo
ever carries an encrypted secret. The secrets contract states the split every
product follows — the development manager on a developer's machine, **CI's
secrets from the forge** (GitHub or GitLab), **staging and production secrets
from the cloud provider**, where neither mise nor fnox runs.

**The framing.** The new `bootstrap` project
(`~/Projects/github.com/virajp/bootstrap`) replaces most of
`stackgen:tool-config` and makes `fnox` one of its core tools: it renders
`.config/fnox.toml` and `.config/mise/tasks/setup/secrets`. So this plan changes
**doctrine only** (D2): the fnox **config shape** — profiles, `FNOX_PROFILE`,
the `setup:secrets` prompt — is bootstrap's and is parked there. The pack's
shipped `config/fnox.toml` and `config/.config/mise/tasks/setup/secrets` stay as
they are. This plan replaces the archived
`docs/plans/archived/2026-10-05-fnox-dev-only`, which was retired unrun.

**Reversals, both confirmed by the user and recorded by U5 in one decisions
doc:**

1. `docs/memory/decisions/2026-09-06-secrets-store-is-runtime-not-development.md`
   ruled a repo pins "`capability-provider/fnox` for the developer machine and
   CI". CI now takes its secrets from the forge. The runtime half of that
   decision (Secrets Store holds staging and production) stands.
2. The secrets contract's **encrypt-into-git allowance** ("The mode is offered,
   under four conditions") retires, and with it fnox's age/KMS mode, its
   ciphertext guard hook and the hand-applied blocks it asked for.

## Facts the survey established

Surveyed 2026-10-07 on `develop`. `SG` = `plugins/stackgen`, `FX` =
`SG/stacks/capability-provider/fnox`. Every unit re-reads its owned files and
locates passages by content; a line number is a hint only.

- **The secrets contract** (`SG/assets/contracts/secrets.md`): the environment
  clause "Resolve a distinct set per environment" at about `:33-38`; "A tool
  that serves only `development` is a legitimate pick with a named gap" at about
  `:58-60`; the encrypt-into-git allowance heading at about `:93`, "The mode is
  offered, under four conditions" at `:101`, the conditions at `:103-121`.
- **`SG/stacks/readme.md`**: doppler "since deleted in favour of `fnox`" `:24`;
  the secrets-manager category `:179-182`; "carries an encrypt-into-git
  allowance under four conditions, and `fnox` engages it" `:185-189`; fnox "the
  developer-machine and CI provider" `:345-350`.
- **`SG/skills/tool-config/references/gitleaks.md`** no longer mentions fnox —
  nothing to change there.
- **The fnox pack** (`FX`, `version: 1.2.1`):
  - `pack.yaml` summary `:2-4` — "encrypted into git or referenced in your own
    cloud, and onboarding is a public key plus a re-encrypt".
  - `conventions.md` — age/KMS `:4`, age identity and `FNOX_AGE_KEY` `:28`,
    recipients per environment `:32-33`, `fnox reencrypt` `:36`, the "What this
    pack writes" table with the hook `:40-46`, "The shipped default is the
    keychain, not ciphertext" `:68-85`, committing-ciphertext pointer
    `:109-110`.
  - `config/fnox.toml` — keychain provider, `if_missing = "warn"`, no age.
    **Unchanged by this plan (D2).**
  - `config/.config/mise/tasks/setup/secrets` — keychain-oriented, no age.
    **Unchanged by this plan (D2).**
  - `templates/.config/mise/conf.d/fnox/mise.toml` — the `fnox` pin only.
    **Unchanged (D2).**
  - `hooks/fnox-ciphertext-guard.sh` — exists; "the encrypt-into-git gate".
    Deleted (D4).
  - `skills/fnox/SKILL.md` — "encrypted into git" `:6`, permanent ciphertext
    `:8`, CI credential `:32`, `permanent-ciphertext.md` link `:33`, CI `:36`.
  - `skills/fnox/references/` — `access-shape.md` (production profile, age
    identity, CI credentials, `fnox (age, committed)`),
    `contract-satisfaction.md` (staging/production profiles, CI via
    `FNOX_AGE_KEY`, the hand-applied gitleaks/gitignore/pre-commit/mempalace
    blocks and guard wiring at about `:137-201`), `cost-shape.md`,
    `local-stack.md`, `pick-and-trade.md`, `permanent-ciphertext.md` (whole
    file; deleted, D4).
- **Bundles.** `SG/stacks/bundles/fnox.md` pins `capability-provider/fnox@1.2.1`
  `:6`; age/KMS `:12`, re-encrypt and CI decryption key `:23-24`, permanent
  ciphertext `:28`, the four conditions `:35`, the guard `:52-53`.
  `SG/stacks/bundles/cloudflare-secrets-store.md` pins `cloudflare@0.1.0` and
  `secrets-store@0.1.0`; "the repo carries no ciphertext" `:15`; fnox serves the
  "developer's machine and CI" `:56-60`; "long-lived decryption" `:65`.
- **`SG/assets/output-tree.md` `:277-282`** — "Precedent": the fnox and pnpm
  packs already ship hook scripts. After D4 only pnpm does.
- **Cloudflare passages giving CI to fnox, or citing encryption:**
  `SG/stacks/cloud-provider/cloudflare/conventions.md:48-50`;
  `SG/stacks/cloud-service/secrets-store/pack.yaml` comment `:12-16`;
  `.../secrets-store/conventions.md:4-6,20,71-72,85,136-139`;
  `.../skills/cloudflare-secrets-store/references/pick-and-trade.md:11-14,35`,
  `local-dev.md:48-52`, `service-doctrine.md:136,183-191` (the "encrypt-into-git
  allowance — not applicable" section);
  `SG/stacks/cloud-service/images/skills/cloudflare-images/references/identity-shape.md:60-61`;
  `SG/stacks/cloud-service/email-service/skills/cloudflare-email/references/identity-shape.md:102-106`.
  None gives staging or production to fnox.
- **vwf:** `plugins/vwf/assets/templates/environment.md:14,96` ("secrets manager
  for each environment (dev / …");
  `assets/examples/blueprint/environment.md:14,76,83`;
  `assets/templates/conventions.md:45`; `assets/memory.md:162` (`- .doppler/`);
  `skills/readme/SKILL.md:75` (doppler example). `skills/init/**` has no fnox or
  doppler mention.
- **Docs:** `site/src/content/docs/plugins/stackgen.md` — doppler pack
  `:240-241`, encrypt-into-git and "`fnox-ciphertext-guard.sh` is the first hook
  script any pack ships" `:618-621`, fnox `:742,967,1225,1251`, `setup:doppler`
  row `:1316`;
  `site/src/content/docs/how-to/operate/choosing-your-stack.md:119-122`
  ("developer-machine and CI"); `site/src/content/docs/plugins/vwf.md:972`
  (`fnox.local.toml`); `.claude/skills/stackgen-plugin/SKILL.md:244,247,352,411`
  ("the fnox pack's git pre-commit gate"). `readme.md` and `CLAUDE.md`: no hits.
- **bootstrap's fnox** (from its blueprint and its running plan
  `2026-10-06-2332-tool-setup-config`): renders `.config/fnox.toml` with empty
  `[providers]` and `[secrets]` and a comment offering "a password manager, a
  cloud secret store, or age encryption"; a `setup:secrets` task that runs
  `fnox --config .config/fnox.toml check`. No profiles, no `FNOX_PROFILE`, no
  guard. Its gitleaks allowlist names no `fnox.toml`. Cloud setup is a bootstrap
  non-goal, so the Cloudflare packs stay stackgen's.
- **Pack versions:** fnox `1.2.1`, secrets-store `0.1.0`, cloudflare `0.1.0`,
  images `0.1.0`, email-service `0.1.0`.
- **Plugin versions:** stackgen `3.0.0` (tag `stackgen-v2.0.0`), vwf `21.0.0`
  (tag `vwf-v20.0.1`), site `1.1.50` (tag `site-v1.1.49`).
- **Gates.** `mise tasks`:
  `p:plugins:{check,inventory,marketplace,npm-normalize-test,local,release}`,
  `p:site:{check,build,version,release}`, `code:{precommit,format,lint,sec}`.
  `plugins/**/*.md` is not dprint-formatted — match the fold width by hand. The
  `plugins-inventory` pre-commit hook runs `p:plugins:inventory --check`.
- **Commit types** (`.config/git-conventional-commits.yaml`): `ops`, `docs`,
  `merge`, `feat`, `fix`, `refactor`; no scopes.
- **Backlog.** No open item covers this request (read 2026-10-07).

## Assumed decisions — confirm or override at review

| #  | Decision        | Ruling                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Rejected                                                                                                     | Unit           |
| -- | --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | -------------- |
| D1 | Scope of fnox   | fnox manages secrets for the development environment only. The OS keychain is the default provider; any single secret may instead reference a fnox-supported cloud store (mixed per secret). No encrypted secret ever enters a repo: no age, no KMS, no committed ciphertext. Staging and production never run mise or fnox — their secrets come from the cloud provider. CI's secrets come from the forge (GitHub or GitLab).                                 | Keychain only; fnox serving CI or deployed environments                                                      | U1, U2, U3, U4 |
| D2 | Where config is | This plan changes doctrine only. The fnox config shape — development and `ci` profiles, `FNOX_PROFILE`, the `setup:secrets` prompt — belongs to bootstrap, which renders `.config/fnox.toml` and `setup:secrets` as a core tool; it is parked there. The pack's `config/fnox.toml`, `config/.config/mise/tasks/setup/secrets` and `templates/` stay unchanged. Doctrine prose describes what the pack ships today and names the profile shape as bootstrap's.  | Full rework of the pack's config here; retiring the fnox pack now                                            | U2             |
| D3 | Contract-wide   | stackgen's secrets contract loses the encrypt-into-git allowance and states the environment split (D1); every provider pack is held to it.                                                                                                                                                                                                                                                                                                                     | Change fnox only; the contract keeps the allowance                                                           | U1, U3         |
| D4 | No guard        | Delete `hooks/fnox-ciphertext-guard.sh` and `skills/fnox/references/permanent-ciphertext.md`, and the four-condition doctrine (gitleaks path allowlist, mempalace exclude of `fnox.toml`, `.gitignore` age lines). **No cleanup mechanism:** the pack's docs say a previously materialized `.claude/hooks/fnox-ciphertext-guard.sh` is inert while no age/KMS provider exists and may be deleted by hand.                                                      | A `stackgen-sync` rule removing unchanged no-longer-shipped files; a one-off fnox detector; a provider guard | U2             |
| D5 | vwf             | vwf's `environment.md` template and example, and `conventions.md` template, stop saying "secrets manager for each environment (dev/staging/prod)": development values live in the development secrets manager, CI's in the forge, staging and production in the cloud provider's store. A unit that finds a live doppler mention inside its Owns removes it; doppler strays in `tool-config` files are left (bootstrap replaces them).                         | Leaving vwf untouched; sweeping tool-config too                                                              | U4             |
| D6 | No review row   | No `Kind: review` row: the plan lands no runnable code — it deletes one hook script and changes prose. The wave review is the only review.                                                                                                                                                                                                                                                                                                                     | A review row                                                                                                 | —              |
| D7 | Pack bumps      | fnox to `2.0.0` (major: a mode removed). Every other pack whose files the run changed takes a patch, once per level since `stackgen-v2.0.0`. Every bundle pin to them follows, and `inventory.md` is regenerated, in one commit. No plugin or site version bump. Mid-run, a commit whose diff stales `inventory.md` (U2's summary) has the orchestrator run `mise run p:plugins:inventory` and stage the result in that same commit; no unit edits it by hand. | Bumping stackgen; deferring every inventory change to U6 (wave-1 commits would fail pre-commit)              | U2, U6         |
| D8 | Decisions doc   | Both reversals are recorded as `docs/memory/decisions/2026-10-07-fnox-development-only.md`, including D2's split with bootstrap; the 2026-09-06 decision doc gains one "superseded in part by" line.                                                                                                                                                                                                                                                           | Two decisions docs                                                                                           | U5             |

## New dependencies

none

## Units

| Id | Wave | Unit file                                    | Kind | Owns                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Depends on     | Status | Commit   |
| -- | ---- | -------------------------------------------- | ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | ------ | -------- |
| U1 | 1    | [01-contract.md](01-contract.md)             | edit | `plugins/stackgen/assets/contracts/secrets.md`, `plugins/stackgen/stacks/readme.md`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | —              | green  | f804d7a3 |
| U2 | 1    | [02-fnox.md](02-fnox.md)                     | edit | `plugins/stackgen/stacks/capability-provider/fnox/**` except the `version:` line of `pack.yaml`, `config/**` and `templates/**`; `plugins/stackgen/stacks/bundles/fnox.md` except its `components:` pin; `plugins/stackgen/assets/output-tree.md`                                                                                                                                                                                                                                                                                                                                                                                         | —              | green  | eb208b7d |
| U3 | 1    | [03-cloudflare.md](03-cloudflare.md)         | edit | `plugins/stackgen/stacks/cloud-provider/cloudflare/conventions.md`, `plugins/stackgen/stacks/cloud-service/secrets-store/**` except the `version:` line of `pack.yaml`, `plugins/stackgen/stacks/cloud-service/images/skills/cloudflare-images/references/identity-shape.md`, `plugins/stackgen/stacks/cloud-service/email-service/skills/cloudflare-email/references/identity-shape.md`, `plugins/stackgen/stacks/bundles/cloudflare-secrets-store.md` except its `components:` pins                                                                                                                                                     | —              | green  | dc418bf5 |
| U4 | 1    | [04-vwf.md](04-vwf.md)                       | edit | `plugins/vwf/assets/templates/environment.md`, `plugins/vwf/assets/examples/blueprint/environment.md`, `plugins/vwf/assets/templates/conventions.md`, `plugins/vwf/assets/memory.md`, `plugins/vwf/skills/readme/SKILL.md`                                                                                                                                                                                                                                                                                                                                                                                                                | —              | green  | 0a6e1d4e |
| U5 | 2    | [05-docs.md](05-docs.md)                     | edit | `readme.md`, `CLAUDE.md`, `.claude/docs/**`, `.claude/skills/{vwf-plugin,stackgen-plugin}/**`, `site/src/content/docs/**`, `docs/memory/decisions/2026-10-07-fnox-development-only.md` (new), `docs/memory/decisions/2026-09-06-secrets-store-is-runtime-not-development.md` (one line) ; widened at run time (rule-5, GAP): `plugins/stackgen/stacks/cloud-service/realtime/conventions.md`, `plugins/stackgen/stacks/cloud-service/realtime/skills/cloudflare-realtime/references/identity-shape.md`, `plugins/stackgen/assets/taxonomy.md`, `plugins/stackgen/skills/tool-config/references/gitleaks.md` — the falsified passages only | U1, U2, U3, U4 | green  | 37ca6ab1 |
| U6 | 3    | [06-gates-and-bump.md](06-gates-and-bump.md) | edit | the `version:` lines of every pack the run changed; every bundle `components:` pin to them; `plugins/stackgen/stacks/inventory.md` (regenerated)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | U5             | green  | fe54aca4 |

## Shared-file rule

| File                                                        | Why it collides                                    | Owner                                         |
| ----------------------------------------------------------- | -------------------------------------------------- | --------------------------------------------- |
| each pack's `pack.yaml` `version:` line                     | several units bumping one version is a lost update | U6 only                                       |
| each bundle's `components:` pins                            | pins follow the versions                           | U6 only                                       |
| `plugins/stackgen/stacks/inventory.md`                      | generated; regenerating mid-wave races             | orchestrator mid-run (D7), U6 at the end      |
| site, `.claude/**`, `readme.md`, `CLAUDE.md`, decision docs | n units editing one doc                            | U5 only                                       |
| `plugins/stackgen/assets/contracts/secrets.md`              | U2 and U3 cite it                                  | U1 only — U2 and U3 cite it, never restate it |

## Waves

- **Wave 1 — U1, U2, U3, U4.** Disjoint Owns: the contract and readme; the fnox
  pack, its bundle and `output-tree.md`; the Cloudflare packs; vwf assets. U2
  and U3 cite the contract U1 rewrites by its rules (D1, D3), not by its
  wording, so they run together.
- **Wave 2 — U5**, the docs unit, after every wave-1 report.
- **Wave 3 — U6**, gates and bump.

## Wave gate

Every line runs with `MISE_ENV=dev` exported:

- `mise run p:plugins:marketplace -- --check`
- `mise run p:plugins:inventory -- --check`
- `mise run p:plugins:check`
- `pnpm vitest run`
- `pnpm exec tsc --noEmit -p scripts`
- `mise run code:precommit`
- `mise run p:site:check`

plus the wave review, plus every report read for `UNRESOLVED:`.

## After landing

| Step                       | Mode | Notes                                                                                   |
| -------------------------- | ---- | --------------------------------------------------------------------------------------- |
| `mise run p:plugins:local` | run  | stages stackgen and vwf into the dev marketplace; a **restarted** session picks them up |

## Gates the orchestrator keeps

After U6, from the worktree root:

- `grep -rn -i 'fnox-ciphertext\|permanent-ciphertext\|encrypt-into-git\|FNOX_AGE_KEY\|age\.txt\|reencrypt' plugins site/src/content/docs .claude`
  prints nothing, except lines that state the mode **retired** (the pack's
  "moving from the encrypted mode" note, the decisions-doc pointer) — each such
  line is named in the final report.
- `test ! -e plugins/stackgen/stacks/capability-provider/fnox/hooks/fnox-ciphertext-guard.sh`
- `git diff --quiet <branch base> -- plugins/stackgen/stacks/capability-provider/fnox/config plugins/stackgen/stacks/capability-provider/fnox/templates`
  — D2: the shipped config is untouched.

## Unit contract

Every unit prompt carries, in order: its ruling quoted from this file, its owned
paths plus "touch nothing outside this list", the facts section, the shared-file
rule, and the return block below. A unit never bumps a version, never runs a
generator, never edits a doc outside its Owns, never adds a dependency this file
does not list, never commits. A unit deletes with plain `rm`, never `git rm` —
it stages nothing. A unit never runs `git checkout`, `git restore` or a
formatter with `--fix` outside its Owns.

A unit returns exactly this block and nothing else — no file contents, no diff:

    CHANGED: <path> — <one line>            (one per file)
    DECIDED: <what> — <why>                 (choices made inside scope, or none)
    DOCS FALSIFIED: <path> — <passage>      (reported, never edited; or none)
    GAP: <what the plan left unspecified and the assumption taken>   (or none)
    UNRESOLVED: <the ruling needed>         (or none)

## Out of scope

- The fnox pack's `config/fnox.toml`, `config/.config/mise/tasks/setup/secrets`
  and `templates/` — D2; the config shape is bootstrap's.
- A cleanup mechanism for a previously materialized guard hook — declined (D4).
- Doppler strays in `stackgen:tool-config` files (`references/mise.md`, the
  `.vscode/settings.json` asset) and `scripts/src/check.ts` — bootstrap replaces
  tool-config; `check.ts`'s `TOOL_TOKENS` entry is a valid guard.
- This repo's own `.config/mise/tasks/setup/secrets`, `.config/mise/conf.d/**`
  and `.vscode/*` — the maintainer edits this repo's own config by hand.
- History passages: everything under `docs/memory/` (except D8's one line) and
  `docs/plans/`; past-tense history lines in the site manual.
- `vwf` init and `/vwf:setup reshape` — no change (the old D9 sync offer is
  dropped with D4's cleanup).

## Parked

- **bootstrap — the fnox config shape** (repo
  `~/Projects/github.com/virajp/bootstrap`, its `fnox` core tool): `fnox.toml`
  declares `[profiles.development.secrets]` for every dev secret and an empty
  `[profiles.ci.secrets]`, with an empty top-level `[secrets]` because every
  profile inherits it; `FNOX_PROFILE` comes from the mise env as
  `{% if get_env(name='CI', default='') != '' %}ci{% else %}development{% endif %}`;
  every secret-needing task runs `fnox exec -- <cmd>`; `setup:secrets` lists the
  development profile's missing secrets and prompts for each with hidden input
  via `fnox set NAME`, testing presence by exit status only and never printing a
  value; and the `fnox.toml` comment stops offering "age encryption". Plan it in
  the bootstrap repo once its `tool-setup-config` plan lands.
- A vwf capability token for secrets — still parked from
  `docs/plans/archived/2026-09-06-cloudflare-media-messaging-secrets`; with fnox
  development-only the split-by-environment argument is stronger. vwf's move.

## Run log

| Wave | Unit               | Model | Round | Outcome     | Detail                                                                                                                                                                                                                                                                                                                                                                                                       | Commit   |
| ---- | ------------------ | ----- | ----- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- |
| 0    | preflight          | —     | 1     | pass        | doctor: repo not onboarded for vwf (no .config/vwf.yaml), no blocking finding; no code unit, LSP n/a; all 7 wave gate lines green (code:precommit green on the second pass)                                                                                                                                                                                                                                  | —        |
| 0    | format-check       | —     | 1     | skipped     | why: no covers:, the plan reads no blueprint artifact                                                                                                                                                                                                                                                                                                                                                        | —        |
| 0    | conventions        | —     | 1     | skipped     | why: edit units only                                                                                                                                                                                                                                                                                                                                                                                         | —        |
| 0    | sequence           | —     | 1     | pass        | wave 1 U1, U2, U3, U4 (edit); wave 2 U5 (edit); wave 3 U6 (edit); no review row (D6)                                                                                                                                                                                                                                                                                                                         | —        |
| 1    | U1 contract        | opus  | 1     | pass        | edit; secrets.md gains the environment split, allowance replaced by "No repo carries an encrypted secret"; readme fnox dev-only. DECIDED: readme :24 history kept; CI named beside the three environments. GAP: ran its greps + p:plugins:check only, full gate left to the orchestrator                                                                                                                     | —        |
| 1    | U4 vwf             | opus  | 1     | pass        | edit; environment template + example and conventions template state the dev/CI/staging-prod split; `.doppler/` and the readme doppler example removed. DECIDED: non-secret "Deployment env" rows kept; hand-reflowed to 80 cols                                                                                                                                                                              | —        |
| 1    | U3 cloudflare      | opus  | 1     | pass        | edit; cloudflare, secrets-store (pack comment, conventions, SKILL, 4 refs), images + email identity-shape, bundle prose: CI from the forge, allowance section gone. DECIDED: also fixed SKILL.md, secrets-store identity-shape, doctrine clauses 1-2 (in Owns, falsified by U1). DOCS FALSIFIED: realtime/conventions.md:39-40, realtime identity-shape.md:55-56 (CI via capability-provider) — handed to U5 | —        |
| 1    | U2 fnox            | opus  | 1     | pass        | edit; guard hook + permanent-ciphertext.md deleted (rm), pack summary, conventions, SKILL, 5 refs, bundle prose, output-tree precedent rewritten; config/ templates/ untouched. DECIDED: onboarding = setup:secrets check then `fnox set NAME --provider keychain`. DOCS FALSIFIED: inventory.md:35 — orchestrator regenerates (D7)                                                                          | —        |
| 1    | R1                 | opus  | 1     | findings(9) | CONTRACT clean, RULINGS clean; U2 contract-satisfaction.md stale clause headings :29 :42, named-gap framing :32, fold :54; U3 folds cloudflare/conventions.md:51, secrets-store/conventions.md:128, SKILL.md:10,40; U4 folds example environment.md:79, template environment.md:17; rule 5 nobody-owned: stackgen/assets/taxonomy.md:172, tool-config/references/gitleaks.md:73 — to U5                      | —        |
| 1    | U2 fnox            | opus  | 2     | pass        | edit; contract-satisfaction clause headings renamed to U1's, named-gap framing dropped, :54 folded. DECIDED: clause 2 verdict "Satisfied by absence"                                                                                                                                                                                                                                                         | —        |
| 1    | U4 vwf             | opus  | 2     | pass        | edit; two folds fixed; other >80 lines pre-existing (tables, comment, multibyte)                                                                                                                                                                                                                                                                                                                             | —        |
| 1    | U3 cloudflare      | opus  | 2     | pass        | edit; four folds fixed, frontmatter valid                                                                                                                                                                                                                                                                                                                                                                    | —        |
| 1    | R1                 | opus  | 2     | findings(1) | round-1 fixes verified; CONTRACT clean, RULINGS clean; contested (cap of 2 reached, 9→1): secrets-store/references/service-doctrine.md:129 [U3] clause 2 named gap still quotes "read-only where the pipeline only reads", wording of the old CI clause                                                                                                                                                      | —        |
| 1    | gate               | —     | 1     | pass        | all 7 lines green after the D7 mid-run `p:plugins:inventory` regeneration (inventory.md:35 fnox summary), staged in U2 commit                                                                                                                                                                                                                                                                                | —        |
| 1    | commits            | —     | 1     | pass        | U1 f804d7a3, U2 eb208b7d (+ inventory.md), U3 dc418bf5, U4 0a6e1d4e                                                                                                                                                                                                                                                                                                                                          | 0a6e1d4e |
| 2    | U5 docs            | —     | —     | GAP         | Owns widened (rule 5, authorised by the Goal) to the falsified passages of realtime/conventions.md:39-40, realtime identity-shape.md:55-56 (U3 report), stackgen/assets/taxonomy.md:172 and tool-config/references/gitleaks.md:73 (R1)                                                                                                                                                                       | —        |
| 2    | U5 docs            | opus  | 1     | pass        | edit; repo map hooks count, stackgen-plugin skill, site stackgen.md and choosing-your-stack.md, new decisions doc 2026-10-07-fnox-development-only.md, superseded-in-part line; widened passages fixed (realtime two files, taxonomy, gitleaks). DECIDED: stackgen.md:240-241 doppler history and setup:doppler legacy row kept. GAP: realtime pack changed, so U6 patch-bumps it                            | —        |
| 2    | R2                 | opus  | 1     | findings(2) | CONTRACT clean (all paths in U5's widened Owns), RULINGS clean (D8 one doc, both reversals, D2 split, one superseded line); folds: tool-config/references/gitleaks.md:73 (93 cols), realtime identity-shape.md:56 (94 cols)                                                                                                                                                                                  | —        |
| 2    | U5 docs            | opus  | 2     | pass        | edit; the two lines re-folded, no words changed. Its UNRESOLVED line was a note (other >80 lines unchecked), not a ruling request                                                                                                                                                                                                                                                                            | —        |
| 2    | R2                 | opus  | 2     | findings(1) | folds verified, CONTRACT clean, RULINGS clean; contested (cap of 2 reached, 2→1): tool-config/references/gitleaks.md:75 under-filled 24-col line "indistinguishable from a" could rejoin :76                                                                                                                                                                                                                 | —        |
| 2    | gate               | —     | 1     | pass        | all 7 lines green                                                                                                                                                                                                                                                                                                                                                                                            | —        |
| 2    | commits            | —     | 1     | pass        | U5 37ca6ab1                                                                                                                                                                                                                                                                                                                                                                                                  | 37ca6ab1 |
| —    | acceptance         | —     | 1     | skipped     | why: no covers:, no acceptance criteria                                                                                                                                                                                                                                                                                                                                                                      | —        |
| —    | ux                 | —     | 1     | skipped     | why: no covers:, no Screens contract                                                                                                                                                                                                                                                                                                                                                                         | —        |
| —    | reconcile          | —     | 1     | skipped     | why: no covers: (no stamps); edit units only, nothing to persist                                                                                                                                                                                                                                                                                                                                             | —        |
| 3    | U6 gates-and-bump  | opus  | 1     | pass        | edit; fnox 1.2.1→2.0.0; cloudflare, email-service, images, realtime, secrets-store 0.1.0→0.1.1; bundle pins (fnox + 22 cloudflare-*) follow; inventory.md regenerated. DECIDED: realtime added to the expected five (U5 widening); no plugin bump (stackgen 3.0.0, vwf 21.0.0, site 1.1.50 above tags). Its own full gate green                                                                              | —        |
| 3    | R3                 | opus  | 1     | pass        | CONTRACT clean, RULINGS clean (D7): 6 version lines, 27 pins in 23 bundles, inventory version strings only                                                                                                                                                                                                                                                                                                   | —        |
| 3    | commits            | —     | 1     | pass        | U6 fe54aca4 (versions, pins, inventory in one commit)                                                                                                                                                                                                                                                                                                                                                        | fe54aca4 |
| —    | final gate         | —     | 1     | pass        | all 7 wave gate lines green over the finished tree                                                                                                                                                                                                                                                                                                                                                           | —        |
| —    | orchestrator gates | —     | 1     | pass        | ciphertext grep: only fnox/conventions.md:85,87, the retired-mode "Moving from the encrypted mode" note (allowed); guard hook absent; fnox config/ and templates/ unchanged since fea037a6                                                                                                                                                                                                                   | —        |

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the run's worktree — cut from the integration branch — can see it.

Run in a fresh context — a fresh session, or a runner that `all` dispatches:

/vwf:execute docs/plans/2026-10-07-fnox-dev-only-doctrine

or let the queue pick it, by priority:

/vwf:execute next

or run every runnable plan, highest priority first:

/vwf:execute all
