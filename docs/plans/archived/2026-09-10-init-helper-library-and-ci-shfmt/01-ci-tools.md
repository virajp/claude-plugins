# U1 — CI tools: mise.ci.toml declares shfmt and shellcheck

- **Wave:** 1
- **Depends on:** —
- **Owns:** `.config/mise.ci.toml`
- **Model:** opus
- **Read first:** `.config/mise.ci.toml` top to bottom; `.config/mise.dev.toml`
  lines 26–32 for the spelling to copy.
- **Lazy-load:** `.github/workflows/plugins.yml:30-70` (read-only, to see the
  step this unblocks); `.config/mise/tasks/plugins/shellcheck:55-70` (read-only,
  the `command -v` guard).

## Ruling

From index.md's assumed decisions, verbatim:

> **1.** **Declare both in `mise.ci.toml`.** `shfmt` and `shellcheck` are added
> to `.config/mise.ci.toml`'s `[tools]`, spelled exactly as
> `mise.dev.toml:30-31` spells them (`{ version = "latest" }`). No workflow file
> changes; the now-redundant `mise x …` wrapper in `plugins.yml:65-67` stays for
> the task-groups plan to drop when it rewrites that line. This reverses the CI
> doc's rationale at `ci-and-releases.md:10-16`, which the docs unit rewrites.

The cause, from the facts:
`mise x shellcheck@latest shfmt@latest -- mise run
plugins:shellcheck` installs
shfmt, then the inner `mise run` rebuilds PATH from the config-resolved toolset
and drops the ad-hoc install; the shim has no version under `MISE_ENV=ci`.
Declaring the tools in the CI layer is what makes the config-resolved toolset
carry them.

## Edits

1. **`.config/mise.ci.toml`** — under the existing empty `[tools]` table at the
   end of the file, add two entries, alphabetical, each on its own line, spelled
   as `mise.dev.toml:30-31` spells them:

   ```toml
   shellcheck = { version = "latest" }
   shfmt      = { version = "latest" }
   ```

   Keep the file's existing comment style; add one comment line above them
   saying they are `plugins:shellcheck`'s and that CI resolves them from this
   layer, not from the `mise x` wrapper in the workflow. Do not add `actionlint`
   — CI runs it through pre-commit, not through this task. Do not touch
   `mise.dev.toml`; the two tools are deliberately declared in both environment
   layers, since each layer holds only its own deltas over `mise.toml`.

## Verification

- `mise x -- taplo fmt --check .config/mise.ci.toml` exits 0 (the formatter
  hook's tool; `taplo` is in the dev layer).
- `MISE_ENV=ci mise ls --current 2>/dev/null | grep -E '^(shfmt|shellcheck)\b'`
  → two lines, each with a resolved version (run `MISE_ENV=ci mise install`
  first if either shows missing; that is what CI's action does).
- `MISE_ENV=ci mise x shellcheck@latest shfmt@latest -- mise run plugins:shellcheck`
  exits 0 from the repo root — the exact nesting `plugins.yml:65-67` runs.
- `mise run plugins:check` green.
- `git diff --stat` lists `.config/mise.ci.toml` alone.

## Guardrails

- Do not touch `.github/workflows/**`, `.config/mise.toml`,
  `.config/mise.dev.toml`, `.config/pre-commit-config.yaml` — the task-groups
  plan's Owns.
- Do not pin an exact version; `latest` matches the dev layer and the pack's
  convention, and no `mise.lock` exists to pin against.
- Delete with `rm`, never `git rm` (nothing here is deleted).
- Write with Write/Edit, never a `cat` heredoc (`cat` is aliased to `bat`).
- Never run `git checkout`, `git restore`, `git stash`, or a formatter with
  `--fix` on a path outside your Owns.

## Commit

`ops: CI declares shfmt and shellcheck for plugins:shellcheck` — written by the
orchestrator after the wave gate, not by the unit. Type `ops` is in
`.config/git-conventional-commits.yaml`'s list.
