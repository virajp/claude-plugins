# U1 — init hands the repo shape to bootstrap

- **Read first:** every owned file, top to bottom, before editing.
- **Lazy-load:** `plugins/vwf/skills/setup/SKILL.md` (Step 0 and `reshape`,
  read only), `plugins/vwf/skills/doctor/references/stack-checks.md` (read
  only), `plugins/vwf/skills/git-workflow/SKILL.md` (read only: the
  landing that D37 hands to it; U4 edits it in the same wave, so cite it
  by name and step title, not by line), a fresh shallow clone of bootstrap
  for `README.md` and
  `docs/sync/index.md` (read only, removed after).

## Ruling

> - D4: init runs bootstrap's readme prompt, quoted word for word in init's
>   SKILL.md and attributed to bootstrap's README.md. The same prompt also
>   brings an adopted repository up to date, so /vwf:setup reshape reaches it
>   through init. init drafts no values block and asks none of the questions
>   docs/sync/ asks.
> - D5: init keeps the hygiene files (README, LICENSE, CONTRIBUTING;
>   CONTRIBUTING rewritten to bootstrap terms), the enforcement.kept_files
>   record in .config/vwf.yaml, and the forge pass (the backlog project; the PR
>   rule expected from [branch.*].merge_model in .config/bootstrap.toml). It
>   drops the secrets-provider pass, the git landing question, the trust
>   check, the mise run init step and the _default slots.
>   init/references/tool-configs.md is deleted.
> - D6: Shaped means the repository has .config/bootstrap.toml. Drift means
>   mise run setup:configs --dry-run shows a change. A repository with
>   .config/stackgen.yaml and no .config/bootstrap.toml is old layout: setup
>   Step 0 offers init. A .config/stackgen.yaml beside a .config/bootstrap.toml
>   is a doctor Leftovers row. init deletes .config/stackgen.yaml after a green
>   adoption.
> - D3: git-workflow reads merge_model of [branch.<destination>] from the
>   .config/bootstrap.toml of each repository; missing file or key means
>   direct. The MERGE_MODEL_* env reads are deleted.
> - D12: optional-tools runs first; read the owned files as that plan left
>   them.
> - D14: init keeps the sections that write its own files: §1 (the
>   repository itself, git init before bootstrap), §4 placeholders, §5
>   template fallback, §7 renamed The project ids (the ids its own files
>   use; the rest of §7 that fed the all call is deleted), §8 readme,
>   licence and security file, §11(f) the forge pass, and §12 the report,
>   rewritten without the rows of deleted steps. It deletes §2 the all call
>   (replaced by the bootstrap step), §3 the secrets provider (D5), §6 hook
>   fragments, §9 trust and mise run init, §10 the aggregator, §11(a) the
>   landing model and §11(e) the push. §11(b) to (d) become one step: after
>   bootstrap ends, hand the commits to /vwf:git-workflow with one consent
>   (D37).
> - D24: init keeps only the passes of existing-repo.md for its own files:
>   pass 2 the readme and pass 6 missing files. It deletes passes 1, 3, 4, 5,
>   7, 8, 9 and 10, the hook-manager row and The gate configuration commits
>   first, alone: bootstrap's docs/sync owns them (migrate.md M3, M10). Every
>   citation of an existing-repo pass names it by its title, never by number.
> - D25: init reads no value from .config/stackgen.yaml and carries none
>   over before it deletes the file. bootstrap's docs/sync decides
>   [branch.*].merge_model in .config/bootstrap.toml during adoption; members
>   stay in .config/vwf.yaml, and the forge is read live.
> - D34: bootstrap's github tool owns the issue forms; init deletes its
>   .github/ISSUE_TEMPLATE assets and every row or sentence that lands them.
> - D35: The user ruled: init stops in that repo. It writes no hygiene file,
>   records no kept_files, makes no commit, no push and no forge pass there,
>   and the report names the repo and the reason. The other repos continue.
>   A stopped step can leave bootstrap's files uncommitted in that repo; the
>   report then shows git status for it and says: commit or discard
>   bootstrap's partial sync, then re-run /vwf:setup reshape (the user's
>   ruling). init never cleans or commits a partial sync, and D38's
>   clean-tree check stays strict. When the stopped repo is the base, the
>   forge pass does not run (D23).
> - D36: The user ruled: bootstrap's sync is committed first. When the
>   bootstrap step leaves changed or untracked files in a repo, init's one
>   plan lists a first commit of those files in that repo, and the one
>   consent covers it; init's own files go in a second commit. git-workflow
>   makes both commits (D37). The first commit message names bootstrap's
>   sync. Members commit before the base, as D32 says.
> - D37: The user ruled: init lands through vwf's git-workflow skill, not a
>   landing engine of its own. In each repo, members before the base, init
>   hands /vwf:git-workflow the commits to make, in order: the
>   bootstrap-sync commit of D36 when there is one, then init's own files
>   with the gitlinks of D32. git-workflow makes both commits itself, after
>   it isolates the work (a commit on a protected core branch is refused by
>   bootstrap's hook, so init cannot commit first), and owns branches,
>   protected core branches, merge_model, conflicts, failures and reruns.
>   init's one consent is the answer git-workflow needs: commit means commit
>   only, with no push; commit and push means land and push. init has no
>   push step of its own: §11(e) is deleted. A repo is pushed for the forge
>   pass (D23) when git-workflow landed it with a push: direct pushed the
>   core branch, or pr opened the pull request (the user's ruling). A repo
>   git-workflow does not land is reported with its reason and is pending on
>   its Forge line.
> - D38: Before the bootstrap step, init checks every repo, the base and
>   each member. If any tree is not clean, init stops the whole run before
>   it writes anything and lists each dirty repo. The one plan carries a
>   conditional line per repo: if bootstrap leaves its sync uncommitted,
>   commit it first.
> - D42: A task group comes only from a pack's p/_project/ tasks through
>   setup's materialize pass. init drops question 1 (repo_name is
>   bootstrap's) and keeps question 2 only where its own files use the ids.
> - D43: Bootstrap creates develop and main. §1 runs a plain git init.
> - D44: A repo with no commit and untracked files stops the whole run
>   (D38); the report says to commit the files and re-run.
> - D41: init calls no materializer. Pass 6 runs over init's own hygiene
>   assets only. From §2, the hygiene-asset lay-down and the
>   .config/vwf.yaml stub that holds kept_files survive in the hygiene step.
> - D23: init's one consent asks commit, or commit and push; git-workflow
>   does the landing and the push (D37), members before the base, never a
>   force-push. The forge pass runs once for the product, after the base
>   lands, for each repo that git-workflow landed with a push this run
>   (direct pushed the core branch, or pr opened the pull request), and for
>   each repo that had nothing to land and whose core branches already exist
>   on origin (the user's ruling); any other repo is pending on its Forge
>   line with the reason.
> - D15: Green means the repository has .config/bootstrap.toml and mise run
>   setup:configs --dry-run shows no change. init deletes
>   .config/stackgen.yaml in each repository, base and each member, that is
>   green, inside init's one consent; a repository that is not green keeps it,
>   and the report names it.
> - D16: By the exit code and the output. Exit 0 with no change listed means
>   no drift; a listed change means drift; exit 5, or any other failure, means
>   drift unknown. doctor reports unknown as a warning with the reason; setup
>   Step 0 says it could not check drift and continues as current; init treats
>   the repository as not green, keeps .config/stackgen.yaml and names the
>   repository in the report.
> - D18: init's one plan, shown before the bootstrap step, lists delete
>   .config/stackgen.yaml if the repository is green for each repository
>   that has the file; the one consent covers it. The deletion rides init's
>   own commit in that repository, base and each member, with init's own
>   files; git-workflow makes that commit (D37).
> - D19: The dry-run prints its lines on stderr, each with the prefix
>   repo-sync: (bootstrap's _scripts/repo-sync, _rs_log). Read stderr. After
>   that prefix, a line that starts with would (would update, would remove,
>   would chmod, would set bootstrap_commit) is a change. Lines that read
>   unchanged, kept seed or skip are not. No would line and exit 0 means no
>   drift. doctor, setup, init and recall all parse it this way.

The prompt, quoted exactly as bootstrap's `README.md` carries it (a `text`
fence, line breaks as they are):

```text
Make this repository, each of its git submodules and each of its sibling
repositories get their shared files from bootstrap. Clone
git@github.com:virajp/bootstrap.git with --filter=blob:none into a temporary
directory. Read docs/sync/index.md in the clone, and do its steps in sequence. Read the other
files of docs/sync/ when index.md tells you to. Apply only what is relevant to
this repository. Ask me before each choice that docs/sync/ does not decide.
```

> - D21: Every live mention of MISE_ENV=dev mise run setup:all becomes
>   MISE_ENV=dev mise run setup, and a bare mise run setup:all becomes mise
>   run setup; setup is the task bootstrap ships (setup/_default). The
>   MISE_ENV=dev prefix stays where it is today, because bootstrap loads no
>   conf.d file without MISE_ENV. History rows keep their text.

## Edits

1. **`plugins/vwf/skills/init/SKILL.md`**
   - Frontmatter `description`: replace "landed through stackgen's
     tool-config skill" and the list of tool configs with: init hands the
     repo shape (tool configs, mise, gates, hooks, branch model, secrets
     tools, Claude plugins) to bootstrap through its readme prompt, then
     lands its own hygiene files, the `kept_files` record and the forge
     pass. Keep the frontmatter strict YAML.
   - The charter (today 6, 35–63): bootstrap owns every universal file and
     `.config/bootstrap.toml`; init writes none of them. Remove the
     "`stackgen.yaml` single writer" text.
   - Remove every `tool-config all` / `preview all` call, the flag table and
     the flag mapping (83, 116, 376–412, 487, 570–574).
   - Step 0 mode test (225–250): `shaped` = `.config/bootstrap.toml` exists;
     `old layout` = `.config/stackgen.yaml` without `.config/bootstrap.toml`,
     or the older `conf.d/tools.toml`, `conf.d/env.toml`,
     `.config/mise.dev.toml`; `source` = code and neither file; `blank` as
     today. Old layout and source both run the bootstrap step.
   - A new step, "The bootstrap step", first in the apply order: give the
     quoted prompt (above) to the session as the instruction, once for the
     base repository; the prompt itself covers the submodules and siblings.
     Name the source: bootstrap `README.md`. The prompt is the consent to
     start; bootstrap's docs/sync asks its own questions. Then, per D15,
     delete `.config/stackgen.yaml` in each green repository (base and each
     member) with the consent shown in init's one plan, and name each
     repository that is not green in the report.
   - The baseline order (634–665): bootstrap step, then hygiene files, then
     `kept_files`, then the forge pass. Delete the secrets-provider pass,
     the trust check, `mise run init`, the `_default` slots and the git
     landing question (§11(a)).
   - `kept_files` (609–614): remove the sentence that excludes files
     tool-config writes "because its preview shows it as a row"; files
     bootstrap writes are never recorded in `kept_files` — bootstrap's own
     `setup:configs --dry-run` judges them.
   - 628: `.gitignore` belongs to bootstrap's git tool.
2. **`plugins/vwf/skills/init/references/new-repo.md`** — replace §2 (the
   `all` call) with the bootstrap step; delete the `# <<< tool-config`
   marker text (145), "The values `all` writes" and the `_default` slot
   (450–492), §9 trust and `mise run init` (521–566), §10 the aggregator,
   §6 the hook fragments, the parts of §7 that fed `all`, and §11(a)
   (623–650). Replace §11(b) to (d) with the one step of D14 and D37, whose
   consent has two answers, commit or commit and push (D23). Delete
   §11(e), the push: git-workflow pushes (D37). Delete §3, the secrets provider (D5). Rename
   §7 to exactly "The project ids" (U3 cites it by that title, with no
   number). Keep §12, the report, without the rows of deleted steps. Keep
   §1, §4, §5, §8 and §11(f); renumber the sections left and every
   cross-reference to them in the owned files.
   The forge pass eligibility (823–850) reads D23: a repo takes the pass
   where git-workflow landed it with a push this run — direct pushed the
   core branch, or pr opened the pull request — or where it had nothing to
   land and its core branches already exist on origin. The forge pass (890–891) decides "PR rule expected" from `merge_model`
   of `[branch.main]` and `[branch.develop]` in the base's
   `.config/bootstrap.toml`, default `direct`. Ignore-file attributions
   (312, 670) name bootstrap's git tool. The record of the repo is its
   `.config/bootstrap.toml` (196).
3. **`plugins/vwf/skills/init/references/existing-repo.md`** — shaped vs
   source keyed on `.config/bootstrap.toml` (3–11). Per D24, delete passes
   1 (root files, 50), 3 (task names, 287), 4 (shebangs, 337), 5 (the helper
   library, 352), 7 (the ignore file, 577), 8 (per-project groups, 587), 9
   (repo-only tasks, 652) and 10 (the commit-scope argument, 699), the
   hook-manager row (239) and "The gate configuration commits first, alone"
   (970). Keep pass 2 (the readme) and pass 6 (missing files, the
   `kept_files` record), the latter without the tool-config exclusion text
   (460, 929). Renumber the passes left and cite each pass by its title,
   never by number, in the owned files.
   The apply order (864–915) starts with the bootstrap step. Report lines
   (1006–1126) lose the tool-config rows.
4. **`plugins/vwf/skills/init/references/readme-and-license.md`** — delete
   "What moved to the tool-config skill" (169–171); the assets run after
   the bootstrap step (8, 26); task names `code:format`, `code:lint`,
   `code:sec`, `code:precommit` (37–38); no `stackgen.yaml`.
4a. **D34** — delete `plugins/vwf/skills/init/assets/hygiene/.github/`
    (the three issue forms) with `rm`, its row in
    `references/readme-and-license.md` (19), and every sentence in the
    owned files that lands the issue forms. Bootstrap's github tool writes
    them.
4c. **D36** — when the bootstrap step leaves changed or untracked files in
    a repo (the user kept bootstrap's sync for review), init's one plan
    lists a first commit of those files in that repo, named as bootstrap's
    sync, and the one consent covers it. init's own files go in a second
    commit. Members commit before the base (D32). Write this into the
    commit step that replaces §11(b) to (d) and into the report.
4d. **D37** — the commit step that replaces §11(b) to (d) lands through
    `/vwf:git-workflow`: in each repo, members before the base, invoke
    git-workflow with the two commits to make, in order — the D36 sync
    commit when there is one, then init's own files and the D32 gitlinks —
    and the consent's answer, commit only or land and push. git-workflow
    makes the commits after it isolates the work; init commits nothing
    itself, since bootstrap's hook refuses a commit on a protected core
    branch. Write no branch, merge task, `SKIP` or conflict rule of init's
    own; cite git-workflow for them. Report a repo it does not land with
    git-workflow's reason.
4e. **D38** — before the bootstrap step, init checks every repo, base
    and members. Any tree that is not clean stops the whole run before
    init writes anything, and the report lists each dirty repo. The one
    plan carries a conditional line per repo: "if bootstrap leaves its
    sync uncommitted, commit it first" (D36).
4h. **D41** — init calls no materializer. In `SKILL.md`, delete the
    materializer detection (320–335) and its halt when none is installed,
    and every sentence that feeds pass 6 from the materializer's conflict
    list (245–248). Pass 6, missing files, runs over init's own hygiene
    assets only (`existing-repo.md` 446; `new-repo.md` 233–247). From §2 of
    `new-repo.md`, keep the hygiene-asset lay-down (172–177) and the
    `.config/vwf.yaml` stub that holds `kept_files` (249–262), moved into
    the hygiene step; delete "The answers each fetch carries" (184–232) and
    the materializer's Skipped and conflict rows, except the hygiene skips
    on init's own condition.
4i. **D42** — delete question 1 (the repo name; `repo_name` is
    bootstrap's) and every `p/<slug>/_default` slot (`new-repo.md` 485).
    Keep question 2 (the project ids) only where init's own files use
    them; a project's task group comes from setup's materialize pass.
4j. **D43** — §1 runs a plain `git init` and nothing more: no first branch
    named `develop`, no `main` created later. Bootstrap's `docs/sync` makes
    the first commit and the core branches. Delete every sentence that says
    init creates a branch.
4k. **D44** — D38 covers a repo with no commit: untracked files there
    stop the whole run, and the report says "commit your files, then re-run
    `/vwf:setup reshape`". A repo with no commit and no files is clean.
4b. **D35** — the bootstrap step's result gates the rest per repo: a repo
    with no `.config/bootstrap.toml` after the step gets no hygiene file,
    no `kept_files` record, no commit, no push and no forge pass, and the
    report names it with the reason. The other repos continue. When the
    stopped step left bootstrap's files uncommitted, the report shows
    `git status --short` for that repo and the remedy: commit or discard
    the partial sync, then re-run `/vwf:setup reshape`. init never cleans
    or commits a partial sync. Write this into the apply order (SKILL.md)
    and the report section.
5. **`plugins/vwf/skills/init/references/tool-configs.md`** — delete the file
   with `rm`; remove every link to it in the owned files.
6. **`plugins/vwf/skills/init/assets/hygiene/CONTRIBUTING.md`** — rewrite to
   bootstrap terms: the merge model is `[branch.<branch>].merge_model` in
   `.config/bootstrap.toml`, changed through bootstrap's docs/sync (not
   `all --merge-model-main`); the tasks are `code:format`, `code:lint`,
   `code:sec`, `code:precommit`, `code:merge:develop`, `code:merge:main`;
   no `code:*:all`, no `code:check:all`. This file lands in user repos: no
   plugin-relative path (checker rule 13).

- **D32** — the user's ruling: members commit first; the base commit
  stages init's own files plus the gitlinks the member commits moved, and
  the report keeps the "Gitlinks staged" line (`init/SKILL.md` 129, 716;
  `new-repo.md` 600–610, 1002). A member on a detached HEAD stays a refused
  row. Keep that text through the §11 rewrite.
- **D30** — doctor's predicates are cited by title, never by letter, since
  U3 renumbers them in the same wave. Rewrite `init/SKILL.md` (817: "(a)
  through (f)", "(g)"), `references/existing-repo.md` (489: "predicate
  (e)", which is Content drift) and `references/new-repo.md` (888:
  "predicate (g)", which is Forge state). The titles are Pack versions,
  Project ids, Branches, Content drift, Bootstrap drift and Forge state.

- **D21, every owned file** — replace each live `setup:all` with
  `setup`, keeping a `MISE_ENV=dev` prefix where the line has one (init); leave history rows as they are. Verify with
  `grep -rn "setup:all"` over the owned paths: only history rows remain.

## Verification

- `mise x -- mise run code:format` and `mise x -- mise run p:plugins:check`
  are green.
- `grep -rn -iE 'tool-config|stackgen\.yaml|MERGE_MODEL|code:[a-z]+:all' plugins/vwf/skills/init/`
  returns only lines that name `.config/stackgen.yaml` as the old-layout
  signal or the file init deletes.
- `grep -c 'Make this repository, each of its git submodules' plugins/vwf/skills/init/SKILL.md`
  is 1.

## Guardrails

- Touch nothing outside `plugins/vwf/skills/init/**`. setup, doctor and
  git-workflow are other units'; report a falsified passage there as
  `DOCS FALSIFIED:`.
- Delete with `rm`, never `git rm`.
- `plugins/**/*.md` is not formatted by dprint: match the surrounding fold
  width by hand. Keep each code span on one line.
- Do not run `--fix` on any formatter or linter outside the owned paths.

## Commit

`feat: init hands the repo shape to bootstrap through its readme prompt`
