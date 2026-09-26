---
type: vwf-change-plan
title: universal packs into init — vwf init owns mise, the repo gates and
  hygiene
requires:
  - docs/plans/2026-09-26-mise-conf-d-layout
  - docs/plans/2026-09-26-mise-lock-sidecar-exclusions
backlog: [ B68 ]
backlog_pieces: []
---

# Plan — universal packs into init — vwf init owns mise, the repo gates and hygiene (2026-09-26)

## Status

**ARCHIVED**

ARCHIVED 2026-09-26 — not run; was APPROVED. Superseded by the user's ruling
that a stackgen mise skill composes mise config (no packs move into init);
re-planned.

## Consent

| Action                                            | Granted                                                                                                                             |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Merge to the integration branch and push on green | yes                                                                                                                                 |
| After landing: `mise run p:plugins:local`         | run                                                                                                                                 |
| Release vwf publicly                              | major — `19.47.0` → `20.0.0`, bumped by editing `plugins/vwf/.claude-plugin/plugin.json`; no release step, the chain ships after B2 |
| Release stackgen publicly                         | major — `1.34.0` → `2.0.0`, bumped by editing `plugins/stackgen/.claude-plugin/plugin.json`; no release step, ships after B2        |
| Release site publicly                             | none — not this time                                                                                                                |
| Release installer publicly                        | none — untouched                                                                                                                    |

**The mode recorded here is the consent.** A `run` step runs on a green landing
without a prompt; an `ask` step stops the run once before it, reports what it
would do, and waits. The mode is the interview's answer (item 17), and a release
step recorded `run` is authorised by the interview's release question (item 18)
— a release recorded `ask`, or with no step at all, is intent, not
authorisation. Where a step stages something this session already loaded, it is
picked up only by a **restarted** session.

## Goal

After this lands, the six universal packs — mise, dprint, gitleaks, grype,
pre-commit, repo-hygiene — live in vwf at
`plugins/vwf/skills/init/packs/<name>/`, and `/vwf:init` alone lands them and
records them in its own lock. A repo's `.config/vwf.yaml` records the minimum
vwf and stackgen versions its shape needs, checked first by setup, init and
doctor. A file whose owner changed — stackgen pack to init, or one pack to
another — moves over by hash.

The framing: the user, planning B2: *"Let's move `mise` to `init` ownership so
that it can completely own. Also look at any other stack which is universal like
`mise` and move them under `init`, e.g. `dprint`"*; asked how far, the user
picked moving the packs themselves into vwf. B68 (a landed path changing its
owning pack) is this plan's transfer rule. It requires B1
(`docs/plans/2026-09-26-mise-conf-d-layout`) and B69
(`docs/plans/2026-09-26-mise-lock-sidecar-exclusions`), which edit these packs
in place first. B2 (`docs/plans/2026-09-26-mise-conf-d-packs`) requires this
plan.

**Reversals, all confirmed at the interview:**

1. `CLAUDE.md` — vwf "names **no** technology"; `init` is "stack-agnostic; it
   orchestrates the packs and writes no tool config of its own"
   (`plugins/vwf/skills/init/SKILL.md:5-9`, :40–47 "If this skill ever names a
   tool, that naming is the bug").
2. `docs/memory/decisions/2026-09-05-vwf-init-and-the-repo-shape.md` :1
   ("`/vwf:init` is thin; the packs own every file"), :21–25, :36–43 ("Putting
   the payloads back in vwf reverses [the devtools dissolution]"), :47 ("the
   orchestrator is vwf's, the payloads are stackgen's").
3. `docs/memory/decisions/2026-09-05-charter-fence-opens-for-gate-configs.md`
   :42–51 — the fence exists because "vwf names no tool".
4. `docs/plans/archived/2026-09-01-devtools-dissolution.md` — the toolchain
   manager, gates and hygiene placed in stackgen's unconditional bundles.
5. `docs/memory/decisions/2026-09-12-setup-ai-is-project-scope-through-claude.md`
   :81 ("init still names no tool").

## Facts the survey established

- **The six packs** (`S` = `plugins/stackgen/stacks`), each only `pack.yaml`,
  `conventions.md`, `config/`, `skills/`; 79 files: `S/toolchain-manager/mise`
  (41 files; the task library incl.
  `config/.config/mise/tasks/_scripts/{helpers,helpers.mjs,checks,merge,placeholder}`,
  `vscode.d/mise.jsonc`; 3 skill files), `S/toolchain-gate/dprint` (7),
  `S/toolchain-gate/gitleaks` (4), `S/toolchain-gate/grype` (4),
  `S/toolchain-gate/pre-commit` (7), `S/repo-hygiene/repo-hygiene` (16). Pack
  skills are copied by the materializer, not registered in any manifest. `when:`
  answers used: `editor: vscode` (mise, dprint, pre-commit, repo-hygiene),
  `forge: github`, `update_bot: renovate` (`repo-hygiene/pack.yaml:19,22`).
- **Bundles**: `S/bundles/mise.md:5`, `S/bundles/repo-gates.md:5-10`,
  `S/bundles/repo-hygiene.md:5`, all `unconditional: true`. After the move the
  kinds `toolchain-manager`, `repo-gate`, `repo-hygiene` have no stackgen pack;
  `S/toolchain-gate/` keeps six other packs (eslint, ruff, …).
- **stackgen references**: `stackgen-stack-menu/SKILL.md:29,36,39,87-97,112`;
  `stackgen-stack-template/SKILL.md:80,152-166`,
  `references/materializer.md:57,116-126,147-150`;
  `stackgen-sync/SKILL.md:38-39,119-134` (no ownership-change handling — B68);
  `assets/pack-format.md:13,34-66,145,299-317,353-393` (`unconditional`);
  `assets/output-tree.md:147-149,255,324-326,378-384`;
  `assets/kinds.md:267-475,533`; `assets/taxonomy.md:44,56,235-250`;
  `stacks/readme.md:8`; `scripts/src/inventory.ts:69,178,247`; rule 14
  `scripts/src/check.ts:1597`.
- **Packs depending on them**: 43 task files source mise's `_scripts/helpers`
  (pnpm, uv, swift, flutter, swiftui, ruff, eslint, cloud deploy tasks, astro
  and html icons, fnox and doppler `setup/secrets`); placeholder overrides
  (`setup/deps/*`, `code/{lint,format}`) in pnpm, uv, swift, flutter, swiftui,
  ruff, eslint; `pre-commit.d/uv.yaml`; `vscode.d` fragments in astro, pnpm,
  ruff, swift-format, analysis-options, tsconfig, eslint, swiftlint;
  `mise/conf.d` fragments in swiftui, doppler, fnox, pnpm, swiftlint. No pack
  declares `requires:`.
- **Checker** (`scripts/src/check.ts`): pack walks glob `stacks/*/*` at :432
  (config tier), :1272 (landed citations), :1300 (stackTypes); rule 15 paths
  hardcoded :1712, :1721, :1727, :1734, and :1930 silently skips a missing file;
  `checkVwfIsTechnologyFree` :2233–2310 refuses any vwf `stacks/` path (:2243)
  and tool tokens (`TOOL_TOKENS` :2009, `TOOL_NAME_EXCEPTIONS` :2064) — mise
  pack prose has npm×11, pnpm×8, doppler, bun; repo-hygiene doppler×3, pnpm,
  postgres; dprint astro. Tests
  `check.test.ts:281-301,477-570,521-544,1424-1465`.
  `.config/mise/tasks/p/plugins/shellcheck:45,74` scope `plugins/*/stacks/*/*`.
  Repo exclusions on that pattern: `.config/dprint.json:10`,
  `.config/pre-commit-config.yaml:105,129,151`.
- **init today** (6 files, 4056 lines): fetches slugs `mise`, `repo-gates`,
  `repo-hygiene` via `/<plugin>:<plugin>-stack-template <slug>` in toolchain →
  gates → hygiene order (`references/new-repo.md:80-110`, `SKILL.md:745-771`),
  passing `answers:` {forge, editor, secrets, update_bot}; no adapter is a halt
  (`SKILL.md:290-310`). Other adapter/materializer mentions: `SKILL.md` 82,
  214–215, 226, 327, 397–400, 611–628, 652, 667, 705, 763–767, 894, 916;
  `existing-repo.md` 3, 12, 55, 76, 110, 419, 439, 1068, 1136–1141;
  `fragments-and-sections.md` 102, 123, 195–211, 331; `new-repo.md` 133, 175,
  451, 616, 636; `readme-and-license.md` 66, 155. Lock use: hashes compared
  (`existing-repo.md:436-443`), post-fill re-record (:520–528), final re-hash
  (:1130–1145). init writes three `.config/vwf.yaml` keys (`SKILL.md:33-37`,
  :73–89; stub `new-repo.md:181-196`).
- **setup**: hard rule `setup/SKILL.md:62-69`; Step 0 shape test "the adapter's
  lockfile records all three unconditional slugs" (:109–118), offer :137–146,
  `reshape` :73–96; materialize pass :216–228;
  `references/materialize.md:150-158` (secrets from the adapter lock), :243;
  `references/onboard-pipeline.md:58`.
- **doctor** (`doctor/references/stack-checks.md`): missing-mise :276–291
  (:286–289 names the adapter); (a) :378–399 reads `.claude/stackgen/lock.yaml`
  sources and the adapter's `pack.yaml`; (e) :462–512+ re-tests against the pack
  payload at `source:`; (d) :445, (f) :568–605; missing-lock note :562–565.
- **vwf config**: `plugins/vwf/assets/vwf-config.md:49` — `config_format: 21`;
  migrations in `setup/references/{format-lineage,migrate-pipeline}.md`.
  `plugins/vwf/assets/stack-adapter.md:140-146` (per-repo lockfiles), :268.
- **Manifest**: `plugins/vwf/.claude-plugin/plugin.json:6-11` depends on
  `stackgen` only — kept.
- **Commit convention**: `ops`, `docs`, `merge`, `feat`, `fix`, `refactor`; no
  scopes.
- **Trap — commit order**: a modified, unstaged `.config/pre-commit-config.yaml`
  aborts every commit; and a checker-widening unit commits after the units its
  rule scans. So U1 (which owns that file and the move) commits first, U2 (the
  checker) second.

## Assumed decisions — confirm or override at review

| #  | Decision                 | Ruling                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Rejected                                             | Unit  |
| -- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | ----- |
| 1  | Where the packs go       | `plugins/vwf/skills/init/packs/{mise,dprint,gitleaks,grype,pre-commit,repo-hygiene}/`, pack shape kept (`pack.yaml`, `conventions.md`, `config/`, `skills/`). The three bundles are deleted.                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | flattening into init references and assets now (B66) | U1    |
| 2  | stackgen after           | The kinds `toolchain-manager`, `repo-gate`, `repo-hygiene` and the `unconditional` key are retired; `stackgen-stack-menu`, `-stack-template`, `-sync`, `inventory.ts` and the assets drop their handling. stackgen's other packs keep sourcing `.config/mise/tasks/_scripts/helpers`, now init's — written down as a cross-plugin contract. The secrets providers (fnox, doppler) stay in stackgen. vwf keeps its `stackgen` dependency.                                                                                                                                                                                                                                  | —                                                    | U2 U3 |
| 3  | init lands its packs     | init lands its own packs itself: the materializer's copy rules (skip `_<name>`, `p/_project` rename, root allowlist, fragments) and the `answers:` conditional evaluation that apply to them move into init's references.                                                                                                                                                                                                                                                                                                                                                                                                                                                 | calling stackgen for them                            | U4    |
| 4  | init's lock              | init records what it lands in `.claude/vwf/init.lock.yaml`, the stackgen entry shape, `source: init/<pack>@<vwf version>`. The stackgen lock keeps only stackgen packs. Doctor (a) and (e) read both.                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | sharing `.claude/stackgen/lock.yaml`                 | U4 U5 |
| 5  | Version gate             | `.config/vwf.yaml` gains `min_versions` (keys `vwf` and `stackgen`) — the plugin versions that shaped the repo, raised by each init or setup run to the versions it ran with. setup, init and doctor check it first: an installed version older than recorded stops the run and offers, with consent, `claude plugin marketplace update virajp-plugins` then `claude plugin update <name>`, then asks for a session restart. `config_format` 21 → 22 with a migration. The user: *"The config file must contain the minimum version of vwf & stackgen required to run the setup or init. If the version mismatches, ask user for upgrade and do it with user's consent"*. | a floor hardcoded in each plugin                     | U4 U5 |
| 6  | Ownership transfer (B68) | A path whose recorded owner no longer ships it, while another owner now does: unedited (the file matches the old record's hash) → the new owner's content lands and the record moves to the new owner's lock; edited → a replace-or-keep row labelled `owner changed: <old> → <new>`. The old owner's record is always removed. Applies in init's reshape (stackgen pack → init) and in `stackgen-sync` (pack → pack).                                                                                                                                                                                                                                                    | a consent row for every transfer                     | U3 U4 |
| 7  | Checker rule 10          | `checkVwfIsTechnologyFree` exempts `plugins/vwf/skills/init/packs/**` only. The pack walks (:432, :1272, :1300), rule 15's paths and the shellcheck task walk `plugins/vwf/skills/init/packs/*` beside `plugins/*/stacks/*/*`.                                                                                                                                                                                                                                                                                                                                                                                                                                            | retiring rule 10                                     | U2    |
| 8  | Pack internals           | The moved packs' own files follow their home: paths naming `stacks/<type>/<slug>`, "stackgen" as their owner, and their `pack.yaml` identity fields.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | —                                                    | U6    |
| 9  | Review row               | One `Kind: review` row (U7): `check.ts`, `inventory.ts` and shell tasks change.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | the wave review alone                                | U7    |
| 10 | Release                  | vwf major `20.0.0`, stackgen major `2.0.0`, overriding B1's `19.47.0` / `1.34.0` (never tagged); no release step — the chain ships after B2.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | minors                                               | U9    |
| 11 | Comments                 | Any comment or sentence a unit adds is one line; trimming is B65's.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | —                                                    | all   |

## New dependencies

none

## Units

| Id | Wave | Unit file                                      | Kind   | Owns                                                                                                                                                                                                                                                                                                                                                                | Depends on     | Status  | Commit |
| -- | ---- | ---------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | ------- | ------ |
| U1 | 1    | [01-move.md](01-move.md)                       | edit   | `plugins/stackgen/stacks/toolchain-manager/mise/**`, `plugins/stackgen/stacks/toolchain-gate/{dprint,gitleaks,grype,pre-commit}/**`, `plugins/stackgen/stacks/repo-hygiene/repo-hygiene/**`, `plugins/stackgen/stacks/bundles/{mise,repo-gates,repo-hygiene}.md`, `plugins/vwf/skills/init/packs/**` (new), `.config/dprint.json`, `.config/pre-commit-config.yaml` | —              | pending |        |
| U2 | 1    | [02-checker.md](02-checker.md)                 | edit   | `scripts/src/check.ts`, `scripts/src/check.test.ts`, `scripts/src/inventory.ts`, `.config/mise/tasks/p/plugins/shellcheck`                                                                                                                                                                                                                                          | —              | pending |        |
| U3 | 1    | [03-stackgen-skills.md](03-stackgen-skills.md) | edit   | `plugins/stackgen/skills/stackgen-stack-menu/**`, `plugins/stackgen/skills/stackgen-stack-template/**`, `plugins/stackgen/skills/stackgen-sync/**`, `plugins/stackgen/assets/{pack-format,output-tree,kinds,taxonomy}.md`, `plugins/stackgen/stacks/readme.md`                                                                                                      | —              | pending |        |
| U4 | 1    | [04-init.md](04-init.md)                       | edit   | `plugins/vwf/skills/init/SKILL.md`, `plugins/vwf/skills/init/references/**`                                                                                                                                                                                                                                                                                         | —              | pending |        |
| U5 | 1    | [05-setup-doctor.md](05-setup-doctor.md)       | edit   | `plugins/vwf/skills/setup/SKILL.md`, `plugins/vwf/skills/setup/references/{materialize,onboard-pipeline,migrate-pipeline,format-lineage}.md`, `plugins/vwf/skills/doctor/**`, `plugins/vwf/assets/{vwf-config,stack-adapter}.md`                                                                                                                                    | —              | pending |        |
| U6 | 2    | [06-pack-internals.md](06-pack-internals.md)   | edit   | `plugins/vwf/skills/init/packs/**`                                                                                                                                                                                                                                                                                                                                  | U1             | pending |        |
| U7 | 3    | [07-review.md](07-review.md)                   | review | —                                                                                                                                                                                                                                                                                                                                                                   | U2, U6         | pending |        |
| U8 | 4    | [08-docs.md](08-docs.md)                       | edit   | `.claude/**`, `CLAUDE.md`, `readme.md`, `site/src/content/docs/**`, `docs/memory/decisions/2026-09-26-universal-packs-into-init.md` (new)                                                                                                                                                                                                                           | U3, U4, U5, U7 | pending |        |
| U9 | 5    | [09-gates-and-bump.md](09-gates-and-bump.md)   | edit   | `plugins/vwf/.claude-plugin/plugin.json`, `plugins/stackgen/.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `plugins/stackgen/stacks/inventory.md`                                                                                                                                                                                                  | U8             | pending |        |

Status is one of `pending`, `running`, `green`, `failed`, `unresolved`,
`skipped`.

## Shared-file rule

| File                                                                      | Why it collides                     | Owner               |
| ------------------------------------------------------------------------- | ----------------------------------- | ------------------- |
| both `plugin.json` files                                                  | version files                       | U9 only             |
| `.claude-plugin/marketplace.json`, `plugins/stackgen/stacks/inventory.md` | generated                           | U9 only             |
| the moved pack trees                                                      | U1 moves them, U6 edits inside them | U1 then U6 (wave 2) |
| every human-facing doc outside `plugins/`                                 | n units editing one doc             | U8 only             |

## Waves

- **Wave 1 — U1, U2, U3, U4, U5.** Disjoint paths. Every unit writes against the
  new paths (decision 1), so the gate after wave 1 sees the whole move. **Commit
  order: U1 first** (it owns `.config/pre-commit-config.yaml`), **U2 second**
  (the checker widens to the moved tree), then U3–U5.
- **Wave 2 — U6**, inside the moved trees.
- **Wave 3 — U7**, the review row over U2 and U6 (U1 transitively).
- **Wave 4 — U8**, docs. **Wave 5 — U9**, gates and bump.

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

| Step                       | Mode | Notes                                                                                          |
| -------------------------- | ---- | ---------------------------------------------------------------------------------------------- |
| `mise run p:plugins:local` | run  | stages vwf `20.0.0` and stackgen `2.0.0` on this machine; picked up by a **restarted** session |

## Gates the orchestrator keeps

**init lands its own packs**, after wave 2, in a restarted session on the staged
plugins or by following init's references by hand in a scratch repo (isolated
`HOME` and every `MISE_*` dir): a blank repo shaped by `/vwf:init` gets the six
packs' files from `init/packs/`, a `.claude/vwf/init.lock.yaml` recording each
with `source: init/<pack>@<vwf version>`, `min_versions` in `.config/vwf.yaml`,
and no init-owned path in `.claude/stackgen/lock.yaml`. A repo shaped before (a
copy of this repo's lock state) sees each moved file as an unedited transfer and
no replace-or-keep row. Record the result in the Run log; a failure goes back to
U4.

## Unit contract

Every unit prompt carries, in order: its ruling quoted from this file, its owned
paths plus "touch nothing outside this list", the facts section, the shared-file
rule, and the return block below. A unit never bumps a version, never runs a
generator, never edits a doc, never adds a dependency this file does not list,
never commits. A unit deletes with plain `rm`, never `git rm` — it stages
nothing. A unit never runs `git checkout`, `git restore` or a formatter's
`--fix` outside its Owns.

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

- **B2** — init merging the five fragment packs' mise lines into the section
  files: `docs/plans/2026-09-26-mise-conf-d-packs`, which requires this plan.
- **B66** — flattening the packs into composed init content; this plan keeps
  pack shape.
- **B65** — trimming existing comments.

## Parked

none

## Run log

| Wave | Unit | Model | Round | Outcome | Detail | Commit |
| ---- | ---- | ----- | ----- | ------- | ------ | ------ |

## Launch

This folder is already committed and pushed on the branch it was planned on, so
the fresh session's worktree — cut from the integration branch — can see it.

Run in a fresh session, whichever kind the plan is:

/vwf:execute docs/plans/2026-09-26-universal-packs-into-init

or let the queue pick it, by priority:

/vwf:execute next
