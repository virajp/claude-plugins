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
  branch directly.
- A feature branch lands on **`develop`**.
- `develop` lands on **`main`**, and `main` takes nothing else. A commit hook
  refuses a direct commit to it.

`mise run code:merge:develop` and `mise run code:merge:main` are the two moves.
They run the gates over the whole tree before they touch anything, so a merge
that would break the branch fails before it starts rather than after.

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
