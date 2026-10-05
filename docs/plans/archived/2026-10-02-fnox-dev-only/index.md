---
type: vwf-change-plan
title: fnox is the development-only secrets provider; Doppler retires
requires: [ docs/plans/2026-10-05-reshape-migration ]
backlog: []
backlog_pieces: []
---

# Plan — fnox is the development-only secrets provider; Doppler retires (2026-10-02)

## Status

**ARCHIVED**

ARCHIVED 2026-10-05 — not run; was APPROVED (superseded by
docs/plans/2026-10-05-fnox-dev-only)

## Consent

| Action                                            | Granted |
| ------------------------------------------------- | ------- |
| Merge to the integration branch and push on green | yes     |
| After landing: `mise run p:plugins:local`         | run     |
| Release stackgen publicly                         | major   |
| Release vwf publicly                              | minor   |
| Release site publicly                             | patch   |

**The mode recorded here is the consent.** A `run` step runs on a green landing
without a prompt. The staged plugins are picked up only by a **restarted**
session.

**Release rows are intent, not authorisation** — no public release step is
recorded; the change ships with the next batched `/release`. A project is bumped
once per level since its last release. The chain this plan requires already
carries stackgen `3.0.0` (major above `stackgen-v2.0.0`), vwf `20.1.0` (minor)
and the site above its last tag — all unreleased — so **this plan bumps no
plugin or site version**; only the edited packs' own `version:` lines move
(D13). Were a plugin bump needed, it is a hand edit of its
`.claude-plugin/plugin.json` plus `mise run p:plugins:marketplace`, and the
site's is `mise run p:site:version` — neither is authorised here.

## Goal

After this lands, fnox is stackgen's only secrets provider, and it serves the
**development environment only**: secrets live in the OS keychain by default,
any single secret may instead reference a fnox-supported cloud store, and no
repo ever carries an encrypted secret. stackgen's secrets contract states the
split every product follows — the development manager on a developer's machine,
**CI's secrets from the forge** (GitHub or GitLab), **staging and production
secrets from the cloud provider**, where neither mise nor fnox runs. The Doppler
pack retires.

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

## Facts the survey established

Line numbers are as of 2026-10-02, **before** the required chain (`-gates`,
`-hygiene`, `-init`, `-graphify-report-ignored`) lands; that chain rewrites
`tool-config/references/{gitleaks,git}.md`, the fnox and doppler `pack.yaml` git
entries (hygiene H5), `bundles/fnox.md` (init I6) and vwf init. Every unit
re-reads its owned files and locates passages by content, not line.

`SG` = `plugins/stackgen`, `FX` = `SG/stacks/capability-provider/fnox`.

- **The fnox pack today** (`FX`, version `1.2.1`): `pack.yaml` (summary
  "encrypted into git or referenced in your own cloud"; `tool-config:` = mise
  `add-tool fnox` `env: all` + git ignore `fnox.local.toml`), `conventions.md`,
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
- **A pack's mise env line.** `{ tool: mise, verb: add-env, key, value, env }`,
  `env` one of `all|dev|ci|test` (`SG/assets/pack-format.md:192-193,239-252`); a
  Tera template value is legal for a pack's own line (`--for`)
  (`SG/skills/tool-config/scripts/lib/schema.mjs:298`,
  `lib/tools/mise.mjs:1869-1872`, `references/mise.md:503-507`, precedent
  `:531`). `env: ci` is selected by `MISE_ENV=ci`, not by `CI=true`
  (`mise.md:48,76`) — hence D2's template on `env: all`. mise's Tera has
  `get_env(name=..., default=...)` (Context7, `/jdx/mise` templates doc).
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
- **Doppler.** Pack `SG/stacks/capability-provider/doppler/` (10 files), bundle
  `SG/stacks/bundles/doppler.md` (its only user). References outside it:
  `SG/stacks/inventory.md:10,35,139` (generated; count "69 packs, 65 bundles"
  becomes 68/64); `SG/stacks/readme.md:24,175-181,187-195,263` [U1];
  `SG/skills/tool-config/references/git.md:207` [U3];
  `SG/skills/tool-config/references/mise.md:1273` (rename-history row — stays);
  `SG/stacks/app-framework/flutter/skills/flutter/references/testing.md:94`
  [U3]; `plugins/vwf/assets/memory.md:161` (`.doppler/` exclude),
  `plugins/vwf/skills/readme/SKILL.md:75` [U6];
  `site/src/content/docs/how-to/operate/choosing-your-stack.md:118`,
  `site/src/content/docs/plugins/stackgen.md:237-242,732-733,927,1274` (`:1222`,
  `:1373` are history — stay), `site/src/content/docs/plugins/vwf.md:965`,
  `.claude/skills/stackgen-plugin/SKILL.md:227,230`,
  `.claude/skills/vwf-plugin/references/skills-and-agents.md:27` [U8]. Deleting
  the pack breaks **no test**: `scripts/src/tool-config-mise.test.ts` and
  `check.test.ts:871` use `doppler` only as a made-up name; `check.ts:2111`
  keeps `"doppler"` in `TOOL_TOKENS` (a vwf no-tech guard). `readme.md`,
  `CLAUDE.md`, `installer/src` have no hits.
- **Bundles that pin a pack this plan edits** — U9 finds them by grepping
  `SG/stacks/bundles/*.md` for each edited pack's `<type>/<slug>@` pin.
- **Gates.** `mise tasks`:
  `p:plugins:{check,inventory,marketplace,shellcheck,npm-normalize-test,local,release}`,
  `p:site:{check,build,version,release}`, `code:{precommit,format,lint,sec}`.
  `plugins/**/*.md` is not dprint-formatted — match the fold width by hand. The
  `plugins-inventory` pre-commit hook runs `p:plugins:inventory --check`.
- **Commit types** (`.config/git-conventional-commits.yaml`): `ops`, `docs`,
  `merge`, `feat`, `fix`, `refactor`; no scopes.
- **Versions at planning time.** stackgen `3.0.0` (tag `stackgen-v2.0.0`), vwf
  `20.1.0` (tag `vwf-v20.0.1`), site `1.1.50` (tag `site-v1.1.49`).
- **Backlog.** No open item covers this request (read 2026-10-02).

## Assumed decisions — confirm or override at review

| #   | Decision          | Ruling                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | Rejected                                                                                                                               | Unit   |
| --- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| D1  | Scope of fnox     | fnox manages secrets for the development environment only. The OS keychain is the default provider; any single secret may instead reference a fnox-supported cloud store (mixed per secret). No encrypted secret ever enters a repo: no age, no KMS, no committed ciphertext.                                                                                                                                                                                                                         | Keychain only; asked once per repo at setup; following the product's cloud pick                                                        | U1, U2 |
| D2  | Profiles          | `fnox.toml` declares two profiles: `[profiles.development.secrets]` holds every dev secret, `[profiles.ci.secrets]` is empty on purpose, and the top-level `[secrets]` is empty on purpose because every profile inherits it. No `staging` or `production` profile. The pack asks tool-config for `FNOX_PROFILE` on `env: all` with the value `{% if get_env(name='CI', default='') != '' %}ci{% else %}development{% endif %}`.                                                                      | Dev secrets at the top level plus `FNOX_NO_DEFAULTS` in CI (fails open); keeping all four profiles; skipping fnox in CI by a condition | U2     |
| D3  | Task shape        | Every task that needs secrets runs `fnox exec -- <cmd>` unconditionally; no per-task CI condition. In CI the empty `ci` profile resolves nothing and the forge's variables pass through.                                                                                                                                                                                                                                                                                                              | Wrapping only at the developer's prompt; the experimental mise-env-fnox plugin                                                         | U2     |
| D4  | Environments      | Staging and production never run mise or fnox — their secrets come from the cloud provider. CI's secrets come from the forge (GitHub or GitLab). The contract states this as the development manager's named gap.                                                                                                                                                                                                                                                                                     | fnox serving CI or deployed environments                                                                                               | U1, U2 |
| D5  | No guard          | Delete `hooks/fnox-ciphertext-guard.sh` and the four-condition doctrine (gitleaks path allowlist, mempalace exclude of `fnox.toml`, `.gitignore` age lines). Doctrine only — the skill states the rule; gitleaks still catches a plaintext value.                                                                                                                                                                                                                                                     | A provider-type guard hook; folding the check into an existing gate                                                                    | U2     |
| D6  | setup:secrets     | The task lists the development profile's declared secrets that are missing, and prompts for each with hidden input via `fnox set NAME`. It tests presence by exit status only — `FNOX_IF_MISSING=error FNOX_PROFILE=development fnox get NAME` with stdout and stderr discarded — or a dedicated check command if Context7 shows one. It never prints a value. Cloud-referenced secrets are reported, never prompted.                                                                                 | Report missing only; doctrine only                                                                                                     | U2     |
| D7  | Contract-wide     | stackgen's secrets contract loses the encrypt-into-git allowance and states the environment split (D4); every provider pack is held to it.                                                                                                                                                                                                                                                                                                                                                            | fnox only, contract keeps the allowance                                                                                                | U1     |
| D8  | Cleanup rule      | `stackgen-sync` gains a general rule: a path a component no longer ships that is still present **and** whose hash still matches the lock record is offered for removal on consent; a modified one is reported only. Plus a one-off fnox detector in the same pass: it shows the old `fnox-ciphertext` pre-commit entry and the gitleaks allowlist naming `fnox.toml` and removes each on consent, and flags — never edits — a non-empty top-level `[secrets]` or any age/KMS provider in `fnox.toml`. | A one-off step in vwf init only; detect-and-warn in setup:secrets                                                                      | U5     |
| D9  | Reshape offers    | `/vwf:setup reshape` (init's existing-repo pass) offers to run `/stackgen:stackgen-sync` once stackgen components are materialized, on the same consent as the rest of the plan; it never runs it silently.                                                                                                                                                                                                                                                                                           | Sync only, on the user's clock                                                                                                         | U6     |
| D10 | Doppler           | Delete the `capability-provider/doppler` pack and `bundles/doppler.md`, and every passage naming it as a live option. Repos that already materialized it are left untouched — no migration.                                                                                                                                                                                                                                                                                                           | Re-materialize removes it                                                                                                              | U3, U8 |
| D11 | vwf templates     | vwf's `environment.md` template and example stop saying "store it in the secrets manager for each environment (dev/staging/prod)": development values live in the development secrets manager, CI's in the forge, staging and production in the cloud provider's store.                                                                                                                                                                                                                               | Leaving vwf untouched                                                                                                                  | U6     |
| D12 | Review            | One `Kind: review` row (U7) covers U2, which lands runnable shell — `config/.config/mise/tasks/setup/secrets`.                                                                                                                                                                                                                                                                                                                                                                                        | No review row                                                                                                                          | U7     |
| D13 | Pack bumps        | fnox `1.2.1 → 2.0.0` (major: a mode removed). Patch bumps: `cloud-service/secrets-store`, `cloud-provider/cloudflare`, `cloud-service/images`, `cloud-service/email-service`, `app-framework/flutter`. Every bundle pin to them follows, and `inventory.md` is regenerated, in one commit. No plugin or site version bump.                                                                                                                                                                            | Bumping stackgen again                                                                                                                 | U9     |
| D14 | Inventory mid-run | `SG/stacks/inventory.md` is generated. A wave-1 commit whose diff stales it (U2's summary, U3's deletion) has the orchestrator run `mise run p:plugins:inventory` and stage the result in that same commit, because the `plugins-inventory` pre-commit hook refuses it otherwise. No unit edits it by hand.                                                                                                                                                                                           | Deferring every inventory change to U9 (wave-1 commits would fail pre-commit)                                                          | —      |
| D15 | Decisions doc     | Both reversals are recorded as `docs/memory/decisions/2026-10-02-fnox-development-only.md`; the 2026-09-06 decision doc gains one "superseded in part by" line.                                                                                                                                                                                                                                                                                                                                       | Two decisions docs                                                                                                                     | U8     |
| D16 | One plan          | The fnox/contract rework and the Doppler removal are one plan: they rewrite the same passages.                                                                                                                                                                                                                                                                                                                                                                                                        | Two chained plans                                                                                                                      | —      |

## New dependencies

none

## Units

| Id | Wave | Unit file                                    | Kind   | Owns                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Depends on             | Status  | Commit |
| -- | ---- | -------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ------- | ------ |
| U1 | 1    | [01-contract.md](01-contract.md)             | edit   | `plugins/stackgen/assets/contracts/secrets.md`, `plugins/stackgen/stacks/readme.md`, `plugins/stackgen/skills/tool-config/references/gitleaks.md`                                                                                                                                                                                                                                                                                                                                     | —                      | pending |        |
| U2 | 1    | [02-fnox.md](02-fnox.md)                     | edit   | `plugins/stackgen/stacks/capability-provider/fnox/**` except the `version:` line of `pack.yaml`, `plugins/stackgen/stacks/bundles/fnox.md` except its `components:` pin                                                                                                                                                                                                                                                                                                               | —                      | pending |        |
| U3 | 1    | [03-doppler.md](03-doppler.md)               | edit   | `plugins/stackgen/stacks/capability-provider/doppler/**` (deleted), `plugins/stackgen/stacks/bundles/doppler.md` (deleted), `plugins/stackgen/skills/tool-config/references/git.md`, `plugins/stackgen/stacks/app-framework/flutter/skills/flutter/references/testing.md`                                                                                                                                                                                                             | —                      | pending |        |
| U4 | 1    | [04-cloudflare.md](04-cloudflare.md)         | edit   | `plugins/stackgen/stacks/cloud-provider/cloudflare/conventions.md`, `plugins/stackgen/stacks/cloud-service/secrets-store/**` except the `version:` line of `pack.yaml`, `plugins/stackgen/stacks/cloud-service/images/skills/cloudflare-images/references/identity-shape.md`, `plugins/stackgen/stacks/cloud-service/email-service/skills/cloudflare-email/references/identity-shape.md`, `plugins/stackgen/stacks/bundles/cloudflare-secrets-store.md` except its `components:` pins | —                      | pending |        |
| U5 | 1    | [05-sync.md](05-sync.md)                     | edit   | `plugins/stackgen/skills/stackgen-sync/SKILL.md`, `plugins/stackgen/assets/output-tree.md`                                                                                                                                                                                                                                                                                                                                                                                            | —                      | pending |        |
| U6 | 1    | [06-vwf.md](06-vwf.md)                       | edit   | `plugins/vwf/skills/init/SKILL.md`, `plugins/vwf/skills/init/references/existing-repo.md`, `plugins/vwf/assets/templates/environment.md`, `plugins/vwf/assets/templates/conventions.md`, `plugins/vwf/assets/examples/blueprint/environment.md`, `plugins/vwf/assets/memory.md`, `plugins/vwf/skills/readme/SKILL.md`                                                                                                                                                                 | —                      | pending |        |
| U7 | 2    | [07-review.md](07-review.md)                 | review | —                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | U2                     | pending |        |
| U8 | 3    | [08-docs.md](08-docs.md)                     | edit   | `readme.md`, `CLAUDE.md`, `.claude/docs/**`, `.claude/skills/{vwf-plugin,stackgen-plugin}/**`, `site/src/content/docs/**`, `docs/memory/decisions/2026-10-02-fnox-development-only.md`, `docs/memory/decisions/2026-09-06-secrets-store-is-runtime-not-development.md`                                                                                                                                                                                                                | U1, U3, U4, U5, U6, U7 | pending |        |
| U9 | 4    | [09-gates-and-bump.md](09-gates-and-bump.md) | edit   | the `version:` lines of the six packs D13 names, every bundle `components:` pin to them, `plugins/stackgen/stacks/inventory.md` (regenerated)                                                                                                                                                                                                                                                                                                                                         | U8                     | pending |        |

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

- **Wave 1 — U1–U6.** Six disjoint path sets: the contract and stacks readme
  (U1), the fnox pack (U2), the Doppler deletion plus two one-line example edits
  (U3), the Cloudflare packs (U4), stackgen-sync and the output tree (U5), vwf
  (U6). They share only names fixed by the rulings — the profile names
  `development` and `ci`, the variable `FNOX_PROFILE`, the hook id
  `fnox-ciphertext`, the decisions doc path — quoted verbatim in each unit.
- **Wave 2 — U7**, the review row over U2's commit.
- **Wave 3 — U8**, docs. **Wave 4 — U9**, gates and pack bumps.

## Wave gate

Every line runs with `MISE_ENV=dev` exported:

- `mise run p:plugins:marketplace -- --check`
- `mise run p:plugins:inventory -- --check`
- `mise run p:plugins:check`
- `mise run p:plugins:shellcheck`
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

/vwf:execute docs/plans/2026-10-02-fnox-dev-only

or let the queue pick it, by priority:

/vwf:execute next
