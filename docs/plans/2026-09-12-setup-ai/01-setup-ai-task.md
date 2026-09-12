# U1 — The `setup/ai` task

- **Wave:** 1
- **Depends on:** —
- **Owns:**
  `plugins/stackgen/stacks/toolchain-manager/mise/config/.config/mise/tasks/setup/ai`.
  Touch nothing outside this list.
- **Model:** opus
- **Read first:** the owned file, top to bottom. Then, read-only:
  `.config/mise/tasks/p/plugins/local` (how this repo already reads
  `marketplace list` and `installed_plugins.json`), `installer/src/graphify.ts`
  (the two graphify calls to reproduce), `installer/src/install.ts:140-230`
  (what the installer does and does not do, so the task does not repeat its
  by-name mistake), the pack's `setup/all` for the marked-position comment style
  and `mise.toml:96-115` for the `REPO_NAME` marked position's wording.
- **Lazy-load:** `.claude/docs/dev-marketplace.md` if the two modes are unclear;
  `plugins/stackgen/stacks/toolchain-manager/mise/skills/mise/references/task-library.md`
  §28 for the `#USAGE` header shape.

## Ruling

Quoted from index.md:

> **1. No installer.** "If `setup:ai` uses claude commands then it ideally
> should work in both cases." The task runs no `pnpx`. It reads
> `claude plugin marketplace list --json`; if `virajp-plugins` is registered
> **from any source** it runs `claude plugin marketplace update virajp-plugins`
> and never `add`; else `claude plugin marketplace add virajp/claude-plugins`.
> The same registered-check-then-update-else-add rule applies to every extra
> marketplace. A failed `add` is an error, not swallowed.

> **2. Project scope.** "`setup:ai` must only focus on the plugins required for
> the repo and ideally not touch the user-level plugins. There might be
> exceptions but rare." Default scope is `project`:
> `claude plugin install --scope project <name>@<marketplace>` for each required
> plugin not yet at project scope; `claude plugin update --scope
> project` for
> each that is; `claude plugin autoremove --scope project --yes` once.
> User-scope entries are never installed, updated or removed. "Install at
> project scope anyway": a required plugin already enabled at user scope is
> still installed at project scope, so the repo's `.claude/settings.json`
> declares it. `--user` is the flag for the rare exception and flips every
> `--scope`.

> **3. The two slots.** `EXTRA_MARKETPLACES` and `EXTRA_PLUGINS` become marked
> positions in the pack's commented-template style (the real lines written one
> per row, the template comment left in place). The task gains `--inventory`:
> prints one line per registered marketplace other than `virajp-plugins`,
> `<source-ref>|<name>`, then one line per plugin installed from any marketplace
> at any scope, `<name>@<marketplace>|<scope>`, and exits 0 with nothing else on
> stdout.

> **4. graphify.** After the plugins: if `graphify` is on PATH,
> `graphify install --platform claude` then its post-commit hook install (the
> same two calls the installer makes); else `print_yellow` the install hint and
> continue. Idempotent.

> **5. Statusline.** If `claude-status` is not on PATH, `print_yellow`
> `brew install virajp/tap/claude-status`; never run it.

> **6. Official marketplace.** Never added by the task: it ships with Claude
> Code.

## Edits

Rewrite the file. Keep the shebang, `#MISE description`, `#MISE hide=true`, the
`set -euo pipefail`, the sourced helpers, the `claude`-on-PATH guard, and the
header comment's first paragraph (why it is a `setup:*` task). Then:

1. **Header.**
   `#USAGE flag "--user" help="Install at user scope instead of this repo's project scope (rare)"`
   and
   `#USAGE flag "--inventory" help="Print the marketplaces and plugins registered on this machine, one per line, and exit"`.
   Remove `--project`.
2. **A JSON reader.** `claude plugin marketplace list --json` and
   `claude plugin list --json` are the sources. Parse with `node -e` through
   `_scripts/helpers.mjs`'s `run()` if that is the pack's convention, else `jq`
   **only if** `mise.dev.toml` already pins it (it does: `:22-30`) — read the
   pack and pick the one the neighbours use; report `DECIDED:`.
3. **`--inventory`.** Print the rows per ruling 3 and `exit 0`. Nothing else on
   stdout (helpers print to stderr where they print at all; check
   `_scripts/helpers` and use the right stream).
4. **Marketplace step.** `registered virajp-plugins` →
   `claude plugin marketplace update virajp-plugins`; else
   `claude plugin marketplace add virajp/claude-plugins`. No `|| true` on the
   add. Same for each `EXTRA_MARKETPLACES` row: registered by name → update;
   else add by source-ref. Print one line per marketplace naming which of the
   two ran.
5. **The two marked positions.** Keep the arrays and their existing comments,
   and add to each comment the sentence the pack uses for a marked position: the
   rows come from the orchestrator's confirmed answer to its plugin question,
   seeded by `--inventory`; leave the comment in place so a re-run can
   re-derive. Show one commented example row in each, in the exact row shape.
6. **Plugin step.** Required set = `vwf@virajp-plugins` plus every
   `EXTRA_PLUGINS` row. `SCOPE=project`, or `user` under `--user`. For each: if
   `claude plugin list --json` shows it at `SCOPE` →
   `claude plugin update --scope $SCOPE <plugin>`; else
   `claude plugin install --scope $SCOPE <plugin>`. Never touch the other scope.
   Then `claude plugin autoremove --scope $SCOPE --yes` once (drops a
   project-scope plugin nothing references, such as a dependency that stopped
   being one). `stackgen` arrives as vwf's dependency and is not listed.
7. **graphify.** Per ruling 4, after the plugins.
8. **Statusline.** Per ruling 5, last.
9. **Close** with `print_success "AI tooling reconciled."`.

Every `claude` command that can fail on a bad state fails the task (no
`|| true`) except `autoremove`, which may report "nothing to remove" non-zero on
some versions — measure it hermetically and report `DECIDED:`.

## Verification

- `mise run p:plugins:check` and `mise run p:plugins:shellcheck` green.
- Hermetic, `export CLAUDE_CONFIG_DIR=$(mktemp -d)`, in a scratch repo holding
  the mise pack's payload with the three marked positions filled and
  `mise trust --all`:
  - `mise run setup:ai --inventory` prints only rows (or nothing) and exits 0;
  - `mise run setup:ai` exits 0 and `.claude/settings.json` in the scratch repo
    lists `vwf` (network needed); run it a second time, exit 0, no change;
  - register `./.dev-marketplace` in a second fresh config dir, run the task:
    exit 0, no "network source differs" in the output, `+N` versions at project
    scope.
- `grep -c pnpx` on the file is 0; `grep -c '|| true'` is at most the one
  `autoremove` case if measured necessary.

## Guardrails

- Do not touch any other file in the pack (U2 owns the skill; U6 the version) or
  this repo's `.config/` (U4).
- Never run the task against the real `~/.claude`: always a throwaway
  `CLAUDE_CONFIG_DIR`. The 2026-09-05 run log records two containment leaks from
  exactly this task.
- Payload: cite nothing by plugin path; do not format with this repo's dprint;
  keep the exec bit and shebang.
- BSD `sed`; never write file content through a heredoc after a pipe.
- Do not name the installer CLI anywhere in the file.

## Commit

`feat: setup:ai reconciles the repo's plugins at project scope through claude's own commands`
— written by the orchestrator after the wave gate. Type `feat`; no scope.
