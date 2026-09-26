# pre-commit — the local gate, and gate wiring

pre-commit runs the quality gates before a commit is made, so a broken commit
is never created rather than caught later. It is also the wiring that makes the
local gate and CI run the identical command: **every gate hook calls a task
from the repo's task library, and never inlines a command.** A hook that
inlines its command is a second definition of that gate; the two drift the
first time one is edited, after which local and CI disagree and the gate is
worse than absent, because it is trusted.

This reference is the `pre-commit` row of the skill's tool table. The contract
every tool shares — the argument shapes, the block markers, drift, removal and
the lock record — is [the skill's](../SKILL.md); what follows is pre-commit's
own. The files it lands are under
`${CLAUDE_PLUGIN_ROOT}/skills/tool-config/assets/pre-commit/`, laid out as they
land under the repo root.

| Section                                                  | Read before                                          |
| -------------------------------------------------------- | ---------------------------------------------------- |
| [1. What `all` lands](#1-what-all-lands)                 | running `all`, or reading what it landed             |
| [2. The marked positions](#2-the-marked-positions)       | passing `scopes`, or reading the forge links         |
| [3. The global exclude](#3-the-global-exclude)           | `all add exclude`                                    |
| [4. The verbs](#4-the-verbs)                             | any instruction naming `pre-commit`                  |
| [5. The gate doctrine](#5-the-gate-doctrine)             | adding a hook by hand, or reading why one is shaped so |
| [6. The graph refresh hook](#6-the-graph-refresh-hook)   | touching `post-commit` or `code:graph`               |
| [7. The migration](#7-the-migration)                     | running `all` on a repo the old gate pack shaped     |

## 1. What `all` lands

| Landed                                   | As                                                         |
| ---------------------------------------- | ---------------------------------------------------------- |
| `.config/pre-commit-config.yaml`         | the frame, the base unmarked, a `pre-commit` block in `exclude` |
| `.config/git-conventional-commits.yaml`  | the frame, the base unmarked, two marked positions         |
| `.config/linter.yaml`                    | the frame, the base unmarked, a `pre-commit` block in `ignores:` |
| `.config/vscode.d/pre-commit.jsonc`      | the `pre-commit` base block — only when `editor=vscode`    |

Each file follows [the skill's](../SKILL.md#blocks) per-position rule: the
base's entries in a list requesters write into — the global `exclude`, the
linter's `ignores:` — are the `pre-commit` block there, a requester's block
follows it in the same list, and the rest below the frame is the base's,
unmarked. In `repos:` the base's entries are unmarked and a requester's block
follows the last of them. The convention file has no position a requester
writes into, so it carries no block at all.

**The hook config.** Its base, in file order:

- `minimum_pre_commit_version: "3.2.0"` — where `commit`/`push` became
  `pre-commit`/`pre-push`; an older pre-commit silently runs nothing.
- `default_install_hook_types`: `pre-commit`, `commit-msg`, `post-commit` — a
  type not installed is not a hook that fails, it is one that never runs, and
  nothing reports it. `commit-msg` is for the convention hook, `post-commit`
  for [the graph refresh](#6-the-graph-refresh-hook).
- `default_stages: [pre-commit]`, so each hook says only what differs.
- the global `exclude` — [section 3](#3-the-global-exclude).
- a `local` repo: `git-config`, then the three gate hooks `format`, `lint`,
  `sec`, then `graphify-refresh`.
- `pre-commit/pre-commit-hooks` at a pinned rev: large files (1 MB), case
  conflicts, Windows-illegal names, shebang and exec-bit agreement in both
  directions, merge-conflict markers, broken and destroyed symlinks, JSON
  (`.vscode/` excepted — JSONC by design), TOML and YAML syntax, private keys,
  final newline, trailing whitespace (`.md` excepted — two trailing spaces are
  a Markdown hard break), LF line endings, and `no-commit-to-branch` on
  `main`.
- `qoomon/git-conventional-commits` at a pinned rev, at `commit-msg`, reading
  `.config/git-conventional-commits.yaml`.
- the `meta` audit, at `stages: [manual]` — [section 5](#5-the-gate-doctrine).

Requesters' blocks go after the base in `repos:` — each a `# >>> <requester>`
line at the list's indentation, the requester's `- repo:` entries, and the
closing marker. A repo's own hooks are the user's lines: outside every block,
anywhere in the list.

**The commit convention**, `git-conventional-commits.yaml`, is this tool's
because the `commit-msg` hook is what enforces it — a convention nothing checks
is a style note, and the file and its gate must not land separately. It has a
second reader: release notes are generated from it, so a type missing from
`changelog.commitTypes` is work that silently never appears in a release. Ten
types — `feat`, `fix`, `perf`, `refactor`, `revert`, `test`, `ops`, `docs`,
`merge`, `wip` — and `featureCommitTypes` (under `convention:`, not
`changelog:`) decides a **minor** bump: everything else is a patch, and a `!`
or a `BREAKING CHANGE` footer is a major whatever the type.

**The linter config**, `linter.yaml`, is the house linter's one file, read by
every `code:lint` that runs `@askviraj/linter` — whichever pack's task that
is — so it ships with the gate rather than with any one of them. It ships empty
of overrides. Its `ignores:` list is **generated trees only**, since the linter
does not read `.gitignore`: the base holds `**/build/`, `**/graphify-out/` and
`**/.config/mise/locks/` (a `--fix` there breaks the digest `mise.lock`
records), and every other entry is a pack's, through
[`add linter-ignore`](#4-the-verbs) — flutter's `.dart_tool`, swiftpm's
`.build` and `.swiftpm`, swiftui's `Derived` and `DerivedData`, uv's `.venv`.
An entry that skips source, or an override that turns a rule off to get green,
makes a real finding disappear — the one use the file is not for. Fix the
code; where a rule is genuinely wrong for one location, scope the change to
that `files` glob.

**The editor fragment** folds the convention file under the hook config and
turns on the YAML language server — `yaml.completion`, `yaml.hover`, and
`yaml.format.enable` off, because the repo formatter owns YAML — with the
extension that serves those keys. The gate contributes no setting: an editor
running the hooks would be a second definition of it. Its asset carries no
markers; the skill lands its content as the `pre-commit` base block, as
[the skill](../SKILL.md#blocks) says for every editor fragment. It lands only
where `editor=vscode`; on any other answer it is listed under **Skipped**.

**The keys it reads**: `scopes` (default empty) and `editor` (default `none`).
`forge`, `secrets` and `update_bot` are read by no pre-commit file — the forge
links come from `origin`, [below](#2-the-marked-positions).

## 2. The marked positions

Two positions in `git-conventional-commits.yaml`, both inside the
`pre-commit` block, both never drift — a changed input is one row showing the
change.

**`commitScopes`** — one scope per project, each the same id that project's
`p:<id>:*` task group takes, filled from the `scopes` argument (or
`set scopes`) on **every** run, the first included. The empty list the asset
ships is the position, never a state a caller leaves behind on purpose: a
caller with no confirmed ids passes `scopes=` and says so. The list is
**closed and append-only**: a scope the file lists and the argument omits is
kept, with a trailing `# retired` comment saying it is kept for the commits
that used it, since deleting it would invalidate every one of them.
A scope the argument names again loses the comment.

**The changelog links** — `commitUrl`, `commitRangeUrl`, `issueRegexPattern`,
`issueUrl` — are filled by the skill itself, from the repo's `origin` remote,
never from an argument and never by the caller. The remote is read with
`git remote get-url origin` and normalised to `https://<host>/<owner>/<repo>`
— an `scp`-style `git@<host>:<owner>/<repo>.git`, an `ssh://` URL and an
`https://` URL alike, a trailing `.git` dropped. Then by host:

| Host                              | `commitUrl`                     | `commitRangeUrl`                                   | `issueUrl`                     |
| --------------------------------- | ------------------------------- | -------------------------------------------------- | ------------------------------ |
| `github.com` or a subdomain of it | `<base>/commit/%commit%`        | `<base>/compare/%from%...%to%?diff=split`          | `<base>/issues/%issue%`        |
| `gitlab.com` or a subdomain of it | `<base>/-/commit/%commit%`      | `<base>/-/compare/%from%...%to%`                   | `<base>/-/issues/%issue%`      |

with `issueRegexPattern: "#[0-9]+"` on both. The four lines are uncommented
and written as literals. A repo with no `origin`, or one on any other host,
keeps them commented as shipped and the run says so; the next `all` after a
`git remote add` fills them. The notes still generate without them, just
without links.

## 3. The global exclude

The hook config's `exclude` is the third spelling of the one exclusion set
([dprint's](dprint.md#3-the-exclusion-set) holds the list and the reasons), so
no hook rewrites or reports on a generated tree, a cache or a lockfile. It is a
verbose-mode regex, one alternative per line:

```yaml
exclude: |-
  (?x)
  # >>> pre-commit
  (^|/)\.claude/
  |(^|/)graphify-out/
  |(^|/)[^/]*\.lock$
  # <<< pre-commit
  # >>> pnpm
  |(^|/)node_modules/
  # <<< pnpm
```

A directory `<d>` is `(^|/)<d>/`, a file glob is `(^|/)` plus the glob with
`*` as `[^/]*` and every regex metacharacter escaped, anchored with `$`. Under
`(?x)` a `#` line is a regex comment, so the markers are inert inside the
pattern. **The `|` opening each alternative is punctuation the skill
re-derives on every write** — every alternative but the pattern's first opens
with one — so an appended block edits no line above it, and a removal that
leaves a new first alternative drops its `|`. A dangling `|` would be an empty
alternative matching every path, excluding the whole tree. This file holds a
requester's blocks at two positions — here, and in `repos:` for a hook — and
[the skill](../SKILL.md#blocks) allows one per position. The
`graphify-out/` entry matches nothing in a repo that never ran graphify, and
the manual `check-useless-excludes` audit says so; that is expected — the
exclusion is a standing rule about a tree, not a claim it exists today.

## 4. The verbs

| Instruction                                   | Writes to                                       |
| --------------------------------------------- | ----------------------------------------------- |
| `add hook <repo> <id> <stage> [key=value …]`  | `.config/pre-commit-config.yaml` — `repos:`     |
| `add linter-ignore <path> …`                  | `.config/linter.yaml` — `ignores:`              |
| `set scopes <id>,<id>,…`                      | `.config/git-conventional-commits.yaml`         |
| `remove <requester>`                          | every pre-commit file holding its blocks        |

**No exclude verb.** An exclude is added only through
[`all add exclude`](../SKILL.md#the-one-cross-tool-verb);
`pre-commit add exclude` is refused, naming it.

### `add hook`

```text
add hook <repo> <id> <stage> [key=value …] [for <requester>]
```

A pack's line, as the uv pack spells it:

```text
pre-commit add hook local uv-lock-check pre-commit name="uv lockfile is current" description="…" entry="mise x -- uv lock --check" files="(^|.*/)pyproject\.toml$" language=system pass_filenames=false
```

- **`<repo>`** is `local`, or the `https://` URL of a hook repository.
- **`<id>`** is the hook id — letters, digits, `-`, `_`.
- **`<stage>`** is one of `default_install_hook_types` — `pre-commit`,
  `commit-msg`, `post-commit` — or `manual`. Any other is refused, naming the
  list: a hook at a stage nothing installs never runs, and nothing reports it.
  It is written as `stages: [<stage>]`, and left out for `pre-commit`, which
  `default_stages` already says.
- **`key=value`** pairs are the hook's keys, written in the order given:
  `name`, `description`, `entry`, `language`, `files`, `exclude`, `types`,
  `args`, `pass_filenames`, `always_run`, `require_serial`, and `rev` for a
  URL repo. An unknown key is refused, naming these. A value given quoted,
  `"…"`, is taken exactly — every character between the quotes, a `\"` read
  as a quote and every other backslash kept, so a `files` regex keeps its
  `\.` — and written as a YAML scalar that reads back the same characters. A
  value given bare holds no quote and no space. `true` and `false` are written
  as booleans; `types` and `args` take a comma-separated list, written as a
  flow sequence.
- **A `local` hook** needs `name`, `entry` and `language=system`, and its
  `entry` begins `mise x -- ` — the hook runner does not run under the
  developer's activated environment, so without it neither `mise` nor the tool
  it pins is on `PATH`, and the version is mise's, never one pre-commit
  built. **A URL repo** needs `rev=`, a pinned tag.

It writes, in the requester's block at the end of `repos:`, one `- repo:`
entry per repository the requester names, its hooks below in call order.
A hook id the base, another block or a user line already defines in the file
is a **conflict row** — `keep-existing` or `overwrite` — never a second hook
of the same id; the same hook asked for again, key for key, writes nothing.

**What a pack's hook is for.** A gate tool is configured once, in its mise
task, and reaches the commit through the `format`, `lint` or `sec` hook: a
pack that needs a gate **overlays the task**, never adds a hook. `add hook` is
for a check that is **not** a gate tool — uv's lockfile freshness — and such a
hook is scoped with `files:` to what it validates, and takes
`pass_filenames=false` when it acts on the repo as a whole.

### `add linter-ignore`

Each `<path>` is a directory name, written as `- "**/<path>/"` in the
requester's block inside `ignores:`. `**/` because a generated tree sits at
its **project** root, at any depth in a monorepo; a repo whose own source
directory shares a generic name (`build`, `Derived`) negates it by hand, as a
user line — `- "!src/build/"`. Only a generated tree belongs there: a call
typed by a person naming a path git tracks is shown with that warning in its
row before it is approved.

### `set scopes`

`set scopes <id>,<id>,…` fills [`commitScopes`](#2-the-marked-positions) as
`all`'s `scopes=` does, and nothing else — the way to change the list without
re-running `all`. Each id is a slug; the list is the base's position, so a
`for` is refused.

## 5. The gate doctrine

**The three gate hooks name no tool.** `format` runs
`mise x -- mise run code:format --fix` and `lint` runs
`mise x -- mise run code:lint --fix`, each passed the staged filenames;
`lint` is `require_serial`, so a long staged list split into partitions runs
the task one partition at a time and two whole-tree runs never race. `sec`
runs `mise x -- mise run code:sec --staged` with `pass_filenames: false` and
`always_run` — `--staged` scans the index, which only git can enumerate. Which
formatter, linters and scanners run is the pinned stack's, overlaid onto those
tasks pack by pack. A repo customising a gate edits the task, and the hook,
the terminal and CI follow from the one edit.

**`files:` scopes every hook except those three**, so it fires only for what it
validates. The gate hooks carry none: the task knows which paths its tools
own, and a regex here would AND with that and silently stop checking a tree
the next overlay adds. **Order matters when hooks interact**: a hook that
regenerates committed output runs before the hook asserting it is current, and
stages its result.

**The `git-config` hook requires a per-repo identity.** It runs
`code:git-config --fix`: the local `user.name`, `user.email` and
`user.signingkey` must equal the forge variables — `GITHUB_*` for `github.com`
and its subdomains, `GITLAB_*` likewise for `gitlab.com`, `GIT_*` for any
other origin host or none — with ssh-signed commits and tags. A commit that
changed a key is refused, since git read the identity before the hook ran, and
the re-run carries it. The task is [mise's](mise.md#the-mandatory-set).

**Revs are pinned and moved deliberately.** Every third-party `repo:` carries
a `rev:`. `pre-commit autoupdate` runs only under
`setup:precommit --update`; a plain `setup:precommit` moves no `rev:`, so a
commit never fails on a change nobody in the repo made.

**The config lives under `.config/`, which the hook runner never discovers.**
Every by-hand call carries `--config .config/pre-commit-config.yaml`;
`setup:precommit` installs with that path baked into the hook script, so
`git commit` needs no flag. Re-run `setup:precommit` after moving the config —
the old path stays baked in until then. It installs every type in
`default_install_hook_types`, and never clobbers a hook setup it did not
create: the refusals and `--force` are
[mise's](mise.md#setup--bootstrap-and-upgrade).

**Two audits belong at `manual`, not at commit.** `check-hooks-apply` and
`check-useless-excludes` fail on a **correct** config in a young repo — a hook
matching zero files, an exclusion for a tree not generated yet — so at the
commit stage they would fail every new repo's first commit, and the fix people
reach for is deleting the hook. Run them when a hook is added or a scope
changes:

```sh
pre-commit run --config .config/pre-commit-config.yaml \
  --hook-stage manual --all-files check-hooks-apply check-useless-excludes
```

**Cheap gates run before expensive ones**, and **CI runs the same task names**:
a gate invoked one way locally and another in CI is two gates sharing a name.
A repo with no hook runner loses that parity guarantee — a real loss, not a
formality.

**Never bypass a red gate.** The gate found something or it is broken; both
need answering, and `--no-verify` answers neither — it commits the finding and
moves it to CI, where it costs more. Its two honest uses are a hook that is
itself broken, and tooling that performs the hook's job out of band, both
stated in the commit message.

## 6. The graph refresh hook

The base's last local hook refreshes the knowledge graph after every commit:

```yaml
- id: graphify-refresh
  name: Refresh the graphify graph (mise run code:graph)
  description: Rebuilds the knowledge graph in the background after each
    commit; the task skips a worktree, a rebase and a missing graphify.
  entry: mise x -- mise run code:graph
  language: system
  pass_filenames: false
  always_run: true
  stages: [post-commit]
```

`post-commit` cannot fail a commit — it runs after the commit exists — and
`code:graph` exits 0 when the graph tool is missing, is a no-op in a linked
worktree, mid-rebase or on a commit that touched only `graphify-out/`, and
runs detached, so the commit returns at once — one rebuild at a time, under
[the single-flight lock](mise.md#the-graph-tool). It replaces graphify's own
`graphify hook install`, whose raw git hooks pin a Python path and break on
the next upgrade. Before it installs, `setup:precommit` looks for graphify's
markers in both hooks graphify writes, `post-commit` and `post-checkout`;
where either carries one it runs `graphify hook uninstall`, or — with
graphify not on `PATH` — strips each marked block itself, deleting a hook
left with nothing but its shebang. So an earlier-shaped repo loses those
hooks rather than keeping one chained as `post-commit.legacy`. The graph
tool's pin and the task are [mise's](mise.md#the-graph-tool).

## 7. The migration

`all` on a repo the retired pre-commit gate pack shaped brings it onto this
layout, each step a row:

- **The fragment merge retires.** Each marker pair the old merge wrote into
  the hook config — the markers naming a `<name>.yaml` in the retired
  fragment directory under `.config/` — is rewritten as a `# >>> <name>` block
  holding the same entries, and the trailing comment that described the merge
  goes. The pack's own `add hook` call, run next, then finds its block already
  written. Each fragment file is deleted, and the directory with its last
  file.
- **`default_install_hook_types`** gains `post-commit` and the
  `graphify-refresh` hook lands — one row each.
- **The global exclude and the linter ignores** are sorted as dprint's are
  ([its migration](dprint.md#6-the-migration)): an entry the base does not
  hold stays a user line until a pack's call claims it; `target` is offered
  for removal.
- **`commitScopes`** keeps every scope it lists — a scope is never dropped —
  and the `scopes` argument adds to it; the forge links are re-derived from
  `origin` and shown as a row where they differ.
- **The lockfile entries** sourced from that pack are re-recorded as
  `tool-config/pre-commit@<version>` where the path is still the skill's.
- **The repo-local pre-commit skill** the pack used to copy under
  `.claude/skills/pre-commit/` is deleted where its content still matches its
  record, and kept and reported where it does not.
