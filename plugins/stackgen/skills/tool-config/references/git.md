# git — what git ignores, how it treats a path, and who commits

Two files tell git how to treat the tree, and every repo needs both before it
has a stack. `.gitignore` says what git never tracks: machine state, build
output, a secret's file. `.gitattributes` says how it treats what it does:
line endings, which files are generated, which are binary. Both sit at the
repo root, because git reads them nowhere else. Beside them, one task holds
the local git-config to the forge identity, and one template states the
commit convention.

This reference is git's part of the universal files tool-config lands. What
every file shares — the values, the render, the rows, the six marked files and
drift — is [the skill's](../SKILL.md); what follows is git's own.

| Section                                                     | Read before                                   |
| ----------------------------------------------------------- | --------------------------------------------- |
| [1. What lands](#1-what-lands)                              | reading what `all` landed                     |
| [2. The ignore file's rules](#2-the-ignore-files-rules)     | adding a line to `.gitignore`                 |
| [3. The identity task](#3-the-identity-task)                | a commit refused by the `git-config` hook     |
| [4. The commit convention](#4-the-commit-convention)        | reading `git-conventional-commits.yaml`       |

## 1. What lands

| File                                    | As                                                  |
| --------------------------------------- | --------------------------------------------------- |
| `.gitignore`                            | an asset, marked — the curated set between the pair |
| `.gitattributes`                        | an asset, owned whole                               |
| `.config/git-conventional-commits.yaml` | a template, owned whole                             |
| `.config/mise/tasks/code/git-config`    | an asset, owned whole                               |

**The ignore set is curated, never fetched.** One block, between
`# >>> tool-config` and `# <<< tool-config`, in banner sections: macOS,
editors, AI tooling, mise, secrets and env, build output, Node, Python, Dart
and Flutter, Swift and Xcode, Gradle and Kotlin, Android, scratch, reports.
Every stack's section ships whether or not the repo uses that stack — a
pattern for a tree the repo never produces matches nothing — so a pack never
adds an ignore line, and no upstream template is fetched: a fetched template
is a network call on every render and a block that silently never lands when
it fails. A repo's own lines go below the closing marker and survive every
render ([the marked files](../SKILL.md#the-marked-files)).

**The mise lines are load-bearing**: they cover every path mise loads a local
override from, and the local lock it writes beside one, and dropping one is
how a machine-local pin ends up in a review. They are, as the asset spells
them:

- the bare names `mise.local.toml`, `mise.*.local.toml`, `.mise.local.toml`
  and `.mise.*.local.toml`, which match at any depth — a `conf.d/<folder>/`
  local file included;
- `**/mise.local.lock`, the one lock line;
- `**/.config/mise/config.local.toml`, `**/.config/mise/config.*.local.toml`
  and `**/.config/mise/conf.d/*.local.toml` — mise's other local names, whose
  file names do not start with `mise`, and the old flat `conf.d` layout's,
  each `**/`-prefixed so a member repo's are ignored too.

The secrets section ignores `.env`, `.env.*` (re-including `.env.example`),
`fnox.local.toml` and private-key files; the AI tooling section ignores one
developer's agent state and `graphify-out/` ([graphify's](graphify.md)).

**The attribute set** is every stack's too: `* text=auto eol=lf`, the
lockfiles marked `linguist-generated` — `*.lock`, `pnpm-lock.yaml`,
`Package.resolved` — and the binaries as `-text -diff`. It carries no marker:
a repo that adds its own attribute line answers `keep-existing` on the file's
row at every later `all`, and takes no shipped change to it until a person
folds one in by hand.

## 2. The ignore file's rules

**Entries keep written order.** git reads the file top to bottom and the last
match wins, so a negation works only after the pattern it re-includes —
`!.env.example` after `.env.*`, never before. A repo's own negation of a
shipped pattern goes below the closing marker, where it comes after the
pattern it re-includes.

**Lock files are tracked.** No lock file is ignored but `mise.local.lock`. A
lockfile is what makes an install reproducible, and an ignored one is a
reproducibility the repo silently does not have; never add a line ignoring
one.

**Ignoring is not allowlisting.** A secret that is ignored is a secret that was
never scanned, so an ignore line is never the answer to a scanner finding, and
one added because "the scanner keeps complaining" is the one line to refuse.
The allowlist is the scanner's own, by fingerprint —
[gitleaks'](gitleaks.md#2-the-allowlist).

## 3. The identity task

`code:git-config` requires the forge identity, per repo. The local git-config
must carry `user.name`, `user.email` and `user.signingkey` **equal to**
`<FORGE>_USER_NAME`, `<FORGE>_EMAIL` and `<FORGE>_SIGNING_KEY` — presence is
not enough — with `commit.gpgsign` and `tag.gpgsign` `true`, `gpg.format`
`ssh`, and `gpg.program` and `gpg.ssh.program` absent. `<FORGE>` is `GITHUB`
when the origin host is `github.com` or a subdomain of it, `GITLAB` when it is
`gitlab.com` or a subdomain, and `GIT` for any other host or no remote; the
variables are exported by the machine, never committed.

Check mode lists each failing key with expected against actual and the
variable to export, and exits 1; `--fix` writes the identity keys from the
variables — failing by name on an unset one and writing nothing partial —
sets the two booleans and `gpg.format`, and unsets the two `gpg.*program`
keys. It never deletes an identity. `<FORGE>_SIGNING_KEY` holds what git
accepts as `user.signingkey` under `gpg.format` `ssh`: the path to the key
file or the literal public key prefixed `key::`. The `git-config` hook runs
`--fix`, but git has already loaded its identity by the time a hook runs, so
whenever `--fix` changed a key it exits 1 — *identity corrected — re-run the
commit* — and the re-run carries it.

## 4. The commit convention

`.config/git-conventional-commits.yaml` is read by the `commit-msg` hook,
which enforces it, and by the release notes, which are generated from it — so
a type missing from `changelog.commitTypes` is work that silently never
appears in a release. Ten types — `feat`, `fix`, `perf`, `refactor`,
`revert`, `test`, `ops`, `docs`, `merge`, `wip` — and `featureCommitTypes`
(under `convention:`, not `changelog:`) decides a **minor** bump: everything
else is a patch, and a `!` or a `BREAKING CHANGE` footer is a major whatever
the type.

It is a template, rendered from [the values file](../SKILL.md#the-values-file):

- **`commitScopes`** is `SCOPES` — one scope per project, each the same id
  that project's `p:<id>:*` task group takes, set with `all --scopes`. An
  empty list renders `commitScopes: []`. **A scope that stops existing stays
  in the list**: deleting it invalidates every commit that used it. `--scopes`
  replaces the stored list, so pass the retired ids along with the live ones.
- **The changelog links** — `commitUrl`, `commitRangeUrl`, `issueRegexPattern`,
  `issueUrl` — render only when `REPO_URL` is set, derived on every render
  from the repo's `origin` remote, never stored. A repo with no `origin` gets
  none; the notes still generate, just without links, and the next `all`
  after a `git remote add` adds them. The links take GitHub's path shape.

The file is owned whole: a type or scope edited in by hand is one row on the
next `all` — `ok` takes the render, `keep-existing` keeps the edit — so change
the scopes through `--scopes`, never by hand.
