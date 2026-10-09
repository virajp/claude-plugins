# ktlint — conventions

The **layout** gate for Kotlin. Topic 10 of the language bundle, the format
half, deliberately not a repo gate: a formatter meaningful for exactly one
toolchain belongs to that toolchain's bundle. The correctness half is the
`detekt` pack.

**Installed through mise**, from the mise registry, so the version that formats
is pinned beside the rest of the toolchain rather than whatever a machine
happens to carry.

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

**Formatting is a task, not an editor action.** This pack's
`code:format:ktlint` subtask checks, and with `--fix` rewrites, every `.kt` and
`.kts` file git lists; `code:lint:ktlint` runs the check. The repo's
`code:format:all` and `code:lint:all` run them. Both skip `build/`, `.gradle/`,
`.kotlin/` and any `generated/` tree, and skip themselves with a warning when
ktlint or its configuration is absent.

## What this pack writes

Three files and one template. `templates/.config/mise/conf.d/ktlint/mise.toml`
pins the tool; CI loads that file, so the render writes an exact version, never
`latest` — only tool-config's `upgrade` moves it. The two subtasks are
`.config/mise/tasks/code/format/ktlint` and
`.config/mise/tasks/code/lint/ktlint`, and `.config/ktlint.editorconfig` is the
configuration.

Full judgment: the `ktlint` skill.
