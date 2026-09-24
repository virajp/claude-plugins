# analysis_options — conventions

The analyzer is the app's correctness gate, and it is language-specific — so it
belongs to the app bundle rather than to the repo gates, the same seam that puts
ESLint in the TypeScript bundle.

**Lint rules are enabled from a shared ruleset and narrowed deliberately.** A
rule disabled repo-wide because one file could not satisfy it is a rule the app
no longer has.

**Analyzer errors fail the build**, wired as one task the pipeline runs too.

## What this pack writes

One file: `.config/vscode.d/analysis-options.jsonc`, the editor fragment. It
recommends the two Dart extensions, binds `[dart]` to the SDK's own formatter —
Dart is the language dprint does not format, and the analyzer assumes that
formatter's output — hides `.dart_tool/` from the explorer, the watcher and
search, and nests `pubspec.lock` and `analysis_options.yaml` under
`pubspec.yaml`. The `analysis_options.yaml` file itself is the app's, written
where the app is.

The fragment lands only where init's editor answer is vscode — `pack.yaml`'s
`conditional:` names it.

Full judgment: the `analysis-options` skill.
