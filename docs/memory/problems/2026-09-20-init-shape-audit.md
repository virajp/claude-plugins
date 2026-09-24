# Problem — init shape audit: the ranked summary and the D2 candidates

```text
PROBLEM 2026-09-20 ★5 | init/shape-audit | 57 findings over 3 read-only walks — 9 block a user, 33 surprise, 15 cosmetic; mode is decided by two markers so a source repo is shaped as "new" and every file it already had is a conflict nobody resolves; 4 pack tasks rewrite host state on first run | D2 candidates: 3 greenfield reads, 10 brownfield read-before-land rules, 5 config-of-intent questions, 1 docs fix
```

**Date** 2026-09-20 · **Branch** `plan/2026-09-20-init-shape-audit` · **Plan**
[`docs/plans/2026-09-20-init-shape-audit/`](../../plans/2026-09-20-init-shape-audit/index.md)
· **Unit** U4

Mirrors the mempalace drawer (wing `ai-plugins`, room `problems`); both stores
written together, per `plugins/vwf/assets/memory.md`.

## What was audited

Three walks, one file each, every finding cited `file:line` against the worktree
at this plan's branch:

- **G** — [the greenfield walk](2026-09-20-init-shape-audit-greenfield.md): mode
  `new`, blank and with source, and its members walk — 22-row register, 15
  findings.
- **B** — [the brownfield walk](2026-09-20-init-shape-audit-brownfield.md):
  every pass of `existing-repo.md` in order, and its members walk — 21-row
  register, 20 findings.
- **L** —
  [the landing register](2026-09-20-init-shape-audit-landing-register.md): all
  58 `config/` files of the three unconditional bundles, the composed and
  derived files, the assumption map — 32-row register, 22 findings.

The method is decision 1: read-only walks of `plugins/vwf/skills/init/`, its
references, and the three bundles' payloads under `plugins/stackgen/stacks/`. No
scratch repo, no emulated fixture. The lens is decision 5 — for every landed
path: what init read from the repo first, what the repo plausibly already had
and what became of it, and whether the landing is right for a repo whose stack
the registry names. The `.vscode` collision is ruled by
`2026-09-20-init-editor-dedupe` and is cited, never re-audited.

The user's three observations, and where each landed:

| Observation                                           | Answered by                                                                                                                                                                                            |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| init laid down a shape that ignored what the repo had | the mode boundary (B1, G3, L5) and the table below — a source repo with no `.config/` is "new", and mode `new` reads nothing but two markers                                                           |
| duplicates and conflicts beyond `.vscode`             | the paired-config findings: G4, G5, B6, B12, B14, B15, L12, L13, L18, L19, L20 — two configs of one tool live side by side, and the pack's is the one the gate or the bot reads                        |
| side effects not yet observed                         | the first-run task findings: L2, L3, L4, L6, L8, L15, L16, B4, B9 — pack-owned tasks rewrite hooks, identity, lockfile hashes and the tool lock on the host, and doctor then reads the result as drift |

## Findings, ranked

Every numbered finding from the three walks, once each, ordered blocks a user →
surprises a user → cosmetic, and within a tier by how many repos meet it. A
finding another walk reached from its own side is marked *same seam as*.

### Blocks a user

1. **B1** — a brownfield repo without `.config/` never enters the existing
   pipeline; every read-before-land pass is skipped and the materializer's
   conflict list is the only thing that notices what was there. *Same seam as*
   G1, L5.
2. **L4** — `setup:precommit` unsets `core.hooksPath` and installs with
   `--overwrite`; a husky or lefthook repo loses its hook wiring silently, and
   no survey pass reads `core.hooksPath`, `.husky/` or `lefthook.yml`. *Same
   seam as* G3, B6.
3. **L1** — the composed `.vscode/*.json` carry `//` markers and the shipped
   `check-json` has no `.vscode/` exclude; the first commit that stages either
   fails on a file init wrote. This repo carries the exclude by hand.
4. **L3** — `code:git-config --fix` runs under the gate with `always_run` and
   unsets a local `user.email` / `user.name` / signing key without asking; the
   next commit lands under the global identity.
5. **B4** — a root `.gitleaks.toml` is left in place and unread while `code:sec`
   passes `--config .config/gitleaks.toml`; every previously allowlisted finding
   fails the `sec` hook on the first commit.
6. **L2** — `code:sec` without `--staged` runs `gitleaks dir .`, which reads
   gitignored files, and the allowlist omits `.env`; a populated local `.env`
   fails `code:all` and the merge safety net.
7. **G2** — `.gitignore`'s stack sections are keyed on a materializer lockfile
   that names no language at greenfield; a Node or Python repo without its own
   file gets no `node_modules/` or `.venv/` line and the first `git add` stages
   the dependency tree.
8. **B2** — pass 1's rename map is derived from every pack `config/` path by
   basename and includes the task library; a root `install`, `main`, `lint`,
   `format` or `all` entry is proposed as a move into `.config/mise/tasks/**`.
9. **B3** — a submodule member cloned by the run's own clone row is detached;
   its shaping commit lands on no branch, the pushed branches lack it and the
   base's gitlink points at it.

### Surprises a user

10. **G1** — in mode `new` a pre-existing file at any landing path is a
    materializer conflict the pipeline never resolves: no lockfile entry, no
    `kept_files` record, no plan row, no report — neither adopt nor flatten, but
    silence. *Same seam as* B1, L5.
11. **L5** — the same `.gitignore` is offered replace-or-keep when an empty
    `.config/` exists and left unoffered when it does not; mode is the only
    thing that differs.
12. **G3** — the mode test cannot see a root `mise.toml`, a root
    `.pre-commit-config.yaml` or husky; all survive the run untouched until the
    §10 aggregator disarms them. *Same seam as* L4, B6.
13. **B6** — a root `.pre-commit-config.yaml` is not a basename match and stays
    live; the gate-first commit's premise — that the hooks read the file it
    commits — is false until `setup:precommit` runs, which the existing pipeline
    never invokes.
14. **L8** — `code:format --fix` is the commit hook and runs dprint over every
    file its eight plugins claim plus `shfmt -i 2 -ci` over every tracked shell
    file; a prettier, black or 4-space-shell repo is reformatted at the first
    commit and the merge safety net refuses until the whole tree has been.
15. **B7** — `.gitignore` is a binary offer on brownfield: replace discards the
    repo's patterns, keep leaves the pack's base sections out for ever.
16. **B5** — the existing pipeline never names §3, §4, §8, §9 or §10 of the
    new-repo path: placeholders stay unfilled, the licence and security-contact
    questions are asked and land nowhere, the secrets provider is asked and
    never materialized, the aggregator is never offered.
17. **L6** — `pre-commit autoupdate` and `dprint config update`, both run by
    pack tasks, rewrite two lockfile-recorded files outside any marked position;
    after one `setup:all` both read as content drift, offered every reshape and
    red under doctor (e).
18. **L7** — the same drift by init's own hand: the ignore-section append and
    the hook-fragment merge change two files after the materializer hashed them,
    and only a replace re-records a hash.
19. **B9** — a replace of a file the lockfile does not record has no named
    writer, and the post-fill hash the reference promises is written by nothing;
    the file is re-offered next run.
20. **B11** — pass 6 compares an unrecorded file against the pack's raw bytes,
    which carry `<REPO_URL>` and an empty scope list, so a hand-completed copy
    of any hygiene or gate file is always "diverged".
21. **G5** — a `.github/renovate.json` is shadowed by the landed root
    `renovate.json`, and the caveat init prints says the file sits under
    `.config/` where the bot cannot see it — the opposite of what happened.
    *Same seam as* B12, L12.
22. **B12** — the root `renovate.json` create shadows `.github/renovate.json` or
    `.renovaterc` silently; nothing reads them.
23. **L12** — `renovate.json` at the root is the first path Renovate reads; a
    Dependabot repo gets a second bot policy, and no survey pass looks for
    either.
24. **G4** — a root `dprint.json` that is a real config is shadowed by the gate
    (`code:format` reads `.config/dprint.json` by path) and kept by the editor
    and a bare `dprint fmt`; the hook enforces the config the user did not
    write.
25. **G6** — the `ops:` commit lands on whatever branch a source repo has
    checked out, under whatever hooks it has; a repo on `main` with history
    takes a direct commit the shipped model forbids from the next commit on.
    *Same seam as* B13, L14.
26. **B13** — `no-commit-to-branch --branch main` lands in every repo; a repo
    that works on `main` gets `develop` created but stays checked out on `main`
    and is refused its next commit once hooks re-install.
27. **L14** — `no-commit-to-branch`, `_scripts/merge` and `code:worktrees`
    hardcode `main` and `develop`, and the branch table has no row for `master`
    or `trunk`; what init does there is unspecified.
28. **B14** — a root `mise.toml` is moved to `.config/mise.toml` and then
    offered with default keep; a kept file with no marked keys has nowhere for
    pass 9's fills to go.
29. **B15** — inline `[tasks.*]` in a mise config are invisible to passes 3, 4
    and 10; a same-named file task lands beside the TOML one.
30. **G10** — `.config/mise.toml` ships instructions a human must follow — keep
    one runtime block, uncomment `_.path` — and init lands it verbatim; no later
    pass edits it.
31. **G13** — "sub-project directory" is the one read of the source tree init
    makes and it is undefined; `docs/`, `scripts/`, `packages/*` may each be
    proposed as a project id with a `p:<id>:*` group and a commit scope.
32. **L15** — `grype --fail-on medium` with an empty ignore list turns
    `code:all` red on any brownfield repo with a medium transitive advisory, day
    one, with no baseline step the way gitleaks documents one.
33. **L9** — `editor.defaultFormatter: dprint.dprint` is set editor-wide; a repo
    pinning ruff, eslint or dart format has format-on-save call dprint for those
    files unless a language fragment overrides it.
34. **L10** — the hygiene editor baseline carries Node, TS, Dart, Astro and
    Turbo excludes, a JS/TS-only extension, a fish extension and a YAML server,
    against its own rule that a tool-naming key belongs to that tool's pack.
    *Same seam as* G11.
35. **L11** — `.github/ISSUE_TEMPLATE/*` lands on every forge and beside any
    templates under other filenames, producing two bug forms; init reads the
    origin host twice, both after hygiene landed. *Same seam as* G12.
36. **L13** — `trailing-whitespace` ships with no markdown exemption while
    `.editorconfig` preserves markdown hard breaks; two landed files disagree
    and the hook wins.
37. **L16** — `setup:mise` runs `mise upgrade --local` against nine `latest`
    pins, moving the tool lock every `setup:all`; `setup:ai` installs a graphify
    post-commit hook that `--overwrite` does not see.
38. **B8** — pass 1 reports every root entry off the allowlist — source
    directories, manifests, gitignored trees — under Deferred every run, so a
    shaped brownfield repo never reads clean.
39. **B10** — a keep or an editor answer on a product not yet through
    `/vwf:setup` is deferred and re-asked on every reshape.
40. **G7** — `SECURITY.md` has no already-there rule in mode `new`; the readme
    and the licence each say kept, the security section says nothing.
41. **L17** — `.gitignore` ships `fnox.local.toml` though the provider is
    question 4's pick; the baseline names one provider by file.
42. **B16** — pass 2 rewrites no reference to `README.md`, where pass 3 rewrites
    every caller of a renamed task.

### Cosmetic

43. **G14** — setup's blank-vs-code fork classifies the repo with evidence one
    step before init classifies it without, and hands init nothing — the seam D2
    needs.
44. **G8** — an existing `README.md` in mode `new` is neither stubbed nor
    clearly renamed; the rename is a pass mode `new` does not run.
45. **G11** — the hygiene editor "baseline" is a Node/Astro/Dart baseline;
    `.editorconfig` and `.gitattributes` carry the same shape. *Same seam as*
    L10.
46. **G12** — the issue-template forms are GitHub furniture landed on every
    forge. *Same seam as* L11.
47. **G15** — every member carries a full copy of every gate config, drifting
    from the day one is edited, and nothing records that they started identical.
48. **L20** — four exclusion lists restate one set across `dprint.json`,
    `taplo.toml`, `gitleaks.toml` and `pre-commit-config.yaml`, against the gate
    pack's stated-once rule.
49. **L18** — `dprint-editor.jsonc`'s even-better-toml fallback keys disagree
    with `taplo.toml` on `arrayAutoCollapse` and `indentEntries`.
50. **L19** — the nesting map lists `.env` and `CLAUDE.md` under two parents
    each; VS Code picks the first silently.
51. **B17** — pass 8 has no rule for a commit type outside both the closed set
    and the legacy map.
52. **B20** — which licence spellings count as "already carries a licence file"
    is unspecified; only `LICENSE` is on the allowlist.
53. **B19** — `.git/` is exempt from pass 1 by implication only.
54. **B18** — three prose contradictions: `task-library.md:631-634` (an unmapped
    call is moved, not flagged), the renovate caveat in
    `hygiene/conventions.md:216-220` and `readme-and-license.md:114-119` (lands
    at root, not `.config/`), and the hook-config comment
    (`pre-commit-config.yaml:201-204`) against the merge algorithm.
55. **G9** — the hook-fragment merge has no input on the three bundles and
    `bundles/repo-gates.md:24-27` says each gate ships one. *Same seam as* L22.
56. **L22** — no gate pack ships a `.config/pre-commit.d/<gate>.yaml`; the
    tree's only fragment is `package-manager/uv`'s.
57. **L21** — the hygiene `CONTRIBUTING.md:35` names `/vwf:init`, a command
    nobody can type since 2026-09-06.

Items 54–57 are stale passages in `plugins/**`, which this plan never edits
(decision 7); they ride D2 or a docs-sync as findings, not fixes here.

## What the repo already had that init ignored

The subset answering the user's first observation. "Init does" is today's
behaviour in the mode named; where the two modes differ the cell says both.

| Path a repo already has                                      | What it is                             | What init does                                                                                                                         | Finding      |
| ------------------------------------------------------------ | -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| language manifests, lockfiles, workspace files               | the stack                              | never read — the mode test is two markers, the ignore sections read a lockfile that names nothing on a first run                       | B1, G2, G14  |
| root `mise.toml` / `.mise.toml` with `[tools]` and `[tasks]` | the repo's task runner                 | new: not a landing path, coexists unread. existing: `mise.toml` moved then offered keep; `.mise.toml` and inline `[tasks.*]` invisible | G3, B14, B15 |
| root `.pre-commit-config.yaml`, `.husky/`, `lefthook.yml`    | the hook manager, with hooks installed | not a basename match, unread; stays live until `setup:precommit` unsets `core.hooksPath` and reinstalls with `--overwrite`             | B6, L4, G3   |
| root `.gitleaks.toml`, `.grype.yaml`                         | the scanner allowlists                 | unread; `code:sec` passes `--config` for the `.config/` copy, so the allowlist stops applying                                          | B4           |
| root `dprint.json` (real), `.dprint.json`, `.prettierrc`     | the formatter config                   | new: conflict, unlanded. existing: real `dprint.json` is move-and-shim; the dotted forms and prettier stay and are reported            | G4           |
| `.gitignore`                                                 | the ignore file                        | new: conflict, base sections never reach it. existing: binary replace-or-keep; a respelled pattern is doubled by the append            | G1, B7, L5   |
| `.github/renovate.json`, `.renovaterc`, `dependabot.yml`     | the dependency-update policy           | unread; a root `renovate.json` lands and Renovate reads it first                                                                       | G5, B12, L12 |
| `.github/ISSUE_TEMPLATE/*` under other names, `workflows/`   | the forge furniture                    | pass 1 sees `.github/` as one allowed entry and never looks inside; the pack's three forms land beside the repo's                      | L11, G12     |
| `.github/CONTRIBUTING.md`, `.github/SECURITY.md`, `docs/…`   | the contribution guide and the policy  | unread; the pack's root files land or are offered, and the forge picks root                                                            | G7, B5       |
| `README.md`                                                  | the readme                             | new: no stub, rename unspecified. existing: renamed, no caller rewritten                                                               | G8, B16      |
| `LICENSE.md`, `LICENCE`, `COPYING`                           | the licence under another spelling     | off the allowlist, reported every run; which spellings count as "has a licence" is unspecified                                         | B20          |
| a local `user.email` / `user.name` / signing key             | a work identity set per repo           | `code:git-config --fix` unsets it at the next commit                                                                                   | L3           |
| a populated local `.env`                                     | real values, correctly gitignored      | `gitleaks dir .` reads it and the allowlist omits it                                                                                   | L2           |
| the checked-out branch, `master` / `trunk` as the mainline   | the branch model                       | the `ops:` commit lands where the repo stands; `main` and `develop` are created, never read                                            | G6, B13, L14 |
| root `install`, `main`, `lint`, `format`, `all` entries      | a script or a directory                | pass 1's basename map proposes a move into the task library                                                                            | B2           |
| `.vscode/settings.json`, `extensions.json`                   | the editor settings                    | read whole, collision round — ruled by `2026-09-20-init-editor-dedupe`                                                                 | ruled        |

## D2 candidates

The union of the three walks' candidate lists, deduplicated. Each names the
findings it would close and which of the request's three questions it is: a
**greenfield read** (what init reads before choosing a shape), a **brownfield
read-before-land** rule (what an existing path gets instead of a conflict or a
report), or a **config-of-intent** question (what a declaration would replace or
condition instead of a byte copy). Named here, decided at D2's interview.

| #  | Candidate                                                                                                                                                                                                                                                                       | Closes                   | Kind                        |
| -- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ | --------------------------- |
| 1  | Mode detection reads root tool configs, a language manifest and the registry, not only `.config/` and the task library — or setup's blank-vs-code verdict is handed down, since init runs from setup alone                                                                      | B1, G1, G3, L5, G14      | greenfield read             |
| 2  | Read `docs/blueprint/registry.yaml` and `stacks:` before the plan is shown, and drive the `.gitignore` sections, the `mise.toml` runtime block and `_.path` from the detected or pinned stack rather than the empty first-run lockfile                                          | G2, G10                  | greenfield read             |
| 3  | Define "sub-project directory", or replace it with the registry or workspace read above                                                                                                                                                                                         | G13                      | greenfield read             |
| 4  | Mode `new` gets the existing pipeline's replace-or-keep row — or a stated equivalent — for every path the materializer reports as a conflict, recorded in `kept_files`; the full landing set is checked against the tree before consent                                         | G1, L5, G7, G8           | brownfield read-before-land |
| 5  | Every root tool config a landed pack supersedes is offered a move with content, not a report: `.pre-commit-config.yaml`, `.mise.toml`, `.gitleaks.toml`, `.grype.yaml`, `.dprint.json`, `.github/renovate.json`, `.renovaterc`, `dependabot.yml`                                | B4, B6, B12, G4, G5, L12 | brownfield read-before-land |
| 6  | Pass 1's rename map matches full declared paths plus each tool's dotted root spellings, never a task-file basename; it skips gitignored entries and never reports a source directory                                                                                            | B2, B8, B19              | brownfield read-before-land |
| 7  | `.gitignore` gets a section merge — the pack's banners appended into the repo's file, patterns compared normalised — in place of the binary offer                                                                                                                               | B7, G2                   | brownfield read-before-land |
| 8  | The survey reads `core.hooksPath`, `.husky/`, `lefthook.yml` and installed hooks before `setup:precommit` or the gate-first commit runs; a foreign hook manager is a plan row, not a silent `--overwrite`                                                                       | L4, B6, G3, G6           | brownfield read-before-land |
| 9  | The existing pipeline states §3, §4, §8, §9 and §10 for its own mode, or skips the questions those steps consume                                                                                                                                                                | B5, B10                  | brownfield read-before-land |
| 10 | The replace, the fill, the append and the merge each name their writer and re-record the lock hash post-fill; `setup:precommit` and `setup:mise` rewrites are either marked positions or re-hashed                                                                              | B9, B11, L6, L7          | brownfield read-before-land |
| 11 | The git pass reads each member's HEAD and refuses or branches a detached member; it reads the repo's mainline name and works on `develop` where it created it, instead of hardcoding `main` and `develop`                                                                       | B3, B13, G6, L14         | brownfield read-before-land |
| 12 | Passes 3, 9 and 10 read inline `[tasks.*]`; a moved root `mise.toml` is merged into the pack's split rather than kept whole; pass 2 rewrites readme callers; pass 8 gains a rule for an unmapped type; the licence spellings are enumerated                                     | B15, B14, B16, B17, B20  | brownfield read-before-land |
| 13 | `kept_files` and `editor_keys` get a home that exists before `/vwf:setup`                                                                                                                                                                                                       | B10                      | brownfield read-before-land |
| 14 | The hygiene root set is rendered from init's own answers: forge suppresses `.github/ISSUE_TEMPLATE/*` off GitHub, an update-bot answer suppresses or relocates `renovate.json`, an editor answer gates every `vscode.d/*` and `setup:vscode`, q4 gates the provider ignore line | L11, G12, L12, L17, G15  | config-of-intent            |
| 15 | The editor baseline keeps editor-wide keys alone; the Node, TS, Dart, Astro, Turbo, fish and YAML keys move to the fragments of the packs that pin those stacks, `.editorconfig` and `.gitattributes` likewise; `defaultFormatter` is scoped per language                       | L10, G11, L9, L18, L19   | config-of-intent            |
| 16 | One declared exclusion set rendered into the four gate files; the grype threshold, the `main`/`develop` names and the trailing-whitespace markdown rule as values, not literals, with a grype baseline step where gitleaks has one                                              | L20, L15, L13, L14       | config-of-intent            |
| 17 | Whether a local git identity is forbidden is a repo policy, not a hook that deletes; `code:sec`'s directory mode respects `.gitignore` or the allowlist names `.env`                                                                                                            | L3, L2                   | config-of-intent            |
| 18 | The task library stays a byte payload and the overlay model stays; D2 owes a survey of what each first-run task does to the host — hook install, tool lock, format, autoupdate — and a consent line per effect                                                                  | L8, L16, L6, L1          | config-of-intent            |
| 19 | The four stale passages in `plugins/**` are corrected in the same plan                                                                                                                                                                                                          | B18, G9, L22, L21        | docs, rides D2              |

The third question the request asked — whether a config-of-intent replaces
payload copying — resolves from rows 14–18 to a split: the hygiene root set, the
editor baseline and the gate values are describable; the task library, the gate
config files themselves and the mise split must stay byte payloads that intent
fills.

## Not a finding

What the walks confirmed already works, so D2 does not re-plan it:

- **The sidecar** — pass 5 moves every unmapped helper function to
  `_scripts/local` before the replace lands, and pass 10 exempts it
  (`existing-repo.md:214-269, 613-623`).
- **The kept-task list** — a task no bundle declares is kept and listed, never
  removed (`existing-repo.md:596-637`).
- **The diverged-file offer** — pass 6's two tests, hash then splice, so a file
  differing only inside marked positions is never offered
  (`existing-repo.md:300-316`).
- **The editor collision round** — ruled and landed by
  `2026-09-20-init-editor-dedupe`; the walks cite it and found nothing new.
- **Move-and-shim for a real root `dprint.json`** — told apart by content, on
  the existing path (`existing-repo.md:94-127`).
- **`LICENSE` kept, readme never rewritten** — both rules hold in both modes
  (`readme-and-license.md:32-35, 51-56`).
- **Pass 3's contention rule** — two files for one destination become offers,
  not a clobber; the 2026-09-05 `_scripts/checks` side effect is closed
  (`existing-repo.md:153-170`).
- **Members first, base last** — the base commits its gitlinks current, under
  submodule linkage with members on a branch (`SKILL.md:451-454`).
- **No two baseline packs write one path** — composition order decides nothing
  among the three bundles today (landing register, §The three bundles).
