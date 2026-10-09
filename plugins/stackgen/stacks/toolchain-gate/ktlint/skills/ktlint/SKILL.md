---
name: ktlint
version: 0.1.0
category: development
description: The Kotlin layout gate — ktlint through mise, against
  .config/ktlint.editorconfig. Covers how to run it, the house layout, what a
  configuration change costs, why Kotlin layout stays out of a root
  .editorconfig, and suppressions. Auto-applies when editing
  .config/ktlint.editorconfig or an .editorconfig file.
license: MIT
user-invocable: false
allowed-tools: Read Grep Glob Edit Write Bash
paths:
  - "**/.config/ktlint.editorconfig"
  - "**/.editorconfig"
---

# ktlint

ktlint decides Kotlin layout, and nothing else does. It is installed through
mise (`ktlint`, pinned at an exact version in
`.config/mise/conf.d/ktlint/mise.toml`) and configured at
`.config/ktlint.editorconfig`, which every invocation names. Moving the pin is
its own change, with the whole-tree format run in the same commit — a new
release adds rules.

## Running it

Through the task library, so the gate and a developer run the same command:

```bash
mise run code:format:ktlint        # check — non-zero on any unformatted file
mise run code:format:ktlint --fix  # rewrite in place
mise run code:lint:ktlint          # the check, as the lint gate runs it
```

The repo's `code:format:all` and `code:lint:all` run these beside every other
subtask. Underneath, each hands ktlint the `.kt` and `.kts` files git lists —
tracked, plus untracked ones not ignored — by name, skipping `build/`,
`.gradle/`, `.kotlin/` and any `generated/` tree:

```bash
ktlint --relative --editorconfig=.config/ktlint.editorconfig --format <files>
ktlint --relative --editorconfig=.config/ktlint.editorconfig <files>
```

`--format` fixes what it can and exits non-zero on what it cannot. Without
`--editorconfig` ktlint falls back to its built-in defaults for every property
no `.editorconfig` on the path sets — so a bare `ktlint` is never the gate's
answer.

## The house layout

- **`ktlint_official`**, ktlint's own code style.
- **Four-space indentation** and a **120-column line**. ktlint does not break a
  long string literal; split it by hand.
- **A final newline** on every file.
- **Trailing commas** at declaration and call sites — adding an argument then
  touches one line.

## Changing the configuration

- **Every layout decision lives in `.config/ktlint.editorconfig`.** It is the
  defaults file: a property an `.editorconfig` on a source file's path sets
  wins over it. Never set a Kotlin property (`[*.{kt,kts}]`) in a root or
  module `.editorconfig` — the gate and an editor would then format by that
  file, and the house layout would no longer be in one place.
- **A rule is turned off by property**, with a comment saying why:
  `ktlint_standard_<rule-id> = disabled`. Check the rule id against ktlint's
  rule list before writing it; an unknown property is ignored silently.
- **A layout change is its own commit**: edit the file, run
  `mise run code:format:all --fix` over the whole tree, commit both together
  with nothing else in it — a reviewer can then skip it as mechanical.
- **Never add a detekt rule that decides layout.** If the two disagree, the
  detekt rule goes — the `detekt` skill carries the list.

## Suppressing

```kotlin
// The column alignment is the table; reformatting it loses the meaning.
@Suppress("ktlint:standard:argument-list-wrapping")
val matrix = listOf(
    1, 0, 0,
    0, 1, 0,
)
```

- **`@Suppress("ktlint:standard:<rule-id>")`** on the narrowest declaration
  that needs it, with the reason in a comment above it. `@file:Suppress` only
  for a generated file that cannot be excluded by path.
- A rule suppressed in many places is a configuration decision waiting to be
  made — make it in `.config/ktlint.editorconfig` instead.
