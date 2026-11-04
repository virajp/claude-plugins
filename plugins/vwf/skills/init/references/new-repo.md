# The New-Repo Pipeline

Read this in mode **blank** and in mode **source** — the two modes of SKILL.md's
table whose repo carries no `.config/bootstrap.toml` and no old layout, so
nothing has landed there yet. Modes **shaped** and **old layout** are
[existing repo](existing-repo.md)'s, which reaches the steps below every mode
shares. Nothing here reads or moves a source file in either mode.

The questions in SKILL.md are already answered. Present the whole plan
below, get **one** consent, then apply it in this order. The order is the
contract: a step that runs early because it happens to be cheap produces a
tree the next step has to undo.

Everything below runs **once per repo that resolved to `blank` or `source`** —
every such member first, in the resolved order, then the base — under that one
plan and that one consent. The bootstrap step alone runs once, for the base, and
covers them all.

## What these modes borrow

Both modes run the existing pipeline's *Missing files* pass, inside the same one
plan, over `init`'s own hygiene assets: its rows sit in that repo's section of the
plan beside this pipeline's. The conditional line of SKILL.md's one plan, **if
bootstrap leaves its sync uncommitted, commit it first**, is in every such
section.

## 1 — The repository itself

"The repository" is the repo this pass is running in — the base on the base's
pass, that member on a member's.

Where there is none, run a plain `git init` and stop there. No branch of `init`'s
naming, no commit, no remote: bootstrap's `docs/sync` makes the first commit and
the core branches.

Where a repository already exists, leave it alone here.

**A resolved member is never created here.** "Where there is none" means a repo
that is genuinely new — in practice the base, where the run started outside any
repository at all. A member is a repo the product already declares and that
exists somewhere; one that is missing from this machine is **absent**, not
uncreated, and absence is answered by the **clone row** in the plan, not by
`git init`. Creating an empty repo at a member's path would fill that path with
something that shares nothing but a name with the repo the product means — and
the clone that should have landed there afterwards then has nowhere to go.

So: a member with a clone source is cloned by its row and shaped in this same
run, and by the time this pass runs in it the repo is on disk and already had
commits. A member with **no** clone source gets no row at all: report it as
absent and uncloneable under *Deferred*, naming the unlock — add it to the
product's membership with a source it can be cloned from, then run
`/vwf:setup reshape` — and shape nothing at that path.

Report what was created and what was already there.

## 2 — The bootstrap step

**SKILL.md's bootstrap step is this step**, the prompt quoted there word for
word: once, for the base, after the clone rows and the clean-tree check. Its
gate decides which repos reach the rest of this file, and its green read decides
where `.config/stackgen.yaml` goes. The toolchain, the gates, the hooks, the
branch model, the secrets tools and the record of the repo — its
`.config/bootstrap.toml` — are all bootstrap's, and `init` passes nothing to them.

## 3 — The hygiene assets

**`init`'s own hygiene assets**, from
`${CLAUDE_PLUGIN_ROOT}/skills/init/assets/hygiene/`, laid down as
[hygiene assets](readme-and-license.md) states, in each repo the gate let
through. The files that wait for an answer land in
*The readme stub, the licence and the security file*. No adapter is fetched, and
no materializer is called.

Each asset is a row of *Missing files* in [existing repo](existing-repo.md). A
readme, a licence, a security file or any other hygiene asset the repo already
carries is kept on the already-there rule, and reported as kept.

**A decline is a deferral, not a halt**: record what was skipped and name its
unlock — run `/vwf:setup reshape` with the write consented — then continue with
the rest of the pipeline. This is the same rule `/vwf:setup`'s tooling step
follows.

**The record has a home in every mode, because `init` makes one.** Where no
`.config/vwf.yaml` exists in the base — the ordinary case on a first run, since
`/vwf:setup` is what writes the file in full — `init` writes a **stub** there,
in the plan as one create row, carrying exactly two blocks and nothing else:
`config_format`, at the value `${CLAUDE_PLUGIN_ROOT}/assets/vwf-config.md`'s
schema heading names, and `enforcement`, holding `kept_files`. No roster, no
product name, no project — every other key is `/vwf:setup`'s, and its
migration and fill passes complete the stub on the run that follows, reading
the block it finds as its own. So a keep is always **recorded**, in a
member's turn as much as the base's; there is no Deferred line for it, save where
the base itself stopped at the bootstrap step, and nothing is re-asked on the next
reshape for want of the file. The stub is written only where a keep needs it;
where the file **does** exist, the keep is merged into it in place.

## 4 — The placeholders

Runs in **every mode**, after the hygiene assets land and before the commit step
— the existing pipeline reaches it from its apply — over every file this run
landed, in whichever mode it landed.

Three, and no others: `<REPO_URL>`, `<YEAR>` and `<HOLDER>`. The placeholder
vocabulary in [hygiene assets](readme-and-license.md) is authoritative for
what each means; fill every occurrence across every landed file, from:

| Placeholder  | Source                                                        |
| ------------ | ------------------------------------------------------------- |
| `<REPO_URL>` | the origin remote's web URL, no trailing slash                |
| `<YEAR>`     | the current year                                              |
| `<HOLDER>`   | `git config user.name`, confirmed in the plan before applying |

A placeholder whose source is missing — no origin remote, no configured name
— is **asked**, once, rather than guessed or left in place. A `<` surviving in
a landed file after this step is a bug, not a template.

**One occurrence of `<REPO_URL>` is the security contact's, not the repo
URL's.** In the hygiene assets' `SECURITY.md` that token is the whole reporting
channel, and it takes question 2b's answer as typed — a URL or an email —
spliced by the contact procedure in [readme and licence](readme-and-license.md)
rather than filled here. Every other occurrence is the origin URL, per the table.

## 5 — The template fallback

Retired. The ignore file is bootstrap's git tool, a shared superset — a pattern
for a tree the repo never produces matching nothing — so no language template is
fetched and none is asked for, by `init` or by a pack. A repo's own ignore lines
are `[overrides.gitignore]` in its `.config/bootstrap.toml`, which `docs/sync`
keeps; `init` reads and writes neither.

## 6 — The project ids

**`init` writes no project id today.** None of its own files carries one, so it
asks no question for them, and a project's task group comes from a pack's
`p/_project/` tasks through `/vwf:setup`'s materialize pass. This section is where
the source order stays written down, for the one reader outside this skill,
`/vwf:doctor`'s Project ids predicate, and for any own file of `init`'s that comes
to use an id.

Resolve the project ids **for the repo this pass is running in**, in this order
of preference.

On the **base**:

1. the **registry ids** in `.config/vwf.yaml`, where the file exists and names
   projects;
2. otherwise each **sub-project directory** name, as defined below;
3. otherwise the project's **type** — a platform token from the closed per-role
   lists `${CLAUDE_PLUGIN_ROOT}/assets/templates/registry.yaml` carries.

On a **member**, the same three steps, with the first one reading a hop out —
the list that knows which projects live in a member is the base's:

1. the **`projects:` list on this member's entry** in the base's
   `.config/vwf.yaml`, where that file exists and declares one;
2. otherwise each **sub-project directory** name inside the member, by the
   same definition;
3. otherwise the same **type**, for that member's project.

**A sub-project directory is defined here, once.** Where a registry exists, the
sub-project directories are the registry's `projects[].path` list, and nothing
else in the tree is one. Where none does, the term is live in **`source` mode
only**, and means a non-root directory that carries its **own language manifest**
from the table below, or that a **workspace file** at the root enumerates as a
member. `docs/`, `scripts/`, `.config/`, `.github/` and any dot-directory never
qualify, whatever they carry. A `blank` repo proposes none. The workspace files
that enumerate members are these, read for the member paths or globs they list and
nothing else:

```text
pnpm-workspace.yaml     the `packages:` globs
melos.yaml              the `packages:` globs
Cargo.toml              a `[workspace]` table's `members`
go.work                 its `use` directives
```

A glob is expanded against the tree and each directory it matches is one
sub-project; a directory the glob matches that carries no manifest is still
one, since the workspace file is the declaration.

| Manifest found                          | Language |
| --------------------------------------- | -------- |
| `package.json`                          | node     |
| `pyproject.toml` or `requirements.txt`  | python   |
| `pubspec.yaml`                          | dart     |
| `go.mod`                                | go       |
| `Cargo.toml`                            | rust     |
| `Package.swift`                         | swift    |
| a root `*.xcodeproj` directory          | swift    |
| a `settings.gradle(.kts)`               | kotlin   |
| a lone `build.gradle(.kts)`             | kotlin   |

A file not in this table is not a manifest, whatever it looks like — the one
directory it admits is an Xcode project at the top of the directory being
read, never deeper, whose dependency list lives inside it. A Gradle build is
one project at the directory holding `settings.gradle.kts` or
`settings.gradle`; the `build.gradle.kts` or `build.gradle` files of its
modules below it are never read as further projects. A `build.gradle(.kts)` is
a manifest alone only where no settings file sits beside it or above it in the
same build. A Gradle build reads as kotlin only when it holds a
`settings.gradle.kts` or any `*.kt` file; a build with neither (Groovy build
files and Java code alone) names no language. A Gradle build or a `*.xcodeproj`
in a directory below one that holds `pubspec.yaml` — a Flutter app's
`android/` and `ios/` — is a platform edge of that Flutter project, never a
sub-project.

**The repo's own name is not a source, on either list.** A task group's segment
says what a task acts **on**, and the repo is where the task lives, not what it
operates on.

**Two projects in one repo resolving to the same token** are proposed as
`<token>-<directory-slug>` each. A group's segment is a directory name in the
task library, so two groups cannot share one; across repos there is nothing to
resolve, since each repo's task library is its own. The base's project list is
never reused for a member: two repos in one product share a blueprint, not a task
vocabulary.

**Source 1 is live only on a re-run**, on either list. `.config/vwf.yaml`'s
projects are written by `/vwf:setup`, which runs *after* `init`, so a first run on
a fresh product always falls through to source 2 or 3 in every repo.

**Then slugify.** The resolved id is not used raw: it is slugified per the
stack adapter's `assets/ids.md`, which owns the rule and is the only place it
is written down. Read the asset; never re-derive the rule here.

## 7 — The readme stub, the licence and the security file

Runs in **every mode**, after the hygiene assets land and before the commit step
— the existing pipeline reaches it from its apply — since questions 2a and 2b are
asked whatever the mode, and a repo shaped years ago is as entitled to its answers
as a blank one.

Per [hygiene assets](readme-and-license.md) — the stub from question 1 and the
`repo_name` of the repo's `.config/bootstrap.toml`, the licence question 2a
answered from the assets' licence texts, and the security contact 2b answered,
spliced into the assets' security template, each on that reference's already-there
rule, so a file the repo carries is kept and reported rather than written over.
The rest of the hygiene assets landed in *The hygiene assets*; these three wait
for their answers and are placed here.

## 8 — The commit step

**`init` commits nothing itself.** bootstrap's hook refuses a commit on a
protected core branch, so `init` could not commit first in any case: it lands
through `/vwf:git-workflow`, which makes each commit after it isolates the work
and owns branches, protected core branches, `merge_model`, conflicts, failures
and reruns. This section writes no branch, merge task, hook bypass or conflict
rule of its own; every one of those is that skill's.

**What bootstrap left, per repo.** Immediately after the bootstrap step, before
`init` writes anything, read `git status --porcelain` in each repo the gate let
through. The tree was clean before the step, so what it prints is **bootstrap's
sync** — unless the user told `docs/sync` to commit it, in which case it prints
nothing — and those paths, resolved member paths aside, are that repo's first
commit. Then everything `init` wrote or deleted in that repo after that read is
its second: the hygiene files, the `.config/vwf.yaml` stub or `kept_files` entry,
the `.config/stackgen.yaml` deletion, and the readme rename with its caller
rewrites.

**The hand-over.** In each repo, **members before the base**, invoke
`/vwf:git-workflow`, declaring per that skill's *Caller Preferences*:

1. the commits to make, in order, each with its paths and its message:

   ```text
   ops: sync the shared files from bootstrap
   ops: shape the repo with its hygiene files
   ```

   The first only where bootstrap left a sync. The second only where `init` has
   something of its own there, the gitlinks below included. Hand the two as paths,
   never as a staged index: a path staged early rides the first commit, which is
   why the readme rename is a `git mv` that skill makes while it stages the second;
2. the consent's answer, as the post-commit action of that skill's
   *Step 4 — Post-Commit Action*: **commit** means commit only, with no push;
   **commit and push** means land and push.

A repo with neither commit has **nothing to land** and gets no hand-over. There
is no commit spanning two repos, because there is no such thing.

**The base's gitlinks.** Its second commit stages `init`'s own files **plus** the
gitlinks those member commits moved, and these are the one thing `init` hands over
that it did not write: a superproject records which commit of each member it is
pinned to, and leaving the moved pointers out would leave the base half-committed
— a report saying the product is shaped over a tree that still says it is not.
Because the members go first, the base commits with each member at the commit this
run just gave it. The report keeps the `Gitlinks staged` line.

**Where each repo stands, before any of it.** In each resolved repo that has
commits, `git symbolic-ref -q HEAD` names the branch checked out. A repo that
answers nothing is **detached**, and a detached member is a **refused plan row**,
not a repo that commits: the row names the branch to check out — `develop` where
the member has it, else its mainline — that member's shaping is deferred under
*Deferred* with that checkout as the unlock, and the base's gitlink for it is
**not** moved. The read runs at survey time for a member that was present, and
immediately after its clone row for one this run cloned. The mechanics and the
row's wording are [existing repo](existing-repo.md)'s. A member that was absent
and whose clone was declined never ran the pipeline: it is **skipped** here, and
its line says that rather than printing it as a repo that committed nothing.

**What `/vwf:git-workflow` does not land.** A repo it refuses, or that stops on a
failure or a conflict, is reported with that skill's reason and is `pending` on
its `Forge` line. `init` does not retry it, and it continues with the next repo.

## 9 — The forge pass

The one step that writes to the forge, and it runs **once for the product,
after the base lands**. It sets three things and no fourth: each repo's **default
branch**, the **protection** on its core branches, and the product's **backlog
project**. Everything else the forge holds — who may push, who reviews,
required checks, the repo's description, its visibility — is nobody's here.
The pass never creates a remote and never pushes.

**Eligibility.** A repo takes the pass where `/vwf:git-workflow` landed it with a
push this run — `direct` pushed the core branch, or `pr` opened the pull request —
or where it had **nothing to land** and its core branches already exist on
`origin`. Any other repo — the answer was **commit**, it has no remote, that skill
did not land it, or the bootstrap step stopped it — is listed as `pending` on its
`Forge` line with that reason, and nothing is set for it: a default branch on a
forge that does not have the branch yet is a setting the next push has to undo.
When the stopped repo is the base, the pass does not run at all, and a run with no
eligible repo skips the whole step in one line.

**The precondition, per repo**, is the same shape the backlog skill's is
(`${CLAUDE_PLUGIN_ROOT}/skills/backlog/references/github.md` §Precondition),
and a miss here is **never a stop**: report the reason on that repo's `Forge`
line, print the by-hand list below for it, and continue with the next repo.

1. The forge, from the `origin` host: `github.com` or any host
   `gh auth status` lists is GitHub; `gitlab.com` or any host
   `glab auth status` lists is GitLab; anything else has no CLI here and takes
   the by-hand list outright.
2. The CLI on `PATH` — `command -v gh`, `command -v glab`.
3. Logged in to that host — `gh auth status --hostname <host>`,
   `glab auth status --hostname <host>`. On GitHub the token needs the `repo`
   scope, which is what the same command's `Token scopes:` line shows.
4. **Admin on the repo is not tested up front.** A ruleset write without it
   is refused by the forge, and that refusal is reported on the `Forge` line
   the same way a failed login is — reason named, by-hand list printed, run
   continuing.

**The visibility default, read at question 2.** The same precondition is what
lets question 2 propose a default before the plan, and the read is this — run
in each repo that has an `origin`, at question time, and never again:

```text
gh repo view --json visibility --jq .visibility          → PUBLIC | PRIVATE | INTERNAL
glab repo view --output json --jq .visibility            → public | private | internal
```

`INTERNAL` and `internal` propose `private`. No `origin`, a forge with no
CLI, a precondition miss or a failed read all propose `private` — and the
question says which of them it was, so a user who expected `public` learns
why they did not get it. The value is only a **default**: the row is still
answered, and what the forge says is never written anywhere in the tree.

**The plan for the pass, and its one consent.** Before writing anything,
build the per-repo table and show it once: the repo, the default branch it
will set, the protection it will add to each core branch, and, for each of those,
whether the forge already carries one — then the backlog line for the base. One
question, apply or stop; a stop prints the same table as the by-hand list and the
run continues to the report. Where every row reads as already set and the backlog
project is present, there is nothing to ask, and the report says so. The table is
built from these reads, in this order:

- **The default branch.** One row per repo, **`develop` preselected** where it
  exists, `main` the other. The branch model does not depend on the answer — work
  flows into `develop` and from there into `main` either way — but a forge
  opens pull requests, shows a landing page and clones against its default,
  and `develop` is where that traffic belongs on a product whose `main` takes
  nothing but merges. Nothing in the tree records the answer: the forge is
  the record, and doctor's Forge state predicate reads it back from there.
- **The protection, each of `main` and `develop` the repo has, always**: no
  force-push and no deletion. Then **per branch, from that branch's own value** —
  `merge_model` of `[branch.develop]` for `develop` and of `[branch.main]` for
  `main`, in that repo's `.config/bootstrap.toml`, a missing file or key reading
  `direct`: where the value is **`pr`**, additionally **require a pull request**,
  with no approval count, because the landing model says that branch lands through
  a request, so a direct push to it is exactly what the forge should refuse.
  Where it is `direct` the merge tasks push the merge themselves, and a
  require-pull-request rule would refuse the model the repo chose. Any branch of
  another name is neither set default nor protected.
- **The idempotence check, per branch.** A branch that is already protected
  in any form is **left exactly as it is** and reported as such — never
  merged with, never replaced, however different its rules are from the two
  above. On GitHub: a ruleset named `vwf-<branch>` in
  `gh api repos/{owner}/{repo}/rulesets`, any rule at all in
  `gh api repos/{owner}/{repo}/rules/branches/<branch>`, or a classic
  protection answering at
  `gh api repos/{owner}/{repo}/branches/<branch>/protection`. On GitLab: the
  branch's name in `glab api projects/:id/protected_branches`. The default
  branch is set regardless — it is one value, and setting it to what it
  already is changes nothing.

**The writes, per forge.** Each is one call per repo or per branch; their
exact text is here so nothing is improvised at apply time.

GitHub — the default branch, then one **ruleset** per branch, named
`vwf-<branch>`, through the rulesets endpoint and never the classic
protection one:

```text
gh repo edit --default-branch <branch>

gh api repos/{owner}/{repo}/rulesets --method POST --input - <<'JSON'
{
  "name": "vwf-<branch>",
  "target": "branch",
  "enforcement": "active",
  "conditions": { "ref_name": { "include": ["refs/heads/<branch>"], "exclude": [] } },
  "rules": [
    { "type": "non_fast_forward" },
    { "type": "deletion" },
    { "type": "pull_request",
      "parameters": { "required_approving_review_count": 0,
                      "dismiss_stale_reviews_on_push": false,
                      "require_code_owner_review": false,
                      "require_last_push_approval": false,
                      "required_review_thread_resolution": false } }
  ]
}
JSON
```

The third rule is present **only where that branch's value is `pr`**; where
it is `direct` the `rules` list is the first two. The payload is passed as a file
or on standard input, never assembled from `-f` fields — a nested object does not
survive that.

GitLab — the default branch, then one **protected branch** per branch, with
force-push refused; a protected branch cannot be deleted, which is the second
rule for free:

```text
glab repo update --defaultBranch <branch>

glab api projects/:id/protected_branches --method POST \
  -f name=<branch> -F allow_force_push=false \
  -F push_access_level=<level> -F merge_access_level=30
```

`<level>` is read per branch from that branch's value: `30` under `direct` —
developers may push, which is what the merge tasks do — and `0` under `pr`,
where nobody pushes to the branch directly and it takes merges alone, which
is how GitLab spells *require a merge request*.

Any other forge: print the table as the by-hand list and set nothing.

**The backlog project, base only, last.** It is the backlog skill's, and
`init` never runs `gh project create` or anything like it — a project made
that way carries no template. What `init` does is **invoke that skill's
missing-project procedure by name**
(`${CLAUDE_PLUGIN_ROOT}/skills/backlog/references/github.md` §Missing project):
the skill's own precondition — which needs the `project` scope this pass did
not — the browser hand-over with the URL and the two settings, the title rule,
the wait for the word, the re-find, and the field bootstrap afterwards, all
exactly as that reference spells them. Before invoking it, resolve the project
as that reference does; one **present** is reported `present` and skipped.
On GitLab, print the skill's own "not yet supported" line on the
`Backlog project` line and continue. On another forge, ask the user to create it
by hand and say so on the line. A decline inside the procedure, or a precondition
miss on the `project` scope, reads `pending` with its reason — the next
`/vwf:backlog add` reaches the same procedure.

**The by-hand list** is what a repo gets wherever the pass could not act for
it — no CLI for the forge, a failed precondition, a refused call, or the
consent declined. It is the same table, printed for that repo alone, in the
words a person applies on the forge's settings pages: set the default branch
to `<branch>`; on each core branch, refuse force-pushes and deletion, and require
a pull request on whichever has `merge_model = "pr"`; and, for the base, create
the backlog project per the backlog skill. The hygiene assets' `CONTRIBUTING.md`,
at the repo's root, carries the same by-hand form of the default-branch line, so
the list points there rather than restating it.

## 10 — The report

The report and the two next-step lines, exactly as SKILL.md specifies — including
how the sections are grouped when a run shaped more than one repo, which is
written down there and is not restated here. A `blank` repo's report is mostly
*files written*; *files kept*, *files moved* and *calls rewritten* all read `none`,
which is the honest shape of a tree that had nothing to reconcile. A `source`
repo's report carries whatever the borrowed pass did on the same lines the
existing pipeline prints them on.

The git section is **one line per repo**, in the order the repos ran — the members,
then the base: the commits, what `/vwf:git-workflow` did, or its reason where it
did not land, and what the forge pass set. A member refused for standing detached
takes its *Deferred* line instead, naming the branch to check out. A repo the
bootstrap step stopped is named with its reason and, where it left files
uncommitted, the `git status --short` and the remedy SKILL.md gives. A repo that
kept `.config/stackgen.yaml` because it did not read green is named with the
reason, drift or drift unknown. Then one `Gitlinks staged <n>` line for the base,
counting the member pointers its second commit carried, which reads `none` in a
product with no members, and one `Backlog project` line, the base's alone.
