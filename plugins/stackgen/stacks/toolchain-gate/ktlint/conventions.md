# ktlint — conventions

The **layout** gate for Kotlin. Topic 10 of the language bundle, the format
half, deliberately not a repo gate: a formatter meaningful for exactly one
toolchain belongs to that toolchain's bundle. The correctness half is the
`detekt` pack.

**Installed by the toolchain bootstrap syncs**, so the version that formats is
pinned beside the rest of the toolchain rather than whatever a machine happens
to carry.

**One set of defaults, under `.config/`.** ktlint reads its settings from
`.editorconfig` files on each source file's path. This pack keeps them in
`.config/ktlint.editorconfig` instead, and every invocation names it with
`--editorconfig`, which ktlint reads as the defaults beneath any `.editorconfig`
it finds. A repo-root `.editorconfig` setting a Kotlin property would override
the gate's layout for an editor and the gate alike — keep Kotlin layout in this
file alone.

**The house layout:** the `ktlint_official` code style, four-space indentation,
a 120-column line, a final newline, and trailing commas at declaration and call
sites.

**The formatter owns layout, and only the formatter.** detekt's configuration
turns off every rule that would decide layout a second way. A rule a formatter
can satisfy must never be able to fail a lint run.

**Formatting is a task, not an editor action.** `mise run code:format` formats
every `.kt` and `.kts` file git lists, and `mise run code:lint` runs the check.
Neither touches `build/`, `.gradle/`, `.kotlin/` or a `generated/` tree.

## What this pack writes

Nothing into the repo. The toolchain bootstrap syncs pins ktlint at an exact
version, ships the format and lint tasks that run it, and seeds
`.config/ktlint.editorconfig`. This pack carries the doctrine: the house
layout, and how the configuration changes.

Full judgment: the `ktlint` skill.
