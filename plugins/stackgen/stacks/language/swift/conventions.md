# Swift — conventions

The Swift package baseline. Code is written in the **Swift 6 language mode**,
with strict concurrency checking on — data-race safety is a compile error, never
a warning to be silenced later.

**SwiftPM owns the manifest.** `Package.swift` declares the products, targets,
dependencies and supported platforms; `Package.resolved` is committed. No pack
lands `Package.swift` — `swift package init` creates it, and the repo owns it
from then on.

**The public API is the contract.** Everything is `internal` until a consumer
needs it; what is `public` is documented, versioned by semver, and changed only
through a deprecation.

**Errors are thrown and typed where the caller branches.** `precondition` and
`fatalError` are for programmer error only, never for input a caller can send.

**`async`/`await` and structured concurrency throughout.** Shared mutable state
lives in an actor or is `Sendable` by construction; nothing blocks a thread
waiting on async work.

**Tests are Swift Testing** (`@Test`, `#expect`), under `Tests/`, written
against the public API.

**Tool configs live under `.config/`.** swift-format reads
`.config/swift-format.json` and SwiftLint reads `.config/swiftlint.yml`; each
ships with its own pack, `toolchain-gate/swift-format` and
`toolchain-gate/swiftlint`, which both Swift bundles include, and each pack owns
the subtask that runs its tool:

| Task | Does |
| --- | --- |
| `code:format:swift-format` | `swift format` over the staged `.swift` files the hook passes, or with no list over every `.swift` file git does not ignore, less `.build/`, `.swiftpm/`, `Derived/`, `DerivedData/` and `*.generated.swift` at any depth — in place under `--fix`, a strict lint otherwise |
| `code:lint:swift-format` | `swift format lint --strict` over the same scope, under `--fix` too |
| `code:lint:swiftlint` | `swiftlint lint --strict` over every `.swift` file git does not ignore, less the same exclusions, whatever list the hook passes |
| `setup:deps:install:swift` | `swift package resolve`; `--frozen` refuses to move `Package.resolved` |
| `setup:deps:audit:swift` | a stated no-op — SwiftPM ships no advisory command |
| `setup:deps:cleanup:swift` | removes `.build/` |
| `setup:deps:outdated:swift` | `swift package update --dry-run` |
| `setup:deps:upgrade:swift` | `swift package update` |

This pack ships the five `setup/deps/<verb>/swift` subtasks alone. The repo's
`code:format:all` and `code:lint:all` call every subtask by name, so dprint,
shfmt, shellcheck, actionlint and the house linter — the universal subtasks —
run beside the Swift ones without a pack carrying them.

"Every file git does not ignore" holds inside a git repository — a `.git`
entry here or above, or `GIT_DIR` set — where a failed `git ls-files` stops the
task. With neither a `.git` entry nor `GIT_DIR`, or no git installed, the
tasks take the Swift scope from a `find` walk of the tree instead, less the
same exclusions, and `.gitignore` no longer applies.

**Why the tasks are built the way they are.** The task files carry one-line
warnings only; the reasoning is here.

- `code:format:all` and `code:lint:all` are what the `format` and `lint`
  pre-commit hooks call, and each passes its file list to every subtask: the
  hook passes the staged files, a person passes nothing and gets the whole
  tree.
- SwiftLint's rules read across files, so a staged subset would change its
  verdict rather than narrow it; it takes the whole tree even when a list is
  given. It does not read `.gitignore`, so the tree is handed over as git's
  list — tracked files plus untracked ones git does not ignore, read
  NUL-separated with quoting off so no name is mangled — and every path is
  prefixed `./`, so a name opening with `-` is never read as an option.
- The tree is a repository when a `.git` entry — a directory, or the file a
  worktree or submodule has — sits here or above, or `GIT_DIR` is set; git's
  own answer is not asked, so a repository git cannot read is still one.
  git's list goes to a file, not a process substitution, so its exit status is
  seen and a failed listing stops the task. Mid-merge a conflicted path is
  listed once per index stage, the stages together, so a path equal to the
  one before it is skipped.
- The Swift exclusion list is the tasks', held identically by all three, not
  `.config/swiftlint.yml`'s, which excludes `.build/` and `.swiftpm/` at the
  repo root only; `--force-exclude` still applies the config's `excluded` to a
  named path. swift-format would otherwise search for a `.swift-format` file
  beside the sources, hence the explicit `--configuration`.
- `--fix` never reaches SwiftLint: its autocorrect rewrites layout, which is
  swift-format's, and a lint gate that rewrites cannot run read-only.
  `--strict` turns a warning into a failure, since a warning nobody has to fix
  accumulates. `swift format format --in-place` exits 0 on a finding it cannot
  fix, so `code:lint:swift-format` runs the strict lint after it under `--fix`
  too; otherwise the hook would pass a file the read-only gate fails.
  SwiftLint's "No lintable files" — a repo before `swift package init`, or
  every file excluded — is an empty gate, reported and passed.
- The `setup:deps:*` subtasks print no header: `setup:deps:all` frames each
  verb with its own subheader. `audit` is a deliberate no-op, stated rather
  than left absent. `cleanup` removes `.build/` rather than calling
  `swift package clean`, which clears only artifacts and needs `swift` and a
  `Package.swift` that `setup:deps:all`, running cleanup before install,
  cannot promise. `install` checks for `swift` first, since mise does not
  install the toolchain; `--force-resolved-versions` is SwiftPM's frozen mode.
  `outdated` and `upgrade` move only within the ranges `Package.swift`
  declares — widening a range is a manifest edit, reviewed as that diff.

**A library reads no environment.** Configuration is a value the caller passes
in; logging and metrics go through the ecosystem's API packages, never a
backend.

Full judgment: the `swift` skill's references.
