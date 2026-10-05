---
type: vwf-change-plan
title: fnox is the development-only secrets provider
requires: [ docs/plans/2026-10-05-reshape-migration ]
backlog: []
backlog_pieces: []
---

# Plan — fnox is the development-only secrets provider (2026-10-05)

## Status

**APPROVED**

APPROVED 2026-10-05 by the user

## Consent

| Action                                            | Granted |
| ------------------------------------------------- | ------- |
| Merge to the integration branch and push on green | yes     |
| After landing: `mise run p:plugins:local`         | run     |
| Release stackgen publicly                         | none    |
| Release vwf publicly                              | none    |
| Release site publicly                             | none    |

**The mode recorded here is the consent.** A `run` step runs on a green landing
without a prompt. The staged plugins are picked up only by a **restarted**
session.

**Release none** — user, for the template chain this plan follows: *"no release
step, only local release which I will first test and then ask for release"*. No
plugin or site version is bumped (stackgen `3.0.0`, vwf `20.1.0` and the site
already sit above their tags); only the edited packs' own `version:` lines move
(D13).

## Goal

After this lands, fnox is stackgen's only secrets provider, and it serves the
**development environment only**: secrets live in the OS keychain by default,
any single secret may instead reference a fnox-supported cloud store, and no
repo ever carries an encrypted secret. stackgen's secrets contract states the
split every product follows — the development manager on a developer's machine,
**CI's secrets from the forge** (GitHub or GitLab), **staging and production
secrets from the cloud provider**, where neither mise nor fnox runs. The Doppler
pack already retired with plan 2 of the template chain.

**Reversals, both confirmed by the user and recorded by U8 as one decisions
doc:**

1. `docs/memory/decisions/2026-09-06-secrets-store-is-runtime-not-development.md`
   ruled a repo pins "`capability-provider/fnox` for the developer machine and
   CI". CI now takes its secrets from the forge; fnox resolves nothing there.
   The runtime half of that decision (Secrets Store holds staging and
   production) stands.
2. The secrets contract's **encrypt-into-git allowance** ("The mode is offered,
   under four conditions") retires outright, and with it fnox's age/KMS mode,
   its ciphertext guard hook and the four repo-wide blocks it asked for.

**Re-planned 2026-10-05.** This folder replaces
`docs/plans/archived/2026-10-02-fnox-dev-only` (archived unrun) after the
tool-config template chain (`2026-10-05-tool-config-template-engine`,
`2026-10-05-tool-config-templates`, `2026-10-05-vwf-callers-on-templates`,
`2026-10-05-reshape-migration`) retired pack `tool-config:` lists and the
doppler pack. Rulings D1, D3–D7, D9, D11, D12 and D15 are the 2026-10-02
interview's, verbatim; D2, D8, D10, D13, D14 and D16 are restated for the new
model, the user confirming D8's narrowing and the new folder on 2026-10-05.

## Facts the survey established

Line numbers are as of 2026-10-02, **before** the template chain landed; it
rewrote tool-config's references, every pack's `pack.yaml`, the stackgen-sync
and output-tree prose, vwf init and setup, and the site. Every unit re-reads its
owned files and locates passages by content, not line; a passage already gone is
not an error.

`SG` = `plugins/stackgen`, `FX` = `SG/stacks/capability-provider/fnox`.

- **The fnox pack before the template chain** (`FX`, version `1.2.1` at
  `stackgen-v2.0.0`): `pack.yaml` (summary "encrypted into git or referenced in
  your own cloud"; plan 2 removed its `tool-config:` list and moved the `fnox`
  pin into `templates/.config/mise/conf.d/fnox/mise.toml`), `conventions.md`,
  `config/fnox.toml` (keychain provider, `if_missing = "warn"`, entries under
  top-level `[secrets]`), `config/.config/mise/tasks/setup/secrets` (checks CLI
  and config, prints keychain service/prefix), `hooks/fnox-ciphertext-guard.sh`,
  `skills/fnox/SKILL.md` +
  `references/{pick-and-trade,contract-satisfaction,access-shape,cost-shape,local-stack,permanent-ciphertext}.md`.
  Bundle pin `SG/stacks/bundles/fnox.md:6` (`capability-provider/fnox@1.2.1`);
  inventory rows `SG/stacks/inventory.md:36` and `:140`.
- **The guard is not wired by anything automatic.** The materializer copies a
  pack's `hooks/*.sh` to `.claude/hooks/` and records it in the lockfile
  (`SG/skills/stackgen-stack-template/references/materializer.md:52`); the
  pre-commit entry, the gitleaks allowlist, the `.gitignore` age lines and the
  mempalace exclude exist only as hand-applied literal blocks in
  `FX/skills/fnox/references/contract-satisfaction.md:139-201` — they carry no
  tool-config block markers. `scripts/src/check.ts:345-352,474-477` gates every
  pack hook generically; no test names the guard. `check.ts:401` lists
  `fnox.toml` in `PACK_CONFIG_ROOT_FILES` — keep.
- **No removal mechanism exists.** `SG/skills/stackgen-sync/SKILL.md:63-72`
  drops a lock record only when the file is already gone ("a path the component
  no longer ships that is still present is not this rule's"); `:60-61`,
  `:233-236`; `SG/assets/output-tree.md:402-408,443-449`. tool-config's
  `<tool> remove --for <pack>` removes only marker-delimited blocks of a whole
  dropped pack (`materializer.md:445-454`). `stackgen-sync` is user-invoked only
  (`disable-model-invocation: true`); vwf init names it once
  (`plugins/vwf/skills/init/SKILL.md:914`). The closest precedent for a one-off
  migration is init's "retired hygiene bundle"
  (`plugins/vwf/skills/init/references/existing-repo.md:226-245`).
- **A pack's mise lines after the template chain.** A pack's mise files live in
  its `templates/` (plan 2 E2, E3), rendered by tool-config's `pack` call; the
  fnox pack's `templates/.config/mise/conf.d/fnox/mise.toml` already pins
  `fnox`. The `@@` engine passes mise's Tera (`{% … %}`, `{{ … }}`) through
  untouched, so D2's value is written there literally under `[env]`. `env: ci`
  is selected by `MISE_ENV=ci`, not by `CI=true` — hence D2's template in a file
  every environment loads. mise's Tera has `get_env(name=..., default=...)`
  (Context7, `/jdx/mise` templates doc). `fnox.local.toml` is in tool-config's
  universal `.gitignore` (plan 2 E7).
- **fnox facts (Context7 `/jdx/fnox`).** Profiles inherit top-level `[secrets]`
  and `[providers]`; `--no-defaults` / `FNOX_NO_DEFAULTS` disable that.
  `FNOX_PROFILE` selects the profile. `FNOX_IF_MISSING=error|warn|ignore`
  overrides `if_missing`. `fnox set KEY` with no value reads stdin or prompts
  interactively. The keychain provider covers macOS Keychain, Windows Credential
  Manager and Linux Secret Service. Cloud providers: AWS Secrets Manager and
  Parameter Store, Azure Key Vault, GCP Secret Manager, Vault, 1Password,
  Bitwarden, Infisical, Doppler. Not verified: that fnox accepts a
  declared-but-empty profile — U2 verifies.
- **Passages the fnox/contract change falsifies** (owner in brackets):
  `SG/assets/contracts/secrets.md:31-37,55-60,93-127` [U1];
  `SG/stacks/readme.md:21-24,175-195,263,347-351` [U1];
  `SG/skills/tool-config/references/gitleaks.md:103` [U1];
  `SG/stacks/bundles/fnox.md:11-12,24,28-31,35-36,55-56` [U2];
  `SG/assets/output-tree.md:273-274` (fnox as hook-script precedent) [U5];
  `SG/stacks/cloud-provider/cloudflare/conventions.md:48-50`,
  `SG/stacks/cloud-service/secrets-store/pack.yaml:12-17`,
  `.../secrets-store/conventions.md:71-72,137-139`,
  `.../cloudflare-secrets-store/references/service-doctrine.md:183-191`,
  `.../references/pick-and-trade.md:11-14`, `.../references/local-dev.md:49-52`,
  `SG/stacks/cloud-service/images/skills/cloudflare-images/references/identity-shape.md:60-61`,
  `SG/stacks/cloud-service/email-service/skills/cloudflare-email/references/identity-shape.md:102-104`,
  `SG/stacks/bundles/cloudflare-secrets-store.md:15,57-59` [U4];
  `plugins/vwf/assets/templates/environment.md:14,96-97`,
  `plugins/vwf/assets/examples/blueprint/environment.md:83`,
  `plugins/vwf/assets/templates/conventions.md:45` [U6];
  `site/src/content/docs/plugins/stackgen.md:605-611`,
  `site/src/content/docs/how-to/operate/choosing-your-stack.md:118-119`,
  `.claude/skills/stackgen-plugin/SKILL.md:386-391` ("Two scripts") [U8].
- **Doppler** — deleted by plan 2 of the template chain; plan 4's sweep removed
  its names. Any `doppler` left in this plan's Owns is a stray to remove.
- **Bundles that pin a pack this plan edits** — U9 finds them by grepping
  `SG/stacks/bundles/*.md` for each edited pack's `<type>/<slug>@` pin.
- **Gates.** `mise tasks`:
  `p:plugins:{check,inventory,marketplace,npm-normalize-test,local,release}`,
  `p:site:{check,build,version,release}`, `code:{precommit,format,lint,sec}`.
  `plugins/**/*.md` is not dprint-formatted — match the fold width by hand. The
  `plugins-inventory` pre-commit hook runs `p:plugins:inventory --check`.
- **Commit types** (`.config/git-conventional-commits.yaml`): `ops`, `docs`,
  `merge`, `feat`, `fix`, `refactor`; no scopes.
- **Versions at planning time.** stackgen `3.0.0` (tag `stackgen-v2.0.0`), vwf
  `20.1.0` (tag `vwf-v20.0.1`), site `1.1.50` (tag `site-v1.1.49`).
- **Backlog.** No open item covers this request (read 2026-10-02).

## Assumed decisions — confirm or override at review

| #   | Decision          | Ruling                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Rejected                                                                                                                                         | Unit       |
| --- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ---------- |
| D1  | Scope of fnox     | fnox manages secrets for the development environment only. The OS keychain is the default provider; any single secret may instead reference a fnox-supported cloud store (mixed per secret). No encrypted secret ever enters a repo: no age, no KMS, no committed ciphertext.                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Keychain only; asked once per repo at setup; following the product's cloud pick                                                                  | U1, U2     |
| D2  | Profiles          | `fnox.toml` declares two profiles: `[profiles.development.secrets]` holds every dev secret, `[profiles.ci.secrets]` is empty on purpose, and the top-level `[secrets]` is empty on purpose because every profile inherits it. No `staging` or `production` profile. `FNOX_PROFILE` is set in the fnox pack's `templates/.config/mise/conf.d/fnox/mise.toml` `[env]` (loaded in every environment) with the value `{% if get_env(name='CI', default='') != '' %}ci{% else %}development{% endif %}`.                                                                                                                                                                                                                                 | Dev secrets at the top level plus `FNOX_NO_DEFAULTS` in CI (fails open); keeping all four profiles; skipping fnox in CI by a condition           | U2         |
| D3  | Task shape        | Every task that needs secrets runs `fnox exec -- <cmd>` unconditionally; no per-task CI condition. In CI the empty `ci` profile resolves nothing and the forge's variables pass through.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Wrapping only at the developer's prompt; the experimental mise-env-fnox plugin                                                                   | U2         |
| D4  | Environments      | Staging and production never run mise or fnox — their secrets come from the cloud provider. CI's secrets come from the forge (GitHub or GitLab). The contract states this as the development manager's named gap.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | fnox serving CI or deployed environments                                                                                                         | U1, U2     |
| D5  | No guard          | Delete `hooks/fnox-ciphertext-guard.sh` and the four-condition doctrine (gitleaks path allowlist, mempalace exclude of `fnox.toml`, `.gitignore` age lines). Doctrine only — the skill states the rule; gitleaks still catches a plaintext value.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | A provider-type guard hook; folding the check into an existing gate                                                                              | U2         |
| D6  | setup:secrets     | The task lists the development profile's declared secrets that are missing, and prompts for each with hidden input via `fnox set NAME`. It tests presence by exit status only — `FNOX_IF_MISSING=error FNOX_PROFILE=development fnox get NAME` with stdout and stderr discarded — or a dedicated check command if Context7 shows one. It never prints a value. Cloud-referenced secrets are reported, never prompted.                                                                                                                                                                                                                                                                                                               | Report missing only; doctrine only                                                                                                               | U2         |
| D7  | Contract-wide     | stackgen's secrets contract loses the encrypt-into-git allowance and states the environment split (D4); every provider pack is held to it.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | fnox only, contract keeps the allowance                                                                                                          | U1         |
| D8  | Cleanup rule      | `stackgen-sync` gains a general rule: a path a component no longer ships that is still present **and** whose hash still matches the lock record is offered for removal on consent; a modified one is reported only — this removes the old `.claude/hooks/fnox-ciphertext-guard.sh`. Plus a narrowed one-off fnox detector in the same pass: it removes, on consent, a gitleaks allowlist entry naming `fnox.toml` (now the repo's own line outside the `tool-config` markers), and flags — never edits — a non-empty top-level `[secrets]` or any age/KMS provider in `fnox.toml`. A hand-added `fnox-ciphertext` pre-commit hook is left to tool-config, which shows it as a diff row on the whole-owned `pre-commit-config.yaml`. | The detector also removing the pre-commit hook (duplicates tool-config's row); a one-off step in vwf init only; detect-and-warn in setup:secrets | U5         |
| D9  | Reshape offers    | `/vwf:setup reshape` (init's existing-repo pass) offers to run `/stackgen:stackgen-sync` once stackgen components are materialized, on the same consent as the rest of the plan; it never runs it silently.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Sync only, on the user's clock                                                                                                                   | U6         |
| D10 | Doppler           | Done by plan 2 of the template chain (`2026-10-05-tool-config-templates` E14): the pack, its bundle and its overlay are gone, and plan 4's sweep removed its names. A unit that still finds a live mention of doppler inside its Owns removes it; repos that materialized it are left untouched — no migration.                                                                                                                                                                                                                                                                                                                                                                                                                     | Re-materialize removes it                                                                                                                        | U1, U6, U8 |
| D11 | vwf templates     | vwf's `environment.md` template and example stop saying "store it in the secrets manager for each environment (dev/staging/prod)": development values live in the development secrets manager, CI's in the forge, staging and production in the cloud provider's store.                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Leaving vwf untouched                                                                                                                            | U6         |
| D12 | Review            | One `Kind: review` row (U7) covers U2, which lands runnable shell — `config/.config/mise/tasks/setup/secrets`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | No review row                                                                                                                                    | U7         |
| D13 | Pack bumps        | fnox to `2.0.0` (major: a mode removed). Patch bumps: `cloud-service/secrets-store`, `cloud-provider/cloudflare`, `cloud-service/images`, `cloud-service/email-service`, `app-framework/flutter`. Each once per level since `stackgen-v2.0.0` (a pack the template chain already patched takes no second patch; fnox still takes its major). Every bundle pin to them follows, and `inventory.md` is regenerated, in one commit. No plugin or site version bump.                                                                                                                                                                                                                                                                    | Bumping stackgen again                                                                                                                           | U9         |
| D14 | Inventory mid-run | `SG/stacks/inventory.md` is generated. A wave-1 commit whose diff stales it (U2's summary) has the orchestrator run `mise run p:plugins:inventory` and stage the result in that same commit, because the `plugins-inventory` pre-commit hook refuses it otherwise. No unit edits it by hand.                                                                                                                                                                                                                                                                                                                                                                                                                                        | Deferring every inventory change to U9 (wave-1 commits would fail pre-commit)                                                                    | —          |
| D15 | Decisions doc     | Both reversals are recorded as `docs/memory/decisions/2026-10-02-fnox-development-only.md`; the 2026-09-06 decision doc gains one "superseded in part by" line.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Two decisions docs                                                                                                                               | U8         |
| D16 | One plan          | The fnox rework and the contract change are one plan: they rewrite the same passages. Doppler's removal moved to plan 2 of the template chain.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Two chained plans                                                                                                                                | —          |

## New dependencies

none

## Units

| Id | Wave | Unit file                                    | Kind   | Owns                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Depends on         | Status  | Commit |
| -- | ---- | -------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ | ------- | ------ |
| U1 | 1    | [01-contract.md](01-contract.md)             | edit   | `plugins/stackgen/assets/contracts/secrets.md`, `plugins/stackgen/stacks/readme.md`, `plugins/stackgen/skills/tool-config/references/gitleaks.md`                                                                                                                                                                                                                                                                                                                                     | —                  | pending |        |
| U2 | 1    | [02-fnox.md](02-fnox.md)                     | edit   | `plugins/stackgen/stacks/capability-provider/fnox/**` except the `version:` line of `pack.yaml`, `plugins/stackgen/stacks/bundles/fnox.md` except its `components:` pin                                                                                                                                                                                                                                                                                                               | —                  | pending |        |
| U4 | 1    | [04-cloudflare.md](04-cloudflare.md)         | edit   | `plugins/stackgen/stacks/cloud-provider/cloudflare/conventions.md`, `plugins/stackgen/stacks/cloud-service/secrets-store/**` except the `version:` line of `pack.yaml`, `plugins/stackgen/stacks/cloud-service/images/skills/cloudflare-images/references/identity-shape.md`, `plugins/stackgen/stacks/cloud-service/email-service/skills/cloudflare-email/references/identity-shape.md`, `plugins/stackgen/stacks/bundles/cloudflare-secrets-store.md` except its `components:` pins | —                  | pending |        |
| U5 | 1    | [05-sync.md](05-sync.md)                     | edit   | `plugins/stackgen/skills/stackgen-sync/SKILL.md`, `plugins/stackgen/assets/output-tree.md`                                                                                                                                                                                                                                                                                                                                                                                            | —                  | pending |        |
| U6 | 1    | [06-vwf.md](06-vwf.md)                       | edit   | `plugins/vwf/skills/init/SKILL.md`, `plugins/vwf/skills/init/references/existing-repo.md`, `plugins/vwf/assets/templates/environment.md`, `plugins/vwf/assets/templates/conventions.md`, `plugins/vwf/assets/examples/blueprint/environment.md`, `plugins/vwf/assets/memory.md`, `plugins/vwf/skills/readme/SKILL.md`                                                                                                                                                                 | —                  | pending |        |
| U7 | 2    | [07-review.md](07-review.md)                 | review | —                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | U2                 | pending |        |
| U8 | 3    | [08-docs.md](08-docs.md)                     | edit   | `readme.md`, `CLAUDE.md`, `.claude/docs/**`, `.claude/skills/{vwf-plugin,stackgen-plugin}/**`, `site/src/content/docs/**`, `docs/memory/decisions/2026-10-02-fnox-development-only.md`, `docs/memory/decisions/2026-09-06-secrets-store-is-runtime-not-development.md`                                                                                                                                                                                                                | U1, U4, U5, U6, U7 | pending |        |
| U9 | 4    | [09-gates-and-bump.md](09-gates-and-bump.md) | edit   | the `version:` lines of the six packs D13 names, every bundle `components:` pin to them, `plugins/stackgen/stacks/inventory.md` (regenerated)                                                                                                                                                                                                                                                                                                                                         | U8                 | pending |        |

## Shared-file rule

| File                                                      | Why it collides                                  | Owner                                      |
| --------------------------------------------------------- | ------------------------------------------------ | ------------------------------------------ |
| each edited pack's `pack.yaml` `version:` line            | several units bumping one version is lost update | U9 only                                    |
| bundle `components:` pins                                 | follow the pack versions                         | U9 only                                    |
| `plugins/stackgen/stacks/inventory.md`                    | generated; the pre-commit hook checks freshness  | the orchestrator mid-run (D14), U9 at last |
| `.claude-plugin/marketplace.json`, `plugin.json` versions | versioned                                        | nobody — no plugin bump (D13)              |
| `docs/plans/index.md`                                     | plan-management's                                | no unit — ever                             |
| every human-facing doc outside `plugins/`                 | n units editing one doc                          | U8 only                                    |

## Waves

- **Wave 1 — U1, U2, U4, U5, U6.** Five disjoint path sets: the contract and
  stacks readme (U1), the fnox pack (U2), the Cloudflare packs (U4),
  stackgen-sync and the output tree (U5), vwf (U6). U3 (the Doppler deletion) is
  retired — plan 2 did it (D10). They share only names fixed by the rulings —
  the profile names `development` and `ci`, the variable `FNOX_PROFILE`, the
  hook id `fnox-ciphertext`, the decisions doc path — quoted verbatim in each
  unit.
- **Wave 2 — U7**, the review row over U2's commit.
- **Wave 3 — U8**, docs. **Wave 4 — U9**, gates and pack bumps.

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

A live run of the new `setup:secrets` task, after wave 2, in a `mktemp -d` git
repo — never this checkout, never the keychain service `fnox`:

- Copy U2's `config/fnox.toml` and `config/.config/mise/tasks/setup/secrets`
  into the scratch repo with the keychain provider's `service` set to
  `fnox-plan-test`, plus the `_scripts/helpers` the task sources, and declare
  one secret `PLANTEST_TOKEN` under `[profiles.development.secrets]`.
- Run the task with `PLANTEST_TOKEN`'s value fed on stdin: it exits 0, the
  captured output never contains the value, and afterwards
  `FNOX_PROFILE=development fnox get PLANTEST_TOKEN` (output captured, compared,
  never echoed) returns it.
- Re-run the task: it reports nothing missing and prompts for nothing.
- `FNOX_PROFILE=ci fnox exec -- env` resolves without error and sets no
  `PLANTEST_TOKEN` — the empty `ci` profile (D2) works.
- Clean up: delete the `fnox-plan-test` keychain entry — on macOS
  `security delete-generic-password -s fnox-plan-test`, or fnox's own remove
  command. Keychain writes may need the Bash sandbox off.

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

- This repo's own `.config/mise/conf.d/tools.dev.toml` (Doppler pin),
  `.config/mise/tasks/setup/secrets` and `.vscode/*` — the maintainer edits this
  repo's own config by hand.
- Test fixtures that use `doppler` / `DOPPLER_CONFIG` as made-up names
  (`scripts/src/tool-config-mise.test.ts`, `check.test.ts:871`) — they never
  read the pack.
- `scripts/src/check.ts:2111` `TOOL_TOKENS` keeps `"doppler"` — a still-valid
  guard against vwf naming a technology.
- History passages: `SG/skills/tool-config/references/mise.md:1273`,
  `site/.../plugins/stackgen.md:1222,1373`, everything under `docs/memory/`
  (except D15's one line) and `docs/plans/archived/`.
- Migrating repos that materialized Doppler — declined (D10).
- A provider-type guard hook — declined (D5).

## Parked

- A vwf capability token for secrets — still parked from
  `docs/plans/archived/2026-09-06-cloudflare-media-messaging-secrets`; with fnox
  now development-only the split-by-environment argument is stronger. vwf's
  move.

## Run log

| Wave | Unit | Model | Round | Outcome | Detail | Commit |
| ---- | ---- | ----- | ----- | ------- | ------ | ------ |

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the fresh session's worktree — cut from the integration branch — can see it.

Run in a fresh session:

/vwf:execute docs/plans/2026-10-05-fnox-dev-only

or let the queue pick it, by priority:

/vwf:execute next
