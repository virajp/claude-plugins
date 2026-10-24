# detekt — conventions

The **correctness** gate for Kotlin. Topic 10 of the language bundle, the lint
half, deliberately not a repo gate: a linter meaningful for exactly one
toolchain belongs to that toolchain's bundle. The layout half is the `ktlint`
pack.

**Installed by the toolchain bootstrap syncs** — the detekt CLI, which runs on
the JDK the repo already pins — so the version that lints is pinned beside the
rest of the toolchain. The gate runs the CLI over source alone, and needs no
Gradle plugin and no build.

**Built on detekt's defaults.** Every run passes `--build-upon-default-config`,
so `.config/detekt.yml` holds only what differs from detekt's default rule set,
and an upgrade that adds a default rule reaches the repo without an edit.

**Strict.** `warningsAsErrors` and `maxIssues: 0` make every finding fail the
gate. A rule worth keeping is worth failing on; a rule not worth failing on is
turned off in the configuration, where the decision is visible.

**Zero layout rules.** ktlint owns layout — a rule a formatter can satisfy must
never be able to fail a lint run. The configuration turns off the default rules
ktlint already decides: `MaxLineLength`, `NewLineAtEndOfFile`,
`WildcardImport`, `TrailingWhitespace` and `NoTabs`.

**Turned off by configuration, never by drift.** A rule turned off repo-wide
because one file could not satisfy it is a rule the repo no longer has; an
exception is a `@Suppress("<RuleId>")` on the narrowest declaration, with the
reason in a comment above it.

## What this pack writes

Nothing into the repo. The toolchain bootstrap syncs pins detekt at an exact
version — under strict settings a release that adds a rule is a failing build
nobody touched — ships the lint task `mise run code:lint` runs, and seeds
`.config/detekt.yml`. The task runs over every `.kt` and `.kts` file git
lists, never `build/`, `.gradle/`, `.kotlin/` or a `generated/` tree: detekt
does not read `.gitignore`, so it is handed git's list rather than
`--input .`. detekt's own discovery never looks under `.config/`, so every
invocation names the configuration with `--config`.

Full judgment: the `detekt` skill.
