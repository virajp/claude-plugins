# CI & Releases

## mise environments

The mise config, its `MISE_ENV` split and the `setup:*` and `code:*` tasks are
[bootstrap](https://github.com/virajp/bootstrap)'s, synced under `.config/` from
the tools `.config/bootstrap/tools.toml` selects: one folder per tool under
`.config/mise/conf.d/`, and this repo's own values in `conf.d/zz-repo/` and
`conf.d/cloudflare/`. Its reference is bootstrap's `docs/sync`.

Under `MISE_ENV=ci`, which the workflows set, `node.gpg_verify = false` works
around a mise-on-Linux bug where its bundled Node release-key import fails on
the
CI runner's gpg with "no valid OpenPGP data found" (the Node tarball is still
SHA256-checksum verified). Same mise version verifies fine on macOS; see
jdx/mise
discussion #10553.

**There is no mise lockfile.** It was dropped on 2026-09-30 — it slowed every
install and caused more failures than it prevented.

## The branch model, and the three tag families

**`develop` takes the work; `main` is what users read.** Claude resolves
`claude plugin marketplace add virajp/claude-plugins` against the repo's
**default branch**, so `main` stays the default and PRs target `develop`.

**`main` is merge-only, enforced in two places.** Locally, pre-commit's
`no-commit-to-branch` blocks a commit on `main` — it does *not* block merges,
since git runs `pre-merge-commit` for those and only that hook type is
uninstalled here; the exception is a merge that stops on a **conflict**, whose
resolution ends in a real commit. Remotely, the `protected-branches` ruleset
blocks force-push and deletion on both branches, and `release-tags` does the
same for `refs/tags/*-v*`. Neither requires a PR or a green check, so the
`release:*` tasks and `deps-update.yml` all still push directly.

**The landing model is per branch.** `repo.branches.<b>.landing` — the
`[branches.<b>]` table of `.config/bootstrap/repo.toml` — sets how a branch
lands: `direct-merge` (merge locally and push), `direct-commit` (direct commits
allowed too) or `pr` (push and open a pull request), read by
`git:merge:develop` and `git:merge:main`. A missing key is `direct-merge`; this
repo sets `develop` to `direct-commit` and leaves `main` at the default.

**A release task bumps, commits and merges, then tags — and `main` stays
merge-only.** No person and no plan bumps a version by hand: a landing plan
records a level per project (`NONE`, `PATCH`, `MINOR`, `MAJOR`), and
`/vwf:execute` raises it at landing, the highest level winning, in
`.config/bootstrap/releases.toml` (`format = 3`, then one `<project> = "LEVEL"`
line each). Each release is a `[release.<project>.<kind>]` table of
`.config/bootstrap/repo.toml` with bootstrap's `type = "task"`, and bootstrap
ships its task `release:<project>:<kind>`, which runs this repo's own task with
fixed arguments — `release:vwf:production` and `release:stackgen:production`
run `p:plugins:release --plugin <name>`, `release:installer:production` runs
`p:i:release`, `release:installer:ci` runs `p:i:release --ci` and
`release:site:production` runs `p:site:release`; `--dry-run` on a `release:*`
task only prints the command. The three own tasks share one flow, `release()` in
`.config/mise/tasks/_scripts/local.py`, which reads and clears the levels itself
(tomllib and a line edit, not `bootstrap config`: the engine is a macOS binary
and `deps-update.yml` runs on Linux). It reads only the project's own key, runs
from `develop` on a clean tree, bumps the project from its **last tag** by the
recorded level — never below the manifest, which is the floor — runs the
project's preflight (`p:i:test`, `p:site:check`; none for a plugin), clears the
key, makes one commit `ops: release <tag>` on `develop`, pushes it, lands
`develop` on `main` with `git:merge:main` (a fast-forward, so `main` equals
`develop` after it), and tags `main` with bootstrap's `git:tag <tag> --push` — a
signed annotated tag, the only thing pushed. A level `NONE` with a manifest
equal to the last tag is "Nothing to release"; a level `NONE` with a manifest
above a missing tag resumes a run that stopped after its commit, landing and
tagging it with no new bump. The bump is an ordinary `develop` commit that
reaches `main` by merge, so the `no-commit-to-branch` hook is never skipped. The
targets **skip past 13 and 17** rather than land on one — the bumped component
stepped past the number, so `1.1.12` patched is `1.1.14` — and a manifest above
the target that carries such a component is refused. This reverses the earlier
rule that a release task only tags (2026-10-08): tagging only what had landed
left every bump to a hand edit, which is what the recorded levels retire. The
full ritual is the `release` skill.

The branch alone would not hold anything back, though, because a merge to `main`
is what publishes. What decouples the two is that **every plugin is pinned to
its own tag** in the marketplace manifest, so shipping is a deliberate act:

```text
a plan lands on develop                → /vwf:execute raises the level in .config/bootstrap/releases.toml
mise run p:plugins:local               → stages X.Y.Z+N, this machine only
mise run release:<plugin>:production   → bumps, commits, merges to main, creates + pushes the tag
```

The second line is the **local half** of a release: it publishes nothing,
commits nothing and cuts no tag. `/vwf:execute` — the folder named, `next`, or
each plan `all` runs — runs it as the plan folder's after-landing step, recorded
`run` at the interview: it runs on a green landing without a prompt — except
that under `all`, when the run's deduped-steps question is answered yes, an
identical step runs once, from the main checkout, after the last plan that
landed (`workflows/all.md` in the execute skill) — and the author's next
**restarted** session is on the plugin that just landed — which is why a plan
editing a plugin the session running `/vwf:execute all` loads is asked, at its
interview, whether to end an `all` run after landing — recorded as
`consent.end_all_run` in the folder's `index.json`; `true` ends the run there.
Only the last line reaches users, and it is the one `CLAUDE.md`'s hard rule
guards.

The tracked version is always plain `X.Y.Z` — `p:plugins:check` fails a manifest
carrying build metadata, and fails one whose version has a **13 or 17
component** (`1.13.0`, `17.0.0`, `2.1.17`; `1.130.0` and `113.0.0` merely
contain the digits and are fine). Those two integers are never issued on any
version line this repo maintains — the plugin manifests, the installer, the
site, `config_format`, `blueprint_format`. The `X.Y.Z+N` the authoring machine
runs between releases lives only in the gitignored staged copies
`p:plugins:local` writes (`dev-marketplace.md`), so no iteration touches git,
and the `+N` is not a component.

`p:plugins:release --plugin <name>` releases **one** plugin, which is what makes
releases per-plugin: a plugin with no recorded level and a manifest equal to its
tag is "Nothing to release", so its entry stays byte-identical and
`claude plugin update` sees nothing for it. It bumps only on `develop` and on a
clean tree, and tags only on `main` — a tag cut anywhere else would publish
content `main` never carried.

**The cost of that discipline, and what pays it.** Between the bump and the tag,
the manifest names a ref that does not exist — normal on `develop`, and harmless
for users, who resolve against `main`. It is *not* harmless for anyone who
registered the marketplace from a local checkout of `develop`: their manifest is
live, so a plugin update fetches a missing tag and a plugin deleted from the
manifest disappears from their machine on the merge. That is what
`.dev-marketplace/` exists for — the authoring machine registers **it** instead,
gets repo-relative sources with no tags in the picture at all, and this section
stops applying to it. Nothing here changes: the tags, the release task and what
users get are exactly as described. See
[`dev-marketplace.md`](dev-marketplace.md).

**Three tag families, all namespaced**, and the namespacing is load-bearing
rather than tidiness:

| Tag                    | Releases                     | Triggers                       |
| ---------------------- | ---------------------------- | ------------------------------ |
| `<name>-v<version>`    | one plugin                   | nothing — refs resolve to it   |
| `installer-v<version>` | `@virajp.dev/claude-plugins` | `release.yml` → npm publish    |
| `site-v<version>`      | the website                  | `site.yml` → `wrangler deploy` |

The installer's tags were bare `v*` until 2026-08-30. GitHub's tag globs match
any character **except** `/`, so `v*` matched `vwf-v19.9.0` — every vwf release
would have fired `release.yml`, failing closed at its version check but failing
every time. Renaming the installer family was preferred over narrowing the glob
because it removes the whole collision class rather than this one instance: no
future plugin name can collide, whatever letter it starts with. It is safe
against the npm constraint — the Trusted Publisher binds to `release.yml`'s
**filename**, not to which tags reach it. The `installer-v*` family belongs to
`@virajp.dev/claude-plugins` alone and starts at `installer-v1.0.0`; the old
package's tags were removed, so nothing in this repo names it any more.

**Dogfooding unreleased plugin work does not go through an install.** A
`git-subdir` source is self-contained, so it fetches from GitHub at the tag even
when the marketplace is registered as a local `directory` — which is how this
checkout is registered. Use `claude --plugin-dir plugins/<name>` instead: it
loads the working tree for that session, no install and no cache.

## Workflows (`.github/workflows/`)

- **`plugins.yml`** — validates the plugin toolkit on every push to `main` or
  `develop` and every PR: `p:plugins:marketplace --check`, then
  `p:plugins:inventory --check`, then `p:plugins:check`, then the vitest suites,
  then `p:plugins:npm-normalize-test`, then `p:releases:test` (the table test of
  `_scripts/local.py`), then `tsc --noEmit` per project. The order matters —
  proving the two committed generated files are what their sources generate
  *before* validating anything means a stale one fails as staleness rather than
  as some confusing downstream assertion. On `main` only it adds one more gate:
  **every `source.ref` names a tag that exists**. That one is deliberately *not*
  part of `p:plugins:marketplace --check`, which must stay offline and
  fresh-clone-safe; this asks the remote a question. It goes red whenever `main`
  names a ref with no tag — the window between `p:plugins:release`'s merge to
  `main` and its tag push, which it closes itself, or a bump that reached `main`
  some other way — and that is a marketplace whose installs fail for every user,
  so red is correct. The run the merge's push to `main` starts can fall inside
  that window and go red; a re-run after the tag push clears it. Deliberately a
  **separate file** from `release.yml`: npm allows one Trusted Publisher and
  validates the entry-point workflow's filename, so that file's trigger surface
  stays untouched. This workflow publishes nothing and holds no `id-token`
  permission.
- **`release.yml`** — publishes `@virajp.dev/claude-plugins` to npm via **OIDC
  trusted publishing** (no stored token, provenance automatic). Triggered two
  ways: a pushed `installer-v*` tag, or `workflow_dispatch` — which is also how
  `deps-update.yml` publishes. Plugin tags never reach it; see The branch model
  above. **Every publish path must enter through this file** (see below). It
  sets up mise (`MISE_ENV=ci`), checks out the triggering ref, verifies the tag
  matches `package.json` (whenever that ref is a tag),
  `pnpm install --frozen-lockfile`, **osv-scans** the lockfile, **runs the
  tests** (`mise run p:i:test`), verifies the package (`mise run p:i:build`),
  then `npm publish`. The publish step is **idempotent** — it skips (does not
  fail) if that version is already on npm, so tag re-points, dispatch retries,
  and re-runs are safe. **Publishing uses the npm CLI; everything else stays
  pnpm.** The local `p:i:publish` task mirrors the gates + `npm publish`.
- **`deps-update.yml`** — monthly cron (+ manual dispatch): `pnpm update`
  (bounded by the cooldown below); if anything changed, `osv-scanner` gates on
  any known-vulnerable package, then it cuts a **patch release** — raising
  `installer` to `PATCH` in `.config/bootstrap/releases.toml` the way a landing
  plan does (through `_scripts/local.py`, since the engine does not run on
  Linux),
  committing the refresh and that level on **`develop`**, failing on a dirty
  tree before anything is pushed, pushing `develop` with `-u` (`git:merge:main`
  reads `develop@{u}`), pointing a local `main` at `origin/main` with
  `git branch -f`, then running `mise run release:installer:ci` — which bumps,
  commits, merges with `git:merge:main` and makes an annotated, unsigned tag,
  with no tag push and no watch — and pushing the tag. It takes the same
  merge-only route a human does. It
  then **delegates the npm publish by dispatching `release.yml` on the new tag**
  (`gh workflow run release.yml
  --ref <tag>`, using the built-in
  `GITHUB_TOKEN` and the job's `actions: write` grant) rather than publishing
  inline.

  **Why a dispatch and not `workflow_call`.** npm allows only **one Trusted
  Publisher per package**, and it validates the **entry-point** workflow's
  filename — not the workflow that actually runs `npm publish`. `workflow_call`
  therefore does *not* work: this repo shipped it that way for two months and
  both monthly runs died at the publish step with `ENEEDAUTH`, because npm saw
  `deps-update.yml` and matched nothing. A dispatch makes `release.yml` the
  entry point, so the single Trusted Publisher authorizes it. The tag push alone
  cannot trigger `release.yml` — refs pushed with `GITHUB_TOKEN` don't start
  workflow runs — but **`workflow_dispatch` and `repository_dispatch` are
  explicit exceptions to that rule**, so no PAT or GitHub App token is needed.
  The dispatch is fire-and-forget: the `release.yml` run is the publish record.
- **`site.yml`** — builds and deploys the website at
  `claude-plugins.virajp.dev`, the Astro site under `site/`, served from
  Cloudflare Workers Static Assets. Two jobs. **`build`** is the gate: it runs
  `mise run p:site:check` (type-check, build, search index, link check) on every
  PR and every push to `main` or `develop` that touches `site/**` or the
  workflow itself, and on every `site-v*` tag; on a tag only, it uploads
  `site/dist` as an artifact so `deploy` ships exactly the tree the gate
  checked. That artifact is also why the `_headers` file lives in
  `site/public/`: `deploy` never rebuilds, so anything Cloudflare must read has
  to be inside `dist/` already. **`deploy`** runs only on a pushed `site-v*`
  tag, after `build`, and only once the tag is proven to match
  `site/package.json`'s version and to be reachable from `main` — the same two
  verifications `release.yml` makes, so a merge to `main` ships nothing until
  `release:site:production` cuts the tag. It sets up mise and installs the
  workspace first, so the `wrangler` pinned in `site/package.json` is the one
  that deploys, then runs `cloudflare/wrangler-action` (pinned by commit) with
  the repository secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.
  Superseded branch and PR runs are cancelled; a tag's deploy never is. It is
  deliberately a **separate file** from `release.yml` for the same reason
  `plugins.yml` is — it publishes nothing to npm and holds no `id-token`
  permission — and `plugins.yml` is untouched by it: the site's gate runs here
  alone. The tag glob is namespaced because a bare `v*` would fire it on every
  plugin and installer release.

## Supply-chain settings

`pnpm-workspace.yaml` sets **`minimumReleaseAge`** (a publish cooldown, in
minutes) so neither installs nor the monthly update adopt brand-new —
potentially compromised — releases.

## One-time manual setup (not automatable here)

On **npmjs.com**, add this repo + `release.yml` as the **Trusted Publisher** for
`@virajp.dev/claude-plugins` (enables OIDC). A package name that has never been
published cannot be configured at all, so the first version under a new name is
published **by hand** (`mise run p:i:build && mise run p:i:publish` under the
user's npm login) and the publisher is added afterwards. The workflow-filename
field takes a **single file** and a package has **exactly one** Trusted
Publisher — set it to `release.yml` only (not a comma-separated list, and not
`deps-update.yml`, which publishes by *dispatching* `release.yml`). A mismatch
surfaces only at publish time as `ENEEDAUTH`. Until configured, `release.yml`
cannot publish.

**The sunset stub is a one-time hand publish too.** `@askviraj/ai-plugins`, the
package's former name, ships once more as `7.0.0` from `sunset/` — a standalone
package, not a workspace member, never built — and every version including it is
deprecated. The stub exists because a deprecation alone is not enough: `npx`
prints the notice only on the first, uncached run, and `pnpx` never prints it,
so a user with the old name cached gets no hint at all. `7.0.0` resolves as
`latest` and prints the pointer itself, exiting non-zero. Both commands are run
by hand, in this order, and need the interactive npm login:

```sh
cd sunset && npm publish --access public
npm deprecate "@askviraj/ai-plugins@*" "Moved to @virajp.dev/claude-plugins"
```

No task and no workflow touch the old name, and `release.yml` has nothing to do
with it.

## Cutting a release

One ritual per project, on `develop` with a clean tree:

```sh
mise run p:plugins:release -- --plugin vwf --dry-run # <project>: <last> -> <target> (<LEVEL>), tag <tag>
mise run release:vwf:production
```

The own task's `--dry-run` writes nothing and checks no branch; `--dry-run` on a
`release:*` task only prints the command it runs. A run with level `NONE` and a
manifest equal to the last tag prints "Nothing to release" and exits 0.
Otherwise it checks the branch, the tree and that the tag is new, runs the
project's preflight (`p:i:test` for the installer, `p:site:check` for the site),
writes the version, makes one commit `ops: release <tag>`, pushes `develop`,
lands it on `main` with `git:merge:main` and tags `main` with `git:tag --push`.
A run that stopped after its commit resumes on the next run: the manifest is
above a tag that does not exist, so it lands and tags with no new bump. There
is no run-all task: release each project with its own
`release:<project>:production` task.

The plugins get no npm and no GitHub Release — the tag *is* the release, and
users move on `claude plugin marketplace update virajp-plugins`. The installer
and the site each get a GitHub Release for the tag: every `installer-vX.Y.Z` and
`site-vX.Y.Z` tag carries one, so a missing Release means a missed step. Their
tasks land `main` before the tag (`release.yml` and `site.yml` check
reachability) and watch the run with `gh run watch`. Prefer releasing the
installer via CI over the local `p:i:publish`, so every version keeps the
strongest npm trust level.

**Ask the user before running any of them** — always; no plan carries a release
step.

> The full ritual, the release-note format, and the CI facts that make a failed
> publish legible are in `.claude/skills/release/` — run `/release`.
