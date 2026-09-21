# Contributing

How this repository is set up, changed and landed. If you are here to *use* what
it ships, [readme.md](./readme.md) is the page you want — keep developer detail
out of it and put it here instead.

## Setup

```sh
mise run setup:all
```

That is the whole of it: the toolchain manager installs the pinned tools,
installs dependencies, and wires the commit hooks. Every task lives as a file
under `.config/mise/tasks/`, and `mise tasks` lists them.

## Branches

Three lines, and they do not vary with which branch the forge calls default:

- Work happens on a **feature branch or a worktree**, never on a long-lived
  branch directly. The one exception is the shaping commit the repo starts
  with, which lands on `develop`.
- A feature branch lands on **`develop`**.
- `develop` lands on **`main`**, and `main` takes nothing else. A commit hook
  refuses a direct commit to it.

`mise run code:merge:develop` and `mise run code:merge:main` are the two moves.
They run the gates over the whole tree before they touch anything, so a merge
that would break the branch fails before it starts rather than after. What they
then do is set **per branch** in `.config/mise.toml`: `MERGE_MODEL_DEVELOP`
for the first move, `MERGE_MODEL_MAIN` for the second, each `direct` or `pr`.
`direct` merges locally and pushes — your branch is on the destination the
moment the task returns; `pr` pushes the branch and opens a pull request
instead, merging nothing — your branch lands when a maintainer merges that
request. The two can differ: a repo that lands features directly on `develop`
and still requires a pull request for `main` is the usual shape.

The forge's own settings — the default branch, and protection on `develop` and
`main` — are set by `/vwf:init`'s forge pass on GitHub and GitLab, and no task
re-runs them. On any other forge a maintainer sets them **by hand, once**:

- The default branch: `gh repo edit --default-branch <branch>`, or
  `glab repo update --defaultBranch <branch>` on GitLab.
- Protection on both `develop` and `main`: no force-push and no deletion; and
  a pull request required on each branch whose variable is `pr` —
  `MERGE_MODEL_DEVELOP` for `develop`, `MERGE_MODEL_MAIN` for `main`.

## Commits

Commits follow [Conventional Commits](https://www.conventionalcommits.org).
**The types and scopes live in `.config/git-conventional-commits.yaml`, and that
list is authoritative** — the commit hook rejects anything else, so add a scope
there rather than inventing one in a message.

## The gates

The same checks run on every commit and in CI, so there is nothing to remember
beyond running them before you push:

```sh
mise run code:format      # the formatter, over what it owns
mise run code:lint        # the linters, per language
mise run code:sec         # secret and vulnerability scanning
mise run code:precommit   # every hook, over the whole tree
```

`code:precommit` is the one that matches what a merge will do. A hook that only
runs on demand is marked as such in `.config/pre-commit-config.yaml`, and the
comment beside it says why.

## Security

**Do not open an issue for a vulnerability.** [SECURITY.md](./SECURITY.md) names
the private channel and what to include; that channel stays private until an
advisory is published, which is what lets a fix ship before the details do.
