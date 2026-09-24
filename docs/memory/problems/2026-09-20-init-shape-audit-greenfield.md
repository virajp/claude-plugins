# Problems — init greenfield walk: what a "new" repo gets, blank or with source

```text
PROBLEM 2026-09-20 ★4 | init/greenfield | mode "new" reads two markers and no stack; lands 3 bundles verbatim; a source-bearing repo's own root files become unrecorded materializer conflicts | D2 candidates: read registry/manifests before shaping, conditional landings, a rule for every conflict
```

**Date** 2026-09-20 · **Branch** `plan/2026-09-20-init-shape-audit` · **Plan**
[`docs/plans/2026-09-20-init-shape-audit/`](../../plans/2026-09-20-init-shape-audit/index.md)
· **Unit** U1

Mirrors the mempalace drawer (wing `ai-plugins`, room `problems`); both stores
written together, per `plugins/vwf/assets/memory.md`.

A read-only walk of `plugins/vwf/skills/init/` and the three unconditional
bundles' payloads under `plugins/stackgen/stacks/`. No scratch repo was run.
Every pointer is `file:line` against the worktree; `SKILL.md` unqualified is
`plugins/vwf/skills/init/SKILL.md`, `new-repo.md` and its two siblings are under
`plugins/vwf/skills/init/references/`, and pack paths are relative to
`plugins/stackgen/stacks/`. The `.vscode` collision is ruled by
[`2026-09-20-init-editor-dedupe`](../../plans/archived/2026-09-20-init-editor-dedupe/index.md)
and is cited, not re-audited.

## How "new" is decided

One table, two markers: a repo with **no `.config/` directory and no
task-library directory** is `new`; anything else is `existing`
(`SKILL.md:185-188`). The prose beside it says the narrowness is deliberate — a
repo "with source, a readme and a licence but no configuration layout has never
been shaped" and "nothing in the **new** pipeline touches source"
(`SKILL.md:190-194`; `new-repo.md:3-5`).

What that test cannot see, and therefore what a source-bearing repo carries into
the new pipeline unread: a root `mise.toml` or `.mise.toml` with its own
`[tasks]`, a root `.pre-commit-config.yaml` with hooks already installed, a
`.vscode/` pair, a `.gitignore`, `.editorconfig`, `.gitattributes`, a `.github/`
tree, `renovate.json` or `.github/renovate.json`, a root `dprint.json` that is a
real config rather than a shim, `CONTRIBUTING.md`, `SECURITY.md`, `LICENSE`,
`README.md`, and every language manifest. Each is met later, file by file, by
the materializer's collision check — never by a mode decision.

`/vwf:setup`'s own blank-vs-code fork
(`plugins/vwf/skills/setup/SKILL.md:169-174`) classifies exactly this — "a repo
holding only those is blank. Anything else takes the code sub-path" — but it
runs **after** Step 0's init offer and hands init nothing; init "takes no
arguments and reads no flag" (`SKILL.md:127-129`). So blank and with-source are
one mode today, and the register below has one column for where they differ.

## What init reads on a new repo

Everything the new pipeline reads from the repo or the machine before or while
landing, in the order it is read:

| Read                                                                                                      | For                                                                     | Pointer                                                  |
| --------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | -------------------------------------------------------- |
| the superproject / linked-worktree hops of the membership asset                                           | which repo is the base; a missing `.config/vwf.yaml` is not a halt here | `SKILL.md:131-148`                                       |
| `.gitmodules`, recursively                                                                                | the member set; deduped on realpath                                     | `SKILL.md:149-153`                                       |
| `members:` in `.config/vwf.yaml`                                                                          | the other half of the member set — **absent** on greenfield             | `SKILL.md:149-160`                                       |
| `rev-parse --show-toplevel` per member path                                                               | presence                                                                | `SKILL.md:167-176`                                       |
| the two mode markers                                                                                      | `new` vs `existing`, per repo                                           | `SKILL.md:185-188`                                       |
| the adapter roster in `.config/vwf.yaml`, else the installed plugin list                                  | which materializer to call — greenfield always discovers                | `SKILL.md:244-257`                                       |
| the main checkout's basename (`rev-parse --git-common-dir`)                                               | question 1, `REPO_NAME`                                                 | `SKILL.md:274-286`; `new-repo.md:287-295`                |
| registry ids in `.config/vwf.yaml` (absent), then **sub-project directory names**, then the type question | question 2, the `p:<id>:*` groups and commit scopes                     | `new-repo.md:137-152, 170-177`                           |
| `setup:ai --inventory` — the **machine's** plugin list                                                    | question 5                                                              | `SKILL.md:380-385`                                       |
| the `origin` remote: host, `gh`/`glab` visibility read                                                    | question 6's default, the forge pass                                    | `SKILL.md:416-420`; `new-repo.md:648-661`                |
| the `origin` web URL                                                                                      | `<REPO_URL>`, the advisories default for 6b                             | `new-repo.md:94-96`; `SKILL.md:436-440`                  |
| `git config user.name`, the current year                                                                  | `<HOLDER>`, `<YEAR>`                                                    | `new-repo.md:97-98`                                      |
| the materializer lockfile it has just written                                                             | which ignore sections to append — **none** on a first run               | `new-repo.md:119-123`; `fragments-and-sections.md:33-38` |
| `.config/pre-commit.d/*.yaml`, `.config/vscode.d/*.jsonc`                                                 | the two merges — files it landed moments before                         | `fragments-and-sections.md:105-106, 152-155`             |
| the existing `.vscode/settings.json` and `extensions.json`, whole                                         | the editor merge's hand section                                         | `fragments-and-sections.md:170-175`                      |
| the `.gitignore` it landed                                                                                | the append-nothing-already-present filter                               | `fragments-and-sections.md:59-63`                        |
| an existing `LICENSE`, an existing readme                                                                 | kept / never rewritten                                                  | `readme-and-license.md:32-35, 51-56`                     |
| the manager binary on `PATH`                                                                              | §9 bootstrap, else defer                                                | `new-repo.md:428-430`                                    |

What it does **not** read, by design or by omission:

- **Any language manifest or lockfile** — "Nothing here knows what the repo is
  written in, and that is the design" (`SKILL.md:39-43`); the pipeline "reads or
  moves" no source file (`new-repo.md:3-5`); stack detection is the materializer
  lockfile alone (`new-repo.md:119-123`).
- **`stacks:` pins or the registry's platforms and languages.** The config is
  read for the adapter roster only (`SKILL.md:244-246`) and is absent on the
  repo init exists for (`new-repo.md:170-173`).
- **Existing root dotfiles**, beyond the materializer's per-path exists check
  (`skills/stackgen-stack-template/references/materializer.md:167-172`, under
  `plugins/stackgen/`). Nothing diffs, merges or offers them in this mode.
- **A root `mise.toml`, a root `.pre-commit-config.yaml`, a
  `.github/renovate.json`, a `.github/CONTRIBUTING.md`** — none is a landing
  path, so the exists check never fires and the pack's file lands beside it.
- **Installed git hooks or `core.hooksPath`.** The first-commit reasoning
  assumes "the guard is not in place yet" (`new-repo.md:561-569`), true of a
  blank repo only.
- **The checked-out branch**, beyond the create-what-is-missing table
  (`new-repo.md:580-585`); the `ops:` commit lands on whatever is checked out.
- **What a "sub-project directory" is.** Source 2 of the id resolution names it
  (`new-repo.md:141, 151`) and nothing defines it — the one read of the source
  tree init makes, with no rule for it.

## The register

Behaviour when the path exists is the materializer's collision rule unless a row
says otherwise: a target path that exists and is not in this repo's
`.claude/stackgen/lock.yaml` is "a conflict listed for the user to resolve,
never a write" (`materializer.md:167-178`; `assets/output-tree.md:230-233`, both
under `plugins/stackgen/`). On a greenfield run the lockfile does not exist yet,
so **every pre-existing file at a landing path is a conflict**, the pack's copy
does not land, and the new pipeline has no step that offers, records or reports
the outcome — that is the existing pipeline's replace-or-keep row, which mode
`new` never reaches. Columns: landed path · source pack · what init reads first
· when the path exists · stack-conditional · with source (what a source-bearing
repo plausibly already has there, and the result) · duplicate or conflict risk ·
pointer.

| Landed path                                                               | Source pack                                   | Reads first                                                                                                                             | When the path exists                                                                             | Stack-conditional                                                                                                                                                                                                                                           | With source                                                                                                                                                                                                                 | Duplicate / conflict risk                                                                                                                       | Pointer                                                                                                                                                        |
| ------------------------------------------------------------------------- | --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.config/mise.toml`                                                       | `toolchain-manager/mise`                      | nothing before landing; folder name, member list and the landing model to fill three positions after                                    | cannot — a `.config/` would have made the repo `existing`                                        | **should be**: the payload tells a human to keep only the runtime block matching the repo and delete the rest, and to uncomment `_.path` when a package manager lands; init does neither                                                                    | a root `mise.toml` / `.mise.toml` with `[tools]`/`[tasks]` — not a landing path, unread, coexists; the manager loads both                                                                                                   | two manager configs in one repo, precedence never shown to the user                                                                             | `mise/config/.config/mise.toml:78-89, 143-146, 116, 128, 141`; `new-repo.md:287-335`                                                                           |
| `.config/mise.dev.toml`, `mise.ci.toml`, `mise.test.toml`                 | `toolchain-manager/mise`                      | nothing; the member list for the alias position                                                                                         | cannot (as above)                                                                                | no — the dev pins are the gates' own tools                                                                                                                                                                                                                  | same as above                                                                                                                                                                                                               | low                                                                                                                                             | `mise/config/.config/mise.dev.toml:22-30, 44-49`                                                                                                               |
| `.config/mise/tasks/**` — 31 files                                        | `toolchain-manager/mise`                      | nothing                                                                                                                                 | cannot — the task-library directory is the second marker                                         | 10 of the 31 are **slot** files by design (`grep -rl '#PLACEHOLDER' mise/config/.config/mise/tasks/` hits 11; `_scripts/placeholder` is the helper, not a slot), overlaid by a stack pack; `code/format` runs dprint and shfmt over staged files regardless | a root `mise.toml [tasks]` or `mise-tasks/` coexists unread; `setup/precommit` (run by the offered aggregator) unsets `core.hooksPath` and reinstalls hooks with `--overwrite`, disabling an existing hook manager silently | high once the aggregator runs                                                                                                                   | `mise/config/.config/mise/tasks/setup/precommit:29-30`; `mise/config/.config/mise/tasks/code/format:30-73`; `new-repo.md:432-445`                              |
| `.config/mise/tasks/p/<id>/_default` — authored, one per confirmed id     | init (shape copied from the pack)             | registry (absent), sub-project directory names (undefined), the type question                                                           | n/a in this mode                                                                                 | no                                                                                                                                                                                                                                                          | the ids come from directory names nothing defines                                                                                                                                                                           | an id from an unintended directory                                                                                                              | `new-repo.md:137-152, 367-384`                                                                                                                                 |
| `.config/vscode.d/{mise,dprint-editor,pre-commit,repo-hygiene}.jsonc`     | all three bundles                             | nothing                                                                                                                                 | cannot                                                                                           | **should be**: the hygiene "baseline" fragment excludes `.astro/`, `.dart_tool`, `node_modules/`, `tsbuildinfo`, `pnpm-lock.yaml` and sets a JS/TS-only extension's languages                                                                               | none plausible                                                                                                                                                                                                              | low                                                                                                                                             | `repo-hygiene/repo-hygiene/config/.config/vscode.d/repo-hygiene.jsonc:46-54, 89-92, 133`                                                                       |
| `.vscode/settings.json`, `.vscode/extensions.json` — composed             | init, from the fragments                      | the existing files, whole                                                                                                               | **merge**: one marked block first; a hand key the packs also compose is a collision round        | inherits the fragments' keys                                                                                                                                                                                                                                | a `.vscode/` pair is common                                                                                                                                                                                                 | ruled by `2026-09-20-init-editor-dedupe`; not re-audited                                                                                        | `fragments-and-sections.md:170-175, 199-207, 290-291`                                                                                                          |
| `.config/dprint.json`, `.config/taplo.toml`                               | `toolchain-gate/dprint`                       | nothing                                                                                                                                 | conflict, unlanded, unrecorded                                                                   | weakly should be: a fixed all-language plugin set (markdown, dockerfile, markup, yaml, css, typescript, json, taplo)                                                                                                                                        | rare under `.config/`                                                                                                                                                                                                       | low                                                                                                                                             | `toolchain-gate/dprint/config/.config/dprint.json:60-68`                                                                                                       |
| `dprint.json` — root shim, `extends` into `.config/`                      | `toolchain-gate/dprint`                       | nothing                                                                                                                                 | conflict, unlanded                                                                               | no                                                                                                                                                                                                                                                          | a repo already on dprint has a **real** config here; it stays, `.config/dprint.json` lands beside it, and `code:format` reads the `.config/` one by explicit path while the editor and a bare `dprint` read the root        | two formatter configs, the gate and the editor disagreeing                                                                                      | `toolchain-gate/dprint/config/dprint.json:1-3`; `mise/config/.config/mise/tasks/code/format:30`; `plugins/stackgen/assets/output-tree.md:191-196`              |
| `.config/gitleaks.toml`, `.config/grype.yaml`                             | `toolchain-gate/gitleaks`, `grype`            | nothing                                                                                                                                 | conflict, unlanded                                                                               | no (both scan whatever is there)                                                                                                                                                                                                                            | rare                                                                                                                                                                                                                        | low                                                                                                                                             | `plugins/stackgen/stacks/bundles/repo-gates.md:20-27`                                                                                                          |
| `.config/pre-commit-config.yaml`, `.config/git-conventional-commits.yaml` | `toolchain-gate/pre-commit`                   | nothing; then `.config/pre-commit.d/*.yaml` for the merge — **none ship** among the three bundles; the confirmed ids for the scope list | conflict, unlanded                                                                               | no                                                                                                                                                                                                                                                          | a root `.pre-commit-config.yaml` with hooks installed is not a landing path: unread, coexists, and the aggregator's reinstall later points the hooks at the `.config/` one                                                  | two gate configs; which one `git commit` runs changes when the aggregator runs                                                                  | `toolchain-gate/pre-commit/config/.config/pre-commit-config.yaml:160-164, 201-203`; `fragments-and-sections.md:105-128`; `new-repo.md:127-130`                 |
| `.gitignore` — sectioned base, then appended sections                     | `repo-hygiene/repo-hygiene`                   | nothing; then the materializer lockfile for the sections to append                                                                      | conflict, unlanded, unrecorded — and §5 then has no sectioned base to append to                  | **yes, and the condition is empty at greenfield**: sections are keyed on pinned language / package-manager packs, and a first run has pinned none                                                                                                           | almost every source repo has one → conflict; a repo **without** one gets the base with no language section, so a Node repo has no `node_modules/` line                                                                      | the base sections (secrets, mise, AI tooling) never reach a repo that had its own file, and nothing says so                                     | `repo-hygiene/repo-hygiene/config/.gitignore:4-67`; `new-repo.md:116-123`; `fragments-and-sections.md:33-48`; `repo-hygiene/repo-hygiene/conventions.md:84-90` |
| `.gitattributes`                                                          | `repo-hygiene/repo-hygiene`                   | nothing                                                                                                                                 | conflict, unlanded                                                                               | cosmetic: names `pnpm-lock.yaml` and `mise.lock` whatever the stack                                                                                                                                                                                         | common → conflict                                                                                                                                                                                                           | low                                                                                                                                             | `repo-hygiene/repo-hygiene/config/.gitattributes:8-9`                                                                                                          |
| `.editorconfig`                                                           | `repo-hygiene/repo-hygiene`                   | nothing                                                                                                                                 | conflict, unlanded                                                                               | cosmetic: a `[*.{py,dart}]` block whatever the stack                                                                                                                                                                                                        | common → conflict                                                                                                                                                                                                           | low                                                                                                                                             | `repo-hygiene/repo-hygiene/config/.editorconfig:23-24`                                                                                                         |
| `.graphifyignore`                                                         | `repo-hygiene/repo-hygiene`                   | nothing                                                                                                                                 | conflict, unlanded                                                                               | no                                                                                                                                                                                                                                                          | rare                                                                                                                                                                                                                        | none                                                                                                                                            | `repo-hygiene/repo-hygiene/conventions.md:18`                                                                                                                  |
| `CONTRIBUTING.md`                                                         | `repo-hygiene/repo-hygiene`                   | the origin URL for `<REPO_URL>`                                                                                                         | conflict, unlanded                                                                               | no                                                                                                                                                                                                                                                          | a root one → conflict; a `.github/CONTRIBUTING.md` → both exist, the forge picks one                                                                                                                                        | two contribution guides                                                                                                                         | `readme-and-license.md:99-108`; `repo-hygiene/repo-hygiene/conventions.md:143-153`                                                                             |
| `SECURITY.md`                                                             | `repo-hygiene/repo-hygiene`, spliced by init  | the origin's advisories URL as 6b's default, then 6b's answer                                                                           | **unspecified** — the readme and the licence each have an already-there rule; this file has none | no                                                                                                                                                                                                                                                          | a repo with a policy already published                                                                                                                                                                                      | an existing policy overwritten or left beside a spliced one — the text does not say which                                                       | `readme-and-license.md:69-97`; `new-repo.md:104-112`                                                                                                           |
| `LICENSE`                                                                 | `repo-hygiene/repo-hygiene/config/_licenses/` | question 6 / 6a, `git config user.name`, the year                                                                                       | **keep**, whatever visibility was answered                                                       | no                                                                                                                                                                                                                                                          | common; kept                                                                                                                                                                                                                | none                                                                                                                                            | `readme-and-license.md:37-60`                                                                                                                                  |
| `readme.md` — two-line stub                                               | init                                          | questions 1 and 3                                                                                                                       | **never rewritten**; new mode is silent on renaming an existing `README.md`                      | no                                                                                                                                                                                                                                                          | `README.md` present → no stub; whether it is moved to lowercase in this mode is unspecified (the move is the existing pipeline's pass)                                                                                      | a shaped repo still carrying `README.md`, which the next `/vwf:readme` and doctor read differently                                              | `readme-and-license.md:12-35`; `new-repo.md:386-390`                                                                                                           |
| `renovate.json` — root                                                    | `repo-hygiene/repo-hygiene`                   | nothing                                                                                                                                 | conflict, unlanded                                                                               | no, but its enabled managers are `mise` on, `pre-commit` off                                                                                                                                                                                                | a root one → conflict; a `.github/renovate.json` → the pack's root file lands beside it and Renovate reads the root first, so the repo's own policy is shadowed                                                             | a dependency policy replaced without a diff; and the caveat init prints on landing says the file sits under `.config/`, which it no longer does | `readme-and-license.md:114-119`; `repo-hygiene/repo-hygiene/conventions.md:200-203, 217-222`; `plugins/stackgen/assets/output-tree.md:214-218`                 |
| `.github/ISSUE_TEMPLATE/{bug_report,feature_request,config}.yml`          | `repo-hygiene/repo-hygiene`                   | the origin URL; 6b's contact for the vulnerability link                                                                                 | per-file conflict; the rest of an existing `.github/` tree untouched                             | **should be, on the forge**: GitHub furniture, landed on a GitLab or unknown origin too — only the contact entry is conditional                                                                                                                             | a `.github/` tree with workflows and its own templates                                                                                                                                                                      | forms a GitLab repo never shows; a second set of templates on GitHub                                                                            | `new-repo.md:104-112, 635-641`; `repo-hygiene/repo-hygiene/conventions.md:150-153`                                                                             |
| `.claude/stackgen/lock.yaml`, `.claude/skills/<pack>/`                    | the materializer                              | the existing lockfile (absent)                                                                                                          | merges; settings.json behind its own consent                                                     | records **no** language on a first run — which is why §5 appends nothing                                                                                                                                                                                    | an existing `.claude/` with the user's own skills and settings                                                                                                                                                              | low; out of init's hands                                                                                                                        | `materializer.md:113-118` (under `plugins/stackgen/skills/stackgen-stack-template/references/`); `SKILL.md:512-516`                                            |
| the git pass: `develop`, the `ops:` commit, `main`, the push, the forge   | init                                          | the commit answer, once; `origin`; `gh`/`glab` state                                                                                    | branches created only where missing; existing protection left alone                              | no                                                                                                                                                                                                                                                          | a repo standing on `main` with history takes the `ops:` commit **on `main`**, under whatever hooks are already installed; `develop` is then cut from it                                                                     | a direct commit to the branch the shipped gate refuses commits on, made before that gate is wired                                               | `new-repo.md:547-569, 580-595, 623-628, 686-695`                                                                                                               |

Two landings the plan's survey expected and the payloads do not carry: the
hook-fragment merge (§6) has **nothing to merge** on any of the three bundles —
no `toolchain-gate/*/config/.config/pre-commit.d/` exists; the only fragment in
the whole stacks tree is
`package-manager/uv/config/.config/pre-commit.d/uv.yaml` — though
`bundles/repo-gates.md:24-27` says each gate drops one; and the task library is
31 files, not the "about 36" the plan's Facts estimated.

## The members walk

What changes when the base declares members and a member resolves `new`:

- **The member set on greenfield is `.gitmodules` alone.** The `members:` half
  needs `.config/vwf.yaml`, which `/vwf:setup` writes after init
  (`SKILL.md:149-160`, `new-repo.md:170-177`). A sibling-linked product has no
  `.gitmodules`, so its members do not exist to init until setup has run once —
  the first run shapes the base alone and the members are the re-run doctrine's
  "after a member is added" case (`SKILL.md:624-629`).
- **Every member gets the whole set** — the three bundles, all 31 task files,
  the four gate configs, the hygiene root files, its own lockfile
  (`SKILL.md:505-516`; `new-repo.md:11-14`). Nothing is shared upward; a
  three-member product carries four formatter configs and four secret-scanner
  configs, identical on the day they land.
- **Per-repo answers**: `REPO_NAME` from each member's own folder
  (`SKILL.md:281-286`), visibility, licence and security contact one row per
  repo (`SKILL.md:413-444`), the ids from the base's `members[].projects` first
  — absent on greenfield — then the member's sub-project directories, then the
  type question (`new-repo.md:146-152`).
- **Product-wide answers written into every repo**: the secrets provider
  (`SKILL.md:355-357`), the agent plugins (`SKILL.md:374-377`), the landing
  model (`new-repo.md:472-480`), the commit answer (`new-repo.md:522-540`).
- **The base's positions move with the members**: one aggregator flag and one
  alias per member (`new-repo.md:247-252`); `MEMBERS` stays as shipped under
  submodule linkage and on every first run (`new-repo.md:329-335`).
- **Order**: members first, base last, so the base commits the moved gitlinks it
  deliberately stages (`SKILL.md:451-454`; `new-repo.md:507-516`). An absent
  member is a clone row inside the one plan, surveyed after the clone, and its
  mode is decided then (`SKILL.md:200-234`).
- **The forge pass is per repo, once for the product** — default branch and two
  rulesets per member, the backlog project for the base only
  (`new-repo.md:612-628, 750-764`).
- **The with-source column applies per member**: a member cloned with its own
  `.gitignore`, `.github/` and `README.md` meets the same unrecorded conflicts
  as a base would, and the base's report has no section that rolls them up —
  every count is per repo (`SKILL.md:527-530`).

## Findings

Severity: **blocks** a user · **surprises** a user · **cosmetic**. Each finding
answers the three lens questions in one line each — *read* (what init read
before landing), *had* (what the repo plausibly had and what happened to it),
*right* (is this landing right for a repo whose stack the registry names).

1. **A pre-existing file at any landing path is a materializer conflict the new
   pipeline never resolves** — surprises. *Read*: nothing; the materializer's
   exists check is the only look (`materializer.md:167-178`). *Had*:
   `.gitignore`, `.editorconfig`, `.gitattributes`, `CONTRIBUTING.md`,
   `renovate.json`, a root `dprint.json` — each stays, the pack's copy does not
   land, no lockfile entry, no `kept_files` record, no plan row, because
   replace-or-keep is the existing pipeline's (`SKILL.md:476-481`) and mode
   `new` runs `new-repo.md`, which has no such step. *Right*: no — the outcome
   is neither adopt nor flatten; it is silence, and doctor's baseline predicate
   on pack-owned bytes has nothing to read.
2. **`.gitignore`'s stack sections are conditional on a lockfile that names no
   language at greenfield** — blocks, for a source repo without its own file.
   *Read*: the materializer lockfile after landing (`new-repo.md:119-123`),
   never a manifest. *Had*: a Node or Python repo with no `.gitignore` gets the
   base sections and nothing for `node_modules/` or `.venv/`
   (`repo-hygiene/repo-hygiene/config/.gitignore:4-67`; the mapping keyed on
   pins, `conventions.md:84-90`); the first `git add` stages the dependency
   tree. *Right*: no — the section rule is right, its input is empty by
   construction on the run that needs it most.
3. **The mode test cannot see a repo's existing tooling** — surprises. *Read*:
   two markers (`SKILL.md:185-188`). *Had*: a root `mise.toml` with `[tasks]`, a
   root `.pre-commit-config.yaml`, husky under `core.hooksPath` — all invisible,
   all still there after the run; the shipped `setup/precommit` later unsets
   `core.hooksPath` and reinstalls with `--overwrite`
   (`mise/config/.config/mise/tasks/setup/precommit:29-30`) when the §10
   aggregator runs (`new-repo.md:441-445`). *Right*: no — a repo that already
   runs a task runner and a hook manager is `existing` in every sense but the
   marker's.
4. **A root `dprint.json` that is a real config is shadowed by the gate and kept
   by the editor** — surprises. *Read*: nothing. *Had*: the user's config
   conflicts, is not replaced by the shim, and `code:format` reads
   `.config/dprint.json` by explicit path
   (`mise/config/.config/mise/tasks/code/format:30`) while dprint's own
   root-only discovery (`plugins/stackgen/assets/output-tree.md:191-196`) still
   serves the editor and a bare `dprint fmt`. *Right*: no — two formatter
   configs, and the hook enforces the one the user did not write.
5. **`.github/renovate.json` is silently shadowed by the landed root
   `renovate.json`** — surprises. *Read*: nothing; not a landing path. *Had*: a
   policy under `.github/`, which Renovate reads only when no root file exists
   (`plugins/stackgen/assets/output-tree.md:214-218`); after the run the pack's
   policy — `mise` manager on, `pre-commit` off, ten-hour age — is the one in
   force (`repo-hygiene/repo-hygiene/conventions.md:198-215`). *Right*: no, and
   the caveat init prints on landing (`readme-and-license.md:114-119`;
   `conventions.md:217-222`) says the file sits under `.config/` where the bot
   cannot see it, which stopped being true on 2026-09-10 — the user is told the
   opposite of what happened.
6. **The `ops:` commit lands on whatever branch a source repo has checked out,
   under whatever hooks it has** — surprises. *Read*: the branch table only
   (`new-repo.md:580-585`). *Had*: a repo on `main` with history; the commit
   goes onto `main` (`new-repo.md:547-559`), `develop` is cut from it, and the
   "guard is not in place yet" reasoning (`new-repo.md:561-569`) holds for the
   shipped hook but not for a hook manager already installed, whose hooks run
   against the shape files unformatted by the shipped gate. *Right*: for a blank
   repo yes; for a repo with a protected `main` it is a direct commit the model
   forbids from the next commit on.
7. **`SECURITY.md` has no already-there rule** — surprises. *Read*: the origin's
   advisories URL as 6b's default. *Had*: a published policy; the readme
   (`readme-and-license.md:32-35`) and the licence (`:51-56`) each say kept, the
   security section (`:69-97`) says nothing, and the splice is init's own write
   rather than the materializer's, so even the conflict rule does not obviously
   apply. *Right*: unknowable from the text.
8. **An existing `README.md` in mode `new` is neither stubbed nor clearly
   renamed** — cosmetic. *Read*: whether a readme exists. *Had*: `README.md`;
   "never rewritten … moved to the lowercase filename, as the existing-repo
   pipeline's second survey pass lists it" (`readme-and-license.md:32-35`) — a
   pass the new pipeline does not run (`new-repo.md:386-390`). *Right*: a shaped
   repo whose readme is at the name the 2026-09-05 lowercase decision retired.
9. **The hook-fragment merge has no input on the three bundles, and the bundle
   doc says it does** — cosmetic. *Read*: `.config/pre-commit.d/*.yaml`
   (`fragments-and-sections.md:105-106`). *Had*: nothing — no gate pack ships a
   fragment; `bundles/repo-gates.md:24-27` claims each does; every hook the four
   gates need is already in the base config
   (`toolchain-gate/pre-commit/config/.config/pre-commit-config.yaml:41-175`).
   *Right*: harmless; a doc falsified by the payload.
10. **`.config/mise.toml` ships instructions a human must follow and init does
    not** — surprises. *Read*: nothing about the runtime. *Had*: a fresh file
    whose comments say keep only the matching runtime block and delete the rest
    (`mise/config/.config/mise.toml:78-89`) and uncomment `_.path` once a
    package manager lands (`:143-146`); init lands it verbatim and no later pass
    edits it — the language pack's own tier does not touch this file
    (`:148-159`). *Right*: no — the one file with a stated stack condition is
    landed unconditionally.
11. **The hygiene editor "baseline" is a Node/Astro/Dart baseline** — cosmetic.
    *Read*: nothing. *Had*: a fresh block excluding `.astro/`, `.dart_tool`,
    `node_modules/`, `tsbuildinfo`, `pnpm-lock.yaml` and configuring a JS/TS
    extension (`repo-hygiene.jsonc:46-54, 89-92, 133`); `.editorconfig:23-24`
    and `.gitattributes:8-9` carry the same shape. *Right*: harmless keys for a
    Go repo, but they are the packs' stack knowledge leaking into the one tier
    meant to have none.
12. **The issue-template forms are GitHub furniture landed on every forge** —
    cosmetic. *Read*: the origin host, but only for the vulnerability entry
    (`new-repo.md:104-112`) and the forge pass (`:635-641`). *Had*: a GitLab
    origin still gets `.github/ISSUE_TEMPLATE/`; an existing `.github/` tree
    gets a second set of templates beside its own on a filename miss. *Right*:
    conditional on the forge, which init already reads.
13. **"Sub-project directory" is the one read of the source tree, and it is
    undefined** — surprises. *Read*: directory names, by a rule nowhere written
    (`new-repo.md:141, 151`; `SKILL.md:295-298`). *Had*: `docs/`, `scripts/`,
    `packages/*`, `apps/*` — any of them may be proposed as a project id and a
    `p:<id>:*` group and commit scope created for it; the confirmation round
    (`SKILL.md:287-334`) is the only guard. *Right*: this is where a registry or
    a workspace manifest would have answered.
14. **Setup's blank-vs-code fork is computed and thrown away before init** —
    cosmetic today, the seam D2 needs. *Read*: setup reads manifests and source
    directories (`plugins/vwf/skills/setup/SKILL.md:169-174`); init reads none
    of it and takes no argument (`SKILL.md:127-129`). *Had*: the same repo
    classified twice, once with evidence and once without. *Right*: the evidence
    exists one step earlier in the same run.
15. **Every member carries a full copy of every gate config** — cosmetic.
    *Read*: `.gitmodules`. *Had*: N members, N identical `dprint.json`,
    `gitleaks.toml`, `grype.yaml`, `pre-commit-config.yaml`, drifting from the
    day one is edited; the lockfile is per repo by design (`SKILL.md:512-516`).
    *Right*: per-repo gates are the model; the duplication is the cost, and
    nothing records that they started identical.

## D2 candidates

What the greenfield mode would have to read to choose its shape, and which
landed paths would become conditional — named here, decided at D2's interview.

**Reads to add before the plan is shown:**

- `docs/blueprint/registry.yaml` where it exists — platforms and languages per
  project — and `stacks:` pins in `.config/vwf.yaml` on a re-run; today only the
  roster is read (`SKILL.md:244-246`) and the ids (`new-repo.md:139-140`).
- The language manifests and workspace files, read-only, for what setup's fork
  already reads (`plugins/vwf/skills/setup/SKILL.md:169-174`) — or the fork's
  verdict handed down, since init runs from setup alone.
- The forge host, already read for the pass, before the hygiene landing.
- The full landing set against the tree **before** consent, with a rule per
  outcome — land, keep, offer, merge — so a with-source repo gets the existing
  pipeline's replace-or-keep row (`SKILL.md:476-481`) or a stated equivalent,
  and `kept_files` records it.
- A definition of "sub-project directory", or its replacement by the registry /
  workspace read above.

**Landed paths that would become conditional**, from the register's
stack-conditional column:

| Path                                                               | Would condition on                                   |
| ------------------------------------------------------------------ | ---------------------------------------------------- |
| `.gitignore` stack sections                                        | detected or pinned languages, not the empty lockfile |
| `.config/mise.toml` runtime block, `_.path`                        | the detected runtime and package manager             |
| `.github/ISSUE_TEMPLATE/**`                                        | the forge host                                       |
| `renovate.json` managers                                           | the detected package managers                        |
| the hygiene editor fragment's exclude lists                        | the detected languages, or split into language packs |
| `.editorconfig` `[*.{py,dart}]`, `.gitattributes` `pnpm-lock.yaml` | the same                                             |

**Whether a config-of-intent replaces payload copying** is the third question
the request asked; this walk's evidence for it is finding 1 (the copy has no
answer for an existing file) and finding 10 (the copy carries instructions it
cannot follow). The brownfield walk and the landing register carry the rest.
