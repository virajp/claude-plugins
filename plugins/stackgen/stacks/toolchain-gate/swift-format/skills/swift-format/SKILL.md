---
name: swift-format
version: 0.1.0
category: development
description: The Swift layout gate — swift-format, run as `swift format` from
  the toolchain against .config/swift-format.json. Covers how to run it, the
  house layout, what a configuration change costs, and why no .swift-format
  file belongs in the tree. Auto-applies when editing
  .config/swift-format.json or a .swift-format file.
license: MIT
user-invocable: false
allowed-tools: Read Grep Glob Edit Write Bash
paths:
  - "**/.config/swift-format.json"
  - "**/.swift-format"
---

# swift-format

swift-format decides Swift layout, and nothing else does. It ships inside the
Swift toolchain as `swift format`; the configuration is
`.config/swift-format.json`, and every invocation names it.

## Running it

Through the task library, so the gate and a developer run the same command:

```bash
mise run code:format          # check — exits non-zero on any unformatted file
mise run code:format --fix    # rewrite in place
```

Underneath, the task hands `swift format` the Swift files git lists — tracked,
plus untracked ones not ignored — by name, never by walking a directory list.
`--fix` formats them in place, then lints the same files; the check lints only:

```bash
swift format format --in-place \
  --configuration .config/swift-format.json \
  --parallel \
  <files>
swift format lint --strict \
  --configuration .config/swift-format.json \
  --parallel \
  <files>
```

`format --in-place` exits 0 even on a finding it cannot fix, which is why the
strict lint follows it under `--fix`. `lint --strict` turns every finding into
an error, which is what makes it a gate. Without `--configuration` the tool
searches upward for a `.swift-format` file, finds none, and formats with
upstream's defaults — so a bare `swift format` is never the gate's answer.

## The house layout

- **Four-space indentation**, `tabWidth` four — the width Xcode and most Swift
  code already use.
- **A 120-column line.** A string literal longer than that is left alone; the
  formatter does not break literals, which is why SwiftLint's `line_length`
  rule is off.
- **At most one blank line** in a row.
- **Trailing commas on multi-line collections** — adding an element then
  touches one line.
- **Existing line breaks are respected** — the formatter wraps what is too
  long and leaves a deliberate break where the author put it.

## Changing the configuration

- **Every key is spelled out**, defaults included. A toolchain upgrade that
  changes a default must not change the layout unannounced.
- **A layout change is its own commit**: edit the file, run
  `mise run code:format --fix` over the whole tree, commit both together with
  nothing else in it — a reviewer can then skip it as mechanical.
- **Lint-style rules stay at upstream's defaults** (`rules:`). SwiftLint is the
  correctness gate; turning on a swift-format rule that SwiftLint also has
  reports one finding twice.
- **Never add a SwiftLint rule that decides layout.** If a lint rule and the
  formatter disagree, the lint rule goes — the `swiftlint` skill carries the
  list.

## No `.swift-format` in the tree

The editor extension formats through sourcekit-lsp, which finds a
`.swift-format` by walking up from the file and cannot be pointed at
`.config/`. Adding one to make the editor agree creates a second
configuration the gate never reads. Format on save is off for Swift instead;
run the task.

## Suppressing

`// swift-format-ignore` above a declaration, or `// swift-format-ignore-file`
at the top of a file, only for code whose layout carries meaning — an aligned
table of constants, a generated file. Say why in a comment above it.
