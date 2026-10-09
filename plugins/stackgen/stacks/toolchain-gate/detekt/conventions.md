# detekt — conventions

The **correctness** gate for Kotlin. Topic 10 of the language bundle, the lint
half, deliberately not a repo gate: a linter meaningful for exactly one
toolchain belongs to that toolchain's bundle. The layout half is the `ktlint`
pack.

**Installed through mise**, as `github:detekt/detekt` — the release's
`detekt-cli-<version>.zip`, whose `bin/detekt-cli` runs on the JDK the repo
already pins — so the version that lints is pinned beside the rest of the
toolchain. The gate runs the CLI over source alone, and needs no Gradle plugin
and no build.

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

Two files and one template. `templates/.config/mise/conf.d/detekt/mise.toml`
pins the tool; CI loads that file, so the render writes an exact version, never
`latest`, because under strict settings a release that adds a rule is a failing
build nobody touched — only tool-config's `upgrade` moves it.
`.config/mise/tasks/code/lint/detekt` is the subtask the repo's
`code:lint:all` runs, over every `.kt` and `.kts` file git lists — tracked or
untracked, never ignored — skipping `build/`, `.gradle/`, `.kotlin/` and any
`generated/` tree, and skipping itself with a warning when detekt or its
configuration is absent. detekt does not read `.gitignore`, so the task hands
it git's list rather than `--input .`. `.config/detekt.yml` is the
configuration; detekt's own discovery never looks under `.config/`, so every
invocation names it with `--config`.

Full judgment: the `detekt` skill.
