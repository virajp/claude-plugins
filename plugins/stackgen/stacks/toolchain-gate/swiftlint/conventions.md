# SwiftLint — conventions

The **correctness** gate for Swift. Topic 10 of the language bundle, the lint
half, deliberately not a repo gate: a linter meaningful for exactly one
toolchain belongs to that toolchain's bundle. The format half is the
`swift-format` pack.

**Installed through mise**, as bootstrap pins it, so the version that lints
is pinned beside the rest of the toolchain rather than whatever a machine
happens to carry.

**Strict.** The gate runs `swiftlint lint --strict`, which makes every warning
an error. A rule worth keeping is worth failing on; a rule not worth failing on
is disabled in the configuration, where the decision is visible.

**Zero layout rules.** The formatter owns layout — a rule a formatter can
satisfy must never be able to fail a lint run. The configuration disables the
three default rules swift-format contradicts: `trailing_comma`,
`opening_brace` and `line_length`.

**Disabled by configuration, never by drift.** A rule turned off repo-wide
because one file could not satisfy it is a rule the repo no longer has; an
exception is a `// swiftlint:disable:next <rule>` above the line, with the
reason on its own comment line above that — SwiftLint reads any word after the
rule as another rule identifier.

## What this pack writes

Nothing into the repo. The pin, the task and the configuration are
bootstrap's; `mise run code:lint` runs the gate, and the configuration is a
seed, which the repo owns once it lands. Under `--strict` a release that
adds a rule fails a build nobody touched, so moving the pin is its own
change. `.config/swiftlint.yml` is the configuration. SwiftLint
resolves its `excluded:` paths **relative to the configuration file**, so every
entry climbs one level to the repository root — a bare `.build` would name
`.config/.build` and exclude nothing. It excludes SwiftPM's `.build/` and
`.swiftpm/`, any `Derived` or `DerivedData` tree, and `*.generated.swift`.
SwiftLint's own discovery never looks under `.config/`, so every invocation
names the file with `--config`.

Full judgment: the `swiftlint` skill.
