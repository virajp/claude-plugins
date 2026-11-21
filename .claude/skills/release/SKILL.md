---
name: release
description: Cut a release — one project at a time via its
  release:<project>:production task (release:vwf:production,
  release:stackgen:production, release:installer:production,
  release:site:production), which runs p:plugins:release, p:i:release or
  p:site:release; each bumps from its last tag by the level in
  .config/bootstrap/releases.toml, commits on develop, lands on main and tags
  main. Also the GitHub Release note format, and the CI facts that make a failed
  publish legible. Run when the user asks to cut, tag, or publish a release.
allowed-tools: Read Grep Glob Bash
---

# Release

**Ask the user before running a `release:<project>:production` task,
`release:installer:ci`, `p:plugins:release`, `p:i:release` or
`p:site:release`.** It is the repo's hard rule, and every one of them commits,
merges and tags. There is no exception: no plan folder carries a release step.
`--dry-run` is the one form that may run without asking — it writes nothing.
`release:<plugin>:local` is the local stage below and publishes nothing.

**There are three things to release, and one tag family each.** Each release
is a `[release.<project>.<kind>]` table of `.config/bootstrap/repo.toml`, and
bootstrap ships its task `release:<project>:<kind>`, which runs this repo's own
task with fixed arguments. There is no run-all task: release each project with
its own task.

| Releasing         | Tag                    | Task                                                                 | Runs                                | Ends at                  |
| ----------------- | ---------------------- | -------------------------------------------------------------------- | ----------------------------------- | ------------------------ |
| one plugin        | `<name>-v<version>`    | `release:vwf:production`, `release:stackgen:production`              | `p:plugins:release --plugin <name>` | the pushed tag           |
| the installer CLI | `installer-v<version>` | `release:installer:production` (`release:installer:ci` from CI only) | `p:i:release` (`--ci`)              | npm + GitHub Release     |
| the website       | `site-v<version>`      | `release:site:production`                                            | `p:site:release`                    | Workers + GitHub Release |

`--dry-run` on a `release:*` task only prints the command it runs; `--dry-run`
on the own task prints the plan.

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
is `mise run p:plugins:local` (or `release:<plugin>:local`, which runs it with
`--plugin <name>` to stage that plugin alone): it copies each changed plugin
into the gitignored
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
mise run p:plugins:release -- --plugin vwf --dry-run # show the user, then ask
mise run release:vwf:production
```

The own task's `--dry-run` prints one line — `<project>: <last> -> <target>
(<LEVEL>), tag <tag>` — checks no branch or tree, writes nothing and exits zero.
Show it to the user before asking. Use `p:i:release -- --dry-run` and
`p:site:release -- --dry-run` for the installer and the site.

**No person and no plan bumps a version by hand.** A landing plan records a
level per project — `NONE`, `PATCH`, `MINOR` or `MAJOR` — and `/vwf:execute`
raises it at landing in `.config/bootstrap/releases.toml` (`format = 3`, then
one `<project> = "LEVEL"` line each), the highest level winning. The release
tasks read and clear it through `.config/mise/tasks/_scripts/local.py`, not
`bootstrap config`, because the engine is a macOS binary and `deps-update.yml`
runs on Linux. All three share one flow, `release()` in that module:

- **The base is always the project's last tag** — `<name>-v*`, `installer-v*`,
  `site-v*` — never the manifest.
- **The recorded level is the only source** of the bump.
- **The manifest is the floor**: a target below the manifest releases the
  manifest as it stands, so a release never lowers it. A manifest above the
  target that carries a 13 or 17 refuses.
- **The version skips 13 and 17**, so `1.1.12` patched is `1.1.14`, and the
  task says what it skipped. A level that can never clear the number refuses.
- A project at `NONE` with a manifest equal to its tag prints **"Nothing to
  release"** and exits zero. A project with **no tag yet** releases its manifest
  as it stands.
- Each task reads and clears **only its own key**: the plugin's name for
  `p:plugins:release`, `installer` for `p:i:release`, `site` for
  `p:site:release`.

**The sequence.** It fetches the tags, computes the target, then refuses unless
it is on `develop` with a clean tree and the tag does not exist yet; checks `gh`
for the installer and the site; runs the preflight (`p:i:test` for the
installer, `p:site:check` for the site, none for a plugin); writes the version
in place; for a plugin runs `p:plugins:marketplace`; clears the level; makes
**one** commit `ops: release <tag>` (for example `ops: release vwf-v25.0.0`) on
`develop`; pushes `develop`; runs `git:merge:main develop`, which fast-forwards
`main` to `develop`; and runs bootstrap's `git:tag <tag> --push`, a signed
annotated tag and the only thing it pushes. For the installer and the site it
then watches the workflow with `gh run watch --exit-status`.

**A stopped run resumes.** When a run stops after its commit, the level is
already cleared and the manifest is above a tag that does not exist. The next
run reads `NONE`, sees that, and lands and tags with no new bump. So the resume
is the same task again, from `develop`.

**`main` stays merge-only.** The bump is an ordinary commit on `develop`, and
`main` receives it by merge, so the `no-commit-to-branch` hook never has to be
skipped.

## Releasing plugins

Each entry in `.claude-plugin/marketplace.json` pins its plugin to a
`<name>-v<version>` tag, and that ref is **derived** from the plugin manifest's
`version`. `p:plugins:release --plugin <name>` writes the target into
`plugins/<name>/.claude-plugin/plugin.json` — the target validated before the
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
digits) — refs already tagged predate the rule and stay. The `+N` staging
counter is not a component and never trips it.

Each run releases one plugin, so a plugin whose version did not move is never
touched and its entry stays byte-identical — that is what makes releases
per-plugin.

**No GitHub Release and no npm publish.** The tag *is* the release. Users move
with `claude plugin marketplace update virajp-plugins` (re-reads the pins) then
`claude plugin update <name>` (fetches them) — both steps, or nothing moves.

If `plugins.yml` goes red on `main` with *"marketplace.json pins X, which is not
a tag"*, the merge landed and the tag did not. Run that plugin's
`release:<plugin>:production` again from `develop`: it resumes, and tags.

## Releasing the installer CLI

Releasing via CI is preferred over the local `p:i:publish`, so every version
keeps the strongest npm trust level (trusted publisher).

### 1. Bump, merge and tag

`release:installer:production` runs `p:i:release`: it refuses if
`installer-vX.Y.Z` already exists, runs `p:i:test`, bumps `package.json`,
commits on `develop`, lands it on `main` with `git:merge:main` (which pushes
**`main` first**), tags `main` with `git:tag --push` (the tag second), and
watches the `release.yml` run with `gh run watch --exit-status`, so the task
only succeeds if the publish pipeline does. It needs `gh` installed and
authenticated, and checks it **before** any bump, commit or merge.

The push order is load-bearing: `release.yml` checks the tagged commit is
reachable from `origin/main`, so a tag arriving before the branch fails that
gate. `p:plugins:release` takes the same order, though no plugin tag is checked
for reachability.

`--ci` (the task `release:installer:ci`) runs the same bump, commit and merge,
then makes an annotated, unsigned tag with `git tag --annotate` and stops, with
no push of the tag and no watch. `deps-update.yml` runs it, having raised the
installer to `PATCH` and committed the refresh first, then pushes the tag and
dispatches `release.yml` — a tag a bot pushes cannot start a workflow. Do not
run it by hand.

### 2. Cut the GitHub Release

Every `installer-vX.Y.Z` tag carries one — the tag is the npm-publish trigger,
the Release is the human-readable record beside it. The mapping is **1:1**, so a
missing Release means a missed step. Plugin tags get no Release.

```sh
gh release create installer-vX.Y.Z --title installer-vX.Y.Z \
  --notes-file < notes > --verify-tag
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

`release:site:production` runs `p:site:release`: it refuses if `site-vX.Y.Z`
already exists, checks `gh`, runs `mise run p:site:check`, bumps
`site/package.json`, commits on `develop`, lands it on `main` with
`git:merge:main` (**`main` first**), tags `main` with `git:tag --push` (the tag
second) and watches the `site.yml` run with `gh run watch --exit-status`, so the
task only succeeds if the deploy does. The push order is load-bearing for the
same reason as the installer's: `site.yml` checks the tagged commit is
reachable from `origin/main`.

### 2. Cut the GitHub Release

Every `site-vX.Y.Z` tag carries one, in the note format below — the same 1:1
rule as the installer's.

```sh
gh release create site-vX.Y.Z --title site-vX.Y.Z \
  --notes-file < notes > --verify-tag
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

- __npm allows exactly one Trusted Publisher per package, and it validates the
  entry-point workflow's *filename*__ — so it is set to `release.yml` only.
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
through the local stage above, that the own task's `--dry-run` names the
version the user expects, and that the change being released has its docs
reconciled — `readme.md`, `CLAUDE.md` and
`site/src/content/docs/plugins/<plugin>.md` ship with the change, not after it.
