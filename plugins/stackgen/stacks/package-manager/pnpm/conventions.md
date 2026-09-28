# pnpm — conventions

pnpm is the only package manager. A repo with two lockfiles has two dependency
graphs and resolves differently depending on who ran what.

**The lockfile is committed and authoritative.** CI installs frozen and fails on
drift rather than resolving something new — an install that can resolve
differently in CI than locally is not a gate.

**A publish cooldown guards the supply chain**, so neither a routine install nor
an automated update adopts a release published minutes ago.

**In a workspace, internal dependencies are linked, not versioned**, and shared
versions live in a catalog so one bump moves every package.

**Two settings ship as `.npmrc` at the repo root**, which is the one path the
manager reads them from: `ignore-scripts=true`, so an install never executes a
dependency's install-time code, and `fund=false`, so it never prints a banner
over what it did. A dependency that genuinely has to build is allowed by name
in `pnpm-workspace.yaml` (`allowBuilds`, or `onlyBuiltDependencies` before
pnpm 10.26) — the exception is a reviewable line, not a switch.
Beside it, the pack's `tool-config:` call in `pack.yaml` asks
`/stackgen:tool-config` to alias `npx` to `pnpm dlx` in dev, so a one-off
package runs through this manager's store, resolver and registry settings
rather than another tool's.

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

**The editor fragment, `.config/vscode.d/pnpm.jsonc`,** hides the lockfile
and the Turbo cache (`.turbo/`, in all three exclude maps — Turbo is a
generated component with no pack of its own, carried by the pnpm-turbo bundle,
so its exclude lives beside the manager it runs through) and nests everything
that travels with `package.json` under it: the lockfile, the workspace file,
`.npmrc`, the test, build and orchestrator configs, the hosting and secrets
manifests. `node_modules/` is the tsconfig fragment's. The fragment lands only
where init's editor answer is vscode — `pack.yaml`'s `conditional:` names it.

## The task library this pack owns

This pack ships a `config/.config/mise/tasks/` tree — `code/format`,
`code/lint`, and `setup/deps/{install,outdated,audit,upgrade,cleanup}` — landing
at the repo's own `.config/mise/tasks/` behind the materializer's config consent
line.

**It owns `code/format` and `code/lint` whole, not a fragment of each.**
`code:format` runs **dprint first**, then sort-package-json: one task file
co-authored by the repo formatter and the package manager. The sorter is a
mise pin in the dev environment only — the pack's `tool-config:` asks for it —
resolved by its mise path, and the step is skipped where it is not installed,
as shfmt's is. The seam is ownership-plus-contract — this component writes the
file, and the contract it honours is that the repo formatter goes first. It is
written whole rather than assembled from contributed fragments because
stackgen's dispatch is copy-verbatim or generate, with nothing in between; a
fragment layer would be a templating mechanism this plugin deliberately does
not have.

**Both tasks take an optional file list, and the empty case is the whole
tree.** That is the whole pre-commit story for this pack: it ships **no
fragment**, because the gate config's `format` and `lint` hooks call the two
tasks with the staged files. dprint and the sorter narrow to what they are
given; the house linter does not — its rules are cross-file, so it runs the
whole tree either way, and every exclusion it needs lives in
`.config/linter.yaml`, which `stackgen:tool-config` lands.

**Composition order, since more than one component writes this tree:**
the mise base `stackgen:tool-config` writes, then `package-manager` /
`language`, then `toolchain-gate`, then `app-framework` — a later component's
file wins, recorded per file in the lockfile. So this pack's `code/format`
replaces the mise base's, and a `toolchain-gate` or `app-framework`
component's would replace this one's.

**The `setup/deps/*` verbs are `install`, `outdated`, `audit`, `upgrade` and
`cleanup` — all five slots.** `install` is `pnpm install --recursive`, because a
workspace install that stops at the root leaves the repo half resolved.
`cleanup` deletes `dist`, `node_modules` and `*.tsbuildinfo`, then prunes the
store — a store left behind makes the next install look clean when it is
replaying — and deliberately leaves the lockfile alone: the lockfile is an input
a human reviews, and moving it forward is `upgrade`'s job. The optional verbs
are **probed by name**, so a missing file is itself the answer: a manager that
ships no `upgrade` has no such verb, not a choice still pending.

`install --frozen` is the contract's name for "the lockfile is the input, not
the output" — what a fresh worktree and CI want, turning a stale lockfile into
a failure rather than a silent rewrite. `audit` is advisory and never a gate:
`pnpm audit` reads a registry feed that moves without any lockfile change, and
the blocking supply-chain check is `code:sec`, which runs pinned tools.
`outdated` swallows its exit status, since `pnpm outdated` fails whenever it
finds anything — a healthy repo's normal state. `upgrade` updates pnpm itself
first, because a resolver a major version behind writes a lockfile the current
one then rewrites, and passes `--latest` on purpose: the ranges say what still
works, and this task is where a person decides something newer should — the
diff is the review surface. `cleanup` prunes the store's `.pnpm` link farm
rather than deleting it, which would re-download every unchanged package. The
verbs print no header of their own; `setup:deps:all` frames each.

`code:format`'s sorter pair is the inverse of dprint's — sorting is its
default, `--check` its read-only mode — and the sorter, like the house linter,
runs by its mise path so a package in `node_modules/.bin` cannot shadow the
pin.

Full judgment: the `pnpm` skill's references.
