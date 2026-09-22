---
type: vwf-change-plan
title: pack first-run safety — no task clobbers host state; git-config
  requires a forge identity
requires: []
backlog: [ B28 ]
---

# Plan — pack first-run safety (2026-09-20)

## Status

**COMPLETE**

COMPLETE 2026-09-21 — cf79749e fed432d2 daf236b4 b9f94721 1ea753f4 b869b325
fa905d2e 245abc3a af3a4744 75103af5 74665080 5790538a 673d0fe0 e8d999c2 99aaf8e8
9298abd1 62f3b735; folder left live — 11 gaps open (none blocking), see Gaps
surfaced during execution; backlog B28 not closed here (plan 5 finishes it, per
Parked)

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

| Id | Wave | Unit file                                      | Kind   | Owns                                                                                                                                                                                                                                                                                                                   | Depends on     | Status | Commit   |
| -- | ---- | ---------------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | ------ | -------- |
| U1 | 1    | [01-mise-tasks.md](01-mise-tasks.md)           | edit   | `plugins/stackgen/stacks/toolchain-manager/mise/config/.config/mise/tasks/code/git-config`, `…/tasks/setup/precommit`, `…/tasks/setup/mise`, `…/tasks/code/sec`                                                                                                                                                        | —              | green  | cf79749e |
| U2 | 1    | [02-pre-commit-pack.md](02-pre-commit-pack.md) | edit   | `plugins/stackgen/stacks/toolchain-gate/pre-commit/config/**`, `…/pre-commit/conventions.md`, `…/pre-commit/skills/**`                                                                                                                                                                                                 | —              | green  | fed432d2 |
| U3 | 1    | [03-gitleaks-grype.md](03-gitleaks-grype.md)   | edit   | `plugins/stackgen/stacks/toolchain-gate/gitleaks/config/**`, `…/gitleaks/conventions.md`, `…/gitleaks/skills/**`, `plugins/stackgen/stacks/toolchain-gate/grype/config/**`, `…/grype/conventions.md`, `…/grype/skills/**`                                                                                              | —              | green  | daf236b4 |
| U4 | 1    | [04-mise-skill.md](04-mise-skill.md)           | edit   | `plugins/stackgen/stacks/toolchain-manager/mise/skills/**`, `plugins/stackgen/stacks/toolchain-manager/mise/conventions.md`                                                                                                                                                                                            | —              | green  | b9f94721 |
| R5 | 2    | [05-review.md](05-review.md)                   | review | —                                                                                                                                                                                                                                                                                                                      | U1, U2, U3, U4 | green  |          |
| U6 | 3    | [06-docs.md](06-docs.md)                       | edit   | `readme.md`, `CLAUDE.md`, `.claude/docs/**`, `.claude/skills/stackgen-plugin/**`, `.claude/skills/vwf-plugin/**`, `site/src/content/docs/**`, `docs/memory/decisions/2026-09-20-pack-first-run-safety.md`, `plugins/stackgen/stacks/toolchain-gate/dprint/skills/**`                                                   | R5             | green  | 9298abd1 |
| U7 | 4    | [07-gates-and-bump.md](07-gates-and-bump.md)   | edit   | the five `pack.yaml` (mise, pre-commit, gitleaks, grype — dprint read only), `plugins/stackgen/stacks/bundles/mise.md`, `plugins/stackgen/stacks/bundles/repo-gates.md`, `plugins/stackgen/stacks/inventory.md`, `plugins/stackgen/.claude-plugin/plugin.json`, `site/package.json`, `.claude-plugin/marketplace.json` | U6             | green  | 62f3b735 |

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

## Gaps surfaced during execution

Every row below came from the R5 review row's loop, which ended at the cap (four
rounds). The diagnosis at a cap is that the plan was not thorough enough — each
item is a case a ruling did not foresee, not a code finding the loop failed to
settle. None blocks the landing.

| #  | Where                                                                          | Gap                                                                                                                                                                                                                                       | Assumption taken                                                                                                                                                                         | Exit |
| -- | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| 1  | decision 5, `gitleaks.toml`                                                    | the `.env` allowlist as ruled is mode-wide in gitleaks, so it also blinded the staged gate (security High, round 1)                                                                                                                       | the exemption lives in `code:sec`'s run-time overlay for the `dir` scan only; the shared toml stays strict — a departure from the ruling's wording that keeps its aim (fixed in round 2) | fix  |
| 2  | decision 3, `setup/all`                                                        | ruling 3's refusal exits 1, and `setup/all` runs `setup:precommit` under `set -e`, so a brownfield clone with a foreign hook manager never reaches `setup:ai` or `setup:vscode`; the file's header says "never error" and no unit owns it | left as ruled; the by-hand cleanup the refusal prints makes the next run converge. A tolerant call site or a header edit needs an Owns — plan 3's survey is the natural home             | cap  |
| 3  | U2 `pre-commit/skills/pre-commit/SKILL.md:81`, U4 `mise/…/task-library.md:190` | both say a bare `ssh-ed25519 …` signing key "fails inside git"; git treats a raw `ssh-` key as `key::` (deprecated, works) — the failing case is a non-`ssh-` type without `key::`                                                        | text stands as written at the cap; a one-sentence correction                                                                                                                             | cap  |
| 4  | U1 `code/git-config:117`                                                       | a multi-valued local key (two `user.email` lines) makes `git config --local` exit 5 mid-loop with no remedy, blocking every commit until `.git/config` is hand-edited                                                                     | `--replace-all` is the one-token fix; not applied at the cap                                                                                                                             | cap  |
| 5  | U1 `code/git-config:36`                                                        | the host match is case-sensitive; `https://GitHub.com/…` resolves to `GIT`                                                                                                                                                                | lowercase-fold before the match; not applied at the cap                                                                                                                                  | cap  |
| 6  | U1 `code/git-config:133`                                                       | under `pre-commit run --all-files` (the merge safety net) the exit 1 after a correction reads as "failed without changing anything"; the second run passes                                                                                | widen the message to "re-run the command"; not applied at the cap                                                                                                                        | cap  |
| 7  | decision 2, the hook                                                           | the hook now depends on three exported variables; a GUI git client that does not source the shell profile is refused with "Cannot fix — unset: …"                                                                                         | as ruled; the docs unit may name mise's global `[env]` block as the place to set them so `mise x` carries them into hooks                                                                | cap  |
| 8  | decision 2, `code/git-config:34-35`                                            | the FORGE match accepts `github.com` and any subdomain of it (`ssh.github.com` is GitHub's port-443 SSH host), and the same for gitlab; decision 2 says the exact host                                                                    | the subdomain match stands — a subdomain of the forge is the forge; the docs state it. Ruled by the orchestrator at R5 round 1                                                           | fix  |
| 9  | decision 2, `code/git-config:16-38`                                            | a repo with no `origin` resolves to `GIT_*` and flips to `GITHUB_*`/`GITLAB_*` the moment the remote is added, so init's new-repo path demands `GIT_*` between hook wiring and the push, then refuses once after it                       | as ruled (GIT for no remote); plan 4 reads the variables in init's git pass and can add the remote before the first commit                                                               | late |
| 10 | `code/sec:91-100`                                                              | grype exits 1 for findings and for a scanner error alike, so the `ignore:` remedy prints on an offline DB refresh too                                                                                                                     | accepted — grype's own error precedes the remedy and no exit-code split is reliable                                                                                                      | late |
| 11 | `plugins/vwf/skills/init/references/existing-repo.md:901`                      | init commits the gate configuration through the live hook, which now refuses once and fails outright when the three forge variables are unset — and init never asks for them; no unit owns `plugins/vwf`                                  | plan 4 (parked there already); the docs unit states the interim rule in the decisions doc: export the three variables before a reshape and expect one refused-then-rerun commit          | late |

## Run log

| Wave | Unit               | Model | Round | Outcome     | Detail                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Commit   |
| ---- | ------------------ | ----- | ----- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| 0    | preflight          | —     | 1     | pass        | node preflight — tooling present (mise, graphify; graph in the main checkout); no .config/vwf.yaml, plan is edit-only so LSP and stack conventions n/a; all 7 wave-gate lines green on develop@b43a91ef; format check skipped (no covers:)                                                                                                                                                                                                                                                                                                                                                                                                        | —        |
| 1    | U3 gitleaks-grype  | opus  | 1     | pass        | node edit — 6 files; DECIDED: both gitleaks docs now enumerate the full allowlist (eight entries), new TOML entries sorted first rather than literally beside node_modules/; DOCS FALSIFIED none; GAP none                                                                                                                                                                                                                                                                                                                                                                                                                                        | daf236b4 |
| 1    | U4 mise-skill      | opus  | 1     | pass        | node edit — 3 files (task-library.md, SKILL.md, conventions.md); DECIDED: config-files.md untouched (restates none); variable names once per file; DOCS FALSIFIED: dprint SKILL.md:100-105 (→ U6), task-library.md:441-444 'three hooks and no fourth' pre-existing, left as is; GAP none                                                                                                                                                                                                                                                                                                                                                         | —        |
| 1    | U2 pre-commit-pack | opus  | 1     | pass        | node edit — 3 files (pre-commit-config.yaml, SKILL.md, conventions.md); DECIDED: hook description names variable prefixes not all nine names; by-hand lines in prose not wrapped code spans; DOCS FALSIFIED none beyond U4/U6's; GAP none                                                                                                                                                                                                                                                                                                                                                                                                         | —        |
| 1    | U1 mise-tasks      | opus  | 1     | pass        | node edit — 4 scripts (git-config rewritten to decision 2; precommit --force/--update with foreign-hook refusal; mise --upgrade; sec grype remedy); DECIDED: origin host parsed exact-match after stripping scheme/user; check output lists export lines per unset var; tested under bash 3.2 in a temp repo; DOCS FALSIFIED: task-library.md, pre-commit SKILL.md + hook description, grype docs, dprint SKILL.md:100-105, stackgen.md:727,730,765 (all owned by U2/U3/U4/U6); GAP none                                                                                                                                                          | —        |
| 1    | R1                 | opus  | 1     | findings(3) | CONTRACT clean, RULINGS clean; mise/conventions.md:101-102 [U4] 81-col lines; pre-commit/conventions.md:25 [U2] 'never a global one' overstates decision 2; code/git-config:15 [U1] rule comment two lines not one                                                                                                                                                                                                                                                                                                                                                                                                                                | —        |
| 1    | U2 pre-commit-pack | opus  | 2     | pass        | node edit — R1 fix: conventions.md:25 drops 'never a global one'                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | fed432d2 |
| 1    | U4 mise-skill      | opus  | 2     | pass        | node edit — R1 fix: conventions.md:101-103 refolded to 80 cols                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | b9f94721 |
| 1    | U1 mise-tasks      | opus  | 2     | pass        | node edit — R1 fix: git-config:15 rule comment one line (88 cols, keeps the variable literals the plan's grep expects); shellcheck green                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | cf79749e |
| 1    | R1                 | opus  | 2     | pass        | CONTRACT clean, RULINGS clean; all three round-1 items landed                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | —        |
| 2    | R5                 | opus  | 1     | findings(4) | node security — range b43a91ef..2767ab39, 16 files (U1 4, U2 3, U3 6, U4 3); engine: 1 High (gitleaks .env allowlist disarms the staged gate); reviewer: HIGH gitleaks.toml:47-48 [U3] same; LOW git-config:16-24 [U1] FORGE host spoofable via userinfo in URL; LOW git-config:96-98 [U1] positional value beginning with '-' read as an option, fix 'git config --local -- key value'; INFO hook keeps --fix (decision 2 accepts)                                                                                                                                                                                                               | —        |
| 2    | R5                 | opus  | 1     | findings(7) | node review — range b43a91ef..2767ab39; engine 5 findings (1 High, 2 Med, 2 Low); reviewer: MED precommit:71 [U1] plain path still --overwrite (clobbers a hand-written .git/hooks hook the probe cannot see); MED gitleaks.toml:47-48 [U3] .env allowlist disarms staged gate (= security HIGH); LOW gitleaks.toml:47-49 [U3] ^-anchored unlike siblings; LOW precommit:53 [U1] exit 1 aborts setup:all whole (ruled; → docs); LOW git-config:21 [U1] ssh.github.com → GIT; LOW sec:77 [U1] remedy names absent grype.yaml; INFO hook --fix one commit late (pre-existing). Merged loop-back: U1 then U3                                         | —        |
| 2    | U1 mise-tasks      | opus  | 3     | pass        | node edit — R5 fix: code:sec dir branch writes a mktemp overlay config (extends the base toml with a dot-env allowlist), --staged keeps the base config; precommit --overwrite only under --force (plain path chains a foreign hook as .legacy); git-config authority parse strips userinfo safely, github.com and gitlab.com subdomains accepted, a double dash before every key; grype remedy names grype.yaml only when present. Verified with gitleaks 8.30.1 in a temp repo. DECIDED: overlay uses the legacy allowlist table to match the base toml                                                                                         | 1ea753f4 |
| 2    | U3 gitleaks-grype  | opus  | 2     | pass        | node edit — R5 fix: both .env entries removed from gitleaks.toml, .venv rewritten in the siblings. unanchored form, dir-mode note says the full scan extends the file at run time; both gitleaks docs re-enumerate without .env and state the dir-only overlay. GAP (departure from decision 5 as written, forced by the security finding): the .env exemption lives in code:sec's dir overlay, not in gitleaks.toml                                                                                                                                                                                                                              | b869b325 |
| 2    | R5                 | opus  | 2     | pass        | node security — range b43a91ef..b869b325; engine clean, round-1 High verified closed empirically (staged .env still caught; overlay skips .env in dir mode only, base allowlist and rules preserved); round-1 items 1-3 closed; residual LOW [U3 docs]: full dir scan no longer surfaces an already-committed .env variant — one sentence for the gitleaks conventions; INFO stands                                                                                                                                                                                                                                                               | —        |
| 2    | R5                 | opus  | 2     | findings(4) | node review — range b43a91ef..b869b325; round-1 items 1,2,3,5,6 closed; open: MED precommit:32-36,53 [U1] --force does not converge (tracked .husky/lefthook stay foreign forever; pnpm prepare re-sets hooksPath); LOW precommit:28 [U1] probe reads --local only, a global hooksPath skips the refusal; LOW task-library.md:176 [U4] + pre-commit SKILL.md:56 [U2] SIGNING_KEY value format unstated; INFO dprint SKILL.md (U6's). Guard: 7→4, converging. Loop-back U1, U2, U3 (security residual), U4                                                                                                                                         | —        |
| 2    | U1 mise-tasks      | opus  | 4     | pass        | node edit — R5 round-2 fix: TAKEN_OVER = effective hooksPath empty and the installed pre-commit hook carries its own marker → husky/lefthook files not counted foreign; refusal names the by-hand cleanup (delete .husky or lefthook file, drop the husky prepare script; the task deletes nothing); probe reads the effective hooksPath, a global/system one is named and refused even under --force. DECIDED: --force refuses on a global hooksPath (decision 1 forbids editing global config). Verified in isolated temp repos                                                                                                                 | fa905d2e |
| 2    | U2 pre-commit-pack | opus  | 3     | pass        | node edit — R5 round-2 fix: SIGNING_KEY value sentence (key-file path or key:: literal); setup:precommit passages describe the landed refusal (effective hooksPath, global named and refused, by-hand cleanup, no re-refusal once owned) and the .legacy chaining on the plain path                                                                                                                                                                                                                                                                                                                                                               | 245abc3a |
| 2    | U3 gitleaks-grype  | opus  | 3     | pass        | node edit — R5 round-2 security residual: one sentence in conventions.md and SKILL.md — the full scan is not history coverage for .env files; a committed one is found by a by-hand gitleaks git run                                                                                                                                                                                                                                                                                                                                                                                                                                              | af3a4744 |
| 2    | U4 mise-skill      | opus  | 3     | pass        | node edit — R5 round-2 fix: SIGNING_KEY value sentence in the git-config paragraph; setup:precommit row and posture passages describe the landed refusal (effective hooksPath, global named and refused, by-hand cleanup, no re-refusal once owned, no --overwrite without --force)                                                                                                                                                                                                                                                                                                                                                               | 75103af5 |
| 2    | R5                 | opus  | 3     | pass        | node security — range b43a91ef..75103af5; engine clean; TAKEN_OVER depends only on untracked .git state; effective probe fails closed on local+global; round-2 residual landed (af3a4744); INFO stands (decision 2)                                                                                                                                                                                                                                                                                                                                                                                                                               | —        |
| 2    | R5                 | opus  | 3     | findings(4) | node review — range b43a91ef..75103af5; round-2 items 1-3 closed; open: MED git-config:97-113 [U1] hook --fix exits 0 after writing so the triggering commit lands with the old identity while task-library.md:192 and mise/conventions.md:114 [U4] claim first-commit correction — defect; LOW precommit:38-49 [U1] local+global hooksPath classified local; LOW precommit:54 [U1] lefthook .yaml/.toml/.json forms; LOW git-config:35-38 [U1] SSH aliases → GIT (ruling 2 literal — accepted, not fixed). Guard: raw count 4→4 but none resurfaced and defects 3→1 (three are ruling-consistent widenings); one more round taken, round 4 = cap | —        |
| 2    | U1 mise-tasks      | opus  | 5     | pass        | node edit — R5 round-3 fix: --fix writes only differing keys, exits 1 'identity corrected — re-run the commit' when anything changed; precommit probes --global/--system hooksPath (either set → global refusal regardless of local; a value from neither scope named with a --show-origin hint); lefthook probe widened to eight forms. Verified: first commit refused, second carries the identity                                                                                                                                                                                                                                              | 74665080 |
| 2    | U2 pre-commit-pack | opus  | 4     | pass        | node edit — R5 round-3 docs: hook description and SKILL/conventions say the changed-key commit is refused and the re-run carries it; lefthook forms; local+global hooksPath treated as global                                                                                                                                                                                                                                                                                                                                                                                                                                                     | 5790538a |
| 2    | U4 mise-skill      | opus  | 4     | pass        | node edit — R5 round-3 docs: git-config paragraph and identity principle say the first commit is refused while the identity is written; lefthook forms; global hooksPath beside a local one is global                                                                                                                                                                                                                                                                                                                                                                                                                                             | 673d0fe0 |
| 2    | R5                 | opus  | 4     | pass        | node security — range b43a91ef..673d0fe0 (cap); engine clean; 74665080 verified: no mismatch survives with CHANGED false, exit-1-on-change path correct, --system probe fails soft, worktree-scope hooksPath refused; round-1 High closed since round 2; INFO stands                                                                                                                                                                                                                                                                                                                                                                              | —        |
| 2    | R5                 | opus  | 4     | findings(6) | node review — range b43a91ef..673d0fe0 (cap); round-3 items 1-3 closed; engine 6 classified: defect-docs [U2 SKILL.md:81, U4 task-library.md:190] bare ssh- key works (deprecated), non-ssh- type without key:: is the failing case; defect [U1 git-config:117] multi-valued local key exits 5, --replace-all; widening [U1 git-config:36] lowercase host; document [U1 git-config:133] exit 1 under pre-commit run --all-files reads misleading; GAP unowned setup/all:33 header 'never error' now false; document [U6] GUI clients lack the env vars — name mise global [env]. Loop ended at the cap: all six recorded contested                | —        |
| 2    | R2                 | opus  | 1     | findings(3) | CONTRACT clean (11 paths); RULINGS: U1 departed from decision 2 — subdomain match (*.github.com) while every doc states the exact host; docs false: pre-commit SKILL.md:81 [U2] and task-library.md:189-191 [U4] bare ssh- key claim (gap 3). Orchestrator: the subdomain match stands as the round-1 ruling (ssh.github.com is GitHub's own host) — recorded as gap 8; U2/U4 docs re-dispatched to state it and correct the signing-key sentence                                                                                                                                                                                                 | —        |
| 2    | U2 pre-commit-pack | opus  | 5     | pass        | node edit — R2 fix: signing-key sentence corrected (bare ssh- works, deprecated; other types need key::); forge rule states the subdomain match                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | e8d999c2 |
| 2    | U4 mise-skill      | opus  | 5     | pass        | node edit — R2 fix: same signing-key correction; forge subdomain rule in task-library.md and SKILL.md                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | 99aaf8e8 |
| 2    | R2                 | opus  | 2     | pass        | CONTRACT clean, RULINGS clean; all four passages agree with the scripts; signing-key sentence true to git                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | —        |
| 2    | R5                 | opus  | 1     | pass        | node security — re-run 1 (R5-late1), range 673d0fe0..99aaf8e8 (docs only); engine clean; signing-key prose matches git's rules, subdomain rule states what the parser does                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | —        |
| 2    | R5                 | opus  | 1     | pass        | node review — re-run 1 (R5-late1), range 673d0fe0..99aaf8e8; in-range clean; engine 7 items: 4 already recorded as gaps 2/4/5/6 dropped; 3 out-of-range recorded as gaps 9-11 (no origin → GIT then flips, ruling 2; grype remedy on a scanner error; init's existing-repo commit through the live hook without the forge variables — plan 4, interim rule to U6's decisions doc). No fix commits, so no R-late contract review                                                                                                                                                                                                                   | —        |
| —    | reconcile          | —     | 1     | skipped     | node reconcile — why: no covers: (no stamps, registry or environment to reconcile); persist skipped: edit units only, decisions ride the Run log and the docs unit's decisions doc                                                                                                                                                                                                                                                                                                                                                                                                                                                                | —        |
| —    | acceptance         | —     | 1     | skipped     | why: no covers: — a change plan has no acceptance criteria                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | —        |
| —    | ux                 | —     | 1     | skipped     | why: no covers: and no screen changed                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | —        |
| 3    | U6 docs            | opus  | 1     | pass        | node edit — stackgen.md (task list, git-config contract, flags, brownfield halt, baseline step), vwf.md (init interim rule, gap 11), dprint SKILL.md:100-105, new decisions doc mirrored to the palace; DECIDED: readme/CLAUDE.md/.claude untouched (no passage restated the rule); gap-11 rule also in vwf.md's init passage                                                                                                                                                                                                                                                                                                                     | 9298abd1 |
| 3    | R3                 | opus  | 1     | pass        | CONTRACT clean (4 paths), RULINGS clean; edits 4-6 verified no-op; every passage matches the landed scripts; no falsified passage left in stackgen.md or the how-to pages                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | —        |
| 4    | U7 gates-and-bump  | opus  | 1     | pass        | node edit — site 1.1.34 (lockfile untouched); mise 1.3.0, pre-commit 1.1.2, gitleaks 1.1.1, grype 1.0.1; pins; inventory regenerated; stackgen 1.22.0; marketplace regenerated (vwf unchanged); full gate green; exactly the ten owned files                                                                                                                                                                                                                                                                                                                                                                                                      | 62f3b735 |
| 4    | R4                 | opus  | 1     | pass        | CONTRACT clean (ten owned files), RULINGS clean — every version as consented, pins equal their packs, generated files up to date, no 13/17                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | —        |
| —    | reconcile          | —     | 2     | pass        | final gate over the finished tree — all seven wave-gate lines green after U7's commit; orchestrator gates: none beyond the wave gate (as the folder states)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | —        |

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the fresh session's worktree — cut from the integration branch — can see it.

Run in a fresh session:

/vwf:execute docs/plans/2026-09-20-pack-first-run-safety

or let the queue pick it, by priority:

/vwf:execute next
