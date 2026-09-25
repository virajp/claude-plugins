# mise — the repo's toolchain manager

**One manager, one command surface.** mise does three jobs for this repo: it
**pins** the tool versions the repo runs on, **holds** the environment values
those tools and tasks read, and **runs** the repo's tasks. A repo with two task
runners has two vocabularies for the same commands, and only one of them is the
one anything else invokes.

**All of it lives under `.config/`.** mise resolves `MISE_ENV` variants there,
so the config never clutters the repo root.

**Five files, selected by `MISE_ENV`.** `mise.toml` always; `mise.dev.toml`
under `MISE_ENV=dev`; `mise.ci.toml` under `MISE_ENV=ci`, which covers both the
pipeline and the deployed runtime; `mise.test.toml` as a delta on dev under
`MISE_ENV=dev,test`; and `mise.local.toml`, which is never committed and never
shipped. mise loads the base first and deep-merges the active variants on top,
so a variant holds **deltas only**.

**A fresh checkout trusts nothing.** mise refuses to read a config file it has
not been told to trust, and the trust record is per machine, kept outside the
repo and never committed. So `mise trust --all`, run from the repo root, is the
first command a clone runs — before `setup:all`, and before `mise tasks` will
list the library at all. `--all` and not bare `mise trust`, which trusts one
file and leaves the rest of the split for the next command to fail on.

**Nothing is duplicated across layers.** A tool pinned twice is a version that
can disagree with itself, and the disagreement surfaces on someone else's
machine. Each tool, setting and env value goes in the lowest layer that needs
it: the base holds the runtime and anything the pipeline runs, dev holds the
tooling only a human needs, ci holds the pipeline's overrides.

**A tool CI runs belongs in the base.** `MISE_ENV=ci` never loads the dev file,
so a gate pinned there is a gate the pipeline cannot run. The dev file's job is
what a laptop needs and a runner does not.

**The house linter is the base's one tool.** `npm:@askviraj/linter` is pinned
in `mise.toml` at an exact version, and the `code:lint` of the pnpm, eslint,
flutter, swift and swiftui packs calls it as `linter`. One pin is one version
those packs agree on, where a per-run fetch is whatever the registry serves that
minute; it is in the base because the pipeline runs `code:lint`. mise installs
it without a package manager, but the binary is a Node script and needs a
`node` on PATH: a Node repo's own pin, or — where the packs pin none, as swift,
swiftui, flutter and uv do not — the machine's. The pin carries
`allow_low_downloads = true` because mise's installer refuses a package under
its weekly-download threshold on a first, unlocked install; the exemption is
this package's alone. The pin also fixes this package only: its dependencies
resolve within its own ranges at install time, and their lifecycle scripts run
only when listed in `allow_builds`, which the pin leaves empty.

**Latest, but never brand new; and CI resolves nothing.** Fuzzy pins defer any
release younger than `minimum_release_age`, and `lockfile = true` records what
they resolved to. The pipeline sets `locked = true` and installs from that
record. So moving a version forward is a deliberate act with a diff, and a
release nobody has run never reaches a build.

**One lockfile per config file that declares tools, and every one is tracked.**
`mise install` writes a lock beside each config whose `[tools]` is non-empty,
named after that file's stem: with the split as shipped — the house linter in
the base, nine dev tools — the files produced are `.config/mise.lock` and
`.config/mise.dev.lock`, and a runtime pinned in `mise.toml` joins the first.
The single exception is `mise.local.lock`, the counterpart of the uncommitted
`mise.local.toml`, which the hygiene component already ignores.

**`REPO_NAME` is the repo's folder name, slugified, and it is a literal.** The
base `[env]` carries it as a marked position the orchestrator fills with the
slug of the repo's own main-checkout directory — **not** a project id, which is
what the `p:<id>:*` task group carries instead. The two tokens are independent,
and a single-project repo whose folder spells its project id is a coincidence.
`setup:all`'s member flags and the `setup-<slug>` aliases take a third: one per
**member repo**, that member's own slug. It is never derived at load time: the
obvious shorthand, the basename of the config root, is the **branch** name
inside a linked worktree, so anything reading it would silently address a
different repo depending on where you were standing. Aliases that vary only by
repo — the agent launchers are the case — live in the user's **global** config
and read `$REPO_NAME`, so one definition serves every repo and changing the
launcher is not a change to every repo that has one.

**The runtime is a marked position too, and the base ships it empty.**
`RUNTIME_BLOCK` under `[settings]` and `PATH_ENTRIES` at the end of `[env]` are
the two slots the orchestrator fills from its stack read — the languages the
repo's pins, lockfile or manifests name — one runtime settings line per
detected language in the first, the `_.path` entries a project-local binary
directory needs in the second, and nothing in either for a language the repo
does not have. A setting for an absent runtime is a claim about the stack that
is not true, and a hand-picked one is the edit that turns a pack-owned file
into a diverged one; a marked position is what the content hash ignores, so
the fill is never drift. `REPO_NAME`, `MERGE_MODEL_DEVELOP`, `MERGE_MODEL_MAIN`,
`MEMBERS` and these two are the base's six, and the only marked positions in
the config split.

**Environment names are shared; values are split.** Development and production
override the *same* keys rather than each inventing their own — the difference
between the two layers is a value, never a vocabulary. Names here, values never
committed as secrets.

**Tasks are files, not inline strings.** Executable files under
`.config/mise/tasks/`, where the directory path *is* the task name:
`.config/mise/tasks/code/format` → `mise run code:format`. Inline `[tasks.*]`
TOML is reserved for trivial run-strings and `depends` aggregations. Every one
is bash, and every one passes the shell gates — the library has to run on a
runner that has no other shell.

**Three groups, and the first two are a contract.** `setup:*` is bootstrap and
re-sync, `code:*` is the gates and the git operations, `p:<project-id>:*` is one
project's own commands. `setup:all` is the one-command bootstrap; `code:all` is
the one-command gate; `setup:worktree` is the lighter sibling a fresh worktree
runs. Renaming one breaks every caller that never read this file — including
vwf, which probes for these names. `p:*` is the opposite: every name in it is
this repo's own, and nothing outside the repo may depend on one.

**Some tasks ship as slots, and a slot is visible.** A task whose name is part
of the contract but whose mechanism belongs to a stack nobody has pinned yet
carries a `#PLACEHOLDER` marker, announces itself, lists every other unfilled
slot in the repo, and **exits 0** — so an unconfigured repo can still run
`code:all` and `setup:all` end to end. A slot stops being one by being
**overwritten**, never by being edited in place.

**The editor is set up by the same command as everything else.** `setup:vscode`
is `setup:all`'s last step: it reconciles a profile named after `REPO_NAME` with
the recommendation list the repo composed, installing what is missing and
**removing what is installed there and no longer listed**. A per-repo profile
rather than a global install, because accepting a recommendation globally leaves
a repo's whole toolchain enabled in every other window forever — and because
pruning is only safe once it is scoped to one profile. Silent on a machine
without the editor. The pack's own editor fragment,
`.config/vscode.d/mise.jsonc`, lands only where init's editor answer is vscode
— `pack.yaml`'s `conditional:` names it.

**A task never clobbers what it did not create.** Foreign state — another hook
manager's install, a `core.hooksPath` someone set, a lockfile or a plugin pin
the repo tracks — is stopped at, named, and left for the one by-hand command the
task prints. Every destructive step sits behind a flag passed on purpose:
`setup:precommit --force`, `setup:precommit --update`, `setup:mise --upgrade`.
`setup:all` passes none of them, so a bootstrap on any clone rewrites nothing
outside the files the packs own.

**The commit identity is per repo, required, and equal to the forge's.**
`code:git-config`, which the hooks run, requires the local git-config to carry
the identity and ssh-signing keys equal to `<FORGE>_USER_NAME`, `<FORGE>_EMAIL`
and `<FORGE>_SIGNING_KEY` — `GITHUB_`, `GITLAB_` or `GIT_` by the origin host —
and its `--fix` sets them from those variables rather than deleting anything: a
machine states who it commits as once, in its environment, and every repo it
touches is corrected to match. The correction refuses the commit that triggered
it — git had already loaded its identity when the hook ran — and the re-run
carries the new one.

**The repo's agent plugins are the repo's, and a user's are theirs.**
`setup:ai` installs and updates only what this repo requires, at **project**
scope, so the declaration lives in the repo's own settings and nothing a machine
chose globally is installed, updated or pruned; `--user` is the rare exception,
and it is a flag rather than the default.

**No task edits a remote's settings.** Setting the forge's default branch is a
one-time act by whoever shapes the repo, not something a machine re-runs on
every bootstrap, so the library carries no task for it and the repo's
CONTRIBUTING stub names the command instead. It is orthogonal to the merge tasks
in any case — work flows feature → `develop` → `main` whatever the forge calls
default.

**How a branch lands is the repo's setting, not the lander's — and it is set
per branch.** `MERGE_MODEL_DEVELOP` and `MERGE_MODEL_MAIN` in the base `[env]`
each read `direct` — merge locally and push — or `pr`, which pushes the branch
and opens a pull request through whichever forge CLI is present, and merges
nothing locally; `code:merge:develop` reads the first, `code:merge:main` the
second, and a file still carrying the single legacy `MERGE_MODEL` is read as
both. Repo-level values rather than flags, because which one applies follows
from the repo's review policy and not from who is landing; one per branch
because `develop` and `main` carry different review policies more often than
the same one.

**One configuration per tool, and the task is where it lives.** Every gate hook
calls `mise run code:<gate>` rather than the tool, and the three gate tasks take
an optional file list so the same task serves a per-file hook and a whole-tree
run. A tool configured in both a task and a hook has two settings that drift in
the direction nobody is looking — the commit rewriting a file `code:all` would
have left alone. Customising a gate means editing the task.

**Hooks run before staging, not after.** `code:precommit` runs the hooks over
the working tree's changed files, so the rewrites they make fold into the commit
you were about to write. The merge tasks re-run them over everything as a safety
net and **fail** if anything changed — a fixup belongs on the branch that caused
it, never on a merge commit.

**The pipeline runs the identical task names.** CI installs mise, sets
`MISE_ENV=ci`, and calls `mise run code:all` — the same command a developer
runs. That is the whole point of the manager: a gate that passes locally and
fails in CI is a gate that ran a different command.

**This component gates nothing and defines no build.** What each gate *checks*
belongs to the gate components; the CI system's workflow syntax belongs to the
CI system; a language's build commands belong to that language — the tasks wrap
them rather than define them. A capability provider adds its tool and its env
defaults through `.config/mise/conf.d/<provider>.toml`, so this component's own
files never learn a provider's name.
