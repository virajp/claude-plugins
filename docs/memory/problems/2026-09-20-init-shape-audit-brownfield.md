# Problem — init shape audit: the brownfield walk

PROBLEM 2026-09-20 ★4 | init:existing-repo | read-only walk of every pass of
`existing-repo.md` against the three unconditional bundles — 6 places where the
pipeline lands over or beside what a repo already had, 5 steps the new-repo path
runs that the existing path never names, 1 member case that leaves a dangling
gitlink | plan `docs/plans/2026-09-20-init-shape-audit/`, unit U2

**Date** 2026-09-20 · **Plan** `2026-09-20-init-shape-audit` · **Method**
decision 1 — a read-only walk, no scratch repo, no fixture. Every pointer is a
`file:line` in the worktree; `existing-repo.md` means
`plugins/vwf/skills/init/references/existing-repo.md`, `SKILL.md` means
`plugins/vwf/skills/init/SKILL.md`, `new-repo.md` and
`fragments-and-sections.md` sit beside them. Pack paths are under
`plugins/stackgen/stacks/`: `mise/` is `toolchain-manager/mise/`, `gates/` is
`toolchain-gate/<gate>/`, `hygiene/` is `repo-hygiene/repo-hygiene/`.

The `.vscode` collision is ruled by
`docs/memory/decisions/2026-09-20-init-editor-dedupe.md` and is cited, not
re-audited.

## The mode boundary this walk sits behind

A repo takes this pipeline only when it has a `.config/` directory **or** a
task-library directory (`SKILL.md:185-194`). A repo with two years of source, a
root `mise.toml`, a root `.pre-commit-config.yaml`, its own `.gitignore`,
`CONTRIBUTING.md` and `renovate.json` — but no `.config/` — is **new**, and none
of the eleven passes below runs over it. In that mode the materializer's own
collision rule is the only thing that reads what is there
(`plugins/stackgen/skills/stackgen-stack-template/references/materializer.md:168-180`):
an existing path not in the lockfile is a conflict, never a write. So the
brownfield repo the user described is most often shaped by the new-repo path,
with its existing files skipped as conflicts and nothing else reading them. The
greenfield walk owns that mode; this walk records the boundary because every
"what happens when the path exists" answer below applies **only** once a repo
has crossed it.

## The passes

Each subsection states what the pass reads, what it compares against, what it
writes, and what it exempts. The survey writes nothing; the apply touches only
what the survey listed (`existing-repo.md:8-10`).

### Pass 1 — root files against the allowlist (`existing-repo.md:38-127`)

- **Reads** every root **entry**, files and directories alike, of the repo it
  runs in (`:44-46`).
- **Compares against** the hygiene allowlist
  (`plugins/stackgen/assets/output-tree.md:158-186`;
  `hygiene/conventions.md:28-47`) and a rename map derived from every path the
  landed or landable packs' `config/` trees declare, matched on **basename**
  (`:49-55`).
- **Writes** a move (`git mv`, `:806-807`) for a root entry whose basename
  matches a declaration; the move-and-shim rows for a real `dprint.json`
  (`:94-127`).
- **Reports, never moves** anything else off the allowlist (`:57-59`), which the
  report files under Deferred (`:919-923`).
- **Exempts** four kinds: `.gitmodules`, the editor directory, `.claude/`, and
  every resolved member path (`:61-88`). `.git/` is implied by `:64-65` and not
  listed. Gitignored entries are not exempt: nothing in the pass reads
  `.gitignore`.

### Pass 2 — the readme (`existing-repo.md:129-134`)

- **Reads** the root for `README.md` and `readme.md`.
- **Writes** one move, content untouched; both present is reported as a
  conflict. No caller of the old name — a docs link, a `package.json` field, a
  `CONTRIBUTING.md` pointer — is rewritten, unlike pass 3's renames.
- **Exempts** every other readme spelling (`README`, `README.rst`): nothing
  reads it, and no stub is written in this mode
  (`references/readme-and-license.md:12-13,32-35`).

### Pass 3 — task names against the legacy table (`existing-repo.md:136-170`)

- **Reads** every task **file** in the library, plus the callers — task files,
  the manager's config layers, the gate config, shell aliases (`:147-152`).
- **Compares against** the pack's Legacy names table
  (`mise/skills/mise/references/task-library.md:622-658`).
- **Writes** rename rows; two files contending for one destination become pass 6
  offers with no rename row (`:153-170`).
- **Exempts** inline `[tasks.*]` tables in a `mise.toml` — the pass reads files
  only, so a brownfield mise repo whose tasks are TOML entries is invisible to
  it, to pass 4 and to pass 10.

### Pass 4 — shebangs (`existing-repo.md:172-182`)

- **Reads** the shebang of every task file. **Writes** nothing; flags a non-bash
  file with the syntax that would not survive translation.

### Pass 5 — the helper library (`existing-repo.md:184-269`)

- **Reads** `_scripts/_helpers` (or `helpers`) whole, and every task file that
  sources or calls into it.
- **Compares against** the pack's `_scripts/helpers` byte for byte (`:191-197`)
  and the legacy table's `print_*` rows (`:207-212`).
- **Writes** an unconditional replace of the helper (`:199-205`, never offered
  per `:408-414`), rewrites of mapped calls, and the `_scripts/local` sidecar
  carrying every function the repo defined that the pack does not and the table
  does not map (`:214-247`; decision
  `docs/memory/decisions/2026-09-12-init-brownfield-sidecar-and-diverged-files.md:39-70`).
  The sidecar is written before the replace lands (`:814-818`).
- **Exempts** `_scripts/checks` and every other library file the repo may carry
  beside the helper: only the helper is compared here; the rest reach pass 6.

### Pass 6 — missing files (`existing-repo.md:271-414`)

- **Reads** the repo tree against what the **three baseline bundles** declare
  (`:273-277`), and `.claude/stackgen/lock.yaml` for each file's `hash:`
  (`:279-283`).
- **Compares** a recorded file against its lock hash, then on a mismatch the
  pack's payload with the repo's current marked-position values spliced in
  (`:300-316`); an unrecorded file against the **pack's** bytes (`:290-293`).
- **Writes** a create for every declared file the repo lacks, and one
  replace-or-keep row for every diverged file, default replace only where the
  file names a legacy left-hand name (`:359-363`); a keep is recorded under
  `enforcement.kept_files` in the base's `.config/vwf.yaml` (`:385-397`).
- **Exempts** the helper (`:408-414`); the secrets provider's bundle, which
  `SKILL.md:505-510` says both pipelines materialize but no pass here diffs; and
  — by the lockfile being written **at landing** with the hash of the landed
  bytes (`materializer.md:113-118`;
  `plugins/stackgen/assets/output-tree.md:360-371`) — the claim at `:280-283`
  that the record already carries the fills has no writer. The splice at
  `:300-316` is what rescues a filled file from a permanent offer.

### Pass 7 — fragments and sections (`existing-repo.md:416-434`)

- **Reads** `.config/pre-commit.d/*.yaml`, the lockfile's pinned stacks, the two
  editor files whole.
- **Writes** the hook merge between markers, the ignore-section append per
  pinned stack, the editor block plus the collision round
  (`fragments-and-sections.md:84-135, 16-82, 137-307`).
- **Exempts** everything outside the markers
  (`fragments-and-sections.md:112-117`) and the base sections of a repo-owned
  `.gitignore`: the append resolves per-technology templates by banner only
  (`:33-48`), so the pack's own `mise`, `AI tooling` and `Secrets and env`
  sections (`hygiene/config/.gitignore:21-61`) never reach a kept ignore file.

### Pass 8 — commit types (`existing-repo.md:436-451`)

- **Reads** the commit-message gate's configuration. **Writes** a rename per
  type the table maps. A type outside the closed set **and** outside the table
  (`security`, `hotfix`, `i18n`) has no rule — unspecified.

### Pass 9 — per-project groups (`existing-repo.md:453-594`)

- **Reads** the project ids §7 resolves (`new-repo.md:132-177`) as confirmed by
  question 2; the repo's folder name; the resolved members; question 5's answer.
- **Compares against** the `p/<id>/` directories, `REPO_NAME`
  (`mise/config/.config/mise.toml:95-116`), the member flags and aliases
  (`mise/config/.config/mise/tasks/setup/all:6-15`,
  `mise/config/.config/mise.dev.toml:36-49`), `MEMBERS` (`mise.toml:130-141`),
  `EXTRA_MARKETPLACES` and `EXTRA_PLUGINS`
  (`mise/config/.config/mise/tasks/setup/ai:97-115`).
- **Writes** creates, rewrites and the one `repo-name key` replace row. Fills
  reach a kept file too (`:825-827`).
- **Exempts** `MERGE_MODEL` (`:558-565`) — it is §11(a)'s.

### Pass 10 — repo-only tasks (`existing-repo.md:596-637`)

- **Reads** every task file the library carries. **Writes** nothing; lists what
  no bundle declares as kept, with a note for a `setup/` or `code/` name outside
  the mandatory set (`task-library.md:143-166`).
- **Exempts** `_scripts/local` and the `_default` slots (`:613-623`).

### Pass 11 — the gate-config fills (`existing-repo.md:639-692`)

- **Reads** question 2's confirmed ids and `git remote get-url origin`.
- **Writes** `commitScopes` and the four changelog links into
  `gates/pre-commit/config/.config/git-conventional-commits.yaml:26-40, 81-96`.

### What the apply adds, and what it never names (`existing-repo.md:796-910`)

Moves, creates (the materializer's, `:808-818`), replaces before fills
(`:819-824`), the kept-file record, renames and caller rewrites, appends and
merges last; then the gate configuration commits alone (`:852-876`), then §11 of
the new-repo path (`:883-889`). The following new-repo steps appear **nowhere**
in this file and are therefore not run on an existing repo: §3 the secrets
provider (`new-repo.md:77-86`), §4 the placeholders (`new-repo.md:88-112`), §8
the readme stub and licence (`new-repo.md:386-390`, so the security-contact
splice and the licence copy of `readme-and-license.md:37-97` have no caller
here), §9 bootstrap and §10 the aggregator offer (`new-repo.md:392-446`).

## The register

Behaviour "when it exists" is the pass's own rule: offer (pass 6
replace-or-keep), keep (pass 10 or a rule saying so), move (pass 1 or 2), splice
(pass 6 second test), merge (pass 7), fill (pass 9 or 11), or unspecified where
no pass names the path. "Reads first" is what init reads from **this repo**
before landing that path; the lockfile is named where it is the only read.
Stack-conditional says whether the landing depends on the repo's stack today,
and "should be" where the register shows it ought to.

| Landed path                                                             | Source pack          | Reads first                                                    | When it exists                                                                                                                                      | Stack-conditional                                                                            | Duplicate or conflict risk                                                                                                                                                                              | Pointer                                                                                                                         |
| ----------------------------------------------------------------------- | -------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `.config/mise.toml`                                                     | mise                 | lockfile hash; root `mise.toml` basename (pass 1)              | offer; root `mise.toml` is moved here first, then offered against pack bytes; a kept file with no `[env]` positions gets fills — where, unspecified | no — the pack itself asks the user to delete the runtime blocks it ships (`mise.toml:78-89`) | root `.mise.toml`, `.config/mise/config.toml`, `mise/config.toml` all load beside it and pass 1 matches none; inline `[tasks]` invisible to passes 3 and 10                                             | `existing-repo.md:49-59, 279-293, 495-512`; `hygiene/config/.gitignore:41-45`                                                   |
| `.config/mise.dev.toml`, `mise.ci.toml`, `mise.test.toml`               | mise                 | lockfile hash                                                  | offer; aliases filled on keep                                                                                                                       | no — nine dev tools pinned whatever the stack (`config-files.md:152-161`)                    | a repo's own `[shell_alias]` names shadowed by composition, no pass compares them                                                                                                                       | `existing-repo.md:279-293, 536-545`                                                                                             |
| `.config/mise/tasks/**` (36 files)                                      | mise                 | legacy table, helper content, shebang, lockfile hash           | rename (pass 3), replace (helper, pass 5), offer (pass 6), keep (pass 10)                                                                           | slots are stack-agnostic by design                                                           | a root entry named `install`, `main`, `lint`, `format` matches a task basename in pass 1's map and is proposed as a move into the library                                                               | `existing-repo.md:49-55`; `task-library.md:622-658`                                                                             |
| `.config/mise/tasks/_scripts/local`                                     | none — init's move   | the repo's old helper definitions                              | rewrite — missing functions appended                                                                                                                | no                                                                                           | a repo file already at that path that is not a bash library is appended to anyway                                                                                                                       | `existing-repo.md:249-265`                                                                                                      |
| `.config/mise/tasks/p/<id>/_default`                                    | none — init authors  | question 2's confirmed ids                                     | keep (pass 10 exempts it)                                                                                                                           | no                                                                                           | a group named for a stale id is a rename row every run until the id is confirmed as a replacement                                                                                                       | `existing-repo.md:463-486, 617-623`                                                                                             |
| `.config/dprint.json`, `.config/taplo.toml`, root `dprint.json`         | gates/dprint         | root `dprint.json` **content** (shim or real); lockfile hash   | move-and-shim for a real root file; offer otherwise                                                                                                 | no — one plugin list for every repo; should be: a repo formatting with prettier keeps both   | root `.dprint.json` / `dprint.jsonc` are not basename matches, stay, and dprint discovers them beside the shim; `.prettierrc` stays and is reported                                                     | `existing-repo.md:94-127`; `gates/dprint/conventions.md:112, 130-133`                                                           |
| `.config/gitleaks.toml`                                                 | gates/gitleaks       | lockfile hash                                                  | offer                                                                                                                                               | no                                                                                           | root `.gitleaks.toml` (the repo's allowlist) is not a basename match; `code:sec` passes `--config .config/gitleaks.toml` so the old allowlist is dropped                                                | `mise/config/.config/mise/tasks/code/sec:34-41`; `existing-repo.md:57-59`                                                       |
| `.config/grype.yaml`                                                    | gates/grype          | lockfile hash                                                  | offer                                                                                                                                               | no — `--fail-on medium` on a docs-only repo scans nothing                                    | root `.grype.yaml` stays, same shape as gitleaks                                                                                                                                                        | `mise/config/.config/mise/tasks/code/sec:35, 70`                                                                                |
| `.config/pre-commit-config.yaml`                                        | gates/pre-commit     | lockfile hash; fragments                                       | merge between markers; offer on content drift                                                                                                       | no — `no-commit-to-branch main` ships to every repo                                          | root `.pre-commit-config.yaml` is not a basename match, stays, and is the one the repo's installed hooks read until `setup:precommit` re-installs them                                                  | `existing-repo.md:852-859`; `gates/pre-commit/config/.config/pre-commit-config.yaml:6-10, 160-164`; `setup/precommit:10, 29-30` |
| `.config/git-conventional-commits.yaml`                                 | gates/pre-commit     | question 2 ids; origin url; its own type list                  | fill (pass 11), rename (pass 8), offer                                                                                                              | no                                                                                           | a repo on commitlint keeps `commitlint.config.*` at root, reported; two conventions live                                                                                                                | `existing-repo.md:436-451, 639-692`                                                                                             |
| `.config/vscode.d/*.jsonc` → `.vscode/settings.json`, `extensions.json` | all three            | both editor files whole                                        | merge, with the collision round                                                                                                                     | no                                                                                           | ruled — `decisions/2026-09-20-init-editor-dedupe.md`                                                                                                                                                    | `fragments-and-sections.md:137-307`                                                                                             |
| `.gitignore`                                                            | hygiene              | lockfile hash, else pack bytes; banners present (pass 7)       | offer (binary: replace loses the repo's patterns, keep loses the pack's base sections); append per pinned stack                                     | yes for the appended sections (lockfile pins); should be: the base sections too              | a repo pattern spelled differently from the template's (`node_modules` vs `node_modules/`) is doubled by the append                                                                                     | `fragments-and-sections.md:33-70`; `hygiene/config/.gitignore:39-46, 73-74`                                                     |
| `.graphifyignore`, `.editorconfig`, `.gitattributes`                    | hygiene              | lockfile hash, else pack bytes                                 | offer                                                                                                                                               | no                                                                                           | replace of `.gitattributes` drops an LFS filter; the three-line summary is the only warning                                                                                                             | `existing-repo.md:370-375`; `readme-and-license.md:99-108`                                                                      |
| `CONTRIBUTING.md`                                                       | hygiene              | lockfile hash, else pack bytes                                 | offer                                                                                                                                               | no                                                                                           | landed with `<REPO_URL>` unfilled — no pass runs §4; a repo's `.github/CONTRIBUTING.md` or `docs/CONTRIBUTING.md` stays, root wins on the forge                                                         | `new-repo.md:88-101`; `hygiene/conventions.md:156-166`                                                                          |
| `SECURITY.md`                                                           | hygiene              | question 6b (asked every mode); lockfile hash, else pack bytes | offer; the 6b answer reaches nothing — no pass splices it                                                                                           | no                                                                                           | `.github/SECURITY.md` stays; root wins on the forge                                                                                                                                                     | `SKILL.md:268-270, 436-444`; `readme-and-license.md:83-97`                                                                      |
| `LICENSE`                                                               | hygiene `_licenses/` | question 6/6a (asked every mode)                               | keep, whichever spelling — but which spellings count is unspecified, and no pass writes one where none exists                                       | no                                                                                           | `LICENSE.md`, `LICENCE`, `COPYING` are off the allowlist and reported every run                                                                                                                         | `SKILL.md:426-434`; `readme-and-license.md:37-56`; `output-tree.md:162-166`                                                     |
| `renovate.json`                                                         | hygiene              | lockfile hash, else pack bytes                                 | offer; create where absent                                                                                                                          | no — `config:recommended` leaves every manager on                                            | `.github/renovate.json`, `.renovaterc`, `renovate.json5` stay; Renovate reads root `renovate.json` **first**, so the repo's policy is shadowed silently; `.github/dependabot.yml` stays — two bots      | `hygiene/conventions.md:23, 36-38`; contradicted at `:216-220` and `readme-and-license.md:114-119`                              |
| `.github/ISSUE_TEMPLATE/{bug_report,feature_request,config}.yml`        | hygiene              | lockfile hash, else pack bytes                                 | offer per file; create where absent                                                                                                                 | no                                                                                           | a repo's own forms sit beside them in the chooser; `config.yml` lands with `<REPO_URL>` and its advisory entry unresolved — the parked note of `decisions/2026-09-13-init-walks-the-members.md:225-226` | `hygiene/config/.github/ISSUE_TEMPLATE/config.yml:1-10`; `new-repo.md:104-112`                                                  |
| `.claude/stackgen/lock.yaml`                                            | materializer         | itself                                                         | merged by the materializer                                                                                                                          | no                                                                                           | a replace or a fill by init has no lock writer, so its hash stays pre-fill                                                                                                                              | `materializer.md:113-118`; `existing-repo.md:280-283, 351-353`                                                                  |
| `enforcement.kept_files`, `enforcement.editor_keys`                     | none — init's keys   | `.config/vwf.yaml` presence                                    | merge into the block; **deferred** where the file is absent, so every keep is re-offered next run                                                   | no                                                                                           | a product not yet through `/vwf:setup` cannot record a single decision                                                                                                                                  | `existing-repo.md:399-406`; `fragments-and-sections.md:259-267`                                                                 |
| secrets-provider bundle (question 4's slug)                             | provider pack        | question 4 (asked every mode)                                  | unspecified — no pass materializes it; pass 10 assumes its paths are in the set                                                                     | yes by construction                                                                          | the answer is taken and nothing lands                                                                                                                                                                   | `SKILL.md:355-373, 505-510`; `existing-repo.md:605-609`                                                                         |

### The members walk, per row

Every row above runs once per resolved repo, against that repo's own root and
lockfile (`existing-repo.md:12-19`; `SKILL.md:512-516`). What differs:

- **Pass 1** exempts each member path in the base's root (`:82-88`) and surveys
  the member's own root under the same ceiling.
- **Pass 6's keep record** is the base's alone, keyed by the member's path as
  prefix (`:393-397`); a member has no `.config/vwf.yaml` and never will.
- **Pass 9's member positions** — the flags, the aliases — are written in the
  **base** from the resolved members (`:536-545`); `MEMBERS` only under
  siblings, and siblings resolve only from a `members:` list that does not exist
  before `/vwf:setup` (`SKILL.md:149-166`; `new-repo.md:329-335`), so a first
  run on a sibling product shapes the base alone.
- **An absent member** is cloned by its plan row at apply time and surveyed
  after (`:28-36`).

## Duplicates and conflicts

Each path where a landed file and a pre-existing file can both end up active,
with what the passes do today.

- **Root `mise.toml` beside `.config/mise.toml`** — pass 1 matches the basename
  and moves it (`existing-repo.md:49-55`); pass 6 then offers the moved file
  against the pack's bytes with default keep, so the five-file split never lands
  and the `[env]` positions have no key to fill. Root `.mise.toml`,
  `.config/mise/config.toml`, `mise/config.toml` — nothing reads it; mise loads
  every one of them, and the pack's own ignore file names the dotted root form
  as a path mise reads (`hygiene/config/.gitignore:41-45`).
- **Root `.pre-commit-config.yaml` beside `.config/pre-commit-config.yaml`** —
  nothing reads it: the leading dot defeats the basename match, the file is off
  the allowlist, so it is reported and left (`:57-59`). The repo's installed
  hooks were installed against it, so the gate-first commit (`:852-876`) runs
  the **old** hooks, not the configuration it just committed; the new one
  becomes live only when `setup:precommit` re-installs
  (`mise/config/.config/mise/tasks/setup/precommit:10, 29-30`), a task this
  pipeline never reaches (§10 is not named in the apply).
- **Root `dprint.json` that is not the shim** — handled: move-and-shim, told
  apart by content (`:94-127`). Root `.dprint.json` or `dprint.jsonc` — nothing
  reads it.
- **Two renovate configs** — `.github/renovate.json`, `.renovaterc`,
  `renovate.json5`: nothing reads it; pass 6 creates the pack's root
  `renovate.json` where absent, which Renovate reads before any of them
  (`hygiene/conventions.md:36-38`). `.github/dependabot.yml`: nothing reads it.
- **`.gitignore` entries doubled by an append** — the filter drops a pattern the
  file already carries verbatim (`fragments-and-sections.md:59-63`); a respelled
  equivalent is appended a second time. The larger case is the inverse: a kept
  repo-owned `.gitignore` never gains the pack's base sections at all
  (`fragments-and-sections.md:33-48`), so the mise local-override patterns the
  hygiene conventions call load-bearing (`:63-65`) are absent for ever.
- **A `CONTRIBUTING.md` the repo wrote** — offered, default keep
  (`:279-293,
  359-363`). One under `.github/` or `docs/` — nothing reads it.
- **A `SECURITY.md` that already exists** — offered, default keep; question 6b
  is still asked (`SKILL.md:268-270`) and its answer has no landing in this
  pipeline. `.github/SECURITY.md` — nothing reads it.
- **`.github/` templates beside a repo's own** — pass 1 sees `.github/` as one
  allowed directory entry and never looks inside (`:44-46`;
  `output-tree.md:162-166`); pass 6 creates the three pack files where absent
  and offers `config.yml` where present. A repo's `bug.yml`,
  `PULL_REQUEST_TEMPLATE.md`, `CODEOWNERS`, `workflows/` — nothing reads it.
- **Root `.gitleaks.toml`, `.grype.yaml`** — nothing reads it; the pack's tasks
  pass `--config` for the `.config/` copy (`code/sec:34-35, 41, 58, 70`), so the
  repo's fingerprint allowlist stops applying the moment `code:sec` runs.
- **`.husky/`, `lefthook.yml`, `commitlint.config.*`** — nothing reads it;
  reported by pass 1; `setup:precommit` unsets `core.hooksPath` when it runs
  (`setup/precommit:21-30`).
- **Inline mise `[tasks.<name>]` beside a file task of the same name** — nothing
  reads it; passes 3 and 10 read task files only.
- **`.vscode/settings.json`, `extensions.json`** — ruled:
  `decisions/2026-09-20-init-editor-dedupe.md`.

## The two recorded side effects

1. **`cp -R` over a stubbed task ran real commands on the host**
   (`docs/plans/archived/2026-09-05-vwf-init/index.md:509`). The passes as
   written do not permit it on this pipeline: the host-reaching tasks —
   `setup:ai`, `setup:vscode`, `setup:mise` — run only from the §10 aggregator
   offer (`new-repo.md:432-446`), and this pipeline's apply never names §9 or
   §10. What it does permit is narrower and by design: the gate-first commit and
   the shaping commit go through `mise x -- git commit` with the repo's
   **already-installed** hooks live (`existing-repo.md:852-859`;
   `new-repo.md:547-550`), so whatever the repo's own hooks run — a test suite,
   an install — runs on the host during the apply.
2. **The rename table would have clobbered `_scripts/checks`** (`:522`). Closed
   twice over: the table row was corrected (`task-library.md:644-645`) and pass
   3 now refuses two files contending for one destination
   (`existing-repo.md:153-170`). Still permitted in the same shape: pass 1's
   basename-derived rename map (`:49-55`) has no collision rule of its own, so a
   root entry whose basename matches a task file is a proposed move into the
   library with the task as its destination.

## The members walk

- **What differs per member**: its own root under pass 1, its own lockfile under
  pass 6, its own origin for pass 11's links, its own gate-first commit
  (`:861-867`), its own `develop`/`main` pair (`new-repo.md:571-590`). Shared:
  the keep record, the plugin answer, the secrets answer, the landing model, the
  commit answer.
- **What the base's gitlink commit assumes** (`new-repo.md:507-520`;
  `decisions/2026-09-13-init-walks-the-members.md:107-116`): submodule linkage
  (a sibling has no gitlink, so `Gitlinks staged` reads none); every member
  committed on a **branch**. A member cloned by the run's own clone row —
  `git submodule update --init <path>` (`existing-repo.md:28-33`) — is checked
  out **detached** at the recorded commit. Its shaping commit then lands on no
  branch; §11(d) creates nothing where both branches exist (`new-repo.md:585`);
  §11(e) pushes `develop` and `main` (`:597-601`), neither of which contains the
  commit; the base stages a gitlink to it and pushes — which is the
  dangling-pointer outcome `:603-606` names as the thing the order exists to
  prevent. Nothing in the skill reads a member's HEAD state.

## Findings

Severity: **blocks** a user · **surprises** a user · **cosmetic**.

1. **blocks** — A brownfield repo without `.config/` never enters this pipeline
   (`SKILL.md:185-194`): every read-before-land rule below is skipped, and the
   materializer's conflict list is the only thing that notices what was there
   (`materializer.md:168-180`).
2. **blocks** — Pass 1's rename map is derived from every pack `config/` path by
   basename (`existing-repo.md:49-55`), and the map includes the task library: a
   root `install`, `main`, `lint`, `format` or `all` entry is proposed as a move
   into `.config/mise/tasks/**`.
3. **blocks** — A submodule member cloned by the run commits detached; the
   pushed branches lack the commit and the base's gitlink points at it
   (`existing-repo.md:28-36`; `new-repo.md:571-606`).
4. **blocks** — Root `.gitleaks.toml` is left in place and unread; `code:sec`
   runs with `--config .config/gitleaks.toml` (`code/sec:34-41`), so every
   previously allowlisted finding fails the `sec` hook on the first commit.
5. **surprises** — The existing pipeline never names §3, §4, §8, §9 or §10 of
   the new-repo path: placeholders stay unfilled in every hygiene create
   (`new-repo.md:100-101`), the licence and security contact questions are asked
   (`SKILL.md:268-270`) and land nowhere, the secrets provider is asked and
   never materialized, the aggregator is never offered.
6. **surprises** — Root `.pre-commit-config.yaml` is not a basename match and
   stays live; the gate-first commit's premise — that the hooks read the file it
   commits (`existing-repo.md:854-859`) — is false until `setup:precommit` runs
   (`setup/precommit:29-30`), which this pipeline never invokes.
7. **surprises** — `.gitignore` is a binary offer: replace discards the repo's
   patterns, keep leaves the pack's base sections out for ever
   (`existing-repo.md:346-357`; `fragments-and-sections.md:33-48`;
   `hygiene/conventions.md:63-65`).
8. **surprises** — Pass 1 reports every root entry off the allowlist, source
   directories, manifests and gitignored trees included (`:44-46, 57-59`), and
   the report files them under Deferred every run (`:919-923`), so a shaped
   brownfield repo never reads clean.
9. **surprises** — A replace of a file the lockfile does not record has no named
   writer: creates are the materializer's (`:808-809`), the materializer refuses
   a path outside the lockfile (`materializer.md:168-180`), and the post-fill
   hash `:351-353` promises is recorded by nothing (`materializer.md:113-118`) —
   the file is re-offered on the next run.
10. **surprises** — A keep or an editor answer on a product not yet through
    `/vwf:setup` is deferred (`:399-406`; `fragments-and-sections.md:259-267`)
    and re-asked on every reshape until then.
11. **surprises** — Pass 6 compares an unrecorded file against the pack's raw
    bytes (`:290-293`), which carry `<REPO_URL>` and the empty scope list, so a
    hand-completed copy of any hygiene or gate file is always "diverged".
12. **surprises** — The pack's root `renovate.json` create shadows a repo's
    `.github/renovate.json` or `.renovaterc` silently
    (`hygiene/conventions.md:36-38`); nothing reads them.
13. **surprises** — `no-commit-to-branch --branch main` lands in every repo
    (`pre-commit-config.yaml:160-164`); a repo that works on `main` gets
    `develop` created but stays checked out on `main` (`new-repo.md:582`) and is
    refused its next commit once the hooks re-install.
14. **surprises** — A root `mise.toml` is moved to `.config/mise.toml` and then
    offered with default keep; a kept file with no `REPO_NAME`, `MERGE_MODEL` or
    `MEMBERS` key has nowhere for pass 9's fills to go (`:495-512`).
15. **surprises** — Inline `[tasks.*]` in a mise config are invisible to passes
    3, 4 and 10 (`:136-141, 596-600`); a repo whose tasks live there is neither
    renamed nor listed, and a same-named file task lands beside the TOML one.
16. **surprises** — Pass 2 rewrites no reference to `README.md` (`:129-134`),
    where pass 3 rewrites every caller of a renamed task (`:147-152`).
17. **cosmetic** — Pass 8 has no rule for a type outside both the closed set and
    the map (`:436-451`).
18. **cosmetic** — Three prose contradictions: `task-library.md:631-634` still
    says an unmapped call is flagged (pass 5 moves it, `:214-219`);
    `hygiene/conventions.md:216-220` and `readme-and-license.md:114-119` say
    `renovate.json` sits under `.config/` (it lands at the root, `:23`); the
    hook-config comment says fragments merge "below this line"
    (`pre-commit-config.yaml:201-204`) where the algorithm appends inside the
    `repos:` list (`fragments-and-sections.md:107-111`).
19. **cosmetic** — `.git/` is exempt by implication only (`:64-65`); the four
    listed exemptions do not name it.
20. **cosmetic** — Which licence spellings count as "already carries a licence
    file" (`SKILL.md:433-434`) is unspecified; only `LICENSE` is on the
    allowlist.

## D2 candidates

One line each — the read-before-land rules the register shows missing.

- Mode detection reads root tool configs and a manifest, not only `.config/` and
  the task library (finding 1).
- Pass 1's rename map matches full declared paths under `.config/` plus the
  dotted root spellings each tool discovers, never a task-file basename; it
  skips gitignored entries and never reports a source directory (2, 6, 8).
- Every root tool config a landed pack supersedes is offered a **move with
  content**, not a report — `.pre-commit-config.yaml`, `.mise.toml`,
  `.gitleaks.toml`, `.grype.yaml`, `.dprint.json`, `.github/renovate.json` (4,
  6, 12).
- `.gitignore` gets a section merge — the pack's banners appended into the
  repo's file — in place of the binary offer (7).
- The existing pipeline states §3, §4, §8, §9, §10 for its own mode, or the
  questions those steps consume are skipped in that mode (5).
- The replace and the fill each name their writer and the lock record is written
  post-fill by that writer (9, 11).
- `kept_files` and `editor_keys` get a home that exists before `/vwf:setup`
  (10).
- The git pass reads each member's HEAD and refuses or branches a detached
  member before committing (3).
- `no-commit-to-branch` takes the branch the repo works on, or the pass checks
  out `develop` where it created it (13).
- Passes 3, 9 and 10 read inline `[tasks.*]` as task entries (15).
- A moved root `mise.toml` is merged into the pack's split rather than kept
  whole (14).
- Pass 2 rewrites references to the readme it renames (16).
- Stack-conditional landings — the dev tool pins, the runtime blocks, the ignore
  base sections, grype's threshold — read `stacks:` or the manifest before
  landing rather than the pack's one shape (register column 5).
