# Contributing

How this repository is set up, changed and landed. If you are here to *use* what
it ships, [readme.md](./readme.md) is the page you want — keep developer detail
out of it and put it here instead.

## Setup

Trust the repository first — once per machine, since mise reads no config it
has not been told to trust:

```sh
mise trust --all
MISE_ENV=dev mise run setup
```

Listing the checkout's path, or a parent of it, under `trusted_config_paths`
in your global mise config does the same for every checkout beneath it,
linked worktrees included. Then `setup` is the whole of it: the toolchain
manager installs the pinned tools, installs dependencies, and wires the commit
hooks. Every task lives as a file under `.config/mise/tasks/`, and
`mise tasks` lists them.

## Branches

Two lines, and they do not vary with which branch the forge calls default:

- Work happens on a **feature branch or a worktree**, never on the long-lived
  branch directly.
- A feature branch lands on the repo's **one core branch**, the one
  `bootstrap config get repo.core_branches --json` names.

`mise run git:merge:<branch>` is the one move, `<branch>` being that core
branch. It runs the gates over the whole tree before it touches anything, so a
merge that would break the branch fails before it starts rather than after.
What it then does is set in `.config/bootstrap/`:
`repo.branches.<branch>.landing`, `direct-merge`, the default, `direct-commit`
or `pr`. That folder holds the repo's values for bootstrap, the shared-files
repo this one syncs from: read a value with
`bootstrap config get <key> --json`, change one with
`bootstrap config set <key> <value>`, then run `bootstrap sync`.
`direct-merge` merges locally and pushes — your branch is on the destination
the moment the task returns; `direct-commit` merges the same way and also
permits a commit on that branch itself; `pr` pushes the branch and opens a pull
request instead, merging nothing — your branch lands when a maintainer merges
that request.

The forge's own settings — the default branch, the core branch, and protection
on it — are set by `/vwf:setup`'s forge pass on GitHub and GitLab, and no task
re-runs them. On any other forge a maintainer sets them **by hand, once**:

- The default branch: `gh repo edit --default-branch <branch>`, or
  `glab repo update --defaultBranch <branch>` on GitLab.
- Protection on the core branch: no force-push and no deletion; and a pull
  request required when its landing is `pr`.

## Commits

Commits follow [Conventional Commits](https://www.conventionalcommits.org).
**The types and scopes live in `.config/git-conventional-commits.yaml`, and that
list is authoritative** — the commit hook rejects anything else, so add a scope
there rather than inventing one in a message.

## The gates

The same checks run on every commit and in CI, so there is nothing to remember
beyond running them before you push:

```sh
mise run code:format     # every formatter, over what it owns
mise run code:lint       # every linter, per language
mise run code:sec        # secret and vulnerability scanning
mise run code:precommit  # every hook, over the whole tree
```

`code:precommit` is the one that matches what a merge will do. A hook that only
runs on demand is marked as such in `.config/pre-commit-config.yaml`, and the
comment beside it says why.

## Security

**Do not open an issue for a vulnerability.** [SECURITY.md](./SECURITY.md) names
the private channel and what to include; that channel stays private until an
advisory is published, which is what lets a fix ship before the details do.
