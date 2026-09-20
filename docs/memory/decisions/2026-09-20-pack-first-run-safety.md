# Decision — a pack task never clobbers host state; git-config requires a forge identity

**Date** 2026-09-20 · **Branch** `2026-09-20-pack-first-run-safety` · **Plan**
[`docs/plans/2026-09-20-pack-first-run-safety/`](../../plans/2026-09-20-pack-first-run-safety/index.md)
· **Backlog** B28, piece D2, plan 1 of 5 · **Problem**
[`2026-09-20-init-shape-audit.md`](../problems/2026-09-20-init-shape-audit.md)
(L1, L2, L3, L4, L6, L15, L16)

## What was decided before

The mise pack's task library treated a machine's git state as its own. The
`code/git-config` task carried the rule *"identity and signing keys must live in
GLOBAL git-config, never per-repo local"*, and its `--fix` — which the
pre-commit hook `git-config` runs on every commit — deleted eight local keys
without asking; the hook description said it *"prevents a local .git/config from
overriding global user and signing settings"*. `setup:precommit` unset
`core.hooksPath`, installed with `--overwrite` and ran `pre-commit autoupdate`
on every run; `setup:mise` ran `mise upgrade --local` and `dprint config update`
on every run — each rewriting a file the shape lock records, so the first
`setup:all` on a clone produced doctor drift on two files nobody edited. The
shipped `check-json` hook failed on the JSONC editor files `init` composes, and
`code:sec`'s full scan failed on a gitignored `.env`, because gitleaks' `dir`
mode does not honour `.gitignore`. grype had a threshold and no baseline step.

## What changed

**The posture — the standing rule for every pack task from now on.** A pack task
**never clobbers foreign state**: it never unsets, overwrites or upgrades
anything it did not create. Where it would have to, it stops, names what it
found, and prints the one by-hand command. Every destructive step sits behind an
explicit flag the user passes on purpose, and `setup:all` passes none of them,
so a bootstrap on any clone rewrites nothing outside the files the packs own.
Three flags carry it:

| Flag        | Task              | Gates                                                                                                                                                            |
| ----------- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--force`   | `setup:precommit` | unsetting a **local** `core.hooksPath` and installing with `--overwrite`; a global or system `core.hooksPath` is named by scope and refused even here            |
| `--update`  | `setup:precommit` | `pre-commit autoupdate`, which moves the hook `rev:` lines                                                                                                       |
| `--upgrade` | `setup:mise`      | `mise upgrade --local` and `dprint config update`, which move the tool pins and the formatter plugin pins; the dprint step still needs a terminal for its prompt |

Without `--force`, `setup:precommit` probes the **effective** `core.hooksPath`,
`.husky/` and eight lefthook forms (`lefthook` or `.lefthook`, with `.yml`,
`.yaml`, `.toml` or `.json`); on a hit it prints the unset and the `--overwrite`
install to run by hand, plus the cleanup — delete the foreign files and drop a
husky `prepare` script, the task deletes nothing — and exits 1. A repo
pre-commit already owns (no `core.hooksPath`, pre-commit's own hook installed)
is not refused again, even with a husky or lefthook file still tracked. The
plain path installs without `--overwrite`, so a hand-written hook script is kept
as `.legacy` and chained.

**The git-config reversal.** The doctrine above inverts, superseding the task's
own rule comment and the hook description. The identity is **per-repo, required,
and equal to** `<FORGE>_USER_NAME`, `<FORGE>_EMAIL` and `<FORGE>_SIGNING_KEY` —
equality, not presence — where `<FORGE>` is `GITHUB` when the origin host is
`github.com` or a subdomain of it (`ssh.github.com`), `GITLAB` for `gitlab.com`
or a subdomain, and `GIT` for any other host or no remote. Beside them
`commit.gpgsign` and `tag.gpgsign` are `true`, `gpg.format` is `ssh`, and
`gpg.program` and `gpg.ssh.program` are absent. Check mode lists each failing
key, expected against actual, and the variable to export, and exits 1. `--fix` —
still what the hook runs — refuses before writing anything when a variable is
unset, writes only the keys that differ, unsets the two `gpg.*program` keys, and
exits 1 *identity corrected — re-run the commit* whenever it changed anything:
git resolves the author, the committer and `commit.gpgsign` before a hook runs,
so the commit in flight would land under the old identity, unsigned. The first
commit on a fresh clone is therefore refused once; the re-run carries the
identity. `<FORGE>_SIGNING_KEY` holds what git accepts as `user.signingkey`
under `gpg.format` `ssh`: a key-file path or the literal public key prefixed
`key::`; a bare `ssh-…` line still works as the deprecated form of `key::`, any
other key type without the prefix is read as a file path.

**Where the variables live.** The hook depends on the three exported variables,
so a GUI git client that never sources the shell profile is refused with *Cannot
fix — unset: …*. The hook runs under `mise x`, so the global mise config's
`[env]` block (`~/.config/mise/config.toml`) is the one place that reaches every
client; a shell-profile export reaches the terminal alone.

**The interim rule until plan 4.** `init` commits an existing repo's gate
configuration through the live hook and never asks for the three variables.
Until plan 4 (`branch-model`) teaches init's git pass to read them, **export the
three before any `/vwf:setup reshape` — this repo included — and expect one
refused-then-rerun commit**; with them unset the commit fails outright.

**gitleaks.** The `.venv/` directory joins the allowlist. The `.env` exemption
does **not** — an allowlist there is mode-wide and would blind the staged gate
to a `.env` someone did stage (the review's one High) — so `code:sec`'s full
scan builds a throwaway overlay extending the shipped toml with the `.env` paths
for the `dir` scan alone, and the shared config stays strict. The full scan is
therefore not history coverage for `.env` files; a committed one is found by a
by-hand `gitleaks git` run.

**grype.** The conventions, the skill and a comment in `grype.yaml` gain the
baseline step gitleaks already had: run the scan, upgrade where an upgrade
exists, and copy each remaining finding's vulnerability id under `ignore:` with
a one-line reason and a re-check date, then re-run until green. `code:sec`
prints that remedy on a grype failure — or *materialize the grype component*
when `grype.yaml` is absent. The threshold stays `medium`.

**check-json.** The pack's hook gains `exclude: ^\.vscode/` — the two composed
editor files are JSONC by design.

## The alternatives rejected

- **A prompt inside the task** — hooks and CI have nobody to answer it; the flag
  is the answer given ahead of time.
- **A warning at init only** — later clones get none; the task is what every
  clone runs.
- **Check-only git-config with an opt-in forbidden list, drop the hook, or
  presence-only** — none makes the first commit carry the right identity;
  equality to a forge-scoped variable does.
- **`MISE_…` prefixes or `--yes`** — the variables name the forge, and the flags
  name the act.
- **Switching the full secret scan to `gitleaks git`, or making `dir` honour
  `.gitignore`** — the first drops uncommitted files, the second gitleaks cannot
  do.
- **Lowering the grype threshold to clear a first scan** — the permanent silence
  the ignore list exists to avoid.
- **The exact host only** (decision 2 as written) — `ssh.github.com` is GitHub's
  own port-443 host; a subdomain of the forge is the forge.

## Still out of scope

- `code:format --fix` reformatting a whole tree at the first commit (L8) and the
  graphify post-commit hook `setup:ai` installs (the rest of L16) — plan 3
  (`init-brownfield-reads`) gives init's survey a consent row per first-run
  effect, and owes the hash re-record after `--update` / `--upgrade`.
- `setup:all` halting at the refusal on a brownfield clone with a foreign hook
  manager — as ruled, until the by-hand cleanup is done; a tolerant call site is
  plan 3's.
- `init` asking for the three forge variables, and adding the remote before the
  first commit so a new repo never flips from `GIT_*` to `GITHUB_*` — plan 4.
- The grype threshold, the `main` / `develop` literals and the exclusion sets as
  values (L13, L14, L20) — plan 5 (`pack-intent-rendering`).
- This repo's own `.config/mise/tasks/**` and `.config/pre-commit-config.yaml`
  are pack copies that follow at its next `/vwf:setup reshape`; until then its
  hook still runs the old `--fix`.
