---
name: swiftlint
version: 0.1.0
category: development
description: The Swift lint gate — SwiftLint through mise, strict, against
  .config/swiftlint.yml, with every layout rule left to swift-format. Covers
  how to run it, how excluded paths resolve, enabling and disabling rules, and
  inline disables. Auto-applies when editing .config/swiftlint.yml or a
  .swiftlint.yml file.
license: MIT
user-invocable: false
allowed-tools: Read Grep Glob Edit Write Bash
paths:
  - "**/.config/swiftlint.yml"
  - "**/.swiftlint.yml"
---

# SwiftLint

SwiftLint is the Swift correctness gate. It is installed through mise
(`aqua:realm/SwiftLint`, pinned in `.config/mise/conf.d/swiftlint.toml`),
configured at `.config/swiftlint.yml`, and run strict: a warning fails the
gate exactly as an error does. Moving the pin is its own change, with the
whole-tree lint run and its fixes in the same commit — a new release adds
rules, and strict mode fails on them.

## Running it

Through the task library, so the gate and a developer run the same command:

```bash
mise run code:lint
```

Directly:

```bash
swiftlint lint --strict --config .config/swiftlint.yml
```

`--config` is not optional. Without it SwiftLint looks for `.swiftlint.yml` in
the working directory and its parents, finds none, and lints with its defaults.

## Paths resolve against the configuration file

`included:` and `excluded:` are relative to **the file they are written in**,
not the working directory. From `.config/`, every entry climbs one level:

```yaml
excluded:
  - ../.build            # correct — the repository's .build/
  - .build               # wrong — names .config/.build, excludes nothing
  - ../**/*.generated.swift
```

A new excluded path that silently excludes nothing is the most common way this
configuration goes wrong; run the lint once after adding one and check the
excluded files are gone from the output.

## Layout belongs to swift-format

`trailing_comma`, `opening_brace` and `line_length` are disabled because
swift-format decides what they check — trailing commas on multi-line
collections, a wrapped declaration's brace on its own line, and wrapping. A
default rule that starts failing on freshly formatted code joins that list,
with a comment naming what swift-format does instead. Never enable
`indentation_width` or any other opt-in layout rule.

## Enabling and disabling rules

- **Opt-in rules are added to `opt_in_rules:`** one per line, each a
  correctness or clarity rule the team is willing to fail a build on.
- **A default rule is disabled in `disabled_rules:`** with a comment saying
  why — never by lowering it to a warning, which `--strict` turns straight
  back into an error.
- **A rule's parameters** (`identifier_name`, `type_body_length`, …) are set
  as a top-level key named for the rule. Loosen a threshold for the repo
  deliberately, never to pass one file.
- Check a rule's identifier and options before writing it:
  `swiftlint rules <identifier>`. An unknown identifier is reported as a
  warning and otherwise ignored.

## Inline disables

```swift
// The bundle is built with this resource; a missing one is a packaging bug.
// swiftlint:disable:next force_unwrapping
let schema = Bundle.module.url(forResource: "schema", withExtension: "json")!
```

- **`disable:next` or `disable:this`**, scoped to one line. A bare
  `swiftlint:disable` without a matching `enable` silences the rest of the
  file.
- **The reason goes on the line above, never after the rule.** SwiftLint reads
  every word after `disable:next` as a rule identifier, and under `--strict`
  each one fails as a superfluous disable. A disable with no reason is a
  finding in review.
- **A disable that no longer suppresses anything fails the gate**
  (`superfluous_disable_command`) — remove it when the code it covered is
  fixed.
- A rule disabled inline in many places is a configuration decision waiting to
  be made — make it in `.config/swiftlint.yml` instead.
