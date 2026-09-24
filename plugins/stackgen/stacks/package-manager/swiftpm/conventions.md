# SwiftPM — conventions

SwiftPM is the only package manager, and it ships inside the Swift toolchain:
there is nothing to install beside `swift`, and nothing to pin but the
toolchain.

Everything here governs a `Package.swift` the repo owns and the
`Package.resolved` beside it; the `Package.resolved` Xcode keeps inside an
`.xcodeproj` is the app's, resolved and updated through
`mise run setup:deps:*`, never `swift package resolve` or `update`.

**`Package.swift` is the manifest, and it is code.** It declares the tools
version on its first line, the products, the targets and the dependencies.
Keep it declarative — no environment reads, no conditional dependency lists —
so every machine resolves the same graph. No pack writes it: `swift package
init` creates it, and the package owns it from then on.

**`Package.resolved` is the lockfile, and it is committed.** It pins every
dependency to an exact version and revision. SwiftPM ignores a dependency's own
`Package.resolved`, so committing it in a library costs its consumers nothing
and gives the library's own CI the same graph a developer tested.

**Requirements are ranges; the lockfile is the pin.** A dependency is declared
with `from:` — up to the next major — and never with `branch:` or `revision:`
outside a short-lived fork. `exact:` is for a dependency that breaks on minor
releases, and says why in a comment.

**CI resolves from the lockfile and never moves it.** Resolving with
`--force-resolved-versions` takes exactly the pinned versions, so a stale
`Package.resolved` fails the build rather than being rewritten on the runner.
Moving a pin is `swift package update`, run on purpose and committed.

**`.build/` is the one build tree**, and `.swiftpm/` holds SwiftPM's per-user
state; both are regenerable and ignored. Nothing is checked in from either.

## What this pack writes

Nothing into the repo. The dependency tasks — install, update, outdated,
cleanup — call `swift package`, and they belong to the language pack, which
owns the toolchain they run.

Full judgment: the `swiftpm` skill.
