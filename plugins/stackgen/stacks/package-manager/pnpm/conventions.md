# pnpm — conventions

pnpm is the only package manager. A repo with two lockfiles has two dependency
graphs and resolves differently depending on who ran what.

**The lockfile is committed and authoritative.** CI installs frozen and fails on
drift rather than resolving something new — an install that can resolve
differently in CI than locally is not a gate. `pnpm-lock.yaml` is never edited
by hand, with an editor tool, `sed` or a script: it changes only as the output
of `pnpm install`, `pnpm add`, `pnpm remove` or `pnpm update`, and a merge
conflict in it is resolved by taking either side and running `pnpm install`,
never by merging its lines.

**A publish cooldown guards the supply chain**, so neither a routine install nor
an automated update adopts a release published minutes ago.

**In a workspace, internal dependencies are linked, not versioned**, and shared
versions live in a catalog so one bump moves every package.

**Two settings belong in `.npmrc` at the repo root**, which is the one path
the manager reads them from: `ignore-scripts=true`, so an install never
executes a dependency's install-time code, and `fund=false`, so it never
prints a banner over what it did. This pack does not ship the file; the repo
sets them itself. A dependency that genuinely has to build is allowed by name
in `pnpm-workspace.yaml` (`allowBuilds`, or `onlyBuiltDependencies` before
pnpm 10.26) — the exception is a reviewable line, not a switch.

**An agent's `npm`/`npx` command is rewritten before it runs.** This pack
ships `hooks/npm-normalize.sh`, which lands at `.claude/hooks/npm-normalize.sh`
and — once its `hooks.yaml` entry is accepted into `.claude/settings.json` —
resolves the repo's manager from its lockfile and rewrites the command to it.
Declining the settings entry leaves the script landed and inert, which is
safe: the hook only rewrites a command that was going to run the wrong manager
anyway. It allows exactly two managers, pnpm and bun (`npx` → `pnpm dlx` or
`bunx`, `npm ci` → `<pm> install --frozen-lockfile`, any other `npm` → `<pm>`,
flags after `npx` kept verbatim), and resolves which one by walking up from the
working directory: a lockfile first — `bun.lock`/`bun.lockb` or
`pnpm-lock.yaml`, the ground truth, since bun reuses npm's `workspaces` field
and nothing else tells them apart — then `package_manager: bun` in
`.config/vwf.yaml`, for a project scaffolded but not yet installed, then pnpm,
because the hook fires in every repo, including ones that never heard of vwf.
Its `sed` stays BSD-compatible: no `\s`, no `\b`.

## The tasks are bootstrap's

This pack ships no task. The repo's toolchain — the manager's pin, its
install and upgrade tasks, the formatter, the house linter and the
pre-commit hooks — comes from bootstrap. `mise run setup` installs from the
lockfile and never moves it; `mise run setup --upgrade` moves the lockfile
forward, so a new resolution is always something someone asked for, and the
diff is the review surface. `mise run code:format` and `mise run code:lint`
run the gates.

**A dependency audit is advisory, never a gate.** `pnpm audit` reads a
registry feed that moves without any lockfile change; the blocking
supply-chain check is `code:sec`, which runs pinned tools. `pnpm outdated`
fails whenever it finds anything — a healthy repo's normal state — so it is
never a gate either.

Full judgment: the `pnpm` skill's references.
