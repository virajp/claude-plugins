# pre-commit — the local gate, and gate wiring

## The gate

**Hooks call the repo's task library; they never inline a command.** This is the
parity guarantee, and it is the reason this component owns the wiring topic. A
hook that inlines its command is a second definition of that gate, and the two
drift the first time one is edited — after which local and CI disagree and the
gate is worse than absent, because it is trusted.

**A gate tool is configured once, in its mise task, and the hook is a thin
call.** The base config ships three tool-neutral gate hooks — `format`, `lint`
and `sec` — whose entries are `code:format --fix`, `code:lint --fix` and
`code:sec --staged` and which name no tool at all. Which formatter, linters and
scanners run is the pinned stack's business, overlaid onto those tasks pack by
pack. A repo customising a gate edits the task, and the hook, the terminal and
CI follow from that one edit.

**`files:` scopes every hook** so it fires only for what it validates — every
hook except the three that call a gate task, which carry no `files:` because the
task is what knows its own tools' paths. An unscoped hook otherwise runs the
formatter over a commit that touched one YAML file, and a gate people wait on is
a gate people bypass.

**The `git-config` hook requires a per-repo identity.**
The local `user.name`, `user.email` and `user.signingkey` must equal the forge
variables — `GITHUB_*` for `github.com` and its subdomains, `GITLAB_*` likewise
for `gitlab.com`, `GIT_*` for any other origin host or none — with ssh-signed
commits and tags; its `--fix` writes those keys from the variables, fails naming
an unset one, and unsets only `gpg.program` and `gpg.ssh.program`. A commit that
changed any key is refused and the re-run carries the corrected identity — git
reads it before hooks run.

**Revs are pinned and updated deliberately.** An unpinned rev means the gate's
behaviour changes without a commit, and the change lands on whoever pulls next.
`pre-commit autoupdate` runs only under `setup:precommit --update`; a plain
`setup:precommit` installs the hooks and moves no `rev:`.

**`setup:precommit` never clobbers a hook setup it did not create.** An
effective `core.hooksPath`, a `.husky/` directory or a lefthook config is
reported with the by-hand lines — the unset, the `--overwrite` install, and the
file cleanup the task never does itself — and exits 1; `--force` runs the unset
and the install, on the local git-config only, so a global or system
`core.hooksPath` is refused even then. A repo pre-commit already owns is not
refused again. Without `--force` a hand-written `.git/hooks/pre-commit` is kept
as `.legacy` and chained, never replaced.

**Never bypass a red gate.** The gate found something or it is broken; both need
answering, and neither is answered by skipping it.

## Gate wiring & CI parity

**Every gate is reachable as exactly one task name, and CI runs those same task
names.** Nothing else keeps the two in step: a gate invoked one way locally and
another way in CI is two gates that happen to share a name.

**Cheap gates run before expensive ones.** Formatting and secret scanning fail
in under a second; a vulnerability scan does not. Ordering by cost means the
common failure is reported immediately rather than after the slow gate.

**The exclusion set is stated once**, not restated per gate. Generated trees,
vendored code and lockfiles are excluded for the same reason everywhere, and
per-gate copies drift until one gate is scanning what the others skip. Xcode's
asset catalogs (`*.xcassets`) count as generated: Xcode writes and rewrites
the `Contents.json` inside them, so no hook should touch one. Across
the gate packs that set is spelled three times — the formatter's `excludes`,
the TOML formatter's `exclude` and this config's global `exclude` — each in its
tool's own syntax, and the toolkit's checker holds the three equal after
normalising the syntax away. The secret scanner's path allowlist is held to a
subset of it: generated trees only, since its pack extends upstream's default
config (which already skips `.git`, `node_modules` and the named lockfiles) and
`.claude/` is authored source a scanner must scan. Widen a formatter list,
widen all three; widen the allowlist only with a generated tree. One hook
narrows further: `trailing-whitespace` skips `.md`, because two trailing spaces
are a Markdown hard break, and `.editorconfig` says the same to the editor.

**A repo with no hook runner records this topic `n/a`** and loses the parity
guarantee with it. That is a real loss, not a formality — without it, nothing
makes local and CI run the same command.

## What this pack writes

Four files, all under `.config/`. `pre-commit-config.yaml` is the base hook set
and the merge point every pack fragment lands in.
`git-conventional-commits.yaml` is the commit convention the `commit-msg` hook
enforces. `linter.yaml` is the house linter's one config file, read by every
`code:lint` that runs `@askviraj/linter` — whichever pack's task that is — so it
ships with the gate rather than with any one of them. Its `ignores:` list is the
generated trees the stack packs produce (`build/`, `.dart_tool/`, `.build/`,
`.swiftpm/`, DerivedData, `.venv/`): the linter does not read `.gitignore`, so
without the list a whole-tree `code:lint` walks build output. A language pack
that adds a generated tree adds it to that list, with a trailing comment naming
the pack; the eslint pack's skill guides every other edit to the file.
`vscode.d/pre-commit.jsonc` is this pack's editor fragment: the nesting that
folds the convention file under the hook config, and the YAML language server —
`yaml.completion`, `yaml.hover`, `yaml.format.enable` off because the repo
formatter owns YAML — with the `redhat.vscode-yaml` extension that serves those
keys. The gate itself contributes no setting: it runs on commit, and an editor
running the hooks would be a second definition of it. The fragment lands only
where init's editor answer is vscode — `pack.yaml`'s `conditional:` names it.

**Two positions in the convention file are marked for `/vwf:init` to fill, and
the comments say when.** `commitScopes` is filled on **every** run, the first
one included, with the project ids init's second question confirmed — one scope
per project, each the same id that project's `p:<id>:*` task group takes. A
project registry, where the repo has one, is where that proposal came from, not
a precondition for filling the list: the empty list this pack ships is its
marked position, never a first-run state init leaves behind. The changelog
links are filled on **any** run where the repo has a remote.

The convention file lives in **this** pack rather than beside the release task
that also reads it, because the hook is what enforces it: a convention nothing
checks is a style note, and the file and its gate should not be able to land
separately.

The fence in `output-tree.md` was opened for gate config files on 2026-09-05;
`package.json` and CI workflows remain outside it.

## The base config is a base, and fragments extend it

A language or package-manager pack does not rewrite this file. It ships one
`.config/pre-commit.d/<pack>.yaml` fragment — a document with a top-level
`repos:` list and nothing else — and the merge concatenates every fragment
present into the base between a `# >>> pre-commit.d/<name>.yaml` marker and a
matching `# <<< pre-commit.d/<name>.yaml`. A re-run replaces what sits between
one pair and leaves the rest alone, which is what makes the merge safe to run
again after a new pack lands.

The rule that follows from it: **a repo's own hooks go above the marker block,
never inside one.** Anything between a pair is regenerated, and the loss is
silent.

## Two hooks that cannot be commit-stage gates

`check-hooks-apply` and `check-useless-excludes` are shipped at
`stages: [manual]`, and this is deliberate rather than timid. Both fail on a
**correct** config in a young repo: the first reports every hook that matches
zero files, which is the normal state of a symlink or workflow hook until the
repo grows one of each; the second reports an exclusion for a generated tree
that has not been generated yet. Wired at the commit stage they would fail the
first commit of every new repository, and the fix people reach for is deleting
the hook that complained.

Run them deliberately instead, when a hook is added or a scope is changed —
they are an audit of the config, not a gate on the code.
