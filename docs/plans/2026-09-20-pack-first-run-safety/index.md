---
type: vwf-change-plan
title: pack first-run safety — no task clobbers host state; git-config
  requires a forge identity
requires: []
backlog: [ B28 ]
---

# Plan — pack first-run safety (2026-09-20)

## Status

**RUNNING**

RUNNING since 2026-09-20T23:45 in .worktrees/2026-09-20-pack-first-run-safety

## Consent

| Action                                            | Granted                                                                                                                                          |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Merge to the integration branch and push on green | yes                                                                                                                                              |
| After landing: `mise run p:plugins:local`         | run                                                                                                                                              |
| Release stackgen publicly                         | minor — `1.21.0` → `1.22.0`, a hand edit of `plugins/stackgen/.claude-plugin/plugin.json` then `mise run p:plugins:marketplace`; no release step |
| Release vwf publicly                              | none — untouched                                                                                                                                 |
| Release site publicly                             | patch — `1.1.33` → `1.1.34` via `mise run p:site:version`; no release step                                                                       |
| Release installer publicly                        | none — untouched                                                                                                                                 |

**The mode recorded here is the consent.** A `run` step runs on a green landing
without a prompt; an `ask` step stops the run once before it, reports what it
would do, and waits. The mode is the interview's answer (item 17), and a release
step recorded `run` is authorised by the interview's release question (item 18)
— a release recorded `ask`, or with no step at all, is intent, not
authorisation. Where a step stages something this session already loaded, it is
picked up only by a **restarted** session.

## Goal

After this lands, no task the mise pack ships destroys host state it did not
create: `setup:all` on any clone rewrites nothing outside the files the packs
own; `setup:precommit` refuses to unset a foreign `core.hooksPath` or overwrite
husky/lefthook hooks unless told `--force`; `pre-commit autoupdate`,
`mise upgrade --local` and `dprint config update` run only behind `--update` /
`--upgrade`; the shipped `check-json` hook no longer fails on the JSONC editor
files init composes; `code:sec` no longer reads a gitignored `.env`; and grype
gets the baseline step gitleaks already documents. `code:git-config` inverts: it
**requires** a per-repo identity and signing setup, equal to forge-scoped
environment variables, and its `--fix` sets them rather than deleting them.

Backlog item B28, piece D2, plan 1 of 5 — planned from
`docs/memory/problems/2026-09-20-init-shape-audit.md` (findings L1, L2, L3, L4,
L6, L15, L16; candidates 17 and 18, and the part of 16 that is a baseline step).
Plans 2–5 (`init-mode-seam`, `init-brownfield-reads`, `branch-model`,
`pack-intent-rendering`) are planned after this one and chain behind it.

**Reversal, confirmed at the interview.** The mise pack's doctrine that
"identity and signing keys must live in GLOBAL git-config, never per-repo local"
(`…/tasks/code/git-config:15`; the hook description at
`…/pre-commit-config.yaml:45-48`) inverts: the identity is **per-repo, required,
and equal to** `<FORGE>_USER_NAME`, `<FORGE>_EMAIL`, `<FORGE>_SIGNING_KEY`,
where `<FORGE>` is `GITHUB` or `GITLAB` by the origin host and `GIT` for any
other host or no remote. The docs unit writes one decisions doc.

## Facts the survey established

Paths below: `T` =
`plugins/stackgen/stacks/toolchain-manager/mise/config/.config/mise/tasks`, `G`
= `plugins/stackgen/stacks/toolchain-gate`.

- **L3 / git-config.** `T/code/git-config`: FORBIDDEN regex at `:16` (the eight
  keys); `--fix` loops `:20-27` running `git config --local --unset` per key
  (`:25`), no prompt; check mode prints and exits 1 (`:29-35`). The pre-commit
  pack wires it at `G/pre-commit/config/.config/pre-commit-config.yaml:43-52`:
  `entry: mise x -- mise run code:git-config --fix` (`:49`), `always_run: true`
  (`:52`). This repo's own `.config/pre-commit-config.yaml:43-52` is the same
  entry.
- **L4 / L6 / setup:precommit.** `T/setup/precommit:29`
  `git config --local --unset-all core.hooksPath || true`; `:30`
  `pre-commit install --config … --install-hooks --overwrite`; `:19`
  `pre-commit autoupdate --config "${CONFIG}"` (rewrites `rev:` lines in a
  lockfile-recorded file). No mention of husky or lefthook anywhere in
  `plugins/`.
- **L16 / L6 / setup:mise.** `T/setup/mise:22` `mise upgrade --local || true`
  (nine `latest` pins at `…/mise/config/.config/mise.dev.toml:22-30`); `:44`
  `dprint config update --config .config/dprint.json` (guarded `:35-49`;
  rewrites plugin URLs in a lockfile-recorded file). `T/setup/ai:187`
  `graphify hook install` (block `:180-195`) — parked to plan 3.
- **L1 / check-json.**
  `G/pre-commit/config/.config/pre-commit-config.yaml:132-135` has no `exclude`
  (only the global `^graphify-out/` at `:39`); this repo's own file carries
  `exclude: (^|/)tsconfig[^/]*\.json$|^\.vscode/` at `:199` with the JSONC
  comment at `:195-198`.
- **L2 / code:sec.** `T/code/sec`: `--staged` branch `:37-48`
  (`gitleaks git --staged --config .config/gitleaks.toml --redact=50`, `:41`);
  full branch `:52-65` (`gitleaks dir . …`, `:58`; the comment at `:54-56` says
  why a file list cannot narrow it).
  `G/gitleaks/config/.config/gitleaks.toml:27-31` states `dir` mode does not
  honour `.gitignore`; the allowlist at `:42-49` is `build/`, `dist/`,
  `graphify-out/`, `node_modules/`, `target/` — no `.env`. Grype call at
  `T/code/sec:70` (`:72` fallback):
  `grype "dir:${MISE_PROJECT_ROOT}" --config … --fail-on medium`.
- **L15 / grype.** `G/grype/config/.config/grype.yaml:15`
  `fail-on-severity: medium`, `:36` `ignore: []`. The gitleaks baseline passage
  is `G/gitleaks/conventions.md:53-56` ("Establishing a baseline on an existing
  repo"); grype's `conventions.md:34-35` and `skills/…/SKILL.md:34,
  55-64`
  document the threshold and no baseline step.
- **L8 / code:format.** `T/code/format:69` `shfmt -w -i 2 -ci`, `:73` the `-d`
  form; scope from `shell_files_in_scope` (`T/_scripts/helpers` ~`:131`, every
  tracked shell file by shebang). Parked to plan 3 (a consent row in init's
  survey), not changed here.
- **Docs that describe today's behaviour** (every one owned by U4 or U6):
  `…/mise/skills/mise/references/task-library.md:148` (setup:mise), `:153`
  (setup:precommit: autoupdate, unset hooksPath, install), `:162`
  (code:git-config), `:168`, `:263`, `:267`; `G/pre-commit/skills/…/SKILL.md:30`
  (setup:precommit = autoupdate + install), `:42-45` (clears `core.hooksPath`),
  `:157` (autoupdate moves `rev`); `G/grype/skills/…/SKILL.md:34, 55, 58, 64`
  and `conventions.md:34-35`; `G/dprint/skills/…/SKILL.md:100-105`
  (`dprint
  config update` from setup:mise);
  `site/src/content/docs/plugins/stackgen.md:727,
  730` (task list; git-config
  wired into hooks), `:765` (setup:all calls setup:mise). No hit for
  `--overwrite`, `mise upgrade`, husky or lefthook in
  `.claude/skills/stackgen-plugin/**`, `readme.md` or `CLAUDE.md`.
- **Versions and pins.** mise `pack.yaml:6` = `1.2.3` ↔ `bundles/mise.md:7`;
  pre-commit `pack.yaml:5` = `1.1.1` ↔ `bundles/repo-gates.md:10`; gitleaks
  `1.1.0` ↔ `:8`; grype `1.0.0` ↔ `:9`; dprint `1.0.1` ↔ `:7` (untouched).
  `inventory.md` rows: dprint `:96`, gitleaks `:98`, grype `:99`, pre-commit
  `:100`, mise `:103`, bundle row `:152`. The generator refuses a pin the pack
  no longer carries — every pack bump, its pin and the regenerated inventory
  land in **one commit** (U7).
- **Gates over task scripts.** No behavioural test harness; `p:plugins:check`
  asserts exec bit and shebang only (`scripts/src/check.ts:269, 295, 390-395`);
  `p:plugins:shellcheck` runs `shellcheck -x` and `shfmt -d -i 2 -ci` over the
  task libraries (`.config/mise/tasks/p/plugins/shellcheck:76-77, 127, 133`),
  wired as the `plugins-shellcheck` hook
  (`.config/pre-commit-config.yaml:146-151`) and in CI
  (`.github/workflows/plugins.yml:65-67`); `p:plugins:npm-normalize-test`
  table-tests the npm hook. `plugins/*/stacks/*/*/config/` is **payload** —
  excluded from every formatter; shell inside it is formatted by
  `p:plugins:shellcheck`'s shfmt only.
- This repo runs the same task library from its own `.config/mise/tasks/`; those
  copies are **not** in scope — they follow at the next `/vwf:setup reshape`,
  and until then this repo's hook still runs the old `--fix`.
- Versions: stackgen `1.21.0`, vwf `19.38.0` (untouched), site `1.1.33`. Commit
  types `ops docs merge feat fix refactor`, no scopes. Plan index holds no row →
  priority 10.

## Assumed decisions — confirm or override at review

| # | Decision               | Ruling                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Rejected                                                                                                      | Unit       |
| - | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ---------- |
| 1 | Posture                | A pack task **never clobbers foreign state**: it never unsets, overwrites or upgrades anything it did not create; where it would have to, it stops, names what it found, and prints the one by-hand command. Every destructive step sits behind an explicit flag the user passes on purpose, and `setup:all` passes none of them                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | a prompt inside the task (hooks and CI have nobody to answer); a warning at init only (later clones get none) | U1, U4     |
| 2 | git-config contract    | Required local state: `user.name` = `<FORGE>_USER_NAME`, `user.email` = `<FORGE>_EMAIL`, `user.signingkey` = `<FORGE>_SIGNING_KEY` (**equality**, not presence); `commit.gpgsign` and `tag.gpgsign` = `true`; `gpg.format` = `ssh`; `gpg.program` and `gpg.ssh.program` **absent**. `<FORGE>` is `GITHUB` when the origin host is `github.com`, `GITLAB` when `gitlab.com`, `GIT` for any other host or no remote. Check mode lists each failing key with expected vs actual and the variable to export, exit 1. `--fix` writes the identity keys from the variables (fails naming any unset one, writes nothing partial), sets the two booleans and `gpg.format`, unsets the two `gpg.*program` keys. The hook keeps `--fix` — it is now constructive except for the two unsets, which are the rule itself | check-only with an opt-in forbidden list; drop the hook; presence-only; no fallback prefix                    | U1, U2, U4 |
| 3 | precommit / mise flags | `setup:precommit`: before anything, read `git config --local core.hooksPath`, test `.husky/`, `lefthook.yml`, `.lefthook.yml`; any present → print what was found and the two by-hand lines (`git config --local --unset-all core.hooksPath`; `pre-commit install … --overwrite`) and exit 1; a new `--force` flag does today's `:29-30`. `pre-commit autoupdate` (`:19`) runs only under a new `--update` flag. `setup:mise`: `mise upgrade --local` (`:22`) and `dprint config update` (`:44`) run only under a new `--upgrade` flag. `setup:all` passes neither flag                                                                                                                                                                                                                                     | keep as is; a prompt                                                                                          | U1, U4     |
| 4 | check-json             | The pack's `check-json` hook gains `exclude: ^\.vscode/` — the two composed files are JSONC by design                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | strip the markers from the composed files                                                                     | U2         |
| 5 | gitleaks               | `gitleaks.toml`'s allowlist gains `^\.env$`, `^\.env\..*`, and `.venv/` beside `node_modules/`; `code:sec`'s full mode stays `dir` (the comment at `sec:54-56` stands)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | switch full mode to `gitleaks git`; make `dir` honour `.gitignore` (it cannot)                                | U3         |
| 6 | grype                  | `G/grype/conventions.md` and its skill gain an "Establishing a baseline on an existing repo" passage in the shape of gitleaks' (`gitleaks/conventions.md:53-56`): run the scan, copy each finding's vulnerability id into `ignore:` with a one-line reason; `code:sec` prints that remedy on a grype failure. The threshold stays `medium` — making it a value is plan 5                                                                                                                                                                                                                                                                                                                                                                                                                                    | threshold as a marked position now                                                                            | U1, U3     |
| 7 | Review row             | Shipped shell changes in four task scripts → one `Kind: review` row in wave 2 covering U1–U4                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | no row                                                                                                        | R5         |
| 8 | Pack bumps             | Every `pack.yaml` bump, its bundle pin and the inventory regeneration sit in **U7** so they land in one commit; wave-1 units change content only. mise `1.2.3` → `1.3.0`, pre-commit `1.1.1` → `1.1.2`, gitleaks `1.1.0` → `1.1.1`, grype `1.0.0` → `1.0.1`; dprint untouched                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | per-unit bumps (`inventory --check` fails mid-wave)                                                           | U7         |
| 9 | Vocabulary             | The flags are `--force` (precommit), `--update` (precommit autoupdate), `--upgrade` (mise upgrade + dprint config update), declared as `#USAGE flag` lines like `--fix`; the env-variable names are exactly `GITHUB_USER_NAME`, `GITHUB_EMAIL`, `GITHUB_SIGNING_KEY` and the `GITLAB_` / `GIT_` twins                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | `--yes`; `MISE_…` prefixes                                                                                    | U1, U4     |

## New dependencies

none

## Units

| Id | Wave | Unit file                                      | Kind   | Owns                                                                                                                                                                                                                                                                                                                   | Depends on     | Status  | Commit   |
| -- | ---- | ---------------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | ------- | -------- |
| U1 | 1    | [01-mise-tasks.md](01-mise-tasks.md)           | edit   | `plugins/stackgen/stacks/toolchain-manager/mise/config/.config/mise/tasks/code/git-config`, `…/tasks/setup/precommit`, `…/tasks/setup/mise`, `…/tasks/code/sec`                                                                                                                                                        | —              | green   | cf79749e |
| U2 | 1    | [02-pre-commit-pack.md](02-pre-commit-pack.md) | edit   | `plugins/stackgen/stacks/toolchain-gate/pre-commit/config/**`, `…/pre-commit/conventions.md`, `…/pre-commit/skills/**`                                                                                                                                                                                                 | —              | green   | fed432d2 |
| U3 | 1    | [03-gitleaks-grype.md](03-gitleaks-grype.md)   | edit   | `plugins/stackgen/stacks/toolchain-gate/gitleaks/config/**`, `…/gitleaks/conventions.md`, `…/gitleaks/skills/**`, `plugins/stackgen/stacks/toolchain-gate/grype/config/**`, `…/grype/conventions.md`, `…/grype/skills/**`                                                                                              | —              | green   | daf236b4 |
| U4 | 1    | [04-mise-skill.md](04-mise-skill.md)           | edit   | `plugins/stackgen/stacks/toolchain-manager/mise/skills/**`, `plugins/stackgen/stacks/toolchain-manager/mise/conventions.md`                                                                                                                                                                                            | —              | green   | b9f94721 |
| R5 | 2    | [05-review.md](05-review.md)                   | review | —                                                                                                                                                                                                                                                                                                                      | U1, U2, U3, U4 | pending |          |
| U6 | 3    | [06-docs.md](06-docs.md)                       | edit   | `readme.md`, `CLAUDE.md`, `.claude/docs/**`, `.claude/skills/stackgen-plugin/**`, `.claude/skills/vwf-plugin/**`, `site/src/content/docs/**`, `docs/memory/decisions/2026-09-20-pack-first-run-safety.md`, `plugins/stackgen/stacks/toolchain-gate/dprint/skills/**`                                                   | R5             | pending |          |
| U7 | 4    | [07-gates-and-bump.md](07-gates-and-bump.md)   | edit   | the five `pack.yaml` (mise, pre-commit, gitleaks, grype — dprint read only), `plugins/stackgen/stacks/bundles/mise.md`, `plugins/stackgen/stacks/bundles/repo-gates.md`, `plugins/stackgen/stacks/inventory.md`, `plugins/stackgen/.claude-plugin/plugin.json`, `site/package.json`, `.claude-plugin/marketplace.json` | U6             | pending |          |

Status is one of `pending`, `running`, `green`, `failed`, `unresolved`,
`skipped`. U1–U4, U6 and U7 are `edit`; R5 is the one `review` row — it runs
`/code-review` and `/security-review` plus the two reviewers over the branch
delta since the branch base, covers U1–U4 through its Depends on, and sits in a
wave strictly later than each of them.

## Shared-file rule

| File                                                                                                  | Why it collides                                          | Owner   |
| ----------------------------------------------------------------------------------------------------- | -------------------------------------------------------- | ------- |
| every `pack.yaml`, both bundle files, `inventory.md`                                                  | the generator refuses a pin without its pack; one commit | U7 only |
| `plugins/stackgen/.claude-plugin/plugin.json`, `site/package.json`, `.claude-plugin/marketplace.json` | version and generated files                              | U7 only |
| every human-facing doc — `readme.md`, `CLAUDE.md`, `.claude/**`, `site/**`, `docs/memory/**`          | n units editing one doc                                  | U6 only |
| `…/mise/skills/**` (task-library.md, SKILL.md, config-files.md)                                       | U1 would describe its flags; U4 owns the prose           | U4 only |
| `…/pre-commit/config/.config/pre-commit-config.yaml`                                                  | U1 would edit the git-config entry; U2 owns the file     | U2 only |
| `T/code/sec`                                                                                          | U3 would add the grype remedy; U1 owns the script        | U1 only |
| this repo's own `.config/mise/tasks/**`, `.config/pre-commit-config.yaml`                             | out of scope — a reshape's                               | —       |

## Waves

- **Wave 1** — U1, U2, U3, U4: four disjoint trees (the mise task scripts, the
  pre-commit pack, the gitleaks + grype packs, the mise skill prose); each
  carries its ruling and cites the others' files by path.
- **Wave 2** — R5: the review row over the wave-1 delta, first in its wave.
- **Wave 3** — U6: the docs over the branch delta, plus the decisions doc.
- **Wave 4** — U7: the pack bumps, pins, inventory, the two versions, the
  marketplace, the full gate.

## Wave gate

    mise run p:plugins:marketplace -- --check
    mise run p:plugins:inventory -- --check
    mise run p:plugins:check
    mise run p:plugins:shellcheck
    mise run p:plugins:npm-normalize-test
    mise run code:precommit
    mise run p:site:check

plus the wave review, plus every report read for `UNRESOLVED:`. Every line here
must be green before wave 1.

## After landing

| Step                       | Mode | Notes                                                                                                                                          |
| -------------------------- | ---- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `mise run p:plugins:local` | run  | stages stackgen at `1.22.0+N` into the dev marketplace and updates this machine's install; publishes nothing; a **restarted** session loads it |

## Gates the orchestrator keeps

none beyond the wave gate. The changed task scripts are proven on a real repo by
the user's next `/vwf:setup reshape` (this repo included), which is where the
by-hand refusals and the `GITHUB_*` variables are first exercised.

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

- This repo's own `.config/mise/tasks/**` and `.config/pre-commit-config.yaml` —
  pack copies that follow at the next `/vwf:setup reshape`; until then this
  repo's hook still runs the old `--fix`.
- `code:format --fix` reformatting a whole tree at the first commit (L8) and the
  graphify post-commit hook `setup:ai` installs (rest of L16) — plan 3 gives
  init's survey a consent row per first-run effect.
- The grype threshold, the `main`/`develop` literals and the exclusion sets as
  values (L13, L14, L15-threshold, L20) — plan 5.
- Any change to `init`, `setup` or `doctor` — plans 2–4.
- A public release — the bumps land; the tag waits for the next `/release`.

## Parked

- Plan 3 (`init-brownfield-reads`) owes the survey rows for L8 and the graphify
  hook, and the hash re-record after `--update` / `--upgrade` (candidate 10,
  L6/L7) — a user who passes those flags today still gets doctor drift on two
  files.
- Plan 4 (`branch-model`) may read the same `GITHUB_*` / `GITLAB_*` variables in
  init's git pass so the first commit already carries the identity — a precheck,
  not a second contract.
- B28 closes when plan 5 lands; `/vwf:execute`'s `done` at this landing may need
  the item moved back to `Backlog` by hand until then.

## Run log

| Wave | Unit               | Model | Round | Outcome     | Detail                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Commit   |
| ---- | ------------------ | ----- | ----- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| 0    | preflight          | —     | 1     | pass        | node preflight — tooling present (mise, graphify; graph in the main checkout); no .config/vwf.yaml, plan is edit-only so LSP and stack conventions n/a; all 7 wave-gate lines green on develop@b43a91ef; format check skipped (no covers:)                                                                                                                                                                                                                                               | —        |
| 1    | U3 gitleaks-grype  | opus  | 1     | pass        | node edit — 6 files; DECIDED: both gitleaks docs now enumerate the full allowlist (eight entries), new TOML entries sorted first rather than literally beside node_modules/; DOCS FALSIFIED none; GAP none                                                                                                                                                                                                                                                                               | daf236b4 |
| 1    | U4 mise-skill      | opus  | 1     | pass        | node edit — 3 files (task-library.md, SKILL.md, conventions.md); DECIDED: config-files.md untouched (restates none); variable names once per file; DOCS FALSIFIED: dprint SKILL.md:100-105 (→ U6), task-library.md:441-444 'three hooks and no fourth' pre-existing, left as is; GAP none                                                                                                                                                                                                | —        |
| 1    | U2 pre-commit-pack | opus  | 1     | pass        | node edit — 3 files (pre-commit-config.yaml, SKILL.md, conventions.md); DECIDED: hook description names variable prefixes not all nine names; by-hand lines in prose not wrapped code spans; DOCS FALSIFIED none beyond U4/U6's; GAP none                                                                                                                                                                                                                                                | —        |
| 1    | U1 mise-tasks      | opus  | 1     | pass        | node edit — 4 scripts (git-config rewritten to decision 2; precommit --force/--update with foreign-hook refusal; mise --upgrade; sec grype remedy); DECIDED: origin host parsed exact-match after stripping scheme/user; check output lists export lines per unset var; tested under bash 3.2 in a temp repo; DOCS FALSIFIED: task-library.md, pre-commit SKILL.md + hook description, grype docs, dprint SKILL.md:100-105, stackgen.md:727,730,765 (all owned by U2/U3/U4/U6); GAP none | —        |
| 1    | R1                 | opus  | 1     | findings(3) | CONTRACT clean, RULINGS clean; mise/conventions.md:101-102 [U4] 81-col lines; pre-commit/conventions.md:25 [U2] 'never a global one' overstates decision 2; code/git-config:15 [U1] rule comment two lines not one                                                                                                                                                                                                                                                                       | —        |
| 1    | U2 pre-commit-pack | opus  | 2     | pass        | node edit — R1 fix: conventions.md:25 drops 'never a global one'                                                                                                                                                                                                                                                                                                                                                                                                                         | fed432d2 |
| 1    | U4 mise-skill      | opus  | 2     | pass        | node edit — R1 fix: conventions.md:101-103 refolded to 80 cols                                                                                                                                                                                                                                                                                                                                                                                                                           | b9f94721 |
| 1    | U1 mise-tasks      | opus  | 2     | pass        | node edit — R1 fix: git-config:15 rule comment one line (88 cols, keeps the variable literals the plan's grep expects); shellcheck green                                                                                                                                                                                                                                                                                                                                                 | cf79749e |
| 1    | R1                 | opus  | 2     | pass        | CONTRACT clean, RULINGS clean; all three round-1 items landed                                                                                                                                                                                                                                                                                                                                                                                                                            | —        |

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the fresh session's worktree — cut from the integration branch — can see it.

Run in a fresh session:

/vwf:execute docs/plans/2026-09-20-pack-first-run-safety

or let the queue pick it, by priority:

/vwf:execute next
