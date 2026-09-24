# swift-format — conventions

The **layout** gate for Swift. Topic 10 of the language bundle, the format half,
deliberately not a repo gate: a formatter meaningful for exactly one toolchain
belongs to that toolchain's bundle. The lint half is the `swiftlint` pack.

**The toolchain's own formatter.** swift-format ships inside the Swift toolchain
as `swift format`, so it needs no install and no pin of its own — the version
that formats is the toolchain the repo already pins.

**One configuration, under `.config/`.** swift-format discovers a
`.swift-format` file by walking up from each source file; this pack puts its
configuration at `.config/swift-format.json` instead, so every invocation names
it with `--configuration`. No `.swift-format` belongs in the tree: the gate would
ignore it while an editor picked it up, and the two would format differently.

**The formatter owns layout, and only the formatter.** Indentation, wrapping,
blank lines, trailing commas and brace placement are decided here; the SwiftLint
configuration disables every rule that would decide them a second way. A rule a
formatter can satisfy must never be able to fail a lint run.

**The house layout:** four-space indentation, a 120-column line, at most one
blank line, trailing commas on multi-line collections. The lint-style rules
swift-format also carries stay at upstream's defaults — SwiftLint is the
correctness gate, and two linters reporting one finding is noise.

**Formatting is a task, not an editor action.** The task library's
`code:format` checks, and with `--fix` rewrites, through this configuration.

## What this pack writes

Two files. `.config/swift-format.json` is the configuration — every key spelled
out, so a toolchain upgrade that changes a default does not change the layout
unannounced.

The editor fragment is `.config/vscode.d/swift-format.jsonc`: it recommends the
Swift extension, hides `.build/` and `.swiftpm/` from the explorer, the watcher
and search, nests `Package.resolved` under `Package.swift`, and turns format on
save **off** for Swift — the extension formats through sourcekit-lsp, which
cannot be pointed at `.config/swift-format.json` and would apply upstream's
defaults instead. The fragment lands only where init's editor answer is vscode
— `pack.yaml`'s `conditional:` names it.

Full judgment: the `swift-format` skill.
