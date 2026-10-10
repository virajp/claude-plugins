---
name: release
description: Cut a release — every project with a pending level via p:release,
  or one alone via p:plugins:release, p:i:release or p:site:release; each
  bumps from its last tag, commits on develop, merges to main and tags. Also
  the GitHub Release note format, and the CI facts that make a failed publish
  legible. Run when the user asks to cut, tag, or publish a release.
allowed-tools: Read Grep Glob Bash
---

# Release

**Ask the user before running `p:release`, `p:i:release`, `p:plugins:release` or
`p:site:release`.** It is the repo's hard rule, and every one of them commits,
merges and tags. There is no exception: no plan folder carries a release step.
`--dry-run` is the one form that may run without asking — it writes nothing.

**There are three things to release, and one tag family each.** `p:release`
releases every one that has something pending; each task alone releases its own.

| Releasing           | Tag                    | Task                | Ends at                  |
| ------------------- | ---------------------- | ------------------- | ------------------------ |
| one or more plugins | `<name>-v<version>`    | `p:plugins:release` | the pushed tag           |
| the installer CLI   | `installer-v<version>` | `p:i:release`       | npm + GitHub Release     |
| the website         | `site-v<version>`      | `p:site:release`    | Workers + GitHub Release |

The namespaces must all stay prefixed. GitHub's tag globs match any character
except `/`, so a bare `v*` family matched `vwf-v19.9.0` and fired the npm
publish on a plugin release — which is why `release.yml` filters `installer-v*`.
The 54 pre-2026-08-30 `v1.2.1`–`v6.0.0` tags are history; nothing fires on them,
and they are deliberately left unprotected.

**Adding a fourth tag family means widening the ruleset.** GitHub's
`release-tags` ruleset blocks deletion and re-pointing for `refs/tags/*-v*`,
which covers all three families above and every plugin ref the generator can
emit — a test pins their shape to `/^[a-z][a-z0-9-]*-v\d+\.\d+\.\d+/`, and
`site-v1.0.0` matches both, so the site family needed no widening. A family
without `-v` in the name (`nightly-2026-09`, say) simply falls outside the
pattern and gets **no** protection, silently: nothing fails, it is just
unguarded. Either give the new family a `-v` or widen
`conditions.ref_name.include` to `["~ALL"]` on ruleset `21871515`.

## Local first

**A plugin is staged locally before it is tagged publicly.** The staging command
is `mise run p:plugins:local`: it copies each changed plugin into the gitignored
dev marketplace under `X.Y.Z+N` and updates this machine's install, so the
author runs the plugin they are about to publish. It commits nothing, pushes
nothing and cuts no tag; `/vwf:execute` takes it as the plan folder's
after-landing step, recorded `run` at the interview — run without a prompt on a
green landing — and `.config/vwf.yaml`'s `after_landing:` names it, so every
landing in this repo runs it. A hand-made change reaches it the same way.

So, before a plugin release, confirm the plugin being tagged has been staged and
actually exercised — in a **restarted** session, since skills are read at
session start. If it has not, offer to run `p:plugins:local` and stop there; the
tag can be cut in the next session and nothing is lost by waiting. This is a
question, not a gate: the user can say the change is docs-only, or that they
have exercised it another way, and that answer stands.

Two limits, both worth stating rather than papering over:

- **It covers plugins only.** The installer's and the website's nearest local
  steps are `mise run p:i:test` and `mise run p:site:check` — gates over the
  built artifact, not an install of it, so they prove less. `p:site:dev` serves
  the site locally and is the closest thing the website has to running the real
  change.
- **It refuses in user mode**, where the registered marketplace is the published
  one — it would otherwise re-copy the last release, which is the state it
  exists to escape. Setup is `.claude/docs/dev-marketplace.md`. A refusal is
  reported, never routed around.

## The ritual

```sh
# on develop, clean
mise run p:release -- --dry-run   # show the user, then ask
mise run p:release
```

**No person and no plan bumps a version by hand.** A landing plan records a
level per project — `NONE`, `PATCH`, `MINOR` or `MAJOR` — and `/vwf:execute`
raises it in `.config/releases.yaml`, the highest level winning. The release
tasks read that file:

- **The base is always the project's last tag** — `<name>-v*`, `installer-v*`,
  `site-v*` — never the manifest.
- **The level is the higher** of the recorded one and the one an untagged
  manifest implies against that tag (the first component that differs). Tag
  `vwf-v21.0.0`, manifest `21.2.0`, recorded `MAJOR` → `22.0.0`.
- **The manifest is the floor**: a target below the manifest releases the
  manifest as it stands, so a release never lowers it. Tag `vwf-v21.0.0`,
  manifest `21.2.0`, no record → implied `MINOR` → `21.1.0`, raised to `21.2.0`.
- **The version skips 13 and 17**: the target comes from the same guard the
  version tasks use, so `1.1.12` patched is `1.1.14`, and the task says what it
  skipped. A level that can never clear the number refuses.
- A project at `NONE`, with no record and a manifest equal to its tag, is
  **skipped**. A project with **no tag yet** releases its manifest as it stands.
- Each task reads and clears **only its own keys**: `vwf` and `stackgen` for
  `p:plugins:release`, `installer` for `p:i:release`, `site` for
  `p:site:release`. A duplicated key in the file refuses.

`--dry-run` prints one line per project — its last tag, its level, and
`→ <version>`, `→ skip` or `→ refused` — checks no branch or tree, writes
nothing and exits zero. Show it to the user before asking.

**`p:release`** runs the three as one release: it plans from their dry-run lines
and stops on any `refused`; checks `gh` and runs `p:i:test` and `p:site:check`
for the projects that need them, **before** the first bump; then runs each task
`--no-commit`, makes **one** commit (`ops: release …`, naming the versions
staged), pushes `develop`, runs `code:merge:main`, and on `main` runs each
releasing task `--tag-only` — plugins, installer, site, in that order — and
switches back to `develop`. Its own tag steps carry `RELEASE_GATES_DONE=1`, so
the installer and site gates it already ran are not run again on `main`.

**A stop prints its resume commands.** The first failure stops the run and
prints the steps left, from `develop`: a tag already on origin is not cut again,
a tag cut but never pushed is pushed rather than re-made, and the resume lines
never carry `RELEASE_GATES_DONE=1` — a resume may follow a fix no gate of the
run checked. When `code:merge:main` stops, it adds the resolve-or-abort hint:
finish the merge and push `main`, or `git merge --abort` and switch back to
`develop`.

**One task alone** is the same sequence for one project: from `develop` on a
clean tree it bumps, clears its key, commits (`ops: release …`), pushes
`develop`, merges with `code:merge:main`, tags on `main`, pushes, and switches
back to `develop` whatever happens. Two modes split it, for `p:release` and for
the fallback below:

| Mode          | Runs on   | Does                                                                     |
| ------------- | --------- | ------------------------------------------------------------------------ |
| `--no-commit` | `develop` | the bump step alone, staged; refuses only unstaged and untracked changes |
| `--tag-only`  | `main`    | the tag step alone — tags what the manifest already names; no bump       |

**`main` stays merge-only.** The bump is an ordinary commit on `develop`, and
`main` receives it by merge, so the `no-commit-to-branch` hook never has to be
skipped.

**The merge model must be `direct`.** Under `pr`, `code:merge:main` only opens a
pull request, and a tag would name a stale `main`. So full mode, `--ci` and
`p:release` refuse when `MERGE_MODEL` or `MERGE_MODEL_MAIN` is anything else.
The fallback is the two halves: each task `--no-commit` on `develop`, commit,
land the PR by hand, then each `--tag-only` on `main`.

## Releasing plugins

Each entry in `.claude-plugin/marketplace.json` pins its plugin to a
`<name>-v<version>` tag, and that ref is **derived** from the plugin manifest's
`version`. `p:plugins:release` writes the target into
`plugins/<name>/.claude-plugin/plugin.json` — every target validated before any
file is written — and runs `p:plugins:marketplace`, so the ref renames itself in
the same commit.

The tracked version is plain `X.Y.Z` always; the `X.Y.Z+N` the authoring machine
runs between releases exists only in the gitignored staged copies
`p:plugins:local` writes, and `p:plugins:check` fails a manifest that carries
one.

**13 and 17 are never issued as a version component**, on any version line this
repo maintains — a plugin manifest, the installer, the site, `config_format`,
`blueprint_format`. The release tasks skip past them when they compute a target;
`p:plugins:check` refuses a manifest whose version has one (`1.13.0`, `17.0.0`,
`2.1.17`; `1.130.0` and `113.0.0` are ordinary versions that merely contain the
digits), and the tag step refuses the **whole** run when any ref it would newly
cut carries one — refs already tagged predate the rule and stay. The `+N`
staging counter is not a component and never trips it.

The tag step tags only the refs with no tag yet, so a plugin whose version did
not move is skipped and its entry stays byte-identical — that is what makes
releases per-plugin. It pushes the tags in one push.

**No GitHub Release and no npm publish.** The tag *is* the release. Users move
with `claude plugin marketplace update virajp-plugins` (re-reads the pins) then
`claude plugin update <name>` (fetches them) — both steps, or nothing moves.

If `plugins.yml` goes red on `main` with *"marketplace.json pins X, which is not
a tag"*, the merge landed and the tags did not. Run
`mise run p:plugins:release -- --tag-only` on `main`.

## Releasing the installer CLI

Releasing via CI is preferred over the local `p:i:publish`, so every version
keeps the strongest npm trust level (trusted publisher).

### 1. Bump, merge and tag

`p:i:release` bumps `package.json` (through `p:i:version` when the manifest
equals the tag on a clean tree, by direct write otherwise), commits on
`develop`, merges, and on `main` refuses a version carrying a 13 or 17
component, refuses if `installer-vX.Y.Z` already exists, runs `p:i:test`,
creates the annotated tag, then pushes **`main` first and the tag second** and
watches the `release.yml` run with `gh run watch --exit-status`, so the task
only succeeds if the publish pipeline does. It needs `gh` installed and
authenticated, and checks it **before** any bump, commit or merge — in full mode
and under `--tag-only`.

The push order is load-bearing: `release.yml` checks the tagged commit is
reachable from `origin/main`, so a tag arriving before the branch fails that
gate. `p:plugins:release` pushes tags alone because no plugin tag is checked for
reachability.

`--ci` runs the same bump, commit, merge and tag, then stops, with no push of
the tag and no watch. `deps-update.yml` passes it, having raised the installer
to `PATCH` and committed the refresh first. Do not pass it by hand.

### 2. Cut the GitHub Release

Every `installer-vX.Y.Z` tag carries one — the tag is the npm-publish trigger,
the Release is the human-readable record beside it. The mapping is **1:1**, so a
missing Release means a missed step. Plugin tags get no Release.

```sh
gh release create installer-vX.Y.Z --title installer-vX.Y.Z \
  --notes-file <notes> --verify-tag
```

- **Creating a Release never publishes.** `release.yml` triggers on
  `push: tags: installer-v*`; nothing listens for `release` events.
  `--verify-tag` keeps it that way by refusing to invent a tag — which *would*
  push and publish.
- **`--latest` resolves by publish date**, so a normal forward release is
  correct by default. Pass `--latest=false` when backfilling out of order.

## Releasing the site

The website deploys only from a `site-v<version>` tag; a merge to `main` ships
nothing. Same shape as the installer.

### 1. Bump, merge and tag

`p:site:release` checks `gh` first, before it bumps anything, then bumps
`site/package.json` — through `p:site:version` when the manifest equals the last
tag and the tree is clean, by direct write otherwise — commits on `develop`,
merges, and on `main` refuses a version carrying a 13 or 17 component, refuses
if `site-vX.Y.Z` already exists, runs `mise run p:site:check`, checks `gh` again
before it creates the annotated tag (the only check under `--tag-only`), then
pushes **`main` first and the tag second** and watches the `site.yml` run with
`gh run watch --exit-status`, so the task only succeeds if the deploy does. The
push order is load-bearing for the same reason as the installer's: `site.yml`
checks the tagged commit is reachable from `origin/main`.

`--ci` stops after the tag, with no push and no watch. Nothing passes it today;
do not pass it by hand.

### 2. Cut the GitHub Release

Every `site-vX.Y.Z` tag carries one, in the note format below — the same 1:1
rule as the installer's.

```sh
gh release create site-vX.Y.Z --title site-vX.Y.Z \
  --notes-file <notes> --verify-tag
```

`site.yml` triggers on `push: tags: site-v*`; creating a Release never deploys,
and `--verify-tag` refuses to invent a tag that would.

## The note format

Follow `.config/git-conventional-commits.yaml` — the same config the repo
already uses. **Do not invent a second changelog format.**

- Eligible types are `feat`, `fix` and `refactor`, plus breaking changes.
  `includeInvalidCommits: false`, so `ops:` / `docs:` / `blueprint:` / `merge:`
  are excluded. Commits matching `^[wW][iI][pP]\b` are skipped.
- Headlines: **Features**, **Bug Fixes**, **Performance Improvements**,
  **Merges**, **BREAKING CHANGES**.
- Scopes are bolded; each entry links its commit via
  `https://github.com/virajp/claude-plugins/commit/%commit%`.

Shape of the note, in order:

1. An optional `**Plugin versions:**` line — **only** the marketplace entries
   whose version changed since the previous tag. Informational: those plugins
   ship on their own tags, not on this one.
2. The changelog sections.
3. A `**Full Changelog**` compare link.

A tag with no eligible commits still gets a Release, saying it is a maintenance
release.

## Facts that make a failed publish legible

- **npm allows exactly one Trusted Publisher per package, and it validates the
  entry-point workflow's *filename*** — so it is set to `release.yml` only.
  `workflow_call` therefore does **not** work: the repo shipped it that way for
  two months and both monthly runs died at the publish step with `ENEEDAUTH`,
  because npm saw `deps-update.yml` and matched nothing. `deps-update.yml`
  publishes by **dispatching** `release.yml` on the new tag.
- **Refs pushed with `GITHUB_TOKEN` do not start workflow runs** — but
  `workflow_dispatch` and `repository_dispatch` are explicit exceptions, which
  is why no PAT or GitHub App token is needed. The dispatch is fire-and-forget;
  the `release.yml` run is the publish record.
- **The publish step is idempotent**: it skips (does not fail) if that version
  is already on npm, so tag re-points, dispatch retries and re-runs are safe.
- `release.yml` gates on `osv-scanner` over the lockfile before publishing, so
  an unpatched advisory in a transitive dep blocks the release. The remedy is an
  entry in `pnpm-workspace.yaml`'s `overrides`, not a bypass.
- **Publishing uses the npm CLI; everything else stays pnpm.**
- **No publish path may move into another file** — that is why plugin validation
  lives in the separate `plugins.yml`, which publishes nothing and holds no
  `id-token` permission. Narrowing *which tags* reach `release.yml` is a
  different thing and is safe: npm matches the filename, not the trigger. That
  is what let the tag filter become `installer-v*`.

## Before cutting

Confirm you are on `develop` with a clean tree, that a plugin release has been
through the local stage above, that `mise run p:release -- --dry-run` names the
versions the user expects, and that the change being released has its docs
reconciled — `readme.md`, `CLAUDE.md` and
`site/src/content/docs/plugins/<plugin>.md` ship with the change, not after it.
